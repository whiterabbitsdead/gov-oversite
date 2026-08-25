import re

with open("src/App.tsx", "r") as f:
    content = f.read()

replacement = """  const handleExecuteWatchdogAnalysis = async () => {
    setAnalysisProgress(["[INFO] Task queued for background execution..."]);

    const taskId = addBackgroundTask({
      type: 'watchdog',
      title: `AI Bill Analysis`,
      data: { flags: customFlags }
    });
    if (!taskId) return;

    try {
      const response = await fetch("/api/watchdog/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customFlags }),
      });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      updateBackgroundTask(taskId, { status: 'complete', result: data.analysis });
    } catch (err: any) {
      console.error("Analysis Error:", err);
      updateBackgroundTask(taskId, { status: 'error', error: "Analysis failed." });
    }
  };"""

content = re.sub(r'  const handleExecuteWatchdogAnalysis = async \(\) => \{[\s\S]*?  \};\n', replacement + "\n", content)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated handleExecuteWatchdogAnalysis.")
