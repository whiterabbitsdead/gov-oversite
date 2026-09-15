import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# 1. Add state and helper function
state_target = """  const [searchFocused, setSearchFocused] = useState(false);"""
state_replacement = """  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const handleAddRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      setRecentSearches(prev => {
        const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
        return [trimmed, ...filtered].slice(0, 5);
      });
    }
  };"""
content = content.replace(state_target, state_replacement)


# 2. Update the Search input and Search button
# Need to replace the input to add onKeyDown for Enter
# Need to update the Search button onClick
# Need to update autocomplete click to add to recent searches

# We will target a larger block
search_block_target = """                  <div className="relative flex-1 group">
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
                  </div>
                  <button 
                    className="h-14 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                    aria-label="Submit search"
                  >
                    <span>Search</span>
                  </button>"""

search_block_replacement = """                  <div className="relative flex-1 group">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" aria-hidden="true" />
                    <input type="text"
                      placeholder="Search for a politician by name or state..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddRecentSearch(search);
                          setSearchFocused(false);
                        }
                      }}
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
                              handleAddRecentSearch(leg.name);
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
                  </div>
                  <button 
                    onClick={() => {
                      handleAddRecentSearch(search);
                      setSearchFocused(false);
                    }}
                    className="h-14 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                    aria-label="Submit search"
                  >
                    <span>Search</span>
                  </button>"""
content = content.replace(search_block_target, search_block_replacement)

# 3. Add the recent searches chips below the input area.
# The controls panel contains: <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
# Let's place it right after this flex container.

recent_searches_insertion_target = """                {/* Reset and Export buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleResetFilters}"""

recent_searches_insertion_replacement = """                {/* Reset and Export buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleResetFilters}"""

# Wait, instead of after Reset buttons, let's put it OUTSIDE the "flex flex-col lg:flex-row" container.
# So we need to match the end of that container.
# It ends with:
#                   </button>
#                 </div>
#               </div>

container_end_target = """                  </button>
                </div>
              </div>"""
              
container_end_replacement = """                  </button>
                </div>
              </div>
              
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 animate-fade-in">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={12} aria-hidden="true" />
                    Recent:
                  </span>
                  {recentSearches.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearch(query)}
                      aria-label={`Search for ${query}`}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700 hover:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              )}"""

content = content.replace(container_end_target, container_end_replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated App.tsx with recent searches")
