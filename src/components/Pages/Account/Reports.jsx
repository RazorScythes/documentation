import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getReports, deleteReport, updateReportStatus, clearAlert } from '../../../actions/report'
import { dark, light } from '../../../style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFlag, faVideo, faComment, faTrash,
    faChevronLeft, faChevronRight, faChevronDown,
    faCircle, faUser, faEnvelope, faFingerprint, faCalendar,
    faSearch, faXmark, faShieldHalved, faEye, faClock
} from '@fortawesome/free-solid-svg-icons'

const STATUS = {
    pending:   { dot: 'bg-amber-400',  text: 'text-amber-600  dark:text-amber-400',  bg: 'bg-amber-50  dark:bg-amber-900/15', label: 'Pending' },
    reviewed:  { dot: 'bg-blue-400',   text: 'text-blue-600   dark:text-blue-400',   bg: 'bg-blue-50   dark:bg-blue-900/15',  label: 'Reviewed' },
    resolved:  { dot: 'bg-emerald-400',text: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-50 dark:bg-emerald-900/15', label: 'Resolved' },
    dismissed: { dot: 'bg-gray-400',   text: 'text-gray-500   dark:text-gray-400',   bg: 'bg-gray-100  dark:bg-gray-800/30',  label: 'Dismissed' },
}

const TYPE = {
    video:   { icon: faVideo,   color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'Video' },
    comment: { icon: faComment, color: 'text-cyan-500',   bg: 'bg-cyan-50   dark:bg-cyan-900/20',   label: 'Comment' },
}

const typeFilters  = [{ value: 'all', label: 'All Types' }, { value: 'video', label: 'Video' }, { value: 'comment', label: 'Comment' }]
const statusFilters = [{ value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'reviewed', label: 'Reviewed' }, { value: 'resolved', label: 'Resolved' }, { value: 'dismissed', label: 'Dismissed' }]

const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000)
    if (s < 60)    return 'Just now'
    if (s < 3600)  return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const fullDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const Reports = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()
    const reports    = useSelector((state) => state.report.data)
    const pagination = useSelector((state) => state.report.pagination)
    const loading    = useSelector((state) => state.report.isLoading)
    const alert      = useSelector((state) => state.report.alert)

    const isLight = theme === 'light'

    const [activeType, setActiveType]       = useState('all')
    const [activeStatus, setActiveStatus]   = useState('all')
    const [currentPage, setCurrentPage]     = useState(1)
    const [expandedId, setExpandedId]       = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [statusDropdown, setStatusDropdown] = useState(null)
    const [showFilters, setShowFilters]     = useState(false)

    const activeFilterCount = (activeType !== 'all' ? 1 : 0) + (activeStatus !== 'all' ? 1 : 0)

    const fetch = (page = 1, type = activeType, status = activeStatus) => {
        const p = { page, limit: 15 }
        if (type !== 'all') p.type = type
        if (status !== 'all') p.status = status
        dispatch(getReports(p))
    }

    useEffect(() => { fetch() }, [])
    useEffect(() => { if (Object.keys(alert).length > 0) { dispatch(clearAlert()); setNotification(alert) } }, [alert])

    const changeType   = v => { setActiveType(v);   setCurrentPage(1); fetch(1, v, activeStatus) }
    const changeStatus = v => { setActiveStatus(v); setCurrentPage(1); fetch(1, activeType, v) }
    const changePage   = p => { setCurrentPage(p);  fetch(p) }
    const clearFilters = () => { setActiveType('all'); setActiveStatus('all'); setCurrentPage(1); fetch(1, 'all', 'all') }

    const handleDelete       = id => { dispatch(deleteReport(id)); setConfirmDelete(null) }
    const handleStatusUpdate = (id, s) => { dispatch(updateReportStatus({ id, status: s })); setStatusDropdown(null) }

    const st  = s => STATUS[s] || STATUS.pending
    const tp  = t => TYPE[t]   || TYPE.video

    const panelClass = `rounded-xl border ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#161616] border-[#2B2B2B]'}`

    // ─── Quick stat cards ───
    const statCards = [
        { key: 'pending',  icon: faClock,         label: 'Pending',  dot: 'bg-amber-400' },
        { key: 'reviewed', icon: faEye,            label: 'Reviewed', dot: 'bg-blue-400' },
        { key: 'resolved', icon: faShieldHalved,   label: 'Resolved', dot: 'bg-emerald-400' },
        { key: 'dismissed',icon: faXmark,           label: 'Dismissed',dot: 'bg-gray-400' },
    ]

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-orange-50' : 'bg-orange-900/20'}`}>
                        <FontAwesomeIcon icon={faFlag} className={`text-xs ${isLight ? 'text-orange-500' : 'text-orange-400'}`} />
                    </div>
                    <h1 className={`text-2xl font-semibold ${isLight ? light.heading : dark.heading}`}>Reports</h1>
                </div>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>View and manage submitted reports</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {statCards.map(c => {
                    const isActive = activeStatus === c.key
                    return (
                        <button key={c.key} onClick={() => changeStatus(isActive ? 'all' : c.key)}
                            className={`${panelClass} p-3.5 text-left transition-all ${isActive ? (isLight ? 'ring-2 ring-orange-300 border-orange-200' : 'ring-2 ring-orange-600 border-orange-700') : ''}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#1C1C1C]'}`}>
                                    <FontAwesomeIcon icon={c.icon} className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                                </div>
                                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                            </div>
                            <p className={`text-lg font-bold tabular-nums ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                {reports?.filter(r => r.status === c.key).length || 0}
                            </p>
                            <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{c.label}</p>
                        </button>
                    )
                })}
            </div>

            {/* Main Panel */}
            <div className={`${panelClass} overflow-hidden`}>
                {/* Toolbar */}
                <div className={`px-5 py-4 flex items-center justify-between gap-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-orange-100' : 'bg-orange-900/30'}`}>
                            <FontAwesomeIcon icon={faFlag} className={`text-xs ${isLight ? 'text-orange-500' : 'text-orange-400'}`} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>All Reports</h3>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isLight ? 'bg-orange-50 text-orange-500' : 'bg-orange-900/20 text-orange-400'}`}>{pagination?.total || 0}</span>
                            </div>
                            {activeFilterCount > 0 && (
                                <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Filtered by {activeType !== 'all' ? activeType : ''}{activeType !== 'all' && activeStatus !== 'all' ? ' + ' : ''}{activeStatus !== 'all' ? activeStatus : ''}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => setShowFilters(!showFilters)}
                            className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${showFilters ? (isLight ? 'bg-orange-100 text-orange-600' : 'bg-orange-900/30 text-orange-400') : (isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#1C1C1C]')}`}>
                            <FontAwesomeIcon icon={faSearch} className="text-xs" />
                            {activeFilterCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
                        </button>
                    </div>
                </div>

                {/* Collapsible Filter Bar */}
                {showFilters && (
                    <div className={`px-5 py-3 flex flex-wrap items-center gap-3 border-b ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#222] bg-[#111]'}`}>
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-semibold uppercase tracking-widest mr-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Type</span>
                            {typeFilters.map(f => (
                                <button key={f.value} onClick={() => changeType(f.value)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${activeType === f.value ? (isLight ? 'bg-orange-500 text-white shadow-sm' : 'bg-orange-600 text-white') : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#1C1C1C]')}`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div className={`w-px h-5 ${isLight ? 'bg-slate-200' : 'bg-[#333]'}`} />
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-semibold uppercase tracking-widest mr-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Status</span>
                            {statusFilters.map(f => (
                                <button key={f.value} onClick={() => changeStatus(f.value)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${activeStatus === f.value ? (isLight ? 'bg-orange-500 text-white shadow-sm' : 'bg-orange-600 text-white') : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#1C1C1C]')}`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className={`ml-auto text-[11px] font-medium transition-all ${isLight ? 'text-orange-500 hover:text-orange-600' : 'text-orange-400 hover:text-orange-300'}`}>Clear all</button>
                        )}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className={`animate-spin rounded-full h-7 w-7 border-2 border-t-transparent ${isLight ? 'border-orange-500' : 'border-orange-400'}`} />
                    </div>
                ) : reports?.length > 0 ? (
                    <div>
                        {reports.map((report, i) => {
                            const typeInfo   = tp(report.type)
                            const statusInfo = st(report.status)
                            const isExpanded = expandedId === report._id

                            return (
                                <div key={report._id} className={i !== 0 ? `border-t ${isLight ? 'border-slate-100' : 'border-[#222]'}` : ''}>
                                    {/* Row */}
                                    <div onClick={() => { setExpandedId(isExpanded ? null : report._id); setStatusDropdown(null); setConfirmDelete(null) }}
                                        className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-all ${isLight ? 'hover:bg-orange-50/30' : 'hover:bg-[#1A1A1A]'} ${isExpanded ? (isLight ? 'bg-orange-50/20' : 'bg-[#1A1A1A]') : ''}`}>
                                        {/* Type icon */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? typeInfo.bg.split(' ')[0] : typeInfo.bg.split(' ')[1]?.replace('dark:', '') || 'bg-purple-900/20'}`}>
                                            <FontAwesomeIcon icon={typeInfo.icon} className={`text-xs ${typeInfo.color}`} />
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{report.reason}</p>
                                            <p className={`text-xs truncate mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{report.details}</p>
                                        </div>
                                        {/* Status pill */}
                                        <span className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${isLight ? statusInfo.bg.split(' ')[0] : statusInfo.bg.split(' ')[1]?.replace('dark:', '') || 'bg-amber-900/15'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                                            <span className={isLight ? statusInfo.text.split(' ')[0] : statusInfo.text.split(' ')[1]?.replace('dark:', '') || 'text-amber-400'}>{statusInfo.label}</span>
                                        </span>
                                        {/* Time */}
                                        <span className={`text-[11px] flex-shrink-0 hidden md:inline ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{timeAgo(report.createdAt)}</span>
                                        {/* Chevron */}
                                        <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                    </div>

                                    {/* Expanded Detail */}
                                    {isExpanded && (
                                        <div className={`px-5 pb-4`}>
                                            <div className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white border-slate-200/60' : 'bg-[#1A1A1A] border-[#2B2B2B]'}`}>
                                                {/* Meta */}
                                                <div className={`px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#222] bg-[#141414]'}`}>
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <FontAwesomeIcon icon={faUser} className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                        <span className={`text-xs font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{report.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <FontAwesomeIcon icon={faEnvelope} className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                        <span className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{report.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <FontAwesomeIcon icon={faFingerprint} className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                        <span className={`text-[11px] font-mono truncate ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{report.content_id}</span>
                                                    </div>
                                                </div>

                                                {/* Details body */}
                                                <div className="p-4">
                                                    <div className={`text-sm whitespace-pre-wrap leading-relaxed rounded-lg p-3.5 ${isLight ? 'bg-slate-50 text-slate-600' : 'bg-[#111] text-gray-300'}`}>
                                                        {report.details}
                                                    </div>
                                                </div>

                                                {/* Footer actions */}
                                                <div className={`px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t ${isLight ? 'border-slate-100 bg-slate-50/30' : 'border-[#222] bg-[#141414]'}`}>
                                                    <div className={`flex items-center gap-1.5 text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                        <FontAwesomeIcon icon={faCalendar} className="text-[10px]" />
                                                        {fullDate(report.createdAt)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {/* Status Dropdown */}
                                                        <div className="relative">
                                                            <button onClick={e => { e.stopPropagation(); setStatusDropdown(statusDropdown === report._id ? null : report._id) }}
                                                                className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${isLight ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-[#333] text-gray-300 hover:bg-[#222]'}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                                                                {statusInfo.label}
                                                                <FontAwesomeIcon icon={faChevronDown} className={`text-[8px] ml-0.5 transition-transform ${statusDropdown === report._id ? 'rotate-180' : ''}`} />
                                                            </button>
                                                            {statusDropdown === report._id && (
                                                                <>
                                                                    <div className="fixed inset-0 z-40" onClick={() => setStatusDropdown(null)} />
                                                                    <div className={`absolute right-0 bottom-full mb-1 w-36 rounded-lg border overflow-hidden z-50 ${isLight ? 'bg-white border-slate-200 shadow-lg' : 'bg-[#1C1C1C] border-[#333] shadow-lg shadow-black/30'}`}>
                                                                        {Object.entries(STATUS).map(([key, cfg]) => (
                                                                            <button key={key} onClick={e => { e.stopPropagation(); handleStatusUpdate(report._id, key) }}
                                                                                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-all ${report.status === key ? (isLight ? 'bg-slate-100' : 'bg-[#222]') : (isLight ? 'hover:bg-slate-50' : 'hover:bg-[#222]')} ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                                                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                                                {cfg.label}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Delete */}
                                                        {confirmDelete === report._id ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <button onClick={e => { e.stopPropagation(); setConfirmDelete(null) }}
                                                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#222] text-gray-400 hover:bg-[#2B2B2B]'}`}>
                                                                    Cancel
                                                                </button>
                                                                <button onClick={e => { e.stopPropagation(); handleDelete(report._id) }}
                                                                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-red-500 hover:bg-red-600 text-white transition-all">
                                                                    Confirm
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={e => { e.stopPropagation(); setConfirmDelete(report._id) }}
                                                                className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${isLight ? 'border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200' : 'border-[#333] text-gray-500 hover:text-red-400 hover:bg-red-900/15 hover:border-red-800/30'}`}>
                                                                <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Delete
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
                    <div className="text-center py-20">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#1C1C1C]'}`}>
                            <FontAwesomeIcon icon={faFlag} className={`text-xl opacity-20 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                        </div>
                        <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                            {activeType !== 'all' || activeStatus !== 'all' ? 'No reports match your filters' : 'No reports yet'}
                        </p>
                        <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                            {activeType !== 'all' || activeStatus !== 'all' ? 'Try adjusting your filter criteria' : 'Reports you submit will appear here'}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {pagination?.pages > 1 && (
                    <div className={`flex items-center justify-between px-5 py-3 border-t ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                        <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                            {((currentPage - 1) * (pagination.limit || 15)) + 1}–{Math.min(currentPage * (pagination.limit || 15), pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => changePage(currentPage - 1)} disabled={currentPage <= 1}
                                className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${currentPage <= 1 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}>
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, idx) => {
                                let pn
                                if (pagination.pages <= 5) pn = idx + 1
                                else if (currentPage <= 3) pn = idx + 1
                                else if (currentPage >= pagination.pages - 2) pn = pagination.pages - 4 + idx
                                else pn = currentPage - 2 + idx
                                return (
                                    <button key={pn} onClick={() => changePage(pn)}
                                        className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all ${currentPage === pn ? (isLight ? 'bg-orange-500 text-white shadow-sm' : 'bg-orange-600 text-white') : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#333]')}`}>
                                        {pn}
                                    </button>
                                )
                            })}
                            <button onClick={() => changePage(currentPage + 1)} disabled={currentPage >= pagination.pages}
                                className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${currentPage >= pagination.pages ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Reports
