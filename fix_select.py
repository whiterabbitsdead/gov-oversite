import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """                {/* Sort selector dropdown */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-sm text-slate-300 font-bold flex items-center gap-1.5 whitespace-nowrap">
                    <ArrowUpDown size={16} className="text-indigo-400" />
                    Sort By:
                  </span>
                  <select value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    aria-label="Sort legislators"
                    className="h-14 px-4 text-sm font-semibold rounded-xl bg-slate-950 border-2 border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/30 transition-all cursor-pointer shadow-sm"
                  >"""

new_target = """                {/* Sort selector dropdown */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span id="sort-by-label" className="text-sm text-slate-300 font-bold flex items-center gap-1.5 whitespace-nowrap">
                    <ArrowUpDown size={16} className="text-indigo-400" aria-hidden="true" />
                    Sort By:
                  </span>
                  <select value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    aria-label="Sort legislators directory"
                    aria-describedby="sort-by-label"
                    className="h-14 px-4 text-sm font-semibold rounded-xl bg-slate-950 border-2 border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/30 transition-all cursor-pointer shadow-sm"
                  >"""

content = content.replace(target, new_target)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("done")
