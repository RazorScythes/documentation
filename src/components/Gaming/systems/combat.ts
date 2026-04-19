import type { PlayerState, ZombieState, BulletState, BloodSplatter, InventoryItem } from '../engine/types';
import { ITEM_DEFS } from '../engine/itemDefs';
import { distance, circleCollision } from './collision';
import { damageZombie } from './zombieAI';
import { canMoveTo } from './collision';
import type { ChunkManager } from '../maps/ChunkManager';

export function handleMeleeAttack(
  player: PlayerState,
  zombies: ZombieState[],
  equippedSlot: number,
  inventory: InventoryItem[],
): { zombies: ZombieState[]; blood: BloodSplatter[]; player: PlayerState } {
  const p = { ...player };
  const item = inventory.find(i => i.slotIndex === equippedSlot);
  const def = item ? ITEM_DEFS[item.defId] : null;

  const isMelee = def && !def.ammoType && (def.type === 'weapon' || (def.type === 'tool' && def.damage));
  if (!isMelee) {
    return { zombies, blood: [], player: p };
  }

  if (p.attackCooldown > 0) return { zombies, blood: [], player: p };

  p.isAttacking = true;
  p.attackCooldown = 0.4;
  p.noiseLevel = Math.max(p.noiseLevel, def.noiseLevel ?? 0.3);

  const range = def.range ?? 30;
  const damage = def.damage ?? 15;
  const blood: BloodSplatter[] = [];

  const hitX = p.x + Math.cos(p.facing) * range;
  const hitY = p.y + Math.sin(p.facing) * range;

  const newZombies = zombies.map(z => {
    if (z.state === 'dead') return z;
    if (distance(hitX, hitY, z.x, z.y) < 24) {
      const isHeadshot = Math.random() < 0.15;
      const finalDmg = isHeadshot ? damage * 3 : damage;
      blood.push({
        x: z.x + (Math.random() - 0.5) * 10,
        y: z.y + (Math.random() - 0.5) * 10,
        size: 6 + Math.random() * 8,
        alpha: 0.9,
        angle: Math.random() * Math.PI * 2,
      });
      return damageZombie(z, finalDmg, p.x, p.y);
    }
    return z;
  });

  return { zombies: newZombies, blood, player: p };
}

export function handleGunFire(
  player: PlayerState,
  inventory: InventoryItem[],
  equippedSlot: number,
  bullets: BulletState[],
): { player: PlayerState; inventory: InventoryItem[]; bullets: BulletState[]; message: string } {
  const p = { ...player };
  const item = inventory.find(i => i.slotIndex === equippedSlot);
  const def = item ? ITEM_DEFS[item.defId] : null;

  if (!def || def.type !== 'weapon' || !def.ammoType) {
    return { player: p, inventory, bullets, message: '' };
  }

  if (p.attackCooldown > 0 || p.isReloading) {
    return { player: p, inventory, bullets, message: '' };
  }

  const ammoSlot = inventory.find(i => i.defId === def.ammoType && i.quantity > 0);
  if (!ammoSlot) {
    return { player: p, inventory, bullets, message: 'No ammo!' };
  }

  p.attackCooldown = def.fireRate ?? 0.5;
  p.isAttacking = true;
  p.noiseLevel = def.noiseLevel ?? 1.0;

  const newInv = inventory.map(i => {
    if (i.slotIndex === ammoSlot.slotIndex) {
      return { ...i, quantity: i.quantity - 1 };
    }
    return i;
  }).filter(i => i.quantity > 0);

  const speed = 600;
  const bullet: BulletState = {
    id: `b_${Date.now()}_${Math.random()}`,
    x: p.x + Math.cos(p.facing) * 16,
    y: p.y + Math.sin(p.facing) * 16,
    vx: Math.cos(p.facing) * speed,
    vy: Math.sin(p.facing) * speed,
    damage: def.damage ?? 40,
    ownerId: 'player',
    life: (def.range ?? 300) / speed,
  };

  return { player: p, inventory: newInv, bullets: [...bullets, bullet], message: '' };
}

export function getPlayerDefense(player: PlayerState, inventory: InventoryItem[]): number {
  let def = 0;
  const eq = player.equipment;
  for (const slotId of [eq.head, eq.body, eq.legs]) {
    if (slotId) {
      const itemDef = ITEM_DEFS[slotId];
      if (itemDef?.defense) def += itemDef.defense;
    }
  }
  return def;
}

export function updateBullets(
  bullets: BulletState[],
  zombies: ZombieState[],
  chunkMgr: ChunkManager,
  dt: number,
): { bullets: BulletState[]; zombies: ZombieState[]; blood: BloodSplatter[] } {
  const blood: BloodSplatter[] = [];
  let zList = [...zombies];

  const remainingBullets: BulletState[] = [];

  for (const b of bullets) {
    const nb = { ...b };
    nb.x += nb.vx * dt;
    nb.y += nb.vy * dt;
    nb.life -= dt;

    if (nb.life <= 0) continue;

    if (!canMoveTo(chunkMgr, nb.x, nb.y, 2)) continue;

    let hit = false;
    zList = zList.map(z => {
      if (hit || z.state === 'dead') return z;
      if (circleCollision(nb.x, nb.y, 4, z.x, z.y, 12)) {
        hit = true;
        const isHeadshot = Math.random() < 0.2;
        const finalDmg = isHeadshot ? nb.damage * 2.5 : nb.damage;
        blood.push({
          x: z.x + (Math.random() - 0.5) * 10,
          y: z.y + (Math.random() - 0.5) * 10,
          size: 8 + Math.random() * 12,
          alpha: 1,
          angle: Math.random() * Math.PI * 2,
        });
        return damageZombie(z, finalDmg, nb.x - nb.vx * 0.01, nb.y - nb.vy * 0.01);
      }
      return z;
    });

    if (!hit) remainingBullets.push(nb);
  }

  return { bullets: remainingBullets, zombies: zList, blood };
}
