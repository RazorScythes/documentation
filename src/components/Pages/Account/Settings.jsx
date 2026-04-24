import React, { useEffect, useState } from 'react'
import { dark, light } from '../../../style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faShieldHalved, faEye, faEyeSlash, faTrashCan, faLock, faEnvelope,
    faTriangleExclamation, faSpinner, faUser, faChevronRight, faPalette,
    faCircleCheck, faCircleXmark, faKey, faDesktop, faFileExport,
    faBell, faGlobe, faShield, faLink, faCopy, faCheck, faXmark,
    faSignOutAlt, faClipboard, faChartLine
} from '@fortawesome/free-solid-svg-icons'
import { faGithub, faTwitter, faLinkedin, faYoutube, faDiscord } from '@fortawesome/free-brands-svg-icons'
import * as api from '../../../endpoint'
import Cookies from 'universal-cookie'
import { useNavigate } from 'react-router-dom'

const cookies = new Cookies()

const Settings = ({ user, theme, setNotification }) => {
    const navigate = useNavigate()

    const [settings, setSettings] = useState({ safe_content: true })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(null)
    const [activeTab, setActiveTab] = useState('account')

    const [sendingVerification, setSendingVerification] = useState(false)
    const [verificationSent, setVerificationSent] = useState(false)
    const [cooldown, setCooldown] = useState(0)

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')
    const [showDeletePassword, setShowDeletePassword] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteTyped, setDeleteTyped] = useState('')

    const [twoFA, setTwoFA] = useState({ enabled: false, has_backup_codes: false })
    const [toggling2FA, setToggling2FA] = useState(false)
    const [backupCodes, setBackupCodes] = useState([])
    const [showBackupModal, setShowBackupModal] = useState(false)

    const [sessions, setSessions] = useState([])
    const [sessionsLoading, setSessionsLoading] = useState(false)
    const [revokingSession, setRevokingSession] = useState(null)

    const [exporting, setExporting] = useState(false)

    const [notifPrefs, setNotifPrefs] = useState({})
    const [notifLoading, setNotifLoading] = useState(false)
    const [savingNotif, setSavingNotif] = useState(null)

    const [socialLinks, setSocialLinks] = useState({})
    const [socialLoading, setSocialLoading] = useState(false)
    const [socialEditing, setSocialEditing] = useState(false)
    const [socialForm, setSocialForm] = useState({})
    const [savingSocial, setSavingSocial] = useState(false)

    const [securityLog, setSecurityLog] = useState([])
    const [securityLoading, setSecurityLoading] = useState(false)
    const [suspiciousCount, setSuspiciousCount] = useState(0)

    const [completeness, setCompleteness] = useState(null)

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
        fetchCompleteness()
    }, [])

    useEffect(() => {
        if (cooldown <= 0) return
        const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [cooldown])

    useEffect(() => {
        if (activeTab === '2fa') fetch2FA()
        if (activeTab === 'sessions') fetchSessions()
        if (activeTab === 'notifications') fetchNotifPrefs()
        if (activeTab === 'social') fetchSocialLinks()
        if (activeTab === 'security') fetchSecurityLog()
    }, [activeTab])

    const fetchCompleteness = async () => {
        try {
            const res = await api.getProfileCompleteness()
            setCompleteness(res.data.result)
        } catch {}
    }

    const fetch2FA = async () => {
        try {
            const res = await api.get2FAStatus()
            setTwoFA(res.data.result)
        } catch {}
    }

    const fetchSessions = async () => {
        setSessionsLoading(true)
        try {
            const res = await api.getSessions()
            setSessions(res.data.result)
        } catch {} finally { setSessionsLoading(false) }
    }

    const fetchNotifPrefs = async () => {
        setNotifLoading(true)
        try {
            const res = await api.getNotificationPrefs()
            setNotifPrefs(res.data.result)
        } catch {} finally { setNotifLoading(false) }
    }

    const fetchSocialLinks = async () => {
        setSocialLoading(true)
        try {
            const res = await api.getSocialLinks()
            setSocialLinks(res.data.result)
            setSocialForm(res.data.result)
        } catch {} finally { setSocialLoading(false) }
    }

    const fetchSecurityLog = async () => {
        setSecurityLoading(true)
        try {
            const res = await api.getSecurityLog({ limit: 20 })
            setSecurityLog(res.data.result)
            setSuspiciousCount(res.data.suspicious_count || 0)
        } catch {} finally { setSecurityLoading(false) }
    }

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
        } finally { setSendingVerification(false) }
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
        } finally { setSaving(null) }
    }

    const handleToggle2FA = async () => {
        if (toggling2FA) return
        setToggling2FA(true)
        try {
            const res = await api.toggle2FA()
            setTwoFA({ enabled: res.data.result.enabled, has_backup_codes: res.data.result.backup_codes?.length > 0 })
            if (res.data.result.backup_codes?.length > 0) {
                setBackupCodes(res.data.result.backup_codes)
                setShowBackupModal(true)
            }
            if (setNotification) setNotification(res.data.alert)
        } catch (err) {
            const msg = err.response?.data?.alert?.message || 'Failed to toggle 2FA'
            if (setNotification) setNotification({ variant: 'danger', message: msg })
        } finally { setToggling2FA(false) }
    }

    const handleRevokeSession = async (sessionId) => {
        setRevokingSession(sessionId)
        try {
            const res = await api.revokeSession(sessionId)
            setSessions(res.data.result)
            if (setNotification) setNotification(res.data.alert)
        } catch (err) {
            const msg = err.response?.data?.alert?.message || 'Failed to revoke session'
            if (setNotification) setNotification({ variant: 'danger', message: msg })
        } finally { setRevokingSession(null) }
    }

    const handleRevokeAll = async () => {
        try {
            const res = await api.revokeAllSessions()
            setSessions(res.data.result)
            if (setNotification) setNotification(res.data.alert)
        } catch (err) {
            const msg = err.response?.data?.alert?.message || 'Failed'
            if (setNotification) setNotification({ variant: 'danger', message: msg })
        }
    }

    const handleExportData = async () => {
        if (exporting) return
        setExporting(true)
        try {
            const res = await api.exportAccountData()
            const blob = new Blob([JSON.stringify(res.data.result, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `account-data-${Date.now()}.json`
            a.click()
            URL.revokeObjectURL(url)
            if (setNotification) setNotification({ variant: 'success', message: 'Account data exported' })
        } catch {
            if (setNotification) setNotification({ variant: 'danger', message: 'Failed to export data' })
        } finally { setExporting(false) }
    }

    const handleNotifToggle = async (key) => {
        const prev = { ...notifPrefs }
        setNotifPrefs(p => ({ ...p, [key]: !p[key] }))
        setSavingNotif(key)
        try {
            const res = await api.updateNotificationPrefs({ [key]: !prev[key] })
            setNotifPrefs(res.data.result)
            if (setNotification) setNotification(res.data.alert)
        } catch {
            setNotifPrefs(prev)
            if (setNotification) setNotification({ variant: 'danger', message: 'Failed to update' })
        } finally { setSavingNotif(null) }
    }

    const handleSaveSocial = async () => {
        setSavingSocial(true)
        try {
            const res = await api.updateSocialLinks(socialForm)
            setSocialLinks(res.data.result)
            setSocialEditing(false)
            if (setNotification) setNotification(res.data.alert)
            fetchCompleteness()
        } catch {
            if (setNotification) setNotification({ variant: 'danger', message: 'Failed to save' })
        } finally { setSavingSocial(false) }
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
    const cardClass = `rounded-xl border ${isLight ? 'bg-white/80 border-blue-200/60 shadow-sm' : 'bg-[#1C1C1C] border-[#2B2B2B]'}`
    const labelClass = `text-[11px] font-bold uppercase tracking-widest mb-3 pl-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`

    const tabs = [
        { id: 'account', label: 'Account', icon: faUser },
        { id: '2fa', label: '2FA', icon: faKey },
        { id: 'sessions', label: 'Sessions', icon: faDesktop },
        { id: 'notifications', label: 'Notifications', icon: faBell },
        { id: 'social', label: 'Social', icon: faLink },
        { id: 'security', label: 'Security', icon: faShield },
    ]

    const ToggleSwitch = ({ value, onChange, disabled, saving: sav, label }) => (
        <button
            type="button"
            role="switch"
            aria-checked={!!value}
            aria-label={label}
            onClick={onChange}
            disabled={disabled || sav}
            className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0 ${
                value ? 'bg-blue-600' : (isLight ? 'bg-gray-300' : 'bg-gray-600')
            } ${sav ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
        >
            <span className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                value ? 'translate-x-[18px]' : 'translate-x-0'
            }`} />
        </button>
    )

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
                <h1 className={`text-3xl font-semibold mb-2 ${isLight ? light.heading : dark.heading}`}>
                    Settings
                </h1>
                <p className={`text-sm ${isLight ? light.text : dark.text}`}>
                    Manage your account preferences and security
                </p>
            </div>

            {/* Profile Completeness */}
            {completeness && completeness.percentage < 100 && (
                <div className={`mb-6 p-4 rounded-xl border ${isLight ? 'bg-blue-50/50 border-blue-200/60' : 'bg-blue-950/20 border-blue-900/30'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faChartLine} className={`text-sm ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                            <span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                                Profile Completeness
                            </span>
                        </div>
                        <span className={`text-sm font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>{completeness.percentage}%</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-blue-100' : 'bg-blue-950/40'}`}>
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                            style={{ width: `${completeness.percentage}%` }}
                        />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {completeness.fields.filter(f => !f.done).map(f => (
                            <span key={f.name} className={`text-[10px] px-2 py-0.5 rounded-full ${isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-400'}`}>
                                {f.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className={`flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide`} role="tablist" aria-label="Settings sections">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                            activeTab === tab.id
                                ? (isLight ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-600 text-white')
                                : (isLight ? 'text-slate-600 hover:bg-blue-50' : 'text-gray-400 hover:bg-[#1C1C1C]')
                        }`}
                    >
                        <FontAwesomeIcon icon={tab.icon} className="text-[10px]" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="max-w-2xl space-y-8">

                {/* ───── Account Tab ───── */}
                {activeTab === 'account' && (
                    <>
                        <section>
                            <p className={labelClass}>Account</p>
                            <div className={cardClass}>
                                <div className={`px-4 py-3.5 ${isLight ? 'border-b border-blue-100/60' : 'border-b border-[#2B2B2B]'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-50 text-blue-500' : 'bg-blue-950/40 text-blue-400'}`}>
                                            <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Email</p>
                                            <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{settings.email || '—'}</p>
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
                                        <div className="mt-2.5 ml-11 flex items-center gap-2">
                                            {verificationSent && cooldown > 0 ? (
                                                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                    Verification email sent. Resend in <span className="font-semibold">{cooldown}s</span>
                                                </p>
                                            ) : (
                                                <button onClick={handleSendVerification} disabled={sendingVerification}
                                                    className={`text-[11px] font-medium px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${isLight ? 'bg-blue-100/80 text-blue-600 hover:bg-blue-200/80' : 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                                    {sendingVerification && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[9px]" />}
                                                    {sendingVerification ? 'Sending...' : 'Send Verification Email'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className={`flex items-center gap-3 px-4 py-3.5 ${isLight ? 'border-b border-blue-100/60' : 'border-b border-[#2B2B2B]'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-violet-50 text-violet-500' : 'bg-violet-950/40 text-violet-400'}`}>
                                        <FontAwesomeIcon icon={faUser} className="text-xs" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Username</p>
                                        <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{settings.username || '—'}</p>
                                    </div>
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                        settings.role === 'Admin' ? (isLight ? 'bg-red-50 text-red-600' : 'bg-red-950/30 text-red-400')
                                            : settings.role === 'Moderator' ? (isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-950/30 text-amber-400')
                                            : (isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-950/30 text-blue-400')
                                    }`}>{settings.role || 'User'}</span>
                                </div>

                                <button onClick={() => navigate('/account/profile/password')}
                                    className={`flex items-center gap-3 px-4 py-3.5 w-full text-left transition-colors ${isLight ? 'hover:bg-blue-50/50' : 'hover:bg-[#222]'}`}>
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

                        <section>
                            <p className={labelClass}>Preferences</p>
                            <div className={cardClass}>
                                <div className="flex items-center gap-3 px-4 py-3.5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-emerald-50 text-emerald-500' : 'bg-emerald-950/40 text-emerald-400'}`}>
                                        <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Safe Content</p>
                                        <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Hide age-restricted or sensitive content</p>
                                    </div>
                                    <ToggleSwitch value={settings.safe_content} onChange={() => handleToggle('safe_content')} saving={saving === 'safe_content'} label="Safe Content" />
                                </div>
                            </div>
                        </section>

                        <section>
                            <p className={labelClass}>Data</p>
                            <div className={cardClass}>
                                <button onClick={handleExportData} disabled={exporting}
                                    className={`flex items-center gap-3 px-4 py-3.5 w-full text-left transition-colors ${isLight ? 'hover:bg-blue-50/50' : 'hover:bg-[#222]'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-indigo-50 text-indigo-500' : 'bg-indigo-950/40 text-indigo-400'}`}>
                                        <FontAwesomeIcon icon={exporting ? faSpinner : faFileExport} className={`text-xs ${exporting ? 'animate-spin' : ''}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Export Account Data</p>
                                        <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Download all your data as JSON</p>
                                    </div>
                                    <FontAwesomeIcon icon={faChevronRight} className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                </button>
                            </div>
                        </section>

                        <section>
                            <p className="text-[11px] font-bold uppercase tracking-widest mb-3 pl-1 text-red-500">Danger Zone</p>
                            <div className={`rounded-xl border ${isLight ? 'border-red-200/80 bg-red-50/40' : 'border-red-900/30 bg-red-950/10'}`}>
                                <div className="flex items-center gap-3 px-4 py-3.5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-red-100 text-red-500' : 'bg-red-950/40 text-red-400'}`}>
                                        <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${isLight ? 'text-red-700' : 'text-red-400'}`}>Delete Account</p>
                                        <p className={`text-xs ${isLight ? 'text-red-400/80' : 'text-red-500/60'}`}>Permanently remove your account and all data</p>
                                    </div>
                                    <button onClick={() => setDeleteModalOpen(true)}
                                        className="text-[11px] font-semibold px-3.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shrink-0">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* ───── 2FA Tab ───── */}
                {activeTab === '2fa' && (
                    <section>
                        <p className={labelClass}>Two-Factor Authentication</p>
                        <div className={cardClass}>
                            <div className="px-4 py-4">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        twoFA.enabled ? (isLight ? 'bg-emerald-50 text-emerald-500' : 'bg-emerald-950/40 text-emerald-400')
                                            : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-gray-800 text-gray-500')
                                    }`}>
                                        <FontAwesomeIcon icon={faKey} className="text-base" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                                                {twoFA.enabled ? '2FA is Enabled' : '2FA is Disabled'}
                                            </p>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                twoFA.enabled ? (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/30 text-emerald-400')
                                                    : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-gray-800 text-gray-500')
                                            }`}>{twoFA.enabled ? 'Active' : 'Inactive'}</span>
                                        </div>
                                        <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                            {twoFA.enabled
                                                ? 'Your account has an extra layer of security. You can disable it anytime.'
                                                : 'Add an extra layer of security to your account by enabling 2FA.'}
                                        </p>
                                        <button onClick={handleToggle2FA} disabled={toggling2FA}
                                            className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                                                twoFA.enabled
                                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            } disabled:opacity-50`}>
                                            {toggling2FA && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[10px]" />}
                                            {twoFA.enabled ? 'Disable 2FA' : 'Enable 2FA'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ───── Sessions Tab ───── */}
                {activeTab === 'sessions' && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <p className={labelClass + ' mb-0'}>Active Sessions</p>
                            {sessions.length > 1 && (
                                <button onClick={handleRevokeAll}
                                    className="text-[11px] font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1">
                                    <FontAwesomeIcon icon={faSignOutAlt} className="text-[10px]" />
                                    Revoke All
                                </button>
                            )}
                        </div>
                        <div className={cardClass}>
                            {sessionsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <FontAwesomeIcon icon={faSpinner} className={`animate-spin text-lg ${isLight ? 'text-blue-400' : 'text-blue-500'}`} />
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="text-center py-12">
                                    <FontAwesomeIcon icon={faDesktop} className={`text-3xl mb-2 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>No active sessions found</p>
                                </div>
                            ) : (
                                sessions.map((session, i) => (
                                    <div key={session._id} className={`flex items-center gap-3 px-4 py-3.5 ${
                                        i < sessions.length - 1 ? (isLight ? 'border-b border-blue-100/60' : 'border-b border-[#2B2B2B]') : ''
                                    }`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-50 text-blue-500' : 'bg-blue-950/40 text-blue-400'}`}>
                                            <FontAwesomeIcon icon={faDesktop} className="text-xs" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{session.device}</p>
                                            <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                IP: {session.ip} &middot; {new Date(session.last_active).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button onClick={() => handleRevokeSession(session._id)} disabled={revokingSession === session._id}
                                            className={`text-[10px] font-medium px-2.5 py-1 rounded-lg transition-colors ${
                                                isLight ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-red-400 bg-red-950/30 hover:bg-red-950/50'
                                            } disabled:opacity-50`}>
                                            {revokingSession === session._id ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : 'Revoke'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {/* ───── Notifications Tab ───── */}
                {activeTab === 'notifications' && (
                    <section>
                        <p className={labelClass}>Notification Preferences</p>
                        <div className={cardClass}>
                            {notifLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <FontAwesomeIcon icon={faSpinner} className={`animate-spin text-lg ${isLight ? 'text-blue-400' : 'text-blue-500'}`} />
                                </div>
                            ) : (
                                [
                                    { key: 'email_updates', label: 'Email Updates', desc: 'Receive email updates about new features' },
                                    { key: 'security_alerts', label: 'Security Alerts', desc: 'Get notified about suspicious activity' },
                                    { key: 'marketing', label: 'Marketing', desc: 'Receive promotional emails' },
                                    { key: 'comment_replies', label: 'Comment Replies', desc: 'Get notified when someone replies to your comments' },
                                    { key: 'new_followers', label: 'New Followers', desc: 'Get notified when someone subscribes to you' },
                                ].map((item, i, arr) => (
                                    <div key={item.key} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? (isLight ? 'border-b border-blue-100/60' : 'border-b border-[#2B2B2B]') : ''}`}>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{item.label}</p>
                                            <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{item.desc}</p>
                                        </div>
                                        <ToggleSwitch value={notifPrefs[item.key]} onChange={() => handleNotifToggle(item.key)} saving={savingNotif === item.key} label={item.label} />
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {/* ───── Social Tab ───── */}
                {activeTab === 'social' && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <p className={labelClass + ' mb-0'}>Social Links</p>
                            {!socialEditing ? (
                                <button onClick={() => { setSocialEditing(true); setSocialForm(socialLinks) }}
                                    className={`text-[11px] font-medium px-3 py-1 rounded-lg transition-colors ${isLight ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'}`}>
                                    Edit
                                </button>
                            ) : (
                                <div className="flex gap-1.5">
                                    <button onClick={() => setSocialEditing(false)}
                                        className={`text-[11px] font-medium px-3 py-1 rounded-lg transition-colors ${isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                                        Cancel
                                    </button>
                                    <button onClick={handleSaveSocial} disabled={savingSocial}
                                        className="text-[11px] font-medium px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1">
                                        {savingSocial && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[9px]" />}
                                        Save
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={cardClass}>
                            {socialLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <FontAwesomeIcon icon={faSpinner} className={`animate-spin text-lg ${isLight ? 'text-blue-400' : 'text-blue-500'}`} />
                                </div>
                            ) : (
                                [
                                    { key: 'website', label: 'Website', icon: faGlobe, placeholder: 'https://yoursite.com' },
                                    { key: 'github', label: 'GitHub', icon: faGithub, placeholder: 'https://github.com/username' },
                                    { key: 'twitter', label: 'Twitter / X', icon: faTwitter, placeholder: 'https://twitter.com/username' },
                                    { key: 'linkedin', label: 'LinkedIn', icon: faLinkedin, placeholder: 'https://linkedin.com/in/username' },
                                    { key: 'youtube', label: 'YouTube', icon: faYoutube, placeholder: 'https://youtube.com/@channel' },
                                    { key: 'discord', label: 'Discord', icon: faDiscord, placeholder: 'username#1234' },
                                ].map((item, i, arr) => (
                                    <div key={item.key} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? (isLight ? 'border-b border-blue-100/60' : 'border-b border-[#2B2B2B]') : ''}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-gray-800 text-gray-400'}`}>
                                            <FontAwesomeIcon icon={item.icon} className="text-xs" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[10px] font-medium mb-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{item.label}</p>
                                            {socialEditing ? (
                                                <input
                                                    type="text"
                                                    value={socialForm[item.key] || ''}
                                                    onChange={(e) => setSocialForm(p => ({ ...p, [item.key]: e.target.value }))}
                                                    placeholder={item.placeholder}
                                                    className={`w-full text-sm py-1 px-2 rounded-md ${isLight ? light.input : dark.input}`}
                                                />
                                            ) : (
                                                <p className={`text-sm truncate ${socialLinks[item.key] ? (isLight ? 'text-slate-700' : 'text-gray-300') : (isLight ? 'text-slate-300' : 'text-gray-600')}`}>
                                                    {socialLinks[item.key] || 'Not set'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {/* ───── Security Tab ───── */}
                {activeTab === 'security' && (
                    <section>
                        <p className={labelClass}>Security Log</p>
                        {suspiciousCount > 0 && (
                            <div className={`mb-4 p-3 rounded-xl border flex items-center gap-3 ${isLight ? 'bg-amber-50/50 border-amber-200/60' : 'bg-amber-950/20 border-amber-900/30'}`}>
                                <FontAwesomeIcon icon={faTriangleExclamation} className={`${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
                                <p className={`text-xs ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                                    <strong>{suspiciousCount}</strong> sensitive action{suspiciousCount !== 1 ? 's' : ''} detected in recent activity
                                </p>
                            </div>
                        )}
                        <div className={cardClass}>
                            {securityLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <FontAwesomeIcon icon={faSpinner} className={`animate-spin text-lg ${isLight ? 'text-blue-400' : 'text-blue-500'}`} />
                                </div>
                            ) : securityLog.length === 0 ? (
                                <div className="text-center py-12">
                                    <FontAwesomeIcon icon={faShield} className={`text-3xl mb-2 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>No security events found</p>
                                </div>
                            ) : (
                                securityLog.map((log, i) => {
                                    const isSensitive = ['delete_account', 'change_password', 'revoke_all_sessions', 'disable_2fa'].includes(log.action)
                                    return (
                                        <div key={log._id} className={`flex items-start gap-3 px-4 py-3.5 ${
                                            i < securityLog.length - 1 ? (isLight ? 'border-b border-blue-100/60' : 'border-b border-[#2B2B2B]') : ''
                                        } ${isSensitive ? (isLight ? 'bg-red-50/30' : 'bg-red-950/10') : ''}`}>
                                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isSensitive ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{log.message}</p>
                                                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                                    {log.ip_address && `${log.ip_address} · `}
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {isSensitive && (
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isLight ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-400'}`}>
                                                    ALERT
                                                </span>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </section>
                )}
            </div>

            {/* Delete Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeDeleteModal}>
                    <div className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl ${isLight ? 'bg-white' : 'bg-[#1C1C1C]'}`}
                        onClick={(e) => e.stopPropagation()}>
                        <div className={`px-6 pt-6 pb-4 text-center ${isLight ? 'bg-red-50/60' : 'bg-red-950/20'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${isLight ? 'bg-red-100 text-red-500' : 'bg-red-900/40 text-red-400'}`}>
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-lg" />
                            </div>
                            <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Delete your account?</h3>
                            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                This will permanently delete your videos, playlists, messages and profile.
                            </p>
                        </div>
                        <div className="px-6 py-4 space-y-3">
                            {!settings.googleId && (
                                <div>
                                    <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Password</label>
                                    <div className="relative">
                                        <input type={showDeletePassword ? 'text' : 'password'} value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)} placeholder="Enter your password"
                                            className={`w-full px-3 py-2 pr-9 text-sm rounded-lg ${isLight ? light.input : dark.input}`} />
                                        <button type="button" onClick={() => setShowDeletePassword(!showDeletePassword)}
                                            aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                                            className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                            <FontAwesomeIcon icon={showDeletePassword ? faEyeSlash : faEye} className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                    Type <span className="font-mono text-red-500">DELETE</span> to confirm
                                </label>
                                <input type="text" value={deleteTyped} onChange={(e) => setDeleteTyped(e.target.value.toUpperCase())}
                                    placeholder="DELETE" className={`w-full px-3 py-2 text-sm rounded-lg font-mono tracking-wider ${isLight ? light.input : dark.input}`} />
                            </div>
                        </div>
                        <div className={`px-6 py-4 flex gap-2 ${isLight ? 'border-t border-gray-100' : 'border-t border-[#2B2B2B]'}`}>
                            <button onClick={closeDeleteModal}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${isLight ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-[#2B2B2B] text-gray-300 hover:bg-[#333]'}`}>
                                Cancel
                            </button>
                            <button onClick={handleDeleteAccount}
                                disabled={deleting || deleteTyped !== 'DELETE' || (!settings.googleId && !deletePassword)}
                                className="flex-1 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                                {deleting && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />}
                                {deleting ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Backup Codes Modal */}
            {showBackupModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowBackupModal(false)}>
                    <div className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl ${isLight ? 'bg-white' : 'bg-[#1C1C1C]'}`}
                        onClick={(e) => e.stopPropagation()}>
                        <div className={`px-6 pt-6 pb-4 text-center ${isLight ? 'bg-emerald-50/60' : 'bg-emerald-950/20'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${isLight ? 'bg-emerald-100 text-emerald-500' : 'bg-emerald-900/40 text-emerald-400'}`}>
                                <FontAwesomeIcon icon={faKey} className="text-lg" />
                            </div>
                            <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Save Your Backup Codes</h3>
                            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                Store these codes safely. You won't see them again.
                            </p>
                        </div>
                        <div className="px-6 py-4">
                            <div className={`grid grid-cols-2 gap-2 p-3 rounded-xl font-mono text-sm ${isLight ? 'bg-slate-50' : 'bg-[#111]'}`}>
                                {backupCodes.map((code, i) => (
                                    <div key={i} className={`px-2 py-1.5 rounded text-center ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                        {code}
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => {
                                navigator.clipboard.writeText(backupCodes.join('\n'))
                                if (setNotification) setNotification({ variant: 'success', message: 'Codes copied to clipboard' })
                            }} className={`mt-3 w-full text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                                isLight ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-blue-950/30 text-blue-400 hover:bg-blue-950/50'
                            }`}>
                                <FontAwesomeIcon icon={faCopy} className="text-[10px]" />
                                Copy to Clipboard
                            </button>
                        </div>
                        <div className={`px-6 py-4 ${isLight ? 'border-t border-gray-100' : 'border-t border-[#2B2B2B]'}`}>
                            <button onClick={() => setShowBackupModal(false)}
                                className="w-full py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Settings
