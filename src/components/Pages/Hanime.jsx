import React, { useEffect, useState, useRef } from 'react'
import { main, dark, light } from '../../style';
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faFilm, faCode, faEye, faEllipsisVertical, faPlay, faSliders, faChevronDown, faThumbsUp, faXmark, faTag } from '@fortawesome/free-solid-svg-icons';
import { MotionAnimate } from "react-motion-animate";

import { getVideosByType } from '../../actions/watch';
import styles from "../../style";

const millisToTimeString = (millis) => {
    const seconds = Math.floor(millis / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let timeString = "";
    if (hours > 0) timeString += hours.toString().padStart(2, '0') + ":";
    timeString += minutes.toString().padStart(2, '0') + ":" + secs.toString().padStart(2, '0');
    return timeString;
}

const timeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    return 'Just now';
}

const VideoCard = ({ data, theme }) => {
    const [hover, setHover] = useState(false);

    return (
        <Link 
            to={`/watch/${data._id}`} 
            className={`w-full relative cursor-pointer transition-all duration-200 rounded-lg p-2 ${theme === 'light' ? 'hover:bg-blue-50/50' : 'hover:bg-[#1A1A1A]'}`}
            onMouseEnter={() => setHover(true)} 
            onMouseLeave={() => setHover(false)}
        >
            <div className="relative">
                <div className='absolute top-1 left-1 z-10 rounded-sm text-white bg-blue-700 border border-solid border-blue-600' title={data.downloadUrl ? 'Video' : 'Embed'}>
                    <p className='font-semibold p-1 px-1 py-0 text-xs'>
                        <FontAwesomeIcon icon={data.downloadUrl ? faFilm : faCode} />
                    </p>
                </div>

                <div className='absolute bottom-1 right-1 z-10 rounded-sm text-white bg-blue-700 border border-solid border-blue-600'>
                    <p className='p-1 px-1 py-0 text-xs'>{data.downloadUrl ? 'video' : 'embed'}</p>
                </div>

                {data?.thumbnail ? (
                    <img 
                        className={`w-full sm:h-36 h-28 object-cover rounded-md border border-solid ${theme === 'light' ? light.border : dark.semiborder}`}
                        src={data.thumbnail}
                        alt={data.title}
                    />
                ) : (
                    <div className={`w-full sm:h-36 h-28 flex items-center justify-center rounded-md border border-solid ${theme === 'light' ? light.border : dark.semiborder} ${
                        theme === 'light' 
                            ? 'bg-gradient-to-br from-blue-100 to-sky-100' 
                            : 'bg-gradient-to-br from-gray-800 to-gray-900'
                    }`}>
                        <FontAwesomeIcon icon={faFilm} className={`text-3xl ${theme === 'light' ? 'text-blue-300' : 'text-gray-600'}`} />
                    </div>
                )}

                {hover && (
                    <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                        <MotionAnimate variant={{
                            hidden: { transform: 'scale(0)' },
                            show: { opacity: 1, transform: 'scale(1)', transition: { duration: 0.1 } }
                        }}>
                            <FontAwesomeIcon icon={faPlay} className="text-white sm:w-10 w-8 sm:h-10 h-8"/>
                        </MotionAnimate>
                    </div>
                )}
            </div>

            <p className='truncate mt-2'>{data.title}</p>

            <div className="flex items-center justify-between mt-0.5">
                <p className={`truncate text-xs ${theme === 'light' ? light.text : dark.text}`}>{data.user}</p>
                <button 
                    onClick={(e) => e.preventDefault()} 
                    className={`text-xs px-1 rounded hover:bg-opacity-20 ${theme === 'light' ? `${light.text} hover:bg-gray-300` : `${dark.text} hover:bg-gray-600`} transition-all`}
                >
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>
            </div>

            <div className={`${theme === 'light' ? light.semibackground : dark.semibackground} h-[0.1px] my-1`}></div>

            <div className="flex items-center justify-between">
                <div className={`flex items-center gap-3 text-xs ${theme === 'light' ? light.text : dark.text}`}>
                    <span>{timeAgo(data.createdAt)}</span>
                    <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                        {data.views?.length ?? 0}
                    </span>
                </div>
                <span className={`flex items-center gap-1 text-xs ${theme === 'light' ? light.text : dark.text}`}>
                    {data.likes?.length ?? 0}
                    <FontAwesomeIcon icon={faThumbsUp} className="text-[10px]" />
                </span>
            </div>
        </Link>
    );
}

const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Popular' },
    { value: 'most_viewed', label: 'Most Viewed' },
]

const Hanime = ({ user, theme }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [searchParams] = useSearchParams()

    const { browse, browseLoading } = useSelector((state) => state.watch)

    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [showFilter, setShowFilter] = useState(false)
    const [showTags, setShowTags] = useState(false)

    const filterRef = useRef(null)
    const tagsRef = useRef(null)

    const activeFilter = searchParams.get('filter') || 'all'
    const activeTag = searchParams.get('tag') || ''
    const currentPage = parseInt(searchParams.get('page')) || 1

    useEffect(() => {
        document.title = "Uncategorized"
    }, [])

    useEffect(() => {
        dispatch(getVideosByType({
            type: 'hanime',
            search: searchParams.get('search') || '',
            page: currentPage,
            limit: 20,
            filter: activeFilter,
            tag: activeTag || undefined
        }))
    }, [searchParams])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false)
            if (tagsRef.current && !tagsRef.current.contains(e.target)) setShowTags(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const updateParams = (updates) => {
        const params = new URLSearchParams(searchParams)
        Object.entries(updates).forEach(([key, val]) => {
            if (val) params.set(key, val)
            else params.delete(key)
        })
        navigate(`/hanime?${params.toString()}`)
    }

    const handleSearch = () => {
        updateParams({ search: search || null, page: '1' })
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch()
    }

    const handleFilterChange = (filter) => {
        updateParams({ filter: filter === 'all' ? null : filter, page: '1' })
    }

    const handleTagChange = (tag) => {
        updateParams({ tag: tag || null, page: '1' })
        setShowTags(false)
    }

    const handlePageChange = (page) => {
        updateParams({ page: page.toString() })
    }

    const clearAllFilters = () => {
        setSearch('')
        updateParams({ search: null, tag: null, filter: null, page: '1' })
    }

    const tagsList = Array.isArray(browse?.tags) ? browse.tags : []
    const activeTagName = activeTag || 'All'
    const activeFilterLabel = filterOptions.find(f => f.value === activeFilter)?.label || 'All'
    const hasActiveFilters = searchParams.get('search') || searchParams.get('tag') || (activeFilter !== 'all')

    const startItem = browse?.result?.length > 0 ? ((currentPage - 1) * 20) + 1 : 0
    const endItem = browse?.result?.length > 0 ? startItem + browse.result.length - 1 : 0

    return (
        <div className={`relative overflow-hidden ${main.font} ${theme === 'light' ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className={`${main.container} lg:px-8 relative px-0 my-12`}>

                        {/* ====== TOOLBAR CONTAINER ====== */}
                        <div className={`rounded-md p-4 px-6 mb-4 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                            <div className="flex sm:flex-row flex-col sm:items-center items-stretch justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="relative sm:w-64 w-full">
                                        <FontAwesomeIcon 
                                            icon={faSearch} 
                                            className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${theme === 'light' ? light.input_icon : dark.input_icon}`} 
                                        />
                                        <input 
                                            className={`block w-full rounded-lg py-2 pl-9 pr-4 text-sm ${theme === 'light' ? light.input : dark.input}`} 
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            type="text" 
                                            placeholder='Search Videos' 
                                        />
                                    </div>

                                    <div className="relative" ref={tagsRef}>
                                        <button 
                                            onClick={() => setShowTags(!showTags)}
                                            className={`flex items-center gap-2 rounded-lg py-2 px-4 text-sm whitespace-nowrap ${theme === 'light' ? light.input : dark.input} border border-solid ${theme === 'light' ? light.border : dark.border}`}
                                        >
                                            <span className={`font-medium ${theme === 'light' ? light.text : dark.text}`}>Tags:</span>
                                            <span>{activeTagName}</span>
                                            <FontAwesomeIcon icon={faChevronDown} className="text-[10px] ml-1" />
                                        </button>

                                        {showTags && (
                                            <div className={`absolute top-full left-0 mt-1 z-50 w-48 max-h-60 overflow-y-auto rounded-lg p-2 ${theme === 'light' ? light.background : dark.background} border border-solid ${theme === 'light' ? light.border : dark.border} shadow-lg`}>
                                                <button 
                                                    onClick={() => handleTagChange('')}
                                                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-all ${
                                                        !activeTag 
                                                            ? (theme === 'light' ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                                                            : (theme === 'light' ? 'hover:bg-blue-50' : 'hover:bg-[#1A1A1A]')
                                                    }`}
                                                >
                                                    All
                                                </button>
                                                {tagsList.map((tag) => (
                                                    <button 
                                                        key={tag.name}
                                                        onClick={() => handleTagChange(tag.name)}
                                                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-all flex items-center justify-between ${
                                                            activeTag === tag.name 
                                                                ? (theme === 'light' ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                                                                : (theme === 'light' ? 'hover:bg-blue-50' : 'hover:bg-[#1A1A1A]')
                                                        }`}
                                                    >
                                                        <span>{tag.name}</span>
                                                        <span className={`text-[10px] ${activeTag === tag.name ? 'text-blue-200' : (theme === 'light' ? 'text-slate-400' : 'text-gray-500')}`}>{tag.count}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="relative" ref={filterRef}>
                                    <button 
                                        onClick={() => setShowFilter(!showFilter)}
                                        className={`flex items-center gap-2 rounded-lg py-2 px-4 text-sm ${theme === 'light' ? light.input : dark.input} border border-solid ${theme === 'light' ? light.border : dark.border}`}
                                    >
                                        <span>Filter</span>
                                        {activeFilter !== 'all' && (
                                            <span className="bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">1</span>
                                        )}
                                        <FontAwesomeIcon icon={faSliders} className="text-xs" />
                                    </button>

                                    {showFilter && (
                                        <div className={`absolute top-full right-0 mt-1 z-50 w-44 rounded-lg p-3 ${theme === 'light' ? light.background : dark.background} border border-solid ${theme === 'light' ? light.border : dark.border} shadow-lg`}>
                                            <p className={`text-xs font-semibold mb-2 ${theme === 'light' ? light.text : dark.text}`}>Filter by:</p>
                                            {filterOptions.map((opt) => (
                                                <label key={opt.value} className={`flex items-center gap-2 py-1 cursor-pointer text-sm ${theme === 'light' ? 'hover:text-blue-600' : 'hover:text-blue-400'} transition-all`}>
                                                    <input 
                                                        type="checkbox"
                                                        checked={activeFilter === opt.value}
                                                        onChange={() => handleFilterChange(opt.value)}
                                                        className="accent-blue-600"
                                                    />
                                                    {opt.label}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Active Filters Row */}
                            {hasActiveFilters && (
                                <div className="flex items-center gap-2 flex-wrap mt-3 pt-3" style={{ borderTop: `1px solid ${theme === 'light' ? '#93c5fd40' : '#333'}` }}>
                                    {searchParams.get('search') && (
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/40 text-blue-300'}`}>
                                            <FontAwesomeIcon icon={faSearch} className="text-[9px]" />
                                            "{searchParams.get('search')}"
                                            <button onClick={() => { setSearch(''); updateParams({ search: null, page: '1' }) }} className="ml-0.5 hover:opacity-70">
                                                <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                            </button>
                                        </span>
                                    )}
                                    {activeTag && (
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/40 text-blue-300'}`}>
                                            <FontAwesomeIcon icon={faTag} className="text-[9px]" />
                                            {activeTagName}
                                            <button onClick={() => updateParams({ tag: null, page: '1' })} className="ml-0.5 hover:opacity-70">
                                                <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                            </button>
                                        </span>
                                    )}
                                    {activeFilter !== 'all' && (
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/40 text-blue-300'}`}>
                                            <FontAwesomeIcon icon={faSliders} className="text-[9px]" />
                                            {activeFilterLabel}
                                            <button onClick={() => updateParams({ filter: null, page: '1' })} className="ml-0.5 hover:opacity-70">
                                                <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                            </button>
                                        </span>
                                    )}
                                    <button 
                                        onClick={clearAllFilters} 
                                        className={`text-xs underline ${theme === 'light' ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'} transition-all`}
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ====== CONTENT CONTAINER ====== */}
                        <div className={`rounded-md p-4 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                            
                            {/* Results Info Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium">Videos</h2>
                                {browse?.total > 0 && !browseLoading && (
                                    <p className={`text-xs ${theme === 'light' ? light.text : dark.text}`}>
                                        Showing {startItem}-{endItem} of {browse.total} video{browse.total !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>

                            <div className={`${theme === 'light' ? light.semibackground : dark.semibackground} h-[0.1px] mb-5`}></div>

                            {/* Video Grid */}
                            {browseLoading ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-3">
                                    <FontAwesomeIcon icon={faSpinner} spin className={`text-3xl ${theme === 'light' ? 'text-blue-500' : 'text-blue-400'}`} />
                                    <p className={`text-xs ${theme === 'light' ? light.text : dark.text}`}>Loading videos...</p>
                                </div>
                            ) : browse?.result?.length > 0 ? (
                                <>
                                    <div className='grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-3 grid-cols-2 gap-4 place-content-start mb-6'>
                                        {browse.result.map((video) => (
                                            <VideoCard 
                                                key={video._id}
                                                data={video}
                                                theme={theme}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {browse.totalPages > 1 && (
                                        <>
                                            <div className={`${theme === 'light' ? light.semibackground : dark.semibackground} h-[0.1px] mb-5`}></div>
                                            <div className="flex flex-col items-center gap-3">
                                                <div className='flex flex-wrap items-center justify-center gap-2'>
                                                    <button
                                                        disabled={currentPage === 1}
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        className={`${theme === 'light' ? light.paginate_btn : dark.paginate_btn}`}
                                                    >
                                                        Previous
                                                    </button>

                                                    {Array.from({ length: browse.totalPages }, (_, i) => i + 1)
                                                        .filter(page => {
                                                            if (browse.totalPages <= 7) return true
                                                            if (page === 1 || page === browse.totalPages) return true
                                                            return Math.abs(page - currentPage) <= 2
                                                        })
                                                        .reduce((acc, page, i, arr) => {
                                                            if (i > 0 && page - arr[i - 1] > 1) acc.push('...')
                                                            acc.push(page)
                                                            return acc
                                                        }, [])
                                                        .map((item, i) => (
                                                            item === '...' ? (
                                                                <span key={`ellipsis-${i}`} className={`px-2 ${theme === 'light' ? light.text : dark.text}`}>...</span>
                                                            ) : (
                                                                <button
                                                                    key={item}
                                                                    onClick={() => handlePageChange(item)}
                                                                    style={{
                                                                        backgroundColor: currentPage === item ? '#2563eb' : undefined,
                                                                        color: currentPage === item ? '#FFF' : undefined
                                                                    }}
                                                                    className={`${theme === 'light' ? light.paginate_btn : dark.paginate_btn}`}
                                                                >
                                                                    {item}
                                                                </button>
                                                            )
                                                        ))
                                                    }

                                                    <button
                                                        disabled={currentPage === browse.totalPages}
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        className={`${theme === 'light' ? light.paginate_btn : dark.paginate_btn}`}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                                <p className={`text-xs ${theme === 'light' ? light.text : dark.text}`}>
                                                    Page {currentPage} of {browse.totalPages}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className={`flex flex-col items-center justify-center py-24 gap-4 ${theme === 'light' ? light.text : dark.text}`}>
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-blue-50' : 'bg-[#1A1A1A]'}`}>
                                        <FontAwesomeIcon icon={faFilm} className={`text-3xl ${theme === 'light' ? 'text-blue-300' : 'text-gray-600'}`} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-medium mb-1">No videos found</p>
                                        <p className={`text-xs ${theme === 'light' ? light.text : dark.text}`}>
                                            {hasActiveFilters 
                                                ? 'Try adjusting your search or filters' 
                                                : 'No public videos are available at the moment'
                                            }
                                        </p>
                                    </div>
                                    {hasActiveFilters && (
                                        <button 
                                            onClick={clearAllFilters}
                                            className={`text-sm mt-1 px-4 py-1.5 rounded-lg ${theme === 'light' ? light.button_secondary : dark.button_secondary}`}
                                        >
                                            Clear all filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hanime
