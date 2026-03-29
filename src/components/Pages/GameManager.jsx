import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faGamepad, faPlus, faTimes, faCheck, faTrash, faPen, faEye, faSearch,
    faLock, faLockOpen, faShieldAlt, faChevronLeft, faChevronRight, faImage,
    faDownload, faKey, faCopy, faClone, faTag, faImages, faLink, faDesktop, faList,
    faLayerGroup, faSortUp, faSortDown, faSort, faFilter, faAngleDoubleLeft,
    faAngleDoubleRight, faHeart, faStar, faUndo, faClock
} from '@fortawesome/free-solid-svg-icons'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchGames, createGame, updateGame, deleteGame, bulkDeleteGames, togglePrivacy, toggleStrict, clearGameAlert, fetchTrash, restoreGame, permanentDeleteGame, emptyTrash } from '../../actions/gameManager'
import { getFavoriteGamesPopulated, toggleFavoriteGame } from '../../actions/game'
import { main, dark, light } from '../../style'
import styles from '../../style'
import Notification from '../Custom/Notification'

const CATEGORIES = ['Simulation', 'Games 3D', 'Animated', 'Extreme', 'Puzzle', 'Virtual Reality', 'Visual Novel', 'RPG', 'Horror', 'Fighting', 'Racing', 'Shooting', 'Flash', 'Non - Hen', 'Others']
const CENSORSHIP = ['Uncensored', 'Censored']
const LANGUAGES = ['English', 'Japanese', 'Chinese', 'Spanish']
const PLATFORMS = ['Desktop', 'Android', 'iOS']
const STORAGES = ['Google Drive', 'Dropbox', 'Mediafire']

const INITIAL_FORM = {
    featured_image: '', title: '', category: 'Simulation', description: '',
    strict: false, privacy: false, landscape: false, carousel: false,
    details: { latest_version: '', censorship: 'Uncensored', language: 'English', developer: '', platform: 'Desktop' },
    leave_uploader_message: '', gallery: [], access_key: [], download_link: [],
    guide_link: '', password: '', tags: []
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const GameManager = ({ user, theme }) => {
    const dispatch = useDispatch()
    const games = useSelector((state) => state.gameManager.data)
    const gmAlert = useSelector((state) => state.gameManager.alert)
    const gmVariant = useSelector((state) => state.gameManager.variant)
    const isLoading = useSelector((state) => state.gameManager.isLoading)

    const favoriteGamesData = useSelector((state) => state.game.favoriteGamesData)
    const trash = useSelector((state) => state.gameManager.trash)
    const trashLoading = useSelector((state) => state.gameManager.trashLoading)

    const isLight = theme === 'light'
    const userId = user?._id || user?.result?._id || ''

    const [searchParams, setSearchParams] = useSearchParams()
    const VALID_TABS = ['games', 'favorites', 'trash']
    const tabParam = searchParams.get('tab')
    const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'games'
    const setActiveTab = (tab) => setSearchParams(prev => { prev.set('tab', tab); return prev }, { replace: true })

    const [view, setView] = useState('list')
    const [form, setForm] = useState({ ...INITIAL_FORM })
    const [editId, setEditId] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [selectedIds, setSelectedIds] = useState([])
    const [tagInput, setTagInput] = useState('')
    const [galleryInput, setGalleryInput] = useState('')
    const [storageInput, setStorageInput] = useState('Google Drive')
    const [linkInputs, setLinkInputs] = useState([])
    const [notification, setNotification] = useState({})
    const [showNotif, setShowNotif] = useState(false)
    const [viewGame, setViewGame] = useState(null)
    const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 })
    const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', variant: 'danger', icon: faTrash, confirmText: '', onConfirm: null })

    const [sortKey, setSortKey] = useState('createdAt')
    const [sortDir, setSortDir] = useState('desc')
    const [filterCategory, setFilterCategory] = useState('')
    const [filterPlatform, setFilterPlatform] = useState('')
    const [filterPrivacy, setFilterPrivacy] = useState('')
    const [filterStrict, setFilterStrict] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    const activeFilterCount = [filterCategory, filterPlatform, filterPrivacy, filterStrict].filter(Boolean).length

    useEffect(() => {
        if (user) {
            dispatch(fetchGames())
            if (userId) dispatch(getFavoriteGamesPopulated({ userId }))
        }
    }, [dispatch, user])

    useEffect(() => {
        if (gmAlert && gmVariant) {
            setNotification({ message: gmAlert, variant: gmVariant })
            setShowNotif(true)
            dispatch(clearGameAlert())
            setSubmitting(false)
            if (gmVariant === 'success' && view === 'form') {
                resetForm()
                setView('list')
            }
        }
    }, [gmAlert, gmVariant])

    useEffect(() => { if (!showNotif) setNotification({}) }, [showNotif])

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
        setPage(0)
    }

    const clearFilters = () => { setFilterCategory(''); setFilterPlatform(''); setFilterPrivacy(''); setFilterStrict(''); setPage(0) }

    const processed = React.useMemo(() => {
        let result = [...(games || [])]

        if (search) {
            const s = search.toLowerCase()
            result = result.filter(g =>
                g.title?.toLowerCase().includes(s) || g.category?.toLowerCase().includes(s) || g.details?.developer?.toLowerCase().includes(s)
            )
        }

        if (filterCategory) result = result.filter(g => g.category === filterCategory)
        if (filterPlatform) result = result.filter(g => g.details?.platform === filterPlatform)
        if (filterPrivacy === 'yes') result = result.filter(g => g.privacy)
        else if (filterPrivacy === 'no') result = result.filter(g => !g.privacy)
        if (filterStrict === 'yes') result = result.filter(g => g.strict)
        else if (filterStrict === 'no') result = result.filter(g => !g.strict)

        result.sort((a, b) => {
            let va, vb
            switch (sortKey) {
                case 'title':       va = a.title?.toLowerCase() || ''; vb = b.title?.toLowerCase() || ''; break
                case 'category':    va = a.category?.toLowerCase() || ''; vb = b.category?.toLowerCase() || ''; break
                case 'developer':   va = a.details?.developer?.toLowerCase() || ''; vb = b.details?.developer?.toLowerCase() || ''; break
                case 'version':     va = a.details?.latest_version || ''; vb = b.details?.latest_version || ''; break
                case 'platform':    va = a.details?.platform || ''; vb = b.details?.platform || ''; break
                case 'privacy':     va = a.privacy ? 1 : 0; vb = b.privacy ? 1 : 0; break
                case 'strict':      va = a.strict ? 1 : 0; vb = b.strict ? 1 : 0; break
                case 'createdAt':
                default:            va = a.createdAt || ''; vb = b.createdAt || ''; break
            }
            if (va < vb) return sortDir === 'asc' ? -1 : 1
            if (va > vb) return sortDir === 'asc' ? 1 : -1
            return 0
        })

        return result
    }, [games, search, filterCategory, filterPlatform, filterPrivacy, filterStrict, sortKey, sortDir])

    const totalPages = Math.ceil(processed.length / pageSize)
    const pageData = processed.slice(page * pageSize, (page + 1) * pageSize)

    const resetForm = () => {
        setForm({ ...INITIAL_FORM, details: { ...INITIAL_FORM.details }, gallery: [], access_key: [], download_link: [], tags: [] })
        setEditId(null)
        setTagInput('')
        setGalleryInput('')
        setLinkInputs([])
    }

    const openCreate = () => { resetForm(); setView('form') }
    const handleDuplicate = (g) => {
        setConfirmModal({
            open: true, title: 'Duplicate Game', variant: 'info', icon: faClone, confirmText: 'Duplicate',
            message: `Create a copy of "${g.title}"?`,
            onConfirm: () => {
                const data = {
                    featured_image: g.featured_image || '', title: `${g.title || ''} (Copy)`, category: g.category || 'Simulation',
                    description: g.description || '', strict: g.strict || false, privacy: g.privacy || false,
                    landscape: g.landscape || false, carousel: g.carousel || false,
                    details: { latest_version: g.details?.latest_version || '', censorship: g.details?.censorship || 'Uncensored', language: g.details?.language || 'English', developer: g.details?.developer || '', platform: g.details?.platform || 'Desktop' },
                    leave_uploader_message: g.leave_uploader_message || '', gallery: [...(g.gallery || [])],
                    access_key: [], download_link: (g.download_link || []).map(d => ({ storage_name: d.storage_name, links: [...d.links] })),
                    guide_link: g.guide_link || '', password: g.password || '', tags: [...(g.tags || [])]
                }
                dispatch(createGame(data))
                setConfirmModal(prev => ({ ...prev, open: false }))
            }
        })
    }
    const openEdit = (g) => {
        setForm({
            featured_image: g.featured_image || '', title: g.title || '', category: g.category || 'Simulation',
            description: g.description || '', strict: g.strict || false, privacy: g.privacy || false,
            landscape: g.landscape || false, carousel: g.carousel || false,
            details: { latest_version: g.details?.latest_version || '', censorship: g.details?.censorship || 'Uncensored', language: g.details?.language || 'English', developer: g.details?.developer || '', platform: g.details?.platform || 'Desktop' },
            leave_uploader_message: g.leave_uploader_message || '', gallery: [...(g.gallery || [])],
            access_key: [...(g.access_key || [])], download_link: (g.download_link || []).map(d => ({ storage_name: d.storage_name, links: [...d.links] })),
            guide_link: g.guide_link || '', password: g.password || '', tags: [...(g.tags || [])]
        })
        setEditId(g._id)
        setLinkInputs((g.download_link || []).map(() => ''))
        setView('form')
    }

    const handleSubmit = async () => {
        if (!form.title || submitting) return
        setSubmitting(true)
        try {
            if (editId) {
                await dispatch(updateGame({ id: editId, data: form })).unwrap()
            } else {
                await dispatch(createGame(form)).unwrap()
            }
        } catch { setSubmitting(false) }
    }

    const handleDelete = (id) => {
        setConfirmModal({
            open: true, title: 'Move to Trash', variant: 'warning',
            message: 'This game will be moved to trash and automatically deleted after 10 days.',
            onConfirm: () => { dispatch(deleteGame(id)); setConfirmModal(prev => ({ ...prev, open: false })) }
        })
    }
    const handleBulkDelete = () => {
        if (!selectedIds.length) return
        setConfirmModal({
            open: true, title: 'Move to Trash', variant: 'warning',
            message: `${selectedIds.length} game(s) will be moved to trash and automatically deleted after 10 days.`,
            onConfirm: () => { dispatch(bulkDeleteGames({ ids: selectedIds })); setSelectedIds([]); setConfirmModal(prev => ({ ...prev, open: false })) }
        })
    }
    const handleTogglePrivacy = (id) => dispatch(togglePrivacy(id))
    const handleToggleStrict = (id) => dispatch(toggleStrict(id))

    const handleUnfavorite = async (gameId) => {
        if (!userId) return
        await dispatch(toggleFavoriteGame({ userId, gameId }))
        dispatch(getFavoriteGamesPopulated({ userId }))
    }

    useEffect(() => {
        if (activeTab === 'trash' && user) dispatch(fetchTrash())
    }, [activeTab])

    const handleRestore = async (id) => {
        await dispatch(restoreGame(id))
        dispatch(fetchGames())
    }
    const handlePermanentDelete = (id) => {
        setConfirmModal({
            open: true, title: 'Delete Permanently', variant: 'danger',
            message: 'This game will be permanently deleted. This action cannot be undone.',
            onConfirm: () => { dispatch(permanentDeleteGame(id)); setConfirmModal(prev => ({ ...prev, open: false })) }
        })
    }
    const handleEmptyTrash = () => {
        setConfirmModal({
            open: true, title: 'Empty Trash', variant: 'danger',
            message: 'All trashed games will be permanently deleted. This action cannot be undone.',
            onConfirm: () => { dispatch(emptyTrash()); setConfirmModal(prev => ({ ...prev, open: false })) }
        })
    }

    const getDaysRemaining = (deletedAt) => {
        const diff = 10 - Math.floor((Date.now() - new Date(deletedAt).getTime()) / (1000 * 60 * 60 * 24))
        return Math.max(0, diff)
    }

    const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    const toggleSelectAll = () => { const ids = pageData.map(g => g._id); setSelectedIds(prev => ids.every(id => prev.includes(id)) ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]) }

    const addTag = () => { if (tagInput && !form.tags.includes(tagInput)) { setForm({ ...form, tags: [...form.tags, tagInput] }); setTagInput('') } }
    const removeTag = (i) => { const t = [...form.tags]; t.splice(i, 1); setForm({ ...form, tags: t }) }

    const addGalleryUrl = () => { if (galleryInput) { setForm({ ...form, gallery: [...form.gallery, galleryInput] }); setGalleryInput('') } }
    const removeGalleryUrl = (i) => { const g = [...form.gallery]; g.splice(i, 1); setForm({ ...form, gallery: g }) }

    const addDownloadBucket = () => { setForm({ ...form, download_link: [...form.download_link, { storage_name: storageInput, links: [] }] }); setLinkInputs([...linkInputs, '']) }
    const removeDownloadBucket = (i) => { const d = [...form.download_link]; d.splice(i, 1); setForm({ ...form, download_link: d }); const l = [...linkInputs]; l.splice(i, 1); setLinkInputs(l) }
    const addLinkToBucket = (i) => {
        if (!linkInputs[i]) return
        const d = [...form.download_link]
        d[i] = { ...d[i], links: [...d[i].links, linkInputs[i]] }
        setForm({ ...form, download_link: d })
        const l = [...linkInputs]; l[i] = ''; setLinkInputs(l)
    }
    const removeLinkFromBucket = (bi, li) => {
        const d = [...form.download_link]
        d[bi] = { ...d[bi], links: d[bi].links.filter((_, j) => j !== li) }
        setForm({ ...form, download_link: d })
    }

    const generateKey = () => {
        const key = Math.random().toString(36).substring(2, 10).toUpperCase()
        setForm({ ...form, access_key: [...form.access_key, { key, download_limit: 0, user_downloaded: [] }] })
    }
    const removeKey = (i) => { const k = [...form.access_key]; k.splice(i, 1); setForm({ ...form, access_key: k }) }
    const updateKeyLimit = (i, val) => {
        const k = [...form.access_key]
        k[i] = { ...k[i], download_limit: parseInt(val) || 0 }
        setForm({ ...form, access_key: k })
    }

    const card = `rounded-xl border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-slate-200/80' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`
    const inputCls = `w-full px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`
    const selectCls = `px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all cursor-pointer ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`
    const btnPrimary = `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLight ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`
    const btnSecondary = `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300'}`
    const labelCls = `block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`

    if (!user) {
        return (
            <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className="flex items-center justify-center py-32">
                            <div className={`text-center ${card} p-8`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                                    <FontAwesomeIcon icon={faGamepad} className={`text-xl ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                                </div>
                                <h2 className={`text-lg font-semibold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>Login Required</h2>
                                <p className={`text-sm mb-5 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Please log in to manage your games.</p>
                                <a href="/login" className={btnPrimary}>Login</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="relative px-0 my-6 sm:my-12">

                        <Notification theme={theme} data={notification} show={showNotif} setShow={setShowNotif} />

                        {confirmModal.open && (
                            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}>
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
                                <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transition-all ${isLight ? 'bg-white' : 'bg-[#161616]'}`}
                                    onClick={e => e.stopPropagation()}>
                                    <div className="p-6 text-center">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${confirmModal.variant === 'danger'
                                            ? (isLight ? 'bg-red-100' : 'bg-red-900/25')
                                            : confirmModal.variant === 'info'
                                                ? (isLight ? 'bg-blue-100' : 'bg-blue-900/25')
                                                : (isLight ? 'bg-amber-100' : 'bg-amber-900/25')
                                        }`}>
                                            <FontAwesomeIcon icon={confirmModal.icon || faTrash}
                                                className={`text-xl ${confirmModal.variant === 'danger'
                                                    ? (isLight ? 'text-red-500' : 'text-red-400')
                                                    : confirmModal.variant === 'info'
                                                        ? (isLight ? 'text-blue-500' : 'text-blue-400')
                                                        : (isLight ? 'text-amber-500' : 'text-amber-400')
                                                }`} />
                                        </div>
                                        <h3 className={`text-base font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                            {confirmModal.title}
                                        </h3>
                                        <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                            {confirmModal.message}
                                        </p>
                                    </div>
                                    <div className={`flex gap-3 px-6 pb-6`}>
                                        <button onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border border-solid ${isLight
                                                ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                                                : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300 border-[#333]'
                                            }`}>
                                            Cancel
                                        </button>
                                        <button onClick={confirmModal.onConfirm}
                                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-solid ${confirmModal.variant === 'danger'
                                                ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                                                : confirmModal.variant === 'info'
                                                    ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
                                                    : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                                            }`}>
                                            {confirmModal.confirmText || (confirmModal.variant === 'danger' ? 'Delete' : 'Move to Trash')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Header */}
                        <div className={`${card} p-4 sm:p-6 mb-4`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                                        <FontAwesomeIcon icon={faGamepad} className={`text-base sm:text-lg ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                                    </div>
                                    <div>
                                        <h1 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Game Manager</h1>
                                        <p className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{games?.length || 0} game{games?.length !== 1 ? 's' : ''} uploaded</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {view === 'form' ? (
                                        <button onClick={() => { resetForm(); setView('list') }} className={`flex items-center gap-1.5 ${btnSecondary}`}>
                                            <FontAwesomeIcon icon={faList} className="text-xs" /> Back to List
                                        </button>
                                    ) : activeTab === 'games' ? (
                                        <button onClick={openCreate} className={`flex items-center gap-1.5 ${btnPrimary}`}>
                                            <FontAwesomeIcon icon={faPlus} className="text-xs" /> Upload Game
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            {view !== 'form' && (
                                <div className={`flex items-center gap-1 mt-3 pt-3 border-t border-solid overflow-x-auto scrollbar-hide ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                    <button onClick={() => setActiveTab('games')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'games'
                                            ? (isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/20 text-blue-400')
                                            : (isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]')
                                        }`}>
                                        <FontAwesomeIcon icon={faGamepad} className="text-[10px]" /> My Games
                                    </button>
                                    <button onClick={() => setActiveTab('favorites')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'favorites'
                                            ? (isLight ? 'bg-red-50 text-red-500' : 'bg-red-900/20 text-red-400')
                                            : (isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]')
                                        }`}>
                                        <FontAwesomeIcon icon={faHeart} className="text-[10px]" /> Favorites
                                        {favoriteGamesData?.length > 0 && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'favorites'
                                                ? (isLight ? 'bg-red-100 text-red-500' : 'bg-red-900/30 text-red-400')
                                                : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500')
                                            }`}>{favoriteGamesData.length}</span>
                                        )}
                                    </button>
                                    <button onClick={() => setActiveTab('trash')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'trash'
                                            ? (isLight ? 'bg-orange-50 text-orange-500' : 'bg-orange-900/20 text-orange-400')
                                            : (isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]')
                                        }`}>
                                        <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Trash
                                        {trash?.length > 0 && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'trash'
                                                ? (isLight ? 'bg-orange-100 text-orange-500' : 'bg-orange-900/30 text-orange-400')
                                                : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500')
                                            }`}>{trash.length}</span>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* View Game Modal */}
                        {viewGame && (
                            <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto py-6 sm:py-10" onClick={() => setViewGame(null)}>
                                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                                <div className={`relative w-full max-w-[750px] mx-4 rounded-2xl shadow-2xl overflow-hidden ${isLight ? 'bg-white' : 'bg-[#141414]'}`} onClick={e => e.stopPropagation()}>

                                    {/* Header */}
                                    <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100 bg-slate-50/60' : 'border-[#222] bg-[#111]'}`}>
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLight ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                                                <FontAwesomeIcon icon={faGamepad} className={`text-xs ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                                            </div>
                                            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Game Details</h3>
                                        </div>
                                        <button onClick={() => setViewGame(null)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-400' : 'hover:bg-white/10 text-gray-500'}`}>
                                            <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div className="px-4 sm:px-5 py-4 sm:py-5 space-y-5">

                                        {/* Top: Image + Info */}
                                        <div className="grid sm:grid-cols-5 grid-cols-1 gap-5">
                                            <div className="sm:col-span-2">
                                                {viewGame.featured_image ? (
                                                    <img src={viewGame.featured_image} alt="" className={`w-full rounded-xl object-cover border border-solid ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`} />
                                                ) : (
                                                    <div className={`w-full aspect-[3/4] rounded-xl flex items-center justify-center ${isLight ? 'bg-slate-100 border border-solid border-slate-200' : 'bg-[#0e0e0e] border border-solid border-[#2B2B2B]'}`}>
                                                        <FontAwesomeIcon icon={faGamepad} className={`text-4xl ${isLight ? 'text-slate-200' : 'text-gray-700'}`} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="sm:col-span-3 flex flex-col">
                                                {/* Badges */}
                                                <div className="flex flex-wrap gap-1.5 mb-2">
                                                    {viewGame.privacy && <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded bg-red-500/90 text-white">Private</span>}
                                                    {viewGame.strict && <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded bg-orange-500/90 text-white">Strict</span>}
                                                    {viewGame.password && <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded bg-blue-500/90 text-white">{viewGame.password}</span>}
                                                    {!viewGame.privacy && !viewGame.strict && !viewGame.password && (
                                                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded ${isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400'}`}>Public</span>
                                                    )}
                                                </div>

                                                {/* Title */}
                                                <h2 className={`text-lg font-bold leading-snug ${isLight ? 'text-slate-800' : 'text-white'}`}>{viewGame.title}</h2>
                                                <p className={`text-xs mt-0.5 mb-3 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                    by <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{viewGame.details?.developer || 'Unknown'}</span>
                                                </p>

                                                {/* Detail card */}
                                                <div className={`rounded-lg p-3 flex-1 ${isLight ? 'bg-slate-50 border border-solid border-slate-100' : 'bg-[#0e0e0e] border border-solid border-[#222]'}`}>
                                                    <div className="space-y-1.5 text-xs">
                                                        {[
                                                            { label: 'Language', value: viewGame.details?.language },
                                                            { label: 'Version', value: viewGame.details?.latest_version || '—' },
                                                            { label: 'Platform', value: viewGame.details?.platform },
                                                            { label: 'Censorship', value: viewGame.details?.censorship },
                                                            { label: 'Category', value: viewGame.category },
                                                        ].map((row, ri) => (
                                                            <div key={row.label} className={`flex items-center justify-between py-1 ${ri > 0 ? `border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1a1a1a]'}` : ''}`}>
                                                                <span className={`font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{row.label}</span>
                                                                <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{row.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Tags */}
                                                {viewGame.tags?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                        {viewGame.tags.map((t, i) => (
                                                            <span key={i} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize cursor-pointer transition-colors ${isLight ? 'bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600' : 'bg-white/5 text-gray-400 hover:bg-blue-900/30 hover:text-blue-400'}`}>{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {viewGame.description && (
                                            <div>
                                                <div className={`flex items-center gap-2 mb-2 pb-2 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                                    <h4 className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Description</h4>
                                                </div>
                                                <p className={`text-[13px] leading-relaxed whitespace-pre-wrap ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                                    {viewGame.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* Gallery */}
                                        {viewGame.gallery?.length > 0 && (
                                            <div>
                                                <div className={`flex items-center gap-2 mb-2 pb-2 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                                    <h4 className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Gallery</h4>
                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>{viewGame.gallery.length}</span>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
                                                    {viewGame.gallery.map((url, i) => (
                                                        <div key={i} className="aspect-video overflow-hidden rounded-lg cursor-pointer"
                                                            onClick={() => setLightbox({ open: true, images: viewGame.gallery, index: i })}>
                                                            <img src={url} alt={`gallery #${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Download Links */}
                                        {viewGame.download_link?.some(b => b.links?.length > 0) && (
                                            <div>
                                                <div className={`flex items-center gap-2 mb-2 pb-2 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                                    <h4 className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Download Links</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    {viewGame.download_link.map((bucket, bi) => (
                                                        bucket.links?.length > 0 && (
                                                            <div key={bi} className={`rounded-lg overflow-hidden border border-solid ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                                                <div className={`px-3 py-2 ${isLight ? 'bg-slate-50' : 'bg-[#0e0e0e]'}`}>
                                                                    <p className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                                                                        <FontAwesomeIcon icon={faDownload} className={`mr-1.5 text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                                        {bucket.storage_name}
                                                                        <span className={`ml-1.5 font-normal ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>({bucket.links.length})</span>
                                                                    </p>
                                                                </div>
                                                                {bucket.links.map((link, li) => (
                                                                    <div key={li} className={`flex items-center gap-3 px-3 py-2 ${isLight ? 'bg-white' : 'bg-[#141414]'} ${li > 0 ? `border-t border-solid ${isLight ? 'border-slate-50' : 'border-[#1a1a1a]'}` : `border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#222]'}`}`}>
                                                                        <span className={`text-xs ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>-</span>
                                                                        <p className={`text-xs break-all flex-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{link}</p>
                                                                        <a href={link} target="_blank" rel="noopener noreferrer"
                                                                            className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${isLight ? 'text-slate-300 hover:text-blue-500 hover:bg-blue-50' : 'text-gray-600 hover:text-blue-400 hover:bg-blue-900/20'}`}>
                                                                            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Access Keys */}
                                        {viewGame.privacy && viewGame.access_key?.length > 0 && (
                                            <div>
                                                <div className={`flex items-center gap-2 mb-2 pb-2 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                                    <h4 className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Access Keys</h4>
                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>{viewGame.access_key.length}</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {viewGame.access_key.map((k, i) => (
                                                        <div key={i} className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2.5 rounded-lg ${isLight ? 'bg-slate-50 border border-solid border-slate-100' : 'bg-[#0e0e0e] border border-solid border-[#222]'}`}>
                                                            <code className={`text-xs font-mono px-2.5 py-1 rounded-md self-start ${isLight ? 'bg-white text-slate-700 border border-solid border-slate-200' : 'bg-[#1a1a1a] text-gray-200 border border-solid border-[#2B2B2B]'}`}>{k.key}</code>
                                                            <div className="flex items-center gap-3 sm:ml-auto text-xs">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className={isLight ? 'text-slate-400' : 'text-gray-500'}>Limit</span>
                                                                    <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{k.download_limit || '∞'}</span>
                                                                </div>
                                                                <div className={`w-px h-4 ${isLight ? 'bg-slate-200' : 'bg-[#2B2B2B]'}`} />
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className={isLight ? 'text-slate-400' : 'text-gray-500'}>Used</span>
                                                                    <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{k.user_downloaded?.length || 0}</span>
                                                                </div>
                                                                <div className={`w-px h-4 ${isLight ? 'bg-slate-200' : 'bg-[#2B2B2B]'}`} />
                                                                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/games/${viewGame._id}?access_key=${k.key}`) }}
                                                                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-slate-400 hover:text-blue-500 hover:bg-blue-50' : 'text-gray-500 hover:text-blue-400 hover:bg-blue-900/20'}`}
                                                                    title="Copy link with access key">
                                                                    <FontAwesomeIcon icon={faCopy} className="text-[10px]" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Leave Message + Guide */}
                                        {(viewGame.leave_uploader_message || viewGame.guide_link) && (
                                            <div className={`rounded-lg p-4 ${isLight ? 'bg-slate-50 border border-solid border-slate-100' : 'bg-[#0e0e0e] border border-solid border-[#222]'}`}>
                                                {viewGame.leave_uploader_message && (
                                                    <>
                                                        <p className={`text-xs font-bold mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Uploader Message</p>
                                                        <p className={`text-[13px] whitespace-pre-wrap leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                                                            {viewGame.leave_uploader_message}
                                                        </p>
                                                    </>
                                                )}
                                                {viewGame.guide_link && (
                                                    <div className={`flex justify-end ${viewGame.leave_uploader_message ? 'mt-3' : ''}`}>
                                                        <a href={viewGame.guide_link} target="_blank" rel="noopener noreferrer"
                                                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors ${isLight ? 'bg-white hover:bg-blue-50 text-blue-600 border border-solid border-slate-200 shadow-sm' : 'bg-[#1a1a1a] hover:bg-blue-900/20 text-blue-400 border border-solid border-[#333]'}`}>
                                                            <FontAwesomeIcon icon={faLink} className="text-[10px]" /> Guide Link
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Image Lightbox */}
                        {lightbox.open && (
                            <div className="fixed inset-0 z-[10000] flex items-center justify-center" onClick={() => setLightbox({ ...lightbox, open: false })}>
                                <div className="absolute inset-0 bg-black/90" />
                                <button onClick={() => setLightbox({ ...lightbox, open: false })}
                                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>

                                {lightbox.images.length > 1 && (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length }) }}
                                            className="absolute left-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                                            <FontAwesomeIcon icon={faChevronLeft} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length }) }}
                                            className="absolute right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                                            <FontAwesomeIcon icon={faChevronRight} />
                                        </button>
                                    </>
                                )}

                                <img src={lightbox.images[lightbox.index]} alt="" onClick={(e) => e.stopPropagation()}
                                    className="relative max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl" />

                                {lightbox.images.length > 1 && (
                                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                                        {lightbox.images.map((_, i) => (
                                            <button key={i} onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: i }) }}
                                                className={`w-2 h-2 rounded-full transition-all ${i === lightbox.index ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'}`} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ========== FAVORITES TAB ========== */}
                        {activeTab === 'favorites' && view !== 'form' && (
                            <div className={`${card} overflow-hidden`}>
                                <div className={`flex items-center gap-2.5 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-red-100' : 'bg-red-900/30'}`}>
                                        <FontAwesomeIcon icon={faHeart} className={`text-sm ${isLight ? 'text-red-500' : 'text-red-400'}`} />
                                    </div>
                                    <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                                        Favorite Games
                                        <span className={`ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>{favoriteGamesData?.length || 0}</span>
                                    </h3>
                                </div>

                                {favoriteGamesData?.length > 0 ? (
                                    <div className="p-3 sm:p-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                                            {favoriteGamesData.map((g) => {
                                                const r = g.ratings?.length > 0
                                                    ? (g.ratings.reduce((s, i) => s + i.rating, 0) / g.ratings.length).toFixed(1)
                                                    : 0
                                                return (
                                                    <div key={g._id} className={`group rounded-xl overflow-hidden transition-all duration-300 ${isLight
                                                        ? 'bg-white border border-solid border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                                                        : 'bg-[#111] border border-solid border-[#2B2B2B] hover:border-[#444] hover:-translate-y-0.5'
                                                    }`}>
                                                        <div className="relative aspect-[16/10] overflow-hidden">
                                                            {g.featured_image ? (
                                                                <img src={g.featured_image} alt={g.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                                            ) : (
                                                                <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-slate-50' : 'bg-[#1a1a1a]'}`}>
                                                                    <FontAwesomeIcon icon={faGamepad} className={`text-2xl ${isLight ? 'text-slate-200' : 'text-gray-700'}`} />
                                                                </div>
                                                            )}
                                                            {g.category && (
                                                                <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md uppercase tracking-wider ${isLight ? 'bg-white/85 text-slate-600' : 'bg-black/55 text-gray-200'}`}>
                                                                    {g.category}
                                                                </span>
                                                            )}
                                                            <button onClick={() => handleUnfavorite(g._id)}
                                                                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-red-500/90 text-white hover:bg-red-600 transition-all z-10 backdrop-blur-md">
                                                                <FontAwesomeIcon icon={faHeart} className="text-[10px]" />
                                                            </button>
                                                        </div>
                                                        <div className="p-3">
                                                            <Link to={`/games/${g._id}`}>
                                                                <h4 className={`text-xs font-semibold truncate transition-colors ${isLight ? 'text-slate-700 hover:text-blue-600' : 'text-gray-200 hover:text-blue-400'}`}>{g.title}</h4>
                                                            </Link>
                                                            <p className={`text-[10px] truncate mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                                {g.user?.username || g.details?.developer || 'Unknown'}
                                                            </p>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <div className="flex items-center gap-1">
                                                                    <FontAwesomeIcon icon={faStar} className={`text-[9px] ${r > 0 ? 'text-amber-400' : (isLight ? 'text-slate-200' : 'text-gray-700')}`} />
                                                                    <span className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{r > 0 ? r : '—'}</span>
                                                                </div>
                                                                <div className={`flex items-center gap-1 text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                                                    <FontAwesomeIcon icon={faEye} className="text-[8px]" />
                                                                    <span>{g.views?.length || 0}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`flex flex-col items-center justify-center py-16 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                            <FontAwesomeIcon icon={faHeart} className="text-xl" />
                                        </div>
                                        <p className="text-sm font-medium">No favorite games yet</p>
                                        <p className="text-xs mt-1">Games you heart will appear here</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ========== TRASH TAB ========== */}
                        {activeTab === 'trash' && view !== 'form' && (
                            <div className={`${card} overflow-hidden`}>
                                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-orange-100' : 'bg-orange-900/30'}`}>
                                            <FontAwesomeIcon icon={faTrash} className={`text-sm ${isLight ? 'text-orange-500' : 'text-orange-400'}`} />
                                        </div>
                                        <div>
                                            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                                                Trash
                                                <span className={`ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>{trash?.length || 0}</span>
                                            </h3>
                                            <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Games are permanently deleted after 10 days</p>
                                        </div>
                                    </div>
                                    {trash?.length > 0 && (
                                        <button onClick={handleEmptyTrash}
                                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-solid whitespace-nowrap self-start sm:self-auto ${isLight
                                                ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                                                : 'bg-red-900/20 text-red-400 border-red-800/30 hover:bg-red-900/30'
                                            }`}>
                                            <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Empty Trash
                                        </button>
                                    )}
                                </div>

                                {trashLoading ? (
                                    <div className={`flex items-center justify-center py-16 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : trash?.length > 0 ? (
                                    <div className={`divide-y divide-solid ${isLight ? 'divide-slate-100' : 'divide-[#1f1f1f]'}`}>
                                        {trash.map((g) => {
                                            const daysLeft = getDaysRemaining(g.deleted_at)
                                            return (
                                                <div key={g._id} className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#111]'}`}>
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div className="relative w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden flex-shrink-0">
                                                            {g.featured_image ? (
                                                                <img src={g.featured_image} alt={g.title} className="w-full h-full object-cover" loading="lazy" />
                                                            ) : (
                                                                <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                                                    <FontAwesomeIcon icon={faGamepad} className={`text-sm ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className={`text-xs font-semibold truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{g.title}</h4>
                                                            <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                                {g.category} · {g.details?.developer || 'Unknown'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pl-[3.75rem] sm:pl-0">
                                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium flex-shrink-0 ${daysLeft <= 2
                                                            ? (isLight ? 'bg-red-50 text-red-500' : 'bg-red-900/20 text-red-400')
                                                            : daysLeft <= 5
                                                                ? (isLight ? 'bg-amber-50 text-amber-500' : 'bg-amber-900/20 text-amber-400')
                                                                : (isLight ? 'bg-slate-50 text-slate-500' : 'bg-white/5 text-gray-400')
                                                        }`}>
                                                            <FontAwesomeIcon icon={faClock} className="text-[8px]" />
                                                            {daysLeft}d left
                                                        </div>
                                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                                            <button onClick={() => handleRestore(g._id)}
                                                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border border-solid ${isLight
                                                                    ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                                                    : 'bg-green-900/20 text-green-400 border-green-800/30 hover:bg-green-900/30'
                                                                }`}>
                                                                <FontAwesomeIcon icon={faUndo} className="text-[9px]" /> Restore
                                                            </button>
                                                            <button onClick={() => handlePermanentDelete(g._id)}
                                                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border border-solid ${isLight
                                                                    ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                                                                    : 'bg-red-900/20 text-red-400 border-red-800/30 hover:bg-red-900/30'
                                                                }`}>
                                                                <FontAwesomeIcon icon={faTrash} className="text-[9px]" /> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className={`flex flex-col items-center justify-center py-16 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                            <FontAwesomeIcon icon={faTrash} className="text-xl" />
                                        </div>
                                        <p className="text-sm font-medium">Trash is empty</p>
                                        <p className="text-xs mt-1">Deleted games will appear here for 10 days</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ========== LIST VIEW ========== */}
                        {view === 'list' && activeTab === 'games' && (
                            <div className={`${card} overflow-hidden`}>
                                {/* Toolbar */}
                                <div className={`flex flex-col gap-3 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setShowFilters(!showFilters)}
                                                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-solid transition-all ${showFilters
                                                    ? (isLight ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-blue-900/20 border-blue-700 text-blue-400')
                                                    : (isLight ? 'bg-white border-slate-200 text-slate-500 hover:border-slate-300' : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-[#444]')
                                                }`}>
                                                <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
                                                Filters
                                                {activeFilterCount > 0 && (
                                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">{activeFilterCount}</span>
                                                )}
                                            </button>
                                            {selectedIds.length > 0 && (
                                                <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all">
                                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Delete {selectedIds.length}
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative w-full sm:w-auto sm:max-w-xs">
                                            <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                            <input type="text" placeholder="Search title, category, developer..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                                                className={`${inputCls} pl-8`} />
                                        </div>
                                    </div>

                                    {/* Filter row */}
                                    {showFilters && (
                                        <div className={`flex flex-wrap items-center gap-2 pt-2 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(0) }}
                                                className={`${selectCls} text-xs py-1.5`}>
                                                <option value="">All Categories</option>
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <select value={filterPlatform} onChange={(e) => { setFilterPlatform(e.target.value); setPage(0) }}
                                                className={`${selectCls} text-xs py-1.5`}>
                                                <option value="">All Platforms</option>
                                                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                            <select value={filterPrivacy} onChange={(e) => { setFilterPrivacy(e.target.value); setPage(0) }}
                                                className={`${selectCls} text-xs py-1.5`}>
                                                <option value="">Privacy: All</option>
                                                <option value="yes">Private</option>
                                                <option value="no">Public</option>
                                            </select>
                                            <select value={filterStrict} onChange={(e) => { setFilterStrict(e.target.value); setPage(0) }}
                                                className={`${selectCls} text-xs py-1.5`}>
                                                <option value="">Strict: All</option>
                                                <option value="yes">Strict On</option>
                                                <option value="no">Strict Off</option>
                                            </select>
                                            {activeFilterCount > 0 && (
                                                <button onClick={clearFilters}
                                                    className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-all ${isLight ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/20'}`}>
                                                    <FontAwesomeIcon icon={faTimes} className="mr-1 text-[9px]" /> Clear
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Table */}
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className={`w-8 h-8 border-3 border-t-transparent rounded-full animate-spin ${isLight ? 'border-blue-500' : 'border-blue-400'}`} />
                                            <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Loading games...</p>
                                        </div>
                                    </div>
                                ) : pageData.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400 bg-slate-50/50' : 'text-gray-500 bg-[#111]'}`}>
                                                    <th className="px-4 py-3 text-left w-10">
                                                        <input type="checkbox" checked={pageData.length > 0 && pageData.every(g => selectedIds.includes(g._id))} onChange={toggleSelectAll}
                                                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer" />
                                                    </th>
                                                    {[
                                                        { key: 'title', label: 'Title', align: 'text-left', hide: '' },
                                                        { key: 'category', label: 'Category', align: 'text-left', hide: 'hidden md:table-cell' },
                                                        { key: 'privacy', label: 'Private', align: 'text-center', hide: 'hidden sm:table-cell' },
                                                        { key: 'strict', label: 'Strict', align: 'text-center', hide: 'hidden sm:table-cell' },
                                                        { key: 'version', label: 'Version', align: 'text-center', hide: 'hidden lg:table-cell' },
                                                        { key: 'platform', label: 'Platform', align: 'text-center', hide: 'hidden lg:table-cell' },
                                                    ].map(col => (
                                                        <th key={col.key}
                                                            onClick={() => handleSort(col.key)}
                                                            className={`px-4 py-3 ${col.align} ${col.hide} cursor-pointer select-none group/th hover:${isLight ? 'text-slate-600' : 'text-gray-300'} transition-colors`}>
                                                            <span className="inline-flex items-center gap-1">
                                                                {col.label}
                                                                <FontAwesomeIcon
                                                                    icon={sortKey === col.key ? (sortDir === 'asc' ? faSortUp : faSortDown) : faSort}
                                                                    className={`text-[9px] transition-colors ${sortKey === col.key
                                                                        ? (isLight ? 'text-blue-500' : 'text-blue-400')
                                                                        : (isLight ? 'text-slate-200 group-hover/th:text-slate-400' : 'text-gray-700 group-hover/th:text-gray-500')
                                                                    }`}
                                                                />
                                                            </span>
                                                        </th>
                                                    ))}
                                                    <th className="px-4 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageData.map((g) => (
                                                    <tr key={g._id} className={`group transition-colors ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-[#141414]'} border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                                        <td className="px-4 py-3">
                                                            <input type="checkbox" checked={selectedIds.includes(g._id)} onChange={() => toggleSelect(g._id)}
                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {g.featured_image ? (
                                                                    <img src={g.featured_image} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                                                                ) : (
                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-purple-50 text-purple-400' : 'bg-purple-900/20 text-purple-500'}`}>
                                                                        <FontAwesomeIcon icon={faGamepad} />
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{g.title}</p>
                                                                    <p className={`text-[11px] truncate ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{g.details?.developer || 'Unknown developer'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={`px-4 py-3 hidden md:table-cell text-xs font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{g.category}</td>
                                                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                                                            <button onClick={() => handleTogglePrivacy(g._id)}
                                                                className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${g.privacy
                                                                    ? (isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-400')
                                                                    : (isLight ? 'bg-slate-100 text-slate-300' : 'bg-[#1f1f1f] text-gray-600')
                                                                }`}>
                                                                <FontAwesomeIcon icon={g.privacy ? faLock : faLockOpen} className="text-xs" />
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                                                            <button onClick={() => handleToggleStrict(g._id)}
                                                                className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${g.strict
                                                                    ? (isLight ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-400')
                                                                    : (isLight ? 'bg-slate-100 text-slate-300' : 'bg-[#1f1f1f] text-gray-600')
                                                                }`}>
                                                                <FontAwesomeIcon icon={faShieldAlt} className="text-xs" />
                                                            </button>
                                                        </td>
                                                        <td className={`px-4 py-3 text-center hidden lg:table-cell text-xs font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                                            {g.details?.latest_version || '—'}
                                                        </td>
                                                        <td className={`px-4 py-3 text-center hidden lg:table-cell`}>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-gray-400'}`}>{g.details?.platform}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button onClick={() => setViewGame(g)} title="View"
                                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-blue-400 hover:text-blue-600 hover:bg-blue-50' : 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20'}`}>
                                                                    <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                                                                </button>
                                                                <button onClick={() => openEdit(g)} title="Edit"
                                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-50' : 'text-amber-400 hover:text-amber-300 hover:bg-amber-900/20'}`}>
                                                                    <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                                                </button>
                                                                <button onClick={() => handleDuplicate(g)} title="Duplicate"
                                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-green-400 hover:text-green-600 hover:bg-green-50' : 'text-green-400 hover:text-green-300 hover:bg-green-900/20'}`}>
                                                                    <FontAwesomeIcon icon={faClone} className="text-[10px]" />
                                                                </button>
                                                                <button onClick={() => handleDelete(g._id)} title="Delete"
                                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-red-400 hover:text-red-300 hover:bg-red-900/20'}`}>
                                                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className={`flex flex-col items-center justify-center py-16 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                            <FontAwesomeIcon icon={faGamepad} className="text-xl" />
                                        </div>
                                        <p className="text-sm font-medium">{search || activeFilterCount ? 'No games match your criteria' : 'No games uploaded yet'}</p>
                                        {activeFilterCount > 0 && (
                                            <button onClick={clearFilters} className={`text-xs mt-2 underline ${isLight ? 'text-blue-500' : 'text-blue-400'}`}>Clear all filters</button>
                                        )}
                                        {!search && !activeFilterCount && <p className="text-xs mt-1">Click "Upload Game" to get started</p>}
                                    </div>
                                )}

                                {/* Footer: Pagination + Page size */}
                                <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <p className={`text-[11px] whitespace-nowrap ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                            {processed.length > 0
                                                ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, processed.length)} of ${processed.length}`
                                                : `0 results`
                                            }
                                        </p>
                                        <span className={`hidden sm:inline text-[11px] ${isLight ? 'text-slate-200' : 'text-gray-700'}`}>|</span>
                                        <div className="flex items-center gap-1.5">
                                            <label className={`text-[11px] hidden sm:inline ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Show</label>
                                            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
                                                className={`${selectCls} text-[11px] py-1 px-2`}>
                                                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="flex items-center gap-1">
                                            <button disabled={page === 0} onClick={() => setPage(0)}
                                                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                                <FontAwesomeIcon icon={faAngleDoubleLeft} className="text-[10px]" />
                                            </button>
                                            <button disabled={page === 0} onClick={() => setPage(page - 1)}
                                                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                                <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                                            </button>
                                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                let pageNum
                                                if (totalPages <= 5) { pageNum = i }
                                                else if (page < 3) { pageNum = i }
                                                else if (page > totalPages - 4) { pageNum = totalPages - 5 + i }
                                                else { pageNum = page - 2 + i }
                                                return (
                                                    <button key={pageNum} onClick={() => setPage(pageNum)}
                                                        className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-medium transition-all ${page === pageNum
                                                            ? (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                                                            : (isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400')
                                                        }`}>
                                                        {pageNum + 1}
                                                    </button>
                                                )
                                            })}
                                            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}
                                                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                                <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                            </button>
                                            <button disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}
                                                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                                <FontAwesomeIcon icon={faAngleDoubleRight} className="text-[10px]" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ========== FORM VIEW ========== */}
                        {view === 'form' && activeTab === 'games' && (
                            <div className="space-y-4">
                                {/* Basic Info */}
                                <div className={`${card} overflow-hidden`}>
                                    <div className={`flex items-center gap-2.5 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                                            <FontAwesomeIcon icon={faGamepad} className={`text-sm ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                                        </div>
                                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{editId ? 'Edit Game' : 'Upload Game'}</h3>
                                    </div>
                                    <div className="px-4 sm:px-5 py-4 space-y-3">
                                        <div>
                                            <label className={labelCls}>Featured Image URL</label>
                                            <input type="text" className={inputCls} value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} placeholder="https://..." />
                                            {form.featured_image && <img src={form.featured_image} alt="" className="mt-2 h-32 object-cover rounded-lg" />}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className={labelCls}>Title *</label>
                                                <input type="text" className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Game title" />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Category</label>
                                                <select className={`${selectCls} w-full`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Description</label>
                                            <textarea className={`${inputCls} resize-none`} rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Game description..." />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Uploader Message</label>
                                            <textarea className={`${inputCls} resize-none`} rows="2" value={form.leave_uploader_message} onChange={(e) => setForm({ ...form, leave_uploader_message: e.target.value })} placeholder="Leave a message for downloaders..." />
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            {[
                                                { key: 'privacy', label: 'Private' },
                                                { key: 'strict', label: 'Strict' },
                                                { key: 'landscape', label: 'Landscape' },
                                            ].map(({ key, label }) => (
                                                <label key={key} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" checked={form[key]} onChange={() => setForm({ ...form, [key]: !form[key] })}
                                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    <span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className={labelCls}>Guide Link</label>
                                                <input type="text" className={inputCls} value={form.guide_link} onChange={(e) => setForm({ ...form, guide_link: e.target.value })} placeholder="https://..." />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Password</label>
                                                <input type="text" className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Optional password" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className={`${card} overflow-hidden`}>
                                    <div className={`flex items-center gap-2.5 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-cyan-100' : 'bg-cyan-900/30'}`}>
                                            <FontAwesomeIcon icon={faDesktop} className={`text-sm ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
                                        </div>
                                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Game Details</h3>
                                    </div>
                                    <div className="px-4 sm:px-5 py-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className={labelCls}>Version</label>
                                                <input type="text" className={inputCls} value={form.details.latest_version} onChange={(e) => setForm({ ...form, details: { ...form.details, latest_version: e.target.value } })} placeholder="1.0.0" />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Developer</label>
                                                <input type="text" className={inputCls} value={form.details.developer} onChange={(e) => setForm({ ...form, details: { ...form.details, developer: e.target.value } })} placeholder="Developer name" />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Platform</label>
                                                <select className={`${selectCls} w-full`} value={form.details.platform} onChange={(e) => setForm({ ...form, details: { ...form.details, platform: e.target.value } })}>
                                                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelCls}>Language</label>
                                                <select className={`${selectCls} w-full`} value={form.details.language} onChange={(e) => setForm({ ...form, details: { ...form.details, language: e.target.value } })}>
                                                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelCls}>Censorship</label>
                                                <select className={`${selectCls} w-full`} value={form.details.censorship} onChange={(e) => setForm({ ...form, details: { ...form.details, censorship: e.target.value } })}>
                                                    {CENSORSHIP.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className={`${card} overflow-hidden`}>
                                    <div className={`flex items-center gap-2.5 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-amber-100' : 'bg-amber-900/30'}`}>
                                            <FontAwesomeIcon icon={faTag} className={`text-sm ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                                        </div>
                                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Tags ({form.tags.length})</h3>
                                    </div>
                                    <div className="px-4 sm:px-5 py-4">
                                        <div className="flex gap-2 mb-3">
                                            <input type="text" className={inputCls} value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add a tag"
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
                                            <button onClick={addTag} className={btnPrimary} disabled={!tagInput}><FontAwesomeIcon icon={faPlus} className="text-xs" /></button>
                                        </div>
                                        {form.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {form.tags.map((t, i) => (
                                                    <span key={i} className={`inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg text-xs font-medium ${isLight ? 'bg-amber-50 text-amber-700 border border-solid border-amber-200' : 'bg-amber-900/20 text-amber-400 border border-solid border-amber-800/50'}`}>
                                                        {t}
                                                        <button onClick={() => removeTag(i)} className={`w-5 h-5 rounded flex items-center justify-center ${isLight ? 'hover:bg-red-100 hover:text-red-500' : 'hover:bg-red-900/30 hover:text-red-400'}`}>
                                                            <FontAwesomeIcon icon={faTimes} className="text-[9px]" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Download Links */}
                                <div className={`${card} overflow-hidden`}>
                                    <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-emerald-100' : 'bg-emerald-900/30'}`}>
                                                <FontAwesomeIcon icon={faDownload} className={`text-sm ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                                            </div>
                                            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Download Links ({form.download_link.length})</h3>
                                        </div>
                                    </div>
                                    <div className="px-4 sm:px-5 py-4">
                                        <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                            <select className={`${selectCls} flex-1`} value={storageInput} onChange={(e) => setStorageInput(e.target.value)}>
                                                {STORAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <button onClick={addDownloadBucket} className={`${btnPrimary} whitespace-nowrap`}><FontAwesomeIcon icon={faPlus} className="text-xs mr-1.5" /> Add Storage</button>
                                        </div>
                                        <div className="space-y-4">
                                            {form.download_link.map((bucket, bi) => (
                                                <div key={bi} className={`rounded-lg p-3 ${isLight ? 'bg-slate-50 border border-solid border-slate-100' : 'bg-[#111] border border-solid border-[#1f1f1f]'}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{bucket.storage_name}</span>
                                                        <button onClick={() => removeDownloadBucket(bi)} className={`text-xs ${isLight ? 'text-red-400 hover:text-red-600' : 'text-red-500 hover:text-red-300'}`}>
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                    <div className="flex gap-2 mb-2">
                                                        <input type="text" className={inputCls} value={linkInputs[bi] || ''} onChange={(e) => { const l = [...linkInputs]; l[bi] = e.target.value; setLinkInputs(l) }} placeholder="Paste download URL"
                                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLinkToBucket(bi) } }} />
                                                        <button onClick={() => addLinkToBucket(bi)} className={btnPrimary} disabled={!linkInputs[bi]}><FontAwesomeIcon icon={faPlus} className="text-xs" /></button>
                                                    </div>
                                                    {bucket.links.map((link, li) => (
                                                        <div key={li} className={`flex items-center gap-2 py-1.5 text-xs ${li > 0 ? `border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}` : ''}`}>
                                                            <FontAwesomeIcon icon={faLink} className={`flex-shrink-0 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                            <span className={`flex-1 truncate ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{link}</span>
                                                            <button onClick={() => removeLinkFromBucket(bi, li)} className={`${isLight ? 'text-red-400 hover:text-red-600' : 'text-red-500 hover:text-red-300'}`}>
                                                                <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Access Keys */}
                                {form.privacy && (
                                    <div className={`${card} overflow-hidden`}>
                                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-rose-100' : 'bg-rose-900/30'}`}>
                                                    <FontAwesomeIcon icon={faKey} className={`text-sm ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
                                                </div>
                                                <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Access Keys ({form.access_key.length})</h3>
                                            </div>
                                            <button onClick={generateKey} className={`flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all self-start sm:self-auto ${isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}`}>
                                                <FontAwesomeIcon icon={faKey} className="text-[10px]" /> Generate
                                            </button>
                                        </div>
                                        {form.access_key.length > 0 && (
                                            <div className="px-4 sm:px-5 py-3 space-y-2">
                                                {form.access_key.map((k, i) => (
                                                    <div key={i} className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2.5 rounded-lg ${isLight ? 'bg-slate-50 border border-solid border-slate-100' : 'bg-[#111] border border-solid border-[#1f1f1f]'}`}>
                                                        <code className={`text-xs font-mono px-2.5 py-1.5 rounded-md self-start ${isLight ? 'bg-white text-slate-700 border border-solid border-slate-200' : 'bg-[#1a1a1a] text-gray-200 border border-solid border-[#2B2B2B]'}`}>{k.key}</code>
                                                        <div className="flex items-center gap-2 sm:ml-auto">
                                                            <label className={`text-[11px] flex-shrink-0 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Limit</label>
                                                            <input type="number" className={`${inputCls} w-16 text-center !py-1.5`} value={k.download_limit} onChange={(e) => updateKeyLimit(i, e.target.value)} min="0" />
                                                            <div className={`flex items-center gap-1 ml-1 pl-2 border-l border-solid ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`}>
                                                                <button onClick={() => { navigator.clipboard.writeText(editId ? `${window.location.origin}/games/${editId}?access_key=${k.key}` : k.key) }}
                                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-slate-400 hover:text-blue-500 hover:bg-blue-50' : 'text-gray-500 hover:text-blue-400 hover:bg-blue-900/20'}`}
                                                                    title="Copy link with access key">
                                                                    <FontAwesomeIcon icon={faCopy} className="text-[10px]" />
                                                                </button>
                                                                <button onClick={() => removeKey(i)}
                                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-900/20'}`}>
                                                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Gallery */}
                                <div className={`${card} overflow-hidden`}>
                                    <div className={`flex items-center gap-2.5 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-indigo-100' : 'bg-indigo-900/30'}`}>
                                            <FontAwesomeIcon icon={faImages} className={`text-sm ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                                        </div>
                                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Gallery ({form.gallery.length})</h3>
                                    </div>
                                    <div className="px-4 sm:px-5 py-4">
                                        <div className="flex gap-2 mb-3">
                                            <input type="text" className={inputCls} value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} placeholder="Image URL"
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGalleryUrl() } }} />
                                            <button onClick={addGalleryUrl} className={btnPrimary} disabled={!galleryInput}><FontAwesomeIcon icon={faPlus} className="text-xs" /></button>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                                            <input type="checkbox" checked={form.carousel} onChange={() => setForm({ ...form, carousel: !form.carousel })}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Enable Carousel</span>
                                        </label>
                                        {form.gallery.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                {form.gallery.map((url, i) => (
                                                    <div key={i} className="relative group aspect-video rounded-lg overflow-hidden">
                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                        <button onClick={() => removeGalleryUrl(i)}
                                                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <FontAwesomeIcon icon={faTimes} className="text-[9px]" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => { resetForm(); setView('list') }} className={btnSecondary}>Cancel</button>
                                    <button onClick={handleSubmit} disabled={submitting || !form.title} className={`${btnPrimary} disabled:opacity-50 flex items-center gap-2`}>
                                        <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                        {submitting ? (
                                            <span className="flex items-center gap-2">Saving<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>
                                        ) : (editId ? 'Update Game' : 'Upload Game')}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default GameManager
