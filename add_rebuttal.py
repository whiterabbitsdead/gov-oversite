import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("  | 'advisor_chat';", "  | 'advisor_chat'\n  | 'rebuttal';")

handler = """      case 'rebuttal':
        const leg = legislators.find(l => l.legislator_id === task.data.legislatorId);
        if (leg) {
          setPortalActiveRep(leg);
          setRepRebuttalStatement(task.result.statement);
          setRepRebuttalActions(task.result.correctiveActions);
          setPortalIsClaimed(true);
          setDashboardTab('portal');
        }
        break;"""

content = content.replace("      case 'milestone':", handler + "\n      case 'milestone':")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added rebuttal type and handler.")
