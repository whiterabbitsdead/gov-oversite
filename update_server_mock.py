import re

with open("server.ts", "r") as f:
    content = f.read()

mock_logic_old = """         const mockData = {
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
         };"""

mock_logic_new = """         // Seeded mock database generator based on requested county
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
         };"""

content = content.replace(mock_logic_old, mock_logic_new)

with open("server.ts", "w") as f:
    f.write(content)

print("Updated server mock")
