import React, { useState, useCallback, useRef } from 'react';
import { useGameStore, getCurrentWeight } from '../store/gameStore';
import { ITEM_DEFS } from '../engine/itemDefs';
import { moveItemSlot, dropItem } from '../systems/inventorySystem';
import { useItem } from '../systems/playerSystem';
import type { ArmorSlot } from '../engine/types';

const TYPE_ACCENTS: Record<string, string> = {
  weapon: 'rgba(200,60,60,0.25)',
  food: 'rgba(60,160,60,0.25)',
  water: 'rgba(60,120,200,0.25)',
  medicine: 'rgba(200,80,160,0.25)',
  ammo: 'rgba(200,180,60,0.25)',
  material: 'rgba(120,120,130,0.25)',
  throwable: 'rgba(200,120,40,0.25)',
  armor: 'rgba(60,180,200,0.25)',
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  weapon: { label: 'WEAPON', color: 'text-red-400/70' },
  food: { label: 'FOOD', color: 'text-green-400/70' },
  water: { label: 'DRINK', color: 'text-blue-400/70' },
  medicine: { label: 'MEDICINE', color: 'text-pink-400/70' },
  ammo: { label: 'AMMO', color: 'text-yellow-400/70' },
  material: { label: 'MATERIAL', color: 'text-gray-400/60' },
  throwable: { label: 'THROWABLE', color: 'text-orange-400/70' },
  armor: { label: 'ARMOR', color: 'text-cyan-400/70' },
};

const SLOT_LABELS: Record<ArmorSlot, string> = {
  head: 'Head',
  body: 'Body',
  legs: 'Legs',
};

export default function InventoryUI() {
  const show = useGameStore(s => s.showInventory);
  const inventory = useGameStore(s => s.inventory);
  const maxWeight = useGameStore(s => s.maxWeight);
  const player = useGameStore(s => s.player);
  const equippedSlot = useGameStore(s => s.equippedSlot);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const weight = getCurrentWeight(inventory);
  const totalSlots = 20;

  const handleDragStart = useCallback((slot: number) => {
    setDragFrom(slot);
  }, []);

  const handleDrop = useCallback((slot: number) => {
    if (dragFrom === null || dragFrom === slot) return;
    const newInv = moveItemSlot(inventory, dragFrom, slot);
    useGameStore.setState({ inventory: newInv });
    setDragFrom(null);
  }, [dragFrom, inventory]);

  const handleUse = useCallback((slotIndex: number) => {
    const currentPlayer = useGameStore.getState().player;
    const currentInv = useGameStore.getState().inventory;
    const result = useItem(currentPlayer, currentInv, slotIndex);
    useGameStore.setState({
      player: result.player,
      inventory: result.inventory,
      notification: result.message,
      notificationTimer: 3,
    });
    if (result.message && (result.message.startsWith('Ate') || result.message.startsWith('Drank') || result.message.startsWith('Used'))) {
      setSelectedSlot(null);
    }
  }, []);

  const handleDropItem = useCallback((slotIndex: number) => {
    const currentInv = useGameStore.getState().inventory;
    const newInv = dropItem(currentInv, slotIndex);
    useGameStore.setState({ inventory: newInv });
    setSelectedSlot(null);
  }, []);

  const handleEquip = useCallback((slotIndex: number) => {
    useGameStore.setState({ equippedSlot: slotIndex });
    setSelectedSlot(null);
  }, []);

  const handleEquipArmor = useCallback((slotIndex: number) => {
    const currentPlayer = useGameStore.getState().player;
    const currentInv = useGameStore.getState().inventory;
    const item = currentInv.find(i => i.slotIndex === slotIndex);
    if (!item) return;
    const def = ITEM_DEFS[item.defId];
    if (!def || def.type !== 'armor' || !def.armorSlot) return;

    const slot = def.armorSlot;
    const eq = { ...currentPlayer.equipment };
    const oldArmorId = eq[slot];

    eq[slot] = item.defId;
    let newInv = currentInv.filter(i => i.slotIndex !== slotIndex);

    if (oldArmorId) {
      const emptySlot = findEmpty(newInv);
      if (emptySlot >= 0) {
        newInv = [...newInv, { defId: oldArmorId, quantity: 1, slotIndex: emptySlot }];
      }
    }

    useGameStore.setState({
      player: { ...currentPlayer, equipment: eq },
      inventory: newInv,
      notification: `Equipped ${def.name}`,
      notificationTimer: 2,
    });
    setSelectedSlot(null);
  }, []);

  const handleUnequipArmor = useCallback((slot: ArmorSlot) => {
    const currentPlayer = useGameStore.getState().player;
    const currentInv = useGameStore.getState().inventory;
    const armorId = currentPlayer.equipment[slot];
    if (!armorId) return;

    const emptySlot = findEmpty(currentInv);
    if (emptySlot < 0) {
      useGameStore.setState({ notification: 'Inventory full!', notificationTimer: 2 });
      return;
    }

    const eq = { ...currentPlayer.equipment };
    eq[slot] = null;
    const newInv = [...currentInv, { defId: armorId, quantity: 1, slotIndex: emptySlot }];
    const def = ITEM_DEFS[armorId];

    useGameStore.setState({
      player: { ...currentPlayer, equipment: eq },
      inventory: newInv,
      notification: `Unequipped ${def?.name || 'armor'}`,
      notificationTimer: 2,
    });
  }, []);

  if (!show) return null;

  const selectedItem = selectedSlot !== null ? inventory.find(i => i.slotIndex === selectedSlot) : null;
  const selectedDef = selectedItem ? ITEM_DEFS[selectedItem.defId] : null;
  const selectedType = selectedDef ? TYPE_LABELS[selectedDef.type] : null;
  const weightPct = (weight / maxWeight) * 100;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={() => { useGameStore.getState().toggleInventory(); setSelectedSlot(null); }}>

      <div className="hud-panel rounded-lg flex animate-fade-in overflow-hidden"
        onClick={e => e.stopPropagation()}
        ref={containerRef}
        style={{
          minHeight: 420,
          boxShadow: '0 0 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}>

        {/* ── Left: Grid ── */}
        <div className="p-5 w-[360px]">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white/70">Inventory</h2>
            </div>
            <button
              onClick={() => { useGameStore.getState().toggleInventory(); setSelectedSlot(null); }}
              className="text-white/20 hover:text-white/50 transition-colors text-sm cursor-pointer"
            >x</button>
          </div>

          {/* Weight bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[9px] font-mono mb-1">
              <span className={weightPct > 80 ? 'text-red-400/60' : 'text-white/20'}>
                {weight.toFixed(1)} / {maxWeight} kg
              </span>
              <span className="text-white/10">{Math.round(weightPct)}%</span>
            </div>
            <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, weightPct)}%`,
                  background: weightPct > 80
                    ? 'linear-gradient(90deg, #cc3333, #ff4444)'
                    : weightPct > 50
                      ? 'linear-gradient(90deg, rgba(200,160,60,0.5), rgba(200,160,60,0.7))'
                      : 'rgba(255,255,255,0.12)',
                }}
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: totalSlots }).map((_, slot) => {
              const item = inventory.find(i => i.slotIndex === slot);
              const def = item ? ITEM_DEFS[item.defId] : null;
              const isEquipped = slot === equippedSlot;
              const isSelected = slot === selectedSlot;
              const accent = def ? TYPE_ACCENTS[def.type] || 'transparent' : 'transparent';

              return (
                <div
                  key={slot}
                  draggable={!!item}
                  onDragStart={() => handleDragStart(slot)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(slot)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item) setSelectedSlot(isSelected ? null : slot);
                    else setSelectedSlot(null);
                  }}
                  className={`
                    w-full aspect-square rounded-md flex items-center justify-center
                    cursor-pointer relative select-none transition-all duration-150
                    ${dragFrom === slot ? 'opacity-30' : ''}
                  `}
                  style={{
                    background: isSelected
                      ? 'rgba(255,255,255,0.08)'
                      : item
                        ? accent
                        : 'rgba(255,255,255,0.015)',
                    border: isSelected
                      ? '1px solid rgba(255,255,255,0.2)'
                      : isEquipped
                        ? '1px solid rgba(200,160,80,0.25)'
                        : '1px solid rgba(255,255,255,0.03)',
                    boxShadow: isSelected ? '0 0 12px rgba(255,255,255,0.05)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected && item) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected && !isEquipped) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
                    }
                  }}
                >
                  {def && (
                    <>
                      <span className="text-xl leading-none">{def.icon}</span>
                      {item && item.quantity > 1 && (
                        <span className="text-white/35 text-[8px] absolute bottom-0.5 right-1 font-mono">
                          {item.quantity}
                        </span>
                      )}
                      {isEquipped && (
                        <span className="absolute top-0.5 left-1 text-amber-400/40 text-[6px] font-mono font-bold">EQ</span>
                      )}
                    </>
                  )}
                  {slot < 5 && (
                    <span className="absolute bottom-0.5 left-1 text-white/8 text-[6px] font-mono">{slot + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-white/10 text-[9px] mt-3 font-mono tracking-wider">
            CLICK SELECT &middot; DRAG MOVE &middot; 1-5 HOTBAR
          </div>
        </div>

        {/* ── Center: Detail Panel ── */}
        <div className="w-[220px] border-l border-white/[0.04] p-4 flex flex-col"
          style={{ background: 'rgba(255,255,255,0.01)' }}>
          {selectedDef && selectedItem ? (
            <>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-md flex items-center justify-center"
                  style={{ background: TYPE_ACCENTS[selectedDef.type] || 'rgba(255,255,255,0.05)' }}>
                  <span className="text-2xl">{selectedDef.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white/80 font-semibold text-xs truncate">{selectedDef.name}</div>
                  {selectedType && (
                    <div className={`text-[8px] font-bold uppercase tracking-[0.15em] ${selectedType.color}`}>
                      {selectedType.label}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-white/25 text-[10px] leading-relaxed mb-3 flex-1 overflow-y-auto">
                {selectedDef.description}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-white/20 border-t border-white/[0.04] pt-2 mb-3 font-mono">
                <span>{selectedDef.weight}kg</span>
                {selectedDef.stackable && <span>x{selectedDef.maxStack}</span>}
                {selectedDef.damage != null && selectedDef.damage > 0 && <span className="text-red-400/50">DMG {selectedDef.damage}</span>}
                {selectedDef.range != null && selectedDef.range > 0 && <span>RNG {selectedDef.range}</span>}
                {selectedDef.healAmount != null && selectedDef.healAmount > 0 && <span className="text-green-400/50">+{selectedDef.healAmount}HP</span>}
                {selectedDef.foodAmount != null && selectedDef.foodAmount > 0 && <span className="text-amber-400/50">+{selectedDef.foodAmount}</span>}
                {selectedDef.waterAmount != null && selectedDef.waterAmount > 0 && <span className="text-blue-400/50">+{selectedDef.waterAmount}</span>}
                {selectedDef.defense != null && <span className="text-cyan-400/50">DEF {selectedDef.defense}</span>}
                {selectedDef.armorSlot && <span className="text-cyan-300/40">{selectedDef.armorSlot.toUpperCase()}</span>}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-1.5">
                {(selectedDef.type === 'food' || selectedDef.type === 'water' || selectedDef.type === 'medicine') && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleUse(selectedItem.slotIndex); }}
                    className="w-full py-2 rounded text-[10px] font-bold uppercase tracking-[0.15em] cursor-pointer
                      text-emerald-100/70 active:scale-[0.97] transition-all"
                    style={{
                      background: 'linear-gradient(180deg, rgba(30,80,40,0.6) 0%, rgba(20,55,28,0.6) 100%)',
                      border: '1px solid rgba(60,160,80,0.15)',
                    }}
                  >
                    Use
                  </button>
                )}
                {selectedDef.type === 'weapon' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEquip(selectedItem.slotIndex); }}
                    className="w-full py-2 rounded text-[10px] font-bold uppercase tracking-[0.15em] cursor-pointer
                      text-blue-100/70 btn-muted active:scale-[0.97]"
                  >
                    Equip
                  </button>
                )}
                {selectedDef.type === 'armor' && selectedDef.armorSlot && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEquipArmor(selectedItem.slotIndex); }}
                    className="w-full py-2 rounded text-[10px] font-bold uppercase tracking-[0.15em] cursor-pointer
                      text-cyan-100/70 btn-muted active:scale-[0.97]"
                  >
                    Equip ({SLOT_LABELS[selectedDef.armorSlot]})
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDropItem(selectedItem.slotIndex); }}
                  className="w-full py-1.5 rounded text-[10px] font-bold uppercase tracking-[0.15em] cursor-pointer
                    text-red-300/40 active:scale-[0.97] transition-all"
                  style={{
                    background: 'rgba(120,20,20,0.15)',
                    border: '1px solid rgba(200,40,40,0.1)',
                  }}
                >
                  Drop
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-white/5 text-4xl mb-3">+</div>
              <div className="text-white/15 text-[10px]">Select an item</div>
            </div>
          )}
        </div>

        {/* ── Right: Equipment Slots ── */}
        <div className="w-[130px] border-l border-white/[0.04] p-4 flex flex-col"
          style={{ background: 'rgba(255,255,255,0.005)' }}>
          <div className="text-white/20 text-[9px] uppercase tracking-[0.2em] mb-4 font-mono">Gear</div>

          {(['head', 'body', 'legs'] as ArmorSlot[]).map(slot => {
            const armorId = player.equipment[slot];
            const armorDef = armorId ? ITEM_DEFS[armorId] : null;

            return (
              <div key={slot} className="mb-3">
                <div className="text-white/12 text-[8px] uppercase tracking-[0.15em] mb-1 font-mono">
                  {SLOT_LABELS[slot]}
                </div>
                <div
                  onClick={() => armorId && handleUnequipArmor(slot)}
                  className="w-full h-12 rounded-md flex items-center justify-center transition-all"
                  style={{
                    background: armorDef ? 'rgba(60,180,200,0.08)' : 'rgba(255,255,255,0.015)',
                    border: armorDef ? '1px solid rgba(60,180,200,0.15)' : '1px solid rgba(255,255,255,0.03)',
                    cursor: armorDef ? 'pointer' : 'default',
                  }}
                  onMouseEnter={e => {
                    if (armorDef) e.currentTarget.style.borderColor = 'rgba(60,180,200,0.3)';
                  }}
                  onMouseLeave={e => {
                    if (armorDef) e.currentTarget.style.borderColor = 'rgba(60,180,200,0.15)';
                  }}
                >
                  {armorDef ? (
                    <div className="text-center">
                      <div className="text-base leading-none">{armorDef.icon}</div>
                      <div className="text-[7px] text-cyan-400/35 mt-0.5 font-mono">+{armorDef.defense}</div>
                    </div>
                  ) : (
                    <span className="text-white/6 text-xs">--</span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="mt-auto pt-2 border-t border-white/[0.04]">
            <div className="text-white/10 text-[8px] uppercase tracking-[0.15em] font-mono">Defense</div>
            <div className="text-cyan-400/40 text-sm font-bold font-mono mt-0.5">
              {(['head', 'body', 'legs'] as ArmorSlot[]).reduce((sum, s) => {
                const id = player.equipment[s];
                const d = id ? ITEM_DEFS[id] : null;
                return sum + (d?.defense || 0);
              }, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function findEmpty(inventory: { slotIndex: number }[]): number {
  const used = new Set(inventory.map(i => i.slotIndex));
  for (let i = 0; i < 20; i++) {
    if (!used.has(i)) return i;
  }
  return -1;
}
