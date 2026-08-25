import re

with open("src/App.tsx", "r") as f:
    content = f.read()

task_types = """export type BackgroundTaskType = 
  | 'findings' 
  | 'briefing' 
  | 'anomaly' 
  | 'watchdog' 
  | 'bill_summary' 
  | 'bill_question'
  | 'milestone'
  | 'advisor_chat';

export interface BackgroundTask {
  id: string;
  type: BackgroundTaskType;
  title: string;
  status: 'running' | 'complete' | 'error';
  result?: any;
  error?: string;
  data?: any;
  createdAt: number;
}
"""

content = content.replace("export interface Legislator {", task_types + "\nexport interface Legislator {")

task_state = """
  // Background Task Manager State
  const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTask[]>([]);
  const [showTaskNotifications, setShowTaskNotifications] = useState(true);

  const addBackgroundTask = (task: Omit<BackgroundTask, 'id' | 'status' | 'createdAt'>): string | null => {
    // We only use the functional update form if we don't need to return conditionally based on state. 
    // Wait, to safely check limit, we can just check `backgroundTasks` from scope, but better to check in a ref or just use state.
    // For simplicity, checking from current render scope is usually fine if they click one by one.
    if (backgroundTasks.filter(t => t.status === 'running').length >= 4) {
      alert("Maximum of 4 background tasks are currently running. Please wait for them to finish.");
      return null;
    }
    const id = Math.random().toString(36).substring(7);
    setBackgroundTasks(prev => [...prev, { ...task, id, status: 'running', createdAt: Date.now() }]);
    return id;
  };

  const updateBackgroundTask = (id: string, updates: Partial<BackgroundTask>) => {
    setBackgroundTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  
  const removeBackgroundTask = (id: string) => {
    setBackgroundTasks(prev => prev.filter(t => t.id !== id));
  };

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
        setCurrentViewingBill(task.data.bill);
        setViewingBillSummary(task.result);
        setViewingBillQuestions([]);
        setIsViewingBill(true);
        break;
      case 'bill_question':
        setCurrentViewingBill(task.data.bill);
        setViewingBillSummary(task.data.summary);
        setViewingBillQuestions(prev => [
          ...prev, 
          { question: task.data.question, answer: task.result, loading: false }
        ]);
        setIsViewingBill(true);
        break;
    }
    
    // Remove task after opening
    removeBackgroundTask(task.id);
  };
"""

content = content.replace("  const [activeTab, setActiveTab] = useState", task_state + "\n  const [activeTab, setActiveTab] = useState")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added Task Manager state.")
