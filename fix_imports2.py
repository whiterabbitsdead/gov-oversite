import re

with open("src/components/RepresentativeCard.tsx", "r") as f:
    content = f.read()

content = content.replace("  Star\n} from 'lucide-react';", "  Star,\n  Search\n} from 'lucide-react';")

with open("src/components/RepresentativeCard.tsx", "w") as f:
    f.write(content)

print("Fixed imports properly.")
