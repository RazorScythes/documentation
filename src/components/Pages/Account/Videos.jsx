import React, { useEffect, useState, useRef, useMemo } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { getGroups } from '../../../actions/groups';
import { getUserVideos, newVideo, updateVideo, deleteVideo, deleteMultipleVideos, updateVideoSettings, clearAlert } from '../../../actions/videos';
import { getTags } from '../../../actions/tags';
import { getCategory } from '../../../actions/category';
import { getAuthor } from '../../../actions/author';
import { millisToTimeString } from '../../Tools'

import ConfirmModal from '../../Custom/ConfirmModal'
import VideoModalRequest from '../../Custom/VideoModalRequest';
import VideoModal from '../../VideoModal';
import ListsModal from '../../Custom/ListsModal';

import { put, del } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faLink, faPlus, faXmark, faCloudArrowUp, faFilm, faPlay, faGlobe, faClose, faImage, faChevronDown, faChevronLeft, faChevronRight, faSpinner, faSearch, faSort, faSortUp, faSortDown, faTrash, faPen, faEllipsisVertical, faCheck, faEye, faEyeSlash, faLock, faLockOpen, faDownload, faBan, faTag } from '@fortawesome/free-solid-svg-icons';
import { faGoogle as faGoogleBrand } from '@fortawesome/free-brands-svg-icons';

const generateRandomID = (length = 20) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const colorMap = {
    emerald: { light: 'bg-emerald-50 text-emerald-500', dark: 'bg-emerald-900/20 text-emerald-400' },
    amber: { light: 'bg-amber-50 text-amber-500', dark: 'bg-amber-900/20 text-amber-400' },
    rose: { light: 'bg-rose-50 text-rose-500', dark: 'bg-rose-900/20 text-rose-400' },
    blue: { light: 'bg-blue-50 text-blue-500', dark: 'bg-blue-900/20 text-blue-400' },
    slate: { light: 'bg-slate-100 text-slate-400', dark: 'bg-[#2B2B2B] text-gray-500' },
}

const ToggleIcon = ({ isLight, active, activeIcon, inactiveIcon, activeLabel, inactiveLabel, activeColor, inactiveColor, endpoint }) => {
    const dispatch = useDispatch()
    const [toggling, setToggling] = useState(false)

    useEffect(() => { setToggling(false) }, [active])

    const handleToggle = () => {
        if (toggling || !endpoint) return
        dispatch(endpoint)
        setToggling(true)
    }

    if (toggling) {
        return <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLight ? 'bg-slate-50' : 'bg-[#2B2B2B]'}`}>
            <div className={`animate-spin rounded-full h-3 w-3 border border-t-transparent ${isLight ? 'border-blue-400' : 'border-blue-500'}`} />
        </div>
    }

    const color = active ? activeColor : inactiveColor
    const colors = colorMap[color] || colorMap.slate

    return (
        <button onClick={handleToggle} title={active ? activeLabel : inactiveLabel}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${isLight ? colors.light : colors.dark}`}>
            <FontAwesomeIcon icon={active ? activeIcon : inactiveIcon} className="text-[11px]" />
        </button>
    )
}

const VideoTable = ({ theme, data, loading, isLight, onEdit, onDelete, onPreview, onViewTags, onMultiDelete, updateVideoSettings }) => {
    const [page, setPage] = useState(0)
    const [sortKey, setSortKey] = useState(null)
    const [sortDir, setSortDir] = useState('asc')
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState([])
    const [perPage, setPerPage] = useState(10)
    const [actionMenu, setActionMenu] = useState(null)

    const columns = [
        { key: 'title', label: 'Video', sortable: true, width: 'w-[280px]' },
        { key: 'category', label: 'Category', sortable: true },
        { key: 'privacy', label: 'Visibility' },
        { key: 'strict', label: 'Strict' },
        { key: 'downloadable', label: 'Download' },
        { key: 'tags', label: 'Tags' },
        { key: 'groups', label: 'Group', sortable: true },
        { key: 'actions', label: '' },
    ]

    const filtered = useMemo(() => {
        const arr = Array.isArray(data) ? data : []
        if (!search.trim()) return arr
        const q = search.toLowerCase()
        return arr.filter(row =>
            (row.title || '').toLowerCase().includes(q) ||
            (row.groups?.group_name || '').toLowerCase().includes(q) ||
            (row.owner || []).some(o => o.name.toLowerCase().includes(q)) ||
            (row.category || []).some(c => c.name.toLowerCase().includes(q))
        )
    }, [data, search])

    const sorted = useMemo(() => {
        if (!sortKey) return filtered || []
        return [...filtered].sort((a, b) => {
            let av, bv
            if (sortKey === 'title') { av = a.title || ''; bv = b.title || '' }
            else if (sortKey === 'category') { av = a.category?.[0]?.name || ''; bv = b.category?.[0]?.name || '' }
            else if (sortKey === 'groups') { av = a.groups?.group_name || ''; bv = b.groups?.group_name || '' }
            else { av = a[sortKey] || ''; bv = b[sortKey] || '' }
            return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
        })
    }, [filtered, sortKey, sortDir])

    const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
    const pageData = sorted.slice(page * perPage, (page + 1) * perPage)

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortKey(key); setSortDir('asc') }
    }

    const allSelected = pageData.length > 0 && pageData.every(row => selected.includes(row._id))
    const toggleAll = () => {
        if (allSelected) setSelected(selected.filter(id => !pageData.some(r => r._id === id)))
        else setSelected([...new Set([...selected, ...pageData.map(r => r._id)])])
    }
    const toggleOne = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const handleBulkDelete = () => {
        if (selected.length > 0) { onMultiDelete(selected); setSelected([]) }
    }

    useEffect(() => { setActionMenu(null) }, [page, search])

    const thClass = `text-[11px] font-semibold uppercase tracking-wider px-3 py-3 text-left cursor-pointer select-none transition-colors whitespace-nowrap ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-gray-500 hover:text-gray-300'}`
    const tdClass = `px-3 py-3 text-sm whitespace-nowrap ${isLight ? 'text-slate-600' : 'text-gray-300'}`

    if (loading) {
        return (
            <div className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#161616] border-[#2B2B2B]'}`}>
                <div className="flex items-center justify-center py-20">
                    <div className={`animate-spin rounded-full h-7 w-7 border-2 border-t-transparent ${isLight ? 'border-blue-500' : 'border-blue-400'}`} />
                </div>
            </div>
        )
    }

    return (
        <div className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#161616] border-[#2B2B2B]'}`}>
            {/* Header */}
            <div className={`px-5 py-4 flex items-center justify-between border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                        <FontAwesomeIcon icon={faVideo} className={`text-xs ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>All Videos</h3>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${isLight ? 'bg-blue-50 text-blue-500' : 'bg-blue-900/20 text-blue-400'}`}>{(data || []).length}</span>
                        </div>
                        <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Manage your video library</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {selected.length > 0 && (
                        <button onClick={handleBulkDelete}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm">
                            <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                            Delete ({selected.length})
                        </button>
                    )}
                    <div className="relative">
                        <FontAwesomeIcon icon={faSearch} className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                        <input
                            type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
                            className={`pl-7 pr-3 py-1.5 text-xs rounded-lg border outline-none w-36 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-blue-300' : 'bg-[#1C1C1C] border-[#333] text-gray-300 placeholder:text-gray-600 focus:border-[#444]'}`}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className={isLight ? 'bg-slate-50/80' : 'bg-[#1A1A1A]'}>
                            <th className={`${thClass} w-10`}>
                                <input type="checkbox" checked={allSelected} onChange={toggleAll} className={`w-3.5 h-3.5 rounded cursor-pointer accent-blue-500`} />
                            </th>
                            {columns.map(col => (
                                <th key={col.key} className={`${thClass} ${col.width || ''}`} onClick={() => col.sortable && toggleSort(col.key)}>
                                    <span className="flex items-center gap-1.5">
                                        {col.label}
                                        {col.sortable && <FontAwesomeIcon icon={sortKey === col.key ? (sortDir === 'asc' ? faSortUp : faSortDown) : faSort} className="text-[9px] opacity-50" />}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.length > 0 ? pageData.map((row, i) => (
                            <tr key={row._id || i}
                                className={`border-t transition-colors ${isLight ? 'border-slate-100' : 'border-[#222]'} ${
                                    selected.includes(row._id) ? (isLight ? 'bg-blue-50/50' : 'bg-blue-900/10') : (i % 2 === 1 ? (isLight ? 'bg-slate-50/30' : 'bg-[#1A1A1A]/50') : '')
                                } ${isLight ? 'hover:bg-blue-50/40' : 'hover:bg-[#1F1F1F]'}`}>

                                {/* Checkbox */}
                                <td className={`${tdClass} w-10`}>
                                    <input type="checkbox" checked={selected.includes(row._id)} onChange={() => toggleOne(row._id)} className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500" />
                                </td>

                                {/* Video */}
                                <td className={tdClass}>
                                    <div className="flex items-center gap-3">
                                        <div onClick={() => onPreview(row.link)}
                                            className="cursor-pointer bg-black rounded-lg overflow-hidden w-24 min-w-[96px] h-14 relative flex-shrink-0 border border-gray-800">
                                            <img src={row.thumbnail} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute bottom-0.5 right-0.5 rounded bg-black/80 text-white px-1 py-px">
                                                <p className="text-[10px] font-mono leading-none">{row.duration ? millisToTimeString(row.duration) : 'embed'}</p>
                                            </div>
                                        </div>
                                        <div className="min-w-0 max-w-[160px]">
                                            <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{row.title}</p>
                                            <p className={`text-xs truncate ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                {row.owner?.map(o => o.name).join(', ') || '—'}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Category */}
                                <td className={tdClass}>
                                    {row.category?.length > 0 ? (
                                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#2B2B2B] text-gray-300'}`}>
                                            {row.category[0].name}
                                        </span>
                                    ) : <span className={`text-xs ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>—</span>}
                                </td>

                                {/* Visibility */}
                                <td className={tdClass}>
                                    <ToggleIcon
                                        isLight={isLight}
                                        active={row.privacy}
                                        activeIcon={faEyeSlash}
                                        inactiveIcon={faEye}
                                        activeLabel="Private"
                                        inactiveLabel="Public"
                                        activeColor="amber"
                                        inactiveColor="emerald"
                                        endpoint={updateVideoSettings({ id: row._id, type: 'privacy', value: !row.privacy })}
                                    />
                                </td>

                                {/* Strict */}
                                <td className={tdClass}>
                                    <ToggleIcon
                                        isLight={isLight}
                                        active={row.strict}
                                        activeIcon={faLock}
                                        inactiveIcon={faLockOpen}
                                        activeLabel="Yes"
                                        inactiveLabel="No"
                                        activeColor="rose"
                                        inactiveColor="slate"
                                        endpoint={updateVideoSettings({ id: row._id, type: 'strict', value: !row.strict })}
                                    />
                                </td>

                                {/* Downloadable */}
                                <td className={tdClass}>
                                    <ToggleIcon
                                        isLight={isLight}
                                        active={row.downloadable}
                                        activeIcon={faDownload}
                                        inactiveIcon={faBan}
                                        activeLabel="Yes"
                                        inactiveLabel="No"
                                        activeColor="blue"
                                        inactiveColor="slate"
                                        endpoint={updateVideoSettings({ id: row._id, type: 'downloadable', value: !row.downloadable })}
                                    />
                                </td>

                                {/* Tags */}
                                <td className={tdClass}>
                                    {row.tags?.length > 0 ? (
                                        <button onClick={() => onViewTags(row.tags)}
                                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all ${isLight ? 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100' : 'bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30'}`}>
                                            <FontAwesomeIcon icon={faTag} className="text-[9px]" />
                                            {row.tags.length}
                                        </button>
                                    ) : <span className={`text-xs ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>—</span>}
                                </td>

                                {/* Group */}
                                <td className={tdClass}>
                                    <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{row.groups?.group_name || '—'}</span>
                                </td>

                                {/* Actions */}
                                <td className={`${tdClass} w-10 relative`}>
                                    <button onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === row._id ? null : row._id) }}
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isLight ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-600' : 'text-gray-500 hover:bg-[#2B2B2B] hover:text-gray-300'}`}>
                                        <FontAwesomeIcon icon={faEllipsisVertical} className="text-xs" />
                                    </button>
                                    {actionMenu === row._id && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
                                            <div className={`absolute right-0 top-full mt-1 z-50 rounded-lg border shadow-lg overflow-hidden min-w-[120px] ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1C1C] border-[#333]'}`}>
                                                <button onClick={() => { onEdit(row); setActionMenu(null) }}
                                                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-gray-300 hover:bg-[#222]'}`}>
                                                    <FontAwesomeIcon icon={faPen} className="text-[10px] text-blue-500" /> Edit
                                                </button>
                                                <button onClick={() => { onDelete(row); setActionMenu(null) }}
                                                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isLight ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/10'}`}>
                                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={columns.length + 1} className={`px-4 py-16 text-center ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                    <FontAwesomeIcon icon={faVideo} className="text-2xl mb-3 opacity-20 block mx-auto" />
                                    <p className={`text-sm font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No videos found</p>
                                    <p className={`text-xs mt-1 ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>{search ? 'Try a different search' : 'Upload your first video'}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination */}
            {sorted.length > 0 && (
                <div className={`px-5 py-3 flex items-center justify-between border-t ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#222] bg-[#141414]'}`}>
                    <div className="flex items-center gap-3">
                        <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                            {page * perPage + 1}–{Math.min((page + 1) * perPage, sorted.length)} of {sorted.length}
                        </p>
                        <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(0) }}
                            className={`text-[11px] rounded-md border px-1.5 py-1 outline-none ${isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#1C1C1C] border-[#333] text-gray-400'}`}>
                            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${page === 0 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}>
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum = totalPages <= 5 ? i : Math.min(Math.max(page - 2, 0), totalPages - 5) + i
                            return (
                                <button key={pageNum} onClick={() => setPage(pageNum)}
                                    className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all ${page === pageNum ? (isLight ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-600 text-white') : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#333]')}`}>
                                    {pageNum + 1}
                                </button>
                            )
                        })}
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${page === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

const Videos = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()

    const groups = useSelector((state) => state.groups.data)
    const videos = useSelector((state) => state.videos.data)
    const loading = useSelector((state) => state.videos.isLoading)
    const alert = useSelector((state) => state.videos.alert) 
    const tags = useSelector((state) => state.tags.data)
    const category = useSelector((state) => state.category.data)
    const author = useSelector((state) => state.author.data)

    const [tableData, setTableData] = useState([])
    const [selectedData, setSelectedData] = useState(null)
    const [openModal, setOpenModal] = useState(false)
    const [openListModal, setOpenListModal] = useState(false)
    const [listPreview, setListPreview] = useState({ label: '', lists: [] })
    const [deleteId, setDeleteId] = useState('')
    const [confirm, setConfirm] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [openVideoModal, setOpenVideoModal] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [videoRecord, setVideoRecord] = useState(false)
    const [recordOpenModal, setRecordOpenModal] = useState(false)
    const [edit, setEdit] = useState(false)
    const [editId, setEditId] = useState(null)
    const [list, setList] = useState({ groups: [], owner: [], category: [], tags: [] })

    const [uploadMode, setUploadMode] = useState('link')
    const [videoFile, setVideoFile] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)
    const thumbInputRef = useRef(null)

    const [form, setForm] = useState({
        thumbnail: null,
        thumbnailPreview: '',
        title: '',
        link: '',
        description: '',
        strict: false,
        privacy: false,
        downloadable: false,
        groups: '',
        owner: [],
        category: [],
        tags: [],
    })
    const [errors, setErrors] = useState({})
    const [thumbLoading, setThumbLoading] = useState(false)
    const [removedImages, setRemovedImages] = useState([])

    const [ownerSearch, setOwnerSearch] = useState('')
    const [categorySearch, setCategorySearch] = useState('')
    const [tagsSearch, setTagsSearch] = useState('')
    const [ownerFocus, setOwnerFocus] = useState(false)
    const [categoryFocus, setCategoryFocus] = useState(false)
    const [tagsFocus, setTagsFocus] = useState(false)

    const isLight = theme === 'light'

    useEffect(() => {
        setSubmitted(false)
        setFormOpen(false)
        setEdit(false)
        setEditId(null)
        resetForm()
        setTableData(videos)
    }, [videos])

    useEffect(() => {
        setList(prevList => ({
            ...prevList,
            ...(tags.length > 0 && { tags }),
            ...(category.length > 0 && { category }),
            ...(author.length > 0 && { owner: author }),
        }));
    }, [tags, category, author]);

    useEffect(() => {
        if(Object.keys(alert).length > 0) {
            dispatch(clearAlert())
            setNotification(alert)
            setSubmitted(false)
            setEdit(false)
			setConfirm(false)
        }
    }, [alert])

    useEffect(() => {
        dispatch(getGroups({ type: 'video' }))
        dispatch(getUserVideos())
        dispatch(getTags({ type: 'video', options: true }))
        dispatch(getCategory({ type: 'video', options: true }))
        dispatch(getAuthor({ type: 'video', options: true }))
    }, [])

    useEffect(() => {
        if(groups.length > 0) {
            const arr = groups.map((group) => ({ id: group._id, name: group.group_name }))
            setList({...list, groups: arr})
        }
    }, [groups])

    const resetForm = () => {
        setForm({ thumbnail: null, thumbnailPreview: '', title: '', link: '', description: '', strict: false, privacy: false, downloadable: false, groups: '', owner: [], category: [], tags: [] })
        setErrors({})
        setRemovedImages([])
        setVideoFile(null)
        setUploadMode('link')
        setOwnerSearch(''); setCategorySearch(''); setTagsSearch('')
    }

    const importedData = (formData) => {
        if(formData) {
            setForm(prev => ({
                ...prev,
                ...(formData.title && { title: formData.title }),
                ...(formData.link && { link: formData.link }),
                ...(formData.thumbnail?.preview && { thumbnailPreview: formData.thumbnail.preview, thumbnail: formData.thumbnail.save }),
            }))
            setUploadMode('link')
        }
    }   

    const fileNameGen = (originalFileName) => {
        const uuid = uuidv4();
        const dotIndex = originalFileName.lastIndexOf('.');
        const extension = originalFileName.substring(dotIndex);
        return `${uuid}${extension}`;
    };

    const uploadToVercel = async (file) => {
        const blob = await put(fileNameGen(file.name), file, {
            access: 'public',
            token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
        });
        return blob.url;
    };

    const deleteVercelFile = async (url) => {
        if (typeof url === 'string' && url.includes('vercel-storage')) {
            await del(url, { token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN });
        }
    }

    const deleteVercelImage = async (obj) => {
        const newObj = { ...obj };
        for (const key in newObj) {
            const value = newObj[key];
            if (typeof value === 'string' && !Array.isArray(value)) {
                if(value.includes('vercel-storage')) {
                    await del(value, { token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN });
                }
            }
        }
        return newObj;
    }

    const editMode = (data) => {
        setForm({
            thumbnail: data.thumbnail || null,
            thumbnailPreview: data.thumbnail || '',
            title: data.title || '',
            link: data.link || '',
            description: data.description || '',
            strict: data.strict || false,
            privacy: data.privacy || false,
            downloadable: data.downloadable || false,
            groups: data.groups?._id || '',
            owner: data.owner || [],
            category: data.category || [],
            tags: data.tags || [],
        })
        setEditId(data._id)
        setEdit(true)
        setUploadMode('link')
        setFormOpen(true)
    }

    const handleThumbnailChange = (e) => {
        const file = e.target.files?.[0]
        if (file && file.type.startsWith('image/')) {
            setThumbLoading(true)
            if (form.thumbnailPreview && form.thumbnail && typeof form.thumbnail === 'string' && form.thumbnail.includes('vercel-storage')) {
                setRemovedImages(prev => [...prev, form.thumbnail])
            }
            setTimeout(() => {
                setForm(prev => ({ ...prev, thumbnail: file, thumbnailPreview: URL.createObjectURL(file) }))
                setThumbLoading(false)
            }, 800)
        }
    }

    const validateForm = () => {
        const errs = {}
        if (!form.title || form.title.length < 6) errs.title = form.title ? 'Title must be at least 6 characters' : 'Title is required'
        if (uploadMode === 'link' && !form.link) errs.link = 'Video URL is required'
        if (uploadMode === 'file' && !videoFile && !edit) errs.file = 'Please select a video file'
        if (!form.groups) errs.groups = 'Group is required'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm() || submitted) return
        setSubmitted(true)

        const data = { ...form }

        if (data.thumbnail instanceof File) {
            data.thumbnail = await uploadToVercel(data.thumbnail)
        }
        delete data.thumbnailPreview

        if (uploadMode === 'file' && videoFile) {
            data.link = await uploadToVercel(videoFile)
        }

        data.owner = form.owner
        data.category = form.category
        data.tags = form.tags

        if (removedImages.length > 0) {
            removedImages.forEach(img => deleteVercelFile(img))
        }

        if (edit) {
            data._id = editId
            if (!data.access_key) data.access_key = generateRandomID()
            dispatch(updateVideo({ data }))
        } else {
            data.access_key = generateRandomID()
            dispatch(newVideo({ id: user._id, data }))
        }
    }

    const handleFileDrop = (e) => {
        e.preventDefault()
        setDragActive(false)
        const file = e.dataTransfer?.files?.[0]
        if (file && file.type.startsWith('video/')) setVideoFile(file)
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (file && file.type.startsWith('video/')) setVideoFile(file)
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
        if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
        return `${(bytes / 1073741824).toFixed(2)} GB`
    }

    const addTag = (fieldName, tag, setSearch) => {
        const current = form[fieldName] || []
        if (!current.some(t => (t.value || t._id) === (tag.value || tag._id))) {
            setForm(prev => ({ ...prev, [fieldName]: [...current, tag] }))
        }
        setSearch('')
    }

    const removeTag = (fieldName, tagId) => {
        setForm(prev => ({ ...prev, [fieldName]: prev[fieldName].filter(t => (t.value || t._id) !== tagId) }))
    }

    const filterOptions = (options, selected, search) => {
        const selectedIds = selected.map(s => s.value || s._id)
        return (options || []).filter(o => !selectedIds.includes(o.value || o._id) && o.name.toLowerCase().includes(search.toLowerCase()))
    }

    useEffect(() => {
        if(selectedData?.length > 0) {
            const data = selectedData.map((id) => tableData.find(item => item._id === id))
            data.forEach((item) => { deleteVercelImage(item) })
            dispatch(deleteMultipleVideos({ ids: selectedData }))
            setSelectedData(null)
        }
    }, [selectedData])

    useEffect(() => {
        if(confirm) {
            deleteVercelImage(deleteId);
            dispatch(deleteVideo({ id: deleteId._id }))
        }
    }, [confirm])

    const panelClass = `rounded-xl border ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#161616] border-[#2B2B2B]'}`
    const inputClass = `block w-full rounded-lg border transition-all duration-200 py-3 px-4 text-sm outline-none ${isLight ? 'bg-white border-slate-200 text-slate-700 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'bg-[#1A1A1A] border-[#333] text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/30'}`
    const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-gray-500'}`
    const sectionLabel = `text-[10px] font-semibold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-gray-600'}`

    const MultiSelect = ({ label, fieldName, options, search, setSearch, focus, setFocus }) => {
        const filtered = filterOptions(options, form[fieldName], search)
        return (
            <div className="relative">
                <label className={labelClass}>{label}</label>
                <div className={`flex flex-wrap items-center gap-1.5 min-h-[46px] rounded-lg border px-3 py-2 cursor-text transition-all ${isLight ? 'bg-white border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100' : 'bg-[#1A1A1A] border-[#333] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-900/30'}`}>
                    {form[fieldName]?.map((tag, i) => (
                        <span key={i} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/20 text-blue-400'}`}>
                            {tag.name}
                            <button type="button" onClick={() => removeTag(fieldName, tag.value || tag._id)} className="hover:opacity-70">
                                <FontAwesomeIcon icon={faClose} className="text-[9px]" />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setFocus(true)}
                        onBlur={() => setTimeout(() => setFocus(false), 200)}
                        placeholder={form[fieldName]?.length > 0 ? '' : `Search ${label.toLowerCase()}...`}
                        className={`flex-grow min-w-[80px] text-sm bg-transparent outline-none border-none py-1 ${isLight ? 'text-slate-700 placeholder-slate-300' : 'text-gray-200 placeholder-gray-600'}`}
                    />
                </div>
                {focus && (
                    <div className={`absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border shadow-lg max-h-48 overflow-y-auto ${isLight ? 'bg-white border-slate-200' : 'bg-[#1A1A1A] border-[#333]'}`}>
                        {filtered.length > 0 ? filtered.map((opt, i) => (
                            <button key={i} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { addTag(fieldName, opt, setSearch); setFocus(false) }} className={`w-full text-left px-4 py-2.5 text-sm transition-all ${isLight ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-[#222] text-gray-300'}`}>
                                {opt.name} {opt?.count ? <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>({opt.count})</span> : ''}
                            </button>
                        )) : (
                            <p className={`px-4 py-3 text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No results found</p>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">   
            <ConfirmModal 
                theme={theme}
                title="Confirm Video Deletion"
                description="Are you sure you want to delete this video?"
                openModal={openModal}
                setOpenModal={setOpenModal}
                setConfirm={setConfirm}
            />

            <ListsModal
                theme={theme}
                title={listPreview.label ?? 'List Items'}
                openModal={openListModal}
                setOpenModal={setOpenListModal}
                lists={listPreview.lists}
            />

            <VideoModalRequest
                theme={theme}
                title="Import Video"
                openModal={openVideoModal}
                setOpenModal={setOpenVideoModal}
                importedData={importedData}
            />  

            <VideoModal
                openModal={recordOpenModal}
                setOpenModal={setRecordOpenModal}
                link={videoRecord}
            />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-50' : 'bg-blue-900/20'}`}>
                            <FontAwesomeIcon icon={faVideo} className={`text-xs ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                        </div>
                        <h1 className={`text-2xl font-semibold ${isLight ? light.heading : dark.heading}`}>Your Videos</h1>
                    </div>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                        Manage, upload, and organize your video content
                    </p>
                </div>
                <button
                    onClick={() => { 
                        if (formOpen) { setFormOpen(false); resetForm(); setEdit(false) } 
                        else { setFormOpen(true); resetForm(); setEdit(false) } 
                    }}
                    className={`py-2 px-4 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                        formOpen
                            ? (isLight ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-[#1C1C1C] border border-[#333] text-gray-400 hover:bg-[#222]')
                            : (isLight ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm' : 'bg-blue-600 text-white hover:bg-blue-700')
                    }`}
                >
                    <FontAwesomeIcon icon={formOpen ? faXmark : faPlus} className="text-[10px]" />
                    {formOpen ? 'Cancel' : 'New Video'}
                </button>
            </div>

            {/* New Video Form */}
            {formOpen && (
                <form onSubmit={handleFormSubmit} className="max-w-3xl space-y-5 mb-8">

                    {/* Video Source Section */}
                    {!edit && (
                        <div className={panelClass}>
                            <div className={`px-5 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                <p className={sectionLabel}>Video Source</p>
                            </div>
                            <div className="p-5 space-y-4">
                                {/* Upload Mode Tabs */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => { setUploadMode('link'); setVideoFile(null) }}
                                        className={`flex items-center gap-3 p-3.5 rounded-lg border-2 transition-all ${
                                            uploadMode === 'link'
                                                ? (isLight ? 'border-blue-500 bg-blue-50/50' : 'border-blue-500 bg-blue-900/10')
                                                : (isLight ? 'border-slate-200 hover:border-slate-300' : 'border-[#333] hover:border-[#444]')
                                        }`}>
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${uploadMode === 'link' ? (isLight ? 'bg-blue-100' : 'bg-blue-900/30') : (isLight ? 'bg-slate-100' : 'bg-[#2B2B2B]')}`}>
                                            <FontAwesomeIcon icon={faLink} className={`text-sm ${uploadMode === 'link' ? 'text-blue-500' : (isLight ? 'text-slate-400' : 'text-gray-500')}`} />
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Paste URL</p>
                                            <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Link to video</p>
                                        </div>
                                    </button>
                                    <button type="button" onClick={() => setUploadMode('file')}
                                        className={`flex items-center gap-3 p-3.5 rounded-lg border-2 transition-all ${
                                            uploadMode === 'file'
                                                ? (isLight ? 'border-blue-500 bg-blue-50/50' : 'border-blue-500 bg-blue-900/10')
                                                : (isLight ? 'border-slate-200 hover:border-slate-300' : 'border-[#333] hover:border-[#444]')
                                        }`}>
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${uploadMode === 'file' ? (isLight ? 'bg-blue-100' : 'bg-blue-900/30') : (isLight ? 'bg-slate-100' : 'bg-[#2B2B2B]')}`}>
                                            <FontAwesomeIcon icon={faCloudArrowUp} className={`text-sm ${uploadMode === 'file' ? 'text-blue-500' : (isLight ? 'text-slate-400' : 'text-gray-500')}`} />
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Upload File</p>
                                            <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>From your device</p>
                                        </div>
                                    </button>
                                </div>

                                {/* URL Input */}
                                {uploadMode === 'link' && (
                                    <div>
                                        <label className={labelClass}>Video URL</label>
                                        <input type="text" value={form.link} onChange={(e) => setForm(p => ({ ...p, link: e.target.value }))} placeholder="https://example.com/video.mp4" className={inputClass} />
                                        {errors.link && <p className="text-xs text-red-500 mt-1">{errors.link}</p>}
                                    </div>
                                )}

                                {/* File Upload Zone */}
                                {uploadMode === 'file' && (
                                    <div>
                                        {!videoFile ? (
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                                                onDragLeave={() => setDragActive(false)}
                                                onDrop={handleFileDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                                                    dragActive
                                                        ? (isLight ? 'border-blue-400 bg-blue-50/60' : 'border-blue-500 bg-blue-900/15')
                                                        : (isLight ? 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30' : 'border-[#333] hover:border-[#444] hover:bg-[#1A1A1A]')
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faCloudArrowUp} className={`text-3xl mb-3 ${dragActive ? 'text-blue-500' : (isLight ? 'text-slate-300' : 'text-gray-600')}`} />
                                                <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                                                    {dragActive ? 'Drop your video here' : 'Drag & drop or click to browse'}
                                                </p>
                                                <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>MP4, WebM, MOV, AVI — Max 500MB</p>
                                                <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                                            </div>
                                        ) : (
                                            <div className={`rounded-xl border p-4 flex items-center gap-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1A1A1A] border-[#2B2B2B]'}`}>
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                                                    <FontAwesomeIcon icon={faFilm} className="text-blue-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{videoFile.name}</p>
                                                    <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatFileSize(videoFile.size)}</p>
                                                </div>
                                                <button type="button" onClick={() => { setVideoFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                                                    className={`p-1.5 rounded-md transition-all ${isLight ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-900/20'}`}>
                                                    <FontAwesomeIcon icon={faXmark} className="text-sm" />
                                                </button>
                                            </div>
                                        )}
                                        {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
                                    </div>
                                )}

                                {/* Import Options */}
                                <div className={`pt-4 border-t ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                    <p className={`${sectionLabel} mb-3`}>Import From</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'drive', label: 'Google Drive', desc: 'Import from Drive', icon: faGoogleBrand, color: 'text-blue-500', onClick: () => setOpenVideoModal(true) },
                                            { id: 'url', label: 'Direct URL', desc: 'Paste any video URL', icon: faGlobe, color: 'text-emerald-500', onClick: () => setOpenVideoModal(true) },
                                            { id: 'embed', label: 'Embed Code', desc: 'YouTube, Vimeo', icon: faPlay, color: 'text-rose-500', onClick: () => setOpenVideoModal(true) },
                                        ].map((opt) => (
                                            <button key={opt.id} type="button" onClick={opt.onClick}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-center ${isLight ? 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/30' : 'border-[#2B2B2B] hover:border-[#444] hover:bg-[#1A1A1A]'}`}>
                                                <FontAwesomeIcon icon={opt.icon} className={`text-base ${opt.color}`} />
                                                <p className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{opt.label}</p>
                                                <p className={`text-[10px] leading-tight ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit mode Video Source */}
                    {edit && (
                        <div className={panelClass}>
                            <div className={`px-5 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                <p className={sectionLabel}>Video Source</p>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => { setUploadMode('link'); setVideoFile(null) }}
                                        className={`flex items-center gap-3 p-3.5 rounded-lg border-2 transition-all ${
                                            uploadMode === 'link'
                                                ? (isLight ? 'border-blue-500 bg-blue-50/50' : 'border-blue-500 bg-blue-900/10')
                                                : (isLight ? 'border-slate-200 hover:border-slate-300' : 'border-[#333] hover:border-[#444]')
                                        }`}>
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${uploadMode === 'link' ? (isLight ? 'bg-blue-100' : 'bg-blue-900/30') : (isLight ? 'bg-slate-100' : 'bg-[#2B2B2B]')}`}>
                                            <FontAwesomeIcon icon={faLink} className={`text-sm ${uploadMode === 'link' ? 'text-blue-500' : (isLight ? 'text-slate-400' : 'text-gray-500')}`} />
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Paste URL</p>
                                            <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Link to video</p>
                                        </div>
                                    </button>
                                    <button type="button" onClick={() => setUploadMode('file')}
                                        className={`flex items-center gap-3 p-3.5 rounded-lg border-2 transition-all ${
                                            uploadMode === 'file'
                                                ? (isLight ? 'border-blue-500 bg-blue-50/50' : 'border-blue-500 bg-blue-900/10')
                                                : (isLight ? 'border-slate-200 hover:border-slate-300' : 'border-[#333] hover:border-[#444]')
                                        }`}>
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${uploadMode === 'file' ? (isLight ? 'bg-blue-100' : 'bg-blue-900/30') : (isLight ? 'bg-slate-100' : 'bg-[#2B2B2B]')}`}>
                                            <FontAwesomeIcon icon={faCloudArrowUp} className={`text-sm ${uploadMode === 'file' ? 'text-blue-500' : (isLight ? 'text-slate-400' : 'text-gray-500')}`} />
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Upload File</p>
                                            <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Replace with file</p>
                                        </div>
                                    </button>
                                </div>

                                {uploadMode === 'link' && (
                                    <div>
                                        <label className={labelClass}>Video URL</label>
                                        <input type="text" value={form.link} onChange={(e) => setForm(p => ({ ...p, link: e.target.value }))} placeholder="https://example.com/video.mp4" className={inputClass} />
                                        {errors.link && <p className="text-xs text-red-500 mt-1">{errors.link}</p>}
                                    </div>
                                )}

                                {uploadMode === 'file' && (
                                    <div>
                                        {!videoFile ? (
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                                                onDragLeave={() => setDragActive(false)}
                                                onDrop={handleFileDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                                                    dragActive
                                                        ? (isLight ? 'border-blue-400 bg-blue-50/60' : 'border-blue-500 bg-blue-900/15')
                                                        : (isLight ? 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30' : 'border-[#333] hover:border-[#444] hover:bg-[#1A1A1A]')
                                                }`}>
                                                <FontAwesomeIcon icon={faCloudArrowUp} className={`text-3xl mb-3 ${dragActive ? 'text-blue-500' : (isLight ? 'text-slate-300' : 'text-gray-600')}`} />
                                                <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                                                    {dragActive ? 'Drop your video here' : 'Drag & drop or click to browse'}
                                                </p>
                                                <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>MP4, WebM, MOV, AVI — Max 500MB</p>
                                                <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                                            </div>
                                        ) : (
                                            <div className={`rounded-xl border p-4 flex items-center gap-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1A1A1A] border-[#2B2B2B]'}`}>
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                                                    <FontAwesomeIcon icon={faFilm} className="text-blue-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{videoFile.name}</p>
                                                    <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatFileSize(videoFile.size)}</p>
                                                </div>
                                                <button type="button" onClick={() => { setVideoFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                                                    className={`p-1.5 rounded-md transition-all ${isLight ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-900/20'}`}>
                                                    <FontAwesomeIcon icon={faXmark} className="text-sm" />
                                                </button>
                                            </div>
                                        )}
                                        {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
                                    </div>
                                )}

                                <div className={`pt-4 border-t ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                    <p className={`${sectionLabel} mb-3`}>Import From</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'drive', label: 'Google Drive', desc: 'Import from Drive', icon: faGoogleBrand, color: 'text-blue-500', onClick: () => setOpenVideoModal(true) },
                                            { id: 'url', label: 'Direct URL', desc: 'Paste any video URL', icon: faGlobe, color: 'text-emerald-500', onClick: () => setOpenVideoModal(true) },
                                            { id: 'embed', label: 'Embed Code', desc: 'YouTube, Vimeo', icon: faPlay, color: 'text-rose-500', onClick: () => setOpenVideoModal(true) },
                                        ].map((opt) => (
                                            <button key={opt.id} type="button" onClick={opt.onClick}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-center ${isLight ? 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/30' : 'border-[#2B2B2B] hover:border-[#444] hover:bg-[#1A1A1A]'}`}>
                                                <FontAwesomeIcon icon={opt.icon} className={`text-base ${opt.color}`} />
                                                <p className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{opt.label}</p>
                                                <p className={`text-[10px] leading-tight ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Video Details */}
                    <div className={panelClass}>
                        <div className={`px-5 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                            <p className={sectionLabel}>{edit ? 'Edit Video Details' : 'Video Details'}</p>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Thumbnail */}
                            <div>
                                <label className={labelClass}>Thumbnail</label>
                                {thumbLoading ? (
                                    <div className={`h-40 w-full rounded-lg border-2 border-dashed flex items-center justify-center ${isLight ? 'border-blue-300 bg-blue-50/50' : 'border-[#2B2B2B] bg-[#2B2B2B]/30'}`}>
                                        <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${isLight ? 'border-blue-500' : 'border-blue-400'}`} />
                                    </div>
                                ) : form.thumbnailPreview ? (
                                    <div onClick={() => thumbInputRef.current?.click()} className={`relative cursor-pointer rounded-lg overflow-hidden border group ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`}>
                                        <img src={form.thumbnailPreview} alt="Thumbnail" className="w-full h-auto object-contain" referrerPolicy="no-referrer" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-xs font-medium">Click to change</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={() => thumbInputRef.current?.click()}
                                        className={`h-40 w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${isLight ? 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30' : 'border-[#333] hover:border-[#444] hover:bg-[#1A1A1A]'}`}>
                                        <FontAwesomeIcon icon={faImage} className={`text-2xl mb-2 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                        <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Click to upload thumbnail</p>
                                    </div>
                                )}
                                <input ref={thumbInputRef} type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                            </div>

                            {/* Title */}
                            <div>
                                <label className={labelClass}>Video Title</label>
                                <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Enter video title" className={inputClass} />
                                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Add a description..." rows={4} className={`${inputClass} resize-none`} />
                            </div>
                        </div>
                    </div>

                    {/* Video Settings */}
                    <div className={panelClass}>
                        <div className={`px-5 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                            <p className={sectionLabel}>Video Settings</p>
                        </div>
                        <div className="p-5 space-y-4">
                            {[
                                { name: 'strict', label: 'Strict Mode', desc: 'Enable content restrictions' },
                                { name: 'privacy', label: 'Private', desc: 'Only visible to you' },
                                { name: 'downloadable', label: 'Downloadable', desc: 'Allow viewers to download' },
                            ].map(({ name, label, desc }) => (
                                <label key={name} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1A1A1A]'}`}>
                                    <div>
                                        <p className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{label}</p>
                                        <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{desc}</p>
                                    </div>
                                    <div className="relative">
                                        <input type="checkbox" checked={form[name] || false} onChange={() => setForm(p => ({ ...p, [name]: !p[name] }))} className="sr-only peer" />
                                        <div className={`w-10 h-[22px] rounded-full transition-all peer-checked:bg-blue-500 ${isLight ? 'bg-slate-200' : 'bg-[#333]'}`} />
                                        <div className="absolute left-0.5 top-0.5 w-[18px] h-[18px] bg-white rounded-full transition-all shadow-sm peer-checked:translate-x-[18px]" />
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Classification */}
                    <div className={panelClass}>
                        <div className={`px-5 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                            <p className={sectionLabel}>Classification</p>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Groups */}
                            <div>
                                <label className={labelClass}>Groups</label>
                                <div className="relative">
                                    <select value={form.groups} onChange={(e) => setForm(p => ({ ...p, groups: e.target.value }))}
                                        className={`${inputClass} appearance-none pr-10`}>
                                        <option value="">Select a group</option>
                                        {list.groups.map((g, i) => <option key={i} value={g.id}>{g.name}</option>)}
                                    </select>
                                    <FontAwesomeIcon icon={faChevronDown} className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                                </div>
                                {errors.groups && <p className="text-xs text-red-500 mt-1">{errors.groups}</p>}
                            </div>

                            {/* Owner */}
                            <MultiSelect label="Artist / Owner" fieldName="owner" options={list.owner} search={ownerSearch} setSearch={setOwnerSearch} focus={ownerFocus} setFocus={setOwnerFocus} />

                            {/* Category */}
                            <MultiSelect label="Category" fieldName="category" options={list.category} search={categorySearch} setSearch={setCategorySearch} focus={categoryFocus} setFocus={setCategoryFocus} />

                            {/* Tags */}
                            <MultiSelect label="Tags" fieldName="tags" options={list.tags} search={tagsSearch} setSearch={setTagsSearch} focus={tagsFocus} setFocus={setTagsFocus} />
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={submitted}
                        className={`w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                            submitted ? 'opacity-60 cursor-not-allowed' : ''
                        } ${isLight ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                        {submitted ? (
                            <><FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> {edit ? 'Updating...' : 'Uploading...'}</>
                        ) : (
                            <>{edit ? 'Update Video' : 'Upload Video'}</>
                        )}
                    </button>
                </form>
            )}
            
            {/* Video Data Table */}
            {!formOpen && <VideoTable
                theme={theme}
                data={tableData}
                loading={loading}
                isLight={isLight}
                onEdit={editMode}
                onDelete={(item) => { setDeleteId(item); setOpenModal(true); setConfirm(false) }}
                onPreview={(link) => { setVideoRecord(link); setRecordOpenModal(true) }}
                onViewTags={(tags) => { setOpenListModal(true); setListPreview({ label: 'Tags', lists: tags }) }}
                onMultiDelete={setSelectedData}
                updateVideoSettings={updateVideoSettings}
            />}
        </div>
    )
}

export default Videos
