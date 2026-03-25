import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faClose, faPlus, faProjectDiagram, faTimes, faCheck, faImage, faFileAlt, faPen, faCode, faCalendarAlt } from "@fortawesome/free-solid-svg-icons"
import { addProject, updateProject, deleteProject, clearAlert } from "../../../actions/portfolio"
import { useDispatch, useSelector } from 'react-redux'

const Projects = ({ user, portfolio, isLight, card, inputCls, btnPrimary, btnSecondary, labelCls }) => {
    const dispatch = useDispatch()

    const [projectData, setProjectData] = useState([])
    const emptyProject = {
        image: '', show_image: true, project_name: '', project_description: '',
        date_started: '', date_accomplished: '', created_for: '', category: '', text: [], list: [], gallery: []
    }
    const [project, setProject] = useState({ ...emptyProject })

    const [removeImage, setRemoveImage] = useState([])
    const [disable, setDisable] = useState({ add: false, update: false })
    const [submitted, setSubmitted] = useState({ add: false, update: false })
    const [update, setUpdate] = useState({ show: false, updating: false })
    const [showForm, setShowForm] = useState(false)
    const [showTextForm, setShowTextForm] = useState(false)
    const [editingIndex, setEditingIndex] = useState(null)
    const [input, setInput] = useState({ gallery: '', text_heading: '', text_imageURL: '', text_description: '', featured_image: '' })
    const [addInput, setAddInput] = useState({ image_overlay: '' })

    useEffect(() => {
        setSubmitted({ add: false, update: false }); setDisable({ add: false, update: false })
        setProjectData(portfolio || []); setUpdate({ show: false, updating: false }); setRemoveImage([])
        resetForm()
        setEditingIndex(null)
    }, [portfolio])

    const resetForm = () => {
        setInput({ gallery: '', text_heading: '', text_imageURL: '', text_description: '', featured_image: '' })
        setProject({ ...emptyProject })
        setAddInput({ image_overlay: '' })
        setShowTextForm(false)
    }

    const convertImage = (e) => {
        setAddInput({ ...addInput, image_overlay: e.target.value })
        if (e.target.files[0]?.type?.startsWith('image')) {
            const reader = new FileReader(); reader.readAsDataURL(e.target.files[0])
            reader.onload = () => setProject(prev => ({ ...prev, image: reader.result }))
        }
    }

    const handleSubmit = () => {
        if (!project.project_name || !project.project_description || !project.date_accomplished || !project.date_started || !project.created_for || !project.category) return
        if (!submitted.add) { dispatch(addProject(project)); setDisable({ ...disable, update: true }); setSubmitted({ ...submitted, add: true }) }
    }

    const removeProjectItem = (i) => {
        const arr = [...projectData]; let rm = []
        if (arr[i].image?.includes('https://drive.google.com')) rm.push(arr[i].image)
        if (rm.length) setRemoveImage(prev => [...prev, ...rm])
        arr.splice(i, 1); setProjectData(arr); setUpdate({ ...update, show: true })
        if (editingIndex === i) { setEditingIndex(null); resetForm(); setShowForm(false) }
    }

    const handleSaveChanges = () => {
        dispatch(updateProject({ data: projectData, removeImage }))
        setUpdate({ ...update, updating: true }); setDisable({ ...disable, add: true }); setRemoveImage([])
    }

    const startEdit = (i) => {
        const p = projectData[i]
        setEditingIndex(i)
        setProject({
            image: '', show_image: p.show_image !== false,
            project_name: p.project_name || '', project_description: p.project_description || '',
            date_started: p.date_started ? p.date_started.split('T')[0] : '',
            date_accomplished: p.date_accomplished ? p.date_accomplished.split('T')[0] : '',
            created_for: p.created_for || '', category: p.category || '',
            text: p.text || [], list: p.list || [], gallery: p.gallery || []
        })
        setAddInput({ image_overlay: '' })
        setInput({ gallery: '', text_heading: '', text_imageURL: '', text_description: '', featured_image: '' })
        setShowForm(true)
    }

    const applyEdit = () => {
        if (!project.project_name || !project.project_description || !project.category) return
        const arr = [...projectData]
        arr[editingIndex] = {
            ...arr[editingIndex],
            show_image: project.show_image,
            project_name: project.project_name, project_description: project.project_description,
            date_started: project.date_started, date_accomplished: project.date_accomplished,
            created_for: project.created_for, category: project.category,
            text: project.text, list: project.list, gallery: project.gallery,
            ...(project.image ? { image: project.image } : {}),
        }
        setProjectData(arr)
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

    const addAdditionalText = () => {
        if (!input.text_description) return
        setProject({ ...project, text: [...project.text, { text_heading: input.text_heading, text_imageURL: input.text_imageURL, text_description: input.text_description }] })
        setInput({ ...input, text_heading: '', text_imageURL: '', text_description: '' })
        setShowTextForm(false)
    }

    const deleteAdditionalText = (i) => { const arr = [...project.text]; arr.splice(i, 1); setProject({ ...project, text: arr }) }

    const addImageURL = () => {
        if (!input.gallery?.startsWith("https://")) return
        if (project.gallery.includes(input.gallery)) return
        setProject({ ...project, gallery: [...project.gallery, input.gallery] })
        setInput({ ...input, gallery: '' })
    }

    const deleteImageURL = (i) => { const arr = [...project.gallery]; arr.splice(i, 1); setProject({ ...project, gallery: arr }) }

    const fileInputCls = `block w-full text-sm border border-solid rounded-lg cursor-pointer ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#1a1a1a] border-[#333] text-gray-300'}`

    const isEditing = editingIndex !== null

    return (
        <div className="space-y-4">
            {/* Project List Card */}
            <div className={`${card} overflow-hidden`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                            <FontAwesomeIcon icon={faProjectDiagram} className={`text-sm ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Projects ({projectData.length})</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {update.show && (
                            <button disabled={disable.update} onClick={handleSaveChanges}
                                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isLight ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white'} disabled:opacity-50`}>
                                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                {!update.updating ? "Save Changes" : <span className="flex items-center gap-1">Updating<span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
                            </button>
                        )}
                    </div>
                </div>

                {projectData.length > 0 ? (
                    <div className="px-4 sm:px-5 py-3">
                        {projectData.map((p, i) => (
                            <div key={i} className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                                editingIndex === i
                                    ? (isLight ? 'bg-amber-50' : 'bg-amber-900/10')
                                    : (isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]')
                            } ${i > 0 ? `border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}` : ''}`}>
                                {p.image ? (
                                    <img src={p.image} alt="" className={`w-9 h-9 rounded-lg object-cover flex-shrink-0 ${isLight ? 'border border-slate-200' : 'border border-[#333]'}`} />
                                ) : (
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/20 text-blue-400'}`}>
                                        <FontAwesomeIcon icon={faCode} className="text-base" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{p.project_name}</p>
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400'}`}>{p.category || '—'}</span>
                                    </div>
                                    <p className={`text-xs mt-0.5 truncate ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {p.project_description}
                                    </p>
                                </div>
                                <span className={`text-[11px] font-medium flex-shrink-0 hidden sm:block ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {p.date_started?.split('T')[0]?.split('-')[0] || ''}{p.date_started ? ' – ' : ''}{p.date_accomplished?.split('T')[0]?.split('-')[0] || (p.date_started ? 'Present' : '')}
                                </span>
                                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(i)}
                                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-slate-400 hover:text-blue-500 hover:bg-blue-50' : 'text-gray-500 hover:text-blue-400 hover:bg-blue-900/20'}`}>
                                        <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                    </button>
                                    <button onClick={() => removeProjectItem(i)}
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
                            <FontAwesomeIcon icon={faProjectDiagram} className="text-lg" />
                        </div>
                        <p className="text-xs font-medium">No projects added yet</p>
                        <p className="text-[11px] mt-0.5">Expand the form below to add your first project</p>
                    </div>
                )}
            </div>

            {/* Add / Edit Project Card */}
            <div className={`${card} overflow-hidden`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                        {isEditing ? (
                            <><span className={isLight ? 'text-amber-600' : 'text-amber-400'}>Edit:</span> {projectData[editingIndex]?.project_name}</>
                        ) : 'Add New Project'}
                    </h3>
                    <button onClick={() => {
                        if (isEditing) cancelEdit()
                        else { setShowForm(!showForm); if (showForm) resetForm() }
                    }}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${showForm
                            ? (isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#1f1f1f] text-gray-400')
                            : (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                        }`}>
                        <FontAwesomeIcon icon={showForm ? faTimes : faPlus} className="text-[10px]" />
                        {showForm ? (isEditing ? 'Cancel Edit' : 'Collapse') : 'Expand'}
                    </button>
                </div>

                {showForm && (
                    <>
                        <div className={`px-4 sm:px-5 py-4 ${isEditing
                            ? (isLight ? 'bg-amber-50/50' : 'bg-amber-900/10')
                            : (isLight ? 'bg-slate-50/50' : 'bg-[#111]')
                        }`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className={labelCls}>{isEditing ? 'Replace Image (optional)' : 'Featured Image'}</label>
                                    <input className={fileInputCls} type="file" accept="image/*" value={addInput.image_overlay} onChange={convertImage} />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={project.show_image} onChange={() => setProject({ ...project, show_image: !project.show_image })} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Show Image</span>
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className={labelCls}>Project Name</label>
                                    <input type="text" className={inputCls} value={project.project_name} onChange={(e) => setProject({ ...project, project_name: e.target.value })} placeholder="Project name" />
                                </div>
                                <div>
                                    <label className={labelCls}>Category</label>
                                    <input type="text" className={inputCls} value={project.category} onChange={(e) => setProject({ ...project, category: e.target.value })} placeholder="Web / Mobile / etc." />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className={labelCls}>Description</label>
                                <textarea rows="3" className={inputCls} value={project.project_description} onChange={(e) => setProject({ ...project, project_description: e.target.value })} placeholder="Describe the project..." />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className={labelCls}>Date Started</label>
                                    <input type="date" className={inputCls} value={project.date_started} onChange={(e) => setProject({ ...project, date_started: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>Date Accomplished</label>
                                    <input type="date" className={inputCls} value={project.date_accomplished} onChange={(e) => setProject({ ...project, date_accomplished: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>Created For</label>
                                    <input type="text" className={inputCls} value={project.created_for} onChange={(e) => setProject({ ...project, created_for: e.target.value })} placeholder="Client / personal" />
                                </div>
                            </div>
                        </div>

                        {/* Additional Text Section */}
                        <div className={`border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                            <div className={`flex items-center justify-between px-5 py-3 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faFileAlt} className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                                    <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Additional Text ({project.text.length})</span>
                                </div>
                                <button onClick={() => setShowTextForm(!showTextForm)}
                                    className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-all ${isLight ? 'text-blue-600 hover:bg-blue-50' : 'text-blue-400 hover:bg-blue-900/20'}`}>
                                    <FontAwesomeIcon icon={showTextForm ? faTimes : faPlus} className="text-[8px]" />
                                    {showTextForm ? 'Cancel' : 'Add'}
                                </button>
                            </div>

                            {showTextForm && (
                                <div className={`px-4 sm:px-5 py-3 border-b border-solid ${isLight ? 'bg-slate-50/50 border-slate-100' : 'bg-[#111] border-[#1f1f1f]'}`}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                                        <div><label className={labelCls}>Heading</label><input type="text" className={inputCls} value={input.text_heading} onChange={(e) => setInput({ ...input, text_heading: e.target.value })} /></div>
                                        <div><label className={labelCls}>Image URL (optional)</label><input type="text" className={inputCls} value={input.text_imageURL} onChange={(e) => setInput({ ...input, text_imageURL: e.target.value })} /></div>
                                    </div>
                                    <div className="mb-2"><label className={labelCls}>Description</label><textarea rows="2" className={inputCls} value={input.text_description} onChange={(e) => setInput({ ...input, text_description: e.target.value })} /></div>
                                    <div className="flex justify-end">
                                        <button onClick={addAdditionalText} className={`${btnSecondary} text-xs`}>
                                            <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Text
                                        </button>
                                    </div>
                                </div>
                            )}

                            {project.text.map((t, i) => (
                                <div key={i} className={`flex items-center gap-3 px-5 py-2.5 border-b border-solid ${isLight ? 'border-slate-50' : 'border-[#1a1a1a]'}`}>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{t.text_heading || 'No Heading'}</p>
                                        <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{t.text_description}</p>
                                    </div>
                                    <button onClick={() => deleteAdditionalText(i)} className={`w-6 h-6 rounded-md flex items-center justify-center ${isLight ? 'hover:bg-red-50 text-slate-400 hover:text-red-500' : 'hover:bg-red-900/20 text-gray-500 hover:text-red-400'}`}>
                                        <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Gallery Section */}
                        <div className={`border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                            <div className={`flex items-center justify-between px-5 py-3 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faImage} className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                                    <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Gallery ({project.gallery.length})</span>
                                </div>
                            </div>
                            <div className={`px-4 sm:px-5 py-3 ${isLight ? 'bg-slate-50/50' : 'bg-[#111]'}`}>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" className={inputCls} value={input.gallery} onChange={(e) => setInput({ ...input, gallery: e.target.value })} placeholder="https://image-url..."
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImageURL() } }} />
                                    <button onClick={addImageURL} className={`flex items-center gap-1 text-xs font-medium px-3 rounded-lg transition-all flex-shrink-0 ${isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}`}>
                                        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                                    </button>
                                </div>
                                {project.gallery.map((g, i) => (
                                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-sm ${isLight ? 'bg-white border border-slate-200/80 text-slate-600' : 'bg-[#0e0e0e] border border-[#2B2B2B] text-gray-400'}`}>
                                        <span className="truncate flex-1 text-xs">{g}</span>
                                        <button onClick={() => deleteImageURL(i)} className={`text-xs flex-shrink-0 ${isLight ? 'text-rose-500' : 'text-red-400'}`}><FontAwesomeIcon icon={faTrash} className="text-[10px]" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className={`px-5 py-3 border-t border-solid flex justify-end gap-2 ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                            {isEditing ? (
                                <>
                                    <button onClick={cancelEdit} className={btnSecondary}>Cancel</button>
                                    <button onClick={applyEdit} className={`${btnPrimary} flex items-center gap-2`}>
                                        <FontAwesomeIcon icon={faCheck} className="text-xs" /> Update Project
                                    </button>
                                </>
                            ) : (
                                <button disabled={disable.add} onClick={handleSubmit} className={`${btnPrimary} disabled:opacity-50 flex items-center gap-2`}>
                                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                    {!submitted.add ? "Add Project" : <span className="flex items-center gap-2">Saving<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Projects
