import React, { useState, useEffect } from 'react'
import { dark, light } from '../../style';
import { faClose, faPlus, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MotionAnimate } from 'react-motion-animate';

const PlaylistModal = ({ theme, openModal, setOpenModal, videoId, videoData }) => {
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [error, setError] = useState('');

    // Load playlists from localStorage
    useEffect(() => {
        const savedPlaylists = localStorage.getItem('userPlaylists');
        if (savedPlaylists) {
            try {
                setPlaylists(JSON.parse(savedPlaylists));
            } catch (e) {
                console.error('Error loading playlists:', e);
                setPlaylists([]);
            }
        }
    }, [openModal]);

    // Save playlists to localStorage
    const savePlaylists = (updatedPlaylists) => {
        localStorage.setItem('userPlaylists', JSON.stringify(updatedPlaylists));
        setPlaylists(updatedPlaylists);
    };

    // Check if video is in playlist
    const isVideoInPlaylist = (playlistId) => {
        const playlist = playlists.find(p => p.id === playlistId);
        return playlist && playlist.videos && playlist.videos.includes(videoId);
    };

    // Toggle video in playlist
    const toggleVideoInPlaylist = (playlistId) => {
        const updatedPlaylists = playlists.map(playlist => {
            if (playlist.id === playlistId) {
                const videos = playlist.videos || [];
                if (videos.includes(videoId)) {
                    // Remove video
                    return {
                        ...playlist,
                        videos: videos.filter(id => id !== videoId)
                    };
                } else {
                    // Add video
                    return {
                        ...playlist,
                        videos: [...videos, videoId]
                    };
                }
            }
            return playlist;
        });
        savePlaylists(updatedPlaylists);
    };

    // Create new playlist
    const createPlaylist = () => {
        if (!newPlaylistName.trim()) {
            setError('Playlist name cannot be empty');
            return;
        }

        if (playlists.some(p => p.name.toLowerCase() === newPlaylistName.trim().toLowerCase())) {
            setError('A playlist with this name already exists');
            return;
        }

        const newPlaylist = {
            id: Date.now().toString(),
            name: newPlaylistName.trim(),
            videos: [videoId],
            createdAt: new Date().toISOString()
        };

        const updatedPlaylists = [...playlists, newPlaylist];
        savePlaylists(updatedPlaylists);
        setNewPlaylistName('');
        setShowCreateForm(false);
        setError('');
    };

    // Delete playlist
    const deletePlaylist = (playlistId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this playlist?')) {
            const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
            savePlaylists(updatedPlaylists);
        }
    };

    const closeModal = () => {
        setOpenModal(false);
        setShowCreateForm(false);
        setNewPlaylistName('');
        setError('');
    };

    return (
        <>
            {/* Backdrop */}
            {openModal && (
                <div className="fixed inset-0 bg-black opacity-90 z-[100]" onClick={closeModal}></div>
            )}
            {
                openModal && (
                    <div
                        className="flex items-center justify-center scrollbar-hide w-full fixed inset-0 z-[100] p-5 sm:p-6 md:p-8"
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
                                className={`w-[90vw] sm:w-[420px] md:w-[520px] lg:w-[560px] rounded-xl shadow-lg relative flex flex-col max-h-[85vh] sm:max-h-[90vh] ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className={`flex items-center justify-between p-4 sm:p-5 py-3 sm:py-4 border-b flex-shrink-0 ${theme === 'light' ? 'border-blue-200/60' : 'border-gray-700/60'}`}>
                                    <h3 className="text-lg sm:text-xl font-bold truncate pr-2">
                                        Add to Playlist
                                    </h3>
                                    <button
                                        className={`text-base p-2 rounded-lg hover:bg-opacity-50 transition-colors ${theme === 'light' ? light.icon + ' hover:bg-gray-100' : dark.icon + ' hover:bg-gray-800'}`}
                                        onClick={closeModal}
                                    >
                                        <FontAwesomeIcon icon={faClose} />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-4 sm:p-5 pb-5 sm:pb-6 overflow-y-auto min-h-0 flex-1">
                                    {/* Create New Playlist Form */}
                                    {showCreateForm ? (
                                        <div className={`mb-4 p-3 sm:p-4 rounded-lg ${theme === 'light' ? 'bg-blue-50/50 border border-blue-200' : 'bg-gray-800/30 border border-gray-700'}`}>
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mb-3">
                                                <input
                                                    type="text"
                                                    value={newPlaylistName}
                                                    onChange={(e) => {
                                                        setNewPlaylistName(e.target.value);
                                                        setError('');
                                                    }}
                                                    placeholder="Playlist name"
                                                    className={`flex-1 min-w-0 px-3 py-2 rounded-lg border text-base ${theme === 'light' ? 'bg-white border-blue-200' : 'bg-gray-800 border-gray-700'} focus:outline-none focus:ring-2 ${theme === 'light' ? 'focus:ring-blue-500' : 'focus:ring-blue-400'}`}
                                                    autoFocus
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            createPlaylist();
                                                        }
                                                    }}
                                                />
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={createPlaylist}
                                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold transition-all ${
                                                            theme === 'light'
                                                                ? 'bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white'
                                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                        }`}
                                                    >
                                                        Create
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowCreateForm(false);
                                                            setNewPlaylistName('');
                                                            setError('');
                                                        }}
                                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold transition-all ${
                                                            theme === 'light'
                                                                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                                                        }`}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                            {error && (
                                                <p className={`text-sm ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>
                                                    {error}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowCreateForm(true)}
                                            className={`w-full mb-4 p-3 sm:p-3.5 rounded-lg border-2 border-dashed transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                                                theme === 'light'
                                                    ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50/50 text-blue-600'
                                                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 text-gray-400'
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="flex-shrink-0" />
                                            <span className="font-semibold truncate">Create New Playlist</span>
                                        </button>
                                    )}

                                    {/* Playlists List */}
                                    {playlists.length === 0 && !showCreateForm ? (
                                        <div className="text-center py-8">
                                            <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                                No playlists yet. Create one to get started!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {playlists.map((playlist) => {
                                                const isInPlaylist = isVideoInPlaylist(playlist.id);
                                                return (
                                                    <div
                                                        key={playlist.id}
                                                        onClick={() => toggleVideoInPlaylist(playlist.id)}
                                                        className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between gap-2 min-w-0 ${
                                                            isInPlaylist
                                                                ? theme === 'light'
                                                                    ? 'bg-blue-100/50 border-blue-400'
                                                                    : 'bg-blue-900/30 border-blue-500'
                                                                : theme === 'light'
                                                                    ? 'bg-white/50 border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                                                                    : 'bg-gray-800/30 border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center ${
                                                                isInPlaylist
                                                                    ? theme === 'light'
                                                                        ? 'bg-blue-500 border-blue-500'
                                                                        : 'bg-blue-500 border-blue-500'
                                                                    : theme === 'light'
                                                                        ? 'border-gray-300'
                                                                        : 'border-gray-600'
                                                            }`}>
                                                                {isInPlaylist && (
                                                                    <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-semibold truncate ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                                                    {playlist.name}
                                                                </p>
                                                                <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                    {playlist.videos?.length || 0} video{(playlist.videos?.length || 0) !== 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => deletePlaylist(playlist.id, e)}
                                                            className={`p-2 rounded-lg hover:bg-opacity-50 transition-colors flex-shrink-0 ${
                                                                theme === 'light'
                                                                    ? 'hover:bg-red-100 text-red-600'
                                                                    : 'hover:bg-red-900/30 text-red-400'
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
