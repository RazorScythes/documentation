import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { put } from '@vercel/blob';
import {
  fetchDefinitions, createDefinition, deleteDefinition,
  fetchDefinitionById, updateDefinition, deleteBlobUrl,
  type MapDefinitionFull, type StructureDef, type BiomeDefAPI, type CategoryDef,
  type SpriteAsset, type SpriteFolder,
} from '../../api/mapEditorApi';

/* ─── theme context ──────────────────────────────────────────── */
const LightCtx = createContext(false);
const useLight = () => useContext(LightCtx);

/* ─── design tokens ──────────────────────────────────────────── */
const card    = (l: boolean) => `rounded-xl border border-solid ${l ? 'bg-white/90 backdrop-blur-sm border-slate-200/80' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`;
const inputCls= (l: boolean) => `w-full px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all select-text ${l ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`;
const selCls  = (l: boolean) => `px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all cursor-pointer ${l ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`;
const btnP    = (l: boolean) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${l ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`;
const btnS    = (l: boolean) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${l ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300'}`;
const lblCls  = (l: boolean) => `block text-xs font-medium mb-1.5 ${l ? 'text-slate-500' : 'text-gray-400'}`;

/* ─── props / constants ──────────────────────────────────────── */
interface Props { onExit: () => void; onOpenCanvas: (id: string) => void; onSpritesChange?: (sprites: SpriteAsset[], folders: SpriteFolder[]) => void; }
type TabId = 'structures' | 'biomes' | 'categories' | 'sprites';
type ViewState = 'tabs' | 'structForm' | 'biomeForm' | 'catForm' | 'folderForm';

const TIER_LABELS: Record<number, string> = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3', 4: 'Tier 4' };

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function EditorLanding({ onExit, onOpenCanvas, onSpritesChange }: Props) {
  const [isLight, setIsLight] = useState(() => { try { return localStorage.getItem('editor_theme') === 'light'; } catch { return false; } });
  const toggleTheme = () => setIsLight(p => { const n = !p; try { localStorage.setItem('editor_theme', n ? 'light' : 'dark'); } catch{} return n; });

  const [tab, setTab] = useState<TabId>('structures');
  const [view, setView] = useState<ViewState>('tabs');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ─── definition state (auto-loaded) ─── */
  const [def, setDef] = useState<MapDefinitionFull | null>(null);

  /* ─── structure edit state ─── */
  const [editStructIdx, setEditStructIdx] = useState(-1);
  const [editStruct, setEditStruct] = useState<StructureDef | null>(null);

  /* ─── biome edit state ─── */
  const [editBiomeIdx, setEditBiomeIdx] = useState(-1);
  const [editBiome, setEditBiome] = useState<BiomeDefAPI | null>(null);

  /* ─── category edit state ─── */
  const [editCatIdx, setEditCatIdx] = useState(-1);
  const [editCat, setEditCat] = useState<CategoryDef | null>(null);

  useEffect(() => {
    if (def && onSpritesChange) onSpritesChange(def.data.sprites ?? [], def.data.folders ?? []);
  }, [def, onSpritesChange]);

  /* ─── auto-load first definition or create one ─── */
  const loadOrCreate = useCallback(async () => {
    setLoading(true);
    try {
      let targetId: string | null = null;

      const mainResult = await fetchDefinitions({ category: 'main' });
      const mainList = mainResult.result ?? [];
      if (mainList.length > 0) {
        targetId = mainList[0]._id;
      } else {
        const allResult = await fetchDefinitions();
        const allList = allResult.result ?? [];
        const existing = allList.find(d =>
          d.category !== 'structure' || !d.title.startsWith('Structure:'));
        const fallback = existing ?? allList[0];
        if (fallback) {
          targetId = fallback._id;
          await updateDefinition(fallback._id, { category: 'main' });
        }
      }

      if (!targetId) {
        const created = await createDefinition({ title: 'Game Data', category: 'main' });
        targetId = created.createdId;
      }

      const full = await fetchDefinitionById(targetId);
      if (!full.data.categories) full.data.categories = [];
      if (!full.data.biomes) full.data.biomes = [];
      if (!full.data.structures) full.data.structures = [];
      if (!full.data.sprites) full.data.sprites = [];
      if (!full.data.folders) full.data.folders = [];
      setDef(full);
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { loadOrCreate(); }, [loadOrCreate]);

  /* ─── back navigation ─── */
  const backToTabs = () => { setEditStruct(null); setEditStructIdx(-1); setEditBiome(null); setEditBiomeIdx(-1); setEditCat(null); setEditCatIdx(-1); setEditFolder(null); setEditFolderIdx(-1); setView('tabs'); };

  /* ─── persist helper ─── */
  const persistData = async (updatedDef: MapDefinitionFull) => {
    setSaving(true);
    try {
      await updateDefinition(updatedDef._id, { data: updatedDef.data });
      const fresh = await fetchDefinitionById(updatedDef._id);
      if (!fresh.data.categories) fresh.data.categories = [];
      if (!fresh.data.biomes) fresh.data.biomes = [];
      if (!fresh.data.structures) fresh.data.structures = [];
      if (!fresh.data.sprites) fresh.data.sprites = [];
      if (!fresh.data.folders) fresh.data.folders = [];
      setDef(fresh);
    } catch {}
    setSaving(false);
  };

  /* ─── lazy canvas opener (creates MapDefinition if missing) ─── */
  const openCanvasFor = async (type: 'structure' | 'biome', idx: number) => {
    if (!def) return;
    const items = type === 'structure' ? def.data.structures : def.data.biomes;
    const item = items[idx];
    if (!item) return;
    if (item.mapDefinitionId) {
      onOpenCanvas(item.mapDefinitionId);
      return;
    }
    try {
      const created = await createDefinition({ title: `${type === 'structure' ? 'Structure' : 'Biome'}: ${item.label}`, category: type });
      if (created.createdId) {
        const newId = created.createdId;
        const updated = { ...item, mapDefinitionId: newId };
        const list = [...items];
        (list as any)[idx] = updated;
        const key = type === 'structure' ? 'structures' : 'biomes';
        const newDef = { ...def, data: { ...def.data, [key]: list } };
        await persistData(newDef);
        onOpenCanvas(newId);
      }
    } catch {}
  };

  /* ─── STRUCTURE actions ─── */
  const openStructEdit = (idx: number) => {
    if (!def) return;
    setEditStructIdx(idx);
    setEditStruct({ ...def.data.structures[idx], biomes: [...def.data.structures[idx].biomes] });
    setView('structForm');
  };
  const addStruct = async () => {
    if (!def) return;
    setSaving(true);
    const id = `struct_${Date.now().toString(36)}`;
    const label = 'New Structure';
    let mapDefId: string | null = null;
    try {
      const created = await createDefinition({ title: `Structure: ${label}`, category: 'structure' });
      mapDefId = created.createdId;
    } catch {}
    const s: StructureDef = { id, label, category: '', minW: 8, maxW: 12, minH: 6, maxH: 10, count: 5, biomes: [], floorType: 'wood', lootCount: 0, lootTable: '', lootTier: 1, spawnRate: 50, mapDefinitionId: mapDefId };
    const updated = { ...def, data: { ...def.data, structures: [...def.data.structures, s] } };
    try {
      await updateDefinition(updated._id, { data: updated.data });
      const fresh = await fetchDefinitionById(updated._id);
      if (!fresh.data.categories) fresh.data.categories = [];
      if (!fresh.data.biomes) fresh.data.biomes = [];
      if (!fresh.data.structures) fresh.data.structures = [];
      if (!fresh.data.sprites) fresh.data.sprites = [];
      if (!fresh.data.folders) fresh.data.folders = [];
      setDef(fresh);
      const newIdx = fresh.data.structures.length - 1;
      setEditStructIdx(newIdx);
      setEditStruct({ ...fresh.data.structures[newIdx], biomes: [...(fresh.data.structures[newIdx]?.biomes ?? [])] });
    } catch {
      setDef(updated);
      setEditStructIdx(updated.data.structures.length - 1);
      setEditStruct({ ...s, biomes: [] });
    }
    setSaving(false);
    setView('structForm');
  };
  const deleteStruct = async (idx: number) => {
    if (!def || !confirm('Delete this structure?')) return;
    const removed = def.data.structures[idx];
    if (removed?.mapDefinitionId) {
      try { await deleteDefinition(removed.mapDefinitionId); } catch {}
    }
    const structs = def.data.structures.filter((_, i) => i !== idx);
    await persistData({ ...def, data: { ...def.data, structures: structs } });
  };
  const saveStruct = async () => {
    if (!def || !editStruct || editStructIdx < 0) return;
    const structs = [...def.data.structures];
    structs[editStructIdx] = editStruct;
    await persistData({ ...def, data: { ...def.data, structures: structs } });
    backToTabs();
  };
  const es = (fn: (prev: StructureDef) => Partial<StructureDef>) =>
    setEditStruct(prev => prev ? { ...prev, ...fn(prev) } : prev);

  /* ─── BIOME actions ─── */
  const openBiomeEdit = (idx: number) => {
    if (!def) return;
    const b = def.data.biomes[idx];
    setEditBiomeIdx(idx);
    setEditBiome({ ...b, tileRules: b.tileRules?.map(r => ({ ...r })) ?? [] });
    setView('biomeForm');
  };
  const addBiome = async () => {
    if (!def) return;
    setSaving(true);
    const id = `biome_${Date.now().toString(36)}`;
    const label = 'New Biome';
    let mapDefId: string | null = null;
    try {
      const created = await createDefinition({ title: `Biome: ${label}`, category: 'biome' });
      mapDefId = created.createdId;
    } catch {}
    const b: BiomeDefAPI = { id, label, color: '#6b7280', defaultTile: 0, tileRules: [], spawnRate: 50, mapDefinitionId: mapDefId };
    const updated = { ...def, data: { ...def.data, biomes: [...def.data.biomes, b] } };
    try {
      await updateDefinition(updated._id, { data: updated.data });
      const fresh = await fetchDefinitionById(updated._id);
      if (!fresh.data.categories) fresh.data.categories = [];
      if (!fresh.data.biomes) fresh.data.biomes = [];
      if (!fresh.data.structures) fresh.data.structures = [];
      if (!fresh.data.sprites) fresh.data.sprites = [];
      if (!fresh.data.folders) fresh.data.folders = [];
      setDef(fresh);
      const newIdx = fresh.data.biomes.length - 1;
      setEditBiomeIdx(newIdx);
      setEditBiome({ ...fresh.data.biomes[newIdx], tileRules: fresh.data.biomes[newIdx]?.tileRules?.map(r => ({ ...r })) ?? [] });
    } catch {
      setDef(updated);
      setEditBiomeIdx(updated.data.biomes.length - 1);
      setEditBiome({ ...b, tileRules: [] });
    }
    setSaving(false);
    setView('biomeForm');
  };
  const deleteBiome = async (idx: number) => {
    if (!def || !confirm('Delete this biome?')) return;
    const removed = def.data.biomes[idx];
    if (removed?.mapDefinitionId) {
      try { await deleteDefinition(removed.mapDefinitionId); } catch {}
    }
    await persistData({ ...def, data: { ...def.data, biomes: def.data.biomes.filter((_, i) => i !== idx) } });
  };
  const saveBiome = async () => {
    if (!def || !editBiome || editBiomeIdx < 0) return;
    const biomes = [...def.data.biomes];
    biomes[editBiomeIdx] = editBiome;
    await persistData({ ...def, data: { ...def.data, biomes } });
    backToTabs();
  };
  const eb = (fn: (prev: BiomeDefAPI) => Partial<BiomeDefAPI>) =>
    setEditBiome(prev => prev ? { ...prev, ...fn(prev) } : prev);

  /* ─── CATEGORY actions ─── */
  const openCatEdit = (idx: number) => {
    if (!def) return;
    setEditCatIdx(idx);
    setEditCat({ ...def.data.categories[idx] });
    setView('catForm');
  };
  const addCat = async () => {
    if (!def) return;
    setSaving(true);
    const id = `cat_${Date.now().toString(36)}`;
    const c: CategoryDef = { id, label: 'New Category', color: '#6b7280', description: '' };
    const updated = { ...def, data: { ...def.data, categories: [...def.data.categories, c] } };
    try {
      await updateDefinition(updated._id, { data: updated.data });
      const fresh = await fetchDefinitionById(updated._id);
      if (!fresh.data.categories) fresh.data.categories = [];
      if (!fresh.data.biomes) fresh.data.biomes = [];
      if (!fresh.data.structures) fresh.data.structures = [];
      if (!fresh.data.sprites) fresh.data.sprites = [];
      if (!fresh.data.folders) fresh.data.folders = [];
      setDef(fresh);
      const newIdx = fresh.data.categories.length - 1;
      setEditCatIdx(newIdx);
      setEditCat({ ...fresh.data.categories[newIdx] });
    } catch {
      setDef(updated);
      setEditCatIdx(updated.data.categories.length - 1);
      setEditCat({ ...c });
    }
    setSaving(false);
    setView('catForm');
  };
  const deleteCat = async (idx: number) => {
    if (!def || !confirm('Delete this category?')) return;
    await persistData({ ...def, data: { ...def.data, categories: def.data.categories.filter((_, i) => i !== idx) } });
  };
  const saveCat = async () => {
    if (!def || !editCat || editCatIdx < 0) return;
    const cats = [...def.data.categories];
    cats[editCatIdx] = editCat;
    await persistData({ ...def, data: { ...def.data, categories: cats } });
    backToTabs();
  };
  const ec = (fn: (prev: CategoryDef) => Partial<CategoryDef>) =>
    setEditCat(prev => prev ? { ...prev, ...fn(prev) } : prev);

  /* ─── SPRITE / FOLDER state ─── */
  const [selectedFolder, setSelectedFolder] = useState('');
  const [editFolderIdx, setEditFolderIdx] = useState(-1);
  const [editFolder, setEditFolder] = useState<SpriteFolder | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const blobToken = (import.meta as any).env?.VITE_BLOB_READ_WRITE_TOKEN || '';

  /* ─── FOLDER actions ─── */
  const openFolderEdit = (idx: number) => {
    if (!def) return;
    setEditFolderIdx(idx);
    setEditFolder({ ...def.data.folders[idx] });
    setView('folderForm');
  };
  const addFolder = async () => {
    if (!def) return;
    setSaving(true);
    const id = `folder_${Date.now().toString(36)}`;
    const f: SpriteFolder = { id, name: 'New Folder', color: '#6b7280' };
    const updated = { ...def, data: { ...def.data, folders: [...def.data.folders, f] } };
    try {
      await updateDefinition(updated._id, { data: updated.data });
      const fresh = await fetchDefinitionById(updated._id);
      if (!fresh.data.folders) fresh.data.folders = [];
      if (!fresh.data.sprites) fresh.data.sprites = [];
      setDef(fresh);
      const newIdx = fresh.data.folders.length - 1;
      setEditFolderIdx(newIdx);
      setEditFolder({ ...fresh.data.folders[newIdx] });
    } catch {
      setDef(updated);
      setEditFolderIdx(updated.data.folders.length - 1);
      setEditFolder({ ...f });
    }
    setSaving(false);
    setView('folderForm');
  };
  const deleteFolder = async (idx: number) => {
    if (!def || !confirm('Delete this folder? Sprites in it will become uncategorized.')) return;
    const removed = def.data.folders[idx];
    const sprites = def.data.sprites.map(s => s.folder === removed.id ? { ...s, folder: '' } : s);
    await persistData({ ...def, data: { ...def.data, folders: def.data.folders.filter((_, i) => i !== idx), sprites } });
  };
  const saveFolder = async () => {
    if (!def || !editFolder || editFolderIdx < 0) return;
    const folders = [...def.data.folders];
    folders[editFolderIdx] = editFolder;
    await persistData({ ...def, data: { ...def.data, folders } });
    backToTabs();
  };
  const ef = (fn: (prev: SpriteFolder) => Partial<SpriteFolder>) =>
    setEditFolder(prev => prev ? { ...prev, ...fn(prev) } : prev);

  /* ─── SPRITE actions ─── */
  const uploadToFolder = async (files: File[], targetFolder: string) => {
    if (!files.length || !def) return;
    setUploading(true);
    try {
      const newSprites: SpriteAsset[] = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const blob = await put(`sprites/${Date.now()}_${file.name}`, file, { access: 'public', token: blobToken });
        newSprites.push({ id: `spr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, name: file.name.replace(/\.[^.]+$/, ''), url: blob.url, folder: targetFolder });
      }
      if (newSprites.length) {
        const updated = { ...def, data: { ...def.data, sprites: [...def.data.sprites, ...newSprites] } };
        await updateDefinition(updated._id, { data: updated.data });
        const fresh = await fetchDefinitionById(updated._id);
        if (!fresh.data.sprites) fresh.data.sprites = [];
        if (!fresh.data.folders) fresh.data.folders = [];
        setDef(fresh);
      }
    } catch {}
    setUploading(false);
  };
  const handleSpriteUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await uploadToFolder(Array.from(e.target.files || []), selectedFolder);
    e.target.value = '';
  };
  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>, folderId: string) => {
    await uploadToFolder(Array.from(e.target.files || []), folderId);
    e.target.value = '';
  };
  const deleteSprite = async (idx: number) => {
    if (!def || !confirm('Delete this sprite?')) return;
    const removed = def.data.sprites[idx];
    if (removed?.url?.includes('vercel-storage')) {
      await deleteBlobUrl(removed.url);
    }
    await persistData({ ...def, data: { ...def.data, sprites: def.data.sprites.filter((_, i) => i !== idx) } });
  };

  /* ─── loading screen ─── */
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-['Poppins',sans-serif] ${isLight ? 'bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50' : 'bg-[#1C1C1C]'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin ${isLight ? 'border-blue-500' : 'border-blue-400'}`} />
          <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!def) return null;

  return (
    <LightCtx.Provider value={isLight}>
      <div className={`relative overflow-hidden min-h-screen font-['Poppins',sans-serif] select-text ${isLight ? 'bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50' : 'bg-[#1C1C1C]'}`}>
        <div className="sm:px-16 px-6 flex justify-center items-center">
          <div className="xl:max-w-[1550px] w-full">
            <div className="relative px-0 my-6 sm:my-12">

              {/* ──── HEADER ──── */}
              <div className={`${card(isLight)} p-4 sm:p-6 mb-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                      <MapIcon className={`text-base sm:text-lg ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                    </div>
                    <h1 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Map Editor</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={toggleTheme} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-500' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-400'}`}>
                      {isLight ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
                    </button>
                    {view !== 'tabs' ? (
                      <button onClick={backToTabs} className={`flex items-center gap-1.5 ${btnS(isLight)}`}><ListIcon className="w-3 h-3" /> Back</button>
                    ) : (
                      <button onClick={onExit} className={`flex items-center gap-1.5 ${btnS(isLight)}`}>Back to Menu</button>
                    )}
                  </div>
                </div>

                {/* ─── tabs ─── */}
                {view === 'tabs' && (
                  <div className={`flex items-center gap-1 mt-3 pt-3 border-t border-solid overflow-x-auto scrollbar-hide ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    {([
                      { id: 'structures' as TabId, label: 'Structures', Icon: GamepadIcon, count: def.data.structures.length, active: 'bg-amber-50 text-amber-600', activeDark: 'bg-amber-900/20 text-amber-400' },
                      { id: 'biomes' as TabId,     label: 'Biomes',     Icon: LayersIcon,  count: def.data.biomes.length,     active: 'bg-cyan-50 text-cyan-600',   activeDark: 'bg-cyan-900/20 text-cyan-400' },
                      { id: 'categories' as TabId, label: 'Categories', Icon: TagIcon,     count: def.data.categories.length, active: 'bg-green-50 text-green-600',  activeDark: 'bg-green-900/20 text-green-400' },
                      { id: 'sprites' as TabId,    label: 'Sprites',    Icon: ImageIcon,   count: def.data.sprites.length,    active: 'bg-indigo-50 text-indigo-600', activeDark: 'bg-indigo-900/20 text-indigo-400' },
                    ]).map(tb => (
                      <button key={tb.id} onClick={() => setTab(tb.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${tab === tb.id ? (isLight ? tb.active : tb.activeDark) : (isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]')}`}>
                        <tb.Icon className="w-[10px] h-[10px]" /> {tb.label} ({tb.count})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ══════════════ STRUCTURES TAB ══════════════ */}
              {view === 'tabs' && tab === 'structures' && (
                <div className={`${card(isLight)} overflow-hidden`}>
                  <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-amber-100' : 'bg-amber-900/30'}`}>
                        <GamepadIcon className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Structures</h3>
                        <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{def.data.structures.length} structure{def.data.structures.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <button onClick={addStruct} className={`flex items-center gap-1.5 ${btnP(isLight)}`}><PlusIcon className="w-3 h-3" /> Add Structure</button>
                  </div>

                  {def.data.structures.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400 bg-slate-50/50' : 'text-gray-500 bg-[#111]'}`}>
                            {['Name', 'Category', 'Loot Tier', 'Spawn Rate', 'Biomes'].map(h => (
                              <th key={h} className="px-4 py-3 text-left">{h}</th>
                            ))}
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {def.data.structures.map((s, i) => {
                            const catDef = def.data.categories.find(c => c.id === s.category);
                            return (
                              <tr key={s.id ?? i} className={`group transition-colors ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-[#141414]'} border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                <td className={`px-4 py-3 text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{s.label || '—'}</td>
                                <td className="px-4 py-3">
                                  {catDef ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: catDef.color }} />
                                      <span className={isLight ? 'text-slate-600' : 'text-gray-300'}>{catDef.label}</span>
                                    </span>
                                  ) : (
                                    <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{s.category || '—'}</span>
                                  )}
                                </td>
                                <td className={`px-4 py-3 text-xs font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{TIER_LABELS[s.lootTier] ?? `Tier ${s.lootTier ?? 1}`}</td>
                                <td className={`px-4 py-3 text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{s.spawnRate ?? 50}%</td>
                                <td className={`px-4 py-3 text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                  <div className="flex flex-wrap gap-1">
                                    {(s.biomes ?? []).map(bId => {
                                      const bDef = def.data.biomes.find(b => b.id === bId);
                                      return <span key={bId} className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-gray-400'}`}>{bDef?.label ?? bId}</span>;
                                    })}
                                    {(!s.biomes || s.biomes.length === 0) && '—'}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-1">
                                    <ActBtn l={isLight} c="blue" tip="Open in Canvas" fn={() => openCanvasFor('structure', i)}><EyeIcon /></ActBtn>
                                    <ActBtn l={isLight} c="amber" tip="Edit" fn={() => openStructEdit(i)}><PenIcon /></ActBtn>
                                    <ActBtn l={isLight} c="red" tip="Delete" fn={() => deleteStruct(i)}><TrashIcon /></ActBtn>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState icon={<GamepadIcon className="w-5 h-5" />} title="No structures yet" subtitle='Click "Add Structure" to create one' isLight={isLight} />
                  )}
                </div>
              )}

              {/* ══════════════ BIOMES TAB ══════════════ */}
              {view === 'tabs' && tab === 'biomes' && (
                <div className={`${card(isLight)} overflow-hidden`}>
                  <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-cyan-100' : 'bg-cyan-900/30'}`}>
                        <LayersIcon className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Biomes</h3>
                        <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{def.data.biomes.length} biome{def.data.biomes.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <button onClick={addBiome} className={`flex items-center gap-1.5 ${btnP(isLight)}`}><PlusIcon className="w-3 h-3" /> Add Biome</button>
                  </div>

                  {def.data.biomes.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400 bg-slate-50/50' : 'text-gray-500 bg-[#111]'}`}>
                            {['Name', 'Color', 'Spawn Rate'].map(h => (
                              <th key={h} className="px-4 py-3 text-left">{h}</th>
                            ))}
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {def.data.biomes.map((b, i) => (
                            <tr key={b.id ?? i} className={`group transition-colors ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-[#141414]'} border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                              <td className={`px-4 py-3 text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{b.label || '—'}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-4 h-4 rounded" style={{ backgroundColor: b.color }} />
                                  <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{b.color}</span>
                                </span>
                              </td>
                              <td className={`px-4 py-3 text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{b.spawnRate ?? 50}%</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <ActBtn l={isLight} c="blue" tip="Open in Canvas" fn={() => openCanvasFor('biome', i)}><EyeIcon /></ActBtn>
                                  <ActBtn l={isLight} c="amber" tip="Edit" fn={() => openBiomeEdit(i)}><PenIcon /></ActBtn>
                                  <ActBtn l={isLight} c="red" tip="Delete" fn={() => deleteBiome(i)}><TrashIcon /></ActBtn>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState icon={<LayersIcon className="w-5 h-5" />} title="No biomes yet" subtitle='Click "Add Biome" to create one' isLight={isLight} />
                  )}
                </div>
              )}

              {/* ══════════════ CATEGORIES TAB ══════════════ */}
              {view === 'tabs' && tab === 'categories' && (
                <div className={`${card(isLight)} overflow-hidden`}>
                  <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-green-100' : 'bg-green-900/30'}`}>
                        <TagIcon className={`w-3.5 h-3.5 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Categories</h3>
                        <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{def.data.categories.length} categor{def.data.categories.length !== 1 ? 'ies' : 'y'}</p>
                      </div>
                    </div>
                    <button onClick={addCat} className={`flex items-center gap-1.5 ${btnP(isLight)}`}><PlusIcon className="w-3 h-3" /> Add Category</button>
                  </div>

                  {def.data.categories.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400 bg-slate-50/50' : 'text-gray-500 bg-[#111]'}`}>
                            {['Name', 'Color', 'Description'].map(h => (
                              <th key={h} className="px-4 py-3 text-left">{h}</th>
                            ))}
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {def.data.categories.map((c, i) => (
                            <tr key={c.id ?? i} className={`group transition-colors ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-[#141414]'} border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                                  <span className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{c.label || '—'}</span>
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{c.color}</span>
                              </td>
                              <td className={`px-4 py-3 text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                {c.description ? (c.description.length > 60 ? c.description.slice(0, 60) + '...' : c.description) : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <ActBtn l={isLight} c="amber" tip="Edit" fn={() => openCatEdit(i)}><PenIcon /></ActBtn>
                                  <ActBtn l={isLight} c="red" tip="Delete" fn={() => deleteCat(i)}><TrashIcon /></ActBtn>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState icon={<TagIcon className="w-5 h-5" />} title="No categories yet" subtitle='Click "Add Category" to create one' isLight={isLight} />
                  )}
                </div>
              )}

              {/* ══════════════ SPRITES TAB ══════════════ */}
              {view === 'tabs' && tab === 'sprites' && (
                <div className={`${card(isLight)} overflow-hidden`}>
                  <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-indigo-100' : 'bg-indigo-900/30'}`}>
                        <ImageIcon className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Sprites</h3>
                        <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{def.data.sprites.length} sprite{def.data.sprites.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={addFolder} className={`flex items-center gap-1.5 ${btnS(isLight)} text-xs`}><FolderIcon className="w-3 h-3" /> New Folder</button>
                      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleSpriteUpload} className="hidden" />
                      <button onClick={() => { setSelectedFolder(''); fileRef.current?.click(); }} disabled={uploading} className={`flex items-center gap-1.5 ${btnP(isLight)} ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <UploadIcon className="w-3 h-3" /> {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 py-4 space-y-4">
                    {/* ─── folder sections ─── */}
                    {def.data.folders.map((folder, fi) => {
                      const folderSprites = def.data.sprites.filter(s => s.folder === folder.id);
                      return (
                        <div key={folder.id} className={`rounded-lg border border-solid overflow-hidden ${isLight ? 'border-slate-200' : 'border-[#2a2a2a]'}`}>
                          <div className={`flex items-center justify-between px-3 py-2.5 ${isLight ? 'bg-slate-50/80' : 'bg-[#141414]'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: folder.color }} />
                              <span className={`text-xs font-semibold truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{folder.name}</span>
                              <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>({folderSprites.length})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <label className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium cursor-pointer transition-colors ${isLight ? 'text-indigo-600 hover:bg-indigo-50' : 'text-indigo-400 hover:bg-indigo-900/20'} ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                <UploadIcon className="w-2.5 h-2.5" /> Upload
                                <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFolderUpload(e, folder.id)} />
                              </label>
                              <ActBtn l={isLight} c="blue" tip="Edit folder" fn={() => openFolderEdit(fi)}><PenIcon /></ActBtn>
                              <ActBtn l={isLight} c="red" tip="Delete folder" fn={() => deleteFolder(fi)}><TrashIcon /></ActBtn>
                            </div>
                          </div>
                          {folderSprites.length > 0 ? (
                            <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-3 ${isLight ? 'bg-white' : 'bg-[#0e0e0e]'}`}>
                              {folderSprites.map(spr => {
                                const realIdx = def.data.sprites.findIndex(s => s.id === spr.id);
                                return (
                                  <div key={spr.id} className={`group relative rounded-lg border border-solid overflow-hidden transition-all ${isLight ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm' : 'bg-[#141414] border-[#2a2a2a] hover:border-indigo-800'}`}>
                                    <div className={`aspect-square flex items-center justify-center p-2 ${isLight ? 'bg-slate-50' : 'bg-[#1a1a1a]'}`}>
                                      <img src={spr.url} alt={spr.name} className="w-full h-full object-contain" draggable={false} />
                                    </div>
                                    <div className="px-2 py-1.5">
                                      <p className={`text-[10px] font-medium truncate ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{spr.name}</p>
                                    </div>
                                    <button onClick={() => deleteSprite(realIdx)}
                                      className={`absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? 'bg-white/90 text-red-500 hover:bg-red-50' : 'bg-black/60 text-red-400 hover:bg-red-900/30'}`}>
                                      <TrashIcon className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className={`flex items-center justify-center py-6 ${isLight ? 'bg-white' : 'bg-[#0e0e0e]'}`}>
                              <label className={`flex flex-col items-center gap-1.5 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                <UploadIcon className={`w-5 h-5 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Drop or click to upload images</span>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFolderUpload(e, folder.id)} />
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* ─── uncategorized sprites ─── */}
                    {(() => {
                      const uncategorized = def.data.sprites.filter(s => !s.folder);
                      if (!uncategorized.length && def.data.folders.length > 0) return null;
                      return (
                        <div className={`rounded-lg border border-solid overflow-hidden ${isLight ? 'border-slate-200' : 'border-[#2a2a2a]'}`}>
                          {def.data.folders.length > 0 && (
                            <div className={`flex items-center px-3 py-2.5 ${isLight ? 'bg-slate-50/80' : 'bg-[#141414]'}`}>
                              <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Uncategorized</span>
                              <span className={`text-[10px] ml-2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>({uncategorized.length})</span>
                            </div>
                          )}
                          {uncategorized.length > 0 ? (
                            <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-3 ${isLight ? 'bg-white' : 'bg-[#0e0e0e]'}`}>
                              {uncategorized.map(spr => {
                                const realIdx = def.data.sprites.findIndex(s => s.id === spr.id);
                                return (
                                  <div key={spr.id} className={`group relative rounded-lg border border-solid overflow-hidden transition-all ${isLight ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm' : 'bg-[#141414] border-[#2a2a2a] hover:border-indigo-800'}`}>
                                    <div className={`aspect-square flex items-center justify-center p-2 ${isLight ? 'bg-slate-50' : 'bg-[#1a1a1a]'}`}>
                                      <img src={spr.url} alt={spr.name} className="w-full h-full object-contain" draggable={false} />
                                    </div>
                                    <div className="px-2 py-1.5">
                                      <p className={`text-[10px] font-medium truncate ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{spr.name}</p>
                                    </div>
                                    <button onClick={() => deleteSprite(realIdx)}
                                      className={`absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? 'bg-white/90 text-red-500 hover:bg-red-50' : 'bg-black/60 text-red-400 hover:bg-red-900/30'}`}>
                                      <TrashIcon className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <EmptyState icon={<ImageIcon className="w-5 h-5" />} title="No sprites yet" subtitle='Create a folder or click "Upload" to add sprite images' isLight={isLight} />
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ══════════════ FOLDER FORM ══════════════ */}
              {view === 'folderForm' && editFolder && (
                <div className={`${card(isLight)} overflow-hidden`}>
                  <div className={`flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: editFolder.color + '30', color: editFolder.color }}>
                      {(editFolder.name ?? 'N')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{editFolder.name || 'New Folder'}</h3>
                      <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Sprite folder</p>
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 py-4 space-y-5">
                    <div>
                      <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>Folder Details</h4>
                      <div className="space-y-3">
                        <div>
                          <label className={`${lblCls(isLight)} uppercase tracking-wider`}>Folder Name</label>
                          <FInput value={editFolder.name ?? ''} onChange={v => ef(() => ({ name: v }))} placeholder="Folder name" />
                        </div>
                        <div>
                          <label className={`${lblCls(isLight)} uppercase tracking-wider`}>Color</label>
                          <div className="flex items-center gap-3">
                            <input type="color" value={editFolder.color ?? '#6b7280'} onChange={e => ef(() => ({ color: e.target.value }))}
                              className={`w-10 h-10 rounded-lg border cursor-pointer ${isLight ? 'border-slate-200 bg-white' : 'border-[#333] bg-transparent'}`} />
                            <div>
                              <span className={`text-xs font-mono block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{editFolder.color}</span>
                              <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Folder display color</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* upload area inside folder form */}
                    <div>
                      <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>Upload Images to Folder</h4>
                      {(() => {
                        const folderSprites = def.data.sprites.filter(s => s.folder === editFolder.id);
                        return (
                          <>
                            <label className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${isLight ? 'border-slate-200 hover:border-indigo-300 bg-slate-50/50' : 'border-[#333] hover:border-indigo-700 bg-[#111]'} ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                              <UploadIcon className={`w-6 h-6 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                              <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{uploading ? 'Uploading...' : 'Click to select images'}</span>
                              <span className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>PNG, JPG, GIF, WebP</span>
                              <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFolderUpload(e, editFolder.id)} />
                            </label>
                            {folderSprites.length > 0 && (
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                                {folderSprites.map(spr => {
                                  const realIdx = def.data.sprites.findIndex(s => s.id === spr.id);
                                  return (
                                    <div key={spr.id} className={`group relative rounded-lg border border-solid overflow-hidden ${isLight ? 'border-slate-200' : 'border-[#2a2a2a]'}`}>
                                      <div className={`aspect-square flex items-center justify-center p-1.5 ${isLight ? 'bg-slate-50' : 'bg-[#1a1a1a]'}`}>
                                        <img src={spr.url} alt={spr.name} className="w-full h-full object-contain" draggable={false} />
                                      </div>
                                      <p className={`text-[9px] truncate px-1.5 py-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{spr.name}</p>
                                      <button onClick={() => deleteSprite(realIdx)}
                                        className={`absolute top-0.5 right-0.5 w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? 'bg-white/90 text-red-500' : 'bg-black/60 text-red-400'}`}>
                                        <TrashIcon className="w-2 h-2" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className={`flex items-center justify-end gap-2 px-4 sm:px-5 py-3.5 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <button onClick={backToTabs} className={btnS(isLight)}>Cancel</button>
                    <button onClick={saveFolder} disabled={saving} className={`${btnP(isLight)} min-w-[120px] ${saving ? 'opacity-50 pointer-events-none' : ''}`}>
                      {saving ? 'Saving...' : 'Save Folder'}
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════ STRUCTURE FORM ══════════════ */}
              {view === 'structForm' && editStruct && (
                <div className={`${card(isLight)} overflow-hidden`}>
                  <div className={`flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/30 text-amber-400'}`}>
                      {(editStruct.label ?? 'N')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{editStruct.label || 'New Structure'}</h3>
                      <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                        {def.data.categories.find(c => c.id === editStruct.category)?.label ?? 'Uncategorized'} Structure
                      </p>
                    </div>
                    <div className="flex-1" />
                    <button onClick={() => openCanvasFor('structure', editStructIdx)} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all ${isLight ? 'bg-purple-100 hover:bg-purple-200 text-purple-600' : 'bg-purple-900/20 hover:bg-purple-900/30 text-purple-400'}`}>
                      <EyeIcon /> Open Editor
                    </button>
                  </div>

                  <div className="px-4 sm:px-5 py-4 space-y-5">
                    <div>
                      <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>Basic Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`${lblCls(isLight)} uppercase tracking-wider`}>Structure Name</label>
                          <FInput value={editStruct.label ?? ''} onChange={v => es(() => ({ label: v }))} placeholder="Structure name" />
                        </div>
                        <div>
                          <label className={`${lblCls(isLight)} uppercase tracking-wider`}>Category</label>
                          <select className={`${selCls(isLight)} w-full`} value={editStruct.category ?? ''} onChange={e => es(() => ({ category: e.target.value }))} onKeyDown={e => e.stopPropagation()}>
                            <option value="">None</option>
                            {def.data.categories.map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                          {def.data.categories.length === 0 && (
                            <p className={`text-[10px] mt-1 ${isLight ? 'text-orange-500' : 'text-orange-400/70'}`}>
                              No categories defined. Add categories in the Categories tab first.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>Spawn & Loot</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`${lblCls(isLight)} uppercase tracking-wider`}>Loot Tier</label>
                          <select className={`${selCls(isLight)} w-full`} value={editStruct.lootTier ?? 1} onChange={e => es(() => ({ lootTier: Number(e.target.value) }))} onKeyDown={e => e.stopPropagation()}>
                            <option value={1}>Tier 1</option>
                            <option value={2}>Tier 2</option>
                            <option value={3}>Tier 3</option>
                            <option value={4}>Tier 4</option>
                          </select>
                          <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Determines loot quality</p>
                        </div>
                        <div>
                          <label className={`${lblCls(isLight)} uppercase tracking-wider`}>Spawn Rate</label>
                          <div className="flex items-center gap-2">
                            <FNum value={editStruct.spawnRate ?? 50} onChange={v => es(() => ({ spawnRate: Math.max(1, Math.min(100, v)) }))} />
                            <span className={`text-sm font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>%</span>
                          </div>
                          <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Chance to spawn (1-100%)</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>Allowed Biomes</h4>
                      <p className={`text-[10px] mb-3 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Select which biomes this structure can spawn in.</p>
                      {def.data.biomes.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {def.data.biomes.map(b => {
                            const active = editStruct.biomes?.includes(b.id);
                            return (
                              <label key={b.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all ${active
                                ? (isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/20 border-blue-800')
                                : (isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]')} border border-solid ${isLight ? 'border-slate-200' : 'border-[#2a2a2a]'}`}>
                                <input type="checkbox" checked={active ?? false}
                                  onChange={() => es(p => ({ biomes: active ? (p.biomes ?? []).filter(x => x !== b.id) : [...(p.biomes ?? []), b.id] }))}
                                  className={`w-4 h-4 rounded border-2 ${active ? 'text-blue-500' : ''}`} />
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
                                  <span className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{b.label}</span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <p className={`text-[10px] ${isLight ? 'text-orange-500' : 'text-orange-400/70'}`}>
                          No biomes defined. Add biomes in the Biomes tab first.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-center justify-end gap-2 px-4 sm:px-5 py-3.5 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <button onClick={backToTabs} className={btnS(isLight)}>Cancel</button>
                    <button onClick={saveStruct} disabled={saving} className={`${btnP(isLight)} min-w-[120px] ${saving ? 'opacity-50 pointer-events-none' : ''}`}>
                      {saving ? 'Saving...' : 'Save Structure'}
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════ BIOME FORM ══════════════ */}
              {view === 'biomeForm' && editBiome && (
                <div className={`${card(isLight)} overflow-hidden`}>
                  <div className={`flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: editBiome.color + '30', color: editBiome.color }}>
                      {(editBiome.label ?? 'N')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{editBiome.label || 'New Biome'}</h3>
                      <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Biome configuration</p>
                    </div>
                    <div className="flex-1" />
                    <button onClick={() => openCanvasFor('biome', editBiomeIdx)} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all ${isLight ? 'bg-purple-100 hover:bg-purple-200 text-purple-600' : 'bg-purple-900/20 hover:bg-purple-900/30 text-purple-400'}`}>
                      <EyeIcon /> Open Editor
                    </button>
                  </div>

                  <div className="px-4 sm:px-5 py-4 space-y-5">
                    <div>
                      <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`}>Basic Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`${lblCls(isLight)} uppercase tracking-wider`}>Biome Name</label>
                          <FInput value={editBiome.label ?? ''} onChange={v => eb(() => ({ label: v }))} placeholder="Biome name" />
                        </div>
                        <div>
                          <label className={`${lblCls(isLight)} uppercase tracking-wider`}>Color</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={editBiome.color ?? '#6b7280'} onChange={e => eb(() => ({ color: e.target.value }))}
                              className={`w-10 h-10 rounded-lg border cursor-pointer ${isLight ? 'border-slate-200 bg-white' : 'border-[#333] bg-transparent'}`} />
                            <div>
                              <span className={`text-xs font-mono block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{editBiome.color}</span>
                              <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>UI display color</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`}>Spawn & Loot</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`${lblCls(isLight)} uppercase tracking-wider`}>Spawn Rate</label>
                          <div className="flex items-center gap-2">
                            <FNum value={editBiome.spawnRate ?? 50} onChange={v => eb(() => ({ spawnRate: Math.max(1, Math.min(100, v)) }))} />
                            <span className={`text-sm font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>%</span>
                          </div>
                          <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Chance for this biome to generate (1-100%)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center justify-end gap-2 px-4 sm:px-5 py-3.5 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <button onClick={backToTabs} className={btnS(isLight)}>Cancel</button>
                    <button onClick={saveBiome} disabled={saving} className={`${btnP(isLight)} min-w-[120px] ${saving ? 'opacity-50 pointer-events-none' : ''}`}>
                      {saving ? 'Saving...' : 'Save Biome'}
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════ CATEGORY FORM ══════════════ */}
              {view === 'catForm' && editCat && (
                <div className={`${card(isLight)} overflow-hidden`}>
                  <div className={`flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: editCat.color + '30', color: editCat.color }}>
                      {(editCat.label ?? 'N')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{editCat.label || 'New Category'}</h3>
                      <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Category configuration</p>
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 py-4 space-y-5">
                    <div>
                      <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-green-600' : 'text-green-400'}`}>Category Details</h4>
                      <div className="space-y-3">
                        <div>
                          <label className={`${lblCls(isLight)} uppercase tracking-wider`}>Category Name</label>
                          <FInput value={editCat.label ?? ''} onChange={v => ec(() => ({ label: v }))} placeholder="Category name" />
                        </div>
                        <div>
                          <label className={`${lblCls(isLight)} uppercase tracking-wider`}>Color</label>
                          <div className="flex items-center gap-3">
                            <input type="color" value={editCat.color ?? '#6b7280'} onChange={e => ec(() => ({ color: e.target.value }))}
                              className={`w-10 h-10 rounded-lg border cursor-pointer ${isLight ? 'border-slate-200 bg-white' : 'border-[#333] bg-transparent'}`} />
                            <div>
                              <span className={`text-xs font-mono block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{editCat.color}</span>
                              <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Badge display color</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className={`${lblCls(isLight)} uppercase tracking-wider`}>Description</label>
                          <FTextarea value={editCat.description ?? ''} onChange={v => ec(() => ({ description: v }))} placeholder="Optional description for this category..." />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center justify-end gap-2 px-4 sm:px-5 py-3.5 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <button onClick={backToTabs} className={btnS(isLight)}>Cancel</button>
                    <button onClick={saveCat} disabled={saving} className={`${btnP(isLight)} min-w-[120px] ${saving ? 'opacity-50 pointer-events-none' : ''}`}>
                      {saving ? 'Saving...' : 'Save Category'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </LightCtx.Provider>
  );
}

/* ─── Form inputs with local state ──────────────────────────── */

function FInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const l = useLight();
  const [loc, setLoc] = useState(value);
  const [f, setF] = useState(false);
  useEffect(() => { if (!f) setLoc(value); }, [value, f]);
  return <input type="text" value={f ? loc : value} onChange={e => setLoc(e.target.value)}
    onFocus={() => { setF(true); setLoc(value); }} onBlur={() => { setF(false); onChange(loc); }}
    onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') { onChange(loc); (e.target as HTMLInputElement).blur(); } }}
    placeholder={placeholder} className={inputCls(l)} />;
}

function FNum({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const l = useLight();
  const [loc, setLoc] = useState(String(value));
  const [f, setF] = useState(false);
  useEffect(() => { if (!f) setLoc(String(value)); }, [value, f]);
  return <input type="number" value={f ? loc : String(value)} onChange={e => setLoc(e.target.value)}
    onFocus={() => { setF(true); setLoc(String(value)); }} onBlur={() => { setF(false); onChange(Number(loc) || 0); }}
    onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') { onChange(Number(loc) || 0); (e.target as HTMLInputElement).blur(); } }}
    className={inputCls(l)} />;
}

function FTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const l = useLight();
  const [loc, setLoc] = useState(value);
  const [f, setF] = useState(false);
  useEffect(() => { if (!f) setLoc(value); }, [value, f]);
  return <textarea value={f ? loc : value} onChange={e => setLoc(e.target.value)}
    onFocus={() => { setF(true); setLoc(value); }} onBlur={() => { setF(false); onChange(loc); }}
    onKeyDown={e => { e.stopPropagation(); }}
    placeholder={placeholder} rows={3}
    className={`${inputCls(l)} resize-none`} />;
}

/* ─── Empty state ────────────────────────────────────────────── */

function EmptyState({ icon, title, subtitle, isLight }: { icon: React.ReactNode; title: string; subtitle: string; isLight: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>{icon}</div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs mt-1">{subtitle}</p>
    </div>
  );
}

/* ─── Small helpers ─────────────────────────────────────────── */

function ActBtn({ children, l, c, tip, fn }: { children: React.ReactNode; l: boolean; c: string; tip: string; fn: () => void }) {
  const clrs: Record<string, [string, string]> = {
    blue:   ['text-blue-400 hover:text-blue-600 hover:bg-blue-50',     'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20'],
    amber:  ['text-amber-400 hover:text-amber-600 hover:bg-amber-50',   'text-amber-400 hover:text-amber-300 hover:bg-amber-900/20'],
    green:  ['text-green-400 hover:text-green-600 hover:bg-green-50',   'text-green-400 hover:text-green-300 hover:bg-green-900/20'],
    red:    ['text-red-400 hover:text-red-600 hover:bg-red-50',         'text-red-400 hover:text-red-300 hover:bg-red-900/20'],
    purple: ['text-purple-400 hover:text-purple-600 hover:bg-purple-50', 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/20'],
  };
  const [lt, dk] = clrs[c] ?? clrs.blue;
  return <button onClick={fn} title={tip} className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${l ? lt : dk}`}>{children}</button>;
}

/* ─── SVG Icons ─────────────────────────────────────────────── */
const I = ({ d, className }: { d: string; className?: string }) => <svg className={className ?? 'w-[10px] h-[10px]'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={d} /></svg>;
function MapIcon({ className }: { className?: string }) { return <I d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" className={className} />; }
function TrashIcon({ className }: { className?: string }) { return <I d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className={className} />; }
function EyeIcon({ className }: { className?: string }) { return <svg className={className ?? 'w-[10px] h-[10px]'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>; }
function PenIcon({ className }: { className?: string }) { return <I d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" className={className} />; }
function ListIcon({ className }: { className?: string }) { return <I d="M4 6h16M4 12h16M4 18h16" className={className} />; }
function PlusIcon({ className }: { className?: string }) { return <I d="M12 4v16m8-8H4" className={className} />; }
function MoonIcon({ className }: { className?: string }) { return <I d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" className={className} />; }
function SunIcon({ className }: { className?: string }) { return <I d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" className={className} />; }
function GamepadIcon({ className }: { className?: string }) { return <I d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" className={className} />; }
function LayersIcon({ className }: { className?: string }) { return <svg className={className ?? 'w-[10px] h-[10px]'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>; }
function TagIcon({ className }: { className?: string }) { return <I d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" className={className} />; }
function ImageIcon({ className }: { className?: string }) { return <I d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" className={className} />; }
function FolderIcon({ className }: { className?: string }) { return <I d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" className={className} />; }
function UploadIcon({ className }: { className?: string }) { return <I d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" className={className} />; }
