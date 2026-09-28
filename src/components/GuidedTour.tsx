import React, { useState, useEffect } from 'react';
import { TourStep, SHORT_TOUR_STEPS, TOUR_STEPS } from '../data/tourSteps';
import { TourModeChoiceCard } from './tour/TourModeChoiceCard';
import { TourStepPopover } from './tour/TourStepPopover';
import { TourSpotlightOverlay } from './tour/TourSpotlightOverlay';
import { trackEvent } from '../lib/analytics';

export type { TourStep } from '../data/tourSteps';

interface GuidedTourProps {
  isActive: boolean;
  onClose: () => void;
  onStepChange?: (step: TourStep) => void;
  completedTours?: { short?: boolean; full?: boolean };
  onClaimBonus?: (mode: 'short' | 'full') => void;
  // Legacy compatibility props
  currentStepIndex?: number;
  onNext?: () => void;
  onPrev?: () => void;
  onJumpToStep?: (index: number) => void;
}

export default function GuidedTour({
  isActive,
  onClose,
  onStepChange,
  completedTours,
  onClaimBonus,
  currentStepIndex: externalIndex,
  onNext: externalOnNext,
  onPrev: externalOnPrev,
  onJumpToStep: externalOnJump
}: GuidedTourProps) {
  // Mode selection state: 'choice' (Welcome Choice Screen), 'short' (5 Steps), or 'full' (20 Steps)
  const [tourMode, setTourMode] = useState<'choice' | 'short' | 'full'>('choice');
  const [internalStepIndex, setInternalStepIndex] = useState(0);

  // Sync when tour becomes active
  useEffect(() => {
    if (isActive) {
      setTourMode('choice');
      setInternalStepIndex(0);
    }
  }, [isActive]);

  const activeSteps = tourMode === 'short' ? SHORT_TOUR_STEPS : TOUR_STEPS;
  const stepIndex = externalIndex !== undefined ? externalIndex : internalStepIndex;
  const currentStep = activeSteps[stepIndex] || activeSteps[0];
  const totalSteps = activeSteps.length;
  const progressPercent = Math.round(((stepIndex + 1) / totalSteps) * 100);

  // Notify parent component on step change & dispatch step telemetry
  useEffect(() => {
    if (isActive && tourMode !== 'choice' && currentStep) {
      if (onStepChange) {
        onStepChange(currentStep);
      }
      trackEvent('tour_step_viewed', {
        tour_mode: tourMode,
        step_index: stepIndex + 1,
        total_steps: totalSteps,
        step_id: currentStep.id,
        step_title: currentStep.title,
        page: currentStep.page,
        sub_tab: currentStep.subTab
      });
    }
  }, [isActive, tourMode, stepIndex, currentStep, totalSteps, onStepChange]);

  const handleSelectMode = (mode: 'short' | 'full') => {
    setTourMode(mode);
    setInternalStepIndex(0);
    const stepsCount = mode === 'short' ? SHORT_TOUR_STEPS.length : TOUR_STEPS.length;
    trackEvent('tour_started', {
      tour_mode: mode,
      total_steps: stepsCount
    });
  };

  const handleCloseTour = () => {
    if (tourMode !== 'choice' && stepIndex < totalSteps - 1) {
      trackEvent('tour_skipped', {
        tour_mode: tourMode,
        step_index: stepIndex + 1,
        total_steps: totalSteps
      });
    }
    onClose();
  };

  const handleNext = () => {
    if (externalOnNext) {
      externalOnNext();
    } else {
      if (stepIndex < totalSteps - 1) {
        setInternalStepIndex(prev => prev + 1);
      } else {
        if (tourMode !== 'choice' && onClaimBonus) {
          onClaimBonus(tourMode);
        }
        onClose();
      }
    }
  };

  const handlePrev = () => {
    if (externalOnPrev) {
      externalOnPrev();
    } else {
      if (stepIndex > 0) {
        setInternalStepIndex(prev => prev - 1);
      } else {
        // Return to Choice Screen on Back from Step 1
        setTourMode('choice');
      }
    }
  };

  const handleJump = (idx: number) => {
    if (externalOnJump) {
      externalOnJump(idx);
    } else {
      setInternalStepIndex(idx);
    }
  };

  // Keyboard navigation listeners
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (tourMode === 'choice') {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, tourMode, stepIndex, totalSteps]);

  if (!isActive) return null;

  return (
    <>
      {/* Element Spotlight Scroll & Highlight Observer */}
      <TourSpotlightOverlay 
        isActive={isActive}
        tourMode={tourMode}
        currentStep={currentStep}
        stepIndex={stepIndex}
      />

      <aside 
        aria-label="Guided Tour Dialog"
        className="fixed inset-x-0 bottom-4 sm:bottom-6 z-[999] flex justify-center px-3 pointer-events-none animate-fadeIn"
      >
        <div 
          id="guided-tour-card"
          className="w-full max-w-2xl bg-[#0e1626]/98 border-2 border-[#3b5985] rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(59,130,246,0.25)] backdrop-blur-2xl pointer-events-auto p-4 sm:p-5 flex flex-col gap-3 text-slate-200 transition-all duration-300"
        >
          {tourMode === 'choice' ? (
            <TourModeChoiceCard 
              completedTours={completedTours}
              onSelectMode={handleSelectMode}
              onClose={handleCloseTour}
            />
          ) : (
            <TourStepPopover 
              currentStep={currentStep}
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              progressPercent={progressPercent}
              tourMode={tourMode}
              completedTours={completedTours}
              onNext={handleNext}
              onPrev={handlePrev}
              onJump={handleJump}
              onClose={onClose}
            />
          )}
        </div>
      </aside>
    </>
  );
}
