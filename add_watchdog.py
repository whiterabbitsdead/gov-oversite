import re

with open("src/App.tsx", "r") as f:
    content = f.read()

handler = """      case 'watchdog':
        setAnalysisResult(task.result);
        setAnalysisProgress(["[SUCCESS] Analysis completed."]);
        setActiveTab('watchdog');
        break;"""

content = content.replace("      case 'anomaly':", handler + "\n      case 'anomaly':")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added watchdog handler.")
