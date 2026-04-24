import { getComponent } from './ecs.js';

function findEntityById(entities, id) {
  if (!Array.isArray(entities) || id == null) return null;
  return entities.find((e) => e && e.id === id) ?? null;
}

/**
 * @param {object} condition
 * @param {{ entities: object[], deltaTime?: number, input?: object, variables?: object }} context
 */
export function evaluateCondition(condition, context) {
  if (!condition || typeof condition !== 'object') return true;
  const { type } = condition;
  const vars = context.variables || {};

  switch (type) {
    case 'always':
      return true;
    case 'never':
      return false;
    case 'equals':
      return vars[condition.left] === condition.right;
    case 'notEquals':
      return vars[condition.left] !== condition.right;
    case 'compare': {
      const a = vars[condition.left];
      const b = condition.right;
      const op = condition.operator || '===';
      switch (op) {
        case '===':
        case '==':
          return a === b;
        case '!==':
        case '!=':
          return a !== b;
        case '>':
          return a > b;
        case '>=':
          return a >= b;
        case '<':
          return a < b;
        case '<=':
          return a <= b;
        default:
          return false;
      }
    }
    case 'tag': {
      const id = condition.entityId;
      const tag = condition.tag;
      const ent = findEntityById(context.entities, id);
      return !!(ent && Array.isArray(ent.tags) && ent.tags.includes(tag));
    }
    case 'and':
      return (condition.all || []).every((c) => evaluateCondition(c, context));
    case 'or':
      return (condition.any || []).some((c) => evaluateCondition(c, context));
    case 'not':
      return !evaluateCondition(condition.condition, context);
    default:
      return false;
  }
}

/**
 * @param {object} action
 * @param {{ entities: object[], deltaTime?: number, input?: object, variables?: object, camera?: object, assets?: object, soundPlayer?: object }} context
 * @returns {{ wait?: number, suspend?: boolean, spawnId?: string }|undefined}
 */
export function executeAction(action, context) {
  if (!action || typeof action !== 'object') return undefined;
  const vars = context.variables || (context.variables = {});
  const ents = context.entities || [];
  const dt = context.deltaTime ?? 0;

  switch (action.type) {
    case 'move': {
      const target = action.entityId
        ? findEntityById(ents, action.entityId)
        : context.ownerEntity;
      if (!target) break;
      const t = getComponent(target, 'Transform');
      const speed = action.speed ?? 100;
      if (!t) break;
      const dx = action.targetX - t.x;
      const dy = action.targetY - t.y;
      const len = Math.hypot(dx, dy) || 1;
      const step = speed * dt;
      if (len <= step) {
        t.x = action.targetX;
        t.y = action.targetY;
      } else {
        t.x += (dx / len) * step;
        t.y += (dy / len) * step;
      }
      break;
    }
    case 'spawn': {
      const id = action.prefabId;
      context.__spawnQueue = context.__spawnQueue || [];
      context.__spawnQueue.push({ prefabId: id, x: action.x ?? 0, y: action.y ?? 0 });
      break;
    }
    case 'destroy': {
      const e = findEntityById(ents, action.entityId);
      if (e) e.active = false;
      break;
    }
    case 'playAnimation': {
      const e = findEntityById(ents, action.entityId);
      if (e) {
        const anim = getComponent(e, 'Animator');
        const name = action.animationName;
        if (anim && name && anim.animations?.[name]) {
          anim.currentAnimation = name;
          anim.playing = true;
          anim.currentFrame = 0;
          anim.elapsed = 0;
        }
      }
      break;
    }
    case 'setVariable':
      vars[action.name] = action.value;
      break;
    case 'dialogue': {
      const dlg = context.dialogueComponent;
      if (dlg) {
        dlg.lines = Array.isArray(action.lines) ? [...action.lines] : [];
        dlg.currentLine = 0;
        dlg.active = true;
      }
      break;
    }
    case 'wait':
      return { wait: Math.max(action.duration ?? 0, 0) };
    case 'conditional': {
      const ok = evaluateCondition(action.condition, context);
      const branch = ok ? action.thenActions : action.elseActions;
      return executeActions(branch || [], context);
    }
    case 'sound': {
      const player = context.soundPlayer;
      if (player && typeof player.play === 'function') {
        player.play(action.soundId, action.volume ?? 1);
      }
      break;
    }
    case 'camera': {
      const cam = context.camera;
      const camEnt = ents.find((e) => getComponent(e, 'Camera'));
      const cc = camEnt ? getComponent(camEnt, 'Camera') : null;
      if (!cam || !cc) break;
      if (action.action === 'follow' && action.params?.targetId) {
        cc.followTarget = action.params.targetId;
      } else if (action.action === 'shake' && cam) {
        const str = action.params?.strength ?? 4;
        cam._shake = (cam._shake || 0) + str;
      } else if (action.action === 'pan' && cam) {
        const { x, y } = action.params || {};
        if (typeof x === 'number') cam.x = x;
        if (typeof y === 'number') cam.y = y;
      }
      break;
    }
    default:
      break;
  }
  return undefined;
}

function executeActions(actions, context) {
  let waitAcc = 0;
  if (!Array.isArray(actions)) return { wait: 0 };
  for (const act of actions) {
    const r = executeAction(act, context);
    if (r && typeof r.wait === 'number') waitAcc += r.wait;
  }
  return waitAcc > 0 ? { wait: waitAcc } : undefined;
}

/**
 * Executes script steps (visual scripting). Supports suspension via `wait` actions.
 * @param {object} entity
 * @param {{ events?: object[], variables?: object }} script
 * @param {{ entities: object[], deltaTime?: number, input?: object, variables?: object }} context
 * @returns {{ status: 'complete'|'waiting', remainingWait?: number }}
 */
export function executeScript(entity, script, context) {
  const ctx = {
    ...context,
    ownerEntity: entity,
    variables: { ...(script?.variables || {}), ...(context.variables || {}) },
    dialogueComponent: getComponent(entity, 'Dialogue'),
  };

  const events = script?.events;
  if (!Array.isArray(events) || events.length === 0) {
    return { status: 'complete' };
  }

  let remaining = 0;
  for (const ev of events) {
    if (!ev || ev.type !== 'sequence') continue;
    const actions = ev.actions || [];
    const out = executeActions(actions, ctx);
    if (out && out.wait > 0) remaining += out.wait;
  }

  if (remaining > 0) {
    return { status: 'waiting', remainingWait: remaining };
  }
  return { status: 'complete' };
}
