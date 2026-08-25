with open("src/App.tsx", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "{dashboardTab === 'events' && (" in line:
        lines[i] = line.replace("{dashboardTab === 'events' && (", "{dashboardTab === 'events' && (<>")
        break

for i in range(len(lines)):
    if "            )}            {/* PAC Funding Trend" in "".join(lines[i:i+2]):
        pass # this is hard to match

# let's just do it cleanly
import re
content = "".join(lines)
content = content.replace("{dashboardTab === 'events' && (\n            <div className=\"grid", "{dashboardTab === 'events' && (<>\n            <div className=\"grid")
content = content.replace("            </div>\n            )}\n\n            {/* PAC Funding Trend & Legislative Alignment Section */}", "            </div>\n            </>)}\n\n            {/* PAC Funding Trend & Legislative Alignment Section */}")

with open("src/App.tsx", "w") as f:
    f.write(content)
