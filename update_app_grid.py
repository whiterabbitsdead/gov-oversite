import re

with open("src/App.tsx", "r") as f:
    content = f.read()

replacement_grid = """            {/* Representative Cards Display Grid */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-indigo-400" />
                  Congressional Representatives Index ({filteredLegislators.length} Match)
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsCompareMode(!isCompareMode);
                      if (isCompareMode) setCompareSelection([]); // Clear selection when turning off
                    }}
                    className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg border transition-colors ${isCompareMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                  >
                    Compare Mode
                  </button>
                  <p className="text-xs text-slate-400 italic">Showing structured feed state</p>
                </div>
              </div>

              {isCompareMode && (
                <div className="mb-4 bg-indigo-950/40 border border-indigo-900/50 p-3 rounded-xl flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold text-xs">Select two legislators to compare:</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 border border-slate-800">
                      {compareSelection.length} / 2 Selected
                    </span>
                  </div>
                  {compareSelection.length === 2 && (
                    <button
                      onClick={() => setShowCompareModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-colors"
                    >
                      View Comparison
                    </button>
                  )}
                </div>
              )}

              {filteredLegislators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLegislators.map((legislator) => (
                    <RepresentativeCard 
                      key={legislator.legislator_id} 
                      legislator={legislator} 
                      customFlags={customFlags} 
                      isFavorite={watchlist.includes(legislator.legislator_id)}
                      onToggleFavorite={handleToggleFavorite}
                      alignmentScore={calculateUserAlignmentScore(legislator, userPrefs)}
                      onShowBriefing={handleGenerateBriefing}
                      compareMode={isCompareMode}
                      isSelectedForCompare={compareSelection.includes(legislator.legislator_id)}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>"""

content = content.replace("""            {/* Representative Cards Display Grid */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-indigo-400" />
                  Congressional Representatives Index ({filteredLegislators.length} Match)
                </h3>
                <p className="text-xs text-slate-400 italic">Showing structured feed state</p>
              </div>

              {filteredLegislators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLegislators.map((legislator) => (
                    <RepresentativeCard 
                      key={legislator.legislator_id} 
                      legislator={legislator} 
                      customFlags={customFlags} 
                      isFavorite={watchlist.includes(legislator.legislator_id)}
                      onToggleFavorite={handleToggleFavorite}
                      alignmentScore={calculateUserAlignmentScore(legislator, userPrefs)}
                      onShowBriefing={handleGenerateBriefing}
                    />
                  ))}
                </div>""", replacement_grid)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated App.tsx grid layout.")
