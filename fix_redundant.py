import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = "Congressional Representatives Index ({filteredLegislators.length} Match)"
replacement = "Congressional Representatives Index"

content = content.replace(target, replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Fixed redundant match count")
