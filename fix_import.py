with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("import {\n   Search,\n  ArrowLeft,", "import {\n  ArrowLeft,\n  Search,")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Fixed import")
