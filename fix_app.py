import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """      case 'bill_question':
        setCurrentViewingBill(task.data.bill);
        setViewingBillSummary(task.data.summary);
        setViewingBillQuestions(prev => [
          ...prev, 
          { question: task.data.question, answer: task.result, loading: false }
        ] as any);
        setIsViewingBill(true);
        break;"""

content = re.sub(r"      case 'bill_question':\n        setCurrentViewingBill.*?setIsViewingBill\(true\);\n        break;", """      case 'bill_question':
        setCurrentViewingBill(task.data.bill);
        setViewingBillSummary(task.data.summary);
        setViewingBillQuestions(prev => [
          ...prev, 
          { 
            question: task.data.question, 
            reply: task.result || task.data.result?.answer || (typeof task.result === 'object' ? task.result.answer : task.result) || 'No response',
            usingDemoFallback: task.result?.usingDemoFallback,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsViewingBill(true);
        break;""", content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated App.tsx setViewingBillQuestions")
