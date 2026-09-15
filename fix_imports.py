with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("  CheckCircle\n} from 'lucide-react';", "  CheckCircle,\n  Download\n} from 'lucide-react';")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Imports updated.")
