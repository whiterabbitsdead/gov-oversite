import re
from pathlib import Path

def fix_duplicates(content):
    def replacer(match):
        tag_content = match.group(0)
        labels = re.findall(r'aria-label=(?:"[^"]*"|\'[^\']*\')', tag_content)
        if len(labels) > 1:
            first_label = labels[0]
            tag_content = tag_content.replace(" " + first_label, "", 1)
            tag_content = tag_content.replace(first_label + " ", "", 1)
            tag_content = tag_content.replace(first_label, "", 1)
        return tag_content
        
    return re.sub(r'<[a-zA-Z0-9]+[^>]*>', replacer, content)

for path in Path('src').rglob('*.tsx'):
    content = path.read_text(encoding='utf-8')
    new_content = fix_duplicates(content)
    new_content = fix_duplicates(new_content)
    
    if new_content != content:
        path.write_text(new_content, encoding='utf-8')
        print(f"Fixed {path}")

print("Done")
