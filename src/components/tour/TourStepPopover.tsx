import React from 'react';
import { ChevronLeft, ChevronRight, MapPin, Zap, SkipForward, Gift, CheckCircle } from 'lucide-react';
import { TourStep, TOUR_BONUSES } from '../../data/tourSteps';

interface TourStepPopoverProps {
  currentStep: TourStep;
  stepIndex: number;
  totalSteps: number;
  progressPercent: number;
  tourMode: 'short' | 'full';
  completedTours?: { short?: boolean; full?: boolean };
  onNext: () => void;
  onPrev: () => void;
  onJump: (index: number) => void;
  onClose: () => void;
}

export const TourStepPopover: React.FC<TourStepPopoverProps> = ({
  currentStep,
  stepIndex,
  totalSteps,
  progressPercent,
  tourMode,
  completedTours,
  onNext,
  onPrev,
  onJump,
  onClose
}) => {
  const isFinalStep = stepIndex === totalSteps - 1;
  const isModeClaimed = completedTours?.[tourMode] === true;
  const bonus = TOUR_BONUSES[tourMode];

  return (
    <>
      {/* Step Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-base shrink-0 shadow-inner">
            {currentStep.badgeEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Step {stepIndex + 1} of {totalSteps}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                {tourMode === 'short' ? '⚡ Express' : '📜 Grand Tour'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="font-bold text-white">{currentStep.pageLabel}</span>
              {currentStep.subTabLabel && (
                <>
                  <span className="text-slate-500">›</span>
                  <span className="text-cyan-300">{currentStep.subTabLabel}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Top Progress Pill & Skip */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[10px] font-bold text-slate-400 hidden sm:inline">
            {progressPercent}% Complete
          </span>
          <button
            onClick={onClose}
            aria-label="Exit Walkthrough"
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
        <div 
          className="h-full bg-linear-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="space-y-1.5 my-1">
        <h4 className="font-extrabold text-sm sm:text-base text-white font-mono flex items-center gap-2">
          <span>{currentStep.title}</span>
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {currentStep.description}
        </p>
        {currentStep.spotlightHint && (
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-2 sm:p-2.5 text-[11px] sm:text-xs text-amber-200/90 font-mono flex items-start gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>{currentStep.spotlightHint}</span>
          </div>
        )}

        {/* Final Step Bonus Celebration Box */}
        {isFinalStep && (
          <div className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 shadow-lg transition-all animate-fadeIn ${
            isModeClaimed 
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200' 
              : 'bg-linear-to-r from-amber-950/80 via-yellow-950/70 to-amber-900/80 border-amber-400/60 text-amber-100 animate-pulse'
          }`}>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>{bonus.title}</span>
                  {isModeClaimed && <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">(Claimed <CheckCircle className="w-3 h-3" />)</span>}
                </div>
                <div className="text-[11px] text-amber-300">{bonus.label}</div>
              </div>
            </div>
            {!isModeClaimed && (
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shrink-0 shadow-xs">
                🎁 Bonus Ready
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
        <button
          onClick={onPrev}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center gap-1 border border-slate-700 transition active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Step Indicator Dots */}
        <div className="hidden md:flex items-center gap-1 max-w-[200px] overflow-x-auto py-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <button
              key={i}
              onClick={() => onJump(i)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === stepIndex 
                  ? 'bg-amber-400 w-4 shadow-[0_0_6px_rgba(251,191,36,0.8)]' 
                  : i < stepIndex 
                    ? 'bg-amber-500/50' 
                    : 'bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-[11px] text-slate-400 hover:text-slate-200 underline font-mono cursor-pointer px-1"
          >
            Skip
          </button>

          <button
            onClick={onNext}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-extrabold flex items-center gap-1 shadow-md transition active:scale-95 cursor-pointer ${
              isFinalStep && !isModeClaimed
                ? 'bg-linear-to-r from-emerald-500 via-emerald-400 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-emerald-500/30 animate-bounce'
                : 'bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 hover:shadow-amber-500/20'
            }`}
          >
            <span>
              {isFinalStep 
                ? (!isModeClaimed ? `🎁 Claim Bonus & Finish` : 'Finish Tour') 
                : 'Next'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
