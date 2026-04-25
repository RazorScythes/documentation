import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getLogs, clearLogs, clearAlert } from '../../../actions/logs'
import { dark, light } from '../../../style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faSignInAlt, faUser, faVideo, faLayerGroup, faTag, faFolder, 
    faPenNib, faCog, faBook, faShield, faTrash, faSearch, 
    faChevronLeft, faChevronRight, faFilter, faClockRotateLeft, faCircle
} from '@fortawesome/free-solid-svg-icons'

import ConfirmModal from '../../Custom/ConfirmModal'

const categoryConfig = {
    auth:       { icon: faSignInAlt,  color: 'text-emerald-500',  bg: 'bg-emerald-500/10',  darkBg: 'bg-emerald-900/20', label: 'Auth' },
    profile:    { icon: faUser,       color: 'text-blue-500',     bg: 'bg-blue-500/10',     darkBg: 'bg-blue-900/20',    label: 'Profile' },
    video:      { icon: faVideo,      color: 'text-violet-500',   bg: 'bg-violet-500/10',   darkBg: 'bg-violet-900/20',  label: 'Video' },
    group:      { icon: faLayerGroup, color: 'text-orange-500',   bg: 'bg-orange-500/10',   darkBg: 'bg-orange-900/20',  label: 'Group' },
    tag:        { icon: faTag,        color: 'text-cyan-500',     bg: 'bg-cyan-500/10',     darkBg: 'bg-cyan-900/20',    label: 'Tag' },
    category:   { icon: faFolder,     color: 'text-amber-500',    bg: 'bg-amber-500/10',    darkBg: 'bg-amber-900/20',   label: 'Category' },
    author:     { icon: faPenNib,     color: 'text-pink-500',     bg: 'bg-pink-500/10',     darkBg: 'bg-pink-900/20',    label: 'Author' },
    settings:   { icon: faCog,        color: 'text-slate-500',    bg: 'bg-slate-500/10',    darkBg: 'bg-slate-900/20',   label: 'Settings' },
    docs:       { icon: faBook,       color: 'text-indigo-500',   bg: 'bg-indigo-500/10',   darkBg: 'bg-indigo-900/20',  label: 'Docs' },
    account:    { icon: faShield,     color: 'text-red-500',      bg: 'bg-red-500/10',      darkBg: 'bg-red-900/20',     label: 'Account' },
}

const methodConfig = {
    POST:   { bg: 'bg-emerald-500', label: 'POST' },
    GET:    { bg: 'bg-blue-500',    label: 'GET' },
    PATCH:  { bg: 'bg-amber-500',   label: 'PATCH' },
    DELETE: { bg: 'bg-red-500',     label: 'DEL' },
}

const categories = [
    { value: 'all', label: 'All Activity' },
    { value: 'auth', label: 'Auth' },
    { value: 'profile', label: 'Profile' },
    { value: 'video', label: 'Video' },
    { value: 'group', label: 'Group' },
    { value: 'tag', label: 'Tag' },
    { value: 'category', label: 'Category' },
    { value: 'author', label: 'Author' },
    { value: 'settings', label: 'Settings' },
    { value: 'docs', label: 'Docs' },
    { value: 'account', label: 'Account' },
]

const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
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

    const fetchLogs = (page = 1, category = activeCategory, search = searchTerm, limit = perPage) => {
        const params = { page, limit }
        if (category !== 'all') params.category = category
        if (search) params.search = search
        dispatch(getLogs(params))
    }

    useEffect(() => { fetchLogs() }, [])

    useEffect(() => {
        if (Object.keys(alert).length > 0) {
            dispatch(clearAlert())
            setNotification(alert)
        }
    }, [alert])

    useEffect(() => {
        if (confirm) {
            dispatch(clearLogs())
            setConfirm(false)
            setCurrentPage(1)
        }
    }, [confirm])

    const handleCategoryChange = (category) => { setActiveCategory(category); setCurrentPage(1); fetchLogs(1, category, searchTerm) }
    const handleSearch = (e) => { e.preventDefault(); setSearchTerm(searchInput); setCurrentPage(1); fetchLogs(1, activeCategory, searchInput) }
    const handlePageChange = (page) => { setCurrentPage(page); fetchLogs(page) }
    const handlePerPageChange = (value) => { const n = parseInt(value); setPerPage(n); setCurrentPage(1); fetchLogs(1, activeCategory, searchTerm, n) }

    const getCategoryInfo = (cat) => categoryConfig[cat] || categoryConfig.account
    const getMethodInfo = (method) => methodConfig[method] || { bg: 'bg-gray-500', label: method }

    const panelClass = `rounded-xl border overflow-hidden ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#161616] border-[#2B2B2B] shadow-lg'}`
    const inputClass = `text-sm outline-none transition-all ${isLight ? 'bg-white border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-blue-400' : 'bg-[#1C1C1C] border-[#333] text-gray-300 placeholder:text-gray-600 focus:border-[#444]'}`

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <ConfirmModal 
                theme={theme}
                title="Clear Activity Logs"
                description="Are you sure you want to clear all activity logs? This action cannot be undone."
                openModal={openModal}
                setOpenModal={setOpenModal}
                setConfirm={setConfirm}
            />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-indigo-50' : 'bg-indigo-900/20'}`}>
                            <FontAwesomeIcon icon={faClockRotateLeft} className={`text-xs ${isLight ? 'text-indigo-500' : 'text-indigo-400'}`} />
                        </div>
                        <h1 className={`text-2xl font-semibold ${isLight ? light.heading : dark.heading}`}>Activity Logs</h1>
                    </div>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                        Track all your account activity and changes
                    </p>
                </div>
                {logs?.length > 0 && (
                    <button
                        onClick={() => { setOpenModal(true); setConfirm(false) }}
                        className={`py-2 px-4 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                            isLight 
                                ? 'bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300' 
                                : 'bg-[#1C1C1C] border border-red-900/50 text-red-400 hover:bg-red-900/10 hover:border-red-800'
                        }`}
                    >
                        <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                        Clear All
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <div className={`${panelClass} mb-5`}>
                <div className={`px-5 py-4 flex flex-col sm:flex-row gap-3`}>
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 text-[11px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className={`w-full pl-9 pr-4 py-2.5 rounded-lg border ${inputClass}`}
                        />
                    </form>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <FontAwesomeIcon icon={faFilter} className={`absolute left-3 top-1/2 -translate-y-1/2 text-[11px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                            <select
                                value={activeCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className={`pl-9 pr-8 py-2.5 rounded-lg border cursor-pointer appearance-none ${inputClass}`}
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        {(searchTerm || activeCategory !== 'all') && (
                            <button
                                onClick={() => { setSearchInput(''); setSearchTerm(''); setActiveCategory('all'); setCurrentPage(1); fetchLogs(1, 'all', '') }}
                                className={`text-[11px] font-medium px-3 py-2.5 rounded-lg transition-all ${isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#222]'}`}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Logs */}
            <div className={panelClass}>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className={`animate-spin rounded-full h-7 w-7 border-2 border-t-transparent ${isLight ? 'border-blue-500' : 'border-blue-400'}`} />
                    </div>
                ) : logs?.length > 0 ? (
                    <div>
                        {logs.map((log, index) => {
                            const catInfo = getCategoryInfo(log.category)
                            const methodInfo = getMethodInfo(log.method)
                            return (
                                <div 
                                    key={log._id} 
                                    className={`flex items-start gap-3.5 px-5 py-4 transition-colors ${
                                        index !== 0 ? `border-t ${isLight ? 'border-slate-100' : 'border-[#1C1C1C]'}` : ''
                                    } ${isLight ? 'hover:bg-slate-50/50' : 'hover:bg-[#1A1A1A]'}`}
                                >
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${isLight ? catInfo.bg : catInfo.darkBg}`}>
                                        <FontAwesomeIcon icon={catInfo.icon} className={`text-xs ${catInfo.color}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${isLight ? catInfo.bg : catInfo.darkBg} ${catInfo.color}`}>
                                                {catInfo.label}
                                            </span>
                                            <span className={`text-[10px] font-mono font-bold text-white px-1.5 py-0.5 rounded ${methodInfo.bg}`}>
                                                {methodInfo.label}
                                            </span>
                                        </div>
                                        <p className={`text-sm leading-snug ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                            {log.message}
                                        </p>
                                        {log.ip_address && (
                                            <p className={`text-[11px] mt-1 font-mono ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                                {log.ip_address}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex-shrink-0 text-right">
                                        <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                            {formatDate(log.createdAt)}
                                        </p>
                                        <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-600'}`} title={formatFullDate(log.createdAt)}>
                                            {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className={`text-center py-16 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                        <FontAwesomeIcon icon={faClockRotateLeft} className="text-3xl mb-3 opacity-30" />
                        <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                            No activity logs found
                        </p>
                        <p className="text-xs">
                            {searchTerm || activeCategory !== 'all' 
                                ? 'Try adjusting your search or filter' 
                                : 'Your activity will appear here'}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3 border-t ${isLight ? 'border-slate-100 bg-slate-50/30' : 'border-[#1C1C1C] bg-[#141414]'}`}>
                        <div className="flex items-center gap-3">
                            <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, pagination.total)} of {pagination.total}
                            </p>
                            <select
                                value={perPage}
                                onChange={(e) => handlePerPageChange(e.target.value)}
                                className={`text-[11px] py-1 pl-2 pr-6 rounded-md border cursor-pointer appearance-none outline-none ${inputClass}`}
                            >
                                {[10, 15, 25, 50, 100].map((n) => (
                                    <option key={n} value={n}>{n} / page</option>
                                ))}
                            </select>
                        </div>
                        {pagination.pages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${
                                        currentPage <= 1 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                
                                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                                    let pageNum
                                    if (pagination.pages <= 5) pageNum = i + 1
                                    else if (currentPage <= 3) pageNum = i + 1
                                    else if (currentPage >= pagination.pages - 2) pageNum = pagination.pages - 4 + i
                                    else pageNum = currentPage - 2 + i
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all ${
                                                currentPage === pageNum
                                                    ? (isLight ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-600 text-white')
                                                    : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#333]')
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= pagination.pages}
                                    className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${
                                        currentPage >= pagination.pages ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer stat */}
            {pagination.total > 0 && (
                <div className={`mt-3 flex items-center gap-1.5 text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                    <FontAwesomeIcon icon={faCircle} className="text-[4px]" />
                    <span>{pagination.total} log{pagination.total !== 1 ? 's' : ''} recorded</span>
                </div>
            )}
        </div>
    )
}

export default Logs
