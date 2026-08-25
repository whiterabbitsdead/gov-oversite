with open("src/App.tsx", "r") as f:
    lines = f.readlines()

open_braces = 0
for line_no, line in enumerate(lines):
    # a crude count that ignores strings/comments, but will give a hint
    for char in line:
        if char == '{':
            open_braces += 1
        elif char == '}':
            open_braces -= 1
    if open_braces == 0 and line_no > 100 and line_no < len(lines)-5:
        print(f"Hits 0 at line {line_no + 1}")

