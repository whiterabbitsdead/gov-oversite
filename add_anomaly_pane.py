import re

with open("src/App.tsx", "r") as f:
    content = f.read()

anomaly_pane = """
                      {/* Anomaly Explanation Pane */}
                      {selectedAnomaly && pacChartView === 'individual' && (
                        <div className="mt-4 bg-slate-900 border border-indigo-900/40 rounded-xl p-4 animate-fade-in relative overflow-hidden">
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-transparent"></div>
                          <button 
                            onClick={() => setSelectedAnomaly(null)}
                            className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            <X size={14} />
                          </button>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={16} className={selectedAnomaly.type === 'spike' ? 'text-red-400' : 'text-emerald-400'} />
                            <h4 className="text-xs font-black tracking-wide text-indigo-300 uppercase">
                              AI PAC Anomaly Analysis
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono ml-auto mr-6">
                              {selectedAnomaly.legislatorName} • {selectedAnomaly.fullTerm}
                            </span>
                          </div>

                          <div className="bg-slate-950 rounded-lg p-3 border border-slate-900">
                            <div className="flex flex-wrap items-center gap-3 mb-2 border-b border-slate-800 pb-2">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${selectedAnomaly.type === 'spike' ? 'text-red-400 border-red-900/40 bg-red-950/30' : 'text-emerald-400 border-emerald-900/40 bg-emerald-950/30'}`}>
                                {selectedAnomaly.type === 'spike' ? 'High Spike' : 'Low Dip'} Detected
                              </span>
                              <span className="text-xs font-mono text-slate-300">
                                ${selectedAnomaly.pacFunding.toLocaleString()} vs ${Math.round(selectedAnomaly.avg).toLocaleString()} (5-Term Avg)
                              </span>
                            </div>
                            
                            {anomalyLoading ? (
                              <div className="flex items-center gap-2 text-indigo-400 text-xs py-2">
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Generating investigative context from historical records...</span>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-2">
                                {anomalyExplanation}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
"""

content = content.replace("                        </ResponsiveContainer>\n                      </div>", "                        </ResponsiveContainer>\n                      </div>" + anomaly_pane)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added anomaly pane.")
