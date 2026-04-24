import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const TRANSPARENT = 'rgba(0,0,0,0)'
const UNDO_CAP = 80

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/** @param {number} w @param {number} h @param {string} fill */
export function makeEmptyPixels(w, h, fill = TRANSPARENT) {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => fill))
}

function clonePixels(pixels) {
  return pixels.map((row) => row.slice())
}

function cloneLayers(layers) {
  return layers.map((layer) => ({
    ...layer,
    pixels: clonePixels(layer.pixels),
  }))
}

function cloneFrames(frames) {
  return frames.map((fr) => ({
    ...fr,
    layers: cloneLayers(fr.layers),
  }))
}

/**
 * Returns [r,g,b,a] with a in 0–255 for ImageData.
 * @param {string} color
 */
function parseRgbaComponents(color) {
  const t = color.trim()
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(t)
  if (hex) {
    return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16), 255]
  }
  const m =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i.exec(t)
  if (m) {
    const r = Math.round(Number(m[1]))
    const g = Math.round(Number(m[2]))
    const b = Math.round(Number(m[3]))
    if (m[4] === undefined) {
      return [r, g, b, 255]
    }
    const rawA = parseFloat(m[4])
    const a255 = rawA <= 1 ? Math.round(rawA * 255) : Math.round(rawA)
    return [r, g, b, Math.max(0, Math.min(255, a255))]
  }
  return [0, 0, 0, 0]
}

function blendRgbaOver(dstStr, srcStr, srcOpacity = 1) {
  const [dr, dg, db, da] = parseRgbaComponents(dstStr)
  const [sr, sg, sb, sa] = parseRgbaComponents(srcStr)
  const sA = (sa / 255) * srcOpacity
  const dA = da / 255
  const outA = sA + dA * (1 - sA)
  if (outA <= 1e-4) return TRANSPARENT
  const r = (sr * sA + dr * dA * (1 - sA)) / outA
  const g = (sg * sA + dg * dA * (1 - sA)) / outA
  const b = (sb * sA + db * dA * (1 - sA)) / outA
  const aOut = Math.min(1, outA)
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${aOut})`
}

/** @param {string[][]} grid @param {number} x @param {number} y @param {number} brush @param {string} color */
function paintBrush(grid, x, y, brush, color) {
  const h = grid.length
  const w = grid[0]?.length ?? 0
  const half = Math.floor(brush / 2)
  for (let dy = -half; dy <= half; dy++) {
    for (let dx = -half; dx <= half; dx++) {
      const px = x + dx
      const py = y + dy
      if (px >= 0 && py >= 0 && px < w && py < h) {
        const row = [...grid[py]]
        row[px] = color
        grid[py] = row
      }
    }
  }
}

/** @param {ReturnType<typeof cloneLayers>} layers */
function flattenLayersToPixels(layers, canvasWidth, canvasHeight) {
  const out = makeEmptyPixels(canvasWidth, canvasHeight)
  if (!layers.length) return out
  for (const layer of layers) {
    if (!layer.visible) continue
    const op = typeof layer.opacity === 'number' ? layer.opacity : 1
    if (op <= 0) continue
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const src = layer.pixels[y]?.[x] ?? TRANSPARENT
        if (src === TRANSPARENT || src === 'transparent') continue
        const dst = out[y][x]
        out[y][x] = blendRgbaOver(dst, src, op)
      }
    }
  }
  return out
}

export const useSpriteEditorStore = create(
  devtools(
    (set, get) => {
      const snapshotForUndo = () => {
        const s = get()
        return {
          layers: cloneLayers(s.layers),
          pixels: clonePixels(s.pixels),
          frames: cloneFrames(s.frames),
          currentFrame: s.currentFrame,
          canvasWidth: s.canvasWidth,
          canvasHeight: s.canvasHeight,
        }
      }

      const pushUndo = () => {
        const snap = snapshotForUndo()
        set(
          (s) => ({
            undoStack: [...s.undoStack, snap].slice(-UNDO_CAP),
            redoStack: [],
          }),
          false,
          'sprite/pushUndo'
        )
      }

      const syncActivePixels = (layers, activeLayerId) => {
        const layer = layers.find((l) => l.id === activeLayerId)
        return layer ? clonePixels(layer.pixels) : makeEmptyPixels(get().canvasWidth, get().canvasHeight)
      }

      return {
        currentSpriteId: null,
        canvasWidth: 32,
        canvasHeight: 32,
        pixels: makeEmptyPixels(32, 32),
        layers: [],
        activeLayerId: '',
        currentFrame: 0,
        frames: [],
        selectedColor: '#000000',
        selectedTool: 'pencil',
        brushSize: 1,
        palette: [],
        onionSkinEnabled: false,
        onionSkinFrames: 1,
        animationPlaying: false,
        animationFPS: 12,
        zoom: 8,
        undoStack: [],
        redoStack: [],

        newSprite(width, height) {
          const w = Math.max(1, Math.floor(width) || 32)
          const h = Math.max(1, Math.floor(height) || 32)
          const pixels = makeEmptyPixels(w, h)
          const layerId = newId()
          const layer = {
            id: layerId,
            name: 'Layer 1',
            visible: true,
            locked: false,
            opacity: 1,
            pixels: clonePixels(pixels),
          }
          const frameLayers = cloneLayers([layer])
          set(
            {
              currentSpriteId: null,
              canvasWidth: w,
              canvasHeight: h,
              pixels: clonePixels(pixels),
              layers: [layer],
              activeLayerId: layerId,
              currentFrame: 0,
              frames: [{ layers: frameLayers }],
              selectedColor: '#000000',
              selectedTool: 'pencil',
              brushSize: 1,
              onionSkinEnabled: false,
              animationPlaying: false,
              undoStack: [],
              redoStack: [],
            },
            false,
            'sprite/newSprite'
          )
        },

        setPixel(x, y, color) {
          const s = get()
          if (s.layers.length === 0) return
          const layer = s.layers.find((l) => l.id === s.activeLayerId)
          if (!layer || layer.locked) return
          pushUndo()
          const ix = Math.floor(x)
          const iy = Math.floor(y)
          const nextLayers = s.layers.map((L) => {
            if (L.id !== s.activeLayerId) return L
            const grid = L.pixels.map((row) => [...row])
            paintBrush(grid, ix, iy, Math.max(1, s.brushSize), color)
            return { ...L, pixels: grid }
          })
          set(
            {
              layers: nextLayers,
              pixels: syncActivePixels(nextLayers, s.activeLayerId),
            },
            false,
            'sprite/setPixel'
          )
        },

        setPixels(pixelArray) {
          if (!Array.isArray(pixelArray) || pixelArray.length === 0) return
          const s = get()
          if (s.layers.length === 0) return
          const layer = s.layers.find((l) => l.id === s.activeLayerId)
          if (!layer || layer.locked) return
          pushUndo()
          const nextLayers = s.layers.map((L) => {
            if (L.id !== s.activeLayerId) return L
            const grid = L.pixels.map((row) => row.slice())
            for (const p of pixelArray) {
              const px = Math.floor(p.x)
              const py = Math.floor(p.y)
              const c = p.color ?? s.selectedColor
              if (px >= 0 && py >= 0 && py < grid.length && px < (grid[0]?.length ?? 0)) {
                const row = [...grid[py]]
                row[px] = c
                grid[py] = row
              }
            }
            return { ...L, pixels: grid }
          })
          set(
            {
              layers: nextLayers,
              pixels: syncActivePixels(nextLayers, s.activeLayerId),
            },
            false,
            'sprite/setPixels'
          )
        },

        fill(x, y, fillColor) {
          const s = get()
          if (s.layers.length === 0) return
          const layer = s.layers.find((l) => l.id === s.activeLayerId)
          if (!layer || layer.locked) return
          const sx = Math.floor(x)
          const sy = Math.floor(y)
          const grid = layer.pixels
          if (!grid.length || sy < 0 || sx < 0 || sy >= grid.length || sx >= (grid[0]?.length ?? 0)) return
          const target = grid[sy][sx]
          const replacement = fillColor ?? s.selectedColor
          if (target === replacement) return

          pushUndo()
          const filled = grid.map((row) => [...row])
          const h = filled.length
          const w = filled[0]?.length ?? 0
          const q = [[sx, sy]]
          const seen = new Set([`${sx},${sy}`])
          while (q.length) {
            const [cx, cy] = q.shift()
            if (filled[cy][cx] !== target) continue
            filled[cy][cx] = replacement
            const nbs = [
              [cx + 1, cy],
              [cx - 1, cy],
              [cx, cy + 1],
              [cx, cy - 1],
            ]
            for (const [nx, ny] of nbs) {
              if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
              const key = `${nx},${ny}`
              if (seen.has(key)) continue
              if (filled[ny][nx] === target) {
                seen.add(key)
                q.push([nx, ny])
              }
            }
          }
          const nextLayers = s.layers.map((L) =>
            L.id === s.activeLayerId ? { ...L, pixels: filled } : L
          )
          set(
            {
              layers: nextLayers,
              pixels: syncActivePixels(nextLayers, s.activeLayerId),
            },
            false,
            'sprite/fill'
          )
        },

        clearCanvas() {
          const s = get()
          if (s.layers.length === 0) return
          pushUndo()
          const empty = makeEmptyPixels(s.canvasWidth, s.canvasHeight)
          const nextLayers = s.layers.map((L) =>
            L.id === s.activeLayerId ? { ...L, pixels: clonePixels(empty) } : L
          )
          set(
            {
              layers: nextLayers,
              pixels: clonePixels(empty),
            },
            false,
            'sprite/clearCanvas'
          )
        },

        addLayer() {
          pushUndo()
          set(
            (s) => {
              const id = newId()
              const pixels = makeEmptyPixels(s.canvasWidth, s.canvasHeight)
              const layer = {
                id,
                name: `Layer ${s.layers.length + 1}`,
                visible: true,
                locked: false,
                opacity: 1,
                pixels,
              }
              const nextLayers = [...s.layers, layer]
              return {
                layers: nextLayers,
                activeLayerId: id,
                pixels: clonePixels(pixels),
                frames: s.frames.map((fr, i) =>
                  i === s.currentFrame ? { layers: cloneLayers(nextLayers) } : fr
                ),
              }
            },
            false,
            'sprite/addLayer'
          )
        },

        removeLayer(id) {
          const s = get()
          if (s.layers.length <= 1) return
          pushUndo()
          const nextLayers = s.layers.filter((l) => l.id !== id)
          const active =
            s.activeLayerId === id ? nextLayers[nextLayers.length - 1].id : s.activeLayerId
          set(
            {
              layers: nextLayers,
              activeLayerId: active,
              pixels: syncActivePixels(nextLayers, active),
              frames: s.frames.map((fr, i) =>
                i === s.currentFrame ? { layers: cloneLayers(nextLayers) } : fr
              ),
            },
            false,
            'sprite/removeLayer'
          )
        },

        setActiveLayer(id) {
          const s = get()
          if (!s.layers.some((l) => l.id === id)) return
          set(
            {
              activeLayerId: id,
              pixels: syncActivePixels(s.layers, id),
            },
            false,
            'sprite/setActiveLayer'
          )
        },

        toggleLayerVisibility(id) {
          pushUndo()
          set(
            (s) => ({
              layers: s.layers.map((l) =>
                l.id === id ? { ...l, visible: !l.visible } : l
              ),
            }),
            false,
            'sprite/toggleLayerVisibility'
          )
        },

        reorderLayers(newOrder) {
          if (!Array.isArray(newOrder)) return
          pushUndo()
          const s = get()
          const byId = new Map(s.layers.map((l) => [l.id, l]))
          const next = newOrder.map((nid) => byId.get(nid)).filter(Boolean)
          if (next.length !== s.layers.length) return
          set(
            {
              layers: next,
              pixels: syncActivePixels(next, s.activeLayerId),
              frames: s.frames.map((fr, i) =>
                i === s.currentFrame ? { layers: cloneLayers(next) } : fr
              ),
            },
            false,
            'sprite/reorderLayers'
          )
        },

        addFrame() {
          pushUndo()
          const s = get()
          const snapshot = cloneLayers(s.layers)
          const nextFrames = [...s.frames, { layers: cloneLayers(snapshot) }]
          set(
            {
              frames: nextFrames,
              currentFrame: nextFrames.length - 1,
            },
            false,
            'sprite/addFrame'
          )
        },

        removeFrame(index) {
          const s = get()
          if (s.frames.length <= 1) return
          pushUndo()
          const frames = s.frames.filter((_, i) => i !== index)
          let currentFrame = s.currentFrame
          if (index < currentFrame) currentFrame -= 1
          else if (index === currentFrame) currentFrame = Math.min(currentFrame, frames.length - 1)
          const target = frames[currentFrame]
          const layers = target ? cloneLayers(target.layers) : cloneLayers(s.layers)
          const activeLayerId =
            layers.find((l) => l.id === s.activeLayerId)?.id ?? layers[0]?.id ?? ''
          set(
            {
              frames,
              currentFrame,
              layers,
              activeLayerId,
              pixels: syncActivePixels(layers, activeLayerId),
            },
            false,
            'sprite/removeFrame'
          )
        },

        setCurrentFrame(index) {
          const s = get()
          if (index < 0 || index >= s.frames.length) return
          pushUndo()
          const nextFrames = s.frames.map((fr, i) =>
            i === s.currentFrame ? { layers: cloneLayers(s.layers) } : fr
          )
          const target = nextFrames[index]
          const layers = cloneLayers(target.layers)
          const activeLayerId = layers[0]?.id ?? s.activeLayerId
          set(
            {
              frames: nextFrames,
              currentFrame: index,
              layers,
              activeLayerId,
              pixels: syncActivePixels(layers, activeLayerId),
            },
            false,
            'sprite/setCurrentFrame'
          )
        },

        /** Same as setCurrentFrame but does not record undo (used for animation scrubbing). */
        setCurrentFrameSilent(index) {
          const s = get()
          if (index < 0 || index >= s.frames.length) return
          const nextFrames = s.frames.map((fr, i) =>
            i === s.currentFrame ? { layers: cloneLayers(s.layers) } : fr
          )
          const target = nextFrames[index]
          const layers = cloneLayers(target.layers)
          const activeLayerId =
            layers.find((l) => l.id === s.activeLayerId)?.id ?? layers[0]?.id ?? s.activeLayerId
          set(
            {
              frames: nextFrames,
              currentFrame: index,
              layers,
              activeLayerId,
              pixels: syncActivePixels(layers, activeLayerId),
            },
            false,
            'sprite/setCurrentFrameSilent'
          )
        },

        setCurrentSpriteId(id) {
          set({ currentSpriteId: id ?? null }, false, 'sprite/setCurrentSpriteId')
        },

        setAnimationFPS(fps) {
          const n = Math.max(1, Math.min(60, Math.floor(Number(fps)) || 12))
          set({ animationFPS: n }, false, 'sprite/setAnimationFPS')
        },

        toggleLayerLock(id) {
          pushUndo()
          set(
            (s) => ({
              layers: s.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)),
              frames: s.frames.map((fr, i) =>
                i === s.currentFrame
                  ? {
                      layers: fr.layers.map((l) =>
                        l.id === id ? { ...l, locked: !l.locked } : l
                      ),
                    }
                  : fr
              ),
            }),
            false,
            'sprite/toggleLayerLock'
          )
        },

        setLayerOpacity(id, opacity) {
          const op = Math.max(0, Math.min(1, Number(opacity)))
          pushUndo()
          set(
            (s) => ({
              layers: s.layers.map((l) => (l.id === id ? { ...l, opacity: op } : l)),
              frames: s.frames.map((fr, i) =>
                i === s.currentFrame
                  ? {
                      layers: fr.layers.map((l) =>
                        l.id === id ? { ...l, opacity: op } : l
                      ),
                    }
                  : fr
              ),
            }),
            false,
            'sprite/setLayerOpacity'
          )
        },

        duplicateFrame(index) {
          const s = get()
          if (index < 0 || index >= s.frames.length) return
          pushUndo()
          const dup = cloneFrames([s.frames[index]])[0]
          const frames = [...s.frames.slice(0, index + 1), dup, ...s.frames.slice(index + 1)]
          const newIndex = index + 1
          const layers = cloneLayers(dup.layers)
          const activeLayerId = layers[0]?.id ?? ''
          set(
            {
              frames,
              currentFrame: newIndex,
              layers,
              activeLayerId,
              pixels: syncActivePixels(layers, activeLayerId),
            },
            false,
            'sprite/duplicateFrame'
          )
        },

        setTool(tool) {
          set({ selectedTool: tool }, false, 'sprite/setTool')
        },

        setColor(color) {
          const c = color ?? '#000000'
          set(
            (s) => {
              const pal = [c, ...s.palette.filter((x) => x !== c)].slice(0, 32)
              return { selectedColor: c, palette: pal }
            },
            false,
            'sprite/setColor'
          )
        },

        setBrushSize(size) {
          const n = Math.max(1, Math.floor(Number(size)) || 1)
          set({ brushSize: n }, false, 'sprite/setBrushSize')
        },

        undo() {
          const s = get()
          if (!s.undoStack.length) return
          const prev = s.undoStack[s.undoStack.length - 1]
          const currentSnap = snapshotForUndo()
          set(
            {
              layers: cloneLayers(prev.layers),
              pixels: clonePixels(prev.pixels),
              frames: cloneFrames(prev.frames),
              currentFrame: prev.currentFrame,
              canvasWidth: prev.canvasWidth,
              canvasHeight: prev.canvasHeight,
              undoStack: s.undoStack.slice(0, -1),
              redoStack: [...s.redoStack, currentSnap].slice(-UNDO_CAP),
            },
            false,
            'sprite/undo'
          )
        },

        redo() {
          const s = get()
          if (!s.redoStack.length) return
          const incoming = s.redoStack[s.redoStack.length - 1]
          const currentSnap = snapshotForUndo()
          set(
            {
              layers: cloneLayers(incoming.layers),
              pixels: clonePixels(incoming.pixels),
              frames: cloneFrames(incoming.frames),
              currentFrame: incoming.currentFrame,
              canvasWidth: incoming.canvasWidth,
              canvasHeight: incoming.canvasHeight,
              undoStack: [...s.undoStack, currentSnap].slice(-UNDO_CAP),
              redoStack: s.redoStack.slice(0, -1),
            },
            false,
            'sprite/redo'
          )
        },

        flattenLayers() {
          const s = get()
          return flattenLayersToPixels(s.layers, s.canvasWidth, s.canvasHeight)
        },

        flattenFrameAt(index) {
          const s = get()
          if (index === s.currentFrame) {
            return flattenLayersToPixels(s.layers, s.canvasWidth, s.canvasHeight)
          }
          const fr = s.frames[index]
          if (!fr?.layers?.length) {
            return makeEmptyPixels(s.canvasWidth, s.canvasHeight)
          }
          return flattenLayersToPixels(fr.layers, s.canvasWidth, s.canvasHeight)
        },

        exportSprite() {
          const s = get()
          const flat = flattenLayersToPixels(s.layers, s.canvasWidth, s.canvasHeight)
          if (typeof document === 'undefined') return ''
          const canvas = document.createElement('canvas')
          canvas.width = s.canvasWidth
          canvas.height = s.canvasHeight
          const ctx = canvas.getContext('2d')
          if (!ctx) return ''
          const imgData = ctx.createImageData(s.canvasWidth, s.canvasHeight)
          for (let y = 0; y < s.canvasHeight; y++) {
            for (let x = 0; x < s.canvasWidth; x++) {
              const [r, g, b, a] = parseRgbaComponents(flat[y][x])
              const i = (y * s.canvasWidth + x) * 4
              imgData.data[i] = r
              imgData.data[i + 1] = g
              imgData.data[i + 2] = b
              imgData.data[i + 3] = a
            }
          }
          ctx.putImageData(imgData, 0, 0)
          return canvas.toDataURL('image/png')
        },

        setZoom(zoom) {
          const z = Number(zoom)
          if (!Number.isFinite(z) || z <= 0) return
          set({ zoom: z }, false, 'sprite/setZoom')
        },

        toggleOnionSkin() {
          set((s) => ({ onionSkinEnabled: !s.onionSkinEnabled }), false, 'sprite/toggleOnionSkin')
        },

        playAnimation() {
          set({ animationPlaying: true }, false, 'sprite/playAnimation')
        },

        stopAnimation() {
          set({ animationPlaying: false }, false, 'sprite/stopAnimation')
        },
      }
    },
    { name: 'GameMakerSpriteEditor' }
  )
)
