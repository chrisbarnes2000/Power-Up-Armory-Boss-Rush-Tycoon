import React, { useEffect } from 'react';
import { TourStep } from '../../data/tourSteps';

interface TourSpotlightOverlayProps {
  isActive: boolean;
  tourMode: 'choice' | 'short' | 'full';
  currentStep?: TourStep;
  stepIndex: number;
}

export const TourSpotlightOverlay: React.FC<TourSpotlightOverlayProps> = ({
  isActive,
  tourMode,
  currentStep,
  stepIndex
}) => {
  useEffect(() => {
    const clearSpotlights = () => {
      document.querySelectorAll('.tour-spotlight-active').forEach(el => {
        el.classList.remove('tour-spotlight-active');
      });
    };

    // Clean up existing spotlight highlights on step/mode/activity state change
    clearSpotlights();

    if (!isActive || tourMode === 'choice' || !currentStep?.targetSelector) {
      return;
    }

    const timer = setTimeout(() => {
      clearSpotlights();
      const element = document.querySelector(currentStep.targetSelector!);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('tour-spotlight-active');
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      clearSpotlights();
    };
  }, [isActive, tourMode, stepIndex, currentStep?.targetSelector]);

  return null;
};
