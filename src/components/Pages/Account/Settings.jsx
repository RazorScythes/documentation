import React, { useEffect, useState } from 'react'
import { dark, light } from '../../../style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faShieldHalved, faEye, faEyeSlash, faTrashCan, faLock, faEnvelope,
    faTriangleExclamation, faSpinner, faUser, faChevronRight, faPalette,
    faCircleCheck, faCircleXmark
} from '@fortawesome/free-solid-svg-icons'
import * as api from '../../../endpoint'
import Cookies from 'universal-cookie'
import { useNavigate } from 'react-router-dom'

const cookies = new Cookies()

const Settings = ({ user, theme, setNotification }) => {
    const navigate = useNavigate()

    const [settings, setSettings] = useState({ safe_content: true })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(null)

    const [sendingVerification, setSendingVerification] = useState(false)
    const [verificationSent, setVerificationSent] = useState(false)
    const [cooldown, setCooldown] = useState(0)

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')
    const [showDeletePassword, setShowDeletePassword] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteTyped, setDeleteTyped] = useState('')

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.getSettings()
                setSettings(res.data.result)
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    useEffect(() => {
        if (cooldown <= 0) return
        const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [cooldown])

    const handleSendVerification = async () => {
        if (sendingVerification || cooldown > 0) return
        setSendingVerification(true)

        try {
            const res = await api.sendVerificationEmail()
            if (setNotification) setNotification(res.data.alert)
            setVerificationSent(true)
            setCooldown(60)
        } catch (err) {
            const msg = err.response?.data?.alert?.message || 'Failed to send verification email'
            if (setNotification) setNotification({ variant: 'danger', message: msg })
            if (err.response?.status === 429) {
                const match = msg.match(/(\d+)s/)
                if (match) setCooldown(parseInt(match[1]))
            }
        } finally {
            setSendingVerification(false)
        }
    }

    const handleToggle = async (key) => {
        const newValue = !settings[key]
        const prev = { ...settings }
        setSettings(s => ({ ...s, [key]: newValue }))
        setSaving(key)

        try {
            const res = await api.updateSettings({ [key]: newValue })
            setSettings(res.data.result)
            if (setNotification) setNotification(res.data.alert)
        } catch {
            setSettings(prev)
            if (setNotification) setNotification({ variant: 'danger', message: 'Failed to update settings' })
        } finally {
            setSaving(null)
        }
    }

    const handleDeleteAccount = async () => {
        if (deleting) return
        if (!settings.googleId && !deletePassword) {
            if (setNotification) setNotification({ variant: 'danger', message: 'Password is required' })
            return
        }
        if (deleteTyped !== 'DELETE') {
            if (setNotification) setNotification({ variant: 'danger', message: 'Please type DELETE to confirm' })
            return
        }

        setDeleting(true)
        try {
            await api.deleteAccount({ password: deletePassword })
            cookies.remove('token')
            localStorage.removeItem('profile')
            localStorage.removeItem('avatar')
            window.location.href = '/login'
        } catch (err) {
            const msg = err.response?.data?.alert?.message || 'Failed to delete account'
            if (setNotification) setNotification({ variant: 'danger', message: msg })
            setDeleting(false)
        }
    }

    const closeDeleteModal = () => {
        setDeleteModalOpen(false)
        setDeletePassword('')
        setShowDeletePassword(false)
        setDeleteTyped('')
    }

    const isLight = theme === 'light'

    const cardClass = `rounded-xl border ${isLight ? 'bg-white/70 border-blue-200/60 shadow-sm' : 'bg-[#1A1A1A] border-[#2B2B2B]'}`

    if (loading) {
        return (
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-8">
                    <div className={`w-32 h-7 rounded-lg animate-pulse mb-2 ${isLight ? light.focusbackground : dark.focusbackground}`} />
                    <div className={`w-56 h-4 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                </div>
                <div className="max-w-2xl space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-[72px] rounded-xl animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-8">
                <h1 className={`text-2xl font-semibold mb-1 ${isLight ? light.heading : dark.heading}`}>
                    Settings
                </h1>
                <p className={`text-sm ${isLight ? light.text : dark.text}`}>
                    Manage your account preferences and security
                </p>
            </div>

            <div className="max-w-2xl space-y-8">

                {/* Account */}
                <section>
                    <p className={`text-[11px] font-bold uppercase tracking-widest mb-3 pl-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                        Account
                    </p>
                    <div className={cardClass}>
                        {/* Email */}
                        <div className={`px-4 py-3.5 ${isLight ? 'border-b border-blue-100/60' : 'border-b border-[#2B2B2B]'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-50 text-blue-500' : 'bg-blue-950/40 text-blue-400'}`}>
                                    <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Email</p>
                                    <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                                        {settings.email || '—'}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    settings.verified
                                        ? (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-950/30 text-emerald-400')
                                        : (isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-950/30 text-amber-400')
                                }`}>
                                    <FontAwesomeIcon icon={settings.verified ? faCircleCheck : faCircleXmark} className="text-[9px]" />
                                    {settings.verified ? 'Verified' : 'Unverified'}
                                </span>
                            </div>
                            {!settings.verified && (
                                <div className={`mt-2.5 ml-11 flex items-center gap-2`}>
                                    {verificationSent && cooldown > 0 ? (
                                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                            Verification email sent. Resend in <span className="font-semibold">{cooldown}s</span>
                                        </p>
                                    ) : (
                                        <button
                                            onClick={handleSendVerification}
                                            disabled={sendingVerification}
                                            className={`text-[11px] font-medium px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                                                isLight
                                                    ? 'bg-blue-100/80 text-blue-600 hover:bg-blue-200/80'
                                                    : 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {sendingVerification && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[9px]" />}
                                            {sendingVerification ? 'Sending...' : 'Send Verification Email'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Username */}
                        <div className={`flex items-center gap-3 px-4 py-3.5 ${isLight ? 'border-b border-blue-100/60' : 'border-b border-[#2B2B2B]'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-violet-50 text-violet-500' : 'bg-violet-950/40 text-violet-400'}`}>
                                <FontAwesomeIcon icon={faUser} className="text-xs" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Username</p>
                                <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                                    {settings.username || '—'}
                                </p>
                            </div>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                settings.role === 'Admin'
                                    ? (isLight ? 'bg-red-50 text-red-600' : 'bg-red-950/30 text-red-400')
                                    : settings.role === 'Moderator'
                                        ? (isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-950/30 text-amber-400')
                                        : (isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-950/30 text-blue-400')
                            }`}>
                                {settings.role || 'User'}
                            </span>
                        </div>

                        {/* Password */}
                        <button
                            onClick={() => navigate('/account/profile/password')}
                            className={`flex items-center gap-3 px-4 py-3.5 w-full text-left transition-colors ${
                                isLight ? 'hover:bg-blue-50/50' : 'hover:bg-[#222]'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-gray-800 text-gray-400'}`}>
                                <FontAwesomeIcon icon={faLock} className="text-xs" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Change Password</p>
                                <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {settings.googleId ? 'Signed in with Google' : 'Update your password'}
                                </p>
                            </div>
                            <FontAwesomeIcon icon={faChevronRight} className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                        </button>
                    </div>
                </section>

                {/* Preferences */}
                <section>
                    <p className={`text-[11px] font-bold uppercase tracking-widest mb-3 pl-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                        Preferences
                    </p>
                    <div className={cardClass}>
                        <div className={`flex items-center gap-3 px-4 py-3.5`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-emerald-50 text-emerald-500' : 'bg-emerald-950/40 text-emerald-400'}`}>
                                <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Safe Content</p>
                                <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                    Hide age-restricted or sensitive content
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle('safe_content')}
                                disabled={saving === 'safe_content'}
                                className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0 ${
                                    settings.safe_content ? 'bg-blue-600' : (isLight ? 'bg-gray-300' : 'bg-gray-600')
                                } ${saving === 'safe_content' ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                            >
                                <span className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                    settings.safe_content ? 'translate-x-[18px]' : 'translate-x-0'
                                }`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-3 pl-1 text-red-500">
                        Danger Zone
                    </p>
                    <div className={`rounded-xl border ${isLight ? 'border-red-200/80 bg-red-50/40' : 'border-red-900/30 bg-red-950/10'}`}>
                        <div className="flex items-center gap-3 px-4 py-3.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-red-100 text-red-500' : 'bg-red-950/40 text-red-400'}`}>
                                <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isLight ? 'text-red-700' : 'text-red-400'}`}>Delete Account</p>
                                <p className={`text-xs ${isLight ? 'text-red-400/80' : 'text-red-500/60'}`}>
                                    Permanently remove your account and all data
                                </p>
                            </div>
                            <button
                                onClick={() => setDeleteModalOpen(true)}
                                className="text-[11px] font-semibold px-3.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shrink-0"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Delete Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeDeleteModal}>
                    <div
                        className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl ${isLight ? 'bg-white' : 'bg-[#1C1C1C]'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`px-6 pt-6 pb-4 text-center ${isLight ? 'bg-red-50/60' : 'bg-red-950/20'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                                isLight ? 'bg-red-100 text-red-500' : 'bg-red-900/40 text-red-400'
                            }`}>
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-lg" />
                            </div>
                            <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                Delete your account?
                            </h3>
                            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                This will permanently delete your videos, playlists, messages and profile.
                            </p>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 space-y-3">
                            {!settings.googleId && (
                                <div>
                                    <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showDeletePassword ? 'text' : 'password'}
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className={`w-full px-3 py-2 pr-9 text-sm rounded-lg ${isLight ? light.input : dark.input}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowDeletePassword(!showDeletePassword)}
                                            className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}
                                        >
                                            <FontAwesomeIcon icon={showDeletePassword ? faEyeSlash : faEye} className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                    Type <span className="font-mono text-red-500">DELETE</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteTyped}
                                    onChange={(e) => setDeleteTyped(e.target.value.toUpperCase())}
                                    placeholder="DELETE"
                                    className={`w-full px-3 py-2 text-sm rounded-lg font-mono tracking-wider ${isLight ? light.input : dark.input}`}
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className={`px-6 py-4 flex gap-2 ${isLight ? 'border-t border-gray-100' : 'border-t border-[#2B2B2B]'}`}>
                            <button
                                onClick={closeDeleteModal}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    isLight
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        : 'bg-[#2B2B2B] text-gray-300 hover:bg-[#333]'
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting || deleteTyped !== 'DELETE' || (!settings.googleId && !deletePassword)}
                                className="flex-1 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                                {deleting && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />}
                                {deleting ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Settings
