import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getLogs, clearLogs, clearAlert } from '../../../actions/logs'
import { dark, light } from '../../../style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSignInAlt, faUser, faVideo, faLayerGroup, faTag, faFolder,
    faPenNib, faCog, faBook, faShield, faTrash, faSearch,
    faChevronLeft, faChevronRight, faFilter, faClockRotateLeft,
    faArrowUp, faArrowDown, faGlobe, faClock, faXmark
} from '@fortawesome/free-solid-svg-icons'
import ConfirmModal from '../../Custom/ConfirmModal'

const categoryConfig = {
    auth:     { icon: faSignInAlt,  light: 'bg-emerald-50 text-emerald-600 border-emerald-200',   dark: 'bg-emerald-900/20 text-emerald-400 border-emerald-800/40', dot: 'bg-emerald-500', label: 'Auth' },
    profile:  { icon: faUser,       light: 'bg-blue-50 text-blue-600 border-blue-200',             dark: 'bg-blue-900/20 text-blue-400 border-blue-800/40',         dot: 'bg-blue-500',    label: 'Profile' },
    video:    { icon: faVideo,      light: 'bg-violet-50 text-violet-600 border-violet-200',       dark: 'bg-violet-900/20 text-violet-400 border-violet-800/40',   dot: 'bg-violet-500',  label: 'Video' },
    group:    { icon: faLayerGroup, light: 'bg-orange-50 text-orange-600 border-orange-200',       dark: 'bg-orange-900/20 text-orange-400 border-orange-800/40',   dot: 'bg-orange-500',  label: 'Group' },
    tag:      { icon: faTag,        light: 'bg-cyan-50 text-cyan-600 border-cyan-200',             dark: 'bg-cyan-900/20 text-cyan-400 border-cyan-800/40',         dot: 'bg-cyan-500',    label: 'Tag' },
    category: { icon: faFolder,     light: 'bg-amber-50 text-amber-600 border-amber-200',         dark: 'bg-amber-900/20 text-amber-400 border-amber-800/40',     dot: 'bg-amber-500',   label: 'Category' },
    author:   { icon: faPenNib,     light: 'bg-pink-50 text-pink-600 border-pink-200',             dark: 'bg-pink-900/20 text-pink-400 border-pink-800/40',         dot: 'bg-pink-500',    label: 'Author' },
    settings: { icon: faCog,        light: 'bg-slate-100 text-slate-600 border-slate-200',         dark: 'bg-slate-800/30 text-slate-400 border-slate-700/40',     dot: 'bg-slate-500',   label: 'Settings' },
    docs:     { icon: faBook,       light: 'bg-indigo-50 text-indigo-600 border-indigo-200',       dark: 'bg-indigo-900/20 text-indigo-400 border-indigo-800/40',   dot: 'bg-indigo-500',  label: 'Docs' },
    account:  { icon: faShield,     light: 'bg-red-50 text-red-600 border-red-200',                dark: 'bg-red-900/20 text-red-400 border-red-800/40',           dot: 'bg-red-500',     label: 'Account' },
}

const methodConfig = {
    POST:   { light: 'bg-emerald-50 text-emerald-600', dark: 'bg-emerald-900/20 text-emerald-400', label: 'POST' },
    GET:    { light: 'bg-blue-50 text-blue-600',       dark: 'bg-blue-900/20 text-blue-400',       label: 'GET' },
    PATCH:  { light: 'bg-amber-50 text-amber-600',     dark: 'bg-amber-900/20 text-amber-400',     label: 'PATCH' },
    DELETE: { light: 'bg-red-50 text-red-600',         dark: 'bg-red-900/20 text-red-400',         label: 'DEL' },
}

const filterCategories = [
    { value: 'all', label: 'All Activity' },
    { value: 'auth', label: 'Auth' }, { value: 'profile', label: 'Profile' },
    { value: 'video', label: 'Video' }, { value: 'group', label: 'Group' },
    { value: 'tag', label: 'Tag' }, { value: 'category', label: 'Category' },
    { value: 'author', label: 'Author' }, { value: 'settings', label: 'Settings' },
    { value: 'docs', label: 'Docs' }, { value: 'account', label: 'Account' },
]

const formatRelative = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 7) return `${d}d ago`
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

const getDateGroup = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const logDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffDays = Math.floor((today - logDate) / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' })
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const Logs = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()
    const isLight = theme === 'light'

    const logs = useSelector((state) => state.logs.data)
    const pagination = useSelector((state) => state.logs.pagination)
    const loading = useSelector((state) => state.logs.isLoading)
    const alert = useSelector((state) => state.logs.alert)

    const [activeCategory, setActiveCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [perPage, setPerPage] = useState(15)
    const [openModal, setOpenModal] = useState(false)
    const [confirm, setConfirm] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [expandedLog, setExpandedLog] = useState(null)

    const fetchLogs = (page = 1, category = activeCategory, search = searchTerm, limit = perPage) => {
        const params = { page, limit }
        if (category !== 'all') params.category = category
        if (search) params.search = search
        dispatch(getLogs(params))
    }

    useEffect(() => { fetchLogs() }, [])
    useEffect(() => { if (Object.keys(alert).length > 0) { dispatch(clearAlert()); setNotification(alert) } }, [alert])
    useEffect(() => { if (confirm) { dispatch(clearLogs()); setConfirm(false); setCurrentPage(1) } }, [confirm])

    const handleCategoryChange = (category) => { setActiveCategory(category); setCurrentPage(1); fetchLogs(1, category, searchTerm) }
    const handleSearch = (e) => { e.preventDefault(); setSearchTerm(searchInput); setCurrentPage(1); fetchLogs(1, activeCategory, searchInput) }
    const handlePageChange = (page) => { setCurrentPage(page); fetchLogs(page) }
    const handlePerPageChange = (value) => { const n = parseInt(value); setPerPage(n); setCurrentPage(1); fetchLogs(1, activeCategory, searchTerm, n) }
    const clearAllFilters = () => { setSearchInput(''); setSearchTerm(''); setActiveCategory('all'); setCurrentPage(1); fetchLogs(1, 'all', '') }

    const getCatInfo = (cat) => categoryConfig[cat] || categoryConfig.account
    const getMethodInfo = (method) => methodConfig[method] || { light: 'bg-slate-100 text-slate-600', dark: 'bg-slate-800/30 text-slate-400', label: method }

    const activeFilters = (activeCategory !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0)

    const groupedLogs = useMemo(() => {
        if (!logs?.length) return []
        const groups = []
        let lastGroup = null
        logs.forEach(log => {
            const group = getDateGroup(log.createdAt)
            if (group !== lastGroup) {
                groups.push({ type: 'header', label: group })
                lastGroup = group
            }
            groups.push({ type: 'log', data: log })
        })
        return groups
    }, [logs])

    const statCounts = useMemo(() => {
        if (!logs?.length) return {}
        const counts = {}
        logs.forEach(log => {
            const cat = log.category || 'account'
            counts[cat] = (counts[cat] || 0) + 1
        })
        return counts
    }, [logs])

    const topCategories = useMemo(() => {
        return Object.entries(statCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
    }, [statCounts])

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <ConfirmModal theme={theme} title="Clear Activity Logs" description="Are you sure you want to clear all activity logs? This action cannot be undone." openModal={openModal} setOpenModal={setOpenModal} setConfirm={setConfirm} />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-teal-50' : 'bg-teal-900/20'}`}>
                            <FontAwesomeIcon icon={faClockRotateLeft} className={`text-xs ${isLight ? 'text-teal-500' : 'text-teal-400'}`} />
                        </div>
                        <h1 className={`text-2xl font-semibold ${isLight ? light.heading : dark.heading}`}>Activity Logs</h1>
                    </div>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Track all your account activity and changes</p>
                </div>
                {logs?.length > 0 && (
                    <button onClick={() => { setOpenModal(true); setConfirm(false) }}
                        className={`py-2 px-4 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${isLight ? 'bg-white border border-red-200 text-red-500 hover:bg-red-50' : 'bg-[#1C1C1C] border border-red-900/40 text-red-400 hover:bg-red-900/10'}`}>
                        <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Clear All
                    </button>
                )}
            </div>

            {/* Quick Stats */}
            {topCategories.length > 0 && !loading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {topCategories.map(([cat, count]) => {
                        const cfg = getCatInfo(cat)
                        return (
                            <button key={cat} onClick={() => handleCategoryChange(cat)}
                                className={`rounded-xl border p-3.5 text-left transition-all ${activeCategory === cat
                                    ? (isLight ? 'bg-teal-50/50 border-teal-200 ring-1 ring-teal-200' : 'bg-teal-900/10 border-teal-800/40 ring-1 ring-teal-800/40')
                                    : (isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 hover:border-slate-300 shadow-sm' : 'bg-[#161616] border-[#2B2B2B] hover:border-[#333]')}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLight ? cfg.light.split(' ').slice(0, 1).join(' ') : cfg.dark.split(' ').slice(0, 1).join(' ')}`}>
                                        <FontAwesomeIcon icon={cfg.icon} className={`text-[10px] ${isLight ? cfg.light.split(' ')[1] : cfg.dark.split(' ')[1]}`} />
                                    </div>
                                    <span className={`text-lg font-bold tabular-nums ${isLight ? 'text-slate-800' : 'text-white'}`}>{count}</span>
                                </div>
                                <p className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{cfg.label}</p>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Main Panel */}
            <div className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#161616] border-[#2B2B2B]'}`}>

                {/* Table Header */}
                <div className={`px-5 py-4 flex flex-col gap-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-teal-100' : 'bg-teal-900/30'}`}>
                                <FontAwesomeIcon icon={faClockRotateLeft} className={`text-xs ${isLight ? 'text-teal-500' : 'text-teal-400'}`} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>Timeline</h3>
                                    {pagination.total > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isLight ? 'bg-teal-50 text-teal-500' : 'bg-teal-900/20 text-teal-400'}`}>{pagination.total}</span>}
                                </div>
                                <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {activeCategory !== 'all' ? `Filtered by ${getCatInfo(activeCategory).label}` : 'All activity'}
                                    {searchTerm && ` matching "${searchTerm}"`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            <button onClick={() => setShowFilters(!showFilters)}
                                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${showFilters ? (isLight ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-teal-900/20 border-teal-800/40 text-teal-400') : (isLight ? 'bg-white border-slate-200 text-slate-500 hover:border-slate-300' : 'bg-[#1C1C1C] border-[#333] text-gray-400 hover:border-[#444]')}`}>
                                <FontAwesomeIcon icon={faFilter} className="text-[10px]" /> Filters
                                {activeFilters > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[9px] font-bold rounded-full bg-teal-500 text-white flex items-center justify-center">{activeFilters}</span>}
                            </button>
                            <form onSubmit={handleSearch} className="relative hidden sm:block">
                                <FontAwesomeIcon icon={faSearch} className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                <input type="text" placeholder="Search..." value={searchInput} onChange={e => setSearchInput(e.target.value)}
                                    className={`pl-7 pr-3 py-1.5 text-xs rounded-lg border outline-none w-36 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-teal-300' : 'bg-[#1C1C1C] border-[#333] text-gray-300 placeholder:text-gray-600 focus:border-[#444]'}`} />
                            </form>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className={`pt-3 border-t ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                            {/* Mobile Search */}
                            <form onSubmit={handleSearch} className="relative mb-3 sm:hidden">
                                <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                <input type="text" placeholder="Search logs..." value={searchInput} onChange={e => setSearchInput(e.target.value)}
                                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-teal-300' : 'bg-[#1C1C1C] border-[#333] text-gray-300 placeholder:text-gray-600 focus:border-[#444]'}`} />
                            </form>
                            <div className="flex flex-wrap gap-1.5">
                                {filterCategories.map(cat => {
                                    const cfg = cat.value !== 'all' ? getCatInfo(cat.value) : null
                                    const isActive = activeCategory === cat.value
                                    return (
                                        <button key={cat.value} onClick={() => handleCategoryChange(cat.value)}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${isActive
                                                ? (isLight ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-teal-900/20 border-teal-800/40 text-teal-400')
                                                : (isLight ? 'border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50' : 'border-[#2B2B2B] text-gray-500 hover:border-[#333] hover:bg-[#1A1A1A]')}`}>
                                            {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                                            {cat.label}
                                        </button>
                                    )
                                })}
                            </div>
                            {activeFilters > 0 && (
                                <button onClick={clearAllFilters}
                                    className={`mt-2 text-[11px] font-medium px-2 py-1 rounded-md transition-all ${isLight ? 'text-teal-500 hover:bg-teal-50' : 'text-teal-400 hover:bg-teal-900/20'}`}>
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Timeline Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className={`animate-spin rounded-full h-7 w-7 border-2 border-t-transparent ${isLight ? 'border-teal-500' : 'border-teal-400'}`} />
                    </div>
                ) : groupedLogs.length > 0 ? (
                    <div className="relative">
                        {/* Timeline line */}
                        <div className={`absolute left-[39px] top-0 bottom-0 w-px ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`} />

                        {groupedLogs.map((item, index) => {
                            if (item.type === 'header') {
                                return (
                                    <div key={`h-${index}`} className={`relative flex items-center gap-3 px-5 py-2.5 ${isLight ? 'bg-slate-50/60' : 'bg-[#1A1A1A]/60'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-[#222] border border-[#333]'}`}>
                                            <FontAwesomeIcon icon={faClock} className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                                        </div>
                                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{item.label}</span>
                                    </div>
                                )
                            }

                            const log = item.data
                            const catInfo = getCatInfo(log.category)
                            const methInfo = getMethodInfo(log.method)
                            const isExpanded = expandedLog === log._id

                            return (
                                <div key={log._id}
                                    onClick={() => setExpandedLog(isExpanded ? null : log._id)}
                                    className={`relative flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-all ${isLight ? 'hover:bg-slate-50/50' : 'hover:bg-[#1A1A1A]/50'} ${isExpanded ? (isLight ? 'bg-teal-50/30' : 'bg-teal-900/5') : ''}`}>
                                    {/* Timeline dot */}
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center z-10 transition-all ${isExpanded ? (isLight ? catInfo.light : catInfo.dark) : (isLight ? 'bg-white border border-slate-200' : 'bg-[#1C1C1C] border border-[#333]')}`}>
                                        <FontAwesomeIcon icon={catInfo.icon} className={`text-[10px] ${isExpanded ? '' : (isLight ? catInfo.light.split(' ')[1] : catInfo.dark.split(' ')[1])}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${isLight ? catInfo.light : catInfo.dark}`}>
                                                        <span className={`w-1 h-1 rounded-full ${catInfo.dot}`} />
                                                        {catInfo.label}
                                                    </span>
                                                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${isLight ? methInfo.light : methInfo.dark}`}>
                                                        {methInfo.label}
                                                    </span>
                                                </div>
                                                <p className={`text-[13px] leading-snug ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{log.message}</p>
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <p className={`text-[11px] font-medium tabular-nums ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{formatRelative(log.createdAt)}</p>
                                                <p className={`text-[10px] tabular-nums ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{formatTime(log.createdAt)}</p>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className={`mt-3 p-3 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-3 ${isLight ? 'bg-white border border-slate-200' : 'bg-[#111] border border-[#2B2B2B]'}`}>
                                                <div>
                                                    <p className={`text-[9px] font-semibold uppercase tracking-widest mb-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Date & Time</p>
                                                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{formatFullDate(log.createdAt)}</p>
                                                </div>
                                                <div>
                                                    <p className={`text-[9px] font-semibold uppercase tracking-widest mb-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>IP Address</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <FontAwesomeIcon icon={faGlobe} className={`text-[9px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                        <p className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{log.ip_address || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className={`text-[9px] font-semibold uppercase tracking-widest mb-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Method</p>
                                                    <p className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{log.method || 'N/A'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className={`text-center py-20 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`}>
                            <FontAwesomeIcon icon={faClockRotateLeft} className="text-xl opacity-30" />
                        </div>
                        <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>No activity logs found</p>
                        <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                            {searchTerm || activeCategory !== 'all' ? 'Try adjusting your search or filter' : 'Your activity will appear here'}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div className={`px-5 py-3 flex items-center justify-between border-t ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#222] bg-[#141414]'}`}>
                        <div className="flex items-center gap-3">
                            <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, pagination.total)} of {pagination.total}
                            </p>
                            <select value={perPage} onChange={e => handlePerPageChange(e.target.value)}
                                className={`text-[11px] rounded-md border px-1.5 py-1 outline-none ${isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#1C1C1C] border-[#333] text-gray-400'}`}>
                                {[10, 15, 25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
                            </select>
                        </div>
                        {pagination.pages > 1 && (
                            <div className="flex items-center gap-1">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}
                                    className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${currentPage <= 1 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                                    let pn
                                    if (pagination.pages <= 5) pn = i + 1
                                    else if (currentPage <= 3) pn = i + 1
                                    else if (currentPage >= pagination.pages - 2) pn = pagination.pages - 4 + i
                                    else pn = currentPage - 2 + i
                                    return (
                                        <button key={pn} onClick={() => handlePageChange(pn)}
                                            className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all ${currentPage === pn ? (isLight ? 'bg-teal-500 text-white shadow-sm' : 'bg-teal-600 text-white') : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#333]')}`}>
                                            {pn}
                                        </button>
                                    )
                                })}
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= pagination.pages}
                                    className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${currentPage >= pagination.pages ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Logs
