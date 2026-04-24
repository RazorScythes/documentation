/**
 * Entity–Component–System core: entities, prefabs, and default component shapes.
 */

const COMPONENT_DEFAULTS = {
  Transform: {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    zIndex: 0,
  },
  SpriteRenderer: {
    spriteId: null,
    frameIndex: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    tint: null,
    width: 32,
    height: 32,
  },
  Collider: {
    type: 'box',
    width: 32,
    height: 32,
    offsetX: 0,
    offsetY: 0,
    isTrigger: false,
  },
  RigidBody: {
    velocityX: 0,
    velocityY: 0,
    gravityScale: 1,
    friction: 0.1,
    mass: 1,
    isStatic: false,
    isKinematic: false,
  },
  Animator: {
    currentAnimation: null,
    animations: {},
    playing: false,
    speed: 1,
    loop: true,
    currentFrame: 0,
    elapsed: 0,
  },
  Script: {
    events: [],
    variables: {},
  },
  Spawner: {
    prefabId: null,
    rate: 1,
    maxCount: 10,
    spawnArea: { width: 100, height: 100 },
    active: true,
  },
  Tile: {
    tilesetId: null,
    tileIndex: 0,
    layer: 'mid',
    solid: false,
  },
  EventTrigger: {
    triggerType: 'onCollision',
    targetTag: null,
    actions: [],
    cooldown: 0,
    lastTriggered: 0,
  },
  PlayerController: {
    speed: 150,
    sprintMultiplier: 1.5,
    interactRange: 48,
  },
  NPC: {
    dialogueId: null,
    pathPoints: [],
    patrolSpeed: 50,
    currentPathIndex: 0,
    state: 'idle',
  },
  Camera: {
    followTarget: null,
    smoothing: 0.1,
    bounds: null,
    zoom: 1,
  },
  ParallaxLayer: {
    speedX: 0.5,
    speedY: 0.5,
    repeatX: true,
    repeatY: false,
  },
  Dialogue: {
    lines: [],
    currentLine: 0,
    active: false,
    speakerName: '',
  },
};

let idCounter = 0;

function generateId() {
  idCounter += 1;
  return `ent_${Date.now().toString(36)}_${idCounter.toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function deepClone(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepClone);
  const out = {};
  for (const k of Object.keys(value)) {
    out[k] = deepClone(value[k]);
  }
  return out;
}

function createEntity(name = 'Entity') {
  return {
    id: generateId(),
    name,
    components: {},
    active: true,
    children: [],
    parent: null,
    tags: [],
  };
}

function mergeDefaults(name, data) {
  const defaults = COMPONENT_DEFAULTS[name];
  if (!defaults) return deepClone(data);
  const base = deepClone(defaults);
  if (!data || typeof data !== 'object') return base;
  return { ...base, ...deepClone(data) };
}

function addComponent(entity, componentName, data = {}) {
  if (!entity || typeof entity.components !== 'object') {
    throw new TypeError('addComponent: invalid entity');
  }
  entity.components[componentName] = mergeDefaults(componentName, data);
  return entity;
}

function removeComponent(entity, componentName) {
  if (entity?.components && Object.prototype.hasOwnProperty.call(entity.components, componentName)) {
    delete entity.components[componentName];
  }
}

function getComponent(entity, componentName) {
  if (!entity?.components) return null;
  const c = entity.components[componentName];
  return c === undefined ? null : c;
}

function hasComponent(entity, componentName) {
  return !!(entity?.components && Object.prototype.hasOwnProperty.call(entity.components, componentName));
}

function cloneEntity(entity) {
  if (!entity) return null;
  const copy = {
    id: generateId(),
    name: entity.name,
    components: deepClone(entity.components),
    active: entity.active !== false,
    tags: Array.isArray(entity.tags) ? [...entity.tags] : [],
    parent: entity.parent ?? null,
    children: [],
  };
  if (Array.isArray(entity.children)) {
    copy.children = entity.children.map((child) => {
      const c = cloneEntity(child);
      if (c) c.parent = copy.id;
      return c;
    });
  }
  return copy;
}

function stripEntityForPrefab(source) {
  const e = deepClone(source);
  delete e.id;
  e.parent = null;
  e.children = [];
  return e;
}

function createPrefab(entity) {
  return stripEntityForPrefab(entity);
}

function applyOverrides(components, overrides) {
  if (!overrides || typeof overrides !== 'object') return components;
  const result = deepClone(components);
  for (const [name, data] of Object.entries(overrides)) {
    if (data === null) {
      delete result[name];
      continue;
    }
    result[name] = mergeDefaults(name, data);
  }
  return result;
}

function instantiatePrefab(prefab, overrides = {}) {
  const inst = createEntity(prefab.name || 'Entity');
  inst.tags = Array.isArray(prefab.tags) ? [...prefab.tags] : [];
  inst.active = prefab.active !== false;
  inst.components = applyOverrides(prefab.components || {}, overrides);
  return inst;
}

export {
  generateId,
  createEntity,
  addComponent,
  removeComponent,
  getComponent,
  hasComponent,
  cloneEntity,
  createPrefab,
  instantiatePrefab,
  COMPONENT_DEFAULTS,
};
