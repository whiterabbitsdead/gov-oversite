import re

with open("server.ts", "r") as f:
    content = f.read()

endpoint = """
  // Committee Findings Agent
  app.post("/api/gemini/committee-findings", async (req, res) => {
    try {
      const { legislatorName, party, state, role, bio } = req.body;
      
      const prompt = `You are a strict, investigative AI findings agent for a non-partisan government watchdog group.
Your task is to scan the historical record and any major congressional ethics or committee findings for valid evidence of corruption, ethics violations, or notable conflicts of interest involving ${role} ${legislatorName} (${party}, ${state}).

Provide a concise, 2-3 paragraph summary of any known controversies, ethics committee probes, or substantiated allegations of corruption. If there are no major findings, state that there is no significant public record of ethics violations. Ensure tone is objective, factual, and strictly based on the public record.

Bio context: ${bio || 'None provided'}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      const text = response.text || "Unable to retrieve findings.";
      return res.json({ findings: text });
    } catch (err: any) {
      console.error("Gemini Committee Findings error:", err);
      return res.status(500).json({ error: "Failed to generate committee findings." });
    }
  });
"""

# Insert before // MOCK DATA
content = content.replace("  // MOCK DATA", endpoint + "\n  // MOCK DATA")

with open("server.ts", "w") as f:
    f.write(content)

print("Added Gemini Committee Findings endpoint.")
