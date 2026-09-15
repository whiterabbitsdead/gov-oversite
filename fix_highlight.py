import re

with open("src/App.tsx", "r") as f:
    content = f.read()

highlight_component = """
const HighlightedBillText = ({ text }: { text: string }) => {
  if (!text) return null;
  const keywords = ['lobbyist', 'subclause', 'omnibus', 'liability shield'];
  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => {
        if (keywords.some(k => k.toLowerCase() === part.toLowerCase())) {
          return (
            <span key={i} className="bg-rose-950/60 text-rose-300 border border-rose-900/40 rounded px-1 py-0.5 font-bold mx-0.5">
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};
"""

target = """function App() {"""
if target in content and "HighlightedBillText" not in content:
    content = content.replace(target, highlight_component + "\n" + target)

target_bill = """                    {/* Content on the right */}
                    <div className="flex-1 space-y-1 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-[18px]">
                      {currentViewingBill.fullText}
                    </div>"""

replacement_bill = """                    {/* Content on the right */}
                    <div className="flex-1 space-y-1 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-[18px]">
                      {currentViewingBill.fullText && <HighlightedBillText text={currentViewingBill.fullText} />}
                    </div>"""

content = content.replace(target_bill, replacement_bill)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated")
