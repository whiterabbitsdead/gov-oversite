with open("src/App.tsx", "r") as f:
    content = f.read()

start = content.find("  const handleOpenTaskResult = (task: BackgroundTask) => {")
end = content.find("  const [dashboardTab", start)

func = content[start:end]
content = content[:start] + content[end:]

# find a good place to insert it. Below all useState.
insert_pos = content.find("  // Upcoming Major Legislative Milestones")
if insert_pos == -1:
    insert_pos = content.find("  const scrollToCurrentMilestone")

content = content[:insert_pos] + func + "\n" + content[insert_pos:]

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Moved handleOpenTaskResult.")
