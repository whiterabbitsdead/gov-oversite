with open("src/App.tsx", "r") as f:
    content = f.read()

missing_logic = """
  // Restored Missing Logic (Properly referenced)
  const calculateTransparencyIndex = (leg: Legislator) => {
    let score = 100 - (leg.corporate_vote_index || 0);
    if (leg.outreach_status === 'verified') score += 15;
    if (leg.conflict_triggers && leg.conflict_triggers.length > 0) score -= (leg.conflict_triggers.length * 10);
    return Math.max(0, Math.min(100, score));
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const uniqueSocieties = Array.from(new Set(legislators.map(l => l.society_affiliations || []).flat())).filter(Boolean);

  const filteredLegislators = legislators.filter(leg => {
    if (search && !leg.name.toLowerCase().includes(search.toLowerCase()) && !leg.state.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    totalAipac: filteredLegislators.reduce((sum, leg) => sum + (leg.aipac_funding_total || 0), 0),
    avgTransparencyScore: filteredLegislators.length > 0 
      ? Math.round(filteredLegislators.reduce((sum, leg) => sum + calculateTransparencyIndex(leg), 0) / filteredLegislators.length) 
      : 0,
    societyMembersCount: filteredLegislators.filter(leg => leg.society_affiliations && leg.society_affiliations.length > 0).length,
    legislatorCount: filteredLegislators.length,
    midnightVotesActiveCount: filteredLegislators.filter(leg => leg.midnight_vote_badge).length,
    totalIntegrityAlerts: filteredLegislators.reduce((sum, leg) => sum + (leg.conflict_triggers?.length || 0), 0)
  };

  const handleResetFilters = () => {
    setSearch('');
  };

  const handleToggleCompare = (id: string) => {
    setCompareSelection(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
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

insert_pos = content.find("  return (")
content = content[:insert_pos] + missing_logic + "\n" + content[insert_pos:]

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added missing logic properly!")
