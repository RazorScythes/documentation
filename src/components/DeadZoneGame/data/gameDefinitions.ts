import { create } from 'zustand';
import { TileType } from '../engine/types';

/* ── Biome Types ─────────────────────────────────────────────── */

export type BiomeId = 'urban' | 'suburbs' | 'swamp' | 'chemical' | 'military' | 'farmland' | 'junkyard' | 'forest' | 'desert';

export const ALL_BIOME_IDS: BiomeId[] = ['urban', 'suburbs', 'swamp', 'chemical', 'military', 'farmland', 'junkyard', 'forest', 'desert'];

export interface TileRule {
  tile: number;
  chance: number;
  requiresNoAdj: boolean;
}

export interface BiomeDef {
  id: BiomeId;
  label: string;
  color: string;
  defaultTile: number;
  tileRules: TileRule[];
}

/* ── Structure Types ─────────────────────────────────────────── */

export type StructureCategory = 'residential' | 'commercial' | 'military' | 'industrial' | 'medical' | 'agricultural' | 'special';

export interface StructureDef {
  id: string;
  label: string;
  category: StructureCategory;
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  count: number;
  biomes: BiomeId[];
  floorType: 'wood' | 'metal';
  lootCount: number;
  lootTable: string;
}

/* ── Default Data (seeded from current hardcoded values) ────── */

const DEFAULT_STRUCTURES: StructureDef[] = [
  { id: 'house',       label: 'House',       category: 'residential',  minW: 8,  maxW: 12, minH: 7,  maxH: 10, count: 35, biomes: ['suburbs', 'urban', 'farmland'],              floorType: 'wood',  lootCount: 3, lootTable: 'House' },
  { id: 'store',       label: 'Store',       category: 'commercial',   minW: 8,  maxW: 14, minH: 6,  maxH: 10, count: 10, biomes: ['urban', 'suburbs'],                           floorType: 'wood',  lootCount: 4, lootTable: 'Store' },
  { id: 'hospital',    label: 'Hospital',    category: 'medical',      minW: 14, maxW: 18, minH: 10, maxH: 14, count: 3,  biomes: ['urban'],                                      floorType: 'wood',  lootCount: 6, lootTable: 'Hospital' },
  { id: 'warehouse',   label: 'Warehouse',   category: 'industrial',   minW: 10, maxW: 16, minH: 8,  maxH: 12, count: 6,  biomes: ['urban', 'suburbs', 'junkyard'],                floorType: 'wood',  lootCount: 5, lootTable: 'Warehouse' },
  { id: 'chem_lab',    label: 'Chem Lab',    category: 'industrial',   minW: 12, maxW: 18, minH: 10, maxH: 14, count: 4,  biomes: ['chemical'],                                   floorType: 'metal', lootCount: 5, lootTable: 'Chem Lab' },
  { id: 'barracks',    label: 'Barracks',    category: 'military',     minW: 10, maxW: 16, minH: 8,  maxH: 12, count: 4,  biomes: ['military'],                                   floorType: 'wood',  lootCount: 4, lootTable: 'Barracks' },
  { id: 'armory',      label: 'Armory',      category: 'military',     minW: 8,  maxW: 12, minH: 6,  maxH: 10, count: 2,  biomes: ['military'],                                   floorType: 'metal', lootCount: 6, lootTable: 'Armory' },
  { id: 'barn',        label: 'Barn',        category: 'agricultural', minW: 10, maxW: 14, minH: 8,  maxH: 12, count: 4,  biomes: ['farmland'],                                   floorType: 'wood',  lootCount: 3, lootTable: 'Barn' },
  { id: 'gas_station', label: 'Gas Station', category: 'commercial',   minW: 10, maxW: 14, minH: 6,  maxH: 10, count: 3,  biomes: ['suburbs', 'desert'],                          floorType: 'wood',  lootCount: 3, lootTable: 'Gas Station' },
  { id: 'bunker',      label: 'Bunker',      category: 'military',     minW: 8,  maxW: 12, minH: 6,  maxH: 10, count: 2,  biomes: ['military', 'chemical'],                       floorType: 'metal', lootCount: 5, lootTable: 'Bunker' },
];

const DEFAULT_BIOMES: BiomeDef[] = [
  {
    id: 'swamp', label: 'Swamp', color: '#22c55e',
    defaultTile: TileType.DIRT,
    tileRules: [
      { tile: TileType.SWAMP,     chance: 0.35, requiresNoAdj: false },
      { tile: TileType.WATER,     chance: 0.10, requiresNoAdj: false },
      { tile: TileType.TALL_GRASS,chance: 0.05, requiresNoAdj: false },
      { tile: TileType.DEAD_TREE, chance: 0.02, requiresNoAdj: true },
      { tile: TileType.STUMP,     chance: 0.02, requiresNoAdj: true },
      { tile: TileType.BUSH,      chance: 0.02, requiresNoAdj: true },
    ],
  },
  {
    id: 'chemical', label: 'Chemical', color: '#84cc16',
    defaultTile: TileType.DIRT,
    tileRules: [
      { tile: TileType.METAL_FLOOR,  chance: 0.30, requiresNoAdj: false },
      { tile: TileType.CONCRETE,     chance: 0.08, requiresNoAdj: false },
      { tile: TileType.TOXIC_PUDDLE, chance: 0.05, requiresNoAdj: false },
      { tile: TileType.PIPE,         chance: 0.03, requiresNoAdj: true },
      { tile: TileType.BARREL,       chance: 0.03, requiresNoAdj: true },
    ],
  },
  {
    id: 'military', label: 'Military', color: '#ef4444',
    defaultTile: TileType.GRASS,
    tileRules: [
      { tile: TileType.CONCRETE, chance: 0.30, requiresNoAdj: false },
      { tile: TileType.DIRT,     chance: 0.10, requiresNoAdj: false },
      { tile: TileType.CRATE,   chance: 0.04, requiresNoAdj: true },
      { tile: TileType.FENCE,   chance: 0.04, requiresNoAdj: true },
      { tile: TileType.BARREL,  chance: 0.02, requiresNoAdj: true },
    ],
  },
  {
    id: 'farmland', label: 'Farmland', color: '#f59e0b',
    defaultTile: TileType.GRASS,
    tileRules: [
      { tile: TileType.DIRT,      chance: 0.40, requiresNoAdj: false },
      { tile: TileType.TALL_GRASS,chance: 0.10, requiresNoAdj: false },
      { tile: TileType.FENCE,     chance: 0.04, requiresNoAdj: true },
      { tile: TileType.CRATE,     chance: 0.02, requiresNoAdj: true },
      { tile: TileType.BUSH,      chance: 0.03, requiresNoAdj: true },
    ],
  },
  {
    id: 'junkyard', label: 'Junkyard', color: '#f97316',
    defaultTile: TileType.CONCRETE,
    tileRules: [
      { tile: TileType.RUBBLE, chance: 0.20, requiresNoAdj: false },
      { tile: TileType.CAR,    chance: 0.10, requiresNoAdj: true },
      { tile: TileType.FENCE,  chance: 0.08, requiresNoAdj: true },
      { tile: TileType.BARREL, chance: 0.06, requiresNoAdj: true },
      { tile: TileType.DIRT,   chance: 0.06, requiresNoAdj: false },
      { tile: TileType.ROCKS,  chance: 0.03, requiresNoAdj: true },
    ],
  },
  {
    id: 'forest', label: 'Forest', color: '#16a34a',
    defaultTile: TileType.GRASS,
    tileRules: [
      { tile: TileType.TREE,      chance: 0.30, requiresNoAdj: true },
      { tile: TileType.TALL_GRASS,chance: 0.10, requiresNoAdj: false },
      { tile: TileType.DEAD_TREE, chance: 0.03, requiresNoAdj: true },
      { tile: TileType.WATER,     chance: 0.02, requiresNoAdj: false },
      { tile: TileType.BUSH,      chance: 0.05, requiresNoAdj: true },
      { tile: TileType.STUMP,     chance: 0.02, requiresNoAdj: true },
      { tile: TileType.ROCKS,     chance: 0.01, requiresNoAdj: true },
    ],
  },
  {
    id: 'desert', label: 'Desert', color: '#eab308',
    defaultTile: TileType.GRASS,
    tileRules: [
      { tile: TileType.SAND,      chance: 0.55, requiresNoAdj: false },
      { tile: TileType.DIRT,      chance: 0.10, requiresNoAdj: false },
      { tile: TileType.RUBBLE,    chance: 0.03, requiresNoAdj: false },
      { tile: TileType.DEAD_TREE, chance: 0.02, requiresNoAdj: true },
      { tile: TileType.ROCKS,     chance: 0.03, requiresNoAdj: true },
    ],
  },
  {
    id: 'urban', label: 'Urban', color: '#6b7280',
    defaultTile: TileType.GRASS,
    tileRules: [
      { tile: TileType.RUBBLE, chance: 0.04, requiresNoAdj: false },
      { tile: TileType.DIRT,   chance: 0.02, requiresNoAdj: false },
    ],
  },
  {
    id: 'suburbs', label: 'Suburbs', color: '#a3a3a3',
    defaultTile: TileType.GRASS,
    tileRules: [
      { tile: TileType.DIRT, chance: 0.02, requiresNoAdj: false },
      { tile: TileType.BUSH, chance: 0.02, requiresNoAdj: true },
    ],
  },
];

/* ── Category metadata ───────────────────────────────────────── */

export const STRUCTURE_CATEGORIES: { value: StructureCategory; label: string; color: string }[] = [
  { value: 'residential',  label: 'Residential',  color: 'bg-blue-500/15 text-blue-400' },
  { value: 'commercial',   label: 'Commercial',   color: 'bg-emerald-500/15 text-emerald-400' },
  { value: 'military',     label: 'Military',     color: 'bg-red-500/15 text-red-400' },
  { value: 'industrial',   label: 'Industrial',   color: 'bg-orange-500/15 text-orange-400' },
  { value: 'medical',      label: 'Medical',      color: 'bg-pink-500/15 text-pink-400' },
  { value: 'agricultural', label: 'Agricultural', color: 'bg-lime-500/15 text-lime-400' },
  { value: 'special',      label: 'Special',      color: 'bg-violet-500/15 text-violet-400' },
];

/* ── Saved Presets ───────────────────────────────────────────── */

export interface DefinitionPreset {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  structures: StructureDef[];
  biomes: BiomeDef[];
}

const PRESETS_KEY = 'game_def_presets';
const ACTIVE_KEY = 'game_def_active_preset';

function loadPresetsFromStorage(): DefinitionPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePresetsToStorage(presets: DefinitionPreset[]) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

function loadActiveIdFromStorage(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

function saveActiveIdToStorage(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

/* ── Store ───────────────────────────────────────────────────── */

interface GameDefsState {
  structures: StructureDef[];
  biomes: BiomeDef[];
  activePresetId: string | null;
  presets: DefinitionPreset[];

  addStructure: (s: StructureDef) => void;
  updateStructure: (id: string, patch: Partial<StructureDef>) => void;
  removeStructure: (id: string) => void;
  duplicateStructure: (id: string) => void;

  addBiome: (b: BiomeDef) => void;
  updateBiome: (id: BiomeId, patch: Partial<BiomeDef>) => void;
  removeBiome: (id: BiomeId) => void;

  loadDefs: (structures: StructureDef[], biomes: BiomeDef[]) => void;
  resetDefaults: () => void;

  saveAsPreset: (name: string) => string;
  saveToPreset: (id: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
  renamePreset: (id: string, name: string) => void;
  duplicatePreset: (id: string) => void;
}

function cloneStructures(arr: StructureDef[]) { return arr.map((s) => ({ ...s, biomes: [...s.biomes] })); }
function cloneBiomes(arr: BiomeDef[]) { return arr.map((b) => ({ ...b, tileRules: b.tileRules.map((r) => ({ ...r })) })); }

export const useGameDefs = create<GameDefsState>((set, get) => {
  const storedPresets = loadPresetsFromStorage();
  const activeId = loadActiveIdFromStorage();
  const activePreset = activeId ? storedPresets.find((p) => p.id === activeId) : null;

  const initStructures = activePreset ? cloneStructures(activePreset.structures) : DEFAULT_STRUCTURES.map((s) => ({ ...s }));
  const initBiomes = activePreset ? cloneBiomes(activePreset.biomes) : DEFAULT_BIOMES.map((b) => ({ ...b, tileRules: b.tileRules.map((r) => ({ ...r })) }));

  return {
    structures: initStructures,
    biomes: initBiomes,
    activePresetId: activePreset ? activeId : null,
    presets: storedPresets,

    addStructure: (s) => set((st) => ({ structures: [...st.structures, s] })),

    updateStructure: (id, patch) =>
      set((st) => ({ structures: st.structures.map((s) => (s.id === id ? { ...s, ...patch } : s)) })),

    removeStructure: (id) =>
      set((st) => ({ structures: st.structures.filter((s) => s.id !== id) })),

    duplicateStructure: (id) => {
      const src = get().structures.find((s) => s.id === id);
      if (!src) return;
      const dup: StructureDef = {
        ...src,
        id: `${src.id}_${Date.now().toString(36)}`,
        label: `${src.label} (copy)`,
        biomes: [...src.biomes],
      };
      set((st) => ({ structures: [...st.structures, dup] }));
    },

    addBiome: (b) => set((st) => ({ biomes: [...st.biomes, b] })),

    updateBiome: (id, patch) =>
      set((st) => ({ biomes: st.biomes.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),

    removeBiome: (id) =>
      set((st) => ({ biomes: st.biomes.filter((b) => b.id !== id) })),

    loadDefs: (structures, biomes) => set({ structures, biomes }),

    resetDefaults: () => set({
      structures: DEFAULT_STRUCTURES.map((s) => ({ ...s })),
      biomes: DEFAULT_BIOMES.map((b) => ({ ...b, tileRules: b.tileRules.map((r) => ({ ...r })) })),
      activePresetId: null,
    }),

    saveAsPreset: (name) => {
      const { structures, biomes, presets } = get();
      const now = new Date().toISOString();
      const preset: DefinitionPreset = {
        id: `preset_${Date.now().toString(36)}`,
        name,
        createdAt: now,
        updatedAt: now,
        structures: cloneStructures(structures),
        biomes: cloneBiomes(biomes),
      };
      const next = [...presets, preset];
      savePresetsToStorage(next);
      saveActiveIdToStorage(preset.id);
      set({ presets: next, activePresetId: preset.id });
      return preset.id;
    },

    saveToPreset: (id) => {
      const { structures, biomes, presets } = get();
      const now = new Date().toISOString();
      const next = presets.map((p) =>
        p.id === id ? { ...p, updatedAt: now, structures: cloneStructures(structures), biomes: cloneBiomes(biomes) } : p,
      );
      savePresetsToStorage(next);
      set({ presets: next });
    },

    loadPreset: (id) => {
      const preset = get().presets.find((p) => p.id === id);
      if (!preset) return;
      saveActiveIdToStorage(id);
      set({
        structures: cloneStructures(preset.structures),
        biomes: cloneBiomes(preset.biomes),
        activePresetId: id,
      });
    },

    deletePreset: (id) => {
      const { presets, activePresetId } = get();
      const next = presets.filter((p) => p.id !== id);
      savePresetsToStorage(next);
      if (activePresetId === id) {
        saveActiveIdToStorage(null);
        set({ presets: next, activePresetId: null });
      } else {
        set({ presets: next });
      }
    },

    renamePreset: (id, name) => {
      const next = get().presets.map((p) => (p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p));
      savePresetsToStorage(next);
      set({ presets: next });
    },

    duplicatePreset: (id) => {
      const src = get().presets.find((p) => p.id === id);
      if (!src) return;
      const now = new Date().toISOString();
      const dup: DefinitionPreset = {
        ...src,
        id: `preset_${Date.now().toString(36)}`,
        name: `${src.name} (copy)`,
        createdAt: now,
        updatedAt: now,
        structures: cloneStructures(src.structures),
        biomes: cloneBiomes(src.biomes),
      };
      const next = [...get().presets, dup];
      savePresetsToStorage(next);
      set({ presets: next });
    },
  };
});

/* ── Backend sync helper ─────────────────────────────────────── */

export async function syncDefsToBackend(definitionId: string): Promise<void> {
  const { structures, biomes } = useGameDefs.getState();
  const { updateDefinition } = await import('../api/mapEditorApi');
  await updateDefinition(definitionId, {
    data: { structures, biomes, editorObjects: [] },
  });
}

/* ── Selectors for world generators ──────────────────────────── */

export function getStructureConfigs() {
  return useGameDefs.getState().structures;
}

export function getBiomeDefs() {
  return useGameDefs.getState().biomes;
}

export function generateBiomeTileFromDefs(biomeId: string, r: number, noAdj: boolean): number {
  const def = useGameDefs.getState().biomes.find((b) => b.id === biomeId);
  if (!def) return TileType.GRASS;

  let cumulative = 0;
  for (const rule of def.tileRules) {
    cumulative += rule.chance;
    if (r < cumulative) {
      if (rule.requiresNoAdj && !noAdj) continue;
      return rule.tile;
    }
  }
  return def.defaultTile;
}

export function getLootCountFromDefs(label: string): number {
  const def = useGameDefs.getState().structures.find((s) => s.label === label);
  return def?.lootCount ?? 2;
}
