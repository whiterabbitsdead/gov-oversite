import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Use regex to find and remove the recent searches block from Civic Advisor
pattern = re.compile(r'\s*\{\/\* Recent Searches \*\/\}\s*\{recentSearches\.length > 0 && \([\s\S]*?\)\s*\}\s*</div>\s*\)\}\s*\{\/\* NEW: CAPITOL WATCHDOG', re.MULTILINE)

content = pattern.sub(r'\n            </div>\n            )}\n            {/* NEW: CAPITOL WATCHDOG', content)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Removed misplaced recent searches")
