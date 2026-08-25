import re
with open("src/App.tsx", "r") as f:
    content = f.read()

new_handle = """
  const handleOpenTaskResult = (task: BackgroundTask) => {
    if (task.status !== 'complete') return;
    
    // Dispatch to the correct view based on task type
    switch (task.type) {
      case 'briefing':
        setActiveBriefingLegislator(task.data.legislator);
        setBriefingText(task.result);
        break;
      case 'findings':
        setActiveFindingsLegislator(task.data.legislator);
        setFindingsText(task.result);
        break;
      case 'watchdog':
        setAnalysisResult(task.result);
        setAnalysisProgress(["[SUCCESS] Analysis completed."]);
        setActiveTab('watchdog');
        break;
      case 'anomaly':
        setSelectedAnomaly({
          ...task.data.anomalyArgs,
          type: task.data.type
        });
        setAnomalyExplanation(task.result);
        setPacChartView('individual');
        setTrendLegislatorId(task.data.legislatorId);
        setDashboardTab('pac');
        break;
      case 'bill_summary':
        setViewingBillId(task.data.bill.id || 'custom');
        setViewingBillSummary(task.result);
        setCustomQuestionReplies([]);
        setIsViewingBill(true);
        break;
      case 'bill_question':
        setViewingBillId(task.data.bill.id || 'custom');
        setViewingBillSummary(task.data.summary);
        setCustomQuestionReplies(prev => [
          ...prev, 
          { question: task.data.question, reply: task.result, usingDemoFallback: false, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        setIsViewingBill(true);
        break;
      case 'rebuttal':
        const legId = task.data.legislatorId;
        const result = task.result;
        setLegislators(prev => {
          const updated = prev.map(l => {
            if (l.legislator_id === legId) {
              return {
                ...l,
                outreach_status: 'verified' as const,
                redress_statement: result.statement,
                redress_actions: result.correctiveActions
              };
            }
            return l;
          });
          try {
            localStorage.setItem('watchdog_legislators', JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
          return updated;
        });

        setCustomRedressStatement('');
        setCustomRedressActions('');

        const leg = legislators.find(l => l.legislator_id === legId);
        if (leg) {
          setOutreachStatusLog({
            status: 'sent',
            text: `🎉 Official portal response published successfully! Representative ${leg.name} is now a VERIFIED member with redress statements visible to the public.`
          });
          
          const newEvent = {
            id: `event-verified-${Date.now()}`,
            title: `Official Response Published: ${leg.name}`,
            category: 'OUTREACH' as const,
            summary: `${leg.name} (${leg.party}) has officially claimed their page, submitted an oversight rebuttal, and filed 3 corrective commitments.`,
            impactText: "Verified checkmark awarded. Voter transparency ratings recalculated with corrective action weightings.",
            severity: "info" as const,
            timestamp: "Just Now",
            targetLegislatorId: leg.legislator_id,
            actionLabel: "Filter Directory"
          };
          setCurrentEvents(prev => [newEvent, ...prev]);
        }
        break;
      case 'milestone':
        setSelectedMilestoneId(task.data.milestoneId);
        setCustomMilestonePlan(task.result);
        setDashboardTab('events');
        break;
    }
    
    // Remove task after opening
    removeBackgroundTask(task.id);
  };
"""

start = content.find("  const handleOpenTaskResult = (task: BackgroundTask) => {")
end = content.find("  return (", start)

content = content[:start] + new_handle + "\n" + content[end:]

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Fixed handleOpenTaskResult")
