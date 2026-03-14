import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getOrCreateConversation } from '../../actions/chat'
import { main, dark, light } from '../../style'
import styles from '../../style'
import * as api from '../../endpoint'

import Avatar from '../Custom/Avatar'
import Pagination from '../Custom/Pagination'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCalendarDays, faListUl, faPlayCircle, faEye, faArrowLeft, faUserSlash, faUser, faUsers, faQuoteLeft, faIdBadge, faShieldHalved, faEnvelope, faBan } from '@fortawesome/free-solid-svg-icons'

const Profile = ({ theme }) => {
    const { username, tab } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const currentUser = JSON.parse(localStorage.getItem('profile'))
    const isOwnProfile = currentUser?.username === username

    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [activePlaylist, setActivePlaylist] = useState(null)
    const [videoPage, setVideoPage] = useState(null)

    const isLight = theme === 'light'
    const activeTab = tab || 'profile'
    const VIDEOS_PER_PAGE = 8

    useEffect(() => {
        if (!username) return
        setLoading(true)
        setNotFound(false)
        api.getPublicProfile(username)
            .then(res => {
                setProfile(res.data.result)
                setLoading(false)
            })
            .catch(() => {
                setNotFound(true)
                setLoading(false)
            })
    }, [username])

    useEffect(() => {
        setActivePlaylist(null)
        setVideoPage(null)
    }, [activeTab])

    const roleBadge = {
        Admin: isLight ? 'bg-red-100 text-red-600 border-red-200' : 'bg-red-900/30 text-red-400 border-red-800/50',
        Moderator: isLight ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-amber-900/30 text-amber-400 border-amber-800/50',
        User: isLight ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-blue-900/30 text-blue-400 border-blue-800/50',
    }

    const menuItems = [
        { name: 'Profile', icon: faUser, path: 'profile' },
        { name: 'Playlists', icon: faListUl, path: 'playlists' },
    ]

    const fullName = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') : ''
    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : ''

    const videoStartIndex = videoPage ? videoPage.start : 0
    const videoEndIndex = videoPage ? videoPage.end : VIDEOS_PER_PAGE

    const outerWrap = `relative overflow-hidden ${main.font} ${isLight ? light.body : dark.body}`

    if (loading) {
        return (
            <div className={outerWrap}>
                <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className="my-12 space-y-4">
                            <div className={`rounded-xl overflow-hidden border ${isLight ? 'border-blue-200/60' : 'border-[#2B2B2B]'}`}>
                                <div className={`h-20 ${isLight ? 'bg-gradient-to-r from-blue-200 to-sky-200' : 'bg-gradient-to-r from-[#1C1C1C] to-[#2B2B2B]'} animate-pulse`} />
                                <div className={`px-6 pb-5 ${isLight ? 'bg-white/90' : 'bg-[#0e0e0e]'}`}>
                                    <div className="flex items-start gap-5 -mt-8">
                                        <div className={`w-28 h-28 rounded-full ${isLight ? 'bg-blue-100' : 'bg-[#2B2B2B]'} animate-pulse ring-4 ${isLight ? 'ring-white' : 'ring-[#0e0e0e]'}`} />
                                        <div className="flex-1 pt-12 space-y-3">
                                            <div className={`h-5 w-40 rounded ${isLight ? 'bg-blue-100' : 'bg-[#2B2B2B]'} animate-pulse`} />
                                            <div className={`h-3 w-60 rounded ${isLight ? 'bg-blue-50' : 'bg-[#1C1C1C]'} animate-pulse`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:flex gap-4">
                                <div className={`md:w-64 w-full h-24 rounded-xl ${isLight ? 'bg-white/60' : 'bg-[#1C1C1C]'} animate-pulse border ${isLight ? 'border-blue-200/60' : 'border-[#2B2B2B]'}`} />
                                <div className={`flex-1 h-48 rounded-xl mt-4 md:mt-0 ${isLight ? 'bg-white/60' : 'bg-[#1C1C1C]'} animate-pulse border ${isLight ? 'border-blue-200/60' : 'border-[#2B2B2B]'}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (notFound) {
        return (
            <div className={outerWrap}>
                <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className="my-12 flex flex-col items-center justify-center py-24">
                            <FontAwesomeIcon icon={faUserSlash} className={`text-5xl mb-4 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                            <h1 className={`text-2xl font-semibold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>User not found</h1>
                            <p className={`text-sm mb-6 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>The user "{username}" doesn't exist or has been removed.</p>
                            <button
                                onClick={() => navigate('/')}
                                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                                    isLight ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const role = profile?.role || 'User'
    const isBanned = !!profile?.ban

    const getBanDuration = () => {
        if (!profile?.ban) return null
        if (profile.ban.permanent) return 'Permanent'
        if (profile.ban.expiresAt) {
            const remaining = new Date(profile.ban.expiresAt) - new Date()
            if (remaining <= 0) return null
            const days = Math.ceil(remaining / (1000 * 60 * 60 * 24))
            if (days >= 30) return `${Math.floor(days / 30)}mo left`
            return `${days}d left`
        }
        return null
    }

    const banDuration = getBanDuration()

    const renderProfileTab = () => (
        <div className="space-y-5">
            {/* Bio Card */}
            {profile.bio && (
                <div className={`rounded-xl p-4 border ${
                    isLight
                        ? 'bg-gradient-to-br from-blue-50/30 to-sky-50/30 border-blue-200/40'
                        : 'bg-[#1C1C1C] border-[#2B2B2B]'
                }`}>
                    <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon icon={faQuoteLeft} className={`text-sm ${isLight ? 'text-blue-400' : 'text-blue-500'}`} />
                        <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Bio</p>
                    </div>
                    <pre className={`text-sm whitespace-pre-wrap break-words font-[inherit] m-0 p-0 leading-relaxed ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{profile.bio}</pre>
                </div>
            )}

            {/* Details */}
            <div className={`rounded-xl border overflow-hidden ${
                isLight ? 'border-blue-200/40' : 'border-[#2B2B2B]'
            }`}>
                <div className={`px-4 py-3 ${isLight ? 'bg-blue-50/50' : 'bg-[#1C1C1C]'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Details</p>
                </div>
                <div className={`divide-y ${isLight ? 'divide-blue-100/60' : 'divide-[#2B2B2B]'}`}>
                    {[
                        ...(fullName ? [{ label: 'Full Name', value: fullName, icon: faIdBadge }] : []),
                        { label: 'Username', value: profile.username, icon: faUser },
                        { label: 'Role', value: role, icon: faShieldHalved,
                          valueClass: role === 'Admin' ? (isLight ? 'text-red-600' : 'text-red-400') : role === 'Moderator' ? (isLight ? 'text-amber-600' : 'text-amber-400') : undefined },
                        { label: 'Status', value: isBanned ? `Banned${banDuration ? ` (${banDuration})` : ''}` : 'Active', icon: faBan,
                          valueClass: isBanned ? (isLight ? 'text-red-600' : 'text-red-400') : (isLight ? 'text-emerald-600' : 'text-emerald-400') },
                        { label: 'Subscribers', value: profile.subscribers, icon: faUsers },
                        { label: 'Public Playlists', value: profile.playlists?.length || 0, icon: faPlayCircle },
                        { label: 'Member Since', value: memberSince || '—', icon: faCalendarDays },
                        { label: 'Verified', value: profile.verified ? 'Verified' : 'Unverified', icon: faCircleCheck,
                          valueClass: profile.verified ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : (isLight ? 'text-slate-400' : 'text-gray-600') },
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 px-4 py-3 ${isLight ? 'hover:bg-blue-50/30' : 'hover:bg-[#1C1C1C]'} transition-colors`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isLight ? 'bg-blue-100/80 text-blue-500' : 'bg-blue-900/20 text-blue-400'
                            }`}>
                                <FontAwesomeIcon icon={item.icon} className="text-xs" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-[11px] font-medium ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{item.label}</p>
                                <p className={`text-sm font-medium truncate ${item.valueClass || (isLight ? 'text-slate-800' : 'text-gray-200')}`}>{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderPlaylistsTab = () => {
        if (activePlaylist) {
            return (
                <>
                    <div className="mb-5">
                        <button
                            onClick={() => { setActivePlaylist(null); setVideoPage(null) }}
                            className={`flex items-center gap-2 text-sm font-medium mb-4 transition-all ${
                                isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
                            }`}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                            Back to Playlists
                        </button>
                        <h2 className={`text-lg font-semibold ${isLight ? light.heading : dark.heading}`}>
                            {activePlaylist.name}
                        </h2>
                        {activePlaylist.description && (
                            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{activePlaylist.description}</p>
                        )}
                        <p className={`text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                            {activePlaylist.videos.length} video{activePlaylist.videos.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {activePlaylist.videos.length === 0 ? (
                        <div className={`text-center py-12 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                            <FontAwesomeIcon icon={faPlayCircle} className="text-3xl mb-2" />
                            <p className="text-sm">No videos in this playlist</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {activePlaylist.videos.slice(videoStartIndex, videoEndIndex).map(video => (
                                    <div
                                        key={video._id}
                                        onClick={() => navigate(`/watch/${video._id}`)}
                                        className={`rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] border ${
                                            isLight ? 'bg-white border-blue-200/60 hover:shadow-md' : 'bg-[#1C1C1C] border-[#2B2B2B] hover:shadow-lg'
                                        }`}
                                    >
                                        <div className="aspect-video bg-black/10">
                                            {video.thumbnail ? (
                                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-blue-50' : 'bg-[#2B2B2B]'}`}>
                                                    <FontAwesomeIcon icon={faPlayCircle} className={`text-2xl ${isLight ? 'text-blue-300' : 'text-gray-600'}`} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2.5">
                                            <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{video.title}</p>
                                            <p className={`text-[10px] mt-1 flex items-center gap-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                                <FontAwesomeIcon icon={faEye} />
                                                {video.views?.length || 0} views
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {activePlaylist.videos.length > VIDEOS_PER_PAGE && (
                                <div className="mt-4 flex justify-center">
                                    <Pagination
                                        data={activePlaylist.videos}
                                        theme={theme}
                                        limit={VIDEOS_PER_PAGE}
                                        setPagination={setVideoPage}
                                        numberOnly={true}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </>
            )
        }

        return (
            <>
                <div className="flex items-center gap-2 mb-5">
                    <h2 className={`text-lg font-semibold ${isLight ? light.heading : dark.heading}`}>
                        Public Playlists
                    </h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400'}`}>
                        {profile.playlists.length}
                    </span>
                </div>

                {profile.playlists.length === 0 ? (
                    <div className={`text-center py-16 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                        <FontAwesomeIcon icon={faListUl} className="text-4xl mb-3" />
                        <p className="text-sm">No public playlists yet</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {profile.playlists.map(playlist => (
                            <div
                                key={playlist._id}
                                onClick={() => { setActivePlaylist(playlist); setVideoPage(null) }}
                                className={`rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] border ${
                                    isLight
                                        ? 'bg-gradient-to-br from-blue-50/50 to-sky-50/50 border-blue-200/60 hover:shadow-md hover:border-blue-300/80'
                                        : 'bg-[#1C1C1C] border-[#2B2B2B] hover:border-[#3B3B3B] hover:shadow-lg'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        isLight ? 'bg-blue-100 text-blue-500' : 'bg-blue-900/30 text-blue-400'
                                    }`}>
                                        <FontAwesomeIcon icon={faPlayCircle} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{playlist.name}</p>
                                        {playlist.description && (
                                            <p className={`text-xs mt-0.5 truncate ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{playlist.description}</p>
                                        )}
                                        <p className={`text-[11px] mt-1.5 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                            {playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )
    }

    return (
        <div className={outerWrap}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="my-12 space-y-4">

                        {/* Profile Header */}
                        <div className={`rounded-xl overflow-hidden border border-solid ${isLight ? 'border-blue-200/60' : 'border-[#2B2B2B]'} ${isLight ? 'bg-white/90 backdrop-blur-sm' : 'bg-[#0e0e0e]'}`}>
                            <div className={`h-20 ${isLight ? 'bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'}`} />
                            <div className="px-6 pb-5 -mt-8">
                                <div className="flex items-start gap-5">
                                    <div className={`flex-shrink-0 rounded-full ring-4 ${isLight ? 'ring-white' : 'ring-[#0e0e0e]'}`}>
                                        <Avatar theme={theme} image={profile.avatar} size={28} />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-12">
                                        <div className="flex items-center justify-between flex-wrap gap-y-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h1 className={`text-sm font-semibold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                        {profile.username}
                                                    </h1>
                                                    {profile.verified && (
                                                        <FontAwesomeIcon icon={faCircleCheck} className="text-blue-500 text-sm" title="Verified" />
                                                    )}
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadge[role]}`}>
                                                        {role}
                                                    </span>
                                                    {isBanned && (
                                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                                            isLight ? 'bg-red-100 text-red-600 border-red-200' : 'bg-red-900/30 text-red-400 border-red-800/50'
                                                        }`}>
                                                            <FontAwesomeIcon icon={faBan} className="text-[8px]" />
                                                            Banned
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                    {fullName || '—'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`flex items-center gap-1.5 text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                                    <span className={`font-bold text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                                        {profile.subscribers}
                                                    </span>
                                                    <span>Subscribers</span>
                                                </div>
                                                {currentUser && !isOwnProfile && (
                                                    <button
                                                        onClick={() => {
                                                            dispatch(getOrCreateConversation({ targetUserId: profile._id }))
                                                                .unwrap()
                                                                .then(() => {
                                                                    window.dispatchEvent(new Event('open-chat-widget'))
                                                                })
                                                        }}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                            isLight
                                                                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                    >
                                                        <FontAwesomeIcon icon={faEnvelope} className="text-[10px]" />
                                                        Message
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {profile.bio && (
                                            <pre className={`mt-2 text-sm whitespace-pre-wrap break-words font-[inherit] m-0 p-0 leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{profile.bio}</pre>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar + Content */}
                        <div className="w-full md:flex items-start gap-4">
                            {/* Sidebar */}
                            <div className="md:w-64 w-full flex-shrink-0">
                                <div className={`rounded-xl overflow-hidden border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                                    <nav>
                                        <ul className="py-1.5">
                                            {menuItems.map((item) => {
                                                const isActive = activeTab === item.path
                                                return (
                                                    <li key={item.path}>
                                                        <div
                                                            className={`mx-1.5 my-0.5 px-4 py-2.5 rounded-lg flex items-center cursor-pointer transition-all duration-200 ${
                                                                isActive
                                                                    ? (isLight
                                                                        ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-sm'
                                                                        : 'bg-blue-600 text-white')
                                                                    : (isLight
                                                                        ? 'text-slate-700 hover:bg-blue-50/80'
                                                                        : 'text-gray-300 hover:bg-[#1C1C1C]')
                                                            }`}
                                                            onClick={() => navigate(`/user/${username}${item.path === 'profile' ? '' : `/${item.path}`}`)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <FontAwesomeIcon
                                                                    icon={item.icon}
                                                                    className={`text-sm w-4 ${isActive ? 'text-white' : (isLight ? 'text-blue-500' : 'text-gray-500')}`}
                                                                />
                                                                <span className="text-sm font-medium">{item.name}</span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </nav>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className={`w-full mt-4 md:mt-0 px-6 py-4 pb-5 rounded-xl border border-solid ${
                                isLight
                                    ? 'bg-white/90 backdrop-blur-sm border-blue-200/60'
                                    : 'bg-[#0e0e0e] border-[#2B2B2B]'
                            } ${isLight ? light.color : dark.color}`}>
                                {activeTab === 'playlists' ? renderPlaylistsTab() : renderProfileTab()}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
