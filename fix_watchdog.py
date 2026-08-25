import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Replace from `const handleExecuteWatchdogAnalysis = async () => {` to the correct boundary
# Let's see lines 1622 to 1690
start_idx = content.find("  // Run Watchdog AI Analysis via Full-stack route")
end_idx = content.find("  const handleSummarizeBill = async", start_idx)

new_func = """  // Run Watchdog AI Analysis via Full-stack route
  const handleExecuteWatchdogAnalysis = async () => {
    setAnalysisProgress(["[INFO] Task queued for background execution..."]);

    const taskId = addBackgroundTask({
      type: 'watchdog',
      title: `AI Bill Analysis`,
      data: { flags: customFlags }
    });
    if (!taskId) return;

    let requestBody: any = { customFlags };
    
    if (selectedBillId === 'custom') {
      requestBody = {
        billNumber: customBillNumber,
        title: customBillTitle,
        pageCount: Number(customBillPages) || 1,
        textReleaseTime: new Date().toISOString(),
        scheduledVoteTime: new Date(Date.now() + 86400000).toISOString(),
        customText: customBillText
      };
    } else {
      const preloaded = PRELOADED_BILLS.find(b => b.id === selectedBillId);
      if (preloaded) {
        requestBody = {
          billNumber: preloaded.billNumber,
          title: preloaded.title,
          pageCount: preloaded.pageCount,
          textReleaseTime: preloaded.textReleaseTime,
          scheduledVoteTime: preloaded.scheduledVoteTime,
          customText: preloaded.summaryText
        };
      }
    }

    try {
      const response = await fetch("/api/watchdog/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      updateBackgroundTask(taskId, { status: 'complete', result: data.analysis });
    } catch (err: any) {
      console.error(err);
      updateBackgroundTask(taskId, { status: 'error', error: "Analysis failed." });
    }
  };

"""

content = content[:start_idx] + new_func + content[end_idx:]

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Fixed handleExecuteWatchdogAnalysis.")
