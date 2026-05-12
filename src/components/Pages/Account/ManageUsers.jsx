import React, { useEffect, useState, useMemo } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { getAllUsers, updateUserRole, deleteUser, banUser, unbanUser, clearAlert } from '../../../actions/manageUsers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCheck, faXmark, faBan, faUnlock, faTrash, faPen, faSearch, faSort, faSortUp, faSortDown, faChevronLeft, faChevronRight, faEllipsisVertical, faShieldHalved, faUserShield, faUser, faSpinner, faCrown, faCircleCheck, faCircleXmark, faFilter, faCalendarDays, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import ConfirmModal from '../../Custom/ConfirmModal';
import Avatar from '../../Custom/Avatar';
import default_avatar from '../../../assets/avatar.webp'

const ROLES = ['User', 'Moderator', 'Admin']

const BAN_DURATIONS = [
    { label: '1 Day', value: '1' },
    { label: '3 Days', value: '3' },
    { label: '7 Days', value: '7' },
    { label: '14 Days', value: '14' },
    { label: '30 Days', value: '30' },
    { label: '90 Days', value: '90' },
    { label: '6 Months', value: '180' },
    { label: '1 Year', value: '365' },
    { label: 'Permanent', value: 'permanent' },
]

const ROLE_CONFIG = {
    Admin: {
        icon: faCrown,
        light: 'bg-red-50 text-red-600 border-red-200',
        dark: 'bg-red-900/20 text-red-400 border-red-800/40',
        dot: 'bg-red-500'
    },
    Moderator: {
        icon: faShieldHalved,
        light: 'bg-amber-50 text-amber-600 border-amber-200',
        dark: 'bg-amber-900/20 text-amber-400 border-amber-800/40',
        dot: 'bg-amber-500'
    },
    User: {
        icon: faUser,
        light: 'bg-blue-50 text-blue-600 border-blue-200',
        dark: 'bg-blue-900/20 text-blue-400 border-blue-800/40',
        dot: 'bg-blue-500'
    },
}

const ManageUsers = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()
    const isAdmin = user?.role === 'Admin'
    const isLight = theme === 'light'

    const users = useSelector((state) => state.manageUsers.data)
    const loading = useSelector((state) => state.manageUsers.isLoading)
    const alert = useSelector((state) => state.manageUsers.alert)

    const [deleteId, setDeleteId] = useState('')
    const [openModal, setOpenModal] = useState(false)
    const [confirm, setConfirm] = useState(false)

    const [roleModalOpen, setRoleModalOpen] = useState(false)
    const [roleTarget, setRoleTarget] = useState(null)
    const [selectedRole, setSelectedRole] = useState('')

    const [banModalOpen, setBanModalOpen] = useState(false)
    const [banTarget, setBanTarget] = useState(null)
    const [selectedDuration, setSelectedDuration] = useState('7')
    const [banReason, setBanReason] = useState('')

    const [unbanModalOpen, setUnbanModalOpen] = useState(false)
    const [unbanTarget, setUnbanTarget] = useState(null)
    const [unbanConfirm, setUnbanConfirm] = useState(false)

    const [search, setSearch] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterVerified, setFilterVerified] = useState('all')
    const [sortKey, setSortKey] = useState('createdAt')
    const [sortDir, setSortDir] = useState('desc')
    const [page, setPage] = useState(0)
    const [perPage, setPerPage] = useState(10)
    const [selected, setSelected] = useState([])
    const [actionMenu, setActionMenu] = useState(null)
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => { dispatch(getAllUsers()) }, [])
    useEffect(() => { if (alert && Object.keys(alert).length > 0) { dispatch(clearAlert()); setNotification(alert); setConfirm(false) } }, [alert])
    useEffect(() => { if (confirm) { dispatch(deleteUser({ id: deleteId })); setConfirm(false) } }, [confirm])
    useEffect(() => { if (unbanConfirm && unbanTarget) { dispatch(unbanUser({ id: unbanTarget._id })); setUnbanConfirm(false); setUnbanModalOpen(false); setUnbanTarget(null) } }, [unbanConfirm])

    const formatBanExpiry = (ban) => {
        if (!ban) return null
        if (ban.permanent) return 'Permanent'
        if (!ban.expiresAt) return 'Permanent'
        const expires = new Date(ban.expiresAt)
        const diffMs = expires - new Date()
        if (diffMs <= 0) return null
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
        if (days > 30) return `${Math.round(days / 30)}mo left`
        return `${days}d left`
    }

    const formatDate = (d) => {
        if (!d) return '—'
        const date = new Date(d)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const filtered = useMemo(() => {
        let result = [...(Array.isArray(users) ? users : [])]
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(u =>
                u.username?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.profile_id?.first_name?.toLowerCase().includes(q) ||
                u.profile_id?.last_name?.toLowerCase().includes(q)
            )
        }
        if (filterRole !== 'all') result = result.filter(u => u.role === filterRole)
        if (filterStatus === 'active') result = result.filter(u => !u.ban || !formatBanExpiry(u.ban))
        else if (filterStatus === 'banned') result = result.filter(u => u.ban && formatBanExpiry(u.ban))
        if (filterVerified === 'verified') result = result.filter(u => u.verification?.verified)
        else if (filterVerified === 'unverified') result = result.filter(u => !u.verification?.verified)
        return result
    }, [users, search, filterRole, filterStatus, filterVerified])

    const sorted = useMemo(() => {
        const arr = [...(filtered || [])]
        arr.sort((a, b) => {
            let va, vb
            if (sortKey === 'username') { va = a.username || ''; vb = b.username || ''; return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va) }
            if (sortKey === 'subscribers') { va = a.subscribers?.length || 0; vb = b.subscribers?.length || 0 }
            else if (sortKey === 'createdAt') { va = new Date(a.createdAt || 0).getTime(); vb = new Date(b.createdAt || 0).getTime() }
            else if (sortKey === 'role') { const order = { Admin: 3, Moderator: 2, User: 1 }; va = order[a.role] || 0; vb = order[b.role] || 0 }
            else { va = 0; vb = 0 }
            return sortDir === 'asc' ? va - vb : vb - va
        })
        return arr
    }, [filtered, sortKey, sortDir])

    const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
    const pageData = sorted.slice(page * perPage, (page + 1) * perPage)
    const allSelected = pageData.length > 0 && pageData.every(r => selected.includes(r._id))

    const toggleSort = (key) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }
    const toggleAll = () => { if (allSelected) setSelected(s => s.filter(id => !pageData.find(r => r._id === id))); else setSelected(s => [...new Set([...s, ...pageData.map(r => r._id)])]) }
    const toggleOne = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

    const handleBulkDelete = () => {
        selected.forEach(id => dispatch(deleteUser({ id })))
        setSelected([])
    }

    const thClass = `px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap cursor-default ${isLight ? 'text-slate-400' : 'text-gray-500'}`
    const tdClass = `px-4 py-3 text-sm whitespace-nowrap ${isLight ? 'text-slate-600' : 'text-gray-300'}`
    const selectClass = `py-1.5 px-2.5 text-[11px] rounded-lg border outline-none cursor-pointer transition-all ${isLight ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300' : 'bg-[#1C1C1C] border-[#333] text-gray-400 hover:border-[#444]'}`

    const columns = [
        { key: 'username', label: 'User', sortable: true },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role', sortable: true },
        { key: 'verification', label: 'Verified' },
        { key: 'subscribers', label: 'Subs', sortable: true },
        { key: 'ban', label: 'Status' },
        { key: 'createdAt', label: 'Joined', sortable: true },
        { key: 'actions', label: '' },
    ]

    const activeFilters = [filterRole, filterStatus, filterVerified].filter(f => f !== 'all').length

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <ConfirmModal theme={theme} title="Confirm User Deletion" description="Are you sure you want to delete this user? This action cannot be undone." openModal={openModal} setOpenModal={setOpenModal} setConfirm={setConfirm} />
            <ConfirmModal theme={theme} title="Unban User" description={`Are you sure you want to unban ${unbanTarget?.username}?`} openModal={unbanModalOpen} setOpenModal={setUnbanModalOpen} setConfirm={setUnbanConfirm} />

            {/* Role Modal */}
            {roleModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setRoleModalOpen(false)} />
                    <div className="flex items-center justify-center w-full min-h-full fixed inset-0 z-[101] p-4">
                        <div className={`relative max-w-sm w-full rounded-xl overflow-hidden border ${isLight ? 'bg-white/95 backdrop-blur-md border-slate-200/60 shadow-xl' : 'bg-[#161616] border-[#2B2B2B] shadow-2xl'}`} onClick={e => e.stopPropagation()}>
                            <div className={`px-6 pt-5 pb-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-50' : 'bg-blue-900/20'}`}>
                                        <FontAwesomeIcon icon={faUserShield} className={`text-sm ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                                    </div>
                                    <div>
                                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Change Role</h3>
                                        <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Update role for <span className="font-medium">{roleTarget?.username}</span></p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 space-y-2">
                                {ROLES.map((role) => {
                                    const cfg = ROLE_CONFIG[role]
                                    return (
                                        <label key={role} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${selectedRole === role ? (isLight ? 'border-blue-300 bg-blue-50/60' : 'border-blue-500/40 bg-blue-900/10') : (isLight ? 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50' : 'border-[#2B2B2B] hover:border-[#333] hover:bg-[#1A1A1A]')}`}>
                                            <input type="radio" name="role" value={role} checked={selectedRole === role} onChange={() => setSelectedRole(role)} className="sr-only" />
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? cfg.light.split(' ').slice(0, 1).join(' ') : cfg.dark.split(' ').slice(0, 1).join(' ')}`}>
                                                <FontAwesomeIcon icon={cfg.icon} className={`text-[10px] ${isLight ? cfg.light.split(' ')[1] : cfg.dark.split(' ')[1]}`} />
                                            </div>
                                            <div className="flex-1">
                                                <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{role}</span>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedRole === role ? 'border-blue-500 bg-blue-500' : (isLight ? 'border-slate-300' : 'border-[#444]')}`}>
                                                {selectedRole === role && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                            <div className={`flex gap-3 px-6 py-4 border-t ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                <button type="button" onClick={() => setRoleModalOpen(false)} className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-medium transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-[#1C1C1C] hover:bg-[#222] text-gray-400 border border-[#333]'}`}>Cancel</button>
                                <button type="button" onClick={() => { if (roleTarget && selectedRole) dispatch(updateUserRole({ userId: roleTarget._id, role: selectedRole })); setRoleModalOpen(false); setRoleTarget(null) }} disabled={selectedRole === roleTarget?.role} className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-medium transition-all ${selectedRole === roleTarget?.role ? 'opacity-40 cursor-not-allowed bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'}`}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Ban Modal */}
            {banModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setBanModalOpen(false)} />
                    <div className="flex items-center justify-center w-full min-h-full fixed inset-0 z-[101] p-4">
                        <div className={`relative max-w-sm w-full rounded-xl overflow-hidden border ${isLight ? 'bg-white/95 backdrop-blur-md border-slate-200/60 shadow-xl' : 'bg-[#161616] border-[#2B2B2B] shadow-2xl'}`} onClick={e => e.stopPropagation()}>
                            <div className={`px-6 pt-5 pb-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isLight ? 'bg-red-50' : 'bg-red-900/20'}`}>
                                        <FontAwesomeIcon icon={faBan} className={`text-sm ${isLight ? 'text-red-500' : 'text-red-400'}`} />
                                    </div>
                                    <div>
                                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Ban User</h3>
                                        <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Ban <span className="font-medium">{banTarget?.username}</span> from the platform</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 space-y-4">
                                <div>
                                    <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Duration</label>
                                    <select value={selectedDuration} onChange={e => setSelectedDuration(e.target.value)} className={`w-full rounded-lg py-2.5 px-3 text-sm border outline-none transition-all ${isLight ? 'bg-white border-slate-200 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'bg-[#1A1A1A] border-[#333] text-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/30'}`}>
                                        {BAN_DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Reason (optional)</label>
                                    <textarea value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Enter reason for ban..." rows={2} className={`w-full rounded-lg py-2.5 px-3 text-sm border outline-none resize-none transition-all ${isLight ? 'bg-white border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'bg-[#1A1A1A] border-[#333] text-gray-200 placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/30'}`} />
                                </div>
                            </div>
                            <div className={`flex gap-3 px-6 py-4 border-t ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                <button type="button" onClick={() => setBanModalOpen(false)} className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-medium transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-[#1C1C1C] hover:bg-[#222] text-gray-400 border border-[#333]'}`}>Cancel</button>
                                <button type="button" onClick={() => { if (banTarget && selectedDuration) dispatch(banUser({ userId: banTarget._id, duration: selectedDuration, reason: banReason })); setBanModalOpen(false); setBanTarget(null) }} className="flex-1 py-2.5 px-4 rounded-lg text-xs font-medium transition-all bg-red-600 hover:bg-red-700 text-white shadow-sm">Ban User</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-cyan-50' : 'bg-cyan-900/20'}`}>
                            <FontAwesomeIcon icon={faUsers} className={`text-xs ${isLight ? 'text-cyan-500' : 'text-cyan-400'}`} />
                        </div>
                        <h1 className={`text-2xl font-semibold ${isLight ? light.heading : dark.heading}`}>Manage Users</h1>
                    </div>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>View and manage all registered users on the platform</p>
                </div>
            </div>

            {/* Table */}
            <div className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#161616] border-[#2B2B2B]'}`}>
                {/* Table Header */}
                <div className={`px-5 py-4 flex flex-col gap-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-cyan-100' : 'bg-cyan-900/30'}`}>
                                <FontAwesomeIcon icon={faUsers} className={`text-xs ${isLight ? 'text-cyan-500' : 'text-cyan-400'}`} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>All Users</h3>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isLight ? 'bg-cyan-50 text-cyan-500' : 'bg-cyan-900/20 text-cyan-400'}`}>{sorted.length}</span>
                                </div>
                                <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{sorted.length} of {(users || []).length} users</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            {selected.length > 0 && isAdmin && (
                                <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm">
                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />Delete ({selected.length})
                                </button>
                            )}
                            <button onClick={() => setShowFilters(!showFilters)} className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${showFilters ? (isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-cyan-900/20 border-cyan-800/40 text-cyan-400') : (isLight ? 'bg-white border-slate-200 text-slate-500 hover:border-slate-300' : 'bg-[#1C1C1C] border-[#333] text-gray-400 hover:border-[#444]')}`}>
                                <FontAwesomeIcon icon={faFilter} className="text-[10px]" />Filters
                                {activeFilters > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[9px] font-bold rounded-full bg-cyan-500 text-white flex items-center justify-center">{activeFilters}</span>}
                            </button>
                            <div className="relative">
                                <FontAwesomeIcon icon={faSearch} className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                <input type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} className={`pl-7 pr-3 py-1.5 text-xs rounded-lg border outline-none w-36 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-cyan-300' : 'bg-[#1C1C1C] border-[#333] text-gray-300 placeholder:text-gray-600 focus:border-[#444]'}`} />
                            </div>
                        </div>
                    </div>

                    {/* Filter Row */}
                    {showFilters && (
                        <div className={`flex flex-wrap items-center gap-2 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                            <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(0) }} className={selectClass}>
                                <option value="all">All Roles</option>
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0) }} className={selectClass}>
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="banned">Banned</option>
                            </select>
                            <select value={filterVerified} onChange={e => { setFilterVerified(e.target.value); setPage(0) }} className={selectClass}>
                                <option value="all">All Users</option>
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                            </select>
                            {activeFilters > 0 && (
                                <button onClick={() => { setFilterRole('all'); setFilterStatus('all'); setFilterVerified('all'); setPage(0) }} className={`text-[11px] font-medium px-2 py-1 rounded-md transition-all ${isLight ? 'text-cyan-500 hover:bg-cyan-50' : 'text-cyan-400 hover:bg-cyan-900/20'}`}>
                                    Clear all
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className={`animate-spin rounded-full h-7 w-7 border-2 border-t-transparent ${isLight ? 'border-cyan-500' : 'border-cyan-400'}`} />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={isLight ? 'bg-slate-50/80' : 'bg-[#1A1A1A]'}>
                                        {isAdmin && <th className={`${thClass} w-10`}><input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-3.5 h-3.5 rounded cursor-pointer accent-cyan-500" /></th>}
                                        {columns.map(col => (
                                            <th key={col.key} className={thClass} onClick={() => col.sortable && toggleSort(col.key)}>
                                                <span className={`flex items-center gap-1.5 ${col.sortable ? 'cursor-pointer select-none' : ''}`}>
                                                    {col.label}
                                                    {col.sortable && <FontAwesomeIcon icon={sortKey === col.key ? (sortDir === 'asc' ? faSortUp : faSortDown) : faSort} className="text-[9px] opacity-50" />}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageData.length > 0 ? pageData.map((row, i) => {
                                        const roleCfg = ROLE_CONFIG[row.role] || ROLE_CONFIG.User
                                        const isBanned = row.ban && formatBanExpiry(row.ban)
                                        const fullName = [row.profile_id?.first_name, row.profile_id?.last_name].filter(Boolean).join(' ')

                                        return (
                                            <tr key={row._id || i} className={`border-t transition-colors ${isLight ? 'border-slate-100' : 'border-[#222]'} ${selected.includes(row._id) ? (isLight ? 'bg-cyan-50/50' : 'bg-cyan-900/10') : (i % 2 === 1 ? (isLight ? 'bg-slate-50/30' : 'bg-[#1A1A1A]/50') : '')} ${isLight ? 'hover:bg-cyan-50/30' : 'hover:bg-[#0e0e0e]'}`}>
                                                {isAdmin && <td className={`${tdClass} w-10`}><input type="checkbox" checked={selected.includes(row._id)} onChange={() => toggleOne(row._id)} className="w-3.5 h-3.5 rounded cursor-pointer accent-cyan-500" /></td>}
                                                {/* User Cell */}
                                                <td className={tdClass}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative flex-shrink-0">
                                                            <img src={row.avatar || default_avatar} alt="" className={`w-8 h-8 rounded-full object-cover border ${isLight ? 'border-slate-200' : 'border-[#333]'}`} />
                                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${isLight ? 'border-white' : 'border-[#161616]'} ${isBanned ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className={`text-xs font-semibold truncate max-w-[140px] ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{row.username}</p>
                                                            <p className={`text-[11px] truncate max-w-[140px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{fullName || 'No name set'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Email */}
                                                <td className={tdClass}>
                                                    <div className="flex items-center gap-1.5">
                                                        <FontAwesomeIcon icon={faEnvelope} className={`text-[9px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                        <span className={`text-xs truncate max-w-[160px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{row.email || '—'}</span>
                                                    </div>
                                                </td>
                                                {/* Role */}
                                                <td className={tdClass}>
                                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-md border ${isLight ? roleCfg.light : roleCfg.dark}`}>
                                                        <FontAwesomeIcon icon={roleCfg.icon} className="text-[9px]" />
                                                        {row.role || 'User'}
                                                    </span>
                                                </td>
                                                {/* Verified */}
                                                <td className={tdClass}>
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${row.verification?.verified ? (isLight ? 'bg-emerald-50 text-emerald-500' : 'bg-emerald-900/20 text-emerald-400') : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#2B2B2B] text-gray-500')}`}>
                                                        <FontAwesomeIcon icon={row.verification?.verified ? faCircleCheck : faCircleXmark} className="text-[11px]" />
                                                    </div>
                                                </td>
                                                {/* Subscribers */}
                                                <td className={tdClass}>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#2B2B2B] text-gray-300'}`}>
                                                        {row.subscribers?.length || 0}
                                                    </span>
                                                </td>
                                                {/* Status */}
                                                <td className={tdClass}>
                                                    {isBanned ? (
                                                        <div className="flex flex-col">
                                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 w-fit ${isLight ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-400'}`}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Banned
                                                            </span>
                                                            <span className={`text-[10px] mt-0.5 ${isLight ? 'text-red-400' : 'text-red-500'}`}>{formatBanExpiry(row.ban)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400'}`}>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active
                                                        </span>
                                                    )}
                                                </td>
                                                {/* Joined */}
                                                <td className={tdClass}>
                                                    <div className="flex items-center gap-1.5">
                                                        <FontAwesomeIcon icon={faCalendarDays} className={`text-[9px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                        <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatDate(row.createdAt)}</span>
                                                    </div>
                                                </td>
                                                {/* Actions */}
                                                <td className={`${tdClass} w-10 relative`}>
                                                    <button onClick={e => { e.stopPropagation(); setActionMenu(actionMenu === row._id ? null : row._id) }} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#2B2B2B]'}`}>
                                                        <FontAwesomeIcon icon={faEllipsisVertical} className="text-xs" />
                                                    </button>
                                                    {actionMenu === row._id && (
                                                        <>
                                                            <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
                                                            <div className={`absolute right-0 top-full mt-1 z-50 rounded-lg border shadow-lg overflow-hidden min-w-[140px] ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1C1C] border-[#333]'}`}>
                                                                {isAdmin && (
                                                                    <button onClick={() => { setRoleTarget(row); setSelectedRole(row.role || 'User'); setRoleModalOpen(true); setActionMenu(null) }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-gray-300 hover:bg-[#222]'}`}>
                                                                        <FontAwesomeIcon icon={faUserShield} className="text-[10px] text-blue-500" /> Change Role
                                                                    </button>
                                                                )}
                                                                {(isAdmin || row.role === 'User') && (
                                                                    <button onClick={() => { if (row.ban && formatBanExpiry(row.ban)) { setUnbanTarget(row); setUnbanModalOpen(true) } else { setBanTarget(row); setSelectedDuration('7'); setBanReason(''); setBanModalOpen(true) } setActionMenu(null) }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isLight ? 'text-orange-500 hover:bg-orange-50' : 'text-orange-400 hover:bg-orange-900/10'}`}>
                                                                        <FontAwesomeIcon icon={row.ban && formatBanExpiry(row.ban) ? faUnlock : faBan} className="text-[10px]" />
                                                                        {row.ban && formatBanExpiry(row.ban) ? 'Unban' : 'Ban User'}
                                                                    </button>
                                                                )}
                                                                {isAdmin && (
                                                                    <button onClick={() => { setDeleteId(row._id); setOpenModal(true); setConfirm(false); setActionMenu(null) }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isLight ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/10'}`}>
                                                                        <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    }) : (
                                        <tr>
                                            <td colSpan={columns.length + (isAdmin ? 1 : 0)} className={`px-4 py-16 text-center ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                <FontAwesomeIcon icon={faUsers} className="text-2xl mb-3 opacity-20 block mx-auto" />
                                                <p className="text-sm font-medium">No users found</p>
                                                <p className={`text-xs mt-1 ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>{search ? 'Try a different search' : 'No registered users yet'}</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {sorted.length > 0 && (
                            <div className={`px-5 py-3 flex items-center justify-between border-t ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#222] bg-[#141414]'}`}>
                                <div className="flex items-center gap-3">
                                    <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{page * perPage + 1}–{Math.min((page + 1) * perPage, sorted.length)} of {sorted.length}</p>
                                    <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(0) }} className={`text-[11px] rounded-md border px-1.5 py-1 outline-none ${isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#1C1C1C] border-[#333] text-gray-400'}`}>
                                        {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${page === 0 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}><FontAwesomeIcon icon={faChevronLeft} /></button>
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        const pn = totalPages <= 5 ? i : Math.min(Math.max(page - 2, 0), totalPages - 5) + i
                                        return (
                                            <button key={pn} onClick={() => setPage(pn)} className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all ${page === pn ? (isLight ? 'bg-cyan-500 text-white shadow-sm' : 'bg-cyan-600 text-white') : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#333]')}`}>{pn + 1}</button>
                                        )
                                    })}
                                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${page === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}><FontAwesomeIcon icon={faChevronRight} /></button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default ManageUsers
