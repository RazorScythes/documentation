import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faDatabase, faSpinner, faSync, faHardDrive,
    faArrowUp, faArrowDown, faSearch, faLayerGroup,
    faCubes, faChartPie, faCircle, faChevronRight, faServer,
    faLink, faLock, faXmark, faChevronLeft, faEye, faPlus,
    faChevronDown
} from '@fortawesome/free-solid-svg-icons'
import * as api from '../../../endpoint'

const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0)} ${sizes[i]}`
}

const formatNumber = (n) => {
    if (n == null) return '—'
    return n.toLocaleString()
}

const barColors = [
    'bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-purple-500', 'bg-rose-500', 'bg-cyan-500', 'bg-orange-500',
]
const barColorsDark = [
    'bg-indigo-400', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400',
    'bg-purple-400', 'bg-rose-400', 'bg-cyan-400', 'bg-orange-400',
]
const dotColors = [
    'text-indigo-500', 'text-blue-500', 'text-emerald-500', 'text-amber-500',
    'text-purple-500', 'text-rose-500', 'text-cyan-500', 'text-orange-500',
]
const dotColorsDark = [
    'text-indigo-400', 'text-blue-400', 'text-emerald-400', 'text-amber-400',
    'text-purple-400', 'text-rose-400', 'text-cyan-400', 'text-orange-400',
]

const JsonValue = ({ value, isLight, depth = 0 }) => {
    if (value === null) return <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>null</span>
    if (value === undefined) return <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>undefined</span>
    if (typeof value === 'boolean') return <span className={isLight ? 'text-purple-600' : 'text-purple-400'}>{value.toString()}</span>
    if (typeof value === 'number') return <span className={isLight ? 'text-blue-600' : 'text-blue-400'}>{value}</span>
    if (typeof value === 'string') {
        if (value.length > 200) return <span className={isLight ? 'text-emerald-700' : 'text-emerald-400'}>"{value.slice(0, 200)}..."</span>
        return <span className={isLight ? 'text-emerald-700' : 'text-emerald-400'}>"{value}"</span>
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>[]</span>
        if (depth > 2) return <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>[{value.length} items]</span>
        return (
            <div className="pl-4">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>[</span>
                {value.slice(0, 10).map((item, i) => (
                    <div key={i} className="pl-2">
                        <JsonValue value={item} isLight={isLight} depth={depth + 1} />
                        {i < Math.min(value.length, 10) - 1 && <span className={isLight ? 'text-slate-400' : 'text-zinc-600'}>,</span>}
                    </div>
                ))}
                {value.length > 10 && <div className={`pl-2 text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>... {value.length - 10} more</div>}
                <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>]</span>
            </div>
        )
    }
    if (typeof value === 'object') {
        const entries = Object.entries(value)
        if (entries.length === 0) return <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>{'{}'}</span>
        if (depth > 2) return <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>{'{'}{entries.length} fields{'}'}</span>
        return (
            <div className="pl-4">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>{'{'}</span>
                {entries.slice(0, 20).map(([k, v], i) => (
                    <div key={k} className="pl-2">
                        <span className={isLight ? 'text-rose-600' : 'text-rose-400'}>"{k}"</span>
                        <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>: </span>
                        <JsonValue value={v} isLight={isLight} depth={depth + 1} />
                        {i < Math.min(entries.length, 20) - 1 && <span className={isLight ? 'text-slate-400' : 'text-zinc-600'}>,</span>}
                    </div>
                ))}
                {entries.length > 20 && <div className={`pl-2 text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>... {entries.length - 20} more fields</div>}
                <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>{'}'}</span>
            </div>
        )
    }
    return <span>{String(value)}</span>
}

const MongoStorage = ({ user, theme }) => {
    const isLight = theme === 'light'
    const isAdmin = user?.role === 'Admin'

    const [stats, setStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(true)

    const [selectedDb, setSelectedDb] = useState(null)
    const [collections, setCollections] = useState([])
    const [collectionsLoading, setCollectionsLoading] = useState(false)

    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState('totalSize')
    const [sortDir, setSortDir] = useState('desc')

    const [viewingCol, setViewingCol] = useState(null)
    const [docs, setDocs] = useState([])
    const [docsLoading, setDocsLoading] = useState(false)
    const [docsPage, setDocsPage] = useState(1)
    const [docsMeta, setDocsMeta] = useState({ total: 0, totalPages: 0 })
    const [expandedDoc, setExpandedDoc] = useState(null)

    const [connOpen, setConnOpen] = useState(false)
    const [createDbOpen, setCreateDbOpen] = useState(false)
    const [newDbName, setNewDbName] = useState('')
    const [creating, setCreating] = useState(false)

    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`
    const thClass = `px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500 bg-slate-50/80' : 'text-zinc-500 bg-[#141414]'}`
    const tdClass = `px-3 py-2.5 text-sm ${isLight ? 'text-slate-700' : 'text-zinc-300'}`

    const loadStats = useCallback(async () => {
        setStatsLoading(true)
        try {
            const { data } = await api.getMongoStats()
            setStats(data.result)
        } catch { setStats(null) }
        setStatsLoading(false)
    }, [])

    const loadCollections = useCallback(async (dbName) => {
        setCollectionsLoading(true)
        try {
            const { data } = await api.getMongoCollections(dbName)
            setCollections(data.result || [])
        } catch { setCollections([]) }
        setCollectionsLoading(false)
    }, [])

    const loadDocuments = useCallback(async (colName, page = 1) => {
        if (!selectedDb || !colName) return
        setDocsLoading(true)
        try {
            const { data } = await api.getMongoDocuments({ db: selectedDb, collection: colName, page, limit: 20 })
            const r = data.result
            setDocs(r.documents || [])
            setDocsMeta({ total: r.total, totalPages: r.totalPages })
            setDocsPage(r.page)
        } catch { setDocs([]); setDocsMeta({ total: 0, totalPages: 0 }) }
        setDocsLoading(false)
    }, [selectedDb])

    useEffect(() => {
        if (!isAdmin) return
        loadStats()
    }, [isAdmin, loadStats])

    useEffect(() => {
        if (!selectedDb) { setCollections([]); setViewingCol(null); return }
        setSearch('')
        setSortField('totalSize')
        setSortDir('desc')
        setViewingCol(null)
        loadCollections(selectedDb)
    }, [selectedDb, loadCollections])

    useEffect(() => {
        if (!viewingCol) { setDocs([]); setDocsMeta({ total: 0, totalPages: 0 }); setExpandedDoc(null); return }
        setDocsPage(1)
        setExpandedDoc(null)
        loadDocuments(viewingCol, 1)
    }, [viewingCol, loadDocuments])

    const handleRefresh = () => {
        loadStats()
        if (selectedDb) loadCollections(selectedDb)
        if (viewingCol) loadDocuments(viewingCol, docsPage)
    }

    const handleCreateDb = async () => {
        if (!newDbName.trim()) return
        setCreating(true)
        try {
            await api.createMongoDatabase(newDbName.trim())
            setNewDbName('')
            setCreateDbOpen(false)
            loadStats()
        } catch { /* error handled by API */ }
        setCreating(false)
    }

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
        return <FontAwesomeIcon icon={sortDir === 'asc' ? faArrowUp : faArrowDown} className="h-2.5 w-2.5 ml-1 opacity-60" />
    }

    const filteredSorted = useMemo(() => {
        let list = [...collections]
        if (search) {
            const q = search.toLowerCase()
            list = list.filter(c => c.name.toLowerCase().includes(q))
        }
        list.sort((a, b) => {
            const av = a[sortField] ?? 0
            const bv = b[sortField] ?? 0
            if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
            return sortDir === 'asc' ? av - bv : bv - av
        })
        return list
    }, [collections, search, sortField, sortDir])

    const totalDocs = collections.reduce((s, c) => s + c.count, 0)
    const totalDataSize = collections.reduce((s, c) => s + c.size, 0)
    const totalIndexSize = collections.reduce((s, c) => s + c.indexSize, 0)

    const topCollections = useMemo(() =>
        [...collections].sort((a, b) => b.totalSize - a.totalSize).slice(0, 8),
        [collections]
    )

    const databases = stats?.databases || []
    const conn = stats?.connection || {}
    const server = stats?.server || {}
    const clusterTotalCollections = stats?.totalCollections || databases.reduce((s, d) => s + d.collections, 0)

    const getDocPreview = (doc) => {
        const id = doc._id?.$oid || doc._id || '—'
        const keys = Object.keys(doc).filter(k => k !== '_id')
        const nameField = keys.find(k => ['name', 'title', 'username', 'email', 'slug', 'label'].includes(k))
        return { id: typeof id === 'string' ? id : JSON.stringify(id), label: nameField ? String(doc[nameField]) : null, fields: keys.length }
    }

    if (!isAdmin) {
        return (
            <div className="p-6 text-center">
                <FontAwesomeIcon icon={faDatabase} className={`h-10 w-10 mb-3 ${isLight ? 'text-slate-300' : 'text-zinc-600'}`} />
                <p className={`text-sm font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Admin access required</p>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/15 text-emerald-400'}`}>
                        <FontAwesomeIcon icon={faDatabase} className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>MongoDB Storage</h2>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                            {databases.length > 0 ? `${databases.length} database${databases.length > 1 ? 's' : ''} in cluster` : 'Monitor database usage & collections'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={statsLoading}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isLight ? 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50' : 'border-[#333] text-zinc-400 bg-[#1a1a1a] hover:bg-[#222]'} disabled:opacity-40`}
                >
                    <FontAwesomeIcon icon={faSync} className={`h-3 w-3 ${statsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Connection Info (collapsible) */}
            {!statsLoading && conn.host && (
                <div className={panelClass}>
                    <button
                        onClick={() => setConnOpen(o => !o)}
                        className={`w-full p-4 sm:p-5 flex items-center justify-between ${connOpen ? `border-b ${isLight ? 'border-slate-100' : 'border-[#2a2a2a]'}` : ''}`}
                    >
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faLink} className={`h-4 w-4 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`} />
                            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>Connection Details</h3>
                            {!connOpen && (
                                <span className={`text-xs font-normal ml-2 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                                    {conn.host}{selectedDb ? ` / ${selectedDb}` : ''}
                                </span>
                            )}
                        </div>
                        <FontAwesomeIcon icon={faChevronDown} className={`h-3 w-3 transition-transform ${connOpen ? 'rotate-180' : ''} ${isLight ? 'text-slate-400' : 'text-zinc-600'}`} />
                    </button>
                    {connOpen && (
                        <div className="p-4 sm:p-5">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
                                {[
                                    { label: 'Host', value: conn.host },
                                    { label: 'Protocol', value: conn.protocol },
                                    { label: 'Port', value: conn.port },
                                    { label: 'User', value: conn.user },
                                    { label: 'Database', value: selectedDb || conn.defaultDb },
                                    { label: 'SSL/TLS', value: conn.ssl ? 'Enabled' : 'Disabled' },
                                    ...(server.version ? [{ label: 'Server Version', value: server.version }] : []),
                                    ...(conn.replicaSet ? [{ label: 'Replica Set', value: conn.replicaSet }] : []),
                                ].map((item) => (
                                    <div key={item.label}>
                                        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>{item.label}</p>
                                        <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                                            {item.label === 'SSL/TLS' && conn.ssl && <FontAwesomeIcon icon={faLock} className="h-2.5 w-2.5 mr-1 text-emerald-500" />}
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className={`mt-4 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-[#2a2a2a]'}`}>
                                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Connection String</p>
                                <code className={`block text-xs px-3 py-2 rounded-lg select-all break-all ${isLight ? 'bg-slate-50 text-slate-600 border border-slate-200' : 'bg-[#111] text-zinc-400 border border-[#333]'}`}>
                                    {conn.protocol}://{conn.user}:****@{conn.host}/{selectedDb || conn.defaultDb}
                                </code>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Storage Usage Bar */}
            {!statsLoading && stats?.storageLimit > 0 && (
                <div className={panelClass}>
                    <div className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faHardDrive} className={`h-4 w-4 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`} />
                                <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>Cluster Storage Usage</h3>
                            </div>
                            <p className={`text-sm tabular-nums ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                                <span className="font-semibold">{formatBytes(stats.clusterTotalSize)}</span>
                                <span className={isLight ? 'text-slate-400' : 'text-zinc-600'}> / </span>
                                <span>{formatBytes(stats.storageLimit)}</span>
                            </p>
                        </div>
                        <div className={`w-full h-3 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`}>
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    stats.usagePercent > 90 ? 'bg-red-500' : stats.usagePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Databases', value: statsLoading ? '...' : formatNumber(stats?.databaseCount), icon: faServer, iconClass: isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/15 text-indigo-400' },
                    { label: 'Collections', value: statsLoading ? '...' : formatNumber(clusterTotalCollections), icon: faLayerGroup, iconClass: isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/15 text-blue-400' },
                    { label: 'Used', value: statsLoading ? '...' : formatBytes(stats?.clusterTotalSize), icon: faDatabase, iconClass: isLight ? 'bg-purple-100 text-purple-600' : 'bg-purple-500/15 text-purple-400' },
                    { label: 'Remaining', value: statsLoading ? '...' : formatBytes(stats?.remaining), icon: faHardDrive, iconClass: isLight ? 'bg-cyan-100 text-cyan-600' : 'bg-cyan-500/15 text-cyan-400' },
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

            {/* Create Database Modal */}
            {createDbOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { if (!creating) { setCreateDbOpen(false); setNewDbName('') } }}>
                    <div className={`${panelClass} w-full max-w-md mx-4 p-6`} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>Create New Database</h3>
                            <button onClick={() => { setCreateDbOpen(false); setNewDbName('') }} className={`p-1 rounded ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-zinc-500'}`}>
                                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                            </button>
                        </div>
                        <div>
                            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Database Name</label>
                            <input
                                type="text"
                                value={newDbName}
                                onChange={e => setNewDbName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleCreateDb()}
                                placeholder="my_database"
                                autoFocus
                                className={`w-full px-3 py-2 rounded-lg text-sm border ${isLight ? 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400' : 'bg-[#111] border-[#333] text-zinc-200 placeholder:text-zinc-600'} focus:outline-none focus:ring-1 ${isLight ? 'focus:ring-indigo-300' : 'focus:ring-indigo-600'}`}
                            />
                            <p className={`text-[10px] mt-1.5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                                Letters, numbers, hyphens, and underscores only. An _init collection will be created.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2 mt-5">
                            <button
                                onClick={() => { setCreateDbOpen(false); setNewDbName('') }}
                                disabled={creating}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isLight ? 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50' : 'border-[#333] text-zinc-400 bg-[#1a1a1a] hover:bg-[#222]'} disabled:opacity-40`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateDb}
                                disabled={creating || !newDbName.trim()}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-40 ${isLight ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                            >
                                {creating ? <><FontAwesomeIcon icon={faSpinner} className="h-3 w-3 animate-spin mr-1.5" /> Creating...</> : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Database Cards */}
            {!statsLoading && databases.length > 0 && (
                <div className={panelClass}>
                    <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${isLight ? 'border-slate-100' : 'border-[#2a2a2a]'}`}>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faServer} className={`h-4 w-4 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`} />
                            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>Databases</h3>
                        </div>
                        <button
                            onClick={() => setCreateDbOpen(true)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${isLight ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                        >
                            <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                            New Database
                        </button>
                    </div>
                    <div className="p-4 sm:p-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {databases.map((db) => {
                            const isActive = selectedDb === db.name
                            const totalAll = stats?.clusterTotalSize || 1
                            const pct = db.isSystem ? 0 : (totalAll > 0 ? ((db.sizeOnDisk / totalAll) * 100) : 0)

                            return (
                                <button
                                    key={db.name}
                                    onClick={() => setSelectedDb(isActive ? null : db.name)}
                                    className={`text-left w-full rounded-lg border p-3.5 transition-all ${
                                        isActive
                                            ? (isLight ? 'border-indigo-300 bg-indigo-50/50 ring-1 ring-indigo-200' : 'border-indigo-600 bg-indigo-950/20 ring-1 ring-indigo-800')
                                            : db.isSystem
                                                ? (isLight ? 'border-slate-200/60 bg-slate-50/50 hover:border-slate-300 opacity-60' : 'border-[#252525] bg-[#161616] hover:border-[#333] opacity-60')
                                                : (isLight ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50' : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a] hover:bg-[#1e1e1e]')
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FontAwesomeIcon icon={faDatabase} className={`h-3.5 w-3.5 shrink-0 ${isActive ? (isLight ? 'text-indigo-500' : 'text-indigo-400') : (isLight ? 'text-slate-400' : 'text-zinc-500')}`} />
                                            <span className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>{db.name}</span>
                                            {db.isSystem && (
                                                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${isLight ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-[#222] text-zinc-600 border border-[#333]'}`}>
                                                    System
                                                </span>
                                            )}
                                        </div>
                                        <FontAwesomeIcon icon={faChevronRight} className={`h-3 w-3 shrink-0 transition-transform ${isActive ? 'rotate-90' : ''} ${isLight ? 'text-slate-400' : 'text-zinc-600'}`} />
                                    </div>
                                    <div className="flex items-center gap-3 text-xs mb-2">
                                        <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                                            <strong className={isLight ? 'text-slate-700' : 'text-zinc-300'}>{formatNumber(db.collections)}</strong> collections
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`}>
                                            <div
                                                className={`h-full rounded-full ${
                                                    db.isSystem ? (isLight ? 'bg-slate-300' : 'bg-zinc-600')
                                                    : pct > 50 ? 'bg-red-400' : pct > 25 ? 'bg-amber-400' : (isLight ? 'bg-indigo-400' : 'bg-indigo-500')
                                                }`}
                                                style={{ width: db.isSystem ? '100%' : `${Math.max(1, pct)}%` }}
                                            />
                                        </div>
                                        <span className={`text-[11px] tabular-nums font-medium shrink-0 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                                            {formatBytes(db.sizeOnDisk)}
                                        </span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Selected Database — Collection Breakdown */}
            {selectedDb && (
                <>
                    {/* Top Collections Chart */}
                    {!collectionsLoading && topCollections.length > 0 && !viewingCol && (
                        <div className={panelClass}>
                            <div className="p-4 sm:p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <FontAwesomeIcon icon={faChartPie} className={`h-4 w-4 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`} />
                                    <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                                        Top Collections in <span className={isLight ? 'text-indigo-600' : 'text-indigo-400'}>{selectedDb}</span>
                                    </h3>
                                </div>

                                {(() => {
                                    const totalAllSize = topCollections.reduce((s, c) => s + c.totalSize, 0)
                                    if (totalAllSize === 0) return <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>No storage data available</p>
                                    return (
                                        <div className={`w-full h-5 rounded-full overflow-hidden flex ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`}>
                                            {topCollections.map((col, i) => {
                                                const pct = (col.totalSize / totalAllSize) * 100
                                                if (pct < 0.3) return null
                                                return (
                                                    <div
                                                        key={col.name}
                                                        className={`h-full ${(isLight ? barColors : barColorsDark)[i % barColors.length]} first:rounded-l-full last:rounded-r-full`}
                                                        style={{ width: `${pct}%` }}
                                                        title={`${col.name}: ${formatBytes(col.totalSize)} (${pct.toFixed(1)}%)`}
                                                    />
                                                )
                                            })}
                                        </div>
                                    )
                                })()}

                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                                    {topCollections.map((col, i) => (
                                        <div key={col.name} className="flex items-center gap-1.5 text-xs">
                                            <FontAwesomeIcon icon={faCircle} className={`h-2 w-2 ${(isLight ? dotColors : dotColorsDark)[i % dotColors.length]}`} />
                                            <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>{col.name}</span>
                                            <span className={`tabular-nums font-medium ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>{formatBytes(col.totalSize)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Document Viewer */}
                    {viewingCol && (
                        <div className={panelClass}>
                            <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${isLight ? 'border-slate-100' : 'border-[#2a2a2a]'}`}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <button onClick={() => setViewingCol(null)} className={`shrink-0 p-1 rounded hover:bg-slate-100 dark:hover:bg-[#222] transition-colors ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                                        <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5" />
                                    </button>
                                    <div className="min-w-0">
                                        <h3 className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                                            <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>{selectedDb}</span>
                                            <span className={`mx-1 ${isLight ? 'text-slate-300' : 'text-zinc-600'}`}>/</span>
                                            <span className={isLight ? 'text-indigo-600' : 'text-indigo-400'}>{viewingCol}</span>
                                        </h3>
                                        <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                                            {formatNumber(docsMeta.total)} documents
                                            {docsMeta.totalPages > 1 && ` · Page ${docsPage} of ${docsMeta.totalPages}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {docsLoading ? (
                                <div className="py-16 text-center">
                                    <FontAwesomeIcon icon={faSpinner} className={`h-6 w-6 animate-spin ${isLight ? 'text-slate-300' : 'text-zinc-600'}`} />
                                </div>
                            ) : docs.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>No documents in this collection</p>
                                </div>
                            ) : (
                                <div>
                                    {docs.map((doc, i) => {
                                        const preview = getDocPreview(doc)
                                        const isExpanded = expandedDoc === i

                                        return (
                                            <div key={i} className={`border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                                <button
                                                    onClick={() => setExpandedDoc(isExpanded ? null : i)}
                                                    className={`w-full text-left px-4 sm:px-5 py-3 flex items-center gap-3 transition-colors ${
                                                        isExpanded
                                                            ? (isLight ? 'bg-indigo-50/50' : 'bg-indigo-950/10')
                                                            : (isLight ? 'hover:bg-slate-50/60' : 'hover:bg-[#1f1f1f]')
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={faChevronRight} className={`h-2.5 w-2.5 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''} ${isLight ? 'text-slate-400' : 'text-zinc-600'}`} />
                                                    <code className={`text-xs font-mono shrink-0 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>{preview.id.length > 24 ? preview.id.slice(-24) : preview.id}</code>
                                                    {preview.label && (
                                                        <span className={`text-sm truncate ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>{preview.label}</span>
                                                    )}
                                                    <span className={`ml-auto shrink-0 text-xs tabular-nums ${isLight ? 'text-slate-400' : 'text-zinc-600'}`}>{preview.fields} fields</span>
                                                </button>
                                                {isExpanded && (
                                                    <div className={`px-4 sm:px-5 pb-4 pt-1 overflow-x-auto`}>
                                                        <pre className={`text-xs font-mono leading-relaxed p-4 rounded-lg ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-[#111] border border-[#333]'}`}>
                                                            <JsonValue value={doc} isLight={isLight} />
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {docsMeta.totalPages > 1 && (
                                <div className={`px-4 py-3 flex items-center justify-between border-t ${isLight ? 'border-slate-100' : 'border-[#2a2a2a]'}`}>
                                    <button
                                        onClick={() => loadDocuments(viewingCol, docsPage - 1)}
                                        disabled={docsPage <= 1 || docsLoading}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isLight ? 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50' : 'border-[#333] text-zinc-400 bg-[#1a1a1a] hover:bg-[#222]'} disabled:opacity-30`}
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} className="h-2.5 w-2.5" /> Previous
                                    </button>
                                    <span className={`text-xs tabular-nums ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                                        Page {docsPage} of {docsMeta.totalPages}
                                    </span>
                                    <button
                                        onClick={() => loadDocuments(viewingCol, docsPage + 1)}
                                        disabled={docsPage >= docsMeta.totalPages || docsLoading}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isLight ? 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50' : 'border-[#333] text-zinc-400 bg-[#1a1a1a] hover:bg-[#222]'} disabled:opacity-30`}
                                    >
                                        Next <FontAwesomeIcon icon={faChevronRight} className="h-2.5 w-2.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Collections Table */}
                    {!viewingCol && (
                        <div className={panelClass}>
                            <div className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${isLight ? 'border-slate-100' : 'border-[#2a2a2a]'}`}>
                                <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                                    Collections in <span className={isLight ? 'text-indigo-600' : 'text-indigo-400'}>{selectedDb}</span>
                                    {!collectionsLoading && <span className={`ml-2 text-xs font-normal ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>({collections.length})</span>}
                                </h3>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faSearch} className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
                                    <input
                                        type="text"
                                        placeholder="Search collections..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className={`pl-7 pr-3 py-1.5 rounded-lg text-xs border w-48 ${isLight ? 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400' : 'bg-[#111] border-[#333] text-zinc-200 placeholder:text-zinc-600'} focus:outline-none focus:ring-1 ${isLight ? 'focus:ring-indigo-300' : 'focus:ring-indigo-600'}`}
                                    />
                                </div>
                            </div>

                            {collectionsLoading ? (
                                <div className="py-16 text-center">
                                    <FontAwesomeIcon icon={faSpinner} className={`h-6 w-6 animate-spin ${isLight ? 'text-slate-300' : 'text-zinc-600'}`} />
                                </div>
                            ) : filteredSorted.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>No collections found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[750px]">
                                        <thead>
                                            <tr className={`border-b ${isLight ? 'border-slate-100' : 'border-[#2a2a2a]'}`}>
                                                <th className={`${thClass} rounded-tl-xl`}>
                                                    <button onClick={() => handleSort('name')} className="inline-flex items-center hover:opacity-80">
                                                        Collection <SortIcon field="name" />
                                                    </button>
                                                </th>
                                                <th className={thClass}>
                                                    <button onClick={() => handleSort('count')} className="inline-flex items-center hover:opacity-80">
                                                        Documents <SortIcon field="count" />
                                                    </button>
                                                </th>
                                                <th className={thClass}>
                                                    <button onClick={() => handleSort('size')} className="inline-flex items-center hover:opacity-80">
                                                        Data Size <SortIcon field="size" />
                                                    </button>
                                                </th>
                                                <th className={thClass}>
                                                    <button onClick={() => handleSort('storageSize')} className="inline-flex items-center hover:opacity-80">
                                                        Storage <SortIcon field="storageSize" />
                                                    </button>
                                                </th>
                                                <th className={thClass}>
                                                    <button onClick={() => handleSort('indexSize')} className="inline-flex items-center hover:opacity-80">
                                                        Indexes <SortIcon field="indexSize" />
                                                    </button>
                                                </th>
                                                <th className={thClass}>
                                                    <button onClick={() => handleSort('totalSize')} className="inline-flex items-center hover:opacity-80">
                                                        Total <SortIcon field="totalSize" />
                                                    </button>
                                                </th>
                                                <th className={thClass}>
                                                    <button onClick={() => handleSort('avgObjSize')} className="inline-flex items-center hover:opacity-80">
                                                        Avg Doc <SortIcon field="avgObjSize" />
                                                    </button>
                                                </th>
                                                <th className={`${thClass} rounded-tr-xl text-right`}>Share</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSorted.map((col) => {
                                                const totalAll = collections.reduce((s, c) => s + c.totalSize, 0)
                                                const pct = totalAll > 0 ? ((col.totalSize / totalAll) * 100) : 0

                                                return (
                                                    <tr
                                                        key={col.name}
                                                        onClick={() => setViewingCol(col.name)}
                                                        className={`border-b cursor-pointer ${isLight ? 'border-slate-50 hover:bg-indigo-50/40' : 'border-[#222] hover:bg-indigo-950/10'} transition-colors`}
                                                    >
                                                        <td className={tdClass}>
                                                            <div className="flex items-center gap-2">
                                                                <FontAwesomeIcon icon={faLayerGroup} className={`h-3.5 w-3.5 shrink-0 ${isLight ? 'text-indigo-400' : 'text-indigo-500'}`} />
                                                                <span className="font-medium truncate max-w-[200px]">{col.name}</span>
                                                                <FontAwesomeIcon icon={faEye} className={`h-3 w-3 opacity-0 group-hover:opacity-100 ${isLight ? 'text-indigo-400' : 'text-indigo-500'}`} />
                                                            </div>
                                                        </td>
                                                        <td className={`${tdClass} tabular-nums`}>{formatNumber(col.count)}</td>
                                                        <td className={`${tdClass} tabular-nums`}>{formatBytes(col.size)}</td>
                                                        <td className={`${tdClass} tabular-nums`}>{formatBytes(col.storageSize)}</td>
                                                        <td className={tdClass}>
                                                            <div className="flex items-center gap-2">
                                                                <span className="tabular-nums">{formatBytes(col.indexSize)}</span>
                                                                <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-zinc-600'}`}>({col.indexes})</span>
                                                            </div>
                                                        </td>
                                                        <td className={`${tdClass} tabular-nums font-semibold`}>{formatBytes(col.totalSize)}</td>
                                                        <td className={`${tdClass} tabular-nums`}>{formatBytes(col.avgObjSize)}</td>
                                                        <td className={`${tdClass} text-right`}>
                                                            <div className="flex items-center justify-end gap-2">
                                                                <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`}>
                                                                    <div
                                                                        className={`h-full rounded-full ${
                                                                            pct > 30 ? (isLight ? 'bg-red-400' : 'bg-red-500')
                                                                            : pct > 15 ? (isLight ? 'bg-amber-400' : 'bg-amber-500')
                                                                            : (isLight ? 'bg-emerald-400' : 'bg-emerald-500')
                                                                        }`}
                                                                        style={{ width: `${Math.max(1, pct)}%` }}
                                                                    />
                                                                </div>
                                                                <span className={`text-xs tabular-nums w-12 text-right ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                                                                    {pct.toFixed(1)}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {!collectionsLoading && filteredSorted.length > 0 && (
                                <div className={`px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs border-t ${isLight ? 'border-slate-100 text-slate-500' : 'border-[#2a2a2a] text-zinc-500'}`}>
                                    <span>Total Documents: <strong className={isLight ? 'text-slate-700' : 'text-zinc-300'}>{formatNumber(totalDocs)}</strong></span>
                                    <span>Total Data: <strong className={isLight ? 'text-slate-700' : 'text-zinc-300'}>{formatBytes(totalDataSize)}</strong></span>
                                    <span>Total Indexes: <strong className={isLight ? 'text-slate-700' : 'text-zinc-300'}>{formatBytes(totalIndexSize)}</strong></span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Prompt to select a database */}
            {!selectedDb && !statsLoading && databases.length > 0 && (
                <div className={`${panelClass} py-12 text-center`}>
                    <FontAwesomeIcon icon={faCubes} className={`h-8 w-8 mb-3 ${isLight ? 'text-slate-300' : 'text-zinc-600'}`} />
                    <p className={`text-sm font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Select a database above to view its collections</p>
                </div>
            )}
        </div>
    )
}

export default MongoStorage
