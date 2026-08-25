import re

with open("src/App.tsx", "r") as f:
    content = f.read()

compare_modal = """
      {/* Compare Modal Overlay */}
      {showCompareModal && compareSelection.length === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
              <h2 className="text-lg font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-indigo-400" />
                Head-to-Head Comparison
              </h2>
              <button 
                onClick={() => setShowCompareModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 relative">
                {/* Vertical Divider */}
                <div className="absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-slate-800"></div>

                {compareSelection.map((id, index) => {
                  const leg = legislators.find(l => l.legislator_id === id);
                  if (!leg) return null;
                  
                  return (
                    <div key={id} className={`flex flex-col gap-6 ${index === 0 ? 'pr-2' : 'pl-2'}`}>
                      {/* Identity */}
                      <div className="text-center space-y-1">
                        <div className="mx-auto w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-3">
                           {leg.role === 'Senator' ? <Landmark size={24} className="text-slate-400" /> : <User size={24} className="text-slate-400" />}
                        </div>
                        <h3 className="text-xl font-bold text-white">{leg.name}</h3>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{leg.role} • {leg.state} • {leg.party}</p>
                      </div>

                      {/* PAC Funding Section */}
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5 border-b border-indigo-900/40 pb-2">
                          <Coins size={12} /> Corporate PAC Funding
                        </h4>
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-semibold text-slate-400">Total Pipeline</span>
                          <span className="text-2xl font-bold text-white">${leg.aipac_funding_total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-semibold text-slate-400">PAC % of Total</span>
                          <span className="text-lg font-bold text-indigo-300">{leg.pac_percentage}%</span>
                        </div>
                      </div>

                      {/* Transparency Section */}
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 border-b border-amber-900/40 pb-2">
                          <ShieldAlert size={12} /> Transparency & Integrity
                        </h4>
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-semibold text-slate-400">Conflict Alerts</span>
                          <span className={`text-xl font-bold ${leg.conflict_triggers.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {leg.conflict_triggers.length} Active
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-semibold text-slate-400">Secret Societies</span>
                          <span className="text-lg font-bold text-amber-300">{leg.society_affiliations.length}</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
"""

content = content.replace("    </div>\n  );\n}", compare_modal + "\n    </div>\n  );\n}")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added compare modal.")
