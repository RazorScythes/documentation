import { create } from 'zustand';

export type ObjectType = 'structure' | 'biome';

export interface StructureData {
  wallType: 'wood' | 'stone' | 'metal' | 'brick';
  floorType: 'wood' | 'tile' | 'concrete' | 'metal';
  hasDoor: boolean;
  hasWindows: boolean;
  roomCount: number;
  destructible: boolean;
  lootTier: number;
}

export interface BiomeData {
  biomeType: 'forest' | 'desert' | 'swamp' | 'urban' | 'military' | 'farmland' | 'junkyard' | 'chemical';
  density: number;
  moisture: number;
  dangerLevel: number;
  vegetationDensity: number;
  canSpawnZombies: boolean;
  ambientSound: string;
}

export interface EditorSprite {
  id: string;
  sprite: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  spawnRate: number;
  zIndex: number;
  objectType: ObjectType;
  label: string;
  structureData?: StructureData;
  biomeData?: BiomeData;
}

export const DEFAULT_STRUCTURE_DATA: StructureData = {
  wallType: 'wood',
  floorType: 'wood',
  hasDoor: true,
  hasWindows: true,
  roomCount: 1,
  destructible: false,
  lootTier: 1,
};

export const DEFAULT_BIOME_DATA: BiomeData = {
  biomeType: 'forest',
  density: 50,
  moisture: 50,
  dangerLevel: 1,
  vegetationDensity: 50,
  canSpawnZombies: true,
  ambientSound: 'none',
};

interface EditorState {
  objects: EditorSprite[];
  selectedId: string | null;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  canvasOffset: { x: number; y: number };
  zoom: number;
  placementType: ObjectType;
  filterType: 'all' | ObjectType;
  showDataTable: boolean;

  addObject: (obj: EditorSprite) => void;
  updateObject: (id: string, patch: Partial<EditorSprite>) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  setGridSize: (s: number) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  setCanvasOffset: (o: { x: number; y: number }) => void;
  setZoom: (z: number) => void;
  clearAll: () => void;
  loadLayout: (objects: EditorSprite[]) => void;
  duplicateObject: (id: string) => void;
  setPlacementType: (t: ObjectType) => void;
  setFilterType: (t: 'all' | ObjectType) => void;
  toggleDataTable: () => void;
  fitToObjects: (canvasW: number, canvasH: number) => void;
  snap: (v: number) => number;
  snapSize: (v: number) => number;
}

function uuid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  objects: [],
  selectedId: null,
  gridSize: 32,
  showGrid: true,
  snapToGrid: true,
  canvasOffset: { x: 0, y: 0 },
  zoom: 1,
  placementType: 'structure',
  filterType: 'all',
  showDataTable: false,

  snap: (v: number) => {
    const { snapToGrid, gridSize } = get();
    return snapToGrid ? Math.round(v / gridSize) * gridSize : v;
  },

  snapSize: (v: number) => {
    const { snapToGrid, gridSize } = get();
    if (!snapToGrid) return Math.max(8, v);
    return Math.max(gridSize, Math.round(v / gridSize) * gridSize);
  },

  addObject: (obj) => set((s) => ({ objects: [...s.objects, obj] })),

  updateObject: (id, patch) =>
    set((s) => ({
      objects: s.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    })),

  removeObject: (id) =>
    set((s) => ({
      objects: s.objects.filter((o) => o.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  selectObject: (id) => set({ selectedId: id }),

  bringToFront: (id) =>
    set((s) => {
      const maxZ = Math.max(0, ...s.objects.map((o) => o.zIndex));
      return { objects: s.objects.map((o) => (o.id === id ? { ...o, zIndex: maxZ + 1 } : o)) };
    }),

  sendToBack: (id) =>
    set((s) => {
      const minZ = Math.min(0, ...s.objects.map((o) => o.zIndex));
      return { objects: s.objects.map((o) => (o.id === id ? { ...o, zIndex: minZ - 1 } : o)) };
    }),

  setGridSize: (gridSize) => set({ gridSize }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
  setCanvasOffset: (canvasOffset) => set({ canvasOffset }),
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(4, zoom)) }),
  clearAll: () => set({ objects: [], selectedId: null }),
  loadLayout: (objects) => set({ objects, selectedId: null }),
  setPlacementType: (placementType) => set({ placementType }),
  setFilterType: (filterType) => set({ filterType }),
  toggleDataTable: () => set((s) => ({ showDataTable: !s.showDataTable })),

  fitToObjects: (canvasW: number, canvasH: number) => {
    const { objects } = get();
    if (!objects.length || canvasW <= 0 || canvasH <= 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const o of objects) {
      if (o.x < minX) minX = o.x;
      if (o.y < minY) minY = o.y;
      if (o.x + o.width > maxX) maxX = o.x + o.width;
      if (o.y + o.height > maxY) maxY = o.y + o.height;
    }
    const bboxW = maxX - minX;
    const bboxH = maxY - minY;
    if (bboxW <= 0 || bboxH <= 0) return;
    const padding = 60;
    const zoom = Math.max(0.25, Math.min(2, Math.min((canvasW - padding * 2) / bboxW, (canvasH - padding * 2) / bboxH)));
    const cx = minX + bboxW / 2;
    const cy = minY + bboxH / 2;
    set({
      zoom,
      canvasOffset: {
        x: (canvasW / zoom) / 2 - cx,
        y: (canvasH / zoom) / 2 - cy,
      },
    });
  },

  duplicateObject: (id) => {
    const { objects, gridSize } = get();
    const obj = objects.find((o) => o.id === id);
    if (!obj) return;
    const dup: EditorSprite = { ...obj, id: uuid(), x: obj.x + gridSize, y: obj.y + gridSize };
    if (obj.structureData) dup.structureData = { ...obj.structureData };
    if (obj.biomeData) dup.biomeData = { ...obj.biomeData };
    set((s) => ({ objects: [...s.objects, dup], selectedId: dup.id }));
  },
}));
