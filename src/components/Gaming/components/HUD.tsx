import React, { useState } from 'react';
import { useGameStore, getCurrentWeight } from '../store/gameStore';
import { ITEM_DEFS } from '../engine/itemDefs';
import type { ArmorSlot } from '../engine/types';
import Minimap from './Minimap';

function StatBar({ value, max, color, icon, warn }: {
  value: number; max: number; color: string; icon: string; warn?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const isLow = pct < 25;
  const isCritical = pct < 10;

  return (
    <div className="group relative flex items-center gap-1.5 h-5">
      <span className="text-[11px] w-4 text-center opacity-70">{icon}</span>
      <div className="flex-1 h-[5px] rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${isCritical ? 'animate-pulse' : ''}`}
          style={{
            width: `${pct}%`,
            background: isLow
              ? `linear-gradient(90deg, ${color}, #cc3333)`
              : color,
            boxShadow: isLow ? `0 0 8px ${color}44` : 'none',
          }}
        />
      </div>
      <span className={`text-[9px] w-10 text-right font-mono tabular-nums
        ${isCritical ? 'text-red-400 animate-pulse' : isLow ? 'text-amber-400/70' : 'text-white/25'}`}>
        {Math.ceil(value)}
      </span>
      {warn && isLow && (
        <div className="hidden group-hover:block absolute left-0 -bottom-7 z-50
          px-2 py-1 rounded text-[9px] text-red-200 whitespace-nowrap border border-red-800/30"
          style={{ background: 'rgba(60,10,10,0.9)' }}>
          {warn}
        </div>
      )}
    </div>
  );
}

function ItemTooltip({ defId, x, y }: { defId: string; x: number; y: number }) {
  const def = ITEM_DEFS[defId];
  if (!def) return null;

  return (
    <div className="fixed z-[100] pointer-events-none" style={{ left: x + 14, top: y - 8, maxWidth: 240 }}>
      <div className="hud-panel rounded-md px-2.5 py-2"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        <div className="flex items-center gap-1.5">
          <span className="text-base">{def.icon}</span>
          <span className="text-white/90 font-semibold text-[11px]">{def.name}</span>
        </div>
        <div className="text-white/30 text-[9px] mt-0.5 leading-relaxed">{def.description}</div>
      </div>
    </div>
  );
}

export default function HUD() {
  const player = useGameStore(s => s.player);
  const inventory = useGameStore(s => s.inventory);
  const maxWeight = useGameStore(s => s.maxWeight);
  const equippedSlot = useGameStore(s => s.equippedSlot);
  const timeOfDay = useGameStore(s => s.timeOfDay);
  const dayCount = useGameStore(s => s.dayCount);
  const nearbyLootSpot = useGameStore(s => s.nearbyLootSpot);
  const notification = useGameStore(s => s.notification);
  const notificationTimer = useGameStore(s => s.notificationTimer);
  const zombies = useGameStore(s => s.zombies);
  const quickUseSlots = useGameStore(s => s.quickUseSlots);

  const [hoveredSlot, setHoveredSlot] = useState<{ defId: string; x: number; y: number } | null>(null);

  const weight = getCurrentWeight(inventory);
  const equipped = inventory.find(i => i.slotIndex === equippedSlot);
  const equippedDef = equipped ? ITEM_DEFS[equipped.defId] : null;
  const ammoCount = equippedDef?.ammoType
    ? inventory.filter(i => i.defId === equippedDef.ammoType).reduce((s, i) => s + i.quantity, 0)
    : null;

  const timeStr = (() => {
    const hours = Math.floor(timeOfDay * 24);
    const mins = Math.floor((timeOfDay * 24 - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  })();

  const isNight = timeOfDay > 0.75 || timeOfDay < 0.2;
  const aliveZombies = zombies.filter(z => z.state !== 'dead').length;

  const totalDefense = (['head', 'body', 'legs'] as ArmorSlot[]).reduce((sum, s) => {
    const id = player.equipment[s];
    const d = id ? ITEM_DEFS[id] : null;
    return sum + (d?.defense || 0);
  }, 0);

  return (
    <>
      {/* ─── Top-left: Vitals ─── */}
      <div className="absolute top-4 left-4 w-48 hud-panel rounded-lg p-3"
        style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
        <StatBar value={player.health} max={player.maxHealth} color="var(--stat-hp)" icon="+"
          warn="Low health! Use medicine" />
        <StatBar value={player.stamina} max={player.maxStamina} color="var(--stat-sta)" icon="~"
          warn="Stop running to recover" />
        <StatBar value={player.hunger} max={player.maxHunger} color="var(--stat-food)" icon="="
          warn="Eat food! Press I" />
        <StatBar value={player.thirst} max={player.maxThirst} color="var(--stat-water)" icon="o"
          warn="Drink water! Press I" />

        {player.bleeding && (
          <div className="text-red-500/80 text-[10px] mt-1 animate-pulse font-bold tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> BLEEDING
          </div>
        )}
        {totalDefense > 0 && (
          <div className="text-cyan-400/50 text-[9px] mt-0.5 font-mono">
            DEF {totalDefense}
          </div>
        )}
      </div>

      {/* ─── Top-right: Time + Minimap ─── */}
      <div className="absolute top-4 right-4 hud-panel rounded-lg overflow-hidden"
        style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
        <div className="px-4 py-2.5 flex items-center gap-4">
          <div>
            <div className="text-white/80 text-sm font-mono tabular-nums tracking-wider">{timeStr}</div>
            <div className="text-white/20 text-[9px] font-mono">DAY {dayCount}</div>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <div className={`text-[9px] font-mono tracking-wider ${isNight ? 'text-indigo-300/40' : 'text-amber-300/40'}`}>
              {isNight ? 'NIGHT' : 'DAY'}
            </div>
            {aliveZombies > 0 && (
              <div className="text-red-400/40 text-[9px] font-mono">
                {aliveZombies} HOSTILE
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-white/[0.03]">
          <Minimap />
        </div>
      </div>

      {/* ─── Bottom-left: Equipped weapon ─── */}
      <div className="absolute bottom-20 left-4 hud-panel rounded-lg px-3 py-2.5 max-w-[170px]"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <div className="text-white/60 text-sm flex items-center gap-1.5">
          {equippedDef ? (
            <>
              <span className="text-base">{equippedDef.icon}</span>
              <span className="truncate text-[11px] font-medium">{equippedDef.name}</span>
            </>
          ) : (
            <span className="text-white/25 text-[11px]">Fists</span>
          )}
        </div>
        {equippedDef && (
          <div className="text-white/15 text-[8px] mt-0.5 font-mono">
            {equippedDef.ammoType ? 'LMB SHOOT · R RELOAD' : equippedDef.type === 'weapon' ? 'LMB SWING' : ''}
          </div>
        )}
        {ammoCount !== null && (
          <div className={`text-[10px] mt-1 font-mono tabular-nums ${ammoCount === 0 ? 'text-red-400/80 animate-pulse' : 'text-amber-400/40'}`}>
            {ammoCount === 0 ? 'NO AMMO' : `AMMO ${ammoCount}`}
          </div>
        )}
        {player.isReloading && (
          <div className="text-cyan-300/50 text-[9px] animate-pulse font-mono">RELOADING...</div>
        )}
      </div>

      {/* ─── Bottom center: Hotbar ─── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
        {/* Main hotbar */}
        <div className="flex gap-1 p-1 hud-panel rounded-lg"
          style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const item = inventory.find(it => it.slotIndex === i);
            const def = item ? ITEM_DEFS[item.defId] : null;
            const active = i === equippedSlot;
            return (
              <button
                key={i}
                onClick={() => useGameStore.setState({ equippedSlot: i })}
                onMouseEnter={(e) => def && setHoveredSlot({ defId: def.id, x: e.clientX, y: e.clientY })}
                onMouseMove={(e) => def && setHoveredSlot({ defId: def.id, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHoveredSlot(null)}
                className={`w-11 h-11 rounded-md flex items-center justify-center relative transition-all cursor-pointer
                  ${active
                    ? 'bg-white/[0.08] ring-1 ring-inset'
                    : 'bg-transparent hover:bg-white/[0.03]'
                  }`}
                style={active ? {
                  boxShadow: '0 0 12px rgba(200,160,80,0.08), inset 0 0 0 1px rgba(200,160,80,0.3)',
                } : undefined}
              >
                {def && (
                  <>
                    <span className={`text-lg leading-none ${active ? '' : 'opacity-60'}`}>{def.icon}</span>
                    {item && item.quantity > 1 && (
                      <span className="absolute top-0.5 right-1 text-white/30 text-[8px] font-mono">
                        {item.quantity}
                      </span>
                    )}
                  </>
                )}
                <span className={`absolute bottom-0.5 left-1 text-[7px] font-mono
                  ${active ? 'text-amber-400/40' : 'text-white/10'}`}>{i + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Quick-use row */}
        <div className="flex gap-1 items-center">
          {(['Q', 'Z', 'X'] as const).map((key, qi) => {
            const slotIdx = quickUseSlots[qi];
            const item = slotIdx !== null ? inventory.find(it => it.slotIndex === slotIdx) : null;
            const def = item ? ITEM_DEFS[item.defId] : null;
            return (
              <div
                key={qi}
                onClick={() => {
                  if (slotIdx !== null) {
                    const newSlots = [...quickUseSlots] as [number | null, number | null, number | null];
                    newSlots[qi] = null;
                    useGameStore.setState({ quickUseSlots: newSlots });
                  }
                }}
                onDragOver={e => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropSlot = parseInt(e.dataTransfer.getData('text/plain'));
                  if (isNaN(dropSlot)) return;
                  const it = inventory.find(i => i.slotIndex === dropSlot);
                  if (!it) return;
                  const d = ITEM_DEFS[it.defId];
                  if (d && (d.type === 'food' || d.type === 'water' || d.type === 'medicine')) {
                    const newSlots = [...quickUseSlots] as [number | null, number | null, number | null];
                    newSlots[qi] = dropSlot;
                    useGameStore.setState({ quickUseSlots: newSlots });
                  }
                }}
                className={`w-8 h-8 rounded flex items-center justify-center relative cursor-pointer transition-all
                  ${def
                    ? 'bg-emerald-900/15 border border-emerald-500/15 hover:border-emerald-400/30'
                    : 'bg-white/[0.02] border border-white/[0.04]'
                  }`}
              >
                {def ? (
                  <span className="text-sm opacity-70">{def.icon}</span>
                ) : (
                  <span className="text-white/10 text-[8px] font-mono">{key}</span>
                )}
                <span className="absolute bottom-0 left-0.5 text-white/10 text-[6px] font-mono">{key}</span>
              </div>
            );
          })}
          <span className={`text-[8px] font-mono ml-1 tabular-nums ${weight > maxWeight * 0.8 ? 'text-red-400/50' : 'text-white/12'}`}>
            {weight.toFixed(1)}kg
          </span>
        </div>
      </div>

      {/* ─── Bottom-right: Armor ─── */}
      {totalDefense > 0 && (
        <div className="absolute bottom-20 right-4 hud-panel rounded-lg px-3 py-2"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center gap-2">
            {(['head', 'body', 'legs'] as ArmorSlot[]).map(s => {
              const id = player.equipment[s];
              const d = id ? ITEM_DEFS[id] : null;
              if (!d) return null;
              return (
                <div key={s} className="text-center">
                  <div className="text-sm leading-none opacity-60">{d.icon}</div>
                  <div className="text-[7px] text-cyan-400/40 font-mono mt-0.5">+{d.defense}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hoveredSlot && <ItemTooltip defId={hoveredSlot.defId} x={hoveredSlot.x} y={hoveredSlot.y} />}

      {/* Loot prompt */}
      {nearbyLootSpot && !nearbyLootSpot.searched && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-14
          hud-panel rounded-md px-5 py-2.5 pointer-events-none animate-fade-in"
          style={{
            border: '1px solid rgba(200,160,80,0.2)',
            boxShadow: '0 0 30px rgba(200,160,80,0.05)',
          }}>
          <span className="text-amber-200/60 text-xs font-medium tracking-wide flex items-center gap-2">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300/50">E</span>
            Search {nearbyLootSpot.label}
          </span>
        </div>
      )}

      {/* Notification */}
      {notificationTimer > 0 && notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2
          hud-panel rounded-md px-5 py-2.5 pointer-events-none animate-fade-in"
          style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
          <span className="text-white/60 text-xs tracking-wide">{notification}</span>
        </div>
      )}
    </>
  );
}
