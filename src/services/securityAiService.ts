import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, ActivityLog, SecurityAlert } from "../types";

// Lazy initialization of Gemini
let _ai: any = null;
const getAI = () => {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI features will be limited.");
      return null;
    }
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
};

export async function analyzeUserSecurity(user: UserProfile, logs: ActivityLog[]): Promise<Partial<SecurityAlert>[]> {
  try {
    const ai = getAI();
    if (!ai) return [];
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
        Analyze the following user profile and activity logs for Pakizzle (Pakistani automotive marketplace).
        Look for:
        1. Fake activities (odd posting patterns).
        2. IP detection anomalies (proxy/VPN detection based on location mismatches).
        3. Fraud detection (scam indicators).
        4. Identity verification risks.

        User Profile: ${JSON.stringify(user)}
        Recent Logs: ${JSON.stringify(logs)}

        Return a JSON list of identified risks or security alerts. Each alert must follow this structure:
        {
          "type": "suspicious_login" | "multiple_accounts" | "price_manipulation" | "vpn_detected" | "identity_mismatch" | "high_frequency_listings" | "fake_activity",
          "severity": "low" | "medium" | "high" | "critical",
          "description": "Short explanation",
          "aiAgentNotes": "Deep tech analysis"
        }
        Return an empty list if no risks are found.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              severity: { type: Type.STRING },
              description: { type: Type.STRING },
              aiAgentNotes: { type: Type.STRING },
            },
            required: ["type", "severity", "description", "aiAgentNotes"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Security Analysis Error:", error);
    return [];
  }
}
