import re

with open("src/App.tsx", "r") as f:
    content = f.read()

legend_replacement = """                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded bg-indigo-500 inline-block"></span>
                              Corporate PAC Funding ($)
                            </span>
                            <span className="flex items-center gap-2 text-[9px] text-slate-500">
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded bg-red-500 inline-block"></span>High Spike (>35% above avg)</span>
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded bg-emerald-500 inline-block"></span>Low Dip (>35% below avg)</span>
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span>
                            Corporate Aligned Votes (Out of 30 Key Votes)
                          </span>"""

pattern = r"                            <span className=\"flex items-center gap-1\">\n                              <span className=\"w-2 h-2 rounded bg-indigo-500 inline-block\"></span>\n                              Corporate PAC Funding \(\$\)\n                            </span>\n                            <span className=\"flex items-center gap-1\">\n                              <span className=\"w-2\.5 h-0\.5 bg-amber-400 inline-block\"></span>\n                              Corporate Aligned Votes \(Out of 30 Key Votes\)\n                            </span>"

content = re.sub(pattern, legend_replacement, content, flags=re.MULTILINE)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated legend.")
