with open("src/types.ts", "r") as f:
    content = f.read()

task_types = """
export type BackgroundTaskType = 
  | 'findings' 
  | 'briefing' 
  | 'anomaly' 
  | 'watchdog' 
  | 'bill_summary' 
  | 'bill_question'
  | 'milestone'
  | 'rebuttal'
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

with open("src/types.ts", "w") as f:
    f.write(content + task_types)

print("Added types to src/types.ts")
