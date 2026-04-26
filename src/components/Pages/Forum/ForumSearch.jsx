import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSearch, faFileLines, faUsers, faUser,
    faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons'
import { searchForum, votePost } from '../../../actions/forum'
import { joinCommunity, leaveCommunity } from '../../../actions/community'
import PostCard from '../../Forum/PostCard'
import CommunityCard from '../../Forum/CommunityCard'

const TABS = [
    { id: 'posts', label: 'Posts', icon: faFileLines },
    { id: 'communities', label: 'Communities', icon: faUsers },
    { id: 'users', label: 'Users', icon: faUser },
]

const userJoinDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const UserSearchCard = ({ u, isLight, panelClass }) => {
    const uname = u.username || u.name || 'User'
    const hrefName = u.username || u.name
    const showAt = Boolean(u.username && (!u.name || u.name !== u.username))
    const displayTitle = u.name && u.username && u.name !== u.username ? u.name : uname
    const avatarShell = isLight
        ? 'bg-slate-100 border-slate-200'
        : 'bg-[#252525] border-[#3a3a3a]'

    return (
        <div
            className={`${panelClass} overflow-hidden transition-shadow hover:shadow-sm ${
                isLight ? 'hover:border-slate-300' : 'hover:border-[#3a3a3a]'
            }`}
        >
            <div className="p-4 sm:p-5 flex items-center gap-4">
                <Link
                    to={`/user/${hrefName}`}
                    className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full border flex items-center justify-center overflow-hidden ${
                        avatarShell
                    }`}
                >
                    {u.avatar || u.profileImage
                        ? <img src={u.avatar || u.profileImage} alt="" className="w-full h-full object-cover" />
                        : (
                            <span className={`text-xl font-semibold ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                                {displayTitle[0]?.toUpperCase()}
                            </span>
                        )}
                </Link>
                <div className="min-w-0 flex-1 space-y-1">
                    <div>
                        <Link
                            to={`/user/${hrefName}`}
                            className={`text-base sm:text-lg font-semibold truncate block ${
                                isLight ? 'text-slate-900 hover:text-slate-700' : 'text-white hover:text-gray-200'
                            }`}
                        >
                            {displayTitle}
                        </Link>
                        {showAt && (
                            <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                @{u.username}
                            </p>
                        )}
                    </div>
                    <div
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs ${
                            isLight
                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                : 'bg-[#252525] text-gray-400 border border-[#3a3a3a]'
                        }`}
                    >
                        <span>Joined</span>
                        <time dateTime={u.createdAt || undefined}>
                            {userJoinDate(u.createdAt)}
                        </time>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ForumSearch = ({ user, theme }) => {
    const dispatch = useDispatch()
    const [searchParams, setSearchParams] = useSearchParams()
    const isLight = theme === 'light'
    const { searchResults, searchPagination, isLoading, alert } = useSelector(s => s.forum)

    const qParam = (searchParams.get('q') || '').trim()
    const [input, setInput] = useState(() => qParam)
    const [tab, setTab] = useState('posts')
    const [page, setPage] = useState(1)

    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`

    useEffect(() => { setInput(qParam) }, [qParam])
    useEffect(() => { setPage(1) }, [qParam, tab])

    const runSearch = useCallback((nextPage = 1) => {
        if (!qParam) return
        dispatch(searchForum({ q: qParam, type: tab, page: nextPage, limit: 15 }))
    }, [dispatch, qParam, tab])

    useEffect(() => {
        if (!qParam) return
        runSearch(page)
    }, [qParam, tab, page, runSearch])

    const handleSubmit = (e) => {
        e?.preventDefault()
        const t = (input || '').trim()
        if (!t) {
            setSearchParams({}, { replace: true })
            return
        }
        setSearchParams({ q: t }, { replace: true })
        setPage(1)
    }

    const pag = searchPagination || {}
    const hasResults = (searchResults?.length || 0) > 0
    const typeLabel = tab === 'posts' ? 'posts' : tab === 'communities' ? 'communities' : 'users'
    const tabTitle = TABS.find(t => t.id === tab)?.label || 'Results'

    const inputClass = isLight
        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-300'
        : 'bg-[#141414] border-[#2a2a2a] text-gray-100 placeholder:text-gray-500 focus:border-[#3a3a3a] focus:ring-1 focus:ring-[#3a3a3a]'

    const emptyShell = (icon, title, children) => (
        <div
            className={`${panelClass} text-center px-4 py-14 sm:py-16 border-dashed ${
                isLight ? 'border-slate-200' : 'border-[#2a2a2a]'
            }`}
        >
            <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border ${
                    isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-500'
                        : 'bg-[#252525] border-[#2a2a2a] text-gray-500'
                }`}
            >
                <FontAwesomeIcon icon={icon} className="text-2xl" />
            </div>
            <p className={`text-base sm:text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {title}
            </p>
            <div
                className={`mt-2 text-sm max-w-md mx-auto leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-gray-500'
                }`}
            >
                {children}
            </div>
        </div>
    )

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="mb-6">
                <h1 className={`text-xl sm:text-2xl font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Search
                </h1>
                <p className={`mt-1 text-sm ${isLight ? 'text-slate-600' : 'text-gray-500'}`}>
                    Find posts, communities, and members
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mb-5">
                <div className={`${panelClass} p-2 sm:p-3`}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2">
                        <div className="relative min-w-0 flex-1">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm ${
                                    isLight ? 'text-slate-400' : 'text-gray-500'
                                }`}
                            />
                            <input
                                type="search"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Search the forum…"
                                className={`w-full min-h-[2.75rem] rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition ${inputClass}`}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`shrink-0 min-h-[2.75rem] sm:min-w-[6rem] rounded-lg px-4 text-sm font-medium ${
                                isLight
                                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                                    : 'bg-white text-slate-900 hover:bg-gray-200'
                            }`}
                        >
                            Search
                        </button>
                    </div>
                </div>
            </form>

            <div className="mb-5 border-b border-dashed" />

            <div
                className={`${panelClass} p-1 mb-5 flex flex-wrap sm:flex-nowrap gap-0.5 sm:gap-0`}
                role="tablist"
            >
                {TABS.map(t => {
                    const active = tab === t.id
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                active
                                    ? isLight
                                        ? 'bg-slate-100 text-slate-900'
                                        : 'bg-[#2a2a2a] text-white'
                                    : isLight
                                        ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={t.icon}
                                className="text-xs opacity-80"
                            />
                            {t.label}
                        </button>
                    )
                })}
            </div>

            {!qParam && (
                emptyShell(
                    faSearch,
                    'Search the forum',
                    <>Enter keywords above to find {typeLabel} across the forum.</>
                )
            )}

            {qParam && isLoading && (
                <div
                    className={`${panelClass} flex min-h-[16rem] flex-col items-center justify-center py-16 border-dashed ${
                        isLight ? 'border-slate-200' : 'border-[#2a2a2a]'
                    }`}
                >
                    <div
                        className={`h-9 w-9 animate-spin rounded-full border-2 border-t-transparent ${
                            isLight ? 'border-slate-600' : 'border-gray-500'
                        }`}
                    />
                    <p className={`mt-4 text-sm ${isLight ? 'text-slate-600' : 'text-gray-500'}`}>
                        Searching for “{qParam}”…
                    </p>
                </div>
            )}

            {qParam && !isLoading && tab === 'posts' && !hasResults && (
                emptyShell(
                    faFileLines,
                    'No posts match that query',
                    <>Try different terms, or use the other tabs to find communities and members.</>,
                )
            )}

            {qParam && !isLoading && tab === 'communities' && !hasResults && (
                emptyShell(
                    faUsers,
                    'No communities found',
                    <>
                        No groups matched “{qParam}”. You can also{' '}
                        <Link
                            to="/forum/communities"
                            className={`font-medium underline ${isLight ? 'text-slate-800' : 'text-gray-300'}`}
                        >
                            browse all communities
                        </Link>
                        .
                    </>,
                )
            )}

            {qParam && !isLoading && tab === 'users' && !hasResults && (
                emptyShell(
                    faUser,
                    'No members with that name',
                    <>No usernames matched. Try a partial name or a different spelling.</>,
                )
            )}

            {qParam && !isLoading && hasResults && (
                <div className="mb-4">
                    <p className={`text-xs font-medium uppercase tracking-wide ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                        {tabTitle}
                    </p>
                    <p className={`mt-0.5 text-sm ${isLight ? 'text-slate-600' : 'text-gray-500'}`}>
                        <span className={isLight ? 'text-slate-900' : 'text-white'}>“{qParam}”</span>
                        {pag.pages > 1 && (
                            <span className="ml-1.5">· page {page}</span>
                        )}
                        <span className="ml-1.5">· {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
                    </p>
                </div>
            )}

            {qParam && !isLoading && tab === 'posts' && hasResults && (
                <div className="space-y-3 sm:space-y-4">
                    {searchResults.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            theme={theme}
                            user={user}
                            onVote={(id, v) => dispatch(votePost({ id, value: v }))}
                        />
                    ))}
                </div>
            )}

            {qParam && !isLoading && tab === 'communities' && hasResults && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {searchResults.map(c => (
                        <CommunityCard
                            key={c._id}
                            community={c}
                            theme={theme}
                            user={user}
                            onJoin={(id, inviteCode) => dispatch(joinCommunity({ id, inviteCode }))}
                            onLeave={id => dispatch(leaveCommunity(id))}
                        />
                    ))}
                </div>
            )}

            {qParam && !isLoading && tab === 'users' && hasResults && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {searchResults.map(u => (
                        <UserSearchCard key={u._id || u.id || u.username} u={u} isLight={isLight} panelClass={panelClass} />
                    ))}
                </div>
            )}

            {qParam && !isLoading && hasResults && pag?.pages > 1 && (
                <div
                    className={`${panelClass} mt-5 flex flex-wrap items-center justify-center gap-1 px-2 py-2 sm:px-3`}
                >
                    <button
                        type="button"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${
                            page === 1
                                ? 'cursor-not-allowed opacity-35'
                                : isLight
                                    ? 'text-slate-700 hover:bg-slate-100'
                                    : 'text-gray-400 hover:bg-[#2a2a2a]'
                        }`}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    {Array.from({ length: Math.min(pag.pages, 5) }, (_, i) => {
                        const pn = pag.pages <= 5
                            ? i + 1
                            : Math.min(Math.max(page - 2, 1), pag.pages - 4) + i
                        return (
                            <button
                                type="button"
                                key={pn}
                                onClick={() => setPage(pn)}
                                className={`min-w-[2.25rem] h-9 rounded-lg px-2 text-sm font-medium ${
                                    page === pn
                                        ? isLight
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-white text-slate-900'
                                        : isLight
                                            ? 'text-slate-600 hover:bg-slate-100'
                                            : 'text-gray-500 hover:bg-[#2a2a2a]'
                                }`}
                            >
                                {pn}
                            </button>
                        )
                    })}
                    <button
                        type="button"
                        onClick={() => setPage(p => Math.min(pag.pages, p + 1))}
                        disabled={page === pag.pages}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${
                            page === pag.pages
                                ? 'cursor-not-allowed opacity-35'
                                : isLight
                                    ? 'text-slate-700 hover:bg-slate-100'
                                    : 'text-gray-400 hover:bg-[#2a2a2a]'
                        }`}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            )}
        </div>
    )
}

export default ForumSearch
