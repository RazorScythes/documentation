import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faDatabase, faImage, faTrash, faSpinner, faCheck, faExclamationTriangle,
    faChevronLeft, faChevronRight, faSearch, faSync, faFileAlt, faCheckDouble,
    faXmark, faArrowUp, faArrowDown, faCopy, faFilter, faExpand, faDownload,
    faHardDrive
} from '@fortawesome/free-solid-svg-icons'
import * as api from '../../../endpoint'

const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0)} ${sizes[i]}`
}

const formatDate = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    catch { return '—' }
}

const getExt = (pathname) => {
    if (!pathname) return '—'
    const parts = pathname.split('.')
    return parts.length > 1 ? parts.pop().toUpperCase() : '—'
}

const getFileName = (pathname) => {
    if (!pathname) return '—'
    const parts = pathname.split('/')
    return parts.pop() || pathname
}

const BlobStorage = ({ user, theme, setNotification }) => {
    const isLight = theme === 'light'
    const isAdmin = user?.role === 'Admin'

    const [tab, setTab] = useState('all')
    const [stats, setStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(true)

    const [allBlobs, setAllBlobs] = useState([])
    const [allLoading, setAllLoading] = useState(false)
    const [allCursor, setAllCursor] = useState(null)
    const [allHasMore, setAllHasMore] = useState(false)
    const [allLoaded, setAllLoaded] = useState(false)

    const [unusedBlobs, setUnusedBlobs] = useState([])
    const [unusedLoading, setUnusedLoading] = useState(false)
    const [unusedStats, setUnusedStats] = useState({})

    const [selected, setSelected] = useState(new Set())
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState('uploadedAt')
    const [sortDir, setSortDir] = useState('desc')
    const [typeFilter, setTypeFilter] = useState('')
    const [page, setPage] = useState(1)
    const perPage = 25
    const [previewBlob, setPreviewBlob] = useState(null)

    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`
    const thClass = `px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500 bg-slate-50' : 'text-zinc-500 bg-[#111]'}`
    const tdClass = `px-3 py-2.5 text-sm ${isLight ? 'text-slate-700' : 'text-zinc-300'}`
    const divider = isLight ? 'border-slate-100' : 'border-[#222]'

    const loadStats = useCallback(async () => {
        setStatsLoading(true)
        try {
            const res = await api.getBlobStats()
            setStats(res.data.result)
        } catch { /* ignore */ }
        setStatsLoading(false)
    }, [])

    const loadAllBlobs = useCallback(async (reset = false) => {
        setAllLoading(true)
        try {
            const params = { limit: 1000 }
            if (!reset && allCursor) params.cursor = allCursor
            const res = await api.getBlobList(params)
            const data = res.data.result
            setAllBlobs(prev => reset ? data.blobs : [...prev, ...data.blobs])
            setAllCursor(data.cursor)
            setAllHasMore(data.hasMore)
            if (!data.hasMore) setAllLoaded(true)
        } catch { /* ignore */ }
        setAllLoading(false)
    }, [allCursor])

    const loadUnused = useCallback(async () => {
        setUnusedLoading(true)
        try {
            const res = await api.getUnusedBlobs()
            const data = res.data.result
            setUnusedBlobs(data.unused)
            setUnusedStats({ totalBlobs: data.totalBlobs, usedCount: data.usedCount, unusedCount: data.unusedCount })
        } catch { /* ignore */ }
        setUnusedLoading(false)
    }, [])

    useEffect(() => {
        if (!isAdmin) return
        loadStats()
    }, [isAdmin, loadStats])

    useEffect(() => {
        if (!isAdmin) return
        if (tab === 'all' && allBlobs.length === 0 && !allLoaded) loadAllBlobs(true)
        if (tab === 'unused' && unusedBlobs.length === 0) loadUnused()
    }, [tab, isAdmin])

    const handleRefresh = () => {
        setSelected(new Set())
        if (tab === 'all') {
            setAllBlobs([])
            setAllCursor(null)
            setAllHasMore(false)
            setAllLoaded(false)
            loadAllBlobs(true)
        } else {
            loadUnused()
        }
        loadStats()
    }

    const currentBlobs = tab === 'all' ? allBlobs : unusedBlobs

    const uniqueTypes = useMemo(() => {
        const types = new Set()
        currentBlobs.forEach(b => types.add(getExt(b.pathname)))
        return Array.from(types).sort()
    }, [currentBlobs])

    const filteredSorted = useMemo(() => {
        let items = [...currentBlobs]
        if (search) {
            const q = search.toLowerCase()
            items = items.filter(b => (b.pathname || '').toLowerCase().includes(q) || (b.url || '').toLowerCase().includes(q))
        }
        if (typeFilter) {
            items = items.filter(b => getExt(b.pathname) === typeFilter)
        }
        items.sort((a, b) => {
            let va = a[sortField], vb = b[sortField]
            if (sortField === 'size') { va = va || 0; vb = vb || 0 }
            if (sortField === 'uploadedAt') { va = new Date(va || 0).getTime(); vb = new Date(vb || 0).getTime() }
            if (sortField === 'pathname') { va = (va || '').toLowerCase(); vb = (vb || '').toLowerCase() }
            if (va < vb) return sortDir === 'asc' ? -1 : 1
            if (va > vb) return sortDir === 'asc' ? 1 : -1
            return 0
        })
        return items
    }, [currentBlobs, search, typeFilter, sortField, sortDir])

    const totalPages = Math.max(1, Math.ceil(filteredSorted.length / perPage))
    const pageItems = filteredSorted.slice((page - 1) * perPage, page * perPage)

    useEffect(() => { setPage(1) }, [search, typeFilter, tab])
    useEffect(() => { setSelected(new Set()) }, [tab])

    const toggleSelect = (url) => {
        setSelected(prev => {
            const next = new Set(prev)
            next.has(url) ? next.delete(url) : next.add(url)
            return next
        })
    }

    const toggleSelectAll = () => {
        if (selected.size === pageItems.length) {
            setSelected(new Set())
        } else {
            setSelected(new Set(pageItems.map(b => b.url)))
        }
    }

    const selectAllFiltered = () => {
        setSelected(new Set(filteredSorted.map(b => b.url)))
    }

    const handleDelete = async () => {
        if (selected.size === 0) return
        setDeleting(true)
        try {
            const res = await api.deleteBlobs(Array.from(selected))
            const data = res.data
            setNotification?.(data.alert || { message: `Deleted ${data.result?.deleted || 0} file(s)`, variant: 'success' })

            const deletedUrls = new Set(selected)
            setAllBlobs(prev => prev.filter(b => !deletedUrls.has(b.url)))
            setUnusedBlobs(prev => prev.filter(b => !deletedUrls.has(b.url)))
            setSelected(new Set())
            loadStats()
        } catch (err) {
            setNotification?.({ message: err.response?.data?.alert?.message || 'Delete failed', variant: 'danger' })
        }
        setDeleting(false)
        setConfirmDelete(false)
    }

    const imageBlobs = useMemo(() => filteredSorted.filter(b => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(b.pathname || '')), [filteredSorted])
    const previewIndex = previewBlob ? imageBlobs.findIndex(b => b.url === previewBlob.url) : -1

    const navigatePreview = (dir) => {
        if (imageBlobs.length === 0) return
        const next = previewIndex + dir
        if (next >= 0 && next < imageBlobs.length) setPreviewBlob(imageBlobs[next])
    }

    useEffect(() => {
        if (!previewBlob) return
        const onKey = (e) => {
            if (e.key === 'Escape') setPreviewBlob(null)
            if (e.key === 'ArrowLeft') navigatePreview(-1)
            if (e.key === 'ArrowRight') navigatePreview(1)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [previewBlob, previewIndex])

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDir('desc')
        }
    }

    const SortIcon = ({ field }) => {
        if (sortField !== field) return null
        return <FontAwesomeIcon icon={sortDir === 'asc' ? faArrowUp : faArrowDown} className="h-2.5 w-2.5 ml-1" />
    }

    if (!isAdmin) {
        return (
            <div className="p-8 text-center">
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Admin access required.</p>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <FontAwesomeIcon icon={faDatabase} className="mr-2 text-indigo-500" />
                        Blob Storage
                    </h2>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                        Monitor and manage Vercel Blob storage
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={allLoading || unusedLoading || statsLoading}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${isLight ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50' : 'border-[#333] text-zinc-200 bg-[#222] hover:bg-[#2a2a2a]'}`}
                >
                    <FontAwesomeIcon icon={faSync} className={`h-3 w-3 ${(allLoading || unusedLoading || statsLoading) ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Usage Bar */}
            {!statsLoading && stats?.storageLimit > 0 && (
                <div className={panelClass}>
                    <div className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faHardDrive} className={`h-4 w-4 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`} />
                                <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>Storage Usage</h3>
                            </div>
                            <p className={`text-sm tabular-nums ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                                <span className="font-semibold">{formatBytes(stats.totalSize)}</span>
                                <span className={isLight ? 'text-slate-400' : 'text-zinc-600'}> / </span>
                                <span>{formatBytes(stats.storageLimit)}</span>
                            </p>
                        </div>
                        <div className={`w-full h-3 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`}>
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    stats.usagePercent > 90 ? 'bg-red-500' : stats.usagePercent > 70 ? 'bg-amber-500' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${Math.max(0.5, stats.usagePercent)}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <p className={`text-xs tabular-nums ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                                {stats.usagePercent}% used
                            </p>
                            <p className={`text-xs tabular-nums ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                                {formatBytes(stats.remaining)} remaining
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                    { label: 'Total Files', value: statsLoading ? '...' : (stats?.totalCount?.toLocaleString() ?? '—'), icon: faFileAlt, iconClass: isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/15 text-indigo-400' },
                    { label: 'Used', value: statsLoading ? '...' : formatBytes(stats?.totalSize), icon: faDatabase, iconClass: isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/15 text-blue-400' },
                    { label: 'Remaining', value: statsLoading ? '...' : formatBytes(stats?.remaining), icon: faHardDrive, iconClass: isLight ? 'bg-cyan-100 text-cyan-600' : 'bg-cyan-500/15 text-cyan-400' },
                    { label: 'Images', value: statsLoading ? '...' : Object.entries(stats?.byType || {}).filter(([k]) => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(k)).reduce((s, [, v]) => s + v.count, 0).toLocaleString(), icon: faImage, iconClass: isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/15 text-emerald-400' },
                    { label: 'Unused Files', value: unusedStats.unusedCount != null ? unusedStats.unusedCount.toLocaleString() : (unusedLoading ? '...' : '—'), icon: faTrash, iconClass: isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/15 text-amber-400' },
                ].map((card) => (
                    <div key={card.label} className={`${panelClass} p-3 sm:p-4`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${card.iconClass}`}>
                                <FontAwesomeIcon icon={card.icon} className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-lg font-bold leading-tight tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>{card.value}</p>
                                <p className={`text-[10px] font-medium uppercase tracking-wide ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>{card.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* File Type Breakdown */}
            {stats?.byType && Object.keys(stats.byType).length > 0 && (
                <div className={panelClass}>
                    <div className={`px-4 py-3 border-b ${divider}`}>
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Storage by File Type</h3>
                    </div>
                    <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(stats.byType).sort((a, b) => b[1].size - a[1].size).map(([ext, data]) => (
                                <div key={ext} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#333] bg-[#222]'}`}>
                                    <span className={`font-semibold uppercase ${isLight ? 'text-slate-700' : 'text-zinc-200'}`}>.{ext}</span>
                                    <span className={isLight ? 'text-slate-400' : 'text-zinc-600'}>|</span>
                                    <span className={`tabular-nums ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>{data.count} file{data.count !== 1 ? 's' : ''}</span>
                                    <span className={isLight ? 'text-slate-400' : 'text-zinc-600'}>|</span>
                                    <span className={`tabular-nums ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>{formatBytes(data.size)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Bar */}
            <div className={`flex border-b ${divider}`}>
                {[
                    { id: 'all', label: 'All Files', count: allBlobs.length },
                    { id: 'unused', label: 'Unused Files', count: unusedBlobs.length },
                ].map(t => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t.id
                            ? (isLight ? 'border-indigo-600 text-indigo-600' : 'border-indigo-400 text-indigo-400')
                            : (isLight ? 'border-transparent text-slate-500 hover:text-slate-700' : 'border-transparent text-zinc-500 hover:text-zinc-300')
                        }`}
                    >
                        {t.label}
                        <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tab === t.id
                            ? (isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-300')
                            : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#333] text-zinc-500')
                        }`}>
                            {t.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="flex gap-2 flex-1 min-w-0">
                    <div className="relative flex-1 max-w-xs">
                        <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 ${isLight ? 'text-slate-400' : 'text-zinc-600'}`} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search files..."
                            className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm ${isLight ? 'border-slate-200 bg-white text-slate-700 placeholder-slate-400' : 'border-[#333] bg-[#222] text-zinc-100 placeholder-zinc-600'}`}
                        />
                    </div>
                    <div className="relative">
                        <FontAwesomeIcon icon={faFilter} className={`absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 ${isLight ? 'text-slate-400' : 'text-zinc-600'}`} />
                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                            className={`pl-9 pr-8 py-2 rounded-lg border text-sm appearance-none cursor-pointer ${isLight ? 'border-slate-200 bg-white text-slate-700' : 'border-[#333] bg-[#222] text-zinc-100'}`}
                        >
                            <option value="">All types</option>
                            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {selected.size > 0 && (
                        <>
                            <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                                {selected.size} selected
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelected(new Set())}
                                className={`px-2 py-1 rounded text-xs font-medium ${isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-zinc-500 hover:bg-[#333]'}`}
                            >
                                <FontAwesomeIcon icon={faXmark} className="mr-1 h-2.5 w-2.5" />Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(true)}
                                disabled={deleting}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${deleting ? 'opacity-50 cursor-not-allowed' : ''} ${isLight ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-600 text-white hover:bg-red-500'}`}
                            >
                                <FontAwesomeIcon icon={deleting ? faSpinner : faTrash} className={`h-3 w-3 ${deleting ? 'animate-spin' : ''}`} />
                                Delete ({selected.size})
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(false)}>
                    <div className={`${panelClass} p-6 max-w-md w-full mx-4`} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-400'}`}>
                                <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Confirm Delete</h3>
                                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className={`text-sm mb-4 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                            Are you sure you want to permanently delete <span className="font-bold">{selected.size}</span> file{selected.size !== 1 ? 's' : ''}?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setConfirmDelete(false)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${isLight ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-[#333] text-zinc-300 hover:bg-[#333]'}`}>
                                Cancel
                            </button>
                            <button type="button" onClick={handleDelete} disabled={deleting} className={`px-4 py-2 rounded-lg text-sm font-semibold ${deleting ? 'opacity-50' : ''} bg-red-600 text-white hover:bg-red-700`}>
                                {deleting ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-1.5 h-3 w-3" /> Deleting...</> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Viewer */}
            {previewBlob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setPreviewBlob(null)}>
                    {/* Close */}
                    <button
                        type="button"
                        onClick={() => setPreviewBlob(null)}
                        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                    >
                        <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
                    </button>

                    {/* Prev */}
                    {previewIndex > 0 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigatePreview(-1) }}
                            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
                        </button>
                    )}

                    {/* Next */}
                    {previewIndex < imageBlobs.length - 1 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigatePreview(1) }}
                            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                        >
                            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
                        </button>
                    )}

                    {/* Image */}
                    <div className="max-w-[90vw] max-h-[85vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <img
                            src={previewBlob.url}
                            alt={previewBlob.pathname || ''}
                            className="max-w-full max-h-[75vh] object-contain rounded-lg"
                        />
                        <div className="mt-3 flex items-center gap-3 bg-black/60 rounded-lg px-4 py-2.5">
                            <p className="text-white text-sm font-medium truncate max-w-[40vw]" title={previewBlob.pathname}>
                                {getFileName(previewBlob.pathname)}
                            </p>
                            <span className="text-white/40">|</span>
                            <span className="text-white/70 text-xs tabular-nums">{formatBytes(previewBlob.size)}</span>
                            <span className="text-white/40">|</span>
                            <span className="text-white/70 text-xs">{getExt(previewBlob.pathname)}</span>
                            <span className="text-white/40">|</span>
                            <span className="text-white/50 text-xs tabular-nums">
                                {previewIndex + 1} / {imageBlobs.length}
                            </span>
                            <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(previewBlob.url)}
                                className="text-white/70 hover:text-white p-1 transition-colors"
                                title="Copy URL"
                            >
                                <FontAwesomeIcon icon={faCopy} className="h-3.5 w-3.5" />
                            </button>
                            <a
                                href={previewBlob.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/70 hover:text-white p-1 transition-colors"
                                title="Open in new tab"
                            >
                                <FontAwesomeIcon icon={faExpand} className="h-3.5 w-3.5" />
                            </a>
                            <a
                                href={previewBlob.url}
                                download
                                className="text-white/70 hover:text-white p-1 transition-colors"
                                title="Download"
                            >
                                <FontAwesomeIcon icon={faDownload} className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className={`${panelClass} overflow-hidden`}>
                {(tab === 'all' && allLoading && allBlobs.length === 0) || (tab === 'unused' && unusedLoading) ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <FontAwesomeIcon icon={faSpinner} className={`h-6 w-6 animate-spin mb-3 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                        <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                            {tab === 'unused' ? 'Scanning for unused files...' : 'Loading files...'}
                        </p>
                    </div>
                ) : filteredSorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <FontAwesomeIcon icon={faCheck} className={`h-6 w-6 mb-3 ${isLight ? 'text-emerald-500' : 'text-emerald-400'}`} />
                        <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                            {tab === 'unused' ? 'No unused files found' : (search || typeFilter ? 'No files match your filter' : 'No files found')}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className={`border-b ${divider}`}>
                                        <th className={`${thClass} w-10`}>
                                            <button type="button" onClick={toggleSelectAll} className={`w-5 h-5 rounded border flex items-center justify-center ${selected.size === pageItems.length && pageItems.length > 0 ? (isLight ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-indigo-600 border-indigo-600 text-white') : (isLight ? 'border-slate-300 bg-white' : 'border-[#444] bg-[#222]')}`}>
                                                {selected.size === pageItems.length && pageItems.length > 0 && <FontAwesomeIcon icon={faCheck} className="h-2.5 w-2.5" />}
                                            </button>
                                        </th>
                                        <th className={`${thClass} w-12`}>Preview</th>
                                        <th className={thClass}>
                                            <button type="button" onClick={() => handleSort('pathname')} className="flex items-center gap-1 hover:opacity-80">
                                                File Name <SortIcon field="pathname" />
                                            </button>
                                        </th>
                                        <th className={`${thClass} w-20`}>Type</th>
                                        <th className={thClass}>
                                            <button type="button" onClick={() => handleSort('size')} className="flex items-center gap-1 hover:opacity-80">
                                                Size <SortIcon field="size" />
                                            </button>
                                        </th>
                                        <th className={thClass}>
                                            <button type="button" onClick={() => handleSort('uploadedAt')} className="flex items-center gap-1 hover:opacity-80">
                                                Uploaded <SortIcon field="uploadedAt" />
                                            </button>
                                        </th>
                                        <th className={`${thClass} w-10`}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageItems.map((blob) => {
                                        const isSelected = selected.has(blob.url)
                                        const isImg = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(blob.pathname || '')
                                        return (
                                            <tr
                                                key={blob.url}
                                                className={`border-b ${divider} transition-colors ${isSelected
                                                    ? (isLight ? 'bg-indigo-50/50' : 'bg-indigo-950/20')
                                                    : (isLight ? 'hover:bg-slate-50/50' : 'hover:bg-[#1e1e1e]')
                                                }`}
                                            >
                                                <td className={tdClass}>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSelect(blob.url)}
                                                        className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : (isLight ? 'border-slate-300 bg-white' : 'border-[#444] bg-[#222]')}`}
                                                    >
                                                        {isSelected && <FontAwesomeIcon icon={faCheck} className="h-2.5 w-2.5" />}
                                                    </button>
                                                </td>
                                                <td className={tdClass}>
                                                    {isImg ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewBlob(blob)}
                                                            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                                                        >
                                                            <img src={blob.url} alt="" className={`w-9 h-9 rounded object-cover border cursor-pointer hover:opacity-80 transition-opacity ${isLight ? 'border-slate-200' : 'border-[#333]'}`} loading="lazy" />
                                                        </button>
                                                    ) : (
                                                        <div className={`w-9 h-9 rounded flex items-center justify-center border ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#333] bg-[#222]'}`}>
                                                            <FontAwesomeIcon icon={faFileAlt} className={`h-3.5 w-3.5 ${isLight ? 'text-slate-400' : 'text-zinc-600'}`} />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className={tdClass}>
                                                    <div className="max-w-[250px]">
                                                        <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-zinc-200'}`} title={blob.pathname}>
                                                            {getFileName(blob.pathname)}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className={tdClass}>
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#333] text-zinc-400'}`}>
                                                        {getExt(blob.pathname)}
                                                    </span>
                                                </td>
                                                <td className={`${tdClass} tabular-nums`}>{formatBytes(blob.size)}</td>
                                                <td className={`${tdClass} text-xs`}>{formatDate(blob.uploadedAt)}</td>
                                                <td className={tdClass}>
                                                    <button
                                                        type="button"
                                                        onClick={() => { navigator.clipboard.writeText(blob.url) }}
                                                        className={`p-1.5 rounded ${isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-zinc-600 hover:text-zinc-300 hover:bg-[#333]'}`}
                                                        title="Copy URL"
                                                    >
                                                        <FontAwesomeIcon icon={faCopy} className="h-3 w-3" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Bulk select bar */}
                        {filteredSorted.length > perPage && selected.size > 0 && selected.size < filteredSorted.length && (
                            <div className={`px-4 py-2 border-t ${divider} flex items-center justify-center`}>
                                <button
                                    type="button"
                                    onClick={selectAllFiltered}
                                    className={`text-xs font-medium ${isLight ? 'text-indigo-600 hover:underline' : 'text-indigo-400 hover:underline'}`}
                                >
                                    <FontAwesomeIcon icon={faCheckDouble} className="mr-1 h-2.5 w-2.5" />
                                    Select all {filteredSorted.length} files
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className={`px-4 py-3 border-t ${divider} flex flex-col sm:flex-row items-center justify-between gap-2`}>
                            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                                Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, filteredSorted.length)} of {filteredSorted.length} files
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`w-8 h-8 rounded flex items-center justify-center text-xs ${page === 1 ? 'opacity-40 cursor-not-allowed' : (isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-[#333] text-zinc-400')}`}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const pn = totalPages <= 5 ? i + 1 : Math.min(Math.max(page - 2, 1), totalPages - 4) + i
                                    return (
                                        <button
                                            type="button"
                                            key={pn}
                                            onClick={() => setPage(pn)}
                                            className={`w-8 h-8 rounded text-xs font-medium ${page === pn ? (isLight ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white') : (isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-zinc-400 hover:bg-[#333]')}`}
                                        >
                                            {pn}
                                        </button>
                                    )
                                })}
                                <button
                                    type="button"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className={`w-8 h-8 rounded flex items-center justify-center text-xs ${page === totalPages ? 'opacity-40 cursor-not-allowed' : (isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-[#333] text-zinc-400')}`}
                                >
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Load More (all tab) */}
            {tab === 'all' && allHasMore && (
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => loadAllBlobs(false)}
                        disabled={allLoading}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${allLoading ? 'opacity-50' : ''} ${isLight ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50' : 'border-[#333] text-zinc-200 bg-[#222] hover:bg-[#2a2a2a]'}`}
                    >
                        <FontAwesomeIcon icon={allLoading ? faSpinner : faSync} className={`h-3 w-3 ${allLoading ? 'animate-spin' : ''}`} />
                        {allLoading ? 'Loading...' : 'Load more files'}
                    </button>
                </div>
            )}
        </div>
    )
}

export default BlobStorage
