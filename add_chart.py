import re

with open('src/components/LocalAuditHub.tsx', 'r') as f:
    content = f.read()

# Add imports
imports = """import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
"""
content = content.replace("import {", imports + "import {", 1)

# Add widget
widget = """
                  {/* Data Visualization Widget: Spending vs Oversight */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
                    <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider font-mono mb-4 flex items-center gap-2">
                      <Activity size={14} className="text-indigo-400" />
                      Budget Allocation vs. Committee Oversight Ratings (Millions)
                    </h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { category: 'Public Works', budget: 450, oversight: 85, flagged: 15 },
                            { category: 'Law Enforcement', budget: 750, oversight: 40, flagged: 120 },
                            { category: 'Education', budget: 620, oversight: 70, flagged: 30 },
                            { category: 'Health & Human Svcs', budget: 380, oversight: 90, flagged: 10 },
                            { category: 'Zoning & Dev', budget: 210, oversight: 55, flagged: 65 },
                          ]}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="category" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px', borderRadius: '8px', color: '#f1f5f9' }}
                            itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px' }} iconType="circle" />
                          <Bar dataKey="budget" name="Total Budget ($M)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="oversight" name="Verified Oversight ($M)" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="flagged" name="Flagged / Unaudited ($M)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
"""

content = content.replace("                  {/* Officials List Cards */}", widget + "\n                  {/* Officials List Cards */}")

with open('src/components/LocalAuditHub.tsx', 'w') as f:
    f.write(content)

print("Updated LocalAuditHub.tsx with Recharts widget.")
