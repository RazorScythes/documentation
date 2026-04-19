import React from 'react';
import { useGameStore } from '../store/gameStore';

export default function PauseMenu() {
  const gameStatus = useGameStore(s => s.gameStatus);
  const saveGame = useGameStore(s => s.saveGame);

  if (gameStatus !== 'paused') return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>

      <div className="hud-panel rounded-lg w-80 overflow-hidden animate-fade-in"
        style={{ boxShadow: '0 0 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)' }}>

        {/* Header stripe */}
        <div className="px-6 py-4 border-b border-white/5 text-center">
          <h2 className="text-lg font-bold tracking-[0.3em] uppercase text-white/70">Paused</h2>
        </div>

        <div className="p-5 flex flex-col gap-2">
          <button
            onClick={() => useGameStore.setState({ gameStatus: 'playing' })}
            className="w-full py-3 rounded text-sm font-bold uppercase tracking-[0.2em] cursor-pointer
              text-emerald-100/80 active:scale-[0.97] transition-all"
            style={{
              background: 'linear-gradient(180deg, rgba(30,80,40,0.7) 0%, rgba(20,50,25,0.7) 100%)',
              border: '1px solid rgba(60,160,80,0.2)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(60,160,80,0.4)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(40,120,60,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(60,160,80,0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Resume
          </button>

          <button
            onClick={() => saveGame()}
            className="w-full py-3 rounded text-sm font-bold uppercase tracking-[0.2em] cursor-pointer
              text-blue-100/70 btn-muted active:scale-[0.97]"
          >
            Save Game
          </button>

          <div className="h-px bg-white/5 my-1" />

          <button
            onClick={() => useGameStore.setState({ gameStatus: 'menu' })}
            className="w-full py-3 rounded text-sm font-bold uppercase tracking-[0.2em] cursor-pointer
              text-gray-400/70 btn-muted active:scale-[0.97]"
          >
            Main Menu
          </button>
        </div>

        {/* Footer hint */}
        <div className="px-6 py-2 border-t border-white/5 text-center">
          <span className="text-[10px] tracking-wider text-white/15 uppercase">Esc to resume</span>
        </div>
      </div>
    </div>
  );
}
