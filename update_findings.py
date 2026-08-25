import re

with open("src/App.tsx", "r") as f:
    content = f.read()

findings = """  const handleScanFindings = async (legislator: any) => {
    const taskId = addBackgroundTask({
      type: 'findings',
      title: `Ethics Scan: ${legislator.name}`,
      data: { legislator }
    });
    if (!taskId) return;

    try {
      const res = await fetch("/api/gemini/committee-findings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legislatorName: legislator.name,
          party: legislator.party,
          state: legislator.state,
          role: legislator.role,
          bio: legislator.bio_summary
        }),
      });
      const data = await res.json();
      updateBackgroundTask(taskId, { status: 'complete', result: data.findings || "No findings generated." });
    } catch (error) {
      console.error(error);
      updateBackgroundTask(taskId, { status: 'error', error: "Failed to retrieve committee findings. Please try again later." });
    }
  };"""

content = re.sub(r'  const handleScanFindings = async \(legislator: any\) => \{[\s\S]*?  \};\n', findings + "\n", content)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated handleScanFindings.")
