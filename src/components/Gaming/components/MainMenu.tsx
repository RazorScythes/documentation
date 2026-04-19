import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

function BloodDrip({ delay, left, height }: { delay: number; left: string; height: number }) {
  return (
    <div
      className="absolute top-0 w-[2px] origin-top"
      style={{
        left,
        height,
        background: 'linear-gradient(180deg, #5a1010, #3a0808 60%, transparent)',
        animation: `drip ${2 + Math.random() * 2}s ease-in ${delay}s both`,
      }}
    />
  );
}

export default function MainMenu() {
  const gameStatus = useGameStore(s => s.gameStatus);
  const initWorld = useGameStore(s => s.initWorld);
  const loadGame = useGameStore(s => s.loadGame);
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (gameStatus === 'menu') {
      const t = setTimeout(() => setMounted(true), 100);
      return () => clearTimeout(t);
    }
    setMounted(false);
  }, [gameStatus]);

  if (gameStatus !== 'menu') return null;

  const hasSave = !!localStorage.getItem('deadzone_save');

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a0808 0%, #080404 50%, #000 100%)' }}>

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)' }} />

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
        }} />

      {/* Blood drips from top */}
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <BloodDrip
            key={i}
            delay={i * 0.4 + Math.random() * 2}
            left={`${10 + i * 12 + Math.random() * 5}%`}
            height={30 + Math.random() * 80}
          />
        ))}
      </div>

      {/* Title */}
      <div className={`relative mb-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1
          className="text-8xl font-black tracking-[0.15em] text-transparent bg-clip-text animate-glitch"
          style={{
            fontFamily: 'Impact, "Arial Black", sans-serif',
            backgroundImage: 'linear-gradient(180deg, #c83030 0%, #6b1515 60%, #3a0a0a 100%)',
            WebkitBackgroundClip: 'text',
            filter: 'drop-shadow(0 0 60px rgba(140, 20, 20, 0.4)) drop-shadow(0 4px 20px rgba(0,0,0,0.8))',
            lineHeight: 1,
          }}
        >
          DEAD ZONE
        </h1>

        {/* Scratched underline */}
        <div className="mt-3 mx-auto flex items-center gap-3 justify-center">
          <div className="h-px flex-1 max-w-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,40,40,0.4), transparent)' }} />
          <p className="text-[10px] tracking-[0.4em] uppercase animate-breathe"
            style={{ color: 'rgba(180,120,100,0.5)' }}>
            Survive the Dead
          </p>
          <div className="h-px flex-1 max-w-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,40,40,0.4), transparent)' }} />
        </div>
      </div>

      {/* Menu buttons */}
      <div className={`flex flex-col gap-3 w-72 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <button
          onClick={() => initWorld()}
          className="group relative px-8 py-4 overflow-hidden text-sm font-bold uppercase tracking-[0.25em]
            text-red-100/90 btn-danger rounded active:scale-[0.97] cursor-pointer"
        >
          <span className="relative z-10">New Game</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
            -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>

        {hasSave && (
          <button
            onClick={() => {
              const ok = loadGame();
              if (!ok) alert('Failed to load save.');
            }}
            className="group relative px-8 py-4 overflow-hidden text-sm font-bold uppercase tracking-[0.25em]
              text-gray-300/80 btn-muted rounded active:scale-[0.97] cursor-pointer"
          >
            <span className="relative z-10">Continue</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
              -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        )}

        <button
          onClick={() => navigate('/gaming/map-editor')}
          className="group relative px-8 py-3 overflow-hidden text-xs font-bold uppercase tracking-[0.25em]
            text-amber-300/60 btn-muted rounded active:scale-[0.97] cursor-pointer mt-2"
        >
          <span className="relative z-10">Map Editor</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent
            -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>


      </div>

      {/* Footer */}
      <div className={`absolute bottom-6 text-center transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.12)' }}>
          WASD Move &middot; Mouse Aim &middot; Click Attack &middot; I Inventory &middot; C Craft
        </p>
      </div>
    </div>
  );
}
