import React, { useState, useEffect } from 'react';
import { FlaskConical, Beaker, ShieldAlert, Sparkles, Cloud, Lock, Unlock, Key, ShieldCheck, Zap } from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  getIsParticleFxEnabled, 
  setIsParticleFxEnabled, 
  getIsCloudAutoSyncEnabled, 
  setIsCloudAutoSyncEnabled 
} from '../../lib/remoteConfig';
import { triggerParticleBurst } from '../common/ParticleFX';
import { trackEvent } from '../../lib/analytics';

interface BetaFeatureTogglesTabProps {
  isBeta: boolean;
  onToggleBeta: (enabled: boolean) => void;
  isAdmin: boolean;
  user: User | null;
}

export const BetaFeatureTogglesTab: React.FC<BetaFeatureTogglesTabProps> = ({
  isBeta,
  onToggleBeta,
  isAdmin,
  user
}) => {
  const [particleFxEnabled, setParticleFxEnabledState] = useState<boolean>(getIsParticleFxEnabled());
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState<boolean>(getIsCloudAutoSyncEnabled());
  const [testBurstActive, setTestBurstActive] = useState<boolean>(false);
  const [justActivatedNotice, setJustActivatedNotice] = useState<boolean>(false);

  const canEdit = Boolean(isAdmin || isBeta);

  useEffect(() => {
    const handleFeatureChanged = (e: any) => {
      if (e.detail?.feature === 'particle_fx') {
        setParticleFxEnabledState(e.detail.enabled);
      }
      if (e.detail?.feature === 'auto_sync') {
        setAutoSyncEnabledState(e.detail.enabled);
      }
    };
    window.addEventListener('beta_feature_changed', handleFeatureChanged);
    return () => window.removeEventListener('beta_feature_changed', handleFeatureChanged);
  }, []);

  const handleToggleParticleFx = () => {
    if (!canEdit) return;
    const next = !particleFxEnabled;
    setParticleFxEnabledState(next);
    setIsParticleFxEnabled(next);
    trackEvent('beta_flag_toggled', { flag: 'particle_fx', enabled: next });
    // Admin log
    if (isAdmin) trackEvent('admin_action_toggle_feature', { feature: 'particle_fx', enabled: next, user: user?.uid });
    
    if (next) {
      triggerParticleBurst('victory');
    }
  };

  const handleToggleAutoSync = () => {
    if (!canEdit) return;
    const next = !autoSyncEnabled;
    setAutoSyncEnabledState(next);
    setIsCloudAutoSyncEnabled(next);
    trackEvent('beta_flag_toggled', { flag: 'auto_sync', enabled: next });
    // Admin log
    if (isAdmin) trackEvent('admin_action_toggle_feature', { feature: 'auto_sync', enabled: next, user: user?.uid });
  };

  const handleTriggerTestBurst = () => {
    setTestBurstActive(true);
    triggerParticleBurst('victory');
    setTimeout(() => setTestBurstActive(false), 1200);
  };

  const handleActivateTempPass = () => {
    onToggleBeta(true);
    setJustActivatedNotice(true);
    trackEvent('beta_temp_workaround_activated');
    setTimeout(() => setJustActivatedNotice(false), 4000);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Overview Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/10 border border-amber-500/30 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 text-amber-400 font-mono">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h4 className="text-sm font-black uppercase tracking-wider">Experimental Feature Forge &amp; Paywall Previews</h4>
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full uppercase">
            Beta Engine Active
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Preview and configure bleeding-edge mechanics before public deployment.
          Features flagged with <strong className="text-amber-400">Paywall Preview</strong> are undergoing balance tuning and will transition to future premium tier subscriptions.
        </p>
      </div>

      {/* Access Permission Control / Temporary Workaround Card */}
      {!canEdit ? (
        <div className="p-4.5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/50 border border-indigo-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-300 font-mono font-bold text-xs">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>BETA CONTROLS RESTRICTED</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Modifying experimental flags requires verified <strong>Beta Tester</strong> status or <strong>Admin</strong> privileges.
            </p>
          </div>
          <button
            type="button"
            onClick={handleActivateTempPass}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
            title="Unlock instant temporary beta tester permissions in this browser"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Activate Temporary Tester Pass</span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2 text-emerald-300 font-mono font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isAdmin ? '👑 Sovereign Admin Access · Controls Unlocked' : '🧪 Beta Tester Verified · Controls Unlocked'}</span>
            {justActivatedNotice && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full animate-pulse">
                Pass Activated!
              </span>
            )}
          </div>
          {!isAdmin && (
            <button
              type="button"
              onClick={() => onToggleBeta(false)}
              className="text-[10px] font-mono text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Deactivate Tester Pass
            </button>
          )}
        </div>
      )}

      {/* Master Tester Mode Card */}
      <div className={`flex items-center justify-between p-4.5 rounded-2xl bg-[#0e1628] border transition-all ${canEdit ? 'border-cyan-500/40 shadow-md' : 'border-slate-800 opacity-75'}`}>
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-xl ${canEdit ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white block font-mono">Master Tester Mode &amp; Dev Logs</span>
              <span className="text-[9px] bg-cyan-950 text-cyan-300 px-2 py-0.2 rounded-full font-mono border border-cyan-500/30">Alpha Channel</span>
            </div>
            <span className="text-[11px] text-slate-400">Unlocks raw developer changelogs, live engine telemetry, and experimental preview tabs</span>
          </div>
        </div>
        <button 
          type="button"
          disabled={!canEdit}
          onClick={() => onToggleBeta(!isBeta)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${!canEdit ? 'opacity-40 cursor-not-allowed bg-slate-800' : isBeta ? 'bg-cyan-500 cursor-pointer' : 'bg-slate-700 cursor-pointer'}`}
          title={canEdit ? 'Toggle Tester Mode' : 'Activate Temporary Tester Pass to unlock controls'}
        >
          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isBeta ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Paywall Preview Beta Toggles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Flag 1: Particle FX & Health Mesh Vignette */}
        <div className={`p-4.5 rounded-2xl bg-[#0e1628] border flex flex-col justify-between space-y-4 shadow-md transition-all ${canEdit ? 'border-amber-500/30' : 'border-slate-800 opacity-75'}`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-white font-mono">Celestial Visual FX Engine</span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Paywall Preview</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Activates the dynamic particle canvas overlay (victory confetti, coin fountains, combat clash sparks) and the 6-second continuous decay <strong className="text-amber-300">Health Mesh Vignette</strong> screen damage filter.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={handleTriggerTestBurst}
              disabled={!particleFxEnabled}
              className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/60 disabled:opacity-30 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <span>{testBurstActive ? '✨ Bursting!' : 'Test FX Burst ✨'}</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">{particleFxEnabled ? 'Active' : 'Disabled'}</span>
              <button 
                type="button"
                disabled={!canEdit}
                onClick={handleToggleParticleFx}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${!canEdit ? 'opacity-40 cursor-not-allowed bg-slate-800' : particleFxEnabled ? 'bg-amber-500 cursor-pointer' : 'bg-slate-700 cursor-pointer'}`}
                title={canEdit ? 'Toggle Particle FX' : 'Activate Temporary Tester Pass to unlock controls'}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${particleFxEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Flag 2: Background Cloud Auto-Sync */}
        <div className={`p-4.5 rounded-2xl bg-[#0e1628] border flex flex-col justify-between space-y-4 shadow-md transition-all ${canEdit ? 'border-blue-500/30' : 'border-slate-800 opacity-75'}`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Cloud className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-white font-mono">Background Cloud Auto-Sync</span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Paywall Preview</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Continuously synchronizes and saves player gold reserves, equipment ranks, custom chronicles, and defeated boss milestones to Google Cloud Firestore every 30 seconds.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-[10px] font-mono text-slate-400">
              {autoSyncEnabled ? '⚡ 30s Loop Active' : '⏸️ Manual Sync Only'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">{autoSyncEnabled ? 'Active' : 'Disabled'}</span>
              <button 
                type="button"
                disabled={!canEdit}
                onClick={handleToggleAutoSync}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${!canEdit ? 'opacity-40 cursor-not-allowed bg-slate-800' : autoSyncEnabled ? 'bg-blue-500 cursor-pointer' : 'bg-slate-700 cursor-pointer'}`}
                title={canEdit ? 'Toggle Cloud Auto-Sync' : 'Activate Temporary Tester Pass to unlock controls'}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoSyncEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Upcoming Forge Features (Roadmap / Locked preview) */}
      <div className="space-y-3">
        <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Beaker className="w-3.5 h-3.5 text-slate-500" />
          <span>In-Development Pipeline (Tier 3 Sandbox)</span>
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-60">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-xs text-slate-300 font-mono font-bold block">Social Raid Federation</span>
                <span className="text-[10px] text-slate-500">Cross-realm squad chat &amp; live health bars</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/30">PLANNED</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Beaker className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs text-slate-300 font-mono font-bold block">3D WebGL Arena Shaders</span>
                <span className="text-[10px] text-slate-500">Volumetric lighting &amp; boss spell FX</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">PLANNED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
