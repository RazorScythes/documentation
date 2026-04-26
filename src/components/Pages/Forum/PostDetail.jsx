import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { io as socketIO } from 'socket.io-client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft, faThumbtack, faLock, faPen, faTrash, faComment, faEye, faClock, faComments
} from '@fortawesome/free-solid-svg-icons'
import {
    getPost, getComments, votePost, createComment, updateComment, deleteComment, voteComment,
    clearComments, clearActivePost, clearAlert, updateRealtimeVotes, deletePost,
    togglePostPin, togglePostLock
} from '../../../actions/forum'
import { joinCommunity, leaveCommunity } from '../../../actions/community'
import CommunitySidebar from '../../Forum/CommunitySidebar'
import VoteButtons from '../../Forum/VoteButtons'
import CommentTree from '../../Forum/CommentTree'
import ForumTagPill from '../../Forum/ForumTagPill'

const timeAgo = (d) => {
    if (!d) return ''
    const s = Math.floor((Date.now() - new Date(d)) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return `${Math.floor(s / 60)}m`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    if (s < 604800) return `${Math.floor(s / 86400)}d`
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Flatten comment list so top-level order follows `sort` while preserving subtrees. */
function orderCommentsForTree(comments, sort) {
    if (!comments?.length) return []
    const byParent = new Map()
    for (const c of comments) {
        const p = c.parent == null || c.parent === undefined ? 'root' : String(c.parent)
        if (!byParent.has(p)) byParent.set(p, [])
        byParent.get(p).push(c)
    }
    const sortSiblings = (list) => {
        const a = [...list]
        if (sort === 'top') return a.sort((x, y) => (y.score || 0) - (x.score || 0))
        if (sort === 'old') return a.sort((x, y) => new Date(x.createdAt) - new Date(y.createdAt))
        return a.sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))
    }
    const out = []
    const walk = (id) => {
        const ch = byParent.get(id) || []
        for (const c of sortSiblings(id === 'root' ? ch : ch)) {
            out.push(c)
            walk(String(c._id))
        }
    }
    walk('root')
    return out
}

const normalizeImageUrl = (item) => {
    if (item == null) return ''
    if (typeof item === 'string') return item.trim() || ''
    if (typeof item === 'object' && item) return (item.url || item.src || '').trim() || ''
    return String(item)
}

const extractMarkdownImages = (raw) => {
    if (!raw) return []
    const re = /!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g
    const urls = []
    let m
    while ((m = re.exec(raw)) !== null) urls.push(m[1])
    return urls
}

const PostDetail = ({ user, theme }) => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const isLight = theme === 'light'
    const userId = user?.result?._id || user?._id

    const { activePost, comments, isLoading, commentLoading } = useSelector(s => s.forum)
    const [commentSort, setCommentSort] = useState('top')
    const commentSortRef = useRef('top')
    useEffect(() => { commentSortRef.current = commentSort }, [commentSort])

    const [newComment, setNewComment] = useState('')
    const [submittingComment, setSubmittingComment] = useState(false)
    const [postDeleteOpen, setPostDeleteOpen] = useState(false)
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null)

    const post = activePost?._id === id ? activePost : null
    const community = post?.community
    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`

    const isMod = useMemo(() => {
        if (!userId || !community) return false
        if (community.creator?._id === userId) return true
        return community.moderators?.some(m => (typeof m === 'string' ? m : m?._id) === userId)
    }, [userId, community])

    const isAuthor = post && userId && post.author?._id === userId
    const userVote = post ? (post.upvotes?.some(uid => String(uid) === String(userId)) ? 1 : post.downvotes?.some(uid => String(uid) === String(userId)) ? -1 : 0) : 0

    const orderedComments = useMemo(() => orderCommentsForTree(comments, commentSort), [comments, commentSort])

    const contentImageUrls = useMemo(() => extractMarkdownImages(post?.content), [post?.content])

    const imageUrls = useMemo(() => {
        const contentSet = new Set(contentImageUrls)
        return (post?.images || []).map(normalizeImageUrl).filter(u => u && !contentSet.has(u))
    }, [post?.images, contentImageUrls])

    const socketUrl = useMemo(() => (import.meta.env.VITE_DEVELOPMENT == 'true'
        ? `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`
        : import.meta.env.VITE_APP_BASE_URL), [])

    useEffect(() => {
        if (!id) return
        window.scrollTo(0, 0)
        dispatch(getPost(id))
        dispatch(clearAlert())
    }, [id, dispatch])

    useEffect(() => {
        if (!id) return
        dispatch(getComments({ postId: id, sort: commentSort }))
    }, [id, commentSort, dispatch])

    useEffect(() => {
        if (!id || !post?._id || !post?.community) return
        const communityId = post.community?._id || post.community
        const socket = socketIO(socketUrl, { transports: ['websocket', 'polling'] })
        socket.emit('join_post', id)
        socket.emit('join_community', communityId)

        socket.on('new_forum_comment', () => {
            const sort = commentSortRef.current
            dispatch(getComments({ postId: id, sort }))
        })

        socket.on('post_votes_updated', (raw) => {
            const p = raw?.data ?? raw
            if (p && (p.postId === id || p._id === id)) {
                dispatch(updateRealtimeVotes({
                    postId: p.postId || p._id || id,
                    score: p.score,
                    upvotes: p.upvotes,
                    downvotes: p.downvotes
                }))
            }
        })

        return () => {
            socket.emit('leave_post', id)
            socket.emit('leave_community', communityId)
            socket.disconnect()
        }
    }, [id, post?._id, post?.community, socketUrl, dispatch])

    useEffect(() => {
        return () => {
            dispatch(clearComments())
            dispatch(clearActivePost())
        }
    }, [dispatch])

    useEffect(() => {
        if (!imagePreviewUrl) return
        const onKey = (e) => { if (e.key === 'Escape') setImagePreviewUrl(null) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [imagePreviewUrl])

    const refetchComments = useCallback(() => {
        if (id) dispatch(getComments({ postId: id, sort: commentSortRef.current }))
    }, [id, dispatch])

    const onVotePost = (v) => {
        if (post) dispatch(votePost({ id: post._id, value: v }))
    }

    const handleAddComment = async (e) => {
        e?.preventDefault?.()
        if (!user || !post || post.isLocked || !newComment.trim()) return
        setSubmittingComment(true)
        try {
            await dispatch(createComment({ postId: post._id, content: newComment.trim() })).unwrap()
            setNewComment('')
            refetchComments()
        } catch { /* errors surface via alert */ }
        setSubmittingComment(false)
    }

    const handleReply = (data) => {
        dispatch(createComment({
            postId: data.postId,
            content: data.content,
            parentId: data.parentId
        })).then(() => refetchComments())
    }

    const handleEditComment = (data) => {
        dispatch(updateComment({ id: data.id, content: data.content })).then(() => refetchComments())
    }

    const handleDeleteComment = (commentId) => {
        dispatch(deleteComment(commentId)).then(() => refetchComments())
    }

    const handleVoteComment = (commentId, value) => {
        dispatch(voteComment({ id: commentId, value }))
    }

    const handleDeletePost = async () => {
        if (!post) return
        try {
            await dispatch(deletePost(post._id)).unwrap()
            if (post.community?.slug) navigate(`/forum/c/${post.community.slug}`)
            else navigate('/forum')
        } catch { /* handled */ } finally {
            setPostDeleteOpen(false)
        }
    }

    const backHref = post?.community?.slug ? `/forum/c/${post.community.slug}` : '/forum'

    const prosePost = `prose prose-sm sm:prose-base max-w-none ${isLight
        ? 'prose-slate prose-headings:scroll-mt-20 prose-headings:font-bold prose-p:leading-relaxed prose-p:text-slate-600 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-800 prose-blockquote:border-l-slate-300 prose-code:bg-slate-100 prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-100 prose-pre:border prose-pre:border-slate-200 prose-pre:rounded-lg prose-img:rounded-lg'
        : 'prose-invert prose-p:leading-relaxed prose-p:text-gray-300 prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-headings:scroll-mt-20 prose-headings:font-bold prose-headings:text-white prose-strong:text-white prose-blockquote:border-l-gray-600 prose-code:bg-[#141414] prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#0d0d0d] prose-pre:border prose-pre:border-[#2a2a2a] prose-pre:rounded-lg prose-img:rounded-lg'}`

    if (isLoading && !post) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
                    <div className="flex-1 min-w-0 space-y-4">
                        <div className="h-6 w-32 rounded bg-slate-200 dark:bg-[#2a2a2a] animate-pulse" />
                        <div className={`${panelClass} p-0 overflow-hidden`}>
                            <div className="flex">
                                <div className="w-12 sm:w-14 shrink-0 border-r border-slate-200 dark:border-[#2a2a2a] py-4 flex flex-col items-center">
                                    <div className="h-20 w-6 rounded bg-slate-200 dark:bg-[#2a2a2a] animate-pulse" />
                                </div>
                                <div className="flex-1 p-4 sm:p-5 space-y-3 min-w-0">
                                    <div className="flex gap-3">
                                        <div className="h-12 w-12 rounded-lg shrink-0 bg-slate-200 dark:bg-[#2a2a2a] animate-pulse" />
                                        <div className="flex-1 space-y-2 pt-1">
                                            <div className="h-3 w-36 rounded bg-slate-200 dark:bg-[#2a2a2a] animate-pulse" />
                                            <div className="h-2.5 w-24 rounded bg-slate-200/80 dark:bg-[#333] animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="h-6 w-3/4 max-w-sm rounded bg-slate-200 dark:bg-[#2a2a2a] animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-3 w-full rounded bg-slate-200/80 dark:bg-[#333] animate-pulse" />
                                        <div className="h-3 w-5/6 rounded bg-slate-200/80 dark:bg-[#333] animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`h-32 rounded-xl border animate-pulse ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#141414] border-[#2a2a2a]'}`} />
                    </div>
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <div className={`h-64 rounded-xl border animate-pulse ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#141414] border-[#2a2a2a]'}`} />
                    </aside>
                </div>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Post not found or failed to load.</p>
                <Link to="/forum" className={`mt-4 inline-block text-sm font-medium ${isLight ? 'text-indigo-600 hover:underline' : 'text-indigo-400 hover:underline'}`}>Back to forum</Link>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
                <div className="flex-1 min-w-0 w-full">
                    <Link
                        to={backHref}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium mb-4 ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
                        {post.community ? `c/${post.community.slug}` : 'Forum home'}
                    </Link>

                    <article className={`${panelClass} overflow-hidden`}>
                        <div className="flex">
                            <div className={`pl-2 sm:pl-2.5 pr-0 py-4 sm:py-5 flex flex-col items-center border-r shrink-0 w-[48px] sm:w-[56px] ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-[#2a2a2a] bg-[#141414]/50'}`}>
                                <VoteButtons theme={theme} vertical score={post.score || 0} userVote={userVote} onVote={onVotePost} />
                            </div>
                            <div className="flex-1 p-4 sm:p-5 min-w-0">
                                <header className="mb-4">
                                    {post.community && (
                                        <div className="mb-3">
                                            <Link
                                                to={`/forum/c/${post.community.slug}`}
                                                className={`inline-flex items-center gap-2 max-w-full rounded-md px-0 py-0.5 ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}
                                            >
                                                {post.community.icon && (
                                                    <img src={post.community.icon} alt="" className="w-7 h-7 rounded object-cover border border-slate-200 dark:border-[#2a2a2a]" />
                                                )}
                                                <span className={`text-sm font-semibold truncate ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>
                                                    c/{post.community.name}
                                                </span>
                                            </Link>
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <Link to={`/user/${post.author?.username}`} className="shrink-0" title={post.author?.username}>
                                            {post.author?.avatar
                                                ? <img src={post.author.avatar} alt="" className="w-10 h-10 sm:w-11 sm:h-11 rounded object-cover border border-slate-200 dark:border-[#2a2a2a]" />
                                                : <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded flex items-center justify-center text-sm font-semibold border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#222] border-[#2a2a2a] text-gray-200'}`}>
                                                    {post.author?.username?.[0]?.toUpperCase() || '?'}
                                                </div>}
                                        </Link>
                                        <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
                                            <Link
                                                to={`/user/${post.author?.username}`}
                                                className={`text-sm font-semibold hover:underline ${isLight ? 'text-slate-800' : 'text-gray-100'}`}
                                            >
                                                u/{post.author?.username}
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <time dateTime={post.createdAt} className={`inline-flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                    <FontAwesomeIcon icon={faClock} className="text-[9px]" />
                                                    {timeAgo(post.createdAt)}
                                                </time>
                                                {post.isPinned && (
                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${isLight ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-amber-300 bg-amber-950/40 border-amber-900/50'}`} title="Pinned">
                                                        <FontAwesomeIcon icon={faThumbtack} className="text-[9px]" /> Pinned
                                                    </span>
                                                )}
                                                {post.isLocked && (
                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${isLight ? 'text-red-700 bg-red-50 border-red-200' : 'text-red-300 bg-red-950/30 border-red-900/50'}`} title="Locked">
                                                        <FontAwesomeIcon icon={faLock} className="text-[9px]" /> Locked
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </header>

                                <h1 className={`text-xl sm:text-2xl font-bold leading-tight mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    {post.title}
                                </h1>

                                <div className={`${prosePost} mb-3`}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content || ''}</ReactMarkdown>
                                </div>

                                {imageUrls.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2" aria-label="Post images">
                                        {imageUrls.map((url, i) => (
                                            <button
                                                key={`${url}-${i}`}
                                                type="button"
                                                onClick={() => setImagePreviewUrl(url)}
                                                className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indigo-500 rounded-lg"
                                            >
                                                <img
                                                    src={url}
                                                    alt=""
                                                    className={`max-h-80 max-w-full w-auto h-auto rounded-lg border object-contain cursor-pointer ${isLight ? 'border-slate-200' : 'border-[#2a2a2a]'}`}
                                                    loading="lazy"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {post.tags?.length > 0 && (
                                    <div
                                        className={`mt-4 flex flex-wrap items-center gap-2 p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141414] border-[#2a2a2a]'}`}
                                        role="list"
                                        aria-label="Tags"
                                    >
                                        {post.tags.map(t => (
                                            <span key={t} className="inline-block" role="listitem">
                                                <ForumTagPill tag={t} theme={theme} onClick={() => {}} />
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className={`mt-4 pt-3 flex flex-wrap items-center gap-4 text-xs border-t ${isLight ? 'text-slate-600 border-slate-200' : 'text-gray-500 border-[#2a2a2a]'}`}>
                                    <span className="inline-flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faComment} className="text-[11px] opacity-80" />
                                        <span className="font-medium">{post.commentCount ?? orderedComments.filter(c => !c.parent).length} comments</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faEye} className="text-[11px] opacity-80" />
                                        <span className="font-medium">{post.viewCount || 0} views</span>
                                    </span>
                                </div>

                                {(isMod || isAuthor) && (
                                    <div className={`mt-3 pt-3 flex flex-wrap items-center gap-2 border-t ${isLight ? 'border-slate-200' : 'border-[#2a2a2a]'}`}>
                                        {isMod && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => dispatch(togglePostPin(post._id))}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${isLight ? 'text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100' : 'text-amber-200 bg-amber-950/40 border-amber-900/50 hover:bg-amber-950/60'}`}
                                                >
                                                    <FontAwesomeIcon icon={faThumbtack} className="text-[11px]" />
                                                    {post.isPinned ? 'Unpin' : 'Pin'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => dispatch(togglePostLock(post._id))}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${isLight ? 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50' : 'text-gray-200 bg-[#222] border-[#2a2a2a] hover:bg-[#2a2a2a]'}`}
                                                >
                                                    <FontAwesomeIcon icon={faLock} className="text-[11px]" />
                                                    {post.isLocked ? 'Unlock' : 'Lock'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPostDeleteOpen(true)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${isLight ? 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100' : 'text-red-300 bg-red-950/30 border-red-900/50 hover:bg-red-950/50'}`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-[11px]" />
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                        {isAuthor && (
                                            <>
                                                <Link
                                                    to={`/forum/post/${post._id}/edit`}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${isLight ? 'text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100' : 'text-indigo-300 bg-indigo-950/40 border-indigo-900/50 hover:bg-indigo-950/60'}`}
                                                >
                                                    <FontAwesomeIcon icon={faPen} className="text-[11px]" />
                                                    Edit
                                                </Link>
                                                {!isMod && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPostDeleteOpen(true)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${isLight ? 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100' : 'text-red-300 bg-red-950/30 border-red-900/50 hover:bg-red-950/50'}`}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="text-[11px]" />
                                                        Delete
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>

                    {imagePreviewUrl && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                            role="dialog"
                            aria-modal
                            onClick={() => setImagePreviewUrl(null)}
                        >
                            <button
                                type="button"
                                className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-white/10 hover:bg-white/20"
                                onClick={e => { e.stopPropagation(); setImagePreviewUrl(null) }}
                            >
                                Close
                            </button>
                            <div className="max-w-full max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                                <img src={imagePreviewUrl} alt="" className="max-w-full max-h-[90vh] w-auto h-auto object-contain" />
                            </div>
                        </div>
                    )}

                    {postDeleteOpen && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                            role="dialog"
                            aria-modal
                            onClick={() => setPostDeleteOpen(false)}
                        >
                            <div
                                className={`${panelClass} p-5 sm:p-6 max-w-md w-full shadow-lg`}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border mb-3 ${isLight ? 'bg-red-50 border-red-200' : 'bg-red-950/40 border-red-900/50'}`}>
                                    <FontAwesomeIcon icon={faTrash} className="text-lg text-red-600 dark:text-red-400" />
                                </div>
                                <p className={`text-base font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Delete this post?</p>
                                <p className={`text-sm mt-2 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>This action cannot be undone. Comments will be removed with the post.</p>
                                <div className="mt-5 flex flex-col-reverse sm:flex-row justify-end gap-2">
                                    <button type="button" onClick={() => setPostDeleteOpen(false)} className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg border ${isLight ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' : 'bg-[#2a2a2a] text-gray-200 border-[#3a3a3a] hover:bg-[#333]'}`}>Cancel</button>
                                    <button type="button" onClick={handleDeletePost} className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-500">Delete</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <section className="mt-8" aria-label="Comments">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <h2 className={`text-base font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                Comments
                            </h2>
                            <div
                                className={`inline-flex rounded-lg border p-0.5 w-fit ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#141414] border-[#2a2a2a]'}`}
                                role="tablist"
                                aria-label="Sort comments"
                            >
                                {['top', 'new', 'old'].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        role="tab"
                                        aria-selected={commentSort === s}
                                        onClick={() => setCommentSort(s)}
                                        className={`px-3 py-1.5 min-w-[3.5rem] rounded-md text-xs font-medium capitalize transition-colors ${
                                            commentSort === s
                                                ? (isLight ? 'bg-white text-slate-900 border border-slate-200' : 'bg-[#2a2a2a] text-white border border-[#3a3a3a]')
                                                : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-500 hover:text-gray-200')
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {user && !post.isLocked && (
                            <form onSubmit={handleAddComment} className={`${panelClass} p-4 mb-4`}>
                                <label className={`block text-xs font-medium mb-2 ${isLight ? 'text-slate-600' : 'text-gray-400'}`} htmlFor="post-detail-comment">Add a comment</label>
                                <textarea
                                    id="post-detail-comment"
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    rows={4}
                                    placeholder="Write a comment…"
                                    className={`w-full text-sm rounded-lg p-3 border outline-none resize-y min-h-[100px] ${isLight ? 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-slate-400' : 'bg-[#141414] border-[#2a2a2a] text-gray-100 placeholder:text-gray-600 focus:border-gray-500'}`}
                                />
                                <div className="mt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={submittingComment || !newComment.trim()}
                                        className={`inline-flex items-center justify-center min-w-[8rem] px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            submittingComment || !newComment.trim()
                                                ? (isLight ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#2a2a2a] text-gray-600 cursor-not-allowed')
                                                : (isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-gray-900 hover:bg-gray-100')
                                        }`}
                                    >
                                        {submittingComment ? 'Posting…' : 'Post comment'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {post.isLocked && (
                            <div className={`mb-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/30 border-amber-900/50 text-amber-200'}`}>
                                <span className="shrink-0 pt-0.5"><FontAwesomeIcon icon={faLock} /></span>
                                <span>This post is locked. New comments are disabled.</span>
                            </div>
                        )}

                        {commentLoading && !orderedComments.length ? (
                            <div className={`${panelClass} flex flex-col items-center justify-center py-16 gap-3`}>
                                <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${isLight ? 'border-slate-400' : 'border-gray-500'}`} />
                                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Loading comments…</p>
                            </div>
                        ) : orderedComments.length ? (
                            <CommentTree
                                comments={orderedComments}
                                theme={theme}
                                user={user}
                                postId={post._id}
                                onReply={handleReply}
                                onEdit={handleEditComment}
                                onDelete={handleDeleteComment}
                                onVote={handleVoteComment}
                            />
                        ) : (
                            <div className={`${panelClass} text-center py-12 px-4`}>
                                <div className={`w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center border ${isLight ? 'border-slate-200 bg-slate-50 text-slate-400' : 'border-[#2a2a2a] bg-[#141414] text-gray-600'}`}>
                                    <FontAwesomeIcon icon={faComments} />
                                </div>
                                <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>No comments yet</p>
                                <p className={`text-xs mt-1 max-w-sm mx-auto ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Be the first to comment on this post.</p>
                            </div>
                        )}
                    </section>
                </div>

                <aside className="w-full lg:w-80 flex-shrink-0">
                    {community && (
                        <div className="lg:sticky lg:top-6">
                            <CommunitySidebar
                                community={community}
                                theme={theme}
                                user={user}
                                onJoin={(cid, inviteCode) => dispatch(joinCommunity({ id: cid, inviteCode }))}
                                onLeave={cid => dispatch(leaveCommunity(cid))}
                            />
                        </div>
                    )}
                </aside>
            </div>
        </div>
    )
}

export default PostDetail
