import re

with open("src/App.tsx", "r") as f:
    content = f.read()

replacement = """  const handleAskCustomQuestion = async (billNumber: string, title: string, text: string, questionText: string) => {
    if (!questionText.trim()) return;
    
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
      updateBackgroundTask(taskId, { status: 'complete', result: data.answer });
    } catch (err: any) {
      console.error("Failed to query bill", err);
      updateBackgroundTask(taskId, { status: 'error', error: "Failed to query bill." });
    }
  };"""

content = re.sub(r'  const handleAskCustomQuestion = async \(billNumber: string, title: string, text: string, questionText: string\) => \{[\s\S]*?  \};\n', replacement + "\n", content)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated handleAskCustomQuestion.")
