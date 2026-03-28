import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faTimes, faCheck, faTrash, faPen, faLanguage } from "@fortawesome/free-solid-svg-icons"
import { uploadLanguages } from "../../../actions/portfolio"
import { useDispatch } from 'react-redux'

const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Beginner']

const Languages = ({ user, portfolio, isLight, card, inputCls, btnPrimary, btnSecondary, labelCls }) => {
    const dispatch = useDispatch()

    const [submitted, setSubmitted] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingIndex, setEditingIndex] = useState(null)
    const [languages, setLanguages] = useState([])
    const [changed, setChanged] = useState(false)

    const [input, setInput] = useState({ language: '', proficiency: 'Intermediate' })

    useEffect(() => {
        setLanguages(portfolio ? portfolio : [])
        setSubmitted(false)
        setChanged(false)
        resetForm()
        setEditingIndex(null)
    }, [portfolio])

    const resetForm = () => setInput({ language: '', proficiency: 'Intermediate' })

    const deleteItem = (i) => {
        const arr = [...languages]
        arr.splice(i, 1)
        setLanguages(arr)
        setChanged(true)
        if (editingIndex === i) { setEditingIndex(null); resetForm() }
    }

    const startEdit = (i) => {
        const l = languages[i]
        setEditingIndex(i)
        setInput({ language: l.language || '', proficiency: l.proficiency || 'Intermediate' })
        setShowForm(true)
    }

    const applyEdit = () => {
        if (!input.language) return
        const arr = [...languages]
        arr[editingIndex] = { ...input }
        setLanguages(arr)
        setChanged(true)
        setEditingIndex(null)
        resetForm()
        setShowForm(false)
    }

    const cancelEdit = () => {
        setEditingIndex(null)
        resetForm()
        setShowForm(false)
    }

    const addItem = () => {
        if (!input.language) return
        setLanguages([...languages, { ...input }])
        setChanged(true)
        resetForm()
        setShowForm(false)
    }

    const handleSave = () => {
        if (submitted) return
        dispatch(uploadLanguages({ languages }))
        setSubmitted(true)
    }

    const profColor = (p) => {
        const map = { Native: 'emerald', Fluent: 'blue', Advanced: 'indigo', Intermediate: 'amber', Beginner: 'slate' }
        return map[p] || 'slate'
    }

    return (
        <div className="space-y-4">
            <div className={`${card} overflow-hidden`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-teal-100' : 'bg-teal-900/30'}`}>
                            <FontAwesomeIcon icon={faLanguage} className={`text-sm ${isLight ? 'text-teal-600' : 'text-teal-400'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Languages ({languages.length})</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {changed && (
                            <button disabled={submitted} onClick={handleSave}
                                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isLight ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white'} disabled:opacity-50`}>
                                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                {!submitted ? "Save Changes" : <span className="flex items-center gap-1">Saving<span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
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
                        ? (isLight ? 'bg-teal-50/50 border-teal-200/50' : 'bg-teal-900/10 border-teal-800/30')
                        : (isLight ? 'bg-slate-50/50 border-slate-100' : 'bg-[#111] border-[#1f1f1f]')
                    }`}>
                        {editingIndex !== null && (
                            <div className="flex items-center justify-between mb-3">
                                <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-teal-600' : 'text-teal-400'}`}>Editing: {languages[editingIndex]?.language}</p>
                                <button onClick={cancelEdit} className={`text-xs font-medium ${isLight ? 'text-slate-500 hover:text-slate-700' : 'text-gray-400 hover:text-gray-200'}`}>Cancel</button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className={labelCls}>Language</label>
                                <input type="text" className={inputCls} value={input.language} onChange={(e) => setInput({ ...input, language: e.target.value })} placeholder="e.g. English" />
                            </div>
                            <div>
                                <label className={labelCls}>Proficiency</label>
                                <select className={inputCls} value={input.proficiency} onChange={(e) => setInput({ ...input, proficiency: e.target.value })}>
                                    {PROFICIENCY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
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
                                <button onClick={addItem} className={btnPrimary}>
                                    <FontAwesomeIcon icon={faPlus} className="mr-1.5 text-xs" /> Add Language
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {languages.length > 0 ? (
                    <div className="px-4 sm:px-5 py-3">
                        {languages.map((l, i) => {
                            const c = profColor(l.proficiency)
                            return (
                                <div key={i} className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                                    editingIndex === i
                                        ? (isLight ? 'bg-teal-50' : 'bg-teal-900/10')
                                        : (isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]')
                                } ${i > 0 ? `border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}` : ''}`}>
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-teal-50 text-teal-600' : 'bg-teal-900/20 text-teal-400'}`}>
                                        <FontAwesomeIcon icon={faLanguage} className="text-base" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{l.language}</p>
                                    </div>
                                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                                        isLight ? `bg-${c}-50 text-${c}-600` : `bg-${c}-900/20 text-${c}-400`
                                    }`}>
                                        {l.proficiency}
                                    </span>
                                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(i)}
                                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-slate-400 hover:text-blue-500 hover:bg-blue-50' : 'text-gray-500 hover:text-blue-400 hover:bg-blue-900/20'}`}>
                                            <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                        </button>
                                        <button onClick={() => deleteItem(i)}
                                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-900/20'}`}>
                                            <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className={`flex flex-col items-center justify-center py-10 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                            <FontAwesomeIcon icon={faLanguage} className="text-lg" />
                        </div>
                        <p className="text-xs font-medium">No languages added yet</p>
                        <p className="text-[11px] mt-0.5">Click "Add New" to get started</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Languages
