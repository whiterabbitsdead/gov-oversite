import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# 1. Update activeTab useState
content = content.replace(
    "const [activeTab, setActiveTab] = useState<'dashboard'",
    "const [activeTab, setActiveTab] = useState<'workspace' | 'dashboard' | 'localaudit'"
)
content = content.replace("('dashboard');", "('workspace');")

# 2. Add ArrowLeft to imports
content = content.replace("import {\n   Search,", "import {\n   Search,\n  ArrowLeft,")

# 3. Replace the massive nav with the back button
nav_start = content.find("          {/* Navigation Tabs */}")
nav_end = content.find("          </nav>\n        </div>\n      </header>") + len("          </nav>\n        </div>\n      </header>")

replacement_nav = """          {/* Workspace Navigation */}
          {activeTab !== 'workspace' && (
            <button
              onClick={() => setActiveTab('workspace')}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-lg"
            >
              <ArrowLeft size={14} />
              Back to Workspace
            </button>
          )}
        </div>
      </header>"""

content = content[:nav_start] + replacement_nav + content[nav_end:]

# 4. Insert Workspace View in Main Container
workspace_view = """        {/* Tab 0: WORKSPACE LAUNCHER */}
        {activeTab === 'workspace' && (
          <div className="animate-fade-in space-y-8 mt-12">
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-black tracking-wider text-white">HUB MODULES</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">Select a specialized application add-on to begin your session. Each module is sandboxed to provide a focused, uncluttered experience.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { id: 'dashboard', name: 'National Oversight', icon: Activity, color: 'text-indigo-400', desc: 'Congressional Lobbying & Tracking' },
                { id: 'debate', name: 'Civic Arena', icon: Flame, color: 'text-amber-500', desc: 'Live Citizen Debates & Rebuttals' },
                { id: 'localaudit', name: 'Local Gov Audit', icon: Building2, color: 'text-emerald-400', desc: 'County-Level Spending Transparency' },
                { id: 'press', name: 'Press Room', icon: Megaphone, color: 'text-rose-400', desc: 'Media & Official Communications' },
                { id: 'watchdog', name: 'Watchdog AI Hub', icon: Sparkles, color: 'text-amber-400', desc: 'AI Summarization & Analysis' },
                { id: 'flags', name: 'Integrity Flags', icon: ShieldAlert, color: 'text-indigo-400', desc: 'Configure Integrity Alerts' },
                { id: 'credentials', name: 'My Credentials', icon: User, color: 'text-emerald-400', desc: 'Voter Registration & Identity' },
                { id: 'functions', name: 'Cloud Functions', icon: Code2, color: 'text-slate-400', desc: 'Developer API Tools' },
                { id: 'script', name: 'Termux Script', icon: Terminal, color: 'text-slate-400', desc: 'Terminal Access Simulator' },
                { id: 'expo', name: 'Expo Mobile', icon: Smartphone, color: 'text-slate-400', desc: 'React Native Exporter' },
                { id: 'json', name: 'JSON State', icon: FileJson, color: 'text-slate-400', desc: 'Raw Application State' }
              ].map(app => (
                <button 
                  key={app.id} 
                  onClick={() => setActiveTab(app.id as any)} 
                  className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-slate-800/80 hover:border-slate-700 transition-all duration-300 shadow-xl group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800/80 group-hover:scale-110 transition-transform shadow-inner shadow-black/50">
                    <app.icon size={28} className={app.color} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-white tracking-wide">{app.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium leading-relaxed px-2">{app.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
"""

main_start = content.find("      {/* Main Container */}")
main_inner = content.find("        {/* Tab 1: Interactive Dashboard Simulator */}", main_start)

content = content[:main_inner] + workspace_view + content[main_inner:]

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Updated App.tsx to use workspace architecture.")
