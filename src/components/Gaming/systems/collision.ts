import { TILE_SIZE, SOLID_TILES } from '../engine/types';
import type { ChunkManager } from '../maps/ChunkManager';

export function isTileSolid(chunkMgr: ChunkManager, tileX: number, tileY: number): boolean {
  return SOLID_TILES.has(chunkMgr.getTile(tileX, tileY));
}

export function canMoveTo(
  chunkMgr: ChunkManager,
  x: number,
  y: number,
  radius: number = 6,
): boolean {
  const corners = [
    { cx: x - radius, cy: y - radius },
    { cx: x + radius, cy: y - radius },
    { cx: x - radius, cy: y + radius },
    { cx: x + radius, cy: y + radius },
  ];

  for (const c of corners) {
    const tx = Math.floor(c.cx / TILE_SIZE);
    const ty = Math.floor(c.cy / TILE_SIZE);
    if (isTileSolid(chunkMgr, tx, ty)) return false;
  }
  return true;
}

export function lineOfSight(
  chunkMgr: ChunkManager,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.ceil(dist / (TILE_SIZE / 2));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const tx = Math.floor(px / TILE_SIZE);
    const ty = Math.floor(py / TILE_SIZE);
    if (isTileSolid(chunkMgr, tx, ty)) return false;
  }
  return true;
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function circleCollision(
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number,
): boolean {
  return distance(x1, y1, x2, y2) < r1 + r2;
}
