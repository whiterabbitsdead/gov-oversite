with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("  const [isViewingBill, setIsViewingBill] = useState(false);", "  const [isViewingBill, setIsViewingBill] = useState(false);\n  const [currentViewingBill, setCurrentViewingBill] = useState<any>(null);")

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Fixed viewing bill.")
