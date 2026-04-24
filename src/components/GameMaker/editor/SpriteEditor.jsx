import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useSpriteEditorStore } from '../store/useSpriteEditorStore.js'
import { useProjectStore } from '../store/useProjectStore.js'

const TRANSPARENT = 'rgba(0,0,0,0)'

function parseCssRgba(color) {
  const t = (color ?? '').trim()
  if (!t || t === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(t)
  if (hex) {
    return {
      r: parseInt(hex[1], 16),
      g: parseInt(hex[2], 16),
      b: parseInt(hex[3], 16),
      a: 1,
    }
  }
  const m =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i.exec(t)
  if (m) {
    const a = m[4] === undefined ? 1 : parseFloat(m[4]) <= 1 ? parseFloat(m[4]) : parseFloat(m[4]) / 255
    return {
      r: Math.round(Number(m[1])),
      g: Math.round(Number(m[2])),
      b: Math.round(Number(m[3])),
      a: Math.max(0, Math.min(1, a)),
    }
  }
  return { r: 0, g: 0, b: 0, a: 0 }
}

function cssColor(flat, x, y) {
  const row = flat[y]
  if (!row) return TRANSPARENT
  return row[x] ?? TRANSPARENT
}

function bresenhamLine(x0, y0, x1, y1) {
  const pts = []
  let x = x0
  let y = y0
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy
  for (;;) {
    pts.push([x, y])
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x += sx
    }
    if (e2 < dx) {
      err += dx
      y += sy
    }
  }
  return pts
}

function expandBrushThroughLine(x0, y0, x1, y1, brush) {
  const half = Math.floor(Math.max(1, brush) / 2)
  const line = bresenhamLine(x0, y0, x1, y1)
  const set = new Map()
  for (const [cx, cy] of line) {
    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        set.set(`${cx + dx},${cy + dy}`, [cx + dx, cy + dy])
      }
    }
  }
  return [...set.values()]
}

function rectOutlinePixels(x0, y0, x1, y1) {
  const minX = Math.min(x0, x1)
  const maxX = Math.max(x0, x1)
  const minY = Math.min(y0, y1)
  const maxY = Math.max(y0, y1)
  const pts = []
  const add = (x, y) => pts.push([x, y])
  for (let x = minX; x <= maxX; x++) {
    add(x, minY)
    if (minY !== maxY) add(x, maxY)
  }
  for (let y = minY + 1; y <= maxY - 1; y++) {
    add(minX, y)
    if (minX !== maxX) add(maxX, y)
  }
  return pts
}

function circleOutlinePixels(cx, cy, rRaw) {
  const r = Math.max(0, Math.floor(rRaw))
  const pts = []
  if (r <= 0) {
    pts.push([cx, cy])
    return pts
  }
  let x = 0
  let y = r
  let d = 3 - 2 * r
  const plot = (px, py) => pts.push([px, py])
  const eight = (x0, y0) => {
    plot(cx + x0, cy + y0)
    plot(cx - x0, cy + y0)
    plot(cx + x0, cy - y0)
    plot(cx - x0, cy - y0)
    plot(cx + y0, cy + x0)
    plot(cx - y0, cy + x0)
    plot(cx + y0, cy - x0)
    plot(cx - y0, cy - x0)
  }
  while (x <= y) {
    eight(x, y)
    x++
    if (d < 0) {
      d += 4 * x + 6
    } else {
      d += 4 * (x - y) + 10
      y--
    }
  }
  const uniq = new Map()
  for (const [px, py] of pts) uniq.set(`${px},${py}`, [px, py])
  return [...uniq.values()]
}

export default function SpriteEditor() {
  const canvasRef = useRef(null)
  const viewportRef = useRef(null)
  const panRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollL: 0,
    scrollT: 0,
  })
  const lastStrokeCell = useRef(null)
  const strokeAccumulatorRef = useRef([])
  const pointerDrawButtonRef = useRef(1)
  const animRaf = useRef(0)
  const animAcc = useRef(0)
  const lastAnimTime = useRef(0)

  const [strokePreview, setStrokePreview] = useState([])
  const [shapeDraft, setShapeDraft] = useState(null)
  const [secondaryColor, setSecondaryColor] = useState('#ffffff')
  const [gridPreset, setGridPreset] = useState(32)
  const currentSpriteId = useSpriteEditorStore((s) => s.currentSpriteId)
  const canvasWidth = useSpriteEditorStore((s) => s.canvasWidth)
  const canvasHeight = useSpriteEditorStore((s) => s.canvasHeight)
  const layers = useSpriteEditorStore((s) => s.layers)
  const activeLayerId = useSpriteEditorStore((s) => s.activeLayerId)
  const currentFrame = useSpriteEditorStore((s) => s.currentFrame)
  const frames = useSpriteEditorStore((s) => s.frames)
  const selectedColor = useSpriteEditorStore((s) => s.selectedColor)
  const selectedTool = useSpriteEditorStore((s) => s.selectedTool)
  const brushSize = useSpriteEditorStore((s) => s.brushSize)
  const palette = useSpriteEditorStore((s) => s.palette)
  const onionSkinEnabled = useSpriteEditorStore((s) => s.onionSkinEnabled)
  const animationPlaying = useSpriteEditorStore((s) => s.animationPlaying)
  const animationFPS = useSpriteEditorStore((s) => s.animationFPS)
  const zoom = useSpriteEditorStore((s) => s.zoom)

  const newSprite = useSpriteEditorStore((s) => s.newSprite)
  const setPixel = useSpriteEditorStore((s) => s.setPixel)
  const setPixels = useSpriteEditorStore((s) => s.setPixels)
  const fill = useSpriteEditorStore((s) => s.fill)
  const addLayer = useSpriteEditorStore((s) => s.addLayer)
  const removeLayer = useSpriteEditorStore((s) => s.removeLayer)
  const setActiveLayer = useSpriteEditorStore((s) => s.setActiveLayer)
  const toggleLayerVisibility = useSpriteEditorStore((s) => s.toggleLayerVisibility)
  const reorderLayers = useSpriteEditorStore((s) => s.reorderLayers)
  const toggleLayerLock = useSpriteEditorStore((s) => s.toggleLayerLock)
  const setLayerOpacity = useSpriteEditorStore((s) => s.setLayerOpacity)
  const addFrame = useSpriteEditorStore((s) => s.addFrame)
  const removeFrame = useSpriteEditorStore((s) => s.removeFrame)
  const setCurrentFrame = useSpriteEditorStore((s) => s.setCurrentFrame)
  const setCurrentFrameSilent = useSpriteEditorStore((s) => s.setCurrentFrameSilent)
  const duplicateFrame = useSpriteEditorStore((s) => s.duplicateFrame)
  const setTool = useSpriteEditorStore((s) => s.setTool)
  const setColor = useSpriteEditorStore((s) => s.setColor)
  const setBrushSize = useSpriteEditorStore((s) => s.setBrushSize)
  const undo = useSpriteEditorStore((s) => s.undo)
  const redo = useSpriteEditorStore((s) => s.redo)
  const exportSprite = useSpriteEditorStore((s) => s.exportSprite)
  const setZoom = useSpriteEditorStore((s) => s.setZoom)
  const toggleOnionSkin = useSpriteEditorStore((s) => s.toggleOnionSkin)
  const playAnimation = useSpriteEditorStore((s) => s.playAnimation)
  const stopAnimation = useSpriteEditorStore((s) => s.stopAnimation)
  const flattenLayers = useSpriteEditorStore((s) => s.flattenLayers)
  const flattenFrameAt = useSpriteEditorStore((s) => s.flattenFrameAt)
  const setAnimationFPS = useSpriteEditorStore((s) => s.setAnimationFPS)
  const setCurrentSpriteId = useSpriteEditorStore((s) => s.setCurrentSpriteId)

  const sprites = useProjectStore((s) => s.sprites)
  const addSprite = useProjectStore((s) => s.addSprite)
  const updateSprite = useProjectStore((s) => s.updateSprite)

  useEffect(() => {
    if (!layers.length) {
      newSprite(32, 32)
    }
  }, [layers.length, newSprite])

  useEffect(() => {
    if (!animationPlaying || frames.length < 2) {
      if (animationPlaying && frames.length < 2) stopAnimation()
      return undefined
    }
    lastAnimTime.current = performance.now()
    animAcc.current = 0

    const step = (t) => {
      const store = useSpriteEditorStore.getState()
      if (!store.animationPlaying) return
      const dt = t - lastAnimTime.current
      lastAnimTime.current = t
      animAcc.current += dt
      const interval = 1000 / Math.max(1, store.animationFPS)
      while (animAcc.current >= interval) {
        animAcc.current -= interval
        const nf = store.frames.length
        if (nf < 2) break
        const next = (store.currentFrame + 1) % nf
        useSpriteEditorStore.getState().setCurrentFrameSilent(next)
      }
      animRaf.current = requestAnimationFrame(step)
    }
    animRaf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animRaf.current)
  }, [animationPlaying, animationFPS, frames.length, stopAnimation])

  const screenW = canvasWidth * zoom
  const screenH = canvasHeight * zoom

  const drawChecker = useCallback((ctx, w, h, z) => {
    const a = '#2d2d35'
    const b = '#3a3a44'
    const step = Math.max(z, 4)
    for (let y = 0; y < h * z; y += step) {
      for (let x = 0; x < w * z; x += step) {
        const ix = Math.floor(x / step) + Math.floor(y / step)
        ctx.fillStyle = ix % 2 === 0 ? a : b
        ctx.fillRect(x, y, step, step)
      }
    }
  }, [])

  const paintPixels = useCallback(
    (ctx, flat, z) => {
      for (let y = 0; y < flat.length; y++) {
        const row = flat[y]
        if (!row) continue
        for (let x = 0; x < row.length; x++) {
          const c = row[x]
          if (c === TRANSPARENT || c === 'transparent') continue
          const { r, g, b, a } = parseCssRgba(c)
          if (a <= 0) continue
          ctx.fillStyle =
            a >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`
          ctx.fillRect(x * z, y * z, z, z)
        }
      }
    },
    []
  )

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = screenW
    canvas.height = screenH

    ctx.imageSmoothingEnabled = false
    drawChecker(ctx, canvasWidth, canvasHeight, zoom)

    if (onionSkinEnabled && currentFrame > 0 && !animationPlaying) {
      const prevFlat = flattenFrameAt(currentFrame - 1)
      ctx.save()
      ctx.globalAlpha = 0.28
      paintPixels(ctx, prevFlat, zoom)
      ctx.restore()
    }

    const flat = flattenLayers()
    paintPixels(ctx, flat, zoom)

    if (shapeDraft) {
      const brushColor =
        shapeDraft.button === 2 ? secondaryColor : selectedColor
      if (brushColor === TRANSPARENT) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
      } else {
        const { r, g, b, a } = parseCssRgba(brushColor)
        ctx.fillStyle =
          a >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`
      }

      let previewPts = []
      if (shapeDraft.type === 'line') {
        previewPts = bresenhamLine(
          shapeDraft.ax,
          shapeDraft.ay,
          shapeDraft.bx,
          shapeDraft.by
        )
      } else if (shapeDraft.type === 'rect') {
        previewPts = rectOutlinePixels(
          shapeDraft.ax,
          shapeDraft.ay,
          shapeDraft.bx,
          shapeDraft.by
        )
      } else if (shapeDraft.type === 'circle') {
        const dx = shapeDraft.bx - shapeDraft.ax
        const dy = shapeDraft.by - shapeDraft.ay
        const r = Math.max(
          0,
          Math.floor(Math.sqrt(dx * dx + dy * dy) + 0.0001)
        )
        previewPts = circleOutlinePixels(shapeDraft.ax, shapeDraft.ay, r)
      }
      const half = Math.floor(Math.max(1, brushSize) / 2)
      for (const [px, py] of previewPts) {
        for (let dy = -half; dy <= half; dy++) {
          for (let dx = -half; dx <= half; dx++) {
            ctx.fillRect((px + dx) * zoom, (py + dy) * zoom, zoom, zoom)
          }
        }
      }
    }

    if (strokePreview.length) {
      const sc = strokePreview[0]?.c ?? selectedColor
      const { r, g, b, a } = parseCssRgba(sc)
      ctx.fillStyle = a >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`
      const half = Math.floor(Math.max(1, brushSize) / 2)
      for (const p of strokePreview) {
        for (let dy = -half; dy <= half; dy++) {
          for (let dx = -half; dx <= half; dx++) {
            ctx.fillRect((p.x + dx) * zoom, (p.y + dy) * zoom, zoom, zoom)
          }
        }
      }
    }

    if (zoom >= 4) {
      ctx.strokeStyle = 'rgba(60,60,72,0.85)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x <= canvasWidth; x++) {
        ctx.moveTo(x * zoom + 0.5, 0)
        ctx.lineTo(x * zoom + 0.5, screenH)
      }
      for (let y = 0; y <= canvasHeight; y++) {
        ctx.moveTo(0, y * zoom + 0.5)
        ctx.lineTo(screenW, y * zoom + 0.5)
      }
      ctx.stroke()
    }
  }, [
    screenW,
    screenH,
    canvasWidth,
    canvasHeight,
    zoom,
    drawChecker,
    onionSkinEnabled,
    currentFrame,
    flattenLayers,
    flattenFrameAt,
    animationPlaying,
    paintPixels,
    shapeDraft,
    selectedColor,
    secondaryColor,
    brushSize,
    strokePreview,
  ])

  useEffect(() => {
    redraw()
  }, [redraw])

  const getPixelCoords = useCallback(
    (e) => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const px = Math.floor(x / zoom)
      const py = Math.floor(y / zoom)
      if (px < 0 || py < 0 || px >= canvasWidth || py >= canvasHeight) return null
      return { px, py, rawX: x, rawY: y }
    },
    [zoom, canvasWidth, canvasHeight]
  )

  const flushStroke = useCallback(
    (pts) => {
      if (!pts.length) return
      setPixels(pts.map((p) => ({ x: p.x, y: p.y, color: p.c })))
    },
    [setPixels]
  )

  const commitShape = useCallback(
    (draft) => {
      const color =
        draft.button === 2 ? secondaryColor : selectedColor
      const ink = color
      let pts = []
      if (draft.type === 'line') {
        pts = bresenhamLine(draft.ax, draft.ay, draft.bx, draft.by)
      } else if (draft.type === 'rect') {
        pts = rectOutlinePixels(draft.ax, draft.ay, draft.bx, draft.by)
      } else if (draft.type === 'circle') {
        const dx = draft.bx - draft.ax
        const dy = draft.by - draft.ay
        const r = Math.floor(Math.sqrt(dx * dx + dy * dy))
        pts = circleOutlinePixels(draft.ax, draft.ay, r)
      }
      if (pts.length === 0) return
      const thick = expandBrushAlongPoints(pts, brushSize)
      const unique = new Map()
      for (const [tx, ty] of thick) {
        unique.set(`${tx},${ty}`, { x: tx, y: ty, color: ink })
      }
      setPixels([...unique.values()])
    },
    [secondaryColor, selectedColor, brushSize, setPixels]
  )

  const handlePointerDown = useCallback(
    (e) => {
      if (e.button === 1) {
        e.preventDefault()
        const vp = viewportRef.current
        if (!vp) return
        panRef.current = {
          active: true,
          startX: e.clientX,
          startY: e.clientY,
          scrollL: vp.scrollLeft,
          scrollT: vp.scrollTop,
        }
        return
      }

      const coords = getPixelCoords(e)
      if (!coords) return

      if (e.button !== 0 && e.button !== 2) return

      const activeButton = e.button === 2 ? 2 : 0

      if (selectedTool === 'eyedropper') {
        const flat = flattenLayers()
        const picked = cssColor(flat, coords.px, coords.py)
        if (activeButton === 2) setSecondaryColor(picked === TRANSPARENT ? '#ffffff' : picked)
        else setColor(picked === TRANSPARENT ? '#000000' : picked)
        return
      }

      if (selectedTool === 'fill') {
        const fillCol =
          activeButton === 2 ? secondaryColor : selectedColor
        fill(coords.px, coords.py, fillCol)
        return
      }

      if (['line', 'rect', 'circle'].includes(selectedTool)) {
        setShapeDraft({
          type: selectedTool,
          ax: coords.px,
          ay: coords.py,
          bx: coords.px,
          by: coords.py,
          button: activeButton,
        })
        return
      }

      pointerDrawButtonRef.current = activeButton

      const strokeColor =
        selectedTool === 'eraser'
          ? TRANSPARENT
          : activeButton === 2
            ? secondaryColor
            : selectedColor

      lastStrokeCell.current = null
      const p0 = expandBrushThroughLine(
        coords.px,
        coords.py,
        coords.px,
        coords.py,
        brushSize
      ).map(([x, y]) => ({ x, y, c: strokeColor }))
      strokeAccumulatorRef.current = p0
      setStrokePreview(p0)
      lastStrokeCell.current = { x: coords.px, y: coords.py }
    },
    [
      getPixelCoords,
      selectedTool,
      fill,
      flattenLayers,
      setColor,
      brushSize,
      secondaryColor,
      selectedColor,
    ]
  )

  const handlePointerMove = useCallback(
    (e) => {
      if (panRef.current.active && e.buttons === 4) {
        const vp = viewportRef.current
        if (!vp) return
        const dx = e.clientX - panRef.current.startX
        const dy = e.clientY - panRef.current.startY
        vp.scrollLeft = panRef.current.scrollL - dx
        vp.scrollTop = panRef.current.scrollT - dy
        return
      }

      const coords = getPixelCoords(e)
      if (!coords) return

      if (
        shapeDraft &&
        ((e.buttons & 1) !== 0 || (e.buttons & 2) !== 0)
      ) {
        setShapeDraft((d) =>
          d ? { ...d, bx: coords.px, by: coords.py } : null
        )
        return
      }

      const drawing =
        (e.buttons & 1) === 1 || (e.buttons & 2) === 2
      if (
        !drawing ||
        ['eyedropper', 'fill', 'line', 'rect', 'circle'].includes(selectedTool)
      ) {
        return
      }

      const btn = pointerDrawButtonRef.current
      const strokeColor =
        selectedTool === 'eraser'
          ? TRANSPARENT
          : btn === 2
            ? secondaryColor
            : selectedColor

      setStrokePreview((prev) => {
        const last = lastStrokeCell.current
        let segment = []
        if (!last) {
          segment = [{ x: coords.px, y: coords.py, c: strokeColor }]
        } else {
          const cells = expandBrushThroughLine(
            last.x,
            last.y,
            coords.px,
            coords.py,
            brushSize
          )
          segment = cells.map(([x, y]) => ({ x, y, c: strokeColor }))
        }
        lastStrokeCell.current = { x: coords.px, y: coords.py }
        const map = new Map(prev.map((p) => [`${p.x},${p.y}`, p]))
        for (const p of segment) map.set(`${p.x},${p.y}`, p)
        const merged = [...map.values()]
        strokeAccumulatorRef.current = merged
        return merged
      })
    },
    [
      getPixelCoords,
      shapeDraft,
      selectedTool,
      brushSize,
      secondaryColor,
      selectedColor,
    ]
  )

  const handlePointerUp = useCallback(
    (e) => {
      if (e.button === 1) {
        panRef.current.active = false
      }

      if (shapeDraft && ['line', 'rect', 'circle'].includes(selectedTool)) {
        commitShape(shapeDraft)
        setShapeDraft(null)
      }

      const acc = strokeAccumulatorRef.current
      if (
        acc.length &&
        !['eyedropper', 'fill', 'line', 'rect', 'circle'].includes(selectedTool)
      ) {
        flushStroke(acc)
      }
      strokeAccumulatorRef.current = []
      setStrokePreview([])
      lastStrokeCell.current = null
    },
    [shapeDraft, selectedTool, commitShape, flushStroke]
  )

  const handlePointerLeave = useCallback(() => {
    panRef.current.active = false
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select')) return
      const k = e.key.toLowerCase()
      if (k === 'b') setTool('pencil')
      else if (k === 'e') setTool('eraser')
      else if (k === 'g') setTool('fill')
      else if (k === 'i') setTool('eyedropper')
      else if ((e.metaKey || e.ctrlKey) && k === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if ((e.metaKey || e.ctrlKey) && k === 'y') {
        e.preventDefault()
        redo()
      } else if (!e.metaKey && !e.ctrlKey && k === 'z') undo()
      else if (!e.metaKey && !e.ctrlKey && k === 'y') redo()
      else if (k === '[') setBrushSize(Math.max(1, brushSize - 1))
      else if (k === ']') setBrushSize(Math.min(8, brushSize + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setTool, undo, redo, setBrushSize, brushSize])

  const handleExportPng = useCallback(() => {
    const dataUrl = exportSprite()
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `sprite-${canvasWidth}x${canvasHeight}.png`
    a.click()
  }, [exportSprite, canvasWidth, canvasHeight])

  const syncedFramesForProject = useCallback(() => {
    const s = useSpriteEditorStore.getState()
    return s.frames.map((fr, i) =>
      i === s.currentFrame
        ? { layers: structuredClone(s.layers) }
        : structuredClone(fr)
    )
  }, [])

  const handleSaveProject = useCallback(() => {
    const s = useSpriteEditorStore.getState()
    const framesPayload = syncedFramesForProject()
    const flat = s.flattenLayers()
    const nameEntry = currentSpriteId
      ? sprites.find((sp) => sp.id === currentSpriteId)
      : null
    const name = nameEntry?.name ?? `Sprite ${canvasWidth}x${canvasHeight}`

    const data = {
      width: s.canvasWidth,
      height: s.canvasHeight,
      pixels: flat,
      frames: framesPayload,
      name,
    }

    if (currentSpriteId) {
      updateSprite(currentSpriteId, data)
    } else {
      const id = addSprite({ ...data, name })
      setCurrentSpriteId(id)
    }
  }, [
    currentSpriteId,
    sprites,
    canvasWidth,
    canvasHeight,
    addSprite,
    updateSprite,
    setCurrentSpriteId,
    syncedFramesForProject,
  ])

  const handleNewSprite = useCallback(() => {
    newSprite(gridPreset, gridPreset)
    setCurrentSpriteId(null)
  }, [gridPreset, newSprite, setCurrentSpriteId])

  const topLayersFirst = useMemo(() => [...layers].reverse(), [layers])

  const moveLayer = useCallback(
    (id, dir) => {
      const idx = layers.findIndex((l) => l.id === id)
      if (idx < 0) return
      const next = [...layers]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      reorderLayers(next.map((l) => l.id))
    },
    [layers, reorderLayers]
  )

  return (
    <div
      className="flex h-screen min-h-0 flex-col bg-gray-900 text-gray-300"
      tabIndex={0}
    >
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-700 bg-gray-900 px-3 py-2">
        <span className="text-sm text-gray-400">Grid</span>
        {[16, 32, 64].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              setGridPreset(g)
            }}
            className={`rounded border px-2 py-1 text-sm ${
              gridPreset === g
                ? 'border-gray-500 bg-gray-700 text-white'
                : 'border-gray-700 bg-gray-800 text-gray-300'
            }`}
          >
            {g}
          </button>
        ))}
        <button
          type="button"
          onClick={handleNewSprite}
          className="rounded border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-white hover:bg-gray-700"
        >
          New sprite
        </button>
        <button
          type="button"
          onClick={handleSaveProject}
          className="rounded border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-white hover:bg-gray-700"
        >
          Save to project
        </button>
        <button
          type="button"
          onClick={handleExportPng}
          className="rounded border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-white hover:bg-gray-700"
        >
          Export PNG
        </button>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
          {currentSpriteId ? (
            <span className="text-emerald-500/90">Linked: {currentSpriteId.slice(0, 8)}…</span>
          ) : (
            <span>New (not saved)</span>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-48 shrink-0 flex-col gap-3 border-r border-gray-700 bg-gray-800 p-2">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Tools
          </div>
          <div className="grid grid-cols-2 gap-1">
            {[
              ['pencil', 'Pen'],
              ['eraser', 'Era'],
              ['fill', 'Fill'],
              ['eyedropper', 'Eye'],
              ['rect', 'Rect'],
              ['line', 'Line'],
              ['circle', 'Circ'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTool(id)}
                className={`rounded border px-2 py-2 text-xs font-medium ${
                  selectedTool === id
                    ? 'border-gray-500 bg-gray-700 text-white'
                    : 'border-gray-700 bg-gray-900 text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">Brush size ({brushSize})</label>
            <input
              type="range"
              min={1}
              max={8}
              value={brushSize}
              onChange={(ev) => setBrushSize(Number(ev.target.value))}
              className="w-full accent-slate-400"
            />
          </div>

          <div className="space-y-2 border-t border-gray-700 pt-2">
            <div className="flex items-center gap-2">
              <div
                className="h-10 w-10 shrink-0 rounded border border-gray-600"
                style={{ backgroundColor: selectedColor }}
                title="Primary"
              />
              <div className="min-w-0 text-xs">
                <div className="text-gray-400">Primary</div>
                <div className="truncate font-mono text-[11px] text-white">
                  {selectedColor}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 shrink-0 rounded border border-gray-600"
                style={{ backgroundColor: secondaryColor }}
                title="Secondary (right-click palette / RMB draw)"
              />
              <div className="min-w-0 text-xs">
                <div className="text-gray-400">Secondary</div>
                <div className="truncate font-mono text-[11px] text-white">
                  {secondaryColor}
                </div>
              </div>
            </div>
            <input
              type="color"
              value={/^#/.test(selectedColor) ? selectedColor.slice(0, 7) : '#000000'}
              onChange={(ev) => setColor(ev.target.value)}
              className="h-9 w-full cursor-pointer rounded border border-gray-600 bg-gray-700 p-1"
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-gray-500">Palette (click / right-click)</div>
            <div className="grid grid-cols-4 gap-1">
              {palette.length === 0 && (
                <span className="text-[11px] text-gray-600">Paint to fill palette</span>
              )}
              {palette.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  onContextMenu={(ev) => {
                    ev.preventDefault()
                    setSecondaryColor(c)
                  }}
                  className={`h-7 w-full rounded border ${
                    selectedColor === c ? 'border-white' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-1 border-t border-gray-700 pt-2 text-xs">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => undo()}
                className="flex-1 rounded border border-gray-700 bg-gray-900 py-1 text-gray-300"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={() => redo()}
                className="flex-1 rounded border border-gray-700 bg-gray-900 py-1 text-gray-300"
              >
                Redo
              </button>
            </div>
            <div className="text-[10px] text-gray-600">
              B E G I · Z / Y undo · redo · Ctrl+Z/Ctrl+Y · [ ]
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-gray-900">
          <div className="flex shrink-0 items-center gap-3 border-b border-gray-700 px-3 py-2 text-xs">
            <span>
              Zoom {zoom}x — canvas {canvasWidth}×{canvasHeight}
            </span>
            <input
              type="range"
              min={2}
              max={24}
              step={1}
              value={zoom}
              onChange={(ev) => setZoom(Number(ev.target.value))}
              className="max-w-xs flex-1 accent-slate-400"
            />
          </div>

          <div
            ref={viewportRef}
            className="min-h-0 flex-1 overflow-auto bg-[#18181f]"
          >
            <div
              className="inline-block p-8"
              style={{ minWidth: '100%', minHeight: '100%' }}
            >
              <canvas
                ref={canvasRef}
                className="cursor-crosshair shadow-lg ring-1 ring-gray-700"
                width={screenW}
                height={screenH}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerLeave}
                onContextMenu={(ev) => ev.preventDefault()}
              />
            </div>
          </div>
        </div>

        <aside className="flex w-56 shrink-0 flex-col gap-2 border-l border-gray-700 bg-gray-800 p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Layers
            </span>
            <button
              type="button"
              onClick={() => addLayer()}
              className="rounded border border-gray-700 bg-gray-900 px-2 py-0.5 text-xs text-white"
            >
              + Add
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-auto">
            {topLayersFirst.map((layer) => {
              const isActive = layer.id === activeLayerId
              return (
                <div
                  key={layer.id}
                  className={`rounded border p-2 text-xs ${
                    isActive
                      ? 'border-gray-500 bg-gray-700'
                      : 'border-gray-700 bg-gray-900'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveLayer(layer.id)}
                    className="mb-1 w-full truncate text-left font-medium text-gray-200"
                  >
                    {layer.name}
                  </button>
                  <div className="mb-1 flex items-center gap-1">
                    <button
                      type="button"
                      title="Visibility"
                      onClick={() => toggleLayerVisibility(layer.id)}
                      className="rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5"
                    >
                      {layer.visible ? 'vis' : 'off'}
                    </button>
                    <button
                      type="button"
                      title="Lock"
                      onClick={() => toggleLayerLock(layer.id)}
                      className="rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5"
                    >
                      {layer.locked ? 'lck' : 'ulk'}
                    </button>
                  </div>
                  <label className="mb-1 flex items-center gap-2 text-[10px] text-gray-500">
                    Opacity
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round((layer.opacity ?? 1) * 100)}
                      onChange={(ev) =>
                        setLayerOpacity(layer.id, Number(ev.target.value) / 100)
                      }
                      className="flex-1 accent-slate-400"
                    />
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveLayer(layer.id, 1)}
                      className="flex-1 rounded border border-gray-700 bg-gray-900 py-0.5 text-[10px]"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLayer(layer.id, -1)}
                      className="flex-1 rounded border border-gray-700 bg-gray-900 py-0.5 text-[10px]"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLayer(layer.id)}
                      disabled={layers.length <= 1}
                      className="rounded border border-red-900/50 bg-gray-900 px-1.5 py-0.5 text-[10px] text-red-400 disabled:opacity-40"
                    >
                      X
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      </div>

      <footer className="shrink-0 border-t border-gray-700 bg-gray-800 px-3 py-2">
        <div className="mb-2 flex flex-wrap items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => (animationPlaying ? stopAnimation() : playAnimation())}
            disabled={frames.length < 2}
            className="rounded border border-gray-700 bg-gray-900 px-3 py-1 text-white disabled:opacity-40"
          >
            {animationPlaying ? 'Stop' : 'Play'}
          </button>
          <label className="flex items-center gap-2 text-gray-400">
            FPS
            <input
              type="number"
              min={1}
              max={60}
              value={animationFPS}
              onChange={(ev) => setAnimationFPS(Number(ev.target.value))}
              className="w-14 rounded border border-gray-700 bg-gray-700 px-2 py-1 text-white"
            />
          </label>
          <button
            type="button"
            onClick={() => toggleOnionSkin()}
            className={`rounded border px-3 py-1 ${
              onionSkinEnabled
                ? 'border-gray-500 bg-gray-700 text-white'
                : 'border-gray-700 bg-gray-900 text-gray-400'
            }`}
          >
            Onion skin
          </button>
          <button
            type="button"
            onClick={() => addFrame()}
            className="rounded border border-gray-700 bg-gray-900 px-2 py-1 text-white"
          >
            + Frame
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {frames.map((_, i) => (
            <div
              key={i}
              className={`relative shrink-0 rounded border p-1 ${
                i === currentFrame ? 'border-white ring-1 ring-white' : 'border-gray-600'
              }`}
            >
              <button
                type="button"
                onClick={() => setCurrentFrame(i)}
                className="block w-full text-left"
              >
                <FrameThumb frameIndex={i} />
                <span className="mt-1 block text-center text-[10px] text-gray-400">
                  {i + 1}
                </span>
              </button>
              <div className="absolute right-0 top-0 flex gap-0.5">
                <button
                  type="button"
                  title="Duplicate"
                  onClick={() => duplicateFrame(i)}
                  className="rounded bg-gray-900/90 px-1 text-[9px] text-gray-300"
                >
                  D
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={() => removeFrame(i)}
                  disabled={frames.length <= 1}
                  className="rounded bg-gray-900/90 px-1 text-[9px] text-red-400 disabled:opacity-30"
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}

function expandBrushAlongPoints(pts, brush) {
  const half = Math.floor(Math.max(1, brush) / 2)
  const set = new Map()
  for (const [cx, cy] of pts) {
    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        set.set(`${cx + dx},${cy + dy}`, [cx + dx, cy + dy])
      }
    }
  }
  return [...set.values()]
}

function FrameThumb({ frameIndex }) {
  const canvasRef = useRef(null)
  const canvasWidth = useSpriteEditorStore((s) => s.canvasWidth)
  const canvasHeight = useSpriteEditorStore((s) => s.canvasHeight)
  const layerStamp = useSpriteEditorStore((s) =>
    frameIndex === s.currentFrame ? s.layers : s.frames[frameIndex]?.layers
  )

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const z = Math.max(
      1,
      Math.min(4, Math.floor(32 / Math.max(canvasWidth, canvasHeight)))
    )
    c.width = canvasWidth * z
    c.height = canvasHeight * z
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    const flat = useSpriteEditorStore.getState().flattenFrameAt(frameIndex)
    for (let y = 0; y < flat.length; y++) {
      const row = flat[y]
      if (!row) continue
      for (let x = 0; x < row.length; x++) {
        const col = row[x]
        if (col === TRANSPARENT || col === 'transparent') continue
        const { r, g, b, a } = parseCssRgba(col)
        if (a <= 0) continue
        ctx.fillStyle =
          a >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`
        ctx.fillRect(x * z, y * z, z, z)
      }
    }
  }, [layerStamp, frameIndex, canvasWidth, canvasHeight])

  return (
    <canvas
      ref={canvasRef}
      className="mx-auto block bg-[#222]"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
