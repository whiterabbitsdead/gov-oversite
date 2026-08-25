with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("} from 'lucide-react';", "  CheckCircle,\n  RefreshCw\n} from 'lucide-react';")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Fixed lucide-react imports.")
