import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = r"""                  <button
                    onClick=\{handleExportDirectoryCSV\}
                    aria-label="Export data to CSV"
                    className="h-14 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-500 text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                  >
                    <Download size=\{16\} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
              \{\/\* Advanced filter criteria grid \*\/\}"""

replacement = """                  <button
                    onClick={handleExportDirectoryCSV}
                    aria-label="Export data to CSV"
                    className="h-14 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-500 text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                  >
                    <Download size={16} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Status & Recent Searches */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span aria-live="polite" className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    <span className="text-indigo-400 font-black">{filteredLegislators.length}</span> {filteredLegislators.length === 1 ? 'Legislator' : 'Legislators'} Found
                  </span>
                </div>
                
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 animate-fade-in">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={12} aria-hidden="true" />
                      Recent:
                    </span>
                    {recentSearches.map((query, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearch(query)}
                        aria-label={`Search for ${query}`}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] uppercase font-bold tracking-wider rounded transition-colors border border-slate-700 hover:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced filter criteria grid */}"""

content = re.sub(target, replacement, content)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Fixed layout")
