import re

with open("src/components/RepresentativeCard.tsx", "r") as f:
    content = f.read()

props_replacement = """  onShowBriefing?: (legislator: Legislator) => void;
  onScanFindings?: (legislator: Legislator) => void;
  compareMode?: boolean;"""

content = content.replace("""  onShowBriefing?: (legislator: Legislator) => void;
  compareMode?: boolean;""", props_replacement)

sig_replacement = """  onShowBriefing,
  onScanFindings,
  compareMode = false,"""

content = content.replace("""  onShowBriefing,
  compareMode = false,""", sig_replacement)

button_replacement = """        {/* AI Briefing Trigger Button */}
        {onShowBriefing && (
          <button
            onClick={() => onShowBriefing(legislator)}
            className="mb-2 w-full py-2 px-3.5 bg-gradient-to-r from-slate-950/60 to-slate-900/60 hover:from-indigo-950/40 hover:to-indigo-900/40 border border-slate-800 hover:border-indigo-800/60 rounded-xl text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm font-mono tracking-wide"
          >
            <Sparkles size={11} className="text-indigo-400 animate-pulse" />
            <span>GENERATE AI BRIEFING</span>
          </button>
        )}

        {/* Committee Findings Scanner Button */}
        {onScanFindings && (
          <button
            onClick={() => onScanFindings(legislator)}
            className="mb-4 w-full py-2 px-3.5 bg-gradient-to-r from-slate-950/60 to-slate-900/60 hover:from-rose-950/40 hover:to-rose-900/40 border border-slate-800 hover:border-rose-800/60 rounded-xl text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm font-mono tracking-wide"
          >
            <Search size={11} className="text-rose-400" />
            <span>SCAN ETHICS FINDINGS</span>
          </button>
        )}"""

content = content.replace("""        {/* AI Briefing Trigger Button */}
        {onShowBriefing && (
          <button
            onClick={() => onShowBriefing(legislator)}
            className="mb-4 w-full py-2 px-3.5 bg-gradient-to-r from-slate-950/60 to-slate-900/60 hover:from-indigo-950/40 hover:to-indigo-900/40 border border-slate-800 hover:border-indigo-800/60 rounded-xl text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm font-mono tracking-wide"
          >
            <Sparkles size={11} className="text-indigo-400 animate-pulse" />
            <span>GENERATE AI BRIEFING</span>
          </button>
        )}""", button_replacement)

with open("src/components/RepresentativeCard.tsx", "w") as f:
    f.write(content)

print("Updated RepresentativeCard with scan button.")
