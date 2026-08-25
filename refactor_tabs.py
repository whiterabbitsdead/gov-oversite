with open("src/App.tsx", "r") as f:
    content = f.read()

# 1. Update dashboardTab state declaration
old_state = "const [dashboardTab, setDashboardTab] = useState<'advisor' | 'events' | 'pac' | 'directory'>('directory');"
new_state = "const [dashboardTab, setDashboardTab] = useState<'directory' | 'scorecard' | 'metrics' | 'pac' | 'events' | 'advisor'>('directory');"
content = content.replace(old_state, new_state)

# 2. Update sub-nav buttons
old_nav_start = "            {/* Dashboard Sub-Navigation */}\n            <div className=\"flex flex-wrap items-center justify-center gap-3 mb-6 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/80 w-fit mx-auto\">"
old_nav_end = "              </button>\n            </div>"

new_nav = """            {/* Dashboard Sub-Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 bg-slate-900/60 p-2 rounded-2xl border border-slate-800/80 w-full max-w-4xl mx-auto shadow-md">
              <button
                onClick={() => setDashboardTab('directory')}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'directory' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Users size={14} />
                Members Directory
              </button>
              <button
                onClick={() => setDashboardTab('scorecard')}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'scorecard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <SlidersHorizontal size={14} />
                Watchlist & Scorecard
              </button>
              <button
                onClick={() => setDashboardTab('metrics')}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'metrics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Activity size={14} />
                Quick Metrics
              </button>
              <button
                onClick={() => setDashboardTab('pac')}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'pac' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Coins size={14} />
                PAC Trends
              </button>
              <button
                onClick={() => setDashboardTab('events')}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'events' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <BellRing size={14} />
                Live Feed & Outreach
              </button>
              <button
                onClick={() => setDashboardTab('advisor')}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'advisor' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Bot size={14} />
                AI Advisor
              </button>
            </div>"""

# Replace navigation bar
import re
pattern = r"\{\/\* Dashboard Sub-Navigation \*\/\}.*?<\/div>"
content = re.sub(pattern, new_nav, content, flags=re.DOTALL)

# 3. Handle events tab wrapper: replace '{dashboardTab === \'events\' && (<>' with '{dashboardTab === \'events\' && ('
content = content.replace("{dashboardTab === 'events' && (<>", "{dashboardTab === 'events' && (")

# Replace ending line of events tab
content = content.replace("            </div>\n            </>)}", "            </div>\n            )}")

# 4. Wrap Quick Metrics + FCM Alerts in {dashboardTab === 'metrics' && ( ... )}
old_metrics_marker = "{/* Quick Metrics Statistics Widgets */}"
new_metrics = """{/* Quick Metrics Statistics Widgets */}
            {dashboardTab === 'metrics' && (
              <div className="space-y-6 animate-fade-in">"""

content = content.replace(old_metrics_marker, new_metrics)

# Wrap end of FCM alerts before Scorecard
old_scorecard_marker = "{/* Value Scorecard Settings & Watchlist Section */}"
new_scorecard = """</div>
            )}

            {/* Value Scorecard Settings & Watchlist Section */}
            {dashboardTab === 'scorecard' && ("""

content = content.replace(old_scorecard_marker, new_scorecard)

# Close scorecard section before PAC section
old_pac_marker = "{/* PAC Funding Trend & Legislative Alignment Section */}"
new_pac = """</div>
            )}

            {/* PAC Funding Trend & Legislative Alignment Section */}"""

content = content.replace(old_pac_marker, new_pac)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Refactoring completed.")
