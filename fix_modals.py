with open("src/App.tsx", "r") as f:
    content = f.read()

# Fix modal wrappers
content = content.replace(
    'className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"',
    'className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"'
)

# Fix modal bodies
content = content.replace(
    'max-h-[85dvh]',
    'h-[100dvh] sm:h-auto sm:max-h-[85dvh] rounded-none sm:rounded-2xl border-0 sm:border'
)
content = content.replace(
    'h-[85dvh]',
    'h-[100dvh] sm:h-auto sm:max-h-[85dvh] rounded-none sm:rounded-2xl border-0 sm:border'
)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Modals fixed for mobile.")
