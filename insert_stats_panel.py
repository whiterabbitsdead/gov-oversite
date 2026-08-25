import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Define the new content
stats_panel = """
                      {/* Summary Stats Panel */}
                      {(() => {
                        let absoluteVariance = 0;
                        let percentGrowth = 0;
                        let title = "Selected Time Range Growth";

                        if (pacChartView === 'individual') {
                          absoluteVariance = latestData.pacFunding - earliestData.pacFunding;
                          percentGrowth = earliestData.pacFunding > 0 ? (absoluteVariance / earliestData.pacFunding) * 100 : 0;
                          title = "5-Term Funding Variance";
                        } else if (comparisonLegislators.length > 0) {
                          let earliestTotal = 0;
                          let latestTotal = 0;
                          comparisonLegislators.forEach(leg => {
                            earliestTotal += comparisonData[0][leg.legislator_id] || 0;
                            latestTotal += comparisonData[comparisonData.length - 1][leg.legislator_id] || 0;
                          });
                          absoluteVariance = latestTotal - earliestTotal;
                          percentGrowth = earliestTotal > 0 ? (absoluteVariance / earliestTotal) * 100 : 0;
                          title = "Aggregate 5-Term Funding Variance";
                        } else {
                          return null;
                        }

                        const isPositive = absoluteVariance > 0;
                        const isNegative = absoluteVariance < 0;
                        // Match the existing styling where growth is emerald (or use indigo as a neutral primary)
                        const colorClass = isPositive ? 'text-emerald-400' : isNegative ? 'text-indigo-400' : 'text-slate-400';
                        const sign = isPositive ? '+' : '';

                        return (
                          <div className="flex items-center gap-6 mb-4 px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</div>
                              <div className="flex items-end gap-3">
                                <span className={`text-xl font-bold font-mono tracking-tight ${colorClass}`}>
                                  {sign}${Math.abs(absoluteVariance).toLocaleString()}
                                </span>
                                <div className={`flex items-center gap-1 text-sm font-bold mb-0.5 ${colorClass}`}>
                                  {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : <Minus size={14} />}
                                  <span>{sign}{percentGrowth.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
"""

# Find the insertion point
target = "                      {/* Recharts Container */}"

new_content = content.replace(target, stats_panel + target)

with open("src/App.tsx", "w") as f:
    f.write(new_content)

print("Stats panel inserted.")
