with open("src/App.tsx", "r") as f:
    content = f.read()

# Let's extract handleOpenTaskResult
start1 = content.find("  const handleOpenTaskResult = (task: BackgroundTask) => {")
end1 = content.find("  const [activeTab", start1)
handle_func = content[start1:end1]
content = content[:start1] + content[end1:]

# Find the LAST useState
last_useState = content.rfind("useState(")
# Find the next line after last useState
end_of_states = content.find(";", last_useState) + 1

# Insert handleOpenTaskResult after all states
content = content[:end_of_states] + "\n" + handle_func + content[end_of_states:]

# Move Background Task Manager State to the VERY top of App
start2 = content.find("  // Background Task Manager State")
end2 = content.find("  const [activeTab", start2)
if end2 == -1: # wait, activeTab is at the top now?
    end2 = content.find("  const handleRemoveFlag = (id: string) => {", start2) # Just an arbitrary end? No, the background manager ends at `removeBackgroundTask`.
end2 = content.find("  };", content.find("const removeBackgroundTask")) + 4

bg_manager = content[start2:end2]
content = content[:start2] + content[end2:]

# Insert bg manager right after export default function App() {
app_start = content.find("export default function App() {") + len("export default function App() {\n")
content = content[:app_start] + bg_manager + "\n" + content[app_start:]

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Reordered.")
