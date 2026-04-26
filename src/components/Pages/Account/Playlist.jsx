import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist, removeVideoFromPlaylist, clearAlert } from '../../../actions/playlist'
import { dark, light } from '../../../style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faPlus, faTrash, faArrowLeft, faFilm, faPlay, faEye, faLock, faGlobe,
    faXmark, faClock, faList, faGrip, faSpinner, faPen, faEllipsisVertical,
    faChevronLeft, faChevronRight, faMusic, faSearch, faListUl
} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import ConfirmModal from '../../Custom/ConfirmModal'

const millisToTimeString = (millis) => {
    if (!millis) return '00:00'
    let s = Math.floor(millis / 1000), h = Math.floor(s / 3600); s %= 3600
    let m = Math.floor(s / 60); s %= 60
    let t = ''; if (h > 0) t += h.toString().padStart(2, '0') + ':'
    return t + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0')
}

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const Playlist = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()
    const playlists = useSelector((state) => state.playlist.data)
    const loading = useSelector((state) => state.playlist.isLoading)
    const alert = useSelector((state) => state.playlist.alert)

    const isLight = theme === 'light'

    const [viewMode, setViewMode] = useState('box')
    const [activePlaylist, setActivePlaylist] = useState(null)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingPlaylist, setEditingPlaylist] = useState(null)
    const [newPlaylistName, setNewPlaylistName] = useState('')
    const [newPlaylistDesc, setNewPlaylistDesc] = useState('')
    const [editName, setEditName] = useState('')
    const [editDesc, setEditDesc] = useState('')
    const [error, setError] = useState('')
    const [deleteId, setDeleteId] = useState('')
    const [openModal, setOpenModal] = useState(false)
    const [confirm, setConfirm] = useState(false)
    const [videoPage, setVideoPage] = useState(1)
    const [actionMenu, setActionMenu] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const editNameRef = useRef(null)
    const videosPerPage = 8

    useEffect(() => { dispatch(getPlaylists()) }, [])
    useEffect(() => { if (Object.keys(alert).length > 0) { dispatch(clearAlert()); setNotification(alert) } }, [alert])
    useEffect(() => { if (activePlaylist) { const u = playlists.find(p => p._id === activePlaylist._id); if (u) setActivePlaylist(u); else setActivePlaylist(null) } }, [playlists])
    useEffect(() => { if (confirm && deleteId) { dispatch(deletePlaylist(deleteId)); if (activePlaylist?._id === deleteId) setActivePlaylist(null); setDeleteId(''); setConfirm(false) } }, [confirm])

    const handleCreate = () => {
        if (!newPlaylistName.trim()) { setError('Playlist name is required'); return }
        dispatch(createPlaylist({ name: newPlaylistName.trim(), description: newPlaylistDesc.trim() }))
        setNewPlaylistName(''); setNewPlaylistDesc(''); setShowCreateForm(false); setError('')
    }

    const handleUpdate = (id) => {
        if (!editName.trim()) { setError('Playlist name is required'); return }
        dispatch(updatePlaylist({ id, name: editName.trim(), description: editDesc.trim() }))
        setEditingPlaylist(null); setError('')
    }

    const startEdit = (playlist) => {
        setEditingPlaylist(playlist._id); setEditName(playlist.name); setEditDesc(playlist.description || ''); setActionMenu(null)
        requestAnimationFrame(() => editNameRef.current?.focus())
    }

    const openPlaylistView = (p) => { setActivePlaylist(p); setVideoPage(1); setShowCreateForm(false); setEditingPlaylist(null) }

    const panelClass = `rounded-xl border ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#161616] border-[#2B2B2B]'}`
    const inputClass = `block w-full rounded-lg border transition-all duration-200 py-2.5 px-3.5 text-sm outline-none ${isLight ? 'bg-white border-slate-200 text-slate-700 placeholder-slate-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100' : 'bg-[#1A1A1A] border-[#333] text-gray-200 placeholder-gray-600 focus:border-rose-500 focus:ring-2 focus:ring-rose-900/30'}`
    const sectionLabel = `text-[10px] font-semibold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-gray-600'}`

    const filteredPlaylists = playlists.filter(p => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    })

    // ─── Active Playlist Detail View ───
    if (activePlaylist) {
        const videos = activePlaylist.videos || []
        const totalPages = Math.ceil(videos.length / videosPerPage)
        const currentVideos = videos.slice((videoPage - 1) * videosPerPage, videoPage * videosPerPage)

        return (
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                {/* Back + Header */}
                <div className="mb-6">
                    <button onClick={() => { setActivePlaylist(null); setVideoPage(1) }}
                        className={`flex items-center gap-2 text-xs font-medium mb-4 px-3 py-1.5 rounded-lg transition-all ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-700' : 'text-gray-500 hover:bg-[#1C1C1C] hover:text-gray-300'}`}>
                        <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" /> Back to Playlists
                    </button>
                    <div className="flex items-start gap-4">
                        <div className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 ${isLight ? 'bg-rose-50' : 'bg-rose-900/15'}`}>
                            {activePlaylist.videos?.[0]?.thumbnail
                                ? <img src={activePlaylist.videos[0].thumbnail} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><FontAwesomeIcon icon={faMusic} className={`text-xl ${isLight ? 'text-rose-300' : 'text-rose-800'}`} /></div>}
                        </div>
                        <div className="min-w-0">
                            <h1 className={`text-xl font-bold truncate ${isLight ? light.heading : dark.heading}`}>{activePlaylist.name}</h1>
                            {activePlaylist.description && <p className={`text-xs mt-1 line-clamp-2 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{activePlaylist.description}</p>}
                            <div className={`flex items-center gap-3 mt-2 text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                <span className="flex items-center gap-1"><FontAwesomeIcon icon={faFilm} className="text-[9px]" /> {videos.length} video{videos.length !== 1 ? 's' : ''}</span>
                                <span className={`flex items-center gap-1 ${activePlaylist.privacy ? (isLight ? 'text-amber-500' : 'text-amber-400') : (isLight ? 'text-emerald-500' : 'text-emerald-400')}`}>
                                    <FontAwesomeIcon icon={activePlaylist.privacy ? faLock : faGlobe} className="text-[9px]" /> {activePlaylist.privacy ? 'Private' : 'Public'}
                                </span>
                                <span className="flex items-center gap-1"><FontAwesomeIcon icon={faClock} className="text-[9px]" /> {formatDate(activePlaylist.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {videos.length === 0 ? (
                    <div className={`${panelClass} p-16 text-center`}>
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#1C1C1C]'}`}>
                            <FontAwesomeIcon icon={faFilm} className={`text-xl ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                        </div>
                        <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>No videos yet</p>
                        <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Videos you add to this playlist will appear here</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {currentVideos.map((video, i) => (
                                <div key={video._id || i} className={`${panelClass} overflow-hidden group`}>
                                    <Link to={`/watch/${video._id}`} className="block">
                                        <div className={`relative aspect-video w-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1A1A1A]'}`}>
                                            {video.thumbnail
                                                ? <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                                                : <div className="w-full h-full flex items-center justify-center"><FontAwesomeIcon icon={faPlay} className={`text-lg ${isLight ? 'text-slate-300' : 'text-gray-600'}`} /></div>}
                                            {video.duration && (
                                                <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black/75 px-1.5 py-0.5">
                                                    <span className="text-white text-[10px] font-medium tabular-nums">{millisToTimeString(video.duration)}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg">
                                                    <FontAwesomeIcon icon={faPlay} className="text-sm text-slate-800 ml-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="p-3">
                                        <Link to={`/watch/${video._id}`}>
                                            <p className={`text-xs font-semibold line-clamp-2 leading-snug mb-1.5 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{video.title || 'Untitled'}</p>
                                        </Link>
                                        <div className="flex items-center justify-between">
                                            <p className={`text-[10px] flex items-center gap-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                <FontAwesomeIcon icon={faEye} className="text-[8px]" /> {video.views?.length || 0} views
                                            </p>
                                            <button onClick={() => dispatch(removeVideoFromPlaylist({ playlistId: activePlaylist._id, videoId: video._id }))}
                                                title="Remove from playlist"
                                                className={`w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${isLight ? 'text-slate-400 hover:bg-red-50 hover:text-red-500' : 'text-gray-600 hover:bg-red-900/20 hover:text-red-400'}`}>
                                                <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1 mt-6">
                                <button onClick={() => setVideoPage(p => Math.max(1, p - 1))} disabled={videoPage === 1}
                                    className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${videoPage === 1 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const pn = totalPages <= 5 ? i + 1 : Math.min(Math.max(videoPage - 2, 1), totalPages - 4) + i
                                    return (
                                        <button key={pn} onClick={() => setVideoPage(pn)}
                                            className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all ${videoPage === pn ? (isLight ? 'bg-rose-500 text-white shadow-sm' : 'bg-rose-600 text-white') : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#333]')}`}>
                                            {pn}
                                        </button>
                                    )
                                })}
                                <button onClick={() => setVideoPage(p => Math.min(totalPages, p + 1))} disabled={videoPage === totalPages}
                                    className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${videoPage === totalPages ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        )
    }

    // ─── Playlist List View ───
    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <ConfirmModal theme={theme} title="Delete Playlist" description="Are you sure you want to delete this playlist? This action cannot be undone." openModal={openModal} setOpenModal={setOpenModal} setConfirm={setConfirm} />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-rose-50' : 'bg-rose-900/20'}`}>
                            <FontAwesomeIcon icon={faListUl} className={`text-xs ${isLight ? 'text-rose-500' : 'text-rose-400'}`} />
                        </div>
                        <h1 className={`text-2xl font-semibold ${isLight ? light.heading : dark.heading}`}>Playlists</h1>
                    </div>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Organize and manage your video playlists</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`flex p-0.5 rounded-lg ${isLight ? 'bg-slate-100' : 'bg-[#1A1A1A]'}`}>
                        {[{ mode: 'list', icon: faList }, { mode: 'box', icon: faGrip }].map(({ mode, icon }) => (
                            <button key={mode} onClick={() => setViewMode(mode)}
                                className={`w-8 h-7 rounded-md flex items-center justify-center text-xs transition-all ${viewMode === mode ? (isLight ? 'bg-white text-slate-800 shadow-sm' : 'bg-[#2B2B2B] text-white') : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-gray-500 hover:text-gray-300')}`}>
                                <FontAwesomeIcon icon={icon} />
                            </button>
                        ))}
                    </div>
                    <button onClick={() => { setShowCreateForm(!showCreateForm); setError(''); setEditingPlaylist(null) }}
                        className={`py-2 px-4 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${showCreateForm ? (isLight ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-[#1C1C1C] border border-[#333] text-gray-400 hover:bg-[#222]') : (isLight ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm' : 'bg-rose-600 text-white hover:bg-rose-700')}`}>
                        <FontAwesomeIcon icon={showCreateForm ? faXmark : faPlus} className="text-[10px]" />
                        {showCreateForm ? 'Cancel' : 'New Playlist'}
                    </button>
                </div>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <form onSubmit={e => { e.preventDefault(); handleCreate() }} className="max-w-2xl space-y-5 mb-6">
                    <div className={panelClass}>
                        <div className={`px-5 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                            <p className={sectionLabel}>New Playlist</p>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Name</label>
                                <input type="text" value={newPlaylistName} onChange={e => { setNewPlaylistName(e.target.value); setError('') }} placeholder="Playlist name" className={inputClass} />
                                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Description</label>
                                <textarea value={newPlaylistDesc} onChange={e => setNewPlaylistDesc(e.target.value)} placeholder="What's this playlist about?" rows={2} className={`${inputClass} resize-none`} />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className={`w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${isLight ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm' : 'bg-rose-600 text-white hover:bg-rose-700'}`}>
                        Create Playlist
                    </button>
                </form>
            )}

            {/* Search + Content */}
            {!showCreateForm && (
                <div className={`${panelClass} overflow-hidden`}>
                    {/* Table Header */}
                    <div className={`px-5 py-4 flex items-center justify-between border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-rose-100' : 'bg-rose-900/30'}`}>
                                <FontAwesomeIcon icon={faListUl} className={`text-xs ${isLight ? 'text-rose-500' : 'text-rose-400'}`} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>All Playlists</h3>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isLight ? 'bg-rose-50 text-rose-500' : 'bg-rose-900/20 text-rose-400'}`}>{filteredPlaylists.length}</span>
                                </div>
                                <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{playlists.reduce((s, p) => s + (p.videos?.length || 0), 0)} total videos</p>
                            </div>
                        </div>
                        <div className="relative flex-shrink-0 ml-3">
                            <FontAwesomeIcon icon={faSearch} className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className={`pl-7 pr-3 py-1.5 text-xs rounded-lg border outline-none w-36 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-rose-300' : 'bg-[#1C1C1C] border-[#333] text-gray-300 placeholder:text-gray-600 focus:border-[#444]'}`} />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20"><div className={`animate-spin rounded-full h-7 w-7 border-2 border-t-transparent ${isLight ? 'border-rose-500' : 'border-rose-400'}`} /></div>
                    ) : filteredPlaylists.length === 0 ? (
                        <div className="text-center py-16">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#1C1C1C]'}`}>
                                <FontAwesomeIcon icon={faListUl} className={`text-xl opacity-20 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                            </div>
                            <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{searchQuery ? 'No playlists found' : 'No playlists yet'}</p>
                            <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{searchQuery ? 'Try a different search' : 'Create your first playlist'}</p>
                        </div>
                    ) : viewMode === 'list' ? (
                        /* List View */
                        <div>
                            {filteredPlaylists.map((playlist, i) => {
                                const isEditing = editingPlaylist === playlist._id
                                const videoCount = playlist.videos?.length || 0
                                const thumb = playlist.videos?.[0]?.thumbnail

                                return (
                                    <div key={playlist._id} className={`flex items-center gap-3 sm:gap-4 px-5 py-3.5 transition-all cursor-pointer ${i !== 0 ? `border-t ${isLight ? 'border-slate-100' : 'border-[#222]'}` : ''} ${isLight ? 'hover:bg-rose-50/30' : 'hover:bg-[#1A1A1A]'}`}
                                        onClick={() => !isEditing && openPlaylistView(playlist)}>
                                        <div className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 ${isLight ? 'bg-slate-100' : 'bg-[#1A1A1A]'}`}>
                                            {thumb ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center"><FontAwesomeIcon icon={faMusic} className={`text-sm ${isLight ? 'text-slate-300' : 'text-gray-600'}`} /></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {isEditing ? (
                                                <div className="space-y-2" onClick={e => e.stopPropagation()}>
                                                    <input type="text" value={editName} onChange={e => { setEditName(e.target.value); setError('') }} ref={editNameRef} onKeyDown={e => e.key === 'Enter' && handleUpdate(playlist._id)} className={inputClass} />
                                                    <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description" rows={1} className={`${inputClass} resize-none`} />
                                                    {error && <p className="text-xs text-red-500">{error}</p>}
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleUpdate(playlist._id)} className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${isLight ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-rose-600 text-white hover:bg-rose-700'}`}>Save</button>
                                                        <button onClick={() => setEditingPlaylist(null)} className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#222] text-gray-400 hover:bg-[#2B2B2B]'}`}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{playlist.name}</p>
                                                    {playlist.description && <p className={`text-xs truncate mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{playlist.description}</p>}
                                                    <div className={`flex items-center gap-3 mt-1 text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                        <span className="flex items-center gap-1"><FontAwesomeIcon icon={faFilm} className="text-[9px]" /> {videoCount}</span>
                                                        <span className={`flex items-center gap-1 ${playlist.privacy ? (isLight ? 'text-amber-500' : 'text-amber-400') : (isLight ? 'text-emerald-500' : 'text-emerald-400')}`}>
                                                            <FontAwesomeIcon icon={playlist.privacy ? faLock : faGlobe} className="text-[9px]" /> {playlist.privacy ? 'Private' : 'Public'}
                                                        </span>
                                                        <span className="hidden sm:flex items-center gap-1"><FontAwesomeIcon icon={faClock} className="text-[9px]" /> {formatDate(playlist.createdAt)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {!isEditing && (
                                            <div className="flex-shrink-0 relative" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => setActionMenu(actionMenu === playlist._id ? null : playlist._id)}
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#2B2B2B]'}`}>
                                                    <FontAwesomeIcon icon={faEllipsisVertical} className="text-xs" />
                                                </button>
                                                {actionMenu === playlist._id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
                                                        <div className={`absolute right-0 top-full mt-1 z-50 rounded-lg border shadow-lg overflow-hidden min-w-[120px] ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1C1C] border-[#333]'}`}>
                                                            <button onClick={() => startEdit(playlist)} className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-gray-300 hover:bg-[#222]'}`}>
                                                                <FontAwesomeIcon icon={faPen} className="text-[10px] text-blue-500" /> Edit
                                                            </button>
                                                            <button onClick={() => { setDeleteId(playlist._id); setOpenModal(true); setConfirm(false); setActionMenu(null) }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isLight ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/10'}`}>
                                                                <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        /* Grid View */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                            {filteredPlaylists.map(playlist => {
                                const isEditing = editingPlaylist === playlist._id
                                const videoCount = playlist.videos?.length || 0
                                const thumb = playlist.videos?.[0]?.thumbnail

                                return (
                                    <div key={playlist._id} className={`rounded-xl border overflow-hidden transition-all group ${isLight ? 'bg-white border-slate-200/60 hover:shadow-md' : 'bg-[#1A1A1A] border-[#2B2B2B] hover:border-[#333]'}`}>
                                        <div className="cursor-pointer" onClick={() => !isEditing && openPlaylistView(playlist)}>
                                            <div className={`relative aspect-video w-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#111]'}`}>
                                                {thumb ? <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                                                    : <div className="w-full h-full flex items-center justify-center"><FontAwesomeIcon icon={faMusic} className={`text-2xl ${isLight ? 'text-slate-200' : 'text-gray-700'}`} /></div>}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm">
                                                        <FontAwesomeIcon icon={faFilm} className="mr-1 text-[9px]" />{videoCount}
                                                    </span>
                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md backdrop-blur-sm ${playlist.privacy ? 'bg-amber-500/80 text-white' : 'bg-emerald-500/80 text-white'}`}>
                                                        <FontAwesomeIcon icon={playlist.privacy ? faLock : faGlobe} className="text-[9px]" />
                                                    </span>
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg">
                                                        <FontAwesomeIcon icon={faPlay} className="text-sm text-slate-800 ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3.5">
                                            {isEditing ? (
                                                <div className="space-y-2" onClick={e => e.stopPropagation()}>
                                                    <input type="text" value={editName} onChange={e => { setEditName(e.target.value); setError('') }} ref={editNameRef} onKeyDown={e => e.key === 'Enter' && handleUpdate(playlist._id)} className={inputClass} />
                                                    <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description" rows={1} className={`${inputClass} resize-none`} />
                                                    {error && <p className="text-xs text-red-500">{error}</p>}
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleUpdate(playlist._id)} className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${isLight ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-rose-600 text-white hover:bg-rose-700'}`}>Save</button>
                                                        <button onClick={() => setEditingPlaylist(null)} className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#222] text-gray-400 hover:bg-[#2B2B2B]'}`}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => openPlaylistView(playlist)}>
                                                        <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{playlist.name}</p>
                                                        {playlist.description && <p className={`text-[11px] truncate mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{playlist.description}</p>}
                                                        <p className={`text-[10px] mt-1.5 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{formatDate(playlist.createdAt)}</p>
                                                    </div>
                                                    <div className="flex-shrink-0 relative" onClick={e => e.stopPropagation()}>
                                                        <button onClick={() => setActionMenu(actionMenu === playlist._id ? null : playlist._id)}
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#2B2B2B]'}`}>
                                                            <FontAwesomeIcon icon={faEllipsisVertical} className="text-xs" />
                                                        </button>
                                                        {actionMenu === playlist._id && (
                                                            <>
                                                                <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
                                                                <div className={`absolute right-0 top-full mt-1 z-50 rounded-lg border shadow-lg overflow-hidden min-w-[120px] ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1C1C] border-[#333]'}`}>
                                                                    <button onClick={() => startEdit(playlist)} className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-gray-300 hover:bg-[#222]'}`}>
                                                                        <FontAwesomeIcon icon={faPen} className="text-[10px] text-blue-500" /> Edit
                                                                    </button>
                                                                    <button onClick={() => { setDeleteId(playlist._id); setOpenModal(true); setConfirm(false); setActionMenu(null) }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isLight ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/10'}`}>
                                                                        <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Delete
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Playlist
