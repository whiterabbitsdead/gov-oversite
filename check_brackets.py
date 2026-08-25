with open("src/App.tsx", "r") as f:
    text = f.read()

open_braces = 0
for i, char in enumerate(text):
    if char == '{':
        open_braces += 1
    elif char == '}':
        open_braces -= 1
        if open_braces < 0:
            print(f"Extra closing brace found near index {i}")
            print(text[i-100:i+100])
            break

print("Final open braces:", open_braces)
