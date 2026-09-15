import re

with open("src/components/CivicArena.tsx", "r") as f:
    content = f.read()

target = """        <div className="relative w-full md:w-[300px]">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search debate titles or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>"""

new_target = """        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 md:w-[320px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search debates or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search debates"
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                aria-label="Clear search text"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button 
            className="h-[44px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Submit search"
          >
            Search
          </button>
        </div>"""

content = content.replace(target, new_target)

with open("src/components/CivicArena.tsx", "w") as f:
    f.write(content)

print("Updated search accessibility in CivicArena.tsx")
