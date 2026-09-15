import React, { useState } from 'react';
import { DebatePost, DebateChallenge, UserProfile } from '../types';
import { 
  MessageSquare, 
  ThumbsUp, 
  Search, 
  Plus, 
  Flame, 
  ShieldAlert, 
  Link, 
  User, 
  Award, 
  ChevronDown, 
  TrendingUp,
  X,
  AlertCircle
} from 'lucide-react';

interface CivicArenaProps {
  user: UserProfile | null;
  debates: DebatePost[];
  onAddDebate: (debate: DebatePost) => void;
  onAddChallenge: (debateId: string, challenge: DebateChallenge) => void;
  onVoteDebate: (debateId: string, type: 'support' | 'discredit' | 'appeal') => void;
}

const CATEGORIES = [
  'All',
  'PAC Funding',
  'Legislative Speed',
  'Conflict of Interest',
  'Constituent Oversight',
  'CEL Performance'
] as const;

export function CivicArena({ user, debates, onAddDebate, onAddChallenge, onVoteDebate }: CivicArenaProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create debate modal/form toggle
  const [showCreateDebate, setShowCreateDebate] = useState(false);
  const [newDebate, setNewDebate] = useState({
    title: '',
    category: 'Conflict of Interest' as DebatePost['category'],
    mainArgument: ''
  });

  // Reply challenge form state per debate ID
  const [activeReplyDebateId, setActiveReplyDebateId] = useState<string | null>(null);
  const [newChallenge, setNewChallenge] = useState({
    type: 'challenge' as 'appeal' | 'challenge' | 'discredit',
    argumentText: '',
    evidenceUrl: ''
  });

  const handleCreateDebateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newDebate.title.trim() || !newDebate.mainArgument.trim()) return;

    const createdDebate: DebatePost = {
      id: `debate-${Date.now()}`,
      title: newDebate.title,
      category: newDebate.category,
      mainArgument: newDebate.mainArgument,
      authorName: user.name,
      authorVoterState: user.voterState,
      authorRole: user.isRepresentative ? 'Politician' : 'Citizen',
      timestamp: new Date().toISOString(),
      supportCount: 1,
      discreditCount: 0,
      appealCount: 0,
      challenges: []
    };

    onAddDebate(createdDebate);
    setNewDebate({ title: '', category: 'Conflict of Interest', mainArgument: '' });
    setShowCreateDebate(false);
  };

  const handleCreateChallengeSubmit = (e: React.FormEvent, debateId: string) => {
    e.preventDefault();
    if (!user) return;
    if (!newChallenge.argumentText.trim()) return;

    const createdChallenge: DebateChallenge = {
      id: `challenge-${Date.now()}`,
      authorName: user.name,
      authorVoterState: user.voterState,
      authorRole: user.isRepresentative ? 'Politician' : 'Citizen',
      type: newChallenge.type,
      argumentText: newChallenge.argumentText,
      evidenceLinks: newChallenge.evidenceUrl ? [newChallenge.evidenceUrl] : [],
      timestamp: new Date().toISOString(),
      upvotes: 0
    };

    onAddChallenge(debateId, createdChallenge);
    setNewChallenge({ type: 'challenge', argumentText: '', evidenceUrl: '' });
    setActiveReplyDebateId(null);
  };

  // Filtered debates
  const filteredDebates = debates.filter(d => {
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.mainArgument.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-1.5">
      
      {/* Banner / Info Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/80 border border-slate-850 p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest font-mono">Civic Arena</span>
          <h2 className="text-xl font-black text-white tracking-tight uppercase">Debate, Appeal & Challenge Platform</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Challenge politician records, appeal policy impacts, or discredit lobbying arguments with verified voter credentials. All discussions are sorted objectively by constructive engagement metrics.
          </p>
        </div>

        <button onClick={() => {
            if (user) {
              setShowCreateDebate(true);
            } else {
              alert("Please register or sign in under 'Voter Credential Core' to initialize a debate.");
            }
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-indigo-950/30 flex items-center justify-center gap-1.5 uppercase tracking-wider shrink-0"
        >
          <Plus size={14} />
          Launch Debate
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {CATEGORIES.map(cat => (
            <button aria-label="setSelectedCategory(cat)} className=`} >"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat 
                  ? 'bg-slate-800 text-white border border-slate-700' 
                  : 'text-slate-400 bg-slate-950 hover:text-white border border-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 md:w-[320px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input type="text"
              placeholder="Search debates or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search debates"
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                aria-label="Clear search text"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button 
            className="h-[44px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Submit search"
          >
            Search
          </button>
        </div>
      </div>

      {/* Launch Debate Form Overlay */}
      {showCreateDebate && user && (
        <div className="p-5 bg-slate-900 border border-indigo-900/40 rounded-2xl space-y-4 animate-fade-in relative">
          <button onClick={() => setShowCreateDebate(false)}
            className="absolute top-4 right-4 text-slate-500 hover:text-white"
          >
            <X size={15} />
          </button>
          
          <div className="flex items-center gap-2">
            <Flame size={15} className="text-indigo-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Initialize New Debate Topic</h3>
          </div>

          <form onSubmit={handleCreateDebateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Debate Headline</label>
                <input type="text"
                  placeholder="e.g. Do Defense Committee assignments impact federal contracting decisions?"
                  value={newDebate.title}
                  onChange={(e) => setNewDebate(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Topic Category</label>
                <select value={newDebate.category}
                  onChange={(e) => setNewDebate(prev => ({ ...prev, category: e.target.value as DebatePost['category'] }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="Conflict of Interest">Conflict of Interest</option>
                  <option value="PAC Funding">PAC Funding</option>
                  <option value="Legislative Speed">Legislative Speed</option>
                  <option value="Constituent Oversight">Constituent Oversight</option>
                  <option value="CEL Performance">CEL Performance</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Opening Argument / Thesis</label>
              <textarea placeholder="State your opening claim clearly. Attach details, references, or links to the data provided by OpenFEC or UVA lawmakers databases..."
                value={newDebate.mainArgument}
                onChange={(e) => setNewDebate(prev => ({ ...prev, mainArgument: e.target.value }))}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-medium"
                required
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button type="button"
                onClick={() => setShowCreateDebate(false)}
                className="px-3.5 py-1.5 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-950/20 uppercase tracking-wider"
              >
                Publish Thesis
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Debate Posts Feed */}
      <div className="space-y-6">
        {filteredDebates.length > 0 ? (
          filteredDebates.map(debate => (
            <div key={debate.id} className="bg-slate-900/35 border border-slate-850/80 p-5 rounded-2xl space-y-4">
              
              {/* Debate Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/60 pb-3">
                <div className="space-y-1 max-w-[80%]">
                  <span className="px-2 py-0.5 bg-indigo-950/50 text-indigo-400 text-[9px] font-black rounded border border-indigo-900/40 uppercase font-mono tracking-wider">
                    🏷️ {debate.category}
                  </span>
                  <h3 className="text-sm font-black text-white leading-snug pt-1">{debate.title}</h3>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-850 px-2 py-1 rounded-lg">
                  <User size={11} className="text-slate-500" />
                  <span className="text-[10px] text-slate-300 font-bold">{debate.authorName}</span>
                  <span className="text-[8px] font-mono bg-slate-900 text-slate-500 px-1.5 rounded uppercase border border-slate-850 font-bold">
                    {debate.authorRole} • {debate.authorVoterState || 'US'}
                  </span>
                </div>
              </div>

              {/* Debate Main Thesis */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/30 p-4.5 rounded-xl border border-slate-900 border-l-2 border-l-indigo-500/60 font-medium">
                {debate.mainArgument}
              </p>

              {/* Engagement Controls: Support, Appeal, Discredit */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onVoteDebate(debate.id, 'support')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-900/40 text-emerald-400 text-[10px] font-bold rounded-lg transition-all font-mono"
                    title="Vouch for this thesis as robust and accurate"
                  >
                    👍 Support <span className="text-white font-extrabold bg-emerald-900/40 px-1 rounded">{debate.supportCount}</span>
                  </button>

                  <button onClick={() => onVoteDebate(debate.id, 'appeal')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 text-[10px] font-bold rounded-lg transition-all font-mono"
                    title="Request review, add priority index"
                  >
                    ⚖️ Appeal <span className="text-white font-extrabold bg-indigo-900/40 px-1 rounded">{debate.appealCount}</span>
                  </button>

                  <button onClick={() => onVoteDebate(debate.id, 'discredit')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/40 text-rose-400 text-[10px] font-bold rounded-lg transition-all font-mono"
                    title="Challenge truth value, demand fact-check"
                  >
                    🛑 Discredit <span className="text-white font-extrabold bg-rose-900/40 px-1 rounded">{debate.discreditCount}</span>
                  </button>
                </div>

                <button onClick={() => {
                    if (user) {
                      setActiveReplyDebateId(activeReplyDebateId === debate.id ? null : debate.id);
                    } else {
                      alert("Please log in to respond to this debate.");
                    }
                  }}
                  className="flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-white uppercase transition-colors"
                >
                  <MessageSquare size={12} />
                  <span>Reply & Challenge ({debate.challenges.length})</span>
                </button>
              </div>

              {/* Reply form */}
              {activeReplyDebateId === debate.id && user && (
                <form onSubmit={(e) => handleCreateChallengeSubmit(e, debate.id)} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-white uppercase tracking-wider">Post Counter-Argument</span>
                    
                    <div className="flex gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                      <button aria-label="setNewChallenge(prev => ())} className=`} > Challe"
                        type="button"
                        onClick={() => setNewChallenge(prev => ({ ...prev, type: 'challenge' }))}
                        className={`px-2 py-0.5 text-[9px] font-black rounded uppercase transition-all ${
                          newChallenge.type === 'challenge' ? 'bg-amber-950 text-amber-400 font-bold border border-amber-900/40' : 'text-slate-500'
                        }`}
                      >
                        Challenge
                      </button>
                      <button aria-label="setNewChallenge(prev => ())} className=`} > Appeal"
                        type="button"
                        onClick={() => setNewChallenge(prev => ({ ...prev, type: 'appeal' }))}
                        className={`px-2 py-0.5 text-[9px] font-black rounded uppercase transition-all ${
                          newChallenge.type === 'appeal' ? 'bg-indigo-950 text-indigo-400 font-bold border border-indigo-900/40' : 'text-slate-500'
                        }`}
                      >
                        Appeal
                      </button>
                      <button aria-label="setNewChallenge(prev => ())} className=`} > Discre"
                        type="button"
                        onClick={() => setNewChallenge(prev => ({ ...prev, type: 'discredit' }))}
                        className={`px-2 py-0.5 text-[9px] font-black rounded uppercase transition-all ${
                          newChallenge.type === 'discredit' ? 'bg-rose-950 text-rose-400 font-bold border border-rose-900/40' : 'text-slate-500'
                        }`}
                      >
                        Discredit
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <textarea placeholder={`Draft your ${newChallenge.type} details here. Include specific reasoning...`}
                      value={newChallenge.argumentText}
                      onChange={(e) => setNewChallenge(prev => ({ ...prev, argumentText: e.target.value }))}
                      rows={2.5}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                    
                    <div className="relative">
                      <Link size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="url"
                        placeholder="Attach reference URL (e.g. Congress.gov or OpenFEC link)..."
                        value={newChallenge.evidenceUrl}
                        onChange={(e) => setNewChallenge(prev => ({ ...prev, evidenceUrl: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 pl-7 pr-3 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 text-[10px]">
                    <button type="button"
                      onClick={() => setActiveReplyDebateId(null)}
                      className="px-2.5 py-1 text-slate-500 hover:text-white"
                    >
                      Close
                    </button>
                    <button type="submit"
                      className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold uppercase tracking-wider"
                    >
                      Post {newChallenge.type}
                    </button>
                  </div>
                </form>
              )}

              {/* List of Challenges / Responses */}
              {debate.challenges.length > 0 && (
                <div className="space-y-2.5 pl-3 sm:pl-5 border-l border-slate-800/80 pt-2">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Counter-Challenges ({debate.challenges.length})</span>
                  {debate.challenges.map(chall => (
                    <div key={chall.id} className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 text-[8px] font-black rounded uppercase ${
                            chall.type === 'challenge' ? 'bg-amber-950/50 text-amber-400 border border-amber-900/30' :
                            chall.type === 'appeal' ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-900/30' :
                            'bg-rose-950/50 text-rose-400 border border-rose-900/30'
                          }`}>
                            {chall.type}
                          </span>
                          <span className="font-bold text-white">{chall.authorName}</span>
                          <span className="text-[7px] font-mono text-slate-500 uppercase">({chall.authorRole} • {chall.authorVoterState || 'US'})</span>
                        </div>
                        
                        <span className="text-[8px] font-mono text-slate-500">
                          {new Date(chall.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                        {chall.argumentText}
                      </p>

                      {chall.evidenceLinks && chall.evidenceLinks.length > 0 && (
                        <div className="flex items-center gap-1 text-[8px] font-mono text-indigo-400 bg-slate-900/50 p-1 px-2 rounded border border-slate-850 inline-block">
                          <Link size={8} />
                          <a href={chall.evidenceLinks[0]} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[200px]">
                            {chall.evidenceLinks[0]}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-slate-900/20 border border-slate-850 rounded-2xl">
            <AlertCircle className="mx-auto text-slate-600 mb-2" size={24} />
            <p className="text-xs text-slate-400">No debates match your active filter. Be the first to start a debate!</p>
          </div>
        )}
      </div>

    </div>
  );
}
