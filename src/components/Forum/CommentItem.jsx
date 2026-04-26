import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faReply, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import VoteButtons from './VoteButtons'

const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return `${Math.floor(s/60)}m`
    if (s < 86400) return `${Math.floor(s/3600)}h`
    return `${Math.floor(s/86400)}d`
}

const CommentItem = ({ comment, theme, user, postId, onReply, onEdit, onDelete, onVote }) => {
    const isLight = theme === 'light'
    const userId = user?.result?._id || user?._id
    const isAuthor = userId === comment.author?._id
    const userVote = comment.upvotes?.some(id => String(id) === String(userId)) ? 1 : comment.downvotes?.some(id => String(id) === String(userId)) ? -1 : 0
    const [showReply, setShowReply] = useState(false)
    const [replyText, setReplyText] = useState('')
    const [editing, setEditing] = useState(false)
    const [editText, setEditText] = useState(comment.content)

    const handleReply = () => {
        if (!replyText.trim()) return
        onReply?.({ postId, content: replyText.trim(), parentId: comment._id })
        setReplyText('')
        setShowReply(false)
    }

    const handleEdit = () => {
        if (!editText.trim()) return
        onEdit?.({ id: comment._id, content: editText.trim() })
        setEditing(false)
    }

    const ringFocus = isLight
        ? 'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500'
        : 'focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500/70'
    const textareaBase = `w-full text-sm leading-relaxed rounded-lg border resize-none px-3 py-2 ${ringFocus}`
    const textareaLight = `${textareaBase} bg-white border-slate-200 text-slate-800 placeholder:text-slate-400`
    const textareaDark = `${textareaBase} bg-[#141414] border-[#2e2e2e] text-gray-200 placeholder:text-gray-600`

    const btnPrimary = isLight
        ? 'inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
        : 'inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400/80'

    const btnSecondary = isLight
        ? 'inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50'
        : 'inline-flex items-center justify-center rounded-md border border-[#333] bg-[#222] px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-[#2a2a2a]'

    const actionBtn = isLight
        ? 'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
        : 'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-[#222] hover:text-indigo-400'

    const dangerBtn = isLight
        ? 'inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600'
        : 'inline-flex items-center justify-center rounded-md p-1.5 text-zinc-500 hover:bg-red-950/40 hover:text-red-400'

    const rootDeleted = comment.isDeleted ? (isLight ? 'opacity-80' : 'opacity-75') : ''

    return (
        <div className={`min-w-0 ${rootDeleted}`}>
            <div className="flex gap-2.5">
                <div className="shrink-0 pt-0.5">
                    {comment.author?.avatar ? (
                        <img
                            src={comment.author.avatar}
                            alt=""
                            className={`h-7 w-7 rounded-full object-cover border ${isLight ? 'border-slate-200' : 'border-[#333]'}`}
                        />
                    ) : (
                        <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold
                                ${isLight
                                    ? 'border-slate-200 bg-slate-100 text-indigo-700'
                                    : 'border-[#333] bg-[#222] text-indigo-400'}`}
                        >
                            {comment.author?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <Link
                            to={`/user/${comment.author?.username}`}
                            className={`text-sm font-semibold
                                ${isLight ? 'text-slate-800 hover:text-indigo-600' : 'text-zinc-100 hover:text-indigo-400'}`}
                        >
                            {comment.author?.username || '[deleted]'}
                        </Link>
                        <span className={`text-[11px] tabular-nums ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                            {timeAgo(comment.createdAt)}
                        </span>
                        {comment.isDeleted && (
                            <span className={`text-[11px] font-medium uppercase tracking-wide ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                                [deleted]
                            </span>
                        )}
                    </div>
                    {editing ? (
                        <div className="max-w-2xl space-y-2">
                            <textarea
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                rows={3}
                                className={isLight ? textareaLight : textareaDark}
                            />
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={handleEdit} className={btnPrimary}>
                                    Save
                                </button>
                                <button type="button" onClick={() => setEditing(false)} className={btnSecondary}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p
                            className={`max-w-2xl whitespace-pre-wrap text-sm leading-relaxed
                                ${isLight ? 'text-slate-600' : 'text-zinc-300'}
                                ${comment.isDeleted
                                    ? (isLight ? 'text-slate-400 line-through' : 'text-zinc-500 line-through')
                                    : ''}`}
                        >
                            {comment.content}
                        </p>
                    )}
                    {!comment.isDeleted && !editing && (
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <div className="inline-flex items-center">
                                <VoteButtons
                                    theme={theme}
                                    score={comment.score || 0}
                                    userVote={userVote}
                                    onVote={(v) => onVote?.(comment._id, v)}
                                />
                            </div>
                            {user && (
                                <button type="button" onClick={() => setShowReply(!showReply)} className={actionBtn}>
                                    <FontAwesomeIcon icon={faReply} className="h-3 w-3 opacity-80" />
                                    Reply
                                </button>
                            )}
                            {isAuthor && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => { setEditing(true); setEditText(comment.content) }}
                                        className={actionBtn}
                                        aria-label="Edit comment"
                                    >
                                        <FontAwesomeIcon icon={faPen} className="h-3 w-3 opacity-80" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete?.(comment._id)}
                                        className={dangerBtn}
                                        aria-label="Delete comment"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                    {showReply && (
                        <div className="mt-2 max-w-2xl space-y-2">
                            <textarea
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                rows={2}
                                placeholder="Write a reply..."
                                className={isLight ? textareaLight : textareaDark}
                                autoFocus
                            />
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={handleReply} className={btnPrimary}>
                                    Reply
                                </button>
                                <button type="button" onClick={() => setShowReply(false)} className={btnSecondary}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CommentItem
