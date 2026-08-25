import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Define the new content
new_pac_section = """            {/* PAC Funding Trend & Legislative Alignment Section */}
            {dashboardTab === 'pac' && (() => {
              const trendLegislator = legislators.find(l => l.legislator_id === trendLegislatorId) || legislators[0];
              if (!trendLegislator) return null;
              
              const trendData = getPacFundingTrendData(trendLegislator);
              const latestData = trendData[trendData.length - 1];
              const earliestData = trendData[0];
              const growthPct = earliestData.pacFunding > 0 
                ? Math.round(((latestData.pacFunding - earliestData.pacFunding) / earliestData.pacFunding) * 100) 
                : 150;

              const partyBadge = trendLegislator.party === 'Democrat' 
                ? 'text-blue-400 border-blue-900/40 bg-blue-950/25' 
                : trendLegislator.party === 'Republican' 
                ? 'text-red-400 border-red-900/40 bg-red-950/25' 
                : 'text-emerald-400 border-emerald-900/40 bg-emerald-950/25';

              const comparisonLegislators = legislators.filter(l => comparisonLegislatorIds.includes(l.legislator_id));
              
              // Build comparison data
              const comparisonData = (() => {
                const terms = [
                  { name: "115th Congress (2017-18)", short: "115th" },
                  { name: "116th Congress (2019-20)", short: "116th" },
                  { name: "117th Congress (2021-22)", short: "117th" },
                  { name: "118th Congress (2023-24)", short: "118th" },
                  { name: "119th Congress (2025-26)", short: "119th" },
                ];
                return terms.map((term, index) => {
                  const dataPoint: any = { term: term.short, fullTerm: term.name };
                  comparisonLegislators.forEach(leg => {
                    const seed = leg.legislator_id.charCodeAt(0) + (leg.legislator_id.charCodeAt(1) || 0);
                    const basePAC = leg.aipac_funding_total || 50000;
                    const stepMultiplier = 0.4 + (index * 0.15) + ((seed % 10) / 100);
                    dataPoint[leg.legislator_id] = Math.round(basePAC * stepMultiplier);
                  });
                  return dataPoint;
                });
              })();

              const chartColors = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#06b6d4', '#f97316', '#8b5cf6'];

              return (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden space-y-6 animate-fade-in">
                  <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
                  
                  {/* Section Title, Description and Selectors */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-850">
                    <div className="flex-1">
                      <h3 className="text-sm font-black tracking-wider text-indigo-400 uppercase flex items-center gap-2">
                        <Activity size={14} className="text-indigo-400" />
                        PAC Funding Trend & Legislative Alignment Tracker
                      </h3>
                      <p className="text-xs text-slate-400 leading-normal mt-1">
                        Historical mapping of corporate PAC injections against key votes across the past 5 Congressional terms.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end shrink-0">
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start lg:self-end">
                        <button
                          onClick={() => setPacChartView('individual')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${pacChartView === 'individual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          Individual Detail
                        </button>
                        <button
                          onClick={() => setPacChartView('comparison')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${pacChartView === 'comparison' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          Compare Multiple
                        </button>
                      </div>

                      {pacChartView === 'individual' ? (
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Select Lawmaker:</span>
                          <select
                            value={trendLegislatorId}
                            onChange={(e) => setTrendLegislatorId(e.target.value)}
                            className="h-10 px-3 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors w-full lg:max-w-[240px]"
                          >
                            {legislators.map((l) => (
                              <option key={l.legislator_id} value={l.legislator_id}>
                                {l.name} ({l.party === 'Democrat' ? 'D' : l.party === 'Republican' ? 'R' : 'I'} - {l.state})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 w-full lg:w-auto">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Add Lawmaker:</span>
                            <select
                              value=""
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val && !comparisonLegislatorIds.includes(val)) {
                                  setComparisonLegislatorIds([...comparisonLegislatorIds, val]);
                                }
                              }}
                              className="h-10 px-3 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors w-full lg:max-w-[240px]"
                            >
                              <option value="" disabled>Select to add...</option>
                              {legislators.filter(l => !comparisonLegislatorIds.includes(l.legislator_id)).map((l) => (
                                <option key={l.legislator_id} value={l.legislator_id}>
                                  {l.name} ({l.party === 'Democrat' ? 'D' : l.party === 'Republican' ? 'R' : 'I'} - {l.state})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {pacChartView === 'comparison' && comparisonLegislators.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-2">
                      {comparisonLegislators.map((l, idx) => (
                        <div key={l.legislator_id} className="flex items-center gap-2 bg-slate-950 border border-slate-800 pl-2 pr-1 py-1 rounded-lg">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[idx % chartColors.length] }} />
                          <span className="text-xs font-semibold text-slate-300">{l.name}</span>
                          <button 
                            onClick={() => setComparisonLegislatorIds(comparisonLegislatorIds.filter(id => id !== l.legislator_id))}
                            className="text-slate-500 hover:text-red-400 ml-1 p-0.5 rounded-md hover:bg-slate-900 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {comparisonLegislators.length === 0 && (
                        <span className="text-xs text-slate-500 italic">No lawmakers selected for comparison.</span>
                      )}
                    </div>
                  )}

                  {/* Inside Layout: Statistics on Left, Recharts on Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {pacChartView === 'individual' && (
                      <div className="lg:col-span-4 flex flex-col justify-between bg-slate-950/50 border border-slate-850 p-4.5 rounded-xl space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${partyBadge}`}>
                              {trendLegislator.role} • {trendLegislator.party} • {trendLegislator.state}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-400">Total PAC Funding:</span>
                              <span className="text-sm font-bold text-white font-mono">
                                ${(trendLegislator.aipac_funding_total || 0).toLocaleString()}
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-400">Corporate Vote Index:</span>
                              <span className="text-sm font-bold text-indigo-400 font-mono">
                                {trendLegislator.corporate_vote_index}%
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-400">5-Term PAC Growth:</span>
                              <span className="text-sm font-bold text-emerald-400 font-mono">
                                +{growthPct}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Watchdog Verdict Narrative */}
                        <div className="p-3 bg-indigo-950/15 border border-indigo-900/30 rounded-lg space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <ShieldAlert size={12} className="text-indigo-400" />
                            <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">Watchdog Evaluation Verdict</span>
                          </div>
                          <p className="text-[10.5px] leading-relaxed text-slate-300">
                            {trendLegislator.corporate_vote_index > 70 ? (
                              <span>
                                <strong>{trendLegislator.name}</strong> shows a strong positive correlation between increased PAC campaign contributions and votes matching corporate interest agendas, reaching a <strong>{trendLegislator.corporate_vote_index}%</strong> alignment index in the 119th Congress.
                              </span>
                            ) : trendLegislator.corporate_vote_index < 30 ? (
                              <span>
                                <strong>{trendLegislator.name}</strong> has maintained low corporate alignment over time, resisting special-interest PAC leverage even as general campaign funding costs rise, reflecting strong grassroots commitment.
                              </span>
                            ) : (
                              <span>
                                <strong>{trendLegislator.name}</strong> displays a moderate corporate lobby alignment index of <strong>{trendLegislator.corporate_vote_index}%</strong>, indicating a selective or split pattern of support across industry sectors and PAC programs.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Right Cols: Recharts Chart */}
                    <div className={`${pacChartView === 'individual' ? 'lg:col-span-8' : 'lg:col-span-12'} bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between min-h-[300px]`}>
                      
                      {/* Chart Title / Legend Summary */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-900 pb-2 mb-4">
                        {pacChartView === 'individual' ? (
                          <>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded bg-indigo-500 inline-block"></span>
                              Corporate PAC Funding ($)
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span>
                              Corporate Aligned Votes (Out of 30 Key Votes)
                            </span>
                          </>
                        ) : (
                          <span className="flex items-center gap-1">
                            PAC Contributions Comparison ($) over 5 Terms
                          </span>
                        )}
                      </div>

                      {/* Recharts Container */}
                      <div className="flex-1 min-h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          {pacChartView === 'individual' ? (
                            <ComposedChart
                              data={trendData}
                              margin={{ top: 10, right: 10, bottom: 5, left: -10 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis 
                                dataKey="term" 
                                stroke="#64748b" 
                                fontSize={10} 
                                fontWeight="bold"
                                tickLine={false}
                              />
                              <YAxis 
                                yAxisId="left" 
                                stroke="#818cf8" 
                                fontSize={10} 
                                fontWeight="medium"
                                tickLine={false}
                                tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                              />
                              <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                stroke="#f59e0b" 
                                fontSize={10} 
                                fontWeight="medium"
                                tickLine={false}
                                domain={[0, 30]}
                              />
                              <Tooltip
                                contentStyle={{ 
                                  backgroundColor: '#0f172a', 
                                  border: '1px solid #334155', 
                                  borderRadius: '12px',
                                  padding: '10px'
                                }}
                                itemStyle={{ color: '#e2e8f0', fontSize: '11px' }}
                                labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}
                                formatter={(value: any, name: any, props: any) => {
                                  if (name === "pacFunding") {
                                    return [`$${value.toLocaleString()}`, "PAC Contributions"];
                                  }
                                  if (name === "alignedVotes") {
                                    return [`${value} of 30 (${props.payload.corporatePercentage}%)`, "Corporate Aligned Votes"];
                                  }
                                  return [value, name];
                                }}
                                labelFormatter={(label) => {
                                  const matched = trendData.find(d => d.term === label);
                                  return matched ? matched.fullTerm : label;
                                }}
                              />
                              <Bar 
                                yAxisId="left" 
                                dataKey="pacFunding" 
                                fill="#4f46e5" 
                                radius={[4, 4, 0, 0]} 
                                maxBarSize={45}
                              />
                              <Line 
                                yAxisId="right" 
                                type="monotone" 
                                dataKey="alignedVotes" 
                                stroke="#f59e0b" 
                                strokeWidth={3} 
                                dot={{ r: 5, strokeWidth: 2, fill: '#0f172a' }} 
                                activeDot={{ r: 7 }} 
                              />
                            </ComposedChart>
                          ) : (
                            <ComposedChart
                              data={comparisonData}
                              margin={{ top: 10, right: 10, bottom: 5, left: -10 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis 
                                dataKey="term" 
                                stroke="#64748b" 
                                fontSize={10} 
                                fontWeight="bold"
                                tickLine={false}
                              />
                              <YAxis 
                                stroke="#818cf8" 
                                fontSize={10} 
                                fontWeight="medium"
                                tickLine={false}
                                tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                              />
                              <Tooltip
                                contentStyle={{ 
                                  backgroundColor: '#0f172a', 
                                  border: '1px solid #334155', 
                                  borderRadius: '12px',
                                  padding: '10px'
                                }}
                                itemStyle={{ fontSize: '11px' }}
                                labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}
                                formatter={(value: any, name: any) => {
                                  const leg = comparisonLegislators.find(l => l.legislator_id === name);
                                  return [`$${value.toLocaleString()}`, leg ? leg.name : name];
                                }}
                                labelFormatter={(label) => {
                                  const matched = comparisonData.find(d => d.term === label);
                                  return matched ? matched.fullTerm : label;
                                }}
                              />
                              {comparisonLegislators.map((leg, idx) => (
                                <Line 
                                  key={leg.legislator_id}
                                  type="monotone" 
                                  dataKey={leg.legislator_id} 
                                  stroke={chartColors[idx % chartColors.length]} 
                                  strokeWidth={3} 
                                  dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }} 
                                  activeDot={{ r: 6 }} 
                                />
                              ))}
                            </ComposedChart>
                          )}
                        </ResponsiveContainer>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })()}"""

# We need to replace from '{/* PAC Funding Trend & Legislative Alignment Section */}' to the closing '})()}' before DIRECTORY & SCORECARD TAB

pattern = r"\{\/\* PAC Funding Trend & Legislative Alignment Section \*\/\}.*?\}\)\(\)\}"

new_content = re.sub(pattern, new_pac_section, content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(new_content)

print("PAC section replaced.")
