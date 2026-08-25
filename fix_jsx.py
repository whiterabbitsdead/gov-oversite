import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("High Spike (>35% above avg)", "High Spike (&gt;35% above avg)")
content = content.replace("Low Dip (>35% below avg)", "Low Dip (&gt;35% below avg)")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Fixed JSX syntax.")
