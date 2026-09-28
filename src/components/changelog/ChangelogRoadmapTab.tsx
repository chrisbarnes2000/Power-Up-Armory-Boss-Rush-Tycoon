import React from 'react';
import { ThumbsUp, MessageSquare, Send } from 'lucide-react';
import { RoadmapItem } from './types';
import { User } from 'firebase/auth';

interface ChangelogRoadmapTabProps {
  roadmapItems: RoadmapItem[];
  votedIds: Set<string>;
  feedbackSubmitted: boolean;
  feedbackCategory: string;
  setFeedbackCategory: (cat: string) => void;
  feedbackInput: string;
  setFeedbackInput: (val: string) => void;
  onSubmitFeedback: (e: React.FormEvent) => void;
  onVote: (id: string) => void;
  user: User | null;
  isAdmin: boolean;
  isBeta: boolean;
  onToggleBeta: (enabled: boolean) => void;
}

export const ChangelogRoadmapTab: React.FC<ChangelogRoadmapTabProps> = ({
  roadmapItems,
  votedIds,
  feedbackSubmitted,
  feedbackCategory,
  setFeedbackCategory,
  feedbackInput,
  setFeedbackInput,
  onSubmitFeedback,
  onVote
}) => {
  return (
    <div className="flex flex-col gap-8">
      {/* Roadmap Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {roadmapItems.map((item) => (
          <div key={item.id} className="p-4 sm:p-5 rounded-2xl bg-[#142036]/80 backdrop-blur-sm border border-[#2a4060] hover:border-amber-500/30 transition-all group flex flex-col gap-3 shadow-lg shadow-black/20">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black font-mono text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                  {item.category}
                </span>
                <h4 className="text-sm font-black text-white group-hover:text-amber-100 transition-colors">{item.title}</h4>
              </div>
              <button 
                onClick={() => onVote(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer group/vote ${
                  votedIds.has(item.id) 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105' 
                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 transition-transform group-hover/vote:scale-110 ${votedIds.has(item.id) ? 'fill-current' : ''}`} />
                <span className={`text-xs font-black font-mono transition-all ${votedIds.has(item.id) ? 'scale-110' : ''}`}>
                  {item.votes}
                </span>
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">{item.description}</p>
            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-800/50">
              <span className={`w-2 h-2 rounded-full ${item.status === 'Released' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : item.status === 'In Development' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-600'}`}></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Form */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">Champion Feedback Loop</h4>
            <p className="text-xs text-slate-400">Your vision drives the forge. What shall we craft next?</p>
          </div>
        </div>

        {feedbackSubmitted ? (
          <div className="py-10 text-center animate-fadeIn">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mb-4 border border-emerald-500/30">
              <Send className="w-7 h-7" />
            </div>
            <h5 className="text-sm font-black text-white uppercase">Suggestion Logged</h5>
            <p className="text-xs text-slate-400 mt-2">The architects are reviewing your proposal.</p>
          </div>
        ) : (
          <form onSubmit={onSubmitFeedback} className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              {['Co-Op Mode', 'Elemental Weapons', 'World Bosses', 'Achievements', 'The Forge'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFeedbackCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer ${
                    feedbackCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105 border-indigo-400' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border-slate-700'
                  } border`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <textarea 
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Detail your suggestion here (e.g., 'Add a Frost Giant boss that slows attack speed')..."
              className="w-full h-28 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none shadow-inner"
            />
            <button 
              type="submit"
              disabled={!feedbackInput.trim()}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Transmit Suggestion</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
