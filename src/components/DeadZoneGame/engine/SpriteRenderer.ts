import { TILE_SIZE } from './types';
import { ITEM_DEFS } from './itemDefs';
import {
  getSprite, isLoaded,
  PLAYER_WALK_DOWN, PLAYER_WALK_RIGHT, PLAYER_WALK_LEFT, PLAYER_WALK_UP, PLAYER_ATTACK,
  ZOMBIE_WALKER, ZOMBIE_RUNNER, ZOMBIE_TANK, ZOMBIE_HIT,
  TERRAIN_GRASS, TERRAIN_DIRT, TERRAIN_GRAVEL,
  TERRAIN_ROAD, TERRAIN_PAVEMENT, TERRAIN_FOREST, TERRAIN_CITY,
  NATURE_TREES, NATURE_BUSHES, VEHICLES,
  HOUSE_FLOORS, HOUSE_BEDS, HOUSE_SHELVES,
  DECO_ROAD, DECO_URBAN, DECO_JUNKYARD, DECO_MILITARY,
  ITEM_SPRITE_MAP,
} from './SpriteAtlas';

let frameCounter = 0;
export function tickSpriteFrame() { frameCounter++; }

function hash(col: number, row: number): number {
  return ((col * 2654435761 ^ row * 2246822519) >>> 0) % 256;
}

function drawSpriteImg(ctx: CanvasRenderingContext2D, key: string, dx: number, dy: number, dw: number, dh: number): boolean {
  const img = getSprite(key);
  if (!img) return false;
  ctx.drawImage(img, dx, dy, dw, dh);
  return true;
}

const ALL_VEHICLES = [...VEHICLES, 'vehicle_bus', 'vehicle_junk_pile'];
const STUMPS = ['vehicle_stump_1', 'vehicle_stump_2'];

function getBuildingFloorKey(_tiles: number[][] | undefined, col: number, row: number, worldCol?: number, worldRow?: number): string {
  // Use world coordinates for a stable hash that doesn't shift with the viewport.
  // Walk backwards in world space to find the building's top-left wall corner.
  const wc = worldCol ?? col;
  const wr = worldRow ?? row;
  // Floors within the same building share a corner; hash it for a per-building key.
  // Simple approach: quantize to a grid that's larger than any building (~20 tiles).
  const bx = Math.floor(wc / 20);
  const by = Math.floor(wr / 20);
  const bh = ((bx * 2654435761 ^ by * 2246822519) >>> 0) % HOUSE_FLOORS.length;
  return HOUSE_FLOORS[bh];
}

function tileKey(tileType: number, h: number): string | null {
  switch (tileType) {
    case 0: return TERRAIN_GRASS[h % TERRAIN_GRASS.length];
    case 1: return TERRAIN_ROAD[h % TERRAIN_ROAD.length];
    case 2: return 'house_wall';
    case 3: return null;
    case 4: return 'house_door';
    case 6: return TERRAIN_DIRT[h % TERRAIN_DIRT.length];
    case 7: return TERRAIN_CITY[h % TERRAIN_CITY.length];
    case 8: return 'house_wall';
    case 9: return 'house_window';
    case 10: return null;
    case 11: return NATURE_TREES[h % NATURE_TREES.length];
    case 12: return ALL_VEHICLES[h % ALL_VEHICLES.length];
    case 14: return 'terrain_swamp_1';
    case 16: return TERRAIN_PAVEMENT[h % TERRAIN_PAVEMENT.length];
    case 18: return TERRAIN_GRAVEL[h % TERRAIN_GRAVEL.length];
    case 19: return TERRAIN_FOREST[h % TERRAIN_FOREST.length];
    case 20: return NATURE_TREES[h % NATURE_TREES.length];
    case 23: return TERRAIN_DIRT[h % TERRAIN_DIRT.length];
    case 24: return 'house_table';
    case 25: return HOUSE_BEDS[h % HOUSE_BEDS.length];
    case 26: return HOUSE_SHELVES[h % HOUSE_SHELVES.length];
    case 27: return 'house_stove';
    case 29: return 'house_tv';
    case 30: return 'house_cabinet';
    case 31: return 'house_fridge';
    case 32: return NATURE_BUSHES[h % NATURE_BUSHES.length];
    case 33: return STUMPS[h % STUMPS.length];
    case 34: return 'vehicle_rocks';
    case 36: return 'house_door';
    default: return null;
  }
}

export const OVERLAY_TILES = new Set([11, 12, 13, 20, 21, 22, 32, 33, 34]);
export const TALL_OVERLAY_TILES = new Set([11, 20, 32]);

function drawGround(ctx: CanvasRenderingContext2D, sx: number, sy: number, h: number) {
  const S = TILE_SIZE;
  if (isLoaded()) {
    const key = TERRAIN_GRASS[h % TERRAIN_GRASS.length];
    if (drawSpriteImg(ctx, key, sx, sy, S, S)) return;
  }
  ctx.fillStyle = `rgb(${62 + (h % 12)},${92 + (h % 16)},${38 + (h % 10)})`;
  ctx.fillRect(sx, sy, S, S);
}

function drawOverlay(ctx: CanvasRenderingContext2D, tileType: number, sx: number, sy: number, h: number) {
  const S = TILE_SIZE;
  if (isLoaded()) {
    const key = tileKey(tileType, h);
    if (key) {
      const img = getSprite(key);
      if (img) {
        if (tileType === 11 || tileType === 20) {
          const w = S * 1.6;
          const hh = S * 1.8;
          drawSpriteImg(ctx, key, sx + S / 2 - w / 2, sy + S - hh, w, hh);
        } else if (tileType === 12) {
          const w = S * 1.5;
          const hh = S * 1.3;
          drawSpriteImg(ctx, key, sx + S / 2 - w / 2, sy + S - hh, w, hh);
        } else {
          drawSpriteImg(ctx, key, sx, sy, S, S);
        }
        return;
      }
    }
  }
  switch (tileType) {
    case 11: { // TREE
      const cx = sx + S / 2, bot = sy + S;
      ctx.fillStyle = `rgb(${72 + (h % 8)},${52 + (h % 6)},${32})`;
      ctx.fillRect(cx - 3, bot - 20, 6, 18);
      ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.beginPath(); ctx.ellipse(cx, bot - 3, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
      for (const r of [16, 13, 9]) {
        ctx.fillStyle = `rgb(${35 + (h % 10)},${75 + r * 2},${25})`;
        ctx.beginPath(); ctx.arc(cx, bot - 18 - r + 4, r, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 12: { // CAR
      const cw = S * 1.4;
      const ch = S * 1.1;
      const cx = sx + S / 2 - cw / 2;
      const cy = sy + S - ch;
      ctx.fillStyle = ['#4a4252', '#6a3228', '#354050'][h % 3];
      ctx.fillRect(cx + 2, cy + 4, cw - 4, ch - 6);
      ctx.fillStyle = 'rgba(120,150,180,0.3)'; ctx.fillRect(cx + 6, cy + 5, cw - 12, 8);
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(cx + 8, cy + ch - 3, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + cw - 8, cy + ch - 3, 4, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 13: { // FENCE
      ctx.fillStyle = `rgb(${100},${82},${55})`;
      ctx.fillRect(sx + 2, sy, 3, S); ctx.fillRect(sx + S - 5, sy, 3, S);
      ctx.fillRect(sx, sy + 7, S, 3); ctx.fillRect(sx, sy + S - 9, S, 3);
      break;
    }
    case 20: { // DEAD_TREE
      const cx = sx + S / 2, bot = sy + S;
      ctx.fillStyle = `rgb(${58},${45},${32})`;
      ctx.fillRect(cx - 3, bot - 24, 6, 22);
      ctx.strokeStyle = `rgb(${62},${50},${38})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, bot - 20); ctx.lineTo(cx - 10, bot - 32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, bot - 16); ctx.lineTo(cx + 12, bot - 28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, bot - 24); ctx.lineTo(cx - 6, bot - 36); ctx.stroke();
      break;
    }
    case 21: { // BARREL
      ctx.fillStyle = h % 3 === 0 ? '#3A6535' : '#5A4525';
      ctx.fillRect(sx + 7, sy + 5, S - 14, S - 9);
      ctx.strokeStyle = '#777'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(sx + 7, sy + 10); ctx.lineTo(sx + S - 7, sy + 10); ctx.stroke();
      break;
    }
    case 22: { // CRATE
      ctx.fillStyle = '#7A6238'; ctx.fillRect(sx + 4, sy + 4, S - 8, S - 8);
      ctx.fillStyle = '#8A7248'; ctx.fillRect(sx + 5, sy + 5, S - 10, S - 10);
      ctx.strokeStyle = '#5A4220'; ctx.lineWidth = 0.8; ctx.strokeRect(sx + 4, sy + 4, S - 8, S - 8);
      ctx.strokeStyle = '#6A5230'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(sx + 4, sy + 4); ctx.lineTo(sx + S - 4, sy + S - 4);
      ctx.moveTo(sx + S - 4, sy + 4); ctx.lineTo(sx + 4, sy + S - 4); ctx.stroke();
      break;
    }
    case 32: { // BUSH
      const cx = sx + S / 2, cy = sy + S / 2;
      ctx.fillStyle = `rgb(${42 + (h % 10)},${78 + (h % 12)},${30})`;
      ctx.beginPath(); ctx.arc(cx, cy + 2, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgb(${48 + (h % 8)},${85 + (h % 10)},${35})`;
      ctx.beginPath(); ctx.arc(cx - 4, cy - 2, 9, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 5, cy + 1, 8, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 33: { // STUMP
      ctx.fillStyle = `rgb(${72 + (h % 8)},${52 + (h % 6)},${32})`;
      ctx.beginPath(); ctx.arc(sx + S / 2, sy + S / 2 + 2, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgb(${85 + (h % 6)},${65 + (h % 5)},${40})`;
      ctx.beginPath(); ctx.arc(sx + S / 2, sy + S / 2 + 1, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgb(${95 + (h % 5)},${75 + (h % 5)},${48})`;
      ctx.beginPath(); ctx.arc(sx + S / 2, sy + S / 2, 2.5, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 34: { // ROCKS
      ctx.fillStyle = `rgb(${105 + (h % 10)},${100 + (h % 8)},${92 + (h % 6)})`;
      ctx.beginPath(); ctx.arc(sx + S / 2 - 3, sy + S / 2 + 2, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgb(${115 + (h % 8)},${108 + (h % 6)},${98 + (h % 5)})`;
      ctx.beginPath(); ctx.arc(sx + S / 2 + 5, sy + S / 2 - 1, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgb(${95 + (h % 6)},${90 + (h % 5)},${82})`;
      ctx.beginPath(); ctx.arc(sx + S / 2 + 1, sy + S / 2 + 5, 4, 0, Math.PI * 2); ctx.fill();
      break;
    }
  }
}

export function drawTileOverlay(ctx: CanvasRenderingContext2D, tileType: number, sx: number, sy: number, col: number, row: number) {
  drawOverlay(ctx, tileType, sx, sy, hash(col, row));
}

const FURNITURE_TILES = new Set([24, 25, 26, 27, 28, 29, 30, 31]);
const WALL_TILES = new Set([2, 8, 9]);

function drawLockOverlay(ctx: CanvasRenderingContext2D, sx: number, sy: number, S: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(sx, sy, S, S);
  const cx = sx + S / 2, cy = sy + S / 2;
  // Lock body
  ctx.fillStyle = '#888';
  ctx.fillRect(cx - 4, cy - 1, 8, 7);
  ctx.fillStyle = '#666';
  ctx.fillRect(cx - 3, cy, 6, 5);
  // Lock shackle
  ctx.strokeStyle = '#999'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy - 1, 4, Math.PI, 0); ctx.stroke();
  // Keyhole
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(cx, cy + 2, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(cx - 0.6, cy + 2, 1.2, 2.5);
  // Red X bars
  ctx.strokeStyle = 'rgba(180,30,30,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 3, sy + 3); ctx.lineTo(sx + S - 3, sy + S - 3);
  ctx.moveTo(sx + S - 3, sy + 3); ctx.lineTo(sx + 3, sy + S - 3);
  ctx.stroke();
}

function drawFloorBase(ctx: CanvasRenderingContext2D, sx: number, sy: number, h: number, tiles?: number[][], col?: number, row?: number, worldCol?: number, worldRow?: number) {
  const S = TILE_SIZE;
  if (isLoaded()) {
    const floorKey = (tiles && col !== undefined && row !== undefined)
      ? getBuildingFloorKey(tiles, col, row, worldCol, worldRow)
      : HOUSE_FLOORS[h % HOUSE_FLOORS.length];
    if (drawSpriteImg(ctx, floorKey, sx, sy, S, S)) return;
  }
  ctx.fillStyle = `rgb(${118 + (h % 12)},${92 + (h % 10)},${62 + (h % 8)})`;
  ctx.fillRect(sx, sy, S, S);
}

function getWallDirection(tiles: number[][], col: number, row: number): 'up' | 'down' | 'left' | 'right' | 'none' {
  const up = (tiles[row - 1]?.[col] ?? 0);
  const down = (tiles[row + 1]?.[col] ?? 0);
  const left = (tiles[row]?.[col - 1] ?? 0);
  const right = (tiles[row]?.[col + 1] ?? 0);

  if (WALL_TILES.has(up)) return 'up';
  if (WALL_TILES.has(down)) return 'down';
  if (WALL_TILES.has(left)) return 'left';
  if (WALL_TILES.has(right)) return 'right';
  return 'none';
}

function drawFurnitureShadow(ctx: CanvasRenderingContext2D, sx: number, sy: number, fw: number, fh: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(sx + fw / 2, sy + fh - 1, fw * 0.42, fh * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawDecoration(ctx: CanvasRenderingContext2D, sx: number, sy: number, h: number, decoList: string[]) {
  if (!isLoaded() || h > 22) return;
  const key = decoList[h % decoList.length];
  const img = getSprite(key);
  if (!img) return;
  const S = TILE_SIZE;
  const ds = S * 0.38;
  const ox = (h * 7) % Math.floor(S - ds);
  const oy = (h * 13) % Math.floor(S - ds);
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.drawImage(img, sx + ox, sy + oy, ds, ds);
  ctx.restore();
}

export function drawTile(ctx: CanvasRenderingContext2D, tileType: number, sx: number, sy: number, col: number, row: number, tiles?: number[][], localCol?: number, localRow?: number) {
  const S = TILE_SIZE;
  const h = hash(col, row);
  const lc = localCol ?? col;
  const lr = localRow ?? row;

  if (OVERLAY_TILES.has(tileType)) {
    drawGround(ctx, sx, sy, h);
    return;
  }

  if (isLoaded()) {
    // Floor / loot spot: use consistent floor per building
    if (tileType === 3 || tileType === 10) {
      const floorKey = getBuildingFloorKey(tiles, lc, lr, col, row);
      if (drawSpriteImg(ctx, floorKey, sx, sy, S, S)) return;
    }

    // Road: ROAD (1) = vertical, ROAD_H (35) = horizontal (rotated 90°)
    if (tileType === 1 || tileType === 35) {
      const key = TERRAIN_ROAD[h % TERRAIN_ROAD.length];
      if (tileType === 35) {
        const img = getSprite(key);
        if (img) {
          ctx.save();
          ctx.translate(sx + S / 2, sy + S / 2);
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(img, -S / 2, -S / 2, S, S);
          ctx.restore();
          drawDecoration(ctx, sx, sy, h, DECO_ROAD);
          return;
        }
      } else {
        if (drawSpriteImg(ctx, key, sx, sy, S, S)) {
          drawDecoration(ctx, sx, sy, h, DECO_ROAD);
          return;
        }
      }
    }

    // Locked door: draw door sprite + lock overlay
    if (tileType === 36) {
      const doorImg = getSprite('house_door');
      if (doorImg) {
        ctx.drawImage(doorImg, sx, sy, S, S);
        drawLockOverlay(ctx, sx, sy, S);
        return;
      }
    }

    const key = tileKey(tileType, h);
    if (key) {
      if (FURNITURE_TILES.has(tileType)) {
        drawFloorBase(ctx, sx, sy, h, tiles, lc, lr, col, row);
        const fw = S * 0.75;
        const fh = S * 0.80;
        const isBed = tileType === 25;
        const wallDir = tiles ? getWallDirection(tiles, lc, lr) : 'none';
        const img = getSprite(key);
        if (img) {
          ctx.save();
          if (isBed) {
            drawFurnitureShadow(ctx, sx + (S - fw) / 2, sy + (S - fh) / 2, fw, fh);
            ctx.drawImage(img, sx + (S - fw) / 2, sy + (S - fh) / 2, fw, fh);
          } else if (wallDir === 'up') {
            drawFurnitureShadow(ctx, sx + (S - fw) / 2, sy + 1, fw, fh);
            ctx.drawImage(img, sx + (S - fw) / 2, sy + 1, fw, fh);
          } else if (wallDir === 'down') {
            ctx.translate(sx + S / 2, sy + S / 2);
            ctx.rotate(Math.PI);
            drawFurnitureShadow(ctx, -fw / 2, -S / 2 + 1, fw, fh);
            ctx.drawImage(img, -fw / 2, -S / 2 + 1, fw, fh);
          } else if (wallDir === 'left') {
            ctx.translate(sx + S / 2, sy + S / 2);
            ctx.rotate(-Math.PI / 2);
            drawFurnitureShadow(ctx, -fw / 2, -S / 2 + 1, fw, fh);
            ctx.drawImage(img, -fw / 2, -S / 2 + 1, fw, fh);
          } else if (wallDir === 'right') {
            ctx.translate(sx + S / 2, sy + S / 2);
            ctx.rotate(Math.PI / 2);
            drawFurnitureShadow(ctx, -fw / 2, -S / 2 + 1, fw, fh);
            ctx.drawImage(img, -fw / 2, -S / 2 + 1, fw, fh);
          } else {
            drawFurnitureShadow(ctx, sx + (S - fw) / 2, sy + (S - fh) / 2, fw, fh);
            ctx.drawImage(img, sx + (S - fw) / 2, sy + (S - fh) / 2, fw, fh);
          }
          ctx.restore();
          return;
        }
        ctx.restore();
      } else {
        if (drawSpriteImg(ctx, key, sx, sy, S, S)) {
          // Decorations on concrete, dirt, rubble ground tiles
          if (tileType === 7) drawDecoration(ctx, sx, sy, h, DECO_URBAN);
          else if (tileType === 6 || tileType === 18) drawDecoration(ctx, sx, sy, h, DECO_JUNKYARD);
          else if (tileType === 16) drawDecoration(ctx, sx, sy, h, DECO_MILITARY);
          return;
        }
      }
    }
  }

  const t = frameCounter * 0.02;

  switch (tileType) {
    case 0: { // GRASS
      ctx.fillStyle = `rgb(${62 + (h % 12)},${92 + (h % 16)},${38 + (h % 10)})`;
      ctx.fillRect(sx, sy, S, S);
      for (let i = 0; i < 3; i++) {
        const gx = sx + ((h * (i + 1) * 7) % (S - 2));
        const gy = sy + ((h * (i + 1) * 13) % (S - 3));
        ctx.fillStyle = `rgba(75,105,45,0.5)`;
        ctx.fillRect(gx, gy, 1, 3);
      }
      break;
    }
    case 1: { // ROAD (vertical)
      ctx.fillStyle = `rgb(${68 + (h % 6)},${66 + (h % 6)},${64 + (h % 6)})`;
      ctx.fillRect(sx, sy, S, S);
      if (h < 60) { ctx.fillStyle = 'rgba(180,170,60,0.25)'; ctx.fillRect(sx + S / 2 - 1, sy, 2, S); }
      break;
    }
    case 35: { // ROAD_H (horizontal)
      ctx.fillStyle = `rgb(${68 + (h % 6)},${66 + (h % 6)},${64 + (h % 6)})`;
      ctx.fillRect(sx, sy, S, S);
      if (h < 60) { ctx.fillStyle = 'rgba(180,170,60,0.25)'; ctx.fillRect(sx, sy + S / 2 - 1, S, 2); }
      break;
    }
    case 2: { // WALL
      ctx.fillStyle = `rgb(${82 + (h % 10)},${62 + (h % 8)},${48 + (h % 6)})`;
      ctx.fillRect(sx, sy, S, S);
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 0.5;
      for (let r = 0; r < S; r += 6) {
        ctx.beginPath(); ctx.moveTo(sx, sy + r); ctx.lineTo(sx + S, sy + r); ctx.stroke();
        const off = (Math.floor(r / 6) % 2) * (S / 2);
        ctx.beginPath(); ctx.moveTo(sx + off, sy + r); ctx.lineTo(sx + off, sy + r + 6); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(sx, sy + S - 3, S, 3);
      break;
    }
    case 3: { // FLOOR (wood planks)
      ctx.fillStyle = `rgb(${118 + (h % 12)},${92 + (h % 10)},${62 + (h % 8)})`;
      ctx.fillRect(sx, sy, S, S);
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 0.5;
      for (let p = 0; p < S; p += 8) { ctx.beginPath(); ctx.moveTo(sx, sy + p); ctx.lineTo(sx + S, sy + p); ctx.stroke(); }
      const po = (row % 2) * (S / 3);
      ctx.beginPath(); ctx.moveTo(sx + po + S / 3, sy); ctx.lineTo(sx + po + S / 3, sy + S); ctx.stroke();
      break;
    }
    case 4: { // DOOR
      ctx.fillStyle = '#5A3818'; ctx.fillRect(sx, sy, S, S);
      ctx.fillStyle = '#6A4828'; ctx.fillRect(sx + 2, sy + 2, S - 4, S / 2 - 1); ctx.fillRect(sx + 2, sy + S / 2 + 1, S - 4, S / 2 - 3);
      ctx.fillStyle = '#B89030'; ctx.beginPath(); ctx.arc(sx + S - 7, sy + S / 2, 2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 36: { // DOOR_LOCKED
      ctx.fillStyle = '#4A2812'; ctx.fillRect(sx, sy, S, S);
      ctx.fillStyle = '#5A3820'; ctx.fillRect(sx + 2, sy + 2, S - 4, S / 2 - 1); ctx.fillRect(sx + 2, sy + S / 2 + 1, S - 4, S / 2 - 3);
      ctx.fillStyle = '#B89030'; ctx.beginPath(); ctx.arc(sx + S - 7, sy + S / 2, 2, 0, Math.PI * 2); ctx.fill();
      drawLockOverlay(ctx, sx, sy, S);
      break;
    }
    case 5: { // WATER
      const w1 = Math.sin(t * 1.2 + col * 0.5) * 0.12;
      ctx.fillStyle = `rgb(${28 + Math.floor(w1 * 12)},${55 + (h % 8)},${85 + Math.floor(w1 * 20)})`;
      ctx.fillRect(sx, sy, S, S);
      ctx.fillStyle = 'rgba(35,65,100,0.3)';
      ctx.fillRect(sx, sy + Math.sin(t * 0.9 + col * 0.8) * 2 + 6, S, 3);
      if (Math.sin(t * 2.5 + h) > 0.88) {
        ctx.fillStyle = 'rgba(180,210,240,0.35)'; ctx.fillRect(sx + (h % 22) + 4, sy + ((h * 3) % 18) + 4, 2, 2);
      }
      break;
    }
    case 6: { // DIRT
      ctx.fillStyle = `rgb(${118 + (h % 14)},${95 + (h % 10)},${68 + (h % 8)})`;
      ctx.fillRect(sx, sy, S, S);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = `rgba(95,75,50,0.3)`;
        ctx.fillRect(sx + ((h * (i + 2) * 5) % (S - 2)), sy + ((h * (i + 3) * 9) % (S - 2)), 2, 2);
      }
      break;
    }
    case 7: { // CONCRETE
      ctx.fillStyle = `rgb(${138 + (h % 8)},${135 + (h % 8)},${132 + (h % 8)})`;
      ctx.fillRect(sx, sy, S, S);
      ctx.strokeStyle = 'rgba(110,108,105,0.2)'; ctx.lineWidth = 0.5; ctx.strokeRect(sx + 0.5, sy + 0.5, S - 1, S - 1);
      break;
    }
    case 8: { // WALL_TOP
      ctx.fillStyle = `rgb(${65 + (h % 8)},${48 + (h % 6)},${35 + (h % 5)})`;
      ctx.fillRect(sx, sy, S, S);
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(sx, sy + S - 3, S, 3);
      break;
    }
    case 9: { // WINDOW
      ctx.fillStyle = '#3a3a42'; ctx.fillRect(sx, sy, S, S);
      ctx.fillStyle = `rgba(100,155,195,${0.35})`;
      ctx.fillRect(sx + 4, sy + 4, S - 8, S - 8);
      ctx.strokeStyle = '#2a2a32'; ctx.lineWidth = 2; ctx.strokeRect(sx + 3, sy + 3, S - 6, S - 6);
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(sx + S / 2, sy + 4); ctx.lineTo(sx + S / 2, sy + S - 4);
      ctx.moveTo(sx + 4, sy + S / 2); ctx.lineTo(sx + S - 4, sy + S / 2); ctx.stroke();
      break;
    }
    case 10: { // LOOT_SPOT
      ctx.fillStyle = `rgb(${118 + (h % 12)},${92 + (h % 10)},${62 + (h % 8)})`;
      ctx.fillRect(sx, sy, S, S);
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 0.5;
      for (let p = 0; p < S; p += 8) { ctx.beginPath(); ctx.moveTo(sx, sy + p); ctx.lineTo(sx + S, sy + p); ctx.stroke(); }
      break;
    }
    case 14: { // SWAMP
      ctx.fillStyle = `rgb(${48},${62 + (h % 8)},${35})`;
      ctx.fillRect(sx, sy, S, S);
      ctx.fillStyle = 'rgba(35,52,28,0.3)';
      ctx.fillRect(sx + 5, sy + 8, S - 10, 3);
      break;
    }
    case 15: { // TOXIC_PUDDLE
      ctx.fillStyle = `rgb(${52},${68},${25})`;
      ctx.fillRect(sx, sy, S, S);
      const gl = Math.sin(t * 1.5 + h) * 0.12 + 0.25;
      ctx.fillStyle = `rgba(105,195,35,${gl})`;
      ctx.beginPath(); ctx.ellipse(sx + S / 2, sy + S / 2, S / 2 - 3, S / 2 - 4, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 16: { // METAL_FLOOR
      ctx.fillStyle = `rgb(${82},${85},${88})`;
      ctx.fillRect(sx, sy, S, S);
      ctx.strokeStyle = 'rgba(95,98,102,0.3)'; ctx.lineWidth = 0.5; ctx.strokeRect(sx + 0.5, sy + 0.5, S - 1, S - 1);
      break;
    }
    case 17: { // PIPE
      ctx.fillStyle = '#585C60'; ctx.fillRect(sx, sy, S, S);
      ctx.fillStyle = '#686C70'; ctx.fillRect(sx + 5, sy, S - 10, S);
      ctx.fillStyle = '#4E5256'; ctx.fillRect(sx + 3, sy + 4, S - 6, 3); ctx.fillRect(sx + 3, sy + S - 7, S - 6, 3);
      break;
    }
    case 18: { // RUBBLE
      ctx.fillStyle = `rgb(${95},${88},${78})`; ctx.fillRect(sx, sy, S, S);
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = ['#726858', '#827868', '#625848'][i % 3];
        ctx.fillRect(sx + ((h * (i + 1) * 7) % (S - 5)) + 2, sy + ((h * (i + 2) * 11) % (S - 5)) + 2, 3 + (h * (i + 1)) % 4, 2);
      }
      break;
    }
    case 19: { // TALL_GRASS
      ctx.fillStyle = `rgb(${55},${82},${32})`; ctx.fillRect(sx, sy, S, S);
      for (let i = 0; i < 6; i++) {
        const bladeOff = (h * (i + 1) * 5) % (S - 2);
        const sw = Math.sin(t * 1.0 + col * 0.8 + row * 0.6 + i * 0.5) * 2;
        ctx.fillStyle = `rgba(52,88,28,0.6)`;
        ctx.fillRect(sx + bladeOff + sw, sy + S - 12 - (h * (i + 1)) % 6, 2, 12);
      }
      break;
    }
    case 23: { // SAND
      ctx.fillStyle = `rgb(${192},${178},${138})`; ctx.fillRect(sx, sy, S, S);
      ctx.fillStyle = 'rgba(205,192,150,0.2)';
      ctx.fillRect(sx, sy + 9, S, 2); ctx.fillRect(sx, sy + 21, S, 1.5);
      break;
    }
    case 24: { // TABLE
      drawFloorBase(ctx, sx, sy, h, tiles, lc, lr, col, row);
      drawFurnitureShadow(ctx, sx + 4, sy + 4, S - 8, S - 6);
      ctx.fillStyle = '#7A5828'; ctx.fillRect(sx + 5, sy + 5, S - 10, S - 9);
      ctx.fillStyle = '#8A6838'; ctx.fillRect(sx + 6, sy + 6, S - 12, S - 11);
      ctx.fillStyle = '#5A3818';
      ctx.fillRect(sx + 7, sy + S - 5, 3, 3); ctx.fillRect(sx + S - 10, sy + S - 5, 3, 3);
      break;
    }
    case 25: { // BED
      drawFloorBase(ctx, sx, sy, h, tiles, lc, lr, col, row);
      drawFurnitureShadow(ctx, sx + 3, sy + 4, S - 6, S - 6);
      ctx.fillStyle = '#5A4020'; ctx.fillRect(sx + 4, sy + 4, S - 8, S - 6);
      ctx.fillStyle = '#D8D0C0'; ctx.fillRect(sx + 5, sy + 5, S - 10, S - 9);
      ctx.fillStyle = '#B8A890'; ctx.fillRect(sx + 5, sy + 5, S - 10, 5);
      break;
    }
    case 26: { // SHELF
      drawFloorBase(ctx, sx, sy, h, tiles, lc, lr, col, row);
      drawFurnitureShadow(ctx, sx + 4, sy + 3, S - 8, S - 4);
      ctx.fillStyle = '#6A5838'; ctx.fillRect(sx + 4, sy + 3, S - 8, S - 5);
      ctx.fillStyle = '#7A6848';
      ctx.fillRect(sx + 5, sy + 4, S - 10, 4);
      ctx.fillRect(sx + 5, sy + 11, S - 10, 4);
      ctx.fillRect(sx + 5, sy + 18, S - 10, 4);
      break;
    }
    case 27: { // STOVE
      drawFloorBase(ctx, sx, sy, h, tiles, lc, lr, col, row);
      drawFurnitureShadow(ctx, sx + 4, sy + 4, S - 8, S - 6);
      ctx.fillStyle = '#383838'; ctx.fillRect(sx + 5, sy + 4, S - 10, S - 7);
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(sx + 11, sy + 10, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx + S - 11, sy + 10, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx + 11, sy + S - 10, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx + S - 11, sy + S - 10, 3, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 28: { // TOILET
      drawFloorBase(ctx, sx, sy, h, tiles, lc, lr, col, row);
      drawFurnitureShadow(ctx, sx + 6, sy + 4, S - 12, S - 6);
      ctx.fillStyle = '#D8D8D8';
      ctx.beginPath(); ctx.ellipse(sx + S / 2, sy + S / 2 + 2, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#B0C0D0';
      ctx.beginPath(); ctx.ellipse(sx + S / 2, sy + S / 2 + 3, 3.5, 4, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 29: { // COUCH
      drawFloorBase(ctx, sx, sy, h, tiles, lc, lr, col, row);
      drawFurnitureShadow(ctx, sx + 3, sy + 5, S - 6, S - 8);
      ctx.fillStyle = `hsl(${(h * 31) % 360},30%,28%)`;
      ctx.fillRect(sx + 4, sy + 5, S - 8, S - 8);
      ctx.fillStyle = `hsl(${(h * 31) % 360},30%,35%)`;
      ctx.fillRect(sx + 6, sy + 9, S - 12, S - 14);
      break;
    }
    case 30: { // DESK
      drawFloorBase(ctx, sx, sy, h, tiles, lc, lr, col, row);
      drawFurnitureShadow(ctx, sx + 4, sy + 6, S - 8, S - 9);
      ctx.fillStyle = '#584830'; ctx.fillRect(sx + 4, sy + 7, S - 8, S - 11);
      ctx.fillStyle = '#685838'; ctx.fillRect(sx + 5, sy + 8, S - 10, S - 13);
      ctx.fillStyle = '#8898A8'; ctx.fillRect(sx + 8, sy + 10, 7, 4);
      break;
    }
    case 31: { // LOCKER
      drawFloorBase(ctx, sx, sy, h, tiles, lc, lr, col, row);
      drawFurnitureShadow(ctx, sx + 5, sy + 3, S - 10, S - 4);
      ctx.fillStyle = '#4A5848'; ctx.fillRect(sx + 6, sy + 3, S - 12, S - 5);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.5;
      ctx.strokeRect(sx + 6, sy + 3, S - 12, S - 5);
      ctx.beginPath(); ctx.moveTo(sx + S / 2, sy + 3); ctx.lineTo(sx + S / 2, sy + S - 3); ctx.stroke();
      ctx.fillStyle = '#808080';
      ctx.fillRect(sx + S / 2 - 3, sy + S / 2 - 1, 2, 3);
      ctx.fillRect(sx + S / 2 + 1, sy + S / 2 - 1, 2, 3);
      break;
    }
    default: {
      ctx.fillStyle = '#ff00ff'; ctx.fillRect(sx, sy, S, S);
    }
  }
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number,
  facing: number,
  isMoving: boolean,
  isRunning: boolean,
  isSneaking: boolean,
  isAttacking: boolean,
  animFrame: number,
  health: number,
  maxHealth: number,
  equippedWeapon: string | null,
) {
  const spriteW = 36;
  const spriteH = 48;

  if (isLoaded()) {
    const angle = ((facing % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    let frames: string[];
    if (isAttacking) {
      frames = PLAYER_ATTACK;
    } else if (isMoving) {
      if (angle > Math.PI * 0.25 && angle < Math.PI * 0.75) frames = PLAYER_WALK_DOWN;
      else if (angle > Math.PI * 1.25 && angle < Math.PI * 1.75) frames = PLAYER_WALK_UP;
      else if (angle >= Math.PI * 0.75 && angle <= Math.PI * 1.25) frames = PLAYER_WALK_LEFT;
      else frames = PLAYER_WALK_RIGHT;
    } else {
      if (angle > Math.PI * 0.25 && angle < Math.PI * 0.75) frames = [PLAYER_WALK_DOWN[0]];
      else if (angle > Math.PI * 1.25 && angle < Math.PI * 1.75) frames = [PLAYER_WALK_UP[0]];
      else if (angle >= Math.PI * 0.75 && angle <= Math.PI * 1.25) frames = [PLAYER_WALK_LEFT[0]];
      else frames = [PLAYER_WALK_RIGHT[0]];
    }
    const idx = frames.length === 1 ? 0 : animFrame % frames.length;
    const key = frames[idx];
    const spr = getSprite(key);
    if (spr) {
      const aspect = spr.naturalWidth / spr.naturalHeight;
      const drawH = spriteH;
      const drawW = drawH * aspect;
      ctx.drawImage(spr, sx - drawW / 2, sy - drawH + 10, drawW, drawH);
      if (health < maxHealth) {
        const pct = health / maxHealth;
        const bW = 22;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(sx - bW / 2 - 1, sy - drawH + 4, bW + 2, 4);
        ctx.fillStyle = pct > 0.6 ? '#3AA038' : pct > 0.3 ? '#A0A038' : '#A03838';
        ctx.fillRect(sx - bW / 2, sy - drawH + 5, bW * pct, 2);
      }
      if (isSneaking) {
        ctx.strokeStyle = 'rgba(100,180,220,0.1)'; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.arc(sx, sy, 20, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      }
      return;
    }
  }

  const isGun = equippedWeapon != null && !!(ITEM_DEFS[equippedWeapon] as { ammoType?: string } | undefined)?.ammoType;
  const isMelee = equippedWeapon != null && !isGun;

  ctx.save();
  ctx.translate(sx, sy);

  const phase = animFrame * 0.15;
  const bob = isMoving ? (isRunning ? Math.sin(phase * 2) * 1.5 : isSneaking ? Math.sin(phase * 0.8) * 0.3 : Math.sin(phase * 1.4) * 0.8) : 0;
  const stride = isMoving ? (isRunning ? Math.sin(phase * 2) * 4 : isSneaking ? Math.sin(phase * 0.8) * 0.6 : Math.sin(phase * 1.4) * 2.5) : 0;
  const co = isSneaking ? 2 : 0;
  const facingRight = Math.cos(facing) >= 0;

  ctx.save();
  if (!facingRight) ctx.scale(-1, 1);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(0, 8, 8, 3, 0, 0, Math.PI * 2); ctx.fill();

  // Back leg
  ctx.fillStyle = '#2E2A1E';
  ctx.fillRect(-1, 2 + bob - co - stride * 0.5, 4, 8);
  ctx.fillStyle = '#1E1810';
  ctx.fillRect(-1, 9 + bob - co - stride * 0.5, 4, 2);

  // Back arm (behind torso)
  ctx.save();
  ctx.strokeStyle = '#D4A574'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  const backArmSwing = isRunning ? Math.sin(phase * 2 + Math.PI) * 0.4 : isMoving ? Math.sin(phase * 1.4 + Math.PI) * 0.25 : 0;
  ctx.beginPath();
  ctx.moveTo(-3, -4 + bob - co);
  ctx.lineTo(-3 - Math.sin(0.3 + backArmSwing) * 7, -4 + Math.cos(0.3 + backArmSwing) * 5 + bob - co);
  ctx.stroke();
  ctx.restore();

  // Backpack (visible from side, behind torso)
  ctx.fillStyle = '#4E4030';
  ctx.fillRect(-6, -5 + bob - co, 4, 8);
  ctx.fillStyle = '#3E3226';
  ctx.fillRect(-5, -4 + bob - co, 2, 6);

  // Torso
  ctx.fillStyle = '#4A5A3A';
  ctx.fillRect(-3, -7 + bob - co, 8, 10);
  // Vest detail
  ctx.strokeStyle = '#3A4A2C'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(0, -7 + bob - co); ctx.lineTo(0, 3 + bob - co); ctx.stroke();
  ctx.strokeStyle = '#3A4A2C'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(-2, -2 + bob - co); ctx.lineTo(5, -2 + bob - co); ctx.stroke();

  // Front leg
  ctx.fillStyle = '#3B3525';
  ctx.fillRect(0, 2 + bob - co + stride * 0.5, 4, 8);
  ctx.fillStyle = '#2A2218';
  ctx.fillRect(0, 9 + bob - co + stride * 0.5, 4, 2);

  // Head
  ctx.fillStyle = '#D4A574';
  ctx.beginPath(); ctx.arc(2, -10 + bob - co, 4.5, 0, Math.PI * 2); ctx.fill();
  // Hair
  ctx.fillStyle = '#2C1E10';
  ctx.beginPath(); ctx.arc(2, -11.5 + bob - co, 4.8, Math.PI * 1.1, Math.PI * 1.95); ctx.fill();
  ctx.fillRect(-2, -14 + bob - co, 7, 2.5);
  // Eye
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(5, -11 + bob - co, 1.5, 1.5);
  // Ear
  ctx.fillStyle = '#C49A68';
  ctx.beginPath(); ctx.arc(-2, -10 + bob - co, 1.2, 0, Math.PI * 2); ctx.fill();

  // Front arm + weapon
  ctx.save();
  ctx.strokeStyle = '#D4A574'; ctx.lineWidth = 2.8; ctx.lineCap = 'round';

  if (isAttacking && isMelee) {
    const swing = Math.sin(animFrame * 0.5) * 1.2 - 0.3;
    ctx.beginPath();
    ctx.moveTo(4, -4 + bob - co);
    const handX = 4 + Math.cos(swing) * 9;
    const handY = -4 + Math.sin(swing) * 9 + bob - co;
    ctx.lineTo(handX, handY);
    ctx.stroke();
    // Knife blade
    ctx.strokeStyle = '#AABBCC'; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(handX + Math.cos(swing) * 6, handY + Math.sin(swing) * 6);
    ctx.stroke();
    // Knife handle
    ctx.strokeStyle = '#5A3818'; ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(handX - Math.cos(swing) * 1, handY - Math.sin(swing) * 1);
    ctx.lineTo(handX + Math.cos(swing) * 1, handY + Math.sin(swing) * 1);
    ctx.stroke();
  } else if (isGun) {
    const gunBob = isAttacking ? -1 : 0;
    ctx.beginPath();
    ctx.moveTo(4, -4 + bob - co);
    ctx.lineTo(9, -2 + bob - co + gunBob);
    ctx.stroke();
    // Gun body
    ctx.fillStyle = '#3A3A3A';
    ctx.save();
    ctx.translate(9, -2 + bob - co + gunBob);
    ctx.fillRect(0, -1.5, 8, 3);
    ctx.fillStyle = '#2A2A2A';
    ctx.fillRect(1, 1.5, 2, 3);
    // Muzzle flash
    if (isAttacking) {
      ctx.fillStyle = 'rgba(255,200,50,0.8)';
      ctx.beginPath(); ctx.arc(9, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,150,0.5)';
      ctx.beginPath(); ctx.arc(9, 0, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  } else if (isMelee) {
    const armSwing = isRunning ? Math.sin(phase * 2) * 0.3 : isMoving ? Math.sin(phase * 1.4) * 0.2 : 0;
    ctx.beginPath();
    ctx.moveTo(4, -4 + bob - co);
    const hx = 4 + Math.cos(-0.2 + armSwing) * 8;
    const hy = -4 + Math.sin(-0.2 + armSwing) * 8 + bob - co;
    ctx.lineTo(hx, hy);
    ctx.stroke();
    // Knife at rest
    ctx.strokeStyle = '#AABBCC'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx + Math.cos(-0.2 + armSwing) * 5, hy + Math.sin(-0.2 + armSwing) * 5);
    ctx.stroke();
  } else {
    const armSwing = isRunning ? Math.sin(phase * 2) * 0.4 : isMoving ? Math.sin(phase * 1.4) * 0.25 : 0;
    ctx.beginPath();
    ctx.moveTo(4, -4 + bob - co);
    ctx.lineTo(4 + Math.cos(0.3 + armSwing) * 7, -4 + Math.sin(0.3 + armSwing) * 5 + bob - co);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
  ctx.restore();

  ctx.restore(); // flip restore

  // HP bar
  if (health < maxHealth) {
    const pct = health / maxHealth;
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(-12, -18 - co, 24, 4);
    ctx.fillStyle = pct > 0.6 ? '#3AA038' : pct > 0.3 ? '#C8A038' : '#C03838';
    ctx.fillRect(-11, -17 - co, 22 * pct, 2);
  }
  if (isSneaking) {
    ctx.strokeStyle = 'rgba(100,180,220,0.12)'; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.restore();
}

export function drawZombie(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number,
  type: string,
  state: string,
  facing: number,
  animFrame: number,
  health: number,
  maxHealth: number,
  deathTimer: number,
) {
  const spriteW = type === 'tank' ? 40 : 32;
  const spriteH = type === 'tank' ? 50 : 42;

  if (isLoaded()) {
    if (state === 'dead') {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - deathTimer / 10);
      const hitFrames = ZOMBIE_HIT;
      const img = getSprite(hitFrames[Math.min(Math.floor(deathTimer), hitFrames.length - 1)]);
      if (img) { ctx.drawImage(img, sx - spriteW / 2, sy - spriteH + 8, spriteW, spriteH); ctx.restore(); return; }
      ctx.restore();
    } else {
      let frames: string[];
      if (type === 'tank') frames = ZOMBIE_TANK;
      else if (type === 'runner') frames = ZOMBIE_RUNNER;
      else frames = ZOMBIE_WALKER;

      const speed = state === 'chasing' ? 3 : 6;
      const idx = Math.floor(animFrame / speed) % frames.length;
      const img = getSprite(frames[idx]);
      if (img) {
        ctx.save();
        const flip = Math.cos(facing) < 0;
        if (flip) {
          ctx.translate(sx + spriteW / 2, sy - spriteH + 8);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, spriteW, spriteH);
        } else {
          ctx.drawImage(img, sx - spriteW / 2, sy - spriteH + 8, spriteW, spriteH);
        }
        ctx.restore();

        // HP bar
        if (health < maxHealth) {
          const pct = health / maxHealth;
          ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(sx - 11, sy - spriteH + 2, 22, 4);
          ctx.fillStyle = '#A03030'; ctx.fillRect(sx - 10, sy - spriteH + 3, 20 * pct, 2);
        }
        if (state === 'chasing') {
          ctx.fillStyle = 'rgba(220,30,30,0.06)'; ctx.beginPath(); ctx.arc(sx, sy, 18, 0, Math.PI * 2); ctx.fill();
        }
        return;
      }
    }
  }

  ctx.save();
  ctx.translate(sx, sy);

  if (state === 'dead') {
    ctx.globalAlpha = Math.max(0, 1 - deathTimer / 10);
    ctx.fillStyle = '#3A0808'; ctx.beginPath(); ctx.ellipse(0, 4, 10, 4, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4A5840'; ctx.beginPath(); ctx.ellipse(-2, 1, 6, 4, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6A8858'; ctx.beginPath(); ctx.arc(3, 0, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8B2010'; ctx.beginPath(); ctx.arc(-4, 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); return;
  }

  const phase = animFrame * 0.12;
  const sc = type === 'tank' ? 1.4 : type === 'runner' ? 0.9 : 1.0;
  const bob = state === 'chasing' ? Math.sin(phase * 3) * 2 : Math.sin(phase * 1.2) * 1.0;
  const stride = state === 'chasing' ? Math.sin(phase * 3) * 3.5 : Math.sin(phase * 1.2) * 2.2;
  const lurch = state === 'chasing' ? Math.sin(phase * 2.5 + 1) * 1.5 : Math.sin(phase * 0.8 + 0.5) * 0.6;
  const skin = type === 'runner' ? '#7A9862' : type === 'tank' ? '#5A7048' : '#6A8858';
  const cloth = type === 'runner' ? '#5A4828' : type === 'tank' ? '#3A3430' : '#4A4A40';
  const wound = type === 'tank' ? '#6A2818' : '#8B3020';
  const facingRight = Math.cos(facing) >= 0;

  ctx.save();
  ctx.scale(sc, sc);
  if (!facingRight) ctx.scale(-1, 1);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.beginPath(); ctx.ellipse(0, 8, 7 + (type === 'tank' ? 2 : 0), 3, 0, 0, Math.PI * 2); ctx.fill();

  // Back leg
  ctx.fillStyle = cloth;
  ctx.fillRect(-1, 2 + bob - stride * 0.4, 4, 7);
  ctx.fillStyle = skin;
  ctx.fillRect(-1, 8 + bob - stride * 0.4, 4, 2);

  // Back arm (hanging or reaching)
  ctx.save();
  ctx.strokeStyle = skin; ctx.lineWidth = type === 'tank' ? 3.2 : 2.3; ctx.lineCap = 'round';
  if (state === 'chasing') {
    const reach = Math.sin(phase * 3 + 1) * 0.3;
    ctx.beginPath();
    ctx.moveTo(-3, -3 + bob);
    ctx.lineTo(-3 + Math.cos(-0.6 + reach) * 9, -3 + Math.sin(-0.6 + reach) * 9 + bob);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-3, -3 + bob);
    ctx.lineTo(-3, 4 + bob);
    ctx.stroke();
  }
  ctx.restore();

  // Torso (sways with lurch)
  ctx.fillStyle = cloth;
  ctx.fillRect(-3 + lurch, -7 + bob, 8, 10);
  // Torn clothing
  ctx.fillStyle = skin;
  ctx.fillRect(-3 + lurch, 0 + bob, 3, 2);
  ctx.fillRect(3 + lurch, -4 + bob, 2, 3);
  // Wound marks
  ctx.fillStyle = wound;
  ctx.beginPath(); ctx.arc(3 + lurch, -1 + bob, 1.5, 0, Math.PI * 2); ctx.fill();
  if (type === 'tank') {
    ctx.beginPath(); ctx.arc(-2 + lurch, 1 + bob, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-1 + lurch, 2 + bob, 4, 1.2);
  }

  // Front leg
  ctx.fillStyle = cloth;
  ctx.fillRect(0, 2 + bob + stride * 0.4, 4, 7);
  ctx.fillStyle = skin;
  ctx.fillRect(0, 8 + bob + stride * 0.4, 4, 2);

  // Head (sways with lurch, tilts forward when chasing for runner)
  const headOff = type === 'runner' && state === 'chasing' ? 2 : 0;
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(2 + headOff * 0.5 + lurch * 1.2, -10 + bob, 5, 0, Math.PI * 2); ctx.fill();
  // Sunken eye
  const hl = lurch * 1.2;
  ctx.fillStyle = '#1A0A0A';
  ctx.beginPath(); ctx.ellipse(5 + headOff * 0.5 + hl, -11 + bob, 1.8, 1.4, 0, 0, Math.PI * 2); ctx.fill();
  // Glowing red pupil
  ctx.fillStyle = state === 'chasing' ? '#FF2020' : '#AA3030';
  ctx.beginPath(); ctx.arc(5.5 + headOff * 0.5 + hl, -11 + bob, 0.9, 0, Math.PI * 2); ctx.fill();
  // Mouth wound
  ctx.fillStyle = '#3A0808';
  ctx.fillRect(3 + headOff * 0.5 + hl, -8 + bob, 3, 1.5);
  // Head wound on tank
  if (type === 'tank') {
    ctx.fillStyle = wound;
    ctx.beginPath(); ctx.arc(0 + hl, -12 + bob, 2, 0, Math.PI * 2); ctx.fill();
  }

  // Front arm reaching forward when chasing
  ctx.save();
  ctx.strokeStyle = skin; ctx.lineWidth = type === 'tank' ? 3.2 : 2.3; ctx.lineCap = 'round';
  if (state === 'chasing') {
    const reach = Math.sin(phase * 3) * 0.3;
    ctx.beginPath();
    ctx.moveTo(4, -3 + bob);
    ctx.lineTo(4 + Math.cos(-0.5 + reach) * 10, -3 + Math.sin(-0.5 + reach) * 10 + bob);
    ctx.stroke();
    // Claw-like fingers
    const hx = 4 + Math.cos(-0.5 + reach) * 10;
    const hy = -3 + Math.sin(-0.5 + reach) * 10 + bob;
    ctx.lineWidth = 1;
    for (let f = -0.3; f <= 0.3; f += 0.3) {
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + Math.cos(-0.5 + reach + f) * 3, hy + Math.sin(-0.5 + reach + f) * 3);
      ctx.stroke();
    }
  } else {
    const dangle = Math.sin(phase * 0.7) * 0.2;
    ctx.beginPath();
    ctx.moveTo(4, -3 + bob);
    ctx.lineTo(4 + Math.sin(dangle) * 2, 4 + bob);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
  ctx.restore();

  ctx.restore(); // scale + flip restore

  // Chase glow
  if (state === 'chasing') {
    ctx.fillStyle = 'rgba(200,20,20,0.06)'; ctx.beginPath(); ctx.arc(0, 0, 20 * sc, 0, Math.PI * 2); ctx.fill();
  }
  // HP bar
  if (health < maxHealth) {
    const pct = health / maxHealth;
    const bw = 20 * sc;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(-bw / 2 - 1, -19 * sc, bw + 2, 4);
    ctx.fillStyle = '#A03030'; ctx.fillRect(-bw / 2, -19 * sc + 1, bw * pct, 2);
  }
  ctx.restore();
}

export function drawBullet(ctx: CanvasRenderingContext2D, sx: number, sy: number) {
  ctx.fillStyle = '#FFD840';
  ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,210,70,0.2)';
  ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill();
}

export function drawBloodSplatter(ctx: CanvasRenderingContext2D, sx: number, sy: number, splat: { size: number; alpha: number; angle: number }) {
  ctx.save();
  ctx.translate(sx, sy); ctx.rotate(splat.angle); ctx.globalAlpha = splat.alpha;
  ctx.fillStyle = '#5A0808';
  ctx.beginPath(); ctx.ellipse(0, 0, splat.size, splat.size * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#800000';
  ctx.beginPath(); ctx.ellipse(0, 0, splat.size * 0.55, splat.size * 0.3, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawLootItem(ctx: CanvasRenderingContext2D, sx: number, sy: number, defId: string) {
  if (isLoaded()) {
    const key = ITEM_SPRITE_MAP[defId];
    if (key) {
      const img = getSprite(key);
      if (img) {
        const itemSize = 14;
        const offset = (TILE_SIZE - itemSize) / 2;
        ctx.drawImage(img, sx + offset, sy + offset, itemSize, itemSize);
        return;
      }
    }
  }
  // Fallback dot
  ctx.fillStyle = 'rgba(180,180,80,0.4)';
  ctx.beginPath(); ctx.arc(sx + TILE_SIZE / 2, sy + TILE_SIZE / 2, 3.5, 0, Math.PI * 2); ctx.fill();
}

export function drawLootHighlight(ctx: CanvasRenderingContext2D, sx: number, sy: number, searched: boolean) {
  ctx.save();
  if (searched) {
    ctx.strokeStyle = 'rgba(90,85,75,0.2)'; ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
    ctx.strokeRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  } else {
    ctx.strokeStyle = 'rgba(230,200,50,0.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    ctx.strokeRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.fillStyle = 'rgba(230,200,60,0.05)'; ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
  }
  ctx.setLineDash([]);
  ctx.restore();
}
