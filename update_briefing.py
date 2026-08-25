import re

with open("src/App.tsx", "r") as f:
    content = f.read()

briefing = """  // Generate Legislator Briefing
  const handleGenerateBriefing = async (legislator: any) => {
    const taskId = addBackgroundTask({
      type: 'briefing',
      title: `AI Briefing: ${legislator.name}`,
      data: { legislator }
    });
    if (!taskId) return;

    try {
      const response = await fetch('/api/gemini/legislator-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legislator })
      });

      if (!response.ok) {
        throw new Error('Briefing API error');
      }

      const data = await response.json();
      updateBackgroundTask(taskId, { status: 'complete', result: data.briefing || 'No briefing generated.' });
    } catch (err: any) {
      console.error(err);
      updateBackgroundTask(taskId, { status: 'error', error: '⚠️ An error occurred while generating the AI Integrity Briefing.' });
    }
  };"""

content = re.sub(r'  // Generate Legislator Briefing\n  const handleGenerateBriefing = async \(legislator: any\) => \{[\s\S]*?  \};\n', briefing + "\n", content)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated handleGenerateBriefing.")
