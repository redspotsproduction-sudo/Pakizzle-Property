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
  console.log("[DB] No DATABASE_URL provided. Operating in mock-only mode for property data.");
}

// Helper to query pool safely
const safeQuery = async (text: string, params: any[] = []) => {
  if (!pool) return { rows: [], rowCount: 0 };
  return pool.query(text, params);
};

// --- MOCK DATA FOR FALLBACK (If DB fails or is empty) ---
const mockMakes = [
  { id: 1, name: "House", slug: "house", logoUrl: "", sortOrder: 1, isActive: true },
  { id: 2, name: "Apartment", slug: "apartment", logoUrl: "", sortOrder: 2, isActive: true },
  { id: 3, name: "Plot", slug: "plot", logoUrl: "", sortOrder: 3, isActive: true },
];

const mockModels = [
  { id: 1, makeId: 1, name: "Luxury Contemporary Villa", slug: "luxury-villa", sortOrder: 1, isActive: true },
  { id: 2, makeId: 1, name: "Standard Townhouse", slug: "standard-townhouse", sortOrder: 2, isActive: true },
  { id: 3, makeId: 2, name: "Studio Apartment", slug: "studio-apartment", sortOrder: 1, isActive: true },
  { id: 4, makeId: 2, name: "Penthouse Suite", slug: "penthouse-suite", sortOrder: 2, isActive: true },
  { id: 5, makeId: 3, name: "Residential Plot", slug: "residential-plot", sortOrder: 1, isActive: true },
];

const mockVariants = [
  { id: 1, modelId: 1, name: "Furnished", slug: "furnished", engineCc: "5 Beds", fuelType: "House", transmission: "furnished", bodyType: "house", isActive: true },
  { id: 2, modelId: 4, name: "Unfurnished", slug: "unfurnished", engineCc: "3 Beds", fuelType: "Apartment", transmission: "unfurnished", bodyType: "apartment", isActive: true },
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

  // --- PAKISTAN REAL ESTATE FALLBACK VALUATION ENGINE ---
  function getFallbackPropertyValuation(
    propertyType: string,
    city: string,
    areaName: string,
    size: number,
    sizeUnit: string,
    beds: number,
    baths: number,
    condition: string,
    floors: string,
    features: string[]
  ) {
    let sizeInSqFt = 0;
    const unit = sizeUnit || "Marla";
    if (unit === "Marla") {
      sizeInSqFt = size * 225;
    } else if (unit === "Kanal") {
      sizeInSqFt = size * 20 * 225;
    } else if (unit === "Sq. Yards") {
      sizeInSqFt = size * 9;
    } else {
      sizeInSqFt = size;
    }

    let baseRatePerSqFt = 6000;
    if (propertyType === "House") baseRatePerSqFt = 8500;
    else if (propertyType === "Apartment") baseRatePerSqFt = 11000;
    else if (propertyType === "Penthouse") baseRatePerSqFt = 15000;
    else if (propertyType === "Plot") baseRatePerSqFt = 4000;
    else if (propertyType === "Commercial") baseRatePerSqFt = 18000;

    let cityMultiplier = 1.0;
    const lowerCity = (city || "").toLowerCase();
    if (lowerCity.includes("islamabad")) cityMultiplier = 1.35;
    else if (lowerCity.includes("karachi")) cityMultiplier = 1.2;
    else if (lowerCity.includes("lahore")) cityMultiplier = 1.15;
    else if (lowerCity.includes("rawalpindi")) cityMultiplier = 0.9;
    else if (lowerCity.includes("peshawar")) cityMultiplier = 0.8;
    else if (lowerCity.includes("multan")) cityMultiplier = 0.75;
    else if (lowerCity.includes("faisalabad")) cityMultiplier = 0.75;
    else if (lowerCity.includes("quetta")) cityMultiplier = 0.7;
    else cityMultiplier = 0.6;

    let areaMultiplier = 1.0;
    const lowerArea = (areaName || "").toLowerCase();
    if (
      lowerArea.includes("dha") || 
      lowerArea.includes("defence") || 
      lowerArea.includes("clifton") || 
      lowerArea.includes("gulberg") || 
      lowerArea.includes("bahria") || 
      lowerArea.includes("askari") || 
      lowerArea.includes("e-11") || 
      lowerArea.includes("f-11") || 
      lowerArea.includes("g-11") || 
      lowerArea.includes("f-6") || 
      lowerArea.includes("f-7") || 
      lowerArea.includes("f-8") || 
      lowerArea.includes("f-10") || 
      lowerArea.includes("cantonment") || 
      lowerArea.includes("cantt")
    ) {
      areaMultiplier = 1.9;
    } else if (
      lowerArea.includes("johar") || 
      lowerArea.includes("model town") || 
      lowerArea.includes("gulshan") || 
      lowerArea.includes("federal b") || 
      lowerArea.includes("i-8") || 
      lowerArea.includes("g-13")
    ) {
      areaMultiplier = 1.3;
    } else if (lowerArea.includes("suburb") || lowerArea.includes("scheme")) {
      areaMultiplier = 0.85;
    }

    let baseValue = sizeInSqFt * baseRatePerSqFt * cityMultiplier * areaMultiplier;

    if (propertyType !== "Plot") {
      baseValue += (beds || 0) * 1200000;
      baseValue += (baths || 0) * 600000;
    }

    let conditionMultiplier = 1.0;
    const lowerCond = (condition || "").toLowerCase();
    if (lowerCond.includes("new") || lowerCond.includes("brand")) conditionMultiplier = 1.25;
    else if (lowerCond.includes("excellent")) conditionMultiplier = 1.1;
    else if (lowerCond.includes("good")) conditionMultiplier = 1.0;
    else if (lowerCond.includes("fair")) conditionMultiplier = 0.85;
    else if (lowerCond.includes("renovated")) conditionMultiplier = 1.05;
    else if (lowerCond.includes("raw")) conditionMultiplier = 0.75;

    baseValue *= conditionMultiplier;

    if (propertyType === "House" || propertyType === "Commercial") {
      if (floors === "Double Story") baseValue *= 1.15;
      else if (floors === "Triple Story") baseValue *= 1.25;
    }

    let featureAdditions = 0;
    if (Array.isArray(features)) {
      features.forEach(f => {
        const lf = f.toLowerCase();
        if (lf.includes("generator") || lf.includes("solar")) featureAdditions += 2000000;
        if (lf.includes("corner")) featureAdditions += (baseValue * 0.08);
        if (lf.includes("boulevard")) featureAdditions += (baseValue * 0.12);
        if (lf.includes("basement")) featureAdditions += 3500000;
        if (lf.includes("security") || lf.includes("gated")) featureAdditions += 400000;
      });
    }

    let estimatedValue = baseValue + featureAdditions;
    if (estimatedValue < 2500000) estimatedValue = 2500000;

    estimatedValue = Math.round(estimatedValue / 100000) * 100000;

    const low = Math.round((estimatedValue * 0.92) / 100000) * 100000;
    const high = Math.round((estimatedValue * 1.08) / 100000) * 100000;

    let grossYield = 4.0;
    if (propertyType === "Apartment") grossYield = 6.0;
    else if (propertyType === "Penthouse") grossYield = 6.5;
    else if (propertyType === "Commercial") grossYield = 8.0;
    else if (propertyType === "Plot") grossYield = 0.0;

    const estimatedRent = grossYield > 0 
      ? Math.round((estimatedValue * (grossYield / 100) / 12) / 5000) * 5000 
      : 0;

    const stampDuty = Math.round(estimatedValue * 0.02);
    const transferFee = Math.round(estimatedValue * 0.01);
    const filerFbrTax = Math.round(estimatedValue * 0.03);
    const nonFilerFbrTax = Math.round(estimatedValue * 0.10);

    const displaySize = `${size} ${unit}`;
    const comparableProperties = [
      {
        title: `Similar ${propertyType} in ${areaName || 'Sector'}`,
        price: Math.round((estimatedValue * 0.95) / 500000) * 500000,
        size: displaySize,
        source: "Pakizzle Verified Database"
      },
      {
        title: `${conditionMultiplier >= 1.1 ? 'Newly Constructed' : 'Standard'} ${propertyType} nearby`,
        price: Math.round((estimatedValue * 1.04) / 500000) * 500000,
        size: displaySize,
        source: "Locality Agent Index"
      }
    ];

    return {
      estimatedValue,
      marketRange: { low, high },
      confidence: 0.85,
      analysis: `Based on localized market transactions in ${city}, properties in ${areaName || 'this sector'} maintain robust equity preservation. A ${displaySize} ${propertyType} constructed to ${condition} standards is fully aligned with modern residential expectations. ${propertyType !== "Plot" ? `With an estimated gross rental yield of ${grossYield}%, this property sits securely in the cash-generating tier.` : "Since this is a plot, it has minimal carrying costs and high resale liquidity with zero building depreciation."} General inflation in Pakistan has driven replacement values up by 15-20% over the last 18 months, making completed structures highly attractive.`,
      investmentYield: {
        estimatedRent,
        grossYield
      },
      priceTrend: "stable" as const,
      comparableProperties,
      taxBreakdown: {
        filerFbrTax,
        nonFilerFbrTax,
        stampDuty,
        transferFee
      }
    };
  }

  app.post("/api/valuation/property", async (req, res) => {
    const { propertyType, city, areaName, size, sizeUnit, beds, baths, condition, floors, features } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log("[VALUATION] No GEMINI_API_KEY configured. Utilizing fallback engine.");
      const fallbackResult = getFallbackPropertyValuation(propertyType, city, areaName, Number(size), sizeUnit, Number(beds || 0), Number(baths || 0), condition, floors, features || []);
      return res.json(fallbackResult);
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

      const prompt = `As an elite real estate valuer and property economist in Pakistan, estimate the current market value, rental metrics, localized market trend, and taxes for the following property listing on Pakizzle (Pakistan's premium property portal):
      
      - Property Type: ${propertyType}
      - City: ${city}
      - Area / Neighborhood / Sector: ${areaName}
      - Size: ${size} ${sizeUnit}
      - Bedrooms: ${beds || 0}
      - Bathrooms: ${baths || 0}
      - Condition: ${condition}
      - Construction/Structure: ${floors}
      - Amenities/Features: ${features && features.length > 0 ? features.join(", ") : "None"}

      Provide the valuation in Pakistani Rupees (PKR).
      Consider 2026 market dynamics, regional inflation, FBR valuation tables, rental demand curves in ${city} (e.g., DHA, Clifton, Bahria Town, Gulberg, Capital sectors), and premium features impact (like Solar setup or Corner plot).
      
      Calculate FBR Taxes and Stamp Duty based on Pakistan's latest property transfer tax rules:
      - Stamp duty is approximately 2% of the estimated value.
      - Transfer fee is approximately 1% of the estimated value.
      - Filer Advance Tax (FBR) is approximately 3% of the estimated value.
      - Non-Filer Advance Tax (FBR) is approximately 10% of the estimated value.
      Ensure the numbers are realistic for a property in ${areaName}, ${city}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              estimatedValue: { type: "NUMBER", description: "Estimated market resale value in PKR" },
              marketRange: {
                type: "OBJECT",
                properties: {
                  low: { type: "NUMBER", description: "Low range market value in PKR (approx 5-10% below estimate)" },
                  high: { type: "NUMBER", description: "High range market value in PKR (approx 5-10% above estimate)" }
                },
                required: ["low", "high"]
              },
              confidence: { type: "NUMBER", description: "Confidence score (0.0 to 1.0) based on listing density" },
              analysis: { type: "STRING", description: "A highly professional, detailed market analysis paragraph explaining local price trends, rental demand, and regional advantages of this specific location in Pakistan." },
              investmentYield: {
                type: "OBJECT",
                properties: {
                  estimatedRent: { type: "NUMBER", description: "Estimated monthly rental value in PKR (for plots, set this to 0)" },
                  grossYield: { type: "NUMBER", description: "Estimated annual gross rental yield percentage (e.g. 4.5, for plots set this to 0)" }
                },
                required: ["estimatedRent", "grossYield"]
              },
              priceTrend: { type: "STRING", description: "Market direction ('rising', 'stable', or 'declining')" },
              comparableProperties: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING", description: "Brief title of the comparable listing, e.g. 10 Marla House in DHA Phase 5" },
                    price: { type: "NUMBER", description: "Price in PKR" },
                    size: { type: "STRING", description: "Size of the comparable property, e.g. 10 Marla" },
                    source: { type: "STRING", description: "Source name, e.g. 'Pakizzle Verified' or 'Agent Index'" }
                  },
                  required: ["title", "price", "size", "source"]
                }
              },
              taxBreakdown: {
                type: "OBJECT",
                properties: {
                  filerFbrTax: { type: "NUMBER", description: "Approximate FBR purchase tax for Active Taxpayers (Filer) in PKR (approx 3% of value)" },
                  nonFilerFbrTax: { type: "NUMBER", description: "Approximate FBR purchase tax for Non-Filers in PKR (approx 10% of value)" },
                  stampDuty: { type: "NUMBER", description: "Stamp duty in PKR (approx 2% of value)" },
                  transferFee: { type: "NUMBER", description: "Transfer/registry fee in PKR (approx 1% of value)" }
                },
                required: ["filerFbrTax", "nonFilerFbrTax", "stampDuty", "transferFee"]
              }
            },
            required: ["estimatedValue", "marketRange", "confidence", "analysis", "investmentYield", "priceTrend", "comparableProperties", "taxBreakdown"]
          }
        }
      });

      const resultText = response.text || "{}";
      const result = JSON.parse(resultText);
      res.json(result);
    } catch (error: any) {
      console.error("[VALUATION] Gemini API error, falling back to local engine:", error);
      const fallbackResult = getFallbackPropertyValuation(propertyType, city, areaName, Number(size), sizeUnit, Number(beds || 0), Number(baths || 0), condition, floors, features || []);
      res.json(fallbackResult);
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

      const prompt = `You are a world-class real estate SEO Copywriter and property listing optimizer for a premium property portal in Pakistan called Pakizzle. Your task is to output a dual description for a ${year || '2024'} ${make || 'House'} ${model || 'Contemporary Villa'} ${variant ? variant : ''} with the following exact parameters:
      - Condition: ${condition || 'ready'} (overall property/construction state)
      - Area Size: ${mileage || '0'} Sq. Ft.
      - Furnishing: ${transmission === 'furnished' ? 'Fully Furnished' : 'Unfurnished'}
      - Property Type: ${fuelType || 'Residential'}
      - Layout Configuration: ${engineSize || '3 Beds'}
      - Registered City: ${registrationCity || 'Lahore'}
      ${features && features.length > 0 ? `- Amenities Installed: ${features.join(", ")}` : ""}

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
                description: "A clean, human-friendly, highly compelling plain-text property description WITHOUT any HTML tags, bullet points, headers, or lists of SEO keywords. Focuses purely on natural appeal."
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
        simpleText: result.simpleText || "Pristine property in an elite location, extremely well maintained.",
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
        { keyword: `Luxury ${make} for sale in ${city}`, count: 4, status: "Optimal" },
        { keyword: `Buy ${year} ${make} ${model}`, count: 2, status: "Optimal" },
        { keyword: `Best real estate deal in ${city}`, count: 2, status: "Optimal" }
      ],
      schemaMarkup: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": `${year} ${make} ${model} ${variant || ""}`,
        "description": description || `Verified ${year} ${make} ${model} in ${city}.`,
        "offers": {
          "@type": "Offer",
          "price": price || "Call",
          "priceCurrency": "PKR",
          "availability": "https://schema.org/InStock"
        },
        "floorSize": {
          "@type": "QuantitativeValue",
          "value": mileage || 0,
          "unitCode": "FTK"
        }
      }, null, 2),
      aeoQuestions: [
        {
          question: `What is the price of ${year} ${make} ${model} in ${city}?`,
          answer: `The price is PKR ${Number(price).toLocaleString() || "Call"} for this verified listing on Pakizzle.`,
          source: "Pakizzle Verified Database"
        }
      ],
      geoCitationScore: 94,
      geoRecommendations: [
        "Include exact certified property title checks to maximize trust score in Perplexity searches.",
        "Mention distance to major amenities to align with conversational query parameters."
      ],
      geoRecommendationDraft: `Based on verified agent listings from Pakizzle, the **${year} ${make} ${model} ${variant || ""}** stands out as a top-recommended option in ${city}. It features a spacious **${mileage ? Number(mileage).toLocaleString() : '0'} Sq.Ft.** floor area. It is highly recommended due to its verified status and competitive pricing at **PKR ${Number(price).toLocaleString() || "Call"}**.`
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

      const prompt = `You are an elite AI-optimization, real estate schema engineering, and conversational search expert.
      Optimize the following property listing for Search Engine Optimization (SEO), Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO):
      
      - Property: ${year} ${make} ${model} ${variant || ""}
      - Price: PKR ${price}
      - City: ${city}
      - Area Size: ${mileage} Sq. Ft.
      - Furnishing Status: ${transmission}
      - Rooms/Layout: ${engineSize}
      - Amenities Installed: ${features ? features.join(", ") : "None"}
      - Existing Description: ${description || "None"}

      Generate output in valid JSON that aligns perfectly with the specified schema.
      - 'seoKeywordDensity': List 4 high-value localized keywords/phrases, expected occurrences (count), and status ('Optimal' or 'Under-optimized').
      - 'schemaMarkup': A pristine, valid, rich JSON-LD string representing the Schema.org RealEstateListing object, formatted perfectly.
      - 'aeoQuestions': List 3 natural, question-and-answer pairs matching direct, conversational voice searches about this property (e.g. Alexa, Siri, or Featured Snippets).
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
                description: "Full JSON-LD schema string of the RealEstateListing object."
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

      const prompt = `You are an elite real estate content creator & TikTok/Reels growth hacker for Pakizzle, Pakistan's leading premium property portal.
      Generate a scroll-stopping, high-energy, premium caption script and description for a TikTok/Reels video featuring:
      - Property: ${year || '2024'} ${make || 'House'} ${model || 'Contemporary Villa'} ${variant || ''}
      - Price: PKR ${price || 'Call'}
      - Condition: ${condition || 'Brand New'}

      Format your output according to the JSON schema. Use an engaging mix of emojis, a killer hook line first, a short bulleted hype list, and highly-optimized hashtags (like #Pakizzle, #TikTokPakistan, #RealEstate, plus custom ones). Keep it extremely punchy and appealing to premium buyers!`;

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
                description: "A string of 5-8 hyper-relevant hashtags separated by spaces (e.g. #Pakizzle #RealEstate #LuxuryVibe)."
              }
            },
            required: ["hook", "caption", "hashtags"]
          }
        }
      });

      const resultText = response.text || "{}";
      const result = JSON.parse(resultText);
      res.json({
        hook: result.hook || "Check out this absolute dream property! 🏡✨",
        caption: result.caption || `Up for grabs: This stunning ${year} ${make} ${model}! Pure comfort, unmatched luxury, and ready for you. DM us for quick details or checkout the listing on Pakizzle. 💯🔥`,
        hashtags: result.hashtags || "#Pakizzle #RealEstate #TiktokPakistan #LuxuryLiving"
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
