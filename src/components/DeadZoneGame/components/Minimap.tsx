import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { TILE_SIZE, TileType } from '../engine/types';

const MINIMAP_SIZE = 160;
const VIEW_RADIUS = 60;
const SCALE = MINIMAP_SIZE / (VIEW_RADIUS * 2);

const MINI_COLORS: Record<number, string> = {
  [TileType.GRASS]: '#2d5a1e',
  [TileType.ROAD]: '#555',
  [TileType.WALL]: '#4a3728',
  [TileType.FLOOR]: '#8b7355',
  [TileType.DOOR]: '#6b4226',
  [TileType.WATER]: '#1a4a6b',
  [TileType.DIRT]: '#7a6b52',
  [TileType.CONCRETE]: '#666',
  [TileType.WALL_TOP]: '#3d2b1f',
  [TileType.WINDOW]: '#5a7a9a',
  [TileType.LOOT_SPOT]: '#8b7355',
  [TileType.TREE]: '#1a3d0a',
  [TileType.CAR]: '#3a3a4a',
  [TileType.FENCE]: '#6a5a3a',
  [TileType.SWAMP]: '#3a5030',
  [TileType.TOXIC_PUDDLE]: '#4a6a20',
  [TileType.METAL_FLOOR]: '#5a5a60',
  [TileType.PIPE]: '#4a4a50',
  [TileType.RUBBLE]: '#6a6058',
  [TileType.TALL_GRASS]: '#3a6a20',
  [TileType.DEAD_TREE]: '#5a4a30',
  [TileType.BARREL]: '#4a5a3a',
  [TileType.CRATE]: '#7a6540',
  [TileType.SAND]: '#baa870',
  [TileType.TABLE]: '#8b7355',
  [TileType.BED]: '#8b7355',
  [TileType.SHELF]: '#8b7355',
  [TileType.STOVE]: '#8b7355',
  [TileType.TOILET]: '#8b7355',
  [TileType.COUCH]: '#8b7355',
  [TileType.DESK]: '#8b7355',
  [TileType.LOCKER]: '#8b7355',
  [TileType.BUSH]: '#1e4a12',
  [TileType.STUMP]: '#5a4228',
  [TileType.ROCKS]: '#6a6560',
  [TileType.ROAD_H]: '#555',
  [TileType.DOOR_LOCKED]: '#4A2A12',
};

export default function Minimap() {
  const show = useGameStore(s => s.showMinimap);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const draw = () => {
      const { chunkManager, player, zombies } = useGameStore.getState();
      if (!chunkManager) return;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

      const ptx = Math.floor(player.x / TILE_SIZE);
      const pty = Math.floor(player.y / TILE_SIZE);
      const startX = ptx - VIEW_RADIUS;
      const startY = pty - VIEW_RADIUS;

      for (let dy = 0; dy < VIEW_RADIUS * 2; dy += 2) {
        for (let dx = 0; dx < VIEW_RADIUS * 2; dx += 2) {
          const wx = startX + dx;
          const wy = startY + dy;
          const tile = chunkManager.getTile(wx, wy);
          ctx.fillStyle = MINI_COLORS[tile] || '#333';
          ctx.fillRect(dx * SCALE, dy * SCALE, SCALE * 2 + 1, SCALE * 2 + 1);
        }
      }

      // Buildings
      const buildings = chunkManager.getVisibleBuildings(player.x, player.y, 4);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 0.5;
      for (const b of buildings) {
        const bsx = (b.x - startX) * SCALE;
        const bsy = (b.y - startY) * SCALE;
        if (bsx < -50 || bsy < -50 || bsx > MINIMAP_SIZE + 50 || bsy > MINIMAP_SIZE + 50) continue;
        ctx.strokeRect(bsx, bsy, b.w * SCALE, b.h * SCALE);
      }

      // Zombies
      for (const z of zombies) {
        if (z.state === 'dead') continue;
        ctx.fillStyle = z.state === 'chasing' ? '#ff3333' : '#66aa66';
        const zx = (z.x / TILE_SIZE - startX) * SCALE;
        const zy = (z.y / TILE_SIZE - startY) * SCALE;
        if (zx < 0 || zy < 0 || zx > MINIMAP_SIZE || zy > MINIMAP_SIZE) continue;
        ctx.fillRect(zx - 1, zy - 1, 2, 2);
      }

      // Player always at center
      const cx = MINIMAP_SIZE / 2;
      const cy = MINIMAP_SIZE / 2;
      ctx.fillStyle = '#00ccff';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,200,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.stroke();

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [show]);

  if (!show) return null;

  return (
    <canvas ref={canvasRef} width={MINIMAP_SIZE} height={MINIMAP_SIZE} />
  );
}
