import re

with open("src/App.tsx", "r") as f:
    content = f.read()

replacement = """  const handleSummarizeBill = async (billNumber: string, title: string, text: string) => {
    // Only queue task, UI will show in task manager
    const taskId = addBackgroundTask({
      type: 'bill_summary',
      title: `Bill Summary: ${billNumber}`,
      data: { bill: currentViewingBill || { billNumber, title, fullText: text } }
    });
    if (!taskId) return;

    try {
      const response = await fetch("/api/watchdog/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billNumber, title, billText: text }),
      });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      updateBackgroundTask(taskId, { status: 'complete', result: data.summary });
    } catch (err: any) {
      console.error("Failed to summarize bill", err);
      updateBackgroundTask(taskId, { status: 'error', error: "Failed to summarize bill." });
    }
  };"""

content = re.sub(r'  const handleSummarizeBill = async \(billNumber: string, title: string, text: string\) => \{[\s\S]*?  \};\n', replacement + "\n", content)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated handleSummarizeBill.")
