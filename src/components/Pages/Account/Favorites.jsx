import React, { useState, useEffect, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faHeart, faGamepad, faDiagramProject, faPlay, faEye, faThumbsUp, faClock, faSearch, faChevronLeft, faChevronRight, faExternalLink, faFilm, faBoxOpen } from '@fortawesome/free-solid-svg-icons'
import * as api from '../../../endpoint'

const Favorites = ({ user, theme }) => {
    const isLight = theme === 'light'
    const [activeTab, setActiveTab] = useState('posts')
    const [savedPosts, setSavedPosts] = useState([])
    const [likedVideos, setLikedVideos] = useState([])
    const [bookmarkedProjects, setBookmarkedProjects] = useState([])
    const [favoriteGames, setFavoriteGames] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const perPage = 12

    const tabs = [
        { id: 'posts', label: 'Saved Posts', icon: faBookmark, count: savedPosts.length },
        { id: 'videos', label: 'Liked Videos', icon: faPlay, count: likedVideos.length },
        { id: 'projects', label: 'Bookmarked Projects', icon: faDiagramProject, count: bookmarkedProjects.length },
        { id: 'games', label: 'Favorite Games', icon: faGamepad, count: favoriteGames.length },
    ]

    useEffect(() => {
        fetchAll()
    }, [])

    useEffect(() => { setPage(0) }, [activeTab, search])

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [postsRes, videosRes, projectsRes, gamesRes] = await Promise.allSettled([
                api.getSavedForumPosts({ limit: 100 }),
                api.getLikedVideos(),
                api.getBookmarkedProjects({ userId: user?._id }),
                api.getFavoriteGames({ userId: user?._id, populate: true }),
            ])
            if (postsRes.status === 'fulfilled') setSavedPosts(postsRes.value?.data?.result || [])
            if (videosRes.status === 'fulfilled') setLikedVideos(videosRes.value?.data?.result || [])
            if (projectsRes.status === 'fulfilled') setBookmarkedProjects(projectsRes.value?.data?.result || [])
            if (gamesRes.status === 'fulfilled') setFavoriteGames(gamesRes.value?.data?.result || [])
        } catch (err) {
            console.error(err)
        }
        setLoading(false)
    }

    const activeData = useMemo(() => {
        let data = []
        if (activeTab === 'posts') data = savedPosts
        else if (activeTab === 'videos') data = likedVideos
        else if (activeTab === 'projects') data = bookmarkedProjects
        else if (activeTab === 'games') data = favoriteGames

        if (search.trim()) {
            const q = search.toLowerCase()
            data = data.filter(item => {
                const title = (item.title || item.name || '').toLowerCase()
                const author = (item.author?.username || item.user?.username || '').toLowerCase()
                return title.includes(q) || author.includes(q)
            })
        }
        return data
    }, [activeTab, savedPosts, likedVideos, bookmarkedProjects, favoriteGames, search])

    const paginatedData = useMemo(() => activeData.slice(page * perPage, (page + 1) * perPage), [activeData, page])
    const totalPages = Math.ceil(activeData.length / perPage)

    const formatDate = (d) => {
        if (!d) return '—'
        const date = new Date(d)
        const now = new Date()
        const diff = now - date
        if (diff < 60000) return 'Just now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
    }

    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60' : 'bg-[#141414] border-[#1f1f1f]'}`

    const renderPostCard = (post) => (
        <a key={post._id} href={`/forum/post/${post._id}`} className={`block rounded-xl border p-4 transition-all hover:shadow-md ${isLight ? 'bg-white border-slate-200/60 hover:border-slate-300' : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]'}`}>
            <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-gray-100'}`}>{post.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                        {post.community?.icon && <img src={post.community.icon} className="w-4 h-4 rounded" alt="" />}
                        <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{post.community?.name || 'Unknown'}</span>
                        <span className={`text-[11px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>·</span>
                        <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>by {post.author?.username || 'deleted'}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#222] text-gray-400'}`}>
                            <FontAwesomeIcon icon={faThumbsUp} className="mr-1" />{post.upvotes || 0}
                        </span>
                        <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                            <FontAwesomeIcon icon={faClock} className="mr-1" />{formatDate(post.createdAt)}
                        </span>
                    </div>
                </div>
                {post.image && <img src={post.image} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" alt="" />}
            </div>
        </a>
    )

    const renderVideoCard = (video) => (
        <a key={video._id} href={`/watch/${video._id}`} className={`block rounded-xl border overflow-hidden transition-all hover:shadow-md ${isLight ? 'bg-white border-slate-200/60 hover:border-slate-300' : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]'}`}>
            <div className="relative aspect-video bg-black/10">
                {video.thumbnail ? <img src={video.thumbnail} className="w-full h-full object-cover" alt="" /> : <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`}><FontAwesomeIcon icon={faFilm} className={`text-2xl ${isLight ? 'text-slate-300' : 'text-gray-600'}`} /></div>}
                {video.duration && <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">{video.duration}</span>}
            </div>
            <div className="p-3">
                <h4 className={`text-xs font-semibold line-clamp-2 ${isLight ? 'text-slate-800' : 'text-gray-100'}`}>{video.title || 'Untitled'}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{video.user?.username || 'Unknown'}</span>
                    <span className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>·</span>
                    <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}><FontAwesomeIcon icon={faEye} className="mr-0.5" />{Array.isArray(video.views) ? video.views.length : 0}</span>
                </div>
            </div>
        </a>
    )

    const renderProjectCard = (project) => (
        <a key={project._id} href={`/projects/${project._id}`} className={`block rounded-xl border p-4 transition-all hover:shadow-md ${isLight ? 'bg-white border-slate-200/60 hover:border-slate-300' : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]'}`}>
            <div className="flex gap-3">
                {project.image && <img src={project.image} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />}
                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-gray-100'}`}>{project.title || project.name || 'Untitled'}</h4>
                    <p className={`text-[11px] mt-0.5 line-clamp-2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{project.description || 'No description'}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>by {project.user?.username || 'Unknown'}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#222] text-gray-400'}`}>
                            <FontAwesomeIcon icon={faThumbsUp} className="mr-1" />{Array.isArray(project.likes) ? project.likes.length : 0}
                        </span>
                    </div>
                </div>
            </div>
        </a>
    )

    const renderGameCard = (game) => (
        <a key={game._id} href={`/games/${game._id}`} className={`block rounded-xl border overflow-hidden transition-all hover:shadow-md ${isLight ? 'bg-white border-slate-200/60 hover:border-slate-300' : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]'}`}>
            <div className="relative aspect-[16/9]">
                {game.thumbnail ? <img src={game.thumbnail} className="w-full h-full object-cover" alt="" /> : <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`}><FontAwesomeIcon icon={faGamepad} className={`text-2xl ${isLight ? 'text-slate-300' : 'text-gray-600'}`} /></div>}
            </div>
            <div className="p-3">
                <h4 className={`text-xs font-semibold line-clamp-2 ${isLight ? 'text-slate-800' : 'text-gray-100'}`}>{game.title || game.name || 'Untitled'}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{game.user?.username || 'Unknown'}</span>
                    <span className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>·</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#222] text-gray-400'}`}>
                        <FontAwesomeIcon icon={faHeart} className="mr-1" />{Array.isArray(game.likes) ? game.likes.length : 0}
                    </span>
                </div>
            </div>
        </a>
    )

    const renderContent = () => {
        if (loading) {
            return (
                <div className={`grid ${activeTab === 'videos' || activeTab === 'games' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className={`rounded-xl border animate-pulse ${isLight ? 'bg-white border-slate-200/60' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`}>
                            <div className={`${activeTab === 'videos' || activeTab === 'games' ? 'aspect-video' : 'h-24'} rounded-t-xl ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`} />
                            <div className="p-3 space-y-2">
                                <div className={`h-3.5 w-3/4 rounded ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`} />
                                <div className={`h-2.5 w-1/2 rounded ${isLight ? 'bg-slate-50' : 'bg-[#1c1c1c]'}`} />
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        if (paginatedData.length === 0) {
            const emptyIcon = activeTab === 'posts' ? faBookmark : activeTab === 'videos' ? faPlay : activeTab === 'projects' ? faDiagramProject : faGamepad
            const emptyMsg = activeTab === 'posts' ? 'No saved posts yet' : activeTab === 'videos' ? 'No liked videos yet' : activeTab === 'projects' ? 'No bookmarked projects yet' : 'No favorite games yet'
            const emptyHint = search ? 'Try a different search term' : activeTab === 'posts' ? 'Save forum posts to find them here later' : activeTab === 'videos' ? 'Like videos to add them to your favorites' : activeTab === 'projects' ? 'Bookmark projects to access them quickly' : 'Mark games as favorites to see them here'
            return (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#1c1c1c]'}`}>
                        <FontAwesomeIcon icon={emptyIcon} className={`text-xl ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                    </div>
                    <p className={`text-sm font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{emptyMsg}</p>
                    <p className={`text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{emptyHint}</p>
                </div>
            )
        }

        if (activeTab === 'posts') return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{paginatedData.map(renderPostCard)}</div>
        if (activeTab === 'videos') return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{paginatedData.map(renderVideoCard)}</div>
        if (activeTab === 'projects') return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{paginatedData.map(renderProjectCard)}</div>
        if (activeTab === 'games') return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{paginatedData.map(renderGameCard)}</div>
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className={`${panelClass} p-5`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isLight ? 'bg-gradient-to-br from-rose-50 to-pink-50' : 'bg-gradient-to-br from-rose-900/20 to-pink-900/20'}`}>
                            <FontAwesomeIcon icon={faHeart} className={`text-sm ${isLight ? 'text-rose-500' : 'text-rose-400'}`} />
                        </div>
                        <div>
                            <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-gray-100'}`}>Favorites</h2>
                            <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{savedPosts.length + likedVideos.length + bookmarkedProjects.length + favoriteGames.length} items saved</p>
                        </div>
                    </div>
                    <div className={`flex items-center rounded-lg border overflow-hidden ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`}>
                        <FontAwesomeIcon icon={faSearch} className={`text-[10px] ml-3 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search favorites..." className={`text-xs px-2 py-2 w-40 bg-transparent outline-none ${isLight ? 'text-slate-700 placeholder:text-slate-300' : 'text-gray-200 placeholder:text-gray-600'}`} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={`${panelClass} px-4 py-2.5 flex items-center gap-1 overflow-x-auto`}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? (isLight ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#222]')}`}>
                        <FontAwesomeIcon icon={tab.icon} className="text-[10px]" />
                        {tab.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? (isLight ? 'bg-white/20 text-white' : 'bg-black/10 text-gray-700') : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#2a2a2a] text-gray-500')}`}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className={`${panelClass} p-5`}>
                {!loading && activeData.length > 0 && (
                    <div className={`flex items-center justify-between mb-4 pb-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                        <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                            Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, activeData.length)} of {activeData.length}
                        </p>
                    </div>
                )}
                {renderContent()}
                {totalPages > 1 && (
                    <div className={`flex items-center justify-center gap-1 mt-5 pt-4 border-t ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${page === 0 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#222] text-gray-400')}`}><FontAwesomeIcon icon={faChevronLeft} /></button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pn = totalPages <= 5 ? i : Math.min(Math.max(page - 2, 0), totalPages - 5) + i
                            return <button key={pn} onClick={() => setPage(pn)} className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all ${page === pn ? (isLight ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-600 text-white') : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#222]')}`}>{pn + 1}</button>
                        })}
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${page === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#222] text-gray-400')}`}><FontAwesomeIcon icon={faChevronRight} /></button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Favorites
