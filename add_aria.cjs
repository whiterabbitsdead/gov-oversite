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
    
    // Inputs
    content = content.replace(/<input\s+([^>]*?)>/g, (match, attrs) => {
        if (attrs.includes('aria-label') || attrs.includes('type="radio"') || attrs.includes('type="checkbox"')) return match;
        
        let label = 'Input field';
        let placeholderMatch = attrs.match(/placeholder="([^"]+)"/);
        if (placeholderMatch) {
            label = placeholderMatch[1].replace(/"/g, "'");
        } else {
            let nameMatch = attrs.match(/name="([^"]+)"/);
            if (nameMatch) label = nameMatch[1];
        }
        changed = true;
        return `<input aria-label="${label}" ${attrs}>`;
    });

    // Textareas
    content = content.replace(/<textarea\s+([^>]*?)>/g, (match, attrs) => {
        if (attrs.includes('aria-label')) return match;
        let label = 'Text area';
        let placeholderMatch = attrs.match(/placeholder="([^"]+)"/);
        if (placeholderMatch) label = placeholderMatch[1].replace(/"/g, "'");
        changed = true;
        return `<textarea aria-label="${label}" ${attrs}>`;
    });

    // Selects
    content = content.replace(/<select\s+([^>]*?)>/g, (match, attrs) => {
        if (attrs.includes('aria-label')) return match;
        let label = 'Dropdown menu';
        let valMatch = attrs.match(/value=\{([^}]+)\}/);
        if (valMatch) {
            label = "Select " + valMatch[1].replace(/([A-Z])/g, ' $1').trim();
        }
        changed = true;
        return `<select aria-label="${label}" ${attrs}>`;
    });

    // Buttons
    content = content.replace(/<button([\s\S]*?)>([\s\S]*?)<\/button>/g, (match, attrs, inner) => {
        if (attrs.includes('aria-label')) return match;
        
        let label = 'Button';
        // Remove nested tags and JS expressions to get raw text
        let textMatch = inner.replace(/<[^>]+>/g, '').replace(/\{[^}]+\}/g, '').trim();
        if (textMatch) {
            label = textMatch.replace(/\s+/g, ' ').substring(0, 50).replace(/"/g, "'");
        } else {
            // Icon only button
            let titleMatch = attrs.match(/title="([^"]+)"/);
            if (titleMatch) label = titleMatch[1];
            else if (inner.includes('Arrow')) label = "Arrow button";
            else if (inner.includes('Close') || inner.includes('X ')) label = "Close button";
            else if (inner.includes('Search')) label = "Search button";
            else if (inner.includes('Refresh')) label = "Refresh button";
            else if (inner.includes('Filter')) label = "Filter button";
            else if (inner.includes('Chevron') || inner.includes('Toggle')) label = "Toggle button";
            else if (inner.includes('Heart')) label = "Like button";
            else if (inner.includes('MessageCircle') || inner.includes('Reply')) label = "Comment button";
            else if (attrs.includes('onClick')) {
                let oc = attrs.match(/onClick=\{([^}]+)\}/);
                if (oc) {
                    if (oc[1].includes('set')) label = "Toggle " + oc[1].substring(oc[1].indexOf('set')+3, oc[1].indexOf('(')).replace(/"/g, "'");
                    else label = "Action button";
                }
            }
        }
        
        // ensure aria-label doesn't contain breaking quotes
        label = label.replace(/"/g, "'");
        
        changed = true;
        return `<button aria-label="${label}"${attrs}>${inner}</button>`;
    });

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});

console.log("Done");
