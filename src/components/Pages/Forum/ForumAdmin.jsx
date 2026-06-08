import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faGavel, faUsers, faFileLines, faComment,
    faTrash, faExternalLink, faFlag, faCheck, faLock, faThumbtack
} from '@fortawesome/free-solid-svg-icons'
import { getPosts, deletePost, togglePostLock, togglePostPin } from '../../../actions/forum'
import { getCommunities, deleteCommunity, clearAlert } from '../../../actions/community'
import { getForumReports, dismissForumReport } from '../../../endpoint'

const statCardClass = (isLight) =>
    `rounded-xl border p-4 sm:p-5 ${
        isLight
            ? 'border-slate-200/60 bg-white shadow-sm'
            : 'border-[#2a2a2a] bg-[#1a1a1a]'
    }`

const statIconClass = (isLight, tone) => {
    const light = {
        indigo: 'bg-slate-100 text-slate-700 border-slate-200',
        green: 'bg-slate-100 text-slate-700 border-slate-200',
        amber: 'bg-slate-100 text-slate-700 border-slate-200',
    }
    const dark = {
        indigo: 'bg-[#252525] text-gray-300 border-[#3a3a3a]',
        green: 'bg-[#252525] text-gray-300 border-[#3a3a3a]',
        amber: 'bg-[#252525] text-gray-300 border-[#3a3a3a]',
    }
    const map = isLight ? light : dark
    return `flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border ${map[tone]}`
}

const ForumAdmin = ({ user, theme }) => {
    const dispatch = useDispatch()
    const isLight = theme === 'light'
    const me = user?.result || user
    const role = me?.role || 'User'
    const isStaff = role === 'Admin' || role === 'Moderator'
    const isAdmin = role === 'Admin'

    const { data: communities, pagination, isLoading, alert } = useSelector(s => s.community)
    const { posts, pagination: postPagination, isLoading: postLoading } = useSelector(s => s.forum)

    const [tab, setTab] = useState('communities')
    const [page, setPage] = useState(1)
    const [deleteId, setDeleteId] = useState(null)
    const [reports, setReports] = useState([])
    const [reportsLoading, setReportsLoading] = useState(false)

    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`
    const thClass = `text-left text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-gray-500'}`
    const tdClass = `py-3 px-3 text-sm ${isLight ? 'text-slate-700' : 'text-gray-200'}`

    const totalCommunities = pagination?.total ?? 0
    const totalPosts = postPagination?.total ?? 0
    const commentsSampleTotal = useMemo(
        () => (posts || []).reduce((s, p) => s + (p.commentCount || 0), 0),
        [posts]
    )

    useEffect(() => {
        dispatch(getCommunities({ page, limit: 15, sort: 'popular' }))
    }, [dispatch, page])

    useEffect(() => {
        dispatch(getPosts({ page: 1, limit: 20, sort: 'new' }))
    }, [dispatch])

    useEffect(() => {
        if (tab === 'reports' && isStaff) {
            setReportsLoading(true)
            getForumReports({ limit: 20 })
                .then(res => setReports(res?.data?.result || []))
                .catch(() => {})
                .finally(() => setReportsLoading(false))
        }
    }, [tab, isStaff])

    const handleDismissReport = async (id) => {
        try {
            await dismissForumReport(id)
            setReports(prev => prev.filter(r => r._id !== id))
        } catch {}
    }

    const handleDeletePost = (id) => {
        dispatch(deletePost(id))
    }

    const handleToggleLock = (id) => {
        dispatch(togglePostLock(id))
    }

    const handleTogglePin = (id) => {
        dispatch(togglePostPin(id))
    }

    useEffect(() => {
        if (Object.keys(alert || {}).length > 0) {
            const timer = setTimeout(() => dispatch(clearAlert()), 4000)
            return () => clearTimeout(timer)
        }
    }, [alert, dispatch])

    const askDelete = (id) => {
        setDeleteId(id)
    }

    const confirmDelete = () => {
        if (deleteId) {
            dispatch(deleteCommunity(deleteId))
        }
        setDeleteId(null)
    }

    if (!isStaff) {
        return (
            <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-14 min-h-screen">
                <div className={`${panelClass} p-6 sm:p-8 text-center`}>
                    <div
                        className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border ${
                            isLight ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-[#3a3a3a] bg-[#252525] text-gray-400'
                        }`}
                    >
                        <FontAwesomeIcon icon={faGavel} className="text-lg" />
                    </div>
                    <h1 className={`text-lg font-semibold sm:text-xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Access denied
                    </h1>
                    <p className={`mt-2 text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-500'}`}>
                        Forum administration is only available to administrators and moderators. Contact a site admin if you need access.
                    </p>
                    <div
                        className={`mt-5 rounded-lg border px-3 py-2.5 text-left text-xs ${
                            isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-[#2a2a2a] bg-[#141414] text-gray-500'
                        }`}
                    >
                        Your current role does not include forum moderation tools.
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-screen">
            <div className="mb-6 sm:mb-8">
                <h1 className={`text-xl sm:text-2xl font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Forum admin
                </h1>
                <p className={`mt-1 text-sm ${isLight ? 'text-slate-600' : 'text-gray-500'}`}>
                    Overview and community management
                </p>
            </div>

            {alert?.message && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium border ${
                    alert.variant === 'success'
                        ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-900/20 border-emerald-800/40 text-emerald-400')
                        : (isLight ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-900/20 border-red-800/40 text-red-400')
                }`}>
                    {alert.message}
                </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <div className={statCardClass(isLight)}>
                    <div className="flex items-start gap-3">
                        <div className={statIconClass(isLight, 'indigo')}>
                            <FontAwesomeIcon icon={faUsers} className="text-sm" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                Communities
                            </span>
                            <p className={`mt-0.5 text-2xl font-semibold tabular-nums sm:text-3xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {isLoading ? '—' : totalCommunities}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={statCardClass(isLight)}>
                    <div className="flex items-start gap-3">
                        <div className={statIconClass(isLight, 'green')}>
                            <FontAwesomeIcon icon={faFileLines} className="text-sm" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                Posts
                            </span>
                            <p className={`mt-0.5 text-2xl font-semibold tabular-nums sm:text-3xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {postLoading ? '—' : totalPosts}
                            </p>
                        </div>
                    </div>
                </div>
                <div
                    className={statCardClass(isLight)}
                    title="Sum of comment counts on the latest posts loaded for this sample (up to 500). Wire a global stats endpoint for exact totals if needed."
                >
                    <div className="flex items-start gap-3">
                        <div className={statIconClass(isLight, 'amber')}>
                            <FontAwesomeIcon icon={faComment} className="text-sm" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                Comments
                            </span>
                            <p className={`mt-0.5 text-2xl font-semibold tabular-nums sm:text-3xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {postLoading ? '—' : commentsSampleTotal}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${panelClass} p-1 mb-5 flex`}>
                <button
                    type="button"
                    onClick={() => setTab('communities')}
                    className={`flex min-h-[2.5rem] flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                        tab === 'communities'
                            ? isLight
                                ? 'bg-slate-100 text-slate-900'
                                : 'bg-[#2a2a2a] text-white'
                            : isLight
                                ? 'text-slate-500 hover:text-slate-800'
                                : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <FontAwesomeIcon icon={faUsers} className="text-xs" />
                    Communities
                </button>
                <button
                    type="button"
                    onClick={() => setTab('posts')}
                    className={`flex min-h-[2.5rem] flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                        tab === 'posts'
                            ? isLight
                                ? 'bg-slate-100 text-slate-900'
                                : 'bg-[#2a2a2a] text-white'
                            : isLight
                                ? 'text-slate-500 hover:text-slate-800'
                                : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <FontAwesomeIcon icon={faFileLines} className="text-xs" />
                    Posts
                </button>
                <button
                    type="button"
                    onClick={() => setTab('reports')}
                    className={`flex min-h-[2.5rem] flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                        tab === 'reports'
                            ? isLight
                                ? 'bg-slate-100 text-slate-900'
                                : 'bg-[#2a2a2a] text-white'
                            : isLight
                                ? 'text-slate-500 hover:text-slate-800'
                                : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <FontAwesomeIcon icon={faFlag} className="text-xs" />
                    Reports{reports.length > 0 ? ` (${reports.length})` : ''}
                </button>
            </div>

            {tab === 'communities' && (
                <div>
                    {isLoading && (!communities || communities.length === 0) ? (
                        <div className={`${panelClass} flex items-center justify-center py-20`}>
                            <div
                                className={`h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${
                                    isLight ? 'border-slate-600' : 'border-gray-500'
                                }`}
                            />
                        </div>
                    ) : (
                        <>
                            <div className={`${panelClass} overflow-hidden`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[640px] border-collapse">
                                        <thead>
                                            <tr
                                                className={`border-b ${
                                                    isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2a2a2a] bg-[#141414]'
                                                }`}
                                            >
                                                <th className={`${thClass} pl-4 py-3`}>Community</th>
                                                <th className={`${thClass} py-3`}>Members</th>
                                                <th className={`${thClass} py-3`}>Posts</th>
                                                <th className={`${thClass} py-3`}>Creator</th>
                                                {isAdmin && <th className={`${thClass} w-20 py-3 pr-4 text-right`} aria-label="Actions" />}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(communities || []).map(c => (
                                                <tr
                                                    key={c._id}
                                                    className={`border-b last:border-0 ${
                                                        isLight
                                                            ? 'border-slate-100 hover:bg-slate-50/80'
                                                            : 'border-[#2a2a2a] hover:bg-[#222]'
                                                    }`}
                                                >
                                                    <td className={`${tdClass} pl-4`}>
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div
                                                                className={`h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border ${
                                                                    isLight ? 'border-slate-200' : 'border-[#3a3a3a]'
                                                                }`}
                                                            >
                                                                {c.icon ? (
                                                                    <img src={c.icon} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div
                                                                        className={`flex h-full w-full items-center justify-center text-sm font-semibold ${
                                                                            isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#252525] text-gray-400'
                                                                        }`}
                                                                    >
                                                                        {c.name?.[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <Link
                                                                    to={`/forum/c/${c.slug}`}
                                                                    className={`block truncate font-medium hover:underline ${
                                                                        isLight ? 'text-slate-800' : 'text-gray-200'
                                                                    }`}
                                                                >
                                                                    {c.name}
                                                                </Link>
                                                                <p className={`truncate text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                                    c/{c.slug}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={`${tdClass} tabular-nums`}>{c.memberCount ?? 0}</td>
                                                    <td className={`${tdClass} tabular-nums`}>{c.postCount ?? 0}</td>
                                                    <td className={tdClass}>
                                                        {c.creator?.username ? (
                                                            <Link
                                                                to={`/user/${c.creator.username}`}
                                                                className={`text-sm hover:underline ${isLight ? 'text-slate-700' : 'text-gray-300'}`}
                                                            >
                                                                {c.creator.username}
                                                            </Link>
                                                        ) : c.createdBy && typeof c.createdBy === 'object' ? (
                                                            <span className="text-sm opacity-80">{c.createdBy.username || '—'}</span>
                                                        ) : (
                                                            <span className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>—</span>
                                                        )}
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="pr-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => askDelete(c._id)}
                                                                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm ${
                                                                    isLight
                                                                        ? 'text-red-600 hover:bg-red-50'
                                                                        : 'text-red-400 hover:bg-red-950/30'
                                                                }`}
                                                                aria-label="Delete community"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {(!communities || communities.length === 0) && !isLoading && (
                                <div className={`${panelClass} mt-3 py-12 text-center`}>
                                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                        No communities yet.
                                    </p>
                                </div>
                            )}

                            {pagination?.pages > 1 && (
                                <div className={`${panelClass} mt-4 flex flex-wrap items-center justify-center gap-2 px-3 py-2`}>
                                    <button
                                        type="button"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                                            page === 1
                                                ? 'cursor-not-allowed opacity-35'
                                                : isLight
                                                    ? 'text-slate-800 border border-slate-200 hover:bg-slate-50'
                                                    : 'text-gray-300 border border-[#3a3a3a] hover:bg-[#252525]'
                                        }`}
                                    >
                                        Previous
                                    </button>
                                    <span className={`min-w-[6rem] text-center text-sm tabular-nums ${isLight ? 'text-slate-600' : 'text-gray-500'}`}>
                                        Page {page} of {pagination.pages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                        disabled={page === pagination.pages}
                                        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                                            page === pagination.pages
                                                ? 'cursor-not-allowed opacity-35'
                                                : isLight
                                                    ? 'text-slate-800 border border-slate-200 hover:bg-slate-50'
                                                    : 'text-gray-300 border border-[#3a3a3a] hover:bg-[#252525]'
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {tab === 'posts' && (
                <div className={panelClass}>
                    {postLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className={`h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${isLight ? 'border-indigo-600' : 'border-indigo-500'}`} />
                        </div>
                    ) : posts?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className={`border-b ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2a2a2a] bg-[#141414]'}`}>
                                    <tr>
                                        <th className={`px-3 py-3 ${thClass}`}>Post</th>
                                        <th className={`px-3 py-3 ${thClass}`}>Community</th>
                                        <th className={`px-3 py-3 ${thClass}`}>Author</th>
                                        <th className={`px-3 py-3 text-right ${thClass}`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#2a2a2a]'}`}>
                                    {posts.map(p => (
                                        <tr key={p._id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-[#222]'}>
                                            <td className={`${tdClass} max-w-[200px]`}>
                                                <Link to={`/forum/post/${p._id}`} className={`font-medium truncate block ${isLight ? 'text-indigo-600 hover:underline' : 'text-indigo-400 hover:underline'}`}>
                                                    {p.title}
                                                </Link>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {p.isPinned && <span className="text-[10px] text-amber-500"><FontAwesomeIcon icon={faThumbtack} /></span>}
                                                    {p.isLocked && <span className="text-[10px] text-red-500"><FontAwesomeIcon icon={faLock} /></span>}
                                                </div>
                                            </td>
                                            <td className={tdClass}>{p.community?.name || '—'}</td>
                                            <td className={tdClass}>{p.author?.username || '—'}</td>
                                            <td className={`${tdClass} text-right`}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => handleTogglePin(p._id)} title={p.isPinned ? 'Unpin' : 'Pin'} className={`p-1.5 rounded text-xs ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#2a2a2a] text-gray-400'}`}>
                                                        <FontAwesomeIcon icon={faThumbtack} />
                                                    </button>
                                                    <button onClick={() => handleToggleLock(p._id)} title={p.isLocked ? 'Unlock' : 'Lock'} className={`p-1.5 rounded text-xs ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#2a2a2a] text-gray-400'}`}>
                                                        <FontAwesomeIcon icon={faLock} />
                                                    </button>
                                                    {isAdmin && (
                                                        <button onClick={() => handleDeletePost(p._id)} title="Delete" className={`p-1.5 rounded text-xs ${isLight ? 'hover:bg-red-50 text-red-500' : 'hover:bg-red-950/30 text-red-400'}`}>
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>No posts found</p>
                        </div>
                    )}
                </div>
            )}

            {tab === 'reports' && (
                <div className={panelClass}>
                    {reportsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className={`h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${isLight ? 'border-indigo-600' : 'border-indigo-500'}`} />
                        </div>
                    ) : reports.length > 0 ? (
                        <div className="divide-y ${isLight ? 'divide-slate-200' : 'divide-[#2a2a2a]'}">
                            {reports.map(r => (
                                <div key={r._id} className={`px-4 py-3 sm:px-5 flex items-start gap-3 ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#222]'}`}>
                                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isLight ? 'bg-red-100 text-red-600' : 'bg-red-900/20 text-red-400'}`}>
                                        <FontAwesomeIcon icon={faFlag} className="text-xs" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                                            {r.type === 'forum_post' ? 'Post' : 'Comment'} reported
                                        </p>
                                        <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                            By {r.name || r.user?.username || 'Unknown'} &middot; {r.reason} &middot; {new Date(r.createdAt).toLocaleDateString()}
                                        </p>
                                        {r.details && r.details !== 'No additional details' && (
                                            <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                                "{r.details}"
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDismissReport(r._id)}
                                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                                            isLight ? 'border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200' : 'border-[#2a2a2a] text-gray-400 hover:bg-emerald-900/20 hover:text-emerald-400 hover:border-emerald-800/40'
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                        Dismiss
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border ${isLight ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-[#3a3a3a] bg-[#252525] text-gray-400'}`}>
                                <FontAwesomeIcon icon={faCheck} className="text-base" />
                            </div>
                            <p className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>All clear</p>
                            <p className={`mt-1 text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>No pending forum reports</p>
                        </div>
                    )}
                </div>
            )}

            {deleteId && isAdmin && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-community-title"
                    onClick={() => setDeleteId(null)}
                >
                    <div
                        className={`${panelClass} w-full max-w-md p-0 sm:max-w-lg`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div
                            className={`border-b px-5 py-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2a2a2a] bg-[#141414]'}`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border ${
                                        isLight ? 'border-red-200 bg-red-50 text-red-600' : 'border-red-900/50 bg-red-950/40 text-red-400'
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                </div>
                                <div className="min-w-0 pt-0.5">
                                    <h2
                                        id="delete-community-title"
                                        className={`text-base font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}
                                    >
                                        Delete this community?
                                    </h2>
                                    <p className={`mt-1.5 text-sm ${isLight ? 'text-slate-600' : 'text-gray-500'}`}>
                                        This will remove the community and its content from the directory. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 px-5 py-4">
                            <button
                                type="button"
                                onClick={() => setDeleteId(null)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                                    isLight
                                        ? 'border border-slate-200 text-slate-800 hover:bg-slate-50'
                                        : 'border border-[#3a3a3a] text-gray-200 hover:bg-[#252525]'
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ForumAdmin
