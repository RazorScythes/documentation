import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getPlaylists, createPlaylist, toggleVideoInPlaylist, deletePlaylist, clearAlert } from '../../actions/playlist'
import { dark, light } from '../../style';
import { faClose, faPlus, faCheck, faTrash, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MotionAnimate } from 'react-motion-animate';

const PlaylistModal = ({ theme, openModal, setOpenModal, videoId, videoData }) => {
    const dispatch = useDispatch()
    const playlists = useSelector((state) => state.playlist.data)
    const playlistAlert = useSelector((state) => state.playlist.alert)

    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        if (openModal) {
            dispatch(getPlaylists())
        }
    }, [openModal])

    useEffect(() => {
        if (Object.keys(playlistAlert).length > 0) {
            dispatch(clearAlert())
            setLoading(false)
        }
    }, [playlistAlert])

    const isVideoInPlaylist = (playlist) => {
        return playlist.videos?.some(v => (v._id || v) === videoId)
    }

    const handleToggleVideo = (playlistId) => {
        dispatch(toggleVideoInPlaylist({ playlistId, videoId }))
    }

    const handleCreatePlaylist = () => {
        if (!newPlaylistName.trim()) {
            setError('Playlist name cannot be empty');
            return;
        }

        if (playlists.some(p => p.name.toLowerCase() === newPlaylistName.trim().toLowerCase())) {
            setError('A playlist with this name already exists');
            return;
        }

        setLoading(true)
        dispatch(createPlaylist({
            name: newPlaylistName.trim(),
            videoId
        }))

        setNewPlaylistName('');
        setShowCreateForm(false);
        setError('');
    }

    const handleDeletePlaylist = (playlist, e) => {
        e.stopPropagation();
        setConfirmDelete(playlist);
    }

    const confirmDeletePlaylist = () => {
        if (confirmDelete) {
            dispatch(deletePlaylist(confirmDelete._id))
            setConfirmDelete(null);
        }
    }

    const closeModal = () => {
        setOpenModal(false);
        setShowCreateForm(false);
        setNewPlaylistName('');
        setError('');
        setConfirmDelete(null);
    };

    return (
        <>
            {openModal && (
                <div className="fixed inset-0 bg-black/80 z-[100]" onClick={closeModal}></div>
            )}
            {
                openModal && (
                    <div
                        className="flex items-center justify-center scrollbar-hide w-full fixed inset-0 z-[100] p-5"
                        onClick={closeModal}
                    >
                        <MotionAnimate variant={{
                            hidden: { 
                                opacity: 0,
                                transform: 'scale(0)'
                            },
                            show: {
                                opacity: 1,
                                transform: 'scale(1)',
                                transition: {
                                    duration: 0.15,
                                }
                            }
                        }}>
                            <div 
                                className={`w-[90vw] sm:w-[420px] md:w-[480px] rounded-xl relative flex flex-col max-h-[85vh] ${theme === 'light' ? 'bg-white' : 'bg-[#1C1C1C]'} ${theme === 'light' ? light.color : dark.color} border ${theme === 'light' ? 'border-gray-200' : 'border-[#2B2B2B]'}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {confirmDelete && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/60">
                                        <div className={`mx-6 w-full max-w-sm rounded-xl p-5 border ${
                                            theme === 'light'
                                                ? 'bg-white border-gray-200'
                                                : 'bg-[#1C1C1C] border-[#2B2B2B]'
                                        }`}>
                                            <div className="flex flex-col items-center text-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                                                    theme === 'light' ? 'bg-red-50' : 'bg-red-900/20'
                                                }`}>
                                                    <FontAwesomeIcon icon={faExclamationTriangle} className={`text-sm ${
                                                        theme === 'light' ? 'text-red-500' : 'text-red-400'
                                                    }`} />
                                                </div>
                                                <h4 className={`text-sm font-semibold mb-1.5 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                                    Delete Playlist
                                                </h4>
                                                <p className={`text-sm mb-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    Are you sure you want to delete
                                                </p>
                                                <p className={`text-sm font-medium mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                                    "{confirmDelete.name}"?
                                                </p>
                                                <div className="flex gap-2 w-full">
                                                    <button
                                                        onClick={() => setConfirmDelete(null)}
                                                        className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                                                            theme === 'light'
                                                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                                : 'bg-[#2B2B2B] hover:bg-[#333] text-white'
                                                        }`}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={confirmDeletePlaylist}
                                                        className="flex-1 py-2 rounded-lg font-medium text-sm bg-red-600 hover:bg-red-700 text-white transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Header */}
                                <div className={`flex items-center justify-between p-4 py-3 border-b flex-shrink-0 ${theme === 'light' ? 'border-gray-200' : 'border-[#2B2B2B]'}`}>
                                    <h3 className="text-base font-semibold">
                                        Add to Playlist
                                    </h3>
                                    <button
                                        className={`p-1.5 rounded-lg transition-colors ${theme === 'light' ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-400 hover:bg-[#2B2B2B]'}`}
                                        onClick={closeModal}
                                    >
                                        <FontAwesomeIcon icon={faClose} className="text-sm" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-4 overflow-y-auto min-h-0 flex-1">
                                    {showCreateForm ? (
                                        <div className={`mb-3 p-3 rounded-lg ${theme === 'light' ? 'bg-gray-50 border border-gray-200' : 'bg-[#272727] border border-[#3B3B3B]'}`}>
                                            <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={newPlaylistName}
                                                    onChange={(e) => {
                                                        setNewPlaylistName(e.target.value);
                                                        setError('');
                                                    }}
                                                    placeholder="Playlist name"
                                                    className={`flex-1 min-w-0 px-3 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1C1C1C] border-[#3B3B3B]'} focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
                                                    autoFocus
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleCreatePlaylist();
                                                        }
                                                    }}
                                                />
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={handleCreatePlaylist}
                                                        disabled={loading}
                                                        className="flex-1 sm:flex-none px-3 py-2 rounded-lg font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                                                    >
                                                        {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Create'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowCreateForm(false);
                                                            setNewPlaylistName('');
                                                            setError('');
                                                        }}
                                                        className={`flex-1 sm:flex-none px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                                                            theme === 'light'
                                                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                                : 'bg-[#2B2B2B] hover:bg-[#333] text-white'
                                                        }`}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                            {error && (
                                                <p className={`text-xs ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>
                                                    {error}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowCreateForm(true)}
                                            className={`w-full mb-3 p-2.5 rounded-lg border border-dashed transition-colors flex items-center justify-center gap-2 text-sm ${
                                                theme === 'light'
                                                    ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600'
                                                    : 'border-[#3B3B3B] hover:border-gray-500 hover:bg-[#272727] text-gray-400'
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="text-sm flex-shrink-0" />
                                            <span className="font-medium truncate">Create New Playlist</span>
                                        </button>
                                    )}

                                    {playlists.length === 0 && !showCreateForm ? (
                                        <div className="text-center py-6">
                                            <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                No playlists yet. Create one to get started!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1.5">
                                            {playlists.map((playlist) => {
                                                const isInPlaylist = isVideoInPlaylist(playlist);
                                                return (
                                                    <div
                                                        key={playlist._id}
                                                        onClick={() => handleToggleVideo(playlist._id)}
                                                        className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between gap-2 min-w-0 ${
                                                            isInPlaylist
                                                                ? theme === 'light'
                                                                    ? 'bg-blue-50 border-blue-200'
                                                                    : 'bg-blue-900/20 border-blue-800/40'
                                                                : theme === 'light'
                                                                    ? 'bg-white border-gray-200 hover:bg-gray-50'
                                                                    : 'bg-[#272727] border-[#3B3B3B] hover:bg-[#333]'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                            <div className={`w-4 h-4 flex-shrink-0 rounded border flex items-center justify-center ${
                                                                isInPlaylist
                                                                    ? 'bg-blue-600 border-blue-600'
                                                                    : theme === 'light'
                                                                        ? 'border-gray-300'
                                                                        : 'border-gray-500'
                                                            }`}>
                                                                {isInPlaylist && (
                                                                    <FontAwesomeIcon icon={faCheck} className="text-white text-[10px]" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">
                                                                    {playlist.name}
                                                                </p>
                                                                <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                    {playlist.videos?.length || 0} video{(playlist.videos?.length || 0) !== 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleDeletePlaylist(playlist, e)}
                                                            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                                                                theme === 'light'
                                                                    ? 'hover:bg-red-50 text-red-500'
                                                                    : 'hover:bg-red-900/20 text-red-400'
                                                            }`}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </MotionAnimate>
                    </div>
                )
            }
        </>
    )
}

export default PlaylistModal
