import React, { useRef, useEffect, useState, lazy, Suspense } from 'react';
import { useGameStore } from './store/gameStore';
import { useGameEngine } from './hooks/useGameEngine';
import { loadAllSprites } from './engine/SpriteAtlas';
import MainMenu from './components/MainMenu';
import PauseMenu from './components/PauseMenu';
import GameOverScreen from './components/GameOverScreen';
import HUD from './components/HUD';
import InventoryUI from './components/InventoryUI';
import CraftingUI from './components/CraftingUI';
import './gaming.css';

const MapEditor = lazy(() => import('./components/editor/MapEditor'));
const EditorLanding = lazy(() => import('./components/editor/EditorLanding'));

function EditorRouter() {
  const [activeDefId, setActiveDefId] = useState<string | null>(null);

  if (activeDefId) {
    return (
      <MapEditor
        definitionId={activeDefId}
        onExit={() => setActiveDefId(null)}
      />
    );
  }

  return (
    <EditorLanding
      onExit={() => useGameStore.setState({ gameStatus: 'menu' })}
      onOpenCanvas={(id: string) => setActiveDefId(id)}
    />
  );
}

export default function GamingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startEngine, stopEngine } = useGameEngine(canvasRef);
  const gameStatus = useGameStore(s => s.gameStatus);
  const [spritesReady, setSpritesReady] = useState(false);

  useEffect(() => {
    loadAllSprites().then(() => setSpritesReady(true)).catch(() => setSpritesReady(true));
  }, []);

  useEffect(() => {
    if (!spritesReady || gameStatus === 'editor') return;
    const cleanup = startEngine();
    return () => {
      stopEngine();
      if (typeof cleanup === 'function') cleanup();
    };
  }, [startEngine, stopEngine, spritesReady, gameStatus]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const store = useGameStore.getState();
      if (store.gameStatus === 'editor') return;

      if (e.code === 'Escape') {
        if (store.showInventory) {
          store.toggleInventory();
        } else if (store.showCrafting) {
          store.toggleCrafting();
        } else if (store.gameStatus === 'playing') {
          useGameStore.setState({ gameStatus: 'paused' });
        } else if (store.gameStatus === 'paused') {
          useGameStore.setState({ gameStatus: 'playing' });
        }
      }

      if (store.gameStatus !== 'playing') return;

      if (e.code === 'KeyI') store.toggleInventory();
      if (e.code === 'KeyC') store.toggleCrafting();
      if (e.code === 'KeyM') store.toggleMinimap();

      if (e.code === 'F5') {
        e.preventDefault();
        store.saveGame();
      }
      if (e.code === 'F9') {
        e.preventDefault();
        store.loadGame();
      }

      if (e.code >= 'Digit1' && e.code <= 'Digit5') {
        const slot = parseInt(e.code.replace('Digit', '')) - 1;
        useGameStore.setState({ equippedSlot: slot });
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (gameStatus === 'editor') {
    return (
      <div className="gaming-container">
        <Suspense fallback={<div className="w-screen h-screen bg-black flex items-center justify-center text-white/40 text-sm">Loading Editor...</div>}>
          <EditorRouter />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="gaming-container">
      <div className="w-screen h-screen bg-black overflow-hidden relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        />

        {gameStatus === 'menu' && <MainMenu />}
        {gameStatus === 'paused' && <PauseMenu />}
        {gameStatus === 'gameover' && <GameOverScreen />}
        {gameStatus === 'playing' && (
          <>
            <HUD />
            <InventoryUI />
            <CraftingUI />
          </>
        )}
      </div>
    </div>
  );
}
