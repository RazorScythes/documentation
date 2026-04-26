import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faEye, faThumbtack, faLock, faClock } from '@fortawesome/free-solid-svg-icons'
import VoteButtons from './VoteButtons'

const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return `${Math.floor(s/60)}m`
    if (s < 86400) return `${Math.floor(s/3600)}h`
    if (s < 604800) return `${Math.floor(s/86400)}d`
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const authorInitials = (username) => {
    if (!username) return '?'
    const s = String(username).trim()
    if (s.length <= 1) return s.toUpperCase()
    return s.slice(0, 2).toUpperCase()
}

const extractMarkdownImages = (raw) => {
    if (!raw) return []
    const re = /!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g
    const urls = []
    let m
    while ((m = re.exec(raw)) !== null) urls.push(m[1])
    return urls
}

const contentPreview = (raw) => {
    if (!raw) return ''
    let t = raw
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[#*`>\[\]()!]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    return t
}

const PostCard = ({ post, theme, user, onVote }) => {
    const isLight = theme === 'light'
    const userId = user?.result?._id || user?._id
    const userVote = post.upvotes?.some(id => String(id) === String(userId)) ? 1 : post.downvotes?.some(id => String(id) === String(userId)) ? -1 : 0

    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`
    const metaMuted = isLight ? 'text-slate-500' : 'text-zinc-500'
    const borderVote = isLight ? 'border-slate-200' : 'border-[#2a2a2a]'

    const author = post.author
    const username = author?.username
    const previewText = post.content ? contentPreview(post.content) : ''

    const allImages = [
        ...(post.images || []),
        ...extractMarkdownImages(post.content)
    ].filter(Boolean)
    const thumbUrl = allImages[0] || null

    return (
        <div
            className={`${panelClass} flex min-w-0 overflow-hidden transition-shadow hover:shadow-md`}
        >
            <div
                className={`flex shrink-0 flex-col items-center justify-start border-r py-2 px-1.5 sm:px-2 ${borderVote}`}
            >
                <VoteButtons
                    theme={theme}
                    score={post.score || 0}
                    userVote={userVote}
                    onVote={(v) => onVote?.(post._id, v)}
                    vertical
                />
            </div>

            <div className="min-w-0 flex-1 p-3 sm:p-3.5">
                <div className="mb-2 flex min-w-0 items-start gap-2">
                    <Link
                        to={username ? `/user/${username}` : '#'}
                        onClick={e => { if (!username) e.preventDefault() }}
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center overflow-hidden text-[10px] font-semibold
                            ${isLight
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : 'bg-[#222] text-zinc-300 border border-[#333]'}`}
                        aria-label={username ? `View ${username}` : 'User'}
                    >
                        {author?.avatar
                            ? <img src={author.avatar} alt="" className="h-full w-full object-cover" />
                            : <span className="select-none">{authorInitials(username)}</span>}
                    </Link>

                    <div className="min-w-0 flex-1 text-[11px] leading-tight">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                            {username && (
                                <Link
                                    to={`/user/${username}`}
                                    className={`font-medium truncate max-w-[10rem] sm:max-w-[14rem] hover:underline
                                        ${isLight ? 'text-slate-800 hover:text-indigo-600' : 'text-zinc-200 hover:text-indigo-400'}`}
                                >
                                    {username}
                                </Link>
                            )}
                            {post.community && (
                                <>
                                    <span className={metaMuted} aria-hidden>·</span>
                                    <Link
                                        to={`/forum/c/${post.community.slug}`}
                                        className={`inline-flex min-w-0 max-w-full items-center gap-1 font-medium hover:underline
                                            ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}`}
                                    >
                                        {post.community.icon && (
                                            <img src={post.community.icon} alt="" className="h-3.5 w-3.5 shrink-0 rounded object-cover" />
                                        )}
                                        <span className="truncate">c/{post.community.name}</span>
                                    </Link>
                                </>
                            )}
                            <span className={`inline-flex items-center gap-0.5 tabular-nums ${metaMuted}`}>
                                <FontAwesomeIcon icon={faClock} className="h-2.5 w-2.5" />
                                {timeAgo(post.createdAt)}
                            </span>
                            {post.isPinned && (
                                <span
                                    className={`inline-flex h-5 w-5 items-center justify-center rounded border text-amber-600
                                        ${isLight ? 'border-amber-200 bg-amber-50' : 'border-amber-800/50 bg-amber-950/30 text-amber-400'}`}
                                    title="Pinned"
                                >
                                    <FontAwesomeIcon icon={faThumbtack} className="text-[9px]" />
                                </span>
                            )}
                            {post.isLocked && (
                                <span
                                    className={`inline-flex h-5 w-5 items-center justify-center rounded border text-red-600
                                        ${isLight ? 'border-red-200 bg-red-50' : 'border-red-900/50 bg-red-950/30 text-red-400'}`}
                                    title="Locked"
                                >
                                    <FontAwesomeIcon icon={faLock} className="text-[9px]" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <Link to={`/forum/post/${post._id}`} className="block min-w-0">
                    <h3
                        className={`mb-1 line-clamp-2 text-sm font-semibold leading-snug sm:text-[0.95rem]
                            ${isLight ? 'text-slate-900 hover:text-indigo-600' : 'text-zinc-100 hover:text-indigo-400'}`}
                    >
                        {post.title}
                    </h3>
                    {previewText && (
                        <p className={`text-xs line-clamp-3 leading-relaxed ${metaMuted}`}>
                            {previewText}
                        </p>
                    )}
                </Link>

                {thumbUrl && (
                    <Link
                        to={`/forum/post/${post._id}`}
                        className="mt-2 inline-block max-w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500"
                    >
                        <img
                            src={thumbUrl}
                            alt=""
                            className={`max-h-64 max-w-full w-auto h-auto rounded-lg border object-contain ${isLight ? 'border-slate-200' : 'border-[#333]'}`}
                        />
                    </Link>
                )}

                {post.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                        {post.tags.slice(0, 4).map(t => (
                            <span
                                key={t}
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium
                                    ${isLight
                                        ? 'border-slate-200 bg-slate-50 text-slate-600'
                                        : 'border-[#333] bg-[#222] text-zinc-400'}`}
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px]">
                    <Link
                        to={`/forum/post/${post._id}`}
                        className={`inline-flex items-center gap-1 font-medium tabular-nums hover:underline
                            ${isLight ? 'text-slate-500 hover:text-indigo-600' : 'text-zinc-500 hover:text-indigo-400'}`}
                    >
                        <FontAwesomeIcon icon={faComment} className="h-3 w-3" />
                        {post.commentCount || 0}
                    </Link>
                    <span className={`inline-flex items-center gap-1 font-medium tabular-nums ${metaMuted}`}>
                        <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                        {post.viewCount || 0}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default PostCard
