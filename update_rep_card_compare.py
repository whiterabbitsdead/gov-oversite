import re

with open("src/components/RepresentativeCard.tsx", "r") as f:
    content = f.read()

replacement = """        {/* Top Header Row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2.5">
            {compareMode && (
              <div className="mr-2">
                <input 
                  type="checkbox" 
                  checked={isSelectedForCompare} 
                  onChange={() => onToggleCompare && onToggleCompare(legislator.legislator_id)}
                  className="w-4 h-4 cursor-pointer accent-indigo-500 rounded border-slate-700 bg-slate-900"
                />
              </div>
            )}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-slate-850 border border-slate-800 text-slate-300`}>"""

content = content.replace("""        {/* Top Header Row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-slate-850 border border-slate-800 text-slate-300`}>""", replacement)

with open("src/components/RepresentativeCard.tsx", "w") as f:
    f.write(content)

print("Updated RepresentativeCard with checkbox.")
