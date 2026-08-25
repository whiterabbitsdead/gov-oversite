import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Replace manual loading states with computed ones
content = content.replace(
    "const [isGeneratingMilestonePlan, setIsGeneratingMilestonePlan] = useState<boolean>(false);",
    "const isGeneratingMilestonePlan = backgroundTasks.some(t => t.type === 'milestone' && t.status === 'running');"
)
content = content.replace(
    "const [briefingLoading, setBriefingLoading] = useState(false);",
    "const briefingLoading = backgroundTasks.some(t => t.type === 'briefing' && t.status === 'running');"
)
content = content.replace(
    "const [anomalyLoading, setAnomalyLoading] = useState(false);",
    "const anomalyLoading = backgroundTasks.some(t => t.type === 'anomaly' && t.status === 'running');"
)
content = content.replace(
    "const [findingsLoading, setFindingsLoading] = useState(false);",
    "const findingsLoading = backgroundTasks.some(t => t.type === 'findings' && t.status === 'running');"
)
content = content.replace(
    "const [isSummarizingBill, setIsSummarizingBill] = useState(false);",
    "const isSummarizingBill = backgroundTasks.some(t => t.type === 'bill_summary' && t.status === 'running');"
)
content = content.replace(
    "const [isQueryingQuestion, setIsQueryingQuestion] = useState(false);",
    "const isQueryingQuestion = backgroundTasks.some(t => t.type === 'bill_question' && t.status === 'running');"
)
content = content.replace(
    "const [isAnalyzing, setIsAnalyzing] = useState(false);",
    "const isAnalyzing = backgroundTasks.some(t => t.type === 'watchdog' && t.status === 'running');"
)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Fixed loading states.")
