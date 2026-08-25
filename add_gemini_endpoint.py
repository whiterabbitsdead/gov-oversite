import re

with open("server.ts", "r") as f:
    content = f.read()

endpoint = """
  // PAC Anomaly Explanation (AI Generated)
  app.post("/api/gemini/pac-anomaly-explanation", async (req, res) => {
    try {
      const { legislatorName, party, state, term, pacFunding, averageFunding, type } = req.body;
      
      const prompt = `You are a non-partisan, investigative political data analyst. 
Please provide a brief 2-3 sentence hypothetical explanation for why a ${party} legislator from ${state} (${legislatorName}) might have seen an unusual ${type} in corporate PAC contributions during the ${term} term.
The PAC funding for this term was $${pacFunding.toLocaleString()}, compared to their historical 5-term average of $${Math.round(averageFunding).toLocaleString()}.
Provide plausible political context (e.g., controversial committee assignments, competitive re-election, shifts in corporate lobbying priorities, or specific bills). Keep it strictly factual and neutral in tone.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      const explanation = response.text || "Unable to generate analysis.";
      return res.json({ explanation });
    } catch (err: any) {
      console.error("Gemini PAC Anomaly API error:", err);
      return res.status(500).json({ error: "AI analysis generation failed." });
    }
  });
"""

# Insert before // MOCK DATA
content = content.replace("  // MOCK DATA", endpoint + "\n  // MOCK DATA")

with open("server.ts", "w") as f:
    f.write(content)

print("Added Gemini PAC anomaly endpoint.")
