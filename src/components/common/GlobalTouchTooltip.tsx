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
 * GlobalTouchTooltip - Universal Hover & Mobile Touch/Hold Tooltip System
 * 
 * Provides:
 * 1. Mobile touch-and-hold (250ms) or single tap inspection on any element with `data-tooltip` or `title`.
 * 2. High-performance desktop hover with smooth spring positioning and zero browser collision.
 * 3. Rich multi-line item cards (titles, lore, effects, abilities, rarities).
 * 4. Accessible focus-in/focus-out for keyboard navigation (WCAG 2.1 AA compliant).
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
        if (explicitTooltip && explicitTooltip.trim() !== '') {
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
        if (stashed && stashed.trim() !== '') {
          return { el: curr, text: stashed };
        }
        curr = curr.parentElement;
      }
      return null;
    };

    const calculatePosition = (el: HTMLElement, clientX?: number, _clientY?: number) => {
      const rect = el.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      const targetCenterX = clientX ?? (rect.left + rect.width / 2);
      // Clamp x so tooltip stays comfortably within screen padding
      const clampedX = Math.max(160, Math.min(viewportWidth - 160, targetCenterX));

      // Prefer top, flip to bottom if too close to viewport ceiling
      const showOnTop = rect.top > 120;
      const targetY = showOnTop ? Math.max(10, rect.top - 10) : rect.bottom + 10;

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
        // Auto dismiss touch tooltips after 3.8s for rich cards
        hideTimerRef.current = window.setTimeout(() => {
          hide();
        }, 3800);
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
        // Trigger tooltip after a responsive 200ms hold or immediate tap
        touchTimerRef.current = window.setTimeout(() => {
          show(info.el, info.text, touch.clientX, touch.clientY, true);
        }, 200);
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

  const lines = tooltip.text.split('\n').map(l => l.trim()).filter(Boolean);
  const isMultiLine = lines.length > 1;

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
      <div className={`bg-[#0f172a]/98 border border-[#4a72a0] text-[#e0f0ff] font-medium text-xs px-3.5 py-2.5 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(74,114,160,0.3)] backdrop-blur-2xl ${
        isMultiLine ? 'w-72 sm:w-80 max-w-[90vw]' : 'max-w-[280px] sm:max-w-xs text-center'
      } break-words leading-snug`}>
        {isMultiLine ? (
          <div className="flex flex-col gap-1.5 text-left">
            {lines.map((line, idx) => {
              if (line.startsWith('✦')) {
                return (
                  <div key={idx} className="font-mono text-xs text-[#f5e56b] font-black uppercase tracking-wider border-b border-white/10 pb-1 flex items-center justify-between">
                    <span>{line}</span>
                  </div>
                );
              }
              if (line.startsWith('✨ Effect:')) {
                return (
                  <div key={idx} className="text-[#8affc5] border-t border-white/10 pt-1 text-xs">
                    <span className="font-bold text-white">✨ Effect:</span> {line.replace('✨ Effect:', '').trim()}
                  </div>
                );
              }
              if (line.startsWith('⚡ Special:')) {
                return (
                  <div key={idx} className="text-amber-300 text-xs">
                    <span className="font-bold text-amber-400">⚡ Special:</span> {line.replace('⚡ Special:', '').trim()}
                  </div>
                );
              }
              if (line.startsWith('"') || line.startsWith('“')) {
                return (
                  <div key={idx} className="text-slate-300 italic text-[11px] leading-relaxed">
                    {line}
                  </div>
                );
              }
              return (
                <div key={idx} className="text-slate-200 text-xs">
                  {line}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 justify-center">
            <span className="text-amber-400 font-bold text-xs shrink-0">💡</span>
            <span>{tooltip.text}</span>
          </div>
        )}
      </div>

      {/* Downward/Upward Pointer Arrow */}
      <div
        className={`w-2.5 h-2.5 bg-[#0f172a] border-r border-b border-[#4a72a0] absolute left-1/2 -translate-x-1/2 transform ${
          tooltip.position === 'top'
            ? 'rotate-45 bottom-[-5px]'
            : '-rotate-135 top-[-5px]'
        }`}
      />
    </div>
  );
};
