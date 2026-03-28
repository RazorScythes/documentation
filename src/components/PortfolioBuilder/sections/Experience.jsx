import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClose, faPlus, faBriefcase, faTimes, faCheck, faTrash, faPen } from "@fortawesome/free-solid-svg-icons"
import { addExperience, updateExperience, clearAlert } from "../../../actions/portfolio"
import { useDispatch, useSelector } from 'react-redux'

const Experience = ({ user, portfolio, isLight, card, inputCls, btnPrimary, btnSecondary, labelCls }) => {
    const dispatch = useDispatch()

    const [removeImage, setRemoveImage] = useState([])
    const [submitted, setSubmitted] = useState({ add: false, update: false })
    const [disable, setDisable] = useState({ add: false, update: false })
    const [update, setUpdate] = useState({ show: false, updating: false })
    const [showForm, setShowForm] = useState(false)
    const [editingIndex, setEditingIndex] = useState(null)

    const [experience, setExperience] = useState([])
    const [input, setInput] = useState({
        image_overlay: '', company_logo: '',
        company_name: '', year_start: '', year_end: '', position: '',
        company_location: '', remote_work: false, link: '', description: ''
    })
    const [addInput, setAddInput] = useState({ image_overlay: '', company_logo: '' })

    useEffect(() => {
        setSubmitted({ add: false, update: false }); setDisable({ add: false, update: false })
        setExperience(portfolio ? portfolio : [])
        setUpdate({ show: false, updating: false }); setRemoveImage([])
        resetForm()
        setEditingIndex(null)
    }, [portfolio])

    const resetForm = () => {
        setInput({ image_overlay: '', company_logo: '', company_name: '', year_start: '', year_end: '', position: '', company_location: '', remote_work: false, link: '', description: '' })
        setAddInput({ image_overlay: '', company_logo: '' })
    }

    const convertImageOverlay = (e) => {
        setAddInput({ ...addInput, image_overlay: e.target.value })
        if (e.target.files[0]?.type?.startsWith('image')) {
            const reader = new FileReader(); reader.readAsDataURL(e.target.files[0])
            reader.onload = () => setInput(prev => ({ ...prev, image_overlay: reader.result }))
        }
    }

    const convertImageLogo = (e) => {
        setAddInput({ ...addInput, company_logo: e.target.value })
        if (e.target.files[0]?.type?.startsWith('image')) {
            const reader = new FileReader(); reader.readAsDataURL(e.target.files[0])
            reader.onload = () => setInput(prev => ({ ...prev, company_logo: reader.result }))
        }
    }

    const deleteExperience = (i) => {
        const arr = [...experience]; let rm = []
        if (arr[i].image_overlay?.includes('https://drive.google.com')) rm.push(arr[i].image_overlay)
        if (arr[i].company_logo?.includes('https://drive.google.com')) rm.push(arr[i].company_logo)
        if (rm.length) setRemoveImage(prev => [...prev, ...rm])
        arr.splice(i, 1); setExperience(arr); setUpdate({ ...update, show: true })
        if (editingIndex === i) { setEditingIndex(null); resetForm() }
    }

    const startEdit = (i) => {
        const e = experience[i]
        setEditingIndex(i)
        setInput({
            image_overlay: '', company_logo: '',
            company_name: e.company_name || '', year_start: e.year_start || '', year_end: e.year_end || '',
            position: e.position || '', company_location: e.company_location || '',
            remote_work: e.remote_work || false, link: e.link || '', description: e.description || ''
        })
        setAddInput({ image_overlay: '', company_logo: '' })
        setShowForm(true)
    }

    const applyEdit = () => {
        if (!input.company_name || !input.year_start || !input.position) return
        const arr = [...experience]
        arr[editingIndex] = {
            ...arr[editingIndex],
            company_name: input.company_name, year_start: input.year_start, year_end: input.year_end,
            position: input.position, company_location: input.company_location,
            remote_work: input.remote_work, link: input.link, description: input.description,
            ...(input.image_overlay ? { image_overlay: input.image_overlay } : {}),
            ...(input.company_logo ? { company_logo: input.company_logo } : {}),
        }
        setExperience(arr)
        setUpdate({ ...update, show: true })
        setEditingIndex(null)
        resetForm()
        setShowForm(false)
    }

    const cancelEdit = () => {
        setEditingIndex(null)
        resetForm()
        setShowForm(false)
    }

    const handleAdd = () => {
        if (!input.company_name || !input.year_start || !input.position) return
        if (!submitted.add) { dispatch(addExperience(input)); setDisable({ ...disable, update: true }); setSubmitted({ ...submitted, add: true }) }
    }

    const handleUpdate = () => {
        dispatch(updateExperience({ data: experience, removeImage }))
        setUpdate({ ...update, updating: true }); setDisable({ ...disable, add: true }); setRemoveImage([])
    }

    const fileInputCls = `block w-full text-sm border border-solid rounded-lg cursor-pointer ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#1a1a1a] border-[#333] text-gray-300'}`

    return (
        <div className="space-y-4">
            {/* Experience List Card */}
            <div className={`${card} overflow-hidden`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-amber-100' : 'bg-amber-900/30'}`}>
                            <FontAwesomeIcon icon={faBriefcase} className={`text-sm ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Experience ({experience.length})</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {update.show && (
                            <button disabled={disable.update} onClick={handleUpdate}
                                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isLight ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white'} disabled:opacity-50`}>
                                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                {!update.updating ? "Save Changes" : <span className="flex items-center gap-1">Updating<span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
                            </button>
                        )}
                        <button onClick={() => { if (editingIndex !== null) cancelEdit(); else { setShowForm(!showForm); resetForm() } }}
                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${showForm && editingIndex === null
                                ? (isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#1f1f1f] text-gray-400')
                                : (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                            }`}>
                            <FontAwesomeIcon icon={showForm && editingIndex === null ? faTimes : faPlus} className="text-[10px]" />
                            {showForm && editingIndex === null ? 'Cancel' : 'Add New'}
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className={`px-4 sm:px-5 py-4 border-b border-solid ${editingIndex !== null
                        ? (isLight ? 'bg-amber-50/50 border-amber-200/50' : 'bg-amber-900/10 border-amber-800/30')
                        : (isLight ? 'bg-slate-50/50 border-slate-100' : 'bg-[#111] border-[#1f1f1f]')
                    }`}>
                        {editingIndex !== null && (
                            <div className="flex items-center justify-between mb-3">
                                <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>Editing: {experience[editingIndex]?.company_name}</p>
                                <button onClick={cancelEdit} className={`text-xs font-medium ${isLight ? 'text-slate-500 hover:text-slate-700' : 'text-gray-400 hover:text-gray-200'}`}>Cancel</button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className={labelCls}>Background Image (optional)</label>
                                <input className={fileInputCls} type="file" accept="image/*" value={addInput.image_overlay} onChange={convertImageOverlay} />
                            </div>
                            <div>
                                <label className={labelCls}>Company Logo</label>
                                <input className={fileInputCls} type="file" accept="image/*" value={addInput.company_logo} onChange={convertImageLogo} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className={labelCls}>Company Name</label>
                                <input type="text" className={inputCls} value={input.company_name} onChange={(e) => setInput({ ...input, company_name: e.target.value })} placeholder="Company name" />
                            </div>
                            <div>
                                <label className={labelCls}>Position</label>
                                <input type="text" className={inputCls} value={input.position} onChange={(e) => setInput({ ...input, position: e.target.value })} placeholder="Your role" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <div>
                                <label className={labelCls}>Year Start</label>
                                <input type="date" className={inputCls} value={input.year_start} onChange={(e) => setInput({ ...input, year_start: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Year End</label>
                                <input type="date" className={inputCls} value={input.year_end} onChange={(e) => setInput({ ...input, year_end: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Location</label>
                                <input type="text" className={inputCls} value={input.company_location} onChange={(e) => setInput({ ...input, company_location: e.target.value })} placeholder="City, Country" />
                            </div>
                            <div>
                                <label className={labelCls}>Website</label>
                                <input type="text" className={inputCls} value={input.link} onChange={(e) => setInput({ ...input, link: e.target.value })} placeholder="https://..." />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                            <input type="checkbox" checked={input.remote_work} onChange={() => setInput({ ...input, remote_work: !input.remote_work })} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Remote Work</span>
                        </label>
                        <div className="mb-3">
                            <label className={labelCls}>Description / Responsibilities (optional)</label>
                            <textarea className={`${inputCls} resize-none`} rows="3" value={input.description} onChange={(e) => setInput({ ...input, description: e.target.value })} placeholder="Describe your key responsibilities..." />
                        </div>
                        <div className="flex justify-end gap-2">
                            {editingIndex !== null ? (
                                <>
                                    <button onClick={cancelEdit} className={btnSecondary}>Cancel</button>
                                    <button onClick={applyEdit} className={btnPrimary}>
                                        <FontAwesomeIcon icon={faCheck} className="mr-1.5 text-xs" /> Update
                                    </button>
                                </>
                            ) : (
                                <button disabled={disable.add} onClick={handleAdd} className={`${btnPrimary} disabled:opacity-50`}>
                                    <FontAwesomeIcon icon={faPlus} className="mr-1.5 text-xs" />
                                    {!submitted.add ? "Add Experience" : <span className="flex items-center gap-2">Saving<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {experience.length > 0 ? (
                    <div className="px-4 sm:px-5 py-3">
                        {experience.map((e, i) => (
                            <div key={i} className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                                editingIndex === i
                                    ? (isLight ? 'bg-amber-50' : 'bg-amber-900/10')
                                    : (isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]')
                            } ${i > 0 ? `border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}` : ''}`}>
                                {e.company_logo ? (
                                    <img src={e.company_logo} className={`w-9 h-9 rounded-lg object-cover flex-shrink-0 ${isLight ? 'border border-slate-200' : 'border border-[#333]'}`} alt="" />
                                ) : (
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-900/20 text-amber-400'}`}>
                                        <FontAwesomeIcon icon={faBriefcase} className="text-base" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{e.position}</p>
                                    <p className={`text-xs mt-0.5 truncate ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {e.company_name}{e.company_location ? ` · ${e.company_location}` : ''}{e.remote_work ? ' · Remote' : ''}
                                    </p>
                                </div>
                                <span className={`text-[11px] font-medium flex-shrink-0 hidden sm:block ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {e.year_start?.split('-')[0]} – {e.year_end?.split('-')[0] || 'Present'}
                                </span>
                                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(i)}
                                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-slate-400 hover:text-blue-500 hover:bg-blue-50' : 'text-gray-500 hover:text-blue-400 hover:bg-blue-900/20'}`}>
                                        <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                    </button>
                                    <button onClick={() => deleteExperience(i)}
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
                            <FontAwesomeIcon icon={faBriefcase} className="text-lg" />
                        </div>
                        <p className="text-xs font-medium">No experience added yet</p>
                        <p className="text-[11px] mt-0.5">Click "Add New" to get started</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Experience
