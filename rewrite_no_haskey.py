import re

with open("server.ts", "r") as f:
    content = f.read()

# Replace all !hasKey blocks that return JSON with mock data
# to instead return a 400 error about missing key.
# We will just write a regex that catches `if (!hasKey) { ... return res.json({ ... }); }`
# Wait, it's easier to just do it via regex carefully or parse.

# Let's see the structure:
# if (!hasKey) {
#   return res.json({
#     ...
#   });
# }

def replace_haskey(match):
    return 'if (!hasKey) { return res.status(400).json({ error: "Gemini API key is not configured. Please add it in the settings." }); }'

# It might be safer to replace the specific hardcoded strings.
content = re.sub(r'if \(!hasKey\) \{[\s\S]*?GEMINI_API_KEY is not configured[\s\S]*?return res\.json\([\s\S]*?\}\);?\s*\}', replace_haskey, content)
content = re.sub(r'if \(!hasKey\) \{[\s\S]*?This is a pre-simulated fallback[\s\S]*?return res\.json\([\s\S]*?\}\);?\s*\}', replace_haskey, content)
content = re.sub(r'if \(!hasKey\) \{[\s\S]*?const standardStatement[\s\S]*?return res\.json\([\s\S]*?\}\);?\s*\}', replace_haskey, content)
content = re.sub(r'if \(!hasKey\) \{[\s\S]*?const fallbacks: Record<string[\s\S]*?return res\.json\([\s\S]*?\}\);?\s*\}', replace_haskey, content)
content = re.sub(r'if \(!hasKey\) \{[\s\S]*?usingDemoFallback: true[\s\S]*?return res\.json\([\s\S]*?\}\);?\s*\}', replace_haskey, content)
content = re.sub(r'if \(!hasKey\) \{[\s\S]*?Smart local generator fallback[\s\S]*?return res\.json\([\s\S]*?\}\);?\s*\}', replace_haskey, content)

with open("server.ts", "w") as f:
    f.write(content)

print("Rewrote !hasKey blocks")
