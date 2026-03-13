import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getLogs, clearLogs, clearAlert } from '../../../actions/logs'
import { dark, light } from '../../../style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faSignInAlt, faUser, faVideo, faLayerGroup, faTag, faFolder, 
    faPenNib, faCog, faBook, faShield, faTrash, faSearch, 
    faChevronLeft, faChevronRight, faFilter, faClockRotateLeft 
} from '@fortawesome/free-solid-svg-icons'

import ConfirmModal from '../../Custom/ConfirmModal'

const categoryConfig = {
    auth:       { icon: faSignInAlt,  color: 'text-green-500',  bg: 'bg-green-500/10',  label: 'Auth' },
    profile:    { icon: faUser,       color: 'text-blue-500',   bg: 'bg-blue-500/10',   label: 'Profile' },
    video:      { icon: faVideo,      color: 'text-purple-500', bg: 'bg-purple-500/10',  label: 'Video' },
    group:      { icon: faLayerGroup, color: 'text-orange-500', bg: 'bg-orange-500/10',  label: 'Group' },
    tag:        { icon: faTag,        color: 'text-cyan-500',   bg: 'bg-cyan-500/10',    label: 'Tag' },
    category:   { icon: faFolder,     color: 'text-yellow-500', bg: 'bg-yellow-500/10',  label: 'Category' },
    author:     { icon: faPenNib,     color: 'text-pink-500',   bg: 'bg-pink-500/10',    label: 'Author' },
    settings:   { icon: faCog,        color: 'text-gray-500',   bg: 'bg-gray-500/10',    label: 'Settings' },
    docs:       { icon: faBook,       color: 'text-indigo-500', bg: 'bg-indigo-500/10',  label: 'Docs' },
    account:    { icon: faShield,     color: 'text-red-500',    bg: 'bg-red-500/10',     label: 'Account' },
}

const methodColors = {
    POST:   'bg-green-600',
    GET:    'bg-blue-600',
    PATCH:  'bg-yellow-600',
    DELETE: 'bg-red-600',
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
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
    })
}

const formatFullDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

const Logs = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()

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

    useEffect(() => {
        fetchLogs()
    }, [])

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

    const handleCategoryChange = (category) => {
        setActiveCategory(category)
        setCurrentPage(1)
        fetchLogs(1, category, searchTerm)
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setSearchTerm(searchInput)
        setCurrentPage(1)
        fetchLogs(1, activeCategory, searchInput)
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
        fetchLogs(page)
    }

    const handlePerPageChange = (value) => {
        const newLimit = parseInt(value)
        setPerPage(newLimit)
        setCurrentPage(1)
        fetchLogs(1, activeCategory, searchTerm, newLimit)
    }

    const getCategoryInfo = (cat) => categoryConfig[cat] || categoryConfig.account

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
            <div className='mb-8 flex xs:flex-row flex-col justify-between items-start gap-4'>
                <div>
                    <h1 className={`text-3xl font-semibold mb-2 ${theme === 'light' ? light.heading : dark.heading}`}>
                        Activity Logs
                    </h1>
                    <p className={`text-sm ${theme === 'light' ? light.text : dark.text}`}>
                        Track all your account activity and changes
                    </p>
                </div>
                {logs?.length > 0 && (
                    <button
                        onClick={() => { setOpenModal(true); setConfirm(false); }}
                        className={`py-1.5 px-4 rounded-full text-sm flex items-center gap-2 ${
                            theme === 'light' 
                                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm hover:shadow-md transition-all' 
                                : 'bg-red-600 hover:bg-red-700 text-white transition-all'
                        }`}
                    >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        Clear Logs
                    </button>
                )}
            </div>

            {/* Search & Filter Bar */}
            <div className={`mb-6 rounded-xl p-4 border ${
                theme === 'light'
                    ? 'bg-white/80 backdrop-blur-sm border-blue-200/60 shadow-sm'
                    : 'bg-[#1C1C1C] border-[#2B2B2B]'
            }`}>
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <FontAwesomeIcon 
                            icon={faSearch} 
                            className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${theme === 'light' ? 'text-blue-400' : 'text-gray-500'}`} 
                        />
                        <input
                            type="text"
                            placeholder="Search activity logs..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg ${
                                theme === 'light' ? light.input : dark.input
                            }`}
                        />
                    </form>
                    <div className="relative">
                        <FontAwesomeIcon 
                            icon={faFilter} 
                            className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${theme === 'light' ? 'text-blue-400' : 'text-gray-500'}`} 
                        />
                        <select
                            value={activeCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className={`pl-10 pr-8 py-2.5 text-sm rounded-lg cursor-pointer appearance-none ${
                                theme === 'light' ? light.input : dark.input
                            }`}
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs List */}
            <div className={`rounded-xl border overflow-hidden ${
                theme === 'light'
                    ? 'bg-white/80 backdrop-blur-sm border-blue-200/60 shadow-sm'
                    : 'bg-[#1C1C1C] border-[#2B2B2B]'
            }`}>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                            theme === 'light' ? 'border-blue-600' : 'border-blue-400'
                        }`}></div>
                    </div>
                ) : logs?.length > 0 ? (
                    <div>
                        {logs.map((log, index) => {
                            const catInfo = getCategoryInfo(log.category)
                            return (
                                <div 
                                    key={log._id} 
                                    className={`flex items-start gap-4 px-5 py-4 transition-all ${
                                        index !== logs.length - 1 ? `border-b border-solid ${theme === 'light' ? light.border : dark.semiborder}` : ''
                                    } ${theme === 'light' ? 'hover:bg-blue-50/50' : 'hover:bg-[#2B2B2B]/50'}`}
                                >
                                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5 ${catInfo.bg}`}>
                                        <FontAwesomeIcon icon={catInfo.icon} className={`text-sm ${catInfo.color}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${catInfo.bg} ${catInfo.color}`}>
                                                {catInfo.label}
                                            </span>
                                            <span className={`text-xs font-mono text-white px-1.5 py-0.5 rounded ${methodColors[log.method] || 'bg-gray-600'}`}>
                                                {log.method}
                                            </span>
                                        </div>
                                        <p className={`text-sm font-medium ${theme === 'light' ? 'text-slate-800' : 'text-gray-200'}`}>
                                            {log.message}
                                        </p>
                                        {log.ip_address && (
                                            <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-400' : 'text-gray-600'}`}>
                                                IP: {log.ip_address}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex-shrink-0 text-right">
                                        <p className={`text-xs font-medium ${theme === 'light' ? light.secondarytext : dark.secondarytext}`}>
                                            {formatDate(log.createdAt)}
                                        </p>
                                        <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-400' : 'text-gray-600'}`} title={formatFullDate(log.createdAt)}>
                                            {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <FontAwesomeIcon 
                            icon={faClockRotateLeft} 
                            className={`text-4xl mb-4 ${theme === 'light' ? 'text-blue-300' : 'text-gray-600'}`} 
                        />
                        <p className={`text-lg font-medium mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                            No activity logs found
                        </p>
                        <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-gray-600'}`}>
                            {searchTerm || activeCategory !== 'all' 
                                ? 'Try adjusting your search or filter criteria' 
                                : 'Your activity will be recorded here'}
                        </p>
                    </div>
                )}

                {pagination.total > 0 && (
                    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-5 py-3 border-t border-solid ${
                        theme === 'light' ? light.border : dark.semiborder
                    }`}>
                        <div className="flex items-center gap-3">
                            <p className={`text-xs ${theme === 'light' ? light.text : dark.text}`}>
                                Showing {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, pagination.total)} of {pagination.total}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <select
                                    value={perPage}
                                    onChange={(e) => handlePerPageChange(e.target.value)}
                                    className={`text-xs py-1 pl-2 pr-6 rounded-md cursor-pointer appearance-none ${
                                        theme === 'light' ? light.input : dark.input
                                    }`}
                                >
                                    {[10, 15, 25, 50, 100].map((n) => (
                                        <option key={n} value={n}>{n} / page</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {pagination.pages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    className={`${theme === 'light' ? light.paginate_btn : dark.paginate_btn} text-xs`}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                
                                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                                    let pageNum
                                    if (pagination.pages <= 5) {
                                        pageNum = i + 1
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1
                                    } else if (currentPage >= pagination.pages - 2) {
                                        pageNum = pagination.pages - 4 + i
                                    } else {
                                        pageNum = currentPage - 2 + i
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`${theme === 'light' ? light.paginate_btn : dark.paginate_btn} text-xs ${
                                                currentPage === pageNum 
                                                    ? (theme === 'light' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
                                                    : ''
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= pagination.pages}
                                    className={`${theme === 'light' ? light.paginate_btn : dark.paginate_btn} text-xs`}
                                >
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            {pagination.total > 0 && (
                <div className={`mt-4 flex items-center gap-2 text-xs ${theme === 'light' ? light.text : dark.text}`}>
                    <FontAwesomeIcon icon={faClockRotateLeft} className="text-xs" />
                    <span>{pagination.total} total log{pagination.total !== 1 ? 's' : ''} recorded</span>
                </div>
            )}
        </div>
    )
}

export default Logs
