import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function GameOverScreen() {
  const gameStatus = useGameStore(s => s.gameStatus);
  const dayCount = useGameStore(s => s.dayCount);
  const zombies = useGameStore(s => s.zombies);
  const initWorld = useGameStore(s => s.initWorld);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (gameStatus !== 'gameover') { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [gameStatus]);

  if (gameStatus !== 'gameover') return null;

  const zombiesKilled = zombies.filter(z => z.state === 'dead').length;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, rgba(40,5,5,0.95) 0%, rgba(0,0,0,0.97) 70%)',
        backdropFilter: 'blur(4px)',
      }}>

      {/* Blood vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 200px rgba(100,10,10,0.3)' }} />

      <div className="text-center relative">
        {/* Main death text */}
        <h1
          className={`font-black tracking-[0.2em] uppercase transition-all duration-700
            ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
          style={{
            fontFamily: 'Impact, "Arial Black", sans-serif',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            color: '#8b1a1a',
            textShadow: '0 0 60px rgba(140,20,20,0.5), 0 0 120px rgba(100,10,10,0.3), 0 4px 30px rgba(0,0,0,0.8)',
            lineHeight: 1,
          }}
        >
          You Died
        </h1>

        {/* Stats */}
        <div className={`mt-8 mb-10 space-y-2 transition-all duration-500 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
            <span className="text-white/30 text-xs tracking-[0.3em] uppercase">Final Report</span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
          </div>

          <div className="flex gap-10 justify-center mt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white/80 font-mono">{dayCount}</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-white/20 mt-1">Days Survived</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-mono" style={{ color: 'rgba(200,60,60,0.7)' }}>{zombiesKilled}</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-white/20 mt-1">Zombies Killed</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className={`flex flex-col gap-3 items-center transition-all duration-500 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={() => initWorld()}
            className="w-60 py-3.5 rounded text-sm font-bold uppercase tracking-[0.25em] cursor-pointer
              text-red-100/80 btn-danger active:scale-[0.97]"
          >
            Try Again
          </button>
          <button
            onClick={() => useGameStore.setState({ gameStatus: 'menu' })}
            className="w-60 py-3 rounded text-sm font-bold uppercase tracking-[0.2em] cursor-pointer
              text-gray-400/60 btn-muted active:scale-[0.97]"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
