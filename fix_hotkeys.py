import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add useEffect for hotkeys
# First find imports to make sure useEffect is there (it is, since useState is)
target_import = "import { useState, useMemo"
replacement_import = "import { useState, useMemo, useEffect, useRef"
if target_import in content:
    content = content.replace(target_import, replacement_import)
else:
    # If not found, let's just do a blanket replace or hope useRef is already there. Wait, we can just use document.getElementById instead of refs for simplicity.
    pass

# We will use document.getElementById for hotkeys to avoid dealing with refs in a massive component.
# Let's add the hotkey listener in a useEffect inside the App component.
target_state = "const [search, setSearch] = useState('');"
replacement_state = """const [search, setSearch] = useState('');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      
      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('directory-search-input')?.focus();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        document.getElementById('directory-sort-select')?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);"""
content = content.replace(target_state, replacement_state)

# 1. Update search input to have an id and the visual hint
search_input_target = """                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" aria-hidden="true" />
                    <input type="text"
                      placeholder="Search for a politician by name or state..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}"""

search_input_replacement = """                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" aria-hidden="true" />
                    <input 
                      id="directory-search-input"
                      type="text"
                      placeholder="Search for a politician by name or state..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}"""
                      
content = content.replace(search_input_target, search_input_replacement)

# Add keyboard hint to search input
search_clear_target = """                    {search && (
                      <button onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 z-10"
                        aria-label="Clear search text"
                      >
                        <X size={18} />
                      </button>
                    )}"""
search_clear_replacement = """                    {!search && !searchFocused && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1 opacity-50 z-10">
                        <kbd className="font-mono text-[10px] bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-400 font-bold">/</kbd>
                      </div>
                    )}
                    {search && (
                      <button onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 z-10"
                        aria-label="Clear search text"
                      >
                        <X size={18} />
                      </button>
                    )}"""
content = content.replace(search_clear_target, search_clear_replacement)

# 2. Update sort dropdown to have an id and the visual hint
sort_target = """                  <span id="sort-by-label" className="text-sm text-slate-300 font-bold flex items-center gap-1.5 whitespace-nowrap">
                    <ArrowUpDown size={16} className="text-indigo-400" aria-hidden="true" />
                    Sort By:
                  </span>
                  <select value={sortBy}"""
                  
sort_replacement = """                  <div className="flex flex-col gap-0.5">
                    <span id="sort-by-label" className="text-sm text-slate-300 font-bold flex items-center gap-1.5 whitespace-nowrap">
                      <ArrowUpDown size={16} className="text-indigo-400" aria-hidden="true" />
                      Sort By:
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono hidden sm:block">Press <kbd className="bg-slate-800 border border-slate-700 rounded px-1 text-slate-400 font-bold">s</kbd></span>
                  </div>
                  <select 
                    id="directory-sort-select"
                    value={sortBy}"""
                    
content = content.replace(sort_target, sort_replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added hotkeys and visual hints")
