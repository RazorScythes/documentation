import { getComponent } from './ecs.js';

const DEFAULT_VIEWPORT = 800;

/**
 * @returns {{ x: number, y: number, zoom: number, rotation: number, viewportWidth: number, viewportHeight: number, bounds: null }}
 */
export function createCamera(viewportWidth = DEFAULT_VIEWPORT, viewportHeight = DEFAULT_VIEWPORT) {
  return {
    x: 0,
    y: 0,
    zoom: 1,
    rotation: 0,
    viewportWidth,
    viewportHeight,
    bounds: null,
  };
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Follow Camera component target with smoothing; updates world camera x/y.
 * @param {object} camera
 * @param {object[]} entities
 * @param {number} deltaTime
 */
export function updateCamera(camera, entities, deltaTime) {
  if (!camera || !Array.isArray(entities)) return;

  const camEntity = entities.find(
    (e) => e && e.active !== false && getComponent(e, 'Camera'),
  );
  if (!camEntity) return;

  const camComp = getComponent(camEntity, 'Camera');
  const transform = getComponent(camEntity, 'Transform');
  if (!camComp || !transform) return;

  const zoom = typeof camComp.zoom === 'number' && camComp.zoom > 0 ? camComp.zoom : camera.zoom;
  camera.zoom = zoom;

  const targetId = camComp.followTarget;
  if (!targetId) return;

  const target = entities.find((e) => e && e.id === targetId);
  if (!target) return;

  const tt = getComponent(target, 'Transform');
  if (!tt) return;

  const smoothing =
    typeof camComp.smoothing === 'number' ? clamp(camComp.smoothing, 0, 1) : 0.1;
  const factor = 1 - Math.pow(1 - smoothing, Math.min(deltaTime * 60, 4));

  let cx = lerp(camera.x, tt.x, factor);
  let cy = lerp(camera.y, tt.y, factor);

  const bounds = camComp.bounds || camera.bounds;
  if (bounds && typeof bounds === 'object') {
    const halfW = (camera.viewportWidth / 2) / zoom;
    const halfH = (camera.viewportHeight / 2) / zoom;
    const left = bounds.left ?? bounds.minX ?? -Infinity;
    const right = bounds.right ?? bounds.maxX ?? Infinity;
    const top = bounds.top ?? bounds.minY ?? -Infinity;
    const bottom = bounds.bottom ?? bounds.maxY ?? Infinity;
    cx = clamp(cx, left + halfW, right - halfW);
    cy = clamp(cy, top + halfH, bottom - halfH);
  }

  camera.x = cx;
  camera.y = cy;

  transform.x = cx;
  transform.y = cy;
}

export function screenToWorld(screenX, screenY, camera) {
  const cx = camera.x;
  const cy = camera.y;
  const zoom = camera.zoom > 0 ? camera.zoom : 1;
  const vw = camera.viewportWidth || DEFAULT_VIEWPORT;
  const vh = camera.viewportHeight || DEFAULT_VIEWPORT;
  const wx = cx + (screenX - vw / 2) / zoom;
  const wy = cy + (screenY - vh / 2) / zoom;
  return { x: wx, y: wy };
}

export function worldToScreen(worldX, worldY, camera) {
  const cx = camera.x;
  const cy = camera.y;
  const zoom = camera.zoom > 0 ? camera.zoom : 1;
  const vw = camera.viewportWidth || DEFAULT_VIEWPORT;
  const vh = camera.viewportHeight || DEFAULT_VIEWPORT;
  const sx = (worldX - cx) * zoom + vw / 2;
  const sy = (worldY - cy) * zoom + vh / 2;
  return { x: sx, y: sy };
}

/**
 * Visible world-space AABB for the current camera view.
 */
export function getCameraViewBounds(camera) {
  const zoom = camera.zoom > 0 ? camera.zoom : 1;
  const vw = camera.viewportWidth || DEFAULT_VIEWPORT;
  const vh = camera.viewportHeight || DEFAULT_VIEWPORT;
  const halfW = vw / (2 * zoom);
  const halfH = vh / (2 * zoom);
  return {
    left: camera.x - halfW,
    right: camera.x + halfW,
    top: camera.y - halfH,
    bottom: camera.y + halfH,
  };
}
