import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore, DEFAULT_STRUCTURE_DATA, DEFAULT_BIOME_DATA, type ObjectType, type StructureData, type BiomeData } from '../../store/editorStore';

function Field({ label, value, onChange, min, max, step }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
}) {
  const [local, setLocal] = useState(String(Math.round(value * 100) / 100));
  const [focused, setFocused] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (!focused && value !== prevValue.current) {
      setLocal(String(Math.round(value * 100) / 100));
    }
    prevValue.current = value;
  }, [value, focused]);

  const commit = () => {
    const parsed = parseFloat(local);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else {
      setLocal(String(Math.round(value * 100) / 100));
    }
  };

  return (
    <label className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-white/50 uppercase tracking-wider w-20 shrink-0">{label}</span>
      <input type="number" value={local}
        onChange={(e) => { setLocal(e.target.value); }}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); commit(); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { commit(); (e.target as HTMLInputElement).blur(); } e.stopPropagation(); }}
        min={min} max={max} step={step ?? 1}
        className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white/80 outline-none focus:border-amber-500/40 w-0" />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-white/50 uppercase tracking-wider w-20 shrink-0">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white/80 outline-none focus:border-amber-500/40 w-0">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 cursor-pointer">
      <span className="text-[10px] text-white/50 uppercase tracking-wider w-20 shrink-0">{label}</span>
      <button onClick={() => onChange(!value)}
        className={`w-8 h-4 rounded-full relative transition-colors ${value ? 'bg-amber-500/50' : 'bg-white/10'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${value ? 'left-4 bg-amber-400' : 'left-0.5 bg-white/40'}`} />
      </button>
    </label>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [local, setLocal] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setLocal(value);
  }, [value, focused]);

  return (
    <label className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-white/50 uppercase tracking-wider w-20 shrink-0">{label}</span>
      <input type="text" value={local}
        onChange={(e) => { setLocal(e.target.value); onChange(e.target.value); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => e.stopPropagation()}
        className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white/80 outline-none focus:border-amber-500/40 w-0" />
    </label>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className={`text-[10px] uppercase tracking-wider font-semibold`} style={{ color }}>{title}</p>
      {children}
    </div>
  );
}

const WALL_TYPES = [
  { value: 'wood', label: 'Wood' }, { value: 'stone', label: 'Stone' },
  { value: 'metal', label: 'Metal' }, { value: 'brick', label: 'Brick' },
];
const FLOOR_TYPES = [
  { value: 'wood', label: 'Wood' }, { value: 'tile', label: 'Tile' },
  { value: 'concrete', label: 'Concrete' }, { value: 'metal', label: 'Metal' },
];
const BIOME_TYPES = [
  { value: 'forest', label: 'Forest' }, { value: 'desert', label: 'Desert' },
  { value: 'swamp', label: 'Swamp' }, { value: 'urban', label: 'Urban' },
  { value: 'military', label: 'Military' }, { value: 'farmland', label: 'Farmland' },
  { value: 'junkyard', label: 'Junkyard' }, { value: 'chemical', label: 'Chemical' },
];

export default function InspectorPanel() {
  const selectedId = useEditorStore((s) => s.selectedId);
  const objects = useEditorStore((s) => s.objects);
  const updateObject = useEditorStore((s) => s.updateObject);
  const removeObject = useEditorStore((s) => s.removeObject);
  const bringToFront = useEditorStore((s) => s.bringToFront);
  const sendToBack = useEditorStore((s) => s.sendToBack);
  const duplicateObject = useEditorStore((s) => s.duplicateObject);

  const selected = selectedId ? objects.find((o) => o.id === selectedId) : null;

  const structureCount = objects.filter((o) => o.objectType === 'structure').length;
  const biomeCount = objects.filter((o) => o.objectType === 'biome').length;

  if (!selected) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-3 py-2 border-b border-white/10">
          <h2 className="text-xs font-bold text-white/60 uppercase tracking-wider">Inspector</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-white/20 text-center px-4">
            Select a sprite on the canvas to inspect its properties
          </p>
        </div>
        <div className="px-3 py-2 border-t border-white/10 space-y-0.5">
          <p className="text-[10px] text-white/20">Total: {objects.length}</p>
          <p className="text-[10px] text-amber-400/40">Structures: {structureCount}</p>
          <p className="text-[10px] text-cyan-400/40">Biomes: {biomeCount}</p>
        </div>
      </div>
    );
  }

  const u = (patch: Record<string, unknown>) => updateObject(selected.id, patch);

  const updateStructure = (patch: Partial<StructureData>) => {
    const data = { ...(selected.structureData ?? DEFAULT_STRUCTURE_DATA), ...patch };
    updateObject(selected.id, { structureData: data });
  };

  const updateBiome = (patch: Partial<BiomeData>) => {
    const data = { ...(selected.biomeData ?? DEFAULT_BIOME_DATA), ...patch };
    updateObject(selected.id, { biomeData: data });
  };

  const switchType = (newType: ObjectType) => {
    const patch: Record<string, unknown> = { objectType: newType };
    if (newType === 'structure') {
      patch.structureData = { ...DEFAULT_STRUCTURE_DATA };
      patch.biomeData = undefined;
    } else {
      patch.biomeData = { ...DEFAULT_BIOME_DATA };
      patch.structureData = undefined;
    }
    updateObject(selected.id, patch);
  };

  const isStructure = selected.objectType === 'structure';
  const accentColor = isStructure ? 'rgba(245,158,11,0.6)' : 'rgba(34,211,238,0.6)';

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-white/10">
        <h2 className="text-xs font-bold text-white/60 uppercase tracking-wider">Inspector</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* Preview + Type */}
        <div className="bg-white/5 rounded p-2">
          <div className="flex items-center gap-2 mb-2">
            <img src={`/sprites/${selected.sprite}`} alt={selected.sprite}
              className="w-10 h-10 object-contain bg-black/30 rounded" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/70 truncate">{selected.sprite}</p>
              <p className="text-[8px] text-white/30 font-mono">ID: {selected.id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <button onClick={() => switchType('structure')}
              className={`px-2 py-1 text-[10px] rounded font-semibold transition-all ${isStructure ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-white/40 border border-white/5 hover:border-white/15'}`}>
              Structure
            </button>
            <button onClick={() => switchType('biome')}
              className={`px-2 py-1 text-[10px] rounded font-semibold transition-all ${!isStructure ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-white/40 border border-white/5 hover:border-white/15'}`}>
              Biome
            </button>
          </div>
        </div>

        {/* Label */}
        <Section title="Label" color={accentColor}>
          <TextField label="Name" value={selected.label} onChange={(v) => u({ label: v })} />
        </Section>

        {/* Position */}
        <Section title="Position" color={accentColor}>
          <Field label="X" value={selected.x} onChange={(v) => u({ x: v })} />
          <Field label="Y" value={selected.y} onChange={(v) => u({ y: v })} />
        </Section>

        {/* Size */}
        <Section title="Size" color={accentColor}>
          <Field label="Width" value={selected.width} onChange={(v) => u({ width: Math.max(8, v) })} min={8} />
          <Field label="Height" value={selected.height} onChange={(v) => u({ height: Math.max(8, v) })} min={8} />
          <Field label="Rotation" value={selected.rotation} onChange={(v) => u({ rotation: ((v % 360) + 360) % 360 })} min={0} max={360} />
          <div className="grid grid-cols-4 gap-1">
            <button onClick={() => u({ rotation: ((selected.rotation - 90) + 360) % 360 })}
              className="px-1 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white/60 hover:text-white/80 transition-colors" title="Rotate 90° CCW">
              ↺ 90°
            </button>
            <button onClick={() => u({ rotation: (selected.rotation + 90) % 360 })}
              className="px-1 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white/60 hover:text-white/80 transition-colors" title="Rotate 90° CW">
              ↻ 90°
            </button>
            <button onClick={() => u({ rotation: (selected.rotation + 45) % 360 })}
              className="px-1 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white/60 hover:text-white/80 transition-colors" title="Rotate 45° CW">
              ↻ 45°
            </button>
            <button onClick={() => u({ rotation: 0 })}
              className="px-1 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white/60 hover:text-white/80 transition-colors" title="Reset rotation">
              Reset
            </button>
          </div>
        </Section>

        {/* Common Properties */}
        <Section title="Properties" color={accentColor}>
          <Field label="Spawn %" value={selected.spawnRate} onChange={(v) => u({ spawnRate: Math.max(0, Math.min(100, v)) })} min={0} max={100} />
          <Field label="Z-Index" value={selected.zIndex} onChange={(v) => u({ zIndex: v })} />
        </Section>

        {/* Structure-specific */}
        {isStructure && selected.structureData && (
          <Section title="Structure Config" color="rgba(245,158,11,0.6)">
            <SelectField label="Walls" value={selected.structureData.wallType} options={WALL_TYPES}
              onChange={(v) => updateStructure({ wallType: v as StructureData['wallType'] })} />
            <SelectField label="Floor" value={selected.structureData.floorType} options={FLOOR_TYPES}
              onChange={(v) => updateStructure({ floorType: v as StructureData['floorType'] })} />
            <Toggle label="Door" value={selected.structureData.hasDoor}
              onChange={(v) => updateStructure({ hasDoor: v })} />
            <Toggle label="Windows" value={selected.structureData.hasWindows}
              onChange={(v) => updateStructure({ hasWindows: v })} />
            <Field label="Rooms" value={selected.structureData.roomCount}
              onChange={(v) => updateStructure({ roomCount: Math.max(1, Math.round(v)) })} min={1} max={10} />
            <Toggle label="Breakable" value={selected.structureData.destructible}
              onChange={(v) => updateStructure({ destructible: v })} />
            <Field label="Loot Tier" value={selected.structureData.lootTier}
              onChange={(v) => updateStructure({ lootTier: Math.max(0, Math.min(5, Math.round(v))) })} min={0} max={5} />
          </Section>
        )}

        {/* Biome-specific */}
        {!isStructure && selected.biomeData && (
          <Section title="Biome Config" color="rgba(34,211,238,0.6)">
            <SelectField label="Type" value={selected.biomeData.biomeType} options={BIOME_TYPES}
              onChange={(v) => updateBiome({ biomeType: v as BiomeData['biomeType'] })} />
            <Field label="Density" value={selected.biomeData.density}
              onChange={(v) => updateBiome({ density: Math.max(0, Math.min(100, v)) })} min={0} max={100} />
            <Field label="Moisture" value={selected.biomeData.moisture}
              onChange={(v) => updateBiome({ moisture: Math.max(0, Math.min(100, v)) })} min={0} max={100} />
            <Field label="Danger" value={selected.biomeData.dangerLevel}
              onChange={(v) => updateBiome({ dangerLevel: Math.max(0, Math.min(10, Math.round(v))) })} min={0} max={10} />
            <Field label="Vegetation" value={selected.biomeData.vegetationDensity}
              onChange={(v) => updateBiome({ vegetationDensity: Math.max(0, Math.min(100, v)) })} min={0} max={100} />
            <Toggle label="Zombies" value={selected.biomeData.canSpawnZombies}
              onChange={(v) => updateBiome({ canSpawnZombies: v })} />
            <TextField label="Ambient" value={selected.biomeData.ambientSound}
              onChange={(v) => updateBiome({ ambientSound: v })} />
          </Section>
        )}

        {/* Layer */}
        <Section title="Layer" color={accentColor}>
          <div className="grid grid-cols-2 gap-1">
            <button onClick={() => bringToFront(selected.id)}
              className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white/60 hover:text-white/80 transition-colors">
              Bring Front
            </button>
            <button onClick={() => sendToBack(selected.id)}
              className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white/60 hover:text-white/80 transition-colors">
              Send Back
            </button>
          </div>
        </Section>

        {/* Actions */}
        <Section title="Actions" color={accentColor}>
          <button onClick={() => duplicateObject(selected.id)}
            className="w-full px-2 py-1.5 text-[10px] bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded text-blue-400/80 hover:text-blue-400 transition-colors">
            Duplicate (Ctrl+D)
          </button>
          <button onClick={() => removeObject(selected.id)}
            className="w-full px-2 py-1.5 text-[10px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-400/80 hover:text-red-400 transition-colors">
            Delete (Del)
          </button>
        </Section>
      </div>

      <div className="px-3 py-2 border-t border-white/10 space-y-0.5">
        <p className="text-[10px] text-white/20">Total: {objects.length}</p>
        <p className="text-[10px] text-amber-400/40">Structures: {structureCount}</p>
        <p className="text-[10px] text-cyan-400/40">Biomes: {biomeCount}</p>
      </div>
    </div>
  );
}
