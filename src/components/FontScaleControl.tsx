import { useState, useEffect, useRef } from 'react';

interface FontScaleControlProps {
  initialScale?: number;
  onScaleChange?: (newScale: number) => void;
}

const STORAGE_KEY = 'powerup_font_scale';
const DEFAULT_SCALE = 100;
const MIN_SCALE = 50;
const MAX_SCALE = 165;
const STEP = 5;

const PRESETS = [
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: '90%', value: 90 },
  { label: '100%', value: 100 },
  { label: '115%', value: 115 },
  { label: '135%', value: 135 },
  { label: '155%', value: 155 },
];

export default function FontScaleControl({ initialScale, onScaleChange }: FontScaleControlProps) {
  const [scale, setScale] = useState<number>(() => {
    if (initialScale !== undefined) return initialScale;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_SCALE && parsed <= MAX_SCALE) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_SCALE;
  });

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Apply scale to document root
  useEffect(() => {
    try {
      document.documentElement.style.fontSize = `${scale}%`;
      localStorage.setItem(STORAGE_KEY, scale.toString());
    } catch {
      // ignore
    }
    if (onScaleChange) {
      onScaleChange(scale);
    }
  }, [scale, onScaleChange]);

  // Click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleStep = (delta: number) => {
    setScale(prev => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)));
  };

  const handleReset = () => {
    setScale(DEFAULT_SCALE);
  };

  const getScaleCategory = (val: number) => {
    if (val <= 60) return 'Micro';
    if (val <= 80) return 'Tiny';
    if (val <= 90) return 'Compact';
    if (val <= 105) return 'Standard';
    if (val <= 120) return 'Large';
    if (val <= 140) return 'Extra Large';
    return 'Ultra Scale';
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button in Header */}
      <button
        id="header-font-scale-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
          scale !== 100
            ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 hover:bg-cyan-900/80 shadow-cyan-500/20'
            : 'bg-[#141c30] border-[#2a4060] text-slate-300 hover:text-white hover:bg-[#1a2a4c]'
        }`}
        title="Adjust application font size scale"
        aria-expanded={isOpen}
      >
        <span className="font-serif font-black tracking-tight text-sm">A<span className="text-[11px] font-sans">a</span></span>
        <span className="font-mono">{scale}%</span>
        {scale !== 100 && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
        )}
      </button>

      {/* Popover Menu with Interactive Slider & Presets */}
      {isOpen && (
        <div
          id="font-scale-popover"
          className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-[calc(100vw-2rem)] max-w-[350px] sm:w-88 mx-auto bg-[#0e1628]/98 border-2 border-[#2a4060] rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-black/95 z-[100] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🔤</span>
              <div>
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">Dynamic Font Scale</h4>
                <p className="text-xs text-slate-400">Scale all text and UI elements</p>
              </div>
            </div>
            <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-md">
              {scale}% • {getScaleCategory(scale)}
            </span>
          </div>

          {/* Slider Control Row */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleStep(-STEP)}
                disabled={scale <= MIN_SCALE}
                className="w-8 h-8 rounded-lg bg-[#141c30] border border-[#2a4060] text-slate-300 hover:text-white hover:bg-[#1f2d4d] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm flex items-center justify-center transition"
                title="Decrease font scale by 5%"
              >
                −
              </button>

              <div className="flex-1 relative flex items-center">
                <input
                  id="font-scale-slider-input"
                  type="range"
                  min={MIN_SCALE}
                  max={MAX_SCALE}
                  step={STEP}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full h-2 bg-[#141c30] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  aria-label="Font scale percentage slider"
                />
              </div>

              <button
                type="button"
                onClick={() => handleStep(STEP)}
                disabled={scale >= MAX_SCALE}
                className="w-8 h-8 rounded-lg bg-[#141c30] border border-[#2a4060] text-slate-300 hover:text-white hover:bg-[#1f2d4d] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm flex items-center justify-center transition"
                title="Increase font scale by 5%"
              >
                +
              </button>
            </div>

            {/* Scale boundaries & current scale display */}
            <div className="flex justify-between text-xs font-mono text-slate-400 px-0.5">
              <span>{MIN_SCALE}% (Min)</span>
              <span className="text-cyan-400 font-bold">{scale}%</span>
              <span>{MAX_SCALE}% (Max)</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="mb-4">
            <label className="text-xs uppercase font-bold text-slate-400 block mb-1.5">Quick Presets</label>
            <div className="grid grid-cols-7 gap-1">
              {PRESETS.map((p) => {
                const isSelected = scale === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setScale(p.value)}
                    className={`py-1.5 px-0.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold text-center transition cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                        : 'bg-[#141c30] text-slate-300 border border-[#2a4060]/50 hover:bg-[#1a2a4c] hover:text-white'
                    }`}
                  >
                    <div>{p.value}%</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-[#141c30]/70 border border-white/5 rounded-xl p-2.5 mb-3.5">
            <span className="text-xs text-slate-400 font-mono block mb-1">Live Text Sample:</span>
            <p className="text-xs font-semibold text-white leading-tight">
              ⚔️ Excalibur ATK +150 · Threat Level: S-Tier
            </p>
            <p className="text-xs text-slate-300 mt-0.5">
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>

          {/* Action footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
            <button
              type="button"
              onClick={handleReset}
              disabled={scale === DEFAULT_SCALE}
              className="text-xs text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed font-mono transition"
            >
              Reset to Default (100%)
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs bg-[#1f2d4d] hover:bg-[#2a3c66] text-cyan-200 font-bold px-3 py-1 rounded-lg transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
