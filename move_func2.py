with open("src/App.tsx", "r") as f:
    content = f.read()

start = content.find("  const handleOpenTaskResult = (task: BackgroundTask) => {")
end = content.find("  const scrollToCurrentMilestone", start)
if end == -1:
    end = content.find("  const [activeTab", start)

func = content[start:end]
content = content[:start] + content[end:]

insert_pos = content.rfind("  return (")

content = content[:insert_pos] + func + "\n" + content[insert_pos:]

# Remove duplicate RefreshCw
content = content.replace("  CheckCircle,\n  RefreshCw\n} from 'lucide-react';", "  CheckCircle\n} from 'lucide-react';")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Moved handleOpenTaskResult and removed duplicate RefreshCw.")
