with open("src/App.tsx", "r") as f:
    text = f.read()

open_braces = 0
in_app = False
for i, char in enumerate(text):
    if not in_app and text[i-30:i].endswith("export default function App() "):
        in_app = True
        
    if char == '{':
        open_braces += 1
    elif char == '}':
        open_braces -= 1
        if in_app and open_braces == 0:
            print(f"App closed prematurely near index {i}")
            print(text[i-100:i+100])
            break

print("Final open braces:", open_braces)
