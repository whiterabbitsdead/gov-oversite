import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add searchFocused state
target_state = "const [search, setSearch] = useState('');"
new_state = "const [search, setSearch] = useState('');\n  const [searchFocused, setSearchFocused] = useState(false);"
content = content.replace(target_state, new_state)

# Replace the input section
target_html = """                  <div className="relative flex-1">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input type="text"
                      placeholder="Search for a politician by name or state..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Search politicians"
                      className="w-full h-14 pl-12 pr-12 rounded-xl bg-slate-950 border-2 border-slate-700 focus:border-indigo-500 text-base text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-inner"
                    />
                    {search && (
                      <button onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                        aria-label="Clear search text"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>"""

new_html = """                  <div className="relative flex-1 group">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" aria-hidden="true" />
                    <input type="text"
                      placeholder="Search for a politician by name or state..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                      aria-label="Search politicians"
                      className="relative w-full h-14 pl-12 pr-12 rounded-xl bg-slate-950 border-2 border-slate-700 focus:border-indigo-500 text-base text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-inner z-10"
                    />
                    {search && (
                      <button onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 z-10"
                        aria-label="Clear search text"
                      >
                        <X size={18} />
                      </button>
                    )}
                    
                    {/* Autocomplete Dropdown */}
                    {searchFocused && search.trim().length > 0 && filteredLegislators.length > 0 && (
                      <div className="absolute left-0 top-full mt-2 w-full max-h-[300px] overflow-y-auto bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl z-50 flex flex-col p-1 animate-fade-in">
                        {filteredLegislators.slice(0, 8).map(leg => (
                          <button 
                            key={leg.legislator_id}
                            onClick={() => {
                              setSearch(leg.name);
                              setSearchFocused(false);
                            }}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 text-left hover:bg-slate-800 rounded-lg transition-colors border-b border-slate-800/50 last:border-0 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={`Select ${leg.name}`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Avatar placeholder / Icon */}
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                <span className="text-[10px] font-bold text-slate-400">{leg.party.charAt(0)}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">{leg.name}</span>
                                <span className="text-xs text-slate-400 font-medium">{leg.role} - {leg.state}</span>
                              </div>
                            </div>
                            {/* Badges / Extra info */}
                            <div className="flex gap-1.5 opacity-80 sm:opacity-100">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                leg.party === 'Democrat' ? 'bg-blue-900/30 text-blue-400' :
                                leg.party === 'Republican' ? 'bg-red-900/30 text-red-400' :
                                'bg-slate-800 text-slate-400'
                              }`}>{leg.party}</span>
                              {leg.midnight_vote_badge && (
                                <span className="px-2 py-0.5 rounded bg-amber-900/30 text-amber-400 text-[10px] font-bold">
                                  Alert
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                        {filteredLegislators.length > 8 && (
                          <div className="p-2 text-center text-xs text-slate-400 font-bold bg-slate-950/50 rounded-b-lg border-t border-slate-800">
                            +{filteredLegislators.length - 8} more results. Press Search or Enter to view all.
                          </div>
                        )}
                      </div>
                    )}
                  </div>"""

content = content.replace(target_html, new_html)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated App.tsx with autocomplete dropdown")
