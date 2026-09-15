import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """                <div className="p-4 bg-slate-900/60 border-t border-slate-850 shrink-0 space-y-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder={viewingBillSummary ? "Ask about Section 4, small businesses, etc..." : "Generate AI summary first to ask questions..."}
                      disabled={!viewingBillSummary || isQueryingQuestion}
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customQuestion.trim()) {
                          handleAskCustomQuestion(
                            currentViewingBill.billNumber,
                            currentViewingBill.title,
                            currentViewingBill.fullText || "",
                            customQuestion
                          );
                        }
                      }}
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-500 rounded-xl outline-none transition-all disabled:opacity-50"
                    />
                    <button
                      disabled={!viewingBillSummary || isQueryingQuestion || !customQuestion.trim()}
                      onClick={() => {
                        handleAskCustomQuestion(
                          currentViewingBill.billNumber,
                          currentViewingBill.title,
                          currentViewingBill.fullText || "",
                          customQuestion
                        );
                      }}
                      className="absolute right-1.5 p-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:hover:text-indigo-400 transition-colors cursor-pointer"
                      title="Send Question"
                    >
                      {isQueryingQuestion ? (
                        <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={13} />
                      )}
                    </button>
                  </div>"""

new_target = """                <div className="p-4 bg-slate-900 border-t-2 border-slate-700 shrink-0 space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      placeholder={viewingBillSummary ? "Ask about Section 4, small businesses, etc..." : "Generate AI summary first to ask questions..."}
                      disabled={!viewingBillSummary || isQueryingQuestion}
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customQuestion.trim()) {
                          handleAskCustomQuestion(
                            currentViewingBill.billNumber,
                            currentViewingBill.title,
                            currentViewingBill.fullText || "",
                            customQuestion
                          );
                        }
                      }}
                      aria-label="Ask a question about this bill"
                      className="flex-1 px-4 py-3 bg-slate-950 border-2 border-slate-700 focus:border-indigo-500 text-sm text-slate-200 placeholder-slate-400 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all disabled:opacity-50"
                    />
                    <button
                      disabled={!viewingBillSummary || isQueryingQuestion || !customQuestion.trim()}
                      onClick={() => {
                        handleAskCustomQuestion(
                          currentViewingBill.billNumber,
                          currentViewingBill.title,
                          currentViewingBill.fullText || "",
                          customQuestion
                        );
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm rounded-xl transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/50 flex items-center justify-center gap-2 cursor-pointer"
                      aria-label="Send Question"
                    >
                      {isQueryingQuestion ? (
                        <>
                          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} aria-hidden="true" />
                          <span>Ask Question</span>
                        </>
                      )}
                    </button>
                  </div>"""

content = content.replace(target, new_target)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated Watchdog custom question input")
