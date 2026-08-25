import re

with open("src/App.tsx", "r") as f:
    content = f.read()

anomaly = """  const handleAnomalyClick = async (entry: any, avg: number, legislator: Legislator) => {
    const type = entry.pacFunding > avg ? 'spike' : 'dip';
    
    // We add to background tasks, and we don't open the pane immediately. We wait.
    const taskId = addBackgroundTask({
      type: 'anomaly',
      title: `PAC Anomaly Analysis: ${legislator.name}`,
      data: { 
        legislatorId: legislator.legislator_id,
        type,
        anomalyArgs: {
          term: entry.term,
          fullTerm: entry.fullTerm,
          pacFunding: entry.pacFunding,
          avg,
          legislatorName: legislator.name
        }
      }
    });
    if (!taskId) return;

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
      updateBackgroundTask(taskId, { status: 'complete', result: data.explanation || "No explanation returned." });
    } catch (err) {
      console.error(err);
      updateBackgroundTask(taskId, { status: 'error', error: "Failed to generate AI analysis of this funding anomaly. Please try again later." });
    }
  };"""

content = re.sub(r'  const handleAnomalyClick = async \(entry: any, avg: number, legislator: Legislator\) => \{[\s\S]*?  \};\n', anomaly + "\n", content)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated handleAnomalyClick.")
