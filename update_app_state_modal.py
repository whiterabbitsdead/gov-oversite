import re

with open("src/App.tsx", "r") as f:
    content = f.read()

replacement_state = """  // Compare Mode state
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);"""

content = content.replace("  // Compare Mode state\n  const [isCompareMode, setIsCompareMode] = useState(false);\n  const [compareSelection, setCompareSelection] = useState<string[]>([]);", replacement_state)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated App.tsx state with showCompareModal.")
