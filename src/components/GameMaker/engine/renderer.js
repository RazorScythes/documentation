import { getComponent } from './ecs.js';
import { worldToScreen, screenToWorld } from './camera.js';

const DEFAULT_LAYER_ORDER = ['background', 'mid', 'foreground', 'ui'];

/**
 * @param {object[]} entities
 * @param {object[]} out
 */
function flattenEntities(entities, out = []) {
  if (!Array.isArray(entities)) return out;
  for (const e of entities) {
    if (!e) continue;
    out.push(e);
    if (Array.isArray(e.children) && e.children.length) {
      flattenEntities(e.children, out);
    }
  }
  return out;
}

function layerOf(entity) {
  const sr = getComponent(entity, 'SpriteRenderer');
  const tile = getComponent(entity, 'Tile');
  const pl = getComponent(entity, 'ParallaxLayer');
  if (sr?.layer) return sr.layer;
  if (tile?.layer) return tile.layer;
  if (pl) return 'background';
  return 'mid';
}

function mergeRects(rects) {
  if (!rects.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.w);
    maxY = Math.max(maxY, r.y + r.h);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/**
 * @param {HTMLCanvasElement} canvas
 */
export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('createRenderer: 2D context unavailable');

  const state = {
    showGrid: false,
    gridSize: 32,
    gridColor: 'rgba(255,255,255,0.15)',
    showDebugColliders: false,
    /** @type {Set<string>} */
    selectionIds: new Set(),
    optimizeDirty: false,
    dirtyRects: [],
    fullDirty: true,
    padding: 4,
  };

  function clearRectRegion(x, y, w, h) {
    ctx.clearRect(x, y, w, h);
  }

  function drawSprite(_entity, t, sr, drawX, drawY, cam, atlases, _plx) {
    const atlas = atlases[sr.spriteId];
    if (!atlas?.image) return;
    const fw = atlas.frameWidth ?? sr.width ?? 32;
    const fh = atlas.frameHeight ?? sr.height ?? 32;
    const cols = atlas.columns ?? 1;
    const frame = sr.frameIndex ?? 0;
    const sx = (frame % cols) * fw;
    const sy = Math.floor(frame / cols) * fh;
    const opacity = sr.opacity ?? 1;
    const scr = worldToScreen(drawX, drawY, cam);
    const zoom = cam.zoom > 0 ? cam.zoom : 1;
    const dw = sr.width * Math.abs(t.scaleX ?? 1) * zoom;
    const dh = sr.height * Math.abs(t.scaleY ?? 1) * zoom;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(scr.x, scr.y);
    ctx.rotate(((t.rotation ?? 0) * Math.PI) / 180);
    const fx = sr.flipX ? -1 : 1;
    const fy = sr.flipY ? -1 : 1;
    ctx.scale(fx, fy);
    try {
      ctx.drawImage(atlas.image, sx, sy, fw, fh, (-dw / 2) * fx, (-dh / 2) * fy, dw * fx, dh * fy);
    } catch {
      /* decode / CORS */
    }
    ctx.restore();
  }

  function drawAtlasFrame(atlas, frame, drawX, drawY, t, sr, cam, _tile, _plx) {
    const fw = atlas.frameWidth ?? 32;
    const fh = atlas.frameHeight ?? 32;
    const cols = atlas.columns ?? 1;
    const sx = (frame % cols) * fw;
    const sy = Math.floor(frame / cols) * fh;
    const scr = worldToScreen(drawX, drawY, cam);
    const zoom = cam.zoom > 0 ? cam.zoom : 1;
    const w = (sr?.width ?? fw) * Math.abs(t.scaleX ?? 1) * zoom;
    const h = (sr?.height ?? fh) * Math.abs(t.scaleY ?? 1) * zoom;
    ctx.save();
    ctx.globalAlpha = sr?.opacity ?? 1;
    ctx.translate(scr.x, scr.y);
    ctx.rotate(((t.rotation ?? 0) * Math.PI) / 180);
    try {
      ctx.drawImage(atlas.image, sx, sy, fw, fh, -w / 2, -h / 2, w, h);
    } catch {
      /* ignore */
    }
    ctx.restore();
  }

  function drawEntity(entity, cam, atlases) {
    const t = getComponent(entity, 'Transform');
    if (!t) return;
    const sr = getComponent(entity, 'SpriteRenderer');
    const tile = getComponent(entity, 'Tile');
    const plx = getComponent(entity, 'ParallaxLayer');

    let drawX = t.x;
    let drawY = t.y;
    if (plx) {
      drawX -= (cam.x || 0) * (plx.speedX ?? 0);
      drawY -= (cam.y || 0) * (plx.speedY ?? 0);
    }

    if (sr && sr.spriteId && atlases[sr.spriteId]) {
      drawSprite(entity, t, sr, drawX, drawY, cam, atlases, plx);
      return;
    }

    if (tile && tile.tilesetId && atlases[tile.tilesetId]) {
      const atlasId = tile.tilesetId;
      const frame = tile.tileIndex ?? 0;
      const atlas = atlases[atlasId];
      drawAtlasFrame(atlas, frame, drawX, drawY, t, sr, cam, tile, plx);
    }
  }

  const api = {
    canvas,
    ctx,
    state,

    clear() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    markFullDirty() {
      state.fullDirty = true;
      state.dirtyRects.length = 0;
    },

    addDirtyRect(x, y, w, h) {
      state.dirtyRects.push({ x, y, w, h });
    },

    setSize(width, height) {
      canvas.width = width;
      canvas.height = height;
      state.fullDirty = true;
    },

    drawGrid(cam, gridSize = 32, color = 'rgba(255,255,255,0.12)') {
      const vw = cam.viewportWidth ?? canvas.width;
      const vh = cam.viewportHeight ?? canvas.height;
      const zoom = cam.zoom > 0 ? cam.zoom : 1;
      const bounds = {
        left: cam.x - vw / (2 * zoom),
        right: cam.x + vw / (2 * zoom),
        top: cam.y - vh / (2 * zoom),
        bottom: cam.y + vh / (2 * zoom),
      };
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      const startX = Math.floor(bounds.left / gridSize) * gridSize;
      const startY = Math.floor(bounds.top / gridSize) * gridSize;
      for (let wx = startX; wx <= bounds.right; wx += gridSize) {
        const a = worldToScreen(wx, bounds.top, cam);
        const b = worldToScreen(wx, bounds.bottom, cam);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (let wy = startY; wy <= bounds.bottom; wy += gridSize) {
        const a = worldToScreen(bounds.left, wy, cam);
        const b = worldToScreen(bounds.right, wy, cam);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.restore();
    },

    screenToWorld(screenX, screenY, camera) {
      return screenToWorld(screenX, screenY, camera);
    },

    worldToScreen(worldX, worldY, camera) {
      return worldToScreen(worldX, worldY, camera);
    },

    /**
     * @param {object[]} entities
     * @param {object} camera — runtime camera `{ x, y, zoom, viewportWidth, viewportHeight }`
     * @param {object} assets — `{ atlases: { [spriteId]: { image, frameWidth, frameHeight, columns, rows? } } }`
     * @param {string[]} [layers] — draw order
     */
    render(entities, camera, assets, layers = DEFAULT_LAYER_ORDER) {
      const cam = camera || { x: 0, y: 0, zoom: 1, viewportWidth: canvas.width, viewportHeight: canvas.height };
      const atlases = assets?.atlases || {};
      const flat = flattenEntities(entities);

      let clip = null;
      if (state.optimizeDirty && !state.fullDirty && state.dirtyRects.length) {
        const pad = state.padding;
        const merged = mergeRects(state.dirtyRects);
        if (merged) {
          clip = {
            x: Math.max(0, merged.x - pad),
            y: Math.max(0, merged.y - pad),
            w: Math.min(canvas.width, merged.w + pad * 2),
            h: Math.min(canvas.height, merged.h + pad * 2),
          };
        }
      }

      ctx.save();
      if (clip) {
        ctx.beginPath();
        ctx.rect(clip.x, clip.y, clip.w, clip.h);
        ctx.clip();
        clearRectRegion(clip.x, clip.y, clip.w, clip.h);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      const buckets = Object.create(null);
      for (const name of layers) buckets[name] = [];

      for (const e of flat) {
        if (!e || e.active === false) continue;
        const ly = layerOf(e);
        if (!buckets[ly]) buckets[ly] = [];
        buckets[ly].push(e);
      }

      const order = layers.length ? layers : DEFAULT_LAYER_ORDER;

      function sortByZ(list) {
        return list.sort((a, b) => {
          const za = getComponent(a, 'Transform')?.zIndex ?? 0;
          const zb = getComponent(b, 'Transform')?.zIndex ?? 0;
          return za - zb;
        });
      }

      for (const layerName of order) {
        const list = buckets[layerName];
        if (!list || !list.length) continue;
        sortByZ(list);
        for (const entity of list) {
          drawEntity(entity, cam, atlases);
        }
      }

      if (state.showGrid) {
        api.drawGrid(cam, state.gridSize, state.gridColor);
      }

      if (state.showDebugColliders) {
        for (const e of flat) {
          if (!e || e.active === false) continue;
          const col = getComponent(e, 'Collider');
          const t = getComponent(e, 'Transform');
          if (!col || col.type !== 'box' || !t) continue;
          const w = col.width ?? 32;
          const h = col.height ?? 32;
          const ox = col.offsetX ?? 0;
          const oy = col.offsetY ?? 0;
          const wx = t.x + ox;
          const wy = t.y + oy;
          const tl = worldToScreen(wx - w / 2, wy - h / 2, cam);
          const br = worldToScreen(wx + w / 2, wy + h / 2, cam);
          ctx.save();
          ctx.strokeStyle = col.isTrigger ? 'rgba(0,255,255,0.8)' : 'rgba(255,165,0,0.85)';
          ctx.lineWidth = 1;
          ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
          ctx.restore();
        }
      }

      for (const e of flat) {
        if (!e || e.active === false) continue;
        if (!state.selectionIds.has(e.id)) continue;
        const t = getComponent(e, 'Transform');
        const sr = getComponent(e, 'SpriteRenderer');
        if (!t) continue;
        const hw = ((sr?.width ?? 32) * (t.scaleX ?? 1)) / 2;
        const hh = ((sr?.height ?? 32) * (t.scaleY ?? 1)) / 2;
        const c1 = worldToScreen(t.x - hw, t.y - hh, cam);
        const c2 = worldToScreen(t.x + hw, t.y + hh, cam);
        ctx.save();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.strokeRect(c1.x, c1.y, c2.x - c1.x, c2.y - c1.y);
        ctx.restore();
      }

      ctx.restore();

      if (state.optimizeDirty) {
        state.fullDirty = false;
        state.dirtyRects.length = 0;
      }
    },
  };

  return api;
}
