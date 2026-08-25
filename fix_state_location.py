with open("src/App.tsx", "r") as f:
    content = f.read()

start = content.find("  const handleOpenTaskResult = (task: BackgroundTask) => {")
end = content.find("  return (", start)

block = content[start:end]
content = content[:start] + content[end:]

insert_pos = content.find("  // Background Task Manager State")
if insert_pos != -1:
    content = content[:insert_pos] + block + "\n" + content[insert_pos:]
else:
    print("Could not find Background Task Manager State")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Moved state block back to the top.")
