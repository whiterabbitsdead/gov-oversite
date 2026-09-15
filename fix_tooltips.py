import re

with open("src/App.tsx", "r") as f:
    content = f.read()

individual_tooltip_target = """                              <Tooltip
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
                              />"""

individual_tooltip_replacement = """                              <Tooltip
                                wrapperStyle={{ pointerEvents: 'auto' }}
                                content={({ active, payload, label }: any) => {
                                  if (active && payload && payload.length) {
                                    const matched = trendData.find(d => d.term === label);
                                    const fullTerm = matched ? matched.fullTerm : label;
                                    const pacFunding = payload.find((p: any) => p.dataKey === "pacFunding");
                                    const alignedVotes = payload.find((p: any) => p.dataKey === "alignedVotes");
                                    
                                    const fecSearchUrl = `https://www.fec.gov/data/receipts/?data_type=pac&candidate_name=${encodeURIComponent(trendLegislator.name)}`;

                                    return (
                                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl space-y-2 pointer-events-auto">
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">{fullTerm}</p>
                                        
                                        {pacFunding && (
                                          <div className="flex flex-col gap-1">
                                            <p className="text-xs text-slate-200 font-bold">
                                              <span className="inline-block w-2 h-2 rounded bg-indigo-500 mr-2"></span>
                                              PAC Contributions: <span className="text-indigo-400">${pacFunding.value.toLocaleString()}</span>
                                            </p>
                                            <a 
                                              href={fecSearchUrl} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="text-[9px] text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1 ml-4"
                                            >
                                              View OpenFEC Filings ↗
                                            </a>
                                          </div>
                                        )}
                                        
                                        {alignedVotes && (
                                          <p className="text-xs text-slate-200 font-bold mt-2">
                                            <span className="inline-block w-2 h-2 rounded bg-amber-500 mr-2"></span>
                                            Corporate Aligned Votes: <span className="text-amber-400">{alignedVotes.value} of 30 ({alignedVotes.payload?.corporatePercentage || 0}%)</span>
                                          </p>
                                        )}
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />"""

comparison_tooltip_target = """                              <Tooltip
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
                              />"""

comparison_tooltip_replacement = """                              <Tooltip
                                wrapperStyle={{ pointerEvents: 'auto' }}
                                content={({ active, payload, label }: any) => {
                                  if (active && payload && payload.length) {
                                    const matched = comparisonData.find(d => d.term === label);
                                    const fullTerm = matched ? matched.fullTerm : label;
                                    return (
                                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl space-y-2 pointer-events-auto max-w-[250px]">
                                        <p className="text-[10px] font-bold text-slate-400 mb-2">{fullTerm}</p>
                                        {payload.map((entry: any, index: number) => {
                                          const leg = comparisonLegislators.find(l => l.legislator_id === entry.name);
                                          const legName = leg ? leg.name : entry.name;
                                          const fecSearchUrl = `https://www.fec.gov/data/receipts/?data_type=pac&candidate_name=${encodeURIComponent(legName)}`;
                                          return (
                                            <div key={index} className="flex flex-col gap-1 mb-1">
                                              <p className="text-[11px] text-slate-200 font-bold flex items-center justify-between">
                                                <span className="flex items-center gap-1.5 truncate">
                                                  <span className="inline-block w-2 h-2 rounded shrink-0" style={{ backgroundColor: entry.color }}></span>
                                                  <span className="truncate">{legName}</span>
                                                </span>
                                                <span className="ml-2 font-mono text-white">${entry.value.toLocaleString()}</span>
                                              </p>
                                              <a 
                                                href={fecSearchUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-[9px] text-slate-400 hover:text-indigo-300 underline inline-flex items-center gap-1 ml-3.5 transition-colors"
                                              >
                                                Verify on OpenFEC ↗
                                              </a>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />"""

content = content.replace(individual_tooltip_target, individual_tooltip_replacement)
content = content.replace(comparison_tooltip_target, comparison_tooltip_replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Tooltips replaced.")
