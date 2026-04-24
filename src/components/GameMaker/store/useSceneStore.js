import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/** @typedef {'background' | 'mid' | 'foreground'} TileLayerKey */

const TILE_LAYER_KEYS = ['background', 'mid', 'foreground']

/** @param {number} w @param {number} h */
function emptyGrid(w, h) {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => null))
}

function defaultTileMap(width = 0, height = 0, tileSize = 32) {
  const layers = {
    background: emptyGrid(width, height),
    mid: emptyGrid(width, height),
    foreground: emptyGrid(width, height),
  }
  return {
    layers,
    width,
    height,
    tileSize,
  }
}

/** @param {unknown} value */
function clone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value))
}

/** @param {Map<string, object>} entities @param {string} id @param {string | null} newParentId */
function wouldCreateCycle(entities, id, newParentId) {
  if (!newParentId || newParentId === id) return true
  let cur = newParentId
  const seen = new Set()
  while (cur) {
    if (cur === id) return true
    if (seen.has(cur)) break
    seen.add(cur)
    cur = entities.get(cur)?.parentId ?? null
  }
  return false
}

export const useSceneStore = create(
  devtools(
    (set, get) => ({
      entities: new Map(),
      tileMap: defaultTileMap(),
      sceneName: '',
      parallaxLayers: [],

      loadScene(sceneData) {
        const name = sceneData?.name ?? sceneData?.sceneName ?? ''
        let rawEntities = sceneData?.entities
        if (Array.isArray(rawEntities)) {
          rawEntities = new Map(rawEntities.map((e) => [e.id, e]))
        } else if (rawEntities && typeof rawEntities === 'object' && !(rawEntities instanceof Map)) {
          rawEntities = new Map(Object.entries(rawEntities))
        } else if (!(rawEntities instanceof Map)) {
          rawEntities = new Map()
        }
        const tm = sceneData?.tileMap
        const tileMap =
          tm && typeof tm === 'object' && tm.layers
            ? {
                layers: {
                  background:
                    tm.layers.background ??
                    emptyGrid(tm.width ?? 0, tm.height ?? 0),
                  mid: tm.layers.mid ?? emptyGrid(tm.width ?? 0, tm.height ?? 0),
                  foreground:
                    tm.layers.foreground ?? emptyGrid(tm.width ?? 0, tm.height ?? 0),
                },
                width: tm.width ?? 0,
                height: tm.height ?? 0,
                tileSize: tm.tileSize ?? 32,
              }
            : defaultTileMap()

        set(
          {
            entities: rawEntities instanceof Map ? new Map(rawEntities) : new Map(),
            tileMap,
            sceneName: name,
            parallaxLayers: Array.isArray(sceneData?.parallaxLayers) ? sceneData.parallaxLayers : [],
          },
          false,
          'scene/loadScene'
        )
      },

      addEntity(entity) {
        const id = entity?.id ?? newId()
        const next = { ...entity, id }
        set(
          (s) => {
            const entities = new Map(s.entities)
            entities.set(id, next)
            return { entities }
          },
          false,
          'scene/addEntity'
        )
        return id
      },

      updateEntity(id, updates) {
        set(
          (s) => {
            const prev = s.entities.get(id)
            if (!prev) return s
            const entities = new Map(s.entities)
            entities.set(id, { ...prev, ...updates, id })
            return { entities }
          },
          false,
          'scene/updateEntity'
        )
      },

      removeEntity(id) {
        set(
          (s) => {
            const entities = new Map(s.entities)
            entities.delete(id)
            for (const [eid, e] of entities) {
              if (e.parentId === id) {
                entities.set(eid, { ...e, parentId: null })
              }
            }
            return { entities }
          },
          false,
          'scene/removeEntity'
        )
      },

      addComponentToEntity(entityId, componentName, data) {
        set(
          (s) => {
            const prev = s.entities.get(entityId)
            if (!prev) return s
            const components = {
              ...(typeof prev.components === 'object' && prev.components !== null ? prev.components : {}),
              [componentName]: data ?? {},
            }
            const entities = new Map(s.entities)
            entities.set(entityId, { ...prev, components })
            return { entities }
          },
          false,
          'scene/addComponent'
        )
      },

      removeComponentFromEntity(entityId, componentName) {
        set(
          (s) => {
            const prev = s.entities.get(entityId)
            if (!prev || !prev.components || typeof prev.components !== 'object') return s
            const { [componentName]: _removed, ...rest } = prev.components
            const entities = new Map(s.entities)
            entities.set(entityId, { ...prev, components: rest })
            return { entities }
          },
          false,
          'scene/removeComponent'
        )
      },

      updateComponent(entityId, componentName, data) {
        set(
          (s) => {
            const prev = s.entities.get(entityId)
            if (!prev) return s
            const components = {
              ...(typeof prev.components === 'object' && prev.components !== null ? prev.components : {}),
              [componentName]: {
                ...(prev.components?.[componentName] && typeof prev.components[componentName] === 'object'
                  ? prev.components[componentName]
                  : {}),
                ...(data && typeof data === 'object' ? data : {}),
              },
            }
            const entities = new Map(s.entities)
            entities.set(entityId, { ...prev, components })
            return { entities }
          },
          false,
          'scene/updateComponent'
        )
      },

      moveEntity(id, x, y) {
        set(
          (s) => {
            const prev = s.entities.get(id)
            if (!prev) return s
            const entities = new Map(s.entities)
            const transform =
              prev.transform && typeof prev.transform === 'object'
                ? { ...prev.transform, x, y }
                : { x, y }
            entities.set(id, { ...prev, transform })
            return { entities }
          },
          false,
          'scene/moveEntity'
        )
      },

      duplicateEntity(id) {
        const prev = get().entities.get(id)
        if (!prev) return null
        const nid = newId()
        const copy = clone(prev)
        delete copy.childrenIds
        const dup = {
          ...copy,
          id: nid,
          name: prev.name ? `${prev.name} Copy` : undefined,
        }
        if (dup.transform && typeof dup.transform === 'object') {
          dup.transform = { ...dup.transform, x: (dup.transform.x ?? 0) + 8, y: (dup.transform.y ?? 0) + 8 }
        }
        set(
          (s) => {
            const entities = new Map(s.entities)
            entities.set(nid, dup)
            return { entities }
          },
          false,
          'scene/duplicateEntity'
        )
        return nid
      },

      reparentEntity(entityId, newParentId) {
        set(
          (s) => {
            const entities = new Map(s.entities)
            if (!entities.has(entityId)) return s
            if (newParentId && wouldCreateCycle(entities, entityId, newParentId)) return s
            const prev = entities.get(entityId)
            entities.set(entityId, {
              ...prev,
              parentId: newParentId ?? null,
            })
            return { entities }
          },
          false,
          'scene/reparentEntity'
        )
      },

      setTile(layer, gridX, gridY, tileData) {
        if (!TILE_LAYER_KEYS.includes(layer)) return
        set(
          (s) => {
            const tm = s.tileMap
            const grid = tm.layers[layer]
            if (!grid || gridY < 0 || gridX < 0 || gridY >= grid.length || gridX >= (grid[0]?.length ?? 0)) {
              return s
            }
            const nextRow = [...grid[gridY]]
            nextRow[gridX] = tileData
            const nextGrid = [...grid]
            nextGrid[gridY] = nextRow
            return {
              tileMap: {
                ...tm,
                layers: {
                  ...tm.layers,
                  [layer]: nextGrid,
                },
              },
            }
          },
          false,
          'scene/setTile'
        )
      },

      eraseTile(layer, gridX, gridY) {
        get().setTile(layer, gridX, gridY, null)
      },

      fillTiles(layer, startX, startY, tileData) {
        if (!TILE_LAYER_KEYS.includes(layer)) return
        set(
          (s) => {
            const tm = s.tileMap
            const grid = tm.layers[layer]
            if (!grid?.length) return s
            const h = grid.length
            const w = grid[0]?.length ?? 0
            if (startY < 0 || startX < 0 || startY >= h || startX >= w) return s
            const startVal = grid[startY][startX]
            const match = (a, b) => JSON.stringify(a) === JSON.stringify(b)
            if (match(startVal, tileData)) return s

            const filled = grid.map((row) => [...row])
            const q = [[startX, startY]]
            const seen = new Set([`${startX},${startY}`])
            while (q.length) {
              const [x, y] = q.shift()
              if (!match(filled[y][x], startVal)) continue
              filled[y][x] = tileData
              const nbs = [
                [x + 1, y],
                [x - 1, y],
                [x, y + 1],
                [x, y - 1],
              ]
              for (const [nx, ny] of nbs) {
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
                const key = `${nx},${ny}`
                if (seen.has(key)) continue
                if (match(filled[ny][nx], startVal)) {
                  seen.add(key)
                  q.push([nx, ny])
                }
              }
            }
            return {
              tileMap: {
                ...tm,
                layers: {
                  ...tm.layers,
                  [layer]: filled,
                },
              },
            }
          },
          false,
          'scene/fillTiles'
        )
      },

      clearLayer(layer) {
        if (!TILE_LAYER_KEYS.includes(layer)) return
        set(
          (s) => {
            const tm = s.tileMap
            const { width, height } = tm
            const empty = emptyGrid(width, height)
            return {
              tileMap: {
                ...tm,
                layers: {
                  ...tm.layers,
                  [layer]: empty,
                },
              },
            }
          },
          false,
          'scene/clearLayer'
        )
      },

      resizeMap(width, height) {
        set(
          (s) => {
            const tm = s.tileMap
            const nextLayers = {}
            for (const key of TILE_LAYER_KEYS) {
              const grid = tm.layers[key] ?? emptyGrid(tm.width, tm.height)
              const next = emptyGrid(width, height)
              const maxH = Math.min(height, grid.length)
              for (let y = 0; y < maxH; y++) {
                const row = grid[y] ?? []
                for (let x = 0; x < Math.min(width, row.length); x++) {
                  next[y][x] = row[x] ?? null
                }
              }
              nextLayers[key] = next
            }
            return {
              tileMap: {
                ...tm,
                width,
                height,
                layers: nextLayers,
              },
            }
          },
          false,
          'scene/resizeMap'
        )
      },

      addParallaxLayer(layer) {
        set(
          (s) => ({
            parallaxLayers: [...s.parallaxLayers, layer ?? {}],
          }),
          false,
          'scene/addParallax'
        )
      },

      removeParallaxLayer(index) {
        set(
          (s) => ({
            parallaxLayers: s.parallaxLayers.filter((_, i) => i !== index),
          }),
          false,
          'scene/removeParallax'
        )
      },

      getEntitiesByComponent(componentName) {
        const out = []
        for (const e of get().entities.values()) {
          if (e.components && typeof e.components === 'object' && componentName in e.components) {
            out.push(e)
          }
        }
        return out
      },

      getEntitiesByTag(tag) {
        const out = []
        for (const e of get().entities.values()) {
          const tags = Array.isArray(e.tags) ? e.tags : []
          if (tags.includes(tag)) out.push(e)
        }
        return out
      },

      serializeScene() {
        const s = get()
        return {
          name: s.sceneName,
          entities: Array.from(s.entities.values()),
          tileMap: clone(s.tileMap),
          parallaxLayers: clone(s.parallaxLayers),
        }
      },
    }),
    { name: 'GameMakerScene' }
  )
)
