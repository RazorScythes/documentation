import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faClose, faEye, faPlus, faLaptopCode, faTimes, faCheck, faImage, faPen, faCircleCheck, faCircleXmark, faInfoCircle, faChevronDown, faPalette } from "@fortawesome/free-solid-svg-icons"
import { useDispatch } from 'react-redux'
import { uploadSkills } from "../../../actions/portfolio"
import { useDropzone } from 'react-dropzone'

const PRESET_COLORS = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
    '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#2563eb', '#4f46e5', '#7c3aed',
    '#64748b', '#475569', '#334155', '#1e293b', '#0f172a',
]

const ColorPicker = ({ value, onChange, isLight }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all cursor-pointer w-full ${isLight
                    ? `bg-white border-slate-200 text-slate-800 ${open ? 'border-blue-400' : 'hover:border-slate-300'}`
                    : `bg-[#1a1a1a] border-[#333] text-gray-200 ${open ? 'border-blue-500' : 'hover:border-[#444]'}`
                }`}>
                <div className="w-5 h-5 rounded-md flex-shrink-0 border border-solid" style={{ backgroundColor: value || '#3b82f6', borderColor: isLight ? '#e2e8f0' : '#333' }} />
                <span className="flex-1 text-left text-xs font-medium">{value || '#3b82f6'}</span>
                <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''} ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
            </button>
            {open && (
                <div className={`absolute z-50 mt-1.5 left-0 right-0 rounded-xl border border-solid shadow-xl overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                    <div className="p-3">
                        <div className="grid grid-cols-5 gap-1.5">
                            {PRESET_COLORS.map(c => (
                                <button key={c} type="button" onClick={() => { onChange(c); setOpen(false) }}
                                    className={`w-full aspect-square rounded-lg transition-all hover:scale-110 ${value === c ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                                    style={{ backgroundColor: c, ringColor: c, '--tw-ring-offset-color': isLight ? '#fff' : '#0e0e0e' }}>
                                </button>
                            ))}
                        </div>
                        <div className={`mt-3 pt-3 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                            <div className="flex items-center gap-2">
                                <input type="color" value={value || '#3b82f6'} onChange={(e) => { onChange(e.target.value); setOpen(false) }}
                                    className="w-8 h-8 rounded-md cursor-pointer border-0 p-0" />
                                <input type="text" value={value || '#3b82f6'} onChange={(e) => onChange(e.target.value)}
                                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-mono border border-solid outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#1a1a1a] border-[#333] text-gray-300'}`}
                                    placeholder="#hex" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const Skills = ({ user, portfolio, isLight, card, inputCls, btnPrimary, btnSecondary, labelCls }) => {
    const dispatch = useDispatch()

    const [submitted, setSubmitted] = useState(false)
    const [skills, setSkills] = useState({
        image: '', icons: [], project_completed: 0, heading: '', description: '', skill: [], removed_icons: []
    })
    const [input, setInput] = useState({ display_image: '', skill: { image: '', skill_name: '', percentage: 0, hex: '#3b82f6' } })
    const [showForm, setShowForm] = useState(false)
    const [editingSkill, setEditingSkill] = useState(null)
    const [editSkill, setEditSkill] = useState({ skill_name: '', percentage: 0, hex: '#3b82f6' })

    useEffect(() => {
        setSubmitted(false)
        setSkills({ ...skills, description: portfolio?.description || '', heading: portfolio?.heading || '', icons: portfolio?.icons || [], project_completed: portfolio?.project_completed || 0, skill: portfolio?.skill || [] })
        setInput({ ...input, display_image: portfolio?.image || '' })
        setEditingSkill(null)
    }, [portfolio])

    const convertImage = async (e) => {
        setInput({ ...input, skill: { ...input.skill, image: e.target.value } })
        if (e.target.files[0] && e.target.files[0]['type'].split('/')[0] === 'image') {
            const reader = new FileReader(); reader.readAsDataURL(e.target.files[0])
            reader.onload = (event) => {
                const img = new Image(); img.src = event.target.result
                img.onload = () => {
                    const canvas = document.createElement("canvas"); let w = img.width, h = img.height
                    if (w > h) { if (w > 700) { h *= 700 / w; w = 700 } } else { if (h > 1050) { w *= 1050 / h; h = 1050 } }
                    if (w > 700) { h *= 700 / w; w = 700 }
                    canvas.width = w; canvas.height = h; canvas.getContext("2d").drawImage(img, 0, 0, w, h)
                    setSkills({ ...skills, image: canvas.toDataURL(e.target.files[0].type, 0.7) })
                }
            }
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': ['.jpeg', '.jpg', '.png'] }, multiple: true,
        onDrop: (files) => {
            Promise.all(files.map(file => new Promise((resolve) => {
                const reader = new FileReader(); reader.readAsDataURL(file)
                reader.onload = (event) => {
                    const img = new Image(); img.src = event.target.result
                    img.onload = () => {
                        const canvas = document.createElement("canvas"); let w = img.width, h = img.height
                        if (w > h) { if (w > 400) { h *= 400 / w; w = 400 } } else { if (h > 600) { w *= 600 / h; h = 600 } }
                        canvas.width = w; canvas.height = h; canvas.getContext("2d").drawImage(img, 0, 0, w, h)
                        resolve(canvas.toDataURL(file.type, 0.7))
                    }
                }
            }))).then(images => setSkills(prev => ({ ...prev, icons: prev.icons.concat(images).slice(0, 3) })))
        }
    })

    const deleteIcon = (i, item) => {
        const arr = [...skills.icons]; arr.splice(i, 1)
        if (item?.includes('https://drive.google.com')) setSkills({ ...skills, icons: arr, removed_icons: skills.removed_icons.concat(item) })
        else setSkills({ ...skills, icons: arr })
    }

    const addSkill = () => {
        if (!input.skill.skill_name || !input.skill.percentage) return
        if (skills.skill.some(s => s.skill_name === input.skill.skill_name)) return
        setSkills({ ...skills, skill: [...skills.skill, { skill_name: input.skill.skill_name, percentage: input.skill.percentage, hex: input.skill.hex || '#3b82f6' }] })
        setInput({ ...input, skill: { ...input.skill, skill_name: '', percentage: 0, hex: '#3b82f6' } })
        setShowForm(false)
    }

    const deleteSkill = (i) => {
        setSkills({ ...skills, skill: skills.skill.filter((_, idx) => idx !== i) })
        if (editingSkill === i) setEditingSkill(null)
    }

    const startEditSkill = (i) => {
        const s = skills.skill[i]
        setEditingSkill(i)
        setEditSkill({ skill_name: s.skill_name, percentage: s.percentage, hex: s.hex || '#3b82f6' })
        setShowForm(false)
    }

    const saveEditSkill = () => {
        if (!editSkill.skill_name || !editSkill.percentage) return
        setSkills({ ...skills, skill: skills.skill.map((s, i) => i === editingSkill ? { ...editSkill } : s) })
        setEditingSkill(null)
    }

    const handleSubmit = async () => {
        if (submitted) return
        setSubmitted(true)
        try {
            await dispatch(uploadSkills(skills)).unwrap()
            setSkills(prev => ({ ...prev, image: '', removed_icons: [] }))
            setInput(prev => ({ ...prev, skill: { ...prev.skill, image: '' } }))
        } catch {
            setSubmitted(false)
        }
    }

    const fileInputCls = `block w-full text-sm border border-solid rounded-lg cursor-pointer ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#1a1a1a] border-[#333] text-gray-300'}`

    return (
        <div className="space-y-4">
            {/* Summary Card */}
            <div className={`${card} overflow-hidden`}>
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            skills.skill.length > 0 ? (isLight ? 'bg-emerald-100' : 'bg-emerald-900/30') : (isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]')
                        }`}>
                            <FontAwesomeIcon icon={faLaptopCode} className={`text-2xl ${
                                skills.skill.length > 0 ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : (isLight ? 'text-slate-300' : 'text-gray-600')
                            }`} />
                        </div>
                        <div className="min-w-0">
                            <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                {skills.skill.length > 0 ? `${skills.skill.length} Skill${skills.skill.length === 1 ? '' : 's'}` : 'No Skills Yet'}
                            </h3>
                            <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                {skills.heading || 'Add a heading and skills to showcase your expertise'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:flex-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${
                            skills.heading ? (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400') : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#1a1a1a] text-gray-600')
                        }`}>
                            <FontAwesomeIcon icon={skills.heading ? faCircleCheck : faCircleXmark} className="text-[9px]" /> Heading
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${
                            skills.skill.length > 0 ? (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400') : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#1a1a1a] text-gray-600')
                        }`}>
                            <FontAwesomeIcon icon={skills.skill.length > 0 ? faCircleCheck : faCircleXmark} className="text-[9px]" /> Skills
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${
                            skills.icons.length > 0 ? (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400') : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#1a1a1a] text-gray-600')
                        }`}>
                            <FontAwesomeIcon icon={skills.icons.length > 0 ? faCircleCheck : faCircleXmark} className="text-[9px]" /> Icons
                        </span>
                    </div>
                </div>
            </div>

            {/* Details Card */}
            <div className={`${card} overflow-hidden`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-emerald-100' : 'bg-emerald-900/30'}`}>
                            <FontAwesomeIcon icon={faLaptopCode} className={`text-sm ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Skillset Details</h3>
                    </div>
                    {input.display_image && (
                        <button onClick={() => window.open(input.display_image, '_blank')}
                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isLight ? 'text-slate-500 hover:bg-slate-50' : 'text-gray-400 hover:bg-[#1a1a1a]'}`}>
                            <FontAwesomeIcon icon={faEye} className="text-[10px]" /> View Image
                        </button>
                    )}
                </div>

                <div className={`px-4 sm:px-5 py-4 ${isLight ? 'bg-slate-50/50' : 'bg-[#111]'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className={labelCls}>Upload Picture</label>
                            <input className={fileInputCls} type="file" accept="image/*" onChange={convertImage} value={input.skill.image} />
                        </div>
                        <div>
                            <label className={labelCls}>Heading</label>
                            <input type="text" className={inputCls} onChange={(e) => setSkills({ ...skills, heading: e.target.value })} value={skills.heading} placeholder="My Expertise" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Projects Completed</label>
                            <input type="number" className={inputCls} onChange={(e) => setSkills({ ...skills, project_completed: e.target.value })} value={skills.project_completed} />
                        </div>
                        <div>
                            <label className={labelCls}>Description</label>
                            <textarea rows="3" className={inputCls} onChange={(e) => setSkills({ ...skills, description: e.target.value })} value={skills.description} placeholder="Describe your skills..." />
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills List Card */}
            <div className={`${card} overflow-hidden`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                            <FontAwesomeIcon icon={faLaptopCode} className={`text-sm ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Skills ({skills.skill.length})</h3>
                    </div>
                    <button onClick={() => { setShowForm(!showForm); setEditingSkill(null) }}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${showForm
                            ? (isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#1f1f1f] text-gray-400')
                            : (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                        }`}>
                        <FontAwesomeIcon icon={showForm ? faTimes : faPlus} className="text-[10px]" />
                        {showForm ? 'Cancel' : 'Add Skill'}
                    </button>
                </div>

                {/* Add Form */}
                {showForm && (
                    <div className={`px-4 sm:px-5 py-4 border-b border-solid ${isLight ? 'bg-slate-50/50 border-slate-100' : 'bg-[#111] border-[#1f1f1f]'}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className={labelCls}>Skill Name <span className="text-red-400">*</span></label>
                                <input type="text" className={inputCls} placeholder="e.g. React, Node.js" value={input.skill.skill_name}
                                    onChange={(e) => setInput({ ...input, skill: { ...input.skill, skill_name: e.target.value } })}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} />
                                {input.skill.skill_name && skills.skill.some(s => s.skill_name === input.skill.skill_name) && (
                                    <p className="text-[11px] mt-1 text-red-500">This skill already exists</p>
                                )}
                            </div>
                            <div>
                                <label className={labelCls}>Percentage <span className="text-red-400">*</span></label>
                                <input type="number" min="0" max="100" className={inputCls} placeholder="0-100" value={input.skill.percentage}
                                    onChange={(e) => setInput({ ...input, skill: { ...input.skill, percentage: Math.min(100, Math.max(0, e.target.value)) } })} />
                            </div>
                            <div>
                                <label className={labelCls}>Color</label>
                                <ColorPicker value={input.skill.hex} onChange={(v) => setInput({ ...input, skill: { ...input.skill, hex: v } })} isLight={isLight} />
                            </div>
                        </div>
                        <div className="flex justify-end mt-3">
                            <button onClick={addSkill} className={btnPrimary} disabled={!input.skill.skill_name || !input.skill.percentage || skills.skill.some(s => s.skill_name === input.skill.skill_name)}>
                                <FontAwesomeIcon icon={faPlus} className="mr-1.5 text-xs" /> Add Skill
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit Form */}
                {editingSkill !== null && (
                    <div className={`px-4 sm:px-5 py-4 border-b border-solid ${isLight ? 'bg-amber-50/50 border-amber-200/50' : 'bg-amber-900/10 border-amber-800/30'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>Editing Skill</p>
                            <button onClick={() => setEditingSkill(null)} className={`text-xs font-medium ${isLight ? 'text-slate-500 hover:text-slate-700' : 'text-gray-400 hover:text-gray-200'}`}>Cancel</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className={labelCls}>Skill Name <span className="text-red-400">*</span></label>
                                <input type="text" className={inputCls} value={editSkill.skill_name}
                                    onChange={(e) => setEditSkill({ ...editSkill, skill_name: e.target.value })}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveEditSkill() } }} />
                            </div>
                            <div>
                                <label className={labelCls}>Percentage <span className="text-red-400">*</span></label>
                                <input type="number" min="0" max="100" className={inputCls} value={editSkill.percentage}
                                    onChange={(e) => setEditSkill({ ...editSkill, percentage: Math.min(100, Math.max(0, e.target.value)) })} />
                            </div>
                            <div>
                                <label className={labelCls}>Color</label>
                                <ColorPicker value={editSkill.hex} onChange={(v) => setEditSkill({ ...editSkill, hex: v })} isLight={isLight} />
                            </div>
                        </div>
                        <div className="flex justify-end mt-3">
                            <button onClick={saveEditSkill} className={btnPrimary}>
                                <FontAwesomeIcon icon={faCheck} className="mr-1.5 text-xs" /> Update
                            </button>
                        </div>
                    </div>
                )}

                {/* Skills Display */}
                {skills.skill.length > 0 ? (
                    <div className="px-4 sm:px-5 py-3">
                        {skills.skill.map((s, i) => (
                            <div key={i} className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                                editingSkill === i
                                    ? (isLight ? 'bg-amber-50' : 'bg-amber-900/10')
                                    : (isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]')
                            } ${i > 0 ? `border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}` : ''}`}>
                                <div className="w-3 h-3 rounded-full flex-shrink-0 border border-solid" style={{ backgroundColor: s.hex || '#3b82f6', borderColor: s.hex || '#3b82f6' }} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{s.skill_name}</p>
                                        <span className={`text-[10px] font-bold ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{s.percentage}%</span>
                                    </div>
                                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.percentage}%`, backgroundColor: s.hex || '#3b82f6' }} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEditSkill(i)}
                                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-slate-400 hover:text-blue-500 hover:bg-blue-50' : 'text-gray-500 hover:text-blue-400 hover:bg-blue-900/20'}`}>
                                        <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                    </button>
                                    <button onClick={() => deleteSkill(i)}
                                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-900/20'}`}>
                                        <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`flex flex-col items-center justify-center py-10 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                            <FontAwesomeIcon icon={faLaptopCode} className="text-lg" />
                        </div>
                        <p className="text-xs font-medium">No skills added yet</p>
                        <p className="text-[11px] mt-0.5">Click "Add Skill" to get started</p>
                    </div>
                )}
            </div>

            {/* Icons Card */}
            <div className={`${card} overflow-hidden`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-amber-100' : 'bg-amber-900/30'}`}>
                            <FontAwesomeIcon icon={faImage} className={`text-sm ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>App Icons ({skills.icons.length}/3)</h3>
                    </div>
                </div>
                <div className={`px-4 sm:px-5 py-4 ${isLight ? 'bg-slate-50/50' : 'bg-[#111]'}`}>
                    <div {...getRootProps()} className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDragActive
                        ? (isLight ? 'border-blue-400 bg-blue-50' : 'border-blue-500 bg-blue-900/20')
                        : (isLight ? 'border-slate-300 bg-white hover:bg-slate-50' : 'border-[#333] bg-[#0e0e0e] hover:bg-[#1a1a1a]')
                    }`}>
                        <input accept="image/*" {...getInputProps()} />
                        <p className={`text-xs text-center ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isDragActive ? 'Drop here' : 'Click or drag icons (max 3)'}</p>
                    </div>
                    <div className="flex gap-3 mt-3">
                        {(skills.icons.length > 0 ? skills.icons.slice(0, 3) : [null, null, null]).map((icon, i) => (
                            <div key={i} className={`relative w-16 h-16 rounded-lg flex items-center justify-center border-2 border-dashed ${isLight ? 'border-slate-300 bg-white' : 'border-[#333] bg-[#0e0e0e]'}`}>
                                {icon ? (
                                    <>
                                        <img className="w-full h-full object-cover rounded-lg" src={icon} alt="icon" />
                                        <button onClick={() => deleteIcon(i, icon)} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                                            <FontAwesomeIcon icon={faClose} className="text-[8px]" />
                                        </button>
                                    </>
                                ) : <p className={`text-[9px] text-center font-medium ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>#{i + 1}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button onClick={handleSubmit} disabled={submitted} className={`${btnPrimary} disabled:opacity-50 flex items-center gap-2`}>
                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                    {!submitted ? "Save Skills" : <span className="flex items-center gap-2">Saving<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
                </button>
            </div>
        </div>
    )
}

export default Skills
