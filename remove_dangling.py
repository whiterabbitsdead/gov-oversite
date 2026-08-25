with open("src/App.tsx", "r") as f:
    lines = f.readlines()

new_lines = lines[:819] + lines[842:]

with open("src/App.tsx", "w") as f:
    f.writelines(new_lines)

print("Removed dangling lines.")
