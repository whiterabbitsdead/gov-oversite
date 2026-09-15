import re
with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("import { ArrowLeft, ", "import { ")
content = content.replace("import { ArrowLeft,\n", "import {\n")

with open("src/App.tsx", "w") as f:
    f.write(content)
