import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search representative or senator name, state, ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500/70 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>"""

new_target = """                {/* Search Bar */}
                <div className="relative flex-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      type="text"
                      placeholder="Search for a politician by name or state..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Search politicians"
                      className="w-full h-14 pl-12 pr-12 rounded-xl bg-slate-950 border-2 border-slate-700 focus:border-indigo-500 text-base text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-inner"
                    />
                    {search && (
                      <button 
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                        aria-label="Clear search text"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  <button 
                    className="h-14 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                    aria-label="Submit search"
                  >
                    <span>Search</span>
                  </button>
                </div>"""

content = content.replace(target, new_target)

target_sort = """                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                    <ArrowUpDown size={14} className="text-indigo-400" />
                    Sort By:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="h-11 px-4 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >"""

new_sort = """                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-sm text-slate-300 font-bold flex items-center gap-1.5 whitespace-nowrap">
                    <ArrowUpDown size={16} className="text-indigo-400" />
                    Sort By:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    aria-label="Sort legislators"
                    className="h-14 px-4 text-sm font-semibold rounded-xl bg-slate-950 border-2 border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/30 transition-all cursor-pointer shadow-sm"
                  >"""

content = content.replace(target_sort, new_sort)


target_buttons = """                {/* Reset and Export buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleResetFilters}
                    className="h-11 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleExportDirectoryCSV}
                    className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Download size={13} />
                    <span>Export Data</span>
                  </button>
                </div>"""

new_buttons = """                {/* Reset and Export buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleResetFilters}
                    aria-label="Reset all search filters"
                    className="h-14 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 text-sm font-bold text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-500/50"
                  >
                    <RefreshCw size={16} />
                    <span>Reset Filters</span>
                  </button>
                  <button
                    onClick={handleExportDirectoryCSV}
                    aria-label="Export data to CSV"
                    className="h-14 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-500 text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                  >
                    <Download size={16} />
                    <span>Export CSV</span>
                  </button>
                </div>"""

content = content.replace(target_buttons, new_buttons)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated search accessibility in App.tsx")
