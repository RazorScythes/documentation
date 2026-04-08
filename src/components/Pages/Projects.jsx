import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faProjectDiagram,
    faSearch,
    faChevronRight,
    faChevronLeft,
    faAngleDoubleLeft,
    faAngleDoubleRight,
    faHome,
    faFilter,
    faTimes,
    faTag,
    faEye,
    faLayerGroup,
    faArrowRight,
    faCode,
    faThumbsUp,
    faComment,
    faCalendarAlt,
    faSort,
} from '@fortawesome/free-solid-svg-icons'
import { library, findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import {
    getProjects,
    getCategory,
    projectCountTags,
    getProjectsByCategories,
    getProjectsBySearchKey,
} from '../../actions/project'
import { main, dark, light } from '../../style'
import styles from '../../style'

library.add(fas, far, fab)

const ITEMS_PER_PAGE = 18

const useInView = (ref, options = {}) => {
    const [isVisible, setVisible] = useState(false)
    useEffect(() => {
        if (!ref.current) return
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
        }, { threshold: 0.1, ...options })
        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [ref])
    return isVisible
}

const normalizeIconName = (s) => {
    if (!s) return ''
    let x = String(s).trim().toLowerCase()
    if (x.startsWith('fa-')) x = x.slice(3)
    else if (x.startsWith('fa')) x = x.slice(2)
    return x
}

const resolveCategoryIcon = (iconName) => {
    const name = normalizeIconName(iconName)
    if (!name) return null
    const prefixes = ['fas', 'far', 'fab']
    for (const prefix of prefixes) {
        const def = findIconDefinition({ prefix, iconName: name })
        if (def) return def
    }
    return null
}

const CategoryGlyph = ({ iconName, className }) => {
    const def = resolveCategoryIcon(iconName)
    if (def) return <FontAwesomeIcon icon={def} className={className} />
    return <FontAwesomeIcon icon={faLayerGroup} className={className} />
}

const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(d)
}

const SkeletonCard = ({ isLight }) => {
    const pulse = `animate-pulse rounded-lg ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`
    return (
        <div className={`rounded-xl overflow-hidden border border-solid ${isLight ? 'bg-white/90 border-slate-200/80' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
            <div className={`aspect-[16/10] ${pulse}`} />
            <div className="p-4 space-y-2.5">
                <div className={`h-3 w-20 ${pulse}`} />
                <div className={`h-4 w-4/5 ${pulse}`} />
                <div className={`h-3 w-1/2 ${pulse}`} />
                <div className="flex gap-2 pt-2">
                    <div className={`h-3 w-12 ${pulse}`} />
                    <div className={`h-3 w-12 ${pulse}`} />
                    <div className={`h-3 w-14 ${pulse}`} />
                </div>
            </div>
        </div>
    )
}

const AnimatedCard = ({ children, index, isLight }) => {
    const ref = useRef(null)
    const isVisible = useInView(ref)
    const delay = Math.min(index * 60, 400)

    return (
        <div
            ref={ref}
            className="transition-all duration-500 ease-out"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    )
}

const ProjectCard = ({ item, categoryList, isLight }) => {
    const catId = item.categories
    const catMeta = categoryList?.find((c) => String(c._id) === String(catId))
    const badge =
        catMeta?.name || catMeta?.description || (typeof item.categories === 'object' && item.categories?.category) || 'Project'

    const views = item.views?.length ?? 0
    const likes = item.likes?.length ?? 0
    const comments = item.comment?.length ?? 0
    const tags = Array.isArray(item.tags) ? item.tags : []

    return (
        <Link to={`/projects/${item._id}`} className="block group h-full">
            <div
                className={`rounded-xl overflow-hidden transition-all duration-300 h-full flex flex-col border border-solid
                    ${isLight
                        ? 'bg-white/90 backdrop-blur-sm border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-blue-500/8 hover:border-blue-200/80 hover:-translate-y-1.5 hover:scale-[1.01]'
                        : 'bg-[#0e0e0e] border-[#2B2B2B] hover:border-blue-500/30 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/5'
                    }`}
            >
                <div className="relative aspect-[16/10] overflow-hidden">
                    {item.featured_image ? (
                        <img
                            src={item.featured_image}
                            alt={item.post_title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            loading="lazy"
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-gradient-to-br from-blue-50 to-sky-100' : 'bg-gradient-to-br from-[#111] to-[#1a1a1a]'}`}>
                            <FontAwesomeIcon
                                icon={faProjectDiagram}
                                className={`text-4xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${isLight ? 'text-blue-200' : 'text-gray-700'}`}
                            />
                        </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md uppercase tracking-wider max-w-[10rem] truncate inline-block ${isLight ? 'bg-white/90 text-slate-600 shadow-sm' : 'bg-black/60 text-gray-200'}`}>
                            {badge}
                        </span>
                    </div>
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center pointer-events-none ${isLight ? 'bg-gradient-to-t from-blue-600/20 via-transparent' : 'bg-gradient-to-t from-blue-900/30 via-transparent'}`}>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform duration-500 group-hover:scale-100 scale-75 ${isLight ? 'bg-white/90 shadow-lg' : 'bg-black/60'}`}>
                            <FontAwesomeIcon icon={faArrowRight} className={`text-sm ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                        </div>
                    </div>
                </div>

                <div className="p-4 flex-1 flex flex-col gap-2">
                    <h3 className={`text-sm font-semibold leading-snug line-clamp-2 transition-colors duration-200 ${isLight ? 'text-slate-800 group-hover:text-blue-600' : 'text-gray-100 group-hover:text-blue-400'}`}>
                        {item.post_title}
                    </h3>
                    <div className={`flex items-center gap-1.5 text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px]" />
                        <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <div className={`flex flex-wrap items-center gap-3 text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        <span className="inline-flex items-center gap-1">
                            <FontAwesomeIcon icon={faEye} className="text-[10px]" /> {views}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <FontAwesomeIcon icon={faThumbsUp} className="text-[10px]" /> {likes}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <FontAwesomeIcon icon={faComment} className="text-[10px]" /> {comments}
                        </span>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto pt-1.5">
                            {tags.slice(0, 5).map((t, i) => (
                                <span
                                    key={i}
                                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium transition-colors ${isLight ? 'bg-sky-50 text-sky-700 border border-sky-100 group-hover:bg-sky-100' : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] group-hover:border-blue-900/40'}`}
                                >
                                    #{t}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

const Projects = ({ user, theme }) => {
    const { key, cat } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const project = useSelector((state) => state.project.user_project)
    const tagsList = useSelector((state) => state.project.tagsCount)
    const isLoading = useSelector((state) => state.project.isLoading)
    const category = useSelector((state) => state.project.user_category)
    const category_loading = useSelector((state) => state.project.category_loading)

    const isLight = theme === 'light'
    const userId = user?.result?._id || user?._id || ''

    const [searchInput, setSearchInput] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedTags, setSelectedTags] = useState([])
    const [sortType, setSortType] = useState('')
    const [displayedPages, setDisplayedPages] = useState([])
    const [mounted, setMounted] = useState(false)
    const [showTags, setShowTags] = useState(false)
    const [initialLoadDone, setInitialLoadDone] = useState(false)

    const heroRef = useRef(null)
    const heroVisible = useInView(heroRef)
    const gridRef = useRef(null)
    const gridVisible = useInView(gridRef)

    useEffect(() => { setMounted(true) }, [])

    const card = `rounded-xl border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-slate-200/80' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`
    const subText = isLight ? 'text-slate-400' : 'text-gray-500'
    const mutedText = isLight ? 'text-slate-300' : 'text-gray-600'
    const inputCls = `w-full px-3.5 py-2.5 rounded-xl text-sm border border-solid outline-none transition-all duration-200 ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-slate-800 placeholder:text-slate-300' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-200 placeholder:text-gray-600'}`
    const sectionBorder = isLight ? 'border-slate-200/60' : 'border-[#1a1a1a]'

    useEffect(() => {
        setInitialLoadDone(false)
        dispatch(getCategory({}))
        if (key) {
            const decoded = decodeURIComponent(key)
            dispatch(getProjectsBySearchKey({ key: decoded })).then(() => setInitialLoadDone(true))
        } else if (cat) {
            dispatch(getProjectsByCategories({ category: cat })).then(() => setInitialLoadDone(true))
        } else {
            dispatch(getProjects({})).then(() => setInitialLoadDone(true))
            dispatch(projectCountTags({}))
        }
        setCurrentPage(1)
        setSelectedTags([])
        setSortType('')
    }, [dispatch, key, cat])

    useEffect(() => {
        if (key) setSearchInput(decodeURIComponent(key))
        else setSearchInput('')
    }, [key])

    const processed = useMemo(() => {
        let list = [...(project || [])]

        if (selectedTags.length > 0) {
            list = list.filter((p) =>
                selectedTags.some((tag) => p.tags?.some((t) => String(t).toLowerCase() === String(tag).toLowerCase())),
            )
        }

        if (sortType === 'latest') {
            list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        } else if (sortType === 'most_viewed') {
            list.sort((a, b) => (b.views?.length || 0) - (a.views?.length || 0))
        } else if (sortType === 'popular') {
            list.sort((a, b) => {
                const pa = (a.views?.length || 0) / 2 + (a.likes?.length || 0) - (a.dislikes?.length || 0)
                const pb = (b.views?.length || 0) / 2 + (b.likes?.length || 0) - (b.dislikes?.length || 0)
                return pb - pa
            })
        }

        return list
    }, [project, selectedTags, sortType])

    const totalPages = Math.max(1, Math.ceil(processed.length / ITEMS_PER_PAGE))
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const pageData = processed.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages)
    }, [currentPage, totalPages])

    useEffect(() => {
        const maxDisplayedPages = 6
        const pagesToShow = []
        if (totalPages <= maxDisplayedPages) {
            for (let i = 1; i <= totalPages; i++) pagesToShow.push(i)
        } else {
            let startPage, endPage
            if (currentPage <= Math.floor(maxDisplayedPages / 2)) {
                startPage = 1; endPage = maxDisplayedPages
            } else if (currentPage >= totalPages - Math.floor(maxDisplayedPages / 2)) {
                startPage = totalPages - maxDisplayedPages + 1; endPage = totalPages
            } else {
                startPage = currentPage - Math.floor(maxDisplayedPages / 2)
                endPage = currentPage + Math.floor(maxDisplayedPages / 2)
            }
            for (let i = startPage; i <= endPage; i++) pagesToShow.push(i)
        }
        setDisplayedPages(pagesToShow)
    }, [currentPage, totalPages])

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        const val = searchInput.trim()
        if (val) navigate(`/projects/search/${encodeURIComponent(val)}`)
        else if (key) navigate('/projects')
    }

    const toggleTag = (tagName) => {
        const t = String(tagName)
        setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
        setCurrentPage(1)
    }

    const sortBtn = (active) =>
        `text-xs font-medium px-3 py-1.5 rounded-lg border border-solid transition-all duration-200 ${active
            ? isLight
                ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-500/20'
                : 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
            : isLight
                ? 'bg-white/80 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                : 'bg-[#1a1a1a] text-gray-400 border-[#333] hover:border-blue-700 hover:text-blue-400'
        }`

    const heading = key
        ? `Search: "${decodeURIComponent(key)}"`
        : cat
            ? category?.find((c) => String(c._id) === String(cat))?.name || 'Category'
            : 'Projects'
    const subheading = key
        ? 'Results matching your query'
        : cat
            ? 'Projects in this category'
            : 'Browse community projects'

    const totalProjects = category?.reduce((acc, c) => acc + (c.count || 0), 0) || processed.length

    const paginateBtn = (disabled) =>
        `p-2 rounded-lg text-sm font-medium border border-solid transition-all duration-200 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${isLight
            ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-300'
            : 'bg-[#1a1a1a] border-[#333] text-gray-300 hover:border-blue-600'
        }`

    const pageNumBtn = (active) =>
        `min-w-[2.25rem] px-2 py-1.5 rounded-lg text-xs font-semibold border border-solid transition-all duration-200 cursor-pointer ${active
            ? isLight
                ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-500/20'
                : 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
            : isLight
                ? 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-blue-700'
        }`

    const fadeIn = mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'

    return (
        <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="relative px-0 my-6 sm:my-10">
                        <div className={`flex items-center gap-1.5 text-xs mb-5 flex-wrap transition-all duration-500 delay-75 ${fadeIn} ${subText}`}>
                            <Link to="/" className={`flex items-center gap-1 transition-colors ${isLight ? 'hover:text-blue-500' : 'hover:text-blue-400'}`}>
                                <FontAwesomeIcon icon={faHome} className="text-[10px]" /> Home
                            </Link>
                            <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                            <Link to="/projects" className={`transition-colors ${isLight ? 'hover:text-blue-500' : 'hover:text-blue-400'}`}>
                                Projects
                            </Link>
                            {key && (
                                <>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                                    <span>Search</span>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                                    <span className={isLight ? 'text-slate-600' : 'text-gray-300'}>{decodeURIComponent(key)}</span>
                                </>
                            )}
                            {cat && !key && (
                                <>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                                    <span className={isLight ? 'text-slate-600' : 'text-gray-300'}>
                                        {category?.find((c) => String(c._id) === String(cat))?.description ||
                                            category?.find((c) => String(c._id) === String(cat))?.name ||
                                            'Category'}
                                    </span>
                                </>
                            )}
                        </div>

                        <div
                            ref={heroRef}
                            className={`${card} overflow-hidden mb-5 transition-all duration-700 ease-out ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        >
                            <div className="relative px-5 sm:px-7 py-7 sm:py-9">
                                <div className={`absolute top-[-40px] right-[-40px] w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none ${isLight ? 'bg-blue-400' : 'bg-blue-600'}`} />
                                <div className={`absolute bottom-[-30px] left-[-30px] w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none ${isLight ? 'bg-cyan-400' : 'bg-cyan-600'}`} />
                                <div className={`absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-5 pointer-events-none ${isLight ? 'bg-indigo-400' : 'bg-indigo-600'}`} />

                                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${isLight ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/20' : 'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-blue-600/20'}`}>
                                            <FontAwesomeIcon icon={faCode} className="text-xl text-white" />
                                        </div>
                                        <div>
                                            <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>{heading}</h1>
                                            <p className={`text-xs mt-1 ${subText}`}>
                                                {subheading}
                                                {!key && !cat && totalProjects > 0 && (
                                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${isLight ? 'bg-blue-50 text-blue-500' : 'bg-blue-900/20 text-blue-400'}`}>
                                                        {totalProjects} total
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-auto sm:min-w-[300px]">
                                        <FontAwesomeIcon icon={faSearch} className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs ${mutedText}`} />
                                        <input
                                            type="text"
                                            placeholder="Search projects..."
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            className={`${inputCls} pl-9 pr-10`}
                                        />
                                        <button
                                            type="submit"
                                            className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${isLight ? 'hover:bg-blue-50 text-slate-400 hover:text-blue-500' : 'hover:bg-[#2a2a2a] text-gray-500 hover:text-blue-400'}`}
                                        >
                                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className={`${card} px-3 py-3 mb-4 transition-all duration-500 delay-150 ${fadeIn}`}>
                            <p className={`text-[11px] font-semibold mb-2.5 flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                <FontAwesomeIcon icon={faLayerGroup} className="text-[10px]" />
                                Categories
                            </p>
                            {category_loading ? (
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className={`flex-shrink-0 w-20 h-[4.5rem] rounded-xl animate-pulse ${isLight ? 'bg-slate-200/60' : 'bg-[#1f1f1f]'}`} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin [scrollbar-width:thin]">
                                    <Link
                                        to="/projects"
                                        className={`flex-shrink-0 flex flex-col items-center justify-center w-[4.75rem] py-3 rounded-xl border border-solid transition-all duration-200 ${!cat && !key
                                            ? isLight
                                                ? 'border-blue-400 bg-blue-50/80 text-blue-600 shadow-sm shadow-blue-500/10'
                                                : 'border-blue-500 bg-blue-900/20 text-blue-400 shadow-sm shadow-blue-500/10'
                                            : isLight
                                                ? 'border-slate-200/80 bg-white/60 hover:border-blue-300 text-slate-600 hover:shadow-sm'
                                                : 'border-[#2B2B2B] bg-[#141414] hover:border-blue-700 text-gray-400'
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={faHome} className="text-xl mb-1" />
                                        <span className="text-[10px] font-medium text-center leading-tight px-0.5">All</span>
                                    </Link>
                                    {category?.map((c, ci) => {
                                        const active = String(cat) === String(c._id)
                                        return (
                                            <Link
                                                key={c._id}
                                                to={`/projects/category/${c._id}`}
                                                className={`flex-shrink-0 flex flex-col items-center justify-center w-[4.75rem] py-3 rounded-xl border border-solid transition-all duration-200 relative ${active
                                                    ? isLight
                                                        ? 'border-blue-400 bg-blue-50/80 text-blue-600 shadow-sm shadow-blue-500/10'
                                                        : 'border-blue-500 bg-blue-900/20 text-blue-400 shadow-sm shadow-blue-500/10'
                                                    : isLight
                                                        ? 'border-slate-200/80 bg-white/60 hover:border-blue-300 text-slate-600 hover:shadow-sm'
                                                        : 'border-[#2B2B2B] bg-[#141414] hover:border-blue-700 text-gray-400'
                                                }`}
                                                style={{ animationDelay: `${ci * 40}ms` }}
                                            >
                                                {typeof c.count === 'number' && c.count > 0 && (
                                                    <span className={`absolute -top-1 -right-1 text-[8px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full leading-none ${isLight ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'}`}>
                                                        {c.count}
                                                    </span>
                                                )}
                                                <CategoryGlyph iconName={c.image} className="text-xl mb-1" />
                                                <span className="text-[10px] font-medium text-center leading-tight px-0.5 line-clamp-2">
                                                    {c.description || c.name}
                                                </span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div className={`${card} px-4 py-3.5 mb-5 transition-all duration-500 delay-200 ${fadeIn}`}>
                            <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-solid pb-3 mb-3 ${sectionBorder}`}>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                        <FontAwesomeIcon icon={faSort} className="text-[10px]" /> Sort
                                    </span>
                                    <button type="button" className={sortBtn(sortType === '')} onClick={() => { setSortType(''); setCurrentPage(1) }}>All</button>
                                    <button type="button" className={sortBtn(sortType === 'latest')} onClick={() => { setSortType('latest'); setCurrentPage(1) }}>Latest</button>
                                    <button type="button" className={sortBtn(sortType === 'most_viewed')} onClick={() => { setSortType('most_viewed'); setCurrentPage(1) }}>Most Viewed</button>
                                    <button type="button" className={sortBtn(sortType === 'popular')} onClick={() => { setSortType('popular'); setCurrentPage(1) }}>Popular</button>
                                </div>
                                <div className={`text-[11px] font-medium ${subText}`}>
                                    {!isLoading && (
                                        <>
                                            {processed.length} project{processed.length !== 1 ? 's' : ''}
                                            {(key || cat) && (
                                                <Link to="/projects" className={`ml-2 underline ${isLight ? 'text-blue-500 hover:text-blue-600' : 'text-blue-400 hover:text-blue-300'}`}>
                                                    View all
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {tagsList?.length > 0 && (
                                <div>
                                    <button type="button" onClick={() => setShowTags(!showTags)}
                                        className={`text-[11px] font-semibold mb-2 flex items-center gap-1.5 transition-colors ${isLight ? 'text-slate-500 hover:text-slate-700' : 'text-gray-400 hover:text-gray-300'}`}>
                                        <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
                                        <FontAwesomeIcon icon={faTag} className="text-[10px]" />
                                        Tags ({tagsList.length})
                                        <FontAwesomeIcon icon={showTags ? faTimes : faChevronRight} className="text-[8px] ml-0.5" />
                                    </button>
                                    {showTags && (
                                        <div className="overflow-x-auto scrollbar-thin [scrollbar-width:thin] pb-1">
                                            <div className="flex gap-1.5 min-w-0">
                                                {tagsList.map((item) => {
                                                    const name = item._id
                                                    const selected = selectedTags.includes(String(name))
                                                    return (
                                                        <button
                                                            key={String(name)}
                                                            type="button"
                                                            onClick={() => toggleTag(name)}
                                                            className={`text-[10px] font-medium px-2.5 py-1 rounded-full border border-solid transition-all duration-200 capitalize hover:scale-105 whitespace-nowrap flex-shrink-0 ${selected
                                                                ? isLight
                                                                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-500/20'
                                                                    : 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                                                                : isLight
                                                                    ? 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                                                                    : 'bg-[#141414] text-gray-400 border-[#2B2B2B] hover:border-blue-700'
                                                            }`}
                                                        >
                                                            {name}{typeof item.count === 'number' ? ` (${item.count})` : ''}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedTags.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-solid border-opacity-50 border-current">
                                    <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Active:</span>
                                    {selectedTags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-medium ${isLight ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-blue-900/25 text-blue-400 border border-blue-800/40'}`}
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedTags((p) => p.filter((_, j) => j !== i)); setCurrentPage(1) }}
                                                className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${isLight ? 'hover:bg-blue-200' : 'hover:bg-blue-800/40'}`}
                                            >
                                                <FontAwesomeIcon icon={faTimes} className="text-[7px]" />
                                            </button>
                                        </span>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedTags([]); setCurrentPage(1) }}
                                        className={`text-[11px] font-medium underline ${isLight ? 'text-red-500' : 'text-red-400'}`}
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        <div ref={gridRef}>
                            {(isLoading || !initialLoadDone) ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                    {[...Array(9)].map((_, i) => (
                                        <SkeletonCard key={i} isLight={isLight} />
                                    ))}
                                </div>
                            ) : processed.length === 0 ? (
                                <div className={`${card} flex flex-col items-center justify-center py-20 px-6 text-center transition-all duration-700 ${gridVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                        <FontAwesomeIcon icon={faProjectDiagram} className={`text-3xl ${subText}`} />
                                    </div>
                                    <h2 className={`text-xl font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>No Projects Found</h2>
                                    <p className={`text-sm max-w-md ${subText}`}>
                                        Try another category, search term, or tag filter.
                                    </p>
                                    {(key || cat || selectedTags.length > 0) && (
                                        <Link
                                            to="/projects"
                                            className={`mt-5 text-sm font-medium px-5 py-2 rounded-lg transition-colors ${isLight ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30'}`}
                                        >
                                            Back to all projects
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
                                        {pageData.map((item, index) => (
                                            <AnimatedCard key={item._id} index={index} isLight={isLight}>
                                                <ProjectCard item={item} categoryList={category} isLight={isLight} />
                                            </AnimatedCard>
                                        ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 pb-8">
                                            <button type="button" disabled={currentPage === 1} className={paginateBtn(currentPage === 1)} onClick={() => setCurrentPage(1)} aria-label="First page">
                                                <FontAwesomeIcon icon={faAngleDoubleLeft} />
                                            </button>
                                            <button type="button" disabled={currentPage === 1} className={paginateBtn(currentPage === 1)} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
                                                <FontAwesomeIcon icon={faChevronLeft} />
                                            </button>
                                            {displayedPages.map((n) => (
                                                <button key={n} type="button" className={pageNumBtn(currentPage === n)} onClick={() => setCurrentPage(n)}>{n}</button>
                                            ))}
                                            <button type="button" disabled={currentPage === totalPages} className={paginateBtn(currentPage === totalPages)} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} aria-label="Next page">
                                                <FontAwesomeIcon icon={faChevronRight} />
                                            </button>
                                            <button type="button" disabled={currentPage === totalPages} className={paginateBtn(currentPage === totalPages)} onClick={() => setCurrentPage(totalPages)} aria-label="Last page">
                                                <FontAwesomeIcon icon={faAngleDoubleRight} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Projects
