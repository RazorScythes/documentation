import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { io as socketIO } from 'socket.io-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments, faChevronLeft, faChevronRight, faPlus, faFire, faTags, faGlobe, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { getFeed, getPosts, getForumTags, votePost } from '../../../actions/forum'
import { getCommunities } from '../../../actions/community'
import { getCommunities as fetchCommunities } from '../../../endpoint'
import PostCard from '../../Forum/PostCard'
import PostSortBar from '../../Forum/PostSortBar'
import ForumTagPill from '../../Forum/ForumTagPill'

const socketUrl = import.meta.env.VITE_DEVELOPMENT == 'true'
    ? `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`
    : import.meta.env.VITE_APP_BASE_URL

const ForumHome = ({ user, theme }) => {
    const dispatch = useDispatch()
    const isLight = theme === 'light'
    const { feed, posts, pagination, isLoading } = useSelector(s => s.forum)
    const { data: communities } = useSelector(s => s.community)
    const tags = useSelector(s => s.forum.tags)

    const [sort, setSort] = useState('new')
    const [page, setPage] = useState(1)
    const [joinedCommunities, setJoinedCommunities] = useState([])
    const [newPostBadges, setNewPostBadges] = useState({})
    const joinedIdsRef = useRef([])

    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`
    const muted = isLight ? 'text-slate-500' : 'text-gray-500'
    const textPrimary = isLight ? 'text-slate-900' : 'text-white'
    const borderSub = isLight ? 'border-slate-200' : 'border-[#2a2a2a]'

    useEffect(() => {
        if (user) dispatch(getFeed({ page, sort, limit: 15 }))
        else dispatch(getPosts({ page, sort, limit: 15 }))
    }, [user, dispatch, sort, page])

    useEffect(() => {
        dispatch(getCommunities({ sort: 'popular', limit: 5 }))
        dispatch(getForumTags())
    }, [dispatch, user])

    useEffect(() => {
        if (!user) { setJoinedCommunities([]); return }
        fetchCommunities({ joined: true, limit: 50 })
            .then(res => setJoinedCommunities(res?.data?.result || []))
            .catch(() => setJoinedCommunities([]))
    }, [user])

    useEffect(() => {
        joinedIdsRef.current = joinedCommunities.map(c => c._id)
    }, [joinedCommunities])

    useEffect(() => {
        if (!user || joinedCommunities.length === 0) return
        const socket = socketIO(socketUrl, { transports: ['websocket', 'polling'] })
        const ids = joinedCommunities.map(c => c._id)
        ids.forEach(id => socket.emit('join_community', id))

        socket.on('new_forum_post', (post) => {
            const cid = typeof post?.community === 'string' ? post.community : post?.community?._id
            if (cid && joinedIdsRef.current.includes(cid)) {
                setNewPostBadges(prev => ({ ...prev, [cid]: (prev[cid] || 0) + 1 }))
            }
        })

        return () => {
            ids.forEach(id => socket.emit('leave_community', id))
            socket.disconnect()
        }
    }, [user, joinedCommunities])

    const items = user ? feed : posts

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
            <header className="mb-5 sm:mb-6">
                <div className="flex items-start gap-3">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${isLight ? 'border-slate-200 bg-slate-50 text-indigo-600' : 'border-[#2a2a2a] bg-[#222] text-indigo-400'}`}
                    >
                        <FontAwesomeIcon icon={faComments} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <h1 className={`text-xl font-semibold tracking-tight sm:text-2xl ${textPrimary}`}>
                            Forum
                        </h1>
                        <p className={`mt-0.5 text-sm ${muted}`}>
                            Posts from communities{user ? ' you follow' : ' — sign in to personalize your feed'}.
                        </p>
                    </div>
                </div>
            </header>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
                <div className="min-w-0 flex-1 space-y-4">
                    <div className={`${panelClass} p-2.5 sm:p-3`}>
                        <PostSortBar
                            active={sort}
                            onChange={s => { setSort(s); setPage(1) }}
                            theme={theme}
                        />
                    </div>

                    {isLoading ? (
                        <div className={`${panelClass} flex flex-col items-center justify-center py-20`}>
                            <div
                                className={`h-9 w-9 animate-spin rounded-full border-2 border-t-transparent ${isLight ? 'border-indigo-600' : 'border-indigo-500'}`}
                            />
                            <p className={`mt-4 text-sm ${muted}`}>Loading posts…</p>
                        </div>
                    ) : items?.length > 0 ? (
                        <ul className="space-y-2.5" role="list">
                            {items.map(post => (
                                <li key={post._id}>
                                    <PostCard
                                        post={post}
                                        theme={theme}
                                        user={user}
                                        onVote={(id, v) => dispatch(votePost({ id, value: v }))}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={`${panelClass} px-4 py-10 sm:px-6 sm:py-12`}>
                            <p className={`text-center text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                Nothing here yet
                            </p>
                            <p className={`mx-auto mt-1 max-w-sm text-center text-sm ${muted}`}>
                                {user
                                    ? 'Join communities to see their posts in your feed.'
                                    : 'Browse communities or check back for new posts.'}
                            </p>
                        </div>
                    )}

                    {pagination?.pages > 1 && (
                        <div className="flex items-center justify-center gap-1 pt-1">
                            <button
                                type="button"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs ${
                                    page === 1
                                        ? 'cursor-not-allowed opacity-35'
                                        : isLight
                                            ? 'text-slate-600 hover:bg-slate-100'
                                            : 'text-gray-400 hover:bg-[#2a2a2a]'
                                }`}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                                const pn = pagination.pages <= 5
                                    ? i + 1
                                    : Math.min(Math.max(page - 2, 1), pagination.pages - 4) + i
                                return (
                                    <button
                                        type="button"
                                        key={pn}
                                        onClick={() => setPage(pn)}
                                        className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg text-xs font-medium ${
                                            page === pn
                                                ? isLight
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-indigo-500 text-white'
                                                : isLight
                                                    ? 'text-slate-600 hover:bg-slate-100'
                                                    : 'text-gray-400 hover:bg-[#2a2a2a]'
                                        }`}
                                    >
                                        {pn}
                                    </button>
                                )
                            })}
                            <button
                                type="button"
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs ${
                                    page === pagination.pages
                                        ? 'cursor-not-allowed opacity-35'
                                        : isLight
                                            ? 'text-slate-600 hover:bg-slate-100'
                                            : 'text-gray-400 hover:bg-[#2a2a2a]'
                                }`}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    )}
                </div>

                <aside className="hidden w-full shrink-0 space-y-4 lg:sticky lg:top-4 lg:block lg:w-72 xl:w-80">
                    <div className="flex flex-col gap-2">
                        <Link
                            to="/forum/communities"
                            className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                                isLight
                                    ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'
                                    : 'border-[#2a2a2a] bg-[#1a1a1a] text-gray-200 hover:bg-[#222]'
                            }`}
                        >
                            <FontAwesomeIcon icon={faGlobe} className="text-xs" />
                            Browse All Communities
                        </Link>
                        {user && (
                            <Link
                                to="/forum/communities/new"
                                className={`flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 ${isLight ? 'shadow-sm' : ''}`}
                            >
                                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                Create Community
                            </Link>
                        )}
                    </div>

                    {user && (
                        <div className={panelClass}>
                            <div className={`border-b px-3 py-2.5 ${borderSub}`}>
                                <h2 className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                    <span className={`flex h-7 w-7 items-center justify-center rounded-md ${isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                        <FontAwesomeIcon icon={faUserGroup} className="text-[10px]" />
                                    </span>
                                    Your Communities
                                </h2>
                            </div>
                            <div className="p-2">
                                {joinedCommunities.length > 0 ? (
                                    <ul className="space-y-0.5" role="list">
                                        {joinedCommunities.slice(0, 8).map(c => {
                                            const badgeCount = newPostBadges[c._id] || 0
                                            return (
                                                <li key={c._id}>
                                                    <Link
                                                        to={`/forum/c/${c.slug}`}
                                                        onClick={() => setNewPostBadges(prev => { const n = { ...prev }; delete n[c._id]; return n })}
                                                        className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm ${
                                                            isLight ? 'hover:bg-slate-50' : 'hover:bg-[#222]'
                                                        }`}
                                                    >
                                                        <div className="relative shrink-0">
                                                            <div
                                                                className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border text-xs font-bold ${isLight ? 'border-slate-200 bg-slate-100 text-emerald-700' : 'border-[#2a2a2a] bg-[#222] text-emerald-300'}`}
                                                            >
                                                                {c.icon ? (
                                                                    <img src={c.icon} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    c.name?.[0] ?? '?'
                                                                )}
                                                            </div>
                                                            {badgeCount > 0 && (
                                                                <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#1a1a1a]">
                                                                    {badgeCount > 9 ? '9+' : badgeCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`truncate font-medium ${isLight ? 'text-slate-800' : 'text-gray-100'}`}>
                                                            {c.name}
                                                        </span>
                                                        {badgeCount > 0 && (
                                                            <span className={`ml-auto shrink-0 text-[10px] font-medium ${isLight ? 'text-red-600' : 'text-red-400'}`}>
                                                                {badgeCount} new
                                                            </span>
                                                        )}
                                                    </Link>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                ) : (
                                    <p className={`px-2 py-5 text-center text-xs ${muted}`}>
                                        You haven't joined any communities yet.
                                    </p>
                                )}
                                {joinedCommunities.length > 8 && (
                                    <div className={`mt-1 border-t pt-2 ${borderSub}`}>
                                        <Link
                                            to="/forum/communities"
                                            className={`block text-center text-xs font-medium py-1 ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}`}
                                        >
                                            View all ({joinedCommunities.length})
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={panelClass}>
                        <div className={`border-b px-3 py-2.5 ${borderSub}`}>
                            <h2 className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">
                                    <FontAwesomeIcon icon={faFire} className="text-[10px]" />
                                </span>
                                Trending
                            </h2>
                        </div>
                        <div className="p-2">
                            {communities?.length > 0 ? (
                                <ul className={`divide-y ${isLight ? 'divide-slate-200/80' : 'divide-[#2a2a2a]'}`} role="list">
                                    {communities.slice(0, 5).map(c => (
                                        <li key={c._id}>
                                            <Link
                                                to={`/forum/c/${c.slug}`}
                                                className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm ${
                                                    isLight ? 'hover:bg-slate-50' : 'hover:bg-[#222]'
                                                }`}
                                            >
                                                <div
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border text-xs font-bold ${isLight ? 'border-slate-200 bg-slate-100 text-indigo-700' : 'border-[#2a2a2a] bg-[#222] text-indigo-300'}`}
                                                >
                                                    {c.icon ? (
                                                        <img src={c.icon} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        c.name?.[0] ?? '?'
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className={`truncate font-medium ${isLight ? 'text-slate-800' : 'text-gray-100'}`}>
                                                        {c.name}
                                                    </p>
                                                    <p className={`text-xs ${muted}`}>
                                                        {(c.memberCount ?? 0).toLocaleString()} members
                                                    </p>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={`px-2 py-6 text-center text-xs ${muted}`}>
                                    No communities to show
                                </p>
                            )}
                        </div>
                    </div>

                    {tags?.length > 0 && (
                        <div className={panelClass}>
                            <div className={`border-b px-3 py-2.5 ${borderSub}`}>
                                <h2 className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                    <span className={`flex h-7 w-7 items-center justify-center rounded-md ${isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-300'}`}>
                                        <FontAwesomeIcon icon={faTags} className="text-[10px]" />
                                    </span>
                                    Popular Tags
                                </h2>
                            </div>
                            <div className="flex flex-wrap gap-1.5 p-3">
                                {tags.slice(0, 15).map(t => (
                                    <ForumTagPill key={t.name} tag={t.name} count={t.count} theme={theme} />
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    )
}

export default ForumHome
