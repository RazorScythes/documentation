import { create } from 'zustand';
import type { PlayerState, ZombieState, BulletState, BloodSplatter, InventoryItem, LootSpot, Equipment } from '../engine/types';
import { TILE_SIZE, CHUNK_SIZE } from '../engine/types';
import { ITEM_DEFS } from '../engine/itemDefs';
import { ChunkManager } from '../maps/ChunkManager';

export type QuickUseSlots = [number | null, number | null, number | null];

interface GameState {
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameover' | 'inventory' | 'crafting' | 'editor';
  worldTime: number;
  dayLength: number;
  timeOfDay: number;
  dayCount: number;

  chunkManager: ChunkManager | null;

  player: PlayerState;
  inventory: InventoryItem[];
  maxWeight: number;
  equippedSlot: number;
  quickUseSlots: QuickUseSlots;

  zombies: ZombieState[];
  bullets: BulletState[];
  bloodSplatters: BloodSplatter[];

  showInventory: boolean;
  showCrafting: boolean;
  showMinimap: boolean;
  nearbyLootSpot: LootSpot | null;
  notification: string;
  notificationTimer: number;

  initWorld: () => void;
  setGameStatus: (s: GameState['gameStatus']) => void;
  toggleInventory: () => void;
  toggleCrafting: () => void;
  toggleMinimap: () => void;
  addNotification: (msg: string) => void;
  saveGame: () => void;
  loadGame: () => boolean;
}

const INITIAL_EQUIPMENT: Equipment = { head: null, body: null, legs: null };

const INITIAL_PLAYER: PlayerState = {
  x: 0,
  y: 0,
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  hunger: 100,
  maxHunger: 100,
  thirst: 100,
  maxThirst: 100,
  noiseLevel: 0,
  isMoving: false,
  isRunning: false,
  isSneaking: false,
  facing: 0,
  equippedWeapon: null,
  isAttacking: false,
  attackCooldown: 0,
  isReloading: false,
  reloadTimer: 0,
  bleeding: false,
  bleedTimer: 0,
  animFrame: 0,
  animTimer: 0,
  speed: 120,
  equipment: { ...INITIAL_EQUIPMENT },
};

export const useGameStore = create<GameState>((set, get) => ({
  gameStatus: 'menu',
  worldTime: 0,
  dayLength: 600,
  timeOfDay: 0.3,
  dayCount: 1,

  chunkManager: null,

  player: { ...INITIAL_PLAYER },
  inventory: [
    { defId: 'kitchen_knife', quantity: 1, slotIndex: 0 },
    { defId: 'canned_food', quantity: 2, slotIndex: 1 },
    { defId: 'water_bottle', quantity: 1, slotIndex: 2 },
    { defId: 'bandage', quantity: 3, slotIndex: 3 },
  ],
  maxWeight: 25,
  equippedSlot: 0,
  quickUseSlots: [null, null, null] as QuickUseSlots,

  zombies: [],
  bullets: [],
  bloodSplatters: [],

  showInventory: false,
  showCrafting: false,
  showMinimap: true,
  nearbyLootSpot: null,
  notification: '',
  notificationTimer: 0,

  initWorld: () => {
    const seed = Date.now() % 100000;
    const chunkManager = new ChunkManager(seed);

    const spawnCx = 0, spawnCy = 0;
    const spawnChunk = chunkManager.getChunk(spawnCx, spawnCy);

    let playerTileX = spawnCx * CHUNK_SIZE + CHUNK_SIZE / 2;
    let playerTileY = spawnCy * CHUNK_SIZE + CHUNK_SIZE / 2;

    for (let ly = 4; ly < CHUNK_SIZE - 4; ly++) {
      for (let lx = 4; lx < CHUNK_SIZE - 4; lx++) {
        const t = spawnChunk.tiles[ly][lx];
        if (t === 0) {
          playerTileX = spawnCx * CHUNK_SIZE + lx;
          playerTileY = spawnCy * CHUNK_SIZE + ly;
          ly = CHUNK_SIZE;
          break;
        }
      }
    }

    chunkManager.updateLoadedChunks(
      playerTileX * TILE_SIZE,
      playerTileY * TILE_SIZE,
    );

    chunkManager.clearSpawnArea(playerTileX, playerTileY, 6);

    set({
      chunkManager,
      player: {
        ...INITIAL_PLAYER,
        x: playerTileX * TILE_SIZE + TILE_SIZE / 2,
        y: playerTileY * TILE_SIZE + TILE_SIZE / 2,
      },
      zombies: chunkManager.getVisibleZombies(playerTileX * TILE_SIZE, playerTileY * TILE_SIZE, 3),
      inventory: [
        { defId: 'kitchen_knife', quantity: 1, slotIndex: 0 },
        { defId: 'canned_food', quantity: 2, slotIndex: 1 },
        { defId: 'water_bottle', quantity: 1, slotIndex: 2 },
        { defId: 'bandage', quantity: 3, slotIndex: 3 },
      ],
      bullets: [],
      bloodSplatters: [],
      worldTime: 0,
      timeOfDay: 0.3,
      dayCount: 1,
      gameStatus: 'playing',
      notification: '',
      notificationTimer: 0,
      quickUseSlots: [null, null, null] as QuickUseSlots,
    });
  },

  setGameStatus: (s) => set({ gameStatus: s }),

  toggleInventory: () => {
    const state = get();
    if (state.gameStatus === 'playing') {
      set({ showInventory: !state.showInventory, showCrafting: false });
    } else if (state.showInventory) {
      set({ showInventory: false });
    }
  },

  toggleCrafting: () => {
    const state = get();
    set({ showCrafting: !state.showCrafting, showInventory: false });
  },

  toggleMinimap: () => set({ showMinimap: !get().showMinimap }),

  addNotification: (msg) => set({ notification: msg, notificationTimer: 3 }),

  saveGame: () => {
    const state = get();
    const cm = state.chunkManager;
    if (!cm) return;

    const saveData = {
      player: state.player,
      inventory: state.inventory,
      zombies: state.zombies,
      worldTime: state.worldTime,
      timeOfDay: state.timeOfDay,
      dayCount: state.dayCount,
      equippedSlot: state.equippedSlot,
      quickUseSlots: state.quickUseSlots,
      chunkData: cm.serialize(),
    };
    localStorage.setItem('deadzone_save', JSON.stringify(saveData));
    set({ notification: 'Game saved.', notificationTimer: 3 });
  },

  loadGame: () => {
    const raw = localStorage.getItem('deadzone_save');
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      const cm = new ChunkManager(data.chunkData.seed);
      cm.deserialize(data.chunkData);
      cm.updateLoadedChunks(data.player.x, data.player.y);

      set({
        player: { ...INITIAL_PLAYER, ...data.player, equipment: data.player.equipment || { ...INITIAL_EQUIPMENT } },
        inventory: data.inventory,
        zombies: data.zombies || cm.getVisibleZombies(data.player.x, data.player.y, 3),
        worldTime: data.worldTime,
        timeOfDay: data.timeOfDay,
        dayCount: data.dayCount,
        equippedSlot: data.equippedSlot,
        quickUseSlots: data.quickUseSlots || [null, null, null],
        chunkManager: cm,
        bullets: [],
        bloodSplatters: [],
        gameStatus: 'playing',
      });
      return true;
    } catch {
      return false;
    }
  },
}));

export function getCurrentWeight(inventory: InventoryItem[]): number {
  return inventory.reduce((sum, item) => {
    const def = ITEM_DEFS[item.defId];
    return sum + (def ? def.weight * item.quantity : 0);
  }, 0);
}

export function getEquippedWeaponDef(inventory: InventoryItem[], equippedSlot: number) {
  const item = inventory.find(i => i.slotIndex === equippedSlot);
  if (!item) return null;
  const def = ITEM_DEFS[item.defId];
  if (!def || def.type !== 'weapon') return null;
  return def;
}
