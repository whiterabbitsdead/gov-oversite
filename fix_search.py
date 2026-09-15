import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# 1. Update the state definition
target_state = "const [sortBy, setSortBy] = useState<'highest_pac' | 'lowest_pac' | 'highest_transparency' | 'lowest_transparency' | 'society_count' | 'highest_alerts' | 'highest_alignment' | 'lowest_alignment'>('highest_alignment');"
new_state = "const [sortBy, setSortBy] = useState<'highest_pac' | 'lowest_pac' | 'highest_transparency' | 'lowest_transparency' | 'society_count' | 'highest_alerts' | 'highest_alignment' | 'lowest_alignment' | 'date_newest' | 'relevance'>('highest_alignment');"
content = content.replace(target_state, new_state)

# 2. Add options to the dropdown and the ID to the container
target_html = """            {/* Controls panel (Search & Filtering System) */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-5">
              
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">"""

new_html = """            {/* Controls panel (Search & Filtering System) */}
            <div id="search-controls-anchor" className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-5">
              
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">"""
content = content.replace(target_html, new_html)

target_options = """                    <option value="highest_alerts">🚨 Most Active Integrity Alerts</option>
                    <option value="society_count">👁️ Secret Society Members</option>
                  </select>"""

new_options = """                    <option value="highest_alerts">🚨 Most Active Integrity Alerts</option>
                    <option value="society_count">👁️ Secret Society Members</option>
                    <option value="date_newest">📅 Sort by Date</option>
                    <option value="relevance">🔍 Sort by Relevance</option>
                  </select>"""
content = content.replace(target_options, new_options)

# 3. Add actual sorting logic, as it seems to be missing!
target_filter = """  const filteredLegislators = legislators.filter(leg => {
    if (search && !leg.name.toLowerCase().includes(search.toLowerCase()) && !leg.state.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });"""

new_filter = """  const filteredLegislators = legislators.filter(leg => {
    if (search && !leg.name.toLowerCase().includes(search.toLowerCase()) && !leg.state.toLowerCase().includes(search.toLowerCase()) && !leg.legislator_id.toLowerCase().includes(search.toLowerCase())) return false;
    if (partyFilter !== 'All' && leg.party !== partyFilter) return false;
    if (roleFilter !== 'All' && leg.role !== roleFilter) return false;
    if (societyFilter !== 'All' && !(leg.society_affiliations || []).includes(societyFilter)) return false;
    if (integrityFilter !== 'All') {
      if (integrityFilter === 'clean' && (leg.conflict_triggers || []).length > 0) return false;
      if (integrityFilter !== 'clean' && !(leg.conflict_triggers || []).some(t => t.type === integrityFilter)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'highest_pac') return (b.aipac_funding_total || 0) - (a.aipac_funding_total || 0);
    if (sortBy === 'lowest_pac') return (a.aipac_funding_total || 0) - (b.aipac_funding_total || 0);
    if (sortBy === 'highest_transparency') return calculateTransparencyIndex(b) - calculateTransparencyIndex(a);
    if (sortBy === 'lowest_transparency') return calculateTransparencyIndex(a) - calculateTransparencyIndex(b);
    if (sortBy === 'society_count') return (b.society_affiliations?.length || 0) - (a.society_affiliations?.length || 0);
    if (sortBy === 'highest_alerts') return (b.conflict_triggers?.length || 0) - (a.conflict_triggers?.length || 0);
    if (sortBy === 'highest_alignment') return (a.corporate_vote_index || 0) - (b.corporate_vote_index || 0); // lower index = higher grassroots alignment
    if (sortBy === 'lowest_alignment') return (b.corporate_vote_index || 0) - (a.corporate_vote_index || 0);
    if (sortBy === 'date_newest') return (b.legislator_id || '').localeCompare(a.legislator_id || ''); // Proxy for date
    if (sortBy === 'relevance') {
      if (search) {
         const aName = a.name.toLowerCase().includes(search.toLowerCase());
         const bName = b.name.toLowerCase().includes(search.toLowerCase());
         if (aName && !bName) return -1;
         if (!aName && bName) return 1;
      }
      return 0; // Default
    }
    return 0;
  });"""
content = content.replace(target_filter, new_filter)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated search sorting and anchor")
