import React, { useState } from 'react'
import { useProjectStore } from '../store/useProjectStore'

function Section({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border border-gray-700 rounded">
      <button
        className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-750 font-bold text-xs flex items-center justify-between"
        onClick={() => setOpen(!open)}
      >
        {title}
        <span>{open ? '[-]' : '[+]'}</span>
      </button>
      {open && <div className="p-3 space-y-3">{children}</div>}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-gray-400 text-xs w-32 flex-shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  )
}

const inputCls = 'w-full bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs border border-gray-600 focus:border-blue-500 focus:outline-none'

export default function SettingsPanel() {
  const projectName = useProjectStore(s => s.projectName)
  const gameSettings = useProjectStore(s => s.gameSettings) || {}
  const variables = useProjectStore(s => s.variables) || {}
  const setGameSettings = useProjectStore(s => s.setGameSettings)
  const setVariable = useProjectStore(s => s.setVariable)
  const removeVariable = useProjectStore(s => s.removeVariable)
  const loadProject = useProjectStore(s => s.loadProject)

  const [newVarKey, setNewVarKey] = useState('')
  const [newVarVal, setNewVarVal] = useState('')

  const updateSetting = (key, value) => setGameSettings({ [key]: value })

  const handleAddVar = () => {
    if (!newVarKey.trim()) return
    setVariable(newVarKey.trim(), newVarVal)
    setNewVarKey('')
    setNewVarVal('')
  }

  return (
    <div className="h-full bg-gray-900 text-gray-300 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Project Settings</h2>

        <Section title="Project">
          <Field label="Project Name">
            <input
              className={inputCls}
              value={projectName}
              onChange={e => loadProject({ ...useProjectStore.getState(), projectName: e.target.value })}
            />
          </Field>
          <Field label="Screen Width">
            <input className={inputCls} type="number" value={gameSettings.screenWidth || 800} onChange={e => updateSetting('screenWidth', parseInt(e.target.value) || 800)} />
          </Field>
          <Field label="Screen Height">
            <input className={inputCls} type="number" value={gameSettings.screenHeight || 600} onChange={e => updateSetting('screenHeight', parseInt(e.target.value) || 600)} />
          </Field>
          <Field label="Target FPS">
            <input className={inputCls} type="number" value={gameSettings.targetFps || 60} onChange={e => updateSetting('targetFps', parseInt(e.target.value) || 60)} />
          </Field>
          <Field label="Background Color">
            <div className="flex items-center gap-2">
              <input type="color" value={gameSettings.backgroundColor || '#111827'} onChange={e => updateSetting('backgroundColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <span className="text-xs text-gray-400">{gameSettings.backgroundColor || '#111827'}</span>
            </div>
          </Field>
        </Section>

        <Section title="Grid">
          <Field label="Default Grid Size">
            <select className={inputCls} value={gameSettings.defaultGridSize || 32} onChange={e => updateSetting('defaultGridSize', parseInt(e.target.value))}>
              <option value={16}>16px</option>
              <option value={32}>32px</option>
              <option value={64}>64px</option>
            </select>
          </Field>
          <Field label="Grid Color">
            <div className="flex items-center gap-2">
              <input type="color" value={gameSettings.gridColor?.startsWith('#') ? gameSettings.gridColor : '#ffffff'} onChange={e => updateSetting('gridColor', e.target.value + '26')} className="w-8 h-8 rounded cursor-pointer" />
              <span className="text-xs text-gray-400">{gameSettings.gridColor || 'rgba(255,255,255,0.15)'}</span>
            </div>
          </Field>
          <Field label="Snap to Grid">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={gameSettings.snapToGridDefault !== false} onChange={e => updateSetting('snapToGridDefault', e.target.checked)} />
              <span className="text-xs">{gameSettings.snapToGridDefault !== false ? 'On' : 'Off'}</span>
            </label>
          </Field>
        </Section>

        <Section title="Physics">
          <Field label="Gravity X">
            <input className={inputCls} type="number" step="10" value={gameSettings.gravityX || 0} onChange={e => updateSetting('gravityX', parseFloat(e.target.value) || 0)} />
          </Field>
          <Field label="Gravity Y">
            <input className={inputCls} type="number" step="10" value={gameSettings.gravityY ?? 200} onChange={e => updateSetting('gravityY', parseFloat(e.target.value) || 0)} />
          </Field>
          <Field label="Default Friction">
            <input className={inputCls} type="number" step="0.01" min="0" max="1" value={gameSettings.defaultFriction ?? 0.1} onChange={e => updateSetting('defaultFriction', parseFloat(e.target.value) || 0)} />
          </Field>
        </Section>

        <Section title="Game Variables">
          <div className="space-y-2">
            {Object.entries(variables).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-24 truncate font-mono">{key}</span>
                <input
                  className={inputCls + ' flex-1'}
                  value={typeof val === 'string' ? val : JSON.stringify(val)}
                  onChange={e => setVariable(key, e.target.value)}
                />
                <button onClick={() => removeVariable(key)} className="text-red-400 hover:text-red-300 text-xs px-1">X</button>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1 border-t border-gray-700">
              <input className={inputCls + ' w-24'} placeholder="Key" value={newVarKey} onChange={e => setNewVarKey(e.target.value)} />
              <input className={inputCls + ' flex-1'} placeholder="Value" value={newVarVal} onChange={e => setNewVarVal(e.target.value)} />
              <button onClick={handleAddVar} className="px-2 py-1 bg-green-700 hover:bg-green-600 rounded text-xs">Add</button>
            </div>
          </div>
        </Section>

        <Section title="Controls">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-800 p-2 rounded"><span className="text-gray-400">Move:</span> WASD / Arrows</div>
            <div className="bg-gray-800 p-2 rounded"><span className="text-gray-400">Interact:</span> E</div>
            <div className="bg-gray-800 p-2 rounded"><span className="text-gray-400">Advance Dialogue:</span> Space / Enter</div>
            <div className="bg-gray-800 p-2 rounded"><span className="text-gray-400">Sprint:</span> Shift</div>
            <div className="bg-gray-800 p-2 rounded"><span className="text-gray-400">Pause:</span> Escape</div>
          </div>
        </Section>

        <Section title="About">
          <div className="text-xs space-y-1 text-gray-400">
            <div className="text-white font-bold">2D Game Development Suite</div>
            <div>Version 1.0.0</div>
            <div>Built with React + Vite + TailwindCSS + HTML5 Canvas</div>
            <div>Entity Component System + Visual Scripting + Pixel Art Tools</div>
          </div>
        </Section>
      </div>
    </div>
  )
}
