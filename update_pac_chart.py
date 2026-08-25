import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add states
state_insertion = """  const [trendLegislatorId, setTrendLegislatorId] = useState<string>('M000355');
  const [pacChartView, setPacChartView] = useState<'individual' | 'comparison'>('individual');
  const [comparisonLegislatorIds, setComparisonLegislatorIds] = useState<string[]>(['M000355', 'C001098']);"""

content = re.sub(r"  const \[trendLegislatorId, setTrendLegislatorId\] = useState<string>\('M000355'\);", state_insertion, content)

with open("src/App.tsx", "w") as f:
    f.write(content)

