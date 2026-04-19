import React, { useState, useMemo } from 'react';
import {
  useGameDefs,
  ALL_BIOME_IDS, STRUCTURE_CATEGORIES,
  type StructureDef, type BiomeDef, type BiomeId, type StructureCategory, type TileRule,
  type DefinitionPreset,
} from '../../data/gameDefinitions';
import { TileType } from '../../engine/types';
import { useEditorStore } from '../../store/editorStore';

/* ── Tile name helper ────────────────────────────────────────── */

const TILE_NAMES: Record<number, string> = {
  [TileType.GRASS]: 'Grass', [TileType.ROAD]: 'Road', [TileType.WALL]: 'Wall',
  [TileType.FLOOR]: 'Floor', [TileType.DOOR]: 'Door', [TileType.WATER]: 'Water',
  [TileType.DIRT]: 'Dirt', [TileType.CONCRETE]: 'Concrete', [TileType.TREE]: 'Tree',
  [TileType.CAR]: 'Car', [TileType.FENCE]: 'Fence', [TileType.SWAMP]: 'Swamp',
  [TileType.TOXIC_PUDDLE]: 'Toxic', [TileType.METAL_FLOOR]: 'Metal Floor',
  [TileType.PIPE]: 'Pipe', [TileType.RUBBLE]: 'Rubble', [TileType.TALL_GRASS]: 'Tall Grass',
  [TileType.DEAD_TREE]: 'Dead Tree', [TileType.BARREL]: 'Barrel', [TileType.CRATE]: 'Crate',
  [TileType.SAND]: 'Sand', [TileType.BUSH]: 'Bush', [TileType.STUMP]: 'Stump',
  [TileType.ROCKS]: 'Rocks',
};

function tileName(t: number) { return TILE_NAMES[t] ?? `Tile ${t}`; }

/* ── Shared atoms ────────────────────────────────────────────── */

function Badge({ text, color }: { text: string; color: string }) {
  return <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${color}`}>{text}</span>;
}

const BIOME_BADGE_COLORS: Record<string, string> = {
  urban: 'bg-gray-500/15 text-gray-400', suburbs: 'bg-gray-400/15 text-gray-300',
  swamp: 'bg-emerald-500/15 text-emerald-400', chemical: 'bg-lime-500/15 text-lime-400',
  military: 'bg-red-500/15 text-red-400', farmland: 'bg-amber-500/15 text-amber-400',
  junkyard: 'bg-orange-500/15 text-orange-400', forest: 'bg-green-500/15 text-green-400',
  desert: 'bg-yellow-500/15 text-yellow-400',
};

function ActionBtn({ children, title, color, onClick }: {
  children: React.ReactNode; title: string; color: string; onClick: (e: React.MouseEvent) => void;
}) {
  const c: Record<string, string> = {
    amber: 'bg-amber-500/10 hover:bg-amber-500/25 text-amber-400/50 hover:text-amber-400',
    blue: 'bg-blue-500/10 hover:bg-blue-500/25 text-blue-400/50 hover:text-blue-400',
    red: 'bg-red-500/10 hover:bg-red-500/25 text-red-400/50 hover:text-red-400',
  };
  return (
    <button onClick={onClick} title={title}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${c[color] ?? c.blue}`}>
      {children}
    </button>
  );
}

const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const DupIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const DelIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

function PageBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-7 h-7 text-xs rounded-md transition-all ${disabled ? 'text-white/10 cursor-not-allowed' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
      {label}
    </button>
  );
}

/* ── View state ──────────────────────────────────────────────── */

type View =
  | { type: 'list' }
  | { type: 'edit-structure'; id: string }
  | { type: 'edit-biome'; id: BiomeId };

/* ── Main Component ──────────────────────────────────────────── */

type TabId = 'structures' | 'biomes' | 'presets';
const PER_PAGE_OPTS = [10, 25, 50];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function DataTable() {
  const structures = useGameDefs((s) => s.structures);
  const biomes = useGameDefs((s) => s.biomes);
  const addStructure = useGameDefs((s) => s.addStructure);
  const removeStructure = useGameDefs((s) => s.removeStructure);
  const duplicateStructure = useGameDefs((s) => s.duplicateStructure);
  const removeBiome = useGameDefs((s) => s.removeBiome);
  const presets = useGameDefs((s) => s.presets);
  const activePresetId = useGameDefs((s) => s.activePresetId);
  const saveAsPreset = useGameDefs((s) => s.saveAsPreset);
  const saveToPreset = useGameDefs((s) => s.saveToPreset);
  const loadPreset = useGameDefs((s) => s.loadPreset);
  const deletePreset = useGameDefs((s) => s.deletePreset);
  const renamePreset = useGameDefs((s) => s.renamePreset);
  const duplicatePresetAction = useGameDefs((s) => s.duplicatePreset);
  const resetDefaults = useGameDefs((s) => s.resetDefaults);
  const toggleDataTable = useEditorStore((s) => s.toggleDataTable);

  const [tab, setTab] = useState<TabId>('structures');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [catFilter, setCatFilter] = useState<StructureCategory | 'all'>('all');
  const [view, setView] = useState<View>({ type: 'list' });
  const [showAdd, setShowAdd] = useState(false);
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  /* ── filter ─────────────────────────────────────────────── */

  const filteredStructures = useMemo(() => {
    let list = [...structures];
    if (catFilter !== 'all') list = list.filter((s) => s.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.label.toLowerCase().includes(q) || s.category.includes(q) || s.lootTable.toLowerCase().includes(q));
    }
    return list;
  }, [structures, catFilter, search]);

  const filteredBiomes = useMemo(() => {
    if (!search.trim()) return biomes;
    const q = search.toLowerCase();
    return biomes.filter((b) => b.label.toLowerCase().includes(q) || b.id.includes(q));
  }, [biomes, search]);

  const items = tab === 'structures' ? filteredStructures : tab === 'biomes' ? filteredBiomes : presets;
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(page, totalPages);

  /* ── create + navigate to editor ────────────────────────── */

  const createStructure = () => {
    const id = `struct_${Date.now().toString(36)}`;
    addStructure({
      id, label: 'New Structure', category: 'residential',
      minW: 8, maxW: 12, minH: 6, maxH: 10, count: 5,
      biomes: ['suburbs'], floorType: 'wood', lootCount: 3, lootTable: 'House',
    });
    setShowAdd(false);
    setView({ type: 'edit-structure', id });
  };

  const createBiome = () => {
    const existing = biomes.map((b) => b.id);
    const unused = ALL_BIOME_IDS.filter((id) => !existing.includes(id));
    if (unused.length === 0) { alert('All biome types already defined'); return; }
    const newId = unused[0];
    useGameDefs.getState().addBiome({
      id: newId, label: newId.charAt(0).toUpperCase() + newId.slice(1), color: '#6b7280',
      defaultTile: TileType.GRASS, tileRules: [],
    });
    setShowAdd(false);
    setView({ type: 'edit-biome', id: newId });
  };

  const catCounts = useMemo(() => {
    const m = new Map<StructureCategory, number>();
    for (const s of structures) m.set(s.category, (m.get(s.category) ?? 0) + 1);
    return m;
  }, [structures]);

  const handleSaveAs = () => {
    const name = saveName.trim();
    if (!name) return;
    saveAsPreset(name);
    setSaveName('');
    setShowSaveAs(false);
    setTab('presets');
  };

  const handleSave = () => {
    if (activePresetId) {
      saveToPreset(activePresetId);
    } else {
      setShowSaveAs(true);
    }
  };

  const activePreset = presets.find((p) => p.id === activePresetId);

  /* ── If editing, render full-page editor ────────────────── */

  if (view.type === 'edit-structure') {
    return <StructureEditor id={view.id} onBack={() => setView({ type: 'list' })} />;
  }
  if (view.type === 'edit-biome') {
    return <BiomeEditor id={view.id} onBack={() => setView({ type: 'list' })} />;
  }

  /* ── List view ─────────────────────────────────────────── */

  return (
    <div className="flex flex-col h-full bg-[#0b0b18] text-white overflow-hidden">

      {/* ──── HEADER ──── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Game Definitions</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-white/40">{structures.length} structure{structures.length !== 1 ? 's' : ''}, {biomes.length} biome{biomes.length !== 1 ? 's' : ''}</p>
              {activePreset && (
                <>
                  <span className="text-white/15">·</span>
                  <span className="text-[10px] text-emerald-400/70 font-medium">{activePreset.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleSave}
            className="px-3 py-2 text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 rounded-lg text-emerald-400 transition-colors flex items-center gap-1.5"
            title={activePresetId ? `Save to "${activePreset?.name}"` : 'Save as new preset'}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {activePresetId ? 'Save' : 'Save As'}
          </button>
          {activePresetId && (
            <button onClick={() => setShowSaveAs(true)}
              className="px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white/80 transition-colors"
              title="Save as a new preset copy">
              Save As...
            </button>
          )}
          <button onClick={toggleDataTable}
            className="px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white/80 transition-colors">
            Back to Editor
          </button>
          <div className="relative">
            <button onClick={() => setShowAdd(!showAdd)}
              className="px-4 py-2 text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-500/20">
              <span className="text-sm">+</span> Add New
            </button>
            {showAdd && (
              <div className="absolute right-0 top-full mt-1 bg-[#16162a] border border-white/10 rounded-lg shadow-xl z-50 py-1 w-44">
                <button onClick={createStructure}
                  className="w-full px-4 py-2 text-left text-xs text-amber-400 hover:bg-white/5 flex items-center gap-2 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> New Structure
                </button>
                <button onClick={createBiome}
                  className="w-full px-4 py-2 text-left text-xs text-cyan-400 hover:bg-white/5 flex items-center gap-2 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> New Biome
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ──── TABS ──── */}
      <div className="flex items-center gap-6 px-6 border-b border-white/8">
        <button onClick={() => { setTab('structures'); setPage(1); }}
          className={`py-3 text-xs font-semibold border-b-2 transition-colors ${tab === 'structures' ? 'text-amber-400 border-amber-400' : 'text-white/40 border-transparent hover:text-white/60'}`}>
          Structures ({structures.length})
        </button>
        <button onClick={() => { setTab('biomes'); setPage(1); }}
          className={`py-3 text-xs font-semibold border-b-2 transition-colors ${tab === 'biomes' ? 'text-cyan-400 border-cyan-400' : 'text-white/40 border-transparent hover:text-white/60'}`}>
          Biomes ({biomes.length})
        </button>
        <button onClick={() => { setTab('presets'); setPage(1); }}
          className={`py-3 text-xs font-semibold border-b-2 transition-colors ${tab === 'presets' ? 'text-emerald-400 border-emerald-400' : 'text-white/40 border-transparent hover:text-white/60'}`}>
          Saved Presets ({presets.length})
        </button>
      </div>

      {/* ──── FILTERS (structures/biomes only) ──── */}
      {tab !== 'presets' && (
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            {tab === 'structures' && (
              <>
                <button onClick={() => setCatFilter('all')}
                  className={`px-2.5 py-1 text-[10px] rounded-md font-medium transition-all ${catFilter === 'all' ? 'bg-white/10 text-white/80' : 'text-white/30 hover:text-white/50'}`}>
                  All ({structures.length})
                </button>
                {STRUCTURE_CATEGORIES.filter((c) => catCounts.has(c.value)).map((cat) => (
                  <button key={cat.value} onClick={() => { setCatFilter(cat.value); setPage(1); }}
                    className={`px-2.5 py-1 text-[10px] rounded-md font-medium transition-all ${catFilter === cat.value ? cat.color : 'text-white/30 hover:text-white/50'}`}>
                    {cat.label} ({catCounts.get(cat.value) ?? 0})
                  </button>
                ))}
              </>
            )}
          </div>
          <div className="relative">
            <svg className="w-3.5 h-3.5 text-white/20 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={`Search ${tab}...`}
              className="pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/8 rounded-lg text-white/70 placeholder:text-white/20 outline-none focus:border-indigo-500/40 w-52 transition-colors" />
          </div>
        </div>
      )}

      {/* ──── TABLE / PRESETS ──── */}
      <div className="flex-1 overflow-auto">
        {tab === 'structures' ? (
          <StructuresTable items={filteredStructures} page={safePage} perPage={perPage}
            onEdit={(id) => setView({ type: 'edit-structure', id })}
            onDuplicate={duplicateStructure} onDelete={removeStructure} />
        ) : tab === 'biomes' ? (
          <BiomesTable items={filteredBiomes} page={safePage} perPage={perPage}
            onEdit={(id) => setView({ type: 'edit-biome', id })}
            onDelete={removeBiome} />
        ) : (
          <PresetsPanel
            presets={presets}
            activeId={activePresetId}
            renamingId={renamingId}
            renameValue={renameValue}
            onLoad={loadPreset}
            onDelete={deletePreset}
            onDuplicate={duplicatePresetAction}
            onStartRename={(id, name) => { setRenamingId(id); setRenameValue(name); }}
            onRenameChange={setRenameValue}
            onRenameConfirm={() => { if (renamingId) { renamePreset(renamingId, renameValue.trim() || 'Untitled'); setRenamingId(null); } }}
            onRenameCancel={() => setRenamingId(null)}
            onResetDefaults={() => { if (confirm('Reset to built-in defaults? Current unsaved changes will be lost.')) resetDefaults(); }}
            onSaveAs={() => setShowSaveAs(true)}
          />
        )}
      </div>

      {/* ──── PAGINATION (not for presets) ──── */}
      {tab !== 'presets' && (
        <div className="flex items-center justify-between px-6 py-2.5 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>{items.length > 0 ? (safePage - 1) * perPage + 1 : 0}-{Math.min(safePage * perPage, items.length)} of {items.length}</span>
            <div className="w-px h-3.5 bg-white/8" />
            <span>Show</span>
            <select value={perPage} onChange={(e) => { setPerPage(parseInt(e.target.value)); setPage(1); }}
              className="px-1.5 py-0.5 text-xs bg-white/5 border border-white/8 rounded text-white/60 outline-none">
              {PER_PAGE_OPTS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <PageBtn label="«" disabled={safePage <= 1} onClick={() => setPage(1)} />
            <PageBtn label="‹" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} />
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const p = totalPages <= 7 ? i + 1 : safePage <= 4 ? i + 1 : safePage >= totalPages - 3 ? totalPages - 6 + i : safePage - 3 + i;
              if (p < 1 || p > totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-md font-medium transition-all ${safePage === p ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}>
                  {p}
                </button>
              );
            })}
            <PageBtn label="›" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} />
            <PageBtn label="»" disabled={safePage >= totalPages} onClick={() => setPage(totalPages)} />
          </div>
        </div>
      )}

      {showAdd && <div className="fixed inset-0 z-40" onClick={() => setShowAdd(false)} />}

      {/* ──── SAVE-AS MODAL ──── */}
      {showSaveAs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSaveAs(false)}>
          <div className="bg-[#12122a] border border-white/10 rounded-2xl w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <h2 className="text-sm font-bold text-white">Save As New Preset</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs text-white/40">
                This will save the current {structures.length} structures and {biomes.length} biomes as a named preset.
              </p>
              <Field label="Preset Name">
                <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. Default World, Hard Mode, Test Map..."
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveAs(); }}
                  className="w-full px-3 py-2.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/80 placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-colors" />
              </Field>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/8">
              <button onClick={() => setShowSaveAs(false)} className="px-4 py-2 text-xs text-white/50 hover:text-white/70 transition-colors">Cancel</button>
              <button onClick={handleSaveAs} disabled={!saveName.trim()}
                className="px-4 py-2 text-xs font-medium bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/30 text-white rounded-lg transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRESETS PANEL
   ═══════════════════════════════════════════════════════════════ */

function PresetsPanel({ presets, activeId, renamingId, renameValue,
  onLoad, onDelete, onDuplicate, onStartRename, onRenameChange, onRenameConfirm, onRenameCancel,
  onResetDefaults, onSaveAs,
}: {
  presets: DefinitionPreset[]; activeId: string | null;
  renamingId: string | null; renameValue: string;
  onLoad: (id: string) => void; onDelete: (id: string) => void; onDuplicate: (id: string) => void;
  onStartRename: (id: string, name: string) => void; onRenameChange: (v: string) => void;
  onRenameConfirm: () => void; onRenameCancel: () => void;
  onResetDefaults: () => void; onSaveAs: () => void;
}) {
  if (presets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm text-white/40 mb-1">No saved presets yet</p>
          <p className="text-xs text-white/25">Save your current definitions to create your first preset.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSaveAs}
            className="px-4 py-2 text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors">
            Save Current As Preset
          </button>
          <button onClick={onResetDefaults}
            className="px-4 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 hover:text-white/70 transition-colors">
            Reset to Defaults
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-white/40">Click a preset to load it. The active preset is highlighted.</p>
        <div className="flex items-center gap-2">
          <button onClick={onSaveAs}
            className="px-3 py-1.5 text-[10px] font-medium bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 rounded-lg text-emerald-400 transition-colors">
            + Save Current As New
          </button>
          <button onClick={onResetDefaults}
            className="px-3 py-1.5 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/40 hover:text-white/60 transition-colors">
            Reset to Defaults
          </button>
        </div>
      </div>

      {presets.map((p) => {
        const isActive = p.id === activeId;
        const isRenaming = p.id === renamingId;

        return (
          <div key={p.id}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
              isActive
                ? 'bg-emerald-500/[0.06] border-emerald-500/25 shadow-lg shadow-emerald-500/5'
                : 'bg-white/[0.015] border-white/5 hover:border-white/10 hover:bg-white/[0.025]'
            }`}
            onClick={() => { if (!isRenaming) onLoad(p.id); }}>

            {/* Icon */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isActive ? 'bg-emerald-500/20' : 'bg-white/5'
            }`}>
              <svg className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {isRenaming ? (
                <input type="text" value={renameValue} onChange={(e) => onRenameChange(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') onRenameConfirm(); if (e.key === 'Escape') onRenameCancel(); }}
                  onBlur={onRenameConfirm}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1 text-sm font-semibold bg-white/5 border border-emerald-500/40 rounded-lg text-white outline-none" />
              ) : (
                <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-white/70'}`}>
                  {p.name}
                  {isActive && <span className="ml-2 text-[9px] font-bold text-emerald-400 uppercase">Active</span>}
                </h3>
              )}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-white/30">{p.structures.length} structures, {p.biomes.length} biomes</span>
                <span className="text-white/10">·</span>
                <span className="text-[10px] text-white/25">Created {fmtDate(p.createdAt)}</span>
                {p.updatedAt !== p.createdAt && (
                  <>
                    <span className="text-white/10">·</span>
                    <span className="text-[10px] text-white/25">Updated {fmtDate(p.updatedAt)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <ActionBtn title="Rename" color="amber" onClick={() => onStartRename(p.id, p.name)}><EditIcon /></ActionBtn>
              <ActionBtn title="Duplicate" color="blue" onClick={() => onDuplicate(p.id)}><DupIcon /></ActionBtn>
              <ActionBtn title="Delete" color="red" onClick={() => { if (confirm(`Delete preset "${p.name}"?`)) onDelete(p.id); }}><DelIcon /></ActionBtn>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STRUCTURES TABLE
   ═══════════════════════════════════════════════════════════════ */

function StructuresTable({ items, page, perPage, onEdit, onDuplicate, onDelete }: {
  items: StructureDef[]; page: number; perPage: number;
  onEdit: (id: string) => void; onDuplicate: (id: string) => void; onDelete: (id: string) => void;
}) {
  const paged = items.slice((page - 1) * perPage, page * perPage);

  if (items.length === 0) {
    return <Empty text="No structures found. Click + Add New to create one." />;
  }

  return (
    <table className="w-full border-collapse">
      <thead className="sticky top-0 bg-[#0b0b18] z-10">
        <tr className="border-b border-white/5">
          <Th width="w-10">#</Th>
          <Th>TITLE</Th>
          <Th>CATEGORY</Th>
          <Th width="w-24">SIZE (tiles)</Th>
          <Th width="w-16">COUNT</Th>
          <Th>BIOMES</Th>
          <Th width="w-16">FLOOR</Th>
          <Th width="w-16">LOOT</Th>
          <Th width="w-28" right>ACTIONS</Th>
        </tr>
      </thead>
      <tbody>
        {paged.map((s, i) => {
          const catInfo = STRUCTURE_CATEGORIES.find((c) => c.value === s.category);
          return (
            <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
              onClick={() => onEdit(s.id)}>
              <td className="px-4 py-3 text-white/20 text-xs font-mono">{(page - 1) * perPage + i + 1}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-400 shrink-0">
                    {s.label.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-white/80">{s.label}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge text={catInfo?.label ?? s.category} color={catInfo?.color ?? 'bg-gray-500/15 text-gray-400'} />
              </td>
              <td className="px-4 py-3">
                <span className="text-[10px] text-white/50 font-mono">{s.minW}-{s.maxW} x {s.minH}-{s.maxH}</span>
              </td>
              <td className="px-4 py-3 text-xs text-white/50 font-mono text-center">{s.count}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {s.biomes.map((b) => (
                    <Badge key={b} text={b} color={BIOME_BADGE_COLORS[b] ?? 'bg-white/10 text-white/40'} />
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge text={s.floorType} color={s.floorType === 'metal' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className={`w-1.5 h-3 rounded-sm ${j < s.lootCount ? 'bg-amber-400' : 'bg-white/10'}`} />
                  ))}
                  <span className="text-[9px] text-white/30 ml-1">{s.lootCount}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <ActionBtn title="Edit" color="amber" onClick={(e) => { e.stopPropagation(); onEdit(s.id); }}><EditIcon /></ActionBtn>
                  <ActionBtn title="Duplicate" color="blue" onClick={(e) => { e.stopPropagation(); onDuplicate(s.id); }}><DupIcon /></ActionBtn>
                  <ActionBtn title="Delete" color="red" onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${s.label}"?`)) onDelete(s.id); }}><DelIcon /></ActionBtn>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BIOMES TABLE
   ═══════════════════════════════════════════════════════════════ */

function BiomesTable({ items, page, perPage, onEdit, onDelete }: {
  items: BiomeDef[]; page: number; perPage: number;
  onEdit: (id: BiomeId) => void; onDelete: (id: BiomeId) => void;
}) {
  const paged = items.slice((page - 1) * perPage, page * perPage);

  if (items.length === 0) {
    return <Empty text="No biomes found." />;
  }

  return (
    <table className="w-full border-collapse">
      <thead className="sticky top-0 bg-[#0b0b18] z-10">
        <tr className="border-b border-white/5">
          <Th width="w-10">#</Th>
          <Th>NAME</Th>
          <Th width="w-20">ID</Th>
          <Th width="w-24">DEFAULT TILE</Th>
          <Th>TILE RULES</Th>
          <Th width="w-20">RULES #</Th>
          <Th width="w-28" right>ACTIONS</Th>
        </tr>
      </thead>
      <tbody>
        {paged.map((b, i) => (
          <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
            onClick={() => onEdit(b.id)}>
            <td className="px-4 py-3 text-white/20 text-xs font-mono">{(page - 1) * perPage + i + 1}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: b.color + '20', color: b.color }}>
                  {b.label.charAt(0)}
                </div>
                <span className="text-xs font-medium text-white/80">{b.label}</span>
              </div>
            </td>
            <td className="px-4 py-3">
              <Badge text={b.id} color={BIOME_BADGE_COLORS[b.id] ?? 'bg-white/10 text-white/40'} />
            </td>
            <td className="px-4 py-3 text-[10px] text-white/50 font-mono">{tileName(b.defaultTile)}</td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {b.tileRules.slice(0, 5).map((r, j) => (
                  <span key={j} className="px-1 py-0.5 text-[9px] bg-white/5 rounded text-white/50">
                    {tileName(r.tile)} {Math.round(r.chance * 100)}%
                  </span>
                ))}
                {b.tileRules.length > 5 && <span className="text-[9px] text-white/30">+{b.tileRules.length - 5}</span>}
              </div>
            </td>
            <td className="px-4 py-3 text-xs text-white/40 font-mono text-center">{b.tileRules.length}</td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <ActionBtn title="Edit" color="amber" onClick={(e) => { e.stopPropagation(); onEdit(b.id); }}><EditIcon /></ActionBtn>
                <ActionBtn title="Delete" color="red" onClick={(e) => { e.stopPropagation(); if (confirm(`Delete biome "${b.label}"?`)) onDelete(b.id); }}><DelIcon /></ActionBtn>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FULL-PAGE STRUCTURE EDITOR
   ═══════════════════════════════════════════════════════════════ */

function StructureEditor({ id, onBack }: { id: string; onBack: () => void }) {
  const s = useGameDefs((st) => st.structures.find((x) => x.id === id));
  const update = useGameDefs((st) => st.updateStructure);
  if (!s) return null;

  const set = (patch: Partial<StructureDef>) => update(id, patch);
  const toggleBiome = (b: BiomeId) => {
    const next = s.biomes.includes(b) ? s.biomes.filter((x) => x !== b) : [...s.biomes, b];
    set({ biomes: next });
  };

  const catInfo = STRUCTURE_CATEGORIES.find((c) => c.value === s.category);

  return (
    <div className="flex flex-col h-full bg-[#0b0b18] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/8">
        <button onClick={onBack}
          className="px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white/80 transition-colors flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="w-px h-6 bg-white/8" />
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-sm font-bold text-amber-400">
          {s.label.charAt(0)}
        </div>
        <div>
          <h1 className="text-base font-bold text-white">{s.label}</h1>
          <p className="text-[10px] text-white/40">{catInfo?.label ?? s.category} Structure</p>
        </div>
        <div className="flex-1" />
        <button onClick={onBack}
          className="px-4 py-2 text-xs font-medium bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors">
          Done
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto py-6 px-6 space-y-6">

          {/* Basic info */}
          <Section title="Basic Information" color="amber">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name">
                <Input value={s.label} onChange={(v) => set({ label: v })} />
              </Field>
              <Field label="Category">
                <select value={s.category} onChange={(e) => set({ category: e.target.value as StructureCategory })}
                  className="w-full px-3 py-2.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/80 outline-none focus:border-amber-500/40 transition-colors">
                  {STRUCTURE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* Spawn + Loot */}
          <Section title="Spawn & Loot" color="amber">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Spawn Count">
                <NumInput value={s.count} min={0} max={100} onChange={(v) => set({ count: v })} />
                <p className="text-[10px] text-white/20 mt-1">Max instances in world</p>
              </Field>
              <Field label="Loot Spots">
                <NumInput value={s.lootCount} min={0} max={20} onChange={(v) => set({ lootCount: v })} />
                <p className="text-[10px] text-white/20 mt-1">Searchable containers</p>
              </Field>
            </div>
          </Section>

          {/* Allowed biomes */}
          <Section title="Allowed Biomes" color="amber">
            <p className="text-[10px] text-white/30 mb-3">Select which biomes this structure can spawn in. At least one required.</p>
            <div className="grid grid-cols-3 gap-2">
              {ALL_BIOME_IDS.map((b) => {
                const active = s.biomes.includes(b);
                return (
                  <button key={b} onClick={() => toggleBiome(b)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all ${active ? `${BIOME_BADGE_COLORS[b]} border-current` : 'text-white/25 bg-white/[0.01] border-white/5 hover:border-white/10 hover:text-white/40'}`}>
                    <div className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center transition-colors ${active ? 'border-current bg-current/20' : 'border-white/20'}`}>
                      {active && <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </div>
                    <span className="text-xs font-medium capitalize">{b}</span>
                  </button>
                );
              })}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FULL-PAGE BIOME EDITOR
   ═══════════════════════════════════════════════════════════════ */

function BiomeEditor({ id, onBack }: { id: BiomeId; onBack: () => void }) {
  const b = useGameDefs((st) => st.biomes.find((x) => x.id === id));
  const update = useGameDefs((st) => st.updateBiome);
  if (!b) return null;

  const set = (patch: Partial<BiomeDef>) => update(id, patch);

  const updateRule = (idx: number, patch: Partial<TileRule>) => {
    const rules = b.tileRules.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    set({ tileRules: rules });
  };
  const addRule = () => {
    set({ tileRules: [...b.tileRules, { tile: TileType.GRASS, chance: 0.05, requiresNoAdj: false }] });
  };
  const removeRule = (idx: number) => {
    set({ tileRules: b.tileRules.filter((_, i) => i !== idx) });
  };

  const tileOptions = Object.entries(TILE_NAMES).map(([k, v]) => ({ v: k, l: v }));
  const totalChance = b.tileRules.reduce((s, r) => s + r.chance, 0);

  return (
    <div className="flex flex-col h-full bg-[#0b0b18] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/8">
        <button onClick={onBack}
          className="px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white/80 transition-colors flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="w-px h-6 bg-white/8" />
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: b.color + '20', color: b.color }}>
          {b.label.charAt(0)}
        </div>
        <div>
          <h1 className="text-base font-bold text-white">{b.label}</h1>
          <p className="text-[10px] text-white/40">Biome: {b.id}</p>
        </div>
        <div className="flex-1" />
        <button onClick={onBack}
          className="px-4 py-2 text-xs font-medium bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors">
          Done
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto py-6 px-6 space-y-6">

          {/* Basic info */}
          <Section title="Basic Information" color="cyan">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Display Name">
                <Input value={b.label} onChange={(v) => set({ label: v })} />
              </Field>
              <Field label="ID">
                <div className="w-full px-3 py-2.5 text-xs bg-white/[0.02] border border-white/5 rounded-lg text-white/40 font-mono">{b.id}</div>
              </Field>
              <Field label="Color">
                <div className="flex items-center gap-2">
                  <input type="color" value={b.color} onChange={(e) => set({ color: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                  <div>
                    <span className="text-xs text-white/50 font-mono block">{b.color}</span>
                    <span className="text-[10px] text-white/25">UI display color</span>
                  </div>
                </div>
              </Field>
            </div>
          </Section>

          {/* Default tile */}
          <Section title="Default Tile" color="cyan">
            <p className="text-[10px] text-white/30 mb-3">The fallback tile when no tile rule matches. Remaining chance: {Math.max(0, Math.round((1 - totalChance) * 100))}%</p>
            <div className="w-48">
              <select value={b.defaultTile} onChange={(e) => set({ defaultTile: parseInt(e.target.value) })}
                className="w-full px-3 py-2.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/80 outline-none focus:border-cyan-500/40 transition-colors">
                {tileOptions.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          </Section>

          {/* Tile rules */}
          <Section title="Tile Generation Rules" color="cyan"
            headerRight={
              <button onClick={addRule}
                className="px-3 py-1.5 text-[10px] font-semibold bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 rounded-lg transition-colors flex items-center gap-1">
                <span className="text-sm">+</span> Add Rule
              </button>
            }>
            <p className="text-[10px] text-white/30 mb-3">
              Rules are evaluated top-to-bottom. Each rule's chance is cumulative.
              Total assigned: <span className={totalChance > 1 ? 'text-red-400 font-bold' : 'text-cyan-400'}>{Math.round(totalChance * 100)}%</span>
            </p>

            {b.tileRules.length === 0 ? (
              <div className="flex items-center justify-center py-8 bg-white/[0.01] border border-dashed border-white/8 rounded-xl">
                <p className="text-xs text-white/20">No tile rules. Only the default tile will generate.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {b.tileRules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/8 transition-colors">
                    <span className="text-[10px] text-white/20 font-mono w-5 shrink-0">{idx + 1}</span>

                    <div className="flex-1">
                      <select value={rule.tile} onChange={(e) => updateRule(idx, { tile: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-xs bg-white/5 border border-white/8 rounded-lg text-white/70 outline-none focus:border-cyan-500/40 transition-colors">
                        {tileOptions.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <input type="number" value={Math.round(rule.chance * 100)} min={1} max={100} step={1}
                        onChange={(e) => updateRule(idx, { chance: Math.max(0.01, Math.min(1, (parseInt(e.target.value) || 1) / 100)) })}
                        className="w-14 px-2 py-2 text-xs bg-white/5 border border-white/8 rounded-lg text-white/70 outline-none font-mono text-center focus:border-cyan-500/40 transition-colors" />
                      <span className="text-[10px] text-white/30">%</span>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                      <input type="checkbox" checked={rule.requiresNoAdj} onChange={(e) => updateRule(idx, { requiresNoAdj: e.target.checked })}
                        className="rounded border-white/20 bg-white/5 text-cyan-500 w-3.5 h-3.5" />
                      <span className="text-[10px] text-white/40">No-adj</span>
                    </label>

                    <button onClick={() => removeRule(idx)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400/40 hover:text-red-400 flex items-center justify-center transition-colors shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ── Shared atoms ────────────────────────────────────────────── */

function Th({ children, width, right }: { children: React.ReactNode; width?: string; right?: boolean }) {
  return (
    <th className={`px-4 py-3 text-[10px] uppercase tracking-wider font-semibold text-white/30 whitespace-nowrap ${width ?? ''} ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center">
        <svg className="w-7 h-7 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-sm text-white/25">{text}</p>
    </div>
  );
}

function Section({ title, color, children, headerRight }: {
  title: string; color: string; children: React.ReactNode; headerRight?: React.ReactNode;
}) {
  const borderColor = color === 'amber' ? 'border-amber-500/20' : 'border-cyan-500/20';
  const textColor = color === 'amber' ? 'text-amber-400/60' : 'text-cyan-400/60';
  return (
    <div className={`bg-white/[0.015] border ${borderColor} rounded-2xl overflow-hidden`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <h3 className={`text-[11px] font-bold uppercase tracking-wider ${textColor}`}>{title}</h3>
        {headerRight}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-white/40 font-medium mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/80 placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors" />
  );
}

function NumInput({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <input type="number" value={value} min={min} max={max}
      onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
      className="w-full px-3 py-2.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/80 outline-none focus:border-indigo-500/50 font-mono transition-colors" />
  );
}
