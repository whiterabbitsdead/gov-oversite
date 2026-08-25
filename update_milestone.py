import re

with open("src/App.tsx", "r") as f:
    content = f.read()

replacement = """  const handleGenerateMilestonePlan = async (milestoneId: string) => {
    const milestone = legislativeMilestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const taskId = addBackgroundTask({
      type: 'milestone',
      title: `Action Plan: ${milestone.title}`,
      data: { milestoneId }
    });
    if (!taskId) return;

    try {
      const response = await fetch('/api/gemini/generate-milestone-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestone })
      });
      if (response.ok) {
        const data = await response.json();
        updateBackgroundTask(taskId, { status: 'complete', result: data.plan });
      } else {
        throw new Error('Failed to generate milestone plan');
      }
    } catch (err) {
      console.error(err);
      updateBackgroundTask(taskId, { status: 'error', error: '⚠️ Could not generate plan.' });
    }
  };"""

content = re.sub(r'  const handleGenerateMilestonePlan = async \(milestoneId: string\) => \{[\s\S]*?  \};\n', replacement + "\n", content)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated handleGenerateMilestonePlan.")
