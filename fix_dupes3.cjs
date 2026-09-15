const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    // For every JSX tag
    content = content.replace(/<[a-zA-Z0-9]+([^>]*?)>/g, (match, attrs) => {
        let labels = match.match(/aria-label=(?:"[^"]*"|'[^']*')/g);
        if (labels && labels.length > 1) {
            // Keep the last one
            let keep = labels[labels.length - 1];
            // Remove all others
            let newMatch = match;
            for (let i = 0; i < labels.length - 1; i++) {
                newMatch = newMatch.replace(labels[i], '');
            }
            changed = true;
            return newMatch;
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
});

console.log("Done");
