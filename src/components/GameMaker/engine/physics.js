import { getComponent } from './ecs.js';

const GRAVITY_PX = 980;

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function getWorldBox(entity) {
  const t = getComponent(entity, 'Transform');
  const c = getComponent(entity, 'Collider');
  if (!t || !c || c.type !== 'box') return null;
  const w = c.width ?? 32;
  const h = c.height ?? 32;
  const ox = c.offsetX ?? 0;
  const oy = c.offsetY ?? 0;
  const cx = t.x + ox;
  const cy = t.y + oy;
  return {
    left: cx - w / 2,
    right: cx + w / 2,
    top: cy - h / 2,
    bottom: cy + h / 2,
    centerX: cx,
    centerY: cy,
    width: w,
    height: h,
  };
}

function getOverlap(a, b) {
  const dx = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const dy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  if (dx <= 0 || dy <= 0) return null;
  return { dx, dy };
}

/**
 * Integrate velocities, gravity, friction for dynamic bodies.
 * @param {object[]} entities
 * @param {number} deltaTime
 */
export function updatePhysics(entities, deltaTime) {
  if (!Array.isArray(entities) || deltaTime <= 0) return;

  const dt = deltaTime;

  for (const entity of entities) {
    if (!entity || entity.active === false) continue;
    const rb = getComponent(entity, 'RigidBody');
    const t = getComponent(entity, 'Transform');
    if (!rb || !t) continue;

    if (rb.isStatic) {
      rb.velocityX = 0;
      rb.velocityY = 0;
      continue;
    }

    if (rb.isKinematic) {
      t.x += rb.velocityX * dt;
      t.y += rb.velocityY * dt;
      continue;
    }

    const g = (rb.gravityScale ?? 1) * GRAVITY_PX;
    rb.velocityY += g * dt;

    const fr = clamp(rb.friction ?? 0.1, 0, 1);
    rb.velocityX *= 1 - fr * dt * 10;
    rb.velocityY *= 1 - fr * dt * 3;

    t.x += rb.velocityX * dt;
    t.y += rb.velocityY * dt;
  }
}

/**
 * @returns {{ entityA: object, entityB: object, overlap: { dx: number, dy: number } }[]}
 */
export function checkCollisions(entities) {
  const pairs = [];
  if (!Array.isArray(entities)) return pairs;

  const list = entities.filter((e) => e && e.active !== false);
  for (let i = 0; i < list.length; i += 1) {
    const ea = list[i];
    const ca = getComponent(ea, 'Collider');
    if (!ca || ca.type !== 'box') continue;
    for (let j = i + 1; j < list.length; j += 1) {
      const eb = list[j];
      const cb = getComponent(eb, 'Collider');
      if (!cb || cb.type !== 'box') continue;

      const a = getWorldBox(ea);
      const b = getWorldBox(eb);
      if (!a || !b) continue;

      const overlap = getOverlap(
        { left: a.left, right: a.right, top: a.top, bottom: a.bottom },
        { left: b.left, right: b.right, top: b.top, bottom: b.bottom },
      );
      if (overlap) {
        pairs.push({ entityA: ea, entityB: eb, overlap });
      }
    }
  }
  return pairs;
}

function rectContainsPoint(rect, x, y) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function isDynamic(rb) {
  return rb && rb.isStatic !== true && rb.isKinematic !== true;
}

function fireTriggerPair(triggerEntity, other, now) {
  const evt = getComponent(triggerEntity, 'EventTrigger');
  if (!evt) return;
  const cd = evt.cooldown ?? 0;
  const last = evt.lastTriggered ?? 0;
  if (now - last < cd) return;
  const tt = evt.targetTag;
  if (!tt || (Array.isArray(other.tags) && other.tags.includes(tt))) {
    evt.lastTriggered = now;
  }
}

function resolvePair(ea, eb, overlap, now = performance.now()) {
  const ca = getComponent(ea, 'Collider');
  const cb = getComponent(eb, 'Collider');
  const ta = getComponent(ea, 'Transform');
  const tb = getComponent(eb, 'Transform');
  const ra = getComponent(ea, 'RigidBody');
  const rb = getComponent(eb, 'RigidBody');

  if (!ta || !tb || !ca || !cb) return;

  const aTrigger = ca.isTrigger === true;
  const bTrigger = cb.isTrigger === true;

  if (aTrigger && bTrigger) return;

  if (aTrigger !== bTrigger) {
    fireTriggerPair(aTrigger ? ea : eb, aTrigger ? eb : ea, now);
    return;
  }

  const dynA = isDynamic(ra);
  const dynB = isDynamic(rb);
  if (!dynA && !dynB) return;

  const ma = dynA ? Math.max(ra.mass ?? 1, 0.0001) : Infinity;
  const mb = dynB ? Math.max(rb.mass ?? 1, 0.0001) : Infinity;

  const useX = overlap.dx < overlap.dy;
  const pen = useX ? overlap.dx : overlap.dy;

  if (useX) {
    const dir = ta.x < tb.x ? -1 : 1;
    if (dynA && dynB) {
      const sum = ma + mb;
      ta.x += dir * pen * (mb / sum);
      tb.x -= dir * pen * (ma / sum);
    } else if (dynA) {
      ta.x += dir * pen;
    } else {
      tb.x -= dir * pen;
    }
    if (dynA) ra.velocityX *= 0.99;
    if (dynB) rb.velocityX *= 0.99;
  } else {
    const dir = ta.y < tb.y ? -1 : 1;
    if (dynA && dynB) {
      const sum = ma + mb;
      ta.y += dir * pen * (mb / sum);
      tb.y -= dir * pen * (ma / sum);
    } else if (dynA) {
      ta.y += dir * pen;
    } else {
      tb.y -= dir * pen;
    }
    if (dynA) ra.velocityY *= 0.99;
    if (dynB) rb.velocityY *= 0.99;
  }
}

/**
 * Separates overlapping non-trigger dynamic bodies; updates EventTrigger timestamps.
 * @param {{ entityA: object, entityB: object, overlap: object }[]} collisions
 */
export function resolveCollisions(collisions) {
  if (!Array.isArray(collisions)) return;
  const now = performance.now();
  for (const col of collisions) {
    resolvePair(col.entityA, col.entityB, col.overlap, now);
  }
}

/**
 * Hit test using collider AABB or sprite bounds for editor picking.
 */
export function pointInEntity(x, y, entity) {
  if (!entity || entity.active === false) return false;
  const box = getWorldBox(entity);
  if (box && rectContainsPoint(box, x, y)) return true;

  const t = getComponent(entity, 'Transform');
  const sr = getComponent(entity, 'SpriteRenderer');
  if (t && sr) {
    const hw = ((sr.width ?? 32) * (getComponent(entity, 'Transform')?.scaleX ?? 1)) / 2;
    const hh = ((sr.height ?? 32) * (getComponent(entity, 'Transform')?.scaleY ?? 1)) / 2;
    const left = t.x - hw;
    const right = t.x + hw;
    const top = t.y - hh;
    const bottom = t.y + hh;
    return x >= left && x <= right && y >= top && y <= bottom;
  }

  const tile = getComponent(entity, 'Tile');
  if (t && tile) {
    const size = 32;
    return rectContainsPoint(
      { left: t.x - size / 2, right: t.x + size / 2, top: t.y - size / 2, bottom: t.y + size / 2 },
      x,
      y,
    );
  }

  return false;
}

/**
 * @returns {object[]} entities whose transform/collider intersect axis-aligned rect in world space.
 */
export function entitiesInRect(x, y, w, h, entities) {
  const out = [];
  if (!Array.isArray(entities)) return out;

  const rx1 = x;
  const ry1 = y;
  const rx2 = x + w;
  const ry2 = y + h;

  function rectIntersects(ax1, ay1, ax2, ay2) {
    return !(ax2 < rx1 || ax1 > rx2 || ay2 < ry1 || ay1 > ry2);
  }

  for (const entity of entities) {
    if (!entity || entity.active === false) continue;
    const box = getWorldBox(entity);
    if (box) {
      if (rectIntersects(box.left, box.top, box.right, box.bottom)) out.push(entity);
      continue;
    }

    const t = getComponent(entity, 'Transform');
    const sr = getComponent(entity, 'SpriteRenderer');
    if (t && sr) {
      const hw = ((sr.width ?? 32) * (t.scaleX ?? 1)) / 2;
      const hh = ((sr.height ?? 32) * (t.scaleY ?? 1)) / 2;
      if (rectIntersects(t.x - hw, t.y - hh, t.x + hw, t.y + hh)) out.push(entity);
    }
  }
  return out;
}
