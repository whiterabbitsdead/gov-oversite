with open("src/App.tsx", "r") as f:
    content = f.read()

# Add function
func = """  const handleDownloadBriefing = () => {
    if (!briefingText || !activeBriefingLegislator) return;
    const blob = new Blob([briefingText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Briefing_${activeBriefingLegislator.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
"""

target = "  const scrollToCurrentMilestone = (behavior: ScrollBehavior = 'smooth') => {"
content = content.replace(target, func + "\n" + target)

# Add UI
ui_target = """              <button
                onClick={() => {
                  setActiveBriefingLegislator(null);
                  setBriefingText(null);
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-950/40 border border-slate-850 hover:border-slate-800 transition-colors font-bold font-mono text-xs cursor-pointer"
              >
                ✕
              </button>"""

ui_replacement = """              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadBriefing}
                  disabled={!briefingText}
                  className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-950/40 border border-slate-850 hover:border-slate-800 transition-colors font-bold font-mono text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={14} />
                  Download Report
                </button>
                <button
                  onClick={() => {
                    setActiveBriefingLegislator(null);
                    setBriefingText(null);
                  }}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-950/40 border border-slate-850 hover:border-slate-800 transition-colors font-bold font-mono text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>"""

content = content.replace(ui_target, ui_replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added download function and UI.")
