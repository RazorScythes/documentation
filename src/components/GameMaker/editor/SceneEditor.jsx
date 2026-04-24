import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useProjectStore, useEditorStore, useSceneStore } from '../store'
import {
  createEntity,
  addComponent,
  COMPONENT_DEFAULTS,
  screenToWorld,
  worldToScreen,
  pointInEntity,
  entitiesInRect,
} from '../engine'

/** @typedef {'background'|'mid'|'foreground'|'ui'} LayerChoice */

const LAYER_OPTIONS = [
  { value: 'background', label: 'Background' },
  { value: 'mid', label: 'Mid' },
  { value: 'foreground', label: 'Foreground' },
  { value: 'ui', label: 'UI' },
]

const COMPONENT_ADD_OPTIONS = [
  'Transform',
  'SpriteRenderer',
  'Collider',
  'RigidBody',
  'Animator',
  'Script',
  'Spawner',
  'EventTrigger',
  'PlayerController',
  'NPC',
  'Camera',
  'Tile',
]

function tileLayerForPaint(layer) {
  if (layer === 'ui') return 'foreground'
  return layer
}

/** @param {unknown} c */
function parseColorToRgba(c) {
  if (c == null || c === '' || c === 'transparent') return [0, 0, 0, 0]
  const s = String(c).trim()
  if (s.startsWith('#')) {
    const hex = s.slice(1)
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return [r, g, b, 255]
    }
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      const a = parseInt(hex.slice(6, 8), 16)
      return [r, g, b, a]
    }
  }
  const m = s.match(/rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/)
  if (m) {
    const r = Number(m[1])
    const g = Number(m[2])
    const b = Number(m[3])
    const a = m[4] !== undefined ? Number(m[4]) * 255 : 255
    return [r, g, b, a]
  }
  return [200, 120, 200, 255]
}

/** Build & cache atlas-style image from sprite pixels (2D array of CSS colors). */
function getSpriteCanvas(sprite, cacheRef) {
  if (!sprite?.id) return null
  const hit = cacheRef.current.get(sprite.id)
  if (hit) return hit
  const w = sprite.width ?? 32
  const h = sprite.height ?? 32
  const pixels = sprite.pixels
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const img = ctx.createImageData(w, h)
  if (Array.isArray(pixels) && pixels.length) {
    if (typeof pixels[0]?.[0] === 'string' || pixels[0]?.[0] != null) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const [r, g, b, a] = parseColorToRgba(pixels[y]?.[x])
          const i = (y * w + x) * 4
          img.data[i] = r
          img.data[i + 1] = g
          img.data[i + 2] = b
          img.data[i + 3] = a
        }
      }
      ctx.putImageData(img, 0, 0)
    }
  } else {
    ctx.fillStyle = '#555'
    ctx.fillRect(0, 0, w, h)
  }
  const atlas = {
    image: canvas,
    frameWidth: w,
    frameHeight: h,
    columns: Array.isArray(sprite.frames) && sprite.frames.length ? sprite.frames.length : 1,
  }
  cacheRef.current.set(sprite.id, atlas)
  return atlas
}

/** ECS-like entity for engine helpers (Transform inside components). */
function normalizeEntity(e) {
  if (!e) return e
  const comp = { ...(e.components || {}) }
  if (e.transform && typeof e.transform === 'object' && !comp.Transform) {
    comp.Transform = { ...COMPONENT_DEFAULTS.Transform, ...e.transform }
  }
  if (!comp.Transform && e.components?.Transform) {
    comp.Transform = { ...COMPONENT_DEFAULTS.Transform, ...e.components.Transform }
  }
  return { ...e, components: comp }
}

function getTransform(e) {
  const n = normalizeEntity(e)
  return n.components?.Transform ?? COMPONENT_DEFAULTS.Transform
}

function getZIndex(e) {
  return getTransform(e).zIndex ?? 0
}

/** @param {Map<string, object>} entities */
function entitiesToSortedArray(entities) {
  return [...entities.values()].sort((a, b) => getZIndex(a) - getZIndex(b))
}

function pickEntityAt(sortedDesc, wx, wy) {
  for (const e of sortedDesc) {
    if (e.active === false) continue
    if (pointInEntity(wx, wy, normalizeEntity(e))) return e
  }
  return null
}

/** --- Toolbar --- */
function Toolbar() {
  const selectedTool = useEditorStore((s) => s.selectedTool)
  const setTool = useEditorStore((s) => s.setTool)
  const gridVisible = useEditorStore((s) => s.gridVisible)
  const toggleGrid = useEditorStore((s) => s.toggleGrid)
  const snapToGrid = useEditorStore((s) => s.snapToGrid)
  const toggleSnap = useEditorStore((s) => s.toggleSnap)
  const showColliders = useEditorStore((s) => s.showColliders)
  const toggleColliders = useEditorStore((s) => s.toggleColliders)
  const currentLayer = useEditorStore((s) => s.currentLayer)
  const setCurrentLayer = useEditorStore((s) => s.setCurrentLayer)
  const zoom = useEditorStore((s) => s.zoom)
  const setZoom = useEditorStore((s) => s.setZoom)
  const startPlaying = useEditorStore((s) => s.startPlaying)
  const isPlaying = useEditorStore((s) => s.isPlaying)

  const btn = (id, label, title) => (
    <button
      type="button"
      title={title}
      onClick={() => setTool(id)}
      className={`rounded px-2 py-1 text-xs font-medium ${
        selectedTool === id
          ? 'bg-emerald-700 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-700 bg-gray-900 px-2 py-1.5">
      <div className="flex gap-1">
        {btn('select', 'Sel', 'Select')}
        {btn('move', 'Mov', 'Move')}
        {btn('scale', 'Scl', 'Scale')}
        {btn('rotate', 'Rot', 'Rotate')}
        {btn('paint', 'Pnt', 'Paint tiles')}
        {btn('erase', 'Era', 'Erase tiles')}
        {btn('fill', 'Fil', 'Fill tiles')}
      </div>
      <div className="h-6 w-px bg-gray-700" />
      <button
        type="button"
        onClick={() => toggleGrid()}
        className={`rounded px-2 py-1 text-xs ${gridVisible ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400'}`}
      >
        Grid
      </button>
      <button
        type="button"
        onClick={() => toggleSnap()}
        className={`rounded px-2 py-1 text-xs ${snapToGrid ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400'}`}
      >
        Snap
      </button>
      <button
        type="button"
        onClick={() => toggleColliders()}
        className={`rounded px-2 py-1 text-xs ${showColliders ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400'}`}
      >
        Col
      </button>
      <select
        value={currentLayer}
        onChange={(e) => setCurrentLayer(e.target.value)}
        className="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-200"
      >
        {LAYER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-200"
          onClick={() => setZoom(Math.max(0.1, zoom / 1.15))}
        >
          −
        </button>
        <span className="min-w-[52px] text-center text-xs text-gray-400">{zoom.toFixed(2)}×</span>
        <button
          type="button"
          className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-200"
          onClick={() => setZoom(Math.min(8, zoom * 1.15))}
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={() => (isPlaying ? useEditorStore.getState().stopPlaying() : startPlaying())}
        className={`ml-auto flex h-9 w-10 items-center justify-center rounded text-lg ${
          isPlaying ? 'bg-amber-700 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
        }`}
        title={isPlaying ? 'Stop' : 'Play'}
      >
        {isPlaying ? '■' : '▶'}
      </button>
    </div>
  )
}

/** --- Asset Browser --- */
function AssetBrowser({
  assetTab,
  setAssetTab,
  filter,
  setFilter,
  sprites,
  tilesets,
  prefabs,
  setActivePaintTile,
  activePaintTile,
  placement,
  setPlacement,
}) {
  const f = filter.trim().toLowerCase()
  const match = (name) => !f || String(name || '').toLowerCase().includes(f)

  const spriteCacheRef = useRef(new Map())

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-gray-700 bg-gray-900">
      <input
        type="search"
        placeholder="Search…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="m-2 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-200 placeholder:text-gray-500"
      />
      <div className="flex border-b border-gray-700">
        {['Sprites', 'Tiles', 'Prefabs'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setAssetTab(t)}
            className={`flex-1 px-2 py-1.5 text-xs ${
              assetTab === t ? 'border-b-2 border-emerald-600 text-emerald-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {assetTab === 'Sprites' && (
          <div className="grid grid-cols-2 gap-2">
            {sprites.filter((s) => match(s.name)).map((sp) => {
              const atlas = getSpriteCanvas(sp, spriteCacheRef)
              return (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => setPlacement({ type: 'sprite', id: sp.id })}
                  className={`flex flex-col items-center gap-1 rounded border p-1 text-left ${
                    placement?.type === 'sprite' && placement.id === sp.id
                      ? 'border-emerald-500 bg-gray-800'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className="flex h-14 w-full items-center justify-center overflow-hidden rounded bg-gray-950">
                    {atlas?.image ? (
                      <img
                        src={atlas.image.toDataURL()}
                        className="max-h-14 max-w-full pixelated"
                        style={{ imageRendering: 'pixelated' }}
                        alt={sp.name || 'sprite'}
                      />
                    ) : (
                      <span className="text-[10px] text-gray-500">—</span>
                    )}
                  </div>
                  <span className="line-clamp-2 w-full text-[10px] text-gray-300">{sp.name || sp.id}</span>
                </button>
              )
            })}
          </div>
        )}
        {assetTab === 'Tiles' &&
          tilesets.map((ts) => (
            <div key={ts.id} className="mb-4">
              <div className="mb-1 text-xs font-semibold text-gray-400">{ts.name}</div>
              <div
                className="grid gap-px rounded border border-gray-700 p-1"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(ts.columns || 8, 1)}, minmax(0, 1fr))`,
                }}
              >
                {(ts.spriteIds || []).map((sid, idx) => {
                  const sp = sprites.find((s) => s.id === sid)
                  const atlas = sp ? getSpriteCanvas(sp, spriteCacheRef) : null
                  const active =
                    activePaintTile?.tilesetId === ts.id && activePaintTile?.tileIndex === idx
                  return (
                    <button
                      key={`${ts.id}-${idx}`}
                      type="button"
                      title={`Tile ${idx}`}
                      onClick={() => setActivePaintTile(ts.id, idx)}
                      className={`aspect-square overflow-hidden rounded border ${
                        active ? 'border-emerald-500' : 'border-transparent hover:border-gray-500'
                      }`}
                    >
                      {atlas?.image ? (
                        <img
                          src={atlas.image.toDataURL()}
                          className="h-full w-full object-contain pixelated"
                          style={{ imageRendering: 'pixelated' }}
                          alt={`Tile ${idx}`}
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-800" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        {assetTab === 'Prefabs' && (
          <ul className="space-y-1">
            {prefabs.filter((p) => match(p.name)).map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setPlacement({ type: 'prefab', id: p.id })}
                  className={`w-full rounded border px-2 py-1.5 text-left text-xs ${
                    placement?.type === 'prefab' && placement.id === p.id
                      ? 'border-emerald-500 bg-gray-800 text-emerald-300'
                      : 'border-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {p.name || p.id}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/** --- Inspector --- */
function TrashBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-gray-500 hover:text-red-400"
      title="Remove"
    >
      ✕
    </button>
  )
}

function Inspector({
  selectedIds,
  entities,
  sprites,
  prefabs,
  dialogues,
  sceneName,
  tileMap,
  resizeMap,
  updateEntity,
  updateComponent,
  removeComponentFromEntity,
  addComponentToEntity,
  onEditScript,
}) {
  const singleId = selectedIds.length === 1 ? selectedIds[0] : null
  const entity = singleId ? entities.get(singleId) : null

  const onTags = (raw) => {
    if (!entity) return
    const tags = raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    updateEntity(entity.id, { tags })
  }

  if (!entity) {
    const w = tileMap.width || 32
    const h = tileMap.height || 24
    return (
      <div className="flex h-full flex-col gap-3 overflow-y-auto p-3 text-xs text-gray-300">
        <div className="text-sm font-semibold text-gray-100">Scene</div>
        <label className="flex flex-col gap-1">
          Name
          <input
            className="rounded border border-gray-700 bg-gray-800 px-2 py-1"
            value={sceneName}
            readOnly
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            Map W (tiles)
            <input
              type="number"
              className="rounded border border-gray-700 bg-gray-800 px-2 py-1"
              defaultValue={w}
              key={`mw-${w}`}
              onBlur={(e) =>
                resizeMap(Number(e.target.value) || 1, Number(h) || 1)
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            Map H (tiles)
            <input
              type="number"
              className="rounded border border-gray-700 bg-gray-800 px-2 py-1"
              defaultValue={h}
              key={`mh-${h}`}
              onBlur={(e) =>
                resizeMap(Number(w) || 1, Number(e.target.value) || 1)
              }
            />
          </label>
        </div>
        <p className="text-[10px] text-gray-500">
          Select an entity to edit components. Map size applies when you leave the width/height fields.
        </p>
      </div>
    )
  }

  if (selectedIds.length > 1) {
    return (
      <div className="p-3 text-xs text-gray-400">{selectedIds.length} entities selected. Showing first.</div>
    )
  }

  const comps = entity.components && typeof entity.components === 'object' ? entity.components : {}

  const patchComp = (name, data) => updateComponent(entity.id, name, data)

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3 text-xs text-gray-300">
      <label className="flex flex-col gap-1">
        Name
        <input
          className="rounded border border-gray-700 bg-gray-800 px-2 py-1"
          value={entity.name ?? ''}
          onChange={(e) => updateEntity(entity.id, { name: e.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1">
        Tags (comma-separated)
        <input
          className="rounded border border-gray-700 bg-gray-800 px-2 py-1"
          value={(entity.tags || []).join(', ')}
          onChange={(e) => onTags(e.target.value)}
        />
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={entity.active !== false}
          onChange={(e) => updateEntity(entity.id, { active: e.target.checked })}
        />
        Active
      </label>

      <div className="flex items-center gap-2">
        <span className="text-gray-400">Add Component</span>
        <select
          className="flex-1 rounded border border-gray-700 bg-gray-800 px-2 py-1"
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value
            if (v) {
              addComponentToEntity(entity.id, v, {})
              e.target.value = ''
            }
          }}
        >
          <option value="" disabled>
            Choose…
          </option>
          {COMPONENT_ADD_OPTIONS.filter((c) => !(c in comps)).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {comps.Transform && (
        <details open className="rounded border border-gray-700 bg-gray-800/50 p-2">
          <summary className="cursor-pointer font-semibold text-gray-200">
            Transform{' '}
            <span className="float-right">
              <TrashBtn onClick={() => removeComponentFromEntity(entity.id, 'Transform')} />
            </span>
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {['x', 'y', 'scaleX', 'scaleY', 'rotation', 'zIndex'].map((k) => (
              <label key={k} className="flex flex-col gap-0.5">
                {k}
                <input
                  type="number"
                  className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                  value={comps.Transform[k] ?? ''}
                  onChange={(e) =>
                    patchComp('Transform', { [k]: parseFloat(e.target.value) || 0 })
                  }
                />
              </label>
            ))}
          </div>
        </details>
      )}

      {comps.SpriteRenderer && (
        <details open className="rounded border border-gray-700 bg-gray-800/50 p-2">
          <summary className="cursor-pointer font-semibold text-gray-200">
            SpriteRenderer <TrashBtn onClick={() => removeComponentFromEntity(entity.id, 'SpriteRenderer')} />
          </summary>
          <div className="mt-2 space-y-2">
            <label className="flex flex-col gap-1">
              spriteId
              <select
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.SpriteRenderer.spriteId ?? ''}
                onChange={(e) => patchComp('SpriteRenderer', { spriteId: e.target.value || null })}
              >
                <option value="">—</option>
                {sprites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              frameIndex
              <input
                type="number"
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.SpriteRenderer.frameIndex ?? 0}
                onChange={(e) => patchComp('SpriteRenderer', { frameIndex: Number(e.target.value) })}
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!comps.SpriteRenderer.flipX}
                onChange={(e) => patchComp('SpriteRenderer', { flipX: e.target.checked })}
              />
              flipX
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!comps.SpriteRenderer.flipY}
                onChange={(e) => patchComp('SpriteRenderer', { flipY: e.target.checked })}
              />
              flipY
            </label>
            <label className="flex flex-col gap-1">
              opacity
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={comps.SpriteRenderer.opacity ?? 1}
                onChange={(e) => patchComp('SpriteRenderer', { opacity: parseFloat(e.target.value) })}
              />
            </label>
            <label className="flex flex-col gap-1">
              width
              <input
                type="number"
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.SpriteRenderer.width ?? 32}
                onChange={(e) => patchComp('SpriteRenderer', { width: Number(e.target.value) })}
              />
            </label>
            <label className="flex flex-col gap-1">
              height
              <input
                type="number"
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.SpriteRenderer.height ?? 32}
                onChange={(e) => patchComp('SpriteRenderer', { height: Number(e.target.value) })}
              />
            </label>
          </div>
        </details>
      )}

      {comps.Collider && (
        <details className="rounded border border-gray-700 bg-gray-800/50 p-2">
          <summary className="cursor-pointer font-semibold text-gray-200">
            Collider <TrashBtn onClick={() => removeComponentFromEntity(entity.id, 'Collider')} />
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="col-span-2 flex flex-col gap-1">
              type
              <select
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.Collider.type || 'box'}
                onChange={(e) => patchComp('Collider', { type: e.target.value })}
              >
                <option value="box">box</option>
              </select>
            </label>
            {['width', 'height', 'offsetX', 'offsetY'].map((k) => (
              <label key={k} className="flex flex-col gap-0.5">
                {k}
                <input
                  type="number"
                  className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                  value={comps.Collider[k] ?? ''}
                  onChange={(e) => patchComp('Collider', { [k]: parseFloat(e.target.value) || 0 })}
                />
              </label>
            ))}
            <label className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!comps.Collider.isTrigger}
                onChange={(e) => patchComp('Collider', { isTrigger: e.target.checked })}
              />
              isTrigger
            </label>
          </div>
        </details>
      )}

      {comps.RigidBody && (
        <details className="rounded border border-gray-700 bg-gray-800/50 p-2">
          <summary className="cursor-pointer font-semibold text-gray-200">
            RigidBody <TrashBtn onClick={() => removeComponentFromEntity(entity.id, 'RigidBody')} />
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {['velocityX', 'velocityY', 'gravityScale', 'friction', 'mass'].map((k) => (
              <label key={k} className="flex flex-col gap-0.5">
                {k}
                <input
                  type="number"
                  className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                  value={comps.RigidBody[k] ?? ''}
                  onChange={(e) => patchComp('RigidBody', { [k]: parseFloat(e.target.value) || 0 })}
                />
              </label>
            ))}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!comps.RigidBody.isStatic}
                onChange={(e) => patchComp('RigidBody', { isStatic: e.target.checked })}
              />
              isStatic
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!comps.RigidBody.isKinematic}
                onChange={(e) => patchComp('RigidBody', { isKinematic: e.target.checked })}
              />
              isKinematic
            </label>
          </div>
        </details>
      )}

      {comps.Animator && (
        <details className="rounded border border-gray-700 bg-gray-800/50 p-2">
          <summary className="cursor-pointer font-semibold text-gray-200">
            Animator <TrashBtn onClick={() => removeComponentFromEntity(entity.id, 'Animator')} />
          </summary>
          <div className="mt-2 space-y-2">
            <label className="flex flex-col gap-1">
              animation
              <input
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.Animator.currentAnimation ?? ''}
                onChange={(e) => patchComp('Animator', { currentAnimation: e.target.value || null })}
              />
            </label>
            <label className="flex flex-col gap-1">
              speed
              <input
                type="number"
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.Animator.speed ?? 1}
                onChange={(e) => patchComp('Animator', { speed: parseFloat(e.target.value) || 0 })}
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={comps.Animator.loop !== false}
                onChange={(e) => patchComp('Animator', { loop: e.target.checked })}
              />
              loop
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded bg-gray-700 px-2 py-1 text-gray-200"
                onClick={() => patchComp('Animator', { playing: true })}
              >
                Play
              </button>
              <button
                type="button"
                className="rounded bg-gray-700 px-2 py-1 text-gray-200"
                onClick={() => patchComp('Animator', { playing: false })}
              >
                Stop
              </button>
            </div>
          </div>
        </details>
      )}

      {comps.Script && (
        <details className="rounded border border-gray-700 bg-gray-800/50 p-2">
          <summary className="cursor-pointer font-semibold text-gray-200">
            Script <TrashBtn onClick={() => removeComponentFromEntity(entity.id, 'Script')} />
          </summary>
          <button
            type="button"
            className="mt-2 w-full rounded bg-emerald-800 px-2 py-1 text-gray-100"
            onClick={onEditScript}
          >
            Edit Script
          </button>
        </details>
      )}

      {comps.Spawner && (
        <details className="rounded border border-gray-700 bg-gray-800/50 p-2">
          <summary className="cursor-pointer font-semibold text-gray-200">
            Spawner <TrashBtn onClick={() => removeComponentFromEntity(entity.id, 'Spawner')} />
          </summary>
          <div className="mt-2 space-y-2">
            <label className="flex flex-col gap-1">
              prefabId
              <select
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.Spawner.prefabId ?? ''}
                onChange={(e) => patchComp('Spawner', { prefabId: e.target.value || null })}
              >
                <option value="">—</option>
                {prefabs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              rate
              <input
                type="number"
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.Spawner.rate ?? 1}
                onChange={(e) => patchComp('Spawner', { rate: parseFloat(e.target.value) })}
              />
            </label>
            <label className="flex flex-col gap-1">
              maxCount
              <input
                type="number"
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.Spawner.maxCount ?? 10}
                onChange={(e) => patchComp('Spawner', { maxCount: parseInt(e.target.value, 10) })}
              />
            </label>
            <label className="flex flex-col gap-1">
              area width
              <input
                type="number"
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.Spawner.spawnArea?.width ?? 100}
                onChange={(e) =>
                  patchComp('Spawner', {
                    spawnArea: {
                      ...comps.Spawner.spawnArea,
                      width: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </label>
            <label className="flex flex-col gap-1">
              area height
              <input
                type="number"
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.Spawner.spawnArea?.height ?? 100}
                onChange={(e) =>
                  patchComp('Spawner', {
                    spawnArea: {
                      ...comps.Spawner.spawnArea,
                      height: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </label>
          </div>
        </details>
      )}

      {comps.EventTrigger && (
        <details className="rounded border border-gray-700 bg-gray-800/50 p-2">
          <summary className="cursor-pointer font-semibold text-gray-200">
            EventTrigger <TrashBtn onClick={() => removeComponentFromEntity(entity.id, 'EventTrigger')} />
          </summary>
          <div className="mt-2 space-y-2">
            <label className="flex flex-col gap-1">
              type
              <select
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.EventTrigger.triggerType ?? 'onCollision'}
                onChange={(e) => patchComp('EventTrigger', { triggerType: e.target.value })}
              >
                <option value="onCollision">onCollision</option>
                <option value="onEnter">onEnter</option>
                <option value="onInteract">onInteract</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              targetTag
              <input
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.EventTrigger.targetTag ?? ''}
                onChange={(e) => patchComp('EventTrigger', { targetTag: e.target.value || null })}
              />
            </label>
            <label className="flex flex-col gap-1">
              cooldown
              <input
                type="number"
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.EventTrigger.cooldown ?? 0}
                onChange={(e) => patchComp('EventTrigger', { cooldown: parseFloat(e.target.value) })}
              />
            </label>
          </div>
        </details>
      )}

      {comps.PlayerController && (
        <details className="rounded border border-gray-700 bg-gray-800/50 p-2">
          <summary className="cursor-pointer font-semibold text-gray-200">
            PlayerController{' '}
            <TrashBtn onClick={() => removeComponentFromEntity(entity.id, 'PlayerController')} />
          </summary>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {['speed', 'sprintMultiplier', 'interactRange'].map((k) => (
              <label key={k} className="flex flex-col gap-0.5">
                {k}
                <input
                  type="number"
                  className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                  value={comps.PlayerController[k] ?? ''}
                  onChange={(e) => patchComp('PlayerController', { [k]: parseFloat(e.target.value) || 0 })}
                />
              </label>
            ))}
          </div>
        </details>
      )}

      {comps.NPC && (
        <details className="rounded border border-gray-700 bg-gray-800/50 p-2">
          <summary className="cursor-pointer font-semibold text-gray-200">
            NPC <TrashBtn onClick={() => removeComponentFromEntity(entity.id, 'NPC')} />
          </summary>
          <div className="mt-2 space-y-2">
            <label className="flex flex-col gap-1">
              dialogueId
              <select
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.NPC.dialogueId ?? ''}
                onChange={(e) => patchComp('NPC', { dialogueId: e.target.value || null })}
              >
                <option value="">—</option>
                {dialogues.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name || d.title || d.id}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              patrolSpeed
              <input
                type="number"
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.NPC.patrolSpeed ?? 50}
                onChange={(e) => patchComp('NPC', { patrolSpeed: parseFloat(e.target.value) })}
              />
            </label>
            <label className="flex flex-col gap-1">
              state
              <input
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.NPC.state ?? 'idle'}
                onChange={(e) => patchComp('NPC', { state: e.target.value })}
              />
            </label>
          </div>
        </details>
      )}

      {comps.Camera && (
        <details className="rounded border border-gray-700 bg-gray-800/50 p-2">
          <summary className="cursor-pointer font-semibold text-gray-200">
            Camera <TrashBtn onClick={() => removeComponentFromEntity(entity.id, 'Camera')} />
          </summary>
          <div className="mt-2 space-y-2">
            <label className="flex flex-col gap-1">
              followTarget
              <select
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.Camera.followTarget ?? ''}
                onChange={(e) => patchComp('Camera', { followTarget: e.target.value || null })}
              >
                <option value="">—</option>
                {[...entities.keys()].map((id) => (
                  <option key={id} value={id}>
                    {entities.get(id)?.name || id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              smoothing
              <input
                type="number"
                step={0.01}
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.Camera.smoothing ?? 0.1}
                onChange={(e) => patchComp('Camera', { smoothing: parseFloat(e.target.value) })}
              />
            </label>
            <label className="flex flex-col gap-1">
              zoom
              <input
                type="number"
                step={0.1}
                className="rounded border border-gray-600 bg-gray-900 px-1 py-0.5"
                value={comps.Camera.zoom ?? 1}
                onChange={(e) => patchComp('Camera', { zoom: parseFloat(e.target.value) })}
              />
            </label>
          </div>
        </details>
      )}
    </div>
  )
}

/** --- Hierarchy --- */
function entityIcon(e) {
  const c = e?.components || {}
  if (c.SpriteRenderer) return '[img]'
  if (c.Camera) return '[cam]'
  if (c.NPC) return '[npc]'
  if (c.PlayerController) return '[pl]'
  return '◇'
}

function Hierarchy({
  entities,
  selectedIds,
  selectEntity,
  selectMultiple,
  filter,
  setFilter,
  addEntity,
  duplicateEntity,
  removeEntity,
  reparentEntity,
  addPrefab,
}) {
  const [menu, setMenu] = useState(null)
  const [dragId, setDragId] = useState(null)

  const roots = useMemo(() => {
    const list = [...entities.values()].filter((e) => !e.parentId)
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [entities])

  const childrenOf = useCallback(
    (id) =>
      [...entities.values()]
        .filter((e) => e.parentId === id)
        .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [entities],
  )

  const show = filter.trim().toLowerCase()

  function matches(e) {
    if (!show) return true
    return String(e.name || '').toLowerCase().includes(show)
  }

  function renderNode(e, depth) {
    if (!matches(e)) return null
    const kids = childrenOf(e.id)
    const sel = selectedIds.includes(e.id)

    return (
      <div key={e.id}>
        <div
          draggable
          onDragStart={() => setDragId(e.id)}
          onDragOver={(ev) => ev.preventDefault()}
          onDrop={(ev) => {
            ev.preventDefault()
            if (dragId && dragId !== e.id) reparentEntity(dragId, e.id)
            setDragId(null)
          }}
          style={{ paddingLeft: 8 + depth * 14 }}
          className={`flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-xs ${
            sel ? 'bg-emerald-900/50 text-emerald-200' : 'text-gray-300 hover:bg-gray-800'
          }`}
          onClick={(ev) => {
            if (ev.shiftKey) {
              const set = new Set(selectedIds)
              if (set.has(e.id)) set.delete(e.id)
              else set.add(e.id)
              selectMultiple([...set])
            } else selectEntity(e.id)
          }}
          onContextMenu={(ev) => {
            ev.preventDefault()
            selectEntity(e.id)
            setMenu({ x: ev.clientX, y: ev.clientY, id: e.id })
          }}
        >
          <span className="text-[10px] text-gray-500">{entityIcon(e)}</span>
          <span className="truncate">{e.name || e.id}</span>
        </div>
        {kids.map((k) => renderNode(k, depth + 1))}
      </div>
    )
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col border-t border-gray-700 bg-gray-900">
      <div className="flex items-center gap-2 border-b border-gray-700 p-2">
        <input
          type="search"
          placeholder="Filter hierarchy…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="min-w-0 flex-1 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-200"
        />
        <button
          type="button"
          className="shrink-0 rounded bg-emerald-800 px-2 py-1 text-xs text-white"
          onClick={() => addEntity()}
        >
          Add Entity
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1">
        {roots.map((r) => renderNode(r, 0))}
      </div>

      {menu && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Close menu"
            onClick={() => setMenu(null)}
          />
          <div
            className="fixed z-50 min-w-[160px] rounded border border-gray-600 bg-gray-800 py-1 text-xs shadow-lg"
            style={{ left: menu.x, top: menu.y }}
          >
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left text-gray-200 hover:bg-gray-700"
              onClick={() => {
                duplicateEntity(menu.id)
                setMenu(null)
              }}
            >
              Duplicate
            </button>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left text-gray-200 hover:bg-gray-700"
              onClick={() => {
                removeEntity(menu.id)
                setMenu(null)
              }}
            >
              Delete
            </button>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left text-gray-200 hover:bg-gray-700"
              onClick={() => {
                addEntity(menu.id)
                setMenu(null)
              }}
            >
              Add Child
            </button>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left text-gray-200 hover:bg-gray-700"
              onClick={() => {
                const ent = entities.get(menu.id)
                if (ent) {
                  addPrefab({
                    name: `${ent.name || 'Prefab'} Prefab`,
                    tags: [...(ent.tags || [])],
                    active: ent.active !== false,
                    components: JSON.parse(JSON.stringify(ent.components || {})),
                  })
                }
                setMenu(null)
              }}
            >
              Create Prefab
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/** --- Scene Canvas --- */
function SceneCanvas({ canvasRef, containerRef, interactionRef }) {
  return (
    <div ref={containerRef} className="relative min-h-0 min-w-0 flex-1 bg-gray-950">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{ cursor: interactionRef.current?.cursor || 'crosshair' }}
      />
      <div className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/40 px-2 py-1 text-[10px] text-gray-400">
        RMB drag pan · Wheel zoom · Tile layer &ldquo;UI&rdquo; paints foreground
      </div>
    </div>
  )
}

/** --- Main --- */
export default function SceneEditor() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const spriteCacheRef = useRef(new Map())
  const interactionRef = useRef({ cursor: 'default' })
  const prevSceneIdRef = useRef(null)
  const undoStackRef = useRef([])

  const scenes = useProjectStore((s) => s.scenes)
  const currentSceneId = useProjectStore((s) => s.currentSceneId)
  const sprites = useProjectStore((s) => s.sprites)
  const tilesets = useProjectStore((s) => s.tilesets)
  const prefabs = useProjectStore((s) => s.prefabs)
  const dialogues = useProjectStore((s) => s.dialogues)
  const addPrefab = useProjectStore((s) => s.addPrefab)

  const entities = useSceneStore((s) => s.entities)
  const tileMap = useSceneStore((s) => s.tileMap)
  const sceneName = useSceneStore((s) => s.sceneName)
  const loadScene = useSceneStore((s) => s.loadScene)
  const serializeScene = useSceneStore((s) => s.serializeScene)
  const addEntityRaw = useSceneStore((s) => s.addEntity)
  const updateEntity = useSceneStore((s) => s.updateEntity)
  const removeEntity = useSceneStore((s) => s.removeEntity)
  const duplicateEntityScene = useSceneStore((s) => s.duplicateEntity)
  const updateComponent = useSceneStore((s) => s.updateComponent)
  const addComponentToEntity = useSceneStore((s) => s.addComponentToEntity)
  const removeComponentFromEntity = useSceneStore((s) => s.removeComponentFromEntity)
  const setTile = useSceneStore((s) => s.setTile)
  const eraseTile = useSceneStore((s) => s.eraseTile)
  const fillTiles = useSceneStore((s) => s.fillTiles)
  const resizeMap = useSceneStore((s) => s.resizeMap)
  const reparentEntity = useSceneStore((s) => s.reparentEntity)

  const selectedEntityIds = useEditorStore((s) => s.selectedEntityIds)
  const selectEntity = useEditorStore((s) => s.selectEntity)
  const selectMultiple = useEditorStore((s) => s.selectMultiple)
  const clearSelection = useEditorStore((s) => s.clearSelection)
  const selectedTool = useEditorStore((s) => s.selectedTool)
  const setTool = useEditorStore((s) => s.setTool)
  const gridVisible = useEditorStore((s) => s.gridVisible)
  const gridSize = useEditorStore((s) => s.gridSize)
  const snapToGrid = useEditorStore((s) => s.snapToGrid)
  const showColliders = useEditorStore((s) => s.showColliders)
  const zoom = useEditorStore((s) => s.zoom)
  const panOffset = useEditorStore((s) => s.panOffset)
  const setPanOffset = useEditorStore((s) => s.setPanOffset)
  const setZoom = useEditorStore((s) => s.setZoom)
  const currentLayer = useEditorStore((s) => s.currentLayer)
  const activePaintTile = useEditorStore((s) => s.activePaintTile)
  const setActivePaintTile = useEditorStore((s) => s.setActivePaintTile)
  const copyEntities = useEditorStore((s) => s.copyEntities)
  const pasteEntities = useEditorStore((s) => s.pasteEntities)
  const deleteSelected = useEditorStore((s) => s.deleteSelected)
  const setActiveTab = useEditorStore((s) => s.setActiveTab)

  const [assetTab, setAssetTab] = useState('Sprites')
  const [assetFilter, setAssetFilter] = useState('')
  const [hierFilter, setHierFilter] = useState('')
  const [placement, setPlacement] = useState(null)
  const [sceneBg] = useState('#1e1e24')

  const pushUndo = useCallback(() => {
    undoStackRef.current = [...undoStackRef.current, serializeScene()].slice(-80)
  }, [serializeScene])

  const undo = useCallback(() => {
    const snap = undoStackRef.current.pop()
    if (snap) loadScene(snap)
  }, [loadScene])

  useEffect(() => {
    const prevId = prevSceneIdRef.current
    if (prevId && prevId !== currentSceneId) {
      const data = serializeScene()
      useProjectStore.setState((s) => ({
        scenes: s.scenes.map((sc) =>
          sc.id === prevId
            ? {
                ...sc,
                name: data.name,
                entities: data.entities,
                tileMap: data.tileMap,
                parallaxLayers: data.parallaxLayers,
              }
            : sc,
        ),
      }))
    }
    prevSceneIdRef.current = currentSceneId
    const proj = useProjectStore.getState()
    const sc = proj.scenes.find((x) => x.id === currentSceneId)
    if (sc) loadScene(sc)
  }, [currentSceneId, loadScene, serializeScene])

  const atlases = useMemo(() => {
    const out = {}
    for (const sp of sprites) {
      const a = getSpriteCanvas(sp, spriteCacheRef)
      if (a) out[sp.id] = a
    }
    return out
  }, [sprites])

  const mutateScene = useCallback(
    (fn) => {
      pushUndo()
      fn()
    },
    [pushUndo],
  )

  const applyTransformDrag = useCallback(
    (id, wx, wy) => {
      let x = wx
      let y = wy
      if (snapToGrid) {
        const gs = gridSize || 32
        x = Math.round(x / gs) * gs
        y = Math.round(y / gs) * gs
      }
      const e = entities.get(id)
      if (!e) return
      const t = getTransform(e)
      updateComponent(id, 'Transform', { ...t, x, y })
      updateEntity(id, { transform: { ...t, x, y } })
    },
    [entities, gridSize, snapToGrid, updateComponent, updateEntity],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = containerRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    function resize() {
      const r = wrap.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(r.width * dpr))
      canvas.height = Math.max(1, Math.floor(r.height * dpr))
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    function paint() {
      const st = useEditorStore.getState()
      const sc = useSceneStore.getState()
      const gw = wrap.clientWidth
      const gh = wrap.clientHeight
      const cam = {
        x: st.panOffset.x,
        y: st.panOffset.y,
        zoom: st.zoom,
        viewportWidth: gw,
        viewportHeight: gh,
      }

      ctx.fillStyle = sceneBg
      ctx.fillRect(0, 0, gw, gh)

      const tm = sc.tileMap
      const ts = tm.tileSize || 32
      const layersOrder = ['background', 'mid', 'foreground']

      const atl = {}
      for (const sp of useProjectStore.getState().sprites) {
        const a = getSpriteCanvas(sp, spriteCacheRef)
        if (a) atl[sp.id] = a
      }

      for (const layerKey of layersOrder) {
        const grid = tm.layers?.[layerKey]
        if (!grid) continue
        for (let gy = 0; gy < grid.length; gy++) {
          const row = grid[gy]
          for (let gx = 0; gx < row.length; gx++) {
            const cell = row[gx]
            if (!cell) continue
            const sid = cell.tilesetId ?? cell.spriteId
            const tidx = cell.tileIndex ?? 0
            const tsDef = useProjectStore.getState().tilesets.find((t) => t.id === sid)
            const spriteId = tsDef?.spriteIds?.[tidx]
            const atlas = spriteId ? atl[spriteId] : null
            const wx0 = gx * ts
            const wy0 = gy * ts
            const p1 = worldToScreen(wx0, wy0, cam)
            const p2 = worldToScreen(wx0 + ts, wy0 + ts, cam)
            const dw = p2.x - p1.x
            const dh = p2.y - p1.y
            if (atlas?.image) {
              const fw = atlas.frameWidth ?? ts
              const fh = atlas.frameHeight ?? ts
              const cols = atlas.columns ?? 1
              const sx = (tidx % cols) * fw
              const sy = Math.floor(tidx / cols) * fh
              try {
                ctx.drawImage(atlas.image, sx, sy, fw, fh, p1.x, p1.y, dw, dh)
              } catch {
                /* ignore */
              }
            } else {
              ctx.fillStyle = 'rgba(80,120,160,0.35)'
              ctx.fillRect(p1.x, p1.y, dw, dh)
            }
          }
        }
      }

      const list = entitiesToSortedArray(sc.entities).map(normalizeEntity)

      for (const e of list) {
        if (e.active === false) continue
        const t = e.components?.Transform
        const sr = e.components?.SpriteRenderer
        if (!t) continue
        if (sr?.spriteId && atl[sr.spriteId]?.image) {
          const atlas = atl[sr.spriteId]
          const fw = atlas.frameWidth ?? sr.width ?? 32
          const fh = atlas.frameHeight ?? sr.height ?? 32
          const cols = atlas.columns ?? 1
          const frame = sr.frameIndex ?? 0
          const sx = (frame % cols) * fw
          const sy = Math.floor(frame / cols) * fh
          const opacity = sr.opacity ?? 1
          const scr = worldToScreen(t.x, t.y, cam)
          const zz = cam.zoom > 0 ? cam.zoom : 1
          const dw = (sr.width ?? fw) * Math.abs(t.scaleX ?? 1) * zz
          const dh = (sr.height ?? fh) * Math.abs(t.scaleY ?? 1) * zz
          ctx.save()
          ctx.globalAlpha = opacity
          ctx.translate(scr.x, scr.y)
          ctx.rotate(((t.rotation ?? 0) * Math.PI) / 180)
          const fx = sr.flipX ? -1 : 1
          const fy = sr.flipY ? -1 : 1
          ctx.scale(fx, fy)
          try {
            ctx.drawImage(atlas.image, sx, sy, fw, fh, (-dw / 2) * fx, (-dh / 2) * fy, dw * fx, dh * fy)
          } catch {
            /* ignore */
          }
          ctx.restore()

          ctx.save()
          ctx.font = '10px system-ui,sans-serif'
          ctx.fillStyle = 'rgba(220,220,230,0.95)'
          ctx.textAlign = 'center'
          ctx.fillText(e.name || e.id, scr.x, scr.y - dh / 2 - 6)
          ctx.restore()
        } else {
          const scr = worldToScreen(t.x, t.y, cam)
          const zz = cam.zoom > 0 ? cam.zoom : 1
          const r = 8 * zz
          ctx.fillStyle = 'rgba(160,160,220,0.9)'
          ctx.beginPath()
          ctx.arc(scr.x, scr.y, r, 0, Math.PI * 2)
          ctx.fill()
          ctx.font = '10px system-ui,sans-serif'
          ctx.fillStyle = '#ddd'
          ctx.textAlign = 'center'
          ctx.fillText(e.name || 'entity', scr.x, scr.y - r - 4)
        }
      }

      if (st.gridVisible) {
        ctx.save()
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'
        ctx.lineWidth = 1
        const gs = st.gridSize || 32
        const b = {
          left: cam.x - gw / (2 * cam.zoom),
          right: cam.x + gw / (2 * cam.zoom),
          top: cam.y - gh / (2 * cam.zoom),
          bottom: cam.y + gh / (2 * cam.zoom),
        }
        const sx0 = Math.floor(b.left / gs) * gs
        const sy0 = Math.floor(b.top / gs) * gs
        for (let wx = sx0; wx <= b.right; wx += gs) {
          const a = worldToScreen(wx, b.top, cam)
          const btm = worldToScreen(wx, b.bottom, cam)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(btm.x, btm.y)
          ctx.stroke()
        }
        for (let wy = sy0; wy <= b.bottom; wy += gs) {
          const a = worldToScreen(b.left, wy, cam)
          const btm = worldToScreen(b.right, wy, cam)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(btm.x, btm.y)
          ctx.stroke()
        }
        ctx.restore()
      }

      if (st.showColliders) {
        for (const e of list) {
          const t = e.components?.Transform
          const col = e.components?.Collider
          if (!t || !col || col.type !== 'box') continue
          const w = col.width ?? 32
          const h = col.height ?? 32
          const ox = col.offsetX ?? 0
          const oy = col.offsetY ?? 0
          const wx = t.x + ox
          const wy = t.y + oy
          const tl = worldToScreen(wx - w / 2, wy - h / 2, cam)
          const br = worldToScreen(wx + w / 2, wy + h / 2, cam)
          ctx.strokeStyle = col.isTrigger ? 'rgba(0,255,255,0.85)' : 'rgba(255,165,0,0.85)'
          ctx.lineWidth = 1
          ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y)
        }
      }

      const sel = st.selectedEntityIds
      for (const id of sel) {
        const e = normalizeEntity(sc.entities.get(id))
        if (!e?.components?.Transform) continue
        const t = e.components.Transform
        const sr = e.components.SpriteRenderer
        const hw = ((sr?.width ?? 32) * (t.scaleX ?? 1)) / 2
        const hh = ((sr?.height ?? 32) * (t.scaleY ?? 1)) / 2
        const c1 = worldToScreen(t.x - hw, t.y - hh, cam)
        const c2 = worldToScreen(t.x + hw, t.y + hh, cam)
        ctx.strokeStyle = '#4ade80'
        ctx.lineWidth = 2
        ctx.strokeRect(c1.x, c1.y, c2.x - c1.x, c2.y - c1.y)
      }

      const mx = interactionRef.current.mx
      const my = interactionRef.current.my
      if (mx != null && my != null) {
        ctx.save()
        ctx.strokeStyle = 'rgba(250,204,21,0.9)'
        ctx.lineWidth = 1
        const wx = screenToWorld(mx, my, { ...cam, viewportWidth: gw, viewportHeight: gh }).x
        const wy = screenToWorld(mx, my, { ...cam, viewportWidth: gw, viewportHeight: gh }).y
        const tool = st.selectedTool
        if (tool === 'paint' || tool === 'erase') {
          const g = tm.tileSize || 32
          const gx = Math.floor(wx / g)
          const gy = Math.floor(wy / g)
          const wx0 = gx * g
          const wy0 = gy * g
          const p1 = worldToScreen(wx0, wy0, cam)
          const p2 = worldToScreen(wx0 + g, wy0 + g, cam)
          ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)
        } else if (tool === 'select' || tool === 'move') {
          ctx.beginPath()
          ctx.arc(mx, my, 6, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.restore()
      }

      raf = requestAnimationFrame(paint)
    }

    raf = requestAnimationFrame(paint)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [sceneBg])

  const getCamera = useCallback(() => {
    const wrap = containerRef.current
    const gw = wrap?.clientWidth ?? 800
    const gh = wrap?.clientHeight ?? 600
    return {
      x: panOffset.x,
      y: panOffset.y,
      zoom,
      viewportWidth: gw,
      viewportHeight: gh,
    }
  }, [panOffset.x, panOffset.y, zoom])

  useEffect(() => {
    function onKey(ev) {
      const tag = ev.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const mod = ev.ctrlKey || ev.metaKey

      if (mod && ev.key.toLowerCase() === 'z') {
        ev.preventDefault()
        undo()
        return
      }
      if (mod && ev.key.toLowerCase() === 'c') {
        ev.preventDefault()
        copyEntities()
        return
      }
      if (mod && ev.key.toLowerCase() === 'v') {
        ev.preventDefault()
        mutateScene(() => pasteEntities())
        return
      }
      if (mod && ev.key.toLowerCase() === 'd') {
        ev.preventDefault()
        mutateScene(() => {
          const ids = [...useEditorStore.getState().selectedEntityIds]
          const newIds = []
          for (const id of ids) {
            const nid = duplicateEntityScene(id)
            if (nid) newIds.push(nid)
          }
          if (newIds.length) selectMultiple(newIds)
        })
        return
      }

      if (ev.key === 'Delete' || ev.key === 'Backspace') {
        ev.preventDefault()
        mutateScene(() => deleteSelected())
        return
      }

      switch (ev.key.toLowerCase()) {
        case 'v':
          setTool('select')
          break
        case 'm':
          setTool('move')
          break
        case 'b':
          setTool('paint')
          break
        case 'e':
          setTool('erase')
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    copyEntities,
    pasteEntities,
    deleteSelected,
    duplicateEntityScene,
    mutateScene,
    selectMultiple,
    setTool,
    undo,
  ])

  function clientToCanvas(ev) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const r = canvas.getBoundingClientRect()
    return { x: ev.clientX - r.left, y: ev.clientY - r.top }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let dragging = false
    let panning = false
    let boxSel = false
    let moveDrag = false
    let scaleDrag = false
    let rotateDrag = false
    let paintDrag = false
    let lastWorld = { x: 0, y: 0 }
    let boxStart = { x: 0, y: 0 }
    let scaleStart = { dist: 1, sx: 1, sy: 1 }
    let rotateStart = { angle: 0, base: 0 }

    function worldFromEvent(ev) {
      const p = clientToCanvas(ev)
      const cam = getCamera()
      return screenToWorld(p.x, p.y, cam)
    }

    function onDown(ev) {
      const w = worldFromEvent(ev)
      lastWorld = w
      const st = useEditorStore.getState()
      const sc = useSceneStore.getState()
      const list = entitiesToSortedArray(sc.entities)
        .map(normalizeEntity)
        .reverse()

      if (ev.button === 2) {
        panning = true
        dragging = true
        ev.preventDefault()
        return
      }

      if (st.selectedTool === 'paint' && st.activePaintTile) {
        const layer = tileLayerForPaint(st.currentLayer)
        const tileSize = sc.tileMap.tileSize || 32
        const gx = Math.floor(w.x / tileSize)
        const gy = Math.floor(w.y / tileSize)
        pushUndo()
        setTile(layer, gx, gy, {
          tilesetId: st.activePaintTile.tilesetId,
          tileIndex: st.activePaintTile.tileIndex,
        })
        paintDrag = true
        dragging = true
        return
      }

      if (st.selectedTool === 'erase') {
        const layer = tileLayerForPaint(st.currentLayer)
        const tileSize = sc.tileMap.tileSize || 32
        const gx = Math.floor(w.x / tileSize)
        const gy = Math.floor(w.y / tileSize)
        pushUndo()
        eraseTile(layer, gx, gy)
        paintDrag = true
        dragging = true
        return
      }

      if (st.selectedTool === 'fill' && st.activePaintTile) {
        const layer = tileLayerForPaint(st.currentLayer)
        const tileSize = sc.tileMap.tileSize || 32
        const gx = Math.floor(w.x / tileSize)
        const gy = Math.floor(w.y / tileSize)
        mutateScene(() =>
          fillTiles(layer, gx, gy, {
            tilesetId: st.activePaintTile.tilesetId,
            tileIndex: st.activePaintTile.tileIndex,
          }),
        )
        return
      }

      const hit = pickEntityAt(list, w.x, w.y)

      if (st.selectedTool === 'scale' && hit) {
        if (!st.selectedEntityIds.includes(hit.id)) selectEntity(hit.id)
        pushUndo()
        scaleDrag = true
        dragging = true
        const t = getTransform(hit)
        scaleStart = {
          dist: Math.max(0.001, Math.hypot(w.x - t.x, w.y - t.y)),
          sx: t.scaleX ?? 1,
          sy: t.scaleY ?? 1,
        }
        return
      }

      if (st.selectedTool === 'rotate' && hit) {
        if (!st.selectedEntityIds.includes(hit.id)) selectEntity(hit.id)
        pushUndo()
        rotateDrag = true
        dragging = true
        const t = getTransform(hit)
        rotateStart = {
          base: (t.rotation ?? 0),
          angle: (Math.atan2(w.y - t.y, w.x - t.x) * 180) / Math.PI,
        }
        return
      }

      if ((st.selectedTool === 'select' || st.selectedTool === 'move') && hit) {
        if (ev.shiftKey) {
          const set = new Set(st.selectedEntityIds)
          if (set.has(hit.id)) set.delete(hit.id)
          else set.add(hit.id)
          selectMultiple([...set])
        } else if (!st.selectedEntityIds.includes(hit.id)) {
          selectEntity(hit.id)
        }
        moveDrag = true
        dragging = true
        pushUndo()
        return
      }

      if ((st.selectedTool === 'select' || st.selectedTool === 'move') && !hit && ev.button === 0) {
        if (!ev.shiftKey) clearSelection()
        boxSel = true
        boxStart = { x: w.x, y: w.y }
        dragging = true
        return
      }

      if (
        placement &&
        (placement.type === 'sprite' || placement.type === 'prefab') &&
        ev.button === 0
      ) {
        mutateScene(() => {
          if (placement.type === 'sprite') {
            const ent = createEntity('Sprite')
            addComponent(ent, 'Transform', { x: w.x, y: w.y })
            addComponent(ent, 'SpriteRenderer', {
              spriteId: placement.id,
              width: 32,
              height: 32,
            })
            addEntityRaw(ent)
            selectEntity(ent.id)
          } else {
            const pref = prefabs.find((p) => p.id === placement.id)
            if (pref) {
              const ent = createEntity(pref.name || 'Prefab')
              ent.tags = [...(pref.tags || [])]
              ent.active = pref.active !== false
              ent.components = JSON.parse(JSON.stringify(pref.components || {}))
              addComponent(ent, 'Transform', {
                ...(ent.components.Transform || {}),
                x: w.x,
                y: w.y,
              })
              ent.components.Transform = {
                ...COMPONENT_DEFAULTS.Transform,
                ...ent.components.Transform,
              }
              addEntityRaw(ent)
              selectEntity(ent.id)
            }
          }
        })
        return
      }

      if (st.selectedTool === 'move' && !hit) {
        clearSelection()
      }
    }

    function onMove(ev) {
      const p = clientToCanvas(ev)
      interactionRef.current.mx = p.x
      interactionRef.current.my = p.y

      const st = useEditorStore.getState()
      if (panning) {
        setPanOffset({
          x: st.panOffset.x + ev.movementX / st.zoom,
          y: st.panOffset.y + ev.movementY / st.zoom,
        })
      }

      const w = worldFromEvent(ev)

      if (paintDrag && (st.selectedTool === 'paint' || st.selectedTool === 'erase')) {
        const sc = useSceneStore.getState()
        const layer = tileLayerForPaint(st.currentLayer)
        const tileSize = sc.tileMap.tileSize || 32
        const gx = Math.floor(w.x / tileSize)
        const gy = Math.floor(w.y / tileSize)
        if (st.selectedTool === 'paint' && st.activePaintTile) {
          setTile(layer, gx, gy, {
            tilesetId: st.activePaintTile.tilesetId,
            tileIndex: st.activePaintTile.tileIndex,
          })
        } else if (st.selectedTool === 'erase') {
          eraseTile(layer, gx, gy)
        }
      }

      if (moveDrag && st.selectedEntityIds.length) {
        const dx = w.x - lastWorld.x
        const dy = w.y - lastWorld.y
        lastWorld = w
        for (const id of st.selectedEntityIds) {
          const e = useSceneStore.getState().entities.get(id)
          if (!e) continue
          const t = getTransform(e)
          applyTransformDrag(id, t.x + dx, t.y + dy)
        }
      }

      if (scaleDrag && st.selectedEntityIds.length === 1) {
        const id = st.selectedEntityIds[0]
        const e = useSceneStore.getState().entities.get(id)
        const t = getTransform(e)
        const dist = Math.max(0.001, Math.hypot(w.x - t.x, w.y - t.y))
        const f = dist / scaleStart.dist
        updateComponent(id, 'Transform', {
          ...t,
          scaleX: scaleStart.sx * f,
          scaleY: scaleStart.sy * f,
        })
      }

      if (rotateDrag && st.selectedEntityIds.length === 1) {
        const id = st.selectedEntityIds[0]
        const e = useSceneStore.getState().entities.get(id)
        const t = getTransform(e)
        const ang = (Math.atan2(w.y - t.y, w.x - t.x) * 180) / Math.PI
        updateComponent(id, 'Transform', {
          ...t,
          rotation: rotateStart.base + (ang - rotateStart.angle),
        })
      }

      if (boxSel) {
        interactionRef.current.box = { a: boxStart, b: w }
      }
    }

    function onUp() {
      if (boxSel && interactionRef.current.box) {
        const { a, b } = interactionRef.current.box
        const x = Math.min(a.x, b.x)
        const y = Math.min(a.y, b.y)
        const ww = Math.abs(b.x - a.x)
        const hh = Math.abs(b.y - a.y)
        const flat = [...useSceneStore.getState().entities.values()].map(normalizeEntity)
        const inside = entitiesInRect(x, y, ww, hh, flat)
        if (inside.length) selectMultiple(inside.map((e) => e.id))
        interactionRef.current.box = null
      }
      dragging = false
      panning = false
      boxSel = false
      moveDrag = false
      scaleDrag = false
      rotateDrag = false
      paintDrag = false
    }

    function onWheel(ev) {
      ev.preventDefault()
      const st = useEditorStore.getState()
      const nz = Math.min(8, Math.max(0.1, st.zoom * (ev.deltaY > 0 ? 0.9 : 1.1)))
      setZoom(nz)
    }

    function onCtx(ev) {
      ev.preventDefault()
    }

    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('contextmenu', onCtx)

    return () => {
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('contextmenu', onCtx)
    }
  }, [
    applyTransformDrag,
    addEntityRaw,
    clearSelection,
    eraseTile,
    fillTiles,
    getCamera,
    mutateScene,
    placement,
    prefabs,
    pushUndo,
    setTile,
    selectEntity,
    selectMultiple,
    setPanOffset,
    setZoom,
    updateComponent,
  ])

  const addEntityHierarchy = useCallback(
    (parentId = null) => {
      mutateScene(() => {
        const ent = createEntity('Entity')
        addComponent(ent, 'Transform', {})
        const id = addEntityRaw(ent)
        if (parentId) reparentEntity(id, parentId)
        selectEntity(id)
      })
    },
    [addEntityRaw, mutateScene, reparentEntity, selectEntity],
  )

  const dupFromHierarchy = useCallback(
    (id) => {
      mutateScene(() => {
        const nid = duplicateEntityScene(id)
        if (nid) selectEntity(nid)
      })
    },
    [duplicateEntityScene, mutateScene, selectEntity],
  )

  const removeFromHierarchy = useCallback(
    (id) => {
      mutateScene(() => removeEntity(id))
    },
    [mutateScene, removeEntity],
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-900 text-gray-300">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <div className="w-[220px] shrink-0">
          <AssetBrowser
            assetTab={assetTab}
            setAssetTab={setAssetTab}
            filter={assetFilter}
            setFilter={setAssetFilter}
            sprites={sprites}
            tilesets={tilesets}
            prefabs={prefabs}
            setActivePaintTile={setActivePaintTile}
            activePaintTile={activePaintTile}
            placement={placement}
            setPlacement={setPlacement}
          />
        </div>
        <SceneCanvas canvasRef={canvasRef} containerRef={containerRef} interactionRef={interactionRef} />
        <div className="w-[280px] shrink-0 border-l border-gray-700 bg-gray-900">
          <div className="border-b border-gray-700 px-3 py-2 text-sm font-semibold text-gray-200">Inspector</div>
          <Inspector
            selectedIds={selectedEntityIds}
            entities={entities}
            sprites={sprites}
            prefabs={prefabs}
            dialogues={dialogues}
            sceneName={sceneName}
            tileMap={tileMap}
            resizeMap={resizeMap}
            updateEntity={updateEntity}
            updateComponent={updateComponent}
            removeComponentFromEntity={removeComponentFromEntity}
            addComponentToEntity={addComponentToEntity}
            onEditScript={() => setActiveTab('script')}
          />
        </div>
      </div>
      <div className="h-[180px] shrink-0">
        <Hierarchy
          entities={entities}
          selectedIds={selectedEntityIds}
          selectEntity={selectEntity}
          selectMultiple={selectMultiple}
          filter={hierFilter}
          setFilter={setHierFilter}
          addEntity={addEntityHierarchy}
          duplicateEntity={dupFromHierarchy}
          removeEntity={removeFromHierarchy}
          reparentEntity={(cid, pid) => mutateScene(() => reparentEntity(cid, pid))}
          prefabs={prefabs}
          addPrefab={addPrefab}
        />
      </div>
    </div>
  )
}
