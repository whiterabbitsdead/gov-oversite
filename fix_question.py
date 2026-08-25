import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# We have duplicate code for handleAskCustomQuestion now. Let's find it.
start = content.find("  const handleAskCustomQuestion = async (billNumber: string, title: string, text: string, questionText: string) => {")
# We need to find the REAL end of this function. It's right before `return (` which is around line 1756.
end = content.find("  return (", start)

new_func = """  const handleAskCustomQuestion = async (billNumber: string, title: string, text: string, questionText: string) => {
    if (!questionText.trim()) return;
    
    setCustomQuestion("");
    
    const taskId = addBackgroundTask({
      type: 'bill_question',
      title: `Bill Q&A: ${questionText.substring(0,20)}...`,
      data: { bill: currentViewingBill || { billNumber, title, fullText: text }, summary: viewingBillSummary, question: questionText }
    });
    if (!taskId) return;

    try {
      const response = await fetch("/api/watchdog/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billNumber, title, billText: text, question: questionText }),
      });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      updateBackgroundTask(taskId, { status: 'complete', result: data.reply || data.answer });
    } catch (err: any) {
      console.error("Failed to query bill", err);
      updateBackgroundTask(taskId, { status: 'error', error: "Failed to query bill." });
    }
  };

"""

content = content[:start] + new_func + content[end:]

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Fixed handleAskCustomQuestion.")
