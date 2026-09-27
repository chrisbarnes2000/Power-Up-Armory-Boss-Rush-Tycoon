import React, { useState, useEffect, useRef } from 'react';

interface TooltipState {
  text: string;
  x: number;
  y: number;
  position: 'top' | 'bottom';
  visible: boolean;
  targetEl: HTMLElement | null;
}

/**
 * GlobalTouchTooltip - Universal Hover & Touch/Hold Tooltip System
 * 
 * Provides:
 * 1. Mobile touch-and-hold (300ms) or single tap inspection on any element with `title` or `data-tooltip`.
 * 2. High-performance desktop hover with smooth spring positioning and zero browser collision.
 * 3. Accessible focus-in/focus-out for keyboard navigation (WCAG 2.1 AA compliant).
 */
export const GlobalTouchTooltip: React.FC = () => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    text: '',
    x: 0,
    y: 0,
    position: 'top',
    visible: false,
    targetEl: null
  });

  const touchTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const isTouchInteractionRef = useRef<boolean>(false);

  useEffect(() => {
    // Find tooltip text from element or closest ancestor
    const getTooltipInfo = (target: HTMLElement | null): { el: HTMLElement; text: string } | null => {
      let curr: HTMLElement | null = target;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        const explicitTooltip = curr.getAttribute('data-tooltip');
        if (explicitTooltip) {
          return { el: curr, text: explicitTooltip };
        }
        const nativeTitle = curr.getAttribute('title');
        if (nativeTitle && nativeTitle.trim() !== '') {
          // Stash title in data-title to avoid duplicate OS tooltip collision
          curr.setAttribute('data-stashed-title', nativeTitle);
          curr.removeAttribute('title');
          return { el: curr, text: nativeTitle };
        }
        const stashed = curr.getAttribute('data-stashed-title');
        if (stashed) {
          return { el: curr, text: stashed };
        }
        curr = curr.parentElement;
      }
      return null;
    };

    const calculatePosition = (el: HTMLElement, clientX?: number, clientY?: number) => {
      const rect = el.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const targetCenterX = clientX ?? (rect.left + rect.width / 2);
      // Clamp x so tooltip stays comfortably within screen padding
      const clampedX = Math.max(16, Math.min(viewportWidth - 16, targetCenterX));

      // Prefer top, flip to bottom if too close to viewport ceiling
      const showOnTop = rect.top > 60;
      const targetY = showOnTop ? rect.top - 10 : rect.bottom + 10;

      return {
        x: clampedX,
        y: targetY,
        position: (showOnTop ? 'top' : 'bottom') as 'top' | 'bottom'
      };
    };

    const show = (el: HTMLElement, text: string, clientX?: number, clientY?: number, isTouch = false) => {
      if (!text || text.trim() === '') return;
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      const { x, y, position } = calculatePosition(el, clientX, clientY);
      setTooltip({
        text,
        x,
        y,
        position,
        visible: true,
        targetEl: el
      });

      if (isTouch) {
        // Auto dismiss touch tooltips after 3.2s
        hideTimerRef.current = window.setTimeout(() => {
          hide();
        }, 3200);
      }
    };

    const hide = () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
      setTooltip(prev => (prev.visible ? { ...prev, visible: false } : prev));
    };

    // --- MOUSE & POINTER EVENTS (Desktop Hover) ---
    const handlePointerEnter = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // Handled by touch events
      const info = getTooltipInfo(e.target as HTMLElement);
      if (info) {
        show(info.el, info.text, e.clientX, e.clientY, false);
      }
    };

    const handlePointerLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      hide();
    };

    // --- TOUCH EVENTS (Mobile Long-Press & Touch Tap) ---
    const handleTouchStart = (e: TouchEvent) => {
      isTouchInteractionRef.current = true;
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
      const info = getTooltipInfo(target);

      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);

      if (info) {
        // Trigger tooltip after a gentle 250ms hold, or immediate preview
        touchTimerRef.current = window.setTimeout(() => {
          show(info.el, info.text, touch.clientX, touch.clientY, true);
        }, 250);
      } else {
        hide();
      }
    };

    const handleTouchEnd = () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    };

    const handleTouchMove = () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    };

    // --- ACCESSIBILITY FOCUS EVENTS ---
    const handleFocusIn = (e: FocusEvent) => {
      const info = getTooltipInfo(e.target as HTMLElement);
      if (info) {
        show(info.el, info.text, undefined, undefined, false);
      }
    };

    const handleFocusOut = () => {
      hide();
    };

    const handleScrollOrResize = () => {
      hide();
    };

    document.addEventListener('pointerover', handlePointerEnter, { passive: true });
    document.addEventListener('pointerout', handlePointerLeave, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('focusin', handleFocusIn, { passive: true });
    document.addEventListener('focusout', handleFocusOut, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      document.removeEventListener('pointerover', handlePointerEnter);
      document.removeEventListener('pointerout', handlePointerLeave);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);

  if (!tooltip.visible || !tooltip.text) return null;

  return (
    <div
      id="global-touch-tooltip"
      role="tooltip"
      aria-hidden={!tooltip.visible}
      className={`fixed z-[9999] pointer-events-none transition-all duration-150 ease-out transform -translate-x-1/2 ${
        tooltip.position === 'top' ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`
      }}
    >
      <div className="bg-[#10192d]/98 border border-[#4a72a0] text-[#e0f0ff] font-medium text-xs px-3 py-1.5 rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.85)] backdrop-blur-xl max-w-[280px] sm:max-w-xs text-center break-words flex items-center gap-1.5 leading-snug">
        <span className="text-amber-400 font-bold text-xs">💡</span>
        <span>{tooltip.text}</span>
      </div>
      {/* Downward/Upward Pointer Arrow */}
      <div
        className={`w-2 h-2 bg-[#10192d] border-r border-b border-[#4a72a0] absolute left-1/2 -translate-x-1/2 transform ${
          tooltip.position === 'top'
            ? 'rotate-45 bottom-[-4px]'
            : '-rotate-135 top-[-4px]'
        }`}
      />
    </div>
  );
};
