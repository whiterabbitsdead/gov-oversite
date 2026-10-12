import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  User, 
  Calendar, 
  Check, 
  LogOut, 
  MapPin, 
  Fingerprint, 
  UserCheck, 
  Award,
  AlertCircle,
  Building2,
  Lock
} from 'lucide-react';

interface AccountPanelProps {
  user: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  legislators: any[];
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

export function AccountPanel({ user, onLogin, onLogout, legislators }: AccountPanelProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  
  // Registration form state
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    registeredVoter: 'Yes' as 'Yes' | 'No' | 'Not Registered',
    voterState: 'CA',
    politicalAffiliation: 'Independent',
    bio: '',
    isRepresentative: false,
    representativeId: ''
  });

  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ 
        ...prev, 
        [name]: checked,
        // If claiming rep mode, autofill some rep info if appropriate
        representativeId: checked && !prev.representativeId && legislators.length > 0 ? legislators[0].legislator_id : prev.representativeId
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please enter your legal name.");
      return;
    }
    if (!formData.birthday) {
      setError("Please select your date of birth.");
      return;
    }

    // Determine representative claim
    let claimedRepId = undefined;
    let isRep = formData.isRepresentative;
    if (isRep && formData.representativeId) {
      claimedRepId = formData.representativeId;
    }

    const selectedRep = legislators.find(l => l.legislator_id === claimedRepId);
    const finalProfile: UserProfile = {
      name: isRep && selectedRep ? selectedRep.name : formData.name,
      birthday: formData.birthday,
      registeredVoter: formData.registeredVoter,
      voterState: isRep && selectedRep ? selectedRep.state : formData.voterState,
      politicalAffiliation: isRep && selectedRep ? selectedRep.party : formData.politicalAffiliation,
      bio: formData.bio || (isRep && selectedRep ? `Official verified profile for representative ${selectedRep.name} of ${selectedRep.state}.` : "Civic-minded citizen interested in transparency."),
      isRepresentative: isRep,
      representativeId: claimedRepId,
      avatarUrl: isRep ? "💼" : "👤"
    };

    onLogin(finalProfile);
  };

  const handleQuickLoginAsCitizen = () => {
    const citizenProfile: UserProfile = {
      name: "Alex Mercer",
      birthday: "1994-10-12",
      registeredVoter: "Yes",
      voterState: "PA",
      politicalAffiliation: "Independent",
      bio: "Dedicated advocate for campaign finance reform and visual data reporting.",
      isRepresentative: false,
      avatarUrl: "👤"
    };
    onLogin(citizenProfile);
  };

  const handleQuickLoginAsRepresentative = () => {
    // Pick Bernie Sanders (S000033) if exists, else first legislator
    const rep = legislators.find(l => l.legislator_id === "S000033") || legislators[0];
    if (rep) {
      const repProfile: UserProfile = {
        name: rep.name,
        birthday: "1941-09-08",
        registeredVoter: "Yes",
        voterState: rep.state,
        politicalAffiliation: rep.party,
        bio: `Official congressional broadcast channel for ${rep.role} ${rep.name}.`,
        isRepresentative: true,
        representativeId: rep.legislator_id,
        avatarUrl: "💼"
      };
      onLogin(repProfile);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start p-1.5">
      
      {/* Left Column: Form & Simulator Controls */}
      <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850/60 p-6 rounded-2xl space-y-6">
        
        {!user ? (
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-wider uppercase">Civic Credential Core</h2>
                <p className="text-xs text-slate-400 mt-1">Register your voter status to unlock debate and challenge actions</p>
              </div>
              <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button aria-label="Register account"
                  onClick={() => setIsSignUp(true)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    isSignUp ? 'bg-slate-850 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Register
                </button>
                <button aria-label="Sign in"
                  onClick={() => setIsSignUp(false)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    !isSignUp ? 'bg-slate-850 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Sign In
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/25 border border-red-900/40 text-red-400 text-xs flex items-center gap-2 font-mono">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isSignUp ? (
              <form onSubmit={handleSubmit} className="space-y-4.5 mt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Full Legal Name</label>
                    <div className="relative">
                      <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Johnathan Q. Voter"
                        className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Birthday field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Date of Birth</label>
                    <div className="relative">
                      <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Voter Registration status */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Registered Voter?</label>
                    <select name="registeredVoter"
                      value={formData.registeredVoter}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="Yes">Yes, Registered</option>
                      <option value="No">No, Eligible</option>
                      <option value="Not Registered">Not Registered</option>
                    </select>
                  </div>

                  {/* Voter State */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Vesting State</label>
                    <select name="voterState"
                      value={formData.voterState}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-bold"
                    >
                      {US_STATES.map(s => (
                        <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Political affiliation */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Party / Lean</label>
                    <select name="politicalAffiliation"
                      value={formData.politicalAffiliation}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="Independent">Independent</option>
                      <option value="Democrat">Democrat</option>
                      <option value="Republican">Republican</option>
                      <option value="Libertarian">Libertarian</option>
                      <option value="Green">Green</option>
                      <option value="Democratic Socialist">Socialist</option>
                      <option value="Reform">Reform Party</option>
                    </select>
                  </div>
                </div>

                {/* Brief Bio */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Political Bio (Optional)</label>
                  <textarea name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Focus areas: Federal transparency, stock trade limits, public funding of campaigns..."
                    className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                {/* Politician Mode Toggle */}
                <div className="p-3.5 bg-indigo-950/15 border border-indigo-900/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-indigo-400" />
                      <span className="text-xs font-bold text-white">Simulate Representative Mode</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isRepresentative"
                        checked={formData.isRepresentative}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                  
                  {formData.isRepresentative && (
                    <div className="space-y-1.5 animate-fade-in pt-1 border-t border-indigo-900/20">
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Select which existing representative you wish to claim. This authorizes you to publish updates inside the official <strong>Press Room</strong>.
                      </p>
                      <select name="representativeId"
                        value={formData.representativeId}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-indigo-900/40 rounded-lg py-1.5 px-2.5 text-xs text-indigo-200 focus:outline-none font-bold"
                      >
                        {legislators.map(l => (
                          <option key={l.legislator_id} value={l.legislator_id}>
                            {l.role} {l.name} ({l.party === 'Democrat' ? 'D' : l.party === 'Republican' ? 'R' : 'I'}-{l.state})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <button type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-950/45 transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Fingerprint size={14} />
                  Assemble Live Voter Account
                </button>
              </form>
            ) : (
              // Sign-in Simulation
              <div className="space-y-5 mt-5">
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Select a quick-login simulation track below to immediately explore citizen debating or lawmaker broadcasting.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <button onClick={handleQuickLoginAsCitizen}
                      className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-4 rounded-xl text-left transition-all hover:border-slate-700 flex flex-col justify-between h-[110px]"
                    >
                      <span className="w-7 h-7 rounded-lg bg-emerald-950/50 border border-emerald-900 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        👤
                      </span>
                      <div>
                        <div className="text-xs font-black text-white">Alex Mercer (Citizen)</div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Voter State: PA • Lean: Ind</p>
                      </div>
                    </button>

                    <button onClick={handleQuickLoginAsRepresentative}
                      className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-4 rounded-xl text-left transition-all hover:border-slate-700 flex flex-col justify-between h-[110px]"
                    >
                      <span className="w-7 h-7 rounded-lg bg-indigo-950/50 border border-indigo-900 text-indigo-400 flex items-center justify-center text-xs font-bold">
                        💼
                      </span>
                      <div>
                        <div className="text-xs font-black text-white">Official Legislator Account</div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Authorizes Lawmaker Broadcasts</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <Lock size={12} />
                  <span>PREVIEW ENVIRONMENT • NO REAL PASSWORDS REQUIRED</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Signed-in display
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-wider uppercase">Active Account</h2>
                <p className="text-xs text-slate-400 mt-1">Credential verified. You are cleared for debates & broadcasts.</p>
              </div>
              <button onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-950 border border-rose-900/40 text-rose-400 text-xs font-bold rounded-xl transition-all"
              >
                <LogOut size={12} />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-3xl p-2.5 bg-slate-900 border border-slate-800 rounded-xl leading-none">
                  {user.avatarUrl}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    {user.name}
                    {user.isRepresentative && (
                      <span className="px-1.5 py-0.5 bg-indigo-950 text-indigo-400 text-[8px] font-black rounded border border-indigo-900/60 font-mono tracking-wider uppercase">
                        REPRESENTATIVE
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-500" />
                      DOB: {user.birthday}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-500" />
                      State: <strong className="text-slate-200 font-mono font-bold">{user.voterState}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {user.bio && (
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-900 font-medium">
                  {user.bio}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl">
                  <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-wide">Voter Status</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400">{user.registeredVoter === 'Yes' ? 'Active Registered' : 'Not Registered'}</span>
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl">
                  <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-wide">Affiliation</span>
                  <p className="text-xs font-bold text-indigo-300 mt-1">{user.politicalAffiliation}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Dynamic holographic Voter ID Card Preview */}
      <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-[90px]">
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Holographic Voter Credential</div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 before:absolute before:inset-0 before:bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.03)_40%,rgba(255,255,255,0)_50%)] before:pointer-events-none">
          {/* Top holographic header line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 opacity-60" />

          {/* Card Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">CONGRESSIONAL INSIGHT</span>
              <h3 className="text-xs font-black tracking-widest text-white uppercase">CIVIC ID CARD</h3>
            </div>
            <Fingerprint size={28} className="text-indigo-400 opacity-40 animate-pulse" />
          </div>

          {/* Central ID Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase block">Voter Name</span>
                <span className="text-sm font-black text-white tracking-wide block truncate max-w-[190px]">
                  {user ? user.name : (formData.name || "Awaiting Credentials")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-mono text-slate-500 uppercase block">Reg State</span>
                <span className="text-sm font-black font-mono text-emerald-400 block">
                  {user ? user.voterState : formData.voterState}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-800/80 py-3">
              <div>
                <span className="text-[8px] font-mono text-slate-500 uppercase block">Registered?</span>
                <span className="text-xs font-bold text-white block mt-0.5">
                  {user ? user.registeredVoter : formData.registeredVoter}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-mono text-slate-500 uppercase block">Affiliation</span>
                <span className="text-xs font-bold text-indigo-400 block mt-0.5">
                  {user ? user.politicalAffiliation : formData.politicalAffiliation}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Card code / simulated barcode */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="space-y-1">
              <span className="text-[7px] font-mono text-slate-600 block">CARD ID NUMBER</span>
              <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider block">
                {user ? `V-965-${user.voterState}-${user.birthday.replace(/-/g, '').slice(2)}` : `V-965-${formData.voterState}-PENDING`}
              </span>
            </div>
            
            {/* Barcode representation */}
            <div className="flex gap-[2px] items-center h-7 opacity-30 shrink-0">
              <span className="w-[1px] h-full bg-slate-300" />
              <span className="w-[2px] h-full bg-slate-300" />
              <span className="w-[1px] h-full bg-slate-300" />
              <span className="w-[3px] h-full bg-slate-300" />
              <span className="w-[1px] h-full bg-slate-300" />
              <span className="w-[2px] h-full bg-slate-300" />
              <span className="w-[4px] h-full bg-slate-300" />
              <span className="w-[1px] h-full bg-slate-300" />
              <span className="w-[2px] h-full bg-slate-300" />
            </div>
          </div>
        </div>

        {/* Informative alert box */}
        <div className="p-4 bg-slate-900/20 border border-slate-850 rounded-2xl flex gap-3 text-xs text-slate-400 leading-relaxed font-medium">
          <UserCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-300">Participation Clearance:</strong> Registering lets you initiate debate threads, support/discredit other citizen appeals, and upvote lawmaker broadcasts.
          </div>
        </div>
      </div>

    </div>
  );
}
