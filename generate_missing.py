with open("src/App.tsx", "r") as f:
    content = f.read()

missing_code = """
  // Reconstructed Missing Logic
  const calculateTransparencyIndex = (leg: Legislator) => {
    let score = leg.transparency_score;
    if (leg.outreach_status === 'verified') score += 15;
    if (leg.ethics_flags > 0) score -= leg.ethics_flags * 5;
    return Math.max(0, Math.min(100, score));
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const uniqueSocieties = Array.from(new Set(legislators.map(l => l.secret_society_affiliations).flat())).filter(Boolean);

  const handleResetFilters = () => {
    setSearch('');
    // reset other filters if any
  };

  const handleToggleCompare = (id: string) => {
    setCompareSelection(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const filteredLegislators = legislators.filter(leg => {
    if (search && !leg.name.toLowerCase().includes(search.toLowerCase()) && !leg.state.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    totalPacMoney: filteredLegislators.reduce((sum, leg) => sum + leg.total_pac_money, 0),
    avgTransparency: filteredLegislators.length > 0 ? filteredLegislators.reduce((sum, leg) => sum + leg.transparency_score, 0) / filteredLegislators.length : 0,
    totalFlags: filteredLegislators.reduce((sum, leg) => sum + leg.ethics_flags, 0),
    avgCorporate: filteredLegislators.length > 0 ? filteredLegislators.reduce((sum, leg) => sum + leg.corporate_backing_pct, 0) / filteredLegislators.length : 0
  };

  const handleSummarizeBill = async (billNumber: string, title: string, text: string) => {
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
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      updateBackgroundTask(taskId, { status: 'complete', result: data.summary });
    } catch (err) {
      updateBackgroundTask(taskId, { status: 'error', error: "Failed to summarize bill." });
    }
  };

  const handleAskCustomQuestion = async (billNumber: string, title: string, text: string, questionText: string) => {
    if (!questionText.trim()) return;
    setCustomQuestion("");
    const taskId = addBackgroundTask({
      type: 'bill_question',
      title: `Bill Q&A: ${questionText.substring(0,20)}...`,
      data: { bill: currentViewingBill || { billNumber, title, fullText: text }, summary: viewingBillSummary, question: questionText }
    });
    if (!taskId) return;

    try {
      const response = await fetch("/api/watchdog/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billNumber, title, billText: text, summary: viewingBillSummary, question: questionText }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      updateBackgroundTask(taskId, { status: 'complete', result: data.answer });
    } catch (err) {
      updateBackgroundTask(taskId, { status: 'error', error: "Failed to answer question." });
    }
  };

  const handleExecuteWatchdogAnalysis = async () => {
    const activeRules = activeFlags.filter(f => f.active).map(f => f.ruleContext).join("\\n");
    if (!activeRules) return alert("Please activate at least one flag.");
    const taskId = addBackgroundTask({
      type: 'watchdog',
      title: 'Watchdog Analysis'
    });
    if (!taskId) return;

    try {
      const response = await fetch('/api/gemini/watchdog-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billData: currentViewingBill, customRules: activeRules })
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      updateBackgroundTask(taskId, { status: 'complete', result: data.analysis });
    } catch (err) {
      updateBackgroundTask(taskId, { status: 'error', error: "Watchdog analysis failed." });
    }
  };
"""

insert_pos = content.find("  const [activeTab")
content = content[:insert_pos] + missing_code + "\n" + content[insert_pos:]

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added missing code")
