import React, { useRef, useEffect, useState } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import { useEditorStore } from '../store/useEditorStore'
import { useSceneStore } from '../store/useSceneStore'
import { createCamera } from '../engine/camera'
import { createInputManager } from '../engine/input'

function deepClone(obj) {
  if (typeof structuredClone === 'function') return structuredClone(obj)
  return JSON.parse(JSON.stringify(obj))
}

function buildSpriteBitmaps(sprites) {
  const bm = {}
  for (const s of sprites) {
    if (!s.pixels?.length) continue
    const h = s.pixels.length, w = s.pixels[0]?.length || 0
    if (!w || !h) continue
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    const ctx = c.getContext('2d')
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const co = s.pixels[y]?.[x]
        if (co && co !== 'transparent' && co !== 'rgba(0,0,0,0)') { ctx.fillStyle = co; ctx.fillRect(x, y, 1, 1) }
      }
    bm[s.id] = c
    if (s.frames?.length) {
      s.frames.forEach((fr, fi) => {
        const fp = fr?.layers?.[0]?.pixels || fr?.pixels
        if (!fp?.length) return
        const fh = fp.length, fw = fp[0]?.length || 0
        const fc = document.createElement('canvas')
        fc.width = fw; fc.height = fh
        const fctx = fc.getContext('2d')
        for (let y = 0; y < fh; y++)
          for (let x = 0; x < fw; x++) {
            const co = fp[y]?.[x]
            if (co && co !== 'transparent' && co !== 'rgba(0,0,0,0)') { fctx.fillStyle = co; fctx.fillRect(x, y, 1, 1) }
          }
        bm[`${s.id}_f${fi}`] = fc
      })
    }
  }
  return bm
}

function buildTileBitmaps(tilesets, sprites) {
  const bm = {}
  for (const ts of tilesets) {
    (ts.tiles || []).forEach((t, i) => {
      const k = `${ts.id}_t${i}`
      const px = t?.pixels || (t?.spriteId ? (sprites.find(s => s.id === t.spriteId)?.pixels) : null)
      if (!px?.length) return
      const h = px.length, w = px[0]?.length || 0
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      const ctx = c.getContext('2d')
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const co = px[y]?.[x]
          if (co && co !== 'transparent') { ctx.fillStyle = co; ctx.fillRect(x, y, 1, 1) }
        }
      bm[k] = c
    })
  }
  return bm
}

const gt = e => e.components?.Transform || e.transform || { x: 0, y: 0 }
const st = (e, t) => {
  if (e.components) { e.components.Transform = { ...(e.components.Transform || {}), ...t } }
  else { e.components = { Transform: t } }
  if (e.transform) e.transform = { ...e.transform, ...t }
}
const gc = (e, n) => e.components?.[n] || null
const hc = (e, n) => !!(e.components?.[n])
const byTag = (ents, tag) => ents.filter(e => (e.tags || []).includes(tag))

export default function GameRuntime() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const stopPlaying = useEditorStore(s => s.stopPlaying)
  const isPaused = useEditorStore(s => s.isPaused)
  const togglePause = useEditorStore(s => s.togglePause)
  const [dialogueState, setDialogueState] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const store = useProjectStore.getState()
    const sceneStore = useSceneStore.getState()
    const data = {
      sprites: deepClone(store.sprites),
      tilesets: deepClone(store.tilesets),
      prefabs: deepClone(store.prefabs),
      variables: deepClone(store.variables),
      gameSettings: deepClone(store.gameSettings || {}),
      currentScene: sceneStore.serializeScene(),
      scenes: deepClone(store.scenes),
      currentSceneId: store.currentSceneId,
    }

    const settings = data.gameSettings
    const W = settings.screenWidth || 800
    const H = settings.screenHeight || 600
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    const spriteBM = buildSpriteBitmaps(data.sprites)
    const tileBM = buildTileBitmaps(data.tilesets, data.sprites)

    const scene = data.currentScene || data.scenes?.find(s => s.id === data.currentSceneId) || data.scenes?.[0]
    if (!scene) return

    const entities = (scene.entities || []).map(e => deepClone(e))
    const tileMap = scene.tileMap ? deepClone(scene.tileMap) : null
    const camera = createCamera(); camera.viewportWidth = W; camera.viewportHeight = H

    const input = createInputManager(canvas)
    let running = true
    let lastTime = performance.now()
    const isFlappy = settings.gameMode === 'flappy'

    // ─── FLAPPY STATE ───
    let fState = 'waiting', fScore = 0
    let fHigh = parseInt(localStorage.getItem('gm-flappy-hs') || '0', 10)
    const scored = new Set()
    const FLAP_V = -270, GRAVITY = 700, PIPE_SPD = 130
    const GROUND_Y = 555, BIRD_W = 28, BIRD_H = 24, PIPE_W = 52, GAP = 150, SPACING = 220, NUM_PIPES = 6

    function flap(bird) {
      const rb = gc(bird, 'RigidBody')
      if (rb) rb.velocityY = FLAP_V
      const sr = gc(bird, 'SpriteRenderer')
      if (sr) sr.frameIndex = 1
      setTimeout(() => { if (sr) sr.frameIndex = 0 }, 120)
    }

    function resetPipeGroup(idx, baseX) {
      const gapY = 160 + Math.floor(Math.random() * 240)
      const topH = gapY - GAP / 2
      const botY = gapY + GAP / 2
      const botH = GROUND_Y - botY

      for (const e of entities) {
        if (e.name === `PipeTop_${idx}`) { st(e, { x: baseX, y: topH / 2 }); const s = gc(e, 'SpriteRenderer'); if (s) s.height = topH }
        else if (e.name === `CapTop_${idx}`) { st(e, { x: baseX, y: topH - 8 }) }
        else if (e.name === `PipeBot_${idx}`) { st(e, { x: baseX, y: botY + botH / 2 }); const s = gc(e, 'SpriteRenderer'); if (s) s.height = botH }
        else if (e.name === `CapBot_${idx}`) { st(e, { x: baseX, y: botY + 8 }) }
        else if (e.name === `Score_${idx}`) { st(e, { x: baseX, y: gapY }); scored.delete(e.id) }
      }
    }

    function updateFlappy(dt) {
      const bird = byTag(entities, 'bird')[0]
      if (!bird) return

      const wantFlap = input.isKeyPressed('Space') || input.isMousePressed(0)
      const bt = gt(bird)
      const rb = gc(bird, 'RigidBody')

      if (fState === 'waiting') {
        st(bird, { y: 250 + Math.sin(performance.now() / 300) * 10, rotation: 0 })
        if (rb) rb.velocityY = 0
        if (wantFlap) {
          fState = 'playing'
          flap(bird)
        }
        return
      }

      if (fState === 'dead') {
        if (wantFlap) {
          fState = 'waiting'
          fScore = 0
          scored.clear()
          st(bird, { x: 80, y: 250, rotation: 0 })
          if (rb) { rb.velocityY = 0; rb.gravityScale = 0 }
          for (let i = 0; i < NUM_PIPES; i++) resetPipeGroup(i, W + 100 + i * SPACING)
        }
        return
      }

      // --- PLAYING ---
      if (rb) {
        rb.velocityY = (rb.velocityY || 0) + GRAVITY * dt
        const newY = (bt.y || 0) + rb.velocityY * dt
        st(bird, { y: newY })
      }

      if (wantFlap) flap(bird)

      const rot = Math.min(90, Math.max(-30, (rb?.velocityY || 0) * 0.12))
      st(bird, { rotation: rot })

      // Move pipes, caps, score zones, grounds, clouds
      const movables = [...byTag(entities, 'pipe'), ...byTag(entities, 'pipe-cap'), ...byTag(entities, 'score-zone')]
      for (const e of movables) {
        const t = gt(e)
        st(e, { x: (t.x || 0) - PIPE_SPD * dt })
      }

      const grounds = byTag(entities, 'ground')
      for (const e of grounds) {
        const t = gt(e)
        st(e, { x: (t.x || 0) - PIPE_SPD * dt })
        if ((gt(e).x || 0) < -64) {
          const maxX = Math.max(...grounds.map(g => gt(g).x || 0))
          st(e, { x: maxX + 64 })
        }
      }

      const clouds = byTag(entities, 'cloud')
      for (const e of clouds) {
        const t = gt(e)
        st(e, { x: (t.x || 0) - 25 * dt })
        if ((gt(e).x || 0) < -80) st(e, { x: W + 80 + Math.random() * 100 })
      }

      // Recycle pipes by group: when a group scrolls fully off the left edge,
      // reposition it after the rightmost group to create an infinite loop.
      for (let i = 0; i < NUM_PIPES; i++) {
        const topPipe = entities.find(e => e.name === `PipeTop_${i}`)
        if (!topPipe) continue
        const tx = gt(topPipe).x || 0
        if (tx < -PIPE_W - 20) {
          let maxGroupX = -Infinity
          for (let j = 0; j < NUM_PIPES; j++) {
            if (j === i) continue
            const other = entities.find(e => e.name === `PipeTop_${j}`)
            if (other) maxGroupX = Math.max(maxGroupX, gt(other).x || 0)
          }
          const newX = Math.max(maxGroupX + SPACING, W + SPACING)
          resetPipeGroup(i, newX)
        }
      }

      // Score
      const bx = gt(bird).x || 0, by = gt(bird).y || 0
      for (const e of byTag(entities, 'score-zone')) {
        if (!scored.has(e.id) && (gt(e).x || 0) < bx) {
          scored.add(e.id)
          fScore++
          if (fScore > fHigh) { fHigh = fScore; localStorage.setItem('gm-flappy-hs', String(fHigh)) }
        }
      }

      // Collision with pipes
      for (const e of byTag(entities, 'obstacle')) {
        const sr = gc(e, 'SpriteRenderer')
        if (!sr) continue
        const et = gt(e)
        const ew = sr.width || PIPE_W, eh = sr.height || 100
        const ex = (et.x || 0) - ew / 2, ey = (et.y || 0) - eh / 2
        const bx2 = bx - BIRD_W / 2, by2 = by - BIRD_H / 2
        if (bx2 + BIRD_W > ex && bx2 < ex + ew && by2 + BIRD_H > ey && by2 < ey + eh) {
          fState = 'dead'
          return
        }
      }

      // Ceiling / ground death
      if (by - BIRD_H / 2 < 0 || by + BIRD_H / 2 > GROUND_Y) {
        fState = 'dead'
      }
    }

    // ─── STANDARD GAME MODE ───
    let dialogueQueue = null, dlgCharIdx = 0, dlgTimer = 0

    function updateStandard(dt) {
      for (const e of entities) {
        const pc = gc(e, 'PlayerController')
        if (!pc) continue
        const t = gt(e), speed = (pc.speed || 150) * dt
        const sprint = input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight') ? (pc.sprintMultiplier || 1.5) : 1
        let dx = 0, dy = 0
        if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp')) dy -= 1
        if (input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown')) dy += 1
        if (input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft')) dx -= 1
        if (input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight')) dx += 1
        if (dx || dy) {
          const len = Math.sqrt(dx * dx + dy * dy)
          st(e, { x: (t.x || 0) + dx / len * speed * sprint, y: (t.y || 0) + dy / len * speed * sprint })
          const sr = gc(e, 'SpriteRenderer'); if (sr) sr.flipX = dx < 0
        }
        if (input.isKeyPressed('KeyE') || input.isKeyPressed('Space')) {
          for (const o of entities) {
            if (o === e) continue
            const dial = gc(o, 'Dialogue'); if (!dial?.lines?.length) continue
            const ot = gt(o)
            if (Math.hypot((ot.x||0)-(t.x||0), (ot.y||0)-(t.y||0)) < (pc.interactRange || 48)) {
              dialogueQueue = { lines: [...dial.lines], cur: 0, speaker: dial.speakerName || '' }
              dlgCharIdx = 0; dlgTimer = 0; break
            }
          }
        }
      }
      for (const e of entities) {
        const npc = gc(e, 'NPC'); if (!npc || npc.state !== 'patrol' || !npc.pathPoints?.length) continue
        const t = gt(e), tgt = npc.pathPoints[npc.currentPathIndex || 0]
        if (tgt) {
          const dx = tgt.x - (t.x||0), dy = tgt.y - (t.y||0), dist = Math.sqrt(dx*dx+dy*dy), spd = (npc.patrolSpeed||50)*dt
          if (dist < spd) npc.currentPathIndex = ((npc.currentPathIndex||0)+1) % npc.pathPoints.length
          else st(e, { x: (t.x||0)+dx/dist*spd, y: (t.y||0)+dy/dist*spd })
        }
      }
      for (const e of entities) {
        const rb = gc(e, 'RigidBody')
        if (rb && !rb.isStatic && !rb.isKinematic) {
          const t = gt(e)
          rb.velocityY = (rb.velocityY||0) + (settings.gravityY||0) * (rb.gravityScale??1) * dt
          rb.velocityX = (rb.velocityX||0) * (1-(rb.friction||0.1))
          st(e, { x: (t.x||0)+(rb.velocityX||0)*dt, y: (t.y||0)+(rb.velocityY||0)*dt })
        }
      }
      // simple AABB collision
      const cols = entities.filter(e => hc(e, 'Collider'))
      for (let i = 0; i < cols.length; i++) for (let j = i+1; j < cols.length; j++) {
        const a = cols[i], b = cols[j], ta = gt(a), tb = gt(b)
        const ca = gc(a,'Collider'), cb = gc(b,'Collider')
        const ax = (ta.x||0)+(ca.offsetX||0), ay = (ta.y||0)+(ca.offsetY||0)
        const bx = (tb.x||0)+(cb.offsetX||0), by = (tb.y||0)+(cb.offsetY||0)
        const aw = ca.width||32, ah = ca.height||32, bw = cb.width||32, bh = cb.height||32
        const ox = Math.min(ax+aw/2,bx+bw/2)-Math.max(ax-aw/2,bx-bw/2)
        const oy = Math.min(ay+ah/2,by+bh/2)-Math.max(ay-ah/2,by-bh/2)
        if (ox>0 && oy>0 && !ca.isTrigger && !cb.isTrigger) {
          const aS = gc(a,'RigidBody')?.isStatic || !gc(a,'RigidBody')
          const bS = gc(b,'RigidBody')?.isStatic || !gc(b,'RigidBody')
          if (ox<oy) { const p = ax<bx?-ox/2:ox/2; if(!aS)st(a,{x:(ta.x||0)+p}); if(!bS)st(b,{x:(tb.x||0)-p}) }
          else { const p = ay<by?-oy/2:oy/2; if(!aS)st(a,{y:(ta.y||0)+p}); if(!bS)st(b,{y:(tb.y||0)-p}) }
        }
      }
      const player = entities.find(e => hc(e, 'PlayerController'))
      if (player) { const t = gt(player); camera.x += ((t.x||0)-W/2-camera.x)*0.1; camera.y += ((t.y||0)-H/2-camera.y)*0.1 }
      if (dialogueQueue) {
        dlgTimer += dt; const txt = dialogueQueue.lines[dialogueQueue.cur] || ''
        dlgCharIdx = Math.min(Math.floor(dlgTimer/0.03), txt.length)
        if (input.isKeyPressed('Space')||input.isKeyPressed('Enter')) {
          if (dlgCharIdx < txt.length) { dlgCharIdx = txt.length; dlgTimer = txt.length*0.03 }
          else { dialogueQueue.cur++; dlgCharIdx = 0; dlgTimer = 0; if (dialogueQueue.cur >= dialogueQueue.lines.length) dialogueQueue = null }
        }
        if (dialogueQueue) setDialogueState({ speaker: dialogueQueue.speaker, text: txt.slice(0, dlgCharIdx) })
        else setDialogueState(null)
      }
    }

    // ─── RENDERING ───
    function renderTiles(layerName) {
      if (!tileMap?.layers?.[layerName]) return
      const layer = tileMap.layers[layerName], ts = tileMap.tileSize || 32
      for (let y = 0; y < layer.length; y++) for (let x = 0; x < (layer[y]?.length||0); x++) {
        const t = layer[y][x]; if (!t) continue
        const sx = x * ts - camera.x, sy = y * ts - camera.y
        if (sx + ts < 0 || sy + ts < 0 || sx > W || sy > H) continue
        const bm = tileBM[`${t.tilesetId}_t${t.tileIndex}`]
        if (bm) ctx.drawImage(bm, sx, sy, ts, ts)
      }
    }

    function renderEntities() {
      const sorted = [...entities].filter(e => e.active !== false && gc(e, 'SpriteRenderer'))
        .sort((a, b) => ((gt(a).zIndex || 0) - (gt(b).zIndex || 0)))
      for (const e of sorted) {
        const t = gt(e), sr = gc(e, 'SpriteRenderer')
        const w = sr.width || 32, h = sr.height || 32
        const sx = (t.x || 0) - camera.x, sy = (t.y || 0) - camera.y
        if (sx + w / 2 < 0 || sy + h / 2 < 0 || sx - w / 2 > W || sy - h / 2 > H) continue

        ctx.save()
        ctx.globalAlpha = sr.opacity ?? 1
        ctx.translate(sx, sy)
        ctx.rotate((t.rotation || 0) * Math.PI / 180)
        ctx.scale((t.scaleX || 1) * (sr.flipX ? -1 : 1), (t.scaleY || 1) * (sr.flipY ? -1 : 1))

        let bmKey = sr.spriteId
        if (sr.frameIndex > 0) bmKey = `${sr.spriteId}_f${sr.frameIndex}`
        const bm = spriteBM[bmKey] || spriteBM[sr.spriteId]
        if (bm) ctx.drawImage(bm, -w / 2, -h / 2, w, h)
        else { ctx.fillStyle = sr.tint || '#f0f'; ctx.fillRect(-w / 2, -h / 2, w, h) }
        ctx.restore()
      }
    }

    function renderFlappyUI() {
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3
      ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center'
      ctx.strokeText(String(fScore), W / 2, 60)
      ctx.fillText(String(fScore), W / 2, 60)

      if (fState === 'waiting') {
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 28px sans-serif'
        ctx.fillText('FLAPPY BIRD', W / 2, H / 2 - 50)
        ctx.font = '16px sans-serif'
        ctx.fillText('Press SPACE or Click to start', W / 2, H / 2)
        ctx.fillStyle = '#fbbf24'; ctx.font = '14px sans-serif'
        ctx.fillText(`High Score: ${fHigh}`, W / 2, H / 2 + 30)
      }
      if (fState === 'dead') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 36px sans-serif'
        ctx.fillText('GAME OVER', W / 2, H / 2 - 50)
        ctx.fillStyle = '#fff'; ctx.font = '22px sans-serif'
        ctx.fillText(`Score: ${fScore}`, W / 2, H / 2)
        ctx.fillStyle = '#fbbf24'; ctx.font = '16px sans-serif'
        ctx.fillText(`High Score: ${fHigh}`, W / 2, H / 2 + 35)
        ctx.fillStyle = '#9ca3af'; ctx.font = '14px sans-serif'
        ctx.fillText('SPACE or Click to restart', W / 2, H / 2 + 70)
      }
    }

    // ─── GAME LOOP ───
    function gameLoop(now) {
      if (!running) return
      const dt = Math.min((now - lastTime) / 1000, 1 / 15)
      lastTime = now

      const paused = useEditorStore.getState().isPaused

      if (!paused) {
        if (isFlappy) updateFlappy(dt)
        else updateStandard(dt)
      }

      ctx.fillStyle = settings.backgroundColor || '#111827'
      ctx.fillRect(0, 0, W, H)
      renderTiles('background'); renderTiles('mid')
      renderEntities()
      renderTiles('foreground')

      if (isFlappy) renderFlappyUI()

      if (paused) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText('PAUSED', W / 2, H / 2)
        ctx.font = '14px sans-serif'; ctx.fillText('Press Escape to resume', W / 2, H / 2 + 30)
      }

      input.update()
      gameRef.current = requestAnimationFrame(gameLoop)
    }

    gameRef.current = requestAnimationFrame(gameLoop)

    const handleKey = e => {
      if (e.key === 'Escape') useEditorStore.getState().togglePause()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      running = false
      cancelAnimationFrame(gameRef.current)
      input.destroy()
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <canvas ref={canvasRef} className="border border-gray-700" style={{ imageRendering: 'pixelated' }} />
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={() => togglePause()} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-sm font-bold">
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={stopPlaying} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-bold">
          Stop
        </button>
      </div>
      {dialogueState && (
        <div className="absolute bottom-8 left-8 right-8 bg-black/90 border-2 border-blue-400 rounded-lg p-4 text-white pointer-events-none">
          {dialogueState.speaker && <div className="text-blue-400 font-bold mb-1">{dialogueState.speaker}</div>}
          <div className="text-gray-200 text-sm min-h-[2rem]">{dialogueState.text}<span className="animate-pulse">|</span></div>
        </div>
      )}
    </div>
  )
}
