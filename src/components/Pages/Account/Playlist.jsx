import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist, removeVideoFromPlaylist, clearAlert } from '../../../actions/playlist'
import { dark, light } from '../../../style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faPlus, faTrash, faEdit, faArrowLeft,
    faFilm, faPlay, faEye, faLock, faGlobe, faListSquares,
    faClose, faClock, faList, faGrip
} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import ConfirmModal from '../../Custom/ConfirmModal'

const millisToTimeString = (millis) => {
    if (!millis) return '00:00'
    var seconds = Math.floor(millis / 1000)
    var hours = Math.floor(seconds / 3600)
    seconds %= 3600
    var minutes = Math.floor(seconds / 60)
    seconds %= 60

    var timeString = ""
    if (hours > 0) timeString += hours.toString().padStart(2, '0') + ":"
    timeString += minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0')
    return timeString
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const Playlist = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()

    const playlists = useSelector((state) => state.playlist.data)
    const loading = useSelector((state) => state.playlist.isLoading)
    const alert = useSelector((state) => state.playlist.alert)

    const [viewMode, setViewMode] = useState('list')
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
    const editNameRef = useRef(null)
    const videosPerPage = 8

    useEffect(() => {
        dispatch(getPlaylists())
    }, [])

    useEffect(() => {
        if (Object.keys(alert).length > 0) {
            dispatch(clearAlert())
            setNotification(alert)
        }
    }, [alert])

    useEffect(() => {
        if (activePlaylist) {
            const updated = playlists.find(p => p._id === activePlaylist._id)
            if (updated) setActivePlaylist(updated)
            else setActivePlaylist(null)
        }
    }, [playlists])

    useEffect(() => {
        if (confirm && deleteId) {
            dispatch(deletePlaylist(deleteId))
            if (activePlaylist?._id === deleteId) setActivePlaylist(null)
            setDeleteId('')
            setConfirm(false)
        }
    }, [confirm])

    const handleCreate = () => {
        if (!newPlaylistName.trim()) {
            setError('Playlist name is required')
            return
        }

        dispatch(createPlaylist({
            name: newPlaylistName.trim(),
            description: newPlaylistDesc.trim()
        }))

        setNewPlaylistName('')
        setNewPlaylistDesc('')
        setShowCreateForm(false)
        setError('')
    }

    const handleUpdate = (playlistId) => {
        if (!editName.trim()) {
            setError('Playlist name is required')
            return
        }

        dispatch(updatePlaylist({
            id: playlistId,
            name: editName.trim(),
            description: editDesc.trim()
        }))

        setEditingPlaylist(null)
        setError('')
    }

    const handleRemoveVideo = (playlistId, videoId) => {
        dispatch(removeVideoFromPlaylist({ playlistId, videoId }))
    }

    const startEdit = (playlist, e) => {
        e.stopPropagation()
        setEditingPlaylist(playlist._id)
        setEditName(playlist.name)
        setEditDesc(playlist.description || '')
        requestAnimationFrame(() => editNameRef.current?.focus())
    }

    const openPlaylist = (playlist) => {
        setActivePlaylist(playlist)
        setVideoPage(1)
        setShowCreateForm(false)
        if (editingPlaylist) setEditingPlaylist(null)
    }

    const closePlaylist = () => {
        setActivePlaylist(null)
        setVideoPage(1)
    }

    const renderListItem = (playlist) => {
        const isEditing = editingPlaylist === playlist._id
        const videoCount = playlist.videos?.length || 0
        const firstThumbnail = playlist.videos?.[0]?.thumbnail

        return (
            <div key={playlist._id} className={`rounded-xl border overflow-hidden transition-all ${
                theme === 'light'
                    ? 'bg-white/80 border-blue-200/60'
                    : 'bg-[#1C1C1C] border-[#2B2B2B]'
            }`}>
                <div 
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer transition-colors ${
                        theme === 'light' ? 'hover:bg-blue-50/50' : 'hover:bg-[#2B2B2B]/50'
                    }`}
                    onClick={() => !isEditing && openPlaylist(playlist)}
                >
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden border ${
                        theme === 'light' ? 'border-blue-200/60' : 'border-[#2B2B2B]'
                    }`}>
                        {firstThumbnail ? (
                            <img src={firstThumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center ${
                                theme === 'light' ? 'bg-blue-100/50' : 'bg-gray-800'
                            }`}>
                                <FontAwesomeIcon icon={faPlay} className={`text-sm ${theme === 'light' ? 'text-blue-400' : 'text-gray-500'}`} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        {isEditing ? (
                            <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => { setEditName(e.target.value); setError('') }}
                                    className={`px-3 py-1.5 text-sm rounded-lg ${theme === 'light' ? light.input : dark.input}`}
                                    ref={editNameRef}
                                    onKeyPress={(e) => e.key === 'Enter' && handleUpdate(playlist._id)}
                                />
                                <textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    placeholder="Description"
                                    rows={1}
                                    className={`px-3 py-1.5 text-sm rounded-lg resize-none ${theme === 'light' ? light.input : dark.input}`}
                                />
                                {error && <p className="text-red-500 text-xs">{error}</p>}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdate(playlist._id)}
                                        className="py-1 px-3 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingPlaylist(null)}
                                        className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
                                            theme === 'light' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-white hover:bg-gray-600'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className={`text-sm font-semibold truncate ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                                    {playlist.name}
                                </h3>
                                {playlist.description && (
                                    <p className={`text-xs truncate mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>
                                        {playlist.description}
                                    </p>
                                )}
                                <div className={`flex items-center gap-3 mt-1 text-xs ${theme === 'light' ? light.text : dark.text}`}>
                                    <span className="flex items-center gap-1">
                                        <FontAwesomeIcon icon={faFilm} className="text-[10px]" />
                                        {videoCount} video{videoCount !== 1 ? 's' : ''}
                                    </span>
                                    <span className="hidden sm:flex items-center gap-1">
                                        <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                                        {formatDate(playlist.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FontAwesomeIcon icon={playlist.privacy ? faLock : faGlobe} className="text-[10px]" />
                                        {playlist.privacy ? 'Private' : 'Public'}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {!isEditing && (
                            <>
                                <button
                                    onClick={(e) => startEdit(playlist, e)}
                                    className={`p-1.5 rounded-lg transition-all ${theme === 'light' ? light.edit_button : dark.edit_button}`}
                                >
                                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteId(playlist._id); setOpenModal(true); setConfirm(false) }}
                                    className={`p-1.5 rounded-lg transition-all ${theme === 'light' ? light.delete_button : dark.delete_button}`}
                                >
                                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    const renderBoxItem = (playlist) => {
        const isEditing = editingPlaylist === playlist._id
        const videoCount = playlist.videos?.length || 0
        const firstThumbnail = playlist.videos?.[0]?.thumbnail

        return (
            <div key={playlist._id} className={`rounded-xl border overflow-hidden transition-all flex flex-col ${
                theme === 'light'
                    ? 'bg-white/80 border-blue-200/60'
                    : 'bg-[#1C1C1C] border-[#2B2B2B]'
            }`}>
                <div 
                    className="cursor-pointer group"
                    onClick={() => !isEditing && openPlaylist(playlist)}
                >
                    <div className={`relative aspect-video w-full overflow-hidden ${
                        theme === 'light' ? 'bg-blue-100/50' : 'bg-gray-800'
                    }`}>
                        {firstThumbnail ? (
                            <img src={firstThumbnail} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faPlay} className={`text-2xl ${theme === 'light' ? 'text-blue-300' : 'text-gray-600'}`} />
                            </div>
                        )}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/70 text-white`}>
                                <FontAwesomeIcon icon={faFilm} className="mr-1 text-[9px]" />
                                {videoCount}
                            </span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/70 text-white`}>
                                <FontAwesomeIcon icon={playlist.privacy ? faLock : faGlobe} className="text-[9px]" />
                            </span>
                        </div>
                    </div>

                    <div className="p-3">
                        {isEditing ? (
                            <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => { setEditName(e.target.value); setError('') }}
                                    className={`px-3 py-1.5 text-sm rounded-lg ${theme === 'light' ? light.input : dark.input}`}
                                    ref={editNameRef}
                                    onKeyPress={(e) => e.key === 'Enter' && handleUpdate(playlist._id)}
                                />
                                <textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    placeholder="Description"
                                    rows={1}
                                    className={`px-3 py-1.5 text-sm rounded-lg resize-none ${theme === 'light' ? light.input : dark.input}`}
                                />
                                {error && <p className="text-red-500 text-xs">{error}</p>}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdate(playlist._id)}
                                        className="py-1 px-3 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingPlaylist(null)}
                                        className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
                                            theme === 'light' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-white hover:bg-gray-600'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <h3 className={`text-sm font-semibold truncate ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                                            {playlist.name}
                                        </h3>
                                        {playlist.description && (
                                            <p className={`text-xs truncate mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>
                                                {playlist.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => startEdit(playlist, e)}
                                            className={`p-1 rounded-lg transition-all ${theme === 'light' ? light.edit_button : dark.edit_button}`}
                                        >
                                            <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteId(playlist._id); setOpenModal(true); setConfirm(false) }}
                                            className={`p-1 rounded-lg transition-all ${theme === 'light' ? light.delete_button : dark.delete_button}`}
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                                <p className={`text-xs mt-1.5 ${theme === 'light' ? light.text : dark.text}`}>
                                    <FontAwesomeIcon icon={faClock} className="text-[10px] mr-1" />
                                    {formatDate(playlist.createdAt)}
                                </p>
                            </>
                        )}
                    </div>
                </div>

            </div>
        )
    }

    if (activePlaylist) {
        const videos = activePlaylist.videos || []
        const totalPages = Math.ceil(videos.length / videosPerPage)
        const startIdx = (videoPage - 1) * videosPerPage
        const currentVideos = videos.slice(startIdx, startIdx + videosPerPage)

        return (
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6">
                    <button
                        onClick={closePlaylist}
                        className={`flex items-center gap-2 text-sm font-medium mb-4 px-3 py-1.5 rounded-lg transition-colors ${
                            theme === 'light'
                                ? 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                                : 'text-gray-400 hover:bg-[#2B2B2B] hover:text-white'
                        }`}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                        Back to Playlists
                    </button>

                    <div className="flex items-center gap-3">
                        {activePlaylist.videos?.[0]?.thumbnail && (
                            <div className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border ${
                                theme === 'light' ? 'border-blue-200/60' : 'border-[#2B2B2B]'
                            }`}>
                                <img src={activePlaylist.videos[0].thumbnail} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div>
                            <h1 className={`text-2xl font-semibold ${theme === 'light' ? light.heading : dark.heading}`}>
                                {activePlaylist.name}
                            </h1>
                            <div className={`flex items-center gap-3 mt-1 text-xs ${theme === 'light' ? light.text : dark.text}`}>
                                <span className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faFilm} className="text-[10px]" />
                                    {videos.length} video{videos.length !== 1 ? 's' : ''}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={activePlaylist.privacy ? faLock : faGlobe} className="text-[10px]" />
                                    {activePlaylist.privacy ? 'Private' : 'Public'}
                                </span>
                            </div>
                            {activePlaylist.description && (
                                <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>
                                    {activePlaylist.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {videos.length === 0 ? (
                    <div className={`rounded-xl border p-12 text-center ${
                        theme === 'light'
                            ? 'bg-white/80 border-blue-200/60'
                            : 'bg-[#1C1C1C] border-[#2B2B2B]'
                    }`}>
                        <FontAwesomeIcon icon={faFilm} className={`text-3xl mb-3 ${theme === 'light' ? 'text-blue-300' : 'text-gray-600'}`} />
                        <p className={`text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                            No videos in this playlist yet
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {currentVideos.map((video, index) => (
                                <div key={video._id || index} className={`rounded-xl border overflow-hidden transition-all group ${
                                    theme === 'light'
                                        ? 'bg-white/80 border-blue-200/60 hover:shadow-md'
                                        : 'bg-[#1C1C1C] border-[#2B2B2B] hover:border-[#3B3B3B]'
                                }`}>
                                    <Link to={`/watch/${video._id}`} className="block">
                                        <div className="relative aspect-video w-full overflow-hidden">
                                            {video.thumbnail ? (
                                                <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${
                                                    theme === 'light' ? 'bg-blue-100/50' : 'bg-gray-800'
                                                }`}>
                                                    <FontAwesomeIcon icon={faPlay} className={`text-lg ${theme === 'light' ? 'text-blue-300' : 'text-gray-600'}`} />
                                                </div>
                                            )}
                                            {video.duration && (
                                                <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5">
                                                    <span className="text-white text-[10px] font-medium">{millisToTimeString(video.duration)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="p-2.5">
                                        <Link to={`/watch/${video._id}`}>
                                            <p className={`text-xs font-medium line-clamp-2 leading-snug ${theme === 'light' ? 'text-slate-800' : 'text-gray-200'}`}>
                                                {video.title || 'Untitled'}
                                            </p>
                                        </Link>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <p className={`text-[10px] flex items-center gap-1 ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>
                                                <FontAwesomeIcon icon={faEye} className="text-[9px]" />
                                                {video.views?.length || 0} views
                                            </p>
                                            <button
                                                onClick={() => handleRemoveVideo(activePlaylist._id, video._id)}
                                                className={`p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                                                    theme === 'light' ? light.delete_button : dark.delete_button
                                                }`}
                                                title="Remove from playlist"
                                            >
                                                <FontAwesomeIcon icon={faClose} className="text-[10px]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button
                                    onClick={() => setVideoPage(p => Math.max(1, p - 1))}
                                    disabled={videoPage === 1}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                        videoPage === 1
                                            ? 'opacity-40 cursor-not-allowed'
                                            : (theme === 'light' ? 'hover:bg-blue-50 text-slate-600' : 'hover:bg-[#2B2B2B] text-gray-400')
                                    }`}
                                >
                                    Prev
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setVideoPage(page)}
                                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                            videoPage === page
                                                ? 'bg-blue-600 text-white'
                                                : (theme === 'light' ? 'hover:bg-blue-50 text-slate-600' : 'hover:bg-[#2B2B2B] text-gray-400')
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setVideoPage(p => Math.min(totalPages, p + 1))}
                                    disabled={videoPage === totalPages}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                        videoPage === totalPages
                                            ? 'opacity-40 cursor-not-allowed'
                                            : (theme === 'light' ? 'hover:bg-blue-50 text-slate-600' : 'hover:bg-[#2B2B2B] text-gray-400')
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <ConfirmModal 
                theme={theme}
                title="Delete Playlist"
                description="Are you sure you want to delete this playlist? This action cannot be undone."
                openModal={openModal}
                setOpenModal={setOpenModal}
                setConfirm={setConfirm}
            />

            <div className='mb-6 flex flex-col xs:flex-row justify-between items-start gap-4'>
                <div>
                    <h1 className={`text-2xl font-semibold mb-1 ${theme === 'light' ? light.heading : dark.heading}`}>
                        Playlists
                    </h1>
                    <p className={`text-sm ${theme === 'light' ? light.text : dark.text}`}>
                        Organize and manage your video playlists
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`flex items-center rounded-lg border overflow-hidden ${
                        theme === 'light' ? 'border-blue-200/60' : 'border-[#2B2B2B]'
                    }`}>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 px-3 text-sm transition-colors ${
                                viewMode === 'list'
                                    ? (theme === 'light' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
                                    : (theme === 'light' ? 'bg-white/80 text-slate-600 hover:bg-blue-50' : 'bg-[#1C1C1C] text-gray-400 hover:bg-[#2B2B2B]')
                            }`}
                        >
                            <FontAwesomeIcon icon={faList} />
                        </button>
                        <button
                            onClick={() => setViewMode('box')}
                            className={`p-2 px-3 text-sm transition-colors ${
                                viewMode === 'box'
                                    ? (theme === 'light' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
                                    : (theme === 'light' ? 'bg-white/80 text-slate-600 hover:bg-blue-50' : 'bg-[#1C1C1C] text-gray-400 hover:bg-[#2B2B2B]')
                            }`}
                        >
                            <FontAwesomeIcon icon={faGrip} />
                        </button>
                    </div>
                    <button
                        onClick={() => { setShowCreateForm(!showCreateForm); setError('') }}
                        className={`py-2 px-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
                            theme === 'light' ? light.button_secondary : dark.button_secondary
                        } text-white`}
                    >
                        <FontAwesomeIcon icon={showCreateForm ? faClose : faPlus} className="text-xs" />
                        <span className="hidden sm:inline">{showCreateForm ? 'Cancel' : 'New Playlist'}</span>
                    </button>
                </div>
            </div>

            {showCreateForm && (
                <div className={`mb-6 rounded-xl p-4 border ${
                    theme === 'light'
                        ? 'bg-white/80 border-blue-200/60'
                        : 'bg-[#1C1C1C] border-[#2B2B2B]'
                }`}>
                    <h3 className={`text-sm font-semibold mb-3 ${theme === 'light' ? light.heading : dark.heading}`}>
                        Create New Playlist
                    </h3>
                    <div className="flex flex-col gap-3 max-w-lg">
                        <input
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => { setNewPlaylistName(e.target.value); setError('') }}
                            placeholder="Playlist name"
                            className={`px-3 py-2 text-sm rounded-lg ${theme === 'light' ? light.input : dark.input}`}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <textarea
                            value={newPlaylistDesc}
                            onChange={(e) => setNewPlaylistDesc(e.target.value)}
                            placeholder="Description (optional)"
                            rows={2}
                            className={`px-3 py-2 text-sm rounded-lg resize-none ${theme === 'light' ? light.input : dark.input}`}
                        />
                        {error && <p className="text-red-500 text-xs">{error}</p>}
                        <button
                            onClick={handleCreate}
                            className="self-start py-2 px-5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                            Create
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className={`flex ${viewMode === 'box' ? 'flex-wrap gap-4' : 'flex-col gap-3'}`}>
                    {[1, 2, 3].map((i) => (
                        viewMode === 'box' ? (
                            <div key={i} className={`w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] rounded-xl border overflow-hidden ${
                                theme === 'light' ? 'bg-white/80 border-blue-200/60' : 'bg-[#1C1C1C] border-[#2B2B2B]'
                            }`}>
                                <div className={`aspect-video w-full animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                <div className="p-3">
                                    <div className={`w-32 h-4 rounded animate-pulse mb-2 ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                    <div className={`w-20 h-3 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                </div>
                            </div>
                        ) : (
                            <div key={i} className={`rounded-xl p-4 border ${
                                theme === 'light' ? 'bg-white/80 border-blue-200/60' : 'bg-[#1C1C1C] border-[#2B2B2B]'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-14 h-14 rounded-lg animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                    <div className="flex-1">
                                        <div className={`w-36 h-4 rounded animate-pulse mb-2 ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                        <div className={`w-20 h-3 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            ) : playlists.length === 0 ? (
                <div className={`rounded-xl border p-12 text-center ${
                    theme === 'light'
                        ? 'bg-white/80 border-blue-200/60'
                        : 'bg-[#1C1C1C] border-[#2B2B2B]'
                }`}>
                    <FontAwesomeIcon 
                        icon={faListSquares} 
                        className={`text-3xl mb-3 ${theme === 'light' ? 'text-blue-300' : 'text-gray-600'}`} 
                    />
                    <p className={`text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                        No playlists yet
                    </p>
                    <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-gray-600'}`}>
                        Create a playlist to organize your favorite videos
                    </p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="flex flex-col gap-3">
                    {playlists.map((playlist) => renderListItem(playlist))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playlists.map((playlist) => renderBoxItem(playlist))}
                </div>
            )}

            {playlists.length > 0 && (
                <div className={`mt-4 flex items-center gap-2 text-xs ${theme === 'light' ? light.text : dark.text}`}>
                    <FontAwesomeIcon icon={faListSquares} className="text-xs" />
                    <span>{playlists.length} playlist{playlists.length !== 1 ? 's' : ''} &middot; {playlists.reduce((sum, p) => sum + (p.videos?.length || 0), 0)} total videos</span>
                </div>
            )}
        </div>
    )
}

export default Playlist
