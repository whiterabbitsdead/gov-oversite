with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("export default \nconst HighlightedBillText", "const HighlightedBillText")
content = content.replace("export default const HighlightedBillText", "const HighlightedBillText")

if "export default function App" not in content:
    content = content.replace("function App() {", "export default function App() {", 1)

with open("src/App.tsx", "w") as f:
    f.write(content)

