import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft,
    faArrowRight,
    faClock,
    faExternalLink,
    faFile,
    faHome,
    faQuoteLeft,
    faQuoteRight,
    faChevronRight,
    faEye,
    faHeart,
    faComment,
    faCalendar,
    faCalendarCheck,
    faFolder,
    faLock,
    faSearch,
    faThumbsUp,
    faFlag,
    faHourglass,
    faBullseye,
    faUser,
    faLayerGroup,
    faShareAlt,
    faInfoCircle,
    faBook,
    faKey,
    faBookmark,
    faDownload,
    faFilePdf,
    faUsers,
    faHistory,
    faCheckCircle,
    faDraftingCompass,
    faArchive,
    faPaperPlane,
    faReply,
    faChevronDown,
    faChevronUp,
    faLink,
    faCheck,
    faGlobe,
} from '@fortawesome/free-solid-svg-icons'
import { library, findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import SyntaxHighlighter from 'react-syntax-highlighter'
import * as hljsStyles from 'react-syntax-highlighter/dist/esm/styles/hljs'
import Cookies from 'universal-cookie'
import { io as socketIO } from 'socket.io-client'

import { main, dark, light } from '../../style'
import styles from '../../style'
import { Comments, CommentField } from '../Custom/Comments'
import ReportModal from '../Custom/ReportModal'
import Notification from '../Custom/Notification'
import {
    getLatestProjects,
    getCategory,
    getProjectByID,
    getProjectComments,
    addProjectComment,
    updateProjectComment,
    deleteProjectComment,
    updateProjectComments,
    toggleProjectLike,
    toggleBookmark,
    getRelatedProjects,
    viewProject,
    clearAlert,
} from '../../actions/project'

library.add(fas, far, fab)

const cookies = new Cookies()

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

const useScrollY = () => {
    const [scrollY, setScrollY] = useState(0)
    useEffect(() => {
        const handler = () => setScrollY(window.scrollY)
        window.addEventListener('scroll', handler, { passive: true })
        return () => window.removeEventListener('scroll', handler)
    }, [])
    return scrollY
}

const AnimatedSection = ({ children, className = '', delay = 0 }) => {
    const ref = useRef(null)
    const isVisible = useInView(ref)
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${className}`}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    )
}

const AnimatedSidebar = ({ children, className = '', delay = 0 }) => {
    const ref = useRef(null)
    const isVisible = useInView(ref)
    return (
        <div
            ref={ref}
            className={`transition-all duration-600 ease-out ${className}`}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    )
}

const CountUp = ({ target, duration = 1200 }) => {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const isVisible = useInView(ref)

    useEffect(() => {
        if (!isVisible || target === 0) return
        let start = 0
        const step = Math.max(1, Math.ceil(target / (duration / 16)))
        const timer = setInterval(() => {
            start += step
            if (start >= target) { setCount(target); clearInterval(timer) }
            else setCount(start)
        }, 16)
        return () => clearInterval(timer)
    }, [isVisible, target, duration])

    return <span ref={ref}>{count}</span>
}

const resolveIcon = (iconStr) => {
    if (!iconStr) return faFile
    const name = iconStr.startsWith('fa-') ? iconStr.substring(3) : iconStr
    return findIconDefinition({ prefix: 'fas', iconName: name }) || faFile
}

const resolveCategoryIcon = (iconName) => {
    if (!iconName) return null
    let name = String(iconName).trim().toLowerCase()
    if (name.startsWith('fa-')) name = name.slice(3)
    else if (name.startsWith('fa')) name = name.slice(2)
    if (!name) return null
    for (const prefix of ['fas', 'far', 'fab']) {
        const def = findIconDefinition({ prefix, iconName: name })
        if (def) return def
    }
    return null
}

function ImageCarousel({ images: rawImages, isLight, onImageClick }) {
    const images = (rawImages || []).filter(src => src && typeof src === 'string' && src.trim() !== '')
    const [current, setCurrent] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [touchStart, setTouchStart] = useState(null)
    const [touchDelta, setTouchDelta] = useState(0)
    const [paused, setPaused] = useState(false)
    const [loadErrors, setLoadErrors] = useState({})
    const trackRef = React.useRef(null)
    const autoplayRef = React.useRef(null)
    const total = images.length

    React.useEffect(() => {
        if (current >= total && total > 0) setCurrent(0)
    }, [total, current])

    if (total === 0) return null

    const goTo = (idx) => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrent(((idx % total) + total) % total)
        setTimeout(() => setIsTransitioning(false), 400)
    }
    const next = () => goTo(current + 1)
    const prev = () => goTo(current - 1)

    React.useEffect(() => {
        if (paused || total <= 1) return
        autoplayRef.current = setInterval(next, 4000)
        return () => clearInterval(autoplayRef.current)
    }, [current, paused, total])

    const handleTouchStart = (e) => {
        setPaused(true)
        setTouchStart(e.touches[0].clientX)
        setTouchDelta(0)
    }
    const handleTouchMove = (e) => {
        if (touchStart === null) return
        setTouchDelta(e.touches[0].clientX - touchStart)
    }
    const handleTouchEnd = () => {
        if (Math.abs(touchDelta) > 50) {
            touchDelta > 0 ? prev() : next()
        }
        setTouchStart(null)
        setTouchDelta(0)
        setTimeout(() => setPaused(false), 2000)
    }

    const slideCountLabel = `${current + 1} / ${total}`

    return (
        <div className={`relative rounded-xl border overflow-hidden select-none ${isLight ? 'border-slate-200/80 bg-slate-100' : 'border-[#2B2B2B] bg-[#090909]'}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}>

            <div className="relative w-full aspect-[16/9] sm:aspect-[16/9] md:aspect-[16/8] overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                ref={trackRef}>

                <div className="flex h-full transition-transform duration-400 ease-out"
                    style={{ transform: `translateX(calc(-${current * 100}% + ${touchStart !== null ? touchDelta : 0}px))` }}>
                    {images.map((src, i) => (
                        <div key={i} className="relative h-full flex-shrink-0 w-full">
                            {loadErrors[i] ? (
                                <div className={`absolute inset-0 flex items-center justify-center ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#111] text-gray-600'}`}>
                                    <span className="text-xs">Image unavailable</span>
                                </div>
                            ) : (
                                <img src={src} alt={`Slide ${i + 1}`}
                                    className="absolute inset-0 h-full w-full object-cover cursor-pointer"
                                    draggable={false}
                                    loading={i === 0 ? 'eager' : 'lazy'}
                                    onError={() => setLoadErrors(prev => ({ ...prev, [i]: true }))}
                                    onClick={() => onImageClick?.(src)} />
                            )}
                        </div>
                    ))}
                </div>

                {total > 1 && (
                    <>
                        <button onClick={prev} aria-label="Previous"
                            className={`absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100 ${isLight ? 'bg-white/90 text-slate-700 hover:bg-white shadow-md' : 'bg-black/60 text-white hover:bg-black/80 shadow-lg'}`}
                            style={{ opacity: 1 }}>
                            <FontAwesomeIcon icon={faArrowLeft} className="text-xs sm:text-sm" />
                        </button>
                        <button onClick={next} aria-label="Next"
                            className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${isLight ? 'bg-white/90 text-slate-700 hover:bg-white shadow-md' : 'bg-black/60 text-white hover:bg-black/80 shadow-lg'}`}
                            style={{ opacity: 1 }}>
                            <FontAwesomeIcon icon={faArrowRight} className="text-xs sm:text-sm" />
                        </button>

                        <div className={`absolute top-3 right-3 z-20 px-2 py-0.5 rounded-md text-[10px] font-medium ${isLight ? 'bg-black/50 text-white' : 'bg-white/20 text-white'}`}>
                            {slideCountLabel}
                        </div>
                    </>
                )}
            </div>

            {total > 1 && (
                <div className={`flex items-center justify-center gap-1.5 py-2.5 ${isLight ? 'bg-slate-50' : 'bg-[#0e0e0e]'}`}>
                    {images.map((_, i) => (
                        <button key={i} onClick={() => goTo(i)}
                            className={`rounded-full transition-all duration-300 ${
                                i === current
                                    ? `w-5 h-1.5 ${isLight ? 'bg-indigo-500' : 'bg-indigo-400'}`
                                    : `w-1.5 h-1.5 ${isLight ? 'bg-slate-300 hover:bg-slate-400' : 'bg-[#444] hover:bg-[#666]'}`
                            }`} />
                    ))}
                </div>
            )}
        </div>
    )
}

function diffInMonths(d1, d2) {
    if (!d1 || !d2) return null
    const date1 = new Date(d1)
    const date2 = new Date(d2)
    const totalMonths = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth())
    if (totalMonths < 1) {
        const days = Math.max(1, Math.round((date2 - date1) / (1000 * 60 * 60 * 24)))
        return `${days} day${days !== 1 ? 's' : ''}`
    }
    if (totalMonths >= 12) {
        const years = Math.floor(totalMonths / 12)
        const rem = totalMonths % 12
        return rem > 0 ? `${years}y ${rem}mo` : `${years} year${years !== 1 ? 's' : ''}`
    }
    return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`
}

function formatDateShort(date) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function timelineProgress(d1, d2) {
    if (!d1 || !d2) return null
    const start = new Date(d1).getTime()
    const end = new Date(d2).getTime()
    const now = Date.now()
    if (now >= end) return 100
    if (now <= start) return 0
    return Math.round(((now - start) / (end - start)) * 100)
}

const SkeletonBlock = ({ className, isLight }) => (
    <div className={`animate-pulse rounded-lg ${isLight ? 'bg-slate-200/70' : 'bg-[#0e0e0e]'} ${className}`} />
)

const FullSkeleton = ({ isLight }) => {
    const card = `rounded-xl border border-solid ${isLight ? 'bg-white/90 border-slate-200/80' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`
    return (
        <div className="pb-16 pt-8">
            <div className="flex items-center gap-2 mb-6">
                <SkeletonBlock className="h-3.5 w-10" isLight={isLight} />
                <SkeletonBlock className="h-3 w-3 rounded-full" isLight={isLight} />
                <SkeletonBlock className="h-3.5 w-16" isLight={isLight} />
                <SkeletonBlock className="h-3 w-3 rounded-full" isLight={isLight} />
                <SkeletonBlock className="h-3.5 w-36" isLight={isLight} />
            </div>

            <div className={`rounded-2xl overflow-hidden border mb-10 ${isLight ? 'border-slate-200/80' : 'border-[#2B2B2B]'}`}>
                <SkeletonBlock className="aspect-[21/9] min-h-[200px] sm:min-h-[280px] w-full rounded-none" isLight={isLight} />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
                <div className="min-w-0 lg:col-span-2 space-y-6">
                    <div className={`${card} p-6 sm:p-8 space-y-5`}>
                        <SkeletonBlock className="h-7 w-2/3" isLight={isLight} />
                        <SkeletonBlock className="h-4 w-full" isLight={isLight} />
                        <SkeletonBlock className="h-4 w-full" isLight={isLight} />
                        <SkeletonBlock className="h-4 w-5/6" isLight={isLight} />
                        <SkeletonBlock className="h-4 w-4/6" isLight={isLight} />
                        <div className="pt-4">
                            <SkeletonBlock className="h-6 w-1/2" isLight={isLight} />
                        </div>
                        <SkeletonBlock className="h-4 w-full" isLight={isLight} />
                        <SkeletonBlock className="h-4 w-full" isLight={isLight} />
                        <SkeletonBlock className="h-4 w-3/4" isLight={isLight} />
                        <SkeletonBlock className="h-48 w-full rounded-xl" isLight={isLight} />
                        <SkeletonBlock className="h-4 w-full" isLight={isLight} />
                        <SkeletonBlock className="h-4 w-5/6" isLight={isLight} />
                    </div>

                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <SkeletonBlock key={i} className="h-8 w-16 rounded-lg" isLight={isLight} />
                        ))}
                    </div>

                    <div className={`${card} px-6 py-4 flex gap-8`}>
                        <SkeletonBlock className="h-5 w-20" isLight={isLight} />
                        <SkeletonBlock className="h-5 w-20" isLight={isLight} />
                        <SkeletonBlock className="h-5 w-24" isLight={isLight} />
                    </div>

                    <div className={`${card} p-5 sm:p-6 space-y-4`}>
                        <SkeletonBlock className="h-5 w-28" isLight={isLight} />
                        <SkeletonBlock className="h-24 w-full rounded-lg" isLight={isLight} />
                        <SkeletonBlock className="h-4 w-24" isLight={isLight} />
                        <div className="space-y-4 pt-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <SkeletonBlock className="h-9 w-9 rounded-full flex-shrink-0" isLight={isLight} />
                                    <div className="flex-1 space-y-2">
                                        <SkeletonBlock className="h-3.5 w-24" isLight={isLight} />
                                        <SkeletonBlock className="h-3 w-full" isLight={isLight} />
                                        <SkeletonBlock className="h-3 w-3/4" isLight={isLight} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <aside className="space-y-6">
                    <div className={`${card} p-5 sm:p-6 space-y-4`}>
                        <SkeletonBlock className="h-5 w-36" isLight={isLight} />
                        <SkeletonBlock className="h-px w-12" isLight={isLight} />
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <SkeletonBlock className="h-10 w-10 rounded-full flex-shrink-0" isLight={isLight} />
                                <div className="flex-1 space-y-1.5">
                                    <SkeletonBlock className="h-4 w-28" isLight={isLight} />
                                    <SkeletonBlock className="h-3 w-16" isLight={isLight} />
                                </div>
                            </div>
                            <SkeletonBlock className="h-px w-full" isLight={isLight} />
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="text-center space-y-1.5">
                                        <SkeletonBlock className="h-7 w-10 mx-auto" isLight={isLight} />
                                        <SkeletonBlock className="h-3 w-12 mx-auto" isLight={isLight} />
                                    </div>
                                ))}
                            </div>
                            <SkeletonBlock className="h-px w-full" isLight={isLight} />
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <SkeletonBlock className="h-4 w-4 rounded flex-shrink-0" isLight={isLight} />
                                        <SkeletonBlock className="h-4 w-20 flex-shrink-0" isLight={isLight} />
                                        <SkeletonBlock className="h-4 flex-1" isLight={isLight} />
                                    </div>
                                ))}
                            </div>
                            <SkeletonBlock className="h-2 w-full rounded-full" isLight={isLight} />
                        </div>
                    </div>

                    <div className={`${card} p-5 sm:p-6 space-y-3`}>
                        <SkeletonBlock className="h-5 w-16" isLight={isLight} />
                        <SkeletonBlock className="h-px w-12" isLight={isLight} />
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <SkeletonBlock key={i} className="h-7 w-14 rounded-md" isLight={isLight} />
                            ))}
                        </div>
                    </div>

                    <div className={`${card} p-5 sm:p-6 space-y-3`}>
                        <SkeletonBlock className="h-5 w-24" isLight={isLight} />
                        <SkeletonBlock className="h-px w-12" isLight={isLight} />
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map((i) => (
                                <SkeletonBlock key={i} className="h-11 w-full rounded-lg" isLight={isLight} />
                            ))}
                        </div>
                    </div>

                    <div className={`${card} p-5 sm:p-6 space-y-3`}>
                        <SkeletonBlock className="h-5 w-28" isLight={isLight} />
                        <SkeletonBlock className="h-px w-12" isLight={isLight} />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <SkeletonBlock className="h-14 w-14 rounded-lg flex-shrink-0" isLight={isLight} />
                                    <div className="flex-1 space-y-1.5">
                                        <SkeletonBlock className="h-4 w-3/4" isLight={isLight} />
                                        <SkeletonBlock className="h-3 w-16" isLight={isLight} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

const ProjectsSingle = ({ user, theme }) => {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const dispatch = useDispatch()
    const scrollY = useScrollY()

    const project_data = useSelector((state) => state.project.data)
    const comments = useSelector((state) => state.project.comments)
    const category = useSelector((state) => state.project.user_category)
    const latestProjects = useSelector((state) => state.project.latestProjects)
    const notFound = useSelector((state) => state.project.notFound)
    const forbidden = useSelector((state) => state.project.forbidden)
    const isLoading = useSelector((state) => state.project.isLoading)
    const relatedProjects = useSelector((state) => state.project.relatedProjects)

    const isLight = theme === 'light'
    const userId = user?._id || user?.result?._id || ''

    const card = `rounded-xl border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-slate-200/80' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`
    const subText = isLight ? 'text-slate-400' : 'text-gray-500'
    const mutedText = isLight ? 'text-slate-300' : 'text-gray-600'
    const sectionBorder = isLight ? 'border-slate-100' : 'border-[#0e0e0e]'
    const headingClass = isLight ? 'text-slate-800' : 'text-white'
    const accentClass = isLight ? 'text-blue-600' : 'text-blue-400'
    const proseClass = isLight ? 'text-slate-700' : 'text-gray-300'
    const linkClass = isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
    const avatarBorder = isLight ? 'border-slate-200' : 'border-[#2B2B2B]'
    const sectionTitle = `text-sm font-bold flex items-center gap-2 pb-2 mb-3 border-b border-solid ${isLight ? 'text-slate-700 border-slate-100' : 'text-gray-200 border-[#222]'}`
    const iconBadgeCls = `flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`

    const [data, setData] = useState([])
    const [comment, setComment] = useState(null)
    const [notification, setNotification] = useState({})
    const [show, setShow] = useState(true)
    const [reportModal, setReportModal] = useState(false)
    const [reportId, setReportId] = useState('')
    const [reportType, setReportType] = useState('comment')
    const [likeAnimating, setLikeAnimating] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [lightbox, setLightbox] = useState({ open: false, src: '', index: 0 })
    const [accessKeyInput, setAccessKeyInput] = useState('')
    const [accessKeyError, setAccessKeyError] = useState('')
    const [bookmarkAnimating, setBookmarkAnimating] = useState(false)
    const [pdfExporting, setPdfExporting] = useState(false)
    const [linkCopied, setLinkCopied] = useState(false)
    const [changelogExpanded, setChangelogExpanded] = useState(false)
    const [replyTo, setReplyTo] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [expandedComments, setExpandedComments] = useState({})

    useEffect(() => { setMounted(true) }, [])

    const socketUrl = import.meta.env.VITE_DEVELOPMENT == "true"
        ? `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`
        : import.meta.env.VITE_APP_BASE_URL

    useEffect(() => {
        const access_key = searchParams.get('access_key') || ''
        dispatch(getProjectByID({ id, access_key, userId }))
        dispatch(getProjectComments({ projectId: id }))
        dispatch(getLatestProjects())
        dispatch(getCategory())
        window.scrollTo(0, 0)

        const uid = cookies.get('uid')
        if (uid) {
            dispatch(viewProject({ projectId: id, uid }))
        }

        const socket = socketIO(socketUrl, { transports: ['websocket', 'polling'] })
        socket.emit('join_project', id)

        socket.on('project_comments_updated', (socketData) => {
            if (socketData.projectId === id) {
                dispatch(updateProjectComments({ comments: socketData.comments }))
            }
        })

        return () => {
            socket.emit('leave_project', id)
            socket.disconnect()
        }
    }, [id])

    useEffect(() => {
        return () => dispatch(clearAlert())
    }, [dispatch])

    useEffect(() => {
        if (comments?.length) {
            const deepCloned = JSON.parse(JSON.stringify(comments))
            setData(deepCloned)
            setComment(null)
        } else {
            setData([])
        }
    }, [comments])

    useEffect(() => {
        if (!show) setNotification({})
    }, [show])

    useEffect(() => {
        if (comment) {
            comment.parent_id = id
            comment.user_id = userId
            comment.type = 'project'
            dispatch(addProjectComment(comment))
        }
    }, [comment])

    const handleComment = (formData) => {
        dispatch(updateProjectComment({ id, data: formData }))
    }

    const handleDeleteComment = (cid) => {
        dispatch(deleteProjectComment({ id: cid, project_id: id }))
    }

    const handleReport = (targetId = null, type = 'comment') => {
        setReportId(targetId || id)
        setReportType(type)
        setReportModal(true)
    }

    useEffect(() => {
        if (project_data?._id) {
            dispatch(getRelatedProjects({
                projectId: project_data._id,
                tags: project_data.tags || [],
                category: project_data.categories || '',
            }))
        }
    }, [project_data?._id])

    const isLiked = project_data?.likes?.includes(userId) || project_data?.likes?.includes(cookies.get('uid'))
    const isBookmarked = project_data?.bookmarks?.includes(userId) || project_data?.bookmarks?.includes(cookies.get('uid'))

    const handleToggleLike = () => {
        if (!userId) return
        setLikeAnimating(true)
        dispatch(toggleProjectLike({ projectId: id, userId }))
        setTimeout(() => setLikeAnimating(false), 600)
    }

    const handleToggleBookmark = () => {
        if (!userId) return
        setBookmarkAnimating(true)
        dispatch(toggleBookmark({ projectId: id, userId }))
        setTimeout(() => setBookmarkAnimating(false), 600)
    }

    const handleExportPDF = async () => {
        try {
            setPdfExporting(true)
            const html2canvas = (await import('html2canvas-pro')).default
            const { jsPDF } = await import('jspdf')
            const el = document.getElementById('project-content-area')
            if (!el) return
            const canvas = await html2canvas(el, { scale: 2, useCORS: true })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pW = pdf.internal.pageSize.getWidth()
            const pH = (canvas.height * pW) / canvas.width
            pdf.addImage(imgData, 'PNG', 0, 0, pW, pH)
            pdf.save(`${project_data?.post_title || 'project'}.pdf`)
        } catch (err) {
            console.error('PDF export failed:', err)
        } finally {
            setPdfExporting(false)
        }
    }

    const toggleCommentExpand = (commentId) => {
        setExpandedComments(prev => ({ ...prev, [commentId]: !prev[commentId] }))
    }

    const hljsStyle = useCallback(
        (name) => hljsStyles[name] || hljsStyles.github || hljsStyles.atomOneDark,
        []
    )

    const renderElement = (item, i, prefix = '') => {
        const key = `${prefix}-${i}`
        switch (item.element) {
            case 'heading':
                return (
                    <AnimatedSection key={key}>
                        <h2 id={`toc-heading-${prefix.replace('c','')}-${i}`} className={`mt-10 mb-4 text-xl sm:text-2xl font-bold tracking-tight ${headingClass}`}>
                            <span className={`inline-block w-8 h-[3px] rounded-full mr-3 align-middle ${isLight ? 'bg-indigo-400' : 'bg-indigo-500'}`} />
                            {item.heading}
                        </h2>
                    </AnimatedSection>
                )
            case 'sub_heading':
                return (
                    <AnimatedSection key={key}>
                        <h3 id={`toc-subheading-${prefix.replace('c','')}-${i}`} className={`mt-7 mb-3 text-lg sm:text-xl font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{item.heading}</h3>
                    </AnimatedSection>
                )
            case 'normal_naragraph':
                return (
                    <AnimatedSection key={key}>
                        <p className={`mb-5 text-[15px] leading-7 whitespace-pre-wrap ${proseClass}`}>{item.paragraph}</p>
                    </AnimatedSection>
                )
            case 'quoted_paragraph':
            case 'quoted_naragraph':
                return (
                    <AnimatedSection key={key}>
                        <blockquote className={`my-6 border-l-[3px] ${isLight ? 'border-indigo-400/70 bg-indigo-50/50' : 'border-indigo-500/50 bg-indigo-950/20'} rounded-r-xl py-5 pl-5 pr-5`}>
                            <FontAwesomeIcon icon={faQuoteLeft} className={`mb-2 text-sm ${isLight ? 'text-indigo-300' : 'text-indigo-600'}`} />
                            <p className={`text-[15px] italic leading-7 ${proseClass}`}>
                                {item.paragraph}
                            </p>
                        </blockquote>
                    </AnimatedSection>
                )
            case 'bullet_list':
            case 'number_list':
                return (
                    <AnimatedSection key={key}>
                        <div className="mb-6 flex flex-col gap-2">
                            {(item.list || []).map((l, li) => (
                                <div key={li} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${isLight ? 'bg-amber-50/80 border border-solid border-amber-100 hover:border-amber-200' : 'bg-amber-900/10 border border-solid border-amber-900/30 hover:border-amber-800/50'}`}>
                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-amber-100' : 'bg-amber-900/30'}`}>
                                        <span className={`text-xs font-bold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>{item.element === 'number_list' ? li + 1 : '•'}</span>
                                    </div>
                                    <span className={`flex-1 text-sm font-medium ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>{l}</span>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>
                )
            case 'download_list':
                return (
                    <AnimatedSection key={key}>
                        <div className="my-6 flex flex-col gap-2">
                            {(item.list || []).map((l, li) => (
                                <a key={li} href={l.link || '#'} target="_blank" rel="noopener noreferrer"
                                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${isLight ? 'bg-emerald-50/80 hover:bg-emerald-100 border border-solid border-emerald-100 hover:border-emerald-200' : 'bg-emerald-900/10 hover:bg-emerald-900/20 border border-solid border-emerald-900/30 hover:border-emerald-800/50'}`}>
                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-emerald-100' : 'bg-emerald-900/30'}`}>
                                        <FontAwesomeIcon icon={resolveIcon(l.icon)} className={`text-xs ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold truncate ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>{l.name}</p>
                                        {l.link && <p className={`text-xs truncate ${isLight ? 'text-emerald-500/70' : 'text-emerald-400/60'}`}>{l.link}</p>}
                                    </div>
                                    <FontAwesomeIcon icon={faExternalLink} className={`text-xs transition-transform group-hover:translate-x-0.5 ${isLight ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </a>
                            ))}
                        </div>
                    </AnimatedSection>
                )
            case 'list_image':
                return (
                    <AnimatedSection key={key}>
                        <div className="my-6 flex flex-col gap-2">
                            {(item.list || []).map((l, li) => {
                                const wrapClass = `group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isLight ? 'bg-sky-50/80 border border-solid border-sky-100 hover:border-sky-200' : 'bg-sky-900/10 border border-solid border-sky-900/30 hover:border-sky-800/50'}`
                                const inner = (
                                    <>
                                        {l.image
                                            ? <img src={l.image} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0 cursor-pointer"
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); openLightbox(l.image) }} />
                                            : <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-sky-100' : 'bg-sky-900/30'}`}>
                                                <FontAwesomeIcon icon={faFile} className={`text-xs ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
                                            </div>
                                        }
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold truncate ${isLight ? 'text-sky-700' : 'text-sky-300'}`}>{l.heading}</p>
                                            {l.sub_heading && <p className={`text-xs truncate ${isLight ? 'text-sky-500/70' : 'text-sky-400/60'}`}>{l.sub_heading}</p>}
                                        </div>
                                        {l.link && <FontAwesomeIcon icon={faExternalLink} className={`text-xs transition-transform group-hover:translate-x-0.5 ${isLight ? 'text-sky-400' : 'text-sky-500'}`} />}
                                    </>
                                )
                                return l.link ? (
                                    <a key={li} href={l.link} target="_blank" rel="noopener noreferrer" className={wrapClass}>{inner}</a>
                                ) : (
                                    <div key={li} className={wrapClass}>{inner}</div>
                                )
                            })}
                        </div>
                    </AnimatedSection>
                )
            case 'grid_image': {
                const gridCols = item.type === 'boxed' ? 'sm:grid-cols-2' : item.type === 'boxed-full' ? 'grid-cols-1' : 'sm:grid-cols-2'
                const hClass = item.type === 'boxed-full' ? 'md:h-[500px] sm:h-[400px] h-[300px]' : 'md:h-60 h-48'
                return (
                    <AnimatedSection key={key}>
                        <div className={`my-6 grid grid-cols-1 gap-3 ${gridCols}`}>
                            {(item.grid_image || []).map((src, gi) => (
                                <img key={gi} src={src} alt="" onClick={() => openLightbox(src)}
                                    className={`w-full ${hClass} rounded-xl object-cover border transition-transform duration-300 hover:scale-[1.02] cursor-pointer ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`} />
                            ))}
                        </div>
                    </AnimatedSection>
                )
            }
            case 'single_image':
                return (
                    <AnimatedSection key={key}>
                        <img src={item.image} alt="" onClick={() => openLightbox(item.image)}
                            className={`my-6 w-full rounded-xl object-cover border transition-transform duration-300 hover:scale-[1.01] cursor-pointer ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'} ${
                                item.type === 'boxed-full' ? 'md:h-[500px] sm:h-[400px] h-[300px]' : item.type === 'rectangular' ? 'md:h-60 h-48' : 'max-h-[480px]'
                            }`} />
                    </AnimatedSection>
                )
            case 'slider':
                return (
                    <AnimatedSection key={key}>
                        <div className="my-6">
                            <ImageCarousel
                                images={item.grid_image || item.images || []}
                                isLight={isLight}
                                onImageClick={(src) => openLightbox(src)}
                            />
                        </div>
                    </AnimatedSection>
                )
            case 'code_highlights': {
                const style = hljsStyle(item.theme)
                return (
                    <AnimatedSection key={key}>
                        <div className="my-6">
                            {item.name && <p className={`mb-2 text-sm font-medium ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{item.name}</p>}
                            <div className={`overflow-hidden rounded-xl border text-sm ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`}>
                                <SyntaxHighlighter language={item.language || 'text'} style={style} showLineNumbers wrapLongLines customStyle={{ margin: 0, borderRadius: '0.75rem' }}>
                                    {String(item.paragraph ?? '')}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    </AnimatedSection>
                )
            }
            case 'grid_column':
                return (
                    <AnimatedSection key={key}>
                        <div className={`my-6 grid gap-6 sm:grid-cols-2 ${sectionBorder} border-t border-b py-6`}>
                            <div className="space-y-2">{(item.grid1 || []).map((el, gi) => renderElement(el, gi, `${key}-g1`))}</div>
                            <div className="space-y-2">{(item.grid2 || []).map((el, gi) => renderElement(el, gi, `${key}-g2`))}</div>
                        </div>
                    </AnimatedSection>
                )
            default:
                return null
        }
    }

    const tocHeadings = React.useMemo(() => {
        const blocks = project_data?.content
        if (!Array.isArray(blocks)) return []
        const headings = []
        blocks.forEach((blockData, bi) => {
            if (blockData.header && blockData.header !== 'Container Box') {
                headings.push({ text: blockData.header, id: `toc-block-${bi}`, level: 1 })
            }
            ;(blockData.container || []).forEach((item, ci) => {
                if (item.element === 'heading') headings.push({ text: item.heading, id: `toc-heading-${bi}-${ci}`, level: 2 })
                else if (item.element === 'sub_heading') headings.push({ text: item.heading, id: `toc-subheading-${bi}-${ci}`, level: 3 })
            })
        })
        return headings
    }, [project_data?.content])

    const renderContentBlocks = () => {
        const blocks = project_data?.content
        if (!Array.isArray(blocks)) return null
        return blocks.map((blockData, index) => (
            <div key={index} className={`mb-8 last:mb-0 rounded-2xl border border-solid overflow-hidden ${isLight ? 'border-slate-200/70 bg-white shadow-sm' : 'border-[#1f1f1f] bg-[#0c0c0c]'}`}>
                {blockData.header && blockData.header !== 'Container Box' && (
                    <div className={`px-6 sm:px-8 pt-6 pb-4 ${isLight ? 'border-b border-slate-100/80' : 'border-b border-[#1a1a1a]'}`}>
                        <h2 id={`toc-block-${index}`} className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>
                            {blockData.header}
                        </h2>
                    </div>
                )}
                <div className="px-6 sm:px-8 py-5 sm:py-6">
                    {(blockData.container || []).map((item, i) => renderElement(item, i, `c${index}`))}
                </div>
            </div>
        ))
    }

    const statusWrap = (children) => (
        <div className={`${styles.marginX} ${styles.flexCenter} min-h-[60vh] py-20`}>
            <div className={`${styles.boxWidthEx} text-center`}>{children}</div>
        </div>
    )

    const allImages = React.useMemo(() => {
        const imgs = []
        if (project_data?.featured_image) imgs.push(project_data.featured_image)
        const blocks = project_data?.content
        if (Array.isArray(blocks)) {
            blocks.forEach((blockData) => {
                ;(blockData.container || []).forEach((item) => {
                    if (item.element === 'single_image' && item.image) imgs.push(item.image)
                    if (item.element === 'slider' && Array.isArray(item.images)) item.images.forEach(img => { if (img) imgs.push(img) })
                    if (item.element === 'list_image' && Array.isArray(item.items)) item.items.forEach(li => { if (li.image) imgs.push(li.image) })
                })
            })
        }
        return imgs
    }, [project_data?.content, project_data?.featured_image])

    const readingProgress = React.useMemo(() => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        if (docHeight <= 0) return 0
        return Math.min((scrollY / docHeight) * 100, 100)
    }, [scrollY])

    const hasFetched = !isLoading && (project_data?._id || notFound || forbidden)

    if (isLoading || !hasFetched) {
        return (
            <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className={`${styles.marginX} ${styles.flexCenter}`}>
                    <div className={styles.boxWidthEx}>
                        <FullSkeleton isLight={isLight} />
                    </div>
                </div>
            </div>
        )
    }

    if (notFound) {
        return (
            <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                {statusWrap(
                    <div className={`mx-auto max-w-md rounded-2xl border p-10 ${card}`}>
                        <FontAwesomeIcon icon={faSearch} className={`mb-4 text-4xl ${subText}`} />
                        <h1 className={`text-2xl font-bold ${headingClass}`}>Project not found</h1>
                        <p className={`mt-3 ${subText}`}>The project you are looking for does not exist or was removed.</p>
                        <Link to="/projects" className={`mt-8 inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#222]'}`}>
                            Back to projects
                        </Link>
                    </div>
                )}
            </div>
        )
    }

    if (forbidden) {
        const handleAccessKeySubmit = (e) => {
            e.preventDefault()
            if (!accessKeyInput.trim()) return
            setAccessKeyError('')
            dispatch(getProjectByID({ id, access_key: accessKeyInput.trim(), userId }))
                .then((res) => {
                    if (res.payload?.data?.forbidden) {
                        setAccessKeyError('Invalid access key. Please try again.')
                    }
                })
        }

        return (
            <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                {statusWrap(
                    <div className={`mx-auto max-w-md rounded-2xl border p-10 ${card}`}>
                        <FontAwesomeIcon icon={faLock} className={`mb-4 text-4xl ${accentClass}`} />
                        <h1 className={`text-2xl font-bold ${headingClass}`}>Private Project</h1>
                        <p className={`mt-3 mb-6 ${subText}`}>This project is private. Enter an access key to view it.</p>
                        <form onSubmit={handleAccessKeySubmit} className="space-y-3">
                            <div className="relative">
                                <FontAwesomeIcon icon={faKey} className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs ${mutedText}`} />
                                <input
                                    type="text"
                                    value={accessKeyInput}
                                    onChange={(e) => { setAccessKeyInput(e.target.value); setAccessKeyError('') }}
                                    placeholder="Enter access key..."
                                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-solid outline-none transition-all ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`}
                                />
                            </div>
                            {accessKeyError && (
                                <p className="text-xs text-red-500">{accessKeyError}</p>
                            )}
                            <button type="submit" className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${isLight ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                Access Project
                            </button>
                        </form>
                        <Link to="/projects" className={`mt-5 inline-block text-sm font-medium transition-colors ${linkClass}`}>
                            &larr; Back to projects
                        </Link>
                    </div>
                )}
            </div>
        )
    }

    if (!project_data?._id) {
        return (
            <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className={`${styles.marginX} ${styles.flexCenter}`}>
                    <div className={styles.boxWidthEx}>
                        <FullSkeleton isLight={isLight} />
                    </div>
                </div>
            </div>
        )
    }

    const p = project_data

    const openLightbox = (src) => {
        const idx = allImages.indexOf(src)
        setLightbox({ open: true, src, index: idx >= 0 ? idx : 0 })
    }

    const author = p.user || {}
    const viewsCount = Array.isArray(p.views) ? p.views.length : 0
    const likesCount = Array.isArray(p.likes) ? p.likes.length : 0
    const commentsCount = data?.length || 0
    const otherLatest = (latestProjects || []).filter((proj) => String(proj._id) !== String(id))
    const relatedList = (relatedProjects || []).filter((proj) => String(proj._id) !== String(id))

    const statusConfig = {
        'draft': { label: 'Draft', icon: faDraftingCompass, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/30' },
        'in-progress': { label: 'In Progress', icon: faHourglass, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' },
        'completed': { label: 'Completed', icon: faCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
        'archived': { label: 'Archived', icon: faArchive, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/30' },
    }
    const statusInfo = statusConfig[p.status] || statusConfig['draft']

    const catId = p.categories
    const matchedCategory = Array.isArray(category) && catId
        ? category.find((c) => String(c._id) === String(catId))
        : null

    const parallaxOffset = Math.min(scrollY * 0.35, 150)

    const duration = diffInMonths(p.date_start, p.date_end)
    const progress = timelineProgress(p.date_start, p.date_end)

    const infoRows = [
        {
            icon: statusInfo.icon,
            label: 'Status',
            value: <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>,
        },
        matchedCategory && {
            icon: faLayerGroup,
            label: 'Category',
            value: (
                <Link to={`/projects/category/${matchedCategory._id}`} className={`inline-flex items-center gap-1.5 font-medium ${linkClass}`}>
                    {matchedCategory.image && (() => {
                        const icon = resolveCategoryIcon(matchedCategory.image)
                        return icon ? <FontAwesomeIcon icon={icon} className="text-[11px]" /> : null
                    })()}
                    {matchedCategory.name}
                    {matchedCategory.count > 0 && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/20 text-blue-400'}`}>{matchedCategory.count}</span>
                    )}
                </Link>
            ),
        },
        {
            icon: faBullseye,
            label: 'Purpose',
            value: <span className={`font-medium ${headingClass}`}>{p.created_for || 'Personal'}</span>,
        },
        {
            icon: faCalendar,
            label: 'Started',
            value: <span className={headingClass}>{formatDateShort(p.date_start)}</span>,
        },
        {
            icon: faCalendarCheck,
            label: 'Completed',
            value: <span className={headingClass}>{formatDateShort(p.date_end)}</span>,
        },
        duration && {
            icon: faHourglass,
            label: 'Duration',
            value: <span className={`font-semibold ${accentClass}`}>{duration}</span>,
        },
        {
            icon: faClock,
            label: 'Published',
            value: <span className={headingClass}>{moment(p.createdAt).fromNow()}</span>,
        },
    ].filter(Boolean)

    return (
        <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]" style={{ pointerEvents: 'none' }}>
                <div className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 transition-[width] duration-150 ease-out" style={{ width: `${readingProgress}%` }} />
            </div>

            {/* Back to Top */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-6 right-6 z-[9998] w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                    scrollY > 400 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                } ${isLight ? 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200' : 'bg-[#1a1a1a]/90 text-white hover:bg-[#252525] border border-[#333]'}`}>
                <FontAwesomeIcon icon={faChevronUp} className="text-sm" />
            </button>

            <Notification theme={theme} data={notification} show={show} setShow={setShow} />
            <ReportModal theme={theme} openModal={reportModal} setOpenModal={setReportModal} id={reportId} type={reportType} user={user} />

            {lightbox.open && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setLightbox({ open: false, src: '', index: 0 }) }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setLightbox({ open: false, src: '', index: 0 })
                        if (e.key === 'ArrowLeft' && lightbox.index > 0) setLightbox({ ...lightbox, index: lightbox.index - 1, src: allImages[lightbox.index - 1] })
                        if (e.key === 'ArrowRight' && lightbox.index < allImages.length - 1) setLightbox({ ...lightbox, index: lightbox.index + 1, src: allImages[lightbox.index + 1] })
                    }}
                    tabIndex={0}
                    ref={(el) => el && el.focus()}
                >
                    <img src={lightbox.src} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg select-none" />

                    {/* Counter */}
                    {allImages.length > 1 && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                            {lightbox.index + 1} / {allImages.length}
                        </div>
                    )}

                    {/* Close */}
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                        onClick={() => setLightbox({ open: false, src: '', index: 0 })}>
                        <span className="text-lg font-light">&times;</span>
                    </button>

                    {/* Prev */}
                    {lightbox.index > 0 && (
                        <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: lightbox.index - 1, src: allImages[lightbox.index - 1] }) }}>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                    )}

                    {/* Next */}
                    {lightbox.index < allImages.length - 1 && (
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: lightbox.index + 1, src: allImages[lightbox.index + 1] }) }}>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    )}
                </div>
            )}

            <div className={`${styles.marginX} ${styles.flexCenter} pb-16 pt-8`}>
                <div className={styles.boxWidthEx}>
                    <nav className={`mb-6 flex flex-wrap items-center gap-2 text-sm transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'} ${subText}`}>
                        <Link to="/" className={`inline-flex items-center gap-1 ${linkClass}`}>
                            <FontAwesomeIcon icon={faHome} className="text-xs" /> Home
                        </Link>
                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px] opacity-60" />
                        <Link to="/projects" className={linkClass}>Projects</Link>
                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px] opacity-60" />
                        <span className={`max-w-[min(100%,280px)] truncate font-medium ${headingClass}`}>{p.post_title}</span>
                    </nav>

                    <div
                        className={`relative mb-10 overflow-hidden rounded-2xl border transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${isLight ? 'border-slate-200/80' : 'border-[#2B2B2B]'}`}
                    >
                        {p.featured_image ? (
                            <div className="relative aspect-[21/8] min-h-[180px] sm:min-h-[240px] w-full overflow-hidden">
                                <img
                                    src={p.featured_image}
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-100 will-change-transform"
                                    style={{ transform: `translateY(${parallaxOffset}px) scale(1.1)` }}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t ${isLight ? 'from-slate-900/85 via-slate-900/40' : 'from-black/90 via-black/50'} to-transparent`} />

                                <div className="absolute top-4 left-4 z-10">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md ${statusInfo.bg} ${statusInfo.color}`}>
                                        <FontAwesomeIcon icon={statusInfo.icon} className="text-[10px]" />
                                        {statusInfo.label}
                                    </span>
                                </div>
                                {userId && (
                                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                                        <button onClick={handleToggleBookmark}
                                            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium backdrop-blur-md transition-all duration-300 ${bookmarkAnimating ? 'scale-110' : 'scale-100'} ${
                                                isBookmarked ? 'bg-amber-500/90 text-white hover:bg-amber-600' : 'bg-black/40 text-white/90 hover:bg-black/60'
                                            }`}>
                                            <FontAwesomeIcon icon={faBookmark} />
                                        </button>
                                        <button onClick={handleToggleLike}
                                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-md transition-all duration-300 ${likeAnimating ? 'scale-125' : 'scale-100'} ${
                                                isLiked
                                                    ? 'bg-red-500/90 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                                                    : 'bg-black/40 text-white/90 hover:bg-black/60'
                                            }`}>
                                            <FontAwesomeIcon icon={faHeart} className={`transition-transform duration-300 ${likeAnimating ? 'scale-125' : ''} ${isLiked ? 'text-white' : 'text-white/80'}`} />
                                            {likesCount}
                                        </button>
                                    </div>
                                )}

                                <div
                                    className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 transition-all duration-700 delay-200"
                                    style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}
                                >
                                    <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl lg:text-4xl">{p.post_title}</h1>
                                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/90">
                                        {author.avatar && <img src={author.avatar} alt="" className="h-10 w-10 rounded-full border-2 border-white/30 object-cover" />}
                                        <div>
                                            <p className="font-semibold">{author.username || 'Author'}</p>
                                            <p className="text-white/75">{formatDateShort(p.createdAt)} · {moment(p.createdAt).fromNow()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={`flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between ${isLight ? 'bg-gradient-to-br from-sky-100 to-white' : 'bg-[#141414]'}`}>
                                <div className="min-w-0 flex-1">
                                    <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${headingClass}`}>{p.post_title}</h1>
                                    <div className="mt-4 flex items-center gap-3">
                                        {author.avatar && <img src={author.avatar} alt="" className={`h-11 w-11 rounded-full object-cover border ${avatarBorder}`} />}
                                        <div>
                                            <p className={`font-semibold ${headingClass}`}>{author.username || 'Author'}</p>
                                            <p className={`text-sm ${subText}`}>{formatDateShort(p.createdAt)} · {moment(p.createdAt).fromNow()}</p>
                                        </div>
                                    </div>
                                </div>
                                {userId && (
                                    <button onClick={handleToggleLike}
                                        className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${likeAnimating ? 'scale-110' : ''} ${
                                            isLiked
                                                ? (isLight ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-red-950/30 text-red-400 hover:bg-red-950/50')
                                                : (isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222]')
                                        }`}>
                                        <FontAwesomeIcon icon={faHeart} className={`transition-transform duration-300 ${likeAnimating ? 'scale-125' : ''}`} />
                                        {likesCount}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
                        <div className="min-w-0 lg:col-span-2">
                            <AnimatedSection>
                                <article id="project-content-area" className="space-y-0">
                                    <div className="prose prose-sm max-w-none">{renderContentBlocks()}</div>
                                </article>
                            </AnimatedSection>

                            {Array.isArray(p.tags) && p.tags.length > 0 && (
                                <AnimatedSection className="mt-8">
                                    <div className="flex flex-wrap gap-2">
                                        {p.tags.map((tag, ti) => (
                                            <Link to={`/projects/search/${encodeURIComponent(tag)}`} key={ti}
                                                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 ${isLight ? 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm' : 'border-[#2B2B2B] bg-[#0e0e0e] text-gray-300 hover:border-blue-500 hover:text-blue-400'}`}>
                                                #{tag}
                                            </Link>
                                        ))}
                                    </div>
                                </AnimatedSection>
                            )}

                            <AnimatedSection className="mt-6">
                                <div className={`flex flex-wrap items-center gap-4 rounded-xl border px-6 py-4 text-sm ${card}`}>
                                    <span className={`inline-flex items-center gap-2 ${subText}`}>
                                        <FontAwesomeIcon icon={faEye} /> <CountUp target={viewsCount} /> view{viewsCount !== 1 && 's'}
                                    </span>
                                    <button onClick={handleToggleLike} disabled={!userId}
                                        className={`inline-flex items-center gap-2 transition-all duration-300 disabled:cursor-default ${isLiked ? 'text-red-500' : subText} ${userId ? 'hover:text-red-500 cursor-pointer' : ''} ${likeAnimating ? 'scale-110' : ''}`}>
                                        <FontAwesomeIcon icon={faHeart} className={`transition-transform duration-300 ${likeAnimating ? 'scale-125' : ''}`} /> <CountUp target={likesCount} /> like{likesCount !== 1 && 's'}
                                    </button>
                                    <span className={`inline-flex items-center gap-2 ${subText}`}>
                                        <FontAwesomeIcon icon={faComment} /> <CountUp target={commentsCount} /> comment{commentsCount !== 1 && 's'}
                                    </span>
                                    <div className="ml-auto flex items-center gap-2">
                                        {userId && (
                                            <button onClick={handleToggleBookmark}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-solid ${
                                                    isBookmarked
                                                        ? (isLight ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-amber-900/20 text-amber-400 border-amber-800/40')
                                                        : (isLight ? 'bg-white text-slate-500 border-slate-200 hover:border-amber-300' : 'bg-[#1a1a1a] text-gray-400 border-[#333] hover:border-amber-700')
                                                }`}>
                                                <FontAwesomeIcon icon={faBookmark} /> {isBookmarked ? 'Saved' : 'Save'}
                                            </button>
                                        )}
                                        <button onClick={handleExportPDF} disabled={pdfExporting}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-solid ${
                                                isLight ? 'bg-white text-slate-500 border-slate-200 hover:border-red-300 hover:text-red-500' : 'bg-[#1a1a1a] text-gray-400 border-[#333] hover:border-red-700 hover:text-red-400'
                                            } ${pdfExporting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <FontAwesomeIcon icon={faFilePdf} /> {pdfExporting ? 'Exporting...' : 'PDF'}
                                        </button>
                                    </div>
                                </div>
                            </AnimatedSection>

                            {/* Share Actions */}
                            <AnimatedSection className="mt-3">
                                <div className={`flex flex-wrap items-center gap-2 rounded-xl border px-4 sm:px-6 py-3 ${card}`}>
                                    <span className={`text-xs font-semibold mr-1 ${subText}`}>Share</span>
                                    <button onClick={() => {
                                        navigator.clipboard.writeText(window.location.href)
                                        setLinkCopied(true)
                                        setTimeout(() => setLinkCopied(false), 2000)
                                    }} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-solid ${
                                        linkCopied
                                            ? (isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-900/20 text-emerald-400 border-emerald-800/40')
                                            : (isLight ? 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-500' : 'bg-[#1a1a1a] text-gray-400 border-[#333] hover:border-blue-700 hover:text-blue-400')
                                    }`}>
                                        <FontAwesomeIcon icon={linkCopied ? faCheck : faLink} />
                                        {linkCopied ? 'Copied!' : 'Copy Link'}
                                    </button>
                                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(p.post_title)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-solid ${isLight ? 'bg-white text-slate-500 border-slate-200 hover:border-sky-300 hover:text-sky-500' : 'bg-[#1a1a1a] text-gray-400 border-[#333] hover:border-sky-700 hover:text-sky-400'}`}>
                                        <FontAwesomeIcon icon={faGlobe} /> Twitter
                                    </a>
                                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-solid ${isLight ? 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-500' : 'bg-[#1a1a1a] text-gray-400 border-[#333] hover:border-blue-700 hover:text-blue-400'}`}>
                                        <FontAwesomeIcon icon={faGlobe} /> Facebook
                                    </a>
                                    {typeof navigator.share === 'function' && (
                                        <button onClick={() => navigator.share({ title: p.post_title, url: window.location.href })}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-solid ${isLight ? 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-500' : 'bg-[#1a1a1a] text-gray-400 border-[#333] hover:border-indigo-700 hover:text-indigo-400'}`}>
                                            <FontAwesomeIcon icon={faShareAlt} /> Share
                                        </button>
                                    )}
                                </div>
                            </AnimatedSection>

                            {/* Collaborators */}
                            {Array.isArray(p.collaborators) && p.collaborators.length > 0 && (
                                <AnimatedSection className="mt-6">
                                    <div className={`${card} p-5 sm:p-6`}>
                                        <h2 className={sectionTitle}>
                                            <FontAwesomeIcon icon={faUsers} className="text-xs" /> Team
                                        </h2>
                                        <div className="flex flex-wrap gap-3">
                                            {p.collaborators.map((c, ci) => {
                                                const collab = c.user || {}
                                                return (
                                                    <div key={ci} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2B2B2B] bg-[#141414]'}`}>
                                                        {collab.avatar ? (
                                                            <img src={collab.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                                                        ) : (
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isLight ? 'bg-blue-100' : 'bg-blue-900/20'}`}>
                                                                <FontAwesomeIcon icon={faUser} className={`text-xs ${accentClass}`} />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className={`text-xs font-semibold ${headingClass}`}>{collab.username || 'User'}</p>
                                                            <p className={`text-[10px] capitalize ${subText}`}>{c.role}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </AnimatedSection>
                            )}

                            {/* Attachments */}
                            {Array.isArray(p.attachments) && p.attachments.length > 0 && (
                                <AnimatedSection className="mt-6">
                                    <div className={`${card} p-5 sm:p-6`}>
                                        <h2 className={sectionTitle}>
                                            <FontAwesomeIcon icon={faDownload} className="text-xs" /> Attachments
                                        </h2>
                                        <div className="space-y-2">
                                            {p.attachments.map((att, ai) => (
                                                <a key={ai} href={att.url} target="_blank" rel="noopener noreferrer"
                                                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-200 hover:scale-[1.01] ${isLight ? 'border-slate-200/80 hover:bg-slate-50' : 'border-[#2B2B2B] hover:bg-[#141414]'}`}>
                                                    <FontAwesomeIcon icon={faFile} className={accentClass} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${headingClass}`}>{att.name}</p>
                                                        {att.size > 0 && <p className={`text-[10px] ${subText}`}>{(att.size / 1024).toFixed(1)} KB</p>}
                                                    </div>
                                                    <FontAwesomeIcon icon={faDownload} className={`text-xs ${subText}`} />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </AnimatedSection>
                            )}

                            {/* Changelog */}
                            {Array.isArray(p.changelog) && p.changelog.length > 0 && (() => {
                                const sorted = p.changelog.slice().sort((a, b) => new Date(b.date) - new Date(a.date))
                                const visible = changelogExpanded ? sorted : sorted.slice(0, 5)
                                return (
                                    <AnimatedSection className="mt-6">
                                        <div className={`${card} p-5 sm:p-6`}>
                                            <h2 className={sectionTitle}>
                                                <FontAwesomeIcon icon={faHistory} className="text-xs" /> Changelog
                                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>{sorted.length}</span>
                                            </h2>
                                            <div className="relative pl-6">
                                                <div className={`absolute left-[9px] top-2 bottom-2 w-px ${isLight ? 'bg-indigo-100' : 'bg-indigo-900/30'}`} />
                                                <div className="space-y-4">
                                                    {visible.map((entry, ei) => (
                                                        <div key={ei} className="relative">
                                                            <div className={`absolute -left-6 top-1.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                                                                ei === 0
                                                                    ? (isLight ? 'bg-indigo-500 border-indigo-500' : 'bg-indigo-500 border-indigo-500')
                                                                    : (isLight ? 'bg-white border-indigo-200' : 'bg-[#0e0e0e] border-indigo-800/50')
                                                            }`}>
                                                                {ei === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                            </div>
                                                            <div className={`rounded-lg p-3 ${isLight ? 'bg-slate-50/80 border border-solid border-slate-100' : 'bg-[#111] border border-solid border-[#1a1a1a]'}`}>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-900/20 text-indigo-400'}`}>v{entry.version}</span>
                                                                    <span className={`text-[10px] ${subText}`}>{formatDateShort(entry.date)}</span>
                                                                </div>
                                                                <p className={`text-sm leading-relaxed ${proseClass}`}>{entry.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {sorted.length > 5 && (
                                                <button onClick={() => setChangelogExpanded(!changelogExpanded)}
                                                    className={`mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${isLight ? 'bg-slate-50 text-slate-500 hover:bg-slate-100' : 'bg-[#111] text-gray-400 hover:bg-[#1a1a1a]'}`}>
                                                    <FontAwesomeIcon icon={changelogExpanded ? faChevronUp : faChevronDown} className="text-[10px]" />
                                                    {changelogExpanded ? 'Show less' : `View ${sorted.length - 5} older`}
                                                </button>
                                            )}
                                        </div>
                                    </AnimatedSection>
                                )
                            })()}

                            <AnimatedSection className="mt-8">
                                <div className={`${card} p-5 sm:p-6`}>
                                    <h2 className={sectionTitle}>
                                        <FontAwesomeIcon icon={faComment} className="text-xs" /> Comments
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>
                                            {data?.length || 0}
                                        </span>
                                    </h2>
                                    <div className="flex flex-col gap-5">
                                        <CommentField comment={comment} setComment={setComment} theme={theme} />
                                        <h3 className='text-sm font-semibold'>{data?.length ?? 0} Comment{data?.length > 1 && 's'}</h3>
                                        {data?.length > 0 && data.map((item, i) => (
                                            <Comments key={i} theme={theme} data={item} handleSubmit={handleComment} deleteComment={handleDeleteComment} onReport={handleReport} />
                                        ))}
                                        {data?.length === 0 && (
                                            <p className={`text-xs text-center py-4 ${subText}`}>No comments yet</p>
                                        )}
                                    </div>
                                </div>
                            </AnimatedSection>
                        </div>

                        <aside className="space-y-6 lg:sticky lg:top-20">
                            <AnimatedSidebar delay={100}>
                                <div className={`overflow-hidden ${card}`}>
                                    <div className={`px-5 pt-5 pb-4 sm:px-6 sm:pt-6 flex items-center gap-2 ${isLight ? 'border-b border-slate-100' : 'border-b border-[#0e0e0e]'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-100' : 'bg-blue-900/20'}`}>
                                            <FontAwesomeIcon icon={faInfoCircle} className={`text-sm ${accentClass}`} />
                                        </div>
                                        <h2 className={`text-base font-bold ${headingClass}`}>Project Information</h2>
                                    </div>

                                    <div className="px-5 py-4 sm:px-6">
                                        <div className="space-y-0">
                                            {infoRows.map((row, ri) => (
                                                <div key={ri}
                                                    className={`flex items-center gap-3 py-3 ${ri < infoRows.length - 1 ? (isLight ? 'border-b border-slate-50' : 'border-b border-[#1a1a1a]') : ''}`}
                                                >
                                                    <div className={iconBadgeCls}>
                                                        <FontAwesomeIcon icon={row.icon} className={`text-xs ${accentClass}`} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${mutedText}`}>{row.label}</p>
                                                        <div className="text-sm leading-snug">{row.value}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {p.documentation_link && (
                                            <div className={`mt-4 pt-4 border-t border-solid ${sectionBorder}`}>
                                                <a href={p.documentation_link} target="_blank" rel="noopener noreferrer"
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-solid transition-all duration-200 hover:translate-x-0.5 ${isLight
                                                        ? 'border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-50'
                                                        : 'border-blue-800/40 bg-blue-900/10 text-blue-400 hover:bg-blue-900/20'
                                                    }`}>
                                                    <FontAwesomeIcon icon={faBook} className="text-sm" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold">View Documentation</p>
                                                        <p className={`text-[10px] truncate ${isLight ? 'text-blue-500' : 'text-blue-500/70'}`}>{p.documentation_link}</p>
                                                    </div>
                                                    <FontAwesomeIcon icon={faExternalLink} className="text-[10px] opacity-60" />
                                                </a>
                                            </div>
                                        )}

                                        {progress !== null && (
                                            <div className={`mt-4 pt-4 border-t border-solid ${sectionBorder}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${mutedText}`}>Timeline progress</span>
                                                    <span className={`text-xs font-bold ${progress >= 100 ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : accentClass}`}>{progress}%</span>
                                                </div>
                                                <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${progress >= 100
                                                            ? (isLight ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-400')
                                                            : (isLight ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-blue-500 to-cyan-500')
                                                        }`}
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                                {progress >= 100 && (
                                                    <p className={`text-[10px] mt-1.5 font-medium ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>Completed</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </AnimatedSidebar>

                            {/* Table of Contents */}
                            {tocHeadings.length >= 3 && (
                                <AnimatedSidebar delay={150}>
                                    <div className={`p-5 sm:p-6 ${card}`}>
                                        <h2 className={`mb-3 text-base font-bold ${headingClass}`}>Contents</h2>
                                        <nav className="space-y-1">
                                            {tocHeadings.map((h, hi) => (
                                                <a
                                                    key={hi}
                                                    href={`#${h.id}`}
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                                    }}
                                                    className={`block text-xs py-1 transition-colors border-l-2 border-solid ${
                                                        h.level === 1 ? 'pl-3 font-medium' : h.level === 2 ? 'pl-5' : 'pl-7'
                                                    } ${isLight
                                                        ? 'text-slate-500 hover:text-indigo-600 border-transparent hover:border-indigo-400'
                                                        : 'text-gray-400 hover:text-indigo-400 border-transparent hover:border-indigo-500'
                                                    }`}
                                                >
                                                    {h.text}
                                                </a>
                                            ))}
                                        </nav>
                                    </div>
                                </AnimatedSidebar>
                            )}

                        </aside>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectsSingle
