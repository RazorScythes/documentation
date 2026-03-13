import React, { useEffect, useState } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { getAllUsers, updateUserRole, deleteUser, banUser, unbanUser, clearAlert } from '../../../actions/manageUsers';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark, faBan, faUnlock, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Table from '../../Custom/Table';
import ConfirmModal from '../../Custom/ConfirmModal';
import Avatar from '../../Custom/Avatar';

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

const RoleBadge = ({ role }) => {
    const colors = {
        Admin: 'text-red-500',
        Moderator: 'text-amber-500',
        User: 'text-blue-500',
    }
    return (
        <span className={`text-xs font-medium ${colors[role] || colors.User}`}>
            {role || 'User'}
        </span>
    )
}

const ManageUsers = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()

    const isAdmin = user?.role === 'Admin'

    const users = useSelector((state) => state.manageUsers.data)
    const loading = useSelector((state) => state.manageUsers.isLoading)
    const alert = useSelector((state) => state.manageUsers.alert) 

    const [tableData, setTableData] = useState([])
    const [selectedData, setSelectedData] = useState(null)
    const [openModal, setOpenModal] = useState(false)
    const [deleteId, setDeleteId] = useState('')
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

    const openRoleModal = (item) => {
        setRoleTarget(item)
        setSelectedRole(item.role || 'User')
        setRoleModalOpen(true)
    }

    const confirmRoleChange = () => {
        if (roleTarget && selectedRole) {
            dispatch(updateUserRole({ userId: roleTarget._id, role: selectedRole }))
        }
        setRoleModalOpen(false)
        setRoleTarget(null)
    }

    const openBanModal = (item) => {
        setBanTarget(item)
        setSelectedDuration('7')
        setBanReason('')
        setBanModalOpen(true)
    }

    const confirmBan = () => {
        if (banTarget && selectedDuration) {
            dispatch(banUser({ userId: banTarget._id, duration: selectedDuration, reason: banReason }))
        }
        setBanModalOpen(false)
        setBanTarget(null)
    }

    const openUnbanModal = (item) => {
        setUnbanTarget(item)
        setUnbanModalOpen(true)
    }

    useEffect(() => {
        if(unbanConfirm && unbanTarget) {
            dispatch(unbanUser({ id: unbanTarget._id }))
            setUnbanConfirm(false)
            setUnbanModalOpen(false)
            setUnbanTarget(null)
        }
    }, [unbanConfirm])

    useEffect(() => {
        if(confirm) {
            dispatch(deleteUser({ id: deleteId }))
            setConfirm(false)
        }
    }, [confirm])

    useEffect(() => {
        setTableData(users)
    }, [users])

    useEffect(() => {
        if(alert && Object.keys(alert).length > 0) {
            dispatch(clearAlert())
            setNotification(alert)
            setConfirm(false)
        }
    }, [alert])

    useEffect(() => {
        dispatch(getAllUsers())
    }, [])

    const isLight = theme === 'light'

    const formatBanExpiry = (ban) => {
        if (!ban) return null
        if (ban.permanent) return 'Permanent'
        if (!ban.expiresAt) return 'Permanent'
        const expires = new Date(ban.expiresAt)
        const now = new Date()
        const diffMs = expires - now
        if (diffMs <= 0) return null
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
        if (days > 30) {
            const months = Math.round(days / 30)
            return `${months}mo left`
        }
        return `${days}d left`
    }

    const renderActions = (value, index) => {
        const item = tableData[index]
        if (!item) return null
        const canBan = isAdmin || item.role === 'User'

        return (
            <div className="flex items-center gap-1">
                {isAdmin && (
                    <button
                        onClick={() => openRoleModal(item)}
                        title="Edit Role"
                        className={`p-[0.35rem] text-base px-2 rounded-md ${isLight ? light.edit_button : dark.edit_button}`}
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                )}
                {canBan && (
                    <button
                        onClick={() => item.ban ? openUnbanModal(item) : openBanModal(item)}
                        title={item.ban ? 'Unban' : 'Ban'}
                        className={`p-[0.35rem] text-base px-2 rounded-md ${isLight ? 'text-orange-500 hover:text-orange-600' : 'text-orange-400 hover:text-orange-500'} transition-all`}
                    >
                        <FontAwesomeIcon icon={item.ban ? faUnlock : faBan} />
                    </button>
                )}
                {isAdmin && (
                    <button
                        onClick={() => { setDeleteId(item._id); setOpenModal(true) }}
                        title="Delete"
                        className={`p-[0.35rem] text-base px-2 rounded-md ${isLight ? light.delete_button : dark.delete_button}`}
                    >
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <ConfirmModal 
                theme={theme}
                title="Confirm User Deletion"
                description={`Are you sure you want to delete this user? This action cannot be undone.`}
                openModal={openModal}
                setOpenModal={setOpenModal}
                setConfirm={setConfirm}
            />

            <ConfirmModal 
                theme={theme}
                title="Unban User"
                description={`Are you sure you want to unban ${unbanTarget?.username}?`}
                openModal={unbanModalOpen}
                setOpenModal={setUnbanModalOpen}
                setConfirm={setUnbanConfirm}
            />

            {/* Role Modal (Admin only) */}
            {roleModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setRoleModalOpen(false)} />
                    <div className="flex items-center justify-center w-full min-h-full fixed inset-0 z-[101] p-4">
                        <div
                            className={`relative max-w-sm w-full rounded-2xl shadow-2xl overflow-hidden ${isLight ? light.background : dark.background} ${isLight ? light.color : dark.color} border ${isLight ? 'border-gray-200' : 'border-gray-700'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 pt-5 pb-3">
                                <h3 className="text-lg font-semibold mb-1">Change Role</h3>
                                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                    Update role for <span className="font-medium">{roleTarget?.username}</span>
                                </p>
                            </div>

                            <div className="px-6 pb-4 space-y-2">
                                {ROLES.map((role) => (
                                    <label
                                        key={role}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                                            selectedRole === role
                                                ? isLight
                                                    ? 'border-blue-400 bg-blue-50'
                                                    : 'border-blue-500 bg-blue-500/10'
                                                : isLight
                                                    ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role}
                                            checked={selectedRole === role}
                                            onChange={() => setSelectedRole(role)}
                                            className="w-4 h-4 accent-blue-500"
                                        />
                                        <RoleBadge role={role} />
                                    </label>
                                ))}
                            </div>

                            <div className="flex gap-3 p-6 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setRoleModalOpen(false)}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-slate-700' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmRoleChange}
                                    disabled={selectedRole === roleTarget?.role}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                                        selectedRole === roleTarget?.role
                                            ? 'opacity-50 cursor-not-allowed bg-blue-600 text-white'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                >
                                    Save
                                </button>
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
                        <div
                            className={`relative max-w-sm w-full rounded-2xl shadow-2xl overflow-hidden ${isLight ? light.background : dark.background} ${isLight ? light.color : dark.color} border ${isLight ? 'border-gray-200' : 'border-gray-700'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 pt-5 pb-3">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-3 ${isLight ? 'bg-red-100' : 'bg-red-900/30'}`}>
                                    <FontAwesomeIcon icon={faBan} className={`text-lg ${isLight ? 'text-red-600' : 'text-red-400'}`} />
                                </div>
                                <h3 className="text-lg font-semibold mb-1">Ban User</h3>
                                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                    Ban <span className="font-medium">{banTarget?.username}</span> from the platform
                                </p>
                            </div>

                            <div className="px-6 pb-3">
                                <label className={`block text-xs font-medium mb-2 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Duration</label>
                                <select
                                    value={selectedDuration}
                                    onChange={(e) => setSelectedDuration(e.target.value)}
                                    className={`w-full rounded-xl py-2.5 px-3 text-sm border outline-none transition-all ${
                                        isLight
                                            ? 'bg-white border-gray-200 focus:border-blue-400 text-slate-800'
                                            : 'bg-[#1C1C1C] border-gray-700 focus:border-blue-500 text-gray-200'
                                    }`}
                                >
                                    {BAN_DURATIONS.map((d) => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="px-6 pb-4">
                                <label className={`block text-xs font-medium mb-2 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Reason (optional)</label>
                                <textarea
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    placeholder="Enter reason for ban..."
                                    rows={2}
                                    className={`w-full rounded-xl py-2.5 px-3 text-sm border outline-none resize-none transition-all ${
                                        isLight
                                            ? 'bg-white border-gray-200 focus:border-blue-400 text-slate-800 placeholder:text-slate-400'
                                            : 'bg-[#1C1C1C] border-gray-700 focus:border-blue-500 text-gray-200 placeholder:text-gray-600'
                                    }`}
                                />
                            </div>

                            <div className="flex gap-3 p-6 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setBanModalOpen(false)}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-slate-700' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmBan}
                                    className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Ban User
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className='mb-8 flex xs:flex-row flex-col justify-between items-start gap-4'>
                <div>
                    <h1 className={`text-3xl font-semibold mb-2 ${isLight ? light.heading : dark.heading}`}>
                        Manage Users
                    </h1>
                    <p className={`text-sm ${isLight ? light.text : dark.text}`}>
                        View and manage all registered users
                    </p>
                </div>
            </div>

            <Table 
                theme={theme}
                title=""
                header={[
                    { 
                        key: 'username', 
                        label: 'User', 
                        render: (value, index) => {
                            const item = tableData[index]
                            if (!item) return value
                            return (
                                <div className="flex items-center">
                                    <div className="relative w-8 h-8 mr-3 rounded-full">
                                        <Avatar 
                                            theme={theme}
                                            image={item.avatar}
                                            size={8}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.username}</p>
                                        <RoleBadge role={item.role} />
                                    </div>
                                </div>
                            )
                        }
                    },
                    {
                        key: 'profile_id',
                        label: 'Full Name',
                        render: (value) => {
                            if (!value) return <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Not set</span>
                            const name = [value.first_name, value.last_name].filter(Boolean).join(' ')
                            return name || <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Not set</span>
                        }
                    },
                    {
                        key: 'verification',
                        label: 'Verified',
                        render: (value) => (
                            <div className="text-center">
                                {value?.verified 
                                    ? <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                                    : <FontAwesomeIcon icon={faXmark} className="text-red-500" />
                                }
                            </div>
                        )
                    },
                    {
                        key: 'subscribers',
                        label: 'Subscribers',
                        render: (value) => value?.length || 0
                    },
                    {
                        key: 'ban',
                        label: 'Status',
                        render: (value) => {
                            if (!value) {
                                return <span className="text-green-500 text-xs font-medium">Active</span>
                            }
                            const expiry = formatBanExpiry(value)
                            if (!expiry) {
                                return <span className="text-green-500 text-xs font-medium">Active</span>
                            }
                            return (
                                <div>
                                    <span className="text-red-500 text-xs font-medium">Banned</span>
                                    <p className="text-[10px] text-red-400">{expiry}</p>
                                </div>
                            )
                        }
                    },
                    { 
                        key: 'createdAt', 
                        label: 'Date Joined', 
                        render: (item) => {
                            if (!item) return 'N/A'
                            const date = new Date(item)
                            return (
                                <div>
                                    <p>
                                        {date.toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric'
                                        })}
                                    </p>
                                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                        {date.toLocaleTimeString('en-US', { 
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )
                        }
                    },
                    { key: '_id', label: 'Action', render: renderActions },
                ]}
                limit={10}
                multipleSelect={false}
                data={tableData}
                setSelectedData={setSelectedData}
                loading={loading}
            />
        </div>
    )
}

export default ManageUsers
