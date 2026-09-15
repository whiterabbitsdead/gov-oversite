with open("src/App.tsx", "r") as f:
    content = f.read()

import re
# Replace console.error(err) with console.warn(err.message)
content = re.sub(r'console\.error\(([^)]*err[^)]*)\)', r'console.warn(\1)', content)
content = re.sub(r'console\.error\(([^)]*error[^)]*)\)', r'console.warn(\1)', content)
content = re.sub(r'console\.error\(([^)]*e[^)]*)\)', r'console.warn(\1)', content)

# To be safe, just replace console.error entirely
content = content.replace("console.error", "console.warn")

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Updated App.tsx")
