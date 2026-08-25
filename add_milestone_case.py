import re

with open("src/App.tsx", "r") as f:
    content = f.read()

replacement = """      case 'bill_question':
        setCurrentViewingBill(task.data.bill);
        setViewingBillSummary(task.data.summary);
        setViewingBillQuestions(prev => [
          ...prev, 
          { question: task.data.question, answer: task.result, loading: false }
        ]);
        setIsViewingBill(true);
        break;
      case 'milestone':
        setSelectedMilestoneId(task.data.milestoneId);
        setCustomMilestonePlan(task.result);
        setDashboardTab('events');
        break;"""

content = content.replace("""      case 'bill_question':
        setCurrentViewingBill(task.data.bill);
        setViewingBillSummary(task.data.summary);
        setViewingBillQuestions(prev => [
          ...prev, 
          { question: task.data.question, answer: task.result, loading: false }
        ]);
        setIsViewingBill(true);
        break;""", replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated handleOpenTaskResult.")
