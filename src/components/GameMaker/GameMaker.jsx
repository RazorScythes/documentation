import React, { useEffect, useRef, useState, Suspense, lazy } from 'react'
import { useProjectStore } from './store/useProjectStore'
import { useEditorStore } from './store/useEditorStore'
import { useSceneStore } from './store/useSceneStore'
import { generateFlappyBirdProject } from './samples/flappyBird'

const SceneEditor = lazy(() => import('./editor/SceneEditor'))
const SpriteEditor = lazy(() => import('./editor/SpriteEditor'))
const TilesetEditor = lazy(() => import('./editor/TilesetEditor'))
const EventEditor = lazy(() => import('./editor/EventEditor'))
const SettingsPanel = lazy(() => import('./editor/SettingsPanel'))
const GameRuntime = lazy(() => import('./runtime/GameRuntime'))

const TABS = [
  { id: 'scene',    label: 'Scene' },
  { id: 'sprite',   label: 'Sprite' },
  { id: 'tileset',  label: 'Tileset' },
  { id: 'events',   label: 'Events' },
  { id: 'settings', label: 'Settings' },
]

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="fixed bottom-6 right-6 z-[100] bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm font-medium animate-pulse">
      {message}
    </div>
  )
}

function generateStandaloneHTML(projectJSON) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Game</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;display:flex;align-items:center;justify-content:center;width:100vw;height:100vh;overflow:hidden}
canvas{image-rendering:pixelated;border:1px solid #333}
#dialogue{position:fixed;bottom:20px;left:20px;right:20px;background:rgba(0,0,0,.9);border:2px solid #60a5fa;border-radius:8px;padding:16px;color:#fff;display:none;font-family:sans-serif}
#dialogue .speaker{color:#60a5fa;font-weight:bold;margin-bottom:4px}
#dialogue .text{font-size:14px;min-height:2em}
#dialogue .hint{text-align:right;color:#999;font-size:11px;margin-top:4px}
</style>
</head>
<body>
<canvas id="game"></canvas>
<div id="dialogue"><div class="speaker" id="dlgSpeaker"></div><div class="text" id="dlgText"></div><div class="hint">[Space]</div></div>
<script>
const PROJECT=${projectJSON};
const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
const settings=PROJECT.gameSettings||{};
const W=settings.screenWidth||800,H=settings.screenHeight||600;
canvas.width=W;canvas.height=H;

function buildBitmaps(sprites){
  const b={};
  for(const s of sprites){
    if(!s.pixels||!s.pixels.length)continue;
    const h=s.pixels.length,w=s.pixels[0]?.length||0;
    if(!w||!h)continue;
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const x=c.getContext('2d');
    for(let y=0;y<h;y++)for(let xp=0;xp<w;xp++){
      const co=s.pixels[y]?.[xp];
      if(co&&co!=='transparent'){x.fillStyle=co;x.fillRect(xp,y,1,1)}
    }
    b[s.id]=c;
    if(s.frames?.length){s.frames.forEach((fr,fi)=>{
      const fp=fr?.layers?.[0]?.pixels||fr?.pixels;if(!fp?.length)return;
      const fh=fp.length,fw=fp[0]?.length||0;
      const fc=document.createElement('canvas');fc.width=fw;fc.height=fh;
      const fctx=fc.getContext('2d');
      for(let y=0;y<fh;y++)for(let xp=0;xp<fw;xp++){
        const co=fp[y]?.[xp];if(co&&co!=='transparent'){fctx.fillStyle=co;fctx.fillRect(xp,y,1,1)}}
      b[s.id+'_f'+fi]=fc})}
  }
  return b;
}

const spriteBM=buildBitmaps(PROJECT.sprites||[]);
const scene=PROJECT.scenes?.find(s=>s.id===PROJECT.currentSceneId)||PROJECT.scenes?.[0]||{entities:[]};
const entities=(scene.entities||[]).map(e=>JSON.parse(JSON.stringify(e)));
const cam={x:0,y:0};
const justPressed={};
document.addEventListener('keydown',e=>{if(!justPressed['_held_'+e.code])justPressed[e.code]=true;justPressed['_held_'+e.code]=true});
document.addEventListener('keyup',e=>{justPressed['_held_'+e.code]=false});
let clickJust=false;
canvas.addEventListener('mousedown',()=>{clickJust=true});

const gt=e=>e.components?.Transform||{x:0,y:0};
const st2=(e,t)=>{e.components=e.components||{};e.components.Transform={...(e.components.Transform||{}),...t}};
const gc2=(e,n)=>e.components?.[n]||null;
const byTag=(tag)=>entities.filter(e=>(e.tags||[]).includes(tag));

const isFlappy=settings.gameMode==='flappy';
let fState='waiting',fScore=0,fHigh=parseInt(localStorage.getItem('gm-flappy-hs')||'0');
const scored=new Set();
const FLAPV=-270,FGRAV=700,PSPD=130,GROUND_Y=555,BIRD_W=28,BIRD_H=24,PIPE_W=52,GAP=150,SPACING=220,NUM_PIPES=6;
let last=performance.now();

function resetGroup(i,bx){
  const gapY=160+Math.floor(Math.random()*240),topH=gapY-GAP/2,botY=gapY+GAP/2,botH=GROUND_Y-botY;
  for(const e of entities){
    if(e.name==='PipeTop_'+i){st2(e,{x:bx,y:topH/2});const s=gc2(e,'SpriteRenderer');if(s)s.height=topH}
    else if(e.name==='CapTop_'+i){st2(e,{x:bx,y:topH-8})}
    else if(e.name==='PipeBot_'+i){st2(e,{x:bx,y:botY+botH/2});const s=gc2(e,'SpriteRenderer');if(s)s.height=botH}
    else if(e.name==='CapBot_'+i){st2(e,{x:bx,y:botY+8})}
    else if(e.name==='Score_'+i){st2(e,{x:bx,y:gapY});scored.delete(e.id)}
  }
}

function loop(now){
  const dt=Math.min((now-last)/1000,1/15);last=now;
  const kSpace=!!justPressed.Space,kClick=clickJust;
  if(isFlappy){
    const bird=byTag('bird')[0];
    if(bird){
      const bt=gt(bird),rb=gc2(bird,'RigidBody'),sr=gc2(bird,'SpriteRenderer');
      const wantFlap=kSpace||kClick;
      if(fState==='waiting'){
        st2(bird,{y:250+Math.sin(now/300)*10,rotation:0});if(rb)rb.velocityY=0;
        if(wantFlap){fState='playing';if(rb)rb.velocityY=FLAPV}
      }else if(fState==='playing'){
        if(rb){rb.velocityY=(rb.velocityY||0)+FGRAV*dt;st2(bird,{y:(bt.y||0)+rb.velocityY*dt})}
        if(wantFlap){if(rb)rb.velocityY=FLAPV;if(sr){sr.frameIndex=1;setTimeout(()=>{sr.frameIndex=0},120)}}
        st2(bird,{rotation:Math.min(90,Math.max(-30,(rb?.velocityY||0)*0.12))});
        const movs=[...byTag('pipe'),...byTag('pipe-cap'),...byTag('score-zone')];
        for(const e of movs){const t=gt(e);st2(e,{x:(t.x||0)-PSPD*dt})}
        const grounds=byTag('ground');
        for(const e of grounds){const t=gt(e);st2(e,{x:(t.x||0)-PSPD*dt});if(gt(e).x<-64){const mx=Math.max(...grounds.map(g=>gt(g).x||0));st2(e,{x:mx+64})}}
        for(const e of byTag('cloud')){const t=gt(e);st2(e,{x:(t.x||0)-25*dt});if(gt(e).x<-80)st2(e,{x:W+80+Math.random()*100})}
        for(let i=0;i<NUM_PIPES;i++){const tp=entities.find(e=>e.name==='PipeTop_'+i);if(tp&&gt(tp).x<-PIPE_W-20){let mx=-Infinity;for(let j=0;j<NUM_PIPES;j++){if(j===i)continue;const o=entities.find(e=>e.name==='PipeTop_'+j);if(o)mx=Math.max(mx,gt(o).x)}resetGroup(i,Math.max(mx+SPACING,W+SPACING))}}
        const bx=gt(bird).x||0,by2=gt(bird).y||0;
        for(const e of byTag('score-zone')){if(!scored.has(e.id)&&gt(e).x<bx){scored.add(e.id);fScore++;if(fScore>fHigh){fHigh=fScore;localStorage.setItem('gm-flappy-hs',String(fHigh))}}}
        for(const e of byTag('obstacle')){const s=gc2(e,'SpriteRenderer');if(!s)continue;const et=gt(e),ew=s.width||PIPE_W,eh=s.height||100;if(bx+BIRD_W/2>et.x-ew/2&&bx-BIRD_W/2<et.x+ew/2&&by2+BIRD_H/2>et.y-eh/2&&by2-BIRD_H/2<et.y+eh/2){fState='dead'}}
        if(by2-BIRD_H/2<0||by2+BIRD_H/2>GROUND_Y)fState='dead';
      }else if(fState==='dead'){
        if(wantFlap){fState='waiting';fScore=0;scored.clear();st2(bird,{x:80,y:250,rotation:0});if(rb){rb.velocityY=0};if(sr)sr.frameIndex=0;
        for(let i=0;i<NUM_PIPES;i++)resetGroup(i,W+100+i*SPACING)}
      }
    }
  }
  ctx.fillStyle=settings.backgroundColor||'#111827';ctx.fillRect(0,0,W,H);
  const sorted=[...entities].filter(e=>e.active!==false&&gc2(e,'SpriteRenderer')).sort((a,b)=>((gt(a).zIndex||0)-(gt(b).zIndex||0)));
  for(const e of sorted){const t=gt(e),sr=gc2(e,'SpriteRenderer');const w=sr.width||32,h=sr.height||32;const sx=t.x||0,sy=t.y||0;
  if(sx+w/2<0||sy+h/2<0||sx-w/2>W||sy-h/2>H)continue;
  ctx.save();ctx.globalAlpha=sr.opacity??1;ctx.translate(sx,sy);ctx.rotate((t.rotation||0)*Math.PI/180);ctx.scale(sr.flipX?-1:1,sr.flipY?-1:1);
  let bmKey=sr.spriteId;if(sr.frameIndex>0)bmKey=sr.spriteId+'_f'+sr.frameIndex;
  const bm=spriteBM[bmKey]||spriteBM[sr.spriteId];if(bm)ctx.drawImage(bm,-w/2,-h/2,w,h);else{ctx.fillStyle='#f0f';ctx.fillRect(-w/2,-h/2,w,h)}ctx.restore()}
  if(isFlappy){ctx.fillStyle='#fff';ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.font='bold 48px sans-serif';ctx.textAlign='center';ctx.strokeText(String(fScore),W/2,60);ctx.fillText(String(fScore),W/2,60);
  if(fState==='waiting'){ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 28px sans-serif';ctx.fillText('FLAPPY BIRD',W/2,H/2-50);ctx.font='16px sans-serif';ctx.fillText('Press SPACE or Click',W/2,H/2);ctx.fillStyle='#fbbf24';ctx.font='14px sans-serif';ctx.fillText('High Score: '+fHigh,W/2,H/2+30)}
  if(fState==='dead'){ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ef4444';ctx.font='bold 36px sans-serif';ctx.fillText('GAME OVER',W/2,H/2-50);ctx.fillStyle='#fff';ctx.font='22px sans-serif';ctx.fillText('Score: '+fScore,W/2,H/2);ctx.fillStyle='#fbbf24';ctx.font='16px sans-serif';ctx.fillText('High Score: '+fHigh,W/2,H/2+35);ctx.fillStyle='#9ca3af';ctx.font='14px sans-serif';ctx.fillText('SPACE or Click to restart',W/2,H/2+70)}}
  for(const k of Object.keys(justPressed)){if(!k.startsWith('_'))delete justPressed[k]}
  clickJust=false;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
<\/script>
</body>
</html>`
}

export default function GameMaker() {
  const activeTab = useEditorStore(s => s.activeTab)
  const setActiveTab = useEditorStore(s => s.setActiveTab)
  const isPlaying = useEditorStore(s => s.isPlaying)
  const startPlaying = useEditorStore(s => s.startPlaying)
  const stopPlaying = useEditorStore(s => s.stopPlaying)
  const projectName = useProjectStore(s => s.projectName)
  const createProject = useProjectStore(s => s.createProject)
  const saveProject = useProjectStore(s => s.saveProject)
  const autoSave = useProjectStore(s => s.autoSave)
  const loadAutoSave = useProjectStore(s => s.loadAutoSave)
  const exportProject = useProjectStore(s => s.exportProject)
  const importProject = useProjectStore(s => s.importProject)
  const loadProject = useProjectStore(s => s.loadProject)

  const [toast, setToast] = useState(null)
  const [showSamples, setShowSamples] = useState(false)
  const fileRef = useRef(null)
  const autoSaveRef = useRef(null)

  useEffect(() => {
    const state = useProjectStore.getState()
    if (!state.projectName) {
      const hasData = localStorage.getItem('game-maker-project')
      if (hasData) {
        loadAutoSave()
      } else {
        createProject('Untitled Game')
      }
    }
  }, [])

  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      autoSave()
    }, 30000)
    return () => clearInterval(autoSaveRef.current)
  }, [autoSave])

  const handleNew = () => {
    const name = prompt('New project name:')
    if (name) {
      createProject(name)
      setToast('Project created')
    }
  }

  const handleSave = () => {
    autoSave()
    setToast('Saved!')
  }

  const handleLoad = () => fileRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importProject(file)
      setToast('Project loaded!')
    } catch (err) {
      alert('Failed to load project: ' + err.message)
    }
    e.target.value = ''
  }

  const handleLoadSample = (sampleName) => {
    setShowSamples(false)
    if (sampleName === 'flappy-bird') {
      const project = generateFlappyBirdProject()
      loadProject(project)
      const scene = project.scenes[0]
      if (scene) {
        useSceneStore.getState().loadScene(scene)
      }
      setToast('Flappy Bird loaded! Press Play to test')
    }
  }

  const handleExportProject = () => {
    exportProject()
    setToast('Project exported as JSON')
  }

  const handleExportGame = () => {
    const json = saveProject()
    const html = generateStandaloneHTML(json)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(projectName || 'game').replace(/[^\w-]/g, '_')}.html`
    a.click()
    URL.revokeObjectURL(url)
    setToast('Game exported!')
  }

  const handlePlay = () => {
    const sceneStore = useSceneStore.getState()
    const projStore = useProjectStore.getState()
    const currentScene = projStore.scenes.find(s => s.id === projStore.currentSceneId)
    if (currentScene) {
      const serialized = sceneStore.serializeScene()
      useProjectStore.getState().loadProject({
        ...projStore,
        scenes: projStore.scenes.map(s => s.id === projStore.currentSceneId ? { ...s, ...serialized } : s)
      })
    }
    startPlaying()
  }

  const Loader = (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full" />
    </div>
  )

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 text-gray-300 overflow-hidden select-none">
      {/* Top Menu Bar */}
      <div className="h-10 flex items-center bg-gray-950 border-b border-gray-800 flex-shrink-0 px-2 gap-1">
        {/* Logo */}
        <div className="text-white font-bold text-sm px-3 flex items-center gap-1.5 mr-2">
          <span className="text-blue-400">[</span>
          <span>Game Maker</span>
          <span className="text-blue-400">]</span>
          {projectName && <span className="text-gray-500 font-normal text-xs ml-1">- {projectName}</span>}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Project Controls */}
        <div className="flex items-center gap-1">
          <button onClick={handleNew} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs">New</button>
          <button onClick={handleSave} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs">Save</button>
          <button onClick={handleLoad} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs">Load</button>
          <div className="relative">
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="px-2 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded text-xs font-medium"
            >
              Samples
            </button>
            {showSamples && (
              <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-xl z-50 min-w-[160px]">
                <button
                  onClick={() => handleLoadSample('flappy-bird')}
                  className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-gray-700 rounded"
                >
                  Flappy Bird
                </button>
              </div>
            )}
          </div>
          <button onClick={handleExportProject} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs">Export JSON</button>
          <button onClick={handleExportGame} className="px-2 py-1 bg-indigo-700 hover:bg-indigo-600 text-white rounded text-xs font-medium">Export Game</button>
          <div className="w-px h-5 bg-gray-700 mx-1" />
          <button
            onClick={handlePlay}
            className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold flex items-center gap-1"
          >
            <span className="text-[10px]">&#9654;</span> Play
          </button>
        </div>

        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 relative">
        <Suspense fallback={Loader}>
          {activeTab === 'scene' && <SceneEditor />}
          {activeTab === 'sprite' && <SpriteEditor />}
          {activeTab === 'tileset' && <TilesetEditor />}
          {activeTab === 'events' && <EventEditor />}
          {activeTab === 'settings' && <SettingsPanel />}
        </Suspense>

        {isPlaying && (
          <Suspense fallback={Loader}>
            <GameRuntime />
          </Suspense>
        )}
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
