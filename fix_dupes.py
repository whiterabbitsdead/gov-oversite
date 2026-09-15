import re
import glob

def fix_duplicates(content):
    # For every JSX element (simplistic approach: looking between < and >)
    def replacer(match):
        tag_content = match.group(0)
        # Find all aria-label attributes
        labels = re.findall(r'aria-label=(?:"[^"]*"|\'[^\']*\')', tag_content)
        if len(labels) > 1:
            # Keep the LAST one (the one I manually added before usually, or if script added it, it's first)
            # Actually, the script added it at the BEGINNING: `<input aria-label="..." aria-label="...">`
            # Let's remove the FIRST one, which the script added: `<input aria-label="Something" ... aria-label="Original">`
            # Wait, the script replaced `<input ` with `<input aria-label="label" `. So it's at the start.
            
            # Let's remove all but the last one
            first_label = labels[0]
            # Just replace the first occurrence
            tag_content = tag_content.replace(first_label + " ", "", 1)
            tag_content = tag_content.replace(first_label, "", 1)
        return tag_content
        
    return re.sub(r'<[a-zA-Z0-9]+[^>]+>', replacer, content)

for filename in glob.glob('src/**/*.tsx', recursive=True):
    with open(filename, 'r') as f:
        content = f.read()
    
    new_content = fix_duplicates(content)
    
    # Run it multiple times in case there are 3+
    new_content = fix_duplicates(new_content)
    
    if new_content != content:
        with open(filename, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filename}")

print("Done")
