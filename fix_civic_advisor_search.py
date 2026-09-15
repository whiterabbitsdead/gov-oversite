import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """                {/* Input box */}
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask the Civic Advisor anything..."
                    value={advisorInput}
                    onChange={(e) => setAdvisorInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAdvisorMessage()}
                    className="flex-1 h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-850 focus:border-indigo-500/70 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none"
                    disabled={advisorLoading}
                  />
                  <button
                    onClick={() => handleSendAdvisorMessage()}
                    disabled={advisorLoading || !advisorInput.trim()}
                    className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold tracking-wider uppercase transition-colors shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ask
                  </button>
                </div>"""

new_target = """                {/* Input box */}
                <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask the Civic Advisor anything..."
                    value={advisorInput}
                    onChange={(e) => setAdvisorInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAdvisorMessage()}
                    aria-label="Civic Advisor question input"
                    className="flex-1 h-12 px-4 rounded-xl bg-slate-950 border-2 border-slate-700 focus:border-indigo-500 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all"
                    disabled={advisorLoading}
                  />
                  <button
                    onClick={() => handleSendAdvisorMessage()}
                    disabled={advisorLoading || !advisorInput.trim()}
                    aria-label="Send question to Civic Advisor"
                    className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold tracking-wider uppercase transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/50 shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ask Advisor
                  </button>
                </div>"""

content = content.replace(target, new_target)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated Civic Advisor input")
