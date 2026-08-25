import re

with open("src/App.tsx", "r") as f:
    content = f.read()

ui = """
      {/* Background Task Manager */}
      {showTaskNotifications && backgroundTasks.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[60] w-80 space-y-3 pointer-events-none">
          {backgroundTasks.map(task => (
            <div 
              key={task.id} 
              className={`p-4 rounded-xl shadow-2xl border pointer-events-auto transition-all animate-fade-in ${
                task.status === 'running' ? 'bg-slate-900 border-indigo-500/50' : 
                task.status === 'complete' ? 'bg-slate-900 border-emerald-500/50 cursor-pointer hover:bg-slate-800' :
                'bg-slate-900 border-rose-500/50'
              }`}
              onClick={() => {
                if (task.status === 'complete') {
                  handleOpenTaskResult(task);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {task.status === 'running' ? (
                    <RefreshCw size={16} className="text-indigo-400 animate-spin shrink-0" />
                  ) : task.status === 'complete' ? (
                    <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">{task.title}</h4>
                    <p className={`text-[10px] font-mono ${
                      task.status === 'running' ? 'text-indigo-300' : 
                      task.status === 'complete' ? 'text-emerald-300' :
                      'text-rose-300'
                    }`}>
                      {task.status === 'running' ? 'Processing in background...' : 
                       task.status === 'complete' ? 'Click to view results' :
                       task.error}
                    </p>
                  </div>
                </div>
                {(task.status === 'complete' || task.status === 'error') && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBackgroundTask(task.id);
                    }}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
"""

content = content.replace("    </div>\n  );\n}", ui + "\n    </div>\n  );\n}")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Added Task Manager UI.")
