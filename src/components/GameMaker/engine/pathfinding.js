import { getComponent } from './ecs.js';

function cellIndex(world, gridSize) {
  return Math.floor(world / gridSize);
}

function heuristic(ax, ay, bx, by) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

/**
 * A* on a grid; start/end are world coordinates; returns world waypoints at cell centers.
 *
 * @param {number} startX
 * @param {number} startY
 * @param {number} endX
 * @param {number} endY
 * @param {(0|1)[][]} grid — 0 walkable, 1 blocked
 * @param {number} gridSize
 * @returns {{ x: number, y: number }[]}
 */
export function findPath(startX, startY, endX, endY, grid, gridSize) {
  const cols = grid[0]?.length ?? 0;
  const rows = grid.length;
  if (cols <= 0 || rows <= 0 || gridSize <= 0) return [];

  let sx = cellIndex(startX, gridSize);
  let sy = cellIndex(startY, gridSize);
  let ex = cellIndex(endX, gridSize);
  let ey = cellIndex(endY, gridSize);

  sx = Math.max(0, Math.min(cols - 1, sx));
  sy = Math.max(0, Math.min(rows - 1, sy));
  ex = Math.max(0, Math.min(cols - 1, ex));
  ey = Math.max(0, Math.min(rows - 1, ey));

  if (grid[sy][sx] === 1 || grid[ey][ex] === 1) return [];

  const open = new MinHeap();
  const closed = new Set();
  const cameFrom = new Map();
  const gScore = new Map();
  const key = (x, y) => `${x},${y}`;

  const startKey = key(sx, sy);
  gScore.set(startKey, 0);
  open.push({ x: sx, y: sy, f: heuristic(sx, sy, ex, ey) });

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (open.size() > 0) {
    const cur = open.pop();
    const ck = key(cur.x, cur.y);
    if (closed.has(ck)) continue;
    closed.add(ck);
    if (cur.x === ex && cur.y === ey) {
      const path = [];
      let k = ck;
      while (k) {
        const [cx, cy] = k.split(',').map(Number);
        path.push({
          x: cx * gridSize + gridSize / 2,
          y: cy * gridSize + gridSize / 2,
        });
        k = cameFrom.get(k) || null;
      }
      path.reverse();
      return path;
    }

    const currentG = gScore.get(ck) ?? Infinity;
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
      if (grid[ny][nx] === 1) continue;
      const nk = key(nx, ny);
      const tentative = currentG + 1;
      if (tentative < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, ck);
        gScore.set(nk, tentative);
        const f = tentative + heuristic(nx, ny, ex, ey);
        open.push({ x: nx, y: ny, f });
      }
    }
  }

  return [];
}

class MinHeap {
  constructor() {
    this.a = [];
  }

  size() {
    return this.a.length;
  }

  push(n) {
    this.a.push(n);
    this._up(this.a.length - 1);
  }

  pop() {
    const a = this.a;
    if (a.length === 0) return null;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      this._down(0);
    }
    return top;
  }

  _up(i) {
    const a = this.a;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].f <= a[i].f) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }

  _down(i) {
    const a = this.a;
    const n = a.length;
    while (true) {
      let m = i;
      const l = i * 2 + 1;
      const r = i * 2 + 2;
      if (l < n && a[l].f < a[m].f) m = l;
      if (r < n && a[r].f < a[m].f) m = r;
      if (m === i) break;
      [a[m], a[i]] = [a[i], a[m]];
      i = m;
    }
  }
}

/**
 * Builds a walkability grid from tile solidity and solid colliders.
 * Treats `Tile.solid === true` (tile-sized cell around the transform) or a static box `Collider`
 * (`!isTrigger && RigidBody.isStatic`) as blocking.
 *
 * @param {object[]} entities
 * @param {number} worldWidth
 * @param {number} worldHeight
 * @param {number} gridSize
 * @returns {(0|1)[][]}
 */
export function buildCollisionGrid(entities, worldWidth, worldHeight, gridSize) {
  const cols = Math.max(1, Math.ceil(worldWidth / gridSize));
  const rows = Math.max(1, Math.ceil(worldHeight / gridSize));
  /** @type {(0|1)[][]} */
  const grid = [];
  for (let y = 0; y < rows; y += 1) {
    grid[y] = new Array(cols).fill(0);
  }

  if (!Array.isArray(entities)) return grid;

  for (const e of entities) {
    if (!e || e.active === false) continue;
    const tile = getComponent(e, 'Tile');
    const col = getComponent(e, 'Collider');
    const rb = getComponent(e, 'RigidBody');
    const t = getComponent(e, 'Transform');
    if (!t) continue;

    const blocksTile = tile?.solid === true;
    const blocksCollider =
      col &&
      col.type === 'box' &&
      !col.isTrigger &&
      rb?.isStatic === true;

    if (!blocksTile && !blocksCollider) continue;

    let left;
    let top;
    let right;
    let bottom;

    if (blocksTile && !blocksCollider) {
      const ts = gridSize;
      left = t.x - ts / 2;
      top = t.y - ts / 2;
      right = t.x + ts / 2;
      bottom = t.y + ts / 2;
    } else {
      const w = col?.width ?? 32;
      const h = col?.height ?? 32;
      const ox = col?.offsetX ?? 0;
      const oy = col?.offsetY ?? 0;
      const cx = t.x + ox;
      const cy = t.y + oy;
      left = cx - w / 2;
      top = cy - h / 2;
      right = cx + w / 2;
      bottom = cy + h / 2;
    }

    const x0 = Math.max(0, cellIndex(left, gridSize));
    const x1 = Math.min(cols - 1, cellIndex(right - 0.001, gridSize));
    const y0 = Math.max(0, cellIndex(top, gridSize));
    const y1 = Math.min(rows - 1, cellIndex(bottom - 0.001, gridSize));

    for (let gy = y0; gy <= y1; gy += 1) {
      for (let gx = x0; gx <= x1; gx += 1) {
        grid[gy][gx] = 1;
      }
    }
  }

  return grid;
}
