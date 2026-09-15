with open("src/App.tsx", "r") as f:
    content = f.read()

start = content.find("  // Reconstructed Missing Logic")
end = content.find("  const [activeTab, setActiveTab]", start)
if end == -1:
    end = content.find("  const [activeTab", start)

if start != -1 and end != -1:
    content = content[:start] + content[end:]
    with open("src/App.tsx", "w") as f:
        f.write(content)
    print("Removed bad block.")
else:
    print("Could not find bad block.")
