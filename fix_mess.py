import re
from pathlib import Path

for path in Path('src').rglob('*.tsx'):
    content = path.read_text(encoding='utf-8')
    
    # We want to find ALL aria-label that are duplicates and remove the FIRST one 
    # Or just remove ALL aria-label="<something>" that we added at the very beginning of the tag
    
    def replacer(match):
        tag_content = match.group(0)
        # Find all aria-label attributes
        # Since the first one might contain weird characters, let's use a very generic match:
        # aria-label="[^"]*" or aria-label='[^']*'
        # Wait, if it has unescaped quotes, we can just look for ` aria-label="` and `"`
        
        # Actually, let's just use the fact that the first `aria-label` was added right after the tag name
        tag_content = re.sub(r'<([a-zA-Z0-9]+)\s+aria-label="[^"]*"\s*', r'<\1 ', tag_content)
        tag_content = re.sub(r'<([a-zA-Z0-9]+)\s+aria-label=\'[^\']*\'\s*', r'<\1 ', tag_content)
        return tag_content

    new_content = re.sub(r'<[a-zA-Z0-9]+\s+[^>]*>', replacer, content)
    
    if new_content != content:
        path.write_text(new_content, encoding='utf-8')
        print(f"Fixed {path}")

print("Done")
