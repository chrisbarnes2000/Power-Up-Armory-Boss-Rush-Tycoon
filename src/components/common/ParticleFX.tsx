import React, { useEffect, useRef, useState } from 'react';
import { getIsParticleFxEnabled } from '../../lib/remoteConfig';

export type ParticleType = 'victory' | 'defeat' | 'purchase' | 'purchase_coin' | 'purchase_gem' | 'rebirth' | 'damage' | 'battle_start';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  rotation: number;
  vRot: number;
  shape: 'circle' | 'square' | 'star' | 'coin' | 'gem' | 'flame';
}

type ParticleListener = (type: ParticleType, x?: number, y?: number) => void;
const listeners = new Set<ParticleListener>();

export const triggerParticleBurst = (type: ParticleType, x?: number, y?: number) => {
  if (!getIsParticleFxEnabled()) return;
  listeners.forEach(fn => fn(type, x, y));
};

export const ParticleOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const handleBurst: ParticleListener = (type, customX, customY) => {
      if (!getIsParticleFxEnabled()) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const originX = customX !== undefined ? customX : width / 2;
      const originY = customY !== undefined ? customY : height / 2;

      const newParticles: Particle[] = [];
      let count = 60;

      if (type === 'victory') {
        count = 100;
        const victoryColors = ['#f59e0b', '#fbbf24', '#fef08a', '#10b981', '#34d399', '#60a5fa', '#ec4899'];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 4 + Math.random() * 12;
          newParticles.push({
            x: originX + (Math.random() - 0.5) * 60,
            y: originY + (Math.random() - 0.5) * 40,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - (3 + Math.random() * 5),
            size: 6 + Math.random() * 10,
            color: victoryColors[Math.floor(Math.random() * victoryColors.length)],
            alpha: 1,
            decay: 0.008 + Math.random() * 0.014,
            gravity: 0.25,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.2,
            shape: Math.random() > 0.4 ? (Math.random() > 0.5 ? 'coin' : 'star') : 'square'
          });
        }
      } else if (type === 'defeat') {
        count = 120; // Expanded count for lingering atmosphere
        const defeatColors = ['#ef4444', '#dc2626', '#991b1b', '#7f1d1d', '#450a0a', '#1e293b', '#0f172a'];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2; // Full directional drift across screen
          const speed = 1 + Math.random() * 5;
          newParticles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3 + 0.5,
            size: 5 + Math.random() * 10,
            color: defeatColors[Math.floor(Math.random() * defeatColors.length)],
            alpha: 0.95,
            decay: 0.003 + Math.random() * 0.006, // Slower decay for prolonged lingering ash effect
            gravity: 0.05,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.08,
            shape: 'square'
          });
        }
      } else if (type === 'damage') {
        count = 45;
        const damageColors = ['#ef4444', '#f87171', '#dc2626', '#b91c1c', '#ffffff'];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 6 + Math.random() * 10;
          newParticles.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 4 + Math.random() * 8,
            color: damageColors[Math.floor(Math.random() * damageColors.length)],
            alpha: 1,
            decay: 0.02 + Math.random() * 0.025,
            gravity: 0.1,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.3,
            shape: 'circle'
          });
        }
      } else if (type === 'purchase') {
        count = 55;
        const purchaseColors = ['#10b981', '#34d399', '#6ee7b7', '#38bdf8', '#fbbf24', '#a855f7'];
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 1.1) + Math.random() * (Math.PI * 0.8); // Upward fountain
          const speed = 4 + Math.random() * 9;
          newParticles.push({
            x: originX + (Math.random() - 0.5) * 40,
            y: originY,
            vx: Math.cos(angle) * speed * 0.8,
            vy: Math.sin(angle) * speed - 2,
            size: 5 + Math.random() * 9,
            color: purchaseColors[Math.floor(Math.random() * purchaseColors.length)],
            alpha: 1,
            decay: 0.014 + Math.random() * 0.018,
            gravity: 0.22,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.15,
            shape: Math.random() > 0.5 ? 'gem' : 'circle'
          });
        }
      } else if (type === 'purchase_coin') {
        count = 60;
        const coinColors = ['#f59e0b', '#fbbf24', '#fef08a', '#d97706', '#b45309'];
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 1.05) + Math.random() * (Math.PI * 0.9);
          const speed = 4 + Math.random() * 10;
          newParticles.push({
            x: originX + (Math.random() - 0.5) * 35,
            y: originY,
            vx: Math.cos(angle) * speed * 0.85,
            vy: Math.sin(angle) * speed - 2,
            size: 6 + Math.random() * 10,
            color: coinColors[Math.floor(Math.random() * coinColors.length)],
            alpha: 1,
            decay: 0.012 + Math.random() * 0.016,
            gravity: 0.24,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.2,
            shape: 'coin'
          });
        }
      } else if (type === 'purchase_gem') {
        count = 60;
        const gemColors = ['#10b981', '#34d399', '#38bdf8', '#818cf8', '#c084fc', '#e879f9'];
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 1.05) + Math.random() * (Math.PI * 0.9);
          const speed = 5 + Math.random() * 11;
          newParticles.push({
            x: originX + (Math.random() - 0.5) * 35,
            y: originY,
            vx: Math.cos(angle) * speed * 0.85,
            vy: Math.sin(angle) * speed - 2,
            size: 5 + Math.random() * 9,
            color: gemColors[Math.floor(Math.random() * gemColors.length)],
            alpha: 1,
            decay: 0.012 + Math.random() * 0.016,
            gravity: 0.2,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.2,
            shape: 'gem'
          });
        }
      } else if (type === 'rebirth') {
        count = 90;
        const rebirthColors = ['#f59e0b', '#fb923c', '#f97316', '#ea580c', '#fde047', '#ffffff'];
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 1.05) + Math.random() * (Math.PI * 0.9); // Expanding upward fire burst
          const speed = 5 + Math.random() * 11;
          newParticles.push({
            x: originX + (Math.random() - 0.5) * 80,
            y: originY + 20,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 4,
            size: 6 + Math.random() * 12,
            color: rebirthColors[Math.floor(Math.random() * rebirthColors.length)],
            alpha: 1,
            decay: 0.01 + Math.random() * 0.016,
            gravity: -0.05, // Float upwards
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.25,
            shape: 'flame'
          });
        }
      }

      particlesRef.current.push(...newParticles);
    };

    listeners.add(handleBurst);
    return () => {
      listeners.delete(handleBurst);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        if (p.alpha <= 0 || p.y > canvas.height + 50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'coin') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (p.shape === 'star') {
          const spikes = 5;
          const outerRadius = p.size;
          const innerRadius = p.size / 2;
          let rot = (Math.PI / 2) * 3;
          let x = 0;
          let y = 0;
          const step = Math.PI / spikes;

          ctx.beginPath();
          ctx.moveTo(0, -outerRadius);
          for (let s = 0; s < spikes; s++) {
            x = Math.cos(rot) * outerRadius;
            y = Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = Math.cos(rot) * innerRadius;
            y = Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
          }
          ctx.lineTo(0, -outerRadius);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'gem') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.8, -p.size * 0.3);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.8, -p.size * 0.3);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'flame') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};

// --- HEALTH MESH VIGNETTE (Progressive screen damage edge red mesh filter with 6s progressive continuous decay) ---
export const HealthMeshVignette: React.FC<{ playerHP: number; maxHP: number }> = ({ playerHP, maxHP }) => {
  const [enabled, setEnabled] = useState(getIsParticleFxEnabled());
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const prevHPRef = useRef<number>(playerHP);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.feature === 'particle_fx') {
        setEnabled(e.detail.enabled);
      }
    };
    window.addEventListener('beta_feature_changed', handleUpdate);
    return () => window.removeEventListener('beta_feature_changed', handleUpdate);
  }, []);

  if (!enabled) return null;

  const safeHP = Number.isFinite(playerHP) ? playerHP : 100;
  const safeMaxHP = Number.isFinite(maxHP) && maxHP > 0 ? maxHP : 100;

  const healthRatio = Math.max(0, Math.min(1, safeHP / safeMaxHP));
  const rawIntensity = 1 - healthRatio;
  const intensity = Number.isFinite(rawIntensity) ? Math.max(0, Math.min(1, rawIntensity)) : 0;

  // Track HP decreases to trigger a temporary screen-wide damage edge flash
  useEffect(() => {
    if (playerHP < prevHPRef.current && prevHPRef.current > 0) {
      setFlashOpacity(0.9);
    }
    prevHPRef.current = playerHP;
  }, [playerHP]);

  // Decay the temporary flash opacity smoothly over time
  useEffect(() => {
    if (flashOpacity > 0) {
      const timer = setTimeout(() => {
        setFlashOpacity(prev => Math.max(0, prev - 0.06));
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [flashOpacity]);

  useEffect(() => {
    if (intensity <= 0.45) {
      setFadeOpacity(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    // Start 6-second progressive continuous fade out loop
    startTimeRef.current = performance.now();
    setFadeOpacity(1);

    const DURATION = 6000; // 6 seconds progressive continuous decay

    const animateFade = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(1, elapsed / DURATION);

      // Smooth progressive ease-out decay curve
      const calculatedOpacity = Math.max(0, 1 - Math.pow(progress, 1.2));
      const currentOpacity = Number.isFinite(calculatedOpacity) ? calculatedOpacity : 0;
      setFadeOpacity(currentOpacity);

      if (progress < 1 && currentOpacity > 0) {
        animFrameRef.current = requestAnimationFrame(animateFade);
      } else {
        setFadeOpacity(0);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animateFade);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [safeHP, safeMaxHP, intensity]);

  const combinedOpacity = Math.max(fadeOpacity, flashOpacity);
  const activeIntensity = Math.max(intensity, flashOpacity > 0 ? 0.65 : 0);

  if (combinedOpacity <= 0) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[9900] transition-opacity duration-100 ease-linear"
      style={{
        opacity: combinedOpacity,
        boxShadow: `inset 0 0 ${30 + activeIntensity * 150}px rgba(220, 38, 38, ${0.15 + activeIntensity * 0.65})`,
        backgroundImage: `radial-gradient(circle at center, transparent 45%, rgba(127, 29, 29, ${activeIntensity * 0.55}) 92%), repeating-linear-gradient(45deg, rgba(239,68,68,0.025) 0px, rgba(239,68,68,0.025) 2px, transparent 2px, transparent 4px)`
      }}
    />
  );
};

// --- BATTLE START INTRO (Single Focus Blades swooping slowly and combining into Double Sword) ---
export const BattleStartIntro: React.FC<{ active: boolean; onComplete?: () => void }> = ({ active, onComplete }) => {
  const [visible, setVisible] = useState(false);
  const [clashed, setClashed] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setClashed(false);
      const clashTimer = setTimeout(() => {
        setClashed(true);
      }, 850);
      const finishTimer = setTimeout(() => {
        setVisible(false);
        setClashed(false);
        if (onComplete) onComplete();
      }, 2200);
      return () => {
        clearTimeout(clashTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [active]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-[3px] animate-fadeIn">
      <div className="relative w-full max-w-6xl h-80 flex items-center justify-center">
        {!clashed ? (
          <>
            {/* Left Single Sword (Focus Blade) */}
            <div className="absolute text-8xl sm:text-[11rem] filter drop-shadow-[0_0_30px_rgba(239,68,68,0.95)] animate-[swordSwoopLeft_0.85s_cubic-bezier(0.1,0.9,0.2,1)_forwards]">
              🗡️
            </div>
            {/* Right Single Sword (Focus Blade) */}
            <div className="absolute text-8xl sm:text-[11rem] filter drop-shadow-[0_0_30px_rgba(59,130,246,0.95)] animate-[swordSwoopRight_0.85s_cubic-bezier(0.1,0.9,0.2,1)_forwards]">
              🗡️
            </div>
          </>
        ) : (
          <>
            {/* Combined Double Sword (Weapons Class) */}
            <div className="absolute text-9xl sm:text-[13rem] filter drop-shadow-[0_0_40px_rgba(245,158,11,1)] animate-bounce">
              ⚔️
            </div>
            {/* Central Clash Shockwave Rings */}
            <div className="absolute w-64 h-64 rounded-full border-4 border-amber-400 animate-ping opacity-90"></div>
            <div className="absolute w-96 h-96 rounded-full border-2 border-cyan-400 animate-pulse opacity-70"></div>
          </>
        )}
        <div className="absolute top-2/3 text-amber-300 font-mono font-black text-xl sm:text-3xl uppercase tracking-[0.3em] drop-shadow-[0_2px_20px_rgba(0,0,0,0.95)] animate-pulse border-2 border-amber-500/60 px-8 py-3 rounded-2xl bg-[#0b101d]/95">
          ⚡ DUEL COMMENCING ⚡
        </div>
      </div>
    </div>
  );
};
