import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { useSceneStore } from './useSceneStore.js'

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function cloneEntity(e) {
  if (typeof structuredClone === 'function') {
    return structuredClone(e)
  }
  return JSON.parse(JSON.stringify(e))
}

function pickRedoKeys(snapshot) {
  return snapshot && typeof snapshot === 'object' ? Object.keys(snapshot) : []
}

export const useEditorStore = create(
  devtools(
    (set, get) => ({
      activeTab: 'scene',
      selectedEntityIds: [],
      selectedTool: 'select',
      gridVisible: true,
      gridSize: 32,
      snapToGrid: true,
      showColliders: false,
      showGrid: true,
      zoom: 1,
      panOffset: { x: 0, y: 0 },
      isPlaying: false,
      isPaused: false,
      currentLayer: 'mid',
      inspectorData: null,
      undoStack: [],
      redoStack: [],
      clipboard: [],
      assetBrowserFilter: '',
      hierarchyExpanded: new Set(),
      activePaintTile: null,
      activeBiome: null,

      setActiveTab(tab) {
        set({ activeTab: tab }, false, 'editor/setActiveTab')
      },

      selectEntity(id) {
        set({ selectedEntityIds: [id] }, false, 'editor/selectEntity')
      },

      deselectEntity(id) {
        set(
          (s) => ({
            selectedEntityIds: s.selectedEntityIds.filter((x) => x !== id),
          }),
          false,
          'editor/deselectEntity'
        )
      },

      clearSelection() {
        set({ selectedEntityIds: [] }, false, 'editor/clearSelection')
      },

      selectMultiple(ids) {
        set({ selectedEntityIds: Array.isArray(ids) ? [...ids] : [] }, false, 'editor/selectMultiple')
      },

      setTool(tool) {
        set({ selectedTool: tool }, false, 'editor/setTool')
      },

      toggleGrid() {
        set(
          (s) => ({
            gridVisible: !s.gridVisible,
            showGrid: !s.showGrid,
          }),
          false,
          'editor/toggleGrid'
        )
      },

      setGridSize(size) {
        const n = Number(size)
        if (!Number.isFinite(n) || n <= 0) return
        set({ gridSize: n }, false, 'editor/setGridSize')
      },

      toggleSnap() {
        set((s) => ({ snapToGrid: !s.snapToGrid }), false, 'editor/toggleSnap')
      },

      toggleColliders() {
        set((s) => ({ showColliders: !s.showColliders }), false, 'editor/toggleColliders')
      },

      setZoom(zoom) {
        const z = Number(zoom)
        if (!Number.isFinite(z) || z <= 0) return
        set({ zoom: z }, false, 'editor/setZoom')
      },

      setPanOffset(offset) {
        set(
          {
            panOffset: {
              x: Number(offset?.x) || 0,
              y: Number(offset?.y) || 0,
            },
          },
          false,
          'editor/setPanOffset'
        )
      },

      startPlaying() {
        set({ isPlaying: true, isPaused: false }, false, 'editor/startPlaying')
      },

      stopPlaying() {
        set({ isPlaying: false, isPaused: false }, false, 'editor/stopPlaying')
      },

      togglePause() {
        set(
          (s) => {
            if (!s.isPlaying) return s
            return { isPaused: !s.isPaused }
          },
          false,
          'editor/togglePause'
        )
      },

      setCurrentLayer(layer) {
        set({ currentLayer: layer }, false, 'editor/setCurrentLayer')
      },

      pushUndo(state) {
        set(
          (s) => ({
            undoStack: [...s.undoStack, state].slice(-120),
            redoStack: [],
          }),
          false,
          'editor/pushUndo'
        )
      },

      undo() {
        set(
          (s) => {
            if (!s.undoStack.length) return s
            const incoming = s.undoStack[s.undoStack.length - 1]
            const keys = pickRedoKeys(incoming)
            const currentPatch = {}
            for (const k of keys) {
              if (k in s) {
                const v = s[k]
                if (k === 'hierarchyExpanded' && v instanceof Set) {
                  currentPatch[k] = new Set(v)
                } else {
                  currentPatch[k] = v
                }
              }
            }
            const next = { ...s, ...incoming }
            if (incoming?.hierarchyExpanded && !(incoming.hierarchyExpanded instanceof Set)) {
              next.hierarchyExpanded = new Set(incoming.hierarchyExpanded)
            }
            return {
              ...next,
              undoStack: s.undoStack.slice(0, -1),
              redoStack: [...s.redoStack, currentPatch],
            }
          },
          false,
          'editor/undo'
        )
      },

      redo() {
        set(
          (s) => {
            if (!s.redoStack.length) return s
            const incoming = s.redoStack[s.redoStack.length - 1]
            const keys = pickRedoKeys(incoming)
            const currentPatch = {}
            for (const k of keys) {
              if (k in s) {
                const v = s[k]
                if (k === 'hierarchyExpanded' && v instanceof Set) {
                  currentPatch[k] = new Set(v)
                } else {
                  currentPatch[k] = v
                }
              }
            }
            const next = { ...s, ...incoming }
            if (incoming?.hierarchyExpanded && !(incoming.hierarchyExpanded instanceof Set)) {
              next.hierarchyExpanded = new Set(incoming.hierarchyExpanded)
            }
            return {
              ...next,
              redoStack: s.redoStack.slice(0, -1),
              undoStack: [...s.undoStack, currentPatch],
            }
          },
          false,
          'editor/redo'
        )
      },

      copyEntities() {
        const ids = get().selectedEntityIds
        const entities = useSceneStore.getState().entities
        const copied = ids
          .map((id) => entities.get(id))
          .filter(Boolean)
          .map((e) => cloneEntity(e))
        set({ clipboard: copied }, false, 'editor/copyEntities')
      },

      pasteEntities(offsetX = 16, offsetY = 16) {
        const { clipboard } = get()
        if (!clipboard.length) return []
        const newIds = []
        for (const raw of clipboard) {
          const e = cloneEntity(raw)
          e.id = newId()
          if (e.transform && typeof e.transform === 'object') {
            e.transform = {
              ...e.transform,
              x: (e.transform.x ?? 0) + offsetX,
              y: (e.transform.y ?? 0) + offsetY,
            }
          } else {
            e.transform = { x: offsetX, y: offsetY }
          }
          useSceneStore.getState().addEntity(e)
          newIds.push(e.id)
        }
        set({ selectedEntityIds: newIds }, false, 'editor/pasteEntities')
        return newIds
      },

      deleteSelected() {
        const ids = get().selectedEntityIds
        const scene = useSceneStore.getState()
        ids.forEach((id) => scene.removeEntity(id))
        set({ selectedEntityIds: [], inspectorData: null }, false, 'editor/deleteSelected')
      },

      setAssetBrowserFilter(filter) {
        set({ assetBrowserFilter: filter ?? '' }, false, 'editor/setAssetBrowserFilter')
      },

      toggleHierarchyExpand(id) {
        set(
          (s) => {
            const next = new Set(s.hierarchyExpanded)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return { hierarchyExpanded: next }
          },
          false,
          'editor/toggleHierarchyExpand'
        )
      },

      setActivePaintTile(tilesetId, tileIndex) {
        set(
          {
            activePaintTile:
              tilesetId == null || tileIndex == null
                ? null
                : { tilesetId, tileIndex: Number(tileIndex) },
          },
          false,
          'editor/setActivePaintTile'
        )
      },

      setActiveBiome(biomeId) {
        set({ activeBiome: biomeId ?? null }, false, 'editor/setActiveBiome')
      },
    }),
    { name: 'GameMakerEditor' }
  )
)
