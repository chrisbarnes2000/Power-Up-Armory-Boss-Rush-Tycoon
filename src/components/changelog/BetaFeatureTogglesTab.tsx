import React from 'react';
import { FlaskConical, Beaker, ShieldAlert } from 'lucide-react';
import { User } from 'firebase/auth';

interface BetaFeatureTogglesTabProps {
  isBeta: boolean;
  onToggleBeta: (enabled: boolean) => void;
  isAdmin: boolean;
  user: User | null;
}

export const BetaFeatureTogglesTab: React.FC<BetaFeatureTogglesTabProps> = ({
  isBeta,
  onToggleBeta
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="p-5 rounded-2xl bg-amber-950/10 border border-amber-500/20 flex flex-col gap-3">
        <div className="flex items-center gap-3 text-amber-500">
          <ShieldAlert className="w-5 h-5" />
          <h4 className="text-sm font-bold uppercase tracking-wider">Experimental Access</h4>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Beta features are under active development and may be unstable. Enabling these provides early access to mechanics still in the forge.
        </p>
        
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800 mt-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Tester Mode</span>
              <span className="text-[10px] text-slate-500">Unlocks developer logs and alpha tabs</span>
            </div>
          </div>
          <button 
            onClick={() => onToggleBeta(!isBeta)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isBeta ? 'bg-amber-500' : 'bg-slate-700'}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isBeta ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50 pointer-events-none">
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Beaker className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-400">WebGL Particles</span>
          </div>
          <span className="text-[9px] font-mono text-slate-600">LOCKED</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Beaker className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-400">Social Federation</span>
          </div>
          <span className="text-[9px] font-mono text-slate-600">LOCKED</span>
        </div>
      </div>
    </div>
  );
};
