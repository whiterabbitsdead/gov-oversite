/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Lazy-initialization helper for Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in environment variables.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  
  // Types and DB
  type LocalComplaint = {
    id: string;
    county: string;
    state: string;
    title: string;
    category: string;
    description: string;
    evidenceDescription?: string;
    status: 'Pending' | 'Investigating' | 'Verified' | 'Dismissed';
    dateSubmitted: string;
    reporterNotes?: string[];
    upvotes: number;
    submittedBy?: string;
  };

  const localComplaintsDb: LocalComplaint[] = [];

  function requireGeminiKey(res: any) {
    if (!process.env.GEMINI_API_KEY) {
      res.status(400).json({ error: "Gemini API key is not configured. Please add it in the settings." });
      return false;
    }
    return true;
  }

  app.post("/api/gemini/advisor", async (req, res) => {
    if (!requireGeminiKey(res)) return;
    try {
      const { history } = req.body;
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: history.map((m: any) => m.text).join("\n")
      });
      res.json({ reply: response.text });
    } catch (e: any) {
      res.status(503).json({ error: "AI Service is temporarily unavailable. Please try again later." });
    }
  });

  app.post("/api/gemini/committee-findings", async (req, res) => {
    if (!requireGeminiKey(res)) return;
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Generate committee findings."
      });
      res.json({ findings: response.text });
    } catch (e: any) {
      res.status(503).json({ error: "AI Service is temporarily unavailable." });
    }
  });

  app.post("/api/gemini/generate-milestone-plan", async (req, res) => {
    if (!requireGeminiKey(res)) return;
    try {
      const { milestone } = req.body;
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Generate milestone plan for " + milestone.id
      });
      res.json({ plan: response.text });
    } catch (e: any) {
      res.status(503).json({ error: "AI Service is temporarily unavailable." });
    }
  });

  app.post("/api/gemini/generate-rebuttal", async (req, res) => {
    if (!requireGeminiKey(res)) return;
    try {
      const { legislator } = req.body;
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Generate rebuttal for " + legislator.name,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              statement: { type: Type.STRING },
              correctiveActions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["statement", "correctiveActions"]
          }
        }
      });
      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (e: any) {
      res.status(503).json({ error: "AI Service is temporarily unavailable." });
    }
  });

  app.post("/api/gemini/legislator-briefing", async (req, res) => {
    if (!requireGeminiKey(res)) return;
    try {
      const { legislator } = req.body;
      const ai = getGeminiClient();
      const prompt = `Write a concise integrity and civic transparency briefing for legislator ${legislator.name} (${legislator.party}-${legislator.state}). Include sections on PAC funding, Session Transparency, Affiliations, and Watchdog Recommendation. Keep it strictly factual.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      res.json({ briefing: response.text });
    } catch (e: any) {
      res.status(503).json({ error: "Briefing service is temporarily unavailable." });
    }
  });

  app.post("/api/gemini/pac-anomaly-explanation", async (req, res) => {
    if (!requireGeminiKey(res)) return;
    try {
      const { entry, legislatorName } = req.body;
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Explain this PAC funding anomaly for ${legislatorName}: ${JSON.stringify(entry)}`
      });
      res.json({ explanation: response.text });
    } catch (e: any) {
      res.status(503).json({ error: "AI Service is temporarily unavailable." });
    }
  });

  app.post("/api/gemini/watchdog-scan", async (req, res) => {
    if (!requireGeminiKey(res)) return;
    try {
      const { billData, customRules } = req.body;
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Analyze this bill: " + JSON.stringify(billData) + " using rules: " + customRules
      });
      res.json({ analysis: response.text });
    } catch (e: any) {
      res.status(503).json({ error: "Watchdog analysis service is temporarily unavailable." });
    }
  });

  app.post("/api/watchdog/ask", async (req, res) => {
    try {
      const { billNumber, title, question } = req.body;
      try {
        if (!process.env.GEMINI_API_KEY) throw new Error("No API Key");
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Answer this question about bill ${billNumber} ${title}: ${question}`
        });
        res.json({ answer: response.text });
      } catch (e: any) {
        // Fallback
        res.json({ 
          answer: `Based on a simulated analysis of ${billNumber}, the provisions relating to your question ("${question}") suggest there are specific regulatory adjustments in Section 4. However, this is a mock fallback response.`, 
          usingDemoFallback: true 
        });
      }
    } catch (e: any) {
      res.status(503).json({ error: "AI Service is temporarily unavailable." });
    }
  });

  app.post("/api/watchdog/summarize", async (req, res) => {
    if (!requireGeminiKey(res)) return;
    try {
      const { billNumber, title, billText } = req.body;
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Summarize bill ${billNumber} ${title}: ${billText.substring(0, 500)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING },
              keyProvisions: { type: Type.ARRAY, items: { type: Type.STRING } },
              citizenImpact: { type: Type.STRING }
            },
            required: ["executiveSummary", "keyProvisions", "citizenImpact"]
          }
        }
      });
      const parsed = JSON.parse(response.text || "{}");
      res.json({ summary: parsed });
    } catch (e: any) {
      res.status(503).json({ error: "Summarization service is temporarily unavailable." });
    }
  });


  app.post("/api/local-audit/search", async (req, res) => {
    try {
      const { county, state } = req.body;
      
      // Attempt to use Gemini if available
      try {
        const ai = getGeminiClient();
        const prompt = `Generate a realistic fictional local government integrity audit for ${county} County, ${state}. Return a JSON object with 'county' (string), 'state' (string), and 'officials' (array of objects). Each official should have: 'id' (unique string), 'name' (string), 'role' (string, e.g., 'County Supervisor', 'Sheriff'), 'party' ('Democrat', 'Republican', 'Independent', 'Non-Partisan'), 'integrityScore' (number 0-100), 'rating' ('A', 'B', 'C', 'D', 'F'), 'salary' (number), 'tenure' (string, e.g. '8 years'), 'conflicts' (array of strings, e.g. ['PAC ties to developers']), 'contributions' (array of { donor: string, amount: number, category: string }), and 'recentActions' (array of strings). Include 3-5 officials. Ensure realistic but fictional names.`;
        
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                county: { type: Type.STRING },
                state: { type: Type.STRING },
                officials: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      role: { type: Type.STRING },
                      party: { type: Type.STRING },
                      integrityScore: { type: Type.INTEGER },
                      rating: { type: Type.STRING },
                      salary: { type: Type.INTEGER },
                      tenure: { type: Type.STRING },
                      conflicts: { type: Type.ARRAY, items: { type: Type.STRING } },
                      contributions: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            donor: { type: Type.STRING },
                            amount: { type: Type.INTEGER },
                            category: { type: Type.STRING }
                          },
                          required: ["donor", "amount", "category"]
                        }
                      },
                      recentActions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["id", "name", "role", "party", "integrityScore", "rating", "salary", "tenure", "conflicts", "contributions", "recentActions"]
                  }
                }
              },
              required: ["county", "state", "officials"]
            }
          }
        });
        const parsed = JSON.parse(response.text || "{}");
        return res.json({ ...parsed, liveGenerated: true });
      } catch (e: any) {
         // Fallback to static mock data if gemini fails or key missing
         // Seeded mock database generator based on requested county
         const seed = (county || "Maricopa").charCodeAt(0) + (county || "Maricopa").length;
         
         const mockData = {
           county: county || "Maricopa",
           state: state || "AZ",
           liveGenerated: false,
           usingDemoFallback: true,
           officials: [
             {
               id: `o1-${seed}`,
               name: `Official ${seed * 2} of ${county}`,
               role: "County Supervisor",
               party: seed % 2 === 0 ? "Republican" : "Democrat",
               integrityScore: 30 + (seed % 50),
               rating: (seed % 5) === 0 ? "F" : "C",
               salary: 120000 + (seed * 100),
               tenure: `${(seed % 10) + 2} years`,
               conflicts: [`Voted on land rezoning while receiving PAC funds from ${county} property developers.`],
               contributions: [{ donor: "Regional Developers PAC", amount: 25000 + (seed * 100), category: "Real Estate" }],
               recentActions: ["Approved $5M contract bypass for construction.", "Voted against transparency measure."]
             },
             {
               id: `o2-${seed}`,
               name: `Auditor ${seed * 3} of ${county}`,
               role: "County Auditor",
               party: seed % 2 === 0 ? "Democrat" : "Independent",
               integrityScore: 70 + (seed % 25),
               rating: (seed % 3) === 0 ? "A" : "B",
               salary: 95000 + (seed * 50),
               tenure: `${(seed % 6) + 1} years`,
               conflicts: [],
               contributions: [{ donor: "Local Workers Union", amount: 5000, category: "Labor" }],
               recentActions: ["Published open-records portal.", "Flagged anomalous spending in public works."]
             },
             {
               id: `o3-${seed}`,
               name: `Sheriff ${seed * 4} of ${county}`,
               role: "County Sheriff",
               party: seed % 2 === 0 ? "Republican" : "Democrat",
               integrityScore: 40 + (seed % 40),
               rating: (seed % 2) === 0 ? "C" : "D",
               salary: 135000 + (seed * 200),
               tenure: `${(seed % 12) + 4} years`,
               conflicts: ["Questionable asset forfeiture practices.", "Refused to comply with records request."],
               contributions: [{ donor: "Law Enforcement PAC", amount: 15000, category: "Security" }],
               recentActions: ["Requested budget increase for tactical gear.", "Settled misconduct lawsuit for $2M."]
             }
           ]
         };
         return res.json(mockData);
      }
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to perform local audit search." });
    }
  });

  // Fetch Complaints List
  app.get("/api/local-complaints", (req, res) => {
    try {
      const { search, category, status } = req.query;
      let list = [...localComplaintsDb];

      if (search) {
        const s = (search as string).toLowerCase();
        list = list.filter(c => 
          c.title.toLowerCase().includes(s) || 
          c.county.toLowerCase().includes(s) || 
          c.description.toLowerCase().includes(s) ||
          c.state.toLowerCase().includes(s)
        );
      }

      if (category && category !== "All") {
        list = list.filter(c => c.category === category);
      }

      if (status && status !== "All") {
        list = list.filter(c => c.status === status);
      }

      // Sort by upvotes descending
      list.sort((a, b) => b.upvotes - a.upvotes);

      return res.json({ complaints: list });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to retrieve complaints." });
    }
  });

  // Submit Complaint
  app.post("/api/local-complaints", (req, res) => {
    try {
      const { county, state, title, category, description, evidenceDescription, submittedBy } = req.body;

      if (!county || !state || !title || !category || !description) {
        return res.status(400).json({ error: "Missing required complaint fields (County, State, Title, Category, and Description)." });
      }

      const newComplaint: LocalComplaint = {
        id: `comp-${Date.now()}`,
        county,
        state,
        title,
        category,
        description,
        evidenceDescription: evidenceDescription || "",
        status: "Pending",
        dateSubmitted: new Date().toISOString().split('T')[0],
        reporterNotes: [],
        upvotes: 1,
        submittedBy: submittedBy || "Anonymous Citizen"
      };

      localComplaintsDb.unshift(newComplaint);
      return res.status(201).json({ complaint: newComplaint });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to submit complaint." });
    }
  });

  // Upvote Complaint
  app.post("/api/local-complaints/:id/vote", (req, res) => {
    try {
      const { id } = req.params;
      const complaintIndex = localComplaintsDb.findIndex(c => c.id === id);
      if (complaintIndex === -1) {
        return res.status(404).json({ error: "Complaint not found." });
      }

      localComplaintsDb[complaintIndex].upvotes += 1;
      return res.json({ upvotes: localComplaintsDb[complaintIndex].upvotes });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to log vote." });
    }
  });

  // Update Complaint Status & Add Reporter Note (For Investigative Reporters)
  app.post("/api/local-complaints/:id/status", (req, res) => {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      const complaintIndex = localComplaintsDb.findIndex(c => c.id === id);
      if (complaintIndex === -1) {
        return res.status(404).json({ error: "Complaint not found." });
      }

      if (status) {
        localComplaintsDb[complaintIndex].status = status;
      }

      if (note && note.trim()) {
        if (!localComplaintsDb[complaintIndex].reporterNotes) {
          localComplaintsDb[complaintIndex].reporterNotes = [];
        }
        localComplaintsDb[complaintIndex].reporterNotes!.push(note.trim());
      }

      return res.json({ complaint: localComplaintsDb[complaintIndex] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to update complaint." });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
