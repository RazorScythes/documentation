import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import { useEditorStore } from '../store/useEditorStore'
import { useSceneStore } from '../store/useSceneStore'

const uid = () => crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2,11)}`

const CATEGORY_COLORS = {
  event:   '#22c55e',
  action:  '#3b82f6',
  dialogue:'#a855f7',
  control: '#f97316',
  value:   '#6b7280',
}

const NODE_DEFS = {
  OnStart:       { cat: 'event',    label: 'On Start',       inputs: [],                                              outputs: [{ name:'flow', type:'flow' }], props: {} },
  OnUpdate:      { cat: 'event',    label: 'On Update',      inputs: [],                                              outputs: [{ name:'flow', type:'flow' }], props: {} },
  OnCollision:   { cat: 'event',    label: 'On Collision',   inputs: [],                                              outputs: [{ name:'flow', type:'flow' }], props: { targetTag:'' } },
  OnInteract:    { cat: 'event',    label: 'On Interact',    inputs: [],                                              outputs: [{ name:'flow', type:'flow' }], props: { range: 48 } },
  OnTimer:       { cat: 'event',    label: 'On Timer',       inputs: [],                                              outputs: [{ name:'flow', type:'flow' }], props: { delay: 1 } },
  OnVariable:    { cat: 'event',    label: 'On Variable',    inputs: [],                                              outputs: [{ name:'flow', type:'flow' }], props: { variableName:'', condition:'changed' } },

  Move:          { cat: 'action',   label: 'Move',           inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: { targetX:0, targetY:0, speed:100 } },
  SpawnObject:   { cat: 'action',   label: 'Spawn Object',   inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: { prefabId:'', x:0, y:0 } },
  DestroyObject: { cat: 'action',   label: 'Destroy',        inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: { entityId:'self' } },
  PlayAnimation: { cat: 'action',   label: 'Play Anim',      inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: { animationName:'', loop:true } },
  StopAnimation: { cat: 'action',   label: 'Stop Anim',      inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: {} },
  SetVariable:   { cat: 'action',   label: 'Set Variable',   inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: { name:'', value:'', operation:'set' } },
  PlaySound:     { cat: 'action',   label: 'Play Sound',     inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: { soundId:'', volume:1 } },
  CameraShake:   { cat: 'action',   label: 'Cam Shake',      inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: { intensity:5, duration:0.3 } },
  CameraFollow:  { cat: 'action',   label: 'Cam Follow',     inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: { targetEntityId:'' } },
  Wait:          { cat: 'action',   label: 'Wait',           inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: { duration:1 } },
  Teleport:      { cat: 'action',   label: 'Teleport',       inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: { x:0, y:0 } },
  SetActive:     { cat: 'action',   label: 'Set Active',     inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: { active:true } },

  ShowDialogue:  { cat: 'dialogue', label: 'Show Dialogue',  inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: { speakerName:'', text:'', choices:'' } },
  HideDialogue:  { cat: 'dialogue', label: 'Hide Dialogue',  inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'done', type:'flow' }], props: {} },

  Conditional:   { cat: 'control',  label: 'If / Else',      inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'true', type:'flow' },{ name:'false', type:'flow' }], props: { variableName:'', operator:'==', value:'' } },
  Sequence:      { cat: 'control',  label: 'Sequence',       inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'1', type:'flow' },{ name:'2', type:'flow' },{ name:'3', type:'flow' }], props: {} },
  RandomChoice:  { cat: 'control',  label: 'Random',         inputs: [{ name:'exec', type:'flow' }],                  outputs: [{ name:'A', type:'flow' },{ name:'B', type:'flow' }], props: { weights:'50,50' } },

  GetVariable:   { cat: 'value',    label: 'Get Var',        inputs: [],                                              outputs: [{ name:'value', type:'data' }], props: { name:'' } },
  Number:        { cat: 'value',    label: 'Number',         inputs: [],                                              outputs: [{ name:'value', type:'data' }], props: { value:0 } },
  String:        { cat: 'value',    label: 'String',         inputs: [],                                              outputs: [{ name:'value', type:'data' }], props: { value:'' } },
  Boolean:       { cat: 'value',    label: 'Boolean',        inputs: [],                                              outputs: [{ name:'value', type:'data' }], props: { value:true } },
  EntityRef:     { cat: 'value',    label: 'Entity Ref',     inputs: [],                                              outputs: [{ name:'ref', type:'data' }], props: { entityId:'' } },
}

const NODE_W = 180
const HEADER_H = 28
const PORT_R = 7
const PORT_SPACING = 24
const PORT_START_Y = HEADER_H + 16

function createNode(type, x, y) {
  const def = NODE_DEFS[type]
  if (!def) return null
  return {
    id: uid(),
    type,
    category: def.cat,
    x, y,
    properties: { ...def.props },
    inputs:  def.inputs.map(p => ({ id: uid(), name: p.name, type: p.type })),
    outputs: def.outputs.map(p => ({ id: uid(), name: p.name, type: p.type })),
  }
}

function nodeHeight(node) {
  const ports = Math.max(node.inputs.length, node.outputs.length)
  return HEADER_H + Math.max(ports, 1) * PORT_SPACING + 12
}

function portPos(node, portId, isInput) {
  const list = isInput ? node.inputs : node.outputs
  const idx = list.findIndex(p => p.id === portId)
  if (idx < 0) return { x: node.x, y: node.y }
  return {
    x: isInput ? node.x : node.x + NODE_W,
    y: node.y + PORT_START_Y + idx * PORT_SPACING,
  }
}

function hitTestNodes(nodes, mx, my) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i]
    const h = nodeHeight(n)
    if (mx >= n.x && mx <= n.x + NODE_W && my >= n.y && my <= n.y + h) return n
  }
  return null
}

function hitTestPort(nodes, mx, my) {
  for (const n of nodes) {
    for (const p of n.inputs) {
      const pos = portPos(n, p.id, true)
      if (Math.hypot(mx - pos.x, my - pos.y) < PORT_R + 4) return { node: n, port: p, isInput: true }
    }
    for (const p of n.outputs) {
      const pos = portPos(n, p.id, false)
      if (Math.hypot(mx - pos.x, my - pos.y) < PORT_R + 4) return { node: n, port: p, isInput: false }
    }
  }
  return null
}

function drawNode(ctx, node, selected) {
  const h = nodeHeight(node)
  const color = CATEGORY_COLORS[node.category] || '#6b7280'

  ctx.fillStyle = '#1f2937'
  ctx.strokeStyle = selected ? '#60a5fa' : '#374151'
  ctx.lineWidth = selected ? 2.5 : 1
  ctx.beginPath()
  ctx.roundRect(node.x, node.y, NODE_W, h, 6)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(node.x, node.y, NODE_W, HEADER_H, [6, 6, 0, 0])
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(node.type, node.x + 8, node.y + HEADER_H / 2)

  node.inputs.forEach((p, i) => {
    const py = node.y + PORT_START_Y + i * PORT_SPACING
    ctx.fillStyle = p.type === 'flow' ? '#fff' : '#93c5fd'
    ctx.beginPath()
    if (p.type === 'flow') {
      ctx.moveTo(node.x - PORT_R, py - PORT_R)
      ctx.lineTo(node.x + PORT_R, py)
      ctx.lineTo(node.x - PORT_R, py + PORT_R)
      ctx.closePath()
    } else {
      ctx.arc(node.x, py, PORT_R, 0, Math.PI * 2)
    }
    ctx.fill()
    ctx.fillStyle = '#d1d5db'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(p.name, node.x + PORT_R + 6, py)
  })

  node.outputs.forEach((p, i) => {
    const py = node.y + PORT_START_Y + i * PORT_SPACING
    const px = node.x + NODE_W
    ctx.fillStyle = p.type === 'flow' ? '#fff' : '#93c5fd'
    ctx.beginPath()
    if (p.type === 'flow') {
      ctx.moveTo(px - PORT_R, py - PORT_R)
      ctx.lineTo(px + PORT_R, py)
      ctx.lineTo(px - PORT_R, py + PORT_R)
      ctx.closePath()
    } else {
      ctx.arc(px, py, PORT_R, 0, Math.PI * 2)
    }
    ctx.fill()
    ctx.fillStyle = '#d1d5db'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(p.name, px - PORT_R - 6, py)
  })
}

function drawConnection(ctx, from, to, color = '#fff') {
  const dx = Math.abs(to.x - from.x) * 0.5
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.bezierCurveTo(from.x + dx, from.y, to.x - dx, to.y, to.x, to.y)
  ctx.stroke()
}

const CATEGORIES = ['event', 'action', 'dialogue', 'control', 'value']
const CAT_LABELS = { event: 'Events', action: 'Actions', dialogue: 'Dialogue', control: 'Control Flow', value: 'Values' }

export default function EventEditor() {
  const scripts = useProjectStore(s => s.scripts)
  const addScript = useProjectStore(s => s.addScript)
  const updateScript = useProjectStore(s => s.updateScript)
  const removeScript = useProjectStore(s => s.removeScript)
  const selectedEntityIds = useEditorStore(s => s.selectedEntityIds)
  const updateComponent = useSceneStore(s => s.updateComponent)
  const entities = useSceneStore(s => s.entities)

  const [currentScriptId, setCurrentScriptId] = useState(scripts[0]?.id || null)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [paletteFilter, setPaletteFilter] = useState('')
  const [expandedCats, setExpandedCats] = useState(new Set(CATEGORIES))

  const canvasRef = useRef(null)
  const draggingRef = useRef(null)
  const panningRef = useRef(null)
  const connectingRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)

  const script = useMemo(() => scripts.find(s => s.id === currentScriptId), [scripts, currentScriptId])
  const nodes = script?.nodes || []
  const connections = script?.connections || []

  const setNodes = useCallback((newNodes) => {
    if (!currentScriptId) return
    updateScript(currentScriptId, { nodes: typeof newNodes === 'function' ? newNodes(nodes) : newNodes })
  }, [currentScriptId, nodes, updateScript])

  const setConnections = useCallback((newConns) => {
    if (!currentScriptId) return
    updateScript(currentScriptId, { connections: typeof newConns === 'function' ? newConns(connections) : newConns })
  }, [currentScriptId, connections, updateScript])

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId])

  const toWorld = useCallback((sx, sy) => ({
    x: (sx - pan.x) / zoom,
    y: (sy - pan.y) / zoom,
  }), [pan, zoom])

  const handleNewScript = () => {
    const name = prompt('Script name:')
    if (!name) return
    const id = addScript({ name })
    setCurrentScriptId(id)
  }

  const handleDeleteScript = () => {
    if (!currentScriptId || !confirm('Delete this script?')) return
    removeScript(currentScriptId)
    setCurrentScriptId(scripts.find(s => s.id !== currentScriptId)?.id || null)
  }

  const handleAddNode = (type) => {
    const canvas = canvasRef.current
    const cx = canvas ? canvas.width / 2 : 300
    const cy = canvas ? canvas.height / 2 : 200
    const w = toWorld(cx, cy)
    const node = createNode(type, w.x - NODE_W / 2, w.y)
    if (!node) return
    setNodes([...nodes, node])
    setSelectedNodeId(node.id)
  }

  const handleAttachToEntity = () => {
    if (!currentScriptId || !selectedEntityIds.length) return
    const eid = selectedEntityIds[0]
    const entity = entities.get(eid)
    if (!entity) return
    const existing = entity.components?.Script?.events || []
    if (!existing.includes(currentScriptId)) {
      updateComponent(eid, 'Script', { events: [...existing, currentScriptId], variables: entity.components?.Script?.variables || {} })
    }
  }

  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const w = toWorld(sx, sy)

    if (e.button === 1 || (e.button === 2)) {
      panningRef.current = { startX: e.clientX, startY: e.clientY, startPan: { ...pan } }
      return
    }

    const portHit = hitTestPort(nodes, w.x, w.y)
    if (portHit) {
      connectingRef.current = { ...portHit, startPos: portPos(portHit.node, portHit.port.id, portHit.isInput) }
      return
    }

    const nodeHit = hitTestNodes(nodes, w.x, w.y)
    if (nodeHit) {
      setSelectedNodeId(nodeHit.id)
      draggingRef.current = { nodeId: nodeHit.id, offsetX: w.x - nodeHit.x, offsetY: w.y - nodeHit.y }
    } else {
      setSelectedNodeId(null)
    }
  }, [nodes, pan, zoom, toWorld])

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    if (panningRef.current) {
      const dx = e.clientX - panningRef.current.startX
      const dy = e.clientY - panningRef.current.startY
      setPan({ x: panningRef.current.startPan.x + dx, y: panningRef.current.startPan.y + dy })
      return
    }

    if (draggingRef.current) {
      const w = toWorld(mouseRef.current.x, mouseRef.current.y)
      const newNodes = nodes.map(n => n.id === draggingRef.current.nodeId
        ? { ...n, x: w.x - draggingRef.current.offsetX, y: w.y - draggingRef.current.offsetY }
        : n)
      setNodes(newNodes)
    }
  }, [nodes, toWorld, setNodes])

  const handleMouseUp = useCallback((e) => {
    if (connectingRef.current) {
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const w = toWorld(e.clientX - rect.left, e.clientY - rect.top)
        const portHit = hitTestPort(nodes, w.x, w.y)
        if (portHit && portHit.isInput !== connectingRef.current.isInput && portHit.node.id !== connectingRef.current.node.id) {
          const from = connectingRef.current.isInput ? portHit : connectingRef.current
          const to = connectingRef.current.isInput ? connectingRef.current : portHit
          const exists = connections.some(c => c.fromPortId === from.port.id && c.toPortId === to.port.id)
          if (!exists) {
            setConnections([...connections, {
              id: uid(),
              fromNodeId: from.node.id,
              fromPortId: from.port.id,
              toNodeId: to.node.id,
              toPortId: to.port.id,
            }])
          }
        }
      }
      connectingRef.current = null
    }
    draggingRef.current = null
    panningRef.current = null
  }, [nodes, connections, toWorld, setConnections])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(z => Math.max(0.2, Math.min(3, z * delta)))
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Delete' && selectedNodeId) {
      setNodes(nodes.filter(n => n.id !== selectedNodeId))
      setConnections(connections.filter(c => c.fromNodeId !== selectedNodeId && c.toNodeId !== selectedNodeId))
      setSelectedNodeId(null)
    }
  }, [selectedNodeId, nodes, connections, setNodes, setConnections])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let running = true

    const render = () => {
      if (!running) return
      const w = canvas.parentElement?.clientWidth || 800
      const h = canvas.parentElement?.clientHeight || 600
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.save()
      ctx.translate(pan.x, pan.y)
      ctx.scale(zoom, zoom)

      const gridSize = 40
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1 / zoom
      const bounds = { l: -pan.x / zoom, t: -pan.y / zoom, r: (canvas.width - pan.x) / zoom, b: (canvas.height - pan.y) / zoom }
      const sx = Math.floor(bounds.l / gridSize) * gridSize
      const sy = Math.floor(bounds.t / gridSize) * gridSize
      for (let x = sx; x < bounds.r; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, bounds.t); ctx.lineTo(x, bounds.b); ctx.stroke()
      }
      for (let y = sy; y < bounds.b; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(bounds.l, y); ctx.lineTo(bounds.r, y); ctx.stroke()
      }

      for (const conn of connections) {
        const fromNode = nodes.find(n => n.id === conn.fromNodeId)
        const toNode = nodes.find(n => n.id === conn.toNodeId)
        if (!fromNode || !toNode) continue
        const fromPos = portPos(fromNode, conn.fromPortId, false)
        const toPos = portPos(toNode, conn.toPortId, true)
        const fromPort = fromNode.outputs.find(p => p.id === conn.fromPortId)
        const color = fromPort?.type === 'data' ? '#93c5fd' : '#ffffff'
        drawConnection(ctx, fromPos, toPos, color)
      }

      if (connectingRef.current) {
        const mp = toWorld(mouseRef.current.x, mouseRef.current.y)
        drawConnection(ctx, connectingRef.current.startPos, mp, '#60a5fa')
      }

      for (const node of nodes) {
        drawNode(ctx, node, node.id === selectedNodeId)
      }

      ctx.restore()
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => { running = false; cancelAnimationFrame(rafRef.current) }
  }, [nodes, connections, selectedNodeId, pan, zoom, toWorld])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const updateNodeProp = (key, value) => {
    if (!selectedNodeId) return
    setNodes(nodes.map(n => n.id === selectedNodeId
      ? { ...n, properties: { ...n.properties, [key]: value } }
      : n))
  }

  const filteredDefs = useMemo(() => {
    const f = paletteFilter.toLowerCase()
    return Object.entries(NODE_DEFS).filter(([k, d]) => !f || k.toLowerCase().includes(f) || d.label.toLowerCase().includes(f))
  }, [paletteFilter])

  const toggleCat = (cat) => {
    setExpandedCats(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-300 select-none">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-950 border-b border-gray-700 flex-shrink-0">
        <select
          className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-xs border border-gray-600"
          value={currentScriptId || ''}
          onChange={e => setCurrentScriptId(e.target.value || null)}
        >
          <option value="">-- Select Script --</option>
          {scripts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={handleNewScript} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">New Script</button>
        <button onClick={handleDeleteScript} className="px-2 py-1 bg-red-800 hover:bg-red-700 rounded text-xs">Delete</button>
        {script && (
          <input
            className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-xs border border-gray-600 w-32"
            value={script.name}
            onChange={e => updateScript(currentScriptId, { name: e.target.value })}
          />
        )}
        <div className="flex-1" />
        <button
          onClick={handleAttachToEntity}
          disabled={!currentScriptId || !selectedEntityIds.length}
          className="px-2 py-1 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 rounded text-xs"
        >
          Attach to Entity
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Node Palette */}
        <div className="w-56 bg-gray-800 border-r border-gray-700 flex flex-col flex-shrink-0">
          <div className="p-2 border-b border-gray-700">
            <input
              className="w-full bg-gray-700 px-2 py-1 rounded text-xs border border-gray-600"
              placeholder="Search nodes..."
              value={paletteFilter}
              onChange={e => setPaletteFilter(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto text-xs">
            {CATEGORIES.map(cat => {
              const items = filteredDefs.filter(([, d]) => d.cat === cat)
              if (!items.length) return null
              return (
                <div key={cat}>
                  <button
                    className="w-full text-left px-3 py-1.5 font-bold flex items-center gap-2 hover:bg-gray-700"
                    onClick={() => toggleCat(cat)}
                    style={{ color: CATEGORY_COLORS[cat] }}
                  >
                    <span>{expandedCats.has(cat) ? '[-]' : '[+]'}</span>
                    {CAT_LABELS[cat]}
                  </button>
                  {expandedCats.has(cat) && items.map(([type, def]) => (
                    <button
                      key={type}
                      className="w-full text-left px-5 py-1 hover:bg-gray-700 text-gray-300"
                      onClick={() => handleAddNode(type)}
                    >
                      {def.label}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative min-w-0">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onContextMenu={e => e.preventDefault()}
          />
          {!currentScriptId && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-gray-500 text-lg">Select or create a script to begin</span>
            </div>
          )}
        </div>

        {/* Node Inspector */}
        <div className="w-60 bg-gray-800 border-l border-gray-700 flex flex-col flex-shrink-0 overflow-y-auto">
          <div className="p-2 border-b border-gray-700 font-bold text-xs text-gray-400">Node Properties</div>
          {selectedNode ? (
            <div className="p-3 space-y-3 text-xs">
              <div>
                <span className="font-bold" style={{ color: CATEGORY_COLORS[selectedNode.category] }}>{selectedNode.type}</span>
              </div>
              <div className="text-gray-500">ID: {selectedNode.id.slice(0, 8)}</div>
              <div className="space-y-2">
                {Object.entries(selectedNode.properties).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-gray-400 block mb-0.5">{key}</label>
                    {typeof val === 'boolean' ? (
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={val} onChange={e => updateNodeProp(key, e.target.checked)} />
                        <span>{val ? 'true' : 'false'}</span>
                      </label>
                    ) : typeof val === 'number' ? (
                      <input
                        type="number"
                        className="w-full bg-gray-700 px-2 py-1 rounded border border-gray-600"
                        value={val}
                        onChange={e => updateNodeProp(key, parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      <input
                        className="w-full bg-gray-700 px-2 py-1 rounded border border-gray-600"
                        value={val}
                        onChange={e => updateNodeProp(key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-700">
                <div className="text-gray-500 mb-1">Inputs: {selectedNode.inputs.map(p => p.name).join(', ') || 'none'}</div>
                <div className="text-gray-500">Outputs: {selectedNode.outputs.map(p => p.name).join(', ') || 'none'}</div>
              </div>
              <button
                onClick={() => {
                  setNodes(nodes.filter(n => n.id !== selectedNodeId))
                  setConnections(connections.filter(c => c.fromNodeId !== selectedNodeId && c.toNodeId !== selectedNodeId))
                  setSelectedNodeId(null)
                }}
                className="w-full mt-2 px-2 py-1 bg-red-800 hover:bg-red-700 rounded"
              >
                Delete Node
              </button>
            </div>
          ) : (
            <div className="p-3 text-xs text-gray-500">Select a node to inspect</div>
          )}
        </div>
      </div>
    </div>
  )
}
