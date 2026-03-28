import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faGamepad, faSearch, faChevronRight, faChevronLeft, faAngleDoubleLeft,
    faAngleDoubleRight, faHome, faFilter, faTimes, faTag, faStar, faDownload,
    faEye, faLayerGroup, faArrowRight, faCode, faHeart
} from '@fortawesome/free-solid-svg-icons'
import { getGames, getGameBySearchKey, getGameByDeveloper, categoriesCount, countTags, clearAlert, toggleFavoriteGame, getFavoriteGames } from '../../actions/game'
import { getSettings } from '../../endpoint'
import { main, dark, light } from '../../style'
import styles from '../../style'

const ITEMS_PER_PAGE = 20

const divideAndScale = (ratings) => {
    if (!ratings || ratings.length === 0) return 0
    const total = ratings.reduce((sum, item) => sum + item.rating, 0)
    return (total / ratings.length).toFixed(1)
}

const StarRating = ({ rating, isLight }) => {
    const full = Math.floor(rating)
    const partial = rating - full
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <span key={i} className="relative text-[10px]">
                    <FontAwesomeIcon icon={faStar} className={isLight ? 'text-slate-200' : 'text-gray-700'} />
                    {i < full && <FontAwesomeIcon icon={faStar} className="text-amber-400 absolute inset-0" />}
                    {i === full && partial > 0 && (
                        <span className="absolute inset-0 overflow-hidden" style={{ width: `${partial * 100}%` }}>
                            <FontAwesomeIcon icon={faStar} className="text-amber-400" />
                        </span>
                    )}
                </span>
            ))}
        </div>
    )
}

const GameCard = ({ game, isLight, isFavorited, onToggleFavorite }) => {
    const rating = divideAndScale(game.ratings)
    const viewCount = game.views?.length || 0

    return (
        <Link to={`/games/${game._id}`} className="block group">
            <div className={`rounded-xl overflow-hidden transition-all duration-300 h-full flex flex-col ${isLight
                ? 'bg-white/90 border border-solid border-slate-200/80 shadow-sm hover:shadow-lg hover:border-blue-200/80 hover:-translate-y-0.5'
                : 'bg-[#0e0e0e] border border-solid border-[#2B2B2B] hover:border-[#444] hover:-translate-y-0.5'
            }`}>
                <div className="relative aspect-[16/10] overflow-hidden">
                    {game.featured_image ? (
                        <img src={game.featured_image} alt={game.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-gradient-to-br from-slate-50 to-slate-100' : 'bg-gradient-to-br from-[#111] to-[#1a1a1a]'}`}>
                            <FontAwesomeIcon icon={faGamepad} className={`text-3xl ${isLight ? 'text-slate-200' : 'text-gray-700'}`} />
                        </div>
                    )}
                    {game.category && (
                        <div className="absolute top-2.5 left-2.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md uppercase tracking-wider ${isLight ? 'bg-white/85 text-slate-600' : 'bg-black/55 text-gray-200'}`}>
                                {game.category}
                            </span>
                        </div>
                    )}
                    {onToggleFavorite && (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(game._id) }}
                            className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-10 ${isFavorited
                                ? 'bg-red-500/90 text-white hover:bg-red-600'
                                : (isLight ? 'bg-white/80 text-slate-400 hover:text-red-500 hover:bg-white' : 'bg-black/50 text-gray-400 hover:text-red-400 hover:bg-black/70')
                            }`}
                        >
                            <FontAwesomeIcon icon={faHeart} className="text-[10px]" />
                        </button>
                    )}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none ${isLight ? 'bg-blue-500/10' : 'bg-blue-500/5'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${isLight ? 'bg-white/80' : 'bg-black/50'}`}>
                            <FontAwesomeIcon icon={faArrowRight} className={`text-sm ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                        </div>
                    </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col">
                    <h3 className={`text-[13px] font-semibold leading-snug truncate mb-0.5 ${isLight ? 'text-slate-800' : 'text-gray-100'}`}>{game.title}</h3>
                    <p className={`text-[11px] truncate mb-2.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                        {game.user?.username || game.details?.developer || 'Unknown'}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5">
                            <StarRating rating={parseFloat(rating)} isLight={isLight} />
                            <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{rating > 0 ? rating : ''}</span>
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                            <FontAwesomeIcon icon={faEye} className="text-[8px]" />
                            <span>{viewCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

const SkeletonCard = ({ isLight }) => {
    const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`
    return (
        <div className={`rounded-xl overflow-hidden ${isLight ? 'bg-white/90 border border-solid border-slate-200/80' : 'bg-[#0e0e0e] border border-solid border-[#2B2B2B]'}`}>
            <div className={`aspect-[16/10] ${pulse}`} />
            <div className="p-3.5 space-y-2">
                <div className={`h-4 w-3/4 ${pulse}`} />
                <div className={`h-3 w-1/2 ${pulse}`} />
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => <div key={i} className={`w-3 h-3 rounded-sm ${pulse}`} />)}
                    </div>
                    <div className={`h-3 w-8 ${pulse}`} />
                </div>
            </div>
        </div>
    )
}

const GamesPage = ({ user, theme }) => {
    const { key, developer } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const gameList = useSelector((state) => state.game.games)
    const tagsList = useSelector((state) => state.game.tagsCount)
    const categoriesList = useSelector((state) => state.game.categoriesCount)
    const message = useSelector((state) => state.game.message)
    const gamesLoading = useSelector((state) => state.game.gamesLoading)
    const favoriteGames = useSelector((state) => state.game.favoriteGames)

    const isLight = theme === 'light'
    const userId = user?._id || user?.result?._id || ''

    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [page, setPage] = useState(0)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [sortType, setSortType] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [safeContent, setSafeContent] = useState(true)

    useEffect(() => {
        if (userId) {
            getSettings().then(res => {
                setSafeContent(res.data?.result?.safe_content !== true)
            }).catch(() => {})
            dispatch(getFavoriteGames({ userId }))
        }
    }, [userId])

    useEffect(() => {
        if (key) {
            dispatch(getGameBySearchKey({ id: userId, searchKey: key }))
        } else if (developer) {
            dispatch(getGameByDeveloper({ id: userId, developer }))
        } else {
            dispatch(getGames({ id: userId }))
            dispatch(countTags({ id: userId }))
        }
        dispatch(categoriesCount({ id: userId }))
        setPage(0)
        setSelectedCategory('')
        setSelectedTags([])
        setSearch('')
        setSearchInput('')
    }, [dispatch, key, developer, userId])

    const isLoaded = !gamesLoading && gameList !== undefined

    const handleSearch = (e) => {
        e.preventDefault()
        const val = searchInput.trim()
        if (val) {
            navigate(`/games/search/${encodeURIComponent(val)}`)
        } else if (key) {
            navigate('/games')
        }
    }

    const processed = useMemo(() => {
        let result = [...(gameList || [])]

        const ownerId = (g) => g.user?._id || g.user

        result = result.filter(g => {
            const isOwner = userId && ownerId(g) === userId
            if (g.privacy && !isOwner) return false
            if (g.strict && safeContent) return false
            return true
        })

        if (search) {
            const s = search.toLowerCase()
            result = result.filter(g =>
                g.title?.toLowerCase().includes(s) ||
                g.category?.toLowerCase().includes(s) ||
                g.details?.developer?.toLowerCase().includes(s) ||
                g.user?.username?.toLowerCase().includes(s)
            )
        }

        if (selectedCategory) {
            result = result.filter(g => g.category === selectedCategory)
        }

        if (selectedTags.length > 0) {
            result = result.filter(g =>
                selectedTags.some(tag => g.tags?.some(t => t.toLowerCase() === tag.toLowerCase()))
            )
        }

        if (sortType === 'latest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        } else if (sortType === 'popular') {
            result.sort((a, b) => {
                const pa = ((a.views?.length || 0) / 2 + (a.likes?.length || 0)) - (a.dislikes?.length || 0)
                const pb = ((b.views?.length || 0) / 2 + (b.likes?.length || 0)) - (b.dislikes?.length || 0)
                return pb - pa
            })
        } else if (sortType === 'most_viewed') {
            result.sort((a, b) => (b.views?.length || 0) - (a.views?.length || 0))
        } else if (sortType === 'top_rated') {
            result.sort((a, b) => parseFloat(divideAndScale(b.ratings)) - parseFloat(divideAndScale(a.ratings)))
        }

        return result
    }, [gameList, search, selectedCategory, selectedTags, sortType, userId, safeContent])

    const totalPages = Math.ceil(processed.length / ITEMS_PER_PAGE)
    const pageData = processed.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

    const addTag = (tag) => {
        if (tag && tag !== 'All' && !selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag])
            setPage(0)
        } else if (tag === 'All') {
            setSelectedTags([])
            setPage(0)
        }
    }

    const removeTag = (i) => {
        const t = [...selectedTags]
        t.splice(i, 1)
        setSelectedTags(t)
        setPage(0)
    }

    const handleToggleFavorite = (gameId) => {
        if (!userId) return
        dispatch(toggleFavoriteGame({ userId, gameId }))
    }

    const card = `rounded-xl border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-slate-200/80' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`
    const inputCls = `w-full px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800 placeholder:text-slate-300' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200 placeholder:text-gray-600'}`
    const selectCls = `px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all cursor-pointer ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`
    const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`

    const heading = key ? `Search: "${decodeURIComponent(key)}"` : developer ? `Developer: ${decodeURIComponent(developer)}` : 'Browse Games'
    const subheading = key ? 'Showing results for your search query' : developer ? 'Games by this developer' : 'Discover and explore games'

    return (
        <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="relative px-0 my-6 sm:my-10">

                        {/* Breadcrumb */}
                        <div className={`flex items-center gap-1.5 text-xs mb-5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                            <Link to="/" className={`flex items-center gap-1 transition-colors ${isLight ? 'hover:text-blue-500' : 'hover:text-blue-400'}`}>
                                <FontAwesomeIcon icon={faHome} className="text-[10px]" /> Home
                            </Link>
                            <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                            <Link to="/games" className={`transition-colors ${isLight ? 'hover:text-blue-500' : 'hover:text-blue-400'}`}>Games</Link>
                            {key && (
                                <>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                                    <span>Search</span>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                                    <span className={isLight ? 'text-slate-600' : 'text-gray-300'}>{decodeURIComponent(key)}</span>
                                </>
                            )}
                            {developer && (
                                <>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                                    <span>Developer</span>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                                    <span className={isLight ? 'text-slate-600' : 'text-gray-300'}>{decodeURIComponent(developer)}</span>
                                </>
                            )}
                            {selectedCategory && (
                                <>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                                    <span className={isLight ? 'text-slate-600' : 'text-gray-300'}>{selectedCategory}</span>
                                </>
                            )}
                        </div>

                        {/* Hero Header */}
                        <div className={`${card} overflow-hidden mb-5`}>
                            <div className={`relative px-5 sm:px-7 py-6 sm:py-8 ${isLight ? '' : ''}`}>
                                <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${isLight ? 'bg-blue-300' : 'bg-blue-600'}`} />
                                <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none ${isLight ? 'bg-purple-300' : 'bg-purple-600'}`} />
                                
                                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-gradient-to-br from-blue-600 to-purple-600'}`}>
                                            <FontAwesomeIcon icon={faGamepad} className="text-xl text-white" />
                                        </div>
                                        <div>
                                            <h1 className={`text-xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{heading}</h1>
                                            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{subheading}</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSearch} className="relative w-full sm:w-auto sm:min-w-[280px]">
                                        <FontAwesomeIcon icon={faSearch} className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                        <input
                                            type="text"
                                            placeholder="Search games..."
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            className={`${inputCls} pl-9 pr-10`}
                                        />
                                        <button type="submit" className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#2a2a2a] text-gray-500'}`}>
                                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                        </button>
                                    </form>
                                </div>

                                {isLoaded && (
                                    <div className={`flex items-center gap-2 mt-4 pt-4 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                        <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{processed.length} game{processed.length !== 1 ? 's' : ''}</span>
                                        {(key || developer) && (
                                            <Link to="/games" className={`text-[11px] ml-auto transition-colors ${isLight ? 'text-blue-500 hover:text-blue-600' : 'text-blue-400 hover:text-blue-300'}`}>
                                                View all games
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                            {/* Main Content */}
                            <div className="lg:col-span-3">
                                {/* Toolbar */}
                                <div className={`${card} px-4 py-3 mb-4`}>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <select value={sortType} onChange={(e) => { setSortType(e.target.value); setPage(0) }}
                                                className={`${selectCls} text-xs py-1.5`}>
                                                <option value="">All Games</option>
                                                <option value="latest">Latest</option>
                                                <option value="popular">Popular</option>
                                                <option value="most_viewed">Most Viewed</option>
                                                <option value="top_rated">Top Rated</option>
                                            </select>
                                            <button onClick={() => setShowFilters(!showFilters)}
                                                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-solid transition-all lg:hidden ${showFilters
                                                    ? (isLight ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-blue-900/20 border-blue-700 text-blue-400')
                                                    : (isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#1a1a1a] border-[#333] text-gray-400')
                                                }`}>
                                                <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
                                                Filters
                                                {(selectedCategory || selectedTags.length > 0) && (
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-blue-500' : 'bg-blue-400'}`} />
                                                )}
                                            </button>
                                        </div>
                                        <div className="relative w-full sm:w-auto sm:max-w-[200px]">
                                            <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                            <input type="text" placeholder="Quick search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                                                className={`${inputCls} pl-8 text-xs py-1.5`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Active tags */}
                                {selectedTags.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Active:</span>
                                        {selectedTags.map((tag, i) => (
                                            <span key={i} className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-medium ${isLight ? 'bg-blue-50 text-blue-600 border border-solid border-blue-200' : 'bg-blue-900/20 text-blue-400 border border-solid border-blue-800/50'}`}>
                                                #{tag}
                                                <button onClick={() => removeTag(i)} className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${isLight ? 'hover:bg-blue-200' : 'hover:bg-blue-800/50'}`}>
                                                    <FontAwesomeIcon icon={faTimes} className="text-[7px]" />
                                                </button>
                                            </span>
                                        ))}
                                        <button onClick={() => { setSelectedTags([]); setPage(0) }}
                                            className={`text-[11px] font-medium underline ${isLight ? 'text-red-400 hover:text-red-500' : 'text-red-500 hover:text-red-400'}`}>Clear all</button>
                                    </div>
                                )}

                                {/* Mobile filters */}
                                {showFilters && (
                                    <div className={`${card} p-4 mb-4 lg:hidden`}>
                                        <h3 className={`text-sm font-bold mb-3 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Categories</h3>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            <button onClick={() => { setSelectedCategory(''); setPage(0) }}
                                                className={`text-xs font-medium px-3 py-1.5 rounded-lg border border-solid transition-colors ${!selectedCategory
                                                    ? (isLight ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-600 text-white border-blue-600')
                                                    : (isLight ? 'bg-white text-slate-500 border-slate-200 hover:border-blue-300' : 'bg-[#1a1a1a] text-gray-400 border-[#333] hover:border-blue-700')
                                                }`}>All</button>
                                            {categoriesList?.map((cat, i) => (
                                                <button key={i} onClick={() => { setSelectedCategory(cat.category === selectedCategory ? '' : cat.category); setPage(0) }}
                                                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border border-solid transition-colors ${selectedCategory === cat.category
                                                        ? (isLight ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-600 text-white border-blue-600')
                                                        : (isLight ? 'bg-white text-slate-500 border-slate-200 hover:border-blue-300' : 'bg-[#1a1a1a] text-gray-400 border-[#333] hover:border-blue-700')
                                                    }`}>{cat.category} ({cat.count})</button>
                                            ))}
                                        </div>
                                        {tagsList?.length > 0 && (
                                            <>
                                                <h3 className={`text-sm font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Tags</h3>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {tagsList.map((t, i) => (
                                                        <button key={i} onClick={() => addTag(t.tag)}
                                                            className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors capitalize ${selectedTags.includes(t.tag)
                                                                ? (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                                                                : (isLight ? 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600' : 'bg-white/5 text-gray-400 hover:bg-blue-900/20 hover:text-blue-400')
                                                            }`}>
                                                            {t.tag} ({t.count})
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Game Grid */}
                                {!isLoaded ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                        {[...Array(8)].map((_, i) => <SkeletonCard key={i} isLight={isLight} />)}
                                    </div>
                                ) : message ? (
                                    <div className={`${card} flex flex-col items-center justify-center py-16 px-6 text-center`}>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-50' : 'bg-[#1a1a1a]'}`}>
                                            <FontAwesomeIcon icon={faGamepad} className={`text-xl ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                        </div>
                                        <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{message}</p>
                                    </div>
                                ) : pageData.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                            {pageData.map((game) => (
                                                <GameCard
                                                    key={game._id}
                                                    game={game}
                                                    isLight={isLight}
                                                    isFavorited={favoriteGames?.includes(game._id)}
                                                    onToggleFavorite={userId ? handleToggleFavorite : null}
                                                />
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className={`${card} flex items-center justify-between px-4 py-3 mt-4`}>
                                                <p className={`text-[11px] whitespace-nowrap ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                    {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, processed.length)} of {processed.length}
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <button disabled={page === 0} onClick={() => { setPage(0); window.scrollTo(0, 0) }}
                                                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                                        <FontAwesomeIcon icon={faAngleDoubleLeft} className="text-[10px]" />
                                                    </button>
                                                    <button disabled={page === 0} onClick={() => { setPage(page - 1); window.scrollTo(0, 0) }}
                                                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                                        <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                                                    </button>
                                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                        let pn
                                                        if (totalPages <= 5) pn = i
                                                        else if (page < 3) pn = i
                                                        else if (page > totalPages - 4) pn = totalPages - 5 + i
                                                        else pn = page - 2 + i
                                                        return (
                                                            <button key={pn} onClick={() => { setPage(pn); window.scrollTo(0, 0) }}
                                                                className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-medium transition-all ${page === pn
                                                                    ? (isLight ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-600 text-white')
                                                                    : (isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400')
                                                                }`}>{pn + 1}</button>
                                                        )
                                                    })}
                                                    <button disabled={page >= totalPages - 1} onClick={() => { setPage(page + 1); window.scrollTo(0, 0) }}
                                                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                                    </button>
                                                    <button disabled={page >= totalPages - 1} onClick={() => { setPage(totalPages - 1); window.scrollTo(0, 0) }}
                                                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                                        <FontAwesomeIcon icon={faAngleDoubleRight} className="text-[10px]" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className={`${card} flex flex-col items-center justify-center py-16`}>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-50' : 'bg-[#1a1a1a]'}`}>
                                            <FontAwesomeIcon icon={faGamepad} className={`text-xl ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                        </div>
                                        <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>No games found</p>
                                        <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Try adjusting your filters or search terms</p>
                                        {(search || selectedCategory || selectedTags.length > 0) && (
                                            <button onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedTags([]); setPage(0) }}
                                                className={`text-xs mt-3 px-4 py-1.5 rounded-lg border border-solid transition-colors ${isLight ? 'text-blue-500 border-blue-200 hover:bg-blue-50' : 'text-blue-400 border-blue-800/50 hover:bg-blue-900/20'}`}>Clear all filters</button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="hidden lg:flex flex-col gap-4">
                                {/* Categories */}
                                {!isLoaded ? (
                                    <div className={`${card} overflow-hidden p-4`}>
                                        <div className={`h-4 w-24 mb-3 ${pulse}`} />
                                        <div className="space-y-2">
                                            {[...Array(5)].map((_, i) => <div key={i} className={`h-8 w-full rounded-lg ${pulse}`} />)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`${card} overflow-hidden`}>
                                        <div className={`flex items-center gap-2 px-4 py-3 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLight ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                                                <FontAwesomeIcon icon={faLayerGroup} className={`text-xs ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                                            </div>
                                            <h3 className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Categories</h3>
                                        </div>
                                        <div className="p-2">
                                            <button onClick={() => { setSelectedCategory(''); setPage(0) }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${!selectedCategory
                                                    ? (isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/20 text-blue-400')
                                                    : (isLight ? 'text-slate-500 hover:bg-slate-50' : 'text-gray-400 hover:bg-[#1a1a1a]')
                                                }`}>
                                                <span>All Games</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>{gameList?.length || 0}</span>
                                            </button>
                                            {categoriesList?.map((cat, i) => (
                                                <button key={i} onClick={() => { setSelectedCategory(cat.category === selectedCategory ? '' : cat.category); setPage(0) }}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${selectedCategory === cat.category
                                                        ? (isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/20 text-blue-400')
                                                        : (isLight ? 'text-slate-500 hover:bg-slate-50' : 'text-gray-400 hover:bg-[#1a1a1a]')
                                                    }`}>
                                                    <span>{cat.category}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>{cat.count}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tags */}
                                {!isLoaded ? (
                                    <div className={`${card} overflow-hidden p-4`}>
                                        <div className={`h-4 w-16 mb-3 ${pulse}`} />
                                        <div className="flex flex-wrap gap-1.5">
                                            {[...Array(8)].map((_, i) => <div key={i} className={`h-6 rounded-full ${pulse}`} style={{ width: `${40 + Math.random() * 35}px` }} />)}
                                        </div>
                                    </div>
                                ) : tagsList?.length > 0 && (
                                    <div className={`${card} overflow-hidden`}>
                                        <div className={`flex items-center gap-2 px-4 py-3 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLight ? 'bg-amber-100' : 'bg-amber-900/30'}`}>
                                                <FontAwesomeIcon icon={faTag} className={`text-xs ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                                            </div>
                                            <h3 className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Tags</h3>
                                        </div>
                                        <div className="p-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {tagsList.map((t, i) => (
                                                    <button key={i} onClick={() => addTag(t.tag)}
                                                        className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors capitalize ${selectedTags.includes(t.tag)
                                                            ? (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                                                            : (isLight ? 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600' : 'bg-white/5 text-gray-400 hover:bg-blue-900/20 hover:text-blue-400')
                                                        }`}>
                                                        {t.tag} <span className="opacity-50">({t.count})</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Developer Link */}
                                {developer && (
                                    <div className={`${card} overflow-hidden`}>
                                        <div className={`flex items-center gap-2 px-4 py-3 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLight ? 'bg-emerald-100' : 'bg-emerald-900/30'}`}>
                                                <FontAwesomeIcon icon={faCode} className={`text-xs ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                                            </div>
                                            <h3 className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Developer</h3>
                                        </div>
                                        <div className="p-3">
                                            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{decodeURIComponent(developer)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default GamesPage
