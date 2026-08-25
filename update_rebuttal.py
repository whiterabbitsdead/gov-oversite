import re

with open("src/App.tsx", "r") as f:
    content = f.read()

replacement = """  const handleSimulateClaimAndPublish = async (legislatorId: string) => {
    if (!legislatorId) return;
    const leg = legislators.find(l => l.legislator_id === legislatorId);
    if (!leg) return;

    setOutreachStatusLog({
      status: 'dispatching',
      text: `Representative ${leg.name}'s staff is validating token & preparing statement...`
    });

    const taskId = addBackgroundTask({
      type: 'rebuttal',
      title: `Generate Rebuttal: ${leg.name}`,
      data: { legislatorId }
    });
    if (!taskId) return;

    try {
      const response = await fetch('/api/gemini/generate-rebuttal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          legislator: leg, 
          customStatement: customRedressStatement, 
          customActions: customRedressActions 
        })
      });

      if (response.ok) {
        const data = await response.json();
        updateBackgroundTask(taskId, { status: 'complete', result: data });
      } else {
        throw new Error("Failed to generate rebuttal");
      }
    } catch (err) {
      console.error(err);
      updateBackgroundTask(taskId, { status: 'error', error: "Failed to generate AI rebuttal." });
    }
  };"""

content = re.sub(r'  const handleSimulateClaimAndPublish = async \(legislatorId: string\) => \{[\s\S]*?  \};\n', replacement + "\n", content)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated handleSimulateClaimAndPublish.")
