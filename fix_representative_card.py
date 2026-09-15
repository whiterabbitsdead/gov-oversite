import re

with open("src/components/RepresentativeCard.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "import { \n  DollarSign,", 
    "import { \n  DollarSign,\n  X,\n  ExternalLink,"
)
# Try different spacing for import
content = content.replace(
    "import {\n  DollarSign", 
    "import {\n  DollarSign,\n  X,\n  ExternalLink"
)
content = content.replace(
    "import { \n   DollarSign,", 
    "import { \n   DollarSign,\n  X,\n  ExternalLink,"
)
content = content.replace(
    "import {\n   DollarSign,", 
    "import {\n   DollarSign,\n  X,\n  ExternalLink,"
)

# Add state variable
state_var = """  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState<string | null>(null);"""
content = content.replace("  const [showBreakdown, setShowBreakdown] = useState(false);", state_var)

with open("src/components/RepresentativeCard.tsx", "w") as f:
    f.write(content)

print("Fixed")
