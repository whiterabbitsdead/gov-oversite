with open("src/App.tsx", "r") as f:
    content = f.read()

# Replace setViewingBillId with setCurrentViewingBill
content = content.replace("setViewingBillId(task.data.bill.id || 'custom');", "setCurrentViewingBill(task.data.bill);")
content = content.replace("setCustomQuestionReplies", "setViewingBillQuestions")
content = content.replace("reply: task.result", "answer: task.result")
content = content.replace("usingDemoFallback: false, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })", "loading: false")
content = content.replace("outreach_status: 'verified' as const", "outreach_status: 'verified'")
content = content.replace("redress_statement: result.statement", "official_statement: result.statement")
content = content.replace("redress_actions: result.correctiveActions", "corrective_actions: result.correctiveActions")
content = content.replace("setCustomRedressStatement('');", "setRepRebuttalStatement(result.statement);")
content = content.replace("setCustomRedressActions('');", "setRepRebuttalActions(result.correctiveActions);")

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Reverted state changes in handleOpenTaskResult")
