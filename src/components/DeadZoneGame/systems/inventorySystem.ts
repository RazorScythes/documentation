import type { InventoryItem, LootSpot } from '../engine/types';
import { ITEM_DEFS } from '../engine/itemDefs';
import { getCurrentWeight } from '../store/gameStore';
import { CRAFTING_RECIPES } from '../engine/itemDefs';

const MAX_SLOTS = 20;

export function addItemToInventory(
  inventory: InventoryItem[],
  defId: string,
  quantity: number,
  maxWeight: number,
): { inventory: InventoryItem[]; added: number; message: string } {
  const def = ITEM_DEFS[defId];
  if (!def) return { inventory, added: 0, message: 'Unknown item.' };

  const currentWeight = getCurrentWeight(inventory);
  const itemWeight = def.weight * quantity;
  if (currentWeight + itemWeight > maxWeight) {
    const canFit = Math.floor((maxWeight - currentWeight) / def.weight);
    if (canFit <= 0) return { inventory, added: 0, message: 'Too heavy!' };
    quantity = canFit;
  }

  const newInv = [...inventory.map(i => ({ ...i }))];

  if (def.stackable) {
    const existing = newInv.find(i => i.defId === defId && i.quantity < def.maxStack);
    if (existing) {
      const canAdd = Math.min(quantity, def.maxStack - existing.quantity);
      existing.quantity += canAdd;
      const remainder = quantity - canAdd;
      if (remainder > 0) {
        const slot = findEmptySlot(newInv);
        if (slot >= 0) {
          newInv.push({ defId, quantity: remainder, slotIndex: slot });
        }
      }
      return { inventory: newInv, added: quantity, message: `+${quantity} ${def.name}` };
    }
  }

  const slot = findEmptySlot(newInv);
  if (slot < 0) return { inventory, added: 0, message: 'Inventory full!' };

  newInv.push({ defId, quantity, slotIndex: slot });
  return { inventory: newInv, added: quantity, message: `+${quantity} ${def.name}` };
}

function findEmptySlot(inventory: InventoryItem[]): number {
  const used = new Set(inventory.map(i => i.slotIndex));
  for (let i = 0; i < MAX_SLOTS; i++) {
    if (!used.has(i)) return i;
  }
  return -1;
}

export function removeItemFromInventory(
  inventory: InventoryItem[],
  slotIndex: number,
  quantity: number = 1,
): InventoryItem[] {
  return inventory
    .map(i => {
      if (i.slotIndex !== slotIndex) return i;
      return { ...i, quantity: i.quantity - quantity };
    })
    .filter(i => i.quantity > 0);
}

export function moveItemSlot(
  inventory: InventoryItem[],
  fromSlot: number,
  toSlot: number,
): InventoryItem[] {
  if (fromSlot === toSlot) return inventory;
  const newInv = inventory.map(i => ({ ...i }));
  const fromItem = newInv.find(i => i.slotIndex === fromSlot);
  const toItem = newInv.find(i => i.slotIndex === toSlot);

  if (fromItem && toItem) {
    fromItem.slotIndex = toSlot;
    toItem.slotIndex = fromSlot;
  } else if (fromItem) {
    fromItem.slotIndex = toSlot;
  }

  return newInv;
}

export function searchLootSpot(
  lootSpots: LootSpot[],
  lootIndex: number,
  inventory: InventoryItem[],
  maxWeight: number,
): { lootSpots: LootSpot[]; inventory: InventoryItem[]; messages: string[] } {
  const messages: string[] = [];
  const newSpots = lootSpots.map((ls, i) => {
    if (i !== lootIndex) return ls;
    return { ...ls, searched: true };
  });

  let inv = [...inventory.map(i => ({ ...i }))];
  const spot = lootSpots[lootIndex];

  for (const lootItem of spot.items) {
    const result = addItemToInventory(inv, lootItem.defId, lootItem.quantity, maxWeight);
    inv = result.inventory;
    if (result.added > 0) {
      messages.push(result.message);
    } else {
      messages.push(result.message);
    }
  }

  if (spot.items.length === 0) {
    messages.push('Nothing here.');
  }

  return { lootSpots: newSpots, inventory: inv, messages };
}

export function canCraft(recipeId: string, inventory: InventoryItem[]): boolean {
  const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return false;

  for (const ing of recipe.ingredients) {
    const total = inventory
      .filter(i => i.defId === ing.defId)
      .reduce((sum, i) => sum + i.quantity, 0);
    if (total < ing.quantity) return false;
  }
  return true;
}

export function craftItem(
  recipeId: string,
  inventory: InventoryItem[],
  maxWeight: number,
): { inventory: InventoryItem[]; message: string } {
  const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return { inventory, message: 'Unknown recipe.' };

  if (!canCraft(recipeId, inventory)) return { inventory, message: 'Missing ingredients.' };

  let inv = [...inventory.map(i => ({ ...i }))];

  for (const ing of recipe.ingredients) {
    let remaining = ing.quantity;
    inv = inv.map(i => {
      if (i.defId !== ing.defId || remaining <= 0) return i;
      const take = Math.min(remaining, i.quantity);
      remaining -= take;
      return { ...i, quantity: i.quantity - take };
    }).filter(i => i.quantity > 0);
  }

  const result = addItemToInventory(inv, recipe.result.defId, recipe.result.quantity, maxWeight);
  return { inventory: result.inventory, message: `Crafted ${recipe.name}!` };
}

export function dropItem(inventory: InventoryItem[], slotIndex: number): InventoryItem[] {
  return inventory.filter(i => i.slotIndex !== slotIndex);
}
