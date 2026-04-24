import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useProjectStore } from '../store/useProjectStore.js'
import { useEditorStore } from '../store/useEditorStore.js'
import { makeEmptyPixels } from '../store/useSpriteEditorStore.js'

const TRANSPARENT = 'rgba(0,0,0,0)'
const CELL_ZOOM = 2

const COLLISION_SHAPES = ['full', 'top-half', 'bottom-half', 'left-half', 'right-half', 'custom']

/** @param {string} color */
function parseRgbaComponents(color) {
  const t = String(color ?? '').trim()
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

/** @param {string[][]} pixels @param {CanvasRenderingContext2D} ctx */
function putPixelsOnContext(pixels, ctx) {
  const h = pixels.length
  const w = pixels[0]?.length ?? 0
  if (!h || !w) return
  const img = ctx.createImageData(w, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = parseRgbaComponents(pixels[y][x])
      const i = (y * w + x) * 4
      img.data[i] = r
      img.data[i + 1] = g
      img.data[i + 2] = b
      img.data[i + 3] = a
    }
  }
  ctx.putImageData(img, 0, 0)
}

function flattenSpriteLayers(sprite) {
  const w = sprite.width ?? 32
  const h = sprite.height ?? 32
  const out = makeEmptyPixels(w, h)
  const frames = sprite.frames
  if (!Array.isArray(frames) || !frames[0]?.layers?.length) {
    return null
  }
  const layers = frames[0].layers
  for (const layer of layers) {
    if (!layer.visible) continue
    const grid = layer.pixels
    if (!Array.isArray(grid)) continue
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = grid[y]?.[x]
        if (c && c !== TRANSPARENT && c !== 'transparent') {
          out[y][x] = c
        }
      }
    }
  }
  return out
}

/** @returns {string[][] | null} */
function getSpritePixelGrid(sprite) {
  if (!sprite) return null
  if (Array.isArray(sprite.pixels) && sprite.pixels.length > 0) {
    return sprite.pixels.map((row) => row.slice())
  }
  return flattenSpriteLayers(sprite)
}

function scalePixelsNearest(src, sw, sh, dw, dh) {
  const dst = makeEmptyPixels(dw, dh)
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const sx = Math.min(sw - 1, Math.floor((x * sw) / dw))
      const sy = Math.min(sh - 1, Math.floor((y * sh) / dh))
      dst[y][x] = src[sy]?.[sx] ?? TRANSPARENT
    }
  }
  return dst
}

function defaultTile(index) {
  return {
    index,
    spriteId: null,
    pixels: null,
    solid: false,
    collisionShape: 'full',
    autoTileConnections: { top: false, right: false, bottom: false, left: false },
  }
}

function normalizeTilesArray(tiles, _columns, legacySpriteIds, legacyCollision) {
  let list = Array.isArray(tiles) ? tiles.slice() : []
  if (!list.length && Array.isArray(legacySpriteIds) && legacySpriteIds.length) {
    list = legacySpriteIds.map((spriteId, i) => ({
      ...defaultTile(i),
      spriteId,
      solid: !!(legacyCollision && legacyCollision[i]?.solid),
    }))
  }
  return list.map((t, i) => {
    const base = defaultTile(i)
    const conn = t.autoTileConnections || {}
    return {
      ...base,
      ...t,
      index: i,
      spriteId: t.spriteId ?? null,
      pixels: t.pixels && Array.isArray(t.pixels) ? t.pixels.map((row) => row.slice()) : null,
      solid: !!t.solid,
      collisionShape: COLLISION_SHAPES.includes(t.collisionShape) ? t.collisionShape : 'full',
      autoTileConnections: {
        top: !!conn.top,
        right: !!conn.right,
        bottom: !!conn.bottom,
        left: !!conn.left,
      },
    }
  })
}

function computeRows(tileCount, columns) {
  if (!tileCount) return 0
  const c = Math.max(1, columns)
  return Math.ceil(tileCount / c)
}

/** Flood fill on mutable grid */
function floodFillGrid(grid, x, y, fillColor) {
  const h = grid.length
  const w = grid[0]?.length ?? 0
  if (x < 0 || y < 0 || x >= w || y >= h) return
  const target = grid[y][x]
  if (target === fillColor) return
  const q = [[x, y]]
  const seen = new Set([`${x},${y}`])
  while (q.length) {
    const [cx, cy] = q.shift()
    if (grid[cy][cx] !== target) continue
    grid[cy][cx] = fillColor
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
      seen.add(key)
      if (grid[ny][nx] === target) q.push([nx, ny])
    }
  }
}

function paintDot(grid, x, y, color, brush = 1) {
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

function AutoTilePreview({ connections }) {
  const c = connections || {}
  const cell = 14
  const pad = 4
  const size = cell * 3 + pad * 2
  return (
    <svg
      width={size}
      height={size}
      className="rounded border border-gray-600 bg-gray-900"
      aria-hidden
    >
      <text x={pad + 4} y={14} fill="#9ca3af" fontSize="10">
        Wang preview
      </text>
      {['top', 'right', 'bottom', 'left'].map((edge, i) => {
        const cx = pad + cell
        const cy = pad + cell + 8
        const on = !!c[edge]
        const stroke = on ? '#38bdf8' : '#374151'
        const sw = on ? 2 : 1
        if (edge === 'top') {
          return (
            <line
              key={edge}
              x1={cx}
              y1={cy - cell / 2}
              x2={cx}
              y2={cy - cell}
              stroke={stroke}
              strokeWidth={sw}
            />
          )
        }
        if (edge === 'bottom') {
          return (
            <line
              key={edge}
              x1={cx}
              y1={cy + cell / 2}
              x2={cx}
              y2={cy + cell}
              stroke={stroke}
              strokeWidth={sw}
            />
          )
        }
        if (edge === 'left') {
          return (
            <line
              key={edge}
              x1={cx - cell / 2}
              y1={cy}
              x2={cx - cell}
              y2={cy}
              stroke={stroke}
              strokeWidth={sw}
            />
          )
        }
        return (
          <line
            key={edge}
            x1={cx + cell / 2}
            y1={cy}
            x2={cx + cell}
            y2={cy}
            stroke={stroke}
            strokeWidth={sw}
          />
        )
      })}
      <rect
        x={pad + cell - 6}
        y={pad + cell + 2}
        width={12}
        height={12}
        fill="#1e3a5f"
        stroke="#60a5fa"
        strokeWidth={1}
      />
    </svg>
  )
}

function MiniPixelEditor({
  tileSize,
  draftPixels,
  onDraftChange,
  tool,
  onToolChange,
  paintColor,
  onColorChange,
  onSaveToTileset,
}) {
  const canvasRef = useRef(null)
  const paintingRef = useRef(false)

  const displayScale = useMemo(() => {
    const maxPx = 192
    return Math.max(2, Math.floor(maxPx / Math.max(1, tileSize)))
  }, [tileSize])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = tileSize
    const h = tileSize
    canvas.width = w * displayScale
    canvas.height = h * displayScale
    ctx.imageSmoothingEnabled = false
    const tmp = document.createElement('canvas')
    tmp.width = w
    tmp.height = h
    const tctx = tmp.getContext('2d')
    if (tctx && draftPixels.length) {
      putPixelsOnContext(draftPixels, tctx)
      ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height)
    }
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1
    for (let gx = 0; gx <= w; gx++) {
      const x = gx * displayScale + 0.5
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let gy = 0; gy <= h; gy++) {
      const y = gy * displayScale + 0.5
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
    ctx.restore()
  }, [draftPixels, displayScale, tileSize])

  useEffect(() => {
    redraw()
  }, [redraw])

  const pickCell = useCallback(
    (evt) => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const mx = evt.clientX - rect.left
      const my = evt.clientY - rect.top
      const x = Math.floor(mx / displayScale)
      const y = Math.floor(my / displayScale)
      if (x < 0 || y < 0 || x >= tileSize || y >= tileSize) return null
      return { x, y }
    },
    [displayScale, tileSize]
  )

  const applyTool = useCallback(
    (x, y) => {
      const grid = draftPixels.map((row) => row.slice())
      if (tool === 'fill') {
        floodFillGrid(grid, x, y, paintColor)
        onDraftChange(grid)
        return
      }
      const color = tool === 'eraser' ? TRANSPARENT : paintColor
      paintDot(grid, x, y, color, 1)
      onDraftChange(grid)
    },
    [draftPixels, onDraftChange, paintColor, tool]
  )

  const onPointerDown = (e) => {
    e.preventDefault()
    paintingRef.current = true
    const cell = pickCell(e)
    if (!cell) return
    applyTool(cell.x, cell.y)
  }

  const onPointerMove = (e) => {
    if (!paintingRef.current || tool === 'fill') return
    const cell = pickCell(e)
    if (!cell) return
    applyTool(cell.x, cell.y)
  }

  const endPaint = () => {
    paintingRef.current = false
  }

  return (
    <div className="space-y-2 rounded border border-gray-700 bg-gray-900/80 p-3">
      <div className="text-xs font-medium text-gray-300">Create tile from image</div>
      <div className="flex flex-wrap gap-2">
        {['pencil', 'eraser', 'fill'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onToolChange(t)}
            className={`rounded px-2 py-1 text-xs capitalize ${
              tool === t
                ? 'bg-sky-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-gray-400">
          Color
          <input
            type="color"
            value={paintColor === TRANSPARENT ? '#000000' : paintColor}
            onChange={(ev) => onColorChange(ev.target.value)}
            className="ml-2 h-7 w-12 cursor-pointer rounded border border-gray-600 bg-gray-800"
          />
        </label>
      </div>
      <div className="overflow-auto rounded border border-gray-700 bg-black p-2">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair touch-none"
          style={{ imageRendering: 'pixelated' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPaint}
          onPointerLeave={endPaint}
        />
      </div>
      <button
        type="button"
        onClick={onSaveToTileset}
        className="w-full rounded bg-emerald-700 px-3 py-2 text-sm text-white hover:bg-emerald-600"
      >
        Save tile to tileset
      </button>
    </div>
  )
}

export default function TilesetEditor() {
  const tilesets = useProjectStore((s) => s.tilesets)
  const sprites = useProjectStore((s) => s.sprites)
  const addTileset = useProjectStore((s) => s.addTileset)
  const updateTileset = useProjectStore((s) => s.updateTileset)
  const removeTileset = useProjectStore((s) => s.removeTileset)

  const activePaintTile = useEditorStore((s) => s.activePaintTile)
  const setActivePaintTile = useEditorStore((s) => s.setActivePaintTile)

  const [selectedTilesetId, setSelectedTilesetId] = useState(null)
  const [selectedTileIndex, setSelectedTileIndex] = useState(null)
  const [hoverIndex, setHoverIndex] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [importOpen, setImportOpen] = useState(false)
  const [importPick, setImportPick] = useState(() => new Set())

  const [miniTool, setMiniTool] = useState('pencil')
  const [miniColor, setMiniColor] = useState('#6ee7b7')
  const [draftPixels, setDraftPixels] = useState(() => makeEmptyPixels(32, 32))

  const gridCanvasRef = useRef(null)
  const gridWrapRef = useRef(null)

  const selectedTileset = useMemo(
    () => tilesets.find((t) => t.id === selectedTilesetId) ?? null,
    [tilesets, selectedTilesetId]
  )

  const normalized = useMemo(() => {
    if (!selectedTileset) return null
    const cols = Math.max(1, selectedTileset.columns ?? 8)
    const tiles = normalizeTilesArray(
      selectedTileset.tiles,
      cols,
      selectedTileset.spriteIds,
      selectedTileset.collisionData
    )
    const rows = computeRows(tiles.length, cols)
    return { ...selectedTileset, columns: cols, tiles, rows }
  }, [selectedTileset])

  useEffect(() => {
    if (!tilesets.length) {
      setSelectedTilesetId(null)
      return
    }
    if (!selectedTilesetId || !tilesets.some((t) => t.id === selectedTilesetId)) {
      setSelectedTilesetId(tilesets[0].id)
    }
  }, [tilesets, selectedTilesetId])

  useEffect(() => {
    if (!normalized) return
    const ts = normalized.tileSize ?? 32
    setDraftPixels(makeEmptyPixels(ts, ts))
    setMiniTool('pencil')
  }, [normalized?.id, normalized?.tileSize])

  useEffect(() => {
    if (!normalized || selectedTileIndex == null) return
    const tile = normalized.tiles[selectedTileIndex]
    if (!tile) return
    const ts = normalized.tileSize ?? 32
    let next = makeEmptyPixels(ts, ts)
    if (tile.pixels && Array.isArray(tile.pixels) && tile.pixels.length) {
      next = tile.pixels.map((row) => row.slice())
    } else if (tile.spriteId) {
      const sp = sprites.find((s) => s.id === tile.spriteId)
      const grid = getSpritePixelGrid(sp)
      if (grid) {
        const sw = grid[0]?.length ?? ts
        const sh = grid.length
        next = scalePixelsNearest(grid, sw, sh, ts, ts)
      }
    }
    setDraftPixels(next)
  }, [normalized, selectedTileIndex, sprites])

  const persistTiles = useCallback(
    (tiles, patch = {}) => {
      if (!selectedTilesetId || !normalized) return
      const cols = normalized.columns
      const clean = tiles.map((t, i) => ({ ...t, index: i }))
      updateTileset(selectedTilesetId, {
        tiles: clean,
        rows: computeRows(clean.length, cols),
        spriteIds: clean.map((t) => t.spriteId ?? null),
        ...patch,
      })
    },
    [normalized, selectedTilesetId, updateTileset]
  )

  const handleNameChange = (name) => {
    if (!selectedTilesetId) return
    updateTileset(selectedTilesetId, { name })
  }

  const handleTileSizeChange = (size) => {
    if (!selectedTilesetId || !normalized) return
    const n = Number(size)
    if (!Number.isFinite(n) || ![16, 32, 64].includes(n)) return
    updateTileset(selectedTilesetId, { tileSize: n })
  }

  const handleColumnsChange = (cols) => {
    if (!selectedTilesetId || !normalized) return
    const c = Math.max(1, Math.floor(Number(cols)) || 8)
    const tiles = normalized.tiles
    updateTileset(selectedTilesetId, {
      columns: c,
      rows: computeRows(tiles.length, c),
    })
  }

  const updateSelectedTileProps = (partial) => {
    if (!normalized || selectedTileIndex == null) return
    const tiles = normalized.tiles.map((t, i) =>
      i === selectedTileIndex ? { ...t, ...partial, index: i } : t
    )
    persistTiles(tiles)
  }

  const drawTilesetGrid = useCallback(() => {
    const canvas = gridCanvasRef.current
    if (!canvas || !normalized) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { tileSize, columns, tiles } = normalized
    const count = tiles.length
    const rows = count ? computeRows(count, columns) : 1
    const cw = columns * tileSize * CELL_ZOOM
    const ch = rows * tileSize * CELL_ZOOM
    canvas.width = cw
    canvas.height = ch

    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, cw, ch)

    const drawTileContent = (tile, dx, dy, tw, th) => {
      const ox = dx
      const oy = dy
      ctx.save()
      ctx.beginPath()
      ctx.rect(ox, oy, tw, th)
      ctx.clip()

      let drawn = false
      if (tile?.pixels?.length) {
        const tmp = document.createElement('canvas')
        tmp.width = tileSize
        tmp.height = tileSize
        const tctx = tmp.getContext('2d')
        if (tctx) {
          putPixelsOnContext(tile.pixels, tctx)
          ctx.drawImage(tmp, ox, oy, tw, th)
          drawn = true
        }
      }
      if (!drawn && tile?.spriteId) {
        const sp = sprites.find((s) => s.id === tile.spriteId)
        let grid = getSpritePixelGrid(sp)
        if (grid) {
          const sw = grid[0]?.length ?? tileSize
          const sh = grid.length
          if (sw !== tileSize || sh !== tileSize) {
            grid = scalePixelsNearest(grid, sw, sh, tileSize, tileSize)
          }
          const tmp = document.createElement('canvas')
          tmp.width = tileSize
          tmp.height = tileSize
          const tctx = tmp.getContext('2d')
          if (tctx) {
            putPixelsOnContext(grid, tctx)
            ctx.drawImage(tmp, ox, oy, tw, th)
            drawn = true
          }
        }
      }
      if (!drawn) {
        const step = 8 * CELL_ZOOM
        for (let yy = 0; yy < th; yy += step) {
          for (let xx = 0; xx < tw; xx += step) {
            const odd = ((xx / step + yy / step) | 0) % 2 === 0
            ctx.fillStyle = odd ? '#1f2937' : '#374151'
            ctx.fillRect(ox + xx, oy + yy, Math.min(step, tw - xx), Math.min(step, th - yy))
          }
        }
      }
      ctx.restore()
    }

    const rowCount = count === 0 ? 1 : rows
    const totalCells = columns * rowCount

    for (let i = 0; i < totalCells; i++) {
      const col = i % columns
      const rowIdx = Math.floor(i / columns)
      const x = col * tileSize * CELL_ZOOM
      const y = rowIdx * tileSize * CELL_ZOOM
      const w = tileSize * CELL_ZOOM
      const h = tileSize * CELL_ZOOM
      const tile = tiles[i]

      drawTileContent(tile, x, y, w, h)

      ctx.strokeStyle = '#4b5563'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)

      if (i < count) {
        ctx.font = `${10 * CELL_ZOOM}px system-ui, sans-serif`
        ctx.fillStyle = 'rgba(0,0,0,0.65)'
        const label = String(i)
        const metrics = ctx.measureText(label)
        ctx.fillRect(x + 2, y + h - 14 * CELL_ZOOM, metrics.width + 4, 12 * CELL_ZOOM)
        ctx.fillStyle = '#e5e7eb'
        ctx.fillText(label, x + 4, y + h - 4 * CELL_ZOOM)
      }

      const isSel = selectedTileIndex === i && i < count
      const isPaint =
        activePaintTile?.tilesetId === selectedTilesetId && activePaintTile?.tileIndex === i
      if (isSel || isPaint) {
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 3
        ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3)
      }
    }
  }, [
    activePaintTile,
    normalized,
    selectedTileIndex,
    selectedTilesetId,
    sprites,
  ])

  useEffect(() => {
    drawTilesetGrid()
  }, [drawTilesetGrid])

  const findIndexAt = (clientX, clientY) => {
    const canvas = gridCanvasRef.current
    if (!canvas || !normalized) return null
    const rect = canvas.getBoundingClientRect()
    const mx = clientX - rect.left
    const my = clientY - rect.top
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const lx = mx * scaleX
    const ly = my * scaleY
    const { tileSize, columns, tiles } = normalized
    const count = tiles.length
    if (!count) return null
    const rows = computeRows(count, columns)
    const tw = tileSize * CELL_ZOOM
    const th = tileSize * CELL_ZOOM
    const col = Math.floor(lx / tw)
    const row = Math.floor(ly / th)
    if (col < 0 || row < 0 || col >= columns || row >= rows) return null
    const idx = row * columns + col
    if (idx < 0 || idx >= count) return null
    return idx
  }

  const onCanvasClick = (e) => {
    const idx = findIndexAt(e.clientX, e.clientY)
    if (idx == null) return
    setSelectedTileIndex(idx)
    setActivePaintTile(selectedTilesetId, idx)
  }

  const onCanvasMove = (e) => {
    const idx = findIndexAt(e.clientX, e.clientY)
    setHoverIndex(idx)
    setTooltipPos({ x: e.clientX + 12, y: e.clientY + 12 })
  }

  const onCanvasLeave = () => {
    setHoverIndex(null)
  }

  const handleNewTileset = () => {
    const id = addTileset({
      name: `Tileset ${tilesets.length + 1}`,
      tileSize: 32,
      columns: 8,
      rows: 0,
    })
    updateTileset(id, { tiles: [], rows: 0 })
    setSelectedTilesetId(id)
    setSelectedTileIndex(null)
    setActivePaintTile(null, null)
  }

  const handleDeleteTileset = () => {
    if (!selectedTilesetId) return
    removeTileset(selectedTilesetId)
    setSelectedTileIndex(null)
    setActivePaintTile(null, null)
  }

  const toggleImportSprite = (spriteId) => {
    setImportPick((prev) => {
      const next = new Set(prev)
      if (next.has(spriteId)) next.delete(spriteId)
      else next.add(spriteId)
      return next
    })
  }

  const confirmImportSprites = () => {
    if (!normalized || !selectedTilesetId) return
    const ids = [...importPick]
    if (!ids.length) {
      setImportOpen(false)
      return
    }
    const existing = normalized.tiles
    let nextTiles = existing.slice()
    for (const sid of ids) {
      nextTiles.push({
        ...defaultTile(nextTiles.length),
        spriteId: sid,
        index: nextTiles.length,
      })
    }
    nextTiles = nextTiles.map((t, i) => ({ ...t, index: i }))
    persistTiles(nextTiles)
    setImportPick(new Set())
    setImportOpen(false)
  }

  const handleSaveMiniTile = () => {
    if (!normalized || !selectedTilesetId) return
    const ts = normalized.tileSize ?? 32
    const px = draftPixels.map((row) => row.slice())
    if (selectedTileIndex != null && normalized.tiles[selectedTileIndex]) {
      const tiles = normalized.tiles.map((t, i) =>
        i === selectedTileIndex
          ? {
              ...t,
              pixels: px,
              spriteId: null,
              index: i,
            }
          : t
      )
      persistTiles(tiles)
      setActivePaintTile(selectedTilesetId, selectedTileIndex)
      return
    }
    const tiles = [
      ...normalized.tiles,
      {
        ...defaultTile(normalized.tiles.length),
        pixels: px,
        spriteId: null,
      },
    ].map((t, i) => ({ ...t, index: i }))
    persistTiles(tiles)
    setSelectedTileIndex(tiles.length - 1)
    setActivePaintTile(selectedTilesetId, tiles.length - 1)
  }

  const selectedTile =
    normalized && selectedTileIndex != null ? normalized.tiles[selectedTileIndex] : null

  const col = normalized && selectedTileIndex != null ? selectedTileIndex % normalized.columns : 0
  const row =
    normalized && selectedTileIndex != null
      ? Math.floor(selectedTileIndex / normalized.columns)
      : 0

  return (
    <div className="flex h-full min-h-[480px] flex-col bg-gray-900 text-gray-100">
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-52 flex-col border-r border-gray-700 bg-gray-800">
          <div className="border-b border-gray-700 p-3">
            <button
              type="button"
              onClick={handleNewTileset}
              className="w-full rounded bg-sky-700 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600"
            >
              New Tileset
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {tilesets.map((ts) => (
              <div
                key={ts.id}
                className={`mb-1 flex items-center gap-1 rounded px-2 py-1.5 ${
                  ts.id === selectedTilesetId ? 'bg-gray-700 ring-1 ring-sky-500' : 'hover:bg-gray-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTilesetId(ts.id)
                    setSelectedTileIndex(null)
                  }}
                  className="min-w-0 flex-1 truncate text-left text-sm"
                >
                  {ts.name || 'Untitled'}
                </button>
                {ts.id === selectedTilesetId && (
                  <button
                    type="button"
                    title="Delete tileset"
                    onClick={handleDeleteTileset}
                    className="shrink-0 rounded bg-red-900/60 px-2 py-0.5 text-xs text-red-100 hover:bg-red-800"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            {!tilesets.length && (
              <p className="px-2 text-xs text-gray-500">No tilesets yet. Create one to begin.</p>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-end gap-4 border-b border-gray-700 bg-gray-800 px-4 py-3">
            <label className="flex flex-col text-xs text-gray-400">
              Name
              <input
                type="text"
                value={normalized?.name ?? ''}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={!normalized}
                className="mt-1 rounded border border-gray-600 bg-gray-900 px-2 py-1 text-sm text-white disabled:opacity-40"
              />
            </label>
            <label className="flex flex-col text-xs text-gray-400">
              Tile size
              <select
                value={normalized?.tileSize ?? 32}
                onChange={(e) => handleTileSizeChange(e.target.value)}
                disabled={!normalized}
                className="mt-1 rounded border border-gray-600 bg-gray-900 px-2 py-1 text-sm text-white disabled:opacity-40"
              >
                {[16, 32, 64].map((s) => (
                  <option key={s} value={s}>
                    {s}px
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-xs text-gray-400">
              Columns
              <input
                type="number"
                min={1}
                value={normalized?.columns ?? 8}
                onChange={(e) => handleColumnsChange(e.target.value)}
                disabled={!normalized}
                className="mt-1 w-24 rounded border border-gray-600 bg-gray-900 px-2 py-1 text-sm text-white disabled:opacity-40"
              />
            </label>
            <div className="text-xs text-gray-400">
              <div>Rows</div>
              <div className="mt-1 font-mono text-sm text-gray-200">
                {normalized ? normalized.rows : '—'}
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                disabled={!normalized}
                className="rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm hover:bg-gray-800 disabled:opacity-40"
              >
                Import from Sprites
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            <div
              ref={gridWrapRef}
              className="relative min-h-0 flex-1 overflow-auto bg-gray-900 p-4"
            >
              {normalized && normalized.tiles.length === 0 && (
                <p className="mb-2 text-sm text-gray-500">
                  No tiles yet. Import sprites or draw a tile below, then save to tileset.
                </p>
              )}
              <canvas
                ref={gridCanvasRef}
                className="block max-w-none bg-gray-950 ring-1 ring-gray-700"
                style={{ imageRendering: 'pixelated' }}
                onClick={onCanvasClick}
                onMouseMove={onCanvasMove}
                onMouseLeave={onCanvasLeave}
              />
              {hoverIndex != null && (
                <div
                  className="pointer-events-none fixed z-20 rounded bg-black/90 px-2 py-1 text-xs text-white shadow-lg"
                  style={{ left: tooltipPos.x, top: tooltipPos.y }}
                >
                  Tile index: {hoverIndex}
                </div>
              )}
            </div>

            <aside className="w-80 shrink-0 overflow-y-auto border-l border-gray-700 bg-gray-800 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-200">Tile properties</h3>
              {!selectedTile && (
                <p className="text-xs text-gray-500">Select a tile in the grid.</p>
              )}
              {selectedTile && (
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Index</div>
                    <div className="font-mono text-gray-100">{selectedTile.index}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Column / Row</div>
                    <div className="font-mono text-gray-100">
                      {col}, {row}
                    </div>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selectedTile.solid}
                      onChange={(e) => updateSelectedTileProps({ solid: e.target.checked })}
                    />
                    <span>Solid collision</span>
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-gray-400">
                    Collision shape
                    <select
                      value={selectedTile.collisionShape}
                      onChange={(e) => updateSelectedTileProps({ collisionShape: e.target.value })}
                      className="rounded border border-gray-600 bg-gray-900 px-2 py-1 text-sm text-white"
                    >
                      {COLLISION_SHAPES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div>
                    <div className="mb-1 text-xs font-medium text-gray-400">Auto-tile (Wang edges)</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(['top', 'right', 'bottom', 'left']).map((edge) => (
                        <label key={edge} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={!!selectedTile.autoTileConnections?.[edge]}
                            onChange={(e) =>
                              updateSelectedTileProps({
                                autoTileConnections: {
                                  ...selectedTile.autoTileConnections,
                                  [edge]: e.target.checked,
                                },
                              })
                            }
                          />
                          connects-{edge}
                        </label>
                      ))}
                    </div>
                    <div className="mt-2">
                      <div className="mb-1 text-xs text-gray-500">Preview</div>
                      <AutoTilePreview connections={selectedTile.autoTileConnections} />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 border-t border-gray-700 pt-4">
                <MiniPixelEditor
                  tileSize={normalized?.tileSize ?? 32}
                  draftPixels={draftPixels}
                  onDraftChange={setDraftPixels}
                  tool={miniTool}
                  onToolChange={setMiniTool}
                  paintColor={miniColor}
                  onColorChange={setMiniColor}
                  onSaveToTileset={handleSaveMiniTile}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-lg border border-gray-600 bg-gray-800 shadow-xl">
            <div className="border-b border-gray-700 px-4 py-3 text-sm font-medium text-white">
              Import sprites into tileset
            </div>
            <div className="max-h-56 overflow-y-auto p-3">
              {sprites.length === 0 && (
                <p className="text-xs text-gray-500">No sprites in project.</p>
              )}
              {sprites.map((sp) => (
                <label
                  key={sp.id}
                  className="mb-1 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={importPick.has(sp.id)}
                    onChange={() => toggleImportSprite(sp.id)}
                  />
                  <span className="truncate text-sm">{sp.name || sp.id}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-700 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setImportOpen(false)
                  setImportPick(new Set())
                }}
                className="rounded border border-gray-600 px-3 py-1.5 text-sm hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmImportSprites}
                className="rounded bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-500"
              >
                Add to tileset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
