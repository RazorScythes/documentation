import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getReports, deleteReport, updateReportStatus, clearAlert } from '../../../actions/report'
import { dark, light } from '../../../style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faFlag, faVideo, faComment, faTrash, 
    faChevronLeft, faChevronRight, faFilter,
    faChevronDown, faCircle, faUser, faEnvelope, faFingerprint, faCalendar
} from '@fortawesome/free-solid-svg-icons'

const statusConfig = {
    pending:    { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'text-yellow-400', label: 'Pending' },
    reviewed:   { color: 'text-blue-500',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   dot: 'text-blue-400',   label: 'Reviewed' },
    resolved:   { color: 'text-green-500',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  dot: 'text-green-400',  label: 'Resolved' },
    dismissed:  { color: 'text-gray-500',   bg: 'bg-gray-500/10',   border: 'border-gray-500/30',   dot: 'text-gray-400',   label: 'Dismissed' },
}

const typeConfig = {
    video:   { icon: faVideo,   color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Video' },
    comment: { icon: faComment, color: 'text-cyan-500',   bg: 'bg-cyan-500/10',   label: 'Comment' },
}

const typeFilters = [
    { value: 'all', label: 'All Types' },
    { value: 'video', label: 'Video' },
    { value: 'comment', label: 'Comment' },
]

const statusFilters = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' },
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

const Reports = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()

    const reports = useSelector((state) => state.report.data)
    const pagination = useSelector((state) => state.report.pagination)
    const loading = useSelector((state) => state.report.isLoading)
    const alert = useSelector((state) => state.report.alert)

    const [activeType, setActiveType] = useState('all')
    const [activeStatus, setActiveStatus] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [expandedId, setExpandedId] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [statusDropdown, setStatusDropdown] = useState(null)

    const fetchReports = (page = 1, type = activeType, status = activeStatus) => {
        const params = { page, limit: 15 }
        if (type !== 'all') params.type = type
        if (status !== 'all') params.status = status
        dispatch(getReports(params))
    }

    useEffect(() => {
        fetchReports()
    }, [])

    useEffect(() => {
        if (Object.keys(alert).length > 0) {
            dispatch(clearAlert())
            setNotification(alert)
        }
    }, [alert])

    const handleTypeChange = (type) => {
        setActiveType(type)
        setCurrentPage(1)
        fetchReports(1, type, activeStatus)
    }

    const handleStatusChange = (status) => {
        setActiveStatus(status)
        setCurrentPage(1)
        fetchReports(1, activeType, status)
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
        fetchReports(page)
    }

    const handleDelete = (id) => {
        dispatch(deleteReport(id))
        setConfirmDelete(null)
    }

    const handleStatusUpdate = (id, status) => {
        dispatch(updateReportStatus({ id, status }))
        setStatusDropdown(null)
    }

    const getTypeInfo = (type) => typeConfig[type] || typeConfig.video
    const getStatusInfo = (status) => statusConfig[status] || statusConfig.pending

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <div className='mb-6 flex xs:flex-row flex-col justify-between items-start gap-4'>
                <div>
                    <h1 className={`text-2xl font-semibold mb-1 ${theme === 'light' ? light.heading : dark.heading}`}>
                        Reports
                    </h1>
                    <p className={`text-sm ${theme === 'light' ? light.text : dark.text}`}>
                        View and manage your submitted reports
                    </p>
                </div>
            </div>

            <div className={`mb-4 rounded-xl p-4 border ${
                theme === 'light'
                    ? 'bg-white/80 border-blue-200/60'
                    : 'bg-[#1C1C1C] border-[#2B2B2B]'
            }`}>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <FontAwesomeIcon 
                            icon={faFilter} 
                            className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} 
                        />
                        <select
                            value={activeType}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className={`w-full pl-10 pr-8 py-2 text-sm rounded-lg cursor-pointer appearance-none ${
                                theme === 'light' ? light.input : dark.input
                            }`}
                        >
                            {typeFilters.map((f) => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative flex-1">
                        <FontAwesomeIcon 
                            icon={faFlag} 
                            className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} 
                        />
                        <select
                            value={activeStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className={`w-full pl-10 pr-8 py-2 text-sm rounded-lg cursor-pointer appearance-none ${
                                theme === 'light' ? light.input : dark.input
                            }`}
                        >
                            {statusFilters.map((f) => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className={`rounded-xl border overflow-hidden ${
                theme === 'light'
                    ? 'bg-white/80 border-blue-200/60'
                    : 'bg-[#1C1C1C] border-[#2B2B2B]'
            }`}>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                            theme === 'light' ? 'border-blue-600' : 'border-blue-400'
                        }`}></div>
                    </div>
                ) : reports?.length > 0 ? (
                    <div>
                        {reports.map((report, index) => {
                            const typeInfo = getTypeInfo(report.type)
                            const statusInfo = getStatusInfo(report.status)
                            const isExpanded = expandedId === report._id

                            return (
                                <div 
                                    key={report._id} 
                                    className={`transition-all ${
                                        index !== reports.length - 1 ? `border-b border-solid ${theme === 'light' ? light.border : dark.semiborder}` : ''
                                    }`}
                                >
                                    <div 
                                        onClick={() => { setExpandedId(isExpanded ? null : report._id); setStatusDropdown(null); setConfirmDelete(null); }}
                                        className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
                                            theme === 'light' ? 'hover:bg-blue-50/50' : 'hover:bg-[#2B2B2B]/50'
                                        }`}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${typeInfo.bg}`}>
                                            <FontAwesomeIcon icon={typeInfo.icon} className={`text-sm ${typeInfo.color}`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                                                {report.reason}
                                            </p>
                                            <p className={`text-xs mt-0.5 truncate ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {report.details}
                                            </p>
                                        </div>

                                        <span className={`hidden sm:inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                                            {statusInfo.label}
                                        </span>

                                        <span className={`text-xs shrink-0 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {formatDate(report.createdAt)}
                                        </span>

                                        <FontAwesomeIcon 
                                            icon={faChevronDown} 
                                            className={`text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} 
                                        />
                                    </div>

                                    {isExpanded && (
                                        <div className={`px-4 py-4 ${theme === 'light' ? 'bg-gray-50/60' : 'bg-[#161616]'}`}>
                                            <div className={`rounded-lg border p-4 ${
                                                theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1C1C1C] border-[#2B2B2B]'
                                            }`}>
                                                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <FontAwesomeIcon icon={faUser} className={`text-xs ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
                                                        <span className={`text-sm font-medium truncate ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{report.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <FontAwesomeIcon icon={faEnvelope} className={`text-xs ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
                                                        <span className={`text-sm truncate ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{report.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <FontAwesomeIcon icon={faFingerprint} className={`text-xs ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
                                                        <span className={`text-xs font-mono truncate ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{report.content_id}</span>
                                                    </div>
                                                </div>

                                                <div className={`text-sm whitespace-pre-wrap rounded-lg p-3 mb-4 ${
                                                    theme === 'light' 
                                                        ? 'bg-gray-50 text-gray-700' 
                                                        : 'bg-[#141414] text-gray-300'
                                                }`}>
                                                    {report.details}
                                                </div>

                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faCalendar} className={`text-xs ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
                                                        <span className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
                                                            {formatFullDate(report.createdAt)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="relative">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setStatusDropdown(statusDropdown === report._id ? null : report._id); }}
                                                                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                                                                    statusInfo.bg
                                                                } ${statusInfo.color} ${statusInfo.border}`}
                                                            >
                                                                <FontAwesomeIcon icon={faCircle} className={`text-[6px] ${statusInfo.dot}`} />
                                                                {statusInfo.label}
                                                                <FontAwesomeIcon icon={faChevronDown} className={`text-[8px] ml-0.5 transition-transform ${statusDropdown === report._id ? 'rotate-180' : ''}`} />
                                                            </button>

                                                            {statusDropdown === report._id && (
                                                                <div className={`absolute right-0 bottom-full mb-1 w-36 rounded-lg border overflow-hidden z-10 ${
                                                                    theme === 'light' ? 'bg-white border-gray-200 shadow-lg' : 'bg-[#222] border-[#333] shadow-lg shadow-black/30'
                                                                }`}>
                                                                    {Object.entries(statusConfig).map(([key, cfg]) => (
                                                                        <button
                                                                            key={key}
                                                                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(report._id, key); }}
                                                                            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                                                                                report.status === key 
                                                                                    ? (theme === 'light' ? 'bg-gray-100' : 'bg-[#2B2B2B]') 
                                                                                    : (theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-[#2B2B2B]')
                                                                            } ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
                                                                        >
                                                                            <FontAwesomeIcon icon={faCircle} className={`text-[6px] ${cfg.dot}`} />
                                                                            {cfg.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {confirmDelete === report._id ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                                                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                                        theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-[#2B2B2B] hover:bg-[#333] text-white'
                                                                    }`}
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDelete(report._id); }}
                                                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                                                                >
                                                                    Confirm
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setConfirmDelete(report._id); }}
                                                                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                                                                    theme === 'light' 
                                                                        ? 'border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-500 hover:text-red-500' 
                                                                        : 'border-[#2B2B2B] hover:bg-red-900/20 hover:border-red-800/30 text-gray-500 hover:text-red-400'
                                                                }`}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <FontAwesomeIcon 
                            icon={faFlag} 
                            className={`text-3xl mb-3 ${theme === 'light' ? 'text-gray-300' : 'text-gray-600'}`} 
                        />
                        <p className={`text-sm font-medium mb-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            No reports found
                        </p>
                        <p className={`text-xs ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {activeType !== 'all' || activeStatus !== 'all'
                                ? 'Try adjusting your filter criteria' 
                                : 'Reports you submit will appear here'}
                        </p>
                    </div>
                )}

                {pagination.pages > 1 && (
                    <div className={`flex items-center justify-between px-4 py-3 border-t border-solid ${
                        theme === 'light' ? light.border : dark.semiborder
                    }`}>
                        <p className={`text-xs ${theme === 'light' ? light.text : dark.text}`}>
                            Showing {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
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
                    </div>
                )}
            </div>

            {pagination.total > 0 && (
                <div className={`mt-3 flex items-center gap-2 text-xs ${theme === 'light' ? light.text : dark.text}`}>
                    <FontAwesomeIcon icon={faFlag} className="text-xs" />
                    <span>{pagination.total} total report{pagination.total !== 1 ? 's' : ''} submitted</span>
                </div>
            )}
        </div>
    )
}

export default Reports
