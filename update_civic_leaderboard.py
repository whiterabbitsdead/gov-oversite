with open("src/components/CivicLeaderboard.tsx", "w") as f:
    f.write("""import { useState } from 'react';
import { Legislator } from '../types';
import { Award, ShieldAlert, AlertTriangle, Download, Users } from 'lucide-react';
import { AnimatedScore } from './AnimatedScore';

interface CivicLeaderboardProps {
  legislators: Legislator[];
  calculateTransparencyIndex: (leg: Legislator) => number;
}

export function CivicLeaderboard({ legislators, calculateTransparencyIndex }: CivicLeaderboardProps) {
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);

  // Sort legislators by transparency index
  const scoredLegislators = legislators.map(leg => ({
    ...leg,
    transparencyScore: calculateTransparencyIndex(leg)
  })).sort((a, b) => b.transparencyScore - a.transparencyScore);

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

  const top10 = scoredLegislators.slice(0, 10);
  const bottom10 = [...scoredLegislators].reverse().slice(0, 10);

  const selectedLeg = selectedContextId ? scoredLegislators.find(l => l.legislator_id === selectedContextId) : null;

  const renderList = (list: typeof scoredLegislators, isTop: boolean) => (
    <div className="space-y-3">
      {list.map((leg, index) => {
        const partyBadge = leg.party === 'Democrat' 
          ? 'text-blue-400 border-blue-900/40 bg-blue-950/25' 
          : leg.party === 'Republican' 
          ? 'text-red-400 border-red-900/40 bg-red-950/25' 
          : 'text-emerald-400 border-emerald-900/40 bg-emerald-950/25';
          
        const isSelected = selectedContextId === leg.legislator_id;
        
        let peerReason = '';
        if (selectedLeg && !isSelected) {
          if (leg.state === selectedLeg.state) {
            peerReason = `Same State (${leg.state})`;
          } else if (leg.committees && selectedLeg.committees) {
            const sharedCommittee = leg.committees.find(c => selectedLeg.committees!.some(sc => sc.name === c.name));
            if (sharedCommittee) {
              // Extract a short name for the committee if possible, otherwise use full
              const shortName = sharedCommittee.name.replace("Committee on ", "").replace("the ", "").split(" ")[0];
              peerReason = `Shared Cmte (${shortName})`;
            }
          }
        }
        
        const isPeer = !!peerReason;
        const isDimmed = selectedContextId && !isSelected && !isPeer;

        let containerClass = "bg-slate-950/70 border border-slate-850 hover:border-slate-700";
        if (isSelected) {
          containerClass = "bg-indigo-950/40 border border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-900/20";
        } else if (isPeer) {
          containerClass = "bg-slate-900/80 border border-indigo-900/40 hover:border-indigo-700/60";
        } else if (isDimmed) {
          containerClass = "bg-slate-950/30 border border-slate-900/50 opacity-40 grayscale-[50%] hover:opacity-100 hover:grayscale-0";
        }

        return (
          <div 
            key={leg.legislator_id} 
            onClick={() => setSelectedContextId(isSelected ? null : leg.legislator_id)}
            className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-all duration-300 cursor-pointer ${containerClass}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${isTop ? 'bg-emerald-950/50 text-emerald-400' : 'bg-rose-950/50 text-rose-400'}`}>
                {index + 1}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">{leg.name}</h4>
                  <span className={`text-[9px] font-bold px-1.5 rounded border ${partyBadge}`}>
                    {leg.party[0]}
                  </span>
                  {isPeer && (
                    <span className="text-[8px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-900/50 flex items-center gap-1">
                      <Users size={8} />
                      {peerReason}
                    </span>
                  )}
                  {isSelected && (
                    <span className="text-[8px] font-bold uppercase tracking-wider text-white bg-indigo-600 px-1.5 py-0.5 rounded shadow">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{leg.role} • {leg.state}</p>
              </div>
            </div>
            
            <div className="text-right w-24 shrink-0">
              <div className={`text-xs font-black font-mono ${isTop ? 'text-emerald-400' : 'text-rose-400'}`}>
                <AnimatedScore value={leg.transparencyScore} /> / 100
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isTop ? 'bg-emerald-400' : 'bg-rose-400'}`} 
                  style={{ width: `${leg.transparencyScore}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-3 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2 mb-1">
            <Award className="text-indigo-400" size={18} />
            Civic Leaderboard: Transparency Index
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Click any legislator to highlight their direct peers (same state or shared committees).</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedContextId && (
            <button 
              onClick={() => setSelectedContextId(null)}
              className="text-[10px] font-bold text-slate-400 hover:text-white uppercase transition-colors px-2"
            >
              Clear Selection
            </button>
          )}
          <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-1.5 rounded-md border border-slate-800 font-bold uppercase hidden sm:inline-block">
            Dynamic Ranking
          </span>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase px-3 py-1.5 rounded-md border border-slate-700 transition-colors cursor-pointer"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldAlert size={14} />
            Top 10 Most Transparent
          </h4>
          {renderList(top10, true)}
        </div>
        
        <div>
          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle size={14} />
            Top 10 Least Transparent
          </h4>
          {renderList(bottom10, false)}
        </div>
      </div>
    </div>
  );
}
""")
