import type { ZombieState, PlayerState } from '../engine/types';
import { canMoveTo, lineOfSight, distance } from './collision';
import type { ChunkManager } from '../maps/ChunkManager';

const SIGHT_RANGE = 250;
const SOUND_RANGE_BASE = 400;
const CHASE_TIMEOUT = 8;
const ATTACK_RANGE = 24;
const ATTACK_COOLDOWN = 1.2;
const SWARM_RADIUS = 300;

export function updateZombies(
  zombies: ZombieState[],
  player: PlayerState,
  chunkMgr: ChunkManager,
  dt: number,
  worldTime: number,
  timeOfDay: number,
): { zombies: ZombieState[]; playerDamage: number; playerBleeding: boolean } {
  let playerDamage = 0;
  let playerBleeding = false;

  const isNight = timeOfDay > 0.75 || timeOfDay < 0.2;
  const sightMul = isNight ? 0.5 : 1.0;

  const alertedZombies = zombies.filter(z => z.state === 'chasing' && z.health > 0);

  const updated = zombies.map(z => {
    if (z.state === 'dead') {
      return { ...z, deathTimer: z.deathTimer + dt, animTimer: z.animTimer + dt };
    }

    const zc = { ...z };
    const dist = distance(zc.x, zc.y, player.x, player.y);

    if (zc.knockbackX !== 0 || zc.knockbackY !== 0) {
      const kbX = zc.x + zc.knockbackX * dt * 5;
      const kbY = zc.y + zc.knockbackY * dt * 5;
      if (canMoveTo(chunkMgr, kbX, kbY, 8)) {
        zc.x = kbX;
        zc.y = kbY;
      }
      zc.knockbackX *= 0.85;
      zc.knockbackY *= 0.85;
      if (Math.abs(zc.knockbackX) < 1 && Math.abs(zc.knockbackY) < 1) {
        zc.knockbackX = 0;
        zc.knockbackY = 0;
      }
    }

    const canSee = dist < SIGHT_RANGE * sightMul && lineOfSight(chunkMgr, zc.x, zc.y, player.x, player.y);
    const soundRange = SOUND_RANGE_BASE * player.noiseLevel;
    const canHear = dist < soundRange;

    let nearbyAlert = false;
    for (const az of alertedZombies) {
      if (az.id !== zc.id && distance(zc.x, zc.y, az.x, az.y) < SWARM_RADIUS) {
        nearbyAlert = true;
        break;
      }
    }

    if (canSee || canHear || nearbyAlert) {
      zc.state = 'chasing';
      zc.targetX = player.x;
      zc.targetY = player.y;
      zc.lastSawPlayerAt = worldTime;
      zc.alertLevel = Math.min(1, zc.alertLevel + dt * 2);
    }

    if (zc.state === 'chasing') {
      if (worldTime - zc.lastSawPlayerAt > CHASE_TIMEOUT && !canSee) {
        zc.state = 'roaming';
        zc.alertLevel = Math.max(0, zc.alertLevel - dt);
        zc.targetX = zc.x + (Math.random() - 0.5) * 300;
        zc.targetY = zc.y + (Math.random() - 0.5) * 300;
      } else {
        zc.targetX = player.x;
        zc.targetY = player.y;
      }
    }

    zc.attackCooldown = Math.max(0, zc.attackCooldown - dt);

    if (zc.state === 'chasing' && dist < ATTACK_RANGE) {
      zc.state = 'attacking';
      if (zc.attackCooldown <= 0) {
        playerDamage += zc.damage;
        zc.attackCooldown = ATTACK_COOLDOWN;
        if (Math.random() < 0.15) playerBleeding = true;
      }
    } else if (zc.state === 'attacking' && dist >= ATTACK_RANGE * 1.5) {
      zc.state = 'chasing';
    }

    if (zc.state === 'chasing' || zc.state === 'roaming') {
      const dx = zc.targetX - zc.x;
      const dy = zc.targetY - zc.y;
      const tdist = Math.sqrt(dx * dx + dy * dy);

      if (tdist > 4) {
        const nx = dx / tdist;
        const ny = dy / tdist;
        const speed = zc.state === 'chasing' ? zc.speed * 1.5 : zc.speed * 0.5;
        const newX = zc.x + nx * speed * dt;
        const newY = zc.y + ny * speed * dt;

        if (canMoveTo(chunkMgr, newX, zc.y, 8)) zc.x = newX;
        if (canMoveTo(chunkMgr, zc.x, newY, 8)) zc.y = newY;

        zc.facing = Math.atan2(ny, nx);
      } else if (zc.state === 'roaming') {
        zc.targetX = zc.x + (Math.random() - 0.5) * 400;
        zc.targetY = zc.y + (Math.random() - 0.5) * 400;
      }
    }

    zc.animTimer += dt;
    if (zc.animTimer > 0.12) {
      zc.animTimer = 0;
      zc.animFrame++;
    }

    return zc;
  });

  return { zombies: updated, playerDamage, playerBleeding };
}

export function damageZombie(zombie: ZombieState, damage: number, fromX: number, fromY: number): ZombieState {
  const z = { ...zombie };
  z.health -= damage;

  const dx = z.x - fromX;
  const dy = z.y - fromY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  z.knockbackX = (dx / dist) * damage * 2;
  z.knockbackY = (dy / dist) * damage * 2;

  if (z.health <= 0) {
    z.state = 'dead';
    z.health = 0;
    z.deathTimer = 0;
  } else {
    z.state = 'chasing';
    z.lastSawPlayerAt = Infinity;
  }

  return z;
}
