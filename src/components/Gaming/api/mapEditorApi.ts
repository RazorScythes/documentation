function getApiBase(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DEVELOPMENT === 'true') {
    const proto = (import.meta as any).env.VITE_APP_PROTOCOL || 'http';
    const host = (import.meta as any).env.VITE_APP_LOCALHOST || 'localhost';
    const port = (import.meta as any).env.VITE_APP_SERVER_PORT || '3000';
    return `${proto}://${host}:${port}/gaming/map-editor`;
  }
  return 'https://endpoint-rho-six.vercel.app/gaming/map-editor';
}

const API_BASE = getApiBase();

const headers: Record<string, string> = { 'Content-Type': 'application/json' };

export interface MapDefinitionSummary {
  _id: string;
  title: string;
  category: string;
  featured_image: string;
  privacy: boolean;
  strict: boolean;
  version: string;
  platform: string;
  deleted_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StructureDef {
  id: string;
  label: string;
  category: string;
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  count: number;
  biomes: string[];
  floorType: string;
  lootCount: number;
  lootTable: string;
  lootTier: number;
  spawnRate: number;
  mapDefinitionId: string | null;
}

export interface TileRuleDef {
  tile: number;
  chance: number;
  requiresNoAdj: boolean;
}

export interface BiomeDefAPI {
  id: string;
  label: string;
  color: string;
  defaultTile: number;
  tileRules: TileRuleDef[];
  spawnRate: number;
  mapDefinitionId: string | null;
}

export interface CategoryDef {
  id: string;
  label: string;
  color: string;
  description: string;
}

export interface SpriteAsset {
  id: string;
  name: string;
  url: string;
  folder: string;
}

export interface SpriteFolder {
  id: string;
  name: string;
  color: string;
}

export interface MapDefinitionFull extends MapDefinitionSummary {
  data: {
    structures: StructureDef[];
    biomes: BiomeDefAPI[];
    categories: CategoryDef[];
    editorObjects: unknown[];
    sprites: SpriteAsset[];
    folders: SpriteFolder[];
  };
}

export interface FetchResult {
  result: MapDefinitionSummary[];
}

export async function fetchDefinitions(opts: {
  search?: string;
  category?: string;
} = {}): Promise<FetchResult> {
  const params = new URLSearchParams();
  if (opts.search) params.set('search', opts.search);
  if (opts.category) params.set('category', opts.category);
  const qs = params.toString();

  const res = await fetch(`${API_BASE}${qs ? `?${qs}` : ''}`, { method: 'GET', headers });
  if (!res.ok) throw new Error(`Failed to fetch definitions: ${res.status}`);
  return res.json();
}

export async function fetchDefinitionById(definitionId: string): Promise<MapDefinitionFull> {
  const res = await fetch(`${API_BASE}/${definitionId}`, { method: 'GET', headers });
  if (!res.ok) throw new Error(`Failed to fetch definition: ${res.status}`);
  const data = await res.json();
  return data.result;
}

export interface CreateResult {
  result: MapDefinitionSummary[];
  createdId: string;
}

export async function createDefinition(payload: {
  title: string;
  category?: string;
  featured_image?: string;
  data?: { structures?: unknown[]; biomes?: unknown[]; editorObjects?: unknown[] };
  privacy?: boolean;
  strict?: boolean;
  version?: string;
  platform?: string;
}): Promise<CreateResult> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create definition: ${res.status}`);
  return res.json();
}

export async function updateDefinition(definitionId: string, updates: Record<string, unknown>): Promise<MapDefinitionSummary[]> {
  const res = await fetch(`${API_BASE}/${definitionId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update definition: ${res.status}`);
  const data = await res.json();
  return data.result;
}

export async function deleteDefinition(definitionId: string): Promise<MapDefinitionSummary[]> {
  const res = await fetch(`${API_BASE}/${definitionId}`, { method: 'DELETE', headers });
  if (!res.ok) throw new Error(`Failed to delete definition: ${res.status}`);
  const data = await res.json();
  return data.result;
}

export async function duplicateDefinition(definitionId: string): Promise<MapDefinitionSummary[]> {
  const res = await fetch(`${API_BASE}/${definitionId}/duplicate`, { method: 'POST', headers });
  if (!res.ok) throw new Error(`Failed to duplicate definition: ${res.status}`);
  const data = await res.json();
  return data.result;
}

export async function deleteBlobUrl(url: string): Promise<void> {
  await fetch(`${API_BASE}/blob/delete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url }),
  }).catch(() => {});
}
