/**
 * Flappy Bird sample project.
 * All entities use only components.Transform (no root-level transform field).
 * Collision is handled entirely by the flappy game mode in the runtime.
 */

const T = 'transparent'
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `fb-${Date.now()}-${Math.random().toString(36).slice(2,11)}`

function fill2D(w, h, color = T) {
  return Array.from({ length: h }, () => Array(w).fill(color))
}

function rect(grid, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h && y < grid.length; y++)
    for (let x = x0; x < x0 + w && x < grid[0].length; x++)
      if (x >= 0 && y >= 0) grid[y][x] = color
}

function dot(grid, pts) {
  for (const [x, y, c] of pts)
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) grid[y][x] = c
}

function makeBirdSprite() {
  const id = uid(), w = 16, h = 16
  const Y = '#f59e0b', O = '#ea580c', W = '#ffffff', B = '#000000'

  const px = fill2D(w, h)
  rect(px, 5, 3, 8, 10, Y)
  rect(px, 4, 4, 1, 8, Y)
  rect(px, 3, 5, 1, 6, Y)
  rect(px, 13, 4, 1, 8, Y)
  rect(px, 14, 5, 1, 4, Y)
  rect(px, 9, 4, 3, 3, W)
  dot(px, [[10, 5, B], [11, 5, B]])
  rect(px, 12, 7, 4, 3, O)
  rect(px, 3, 6, 3, 2, '#fbbf24')
  dot(px, [
    [5,3,B],[6,3,B],[7,3,B],[8,3,B],[9,3,B],[10,3,B],[11,3,B],[12,3,B],
    [4,4,B],[13,4,B],[3,5,B],[14,5,B],
    [3,11,B],[13,12,B],[4,12,B],[12,12,B],
    [5,13,B],[6,13,B],[7,13,B],[8,13,B],[9,13,B],[10,13,B],[11,13,B],
  ])

  const fp = fill2D(w, h)
  rect(fp, 5, 4, 8, 9, Y)
  rect(fp, 4, 5, 1, 7, Y)
  rect(fp, 3, 6, 1, 5, Y)
  rect(fp, 13, 5, 1, 7, Y)
  rect(fp, 14, 6, 1, 3, Y)
  rect(fp, 9, 5, 3, 3, W)
  dot(fp, [[10,6,B],[11,6,B]])
  rect(fp, 12, 8, 4, 3, O)
  rect(fp, 2, 3, 4, 2, '#fbbf24')
  dot(fp, [
    [5,4,B],[6,4,B],[7,4,B],[8,4,B],[9,4,B],[10,4,B],[11,4,B],[12,4,B],
    [4,5,B],[13,5,B],[3,6,B],[14,6,B],
    [3,11,B],[13,12,B],[4,12,B],[12,12,B],
    [5,13,B],[6,13,B],[7,13,B],[8,13,B],[9,13,B],[10,13,B],[11,13,B],
  ])

  return {
    id, name: 'Bird', width: w, height: h, pixels: px,
    frames: [
      { pixels: px, layers: [{ id: uid(), name: 'L', visible: true, locked: false, opacity: 1, pixels: px }] },
      { pixels: fp, layers: [{ id: uid(), name: 'L', visible: true, locked: false, opacity: 1, pixels: fp }] },
    ],
    tags: [], collisionMask: null, pivot: { x: 0.5, y: 0.5 },
  }
}

function makePipeSprite() {
  const id = uid(), w = 32, h = 16, px = fill2D(w, h)
  rect(px, 0, 0, 32, 16, '#22c55e')
  rect(px, 0, 0, 2, 16, '#15803d')
  rect(px, 30, 0, 2, 16, '#15803d')
  rect(px, 2, 0, 4, 16, '#4ade80')
  return { id, name: 'Pipe', width: w, height: h, pixels: px, frames: [], tags: [], collisionMask: null, pivot: { x: 0.5, y: 0.5 } }
}

function makePipeCapSprite() {
  const id = uid(), w = 36, h = 8, px = fill2D(w, h)
  rect(px, 0, 0, 36, 8, '#22c55e')
  rect(px, 0, 0, 2, 8, '#166534')
  rect(px, 34, 0, 2, 8, '#166534')
  rect(px, 2, 0, 4, 8, '#4ade80')
  return { id, name: 'PipeCap', width: w, height: h, pixels: px, frames: [], tags: [], collisionMask: null, pivot: { x: 0.5, y: 0.5 } }
}

function makeGroundSprite() {
  const id = uid(), w = 32, h = 8, px = fill2D(w, h)
  rect(px, 0, 0, 32, 2, '#a3e635')
  rect(px, 0, 2, 32, 6, '#854d0e')
  for (let x = 0; x < 32; x += 4) { px[3][x] = '#92400e'; px[3][x+1] = '#92400e'; if (x+2<32) px[5][x+2] = '#78350f' }
  return { id, name: 'Ground', width: w, height: h, pixels: px, frames: [], tags: [], collisionMask: null, pivot: { x: 0.5, y: 0.5 } }
}

function makeCloudSprite() {
  const id = uid(), w = 24, h = 12, px = fill2D(w, h)
  rect(px, 6, 2, 12, 6, '#ffffff')
  rect(px, 4, 4, 16, 4, '#ffffff')
  rect(px, 2, 5, 20, 3, '#ffffff')
  rect(px, 8, 1, 8, 2, '#e0f2fe')
  rect(px, 10, 0, 4, 1, '#e0f2fe')
  return { id, name: 'Cloud', width: w, height: h, pixels: px, frames: [], tags: [], collisionMask: null, pivot: { x: 0.5, y: 0.5 } }
}

function ent(name, tags, x, y, z, comps) {
  return {
    id: uid(), name, active: true, tags, parentId: null,
    components: { Transform: { x, y, scaleX: 1, scaleY: 1, rotation: 0, zIndex: z }, ...comps },
  }
}

export function generateFlappyBirdProject() {
  const bird = makeBirdSprite()
  const pipe = makePipeSprite()
  const cap  = makePipeCapSprite()
  const gnd  = makeGroundSprite()
  const cld  = makeCloudSprite()

  const W = 400, H = 600, GROUND_Y = 555, GAP = 150, PIPE_W = 52, SPACING = 220

  const entities = []

  entities.push(ent('Bird', ['bird'], 80, 250, 10, {
    SpriteRenderer: { spriteId: bird.id, frameIndex: 0, flipX: false, flipY: false, opacity: 1, tint: null, width: 34, height: 34 },
    RigidBody: { velocityX: 0, velocityY: 0, gravityScale: 0, friction: 0, mass: 1, isStatic: false, isKinematic: false },
  }))

  for (let i = 0; i < 15; i++) {
    entities.push(ent(`Ground_${i}`, ['ground'], i * 64, GROUND_Y, 5, {
      SpriteRenderer: { spriteId: gnd.id, frameIndex: 0, flipX: false, flipY: false, opacity: 1, tint: null, width: 64, height: 50 },
    }))
  }

  for (let i = 0; i < 6; i++) {
    const px = W + 100 + i * SPACING
    const gc = 170 + Math.floor(Math.random() * 220)
    const topH = gc - GAP / 2
    const botY = gc + GAP / 2
    const botH = GROUND_Y - botY

    entities.push(ent(`PipeTop_${i}`, ['pipe','obstacle'], px, topH / 2, 3, {
      SpriteRenderer: { spriteId: pipe.id, frameIndex: 0, flipX: false, flipY: true, opacity: 1, tint: null, width: PIPE_W, height: topH },
    }))
    entities.push(ent(`CapTop_${i}`, ['pipe-cap'], px, topH - 8, 4, {
      SpriteRenderer: { spriteId: cap.id, frameIndex: 0, flipX: false, flipY: true, opacity: 1, tint: null, width: PIPE_W + 8, height: 16 },
    }))
    entities.push(ent(`PipeBot_${i}`, ['pipe','obstacle'], px, botY + botH / 2, 3, {
      SpriteRenderer: { spriteId: pipe.id, frameIndex: 0, flipX: false, flipY: false, opacity: 1, tint: null, width: PIPE_W, height: botH },
    }))
    entities.push(ent(`CapBot_${i}`, ['pipe-cap'], px, botY + 8, 4, {
      SpriteRenderer: { spriteId: cap.id, frameIndex: 0, flipX: false, flipY: false, opacity: 1, tint: null, width: PIPE_W + 8, height: 16 },
    }))
    entities.push(ent(`Score_${i}`, ['score-zone'], px, gc, 0, {}))
  }

  for (let i = 0; i < 4; i++) {
    entities.push(ent(`Cloud_${i}`, ['cloud'], 60 + i * 180 + Math.floor(Math.random() * 80), 30 + Math.floor(Math.random() * 100), 0, {
      SpriteRenderer: { spriteId: cld.id, frameIndex: 0, flipX: false, flipY: false, opacity: 0.5, tint: null, width: 64, height: 32 },
    }))
  }

  const sceneId = uid()
  return {
    projectName: 'Flappy Bird',
    gameSettings: {
      screenWidth: W, screenHeight: H, targetFps: 60,
      backgroundColor: '#87ceeb', defaultGridSize: 32,
      gridColor: 'rgba(255,255,255,0.15)', snapToGridDefault: true,
      gravityX: 0, gravityY: 600, defaultFriction: 0,
      gameMode: 'flappy',
    },
    scenes: [{ id: sceneId, name: 'Main', entities, tileMap: { layers: { background: [], mid: [], foreground: [] }, width: 0, height: 0, tileSize: 32 }, camera: {}, layers: [] }],
    currentSceneId: sceneId,
    sprites: [bird, pipe, cap, gnd, cld],
    tilesets: [], prefabs: [], scripts: [], biomes: [],
    variables: { score: 0, highScore: 0 },
    assets: {}, dialogues: [],
  }
}
