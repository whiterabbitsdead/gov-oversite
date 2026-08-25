import re

with open("src/components/RepresentativeCard.tsx", "r") as f:
    content = f.read()

content = content.replace("  Briefcase", "  Briefcase,\n  Search")

with open("src/components/RepresentativeCard.tsx", "w") as f:
    f.write(content)

print("Fixed imports.")
