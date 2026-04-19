import { CHUNK_SIZE, TILE_SIZE, SOLID_TILES, TileType, type LootSpot, type ZombieState, type Building } from '../engine/types';
import { getStructureConfigs, generateBiomeTileFromDefs, getLootCountFromDefs } from '../data/gameDefinitions';

export interface Chunk {
  cx: number;
  cy: number;
  tiles: number[][];
  buildings: Building[];
  lootSpots: LootSpot[];
  zombies: ZombieState[];
  modified: boolean;
}

const LOAD_RADIUS = 4;
const UNLOAD_RADIUS = 6;

function seededRandom(seed: number) {
  let s = Math.abs(seed) || 1;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function chunkHash(cx: number, cy: number, worldSeed: number): number {
  let h = worldSeed;
  h = ((h << 5) - h + (cx | 0)) | 0;
  h = ((h << 5) - h + ((cy * 31) | 0)) | 0;
  h = ((h ^ (h >>> 16)) * 0x45d9f3b) | 0;
  h = ((h ^ (h >>> 16)) * 0x45d9f3b) | 0;
  return ((h ^ (h >>> 16)) >>> 0) + 1;
}

type BiomeType = 'urban' | 'suburbs' | 'swamp' | 'chemical' | 'military' | 'farmland' | 'junkyard' | 'forest' | 'desert';

function noise2d(x: number, y: number, seed: number): number {
  let n = ((seed + x * 374761393 + y * 668265263) | 0);
  n = ((n ^ (n >> 13)) * 1274126177) | 0;
  n = n ^ (n >> 16);
  return ((n & 0x7fffffff) / 0x7fffffff);
}

function smoothNoise(x: number, y: number, scale: number, seed: number): number {
  const sx = x / scale;
  const sy = y / scale;
  const ix = Math.floor(sx);
  const iy = Math.floor(sy);
  const fx = sx - ix;
  const fy = sy - iy;
  const a = noise2d(ix, iy, seed);
  const b = noise2d(ix + 1, iy, seed);
  const c = noise2d(ix, iy + 1, seed);
  const d = noise2d(ix + 1, iy + 1, seed);
  const ab = a + (b - a) * fx;
  const cd = c + (d - c) * fx;
  return ab + (cd - ab) * fy;
}

function getBiome(worldX: number, worldY: number, seed: number): BiomeType {
  const scale = 60;
  const v1 = smoothNoise(worldX, worldY, scale, seed);
  const v2 = smoothNoise(worldX, worldY, scale, seed + 1000);
  const v3 = smoothNoise(worldX, worldY, scale * 2, seed + 2000);

  if (v1 < 0.15) return 'swamp';
  if (v1 < 0.25 && v2 < 0.4) return 'chemical';
  if (v1 > 0.85 && v2 > 0.5) return 'desert';
  if (v1 > 0.75 && v2 < 0.4) return 'military';
  if (v2 > 0.7 && v1 > 0.3) return 'forest';
  if (v2 < 0.25 && v1 > 0.4) return 'junkyard';
  if (v3 > 0.6) return 'urban';
  if (v3 > 0.4) return 'suburbs';
  return 'farmland';
}

function hasAdjacentObstacle(tiles: number[][], lx: number, ly: number): boolean {
  const LARGE = new Set<number>([
    TileType.TREE, TileType.CAR, TileType.DEAD_TREE,
    TileType.BARREL, TileType.CRATE, TileType.BUSH,
    TileType.STUMP, TileType.ROCKS, TileType.FENCE,
  ]);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = lx + dx, ny = ly + dy;
      if (nx < 0 || nx >= CHUNK_SIZE || ny < 0 || ny >= CHUNK_SIZE) continue;
      if (LARGE.has(tiles[ny][nx])) return true;
    }
  }
  return false;
}

function generateBiomeTile(biome: BiomeType, r: number, noAdj: boolean): number {
  return generateBiomeTileFromDefs(biome, r, noAdj);
}

const ROAD_SPACING = 20;
function isRoad(worldX: number, worldY: number): number {
  const modX = ((worldX % ROAD_SPACING) + ROAD_SPACING) % ROAD_SPACING;
  const modY = ((worldY % ROAD_SPACING) + ROAD_SPACING) % ROAD_SPACING;
  if (modX === 0 || modX === 1) return TileType.ROAD;
  if (modY === 0 || modY === 1) return TileType.ROAD_H;
  if (modX === ROAD_SPACING - 1 || modX === 2) {
    if (modY <= 1 || modY >= ROAD_SPACING - 1) return TileType.CONCRETE;
    return 0;
  }
  if (modY === ROAD_SPACING - 1 || modY === 2) {
    if (modX <= 1 || modX >= ROAD_SPACING - 1) return TileType.CONCRETE;
    return 0;
  }
  return 0;
}

function getBuildingConfigs() {
  return getStructureConfigs().map((s) => ({
    label: s.label, minW: s.minW, maxW: s.maxW, minH: s.minH, maxH: s.maxH,
    biomes: s.biomes as string[], floorType: s.floorType,
  }));
}

function furnishInterior(tiles: number[][], bLocalX: number, bLocalY: number, bw: number, bh: number, label: string, rand: () => number) {
  const ix = bLocalX + 1;
  const iy = bLocalY + 1;
  const iw = bw - 2;
  const ih = bh - 2;

  const place = (rx: number, ry: number, t: number) => {
    const tx = ix + rx;
    const ty = iy + ry;
    if (tx < ix || tx >= ix + iw || ty < iy || ty >= iy + ih) return;
    if (ty < 0 || ty >= CHUNK_SIZE || tx < 0 || tx >= CHUNK_SIZE) return;
    if (tiles[ty][tx] !== TileType.FLOOR && tiles[ty][tx] !== TileType.METAL_FLOOR) return;
    tiles[ty][tx] = t;
  };

  switch (label) {
    case 'House': {
      const variant = Math.floor(rand() * 4);
      const midX = Math.floor(iw / 2);
      const midY = Math.floor(ih / 2);

      // Kitchen: top wall, left side — counter + stove + fridge
      place(0, 0, TileType.SHELF);
      place(1, 0, TileType.STOVE);
      if (iw > 5) place(2, 0, TileType.SHELF);
      if (iw > 6) place(3, 0, TileType.LOCKER);

      // Dining: center-left area
      if (iw > 5 && ih > 3) {
        place(midX - 1, 1, TileType.TABLE);
        if (variant < 2) place(midX, 1, TileType.TABLE);
      }

      // Living room: right side — shelves along right wall, couch center
      place(iw - 1, 0, TileType.SHELF);
      place(iw - 1, 1, TileType.SHELF);
      if (ih > 4) place(iw - 1, 2, TileType.LOCKER);
      if (ih > 3) {
        const couchY = Math.max(2, midY);
        place(iw - 2, couchY, TileType.COUCH);
        if (iw > 7) place(iw - 3, couchY, TileType.COUCH);
      }
      // Desk/TV against right wall, lower
      if (ih > 4) place(iw - 1, ih - 2, TileType.DESK);

      // Bedroom: bottom-left corner — bed + nightstand
      place(0, ih - 1, TileType.BED);
      place(1, ih - 1, TileType.BED);
      if (ih > 4) place(0, ih - 2, TileType.DESK);

      // Bottom wall furniture
      if (iw > 5) place(midX + 1, ih - 1, TileType.DESK);
      if (iw > 7) place(iw - 1, ih - 1, TileType.SHELF);

      // Bathroom in middle-left if large enough
      if (ih > 5 && iw > 6) place(0, midY, TileType.TOILET);

      // Left wall shelving
      if (ih > 4) place(0, 1, TileType.SHELF);
      break;
    }
    case 'Store': {
      for (let r = 0; r < Math.min(3, ih - 2); r++) {
        for (let c = 1; c < iw - 1; c += 3) place(c, 1 + r * 2, TileType.SHELF);
      }
      place(0, 0, TileType.DESK);
      place(1, 0, TileType.DESK);
      break;
    }
    case 'Hospital': {
      for (let r = 0; r < ih - 1; r += 3) {
        place(0, r, TileType.BED);
        place(1, r, TileType.BED);
        if (iw > 7) { place(iw - 1, r, TileType.BED); place(iw - 2, r, TileType.BED); }
      }
      place(Math.floor(iw / 2), 0, TileType.DESK);
      place(Math.floor(iw / 2) + 1, 0, TileType.DESK);
      place(0, ih - 1, TileType.SHELF);
      place(1, ih - 1, TileType.SHELF);
      break;
    }
    case 'Warehouse': {
      for (let r = 0; r < ih - 1; r += 2) {
        for (let c = 1; c < iw - 1; c += 4) {
          place(c, r, TileType.CRATE);
          if (c + 1 < iw - 1) place(c + 1, r, TileType.CRATE);
        }
      }
      place(0, 0, TileType.BARREL);
      place(iw - 1, 0, TileType.BARREL);
      break;
    }
    case 'Chem Lab': {
      for (let c = 1; c < iw - 1; c += 3) { place(c, 0, TileType.TABLE); place(c, 1, TileType.DESK); }
      place(0, ih - 1, TileType.BARREL);
      place(1, ih - 1, TileType.BARREL);
      place(iw - 1, ih - 1, TileType.LOCKER);
      place(iw - 1, ih - 2, TileType.SHELF);
      break;
    }
    case 'Barracks': {
      for (let r = 0; r < ih - 1; r += 3) {
        place(0, r, TileType.BED);
        place(1, r, TileType.BED);
        if (iw > 6) { place(iw - 1, r, TileType.BED); place(iw - 2, r, TileType.BED); }
      }
      place(0, 0, TileType.LOCKER);
      place(iw - 1, 0, TileType.LOCKER);
      place(Math.floor(iw / 2), ih - 1, TileType.TABLE);
      break;
    }
    case 'Armory': {
      for (let r = 0; r < ih - 1; r += 2) {
        place(0, r, TileType.LOCKER);
        if (iw > 5) place(iw - 1, r, TileType.LOCKER);
      }
      place(Math.floor(iw / 2), 0, TileType.DESK);
      place(0, ih - 1, TileType.CRATE);
      place(iw - 1, ih - 1, TileType.CRATE);
      break;
    }
    case 'Barn': {
      for (let c = 0; c < iw; c += 3) place(c, 0, TileType.CRATE);
      place(0, ih - 1, TileType.BARREL);
      place(1, ih - 1, TileType.BARREL);
      place(Math.floor(iw / 2), Math.floor(ih / 2), TileType.TABLE);
      break;
    }
    case 'Gas Station': {
      place(0, 0, TileType.SHELF);
      place(1, 0, TileType.SHELF);
      place(iw - 1, 0, TileType.SHELF);
      place(0, ih - 1, TileType.DESK);
      place(Math.floor(iw / 2), ih - 1, TileType.BARREL);
      break;
    }
    case 'Bunker': {
      for (let r = 0; r < ih - 1; r += 2) place(0, r, TileType.LOCKER);
      place(iw - 1, 0, TileType.DESK);
      place(iw - 2, 0, TileType.DESK);
      place(Math.floor(iw / 2), ih - 1, TileType.CRATE);
      place(0, ih - 1, TileType.BED);
      place(1, ih - 1, TileType.BED);
      break;
    }
  }
}

function generateLootForType(buildingType: string, rand: () => number): { defId: string; quantity: number; slotIndex: number }[] {
  const items: { defId: string; quantity: number; slotIndex: number }[] = [];
  const r = rand();
  switch (buildingType) {
    case 'Hospital':
      items.push({ defId: 'bandage', quantity: 1 + Math.floor(rand() * 3), slotIndex: 0 });
      if (r < 0.5) items.push({ defId: 'painkillers', quantity: 1, slotIndex: 1 });
      if (r < 0.3) items.push({ defId: 'medkit', quantity: 1, slotIndex: 2 });
      if (r < 0.2) items.push({ defId: 'alcohol', quantity: 1, slotIndex: 3 });
      break;
    case 'Store':
      items.push({ defId: 'canned_food', quantity: 1 + Math.floor(rand() * 2), slotIndex: 0 });
      items.push({ defId: 'water_bottle', quantity: 1 + Math.floor(rand() * 2), slotIndex: 1 });
      if (r < 0.3) items.push({ defId: 'baseball_bat', quantity: 1, slotIndex: 2 });
      break;
    case 'Warehouse':
      if (r < 0.4) items.push({ defId: 'pistol_ammo', quantity: 4 + Math.floor(rand() * 8), slotIndex: 0 });
      if (r < 0.3) items.push({ defId: 'shotgun_ammo', quantity: 2 + Math.floor(rand() * 4), slotIndex: 1 });
      items.push({ defId: 'nails', quantity: 3 + Math.floor(rand() * 5), slotIndex: 2 });
      if (r < 0.15) items.push({ defId: 'pistol', quantity: 1, slotIndex: 3 });
      if (r < 0.25) items.push({ defId: 'duct_tape', quantity: 1 + Math.floor(rand() * 2), slotIndex: 4 });
      break;
    case 'House':
      if (r < 0.6) items.push({ defId: 'canned_food', quantity: 1, slotIndex: 0 });
      if (r < 0.5) items.push({ defId: 'water_bottle', quantity: 1, slotIndex: 1 });
      if (r < 0.2) items.push({ defId: 'kitchen_knife', quantity: 1, slotIndex: 2 });
      if (r < 0.15) items.push({ defId: 'bandage', quantity: 1, slotIndex: 3 });
      break;
    case 'Car':
      if (r < 0.5) items.push({ defId: 'pistol_ammo', quantity: 2 + Math.floor(rand() * 4), slotIndex: 0 });
      if (r < 0.45) items.push({ defId: 'canned_food', quantity: 1, slotIndex: 1 });
      if (r < 0.2) items.push({ defId: 'crowbar', quantity: 1, slotIndex: 2 });
      if (r < 0.35) items.push({ defId: 'water_bottle', quantity: 1, slotIndex: 3 });
      if (r < 0.1) items.push({ defId: 'bandage', quantity: 1, slotIndex: 4 });
      if (r < 0.05) items.push({ defId: 'duct_tape', quantity: 1, slotIndex: 5 });
      break;
    case 'Armory':
      if (r < 0.5) items.push({ defId: 'pistol', quantity: 1, slotIndex: 0 });
      items.push({ defId: 'pistol_ammo', quantity: 8 + Math.floor(rand() * 12), slotIndex: 1 });
      if (r < 0.3) items.push({ defId: 'shotgun', quantity: 1, slotIndex: 2 });
      if (r < 0.4) items.push({ defId: 'shotgun_ammo', quantity: 4 + Math.floor(rand() * 6), slotIndex: 3 });
      if (r < 0.2) items.push({ defId: 'axe', quantity: 1, slotIndex: 4 });
      if (r < 0.15) items.push({ defId: 'military_vest', quantity: 1, slotIndex: 5 });
      break;
    case 'Barracks':
      if (r < 0.5) items.push({ defId: 'canned_food', quantity: 2, slotIndex: 0 });
      if (r < 0.4) items.push({ defId: 'water_bottle', quantity: 2, slotIndex: 1 });
      if (r < 0.3) items.push({ defId: 'bandage', quantity: 2, slotIndex: 2 });
      if (r < 0.15) items.push({ defId: 'combat_boots', quantity: 1, slotIndex: 3 });
      break;
    case 'Bunker':
      items.push({ defId: 'pistol_ammo', quantity: 6 + Math.floor(rand() * 10), slotIndex: 0 });
      if (r < 0.5) items.push({ defId: 'medkit', quantity: 1, slotIndex: 1 });
      if (r < 0.35) items.push({ defId: 'shotgun_ammo', quantity: 4 + Math.floor(rand() * 8), slotIndex: 2 });
      if (r < 0.2) items.push({ defId: 'riot_helmet', quantity: 1, slotIndex: 3 });
      items.push({ defId: 'canned_food', quantity: 2 + Math.floor(rand() * 3), slotIndex: 4 });
      break;
    default:
      if (r < 0.5) items.push({ defId: 'canned_food', quantity: 1, slotIndex: 0 });
      break;
  }
  return items;
}


function generateChunk(cx: number, cy: number, worldSeed: number): Chunk {
  const h = chunkHash(cx, cy, worldSeed);
  const rand = seededRandom(h);

  const tiles: number[][] = [];
  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    tiles[ly] = new Array(CHUNK_SIZE);
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      tiles[ly][lx] = TileType.GRASS;
    }
  }

  const worldOffX = cx * CHUNK_SIZE;
  const worldOffY = cy * CHUNK_SIZE;

  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      const wx = worldOffX + lx;
      const wy = worldOffY + ly;

      const roadTile = isRoad(wx, wy);
      if (roadTile) {
        tiles[ly][lx] = roadTile;
        continue;
      }

      const biome = getBiome(wx, wy, worldSeed);
      const r = rand();
      const noAdj = !hasAdjacentObstacle(tiles, lx, ly);
      tiles[ly][lx] = generateBiomeTile(biome, r, noAdj);
    }
  }

  const buildings: Building[] = [];
  const lootSpots: LootSpot[] = [];

  const centerBiome = getBiome(worldOffX + CHUNK_SIZE / 2, worldOffY + CHUNK_SIZE / 2, worldSeed);
  const buildChance = noise2d(cx, cy, worldSeed + 9999);
  const numBuildings = buildChance < 0.1 ? 0 : buildChance < 0.35 ? 1 : buildChance < 0.65 ? 2 : 3;

  for (let bi = 0; bi < numBuildings; bi++) {
    const eligible = getBuildingConfigs().filter(c => c.biomes.includes(centerBiome));
    if (eligible.length === 0) break;

    const cfg = eligible[Math.floor(rand() * eligible.length)];
    const bw = Math.min(cfg.minW + Math.floor(rand() * (cfg.maxW - cfg.minW + 1)), CHUNK_SIZE - 4);
    const bh = Math.min(cfg.minH + Math.floor(rand() * (cfg.maxH - cfg.minH + 1)), CHUNK_SIZE - 4);
    const bx = 2 + Math.floor(rand() * Math.max(1, CHUNK_SIZE - bw - 4));
    const by = 2 + Math.floor(rand() * Math.max(1, CHUNK_SIZE - bh - 4));

    if (bx + bw > CHUNK_SIZE - 1 || by + bh > CHUNK_SIZE - 1) continue;

    let overlaps = false;
    for (let cy2 = by - 1; cy2 <= by + bh; cy2++) {
      for (let cx2 = bx - 1; cx2 <= bx + bw; cx2++) {
        if (cy2 >= 0 && cy2 < CHUNK_SIZE && cx2 >= 0 && cx2 < CHUNK_SIZE) {
          const t = tiles[cy2][cx2];
          if (t === TileType.ROAD || t === TileType.ROAD_H || t === TileType.CONCRETE || t === TileType.WALL || t === TileType.FLOOR) {
            overlaps = true;
            break;
          }
        }
      }
      if (overlaps) break;
    }
    if (overlaps) continue;

    for (let cy2 = by; cy2 < by + bh; cy2++) {
      for (let cx2 = bx; cx2 < bx + bw; cx2++) {
        if (cy2 === by || cy2 === by + bh - 1 || cx2 === bx || cx2 === bx + bw - 1) {
          tiles[cy2][cx2] = TileType.WALL;
        } else {
          tiles[cy2][cx2] = cfg.floorType === 'metal' ? TileType.METAL_FLOOR : TileType.FLOOR;
        }
      }
    }

    tiles[by][bx] = TileType.WALL_TOP;
    tiles[by][bx + bw - 1] = TileType.WALL_TOP;
    tiles[by + bh - 1][bx] = TileType.WALL_TOP;
    tiles[by + bh - 1][bx + bw - 1] = TileType.WALL_TOP;

    const doorSide = Math.floor(rand() * 4);
    let doorX: number, doorY: number;
    if (doorSide === 0) { doorX = bx + Math.floor(bw / 2); doorY = by; }
    else if (doorSide === 1) { doorX = bx + Math.floor(bw / 2); doorY = by + bh - 1; }
    else if (doorSide === 2) { doorX = bx; doorY = by + Math.floor(bh / 2); }
    else { doorX = bx + bw - 1; doorY = by + Math.floor(bh / 2); }
    tiles[doorY][doorX] = TileType.DOOR;

    for (let side = 0; side < 4; side++) {
      if (side === doorSide) continue;
      if (rand() < 0.5) {
        let wx2: number, wy2: number;
        if (side === 0) { wx2 = bx + 2 + Math.floor(rand() * Math.max(1, bw - 4)); wy2 = by; }
        else if (side === 1) { wx2 = bx + 2 + Math.floor(rand() * Math.max(1, bw - 4)); wy2 = by + bh - 1; }
        else if (side === 2) { wx2 = bx; wy2 = by + 2 + Math.floor(rand() * Math.max(1, bh - 4)); }
        else { wx2 = bx + bw - 1; wy2 = by + 2 + Math.floor(rand() * Math.max(1, bh - 4)); }
        if (wy2 >= 0 && wy2 < CHUNK_SIZE && wx2 >= 0 && wx2 < CHUNK_SIZE) {
          tiles[wy2][wx2] = TileType.WINDOW;
        }
      }
    }

    furnishInterior(tiles, bx, by, bw, bh, cfg.label, rand);

    const bld: Building = { x: worldOffX + bx, y: worldOffY + by, w: bw, h: bh, label: cfg.label };
    buildings.push(bld);

    const lootCount = getLootCountFromDefs(cfg.label);
    let placed = 0;
    for (let attempt = 0; attempt < lootCount * 4 && placed < lootCount; attempt++) {
      const lx = bx + 1 + Math.floor(rand() * (bw - 2));
      const ly = by + 1 + Math.floor(rand() * (bh - 2));
      if (ly >= CHUNK_SIZE || lx >= CHUNK_SIZE) continue;
      const tileAtSpot = tiles[ly][lx];
      if (tileAtSpot === TileType.FLOOR || tileAtSpot === TileType.METAL_FLOOR) {
        tiles[ly][lx] = TileType.LOOT_SPOT;
        lootSpots.push({
          tileX: worldOffX + lx,
          tileY: worldOffY + ly,
          items: generateLootForType(cfg.label, rand),
          searched: false,
          label: cfg.label,
        });
        placed++;
      }
    }
  }

  // Place cars beside roads with occasional loot
  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      const t = tiles[ly][lx];
      if (t !== TileType.ROAD && t !== TileType.ROAD_H) continue;
      if (rand() > 0.06) continue;

      // Try to place a car on an adjacent grass/dirt tile
      const offsets = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dx, dy] of offsets) {
        const nx = lx + dx, ny = ly + dy;
        if (nx < 0 || nx >= CHUNK_SIZE || ny < 0 || ny >= CHUNK_SIZE) continue;
        const adj = tiles[ny][nx];
        if (adj !== TileType.GRASS && adj !== TileType.DIRT && adj !== TileType.CONCRETE) continue;
        if (hasAdjacentObstacle(tiles, nx, ny)) continue;
        tiles[ny][nx] = TileType.CAR;
        if (rand() < 0.4) {
          lootSpots.push({
            tileX: worldOffX + nx,
            tileY: worldOffY + ny,
            items: generateLootForType('Car', rand),
            searched: false,
            label: 'Car',
          });
        }
        break;
      }
    }
  }

  // Add loot to junkyard cars
  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      if (tiles[ly][lx] !== TileType.CAR) continue;
      const biome = getBiome(worldOffX + lx, worldOffY + ly, worldSeed);
      if (biome !== 'junkyard') continue;
      if (rand() < 0.3) {
        lootSpots.push({
          tileX: worldOffX + lx,
          tileY: worldOffY + ly,
          items: generateLootForType('Car', rand),
          searched: false,
          label: 'Wrecked Car',
        });
      }
    }
  }

  for (let i = 0; i < 8; i++) {
    const tx = Math.floor(rand() * CHUNK_SIZE);
    const ty = Math.floor(rand() * CHUNK_SIZE);
    if (tiles[ty][tx] === TileType.GRASS && !hasAdjacentObstacle(tiles, tx, ty)) {
      tiles[ty][tx] = TileType.TREE;
    }
  }

  const zombies: ZombieState[] = [];
  const zombieCount = 2 + Math.floor(rand() * 4);
  for (let i = 0; i < zombieCount; i++) {
    const tx = Math.floor(rand() * CHUNK_SIZE);
    const ty = Math.floor(rand() * CHUNK_SIZE);
    const t = tiles[ty][tx];
    if (SOLID_TILES.has(t) || t === TileType.WATER || t === TileType.TOXIC_PUDDLE) continue;

    const typeRoll = rand();
    let type: 'walker' | 'runner' | 'tank' = 'walker';
    let hp = 60, spd = 40, dmg = 10;
    if (typeRoll > 0.88) { type = 'tank'; hp = 200; spd = 25; dmg = 25; }
    else if (typeRoll > 0.68) { type = 'runner'; hp = 40; spd = 80; dmg = 15; }

    const zx = (worldOffX + tx) * TILE_SIZE + TILE_SIZE / 2;
    const zy = (worldOffY + ty) * TILE_SIZE + TILE_SIZE / 2;

    zombies.push({
      id: `z_${cx}_${cy}_${i}`,
      x: zx, y: zy,
      type, health: hp, maxHealth: hp,
      speed: spd, damage: dmg,
      state: 'roaming',
      targetX: zx + (rand() - 0.5) * 400,
      targetY: zy + (rand() - 0.5) * 400,
      lastSawPlayerAt: 0,
      alertLevel: 0,
      attackCooldown: 0,
      facing: rand() * Math.PI * 2,
      animFrame: Math.floor(rand() * 20),
      animTimer: rand() * 0.1,
      knockbackX: 0, knockbackY: 0,
      deathTimer: 0,
    });
  }

  return { cx, cy, tiles, buildings, lootSpots, zombies, modified: false };
}

/** Helpers for safe coordinate math with negative values */
function tileToChunk(tileCoord: number): number {
  return Math.floor(tileCoord / CHUNK_SIZE);
}
function tileToLocal(tileCoord: number): number {
  return ((tileCoord % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
}
function pixelToChunk(pixelCoord: number): number {
  return Math.floor(pixelCoord / (CHUNK_SIZE * TILE_SIZE));
}

export class ChunkManager {
  private chunks = new Map<string, Chunk>();
  private worldSeed: number;

  constructor(seed: number) {
    this.worldSeed = seed;
  }

  private key(cx: number, cy: number): string { return `${cx},${cy}`; }

  getChunk(cx: number, cy: number): Chunk {
    const k = this.key(cx, cy);
    let chunk = this.chunks.get(k);
    if (!chunk) {
      chunk = generateChunk(cx, cy, this.worldSeed);
      this.chunks.set(k, chunk);
    }
    return chunk;
  }

  hasChunk(cx: number, cy: number): boolean {
    return this.chunks.has(this.key(cx, cy));
  }

  getTile(worldTileX: number, worldTileY: number): number {
    const cx = tileToChunk(worldTileX);
    const cy = tileToChunk(worldTileY);
    const lx = tileToLocal(worldTileX);
    const ly = tileToLocal(worldTileY);
    const chunk = this.getChunk(cx, cy);
    return chunk.tiles[ly][lx];
  }

  setTile(worldTileX: number, worldTileY: number, value: number) {
    const cx = tileToChunk(worldTileX);
    const cy = tileToChunk(worldTileY);
    const lx = tileToLocal(worldTileX);
    const ly = tileToLocal(worldTileY);
    const chunk = this.getChunk(cx, cy);
    chunk.tiles[ly][lx] = value;
    chunk.modified = true;
  }

  updateLoadedChunks(playerWorldX: number, playerWorldY: number) {
    const pcx = pixelToChunk(playerWorldX);
    const pcy = pixelToChunk(playerWorldY);

    for (let dy = -LOAD_RADIUS; dy <= LOAD_RADIUS; dy++) {
      for (let dx = -LOAD_RADIUS; dx <= LOAD_RADIUS; dx++) {
        this.getChunk(pcx + dx, pcy + dy);
      }
    }

    const toDelete: string[] = [];
    for (const [k, chunk] of this.chunks) {
      if (Math.abs(chunk.cx - pcx) > UNLOAD_RADIUS || Math.abs(chunk.cy - pcy) > UNLOAD_RADIUS) {
        if (!chunk.modified) {
          toDelete.push(k);
        }
      }
    }
    for (const k of toDelete) this.chunks.delete(k);
  }

  getLoadedChunks(): Chunk[] {
    return Array.from(this.chunks.values());
  }

  /** Collect zombies only from chunks near the player for perf */
  getVisibleZombies(playerX: number, playerY: number, radiusChunks: number = 3): ZombieState[] {
    const pcx = pixelToChunk(playerX);
    const pcy = pixelToChunk(playerY);
    const all: ZombieState[] = [];
    for (let dy = -radiusChunks; dy <= radiusChunks; dy++) {
      for (let dx = -radiusChunks; dx <= radiusChunks; dx++) {
        const k = this.key(pcx + dx, pcy + dy);
        const chunk = this.chunks.get(k);
        if (chunk) all.push(...chunk.zombies);
      }
    }
    return all;
  }

  setChunkZombies(cx: number, cy: number, zombies: ZombieState[]) {
    const k = this.key(cx, cy);
    const chunk = this.chunks.get(k);
    if (chunk) chunk.zombies = zombies;
  }

  /** Clear all zombies from all loaded chunks – used before writeback */
  clearAllZombies() {
    for (const chunk of this.chunks.values()) {
      chunk.zombies = [];
    }
  }

  /** Get loot spots from chunks near a position */
  getVisibleLootSpots(playerX: number, playerY: number, radiusChunks: number = 2): LootSpot[] {
    const pcx = pixelToChunk(playerX);
    const pcy = pixelToChunk(playerY);
    const all: LootSpot[] = [];
    for (let dy = -radiusChunks; dy <= radiusChunks; dy++) {
      for (let dx = -radiusChunks; dx <= radiusChunks; dx++) {
        const k = this.key(pcx + dx, pcy + dy);
        const chunk = this.chunks.get(k);
        if (chunk) all.push(...chunk.lootSpots);
      }
    }
    return all;
  }

  updateLootSpot(tileX: number, tileY: number, update: Partial<LootSpot>) {
    const cx = tileToChunk(tileX);
    const cy = tileToChunk(tileY);
    const k = this.key(cx, cy);
    const chunk = this.chunks.get(k);
    if (!chunk) return;
    const spot = chunk.lootSpots.find(ls => ls.tileX === tileX && ls.tileY === tileY);
    if (spot) {
      Object.assign(spot, update);
      chunk.modified = true;
    }
  }

  /** Get buildings from chunks near a position */
  getVisibleBuildings(playerX: number, playerY: number, radiusChunks: number = 3): Building[] {
    const pcx = pixelToChunk(playerX);
    const pcy = pixelToChunk(playerY);
    const all: Building[] = [];
    for (let dy = -radiusChunks; dy <= radiusChunks; dy++) {
      for (let dx = -radiusChunks; dx <= radiusChunks; dx++) {
        const k = this.key(pcx + dx, pcy + dy);
        const chunk = this.chunks.get(k);
        if (chunk) all.push(...chunk.buildings);
      }
    }
    return all;
  }

  /** Remove zombies from the spawn chunk's center area */
  clearSpawnArea(playerTileX: number, playerTileY: number, radius: number = 4) {
    const cx = tileToChunk(playerTileX);
    const cy = tileToChunk(playerTileY);
    const px = (playerTileX) * TILE_SIZE + TILE_SIZE / 2;
    const py = (playerTileY) * TILE_SIZE + TILE_SIZE / 2;
    const dist = radius * TILE_SIZE;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const k = this.key(cx + dx, cy + dy);
        const chunk = this.chunks.get(k);
        if (chunk) {
          chunk.zombies = chunk.zombies.filter(z => {
            const zdx = z.x - px;
            const zdy = z.y - py;
            return Math.sqrt(zdx * zdx + zdy * zdy) > dist;
          });
        }
      }
    }
  }

  getSeed(): number { return this.worldSeed; }

  serialize(): { seed: number; modified: Array<{ cx: number; cy: number; tiles: number[][]; lootSpots: LootSpot[]; zombies: ZombieState[] }> } {
    const modified: Array<{ cx: number; cy: number; tiles: number[][]; lootSpots: LootSpot[]; zombies: ZombieState[] }> = [];
    for (const chunk of this.chunks.values()) {
      if (chunk.modified) {
        modified.push({ cx: chunk.cx, cy: chunk.cy, tiles: chunk.tiles, lootSpots: chunk.lootSpots, zombies: chunk.zombies });
      }
    }
    return { seed: this.worldSeed, modified };
  }

  deserialize(data: ReturnType<ChunkManager['serialize']>) {
    this.worldSeed = data.seed;
    for (const m of data.modified) {
      const chunk = this.getChunk(m.cx, m.cy);
      chunk.tiles = m.tiles;
      chunk.lootSpots = m.lootSpots;
      chunk.zombies = m.zombies;
      chunk.modified = true;
    }
  }
}
