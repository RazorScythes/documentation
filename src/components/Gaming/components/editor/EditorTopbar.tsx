import React, { useRef, useState } from 'react';
import { useEditorStore, type EditorSprite, type ObjectType } from '../../store/editorStore';
import { useGameDefs } from '../../data/gameDefinitions';
import { updateDefinition } from '../../api/mapEditorApi';

const STORAGE_KEY = 'editor_layout';

interface Props {
  onExit: () => void;
  definitionId?: string;
}

export default function EditorTopbar({ onExit, definitionId }: Props) {
  const objects = useEditorStore((s) => s.objects);
  const loadLayout = useEditorStore((s) => s.loadLayout);
  const clearAll = useEditorStore((s) => s.clearAll);
  const showGrid = useEditorStore((s) => s.showGrid);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);
  const snapToGrid = useEditorStore((s) => s.snapToGrid);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);
  const gridSize = useEditorStore((s) => s.gridSize);
  const setGridSize = useEditorStore((s) => s.setGridSize);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const placementType = useEditorStore((s) => s.placementType);
  const setPlacementType = useEditorStore((s) => s.setPlacementType);
  const filterType = useEditorStore((s) => s.filterType);
  const setFilterType = useEditorStore((s) => s.setFilterType);
  
  const fileRef = useRef<HTMLInputElement>(null);
  const [backendSaving, setBackendSaving] = useState(false);

  const structures = useGameDefs((s) => s.structures);
  const biomes = useGameDefs((s) => s.biomes);
  const loadDefs = useGameDefs((s) => s.loadDefs);
  const activePresetId = useGameDefs((s) => s.activePresetId);
  const presets = useGameDefs((s) => s.presets);
  const activePreset = presets.find((p) => p.id === activePresetId);

  const saveToBackend = async () => {
    if (!definitionId) return;
    setBackendSaving(true);
    try {
      await updateDefinition(definitionId, {
        data: { structures, biomes, editorObjects: objects },
      });
      alert('Saved to server');
    } catch (err) {
      alert('Failed to save: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
    setBackendSaving(false);
  };

  const saveToLocal = () => {
    const data = { version: 5, objects, gameDefs: { structures, biomes } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    alert(`Saved ${objects.length} objects + ${structures.length} structures + ${biomes.length} biomes`);
  };

  const handleSave = () => {
    if (definitionId) {
      saveToBackend();
    } else {
      saveToLocal();
    }
  };

  const loadFromLocal = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { alert('No saved layout found'); return; }
    try {
      const parsed = JSON.parse(raw);
      const objs: EditorSprite[] = parsed.objects ?? parsed;
      loadLayout(objs);
      if (parsed.gameDefs) {
        loadDefs(parsed.gameDefs.structures ?? structures, parsed.gameDefs.biomes ?? biomes);
      }
    } catch { alert('Failed to parse saved layout'); }
  };

  const exportJSON = () => {
    const data = { version: 5, objects, gameDefs: { structures, biomes }, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `editor-layout-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const objs: EditorSprite[] = parsed.objects ?? parsed;
        loadLayout(objs);
        if (parsed.gameDefs) {
          loadDefs(parsed.gameDefs.structures ?? structures, parsed.gameDefs.biomes ?? biomes);
        }
      } catch { alert('Invalid JSON file'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const typeBtn = (type: ObjectType, label: string, activeColor: string) => (
    <button
      onClick={() => setPlacementType(type)}
      className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-all border ${
        placementType === type
          ? `${activeColor} border-current`
          : 'text-white/40 bg-white/5 border-white/10 hover:text-white/60'
      }`}
    >
      {label}
    </button>
  );

  const filterBtn = (type: 'all' | ObjectType, label: string) => (
    <button
      onClick={() => setFilterType(type)}
      className={`px-1.5 py-0.5 text-[9px] rounded transition-all ${
        filterType === type
          ? 'bg-white/15 text-white/80'
          : 'text-white/30 hover:text-white/50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center h-10 px-3 gap-2 bg-[#0d0d14] border-b border-white/10">
      <button onClick={onExit}
        className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white/60 hover:text-white/80 transition-colors"
        title={definitionId ? 'Back to definitions list' : 'Back to game'}>
        ← {definitionId ? 'Back' : 'Exit'}
      </button>

      <div className="w-px h-5 bg-white/10" />
      <span className="text-xs font-bold text-amber-400/80 tracking-wider">MAP EDITOR</span>
      <div className="w-px h-5 bg-white/10" />

      <div className="flex items-center gap-1">
        <span className="text-[9px] text-white/30">Place:</span>
        {typeBtn('structure', 'Structure', 'bg-amber-500/20 text-amber-400')}
        {typeBtn('biome', 'Biome', 'bg-cyan-500/20 text-cyan-400')}
      </div>

      <div className="w-px h-5 bg-white/10" />

      <div className="flex items-center gap-0.5">
        <span className="text-[9px] text-white/30">Show:</span>
        {filterBtn('all', 'All')}
        {filterBtn('structure', 'STR')}
        {filterBtn('biome', 'BIO')}
      </div>

      <div className="w-px h-5 bg-white/10" />

      <div className="flex items-center gap-1">
        <button onClick={handleSave} disabled={backendSaving}
          className={`editor-btn ${definitionId ? 'font-semibold text-emerald-400 bg-emerald-500/15 border-emerald-500/30' : ''}`}
          title={definitionId ? 'Save to server' : 'Save to browser storage'}>
          {backendSaving ? 'Saving...' : 'Save'}
        </button>
        {!definitionId && (
          <button onClick={loadFromLocal} className="editor-btn" title="Load from browser storage">Load</button>
        )}
        <button onClick={exportJSON} className="editor-btn" title="Export as JSON file">Export</button>
        <button onClick={() => fileRef.current?.click()} className="editor-btn" title="Import JSON file">Import</button>
        <input ref={fileRef} type="file" accept=".json" onChange={importJSON} className="hidden" />
      </div>

      <div className="w-px h-5 bg-white/10" />

      <div className="flex items-center gap-1">
        <button onClick={toggleGrid}
          className={`editor-btn ${showGrid ? 'text-white/80' : ''}`} title="Toggle grid">
          Grid
        </button>
        <button onClick={toggleSnap}
          className={`editor-btn font-semibold ${snapToGrid ? 'text-amber-400 bg-amber-500/15 border-amber-500/30' : ''}`}
          title="Snap to grid (toggle)">
          Snap
        </button>
        <select value={gridSize} onChange={(e) => setGridSize(parseInt(e.target.value))}
          className="px-1 py-0.5 text-[10px] bg-white/5 border border-white/10 rounded text-white/60 outline-none">
          <option value={16}>16</option>
          <option value={32}>32</option>
          <option value={64}>64</option>
          <option value={128}>128</option>
        </select>
      </div>

      <div className="w-px h-5 bg-white/10" />

      <div className="flex items-center gap-1">
        <button onClick={() => setZoom(zoom - 0.25)} className="editor-btn w-5 text-center">−</button>
        <span className="text-[10px] text-white/60 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(zoom + 0.25)} className="editor-btn w-5 text-center">+</button>
        <button onClick={() => setZoom(1)} className="editor-btn">1:1</button>
      </div>

      <div className="flex-1" />

      <button onClick={() => { if (objects.length === 0 || confirm('Clear all objects?')) clearAll(); }}
        className="px-2 py-1 text-[10px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-400/60 hover:text-red-400 transition-colors">
        Clear
      </button>
      <span className="text-[10px] text-white/30">{objects.length} obj</span>
    </div>
  );
}
