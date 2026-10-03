import React from 'react';
import { Settings, RefreshCw, Rocket, ShieldCheck, FlaskConical } from 'lucide-react';
import { BroadcastStatusResponse } from './types';

interface ChangelogAdminPanelProps {
  broadcastData: BroadcastStatusResponse | null;
  isLoadingBroadcast: boolean;
  isPromoting: boolean;
  isResetting: boolean;
  isRefreshingRC: boolean;
  isBroadcasting: boolean;
  broadcastError: string | null;
  broadcastSuccess: string | null;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (val: boolean) => void;
  isBatchDrawerOpen: boolean;
  setIsBatchDrawerOpen: (val: boolean) => void;
  batchVersion: string;
  setBatchVersion: (val: string) => void;
  batchSummary: string;
  setBatchSummary: (val: string) => void;
  batchTargetFeedhive: boolean;
  setBatchTargetFeedhive: (val: boolean) => void;
  batchTargetDiscord: boolean;
  setBatchTargetDiscord: (val: boolean) => void;
  isBatchPublishing: boolean;
  targetFeedhive: boolean;
  setTargetFeedhive: (val: boolean) => void;
  targetDiscord: boolean;
  setTargetDiscord: (val: boolean) => void;
  customFeedhiveCopy: string;
  setCustomFeedhiveCopy: (val: string) => void;
  customDiscordContent: string;
  setCustomDiscordContent: (val: string) => void;
  publishStatus: 'draft' | 'published';
  setPublishStatus: (val: 'draft' | 'published') => void;
  onPromoteVersion: () => void;
  onResetSync: (target: 'feedhive' | 'discord' | 'all') => void;
  onFetchBroadcastStatus: () => void;
  onForceRefreshRC: () => void;
  onToggleAutoPost: (channel: 'feedhive' | 'discord', currentValue: boolean) => void;
  onToggleFeatureFlag: (flag: 'featureCommsCheck' | 'featurePlaybookScenarios', currentValue?: boolean) => void;
  onPublishBatchRelease: () => void;
  onManualBroadcast: () => void;
  isBeta?: boolean;
  onToggleBeta?: (enabled: boolean) => void;
}

export const ChangelogAdminPanel: React.FC<ChangelogAdminPanelProps> = ({
  onForceRefreshRC,
  isRefreshingRC,
  broadcastSuccess,
  broadcastError,
  isBeta,
  onToggleBeta
}) => {
  return (
    <div className="shrink-0 flex items-center gap-4 px-6 py-2 bg-indigo-950/20 border-b border-indigo-500/20 flex-wrap">
      <div className="flex items-center gap-2 text-indigo-400">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Admin Nexus</span>
      </div>
      
      <div className="flex items-center gap-2 ml-auto flex-wrap">
        {onToggleBeta && (
          <button 
            type="button"
            onClick={() => onToggleBeta(!isBeta)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer border ${
              isBeta
                ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/40 text-amber-300'
                : 'bg-indigo-900/60 hover:bg-indigo-800 border-indigo-500/30 text-indigo-200'
            }`}
            title="Promote or Demote this session to Beta Tester privileges"
          >
            <FlaskConical className="w-3 h-3 text-amber-400" />
            <span>{isBeta ? '🧪 Beta Active (Demote)' : '⚡ Promote to Beta'}</span>
          </button>
        )}

        <button 
          type="button"
          onClick={onForceRefreshRC}
          disabled={isRefreshingRC}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshingRC ? 'animate-spin' : ''}`} />
          <span>Refresh Config</span>
        </button>
      </div>

      {broadcastSuccess && <span className="text-[10px] text-emerald-400 animate-pulse">{broadcastSuccess}</span>}
      {broadcastError && <span className="text-[10px] text-red-400">{broadcastError}</span>}
    </div>
  );
};
