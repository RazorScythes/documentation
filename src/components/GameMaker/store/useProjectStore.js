import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const STORAGE_KEY = 'game-maker-project'
const PERSIST_VERSION = 1

/** @type {import('zustand').PersistStorage<unknown>} */
const gameSettingsDefaults = () => ({
  screenWidth: 800,
  screenHeight: 600,
  targetFps: 60,
  backgroundColor: '#111827',
  defaultGridSize: 32,
  gridColor: 'rgba(255,255,255,0.15)',
  snapToGridDefault: true,
  gravityX: 0,
  gravityY: 200,
  defaultFriction: 0.1,
})

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function createEmptyScene(name, id = newId()) {
  return {
    id,
    name,
    entities: [],
    tileMap: {},
    layers: [],
    camera: {},
  }
}

function defaultProjectSlice() {
  const scene = createEmptyScene('Scene 1')
  return {
    projectName: '',
    scenes: [scene],
    currentSceneId: scene.id,
    sprites: [],
    tilesets: [],
    prefabs: [],
    scripts: [],
    biomes: [],
    variables: {},
    assets: {},
    dialogues: [],
    gameSettings: gameSettingsDefaults(),
  }
}

export const useProjectStore = create(
  devtools(
    persist(
      (set, get, api) => ({
        ...defaultProjectSlice(),

        createProject(name) {
          const scene = createEmptyScene('Scene 1')
          set(
            {
              ...defaultProjectSlice(),
              projectName: name || 'Untitled',
              scenes: [scene],
              currentSceneId: scene.id,
            },
            false,
            'project/createProject'
          )
        },

        saveProject() {
          const s = get()
          return JSON.stringify({
            projectName: s.projectName,
            scenes: s.scenes,
            currentSceneId: s.currentSceneId,
            sprites: s.sprites,
            tilesets: s.tilesets,
            prefabs: s.prefabs,
            scripts: s.scripts,
            biomes: s.biomes,
            variables: s.variables,
            assets: s.assets,
            dialogues: s.dialogues,
            gameSettings: s.gameSettings ?? gameSettingsDefaults(),
          })
        },

        loadProject(json) {
          let data
          try {
            data = typeof json === 'string' ? JSON.parse(json) : json
          } catch {
            console.error('loadProject: invalid JSON')
            return
          }
          set(
            {
              projectName: data.projectName ?? '',
              scenes: Array.isArray(data.scenes) ? data.scenes : [],
              currentSceneId: data.currentSceneId ?? '',
              sprites: Array.isArray(data.sprites) ? data.sprites : [],
              tilesets: Array.isArray(data.tilesets) ? data.tilesets : [],
              prefabs: Array.isArray(data.prefabs) ? data.prefabs : [],
              scripts: Array.isArray(data.scripts) ? data.scripts : [],
              biomes: Array.isArray(data.biomes) ? data.biomes : [],
              variables: data.variables && typeof data.variables === 'object' ? data.variables : {},
              assets: data.assets && typeof data.assets === 'object' ? data.assets : {},
              dialogues: Array.isArray(data.dialogues) ? data.dialogues : [],
              gameSettings: {
                ...gameSettingsDefaults(),
                ...(data.gameSettings && typeof data.gameSettings === 'object' ? data.gameSettings : {}),
              },
            },
            false,
            'project/loadProject'
          )
          const scenes = get().scenes
          if (scenes.length && !scenes.some((sc) => sc.id === get().currentSceneId)) {
            set({ currentSceneId: scenes[0].id }, false, 'project/loadProject/fixScene')
          }
        },

        addScene(name) {
          const scene = createEmptyScene(name || `Scene ${get().scenes.length + 1}`)
          set(
            (s) => ({
              scenes: [...s.scenes, scene],
              currentSceneId: scene.id,
            }),
            false,
            'project/addScene'
          )
          return scene.id
        },

        removeScene(id) {
          set((s) => {
            const scenes = s.scenes.filter((sc) => sc.id !== id)
            let currentSceneId = s.currentSceneId
            if (currentSceneId === id) {
              currentSceneId = scenes[0]?.id ?? ''
            }
            return { scenes, currentSceneId }
          }, false, 'project/removeScene')
        },

        setCurrentScene(id) {
          set({ currentSceneId: id }, false, 'project/setCurrentScene')
        },

        addSprite(sprite) {
          const id = sprite?.id ?? newId()
          const next = {
            id,
            name: sprite?.name ?? 'Sprite',
            width: sprite?.width ?? 32,
            height: sprite?.height ?? 32,
            pixels: Array.isArray(sprite?.pixels) ? sprite.pixels : [],
            frames: Array.isArray(sprite?.frames) ? sprite.frames : [],
            tags: Array.isArray(sprite?.tags) ? sprite.tags : [],
            collisionMask: sprite?.collisionMask ?? null,
            pivot:
              sprite?.pivot && typeof sprite.pivot === 'object'
                ? { x: sprite.pivot.x ?? 0.5, y: sprite.pivot.y ?? 0.5 }
                : { x: 0.5, y: 0.5 },
          }
          set((s) => ({ sprites: [...s.sprites, next] }), false, 'project/addSprite')
          return id
        },

        updateSprite(id, data) {
          set(
            (s) => ({
              sprites: s.sprites.map((sp) => (sp.id === id ? { ...sp, ...data, id: sp.id } : sp)),
            }),
            false,
            'project/updateSprite'
          )
        },

        removeSprite(id) {
          set((s) => ({ sprites: s.sprites.filter((sp) => sp.id !== id) }), false, 'project/removeSprite')
        },

        addTileset(tileset) {
          const id = tileset?.id ?? newId()
          const next = {
            id,
            name: tileset?.name ?? 'Tileset',
            tileSize: tileset?.tileSize ?? 32,
            columns: tileset?.columns ?? 0,
            rows: tileset?.rows ?? 0,
            spriteIds: Array.isArray(tileset?.spriteIds) ? tileset.spriteIds : [],
            collisionData: Array.isArray(tileset?.collisionData) ? tileset.collisionData : [],
            autoTileRules: Array.isArray(tileset?.autoTileRules) ? tileset.autoTileRules : [],
          }
          set((s) => ({ tilesets: [...s.tilesets, next] }), false, 'project/addTileset')
          return id
        },

        updateTileset(id, data) {
          set(
            (s) => ({
              tilesets: s.tilesets.map((ts) => (ts.id === id ? { ...ts, ...data, id: ts.id } : ts)),
            }),
            false,
            'project/updateTileset'
          )
        },

        removeTileset(id) {
          set((s) => ({ tilesets: s.tilesets.filter((ts) => ts.id !== id) }), false, 'project/removeTileset')
        },

        addPrefab(prefab) {
          const id = prefab?.id ?? newId()
          const next = { ...prefab, id }
          set((s) => ({ prefabs: [...s.prefabs, next] }), false, 'project/addPrefab')
          return id
        },

        updatePrefab(id, data) {
          set(
            (s) => ({
              prefabs: s.prefabs.map((p) => (p.id === id ? { ...p, ...data, id: p.id } : p)),
            }),
            false,
            'project/updatePrefab'
          )
        },

        removePrefab(id) {
          set((s) => ({ prefabs: s.prefabs.filter((p) => p.id !== id) }), false, 'project/removePrefab')
        },

        addScript(script) {
          const id = script?.id ?? newId()
          const next = {
            id,
            name: script?.name ?? 'Script',
            nodes: Array.isArray(script?.nodes) ? script.nodes : [],
            connections: Array.isArray(script?.connections) ? script.connections : [],
          }
          set((s) => ({ scripts: [...s.scripts, next] }), false, 'project/addScript')
          return id
        },

        updateScript(id, data) {
          set(
            (s) => ({
              scripts: s.scripts.map((sc) => (sc.id === id ? { ...sc, ...data, id: sc.id } : sc)),
            }),
            false,
            'project/updateScript'
          )
        },

        removeScript(id) {
          set((s) => ({ scripts: s.scripts.filter((sc) => sc.id !== id) }), false, 'project/removeScript')
        },

        addBiome(biome) {
          const id = biome?.id ?? newId()
          const next = {
            id,
            name: biome?.name ?? 'Biome',
            color: biome?.color ?? '#888888',
            spawnRules: Array.isArray(biome?.spawnRules) ? biome.spawnRules : [],
          }
          set((s) => ({ biomes: [...s.biomes, next] }), false, 'project/addBiome')
          return id
        },

        updateBiome(id, data) {
          set(
            (s) => ({
              biomes: s.biomes.map((b) => (b.id === id ? { ...b, ...data, id: b.id } : b)),
            }),
            false,
            'project/updateBiome'
          )
        },

        removeBiome(id) {
          set((s) => ({ biomes: s.biomes.filter((b) => b.id !== id) }), false, 'project/removeBiome')
        },

        setVariable(key, value) {
          set(
            (s) => ({
              variables: { ...s.variables, [key]: value },
            }),
            false,
            'project/setVariable'
          )
        },

        removeVariable(key) {
          set(
            (s) => {
              const next = { ...s.variables }
              delete next[key]
              return { variables: next }
            },
            false,
            'project/removeVariable'
          )
        },

        setGameSettings(partial) {
          if (!partial || typeof partial !== 'object') return
          set(
            (s) => ({
              gameSettings: { ...(s.gameSettings ?? gameSettingsDefaults()), ...partial },
            }),
            false,
            'project/setGameSettings'
          )
        },

        addDialogue(dialogue) {
          const id = dialogue?.id ?? newId()
          const next = { ...dialogue, id }
          set((s) => ({ dialogues: [...s.dialogues, next] }), false, 'project/addDialogue')
          return id
        },

        updateDialogue(id, data) {
          set(
            (s) => ({
              dialogues: s.dialogues.map((d) => (d.id === id ? { ...d, ...data, id: d.id } : d)),
            }),
            false,
            'project/updateDialogue'
          )
        },

        autoSave() {
          set((state) => ({ ...state }), false, 'project/autoSave')
        },

        loadAutoSave() {
          return api.persist?.rehydrate?.() ?? Promise.resolve()
        },

        exportProject() {
          const json = get().saveProject()
          const name = get().projectName?.replace(/[^\w\-]+/g, '_') || 'project'
          if (typeof window === 'undefined') return
          const blob = new Blob([json], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${name}.json`
          a.click()
          URL.revokeObjectURL(url)
        },

        importProject(file) {
          return new Promise((resolve, reject) => {
            if (!(file instanceof Blob)) {
              reject(new TypeError('importProject: expected Blob or File'))
              return
            }
            const reader = new FileReader()
            reader.onload = () => {
              try {
                const text = typeof reader.result === 'string' ? reader.result : ''
                get().loadProject(JSON.parse(text))
                resolve(undefined)
              } catch (err) {
                reject(err)
              }
            }
            reader.onerror = () => reject(reader.error)
            reader.readAsText(file)
          })
        },
      }),
      {
        name: STORAGE_KEY,
        version: PERSIST_VERSION,
        partialize: (state) => ({
          projectName: state.projectName,
          scenes: state.scenes,
          currentSceneId: state.currentSceneId,
          sprites: state.sprites,
          tilesets: state.tilesets,
          prefabs: state.prefabs,
          scripts: state.scripts,
          biomes: state.biomes,
          variables: state.variables,
          assets: state.assets,
          dialogues: state.dialogues,
          gameSettings: state.gameSettings ?? gameSettingsDefaults(),
        }),
        version: PERSIST_VERSION,
        migrate: (persistedState, version) => {
          if (version < 1 && persistedState && typeof persistedState === 'object') {
            return {
              ...persistedState,
              gameSettings: gameSettingsDefaults(),
            }
          }
          return persistedState
        },
      }
    ),
    { name: 'GameMakerProject' }
  )
)
