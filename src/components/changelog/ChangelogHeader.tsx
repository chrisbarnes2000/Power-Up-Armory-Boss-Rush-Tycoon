import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface ChangelogHeaderProps {
  publicVersion: string;
  currentVersion: string;
  isDevBuildAhead: boolean;
  isAdmin: boolean;
  isBeta: boolean;
  onClose: () => void;
}

export const ChangelogHeader: React.FC<ChangelogHeaderProps> = ({
  publicVersion,
  currentVersion,
  isDevBuildAhead,
  isAdmin,
  isBeta,
  onClose
}) => {
  return (
    <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#1a2942] bg-[#0d1526]">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            System Updates
            {isDevBuildAhead && (
              <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-tighter">
                Preview Build
              </span>
            )}
          </h2>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
            Currently running {currentVersion} • Public {publicVersion}
          </p>
        </div>
      </div>
      <button 
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
