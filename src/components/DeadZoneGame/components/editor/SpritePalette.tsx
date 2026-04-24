import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { SPRITES } from '../../engine/SpriteAtlas';
import type { SpriteAsset, SpriteFolder } from '../../api/mapEditorApi';

const CATEGORY_COLORS: Record<string, string> = {
  player: '#3b82f6', zombie: '#ef4444', terrain: '#22c55e', tree: '#16a34a',
  bush: '#4ade80', flower: '#f472b6', hedge: '#86efac', log: '#a3e635',
  ground: '#84cc16', aloe: '#34d399', item: '#f59e0b', house: '#a78bfa',
  deco: '#f97316', vehicle: '#06b6d4', nature: '#10b981',
};

interface Props {
  onDragStart: (sprite: string) => void;
  userSprites?: SpriteAsset[];
  userFolders?: SpriteFolder[];
}

export default function SpritePalette({ onDragStart, userSprites = [], userFolders = [] }: Props) {
  const sprites = useMemo(() => Object.keys(SPRITES), []);
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const placementType = useEditorStore((s) => s.placementType);

  const grouped = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const key of sprites) {
      const idx = key.indexOf('_');
      const folder = idx > 0 ? key.slice(0, idx) : 'other';
      if (!map[folder]) map[folder] = [];
      map[folder].push(key);
    }
    return map;
  }, [sprites]);

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    const out: Record<string, string[]> = {};
    for (const [folder, items] of Object.entries(grouped)) {
      const match = items.filter((s) => s.toLowerCase().includes(q));
      if (match.length) out[folder] = match;
    }
    return out;
  }, [grouped, search]);

  const isStructure = placementType === 'structure';

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-white/10">
        <h2 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
          Sprite Palette
        </h2>
        <div className={`text-[9px] font-semibold px-1.5 py-0.5 rounded inline-block mb-2 ${
          isStructure ? 'bg-amber-500/15 text-amber-400' : 'bg-cyan-500/15 text-cyan-400'
        }`}>
          Placing as: {placementType}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sprites..."
          className="w-full px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white/80 placeholder:text-white/30 outline-none focus:border-white/25"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {/* ─── user-uploaded sprites ─── */}
        {(() => {
          if (!userSprites.length) return null;
          const q = search.trim().toLowerCase();
          const filteredUser = q ? userSprites.filter(s => s.name.toLowerCase().includes(q)) : userSprites;
          if (!filteredUser.length) return null;
          const byFolder = new Map<string, SpriteAsset[]>();
          for (const s of filteredUser) {
            const key = s.folder || '__uncategorized__';
            if (!byFolder.has(key)) byFolder.set(key, []);
            byFolder.get(key)!.push(s);
          }
          return Array.from(byFolder.entries()).map(([folderId, items]) => {
            const folderDef = userFolders.find(f => f.id === folderId);
            const label = folderDef?.name ?? 'Uploaded';
            const color = folderDef?.color ?? '#8b5cf6';
            return (
              <div key={`user_${folderId}`} className="mb-2">
                <button
                  onClick={() => setCollapsed(c => ({ ...c, [`user_${folderId}`]: !c[`user_${folderId}`] }))}
                  className="flex items-center gap-1 w-full text-left px-1 py-1 text-[10px] font-semibold uppercase tracking-wider hover:text-purple-400"
                  style={{ color: color + 'cc' }}
                >
                  <span className="text-[8px]">{collapsed[`user_${folderId}`] ? '▶' : '▼'}</span>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  {label}
                  <span className="text-white/30 ml-auto">{items.length}</span>
                </button>
                {!collapsed[`user_${folderId}`] && (
                  <div className="grid grid-cols-3 gap-1 px-1">
                    {items.map(spr => (
                      <div
                        key={spr.id}
                        draggable
                        onDragStart={ev => {
                          ev.dataTransfer.setData('sprite', spr.url);
                          ev.dataTransfer.setData('objectType', placementType);
                          onDragStart(spr.url);
                        }}
                        className={`group relative border rounded p-1 cursor-grab active:cursor-grabbing transition-all ${
                          isStructure
                            ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-500/30'
                            : 'bg-cyan-500/5 hover:bg-cyan-500/10 border-cyan-500/10 hover:border-cyan-500/30'
                        }`}
                        title={`${spr.name} (${placementType})`}
                      >
                        <img src={spr.url} alt={spr.name} className="w-full h-10 object-contain" draggable={false} />
                        <div className="text-[7px] text-white/40 text-center truncate mt-0.5 group-hover:text-white/60">
                          {spr.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          });
        })()}

        {userSprites.length > 0 && Object.keys(filtered).length > 0 && (
          <div className="border-t border-white/5 my-2 mx-1" />
        )}

        {/* ─── built-in sprites ─── */}
        {Object.entries(filtered).map(([folder, items]) => (
          <div key={folder} className="mb-2">
            <button
              onClick={() => setCollapsed((c) => ({ ...c, [folder]: !c[folder] }))}
              className="flex items-center gap-1 w-full text-left px-1 py-1 text-[10px] font-semibold text-amber-400/70 uppercase tracking-wider hover:text-amber-400"
            >
              <span className="text-[8px]">{collapsed[folder] ? '▶' : '▼'}</span>
              {folder}
              <span className="text-white/30 ml-auto">{items.length}</span>
            </button>
            {!collapsed[folder] && (
              <div className="grid grid-cols-3 gap-1 px-1">
                {items.map((sprite) => (
                  <div
                    key={sprite}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('sprite', sprite);
                      e.dataTransfer.setData('objectType', placementType);
                      onDragStart(sprite);
                    }}
                    className={`group relative border rounded p-1 cursor-grab active:cursor-grabbing transition-all ${
                      isStructure
                        ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-500/30'
                        : 'bg-cyan-500/5 hover:bg-cyan-500/10 border-cyan-500/10 hover:border-cyan-500/30'
                    }`}
                    title={`${sprite} (${placementType})`}
                  >
                    <SpriteThumb spriteKey={sprite} />
                    <div className="text-[7px] text-white/40 text-center truncate mt-0.5 group-hover:text-white/60">
                      {sprite.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {Object.keys(filtered).length === 0 && (
          <p className="text-xs text-white/30 text-center py-8">No sprites found</p>
        )}
      </div>
    </div>
  );
}

function SpriteThumb({ spriteKey }: { spriteKey: string }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  const src = SPRITES[spriteKey];
  const prefix = spriteKey.indexOf('_') > 0 ? spriteKey.slice(0, spriteKey.indexOf('_')) : spriteKey;
  const color = CATEGORY_COLORS[prefix] ?? '#6b7280';

  useEffect(() => { setFailed(false); }, [src]);

  if (failed || !src) {
    return (
      <div className="w-full h-10 rounded flex items-center justify-center" style={{ backgroundColor: color + '30', border: `1px solid ${color}50` }}>
        <span className="text-[8px] font-bold uppercase" style={{ color }}>{prefix}</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={spriteKey}
      className="w-full h-10 object-contain"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
