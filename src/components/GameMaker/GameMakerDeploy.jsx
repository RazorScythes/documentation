import React, { useRef, useState, useEffect } from 'react'

export default function GameMakerDeploy() {
  const canvasRef = useRef(null)
  const fileRef = useRef(null)
  const [project, setProject] = useState(null)
  const [error, setError] = useState(null)
  const gameRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data.scenes?.length) throw new Error('No scenes found in project')
      setProject(data)
      setError(null)
    } catch (err) {
      setError('Invalid project file: ' + err.message)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data.scenes?.length) throw new Error('No scenes found')
      setProject(data)
      setError(null)
    } catch (err) {
      setError('Invalid project file: ' + err.message)
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('game-maker-project')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed?.state?.scenes?.length) {
          setProject(parsed.state)
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (!project || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const settings = project.gameSettings || {}
    const W = settings.screenWidth || 800
    const H = settings.screenHeight || 600
    canvas.width = W
    canvas.height = H

    function buildBitmaps(sprites) {
      const b = {}
      for (const s of sprites || []) {
        if (!s.pixels?.length) continue
        const h = s.pixels.length, w = s.pixels[0]?.length || 0
        if (!w || !h) continue
        const c = document.createElement('canvas')
        c.width = w; c.height = h
        const cx = c.getContext('2d')
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const co = s.pixels[y]?.[x]
          if (co && co !== 'transparent' && co !== 'rgba(0,0,0,0)') { cx.fillStyle = co; cx.fillRect(x, y, 1, 1) }
        }
        b[s.id] = c
      }
      return b
    }

    function buildTileBitmaps(tilesets, sprites) {
      const b = {}
      for (const ts of tilesets || []) {
        (ts.tiles || []).forEach((t, i) => {
          const k = `${ts.id}_t${i}`
          const px = t?.pixels || (t?.spriteId ? (sprites || []).find(s => s.id === t.spriteId)?.pixels : null)
          if (!px?.length) return
          const h = px.length, w = px[0]?.length || 0
          const c = document.createElement('canvas')
          c.width = w; c.height = h
          const cx = c.getContext('2d')
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const co = px[y]?.[x]
            if (co && co !== 'transparent') { cx.fillStyle = co; cx.fillRect(x, y, 1, 1) }
          }
          b[k] = c
        })
      }
      return b
    }

    const spriteBM = buildBitmaps(project.sprites)
    const tileBM = buildTileBitmaps(project.tilesets, project.sprites)
    const scene = project.scenes.find(s => s.id === project.currentSceneId) || project.scenes[0]
    const entities = (scene.entities || []).map(e => JSON.parse(JSON.stringify(e)))
    const tileMap = scene.tileMap ? JSON.parse(JSON.stringify(scene.tileMap)) : null
    const cam = { x: 0, y: 0 }
    const keys = {}, prevKeys = {}

    const onKD = e => { keys[e.code] = true }
    const onKU = e => { keys[e.code] = false }
    document.addEventListener('keydown', onKD)
    document.addEventListener('keyup', onKU)
    const pressed = k => keys[k] && !prevKeys[k]

    const gt = e => e.components?.Transform || e.transform || { x: 0, y: 0 }
    const st = (e, t) => {
      if (e.components?.Transform) e.components.Transform = { ...e.components.Transform, ...t }
      else if (e.transform) e.transform = { ...e.transform, ...t }
      else { e.components = e.components || {}; e.components.Transform = t }
    }
    const gc = (e, n) => e.components?.[n] || null
    const hc = (e, n) => !!e.components?.[n]

    let running = true, last = performance.now()
    let dlg = null, dlgIdx = 0, dlgTimer = 0

    function loop(now) {
      if (!running) return
      const dt = Math.min((now - last) / 1000, 1 / 15)
      last = now

      for (const e of entities) {
        const pc = gc(e, 'PlayerController')
        if (!pc) continue
        const t = gt(e), sp = (pc.speed || 150) * dt
        const spr = keys.ShiftLeft || keys.ShiftRight ? (pc.sprintMultiplier || 1.5) : 1
        let dx = 0, dy = 0
        if (keys.KeyW || keys.ArrowUp) dy = -1
        if (keys.KeyS || keys.ArrowDown) dy = 1
        if (keys.KeyA || keys.ArrowLeft) dx = -1
        if (keys.KeyD || keys.ArrowRight) dx = 1
        if (dx || dy) {
          const l = Math.sqrt(dx * dx + dy * dy)
          st(e, { ...t, x: (t.x || 0) + dx / l * sp * spr, y: (t.y || 0) + dy / l * sp * spr })
        }
        if (pressed('KeyE') || pressed('Space')) {
          for (const o of entities) {
            if (o === e) continue
            const d = gc(o, 'Dialogue')
            if (!d?.lines?.length) continue
            const ot = gt(o)
            if (Math.hypot((ot.x || 0) - (t.x || 0), (ot.y || 0) - (t.y || 0)) < (pc.interactRange || 48)) {
              dlg = { lines: [...d.lines], cur: 0, speaker: d.speakerName || '' }
              dlgIdx = 0; dlgTimer = 0; break
            }
          }
        }
      }

      for (const e of entities) {
        const npc = gc(e, 'NPC')
        if (!npc || npc.state !== 'patrol' || !npc.pathPoints?.length) continue
        const t = gt(e), tgt = npc.pathPoints[npc.currentPathIndex || 0]
        if (tgt) {
          const dx = tgt.x - (t.x || 0), dy = tgt.y - (t.y || 0)
          const dist = Math.sqrt(dx * dx + dy * dy), sp = (npc.patrolSpeed || 50) * dt
          if (dist < sp) npc.currentPathIndex = ((npc.currentPathIndex || 0) + 1) % npc.pathPoints.length
          else st(e, { ...t, x: (t.x || 0) + dx / dist * sp, y: (t.y || 0) + dy / dist * sp })
        }
      }

      const cols = entities.filter(e => hc(e, 'Collider'))
      for (let i = 0; i < cols.length; i++) for (let j = i + 1; j < cols.length; j++) {
        const a = cols[i], b = cols[j]
        const ta = gt(a), tb = gt(b), ca = gc(a, 'Collider'), cb = gc(b, 'Collider')
        const ax = (ta.x || 0) + (ca.offsetX || 0), ay = (ta.y || 0) + (ca.offsetY || 0)
        const bx = (tb.x || 0) + (cb.offsetX || 0), by = (tb.y || 0) + (cb.offsetY || 0)
        const aw = ca.width || 32, ah = ca.height || 32, bw = cb.width || 32, bh = cb.height || 32
        const ox = Math.min(ax + aw / 2, bx + bw / 2) - Math.max(ax - aw / 2, bx - bw / 2)
        const oy = Math.min(ay + ah / 2, by + bh / 2) - Math.max(ay - ah / 2, by - bh / 2)
        if (ox > 0 && oy > 0 && !ca.isTrigger && !cb.isTrigger) {
          const aS = gc(a, 'RigidBody')?.isStatic || !gc(a, 'RigidBody')
          const bS = gc(b, 'RigidBody')?.isStatic || !gc(b, 'RigidBody')
          if (ox < oy) { const p = ax < bx ? -ox / 2 : ox / 2; if (!aS) st(a, { ...ta, x: (ta.x || 0) + p }); if (!bS) st(b, { ...tb, x: (tb.x || 0) - p }) }
          else { const p = ay < by ? -oy / 2 : oy / 2; if (!aS) st(a, { ...ta, y: (ta.y || 0) + p }); if (!bS) st(b, { ...tb, y: (tb.y || 0) - p }) }
        }
      }

      const pl = entities.find(e => hc(e, 'PlayerController'))
      if (pl) { const t = gt(pl); cam.x += (t.x - W / 2 - cam.x) * 0.1; cam.y += (t.y - H / 2 - cam.y) * 0.1 }

      if (dlg) {
        dlgTimer += dt
        const txt = dlg.lines[dlg.cur] || ''
        dlgIdx = Math.min(Math.floor(dlgTimer / 0.03), txt.length)
        if (pressed('Space') || pressed('Enter')) {
          if (dlgIdx < txt.length) { dlgIdx = txt.length; dlgTimer = txt.length * 0.03 }
          else { dlg.cur++; dlgIdx = 0; dlgTimer = 0; if (dlg.cur >= dlg.lines.length) dlg = null }
        }
      }

      ctx.fillStyle = settings.backgroundColor || '#111827'
      ctx.fillRect(0, 0, W, H)

      if (tileMap?.layers) {
        for (const ln of ['background', 'mid', 'foreground']) {
          const ly = tileMap.layers[ln]; if (!ly) continue; const ts = tileMap.tileSize || 32
          for (let y = 0; y < ly.length; y++) for (let x = 0; x < (ly[y]?.length || 0); x++) {
            const t = ly[y][x]; if (!t) continue
            const sx = x * ts - cam.x, sy = y * ts - cam.y
            if (sx + ts < 0 || sy + ts < 0 || sx > W || sy > H) continue
            const bk = `${t.tilesetId}_t${t.tileIndex}`
            const bm = tileBM[bk]
            if (bm) ctx.drawImage(bm, sx, sy, ts, ts)
            else { ctx.fillStyle = '#333'; ctx.fillRect(sx, sy, ts, ts) }
          }
        }
      }

      const sorted = [...entities].sort((a, b) => (gt(a).zIndex || 0) - (gt(b).zIndex || 0))
      for (const e of sorted) {
        if (e.active === false) continue
        const t = gt(e), sr = gc(e, 'SpriteRenderer')
        if (!sr) continue
        const x = (t.x || 0) - cam.x, y = (t.y || 0) - cam.y, w = sr.width || 32, h = sr.height || 32
        if (x + w < 0 || y + h < 0 || x > W || y > H) continue
        ctx.save(); ctx.globalAlpha = sr.opacity ?? 1
        ctx.translate(x + w / 2, y + h / 2)
        ctx.rotate((t.rotation || 0) * Math.PI / 180)
        ctx.scale(sr.flipX ? -1 : 1, sr.flipY ? -1 : 1)
        const bm = spriteBM[sr.spriteId]
        if (bm) ctx.drawImage(bm, -w / 2, -h / 2, w, h)
        else { ctx.fillStyle = sr.tint || '#f0f'; ctx.fillRect(-w / 2, -h / 2, w, h) }
        ctx.restore()
      }

      if (dlg) {
        const boxH = 100, boxY = H - boxH - 16
        ctx.fillStyle = 'rgba(0,0,0,0.85)'
        ctx.beginPath(); ctx.roundRect(24, boxY, W - 48, boxH, 8); ctx.fill()
        ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 2; ctx.stroke()
        if (dlg.speaker) { ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(dlg.speaker, 40, boxY + 24) }
        ctx.fillStyle = '#e5e7eb'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left'
        ctx.fillText((dlg.lines[dlg.cur] || '').slice(0, dlgIdx), 40, boxY + 48)
        ctx.fillStyle = '#999'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right'
        ctx.fillText('[Space]', W - 40, boxY + boxH - 10)
      }

      Object.assign(prevKeys, keys)
      gameRef.current = requestAnimationFrame(loop)
    }

    gameRef.current = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(gameRef.current)
      document.removeEventListener('keydown', onKD)
      document.removeEventListener('keyup', onKU)
    }
  }, [project])

  if (!project) {
    return (
      <div
        className="w-screen h-screen bg-gray-950 flex items-center justify-center"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-white">Game Maker Deploy</h1>
          <p className="text-gray-400">Load a Game Maker project to play</p>
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 hover:border-blue-500 transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
            <p className="text-gray-500 text-sm">Drop a project .json file here or click to browse</p>
          </div>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <p className="text-gray-600 text-xs">Or it will auto-load from your last saved project</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <canvas ref={canvasRef} style={{ imageRendering: 'pixelated' }} className="border border-gray-800" />
      <button
        onClick={() => setProject(null)}
        className="absolute top-4 right-4 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs"
      >
        Back
      </button>
    </div>
  )
}
