import React from 'react';
import { useGameStore } from '../store/gameStore';
import { ITEM_DEFS, CRAFTING_RECIPES } from '../engine/itemDefs';
import { canCraft, craftItem } from '../systems/inventorySystem';

export default function CraftingUI() {
  const show = useGameStore(s => s.showCrafting);
  const inventory = useGameStore(s => s.inventory);
  const maxWeight = useGameStore(s => s.maxWeight);

  if (!show) return null;

  const handleCraft = (recipeId: string) => {
    const result = craftItem(recipeId, inventory, maxWeight);
    useGameStore.setState({
      inventory: result.inventory,
      notification: result.message,
      notificationTimer: 3,
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={() => useGameStore.getState().toggleCrafting()}>

      <div className="hud-panel rounded-lg w-[460px] animate-fade-in overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 0 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white/70">Crafting</h2>
          <button
            onClick={() => useGameStore.getState().toggleCrafting()}
            className="text-white/20 hover:text-white/50 transition-colors text-sm cursor-pointer"
          >x</button>
        </div>

        {/* Recipes */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {CRAFTING_RECIPES.map(recipe => {
            const available = canCraft(recipe.id, inventory);
            const resultDef = ITEM_DEFS[recipe.result.defId];

            return (
              <div key={recipe.id}
                className="rounded-md p-3.5 transition-all"
                style={{
                  background: available ? 'rgba(40,80,40,0.08)' : 'rgba(255,255,255,0.01)',
                  border: available ? '1px solid rgba(60,160,80,0.12)' : '1px solid rgba(255,255,255,0.03)',
                }}
                onMouseEnter={e => {
                  if (available) e.currentTarget.style.borderColor = 'rgba(60,160,80,0.25)';
                }}
                onMouseLeave={e => {
                  if (available) e.currentTarget.style.borderColor = 'rgba(60,160,80,0.12)';
                }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Result */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{resultDef?.icon}</span>
                      <span className="text-white/70 font-semibold text-xs">{recipe.name}</span>
                      {recipe.result.quantity > 1 && (
                        <span className="text-white/20 text-[9px] font-mono">x{recipe.result.quantity}</span>
                      )}
                    </div>

                    <div className="text-white/20 text-[9px] leading-relaxed mb-2">
                      {recipe.description}
                    </div>

                    {/* Ingredients */}
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.ingredients.map(ing => {
                        const def = ITEM_DEFS[ing.defId];
                        const have = inventory.filter(i => i.defId === ing.defId).reduce((s, i) => s + i.quantity, 0);
                        const enough = have >= ing.quantity;
                        return (
                          <div key={ing.defId}
                            className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded font-mono"
                            style={{
                              background: enough ? 'rgba(40,80,40,0.15)' : 'rgba(80,20,20,0.15)',
                              border: enough ? '1px solid rgba(60,160,80,0.1)' : '1px solid rgba(200,40,40,0.1)',
                              color: enough ? 'rgba(100,200,100,0.6)' : 'rgba(200,80,80,0.5)',
                            }}>
                            <span>{def?.icon}</span>
                            <span>{have}/{ing.quantity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    disabled={!available}
                    onClick={() => handleCraft(recipe.id)}
                    className="px-4 py-2 rounded text-[10px] font-bold uppercase tracking-[0.15em]
                      transition-all shrink-0 cursor-pointer active:scale-[0.95]"
                    style={{
                      background: available
                        ? 'linear-gradient(180deg, rgba(30,80,40,0.6) 0%, rgba(20,55,28,0.6) 100%)'
                        : 'rgba(255,255,255,0.03)',
                      border: available
                        ? '1px solid rgba(60,160,80,0.2)'
                        : '1px solid rgba(255,255,255,0.03)',
                      color: available ? 'rgba(180,240,180,0.7)' : 'rgba(255,255,255,0.12)',
                      cursor: available ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Craft
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-white/[0.04] flex justify-between items-center">
          <span className="text-white/10 text-[9px] font-mono tracking-wider">
            GREEN = CRAFTABLE
          </span>
          <span className="text-white/10 text-[9px] font-mono tracking-wider">
            C TO CLOSE
          </span>
        </div>
      </div>
    </div>
  );
}
