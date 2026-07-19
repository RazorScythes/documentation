import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faShieldAlt, faKey, faLock, faUnlock, faFolder, faTags, faStar, faTrash, faShareAlt,
    faHistory, faCog, faSearch, faPlus, faDownload, faUpload, faExclamationTriangle,
    faCopy, faEye, faEyeSlash, faPen, faGlobe, faCreditCard, faIdCard, faStickyNote, faRandom,
} from '@fortawesome/free-solid-svg-icons'
import {
    getVaultStatus, setupVault, unlockVault, changeMasterPassword,
    getEntries, createEntry, updateEntry, deleteEntry, restoreEntry, emptyTrash,
    getFolders, createFolder, updateFolder, deleteFolder,
    importEntries, exportEntries, getAuditLogs, getDevices, removeDevice,
    getStats, getSharedWithMe, getMyShares, clearVaultAlert,
} from '../../actions/vault'
import {
    generateSalt, deriveKey, deriveAuthHash, decrypt, encrypt, assessPasswordStrength,
} from './CryptoService'
import PasswordGenerator from './PasswordGenerator'
import SecurityCenter from './SecurityCenter'
import ImportExport from './ImportExport'
import VaultEntryForm from './VaultEntryForm'

const TABS = [
    { id: 'overview', label: 'Overview', icon: faShieldAlt },
    { id: 'vault', label: 'Vault', icon: faKey },
    { id: 'generator', label: 'Generator', icon: faRandom },
    { id: 'security', label: 'Security', icon: faLock },
    { id: 'import-export', label: 'Import/Export', icon: faUpload },
    { id: 'settings', label: 'Settings', icon: faCog },
    { id: 'trash', label: 'Trash', icon: faTrash },
    { id: 'shared', label: 'Shared', icon: faShareAlt },
    { id: 'logs', label: 'Logs', icon: faHistory },
]

const TYPE_ICONS = {
    password: faKey,
    note: faStickyNote,
    card: faCreditCard,
    identity: faIdCard,
}

const TYPE_LABELS = {
    password: 'Password',
    note: 'Secure Note',
    card: 'Card',
    identity: 'Identity',
}

const TYPE_COLORS = {
    password: 'bg-blue-500/15 text-blue-500',
    note: 'bg-amber-500/15 text-amber-500',
    card: 'bg-emerald-500/15 text-emerald-500',
    identity: 'bg-violet-500/15 text-violet-500',
}

const SALT_STORAGE_KEY = 'vaultSalt'

function MasterPasswordModal({ theme, isOpen, onUnlock, onClose, isLoading, error, mode = 'unlock' }) {
    const isLight = theme === 'light'
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [localError, setLocalError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setPassword('')
            setConfirm('')
            setLocalError('')
            setShowPassword(false)
        }
    }, [isOpen])

    if (!isOpen) return null

    const cardClass = `${isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#1e1e1e]'} border border-solid rounded-xl`
    const inputClass = `${isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#111] border-[#2B2B2B] text-gray-200'} border border-solid rounded-lg px-3 py-2 text-sm outline-none w-full`

    const handleSubmit = (e) => {
        e.preventDefault()
        setLocalError('')
        if (!password) {
            setLocalError('Master password is required')
            return
        }
        if (mode === 'setup' && password !== confirm) {
            setLocalError('Passwords do not match')
            return
        }
        if (mode === 'setup' && password.length < 8) {
            setLocalError('Password must be at least 8 characters')
            return
        }
        onUnlock(password)
    }

    const strength = assessPasswordStrength(password)

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-md p-6 shadow-2xl ${cardClass}`}>
                <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-indigo-100' : 'bg-indigo-900/40'}`}>
                        <FontAwesomeIcon icon={mode === 'setup' ? faShieldAlt : faLock} className="text-indigo-500" />
                    </div>
                    <div>
                        <h2 className={`text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                            {mode === 'setup' ? 'Create Master Password' : 'Unlock Vault'}
                        </h2>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                            {mode === 'setup'
                                ? 'This password encrypts your vault. It cannot be recovered.'
                                : 'Enter your master password to access your vault'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                            Master Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${inputClass} pr-10`}
                                placeholder="Enter master password"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-xs" />
                            </button>
                        </div>
                        {mode === 'setup' && password && (
                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${
                                            strength.color === 'red' ? 'bg-red-500 w-1/4' :
                                            strength.color === 'orange' ? 'bg-orange-500 w-2/4' :
                                            strength.color === 'yellow' ? 'bg-yellow-500 w-3/4' :
                                            'bg-green-500 w-full'
                                        }`}
                                    />
                                </div>
                                <span className={`text-[10px] font-medium ${
                                    strength.color === 'red' ? 'text-red-500' :
                                    strength.color === 'orange' ? 'text-orange-500' :
                                    strength.color === 'yellow' ? 'text-yellow-500' :
                                    'text-green-500'
                                }`}>{strength.label}</span>
                            </div>
                        )}
                    </div>

                    {mode === 'setup' && (
                        <div>
                            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                Confirm Password
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className={inputClass}
                                placeholder="Confirm master password"
                            />
                        </div>
                    )}

                    {(localError || error) && (
                        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${isLight ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-400'}`}>
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            {localError || error}
                        </div>
                    )}

                    <div className="flex gap-2 pt-1">
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-colors ${
                                    isLight ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-[#2B2B2B] text-gray-400 hover:bg-[#1a1a1a]'
                                }`}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : mode === 'setup' ? 'Create Vault' : 'Unlock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function VaultManager({ theme, user }) {
    const dispatch = useDispatch()
    const isLight = theme === 'light'

    const {
        isLoading, alert, variant, entries, folders, stats, auditLogs, auditTotal,
        sharedWithMe, myShares, vaultStatus,
    } = useSelector((state) => state.vault)

    const [activeTab, setActiveTab] = useState('overview')
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [encryptionKey, setEncryptionKey] = useState(null)
    const [decryptedEntries, setDecryptedEntries] = useState([])
    const [vaultSalt, setVaultSalt] = useState(() => sessionStorage.getItem(SALT_STORAGE_KEY) || '')

    const [showMasterModal, setShowMasterModal] = useState(false)
    const [masterModalMode, setMasterModalMode] = useState('unlock')
    const [unlockError, setUnlockError] = useState('')

    const [vaultSearch, setVaultSearch] = useState('')
    const [selectedFolder, setSelectedFolder] = useState(null)
    const [typeFilter, setTypeFilter] = useState('')
    const [showEntryForm, setShowEntryForm] = useState(false)
    const [editingEntry, setEditingEntry] = useState(null)
    const [revealedIds, setRevealedIds] = useState(new Set())

    const [newFolderName, setNewFolderName] = useState('')
    const [editingFolderId, setEditingFolderId] = useState(null)
    const [editingFolderName, setEditingFolderName] = useState('')
    const [showNewFolder, setShowNewFolder] = useState(false)

    const [settingsCurrentPw, setSettingsCurrentPw] = useState('')
    const [settingsNewPw, setSettingsNewPw] = useState('')
    const [settingsConfirmPw, setSettingsConfirmPw] = useState('')
    const [settingsError, setSettingsError] = useState('')
    const [settingsSuccess, setSettingsSuccess] = useState('')
    const [showSettingsPw, setShowSettingsPw] = useState(false)

    const cardClass = `${isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#1e1e1e]'} border border-solid rounded-xl`
    const inputClass = `${isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#111] border-[#2B2B2B] text-gray-200'} border border-solid rounded-lg px-3 py-2 text-sm outline-none`
    const mutedText = isLight ? 'text-slate-500' : 'text-gray-500'
    const headingText = isLight ? 'text-slate-800' : 'text-white'
    const bodyText = isLight ? 'text-slate-600' : 'text-gray-300'

    const decryptEntries = useCallback(async (entryList, key) => {
        if (!key || !entryList?.length) {
            setDecryptedEntries([])
            return
        }
        const decrypted = await Promise.all(
            entryList.map(async (entry) => {
                try {
                    const plaintext = await decrypt(entry.encryptedData, entry.iv, key)
                    const data = JSON.parse(plaintext)
                    return { ...entry, decrypted: data }
                } catch {
                    return { ...entry, decrypted: null, decryptError: true }
                }
            })
        )
        setDecryptedEntries(decrypted)
    }, [])

    useEffect(() => {
        dispatch(getVaultStatus())
    }, [dispatch])

    useEffect(() => {
        if (vaultStatus?.hasVault && !isUnlocked) {
            setShowMasterModal(true)
            setMasterModalMode('unlock')
        } else if (vaultStatus?.hasVault === false) {
            setShowMasterModal(true)
            setMasterModalMode('setup')
        }
    }, [vaultStatus, isUnlocked])

    useEffect(() => {
        if (isUnlocked && encryptionKey) {
            decryptEntries(entries, encryptionKey)
        }
    }, [entries, encryptionKey, isUnlocked, decryptEntries])

    const loadTabData = useCallback(() => {
        if (!isUnlocked) return
        switch (activeTab) {
            case 'overview':
                dispatch(getStats())
                dispatch(getEntries({ deleted: false }))
                break
            case 'vault':
                dispatch(getEntries({ deleted: false, folder: selectedFolder || undefined, search: vaultSearch || undefined, type: typeFilter || undefined }))
                dispatch(getFolders())
                break
            case 'trash':
                dispatch(getEntries({ deleted: true }))
                break
            case 'shared':
                dispatch(getSharedWithMe())
                dispatch(getMyShares())
                break
            case 'logs':
                dispatch(getAuditLogs({ page: 0, limit: 50 }))
                break
            default:
                break
        }
    }, [activeTab, isUnlocked, dispatch, selectedFolder, vaultSearch, typeFilter])

    useEffect(() => {
        loadTabData()
    }, [loadTabData])

    const handleSetupVault = async (masterPassword) => {
        setUnlockError('')
        try {
            const salt = generateSalt()
            const key = await deriveKey(masterPassword, salt)
            const authHash = await deriveAuthHash(masterPassword, salt)
            const result = await dispatch(setupVault({ salt, authHash })).unwrap()
            sessionStorage.setItem(SALT_STORAGE_KEY, salt)
            setVaultSalt(salt)
            setEncryptionKey(key)
            setIsUnlocked(true)
            setShowMasterModal(false)
            dispatch(getStats())
            dispatch(getEntries({ deleted: false }))
            dispatch(getFolders())
        } catch (err) {
            setUnlockError(err?.message || 'Failed to set up vault')
        }
    }

    const handleUnlockVault = async (masterPassword) => {
        setUnlockError('')
        const salt = vaultSalt || sessionStorage.getItem(SALT_STORAGE_KEY)
        if (!salt) {
            setUnlockError('Vault salt not found. Please contact support.')
            return
        }
        try {
            const authHash = await deriveAuthHash(masterPassword, salt)
            const result = await dispatch(unlockVault({ authHash })).unwrap()
            const resolvedSalt = result.salt || salt
            sessionStorage.setItem(SALT_STORAGE_KEY, resolvedSalt)
            setVaultSalt(resolvedSalt)
            const key = await deriveKey(masterPassword, resolvedSalt)
            setEncryptionKey(key)
            setIsUnlocked(true)
            setShowMasterModal(false)
            dispatch(getStats())
            dispatch(getEntries({ deleted: false }))
            dispatch(getFolders())
        } catch (err) {
            setUnlockError(err?.message || 'Invalid master password')
        }
    }

    const handleLockVault = () => {
        setIsUnlocked(false)
        setEncryptionKey(null)
        setDecryptedEntries([])
        setRevealedIds(new Set())
        setShowMasterModal(true)
        setMasterModalMode('unlock')
        dispatch(clearVaultAlert())
    }

    const handleToggleFavorite = async (entry) => {
        await dispatch(updateEntry({ id: entry._id, favorite: !entry.favorite }))
        loadTabData()
    }

    const handleDeleteEntry = async (entry, permanent = false) => {
        await dispatch(deleteEntry({ id: entry._id, permanent }))
        loadTabData()
        if (activeTab === 'overview') dispatch(getStats())
    }

    const handleRestoreEntry = async (entry) => {
        await dispatch(restoreEntry({ id: entry._id }))
        loadTabData()
    }

    const handleEmptyTrash = async () => {
        if (window.confirm('Permanently delete all items in trash? This cannot be undone.')) {
            await dispatch(emptyTrash())
            loadTabData()
        }
    }

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return
        await dispatch(createFolder({ name: newFolderName.trim() }))
        setNewFolderName('')
        setShowNewFolder(false)
        dispatch(getFolders())
    }

    const handleUpdateFolder = async (folderId) => {
        if (!editingFolderName.trim()) return
        await dispatch(updateFolder({ id: folderId, name: editingFolderName.trim() }))
        setEditingFolderId(null)
        setEditingFolderName('')
        dispatch(getFolders())
    }

    const handleDeleteFolder = async (folderId) => {
        if (window.confirm('Delete this folder? Entries will be moved to uncategorized.')) {
            await dispatch(deleteFolder({ id: folderId }))
            if (selectedFolder === folderId) setSelectedFolder(null)
            dispatch(getFolders())
        }
    }

    const handleChangeMasterPassword = async (e) => {
        e.preventDefault()
        setSettingsError('')
        setSettingsSuccess('')
        if (settingsNewPw !== settingsConfirmPw) {
            setSettingsError('New passwords do not match')
            return
        }
        if (settingsNewPw.length < 8) {
            setSettingsError('New password must be at least 8 characters')
            return
        }
        try {
            const salt = vaultSalt || sessionStorage.getItem(SALT_STORAGE_KEY)
            const currentAuthHash = await deriveAuthHash(settingsCurrentPw, salt)
            const newSalt = generateSalt()
            const newKey = await deriveKey(settingsNewPw, newSalt)
            const newAuthHash = await deriveAuthHash(settingsNewPw, newSalt)

            const reEncryptedEntries = await Promise.all(
                entries.filter(e => !e.deleted).map(async (entry) => {
                    const plaintext = await decrypt(entry.encryptedData, entry.iv, encryptionKey)
                    const { encryptedData, iv } = await encrypt(plaintext, newKey)
                    return { id: entry._id, encryptedData, iv }
                })
            )

            await dispatch(changeMasterPassword({
                currentAuthHash,
                newSalt,
                newAuthHash,
                reEncryptedEntries,
            })).unwrap()

            sessionStorage.setItem(SALT_STORAGE_KEY, newSalt)
            setVaultSalt(newSalt)
            setEncryptionKey(newKey)
            setSettingsCurrentPw('')
            setSettingsNewPw('')
            setSettingsConfirmPw('')
            setSettingsSuccess('Master password changed successfully')
            dispatch(getEntries({ deleted: false }))
        } catch (err) {
            setSettingsError(err?.message || 'Failed to change master password')
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
    }

    const toggleReveal = (id) => {
        setRevealedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const filteredVaultEntries = useMemo(() => {
        let list = decryptedEntries.filter(e => !e.deleted)
        if (selectedFolder) list = list.filter(e => e.folder === selectedFolder)
        if (typeFilter) list = list.filter(e => e.type === typeFilter)
        if (vaultSearch.trim()) {
            const q = vaultSearch.toLowerCase()
            list = list.filter(e =>
                (e.metadata?.name || '').toLowerCase().includes(q) ||
                (e.metadata?.domain || '').toLowerCase().includes(q)
            )
        }
        return list
    }, [decryptedEntries, selectedFolder, typeFilter, vaultSearch])

    const trashEntries = useMemo(() =>
        decryptedEntries.filter(e => e.deleted),
    [decryptedEntries])

    const recentEntries = useMemo(() =>
        decryptedEntries.filter(e => !e.deleted).slice(0, 8),
    [decryptedEntries])

    const statCards = useMemo(() => {
        const s = stats || {}
        return [
            { label: 'Total Entries', value: s.total ?? 0, icon: faShieldAlt, color: 'text-indigo-500' },
            { label: 'Passwords', value: s.passwords ?? 0, icon: faKey, color: 'text-blue-500' },
            { label: 'Notes', value: s.notes ?? 0, icon: faStickyNote, color: 'text-amber-500' },
            { label: 'Cards', value: s.cards ?? 0, icon: faCreditCard, color: 'text-emerald-500' },
            { label: 'Identities', value: s.identities ?? 0, icon: faIdCard, color: 'text-violet-500' },
            { label: 'Favorites', value: s.favorites ?? 0, icon: faStar, color: 'text-yellow-500' },
        ]
    }, [stats])

    const renderEntryRow = (entry, options = {}) => {
        const { showRestore = false, showPermanentDelete = false } = options
        const icon = TYPE_ICONS[entry.type] || faKey
        const isRevealed = revealedIds.has(entry._id)

        return (
            <div
                key={entry._id}
                className={`flex items-center gap-3 px-4 py-3 border-b last:border-b-0 transition-colors ${
                    isLight ? 'border-slate-100 hover:bg-slate-50/80' : 'border-[#1a1a1a] hover:bg-[#141414]'
                }`}
            >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[entry.type] || 'bg-gray-500/15 text-gray-500'}`}>
                    <FontAwesomeIcon icon={icon} className="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium truncate ${headingText}`}>
                            {entry.metadata?.name || 'Untitled'}
                        </span>
                        {entry.favorite && <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-[10px]" />}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${TYPE_COLORS[entry.type]}`}>
                            {TYPE_LABELS[entry.type] || entry.type}
                        </span>
                    </div>
                    <div className={`text-xs truncate ${mutedText}`}>
                        {entry.metadata?.domain ? (
                            <span className="flex items-center gap-1">
                                <FontAwesomeIcon icon={faGlobe} className="text-[9px]" />
                                {entry.metadata.domain}
                            </span>
                        ) : entry.decryptError ? (
                            <span className="text-red-400">Decryption failed</span>
                        ) : (
                            entry.decrypted?.username || entry.decrypted?.email || '—'
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {entry.type === 'password' && entry.decrypted?.password && (
                        <>
                            <button
                                onClick={() => toggleReveal(entry._id)}
                                className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-500'}`}
                                title={isRevealed ? 'Hide' : 'Show'}
                            >
                                <FontAwesomeIcon icon={isRevealed ? faEyeSlash : faEye} className="text-xs" />
                            </button>
                            {isRevealed && (
                                <button
                                    onClick={() => copyToClipboard(entry.decrypted.password)}
                                    className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-500'}`}
                                    title="Copy password"
                                >
                                    <FontAwesomeIcon icon={faCopy} className="text-xs" />
                                </button>
                            )}
                        </>
                    )}
                    {!showRestore && (
                        <>
                            <button
                                onClick={() => handleToggleFavorite(entry)}
                                className={`p-2 rounded-lg transition-colors ${entry.favorite ? 'text-yellow-500' : isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-500'}`}
                                title="Toggle favorite"
                            >
                                <FontAwesomeIcon icon={faStar} className="text-xs" />
                            </button>
                            <button
                                onClick={() => { setEditingEntry(entry); setShowEntryForm(true) }}
                                className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-500'}`}
                                title="Edit"
                            >
                                <FontAwesomeIcon icon={faPen} className="text-xs" />
                            </button>
                            <button
                                onClick={() => handleDeleteEntry(entry, showPermanentDelete)}
                                className={`p-2 rounded-lg transition-colors hover:text-red-500 ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-500'}`}
                                title={showPermanentDelete ? 'Delete permanently' : 'Move to trash'}
                            >
                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                            </button>
                        </>
                    )}
                    {showRestore && (
                        <>
                            <button
                                onClick={() => handleRestoreEntry(entry)}
                                className={`px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors`}
                            >
                                Restore
                            </button>
                            <button
                                onClick={() => handleDeleteEntry(entry, true)}
                                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                    isLight ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-red-800 text-red-400 hover:bg-red-900/20'
                                }`}
                            >
                                Delete Forever
                            </button>
                        </>
                    )}
                </div>
            </div>
        )
    }

    const renderOverviewTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {statCards.map((stat) => (
                    <div key={stat.label} className={`p-4 ${cardClass}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <FontAwesomeIcon icon={stat.icon} className={`text-sm ${stat.color}`} />
                            <span className={`text-xs ${mutedText}`}>{stat.label}</span>
                        </div>
                        <div className={`text-2xl font-bold ${headingText}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className={`lg:col-span-2 ${cardClass} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b flex items-center justify-between ${isLight ? 'border-slate-100' : 'border-[#1a1a1a]'}`}>
                        <h3 className={`text-sm font-semibold ${headingText}`}>Recent Entries</h3>
                        <button
                            onClick={() => setActiveTab('vault')}
                            className={`text-xs ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}`}
                        >
                            View all
                        </button>
                    </div>
                    {recentEntries.length > 0 ? (
                        recentEntries.map(entry => renderEntryRow(entry))
                    ) : (
                        <div className={`px-5 py-10 text-center text-sm ${mutedText}`}>No entries yet</div>
                    )}
                </div>

                <div className={`p-5 ${cardClass}`}>
                    <h3 className={`text-sm font-semibold mb-4 ${headingText}`}>Quick Actions</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => { setEditingEntry(null); setShowEntryForm(true) }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                                isLight ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/50'
                            }`}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Add New Entry
                        </button>
                        <button
                            onClick={() => setActiveTab('generator')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                                isLight ? 'bg-slate-50 text-slate-700 hover:bg-slate-100' : 'bg-[#111] text-gray-300 hover:bg-[#1a1a1a]'
                            }`}
                        >
                            <FontAwesomeIcon icon={faRandom} />
                            Generate Password
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                                isLight ? 'bg-slate-50 text-slate-700 hover:bg-slate-100' : 'bg-[#111] text-gray-300 hover:bg-[#1a1a1a]'
                            }`}
                        >
                            <FontAwesomeIcon icon={faShieldAlt} />
                            Security Check
                        </button>
                        <button
                            onClick={() => setActiveTab('import-export')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                                isLight ? 'bg-slate-50 text-slate-700 hover:bg-slate-100' : 'bg-[#111] text-gray-300 hover:bg-[#1a1a1a]'
                            }`}
                        >
                            <FontAwesomeIcon icon={faUpload} />
                            Import / Export
                        </button>
                        <button
                            onClick={handleLockVault}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                                isLight ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                            }`}
                        >
                            <FontAwesomeIcon icon={faLock} />
                            Lock Vault
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderVaultTab = () => (
        <div className="flex gap-4 min-h-[500px]">
            <div className={`w-56 flex-shrink-0 p-4 ${cardClass}`}>
                <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${mutedText}`}>Folders</span>
                    <button
                        onClick={() => setShowNewFolder(true)}
                        className={`p-1 rounded transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-500'}`}
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xs" />
                    </button>
                </div>

                {showNewFolder && (
                    <div className="mb-3 space-y-2">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Folder name"
                            className={`${inputClass} w-full`}
                            autoFocus
                        />
                        <div className="flex gap-1">
                            <button onClick={handleCreateFolder} className="flex-1 text-xs py-1.5 rounded-lg bg-indigo-600 text-white">Create</button>
                            <button onClick={() => { setShowNewFolder(false); setNewFolderName('') }} className={`flex-1 text-xs py-1.5 rounded-lg border ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`}>Cancel</button>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setSelectedFolder(null)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                        !selectedFolder
                            ? isLight ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-900/30 text-indigo-300'
                            : isLight ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-[#141414] text-gray-400'
                    }`}
                >
                    <FontAwesomeIcon icon={faFolder} className="text-xs" />
                    All Items
                </button>

                {folders.map((folder) => (
                    <div key={folder._id} className="group relative">
                        {editingFolderId === folder._id ? (
                            <div className="flex gap-1 mb-1">
                                <input
                                    type="text"
                                    value={editingFolderName}
                                    onChange={(e) => setEditingFolderName(e.target.value)}
                                    className={`${inputClass} flex-1 text-xs py-1`}
                                    autoFocus
                                />
                                <button onClick={() => handleUpdateFolder(folder._id)} className="text-xs text-indigo-500 px-1">Save</button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setSelectedFolder(folder._id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                                    selectedFolder === folder._id
                                        ? isLight ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-900/30 text-indigo-300'
                                        : isLight ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-[#141414] text-gray-400'
                                }`}
                            >
                                <FontAwesomeIcon icon={faFolder} className="text-xs" style={{ color: folder.color || '#6366f1' }} />
                                <span className="truncate flex-1 text-left">{folder.name}</span>
                                <span
                                    onClick={(e) => { e.stopPropagation(); setEditingFolderId(folder._id); setEditingFolderName(folder.name) }}
                                    className={`opacity-0 group-hover:opacity-100 p-1 ${mutedText}`}
                                >
                                    <FontAwesomeIcon icon={faPen} className="text-[9px]" />
                                </span>
                                <span
                                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder._id) }}
                                    className={`opacity-0 group-hover:opacity-100 p-1 text-red-400`}
                                >
                                    <FontAwesomeIcon icon={faTrash} className="text-[9px]" />
                                </span>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className={`flex-1 ${cardClass} overflow-hidden flex flex-col`}>
                <div className={`px-4 py-3 border-b flex flex-wrap items-center gap-3 ${isLight ? 'border-slate-100' : 'border-[#1a1a1a]'}`}>
                    <div className="relative flex-1 min-w-[200px]">
                        <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${mutedText}`} />
                        <input
                            type="text"
                            value={vaultSearch}
                            onChange={(e) => setVaultSearch(e.target.value)}
                            placeholder="Search entries..."
                            className={`${inputClass} w-full pl-9`}
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">All Types</option>
                        <option value="password">Passwords</option>
                        <option value="note">Notes</option>
                        <option value="card">Cards</option>
                        <option value="identity">Identities</option>
                    </select>
                    <button
                        onClick={() => { setEditingEntry(null); setShowEntryForm(true) }}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xs" />
                        Add Entry
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredVaultEntries.length > 0 ? (
                        filteredVaultEntries.map(entry => renderEntryRow(entry))
                    ) : (
                        <div className={`px-5 py-16 text-center ${mutedText}`}>
                            <FontAwesomeIcon icon={faKey} className="text-3xl mb-3 opacity-30" />
                            <p className="text-sm">No entries found</p>
                            <button
                                onClick={() => { setEditingEntry(null); setShowEntryForm(true) }}
                                className="mt-3 text-sm text-indigo-500 hover:text-indigo-600"
                            >
                                Create your first entry
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    const renderTrashTab = () => (
        <div className={`${cardClass} overflow-hidden`}>
            <div className={`px-5 py-4 border-b flex items-center justify-between ${isLight ? 'border-slate-100' : 'border-[#1a1a1a]'}`}>
                <div>
                    <h3 className={`text-sm font-semibold ${headingText}`}>Trash</h3>
                    <p className={`text-xs ${mutedText}`}>{trashEntries.length} deleted item{trashEntries.length !== 1 ? 's' : ''}</p>
                </div>
                {trashEntries.length > 0 && (
                    <button
                        onClick={handleEmptyTrash}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                            isLight ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-red-800 text-red-400 hover:bg-red-900/20'
                        }`}
                    >
                        Empty Trash
                    </button>
                )}
            </div>
            {trashEntries.length > 0 ? (
                trashEntries.map(entry => renderEntryRow(entry, { showRestore: true, showPermanentDelete: true }))
            ) : (
                <div className={`px-5 py-16 text-center ${mutedText}`}>
                    <FontAwesomeIcon icon={faTrash} className="text-3xl mb-3 opacity-30" />
                    <p className="text-sm">Trash is empty</p>
                </div>
            )}
        </div>
    )

    const renderSharedTab = () => (
        <div className="space-y-4">
            <div className={`${cardClass} overflow-hidden`}>
                <div className={`px-5 py-4 border-b ${isLight ? 'border-slate-100' : 'border-[#1a1a1a]'}`}>
                    <h3 className={`text-sm font-semibold ${headingText}`}>Shared With Me</h3>
                    <p className={`text-xs ${mutedText}`}>Entries others have shared with you</p>
                </div>
                {sharedWithMe?.length > 0 ? (
                    <div className="divide-y divide-transparent">
                        {sharedWithMe.map((share) => (
                            <div key={share._id} className={`flex items-center gap-3 px-5 py-3 ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#141414]'}`}>
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isLight ? 'bg-indigo-100' : 'bg-indigo-900/30'}`}>
                                    <FontAwesomeIcon icon={faShareAlt} className="text-indigo-500 text-sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium ${headingText}`}>
                                        {share.entry?.metadata?.name || 'Shared Entry'}
                                    </div>
                                    <div className={`text-xs ${mutedText}`}>
                                        From {share.owner?.username || 'Unknown'} · {share.permission || 'read'}
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-md ${TYPE_COLORS[share.entry?.type] || 'bg-gray-500/15 text-gray-500'}`}>
                                    {TYPE_LABELS[share.entry?.type] || 'Entry'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`px-5 py-12 text-center ${mutedText}`}>
                        <FontAwesomeIcon icon={faShareAlt} className="text-3xl mb-3 opacity-30" />
                        <p className="text-sm">No shared entries</p>
                        <p className="text-xs mt-1">Shared vault entries will appear here</p>
                    </div>
                )}
            </div>

            <div className={`${cardClass} overflow-hidden`}>
                <div className={`px-5 py-4 border-b ${isLight ? 'border-slate-100' : 'border-[#1a1a1a]'}`}>
                    <h3 className={`text-sm font-semibold ${headingText}`}>My Shares</h3>
                    <p className={`text-xs ${mutedText}`}>Entries you have shared with others</p>
                </div>
                {myShares?.length > 0 ? (
                    <div>
                        {myShares.map((share) => (
                            <div key={share._id} className={`flex items-center gap-3 px-5 py-3 border-b last:border-b-0 ${isLight ? 'border-slate-100 hover:bg-slate-50' : 'border-[#1a1a1a] hover:bg-[#141414]'}`}>
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isLight ? 'bg-violet-100' : 'bg-violet-900/30'}`}>
                                    <FontAwesomeIcon icon={faShareAlt} className="text-violet-500 text-sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium ${headingText}`}>
                                        {share.entry?.metadata?.name || 'Shared Entry'}
                                    </div>
                                    <div className={`text-xs ${mutedText}`}>
                                        Shared with {share.sharedWith?.username || 'Unknown'}
                                        {share.revoked && ' · Revoked'}
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-md ${share.revoked ? 'bg-red-500/15 text-red-500' : 'bg-green-500/15 text-green-500'}`}>
                                    {share.revoked ? 'Revoked' : 'Active'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`px-5 py-12 text-center ${mutedText}`}>
                        <FontAwesomeIcon icon={faShareAlt} className="text-3xl mb-3 opacity-30" />
                        <p className="text-sm">You haven't shared any entries yet</p>
                    </div>
                )}
            </div>
        </div>
    )

    const renderLogsTab = () => (
        <div className={`${cardClass} overflow-hidden`}>
            <div className={`px-5 py-4 border-b ${isLight ? 'border-slate-100' : 'border-[#1a1a1a]'}`}>
                <h3 className={`text-sm font-semibold ${headingText}`}>Audit Log</h3>
                <p className={`text-xs ${mutedText}`}>{auditTotal ?? 0} total events</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className={isLight ? 'bg-slate-50' : 'bg-[#111]'}>
                            {['Action', 'Details', 'Date', 'IP'].map((col) => (
                                <th key={col} className={`text-[11px] font-semibold uppercase tracking-wider px-4 py-3 text-left ${mutedText}`}>
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {auditLogs?.length > 0 ? auditLogs.map((log) => (
                            <tr key={log._id} className={`border-t ${isLight ? 'border-slate-100 hover:bg-slate-50/50' : 'border-[#1a1a1a] hover:bg-[#141414]'}`}>
                                <td className={`px-4 py-3 text-sm font-medium ${headingText}`}>
                                    {log.action?.replace(/_/g, ' ') || '—'}
                                </td>
                                <td className={`px-4 py-3 text-sm ${bodyText} max-w-xs truncate`}>
                                    {log.details || '—'}
                                </td>
                                <td className={`px-4 py-3 text-sm ${mutedText} whitespace-nowrap`}>
                                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                                </td>
                                <td className={`px-4 py-3 text-sm font-mono ${mutedText}`}>
                                    {log.ip || '—'}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className={`px-5 py-12 text-center text-sm ${mutedText}`}>
                                    No audit logs yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )

    const renderSettingsTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`p-5 ${cardClass}`}>
                <h3 className={`text-sm font-semibold mb-1 ${headingText}`}>Change Master Password</h3>
                <p className={`text-xs mb-4 ${mutedText}`}>All entries will be re-encrypted with the new key</p>
                <form onSubmit={handleChangeMasterPassword} className="space-y-3">
                    <div>
                        <label className={`block text-xs font-medium mb-1 ${mutedText}`}>Current Password</label>
                        <div className="relative">
                            <input
                                type={showSettingsPw ? 'text' : 'password'}
                                value={settingsCurrentPw}
                                onChange={(e) => setSettingsCurrentPw(e.target.value)}
                                className={`${inputClass} w-full pr-10`}
                            />
                            <button type="button" onClick={() => setShowSettingsPw(!showSettingsPw)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText}`}>
                                <FontAwesomeIcon icon={showSettingsPw ? faEyeSlash : faEye} className="text-xs" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className={`block text-xs font-medium mb-1 ${mutedText}`}>New Password</label>
                        <input
                            type={showSettingsPw ? 'text' : 'password'}
                            value={settingsNewPw}
                            onChange={(e) => setSettingsNewPw(e.target.value)}
                            className={`${inputClass} w-full`}
                        />
                    </div>
                    <div>
                        <label className={`block text-xs font-medium mb-1 ${mutedText}`}>Confirm New Password</label>
                        <input
                            type={showSettingsPw ? 'text' : 'password'}
                            value={settingsConfirmPw}
                            onChange={(e) => setSettingsConfirmPw(e.target.value)}
                            className={`${inputClass} w-full`}
                        />
                    </div>
                    {settingsError && (
                        <div className={`text-xs px-3 py-2 rounded-lg ${isLight ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-400'}`}>
                            {settingsError}
                        </div>
                    )}
                    {settingsSuccess && (
                        <div className={`text-xs px-3 py-2 rounded-lg ${isLight ? 'bg-green-50 text-green-600' : 'bg-green-900/20 text-green-400'}`}>
                            {settingsSuccess}
                        </div>
                    )}
                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50">
                        Update Master Password
                    </button>
                </form>
            </div>

            <div className={`p-5 ${cardClass}`}>
                <h3 className={`text-sm font-semibold mb-1 ${headingText}`}>Vault Security</h3>
                <p className={`text-xs mb-4 ${mutedText}`}>Manage vault access and session</p>
                <div className="space-y-3">
                    <div className={`flex items-center gap-3 p-4 rounded-lg ${isLight ? 'bg-green-50' : 'bg-green-900/20'}`}>
                        <FontAwesomeIcon icon={faUnlock} className="text-green-500" />
                        <div>
                            <div className={`text-sm font-medium ${headingText}`}>Vault Unlocked</div>
                            <div className={`text-xs ${mutedText}`}>Encryption key is in memory only</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLockVault}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm transition-colors ${
                            isLight ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-800'
                        }`}
                    >
                        <FontAwesomeIcon icon={faLock} />
                        Lock Vault Now
                    </button>
                    <div className={`text-xs p-3 rounded-lg ${isLight ? 'bg-slate-50 text-slate-500' : 'bg-[#111] text-gray-500'}`}>
                        <FontAwesomeIcon icon={faShieldAlt} className="mr-1.5" />
                        Signed in as <strong>{user?.username || user?.email || 'User'}</strong>.
                        Your master password never leaves this device.
                    </div>
                </div>
            </div>
        </div>
    )

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'overview': return renderOverviewTab()
            case 'vault': return renderVaultTab()
            case 'generator': return <PasswordGenerator theme={theme} />
            case 'security': return <SecurityCenter theme={theme} decryptedEntries={decryptedEntries.filter(e => !e.deleted)} encryptionKey={encryptionKey} />
            case 'import-export': return (
                <ImportExport
                    theme={theme}
                    encryptionKey={encryptionKey}
                    folders={folders}
                    onImportComplete={() => {
                        dispatch(getEntries({ deleted: false }))
                        dispatch(getStats())
                    }}
                />
            )
            case 'settings': return renderSettingsTab()
            case 'trash': return renderTrashTab()
            case 'shared': return renderSharedTab()
            case 'logs': return renderLogsTab()
            default: return renderOverviewTab()
        }
    }

    if (vaultStatus === null) {
        return (
            <div className={`flex items-center justify-center py-20 ${mutedText}`}>
                <div className="text-center">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-3xl mb-3 opacity-30 animate-pulse" />
                    <p className="text-sm">Loading vault...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="px-4 sm:px-6 py-5 space-y-4">
            <MasterPasswordModal
                theme={theme}
                isOpen={showMasterModal && !isUnlocked}
                mode={masterModalMode}
                onUnlock={masterModalMode === 'setup' ? handleSetupVault : handleUnlockVault}
                onClose={vaultStatus?.hasVault ? () => setShowMasterModal(false) : undefined}
                isLoading={isLoading}
                error={unlockError}
            />

            {alert && (
                <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
                    variant === 'success'
                        ? isLight ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-green-900/20 text-green-400 border border-green-800'
                        : isLight ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-red-900/20 text-red-400 border border-red-800'
                }`}>
                    <FontAwesomeIcon icon={variant === 'success' ? faShieldAlt : faExclamationTriangle} />
                    {alert}
                    <button onClick={() => dispatch(clearVaultAlert())} className="ml-auto text-xs opacity-60 hover:opacity-100">Dismiss</button>
                </div>
            )}

            {isUnlocked && (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className={`text-xl font-bold flex items-center gap-2 ${headingText}`}>
                                <FontAwesomeIcon icon={faShieldAlt} className="text-indigo-500" />
                                Password Vault
                            </h1>
                            <p className={`text-xs ${mutedText}`}>
                                Zero-knowledge encrypted · {stats?.total ?? entries.length} entries
                            </p>
                        </div>
                        <button
                            onClick={handleLockVault}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                isLight ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-[#2B2B2B] text-gray-400 hover:bg-[#1a1a1a]'
                            }`}
                        >
                            <FontAwesomeIcon icon={faLock} className="text-[10px]" />
                            Lock
                        </button>
                    </div>

                    <div className={`flex flex-wrap gap-1 p-1 rounded-xl ${isLight ? 'bg-slate-100' : 'bg-[#111]'}`}>
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                                    activeTab === tab.id
                                        ? isLight ? 'bg-white text-indigo-700 shadow-sm' : 'bg-[#1a1a1a] text-indigo-400 shadow-sm'
                                        : isLight ? 'text-slate-500 hover:text-slate-700' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <FontAwesomeIcon icon={tab.icon} className="text-[10px]" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {renderActiveTab()}
                </>
            )}

            {showEntryForm && (
                <VaultEntryForm
                    theme={theme}
                    entry={editingEntry}
                    folders={folders}
                    encryptionKey={encryptionKey}
                    isOpen={showEntryForm}
                    onClose={() => { setShowEntryForm(false); setEditingEntry(null) }}
                    onSave={() => {
                        setShowEntryForm(false)
                        setEditingEntry(null)
                        loadTabData()
                        dispatch(getStats())
                    }}
                />
            )}
        </div>
    )
}

export default VaultManager
