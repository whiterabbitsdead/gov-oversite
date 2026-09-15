import re

with open("src/components/RepresentativeCard.tsx", "r") as f:
    content = f.read()

society_data = """
const SOCIETY_INFO: Record<string, { desc: string, members: string[], represents: string, link: string }> = {
  "Alfalfa Club": {
    desc: "An exclusive club in Washington, D.C., whose primary event is an annual banquet. Often seen as a gathering of the political and business elite.",
    members: ["George W. Bush", "Barack Obama", "Warren Buffett"],
    represents: "A social club for the Washington elite to network.",
    link: "https://en.wikipedia.org/wiki/Alfalfa_Club"
  },
  "Freemasonry": {
    desc: "A fraternal organization that traces its origins to the local fraternities of stonemasons.",
    members: ["George Washington", "Benjamin Franklin", "Franklin D. Roosevelt"],
    represents: "Moral and intellectual development, brotherhood, and philanthropy.",
    link: "https://en.wikipedia.org/wiki/Freemasonry"
  },
  "Phi Beta Kappa": {
    desc: "The oldest academic honor society in the United States, honoring the most outstanding arts and sciences students.",
    members: ["Bill Clinton", "Jeff Bezos", "Condoleezza Rice"],
    represents: "Academic excellence in the liberal arts and sciences.",
    link: "https://en.wikipedia.org/wiki/Phi_Beta_Kappa"
  },
  "Delta Kappa Epsilon": {
    desc: "One of the oldest North American college fraternities, known for its political connections.",
    members: ["George H.W. Bush", "Gerald Ford", "Rutherford B. Hayes"],
    represents: "The education of young men, gentlemanly conduct, and lifelong brotherhood.",
    link: "https://en.wikipedia.org/wiki/Delta_Kappa_Epsilon"
  },
  "Skull and Bones": {
    desc: "An undergraduate senior secret student society at Yale University.",
    members: ["George W. Bush", "John Kerry", "William Howard Taft"],
    represents: "Elite collegiate networking, leadership, and secrecy.",
    link: "https://en.wikipedia.org/wiki/Skull_and_Bones"
  },
  "Odd Fellows": {
    desc: "An international fraternity consisting of lodges first documented in 1730 in London.",
    members: ["Ulysses S. Grant", "Warren G. Harding", "Charles Lindbergh"],
    represents: "Altruism, charity, and fraternal fellowship.",
    link: "https://en.wikipedia.org/wiki/Odd_Fellows"
  },
  "Gridiron Club": {
    desc: "One of the oldest and most prestigious journalistic organizations in Washington, D.C.",
    members: ["Major US Journalists", "Various U.S. Presidents (as guests)"],
    represents: "Journalistic fellowship and satirical political commentary.",
    link: "https://en.wikipedia.org/wiki/Gridiron_Club"
  }
};
"""

# Insert SOCIETY_INFO before the component function
content = content.replace("export function RepresentativeCard(", society_data + "\nexport function RepresentativeCard(")

# Replace 'import { X } from "lucide-react";' if needed, X is missing in imports
content = content.replace("import {\n   DollarSign,", "import {\n   DollarSign,\n  X, ExternalLink,")

# Add state
state_code = """  const [expandedMidnight, setExpandedMidnight] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState<string | null>(null);
"""
content = content.replace("  const [expandedMidnight, setExpandedMidnight] = useState(false);", state_code)

# Update rendering of society tags
old_society_render = """              return (
                <span 
                  key={idx} 
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${sColor} flex items-center gap-1`}
                >
                  <Award size={10} />
                  {society}
                </span>
              );"""

new_society_render = """              return (
                <button 
                  key={idx} 
                  onClick={() => setSelectedSociety(society)}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${sColor} flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  <Award size={10} />
                  {society}
                </button>
              );"""
content = content.replace(old_society_render, new_society_render)

# Add society modal at the very end of the component return
end_of_return = """    </div>
  );
}"""

modal_code = """
      {/* Society Details Modal */}
      {selectedSociety && SOCIETY_INFO[selectedSociety] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedSociety(null)}>
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950">
              <h3 className="text-sm font-black text-white tracking-widest font-mono uppercase flex items-center gap-2">
                <ShieldAlert size={14} className="text-indigo-400" />
                {selectedSociety}
              </h3>
              <button 
                onClick={() => setSelectedSociety(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">What They Claim to Represent</h4>
                <p className="text-[11px] text-slate-200 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-850 font-mono">
                  {SOCIETY_INFO[selectedSociety].represents}
                </p>
              </div>
              
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Historical Context</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {SOCIETY_INFO[selectedSociety].desc}
                </p>
              </div>
              
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notable Past & Present Members</h4>
                <ul className="grid grid-cols-1 gap-2">
                  {SOCIETY_INFO[selectedSociety].members.map((member, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <User size={12} className="text-indigo-400" />
                      {member}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <a 
                href={SOCIETY_INFO[selectedSociety].link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                Learn More on Wikipedia <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"""

content = content.replace(end_of_return, modal_code)

with open("src/components/RepresentativeCard.tsx", "w") as f:
    f.write(content)

print("Updated RepresentativeCard.tsx with society modal.")
