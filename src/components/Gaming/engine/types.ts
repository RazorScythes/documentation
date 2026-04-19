export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const TILE_SIZE = 32;
export const CHUNK_SIZE = 32;

/** @deprecated – only used during migration; world is now infinite */
export const MAP_WIDTH = 120;
/** @deprecated – only used during migration; world is now infinite */
export const MAP_HEIGHT = 120;
/** @deprecated – use chunk-based coordinates */
export const WORLD_WIDTH = MAP_WIDTH * TILE_SIZE;
/** @deprecated – use chunk-based coordinates */
export const WORLD_HEIGHT = MAP_HEIGHT * TILE_SIZE;

export const enum TileType {
  GRASS = 0,
  ROAD = 1,
  WALL = 2,
  FLOOR = 3,
  DOOR = 4,
  WATER = 5,
  DIRT = 6,
  CONCRETE = 7,
  WALL_TOP = 8,
  WINDOW = 9,
  LOOT_SPOT = 10,
  TREE = 11,
  CAR = 12,
  FENCE = 13,
  SWAMP = 14,
  TOXIC_PUDDLE = 15,
  METAL_FLOOR = 16,
  PIPE = 17,
  RUBBLE = 18,
  TALL_GRASS = 19,
  DEAD_TREE = 20,
  BARREL = 21,
  CRATE = 22,
  SAND = 23,
  TABLE = 24,
  BED = 25,
  SHELF = 26,
  STOVE = 27,
  TOILET = 28,
  COUCH = 29,
  DESK = 30,
  LOCKER = 31,
  BUSH = 32,
  STUMP = 33,
  ROCKS = 34,
  ROAD_H = 35,
  DOOR_LOCKED = 36,
}

export const SOLID_TILES = new Set<number>([
  TileType.WALL,
  TileType.WALL_TOP,
  TileType.WINDOW,
  TileType.WATER,
  TileType.TREE,
  TileType.CAR,
  TileType.FENCE,
  TileType.PIPE,
  TileType.BARREL,
  TileType.CRATE,
  TileType.DEAD_TREE,
  TileType.TABLE,
  TileType.BED,
  TileType.SHELF,
  TileType.STOVE,
  TileType.TOILET,
  TileType.COUCH,
  TileType.DESK,
  TileType.LOCKER,
  TileType.BUSH,
  TileType.STUMP,
  TileType.ROCKS,
  TileType.DOOR_LOCKED,
]);

export type ArmorSlot = 'head' | 'body' | 'legs';

export interface ItemDef {
  id: string;
  name: string;
  type: 'food' | 'water' | 'ammo' | 'medicine' | 'weapon' | 'tool' | 'material' | 'throwable' | 'armor';
  weight: number;
  stackable: boolean;
  maxStack: number;
  icon: string;
  description: string;
  healAmount?: number;
  foodAmount?: number;
  waterAmount?: number;
  damage?: number;
  range?: number;
  fireRate?: number;
  ammoType?: string;
  noiseLevel?: number;
  armorSlot?: ArmorSlot;
  defense?: number;
}

export interface InventoryItem {
  defId: string;
  quantity: number;
  slotIndex: number;
}

export interface LootSpot {
  tileX: number;
  tileY: number;
  items: InventoryItem[];
  searched: boolean;
  label: string;
}

export type ZombieType = 'walker' | 'runner' | 'tank';

export interface ZombieState {
  id: string;
  x: number;
  y: number;
  type: ZombieType;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  state: 'idle' | 'roaming' | 'chasing' | 'attacking' | 'dead';
  targetX: number;
  targetY: number;
  lastSawPlayerAt: number;
  alertLevel: number;
  attackCooldown: number;
  facing: number;
  animFrame: number;
  animTimer: number;
  knockbackX: number;
  knockbackY: number;
  deathTimer: number;
}

export interface BulletState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  ownerId: string;
  life: number;
}

export interface BloodSplatter {
  x: number;
  y: number;
  size: number;
  alpha: number;
  angle: number;
}

export interface Equipment {
  head: string | null;
  body: string | null;
  legs: string | null;
}

export interface PlayerState {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
  noiseLevel: number;
  isMoving: boolean;
  isRunning: boolean;
  isSneaking: boolean;
  facing: number;
  equippedWeapon: string | null;
  isAttacking: boolean;
  attackCooldown: number;
  isReloading: boolean;
  reloadTimer: number;
  bleeding: boolean;
  bleedTimer: number;
  animFrame: number;
  animTimer: number;
  speed: number;
  equipment: Equipment;
}

export interface Building {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}
