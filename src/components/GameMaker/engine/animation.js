import { getComponent } from './ecs.js';

/**
 * @param {string} name
 * @param {{ spriteId?: string|null, frameIndex?: number, duration?: number }[]} frames
 * @param {number} frameRate legacy frames per second when frame duration omitted
 */
export function createAnimation(name, frames, frameRate = 12) {
  const normalized = (frames || []).map((f) => ({
    spriteId: f.spriteId ?? null,
    frameIndex: f.frameIndex ?? 0,
    duration: f.duration ?? (frameRate > 0 ? 1 / frameRate : 0.1),
  }));
  return { name, frames: normalized, frameRate };
}

export function playAnimation(entity, animationName) {
  const anim = getComponent(entity, 'Animator');
  if (!anim) return false;
  const a = anim.animations && anim.animations[animationName];
  if (!a || !Array.isArray(a.frames) || a.frames.length === 0) return false;
  anim.currentAnimation = animationName;
  anim.playing = true;
  anim.currentFrame = 0;
  anim.elapsed = 0;
  return true;
}

export function stopAnimation(entity) {
  const anim = getComponent(entity, 'Animator');
  if (!anim) return;
  anim.playing = false;
}

/**
 * Advance Animator state and sync SpriteRenderer frame / sprite id.
 * @param {object[]} entities
 * @param {number} deltaTime
 */
export function updateAnimations(entities, deltaTime) {
  if (!Array.isArray(entities) || deltaTime <= 0) return;

  for (const entity of entities) {
    if (!entity || entity.active === false) continue;
    const anim = getComponent(entity, 'Animator');
    const spr = getComponent(entity, 'SpriteRenderer');
    if (!anim || !anim.playing || !anim.currentAnimation) continue;

    const spec = anim.animations[anim.currentAnimation];
    if (!spec || !Array.isArray(spec.frames) || spec.frames.length === 0) {
      anim.playing = false;
      continue;
    }

    const speed = typeof anim.speed === 'number' ? anim.speed : 1;
    const frames = spec.frames;
    let idx = anim.currentFrame % frames.length;

    function applyFrame(f) {
      if (!spr || !f) return;
      if (f.spriteId != null) spr.spriteId = f.spriteId;
      spr.frameIndex = f.frameIndex ?? 0;
    }

    applyFrame(frames[idx]);

    anim.elapsed += deltaTime * speed;
    while (anim.elapsed >= 0 && anim.playing) {
      const frame = frames[idx];
      const dur = Math.max(frame.duration ?? 0.05, 0.001);
      if (anim.elapsed < dur) break;
      anim.elapsed -= dur;

      const evt = frame.event;
      if (evt && typeof evt === 'string') {
        entity.__animationEvents = entity.__animationEvents || [];
        entity.__animationEvents.push(evt);
      }

      idx += 1;
      if (idx >= frames.length) {
        if (anim.loop !== false) idx = 0;
        else {
          idx = frames.length - 1;
          anim.playing = false;
          break;
        }
      }
      anim.currentFrame = idx;
      applyFrame(frames[idx]);
    }
  }
}
