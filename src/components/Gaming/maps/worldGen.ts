import { TileType, MAP_WIDTH, MAP_HEIGHT, SOLID_TILES, type LootSpot } from '../engine/types';
import { getStructureConfigs, generateBiomeTileFromDefs, getLootCountFromDefs } from '../data/gameDefinitions';

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const LARGE_OBSTACLES = new Set<number>([
  TileType.TREE, TileType.CAR, TileType.DEAD_TREE,
  TileType.BARREL, TileType.CRATE, TileType.BUSH,
  TileType.STUMP, TileType.ROCKS, TileType.FENCE,
]);

function hasAdjacentObstacle(tiles: number[][], x: number, y: number): boolean {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) continue;
      if (LARGE_OBSTACLES.has(tiles[ny][nx])) return true;
    }
  }
  return false;
}

interface Building {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

type BiomeType = 'urban' | 'suburbs' | 'swamp' | 'chemical' | 'military' | 'farmland' | 'junkyard' | 'forest' | 'desert';

interface BiomeZone {
  type: BiomeType;
  cx: number;
  cy: number;
  radius: number;
}

function furnishInterior(tiles: number[][], b: Building, rand: () => number) {
  const ix = b.x + 1;
  const iy = b.y + 1;
  const iw = b.w - 2;
  const ih = b.h - 2;

  const place = (rx: number, ry: number, t: number) => {
    const tx = ix + rx;
    const ty = iy + ry;
    if (tx < ix || tx >= ix + iw || ty < iy || ty >= iy + ih) return;
    if (tiles[ty][tx] !== TileType.FLOOR && tiles[ty][tx] !== TileType.METAL_FLOOR) return;
    tiles[ty][tx] = t;
  };

  switch (b.label) {
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
        for (let c = 1; c < iw - 1; c += 3) {
          place(c, 1 + r * 2, TileType.SHELF);
        }
      }
      place(0, 0, TileType.DESK);
      place(1, 0, TileType.DESK);
      break;
    }
    case 'Hospital': {
      for (let r = 0; r < ih - 1; r += 3) {
        place(0, r, TileType.BED);
        place(1, r, TileType.BED);
        if (iw > 7) {
          place(iw - 1, r, TileType.BED);
          place(iw - 2, r, TileType.BED);
        }
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
      for (let c = 1; c < iw - 1; c += 3) {
        place(c, 0, TileType.TABLE);
        place(c, 1, TileType.DESK);
      }
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
      for (let c = 0; c < iw; c += 3) {
        place(c, 0, TileType.CRATE);
      }
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
      for (let r = 0; r < ih - 1; r += 2) {
        place(0, r, TileType.LOCKER);
      }
      place(iw - 1, 0, TileType.DESK);
      place(iw - 2, 0, TileType.DESK);
      place(Math.floor(iw / 2), ih - 1, TileType.CRATE);
      place(0, ih - 1, TileType.BED);
      place(1, ih - 1, TileType.BED);
      break;
    }
  }
}

export function generateWorld(seed = 42): { tiles: number[][]; lootSpots: LootSpot[]; buildings: Building[] } {
  const rand = seededRandom(seed);
  const tiles: number[][] = [];
  const lootSpots: LootSpot[] = [];
  const buildings: Building[] = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    tiles[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      tiles[y][x] = TileType.GRASS;
    }
  }

  const biomes: BiomeZone[] = [
    { type: 'urban', cx: 60, cy: 60, radius: 22 },
    { type: 'suburbs', cx: 30, cy: 30, radius: 18 },
    { type: 'suburbs', cx: 90, cy: 90, radius: 18 },
    { type: 'swamp', cx: 15, cy: 90, radius: 20 },
    { type: 'chemical', cx: 100, cy: 20, radius: 16 },
    { type: 'military', cx: 20, cy: 60, radius: 14 },
    { type: 'farmland', cx: 80, cy: 40, radius: 18 },
    { type: 'junkyard', cx: 45, cy: 100, radius: 14 },
    { type: 'forest', cx: 105, cy: 60, radius: 16 },
    { type: 'desert', cx: 60, cy: 15, radius: 15 },
  ];

  function getBiome(x: number, y: number): BiomeType {
    let closest: BiomeType = 'suburbs';
    let minDist = Infinity;
    for (const b of biomes) {
      const dx = x - b.cx;
      const dy = y - b.cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < b.radius && d < minDist) {
        minDist = d;
        closest = b.type;
      }
    }
    return closest;
  }

  for (let y = 2; y < MAP_HEIGHT - 2; y++) {
    for (let x = 2; x < MAP_WIDTH - 2; x++) {
      const biome = getBiome(x, y);
      const r = rand();
      const noAdj = !hasAdjacentObstacle(tiles, x, y);
      tiles[y][x] = generateBiomeTileFromDefs(biome, r, noAdj);
    }
  }

  const hRoads = [15, 35, 55, 75, 95, 110];
  const vRoads = [15, 35, 55, 75, 95, 110];

  for (const ry of hRoads) {
    if (ry + 2 >= MAP_HEIGHT) continue;
    for (let x = 0; x < MAP_WIDTH; x++) {
      tiles[ry][x] = TileType.ROAD_H;
      tiles[ry + 1][x] = TileType.ROAD_H;
      if (ry - 1 >= 0) tiles[ry - 1][x] = TileType.CONCRETE;
      if (ry + 2 < MAP_HEIGHT) tiles[ry + 2][x] = TileType.CONCRETE;
    }
  }

  for (const rx of vRoads) {
    if (rx + 2 >= MAP_WIDTH) continue;
    for (let y = 0; y < MAP_HEIGHT; y++) {
      tiles[y][rx] = TileType.ROAD;
      tiles[y][rx + 1] = TileType.ROAD;
      if (rx - 1 >= 0) tiles[y][rx - 1] = TileType.CONCRETE;
      if (rx + 2 < MAP_WIDTH) tiles[y][rx + 2] = TileType.CONCRETE;
    }
  }

  const buildingConfigs = getStructureConfigs().map((s) => ({
    label: s.label, minW: s.minW, maxW: s.maxW, minH: s.minH, maxH: s.maxH,
    count: s.count, biomes: s.biomes as string[], floorType: s.floorType,
  }));

  function overlapsRoad(bx: number, by: number, bw: number, bh: number): boolean {
    for (let cy = by; cy < by + bh; cy++) {
      for (let cx = bx; cx < bx + bw; cx++) {
        if (cy >= 0 && cy < MAP_HEIGHT && cx >= 0 && cx < MAP_WIDTH) {
          if (tiles[cy][cx] === TileType.ROAD || tiles[cy][cx] === TileType.ROAD_H || tiles[cy][cx] === TileType.CONCRETE) return true;
        }
      }
    }
    return false;
  }

  function overlapsBuilding(bx: number, by: number, bw: number, bh: number): boolean {
    for (const b of buildings) {
      if (bx < b.x + b.w + 2 && bx + bw + 2 > b.x && by < b.y + b.h + 2 && by + bh + 2 > b.y) return true;
    }
    return false;
  }

  for (const cfg of buildingConfigs) {
    let placed = 0;
    let attempts = 0;
    while (placed < cfg.count && attempts < 600) {
      attempts++;
      const bw = Math.floor(rand() * (cfg.maxW - cfg.minW + 1)) + cfg.minW;
      const bh = Math.floor(rand() * (cfg.maxH - cfg.minH + 1)) + cfg.minH;
      const bx = Math.floor(rand() * (MAP_WIDTH - bw - 4)) + 2;
      const by = Math.floor(rand() * (MAP_HEIGHT - bh - 4)) + 2;

      const centerBiome = getBiome(bx + bw / 2, by + bh / 2);
      if (!cfg.biomes.includes(centerBiome)) continue;

      if (overlapsRoad(bx - 1, by - 1, bw + 2, bh + 2)) continue;
      if (overlapsBuilding(bx, by, bw, bh)) continue;

      buildings.push({ x: bx, y: by, w: bw, h: bh, label: cfg.label });
      placed++;

      const floorType = cfg.floorType === 'metal' ? TileType.METAL_FLOOR : TileType.FLOOR;

      for (let cy = by; cy < by + bh; cy++) {
        for (let cx = bx; cx < bx + bw; cx++) {
          if (cy === by || cy === by + bh - 1 || cx === bx || cx === bx + bw - 1) {
            tiles[cy][cx] = TileType.WALL;
          } else {
            tiles[cy][cx] = floorType;
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
          let wx: number, wy: number;
          if (side === 0) { wx = bx + 2 + Math.floor(rand() * (bw - 4)); wy = by; }
          else if (side === 1) { wx = bx + 2 + Math.floor(rand() * (bw - 4)); wy = by + bh - 1; }
          else if (side === 2) { wx = bx; wy = by + 2 + Math.floor(rand() * (bh - 4)); }
          else { wx = bx + bw - 1; wy = by + 2 + Math.floor(rand() * (bh - 4)); }
          tiles[wy][wx] = TileType.WINDOW;
        }
      }

      furnishInterior(tiles, { x: bx, y: by, w: bw, h: bh, label: cfg.label }, rand);

      const lootCount = getLootCountFromDefs(cfg.label);
      for (let l = 0; l < lootCount; l++) {
        const lx = bx + 1 + Math.floor(rand() * (bw - 2));
        const ly = by + 1 + Math.floor(rand() * (bh - 2));
        const tileAtSpot = tiles[ly][lx];
        if (tileAtSpot === TileType.FLOOR || tileAtSpot === TileType.METAL_FLOOR) {
          tiles[ly][lx] = TileType.LOOT_SPOT;
          lootSpots.push({
            tileX: lx,
            tileY: ly,
            items: generateLootForType(cfg.label, rand),
            searched: false,
            label: cfg.label,
          });
        }
      }
    }
  }

  for (let i = 0; i < 250; i++) {
    const tx = Math.floor(rand() * MAP_WIDTH);
    const ty = Math.floor(rand() * MAP_HEIGHT);
    if (tiles[ty][tx] === TileType.GRASS && rand() < 0.7 && !hasAdjacentObstacle(tiles, tx, ty)) {
      tiles[ty][tx] = TileType.TREE;
    }
  }

  for (let i = 0; i < 40; i++) {
    for (const ry of hRoads) {
      const cx = Math.floor(rand() * MAP_WIDTH);
      if (ry + 3 < MAP_HEIGHT && tiles[ry + 3][cx] === TileType.GRASS && !hasAdjacentObstacle(tiles, cx, ry + 3)) {
        tiles[ry + 3][cx] = TileType.CAR;
        if (rand() < 0.4) {
          lootSpots.push({
            tileX: cx, tileY: ry + 3,
            items: generateLootForType('Car', rand),
            searched: false,
            label: 'Car',
          });
        }
      }
    }
  }

  for (let i = 0; i < 20; i++) {
    const fx = Math.floor(rand() * (MAP_WIDTH - 4)) + 2;
    const fy = Math.floor(rand() * (MAP_HEIGHT - 4)) + 2;
    const fLen = 4 + Math.floor(rand() * 8);
    const fDir = rand() < 0.5;
    for (let f = 0; f < fLen; f++) {
      const tx = fDir ? fx + f : fx;
      const ty = fDir ? fy : fy + f;
      if (tx < MAP_WIDTH && ty < MAP_HEIGHT && tiles[ty][tx] === TileType.GRASS && !hasAdjacentObstacle(tiles, tx, ty)) {
        tiles[ty][tx] = TileType.FENCE;
      }
    }
  }

  for (const b of biomes) {
    if (b.type === 'junkyard') {
      for (let i = 0; i < 25; i++) {
        const jx = b.cx - b.radius + Math.floor(rand() * b.radius * 2);
        const jy = b.cy - b.radius + Math.floor(rand() * b.radius * 2);
        if (jx >= 0 && jx < MAP_WIDTH && jy >= 0 && jy < MAP_HEIGHT) {
          if ((tiles[jy][jx] === TileType.RUBBLE || tiles[jy][jx] === TileType.DIRT || tiles[jy][jx] === TileType.CONCRETE) && !hasAdjacentObstacle(tiles, jx, jy)) {
            tiles[jy][jx] = TileType.CAR;
            if (rand() < 0.3) {
              lootSpots.push({
                tileX: jx, tileY: jy,
                items: generateLootForType('Car', rand),
                searched: false,
                label: 'Wrecked Car',
              });
            }
          }
        }
      }
    }

    if (b.type === 'chemical') {
      for (let i = 0; i < 15; i++) {
        const px = b.cx - b.radius + Math.floor(rand() * b.radius * 2);
        const py = b.cy - b.radius + Math.floor(rand() * b.radius * 2);
        if (px >= 0 && px < MAP_WIDTH && py >= 0 && py < MAP_HEIGHT) {
          if ((tiles[py][px] === TileType.METAL_FLOOR || tiles[py][px] === TileType.CONCRETE) && !hasAdjacentObstacle(tiles, px, py)) {
            tiles[py][px] = TileType.BARREL;
            if (rand() < 0.25) {
              lootSpots.push({
                tileX: px, tileY: py,
                items: generateLootForType('Chem Lab', rand),
                searched: false,
                label: 'Chemical Barrel',
              });
            }
          }
        }
      }
    }

    if (b.type === 'military') {
      for (let i = 0; i < 12; i++) {
        const mx = b.cx - b.radius + Math.floor(rand() * b.radius * 2);
        const my = b.cy - b.radius + Math.floor(rand() * b.radius * 2);
        if (mx >= 0 && mx < MAP_WIDTH && my >= 0 && my < MAP_HEIGHT) {
          if ((tiles[my][mx] === TileType.CONCRETE || tiles[my][mx] === TileType.GRASS) && !hasAdjacentObstacle(tiles, mx, my)) {
            tiles[my][mx] = TileType.CRATE;
            if (rand() < 0.35) {
              lootSpots.push({
                tileX: mx, tileY: my,
                items: generateLootForType('Armory', rand),
                searched: false,
                label: 'Military Crate',
              });
            }
          }
        }
      }
    }
  }

  return { tiles, lootSpots, buildings };
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
      if (r < 0.2) items.push({ defId: 'scrap_metal', quantity: 2 + Math.floor(rand() * 3), slotIndex: 5 });
      if (r < 0.1) items.push({ defId: 'wrench', quantity: 1, slotIndex: 6 });
      break;
    case 'House':
      if (r < 0.6) items.push({ defId: 'canned_food', quantity: 1, slotIndex: 0 });
      if (r < 0.5) items.push({ defId: 'water_bottle', quantity: 1, slotIndex: 1 });
      if (r < 0.2) items.push({ defId: 'kitchen_knife', quantity: 1, slotIndex: 2 });
      if (r < 0.15) items.push({ defId: 'bandage', quantity: 1, slotIndex: 3 });
      if (r < 0.1) items.push({ defId: 'rags', quantity: 2, slotIndex: 4 });
      break;
    case 'Car':
      if (r < 0.4) items.push({ defId: 'pistol_ammo', quantity: 2 + Math.floor(rand() * 4), slotIndex: 0 });
      if (r < 0.3) items.push({ defId: 'canned_food', quantity: 1, slotIndex: 1 });
      if (r < 0.15) items.push({ defId: 'crowbar', quantity: 1, slotIndex: 2 });
      if (r < 0.2) items.push({ defId: 'scrap_metal', quantity: 1 + Math.floor(rand() * 3), slotIndex: 3 });
      if (r < 0.1) items.push({ defId: 'duct_tape', quantity: 1, slotIndex: 4 });
      if (r < 0.08) items.push({ defId: 'screwdriver', quantity: 1, slotIndex: 5 });
      break;
    case 'Chem Lab':
      items.push({ defId: 'alcohol', quantity: 1 + Math.floor(rand() * 2), slotIndex: 0 });
      if (r < 0.5) items.push({ defId: 'bandage', quantity: 2, slotIndex: 1 });
      if (r < 0.35) items.push({ defId: 'medkit', quantity: 1, slotIndex: 2 });
      if (r < 0.2) items.push({ defId: 'rags', quantity: 3, slotIndex: 3 });
      break;
    case 'Barracks':
      if (r < 0.5) items.push({ defId: 'canned_food', quantity: 2, slotIndex: 0 });
      if (r < 0.4) items.push({ defId: 'water_bottle', quantity: 2, slotIndex: 1 });
      if (r < 0.3) items.push({ defId: 'bandage', quantity: 2, slotIndex: 2 });
      if (r < 0.15) items.push({ defId: 'crowbar', quantity: 1, slotIndex: 3 });
      if (r < 0.25) items.push({ defId: 'mre', quantity: 1 + Math.floor(rand() * 2), slotIndex: 4 });
      break;
    case 'Armory':
      if (r < 0.5) items.push({ defId: 'pistol', quantity: 1, slotIndex: 0 });
      items.push({ defId: 'pistol_ammo', quantity: 8 + Math.floor(rand() * 12), slotIndex: 1 });
      if (r < 0.3) items.push({ defId: 'shotgun', quantity: 1, slotIndex: 2 });
      if (r < 0.4) items.push({ defId: 'shotgun_ammo', quantity: 4 + Math.floor(rand() * 6), slotIndex: 3 });
      if (r < 0.2) items.push({ defId: 'axe', quantity: 1, slotIndex: 4 });
      if (r < 0.12) items.push({ defId: 'chainsaw', quantity: 1, slotIndex: 5 });
      break;
    case 'Barn':
      if (r < 0.5) items.push({ defId: 'canned_food', quantity: 2, slotIndex: 0 });
      if (r < 0.3) items.push({ defId: 'rags', quantity: 3, slotIndex: 1 });
      if (r < 0.2) items.push({ defId: 'axe', quantity: 1, slotIndex: 2 });
      if (r < 0.15) items.push({ defId: 'nails', quantity: 5, slotIndex: 3 });
      if (r < 0.2) items.push({ defId: 'scrap_metal', quantity: 2 + Math.floor(rand() * 2), slotIndex: 4 });
      if (r < 0.12) items.push({ defId: 'wrench', quantity: 1, slotIndex: 5 });
      break;
    case 'Gas Station':
      if (r < 0.5) items.push({ defId: 'canned_food', quantity: 1, slotIndex: 0 });
      if (r < 0.4) items.push({ defId: 'water_bottle', quantity: 1, slotIndex: 1 });
      if (r < 0.25) items.push({ defId: 'alcohol', quantity: 1, slotIndex: 2 });
      if (r < 0.15) items.push({ defId: 'crowbar', quantity: 1, slotIndex: 3 });
      if (r < 0.2) items.push({ defId: 'duct_tape', quantity: 1, slotIndex: 4 });
      if (r < 0.15) items.push({ defId: 'screwdriver', quantity: 1, slotIndex: 5 });
      break;
    case 'Bunker':
      items.push({ defId: 'pistol_ammo', quantity: 6 + Math.floor(rand() * 10), slotIndex: 0 });
      if (r < 0.5) items.push({ defId: 'medkit', quantity: 1, slotIndex: 1 });
      if (r < 0.35) items.push({ defId: 'shotgun_ammo', quantity: 4 + Math.floor(rand() * 8), slotIndex: 2 });
      if (r < 0.2) items.push({ defId: 'shotgun', quantity: 1, slotIndex: 3 });
      items.push({ defId: 'canned_food', quantity: 2 + Math.floor(rand() * 3), slotIndex: 4 });
      if (r < 0.35) items.push({ defId: 'mre', quantity: 2 + Math.floor(rand() * 2), slotIndex: 5 });
      break;
    default:
      if (r < 0.5) items.push({ defId: 'canned_food', quantity: 1, slotIndex: 0 });
      break;
  }

  return items;
}
