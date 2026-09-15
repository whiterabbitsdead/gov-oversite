import re

with open("server.ts", "r") as f:
    content = f.read()

route = """
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
         const mockData = {
           county: county || "Maricopa",
           state: state || "AZ",
           liveGenerated: false,
           usingDemoFallback: true,
           officials: [
             {
               id: "o1",
               name: "Robert M. Houser",
               role: "County Supervisor",
               party: "Republican",
               integrityScore: 42,
               rating: "D",
               salary: 145000,
               tenure: "12 years",
               conflicts: ["Voted on land rezoning while receiving PAC funds from property developers."],
               contributions: [{ donor: "Desert State Developers PAC", amount: 45000, category: "Real Estate" }],
               recentActions: ["Approved $5M contract bypass for construction.", "Voted against transparency measure."]
             },
             {
               id: "o2",
               name: "Sarah Jenkins",
               role: "County Auditor",
               party: "Democrat",
               integrityScore: 88,
               rating: "A",
               salary: 110000,
               tenure: "4 years",
               conflicts: [],
               contributions: [{ donor: "Local Teachers Union", amount: 5000, category: "Labor" }],
               recentActions: ["Published open-records portal.", "Flagged anomalous spending in public works."]
             }
           ]
         };
         return res.json(mockData);
      }
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to perform local audit search." });
    }
  });
"""

target = "  // Fetch Complaints List\n  app.get(\"/api/local-complaints\""
content = content.replace(target, route + "\n" + target)

with open("server.ts", "w") as f:
    f.write(content)

print("Updated server.ts")
