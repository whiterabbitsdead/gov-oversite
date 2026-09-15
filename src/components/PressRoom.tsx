import React, { useState } from 'react';
import { LawmakerBroadcast, UserProfile } from '../types';
import { 
  Radio, 
  Megaphone, 
  Heart, 
  Eye, 
  MessageCircle, 
  Send, 
  User, 
  Plus, 
  X,
  Lock,
  Building2
} from 'lucide-react';

interface PressRoomProps {
  user: UserProfile | null;
  broadcasts: LawmakerBroadcast[];
  onAddBroadcast: (broadcast: LawmakerBroadcast) => void;
  onAddComment: (broadcastId: string, commentText: string, authorName: string, authorRole: 'Citizen' | 'Politician') => void;
  onLikeBroadcast: (broadcastId: string) => void;
}

export function PressRoom({ user, broadcasts, onAddBroadcast, onAddComment, onLikeBroadcast }: PressRoomProps) {
  const [showBroadcastDesk, setShowBroadcastDesk] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    category: 'Policy Briefing',
    content: ''
  });

  const [activeCommentBroadcastId, setActiveCommentBroadcastId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.isRepresentative) return;
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const createdBroadcast: LawmakerBroadcast = {
      id: `bc-${Date.now()}`,
      lawmakerId: user.representativeId || `rep-${Date.now()}`,
      lawmakerName: user.name,
      lawmakerRole: "Senator/Representative",
      lawmakerParty: user.politicalAffiliation,
      lawmakerState: user.voterState,
      title: `[${newPost.category}] ${newPost.title}`,
      content: newPost.content,
      timestamp: new Date().toISOString(),
      viewsCount: 14,
      likesCount: 1,
      comments: []
    };

    onAddBroadcast(createdBroadcast);
    setNewPost({ title: '', category: 'Policy Briefing', content: '' });
    setShowBroadcastDesk(false);
  };

  const handlePostComment = (e: React.FormEvent, broadcastId: string) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    
    const authorName = user ? user.name : "Anonymous Citizen";
    const authorRole = user && user.isRepresentative ? 'Politician' : 'Citizen';

    onAddComment(broadcastId, newCommentText, authorName, authorRole);
    setNewCommentText('');
    setActiveCommentBroadcastId(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1.5">
      
      {/* Press Room Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-900/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1.5 max-w-2xl">
          <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest font-mono flex items-center gap-1">
            <Radio size={12} className="text-indigo-400 animate-pulse" />
            Official Broadcast Center
          </span>
          <h2 className="text-xl font-black text-white tracking-tight uppercase">Press Room & Legislative Despatch</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Verified federal representatives post press statements, brief constituents on active committees, and explain their campaign finance structure. Register a Politician profile under credentials to compose broadcasts.
          </p>
        </div>

        {user && user.isRepresentative ? (
          <button onClick={() => setShowBroadcastDesk(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-indigo-950/20 flex items-center justify-center gap-1.5 uppercase tracking-wider shrink-0"
          >
            <Plus size={14} />
            Broadcast Statement
          </button>
        ) : (
          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center gap-2.5 max-w-[280px]">
            <Lock size={14} className="text-slate-500 shrink-0" />
            <p className="text-[10px] text-slate-400 leading-normal">
              You are browsing as a citizen. Claim a representative card under <strong className="text-slate-300">Credentials</strong> to enable broadcast posting.
            </p>
          </div>
        )}
      </div>

      {/* Broadcast desk compose overlay */}
      {showBroadcastDesk && user && user.isRepresentative && (
        <div className="p-5 bg-slate-900 border border-indigo-900/40 rounded-2xl space-y-4 animate-fade-in relative">
          <button onClick={() => setShowBroadcastDesk(false)}
            className="absolute top-4 right-4 text-slate-500 hover:text-white"
          >
            <X size={15} />
          </button>
          
          <div className="flex items-center gap-2">
            <Megaphone size={15} className="text-indigo-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Broadcast Statement to Constituents</h3>
          </div>

          <form onSubmit={handleCreateBroadcast} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Statement Headline</label>
                <input type="text"
                  placeholder="e.g. My committee stance on high-tech manufacturing subsidies"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Broadcast Type</label>
                <select value={newPost.category}
                  onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="Policy Briefing">Policy Briefing</option>
                  <option value="Town Hall Update">Town Hall Update</option>
                  <option value="Finance Clarification">Finance Statement</option>
                  <option value="Legislative Stance">Legislative Stance</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Broadcast Body Content</label>
              <textarea placeholder="Draft your detailed statement or updates here. Share active committee efforts or campaign funding declarations..."
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-medium"
                required
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button type="button"
                onClick={() => setShowBroadcastDesk(false)}
                className="px-3.5 py-1.5 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-950/20 uppercase tracking-wider"
              >
                Transmit Broadcast
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Broadcast Statements List */}
      <div className="space-y-6">
        {broadcasts.map(bc => (
          <div key={bc.id} className="bg-slate-900/35 border border-slate-850/80 p-5 rounded-2xl space-y-4">
            
            {/* Metadata bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-lg leading-none shadow shadow-slate-950">
                  💼
                </span>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    {bc.lawmakerName}
                    <span className="px-1.5 py-0.5 bg-indigo-950/40 text-indigo-400 text-[8px] font-black border border-indigo-900/30 rounded uppercase font-mono tracking-tight">
                      {bc.lawmakerRole} • {bc.lawmakerParty.slice(0,3)}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    District State representation: {bc.lawmakerState} • Published {new Date(bc.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-950/40 border border-slate-850 p-1 px-2.5 rounded-lg">
                <Eye size={12} className="text-slate-500" />
                <span className="font-bold text-slate-400">{bc.viewsCount} reads</span>
              </div>
            </div>

            {/* Content Headline & Body */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white">{bc.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-950/10 p-3 rounded-xl border border-slate-900">
                {bc.content}
              </p>
            </div>

            {/* Reaction bar */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button onClick={() => onLikeBroadcast(bc.id)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/30 text-rose-400 text-[10px] font-bold rounded-lg transition-all"
                >
                  <Heart size={11} className="fill-rose-400/10" />
                  <span>Support Statement</span>
                  <span className="text-white bg-rose-900/40 px-1 rounded font-mono font-bold">{bc.likesCount}</span>
                </button>
              </div>

              <button onClick={() => {
                  setActiveCommentBroadcastId(activeCommentBroadcastId === bc.id ? null : bc.id);
                }}
                className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-white uppercase transition-colors"
              >
                <MessageCircle size={12} />
                <span>Constituent Feedback ({bc.comments.length})</span>
              </button>
            </div>

            {/* Comment Form Overlay */}
            {activeCommentBroadcastId === bc.id && (
              <form onSubmit={(e) => handlePostComment(e, bc.id)} className="bg-slate-950/50 p-3 rounded-xl border border-slate-850 flex items-center gap-2 animate-fade-in">
                <input type="text"
                  placeholder="Post objective constituent feedback or inquiries..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none font-semibold px-2"
                  required
                />
                <button type="submit"
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                >
                  <Send size={12} />
                </button>
              </form>
            )}

            {/* Comment listings */}
            {bc.comments.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800/60">
                {bc.comments.map(c => (
                  <div key={c.id} className="bg-slate-950/25 border border-slate-900 p-2.5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-300 flex items-center gap-1">
                        {c.authorRole === 'Politician' ? '💼' : '👤'} {c.authorName}
                        {c.authorRole === 'Politician' && (
                          <span className="text-[7px] bg-indigo-950 text-indigo-400 px-1 rounded font-black border border-indigo-900/40">OFFICIAL</span>
                        )}
                      </span>
                      <span className="text-[8px] text-slate-500 font-mono">
                        {new Date(c.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal pl-4 font-medium">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
