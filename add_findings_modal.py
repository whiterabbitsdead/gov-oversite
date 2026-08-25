import re

with open("src/App.tsx", "r") as f:
    content = f.read()

modal = """
      {/* Committee Findings Modal Overlay */}
      {activeFindingsLegislator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-950/50 border border-rose-900/50 text-rose-400">
                  <Search size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-none">
                    Ethics & Committee Findings Scan
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase font-semibold tracking-wider">
                    {activeFindingsLegislator.name} • {activeFindingsLegislator.party} {activeFindingsLegislator.role} ({activeFindingsLegislator.state})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveFindingsLegislator(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-950/50">
              {findingsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-rose-900/40 rounded-full"></div>
                    <div className="w-12 h-12 border-4 border-rose-500 rounded-full border-t-transparent animate-spin absolute inset-0"></div>
                  </div>
                  <p className="text-sm font-bold tracking-widest uppercase text-rose-400 animate-pulse">
                    Scanning public records & committee findings...
                  </p>
                  <p className="text-xs text-slate-500 font-mono">This involves AI investigation of historical controversies.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Results Panel */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                    <h4 className="text-xs font-black uppercase text-rose-400 tracking-wider mb-4 flex items-center gap-2">
                      <ShieldAlert size={14} /> AI Investigative Report
                    </h4>
                    
                    <div className="text-sm text-slate-300 leading-relaxed font-sans space-y-4">
                      {findingsText ? (
                         findingsText.split('\\n\\n').map((paragraph, i) => (
                           <p key={i}>{paragraph}</p>
                         ))
                      ) : (
                        <p className="text-slate-500 italic">No report available.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Disclaimer */}
                  <div className="bg-slate-950 border border-rose-900/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed text-slate-400 font-mono">
                      <strong>AI SYNTHESIZED REPORT:</strong> This summary is generated dynamically by an AI agent using public records and internet history. It does not reflect a legal verdict or guarantee perfect factual accuracy. Consult primary investigative journalism or official committee publications for verified details.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
"""

content = content.replace("      {/* AI Legislator Briefing Modal Overlay */}", modal + "\n      {/* AI Legislator Briefing Modal Overlay */}")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added findings modal to App.tsx")
