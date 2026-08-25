import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Define replacement
bar_chart_replacement = """                              <Bar 
                                yAxisId="left" 
                                dataKey="pacFunding" 
                                radius={[4, 4, 0, 0]} 
                                maxBarSize={45}
                              >
                                {trendData.map((entry, index) => {
                                  const avg = trendData.reduce((sum, d) => sum + d.pacFunding, 0) / trendData.length;
                                  let fill = "#4f46e5"; // default indigo
                                  if (entry.pacFunding > avg * 1.35) {
                                    fill = "#ef4444"; // red for high spike
                                  } else if (entry.pacFunding < avg * 0.65) {
                                    fill = "#10b981"; // emerald for low dip
                                  }
                                  return <Cell key={`cell-${index}`} fill={fill} />;
                                })}
                              </Bar>"""

# Match the old Bar component
pattern = r"<Bar\s+yAxisId=\"left\"\s+dataKey=\"pacFunding\"\s+fill=\"#4f46e5\"\s+radius=\{\[4, 4, 0, 0\]\}\s+maxBarSize=\{45\}\s+/>"

content = re.sub(pattern, bar_chart_replacement, content, flags=re.MULTILINE)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated Bar chart with Cell highlights.")
