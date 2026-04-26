import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faSearch, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { getCommunities, joinCommunity, leaveCommunity } from '../../../actions/community'
import CommunityCard from '../../Forum/CommunityCard'

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
    const inputClass = isLight
        ? 'w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
        : 'w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-[#333] bg-[#1a1a1a] text-gray-200 placeholder:text-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40'

    useEffect(() => {
        const params = { page, limit: 12, sort }
        if (search.trim()) params.search = search.trim()
        if (tab === 'joined') params.joined = 'true'
        dispatch(getCommunities(params))
    }, [page, sort, tab, dispatch])

    const handleSearch = (e) => {
        e.preventDefault()
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
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }
        const start = Math.min(Math.max(page - 2, 1), totalPages - 4)
        return Array.from({ length: 5 }, (_, i) => start + i)
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
            <header className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className={`text-xl font-semibold tracking-tight sm:text-2xl ${textPrimary}`}>
                        Communities
                    </h1>
                    <p className={`mt-0.5 text-sm ${muted}`}>
                        {totalCount == null ? 'Loading…' : `${totalCount.toLocaleString()} total`}
                    </p>
                </div>
                {user && (
                    <Link
                        to="/forum/communities/new"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 w-full sm:w-auto"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xs" />
                        Create
                    </Link>
                )}
            </header>

            <div className={`${panelClass} mb-5 p-2.5 sm:p-3`}>
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-3"
                >
                    <div className="relative min-w-0 flex-1">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${isLight ? 'text-slate-400' : 'text-gray-500'}`}
                        />
                        <input
                            type="search"
                            name="search"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search communities"
                            autoComplete="off"
                            className={inputClass}
                        />
                    </div>

                    {user && (
                        <div
                            className={`flex shrink-0 rounded-lg p-0.5 ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`}
                            role="tablist"
                            aria-label="Communities list"
                        >
                            <button
                                type="button"
                                role="tab"
                                aria-selected={tab === 'all'}
                                onClick={() => { setTab('all'); setPage(1) }}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                                    tab === 'all'
                                        ? (isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-[#2a2a2a] text-white')
                                        : (isLight ? 'text-slate-500' : 'text-gray-500')
                                }`}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={tab === 'joined'}
                                onClick={() => { setTab('joined'); setPage(1) }}
                                className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                                    tab === 'joined'
                                        ? (isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-[#2a2a2a] text-white')
                                        : (isLight ? 'text-slate-500' : 'text-gray-500')
                                }`}
                            >
                                <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
                                Joined
                            </button>
                        </div>
                    )}

                    <div className="flex shrink-0 items-center gap-2 lg:ml-0">
                        <label htmlFor="community-sort" className="sr-only">Sort</label>
                        <select
                            id="community-sort"
                            value={sort}
                            onChange={e => { setSort(e.target.value); setPage(1) }}
                            className={`h-9 min-h-9 w-full min-w-[8.5rem] rounded-lg border px-2.5 text-xs font-medium sm:w-auto ${
                                isLight
                                    ? 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
                                    : 'border-[#333] bg-[#1a1a1a] text-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40'
                            }`}
                        >
                            <option value="popular">Popular</option>
                            <option value="new">Newest</option>
                            <option value="name">A–Z</option>
                        </select>
                        <button
                            type="button"
                            onClick={handleSearch}
                            className={`h-9 shrink-0 rounded-lg px-3 text-xs font-medium ${
                                isLight
                                    ? 'border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                                    : 'border border-[#333] bg-[#222] text-gray-200 hover:bg-[#2a2a2a]'
                            }`}
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className={`h-9 w-9 animate-spin rounded-full border-2 border-t-transparent ${isLight ? 'border-indigo-600' : 'border-indigo-500'}`} />
                </div>
            ) : communities?.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
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
            ) : (
                <div className={`${panelClass} px-4 py-12 text-center sm:py-14`}>
                    <div
                        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg border ${isLight ? 'border-slate-200 bg-slate-50 text-indigo-600' : 'border-[#2a2a2a] bg-[#222] text-indigo-400'}`}
                    >
                        <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
                    </div>
                    <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-100'}`}>
                        {search ? 'No communities match your search' : 'No communities yet'}
                    </p>
                    <p className={`mx-auto mt-1 max-w-sm text-sm ${muted}`}>
                        {search
                            ? 'Try other keywords or clear the search.'
                            : (user
                                ? 'Create one to get started.'
                                : 'Check back later or sign in to create a community.')}
                    </p>
                </div>
            )}

            {pagination?.pages > 1 && (
                <div className="mt-6 flex items-center justify-center">
                    <nav
                        className={`inline-flex items-center gap-0.5 rounded-lg border p-0.5 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2a2a2a] bg-[#1a1a1a]'}`}
                        aria-label="Pagination"
                    >
                        <button
                            type="button"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`flex h-8 w-8 items-center justify-center rounded-md text-xs ${
                                page === 1
                                    ? 'cursor-not-allowed opacity-35'
                                    : (isLight ? 'text-slate-600 hover:bg-white' : 'text-gray-400 hover:bg-[#2a2a2a]')
                            }`}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        {pageNumbers().map(pn => (
                            <button
                                key={pn}
                                type="button"
                                onClick={() => setPage(pn)}
                                className={`flex h-8 min-w-[2rem] items-center justify-center rounded-md px-1.5 text-xs font-medium ${
                                    page === pn
                                        ? (isLight ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white')
                                        : (isLight ? 'text-slate-600 hover:bg-white' : 'text-gray-400 hover:bg-[#2a2a2a]')
                                }`}
                            >
                                {pn}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                            disabled={page === pagination.pages}
                            className={`flex h-8 w-8 items-center justify-center rounded-md text-xs ${
                                page === pagination.pages
                                    ? 'cursor-not-allowed opacity-35'
                                    : (isLight ? 'text-slate-600 hover:bg-white' : 'text-gray-400 hover:bg-[#2a2a2a]')
                            }`}
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </nav>
                </div>
            )}
        </div>
    )
}

export default CommunityList
