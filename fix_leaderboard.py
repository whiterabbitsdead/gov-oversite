import re

with open("src/components/CivicLeaderboard.tsx", "r") as f:
    content = f.read()

# Add Download to imports
content = content.replace("import { Award, ShieldAlert, AlertTriangle } from 'lucide-react';", "import { Award, ShieldAlert, AlertTriangle, Download } from 'lucide-react';")

# Add handleExportCSV logic
export_logic = """
  const handleExportCSV = () => {
    // Generate CSV headers
    const headers = ["Rank", "Name", "Role", "State", "Party", "Transparency Score"];
    
    // Generate CSV rows
    const rows = scoredLegislators.map((leg, index) => {
      return [
        index + 1,
        `"${leg.name}"`, // Quote name to handle commas
        `"${leg.role}"`,
        leg.state,
        leg.party,
        leg.transparencyScore
      ].join(",");
    });
    
    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows].join("\\n");
    
    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "civic_leaderboard_rankings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
"""

content = content.replace("  const top10 = scoredLegislators.slice(0, 10);", export_logic + "\n  const top10 = scoredLegislators.slice(0, 10);")

# Update header to include the export button
header_original = """      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
        <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
          <Award className="text-indigo-400" size={18} />
          Civic Leaderboard: Transparency Index
        </h3>
        <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-1 rounded-md border border-slate-800 font-bold uppercase">
          Dynamic Ranking
        </span>
      </div>"""

header_new = """      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-3 border-b border-slate-800 gap-3">
        <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
          <Award className="text-indigo-400" size={18} />
          Civic Leaderboard: Transparency Index
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-1.5 rounded-md border border-slate-800 font-bold uppercase hidden sm:inline-block">
            Dynamic Ranking
          </span>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase px-3 py-1.5 rounded-md border border-slate-700 transition-colors"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>
      </div>"""

content = content.replace(header_original, header_new)

with open("src/components/CivicLeaderboard.tsx", "w") as f:
    f.write(content)

print("Updated CivicLeaderboard.tsx")
