import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faUsers, faSearch, faPlus, faChevronLeft, faChevronRight,
    faFire, faClock, faArrowDownAZ, faGlobe, faUserGroup, faCompass
} from '@fortawesome/free-solid-svg-icons'
import { getCommunities, joinCommunity, leaveCommunity } from '../../../actions/community'
import CommunityCard from '../../Forum/CommunityCard'
import { SearchSkeleton } from '../../Forum/ForumSkeleton'

const SORT_OPTIONS = [
    { id: 'popular', label: 'Popular', icon: faFire },
    { id: 'new', label: 'Newest', icon: faClock },
    { id: 'name', label: 'A\u2013Z', icon: faArrowDownAZ },
]

const TAB_OPTIONS = [
    { id: 'all', label: 'Discover', icon: faCompass },
    { id: 'joined', label: 'My Communities', icon: faUserGroup },
]

const CommunityList = ({ user, theme }) => {
    const dispatch = useDispatch()
    const isLight = theme === 'light'
    const { data: communities, pagination, isLoading } = useSelector(s => s.community)

    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('popular')
    const [page, setPage] = useState(1)
    const [tab, setTab] = useState('all')

    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`
    const muted = isLight ? 'text-slate-500' : 'text-gray-500'
    const textPrimary = isLight ? 'text-slate-900' : 'text-white'

    useEffect(() => {
        const params = { page, limit: 12, sort }
        if (search.trim()) params.search = search.trim()
        if (tab === 'joined') params.joined = 'true'
        dispatch(getCommunities(params))
    }, [page, sort, tab, dispatch])

    const handleSearch = (e) => {
        e?.preventDefault()
        setPage(1)
        const params = { page: 1, limit: 12, sort }
        if (search.trim()) params.search = search.trim()
        if (tab === 'joined') params.joined = 'true'
        dispatch(getCommunities(params))
    }

    const totalCount = isLoading ? null : (pagination?.total ?? 0)

    const pageNumbers = () => {
        if (!pagination?.pages) return []
        const { pages: totalPages } = pagination
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
        const start = Math.min(Math.max(page - 2, 1), totalPages - 4)
        return Array.from({ length: 5 }, (_, i) => start + i)
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-screen">
            {/* Hero Header */}
            <header className="mb-6 sm:mb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3.5">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isLight ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-indigo-600 to-purple-700'}`}>
                            <FontAwesomeIcon icon={faGlobe} className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className={`text-xl font-bold tracking-tight sm:text-2xl ${textPrimary}`}>
                                Communities
                            </h1>
                            <p className={`mt-0.5 text-sm ${muted}`}>
                                {totalCount == null
                                    ? 'Discovering communities...'
                                    : `${totalCount.toLocaleString()} ${totalCount === 1 ? 'community' : 'communities'} to explore`}
                            </p>
                        </div>
                    </div>
                    {user && (
                        <Link
                            to="/forum/communities/new"
                            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all w-full sm:w-auto
                                ${isLight
                                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-sm shadow-indigo-200'
                                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-sm shadow-indigo-900/30'}`}
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-xs" />
                            Create Community
                        </Link>
                    )}
                </div>
            </header>

            {/* Tabs */}
            {user && (
                <div className="mb-5">
                    <div className={`inline-flex rounded-xl p-1 ${isLight ? 'bg-slate-100' : 'bg-[#141414] border border-[#2a2a2a]'}`} role="tablist">
                        {TAB_OPTIONS.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                role="tab"
                                aria-selected={tab === t.id}
                                onClick={() => { setTab(t.id); setPage(1) }}
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                    tab === t.id
                                        ? isLight
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'bg-[#2a2a2a] text-white shadow-sm'
                                        : isLight
                                            ? 'text-slate-500 hover:text-slate-700'
                                            : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <FontAwesomeIcon icon={t.icon} className="text-xs" />
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Search & Sort Bar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <form onSubmit={handleSearch} className="relative min-w-0 flex-1">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none ${isLight ? 'text-slate-400' : 'text-gray-500'}`}
                    />
                    <input
                        type="search"
                        name="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search communities..."
                        autoComplete="off"
                        className={`w-full min-h-[2.75rem] rounded-xl border py-2.5 pl-10 pr-12 text-sm outline-none transition ${
                            isLight
                                ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-sm'
                                : 'border-[#2a2a2a] bg-[#1a1a1a] text-gray-100 placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10'
                        }`}
                    />
                    <button
                        type="submit"
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            isLight
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-indigo-600 text-white hover:bg-indigo-500'
                        }`}
                    >
                        <FontAwesomeIcon icon={faSearch} className="text-xs" />
                    </button>
                </form>

                <div className={`flex shrink-0 rounded-xl p-1 ${isLight ? 'bg-slate-100 border border-slate-200/60' : 'bg-[#141414] border border-[#2a2a2a]'}`}>
                    {SORT_OPTIONS.map(s => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => { setSort(s.id); setPage(1) }}
                            title={s.label}
                            className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition ${
                                sort === s.id
                                    ? isLight
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'bg-[#2a2a2a] text-white'
                                    : isLight
                                        ? 'text-slate-500 hover:text-slate-700'
                                        : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <FontAwesomeIcon icon={s.icon} className="text-[10px]" />
                            <span className="hidden sm:inline">{s.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className={`${panelClass} overflow-hidden animate-pulse`}>
                            <div className={`h-20 w-full ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`} />
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className={`h-10 w-10 rounded-lg ${isLight ? 'bg-slate-200' : 'bg-[#2a2a2a]'}`} />
                                    <div className="flex-1 space-y-1.5">
                                        <div className={`h-4 w-3/4 rounded ${isLight ? 'bg-slate-200' : 'bg-[#2a2a2a]'}`} />
                                        <div className={`h-3 w-1/2 rounded ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`} />
                                    </div>
                                </div>
                                <div className={`h-3 w-full rounded ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`} />
                                <div className="flex gap-2">
                                    <div className={`h-9 flex-1 rounded-md ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`} />
                                    <div className={`h-9 flex-1 rounded-md ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : communities?.length > 0 ? (
                <>
                    <div className="mb-3 flex items-center justify-between">
                        <p className={`text-xs font-medium uppercase tracking-wide ${muted}`}>
                            {tab === 'joined' ? 'Your communities' : 'All communities'}
                            {totalCount != null && <span className="ml-1.5">({totalCount})</span>}
                        </p>
                        {pagination?.pages > 1 && (
                            <p className={`text-xs tabular-nums ${muted}`}>
                                Page {page} of {pagination.pages}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {communities.map(c => (
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
                </>
            ) : (
                <div className={`${panelClass} px-6 py-16 text-center`}>
                    <div
                        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
                            isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#222] text-gray-500'
                        }`}
                    >
                        <FontAwesomeIcon icon={tab === 'joined' ? faUserGroup : faUsers} className="h-7 w-7" />
                    </div>
                    <p className={`text-base font-semibold ${textPrimary}`}>
                        {search
                            ? 'No communities found'
                            : tab === 'joined'
                                ? "You haven't joined any communities yet"
                                : 'No communities yet'}
                    </p>
                    <p className={`mx-auto mt-2 max-w-sm text-sm leading-relaxed ${muted}`}>
                        {search
                            ? 'Try different keywords or clear your search to browse all communities.'
                            : tab === 'joined'
                                ? 'Explore and join communities that match your interests.'
                                : user
                                    ? 'Be the first to create a community and start building something amazing.'
                                    : 'Check back later or sign in to create a community.'}
                    </p>
                    {!search && tab === 'joined' && (
                        <button
                            type="button"
                            onClick={() => setTab('all')}
                            className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                                isLight
                                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                    : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                            }`}
                        >
                            <FontAwesomeIcon icon={faCompass} className="text-xs" />
                            Discover communities
                        </button>
                    )}
                </div>
            )}

            {/* Pagination */}
            {!isLoading && pagination?.pages > 1 && (
                <div className="mt-8 flex items-center justify-center">
                    <nav
                        className={`inline-flex items-center gap-1 rounded-xl border p-1.5 ${
                            isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-[#2a2a2a] bg-[#1a1a1a]'
                        }`}
                        aria-label="Pagination"
                    >
                        <button
                            type="button"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm transition ${
                                page === 1
                                    ? 'cursor-not-allowed opacity-30'
                                    : isLight
                                        ? 'text-slate-600 hover:bg-slate-100'
                                        : 'text-gray-400 hover:bg-[#2a2a2a]'
                            }`}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                        </button>
                        {pageNumbers().map(pn => (
                            <button
                                key={pn}
                                type="button"
                                onClick={() => setPage(pn)}
                                className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
                                    page === pn
                                        ? isLight
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-indigo-600 text-white shadow-sm'
                                        : isLight
                                            ? 'text-slate-600 hover:bg-slate-100'
                                            : 'text-gray-400 hover:bg-[#2a2a2a]'
                                }`}
                            >
                                {pn}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                            disabled={page === pagination.pages}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm transition ${
                                page === pagination.pages
                                    ? 'cursor-not-allowed opacity-30'
                                    : isLight
                                        ? 'text-slate-600 hover:bg-slate-100'
                                        : 'text-gray-400 hover:bg-[#2a2a2a]'
                            }`}
                        >
                            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                        </button>
                    </nav>
                </div>
            )}
        </div>
    )
}

export default CommunityList
