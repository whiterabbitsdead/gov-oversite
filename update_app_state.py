import re

with open("src/App.tsx", "r") as f:
    content = f.read()

replacement = """  const [partyFilter, setPartyFilter] = useState<'All' | 'Democrat' | 'Republican' | 'Independent'>('All');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Representative' | 'Senator'>('All');
  const [societyFilter, setSocietyFilter] = useState<string>('All');
  const [integrityFilter, setIntegrityFilter] = useState<'All' | 'donor_contract' | 'insider_trading' | 'lobbyist_favoritism' | 'secret_litigation' | 'clean'>('All');
  const [sortBy, setSortBy] = useState<'highest_pac' | 'lowest_pac' | 'highest_transparency' | 'lowest_transparency' | 'society_count' | 'highest_alerts' | 'highest_alignment' | 'lowest_alignment'>('highest_alignment');

  // Compare Mode state
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);

  const handleToggleCompare = (legislatorId: string) => {
    setCompareSelection(prev => {
      if (prev.includes(legislatorId)) {
        return prev.filter(id => id !== legislatorId);
      }
      if (prev.length < 2) {
        return [...prev, legislatorId];
      }
      return prev;
    });
  };"""

content = content.replace("  const [partyFilter, setPartyFilter] = useState<'All' | 'Democrat' | 'Republican' | 'Independent'>('All');\n  const [roleFilter, setRoleFilter] = useState<'All' | 'Representative' | 'Senator'>('All');\n  const [societyFilter, setSocietyFilter] = useState<string>('All');\n  const [integrityFilter, setIntegrityFilter] = useState<'All' | 'donor_contract' | 'insider_trading' | 'lobbyist_favoritism' | 'secret_litigation' | 'clean'>('All');\n  const [sortBy, setSortBy] = useState<'highest_pac' | 'lowest_pac' | 'highest_transparency' | 'lowest_transparency' | 'society_count' | 'highest_alerts' | 'highest_alignment' | 'lowest_alignment'>('highest_alignment');", replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated App.tsx state.")
