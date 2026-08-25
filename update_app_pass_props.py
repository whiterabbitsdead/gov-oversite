import re

with open("src/App.tsx", "r") as f:
    content = f.read()

replacement = """                      onShowBriefing={handleGenerateBriefing}
                      onScanFindings={handleScanFindings}
                      compareMode={isCompareMode}"""

content = content.replace("""                      onShowBriefing={handleGenerateBriefing}
                      compareMode={isCompareMode}""", replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated App.tsx to pass onScanFindings prop.")
