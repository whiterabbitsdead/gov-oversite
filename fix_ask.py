import re

with open("server.ts", "r") as f:
    content = f.read()

target = """  app.post("/api/watchdog/ask", async (req, res) => {
    if (!requireGeminiKey(res)) return;
    try {
      const { billNumber, title, question } = req.body;
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Answer this question about bill ${billNumber} ${title}: ${question}`
      });
      res.json({ answer: response.text });
    } catch (e: any) {
      res.status(503).json({ error: "AI Service is temporarily unavailable." });
    }
  });"""

new_target = """  app.post("/api/watchdog/ask", async (req, res) => {
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
  });"""

content = content.replace(target, new_target)

with open("server.ts", "w") as f:
    f.write(content)

print("Updated server.ts ask endpoint")
