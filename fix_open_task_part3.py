with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("setRepRebuttalStatement(", "setCustomRedressStatement(")
content = content.replace("setRepRebuttalActions(", "setCustomRedressActions(")

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Fixed rebuttal setters.")
