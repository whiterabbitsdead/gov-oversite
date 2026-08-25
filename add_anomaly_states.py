import re

with open("src/App.tsx", "r") as f:
    content = f.read()

states_to_add = """  const [trendLegislatorId, setTrendLegislatorId] = useState<string>('M000355');
  const [pacChartView, setPacChartView] = useState<'individual' | 'comparison'>('individual');
  const [comparisonLegislatorIds, setComparisonLegislatorIds] = useState<string[]>(['M000355', 'C001098']);

  // PAC Anomaly Tooltip States
  const [selectedAnomaly, setSelectedAnomaly] = useState<{
    term: string;
    fullTerm: string;
    pacFunding: number;
    avg: number;
    type: 'spike' | 'dip';
    legislatorName: string;
  } | null>(null);
  const [anomalyExplanation, setAnomalyExplanation] = useState<string | null>(null);
  const [anomalyLoading, setAnomalyLoading] = useState(false);

  const handleAnomalyClick = async (entry: any, avg: number, legislator: Legislator) => {
    const type = entry.pacFunding > avg ? 'spike' : 'dip';
    setSelectedAnomaly({
      term: entry.term,
      fullTerm: entry.fullTerm,
      pacFunding: entry.pacFunding,
      avg,
      type,
      legislatorName: legislator.name
    });
    setAnomalyExplanation(null);
    setAnomalyLoading(true);

    try {
      const res = await fetch("/api/gemini/pac-anomaly-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legislatorName: legislator.name,
          party: legislator.party,
          state: legislator.state,
          term: entry.fullTerm,
          pacFunding: entry.pacFunding,
          averageFunding: avg,
          type
        })
      });
      const data = await res.json();
      setAnomalyExplanation(data.explanation || "No explanation returned.");
    } catch (err) {
      console.error(err);
      setAnomalyExplanation("Failed to generate AI analysis of this funding anomaly. Please try again later.");
    } finally {
      setAnomalyLoading(false);
    }
  };"""

content = content.replace(
    "  const [trendLegislatorId, setTrendLegislatorId] = useState<string>('M000355');\n  const [pacChartView, setPacChartView] = useState<'individual' | 'comparison'>('individual');\n  const [comparisonLegislatorIds, setComparisonLegislatorIds] = useState<string[]>(['M000355', 'C001098']);",
    states_to_add
)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added anomaly states and click handler.")
