import re

with open("src/components/LocalAuditHub.tsx", "r") as f:
    content = f.read()

target = """              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">County Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Cook, Travis, Maricopa"
                      value={countySearch}
                      onChange={(e) => setCountySearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">State Code</label>
                    <select
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                    >
                      {['AZ', 'GA', 'IL', 'TX', 'CA', 'FL', 'NY', 'OH', 'PA', 'MI', 'NC', 'VA', 'WA', 'CO', 'MA', 'TN', 'NV', 'UT'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleSearchAudit(countySearch, stateSearch)}
                  disabled={auditLoading || !countySearch.trim()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {auditLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Scraping Municipal Records...</span>
                    </>
                  ) : (
                    <>
                      <Search size={14} />
                      <span>Run Integrity Audit</span>
                    </>
                  )}
                </button>"""

new_target = """              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <label htmlFor="county-search" className="text-xs font-black uppercase text-slate-300 tracking-wider">County Name</label>
                    <input
                      id="county-search"
                      type="text"
                      placeholder="e.g. Cook, Travis, Maricopa"
                      value={countySearch}
                      onChange={(e) => setCountySearch(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="state-search" className="text-xs font-black uppercase text-slate-300 tracking-wider">State Code</label>
                    <select
                      id="state-search"
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all font-bold cursor-pointer"
                    >
                      {['AZ', 'GA', 'IL', 'TX', 'CA', 'FL', 'NY', 'OH', 'PA', 'MI', 'NC', 'VA', 'WA', 'CO', 'MA', 'TN', 'NV', 'UT'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleSearchAudit(countySearch, stateSearch)}
                  disabled={auditLoading || !countySearch.trim()}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                  aria-label="Search County Records"
                >
                  {auditLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                      <span>Scraping Municipal Records...</span>
                    </>
                  ) : (
                    <>
                      <Search size={16} aria-hidden="true" />
                      <span>Search County Records</span>
                    </>
                  )}
                </button>"""

content = content.replace(target, new_target)

with open("src/components/LocalAuditHub.tsx", "w") as f:
    f.write(content)

print("Updated search accessibility in LocalAuditHub.tsx")
