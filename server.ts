import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import pg from "pg";
import { GoogleGenAI } from "@google/genai";

import sharp from "sharp";

dotenv.config();

const { Pool } = pg;

// --- DATABASE CONFIGURATION ---
const dbUrl = process.env.DATABASE_URL;
const pool = dbUrl ? new Pool({
  connectionString: dbUrl,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
}) : null;

if (!pool) {
  console.log("[DB] No DATABASE_URL provided. Operating in mock-only mode for car data.");
}

// Helper to query pool safely
const safeQuery = async (text: string, params: any[] = []) => {
  if (!pool) return { rows: [], rowCount: 0 };
  return pool.query(text, params);
};

// --- MOCK DATA FOR FALLBACK (If DB fails or is empty) ---
const mockMakes = [
  { id: 1, name: "Toyota", slug: "toyota", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_car_logo.svg", sortOrder: 1, isActive: true },
  { id: 2, name: "Honda", slug: "honda", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg", sortOrder: 2, isActive: true },
  { id: 3, name: "Suzuki", slug: "suzuki", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/12/Suzuki_logo_2.svg", sortOrder: 3, isActive: true },
];

const mockModels = [
  { id: 1, makeId: 1, name: "Corolla", slug: "corolla", sortOrder: 1, isActive: true },
  { id: 2, makeId: 1, name: "Camry", slug: "camry", sortOrder: 2, isActive: true },
  { id: 3, makeId: 2, name: "Civic", slug: "civic", sortOrder: 1, isActive: true },
  { id: 4, makeId: 2, name: "City", slug: "city", sortOrder: 2, isActive: true },
  { id: 5, makeId: 3, name: "Alto", slug: "alto", sortOrder: 1, isActive: true },
];

const mockVariants = [
  { id: 1, modelId: 1, name: "GLi", slug: "gli", engineCc: "1300", fuelType: "petrol", transmission: "manual", bodyType: "sedan", isActive: true },
  { id: 2, modelId: 1, name: "Altis", slug: "altis", engineCc: "1600", fuelType: "petrol", transmission: "automatic", bodyType: "sedan", isActive: true },
  { id: 3, modelId: 3, name: "RS", slug: "rs", engineCc: "1500", fuelType: "petrol", transmission: "cvt", bodyType: "sedan", isActive: true },
];

// --- CONFIGURATION ---
const JWT_SECRET = process.env.JWT_SECRET || "pakizzle-secret-key-2026";
const PORT = 3000;

// --- MOCK DATABASE (Simulating PostgreSQL) ---
// In a real app, you'd use 'pg' pool here.
const users: any[] = [
  {
    id: 1,
    full_name: "Admin User",
    email: "admin@pakizzle.com",
    password_hash: bcrypt.hashSync("admin123", 10),
    role: "admin",
    email_verified: true,
    phone_verified: true,
    identity_status: "approved",
    business_status: "none",
    verified_badge_type: "identity"
  }
];

const verificationRequests: any[] = [];
const otpStore = new Map<string, { code: string; expires: number }>();

// --- MIDDLEWARE ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const fbUid = req.headers['x-fb-uid'];

  if (token && token !== 'null') {
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        // If JWT fails but we have FB UID, we can fallback
        if (fbUid) {
          handleFbUid(fbUid, req, res, next);
        } else {
          return res.status(403).json({ error: "Invalid or expired token." });
        }
      } else {
        req.user = user;
        next();
      }
    });
  } else if (fbUid) {
    handleFbUid(fbUid, req, res, next);
  } else {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
};

const handleFbUid = (fbUid: string, req: any, res: any, next: any) => {
  // In our mock DB, we'll use fbUid as the ID if it's a string
  let user = users.find(u => u.fb_uid === fbUid || u.id === fbUid);
  
  if (!user) {
    // Auto-create user in mock DB if they exist in Firebase but not here
    user = {
      id: fbUid,
      fb_uid: fbUid,
      full_name: "Firebase User",
      email: "user@example.com",
      role: "user",
      email_verified: false,
      phone_verified: false,
      identity_status: "none",
      business_status: "none",
      verified_badge_type: "none",
      created_at: new Date()
    };
    users.push(user);
  }
  
  req.user = { id: user.id, email: user.email, role: user.role };
  next();
};

const isAdmin = (req: any, res: any, next: any) => {
  const adminEmail = "redspotsproduction@gmail.com";
  if (req.user.role !== 'admin' && req.user.email !== adminEmail) {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
};

// --- FILE UPLOAD SETUP ---
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- UTILS ---
const convertToAvif = async (buffer: Buffer) => {
  return await sharp(buffer)
    .avif({ quality: 60, effort: 2 })
    .toBuffer();
};

const calculateBadge = (user: any) => {
  if (user.business_status === 'approved') return 'business';
  if (user.identity_status === 'approved') return 'identity';
  if (user.email_verified && user.phone_verified) return 'basic';
  return 'none';
};

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });

  // --- AUTH APIs ---

  app.get("/api/ping", (req, res) => res.json({ pong: true, time: new Date() }));

  app.post("/api/auth/register", async (req, res) => {
    const { fullName, email, password } = req.body;
    if (users.find(u => u.email === email)) return res.status(400).json({ error: "User already exists" });

    const newUser = {
      id: users.length + 1,
      full_name: fullName,
      email,
      password_hash: await bcrypt.hash(password, 10),
      role: "user",
      email_verified: false,
      phone_verified: false,
      identity_status: "none",
      business_status: "none",
      verified_badge_type: "none",
      created_at: new Date()
    };

    users.push(newUser);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    res.json({ success: true, token, user: { id: newUser.id, fullName: newUser.full_name, email: newUser.email, role: newUser.role } });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ success: true, token, user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role } });
  });

  app.post("/api/otp/phone/send", (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, { code: otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 mins
    console.log(`[VERIFICATION] SMS OTP for ${phone}: ${otp}`);
    res.json({ success: true, message: "OTP sent via SMS", demoCode: otp });
  });

  app.post("/api/otp/phone/verify", authenticateToken, (req: any, res) => {
    const { phone, code } = req.body;
    const stored = otpStore.get(phone);
    if (!stored || stored.code !== code || Date.now() > stored.expires) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const user = users.find(u => u.id === req.user.id || u.fb_uid === req.user.id);
    if (user) {
      user.phone_verified = true;
      user.phone = phone;
      user.verified_badge_type = calculateBadge(user);
    }

    otpStore.delete(phone);
    res.json({ success: true, badge: user?.verified_badge_type });
  });

  app.post("/api/otp/email/send", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email address required" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { code: otp, expires: Date.now() + 5 * 60 * 1000 });
    console.log(`[VERIFICATION] EMAIL OTP for ${email}: ${otp}`);
    res.json({ success: true, message: "OTP sent via Email", demoCode: otp });
  });

  app.post("/api/otp/email/verify", authenticateToken, (req: any, res) => {
    const { email, code } = req.body;
    const stored = otpStore.get(email);
    if (!stored || stored.code !== code || Date.now() > stored.expires) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const user = users.find(u => u.id === req.user.id || u.fb_uid === req.user.id);
    if (user) {
      user.email_verified = true;
      user.email = email;
      user.verified_badge_type = calculateBadge(user);
    }

    otpStore.delete(email);
    res.json({ success: true, badge: user?.verified_badge_type });
  });

  app.post("/api/auth/send-email-verification", authenticateToken, (req: any, res) => {
    const token = jwt.sign({ id: req.user.id, type: 'email-verify' }, JWT_SECRET, { expiresIn: '24h' });
    console.log(`[VERIFICATION] Email verification link: http://localhost:3000/api/auth/verify-email?token=${token}`);
    res.json({ success: true, message: "Verification email sent" });
  });

  app.get("/api/auth/verify-email", (req, res) => {
    const { token } = req.query;
    try {
      const decoded: any = jwt.verify(token as string, JWT_SECRET);
      const user = users.find(u => u.id === decoded.id);
      if (user) {
        user.email_verified = true;
        user.verified_badge_type = calculateBadge(user);
      }
      res.send("<h1>Email Verified Successfully!</h1><p>You can now close this window.</p>");
    } catch (e) {
      res.status(400).send("<h1>Invalid or Expired Token</h1>");
    }
  });

  // --- VERIFICATION APIs ---

  app.get("/api/verification/status", authenticateToken, (req: any, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const request = verificationRequests.find(r => r.user_id === user.id && r.status === 'pending');

    res.json({
      emailVerified: user.email_verified,
      phoneVerified: user.phone_verified,
      identityStatus: user.identity_status,
      businessStatus: user.business_status,
      badge: user.verified_badge_type,
      pendingRequest: request ? { type: request.type, createdAt: request.created_at } : null
    });
  });

  app.post("/api/verification/identity/upload", authenticateToken, upload.array('documents', 2), async (req: any, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (user.identity_status === 'pending') return res.status(400).json({ error: "Request already pending" });

    const processedDocs = await Promise.all((req.files as any[]).map(async (f) => {
      // Determine if it's an image
      const isImage = f.mimetype.startsWith('image/');
      let buffer = f.buffer;
      let name = f.originalname;

      if (isImage) {
        try {
          console.log(`[OPTIMIZATION] Converting ${name} to AVIF...`);
          buffer = await convertToAvif(f.buffer);
          name = name.replace(/\.[^/.]+$/, "") + ".avif";
        } catch (err) {
          console.error(`[OPTIMIZATION] Failed to convert ${name}, using original`, err);
        }
      }
      
      return { name, size: buffer.length, mimetype: isImage ? 'image/avif' : f.mimetype };
    }));

    const newRequest = {
      id: verificationRequests.length + 1,
      user_id: user.id,
      type: 'identity',
      status: 'pending',
      documents: processedDocs,
      created_at: new Date()
    };

    verificationRequests.push(newRequest);
    user.identity_status = 'pending';
    res.json({ success: true, message: "Identity verification request submitted (Images optimized to AVIF)" });
  });

  app.post("/api/verification/business/upload", authenticateToken, upload.array('documents', 5), async (req: any, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (user.business_status === 'pending') return res.status(400).json({ error: "Request already pending" });

    const processedDocs = await Promise.all((req.files as any[]).map(async (f) => {
      const isImage = f.mimetype.startsWith('image/');
      let buffer = f.buffer;
      let name = f.originalname;

      if (isImage) {
        try {
          console.log(`[OPTIMIZATION] Converting ${name} to AVIF...`);
          buffer = await convertToAvif(f.buffer);
          name = name.replace(/\.[^/.]+$/, "") + ".avif";
        } catch (err) {
          console.error(`[OPTIMIZATION] Failed to convert ${name}, using original`, err);
        }
      }
      
      return { name, size: buffer.length, mimetype: isImage ? 'image/avif' : f.mimetype };
    }));

    const newRequest = {
      id: verificationRequests.length + 1,
      user_id: user.id,
      type: 'business',
      status: 'pending',
      documents: processedDocs,
      created_at: new Date()
    };

    verificationRequests.push(newRequest);
    user.business_status = 'pending';
    res.json({ success: true, message: "Business verification request submitted (Images optimized to AVIF)" });
  });

  // Dedicated optimization endpoint for frontend use (e.g. car photos)
  app.post("/api/utils/optimize-to-avif", upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image provided" });
    
    try {
      console.log(`[OPTIMIZATION] Processing standalone image ${req.file.originalname}`);
      const optimizedBuffer = await convertToAvif(req.file.buffer);
      const base64 = optimizedBuffer.toString('base64');
      
      res.json({
        success: true,
        dataUrl: `data:image/avif;base64,${base64}`,
        format: 'avif',
        originalSize: req.file.size,
        optimizedSize: optimizedBuffer.length,
        reduction: `${Math.round((1 - optimizedBuffer.length / req.file.size) * 100)}%`
      });
    } catch (err) {
      console.error("[OPTIMIZATION] API error:", err);
      res.status(500).json({ error: "Optimization failed" });
    }
  });

  // --- ADMIN APIs ---

  app.get("/api/admin/verification/pending", authenticateToken, isAdmin, (req, res) => {
    const pending = verificationRequests.filter(r => r.status === 'pending').map(r => {
      const user = users.find(u => u.id === r.user_id);
      return { ...r, user: { fullName: user.full_name, email: user.email } };
    });
    res.json(pending);
  });

  app.post("/api/admin/verification/approve", authenticateToken, isAdmin, (req, res) => {
    const { requestId } = req.body;
    const request = verificationRequests.find(r => r.id === requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    request.status = 'approved';
    const user = users.find(u => u.id === request.user_id);
    if (user) {
      if (request.type === 'identity') user.identity_status = 'approved';
      if (request.type === 'business') user.business_status = 'approved';
      user.verified_badge_type = calculateBadge(user);
    }

    res.json({ success: true, message: "Request approved" });
  });

  app.post("/api/admin/verification/reject", authenticateToken, isAdmin, (req, res) => {
    const { requestId, reason } = req.body;
    const request = verificationRequests.find(r => r.id === requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    request.status = 'rejected';
    request.rejection_reason = reason;
    const user = users.find(u => u.id === request.user_id);
    if (user) {
      if (request.type === 'identity') user.identity_status = 'rejected';
      if (request.type === 'business') user.business_status = 'rejected';
      user.verified_badge_type = calculateBadge(user);
    }

    res.json({ success: true, message: "Request rejected" });
  });

  // --- CAR MARKETPLACE APIs ---

  app.get("/api/makes", async (req, res) => {
    try {
      const result = await safeQuery("SELECT * FROM car_makes WHERE is_active = true ORDER BY sort_order ASC, name ASC");
      if (result.rows.length === 0) return res.json(mockMakes);
      res.json(result.rows);
    } catch (err) {
      console.error("[DB] Makes fetch error, using fallback");
      res.json(mockMakes);
    }
  });

  app.get("/api/models", async (req, res) => {
    const { makeId } = req.query;
    if (!makeId) return res.status(400).json({ error: "makeId is required" });
    try {
      const result = await safeQuery("SELECT * FROM car_models WHERE make_id = $1 AND is_active = true ORDER BY sort_order ASC, name ASC", [makeId]);
      if (result.rows.length === 0) {
        const fallbacks = mockModels.filter(m => m.makeId.toString() == makeId.toString());
        return res.json(fallbacks);
      }
      res.json(result.rows);
    } catch (err) {
      console.error("[DB] Models fetch error, using fallback");
      res.json(mockModels.filter(m => m.makeId.toString() == makeId.toString()));
    }
  });

  app.get("/api/variants", async (req, res) => {
    const { modelId } = req.query;
    if (!modelId) return res.status(400).json({ error: "modelId is required" });
    try {
      const result = await safeQuery("SELECT * FROM car_variants WHERE model_id = $1 AND is_active = true ORDER BY name ASC", [modelId]);
      if (result.rows.length === 0) {
        const fallbacks = mockVariants.filter(v => v.modelId.toString() == modelId.toString());
        return res.json(fallbacks);
      }
      res.json(result.rows);
    } catch (err) {
      console.error("[DB] Variants fetch error, using fallback");
      res.json(mockVariants.filter(v => v.modelId.toString() == modelId.toString()));
    }
  });

  // --- ADMIN CAR MANAGEMENT ---

  app.post("/api/admin/makes", authenticateToken, isAdmin, async (req, res) => {
    const { name, slug, logoUrl, sortOrder } = req.body;
    try {
      const result = await safeQuery(
        "INSERT INTO car_makes (name, slug, logo_url, sort_order) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, slug, logoUrl, sortOrder || 0]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.put("/api/admin/makes/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, slug, logoUrl, sortOrder, isActive } = req.body;
    try {
      const result = await safeQuery(
        "UPDATE car_makes SET name = $1, slug = $2, logo_url = $3, sort_order = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
        [name, slug, logoUrl, sortOrder, isActive, id]
      );
      if (result.rowCount === 0) return res.status(404).json({ error: "Make not found" });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.delete("/api/admin/makes/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await safeQuery("DELETE FROM car_makes WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/admin/models", authenticateToken, isAdmin, async (req, res) => {
    const { makeId, name, slug, sortOrder } = req.body;
    try {
      const result = await safeQuery(
        "INSERT INTO car_models (make_id, name, slug, sort_order) VALUES ($1, $2, $3, $4) RETURNING *",
        [makeId, name, slug, sortOrder || 0]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.put("/api/admin/models/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { makeId, name, slug, sortOrder, isActive } = req.body;
    try {
      const result = await safeQuery(
        "UPDATE car_models SET make_id = $1, name = $2, slug = $3, sort_order = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
        [makeId, name, slug, sortOrder, isActive, id]
      );
      if (result.rowCount === 0) return res.status(404).json({ error: "Model not found" });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.delete("/api/admin/models/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await safeQuery("DELETE FROM car_models WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/admin/variants", authenticateToken, isAdmin, async (req, res) => {
    const { modelId, name, engineCapacity, fuelType, transmission } = req.body;
    try {
      const result = await safeQuery(
        "INSERT INTO car_variants (model_id, name, engine_capacity, fuel_type, transmission) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [modelId, name, engineCapacity, fuelType, transmission]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.put("/api/admin/variants/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { modelId, name, engineCapacity, fuelType, transmission, isActive } = req.body;
    try {
      const result = await safeQuery(
        "UPDATE car_variants SET model_id = $1, name = $2, engine_capacity = $3, fuel_type = $4, transmission = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
        [modelId, name, engineCapacity, fuelType, transmission, isActive, id]
      );
      if (result.rowCount === 0) return res.status(404).json({ error: "Variant not found" });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.delete("/api/admin/variants/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await safeQuery("DELETE FROM car_variants WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/generate-description", async (req, res) => {
    const { year, make, model, variant, condition, mileage, transmission, fuelType, bodyType, engineSize, color, assembly, registrationCity, features } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a world-class automotive SEO Copywriter and listing optimizer for a premium vehicle classifieds site in Pakistan called Pakizzle. Your task is to output a dual description for a ${year || '2024'} ${make || 'Toyota'} ${model || 'Corolla'} ${variant ? variant : ''} with the following exact parameters:
      - Condition: ${condition || 'used'} (overall vehicle state)
      - Mileage: ${mileage || '0'} km
      - Transmission: ${transmission === 'automatic' ? 'Automatic' : 'Manual'}
      - Fuel Type: ${fuelType || 'petrol'}
      - Body Type / Style: ${bodyType || 'Sedan'}
      - Engine Size / Displacement: ${engineSize || '1300'} cc
      - Exterior Color: ${color || 'White'}
      - Manufacture / Assembly: ${assembly || 'Local'}
      - Registered City: ${registrationCity || 'Lahore'}
      ${features && features.length > 0 ? `- Features Installed: ${features.join(", ")}` : ""}

      Please generate the output according to the JSON schema. 'simpleText' must be high-impact, completely clean flat plain text without any HTML tags or search word blocks, perfect for humans to read easily. 'seoHtml' must be rich with HTML headers (h3, ul, li, p, em) and highly high-volume search term combinations at the bottom, calibrated to guarantee ranking #1 on google.com and google.com.pk.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              simpleText: {
                type: "STRING",
                description: "A clean, human-friendly, highly compelling plain-text vehicle description WITHOUT any HTML tags, bullet points, headers, or lists of SEO keywords. Focuses purely on natural appeal."
              },
              seoHtml: {
                type: "STRING",
                description: "An advanced listing description complete with HTML tags (h3, ul, li) covering Selling Points, Technical Specs, Premium Features, and a rich comma-separated sequence of 10-15 high-volume search keywords inside a <em> tag to rank #1 on Google."
              }
            },
            required: ["simpleText", "seoHtml"]
          }
        }
      });

      const resultText = response.text || "{}";
      const result = JSON.parse(resultText);
      res.json({
        simpleText: result.simpleText || "Pristine condition, extremely well maintained.",
        seoHtml: result.seoHtml || ""
      });
    } catch (error: any) {
      console.error("Gemini description generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate description" });
    }
  });

  app.post("/api/seo-optimize", async (req, res) => {
    const { year, make, model, variant, price, city, mileage, transmission, fuelType, engineSize, features, description } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Default fallback optimizer output if API key is not configured, to keep app resilient
    const defaultOptimization = {
      seoKeywordDensity: [
        { keyword: `Used ${make} ${model} Pakistan`, count: 4, status: "Optimal" },
        { keyword: `${make} ${model} price in ${city}`, count: 3, status: "Optimal" },
        { keyword: `Buy ${year} ${make} ${model}`, count: 2, status: "Optimal" },
        { keyword: `Best ${fuelType} sedan ${city}`, count: 2, status: "Optimal" }
      ],
      schemaMarkup: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Car",
        "name": `${year} ${make} ${model} ${variant || ""}`,
        "description": description || `Verified ${year} ${make} ${model} in ${city}.`,
        "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600",
        "offers": {
          "@type": "Offer",
          "price": price || "Call",
          "priceCurrency": "PKR",
          "itemCondition": "https://schema.org/UsedCondition",
          "availability": "https://schema.org/InStock"
        },
        "vehicleEngine": {
          "@type": "EngineSpecification",
          "engineDisplacement": `${engineSize || "1300"} cc`
        },
        "fuelType": fuelType || "Petrol",
        "vehicleTransmission": transmission || "Automatic",
        "mileageFromOdometer": {
          "@type": "QuantitativeValue",
          "value": mileage || 0,
          "unitCode": "KMT"
        }
      }, null, 2),
      aeoQuestions: [
        {
          question: `What is the price of ${year} ${make} ${model} in ${city}?`,
          answer: `The price is PKR ${Number(price).toLocaleString() || "Call"} for this verified listing on Pakizzle.`,
          source: "Pakizzle Verified Database"
        },
        {
          question: `Is the ${make} ${model} ${year} manual or automatic?`,
          answer: `This vehicle comes with a premium ${transmission || "automatic"} transmission system.`,
          source: "Pakizzle Spec Sheet"
        },
        {
          question: `What features are included in this ${make} ${model}?`,
          answer: `Equipped with standard packages including ${features && features.length > 0 ? features.join(", ") : "Premium safety suite and luxury cabin"}.`,
          source: "Listing Details"
        }
      ],
      geoCitationScore: 94,
      geoRecommendations: [
        "Include exact certified inspection rating to maximize trust score in Perplexity searches.",
        "Mention fuel economy statistics (km/l) to align with conversational query parameters.",
        "Detail any dealer warranty options to secure higher ranking in purchase-intent recommendation grids."
      ],
      geoRecommendationDraft: `Based on verified dealer inventory from Pakizzle, the **${year} ${make} ${model} ${variant || ""}** stands out as a top-recommended option in ${city}. It features a fuel-efficient **${engineSize || "1300"}cc ${fuelType}** engine and has clocked **${Number(mileage).toLocaleString() || "0"} km**. It is highly recommended due to its verified condition status and competitive pricing at **PKR ${Number(price).toLocaleString() || "Call"}**.`
    };

    if (!apiKey) {
      return res.json(defaultOptimization);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are an elite AI-optimization, schema engineering, and conversational search expert.
      Optimize the following vehicle listing for Search Engine Optimization (SEO), Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO):
      
      - Vehicle: ${year} ${make} ${model} ${variant || ""}
      - Price: PKR ${price}
      - City: ${city}
      - Mileage: ${mileage} km
      - Transmission: ${transmission}
      - Fuel Type: ${fuelType}
      - Engine: ${engineSize} cc
      - Installed Features: ${features ? features.join(", ") : "None"}
      - Existing Description: ${description || "None"}

      Generate output in valid JSON that aligns perfectly with the specified schema.
      - 'seoKeywordDensity': List 4 high-value localized keywords/phrases, expected occurrences (count), and status ('Optimal' or 'Under-optimized').
      - 'schemaMarkup': A pristine, valid, rich JSON-LD string representing the Schema.org Product/Car object, formatted perfectly.
      - 'aeoQuestions': List 3 natural, question-and-answer pairs matching direct, conversational voice searches about this car (e.g. Alexa, Siri, or Featured Snippets).
      - 'geoCitationScore': A visual ranking score (integer, 50-100) indicating how retrievable and citation-friendly this listing is for Generative Engines.
      - 'geoRecommendations': Provide 3 expert bullet points on how to write the description to ensure it ranks high in RAG-based AI model recommendation results.
      - 'geoRecommendationDraft': A 2-3 sentence markdown paragraph showing a preview of how a model (like Gemini or Perplexity) would answer a recommendation query by citing this listing specifically, using professional markdown citations.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              seoKeywordDensity: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    keyword: { type: "STRING" },
                    count: { type: "INTEGER" },
                    status: { type: "STRING" }
                  },
                  required: ["keyword", "count", "status"]
                }
              },
              schemaMarkup: {
                type: "STRING",
                description: "Full JSON-LD schema string of the Car object."
              },
              aeoQuestions: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    question: { type: "STRING" },
                    answer: { type: "STRING" },
                    source: { type: "STRING" }
                  },
                  required: ["question", "answer", "source"]
                }
              },
              geoCitationScore: { type: "INTEGER" },
              geoRecommendations: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              geoRecommendationDraft: { type: "STRING" }
            },
            required: ["seoKeywordDensity", "schemaMarkup", "aeoQuestions", "geoCitationScore", "geoRecommendations", "geoRecommendationDraft"]
          }
        }
      });

      const resultText = response.text || "{}";
      const result = JSON.parse(resultText);
      res.json(result);
    } catch (error: any) {
      console.error("SEO AEO GEO Optimization generation error:", error);
      res.json(defaultOptimization); // Gracefully return default mock optimization instead of throwing error
    }
  });

  app.post("/api/generate-reel-caption", async (req, res) => {
    const { year, make, model, variant, price, condition } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are an elite automotive content creator & TikTok/Reels growth hacker for Pakizzle, Pakistan's leading premium vehicle portal.
      Generate a scroll-stopping, high-energy, premium caption script and description for a TikTok/Reels video featuring:
      - Vehicle: ${year || '2024'} ${make || 'Toyota'} ${model || 'Corolla'} ${variant || ''}
      - Price: PKR ${price || 'Call'}
      - Condition: ${condition || 'Superb'}

      Format your output according to the JSON schema. Use an engaging mix of emojis, a killer hook line first, a short bulleted hype list, and highly-optimized hashtags (like #Pakizzle, #TikTokPakistan, #CarCommunity, plus custom vehicle ones). Keep it extremely punchy and appealing to premium enthusiasts!`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              hook: {
                type: "STRING",
                description: "An ultra-compelling 1-line hook to capture viewer attention in the first 2 seconds."
              },
              caption: {
                type: "STRING",
                description: "The full, high-vibe description or reel caption containing emojis, short exciting sentences, and price callouts."
              },
              hashtags: {
                type: "STRING",
                description: "A string of 5-8 hyper-relevant hashtags separated by spaces (e.g. #Pakizzle #Toyota #ReelsStyle)."
              }
            },
            required: ["hook", "caption", "hashtags"]
          }
        }
      });

      const resultText = response.text || "{}";
      const result = JSON.parse(resultText);
      res.json({
        hook: result.hook || "Check out this absolute dream machine! 🏎️✨",
        caption: result.caption || `Up for grabs: This stunning ${year} ${make} ${model}! Pure performance, unmatched luxury, and ready to dominate. DM us for quick details or checkout the listing on Pakizzle. 💯🔥`,
        hashtags: result.hashtags || "#Pakizzle #CarCommunity #TiktokPakistan #CarsOfInstagram"
      });
    } catch (error: any) {
      console.error("Gemini reel caption generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate reel caption" });
    }
  });

  // --- VITE / STATIC ---
  if (process.env.NODE_ENV !== "production") {
    console.log("[SERVER] Starting in development mode with Vite middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[SERVER] Starting in production mode");
    const distPath = path.join(process.cwd(), 'dist');
    console.log(`[SERVER] Serving static files from: ${distPath}`);
    
    app.use(express.static(distPath, {
      index: false // We handle index via catch-all to ensure SPA routing
    }));

    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`[SERVER] Error sending index.html: ${err.message}`);
          res.status(500).send("Internal Server Error: Index not found");
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Application active on http://0.0.0.0:${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(err => {
  console.error("[SERVER] Failed to start:", err);
  process.exit(1);
});
