import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { io as socketIO } from 'socket.io-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faPen, faPlus, faComments, faLock, faChevronLeft, faChevronRight, faExclamationCircle, faKey } from '@fortawesome/free-solid-svg-icons'
import { getCommunity, joinCommunity, leaveCommunity, clearActive } from '../../../actions/community'
import { getPosts, votePost, addRealtimePost } from '../../../actions/forum'
import PostCard from '../../Forum/PostCard'
import PostSortBar from '../../Forum/PostSortBar'
import CommunitySidebar from '../../Forum/CommunitySidebar'

const socketUrl = import.meta.env.VITE_DEVELOPMENT == 'true'
    ? `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`
    : import.meta.env.VITE_APP_BASE_URL

const matchesCommunity = (post, communityId) => {
    if (!post || !communityId) return false
    const c = post.community
    if (!c) return false
    if (typeof c === 'string') return c === communityId
    return c._id === communityId || c === communityId
}

const CommunityPage = ({ user, theme }) => {
    const dispatch = useDispatch()
    const { slug } = useParams()
    const isLight = theme === 'light'

    const { active: community, isLoading: communityLoading, alert: communityErrorAlert } = useSelector(s => s.community)
    const { posts, pagination, isLoading: postsLoading, alert: forumErrorAlert } = useSelector(s => s.forum)

    const [sort, setSort] = useState('new')
    const [page, setPage] = useState(1)
    const postsRef = useRef([])
    const [gateCode, setGateCode] = useState('')
    const [gateError, setGateError] = useState('')
    const [gateJoining, setGateJoining] = useState(false)

    const userId = user?.result?._id || user?._id
    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`
    const communityIsLocked = Boolean(community?.isLocked || community?.locked)

    const isMember = useMemo(() => {
        if (!community?.members || !userId) return false
        return community.members.some(m => (typeof m === 'string' ? m : m?._id) === userId)
    }, [community, userId])

    const canCreatePost = Boolean(user && isMember && !communityIsLocked)

    const listPosts = useMemo(() => (Array.isArray(posts) ? posts : []), [posts])
    useEffect(() => { postsRef.current = listPosts }, [listPosts])

    const forumErrorMessage = forumErrorAlert && (typeof forumErrorAlert === 'string' ? forumErrorAlert : forumErrorAlert?.message)
    const communityErrorMessage = communityErrorAlert && (typeof communityErrorAlert === 'string' ? communityErrorAlert : communityErrorAlert?.message)

    useEffect(() => {
        if (!slug) return
        setPage(1)
        setSort('new')
        dispatch(clearActive())
        dispatch(getCommunity(slug))
        return () => { dispatch(clearActive()) }
    }, [slug, dispatch])

    useEffect(() => {
        if (!community?._id || community.slug !== slug || community._restricted) return
        dispatch(getPosts({ community: community._id, page, sort, limit: 15 }))
    }, [community?._id, community?.slug, community?._restricted, slug, page, sort, dispatch])

    useEffect(() => {
        if (!community?._id || community._restricted) return
        const cid = community._id
        const socket = socketIO(socketUrl, { transports: ['websocket', 'polling'] })
        socket.emit('join_community', cid)
        const onNewPost = (post) => {
            if (!matchesCommunity(post, cid)) return
            if (postsRef.current?.some(p => p._id === post._id)) return
            dispatch(addRealtimePost(post))
        }
        socket.on('new_forum_post', onNewPost)
        return () => {
            socket.emit('leave_community', cid)
            socket.off('new_forum_post', onNewPost)
            socket.disconnect()
        }
    }, [community?._id, dispatch])

    if (!slug) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Invalid link.</p>
            </div>
        )
    }

    if (communityLoading && !community?._id) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
                <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${isLight ? 'border-slate-400' : 'border-gray-500'}`} />
            </div>
        )
    }

    if (community?._id && community.slug !== slug) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
                <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${isLight ? 'border-slate-400' : 'border-gray-500'}`} />
            </div>
        )
    }

    if (!communityLoading && !community?._id) {
        const errMsg = communityErrorMessage
        return (
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <Link to="/forum" className={`mb-4 inline-flex items-center gap-1.5 text-xs font-medium ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-gray-200'}`}>
                    <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" /> Forum
                </Link>
                <div className={`${panelClass} text-center py-12 px-4`}>
                    {errMsg ? (
                        <div>
                            <FontAwesomeIcon icon={faExclamationCircle} className={`text-2xl mb-3 ${isLight ? 'text-amber-600' : 'text-amber-500'}`} />
                            <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Could not load this community</p>
                            <p className={`text-xs mt-2 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{errMsg}</p>
                        </div>
                    ) : (
                        <>
                            <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Community not found</p>
                            <Link to="/forum/communities" className={`inline-block mt-3 text-xs font-medium ${isLight ? 'text-indigo-600 hover:underline' : 'text-indigo-400 hover:underline'}`}>Browse communities</Link>
                        </>
                    )}
                </div>
            </div>
        )
    }

    if (!community?._id) return null

    if (community._restricted) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <Link to="/forum" className={`mb-6 inline-flex items-center gap-1.5 text-xs font-medium ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-gray-200'}`}>
                    <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" /> Forum
                </Link>
                <div className={`${panelClass} overflow-hidden`}>
                    {community.banner && (
                        <div className={`w-full h-32 sm:h-40 border-b ${isLight ? 'border-slate-200' : 'border-[#2a2a2a]'}`}>
                            <img src={community.banner} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="flex flex-col items-center text-center px-6 py-10 sm:py-14">
                        {community.icon ? (
                            <img src={community.icon} alt="" className={`h-16 w-16 rounded-xl object-cover border-2 mb-4 ${isLight ? 'border-white' : 'border-[#1a1a1a]'}`} />
                        ) : (
                            <div className={`h-16 w-16 rounded-xl flex items-center justify-center text-2xl font-bold mb-4 ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/15 text-indigo-400'}`}>
                                {community.name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                        )}
                        <div className={`flex items-center gap-2 mb-2`}>
                            <FontAwesomeIcon icon={faLock} className={`h-4 w-4 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                            <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>{community.name}</h2>
                        </div>
                        <p className={`text-sm mb-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                            This community is private
                        </p>
                        <p className={`text-xs mb-6 ${isLight ? 'text-slate-400' : 'text-zinc-600'}`}>
                            {community.memberCount || 0} member{(community.memberCount || 0) !== 1 ? 's' : ''}
                        </p>
                        {user ? (
                            <div className="w-full max-w-sm">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <FontAwesomeIcon icon={faKey} className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
                                        <input
                                            type="text"
                                            value={gateCode}
                                            onChange={e => { setGateCode(e.target.value); setGateError('') }}
                                            placeholder="Enter invitation code"
                                            className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm ${isLight ? 'border-slate-200 bg-white text-slate-900 placeholder-slate-400' : 'border-[#333] bg-[#222] text-zinc-100 placeholder-zinc-600'}`}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!gateCode.trim() || gateJoining}
                                        onClick={async () => {
                                            setGateJoining(true)
                                            setGateError('')
                                            const result = await dispatch(joinCommunity({ id: community._id, inviteCode: gateCode.trim() }))
                                            if (result?.error || joinCommunity.rejected.match(result)) {
                                                setGateError(result.payload?.alert?.message || 'Invalid invitation code')
                                            } else {
                                                dispatch(getCommunity(slug))
                                            }
                                            setGateJoining(false)
                                        }}
                                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap ${!gateCode.trim() || gateJoining ? 'opacity-50 cursor-not-allowed' : ''} ${isLight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                                    >
                                        {gateJoining ? 'Joining...' : 'Join'}
                                    </button>
                                </div>
                                {gateError && <p className="mt-2 text-xs text-red-500 font-medium text-left">{gateError}</p>}
                            </div>
                        ) : (
                            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                                <Link to="/login" className={`font-medium ${isLight ? 'text-indigo-600 hover:underline' : 'text-indigo-400 hover:underline'}`}>Sign in</Link> to join with an invitation code.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Link to="/forum" className={`flex items-center gap-1.5 text-xs font-medium w-fit ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-gray-200'}`}>
                    <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" /> Forum
                </Link>
                {userId && (community.creator?._id === userId || community.moderators?.some(m => (m?._id || m) === userId)) && (
                    <Link to={`/forum/c/${community.slug}/edit`} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg w-fit border ${isLight ? 'text-slate-700 border-slate-200 bg-white hover:bg-slate-50' : 'text-gray-200 border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#222]'}`}>
                        <FontAwesomeIcon icon={faPen} className="text-[10px]" /> Edit community
                    </Link>
                )}
            </div>

            {community.banner && (
                <div className={`w-full h-36 sm:h-44 rounded-xl overflow-hidden border mb-6 ${isLight ? 'border-slate-200/60' : 'border-[#2a2a2a]'}`}>
                    <img src={community.banner} alt="" className="w-full h-full object-cover" />
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
                <div className="flex-1 min-w-0">
                    {!!forumErrorMessage && (
                        <div className={`mb-4 px-3 py-2.5 rounded-lg text-xs border flex items-start gap-2 ${isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-[#2a1a0a] border-amber-900/50 text-amber-200'}`} role="alert">
                            <FontAwesomeIcon icon={faExclamationCircle} className="mt-0.5 shrink-0" />
                            <span>{forumErrorMessage}</span>
                        </div>
                    )}

                    <div className={`mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-[#2a2a2a]'}`}>
                        <PostSortBar active={sort} onChange={s => { setSort(s); setPage(1) }} theme={theme} />
                        <div className="flex items-center gap-2 flex-wrap">
                            {communityIsLocked && (
                                <span className={`flex items-center gap-1 text-[11px] font-medium ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                                    <FontAwesomeIcon icon={faLock} className="text-[10px]" /> Locked
                                </span>
                            )}
                            {canCreatePost && (
                                <Link
                                    to={`/forum/c/${community.slug}/new-post`}
                                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border ${isLight ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800' : 'bg-white text-gray-900 border-white hover:bg-gray-100'}`}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="text-[10px]" /> New Post
                                </Link>
                            )}
                        </div>
                    </div>

                    {postsLoading && listPosts.length === 0 ? (
                        <div className={`${panelClass} flex flex-col items-center justify-center py-20`}>
                            <div className={`animate-spin rounded-full h-7 w-7 border-2 border-t-transparent ${isLight ? 'border-slate-400' : 'border-gray-500'}`} />
                            <p className={`text-sm mt-3 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Loading posts…</p>
                        </div>
                    ) : listPosts.length > 0 ? (
                        <ul className="space-y-2 list-none p-0 m-0">
                            {listPosts.map(post => (
                                <li key={post._id} className="m-0">
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
                        <div className={`${panelClass} text-center py-16 px-4`}>
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 border ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2a2a2a] bg-[#141414]'}`}>
                                <FontAwesomeIcon icon={faComments} className={`text-lg ${isLight ? 'text-slate-400' : 'text-gray-600'}`} />
                            </div>
                            <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>No posts yet</p>
                            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                {canCreatePost ? 'Start the first discussion in this community.' : 'Be the first to post once you join.'}
                            </p>
                            {canCreatePost && (
                                <Link to={`/forum/c/${community.slug}/new-post`} className={`inline-flex items-center gap-1.5 mt-4 px-3 py-2 rounded-lg text-xs font-semibold border ${isLight ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800' : 'bg-white text-gray-900 border-white hover:bg-gray-100'}`}>
                                    <FontAwesomeIcon icon={faPlus} className="text-[10px]" /> New Post
                                </Link>
                            )}
                        </div>
                    )}

                    {pagination?.pages > 1 && (
                        <div className="flex items-center justify-center gap-1 mt-6">
                            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className={`w-8 h-8 rounded-md flex items-center justify-center text-xs transition-colors ${page === 1 ? 'opacity-40 cursor-not-allowed' : (isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-[#2a2a2a] text-gray-400')}`}>
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                                const pn = pagination.pages <= 5 ? i + 1 : Math.min(Math.max(page - 2, 1), pagination.pages - 4) + i
                                return (
                                    <button type="button" key={pn} onClick={() => setPage(pn)}
                                        className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${page === pn ? (isLight ? 'bg-slate-900 text-white' : 'bg-white text-gray-900') : (isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#2a2a2a]')}`}>
                                        {pn}
                                    </button>
                                )
                            })}
                            <button type="button" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                                className={`w-8 h-8 rounded-md flex items-center justify-center text-xs transition-colors ${page === pagination.pages ? 'opacity-40 cursor-not-allowed' : (isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-[#2a2a2a] text-gray-400')}`}>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    )}
                </div>

                <aside className="w-full lg:w-80 flex-shrink-0">
                    <CommunitySidebar
                        community={community}
                        theme={theme}
                        user={user}
                        onJoin={(id, inviteCode) => dispatch(joinCommunity({ id, inviteCode }))}
                        onLeave={id => dispatch(leaveCommunity(id))}
                    />
                </aside>
            </div>
        </div>
    )
}

export default CommunityPage
