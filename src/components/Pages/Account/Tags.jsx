import React, { useEffect, useState, useMemo } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { getTags, newTags, updateTags, updateTagsSettings, deleteTags, deleteMultipleTags, clearAlert } from '../../../actions/tags';
import ConfirmModal from '../../Custom/ConfirmModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faPlus, faXmark, faSearch, faSort, faSortUp, faSortDown, faChevronLeft, faChevronRight, faTrash, faPen, faEllipsisVertical, faSpinner, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';

const Tags = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()
    const tags = useSelector((state) => state.tags.data)
    const loading = useSelector((state) => state.tags.isLoading)
    const alert = useSelector((state) => state.tags.alert)

    const [tableData, setTableData] = useState([])
    const [selectedData, setSelectedData] = useState(null)
    const [openModal, setOpenModal] = useState(false)
    const [deleteId, setDeleteId] = useState('')
    const [confirm, setConfirm] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [edit, setEdit] = useState(false)
    const [editId, setEditId] = useState(null)

    const [form, setForm] = useState({ name: '', description: '', strict: false })
    const [errors, setErrors] = useState({})

    const isLight = theme === 'light'
    const panelClass = `rounded-xl border ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#161616] border-[#2B2B2B]'}`
    const inputClass = `block w-full rounded-lg border transition-all duration-200 py-3 px-4 text-sm outline-none ${isLight ? 'bg-white border-slate-200 text-slate-700 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'bg-[#1A1A1A] border-[#333] text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/30'}`
    const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-gray-500'}`
    const sectionLabel = `text-[10px] font-semibold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-gray-600'}`

    const resetForm = () => { setForm({ name: '', description: '', strict: false }); setErrors({}) }

    useEffect(() => { setSubmitted(false); setFormOpen(false); setEdit(false); setEditId(null); resetForm(); setTableData(tags) }, [tags])
    useEffect(() => { if (Object.keys(alert).length > 0) { dispatch(clearAlert()); setNotification(alert); setSubmitted(false); setEdit(false); setConfirm(false) } }, [alert])
    useEffect(() => { dispatch(getTags({ type: 'video' })) }, [])
    useEffect(() => { if (selectedData?.length > 0) { dispatch(deleteMultipleTags({ ids: selectedData, type: 'video' })); setSelectedData(null) } }, [selectedData])
    useEffect(() => { if (confirm) dispatch(deleteTags({ id: deleteId, type: 'video' })) }, [confirm])

    const editMode = (data) => {
        setForm({ name: data.name || '', description: data.description || '', strict: data.strict || false })
        setEditId(data._id); setEdit(true); setFormOpen(true)
    }

    const validateForm = () => {
        const errs = {}
        if (!form.name || form.name.length < 3) errs.name = form.name ? 'Must be at least 3 characters' : 'Required'
        setErrors(errs); return Object.keys(errs).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validateForm() || submitted) return
        setSubmitted(true)
        if (edit) {
            dispatch(updateTags({ data: { ...form, id: editId, type: 'video' } }))
        } else {
            dispatch(newTags({ id: user._id, data: { ...form, user: user._id, type: 'video' } }))
        }
    }

    const handleToggleStrict = (row) => {
        dispatch(updateTagsSettings({ id: row._id, type: 'strict', value: !row.strict }))
    }

    const [page, setPage] = useState(0)
    const [sortKey, setSortKey] = useState(null)
    const [sortDir, setSortDir] = useState('asc')
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState([])
    const [perPage, setPerPage] = useState(10)
    const [actionMenu, setActionMenu] = useState(null)

    const filtered = useMemo(() => { const arr = Array.isArray(tableData) ? tableData : []; if (!search.trim()) return arr; const q = search.toLowerCase(); return arr.filter(r => (r.name || '').toLowerCase().includes(q)) }, [tableData, search])
    const sorted = useMemo(() => { if (!sortKey) return filtered || []; return [...(filtered || [])].sort((a, b) => { const av = sortKey === 'count' ? (a[sortKey] || 0) : (a[sortKey] || ''); const bv = sortKey === 'count' ? (b[sortKey] || 0) : (b[sortKey] || ''); if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av; return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av)) }) }, [filtered, sortKey, sortDir])

    const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
    const pageData = sorted.slice(page * perPage, (page + 1) * perPage)
    const toggleSort = (key) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }
    const allSelected = pageData.length > 0 && pageData.every(r => selected.includes(r._id))
    const toggleAll = () => { if (allSelected) setSelected(selected.filter(id => !pageData.some(r => r._id === id))); else setSelected([...new Set([...selected, ...pageData.map(r => r._id)])]) }
    const toggleOne = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    const handleBulkDelete = () => { if (selected.length > 0) { setSelectedData(selected); setSelected([]) } }
    useEffect(() => setActionMenu(null), [page, search])

    const thClass = `text-[11px] font-semibold uppercase tracking-wider px-3 py-3 text-left cursor-pointer select-none transition-colors whitespace-nowrap ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-gray-500 hover:text-gray-300'}`
    const tdClass = `px-3 py-3 text-sm whitespace-nowrap ${isLight ? 'text-slate-600' : 'text-gray-300'}`
    const formatDate = (d) => { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }

    const columns = [
        { key: 'name', label: 'Tag Name', sortable: true },
        { key: 'count', label: 'Used', sortable: true },
        { key: 'user', label: 'Created By' },
        { key: 'strict', label: 'Strict' },
        { key: 'createdAt', label: 'Created', sortable: true },
        { key: 'actions', label: '' },
    ]

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <ConfirmModal theme={theme} title="Confirm Deletion" description="Are you sure you want to delete this tag?" openModal={openModal} setOpenModal={setOpenModal} setConfirm={setConfirm} />

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-indigo-50' : 'bg-indigo-900/20'}`}><FontAwesomeIcon icon={faTag} className={`text-xs ${isLight ? 'text-indigo-500' : 'text-indigo-400'}`} /></div>
                        <h1 className={`text-2xl font-semibold ${isLight ? light.heading : dark.heading}`}>Tags</h1>
                    </div>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Manage and organize your video tags</p>
                </div>
                <button onClick={() => { if (formOpen) { setFormOpen(false); resetForm(); setEdit(false) } else { setFormOpen(true); resetForm(); setEdit(false) } }}
                    className={`py-2 px-4 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${formOpen ? (isLight ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-[#1C1C1C] border border-[#333] text-gray-400 hover:bg-[#222]') : (isLight ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm' : 'bg-indigo-600 text-white hover:bg-indigo-700')}`}>
                    <FontAwesomeIcon icon={formOpen ? faXmark : faPlus} className="text-[10px]" />{formOpen ? 'Cancel' : 'New Tag'}
                </button>
            </div>

            {formOpen && (
                <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 mb-8">
                    <div className={panelClass}>
                        <div className={`px-5 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}><p className={sectionLabel}>{edit ? 'Edit Tag' : 'New Tag'}</p></div>
                        <div className="p-5 space-y-5">
                            <div><label className={labelClass}>Tag Name</label><input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Enter tag name" className={inputClass} />{errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}</div>
                            <div><label className={labelClass}>Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description..." rows={3} className={`${inputClass} resize-none`} /></div>
                        </div>
                    </div>
                    <div className={panelClass}>
                        <div className={`px-5 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}><p className={sectionLabel}>Settings</p></div>
                        <div className="p-5">
                            <label className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1A1A1A]'}`}>
                                <div><p className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Strict Mode</p><p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Enable content restrictions</p></div>
                                <div className="relative"><input type="checkbox" checked={form.strict || false} onChange={() => setForm(p => ({ ...p, strict: !p.strict }))} className="sr-only peer" /><div className={`w-10 h-[22px] rounded-full transition-all peer-checked:bg-blue-500 ${isLight ? 'bg-slate-200' : 'bg-[#333]'}`} /><div className="absolute left-0.5 top-0.5 w-[18px] h-[18px] bg-white rounded-full transition-all shadow-sm peer-checked:translate-x-[18px]" /></div>
                            </label>
                        </div>
                    </div>
                    <button type="submit" disabled={submitted} className={`w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${submitted ? 'opacity-60 cursor-not-allowed' : ''} ${isLight ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                        {submitted ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> Saving...</> : <>{edit ? 'Update Tag' : 'Create Tag'}</>}
                    </button>
                </form>
            )}

            {!formOpen && (
                <div className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#161616] border-[#2B2B2B]'}`}>
                    <div className={`px-5 py-4 flex items-center justify-between border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-indigo-100' : 'bg-indigo-900/30'}`}><FontAwesomeIcon icon={faTag} className={`text-xs ${isLight ? 'text-indigo-500' : 'text-indigo-400'}`} /></div>
                            <div className="min-w-0"><div className="flex items-center gap-2"><h3 className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>All Tags</h3><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isLight ? 'bg-indigo-50 text-indigo-500' : 'bg-indigo-900/20 text-indigo-400'}`}>{(tableData || []).length}</span></div><p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Manage your video tags</p></div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            {selected.length > 0 && <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm"><FontAwesomeIcon icon={faTrash} className="text-[10px]" />Delete ({selected.length})</button>}
                            <div className="relative"><FontAwesomeIcon icon={faSearch} className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} /><input type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} className={`pl-7 pr-3 py-1.5 text-xs rounded-lg border outline-none w-36 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-blue-300' : 'bg-[#1C1C1C] border-[#333] text-gray-300 placeholder:text-gray-600 focus:border-[#444]'}`} /></div>
                        </div>
                    </div>
                    {loading ? <div className="flex items-center justify-center py-20"><div className={`animate-spin rounded-full h-7 w-7 border-2 border-t-transparent ${isLight ? 'border-indigo-500' : 'border-indigo-400'}`} /></div> : (
                        <>
                            <div className="overflow-x-auto"><table className="w-full"><thead><tr className={isLight ? 'bg-slate-50/80' : 'bg-[#1A1A1A]'}>
                                <th className={`${thClass} w-10`}><input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500" /></th>
                                {columns.map(col => (<th key={col.key} className={thClass} onClick={() => col.sortable && toggleSort(col.key)}><span className="flex items-center gap-1.5">{col.label}{col.sortable && <FontAwesomeIcon icon={sortKey === col.key ? (sortDir === 'asc' ? faSortUp : faSortDown) : faSort} className="text-[9px] opacity-50" />}</span></th>))}
                            </tr></thead><tbody>
                                {pageData.length > 0 ? pageData.map((row, i) => (
                                    <tr key={row._id || i} className={`border-t transition-colors ${isLight ? 'border-slate-100' : 'border-[#222]'} ${selected.includes(row._id) ? (isLight ? 'bg-blue-50/50' : 'bg-blue-900/10') : (i % 2 === 1 ? (isLight ? 'bg-slate-50/30' : 'bg-[#1A1A1A]/50') : '')} ${isLight ? 'hover:bg-blue-50/40' : 'hover:bg-[#0e0e0e]'}`}>
                                        <td className={`${tdClass} w-10`}><input type="checkbox" checked={selected.includes(row._id)} onChange={() => toggleOne(row._id)} className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500" /></td>
                                        <td className={tdClass}><span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{row.name}</span></td>
                                        <td className={tdClass}><span className={`text-xs font-medium px-2 py-1 rounded-md ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#2B2B2B] text-gray-300'}`}>{row.count ?? 0}</span></td>
                                        <td className={tdClass}><span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{row.user?.username || '—'}</span></td>
                                        <td className={tdClass}><button onClick={() => handleToggleStrict(row)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${row.strict ? (isLight ? 'bg-rose-50 text-rose-500' : 'bg-rose-900/20 text-rose-400') : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#2B2B2B] text-gray-500')}`}><FontAwesomeIcon icon={row.strict ? faLock : faLockOpen} className="text-[11px]" /></button></td>
                                        <td className={tdClass}><span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatDate(row.createdAt)}</span></td>
                                        <td className={`${tdClass} w-10 relative`}>
                                            <button onClick={e => { e.stopPropagation(); setActionMenu(actionMenu === row._id ? null : row._id) }} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#2B2B2B]'}`}><FontAwesomeIcon icon={faEllipsisVertical} className="text-xs" /></button>
                                            {actionMenu === row._id && (<><div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} /><div className={`absolute right-0 top-full mt-1 z-50 rounded-lg border shadow-lg overflow-hidden min-w-[120px] ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1C1C] border-[#333]'}`}><button onClick={() => { editMode(row); setActionMenu(null) }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-gray-300 hover:bg-[#222]'}`}><FontAwesomeIcon icon={faPen} className="text-[10px] text-blue-500" /> Edit</button><button onClick={() => { setDeleteId(row._id); setOpenModal(true); setConfirm(false); setActionMenu(null) }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isLight ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/10'}`}><FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Delete</button></div></>)}
                                        </td>
                                    </tr>
                                )) : (<tr><td colSpan={columns.length + 1} className={`px-4 py-16 text-center ${isLight ? 'text-slate-400' : 'text-gray-500'}`}><FontAwesomeIcon icon={faTag} className="text-2xl mb-3 opacity-20 block mx-auto" /><p className="text-sm font-medium">No tags found</p><p className={`text-xs mt-1 ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>{search ? 'Try a different search' : 'Create your first tag'}</p></td></tr>)}
                            </tbody></table></div>
                            {sorted.length > 0 && (
                                <div className={`px-5 py-3 flex items-center justify-between border-t ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#222] bg-[#141414]'}`}>
                                    <div className="flex items-center gap-3"><p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{page * perPage + 1}–{Math.min((page + 1) * perPage, sorted.length)} of {sorted.length}</p><select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(0) }} className={`text-[11px] rounded-md border px-1.5 py-1 outline-none ${isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#1C1C1C] border-[#333] text-gray-400'}`}>{[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}</select></div>
                                    <div className="flex items-center gap-1"><button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${page === 0 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}><FontAwesomeIcon icon={faChevronLeft} /></button>{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => { const pn = totalPages <= 5 ? i : Math.min(Math.max(page - 2, 0), totalPages - 5) + i; return (<button key={pn} onClick={() => setPage(pn)} className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all ${page === pn ? (isLight ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-600 text-white') : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#333]')}`}>{pn + 1}</button>) })}<button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${page === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}><FontAwesomeIcon icon={faChevronRight} /></button></div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Tags
