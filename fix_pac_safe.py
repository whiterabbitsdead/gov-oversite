import sys

with open("src/App.tsx", "r") as f:
    content = f.read()

# 1. Add state variable
target_state = "const [trendLegislatorId, setTrendLegislatorId] = useState<string>('M000355');"
new_state = target_state + "\\n  const [trendTermFilter, setTrendTermFilter] = useState<string>('All');"
content = content.replace(target_state, new_state)

# 2. Filter trendData and comparisonData
target_trend_data = """              const trendData = getPacFundingTrendData(trendLegislator);
              const latestData = trendData[trendData.length - 1];
              const earliestData = trendData[0];"""
new_trend_data = """              const fullTrendData = getPacFundingTrendData(trendLegislator);
              const trendData = trendTermFilter === 'All' ? fullTrendData : fullTrendData.filter(d => d.term === trendTermFilter);
              
              const latestData = trendData.length > 0 ? trendData[trendData.length - 1] : fullTrendData[fullTrendData.length - 1];
              const earliestData = trendData.length > 0 ? trendData[0] : fullTrendData[0];"""
content = content.replace(target_trend_data, new_trend_data)

target_comparison = """                return terms.map((term, index) => {
                  const dataPoint: any = { term: term.short, fullTerm: term.name };
                  comparisonLegislators.forEach(leg => {
                    const seed = leg.legislator_id.charCodeAt(0) + (leg.legislator_id.charCodeAt(1) || 0);
                    const basePAC = leg.aipac_funding_total || 50000;
                    const stepMultiplier = 0.4 + (index * 0.15) + ((seed % 10) / 100);
                    dataPoint[leg.legislator_id] = Math.round(basePAC * stepMultiplier);
                  });
                  return dataPoint;
                });
              })();"""
new_comparison = """                return terms.map((term, index) => {
                  const dataPoint: any = { term: term.short, fullTerm: term.name };
                  comparisonLegislators.forEach(leg => {
                    const seed = leg.legislator_id.charCodeAt(0) + (leg.legislator_id.charCodeAt(1) || 0);
                    const basePAC = leg.aipac_funding_total || 50000;
                    const stepMultiplier = 0.4 + (index * 0.15) + ((seed % 10) / 100);
                    dataPoint[leg.legislator_id] = Math.round(basePAC * stepMultiplier);
                  });
                  return dataPoint;
                }).filter(d => trendTermFilter === 'All' ? true : d.term === trendTermFilter);
              })();"""
content = content.replace(target_comparison, new_comparison)

# 3. Add UI selector for trendTermFilter
target_ui = """                      )}
                    </div>
                  </div>

                  {pacChartView === 'comparison' && comparisonLegislators.length > 0 && ("""
new_ui = """                      )}
                    </div>
                    
                    {/* Date-range Term Selector */}
                    <div className="flex items-center gap-3 w-full lg:w-auto mt-3 lg:mt-0 lg:ml-4">
                      <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Filter Term:</span>
                      <select
                        value={trendTermFilter}
                        onChange={(e) => setTrendTermFilter(e.target.value)}
                        className="h-10 px-3 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors w-full lg:w-[140px]"
                      >
                        <option value="All">Aggregate History</option>
                        <option value="115th">115th Congress</option>
                        <option value="116th">116th Congress</option>
                        <option value="117th">117th Congress</option>
                        <option value="118th">118th Congress</option>
                        <option value="119th">119th Congress</option>
                      </select>
                    </div>

                  </div>

                  {pacChartView === 'comparison' && comparisonLegislators.length > 0 && ("""
content = content.replace(target_ui, new_ui)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Safely updated App.tsx")
