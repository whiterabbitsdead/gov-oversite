import re
with open("src/App.tsx", "r") as f:
    content = f.read()

# I messed up the class names, let's fix them manually.
lines = content.split('\n')
for i, line in enumerate(lines):
    if "sm:h-auto" in line and "sm:max-h-[100dvh]" in line:
        line = re.sub(r'h-\[100dvh\].*sm:max-h-\[85dvh\].*sm:border', 'h-[100dvh] sm:h-auto sm:max-h-[85dvh] rounded-none sm:rounded-2xl border-0 sm:border', line)
        lines[i] = line
        
with open("src/App.tsx", "w") as f:
    f.write('\n'.join(lines))

print("Modals fixed for real.")
