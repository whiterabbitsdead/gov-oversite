import re

with open("src/App.tsx", "r") as f:
    content = f.read()

import_line = "import { CivicLeaderboard } from './components/CivicLeaderboard';\n"
if "CivicLeaderboard" not in content:
    content = content.replace("import { AnimatedScore } from './components/AnimatedScore';", "import { AnimatedScore } from './components/AnimatedScore';\n" + import_line)

leaderboard_injection = """
            <CivicLeaderboard 
              legislators={filteredLegislators}
              calculateTransparencyIndex={calculateTransparencyIndex}
            />
"""

if "CivicLeaderboard legislators=" not in content:
    content = content.replace("{/* Simulated Live Alert Logs */}", leaderboard_injection + "\n            {/* Simulated Live Alert Logs */}")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("App updated")
