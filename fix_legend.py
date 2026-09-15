import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """                            <span className="flex items-center gap-2 text-[9px] text-slate-500">
                              <button aria-label="setShowSpikes(!showSpikes)} className=`} > High Sp"
                                 onClick={() => setShowSpikes(!showSpikes)}
                                className={`flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80 ${showSpikes ? 'opacity-100' : 'opacity-40 grayscale'}`}
                              >
                                <span className="w-1.5 h-1.5 rounded bg-red-500 inline-block"></span>
                                High Spike (&gt;35% above avg)
                              </button>
                              <button aria-label="setShowDips(!showDips)} className=`} > Low Dip (&g"
                                 onClick={() => setShowDips(!showDips)}
                                className={`flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80 ${showDips ? 'opacity-100' : 'opacity-40 grayscale'}`}
                              >
                                <span className="w-1.5 h-1.5 rounded bg-emerald-500 inline-block"></span>
                                Low Dip (&gt;35% below avg)
                              </button>
                            </span>"""

new_target = """                            <span className="flex items-center gap-2 text-[9px] text-slate-500 relative">
                              <button aria-label="Toggle High Spikes"
                                 onClick={() => setShowSpikes(!showSpikes)}
                                className={`flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80 ${showSpikes ? 'opacity-100' : 'opacity-40 grayscale'}`}
                              >
                                <span className="w-1.5 h-1.5 rounded bg-red-500 inline-block"></span>
                                High Spike (&gt;35% above avg)
                              </button>
                              <button aria-label="Toggle Low Dips"
                                 onClick={() => setShowDips(!showDips)}
                                className={`flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80 ${showDips ? 'opacity-100' : 'opacity-40 grayscale'}`}
                              >
                                <span className="w-1.5 h-1.5 rounded bg-emerald-500 inline-block"></span>
                                Low Dip (&gt;35% below avg)
                              </button>

                              {/* Hover Legend / Help Tooltip */}
                              <div className="flex items-center gap-1 text-slate-400 cursor-help relative ml-2 group/tooltip" aria-label="Threshold Indicators Legend">
                                <HelpCircle size={12} />
                                <span className="underline decoration-slate-600 underline-offset-2">Legend</span>
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-800 border border-slate-700 text-slate-200 p-3 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-[10px] leading-relaxed pointer-events-none">
                                  <strong className="text-white block mb-1">Threshold Indicators</strong>
                                  <span className="text-red-400 font-bold">Red Spike:</span> PAC funding is &gt;35% above this lawmaker's 5-term average.<br/>
                                  <span className="text-emerald-400 font-bold mt-1 block">Emerald Dip:</span> PAC funding dropped &gt;35% below their 5-term average.<br/>
                                  <em className="text-slate-400 block mt-2 border-t border-slate-700 pt-1">Used to identify potentially anomalous cash injections correlated with voting shifts.</em>
                                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-slate-700"></div>
                                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[-1px] w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-slate-800"></div>
                                </div>
                              </div>
                            </span>"""

content = content.replace(target, new_target)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added legend to App.tsx")
