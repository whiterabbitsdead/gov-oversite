import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect, FormEvent } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  ShieldAlert, 
  Plus, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Coins, 
  Activity, 
  Vote, 
  SlidersHorizontal, 
  Send,
  Lock,
  BookOpen,
  Info,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { CountyOfficial, LocalComplaint, UserProfile } from '../types';

interface LocalAuditHubProps {
  user: UserProfile | null;
}

export function LocalAuditHub({ user }: LocalAuditHubProps) {
  // Navigation within the hub
  const [subTab, setSubTab] = useState<'audit' | 'complaints'>('audit');

  // Audit Search State
  const [countySearch, setCountySearch] = useState('Maricopa');
  const [stateSearch, setStateSearch] = useState('AZ');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResults, setAuditResults] = useState<{
    county: string;
    state: string;
    officials: CountyOfficial[];
    usingDemoFallback?: boolean;
    liveGenerated?: boolean;
  } | null>(null);
  const [auditError, setAuditError] = useState('');

  // Complaints State
  const [complaints, setComplaints] = useState<LocalComplaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('All');
  const [complaintStatus, setComplaintStatus] = useState('All');
  
  // Reporter Mode simulation
  const [reporterMode, setReporterMode] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [reporterNoteInput, setReporterNoteInput] = useState('');
  const [reporterStatusInput, setReporterStatusInput] = useState<any>('');

  // Submit Complaint Form State
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    county: '',
    state: 'AZ',
    title: '',
    category: 'Corruption' as const,
    description: '',
    evidenceDescription: '',
    submittedBy: ''
  });
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Load audit initially on mount
  useEffect(() => {
    handleSearchAudit("Maricopa", "AZ");
    fetchComplaints();
  }, []);

  const handleSearchAudit = async (county: string, state: string) => {
    setAuditLoading(true);
    setAuditError('');
    try {
      const response = await fetch("/api/local-audit/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ county, state }),
      });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      setAuditResults(data);
    } catch (err: any) {
      console.error("Local audit query failed", err);
      setAuditError("Failed to retrieve municipal officials. Verify server status.");
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (complaintSearch) queryParams.append('search', complaintSearch);
      if (complaintCategory !== 'All') queryParams.append('category', complaintCategory);
      if (complaintStatus !== 'All') queryParams.append('status', complaintStatus);

      const response = await fetch(`/api/local-complaints?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error("Failed to load complaints board", err);
    } finally {
      setComplaintsLoading(false);
    }
  };

  // Run complaint filter search
  const handleFilterComplaints = (e: FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleUpvoteComplaint = async (id: string) => {
    try {
      const response = await fetch(`/api/local-complaints/${id}/vote`, {
        method: "POST"
      });
      if (response.ok) {
        const data = await response.json();
        setComplaints(prev => prev.map(c => {
          if (c.id === id) {
            return { ...c, upvotes: data.upvotes };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error("Upvote failed", err);
    }
  };

  const handleUpdateComplaintByReporter = async (id: string) => {
    if (!reporterStatusInput && !reporterNoteInput.trim()) return;
    try {
      const response = await fetch(`/api/local-complaints/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reporterStatusInput || undefined,
          note: reporterNoteInput.trim() || undefined
        })
      });
      if (response.ok) {
        const data = await response.json();
        setComplaints(prev => prev.map(c => {
          if (c.id === id) {
            return data.complaint;
          }
          return c;
        }));
        setReporterNoteInput('');
        setReporterStatusInput('');
        setSelectedComplaintId(null);
      }
    } catch (err) {
      console.error("Failed to update complaint", err);
    }
  };

  const handleSubmitComplaint = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComplaint.county || !newComplaint.title || !newComplaint.description) {
      alert("Please complete all required fields.");
      return;
    }

    setFormSubmitLoading(true);
    setFormSuccessMessage('');
    try {
      const response = await fetch("/api/local-complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newComplaint,
          submittedBy: newComplaint.submittedBy.trim() || user?.name || "Anonymous Citizen"
        })
      });

      if (response.ok) {
        setFormSuccessMessage("Complaint filed successfully! It is now on the live Investigative board.");
        setNewComplaint({
          county: '',
          state: 'AZ',
          title: '',
          category: 'Corruption',
          description: '',
          evidenceDescription: '',
          submittedBy: ''
        });
        fetchComplaints();
        setTimeout(() => {
          setShowSubmitForm(false);
          setFormSuccessMessage('');
        }, 3000);
      } else {
        throw new Error("Server rejected complaint registration.");
      }
    } catch (err: any) {
      alert(err.message || "Submission failed.");
    } finally {
      setFormSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1.5 font-sans">
      
      {/* Header Panel */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-2 max-w-3xl">
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest font-mono flex items-center gap-1.5">
            <Building2 size={13} className="text-emerald-400 animate-pulse" />
            MUNICIPAL OVERSIGHT PORTAL
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase font-mono">
            Local Government Integrity Audit
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Expose local government corruption, abuse of power, open records denials, and constitutional rights violations. Look up county-level elected officials across any jurisdiction, review their PAC funding overlaps, and coordinate investigative journalism efforts.
          </p>
        </div>

        {/* Tab Controls Inside Banner */}
        <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-xl self-start md:self-center shrink-0">
          <button aria-label="Choose audit tab"
            onClick={() => setSubTab('audit')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer uppercase ${
              subTab === 'audit' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search size={13} />
            County Lookup
          </button>
          <button aria-label="Choose complaints tab"
            onClick={() => setSubTab('complaints')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer uppercase ${
              subTab === 'complaints' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert size={13} />
            Incidents Board
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: COUNTY OFFICIALS INTEGRITY AUDIT */}
      {subTab === 'audit' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Search and Input Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Search Input Card */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider font-mono">
                  Auditor Search Board
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal mt-1">
                  Enter any U.S. county and state. If preloaded data is not found, the AI Auditor will scrape public reports to compile verified officials, salary, and conflict-of-interest profiles.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <label htmlFor="county-search" className="text-xs font-black uppercase text-slate-300 tracking-wider">County Name</label>
                    <input id="county-search"
                      type="text"
                      placeholder="e.g. Cook, Travis, Maricopa"
                      value={countySearch}
                      onChange={(e) => setCountySearch(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="state-search" className="text-xs font-black uppercase text-slate-300 tracking-wider">State Code</label>
                    <select id="state-search"
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all font-bold cursor-pointer"
                    >
                      {['AZ', 'GA', 'IL', 'TX', 'CA', 'FL', 'NY', 'OH', 'PA', 'MI', 'NC', 'VA', 'WA', 'CO', 'MA', 'TN', 'NV', 'UT'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button onClick={() => handleSearchAudit(countySearch, stateSearch)}
                  disabled={auditLoading || !countySearch.trim()}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                  aria-label="Search County Records"
                >
                  {auditLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                      <span>Scraping Municipal Records...</span>
                    </>
                  ) : (
                    <>
                      <Search size={16} aria-hidden="true" />
                      <span>Search County Records</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preloaded Quick Clicks */}
              <div className="pt-3 border-t border-slate-850 space-y-2">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-mono">
                  Verified Local Preloads
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { county: "Maricopa", state: "AZ" },
                    { county: "Fulton", state: "GA" },
                    { county: "Cook", state: "IL" },
                    { county: "Travis", state: "TX" }
                  ].map((item, idx) => (
                    <button key={idx}
                      onClick={() => {
                        setCountySearch(item.county);
                        setStateSearch(item.state);
                        handleSearchAudit(item.county, item.state);
                      }}
                      className="py-1.5 px-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-[10px] font-bold text-slate-300 rounded-lg flex items-center gap-1.5 transition-colors text-left"
                    >
                      <MapPin size={11} className="text-emerald-400 shrink-0" />
                      <span className="truncate">{item.county} Co., {item.state}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Display Panel (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {auditLoading && (
                <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl flex flex-col items-center text-center justify-center space-y-4 min-h-[300px]">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider animate-pulse">Running Open-Records Search</p>
                    <p className="text-[10px] text-slate-400 max-w-xs">Connecting to municipal archives, matching county board resolutions, campaign donation ethics files, and estimating civil risk ratings.</p>
                  </div>
                </div>
              )}

              {auditError && (
                <div className="bg-rose-950/10 border border-rose-900/30 p-5 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-xs font-bold text-rose-400">Search System Exception</h4>
                    <p className="text-[11px] text-slate-300 leading-normal mt-1">{auditError}</p>
                  </div>
                </div>
              )}

              {!auditLoading && !auditError && !auditResults && (
                <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl flex flex-col items-center text-center justify-center text-slate-500 min-h-[300px]">
                  <Building2 size={36} className="text-slate-700 mb-3" />
                  <p className="text-xs font-bold text-slate-300">County Integrity Report Awaiting Search</p>
                  <p className="text-[11px] max-w-md mt-1 leading-relaxed text-slate-400">
                    Submit a query to inspect active county roles, taxpayer salaries, PAC special-interest dependencies, and recorded conflicts of interest.
                  </p>
                </div>
              )}

              {!auditLoading && !auditError && auditResults && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Results Header Card */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white tracking-widest font-mono uppercase">
                        🔎 AUDIT RECORD: {auditResults.county.toUpperCase()} COUNTY, {auditResults.state}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono tracking-wider font-semibold">
                        State: PUBLIC DISCLOSURE ARCHIVES • SCORED RECORDS: {auditResults.officials.length}
                      </p>
                    </div>
                    <div>
                      {auditResults.liveGenerated ? (
                        <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2 py-1 rounded-lg">
                          ✨ AI Generated (Gemini)
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-1 rounded-lg">
                          🛡️ Verified Records
                        </span>
                      )}
                    </div>
                  </div>


                  {/* Data Visualization Widget: Spending vs Oversight */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
                    <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider font-mono mb-4 flex items-center gap-2">
                      <Activity size={14} className="text-indigo-400" />
                      Budget Allocation vs. Committee Oversight Ratings (Millions)
                    </h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { category: 'Public Works', budget: 450, oversight: 85, flagged: 15 },
                            { category: 'Law Enforcement', budget: 750, oversight: 40, flagged: 120 },
                            { category: 'Education', budget: 620, oversight: 70, flagged: 30 },
                            { category: 'Health & Human Svcs', budget: 380, oversight: 90, flagged: 10 },
                            { category: 'Zoning & Dev', budget: 210, oversight: 55, flagged: 65 },
                          ]}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="category" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px', borderRadius: '8px', color: '#f1f5f9' }}
                            itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px' }} iconType="circle" />
                          <Bar dataKey="budget" name="Total Budget ($M)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="oversight" name="Verified Oversight ($M)" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="flagged" name="Flagged / Unaudited ($M)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Officials List Cards */}
                  <div className="space-y-4">
                    {auditResults.officials.map((official) => {
                      let ratingColor = "border-emerald-500 text-emerald-400 bg-emerald-950/30";
                      if (official.rating === 'C') ratingColor = "border-amber-500 text-amber-400 bg-amber-950/30";
                      else if (official.rating === 'D') ratingColor = "border-orange-500 text-orange-400 bg-orange-950/30";
                      else if (official.rating === 'F') ratingColor = "border-rose-500 text-rose-400 bg-rose-950/30";

                      return (
                        <div key={official.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                          
                          {/* Card Main Info */}
                          <div className="p-4 border-b border-slate-850 flex items-start gap-4 justify-between">
                            <div className="flex gap-3">
                              
                              {/* Rating Large Indicator */}
                              <div className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center shrink-0 font-mono font-black text-sm shadow-md ${ratingColor}`}>
                                {official.rating}
                                <span className="text-[8px] opacity-75 font-sans">Index</span>
                              </div>

                              <div className="space-y-1">
                                <h5 className="text-xs font-extrabold text-white">{official.name}</h5>
                                <p className="text-[11px] text-emerald-400 font-bold font-mono tracking-wider flex items-center gap-1.5 uppercase">
                                  <span>{official.role}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                                  <span className="text-slate-400">{official.party}</span>
                                </p>
                              </div>
                            </div>

                            <div className="text-right font-mono">
                              <span className="text-[10px] text-slate-500 uppercase font-black block">Taxpayer Salary</span>
                              <span className="text-xs text-white font-extrabold">${official.salary.toLocaleString()}/yr</span>
                            </div>
                          </div>

                          {/* Card Secondary Details */}
                          <div className="p-4 bg-slate-950/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-normal">
                            
                            {/* Left: Conflicts & Stats */}
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono block">Ethical / PAC Conflicts</span>
                                {official.conflicts.length > 0 ? (
                                  <ul className="space-y-1">
                                    {official.conflicts.map((conflict, idx) => (
                                      <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                        <span className="text-amber-500 shrink-0 mt-1">⚠️</span>
                                        <span>{conflict}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[11px] text-emerald-400 font-bold">No active corporate conflicts flagged.</p>
                                )}
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono block">Top Campaign Donors</span>
                                <div className="space-y-1">
                                  {official.contributions && official.contributions.map((con, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-[10px] bg-slate-900 border border-slate-850 px-2 py-1 rounded">
                                      <span className="font-bold text-slate-300">{con.donor}</span>
                                      <span className="font-mono text-emerald-400 font-bold">${con.amount.toLocaleString()} ({con.category})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Right: Actions & Citizen Call to Action */}
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono block">Recent Actions / Voting History</span>
                                <ul className="space-y-1">
                                  {official.recentActions.map((act, idx) => (
                                    <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1 leading-relaxed">
                                      <span className="text-slate-500 shrink-0 mt-1">•</span>
                                      <span>{act}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Inter-flow integration action */}
                              <div className="pt-2 border-t border-slate-850 flex items-center justify-between gap-2">
                                <div className="text-[9px] text-slate-400 leading-tight">
                                  <span className="font-bold text-slate-300 block">Audited Tenure</span>
                                  <span>{official.tenure}</span>
                                </div>
                                <button onClick={() => {
                                    setNewComplaint({
                                      county: auditResults.county,
                                      state: auditResults.state,
                                      title: `Exposing conflict in ${official.name} (${official.role}) alignment`,
                                      category: "Corruption",
                                      description: `Detailed investigation requested on ${official.name}'s contract overlaps regarding ${official.conflicts.join(', ')}.`,
                                      evidenceDescription: `References: Campaign contributions totaling $${official.contributions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}.`,
                                      submittedBy: ''
                                    });
                                    setSubTab('complaints');
                                    setShowSubmitForm(true);
                                  }}
                                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 rounded transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <ShieldAlert size={10} />
                                  <span>Report Misconduct</span>
                                </button>
                              </div>

                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      )}


      {/* SUB-TAB 2: CITIZEN COMPLAINTS BOARD */}
      {subTab === 'complaints' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Info Bar & Actions */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider font-mono flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-indigo-400" />
                Live Complaints Register
              </h3>
              <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
                Reporters and citizens collaboratively cross-reference logs. Investigative Journalists can toggle <strong className="text-slate-300">Reporter Mode</strong> to write briefing logs and flag verified corruption cases.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Reporter Mode Simulator Toggle */}
              <button onClick={() => setReporterMode(!reporterMode)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  reporterMode 
                    ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300 shadow-md animate-pulse' 
                    : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Vetted Investigative Reporter Powers"
              >
                <Lock size={11} className={reporterMode ? "text-indigo-400" : "text-slate-500"} />
                <span>Reporter Mode: {reporterMode ? "Active" : "Disabled"}</span>
              </button>

              <button onClick={() => {
                  setShowSubmitForm(!showSubmitForm);
                  setFormSuccessMessage('');
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-lg transition-colors flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
              >
                <Plus size={12} />
                <span>File Integrity Report</span>
              </button>
            </div>
          </div>

          {/* New Complaint Form Panel */}
          {showSubmitForm && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-indigo-950/50 p-6 rounded-2xl space-y-4 animate-fade-in relative shadow-xl">
              <button onClick={() => setShowSubmitForm(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-indigo-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Submit Local Incident & Integrity Complaint</h4>
              </div>

              {formSuccessMessage && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl text-xs text-emerald-400 font-bold">
                  ✓ {formSuccessMessage}
                </div>
              )}

              <form onSubmit={handleSubmitComplaint} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">County Location *</label>
                    <input type="text"
                      placeholder="e.g. Maricopa County"
                      required
                      value={newComplaint.county}
                      onChange={(e) => setNewComplaint(prev => ({ ...prev, county: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">State Code *</label>
                    <select value={newComplaint.state}
                      onChange={(e) => setNewComplaint(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {['AZ', 'GA', 'IL', 'TX', 'CA', 'FL', 'NY', 'OH', 'PA', 'MI', 'NC', 'VA', 'WA', 'CO', 'MA', 'TN', 'NV', 'UT'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Report Category *</label>
                    <select value={newComplaint.category}
                      onChange={(e: any) => setNewComplaint(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Corruption">Corruption (Earmarks, Bribes, Favors)</option>
                      <option value="Constitutional Violation">Constitutional Violation (Filming Bans, Restricting Assembly)</option>
                      <option value="Police Misconduct">Police Misconduct (Excessive Force, Audit Threats)</option>
                      <option value="Open Records Denial">Open Records Denial (FOIA/Transparency Blockades)</option>
                      <option value="Financial Waste">Financial Waste (Sole-Source Inmate Contract Spikes)</option>
                      <option value="Election Integrity">Election Integrity (Zoning, Unnotified Board Changes)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Complaint Headline *</label>
                  <input type="text"
                    placeholder="e.g. Sheriff's Office limits filming in non-restricted County Recorder Counters"
                    required
                    value={newComplaint.title}
                    onChange={(e) => setNewComplaint(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Factual Description (Abuse details, officers involved) *</label>
                  <textarea rows={3}
                    placeholder="Provide precise details, dates, times, and actions taken by county officials. Avoid hearsay."
                    required
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Evidence References (Video links, public notices, docs)</label>
                    <input type="text"
                      placeholder="e.g. YouTube clip ID, Board resolution index, PDF URL"
                      value={newComplaint.evidenceDescription}
                      onChange={(e) => setNewComplaint(prev => ({ ...prev, evidenceDescription: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Reporter / Citizen Alias (Defaults to profile name)</label>
                    <input type="text"
                      placeholder="Anonymous or Custom Name"
                      value={newComplaint.submittedBy}
                      onChange={(e) => setNewComplaint(prev => ({ ...prev, submittedBy: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <button type="submit"
                  disabled={formSubmitLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                >
                  {formSubmitLoading ? "Filing Case Record..." : "Submit Incident Report"}
                </button>
              </form>
            </div>
          )}

          {/* Filtering and Board Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Filter controls panel (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shrink-0">
              <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider font-mono">
                Filter & Search Board
              </h3>

              <form onSubmit={handleFilterComplaints} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Text Search</label>
                  <input type="text"
                    placeholder="Search county, title, text..."
                    value={complaintSearch}
                    onChange={(e) => setComplaintSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Filter Category</label>
                  <select value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="All">All Categories</option>
                    <option value="Corruption">Corruption</option>
                    <option value="Constitutional Violation">Constitutional Violation</option>
                    <option value="Police Misconduct">Police Misconduct</option>
                    <option value="Open Records Denial">Open Records Denial</option>
                    <option value="Financial Waste">Financial Waste</option>
                    <option value="Election Integrity">Election Integrity</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Audit Case Status</label>
                  <select value={complaintStatus}
                    onChange={(e) => setComplaintStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending Audit</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Verified">Verified Misconduct</option>
                    <option value="Dismissed">Dismissed/Resolved</option>
                    <option value="Public Exposed">Public Exposed</option>
                  </select>
                </div>

                <button type="submit"
                  className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-black uppercase tracking-wider text-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </form>

              {/* Stat Board */}
              <div className="pt-4 border-t border-slate-850 space-y-2">
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono block">Auditing Statistics</span>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-950 border border-slate-850/60 rounded-xl">
                    <span className="text-slate-400 text-[10px] block">Verified Reports</span>
                    <span className="text-emerald-400 font-mono font-bold">42 Cases</span>
                  </div>
                  <div className="p-2 bg-slate-950 border border-slate-850/60 rounded-xl">
                    <span className="text-slate-400 text-[10px] block">Public Exposed</span>
                    <span className="text-rose-400 font-mono font-bold">12 Reports</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Complaints list column (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              
              {complaintsLoading && (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  Loading investigation cases...
                </div>
              )}

              {!complaintsLoading && complaints.length === 0 && (
                <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-500">
                  <ShieldAlert size={36} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-xs font-bold text-slate-300">No Complaints Match Filters</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try resetting parameters or file a new integrity report to populate the board.</p>
                </div>
              )}

              {!complaintsLoading && complaints.map((complaint) => {
                let statusBadge = "bg-slate-950 text-slate-400 border-slate-850";
                if (complaint.status === "Pending") statusBadge = "bg-amber-950/40 text-amber-400 border-amber-900/40 animate-pulse";
                else if (complaint.status === "Under Investigation") statusBadge = "bg-indigo-950/40 text-indigo-400 border-indigo-900/40";
                else if (complaint.status === "Verified") statusBadge = "bg-emerald-950/40 text-emerald-400 border-emerald-900/40";
                else if (complaint.status === "Public Exposed") statusBadge = "bg-rose-950/50 text-rose-400 border-rose-900/40 font-black";
                else if (complaint.status === "Dismissed") statusBadge = "bg-slate-950 text-slate-500 border-slate-850 line-through";

                return (
                  <div key={complaint.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm transition-all hover:border-slate-700">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-indigo-900/40 text-indigo-400 bg-indigo-950/30 font-mono">
                            {complaint.category}
                          </span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border font-mono ${statusBadge}`}>
                            {complaint.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white tracking-tight leading-snug">
                          {complaint.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                          <MapPin size={10} className="text-rose-400" />
                          <span>{complaint.county}, {complaint.state}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span>Filed: {complaint.dateSubmitted}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span>By: {complaint.submittedBy}</span>
                        </p>
                      </div>

                      {/* Vote Button */}
                      <button onClick={() => handleUpvoteComplaint(complaint.id)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-indigo-400 transition-all cursor-pointer font-mono shrink-0"
                      >
                        <Vote size={14} className="text-indigo-400" />
                        <span className="text-xs font-bold mt-1">{complaint.upvotes}</span>
                        <span className="text-[8px] text-slate-500 uppercase">Upvotes</span>
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed font-sans select-text bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                      {complaint.description}
                    </p>

                    {/* Evidence if exists */}
                    {complaint.evidenceDescription && (
                      <div className="text-[11px] text-slate-400 flex items-start gap-1.5 font-sans leading-normal">
                        <span className="text-emerald-500 shrink-0 font-bold">📄 EVIDENCE FILE:</span>
                        <span className="italic">{complaint.evidenceDescription}</span>
                      </div>
                    )}

                    {/* Reporter Briefings Notes Box */}
                    {complaint.reporterNotes && complaint.reporterNotes.length > 0 && (
                      <div className="bg-indigo-950/10 border border-indigo-900/20 p-4 rounded-xl space-y-2">
                        <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider font-mono flex items-center gap-1">
                          <BookOpen size={11} />
                          INVESTIGATIVE JOURNALIST BRIEFS
                        </span>
                        <div className="space-y-1.5">
                          {complaint.reporterNotes.map((note, idx) => (
                            <p key={idx} className="text-[11px] text-slate-300 font-mono leading-relaxed pl-3 border-l-2 border-indigo-500/50">
                              "{note}"
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Active Reporter Investigative Control Box */}
                    {reporterMode && (
                      <div className="p-4 bg-slate-950 border border-indigo-950 rounded-xl space-y-3.5 animate-fade-in text-xs">
                        <div className="flex items-center justify-between border-b border-indigo-950/40 pb-2">
                          <span className="font-mono font-bold text-indigo-400 flex items-center gap-1.5 uppercase">
                            <SlidersHorizontal size={12} />
                            Case Audit Console (Reporter Mode)
                          </span>
                          <span className="text-[9px] bg-indigo-950/40 border border-indigo-900/40 text-indigo-300 px-1.5 py-0.5 rounded uppercase font-black">Vetted Account Active</span>
                        </div>

                        {selectedComplaintId !== complaint.id ? (
                          <button onClick={() => {
                              setSelectedComplaintId(complaint.id);
                              setReporterStatusInput(complaint.status);
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-[11px] font-extrabold text-indigo-400 rounded-lg border border-slate-800 transition-colors uppercase cursor-pointer"
                          >
                            Edit Audit Case File
                          </button>
                        ) : (
                          <div className="space-y-3 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Update Public Status Badge</label>
                                <select value={reporterStatusInput}
                                  onChange={(e: any) => setReporterStatusInput(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-white"
                                >
                                  <option value="Pending">Pending Audit</option>
                                  <option value="Under Investigation">Under Investigation</option>
                                  <option value="Verified">Verified Misconduct</option>
                                  <option value="Dismissed">Dismissed/Resolved</option>
                                  <option value="Public Exposed">Public Exposed (Critical)</option>
                                </select>
                              </div>
                              
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-mono">Publish Reporter Briefing Log</label>
                                <div className="flex gap-2">
                                  <input type="text"
                                    placeholder="Append official investigation notes..."
                                    value={reporterNoteInput}
                                    onChange={(e) => setReporterNoteInput(e.target.value)}
                                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-xs text-slate-200"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setSelectedComplaintId(null)}
                                className="px-3 py-1 bg-slate-900 hover:bg-slate-850 text-slate-400 text-[10px] font-bold rounded"
                              >
                                Cancel
                              </button>
                              <button onClick={() => handleUpdateComplaintByReporter(complaint.id)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold rounded"
                              >
                                Commit Audit Case File Changes
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
