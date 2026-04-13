import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFileAlt, faPlus, faTimes, faTrash, faPen, faEye, faSearch,
    faLock, faLockOpen, faChevronLeft, faChevronRight, faImage,
    faClone, faList, faSortUp, faSortDown, faSort, faFilter,
    faAngleDoubleLeft, faAngleDoubleRight, faUndo, faClock,
    faSpinner, faCheck, faExternalLinkAlt, faGlobe, faCloudUploadAlt
} from '@fortawesome/free-solid-svg-icons'
import { put, del } from '@vercel/blob'
import {
    fetchPages, removePage, duplicatePageThunk, createNewPage,
    fetchTrash, restorePageThunk, permanentDeleteThunk, emptyTrashThunk,
    togglePrivacyThunk, fetchImages, uploadImagesThunk, deleteImageThunk,
    clearAlert
} from '../../../actions/pageBuilder'
import { main, dark, light } from '../../../style'
import styles from '../../../style'
import Notification from '../../Custom/Notification'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const getDaysRemaining = (deletedAt) => {
    const diff = 10 - Math.floor((Date.now() - new Date(deletedAt).getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
}

const PagesList = ({ user, theme }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const pages = useSelector(s => s.pageBuilder.pages)
    const trash = useSelector(s => s.pageBuilder.trashPages)
    const userImages = useSelector(s => s.pageBuilder.userImages)
    const isLoading = useSelector(s => s.pageBuilder.isLoading)
    const trashLoading = useSelector(s => s.pageBuilder.trashLoading)
    const pbAlert = useSelector(s => s.pageBuilder.alert)

    const isLight = theme === 'light'

    const [searchParams, setSearchParams] = useSearchParams()
    const VALID_TABS = ['pages', 'images', 'trash']
    const tabParam = searchParams.get('tab')
    const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'pages'
    const setActiveTab = (tab) => setSearchParams(prev => { prev.set('tab', tab); return prev }, { replace: true })

    const [view, setView] = useState('list')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [selectedIds, setSelectedIds] = useState([])
    const [creating, setCreating] = useState(false)
    const [notification, setNotification] = useState({})
    const [showNotif, setShowNotif] = useState(false)

    const [sortKey, setSortKey] = useState('updatedAt')
    const [sortDir, setSortDir] = useState('desc')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterPrivacy, setFilterPrivacy] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const activeFilterCount = [filterStatus, filterPrivacy].filter(Boolean).length

    const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', variant: 'danger', onConfirm: null })

    const [imageUrl, setImageUrl] = useState('')
    const [uploadingImage, setUploadingImage] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)
    const [imageDeleteConfirm, setImageDeleteConfirm] = useState(null)

    useEffect(() => {
        if (user) dispatch(fetchPages())
    }, [user])

    useEffect(() => {
        if (user && activeTab === 'trash') dispatch(fetchTrash())
        if (user && activeTab === 'images') dispatch(fetchImages())
    }, [activeTab])

    useEffect(() => {
        if (pbAlert?.message && pbAlert?.variant) {
            setNotification({ message: pbAlert.message, variant: pbAlert.variant })
            setShowNotif(true)
            dispatch(clearAlert())
        }
    }, [pbAlert])

    useEffect(() => { if (!showNotif) setNotification({}) }, [showNotif])

    const handleCreate = async () => {
        setCreating(true)
        const result = await dispatch(createNewPage({ title: 'Untitled Page' }))
        setCreating(false)
        if (result.payload?.data?.result?._id) {
            navigate(`/pages/builder?id=${result.payload.data.result._id}`)
        }
    }

    const handleDelete = (id) => {
        setConfirmModal({
            open: true, title: 'Move to Trash', variant: 'warning',
            message: 'This page will be moved to trash and automatically deleted after 10 days.',
            onConfirm: () => { dispatch(removePage(id)); setConfirmModal(prev => ({ ...prev, open: false })) }
        })
    }

    const handleBulkDelete = () => {
        if (!selectedIds.length) return
        setConfirmModal({
            open: true, title: 'Move to Trash', variant: 'warning',
            message: `${selectedIds.length} page(s) will be moved to trash and automatically deleted after 10 days.`,
            onConfirm: async () => {
                for (const id of selectedIds) await dispatch(removePage(id))
                setSelectedIds([])
                setConfirmModal(prev => ({ ...prev, open: false }))
                dispatch(fetchPages())
            }
        })
    }

    const handleDuplicate = (id) => {
        setConfirmModal({
            open: true, title: 'Duplicate Page', variant: 'info',
            message: 'Create a copy of this page?',
            onConfirm: () => { dispatch(duplicatePageThunk({ id })); setConfirmModal(prev => ({ ...prev, open: false })) }
        })
    }

    const handleRestore = async (id) => {
        await dispatch(restorePageThunk(id))
        dispatch(fetchPages())
    }

    const handlePermanentDelete = (id) => {
        setConfirmModal({
            open: true, title: 'Delete Permanently', variant: 'danger',
            message: 'This page will be permanently deleted. This action cannot be undone.',
            onConfirm: () => { dispatch(permanentDeleteThunk(id)); setConfirmModal(prev => ({ ...prev, open: false })) }
        })
    }

    const handleEmptyTrash = () => {
        setConfirmModal({
            open: true, title: 'Empty Trash', variant: 'danger',
            message: 'All trashed pages will be permanently deleted. This action cannot be undone.',
            onConfirm: () => { dispatch(emptyTrashThunk()); setConfirmModal(prev => ({ ...prev, open: false })) }
        })
    }

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        else { setSortKey(key); setSortDir('asc') }
        setPage(0)
    }

    const clearFilters = () => { setFilterStatus(''); setFilterPrivacy(''); setPage(0) }

    const processed = useMemo(() => {
        let result = [...(pages || [])]

        if (search) {
            const s = search.toLowerCase()
            result = result.filter(p => p.title?.toLowerCase().includes(s) || p.slug?.toLowerCase().includes(s))
        }
        if (filterStatus === 'published') result = result.filter(p => p.status === 'published')
        else if (filterStatus === 'draft') result = result.filter(p => p.status === 'draft')
        if (filterPrivacy === 'yes') result = result.filter(p => p.privacy)
        else if (filterPrivacy === 'no') result = result.filter(p => !p.privacy)

        result.sort((a, b) => {
            let va, vb
            switch (sortKey) {
                case 'title': va = a.title?.toLowerCase() || ''; vb = b.title?.toLowerCase() || ''; break
                case 'slug': va = a.slug || ''; vb = b.slug || ''; break
                case 'status': va = a.status || ''; vb = b.status || ''; break
                case 'privacy': va = a.privacy ? 1 : 0; vb = b.privacy ? 1 : 0; break
                case 'createdAt': va = a.createdAt || ''; vb = b.createdAt || ''; break
                case 'updatedAt':
                default: va = a.updatedAt || ''; vb = b.updatedAt || ''; break
            }
            if (va < vb) return sortDir === 'asc' ? -1 : 1
            if (va > vb) return sortDir === 'asc' ? 1 : -1
            return 0
        })

        return result
    }, [pages, search, filterStatus, filterPrivacy, sortKey, sortDir])

    const totalPages = Math.ceil(processed.length / pageSize)
    const pageData = processed.slice(page * pageSize, (page + 1) * pageSize)

    const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    const toggleSelectAll = () => { const ids = pageData.map(p => p._id); setSelectedIds(prev => ids.every(id => prev.includes(id)) ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]) }

    const handleImageUrlSubmit = async (e) => {
        e.preventDefault()
        if (!imageUrl.trim()) return
        setUploadingImage(true)
        await dispatch(uploadImagesThunk({ images: [imageUrl.trim()] }))
        setImageUrl('')
        setUploadingImage(false)
    }

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return
        setUploadingFile(true)
        try {
            const urls = []
            for (const file of files) {
                if (!file.type.startsWith('image/')) continue
                const blob = await put(`pages/${Date.now()}_${file.name}`, file, {
                    access: 'public',
                    token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
                })
                urls.push(blob.url)
            }
            if (urls.length) {
                await dispatch(uploadImagesThunk({ images: urls }))
            }
        } catch (err) {
            console.error('Image upload failed:', err)
        } finally {
            setUploadingFile(false)
            e.target.value = ''
        }
    }

    const handleImageDelete = async (imgId, url) => {
        if (imageDeleteConfirm === imgId) {
            if (url?.includes('vercel-storage')) {
                await del(url, { token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN }).catch(() => {})
            }
            await dispatch(deleteImageThunk(imgId))
            setImageDeleteConfirm(null)
        } else {
            setImageDeleteConfirm(imgId)
            setTimeout(() => setImageDeleteConfirm(null), 3000)
        }
    }

    const card = `rounded-xl border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-slate-200/80' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`
    const inputCls = `w-full px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`
    const selectCls = `px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all cursor-pointer ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`
    const btnPrimary = `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLight ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`
    const btnSecondary = `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300'}`

    if (!user) {
        return (
            <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                    <div className={styles.boxWidthEx}>
                        <div className="flex items-center justify-center py-32">
                            <div className={`text-center ${card} p-8`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                                    <FontAwesomeIcon icon={faFileAlt} className={`text-xl ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                                </div>
                                <h2 className={`text-lg font-semibold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>Login Required</h2>
                                <p className={`text-sm mb-5 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Please log in to manage your pages.</p>
                                <a href="/login" className={btnPrimary}>Login</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={styles.boxWidthEx}>
                    <div className="relative px-0 my-6 sm:my-12">

                        <Notification theme={theme} data={notification} show={showNotif} setShow={setShowNotif} />

                        {/* Confirm Modal */}
                        {confirmModal.open && (
                            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}>
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
                                <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transition-all ${isLight ? 'bg-white' : 'bg-[#161616]'}`}
                                    onClick={e => e.stopPropagation()}>
                                    <div className="p-6 text-center">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                                            confirmModal.variant === 'danger' ? (isLight ? 'bg-red-100' : 'bg-red-900/25')
                                            : confirmModal.variant === 'info' ? (isLight ? 'bg-blue-100' : 'bg-blue-900/25')
                                            : (isLight ? 'bg-amber-100' : 'bg-amber-900/25')
                                        }`}>
                                            <FontAwesomeIcon icon={faTrash}
                                                className={`text-xl ${
                                                    confirmModal.variant === 'danger' ? (isLight ? 'text-red-500' : 'text-red-400')
                                                    : confirmModal.variant === 'info' ? (isLight ? 'text-blue-500' : 'text-blue-400')
                                                    : (isLight ? 'text-amber-500' : 'text-amber-400')
                                                }`} />
                                        </div>
                                        <h3 className={`text-base font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>{confirmModal.title}</h3>
                                        <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{confirmModal.message}</p>
                                    </div>
                                    <div className="flex gap-3 px-6 pb-6">
                                        <button onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border border-solid ${isLight
                                                ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                                                : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300 border-[#333]'
                                            }`}>Cancel</button>
                                        <button onClick={confirmModal.onConfirm}
                                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-solid ${
                                                confirmModal.variant === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                                                : confirmModal.variant === 'info' ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
                                                : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                                            }`}>{confirmModal.variant === 'danger' ? 'Delete' : confirmModal.variant === 'info' ? 'Duplicate' : 'Move to Trash'}</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Header */}
                        <div className={`${card} p-4 sm:p-6 mb-4`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                                        <FontAwesomeIcon icon={faFileAlt} className={`text-base sm:text-lg ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                                    </div>
                                    <div>
                                        <h1 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Page Builder</h1>
                                        <p className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{pages?.length || 0} page{pages?.length !== 1 ? 's' : ''} created</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeTab === 'pages' && (
                                        <button onClick={handleCreate} disabled={creating} className={`flex items-center gap-1.5 ${btnPrimary}`}>
                                            <FontAwesomeIcon icon={creating ? faSpinner : faPlus} className={`text-xs ${creating ? 'animate-spin' : ''}`} /> New Page
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className={`flex items-center gap-1 mt-3 pt-3 border-t border-solid overflow-x-auto scrollbar-hide ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                <button onClick={() => setActiveTab('pages')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'pages'
                                        ? (isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/20 text-blue-400')
                                        : (isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]')
                                    }`}>
                                    <FontAwesomeIcon icon={faFileAlt} className="text-[10px]" /> My Pages
                                </button>
                                <button onClick={() => setActiveTab('images')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'images'
                                        ? (isLight ? 'bg-purple-50 text-purple-600' : 'bg-purple-900/20 text-purple-400')
                                        : (isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]')
                                    }`}>
                                    <FontAwesomeIcon icon={faImage} className="text-[10px]" /> Images
                                </button>
                                <button onClick={() => setActiveTab('trash')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'trash'
                                        ? (isLight ? 'bg-orange-50 text-orange-500' : 'bg-orange-900/20 text-orange-400')
                                        : (isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]')
                                    }`}>
                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Trash
                                    {trash?.length > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'trash'
                                            ? (isLight ? 'bg-orange-100 text-orange-500' : 'bg-orange-900/30 text-orange-400')
                                            : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500')
                                        }`}>{trash.length}</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* ========== PAGES TAB ========== */}
                        {activeTab === 'pages' && (
                            <div className={`${card} overflow-hidden`}>
                                {/* Toolbar */}
                                <div className={`flex flex-col gap-3 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setShowFilters(!showFilters)}
                                                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-solid transition-all ${showFilters
                                                    ? (isLight ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-blue-900/20 border-blue-700 text-blue-400')
                                                    : (isLight ? 'bg-white border-slate-200 text-slate-500 hover:border-slate-300' : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-[#444]')
                                                }`}>
                                                <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
                                                Filters
                                                {activeFilterCount > 0 && (
                                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">{activeFilterCount}</span>
                                                )}
                                            </button>
                                            {selectedIds.length > 0 && (
                                                <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all">
                                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Delete {selectedIds.length}
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative w-full sm:w-auto sm:max-w-xs">
                                            <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                            <input type="text" placeholder="Search title, slug..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                                                className={`${inputCls} pl-8`} />
                                        </div>
                                    </div>

                                    {showFilters && (
                                        <div className={`flex flex-wrap items-center gap-2 pt-2 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0) }}
                                                className={`${selectCls} text-xs py-1.5`}>
                                                <option value="">All Status</option>
                                                <option value="published">Published</option>
                                                <option value="draft">Draft</option>
                                            </select>
                                            <select value={filterPrivacy} onChange={(e) => { setFilterPrivacy(e.target.value); setPage(0) }}
                                                className={`${selectCls} text-xs py-1.5`}>
                                                <option value="">Privacy: All</option>
                                                <option value="yes">Private</option>
                                                <option value="no">Public</option>
                                            </select>
                                            {activeFilterCount > 0 && (
                                                <button onClick={clearFilters}
                                                    className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-all ${isLight ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/20'}`}>
                                                    <FontAwesomeIcon icon={faTimes} className="mr-1 text-[9px]" /> Clear
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Table */}
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className={`w-8 h-8 border-3 border-t-transparent rounded-full animate-spin ${isLight ? 'border-blue-500' : 'border-blue-400'}`} />
                                            <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Loading pages...</p>
                                        </div>
                                    </div>
                                ) : pageData.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400 bg-slate-50/50' : 'text-gray-500 bg-[#111]'}`}>
                                                    <th className="px-4 py-3 text-left w-10">
                                                        <input type="checkbox" checked={pageData.length > 0 && pageData.every(p => selectedIds.includes(p._id))} onChange={toggleSelectAll}
                                                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer" />
                                                    </th>
                                                    {[
                                                        { key: 'title', label: 'Title', align: 'text-left', hide: '' },
                                                        { key: 'slug', label: 'Slug', align: 'text-left', hide: 'hidden md:table-cell' },
                                                        { key: 'status', label: 'Status', align: 'text-center', hide: 'hidden sm:table-cell' },
                                                        { key: 'privacy', label: 'Privacy', align: 'text-center', hide: 'hidden sm:table-cell' },
                                                        { key: 'updatedAt', label: 'Updated', align: 'text-center', hide: 'hidden lg:table-cell' },
                                                    ].map(col => (
                                                        <th key={col.key}
                                                            onClick={() => handleSort(col.key)}
                                                            className={`px-4 py-3 ${col.align} ${col.hide} cursor-pointer select-none group/th hover:${isLight ? 'text-slate-600' : 'text-gray-300'} transition-colors`}>
                                                            <span className="inline-flex items-center gap-1">
                                                                {col.label}
                                                                <FontAwesomeIcon
                                                                    icon={sortKey === col.key ? (sortDir === 'asc' ? faSortUp : faSortDown) : faSort}
                                                                    className={`text-[9px] transition-colors ${sortKey === col.key
                                                                        ? (isLight ? 'text-blue-500' : 'text-blue-400')
                                                                        : (isLight ? 'text-slate-200 group-hover/th:text-slate-400' : 'text-gray-700 group-hover/th:text-gray-500')
                                                                    }`} />
                                                            </span>
                                                        </th>
                                                    ))}
                                                    <th className="px-4 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageData.map(p => (
                                                    <tr key={p._id} className={`group transition-colors ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-[#141414]'} border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                                        <td className="px-4 py-3">
                                                            <input type="checkbox" checked={selectedIds.includes(p._id)} onChange={() => toggleSelect(p._id)}
                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {p.thumbnail ? (
                                                                    <img src={p.thumbnail} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                                                                ) : (
                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-blue-50 text-blue-400' : 'bg-blue-900/20 text-blue-500'}`}>
                                                                        <FontAwesomeIcon icon={faFileAlt} />
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{p.title}</p>
                                                                    <p className={`text-[11px] truncate md:hidden ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>/{p.slug}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={`px-4 py-3 hidden md:table-cell text-xs font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>/{p.slug}</td>
                                                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${p.status === 'published'
                                                                ? (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400')
                                                                : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-gray-500')
                                                            }`}>{p.status}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                                                            <button onClick={() => dispatch(togglePrivacyThunk(p._id))}
                                                                className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${p.privacy
                                                                    ? (isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-400')
                                                                    : (isLight ? 'bg-slate-100 text-slate-300' : 'bg-[#1f1f1f] text-gray-600')
                                                                }`}>
                                                                <FontAwesomeIcon icon={p.privacy ? faLock : faLockOpen} className="text-xs" />
                                                            </button>
                                                        </td>
                                                        <td className={`px-4 py-3 text-center hidden lg:table-cell text-xs font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                            {new Date(p.updatedAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-end gap-1">
                                                                {p.status === 'published' && !p.privacy && (
                                                                    <a href={`/page/${p.slug}`} target="_blank" rel="noopener noreferrer" title="View"
                                                                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20'}`}>
                                                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                                                                    </a>
                                                                )}
                                                                <button onClick={() => navigate(`/pages/builder?id=${p._id}`)} title="Edit"
                                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-50' : 'text-amber-400 hover:text-amber-300 hover:bg-amber-900/20'}`}>
                                                                    <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                                                </button>
                                                                <button onClick={() => handleDuplicate(p._id)} title="Duplicate"
                                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-green-400 hover:text-green-600 hover:bg-green-50' : 'text-green-400 hover:text-green-300 hover:bg-green-900/20'}`}>
                                                                    <FontAwesomeIcon icon={faClone} className="text-[10px]" />
                                                                </button>
                                                                <button onClick={() => handleDelete(p._id)} title="Delete"
                                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-red-400 hover:text-red-300 hover:bg-red-900/20'}`}>
                                                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className={`flex flex-col items-center justify-center py-16 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                            <FontAwesomeIcon icon={faFileAlt} className="text-xl" />
                                        </div>
                                        <p className="text-sm font-medium">{search || activeFilterCount ? 'No pages match your criteria' : 'No pages created yet'}</p>
                                        {activeFilterCount > 0 && (
                                            <button onClick={clearFilters} className={`text-xs mt-2 underline ${isLight ? 'text-blue-500' : 'text-blue-400'}`}>Clear all filters</button>
                                        )}
                                        {!search && !activeFilterCount && <p className="text-xs mt-1">Click "New Page" to get started</p>}
                                    </div>
                                )}

                                {/* Footer: Pagination + Page size */}
                                {processed.length > 0 && (
                                    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <p className={`text-[11px] whitespace-nowrap ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                {page * pageSize + 1}–{Math.min((page + 1) * pageSize, processed.length)} of {processed.length}
                                            </p>
                                            <span className={`hidden sm:inline text-[11px] ${isLight ? 'text-slate-200' : 'text-gray-700'}`}>|</span>
                                            <div className="flex items-center gap-1.5">
                                                <label className={`text-[11px] hidden sm:inline ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Show</label>
                                                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
                                                    className={`${selectCls} text-[11px] py-1 px-2`}>
                                                    {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        {totalPages > 1 && (
                                            <div className="flex items-center gap-1">
                                                <button disabled={page === 0} onClick={() => setPage(0)}
                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                                    <FontAwesomeIcon icon={faAngleDoubleLeft} className="text-[10px]" />
                                                </button>
                                                <button disabled={page === 0} onClick={() => setPage(page - 1)}
                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                                    <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                                                </button>
                                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                    let pn
                                                    if (totalPages <= 5) pn = i
                                                    else if (page < 3) pn = i
                                                    else if (page > totalPages - 4) pn = totalPages - 5 + i
                                                    else pn = page - 2 + i
                                                    return (
                                                        <button key={pn} onClick={() => setPage(pn)}
                                                            className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-medium transition-all ${page === pn
                                                                ? (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                                                                : (isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400')
                                                            }`}>{pn + 1}</button>
                                                    )
                                                })}
                                                <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}
                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                                    <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                                </button>
                                                <button disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}
                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                                    <FontAwesomeIcon icon={faAngleDoubleRight} className="text-[10px]" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ========== IMAGES TAB ========== */}
                        {activeTab === 'images' && (
                            <div className={`${card} overflow-hidden`}>
                                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                                            <FontAwesomeIcon icon={faImage} className={`text-sm ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                                        </div>
                                        <div>
                                            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                                                Image Library
                                                <span className={`ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>{userImages.length}</span>
                                            </h3>
                                            <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Upload and manage images for all your pages</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-4 sm:px-5 py-4 space-y-4">
                                    <div className={`rounded-xl border-2 border-dashed p-4 ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-[#333] bg-[#111]'}`}>
                                        <div className="flex flex-col sm:flex-row items-stretch gap-3">
                                            <label className={`flex-1 flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-xl cursor-pointer transition-all ${uploadingFile ? 'opacity-50 pointer-events-none' : ''} ${isLight
                                                ? 'bg-white border border-solid border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-400 hover:text-blue-500'
                                                : 'bg-[#0e0e0e] border border-solid border-[#2B2B2B] hover:border-blue-500 hover:bg-blue-900/10 text-gray-500 hover:text-blue-400'
                                            }`}>
                                                {uploadingFile ? (
                                                    <>
                                                        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-xs font-medium">Uploading...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon icon={faCloudUploadAlt} className="text-2xl" />
                                                        <span className="text-xs font-medium">Upload Image</span>
                                                        <span className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>Click to browse or drag files</span>
                                                    </>
                                                )}
                                                <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" disabled={uploadingFile} />
                                            </label>

                                            <div className={`flex sm:flex-col items-center justify-center gap-2 text-[10px] font-medium ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>
                                                <div className={`h-px flex-1 sm:w-px sm:h-6 sm:flex-none ${isLight ? 'bg-slate-200' : 'bg-[#2B2B2B]'}`} />
                                                OR
                                                <div className={`h-px flex-1 sm:w-px sm:h-6 sm:flex-none ${isLight ? 'bg-slate-200' : 'bg-[#2B2B2B]'}`} />
                                            </div>

                                            <form onSubmit={handleImageUrlSubmit} className="flex-1 flex flex-col gap-2">
                                                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                                                    placeholder="Paste image URL..."
                                                    className={`${inputCls} text-xs py-2.5`} />
                                                <button type="submit" disabled={!imageUrl.trim() || uploadingImage}
                                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 ${isLight ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                                                    <FontAwesomeIcon icon={uploadingImage ? faSpinner : faPlus} className={`text-[10px] ${uploadingImage ? 'animate-spin' : ''}`} />
                                                    Add URL
                                                </button>
                                            </form>
                                        </div>
                                    </div>

                                    {userImages.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                            {userImages.map(img => (
                                                <div key={img._id} className={`group rounded-xl overflow-hidden relative ${isLight ? 'bg-white border border-solid border-slate-200/80' : 'bg-[#111] border border-solid border-[#2B2B2B]'}`}>
                                                    <div className="aspect-square overflow-hidden">
                                                        <img src={img.url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                                                    </div>
                                                    <div className="p-2">
                                                        <p className={`text-[10px] truncate ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{img.name || 'Image'}</p>
                                                    </div>
                                                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                        <a href={img.url} target="_blank" rel="noopener noreferrer"
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${isLight ? 'bg-white/80 text-slate-500 hover:text-blue-500' : 'bg-black/60 text-gray-400 hover:text-blue-400'}`}>
                                                            <FontAwesomeIcon icon={faEye} className="text-[8px]" />
                                                        </a>
                                                        <button onClick={() => handleImageDelete(img._id, img.url)}
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                                                                imageDeleteConfirm === img._id ? 'bg-red-500 text-white' : (isLight ? 'bg-white/80 text-slate-500 hover:text-red-500' : 'bg-black/60 text-gray-400 hover:text-red-400')
                                                            }`}>
                                                            <FontAwesomeIcon icon={imageDeleteConfirm === img._id ? faCheck : faTimes} className="text-[8px]" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={`flex flex-col items-center justify-center py-12 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                                <FontAwesomeIcon icon={faImage} className="text-xl" />
                                            </div>
                                            <p className="text-sm font-medium">No images yet</p>
                                            <p className="text-xs mt-1">Upload images to use across all your pages</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ========== TRASH TAB ========== */}
                        {activeTab === 'trash' && (
                            <div className={`${card} overflow-hidden`}>
                                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-orange-100' : 'bg-orange-900/30'}`}>
                                            <FontAwesomeIcon icon={faTrash} className={`text-sm ${isLight ? 'text-orange-500' : 'text-orange-400'}`} />
                                        </div>
                                        <div>
                                            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                                                Trash
                                                <span className={`ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>{trash?.length || 0}</span>
                                            </h3>
                                            <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Pages are permanently deleted after 10 days</p>
                                        </div>
                                    </div>
                                    {trash?.length > 0 && (
                                        <button onClick={handleEmptyTrash}
                                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-solid whitespace-nowrap self-start sm:self-auto ${isLight
                                                ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                                                : 'bg-red-900/20 text-red-400 border-red-800/30 hover:bg-red-900/30'
                                            }`}>
                                            <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Empty Trash
                                        </button>
                                    )}
                                </div>

                                {trashLoading ? (
                                    <div className={`flex items-center justify-center py-16 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : trash?.length > 0 ? (
                                    <div className={`divide-y divide-solid ${isLight ? 'divide-slate-100' : 'divide-[#1f1f1f]'}`}>
                                        {trash.map(p => {
                                            const daysLeft = getDaysRemaining(p.deletedAt)
                                            return (
                                                <div key={p._id} className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#111]'}`}>
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div className="relative w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden flex-shrink-0">
                                                            {p.thumbnail ? (
                                                                <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                                                            ) : (
                                                                <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                                                    <FontAwesomeIcon icon={faFileAlt} className={`text-sm ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className={`text-xs font-semibold truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{p.title}</h4>
                                                            <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>/{p.slug}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pl-[3.75rem] sm:pl-0">
                                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium flex-shrink-0 ${daysLeft <= 2
                                                            ? (isLight ? 'bg-red-50 text-red-500' : 'bg-red-900/20 text-red-400')
                                                            : daysLeft <= 5
                                                                ? (isLight ? 'bg-amber-50 text-amber-500' : 'bg-amber-900/20 text-amber-400')
                                                                : (isLight ? 'bg-slate-50 text-slate-500' : 'bg-white/5 text-gray-400')
                                                        }`}>
                                                            <FontAwesomeIcon icon={faClock} className="text-[8px]" />
                                                            {daysLeft}d left
                                                        </div>
                                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                                            <button onClick={() => handleRestore(p._id)}
                                                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border border-solid ${isLight
                                                                    ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                                                    : 'bg-green-900/20 text-green-400 border-green-800/30 hover:bg-green-900/30'
                                                                }`}>
                                                                <FontAwesomeIcon icon={faUndo} className="text-[9px]" /> Restore
                                                            </button>
                                                            <button onClick={() => handlePermanentDelete(p._id)}
                                                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border border-solid ${isLight
                                                                    ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                                                                    : 'bg-red-900/20 text-red-400 border-red-800/30 hover:bg-red-900/30'
                                                                }`}>
                                                                <FontAwesomeIcon icon={faTrash} className="text-[9px]" /> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className={`flex flex-col items-center justify-center py-16 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                            <FontAwesomeIcon icon={faTrash} className="text-xl" />
                                        </div>
                                        <p className="text-sm font-medium">Trash is empty</p>
                                        <p className="text-xs mt-1">Deleted pages will appear here for 10 days</p>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default PagesList
