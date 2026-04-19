import type { PlayerState, InventoryItem } from '../engine/types';
import { TILE_SIZE } from '../engine/types';
import { canMoveTo } from './collision';
import { ITEM_DEFS } from '../engine/itemDefs';
import { Input } from '../engine/Input';
import { Camera } from '../engine/Camera';
import { getCurrentWeight } from '../store/gameStore';
import type { ChunkManager } from '../maps/ChunkManager';

export function updatePlayer(
  player: PlayerState,
  dt: number,
  input: Input,
  camera: Camera,
  chunkMgr: ChunkManager,
  inventory: InventoryItem[],
  maxWeight: number,
): PlayerState {
  const p = { ...player };

  const up = input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp');
  const down = input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown');
  const left = input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft');
  const right = input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight');
  const shift = input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight');
  const ctrl = input.isKeyDown('ControlLeft') || input.isKeyDown('ControlRight');

  let moveX = 0, moveY = 0;
  if (up) moveY = -1;
  if (down) moveY = 1;
  if (left) moveX = -1;
  if (right) moveX = 1;

  if (moveX !== 0 && moveY !== 0) {
    const invSqrt2 = 0.7071;
    moveX *= invSqrt2;
    moveY *= invSqrt2;
  }

  p.isMoving = moveX !== 0 || moveY !== 0;
  p.isRunning = shift && p.stamina > 0 && p.isMoving;
  p.isSneaking = ctrl;

  const weightRatio = getCurrentWeight(inventory) / maxWeight;
  const weightPenalty = Math.max(0.4, 1 - weightRatio * 0.5);

  let speed = p.speed * weightPenalty;
  if (p.isRunning) {
    speed *= 1.8;
    p.stamina = Math.max(0, p.stamina - 10 * dt);
    p.noiseLevel = 0.8;
  } else if (p.isSneaking) {
    speed *= 0.5;
    p.noiseLevel = 0.05;
  } else {
    p.noiseLevel = moveX !== 0 || moveY !== 0 ? 0.3 : 0.02;
  }

  if (!p.isRunning && (moveX === 0 && moveY === 0)) {
    p.stamina = Math.min(p.maxStamina, p.stamina + 20 * dt);
  } else if (!p.isRunning) {
    p.stamina = Math.min(p.maxStamina, p.stamina + 8 * dt);
  }

  const newX = p.x + moveX * speed * dt;
  const newY = p.y + moveY * speed * dt;

  if (canMoveTo(chunkMgr, newX, p.y)) p.x = newX;
  if (canMoveTo(chunkMgr, p.x, newY)) p.y = newY;

  const mouse = input.getMousePos();
  const worldMouse = camera.screenToWorld(mouse.x, mouse.y);
  p.facing = Math.atan2(worldMouse.y - p.y, worldMouse.x - p.x);

  if (p.attackCooldown > 0) {
    p.attackCooldown -= dt;
    if (p.attackCooldown <= 0) p.isAttacking = false;
  }

  if (p.isReloading) {
    p.reloadTimer -= dt;
    if (p.reloadTimer <= 0) {
      p.isReloading = false;
    }
  }

  if (p.bleeding) {
    p.bleedTimer -= dt;
    p.health -= 3 * dt;
    if (p.bleedTimer <= 0) p.bleeding = false;
  }

  if (p.isMoving || p.isAttacking) {
    p.animTimer += dt;
    const rate = p.isRunning ? 0.07 : p.isSneaking ? 0.15 : 0.1;
    if (p.animTimer > rate) {
      p.animTimer = 0;
      p.animFrame++;
    }
  } else {
    p.animFrame = 0;
    p.animTimer = 0;
  }

  return p;
}

export function updateSurvival(player: PlayerState, dt: number, timeOfDay: number): PlayerState {
  const p = { ...player };

  p.hunger = Math.max(0, p.hunger - 0.15 * dt);
  p.thirst = Math.max(0, p.thirst - 0.22 * dt);

  if (p.hunger <= 0) p.health -= 1.5 * dt;
  if (p.thirst <= 0) p.health -= 2.5 * dt;

  const isNight = timeOfDay > 0.75 || timeOfDay < 0.2;
  if (p.hunger > 30 && p.thirst > 30 && !isNight) {
    p.health = Math.min(p.maxHealth, p.health + 0.5 * dt);
  }

  if (p.bleeding) {
    p.health = Math.max(0, p.health - 1 * dt);
  }

  return p;
}

export function useItem(
  player: PlayerState,
  inventory: InventoryItem[],
  slotIndex: number,
): { player: PlayerState; inventory: InventoryItem[]; message: string } {
  const itemSlot = inventory.find(i => i.slotIndex === slotIndex);
  if (!itemSlot) return { player, inventory, message: '' };

  const def = ITEM_DEFS[itemSlot.defId];
  if (!def) return { player, inventory, message: '' };

  const p = { ...player };
  let msg = '';

  if (def.type === 'food' && def.foodAmount) {
    p.hunger = Math.min(p.maxHunger, p.hunger + def.foodAmount);
    msg = `Ate ${def.name}. Hunger restored.`;
  } else if (def.type === 'water' && def.waterAmount) {
    p.thirst = Math.min(p.maxThirst, p.thirst + def.waterAmount);
    msg = `Drank ${def.name}. Thirst restored.`;
  } else if (def.type === 'medicine' && def.healAmount) {
    p.health = Math.min(p.maxHealth, p.health + def.healAmount);
    if (def.id === 'bandage') p.bleeding = false;
    msg = `Used ${def.name}. Health restored.`;
  } else {
    return { player, inventory, message: `Can't use ${def.name} like that.` };
  }

  const newInv = inventory.map(i => {
    if (i.slotIndex !== slotIndex) return i;
    return { ...i, quantity: i.quantity - 1 };
  }).filter(i => i.quantity > 0);

  return { player: p, inventory: newInv, message: msg };
}

export function checkNearbyLoot(
  playerX: number,
  playerY: number,
  lootSpots: { tileX: number; tileY: number; searched: boolean }[],
): number {
  const ptx = Math.floor(playerX / TILE_SIZE);
  const pty = Math.floor(playerY / TILE_SIZE);

  for (let i = 0; i < lootSpots.length; i++) {
    const ls = lootSpots[i];
    if (Math.abs(ls.tileX - ptx) <= 1 && Math.abs(ls.tileY - pty) <= 1 && !ls.searched) {
      return i;
    }
  }
  return -1;
}
