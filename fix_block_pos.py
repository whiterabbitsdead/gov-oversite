with open("src/App.tsx", "r") as f:
    content = f.read()

start = content.find("  // Restored Missing Logic (Properly referenced)")
end = content.find("  return (", start)
block = content[start:end]

content = content[:start] + content[end:]

last_useState = content.rfind("useState(")
insert_pos = content.find(";", last_useState) + 1

content = content[:insert_pos] + "\n" + block + content[insert_pos:]

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Moved block up.")
