import React, { useEffect, useState, useRef } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from 'react-redux'
import {
    faCalendar, faInfoCircle, faImage, faDownload, faChevronRight, faChevronLeft,
    faArrowRight, faHeart, faComment, faArrowLeft, faExternalLink, faTrash, faClock,
    faGamepad, faHome, faStar, faGlobe, faDesktop, faLock, faEye, faBook, faKey,
    faChevronDown, faChevronUp, faTimes, faLink, faFlag, faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import { Link } from 'react-router-dom';
import { useParams, useSearchParams } from 'react-router-dom'
import { getGameComments, addGameComment, updateGameComment, deleteGameComment, updateGameComments, addRatings, categoriesCount, addOneDownload, getRelatedGames, updateGameAccessKey, getGameByID, countTags, getRecentGameBlog, addRecentGamingBlogLikes, clearAlert, toggleFavoriteGame, getFavoriteGames } from "../../actions/game";
import { convertDriveImageLink } from '../Tools'
import { Comments, CommentField } from '../Custom/Comments'
import ReportModal from '../Custom/ReportModal'
import Notification from '../Custom/Notification'
import Cookies from 'universal-cookie';
import { main, dark, light } from '../../style'
import styles from "../../style";
import avatar from '../../assets/avatar.webp'
import moment from 'moment';
import { faGoogleDrive } from '@fortawesome/free-brands-svg-icons';
import { io as socketIO } from 'socket.io-client';

const cookies = new Cookies();

function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const divideAndScale = (ratings) => {
    if (!ratings || ratings.length === 0) return 0
    const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);
    return (totalRating / ratings.length).toFixed(1)
}

const StarRating = ({ rating, fixedRating, hoverRating, isLight, interactive, onHover, onLeave, onClick }) => (
    <div className="flex items-center gap-0.5" onMouseLeave={onLeave}>
        {[...Array(5)].map((_, i) => {
            const starValue = i + 1
            const display = hoverRating > 0 ? hoverRating : (fixedRating || rating)
            const filled = display >= starValue
            const half = display >= starValue - 0.5
            return (
                <FontAwesomeIcon key={i} icon={faStar}
                    onMouseEnter={() => interactive && onHover?.(starValue)}
                    onClick={() => interactive && onClick?.(starValue)}
                    className={`text-sm transition-colors ${interactive ? 'cursor-pointer' : ''} ${filled ? 'text-amber-400' : half ? 'text-amber-300' : (isLight ? 'text-slate-200' : 'text-gray-700')}`}
                />
            )
        })}
    </div>
)

const GamesSingle = ({ user, theme }) => {
    const { id } = useParams();
    const dispatch = useDispatch()

    const game_data = useSelector((state) => state.game.data)
    const related_games = useSelector((state) => state.game.relatedGames)
    const notFound = useSelector((state) => state.game.notFound)
    const forbiden = useSelector((state) => state.game.forbiden)
    const isLoading = useSelector((state) => state.game.isLoading)
    const tagsList = useSelector((state) => state.game.tagsCount)
    const categoriesList = useSelector((state) => state.game.categoriesCount)
    const recentGameBlog = useSelector((state) => state.game.recentGameBlog)
    const comments = useSelector((state) => state.game.comments)
    const favoriteGames = useSelector((state) => state.game.favoriteGames)

    const isLight = theme === 'light'
    const userId = user?._id || user?.result?._id || ''

    const [searchParams, setSearchParams] = useSearchParams();
    const [relatedGames, setRelatedGames] = useState([])
    const [gameData, setGameData] = useState({})
    const [recentBlogs, setRecentBlogs] = useState([])
    const [rating, setRating] = useState(0);
    const [fixedRating, setFixedRating] = useState(0)
    const [ratingNumber, setRatingNumber] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [lightbox, setLightbox] = useState({ open: false, src: '' })
    const [carouselIndex, setCarouselIndex] = useState(0)
    const [data, setData] = useState([])
    const [comment, setComment] = useState(null)
    const [notification, setNotification] = useState({})
    const [show, setShow] = useState(true)
    const [reportModal, setReportModal] = useState(false)
    const [reportId, setReportId] = useState('')
    const [reportType, setReportType] = useState('comment')
    const [accessKeyInput, setAccessKeyInput] = useState('')

    const access_key = searchParams.get('access_key')

    const socketUrl = import.meta.env.VITE_DEVELOPMENT == "true"
        ? `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`
        : import.meta.env.VITE_APP_BASE_URL

    useEffect(() => {
        if (forbiden === 'access_granted') {
            dispatch(updateGameAccessKey({
                id: user ? user.result?._id : '',
                gameId: id,
                access_key: access_key,
                cookie_id: cookies.get('uid')
            }))
        }
    }, [forbiden])

    useEffect(() => {
        setGameData({})
        dispatch(getRelatedGames({ id: user ? user.result?._id : '', gameId: id }))
        dispatch(getGameByID({ id: user ? user.result?._id : '', gameId: id, access_key, cookie_id: cookies.get('uid') }))
        dispatch(getRecentGameBlog({ id: user ? user.result?._id : '' }))
        dispatch(getGameComments({ gameId: id }))
        window.scrollTo(0, 0)

        const socket = socketIO(socketUrl, { transports: ['websocket', 'polling'] })
        socket.emit('join_game', id)

        socket.on('game_comments_updated', (socketData) => {
            if (socketData.gameId === id) {
                dispatch(updateGameComments({ comments: socketData.comments }))
            }
        })

        socket.on('game_ratings_updated', (socketData) => {
            if (socketData.gameId === id) {
                const avg = divideAndScale(socketData.ratings)
                setFixedRating(avg)
                setRatingNumber(avg)
            }
        })

        return () => {
            socket.emit('leave_game', id)
            socket.disconnect()
        }
    }, [id, access_key])

    useEffect(() => {
        dispatch(countTags({ id: user ? user.result?._id : '' }))
        dispatch(categoriesCount({ id: user ? user.result?._id : '' }))
        if (userId) dispatch(getFavoriteGames({ userId }))
    }, [])

    useEffect(() => {
        if (comments.length) {
            const deepClonedComments = JSON.parse(JSON.stringify(comments))
            setData(deepClonedComments)
            setComment(null)
        } else {
            setData([])
        }
    }, [comments])

    useEffect(() => {
        if (!show) { setNotification({}) }
    }, [show])

    useEffect(() => {
        if (Object.keys(game_data).length !== 0) {
            if (game_data?.game?.ratings) {
                setFixedRating(divideAndScale(game_data.game.ratings))
                setRatingNumber(divideAndScale(game_data.game.ratings))
            }
            setGameData(game_data)
        }
    }, [game_data])

    useEffect(() => {
        if (related_games?.length > 0) setRelatedGames(related_games)
        if (recentGameBlog?.length > 0) setRecentBlogs(recentGameBlog)
    }, [related_games, recentGameBlog])

    const checkedForLikedBLogs = (likes) => {
        if (!likes || !Array.isArray(likes)) return false;
        return likes.some((item) => item === cookies.get('uid'))
    }

    const addLikes = (index) => {
        var array = [...recentBlogs]
        var duplicate = false
        ;(array[index].likes || []).forEach((item) => { if (item === cookies.get('uid')) duplicate = true })
        var updatedBlog = { ...array[index] };
        updatedBlog.likes = Array.isArray(updatedBlog.likes) ? [...updatedBlog.likes] : [];
        if (!duplicate) { updatedBlog.likes.push(cookies.get('uid')); }
        else { updatedBlog.likes = updatedBlog.likes.filter((item) => item !== cookies.get('uid')) }
        array[index] = updatedBlog;
        setRecentBlogs(array);
        dispatch(addRecentGamingBlogLikes({ id: array[index]._id, likes: array[index].likes, userId: user ? user.result?._id : '' }))
    }

    const addDownloadCount = () => {
        var duplicate = false
        ;(gameData?.game?.download_count || []).forEach(item => { if (cookies.get('uid') === item) duplicate = true })
        if (!duplicate) {
            dispatch(addOneDownload({ id: cookies.get('uid'), gameId: id }))
        }
    }

    const checkDownloadLinks = () => {
        return !(gameData?.game?.download_link || []).some((link) => link.links?.length > 0)
    }

    const convertTimezone = (date) => {
        const dateObj = new Date(date);
        return new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'short', day: '2-digit', hour12: false }).format(dateObj);
    }

    useEffect(() => {
        if (comment) {
            comment.parent_id = id;
            comment.user_id = user?._id || user?.result?._id;
            comment.type = 'game';
            dispatch(addGameComment(comment))
        }
    }, [comment])

    const handleComment = (formData) => {
        dispatch(updateGameComment({ id, data: formData }))
    }

    const handleDeleteComment = (cid) => {
        dispatch(deleteGameComment({ id: cid, game_id: id }))
    }

    const submitRating = (value) => {
        const uid = cookies.get('uid')
        setFixedRating(value)
        setRatingNumber(value)
        dispatch(addRatings({ gameId: id, ratings: value, uid }))
    }

    const handleReport = (targetId = null, type = 'comment') => {
        setReportId(targetId || id)
        setReportType(type)
        setReportModal(true)
    }

    const handleToggleFavorite = () => {
        if (!userId) return
        dispatch(toggleFavoriteGame({ userId, gameId: id }))
    }

    const isFavorited = favoriteGames?.includes(id)

    const card = `rounded-xl border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-slate-200/80' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`
    const sectionTitle = `text-sm font-bold flex items-center gap-2 pb-2 mb-3 border-b border-solid ${isLight ? 'text-slate-700 border-slate-100' : 'text-gray-200 border-[#222]'}`
    const labelCls = `text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`
    const valueCls = `text-sm ${isLight ? 'text-slate-800' : 'text-gray-100'}`

    const hasFetched = !isLoading && (Object.keys(gameData).length > 0 || notFound || forbiden)

    if (isLoading || !hasFetched) {
        const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`
        return (
            <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className="relative px-0 my-6 sm:my-10">
                            {/* Breadcrumb skeleton */}
                            <div className="flex items-center gap-2 mb-5">
                                <div className={`h-3 w-12 ${pulse}`} />
                                <div className={`h-3 w-3 rounded-full ${pulse}`} />
                                <div className={`h-3 w-14 ${pulse}`} />
                                <div className={`h-3 w-3 rounded-full ${pulse}`} />
                                <div className={`h-3 w-28 ${pulse}`} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                                <div className="lg:col-span-3 space-y-5">
                                    {/* Hero skeleton */}
                                    <div className={`${card} overflow-hidden p-5 sm:p-6`}>
                                        <div className="flex flex-col sm:flex-row gap-5">
                                            <div className={`flex-shrink-0 sm:w-48 w-full aspect-[3/4] rounded-xl ${pulse}`} />
                                            <div className="flex-1 min-w-0 flex flex-col gap-3 py-1">
                                                <div className={`h-6 w-3/4 ${pulse}`} />
                                                <div className={`h-3 w-32 ${pulse}`} />
                                                <div className="flex items-center gap-1 mt-1">
                                                    {[...Array(5)].map((_, i) => <div key={i} className={`w-4 h-4 rounded ${pulse}`} />)}
                                                    <div className={`h-3 w-8 ml-1 ${pulse}`} />
                                                </div>
                                                <div className="flex flex-wrap gap-3 mt-1">
                                                    {[...Array(5)].map((_, i) => <div key={i} className={`h-3 w-16 ${pulse}`} />)}
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mt-auto">
                                                    {[...Array(4)].map((_, i) => <div key={i} className={`h-5 rounded-full ${pulse}`} style={{ width: `${50 + Math.random() * 30}px` }} />)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description skeleton */}
                                    <div className={`${card} p-5 sm:p-6`}>
                                        <div className={`h-4 w-32 mb-4 ${pulse}`} />
                                        <div className="space-y-2.5">
                                            <div className={`h-3 w-full ${pulse}`} />
                                            <div className={`h-3 w-full ${pulse}`} />
                                            <div className={`h-3 w-5/6 ${pulse}`} />
                                            <div className={`h-3 w-3/4 ${pulse}`} />
                                        </div>
                                    </div>

                                    {/* Gallery skeleton */}
                                    <div className={`${card} p-5 sm:p-6`}>
                                        <div className={`h-4 w-24 mb-4 ${pulse}`} />
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {[...Array(3)].map((_, i) => <div key={i} className={`aspect-video rounded-lg ${pulse}`} />)}
                                        </div>
                                    </div>

                                    {/* Comments skeleton */}
                                    <div className={`${card} p-5 sm:p-6`}>
                                        <div className={`h-4 w-28 mb-5 ${pulse}`} />
                                        <div className={`h-20 w-full rounded-lg mb-4 ${pulse}`} />
                                        <div className="space-y-4">
                                            {[...Array(2)].map((_, i) => (
                                                <div key={i} className="flex gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 ${pulse}`} />
                                                    <div className="flex-1 space-y-2">
                                                        <div className={`h-3 w-24 ${pulse}`} />
                                                        <div className={`h-3 w-full ${pulse}`} />
                                                        <div className={`h-3 w-2/3 ${pulse}`} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar skeleton */}
                                <div className="space-y-4">
                                    <div className={`${card} p-4`}>
                                        <div className={`h-4 w-24 mb-3 ${pulse}`} />
                                        <div className="space-y-2">
                                            {[...Array(4)].map((_, i) => <div key={i} className={`h-7 w-full rounded-lg ${pulse}`} />)}
                                        </div>
                                    </div>
                                    <div className={`${card} p-4`}>
                                        <div className={`h-4 w-16 mb-3 ${pulse}`} />
                                        <div className="flex flex-wrap gap-1.5">
                                            {[...Array(6)].map((_, i) => <div key={i} className={`h-5 rounded-full ${pulse}`} style={{ width: `${40 + Math.random() * 35}px` }} />)}
                                        </div>
                                    </div>
                                    <div className={`${card} p-4`}>
                                        <div className={`h-4 w-28 mb-3 ${pulse}`} />
                                        <div className="space-y-2">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-lg flex-shrink-0 ${pulse}`} />
                                                    <div className="flex-1 space-y-1.5">
                                                        <div className={`h-3 w-full ${pulse}`} />
                                                        <div className={`h-2.5 w-16 ${pulse}`} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (forbiden === 'strict') {
        return (
            <div className={`relative overflow-hidden min-h-[60vh] ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className="flex items-center justify-center py-20 sm:py-28">
                            <div className={`w-full max-w-sm rounded-2xl border border-solid p-7 sm:p-9 ${isLight ? 'bg-white border-slate-200/80' : 'bg-[#111] border-[#2B2B2B]'}`}>
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isLight ? 'bg-red-50' : 'bg-red-950/20'}`}>
                                        <FontAwesomeIcon icon={faExclamationTriangle} className={`text-lg ${isLight ? 'text-red-400' : 'text-red-500'}`} />
                                    </div>
                                    <h2 className={`text-base font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Restricted Content</h2>
                                    <p className={`text-xs mb-5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>This game contains age-restricted or sensitive content.</p>

                                    <p className={`text-[11px] mb-5 ${isLight ? 'text-red-400' : 'text-red-400/70'}`}>
                                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                                        Disable <strong>Safe Content</strong> in your <Link to="/account/settings" className="underline">account settings</Link> to view.
                                    </p>

                                    <Link to="/games" className={`text-xs transition-colors ${isLight ? 'text-slate-300 hover:text-slate-500' : 'text-gray-600 hover:text-gray-400'}`}>
                                        <FontAwesomeIcon icon={faArrowLeft} className="mr-1 text-[10px]" /> Back to Games
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (forbiden === 'private' || forbiden === 'access_invalid' || forbiden === 'access_limit') {
        const msgs = {
            private: 'This game is private. Enter an access key to view.',
            access_invalid: 'The access key you entered is not valid.',
            access_limit: 'This access key has reached its usage limit.'
        }
        return (
            <div className={`relative overflow-hidden min-h-[60vh] ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className="flex items-center justify-center py-20 sm:py-28">
                            <div className={`w-full max-w-sm rounded-2xl border border-solid p-7 sm:p-9 ${isLight ? 'bg-white border-slate-200/80' : 'bg-[#111] border-[#2B2B2B]'}`}>
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isLight ? 'bg-amber-50' : 'bg-amber-950/20'}`}>
                                        <FontAwesomeIcon icon={faLock} className={`text-lg ${isLight ? 'text-amber-400' : 'text-amber-500'}`} />
                                    </div>
                                    <h2 className={`text-base font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Private Game</h2>
                                    <p className={`text-xs mb-5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{msgs[forbiden]}</p>

                                    <div className="flex items-center gap-2 w-full mb-5">
                                        <input
                                            type="text"
                                            value={accessKeyInput}
                                            onChange={(e) => setAccessKeyInput(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && accessKeyInput.trim()) setSearchParams({ access_key: accessKeyInput.trim() })
                                            }}
                                            placeholder="Enter access key"
                                            className={`flex-1 px-3.5 py-2 rounded-lg text-sm font-mono tracking-wider border border-solid outline-none transition-colors ${isLight
                                                ? 'bg-slate-50 border-slate-200 focus:border-amber-300 text-slate-700 placeholder:text-slate-300'
                                                : 'bg-[#0e0e0e] border-[#2B2B2B] focus:border-amber-600 text-gray-200 placeholder:text-gray-600'
                                            }`}
                                        />
                                        <button
                                            onClick={() => { if (accessKeyInput.trim()) setSearchParams({ access_key: accessKeyInput.trim() }) }}
                                            disabled={!accessKeyInput.trim()}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isLight
                                                ? 'bg-amber-400 text-white hover:bg-amber-500'
                                                : 'bg-amber-600 text-white hover:bg-amber-500'
                                            }`}
                                        >
                                            Unlock
                                        </button>
                                    </div>

                                    {(forbiden === 'access_invalid' || forbiden === 'access_limit') && (
                                        <p className={`text-[11px] mb-4 ${isLight ? 'text-red-400' : 'text-red-400/80'}`}>
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                                            {forbiden === 'access_invalid' ? 'Key not recognized. Check for typos.' : 'Contact the owner for a new key.'}
                                        </p>
                                    )}

                                    <Link to="/games" className={`text-xs transition-colors ${isLight ? 'text-slate-300 hover:text-slate-500' : 'text-gray-600 hover:text-gray-400'}`}>
                                        <FontAwesomeIcon icon={faArrowLeft} className="mr-1 text-[10px]" /> Back to Games
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (notFound) {
        return (
            <div className={`relative overflow-hidden min-h-[60vh] ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className="flex items-center justify-center py-20 sm:py-28">
                            <div className={`w-full max-w-sm rounded-2xl border border-solid p-7 sm:p-9 ${isLight ? 'bg-white border-slate-200/80' : 'bg-[#111] border-[#2B2B2B]'}`}>
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-50' : 'bg-white/[0.03]'}`}>
                                        <FontAwesomeIcon icon={faGamepad} className={`text-lg ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                    </div>
                                    <h2 className={`text-base font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Game Not Found</h2>
                                    <p className={`text-xs mb-5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>This game doesn't exist or may have been removed.</p>

                                    <Link to="/games" className={`text-xs transition-colors ${isLight ? 'text-slate-300 hover:text-slate-500' : 'text-gray-600 hover:text-gray-400'}`}>
                                        <FontAwesomeIcon icon={faArrowLeft} className="mr-1 text-[10px]" /> Back to Games
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const game = gameData?.game

    if (!game && !isLoading) {
        return (
            <div className={`relative overflow-hidden min-h-[60vh] ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className="flex items-center justify-center py-20 sm:py-28">
                            <div className={`w-full max-w-sm rounded-2xl border border-solid p-7 sm:p-9 ${isLight ? 'bg-white border-slate-200/80' : 'bg-[#111] border-[#2B2B2B]'}`}>
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-50' : 'bg-white/[0.03]'}`}>
                                        <FontAwesomeIcon icon={faGamepad} className={`text-lg ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                    </div>
                                    <h2 className={`text-base font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Game Not Found</h2>
                                    <p className={`text-xs mb-5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>This game doesn't exist or may have been removed.</p>

                                    <Link to="/games" className={`text-xs transition-colors ${isLight ? 'text-slate-300 hover:text-slate-500' : 'text-gray-600 hover:text-gray-400'}`}>
                                        <FontAwesomeIcon icon={faArrowLeft} className="mr-1 text-[10px]" /> Back to Games
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

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
                            {game && <>
                                <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                                <span className={isLight ? 'text-slate-600' : 'text-gray-300'}>{game.title}</span>
                            </>}
                        </div>

                        {game && Object.keys(gameData).length !== 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                                {/* Main Content */}
                                <div className="lg:col-span-3 space-y-5">
                                    {/* Hero Section */}
                                    {game.landscape ? (
                                        <div className="rounded-xl overflow-hidden relative border border-solid border-transparent">
                                            {/* Full-cover background image */}
                                            <div className="absolute inset-0 z-0">
                                                {game.featured_image ? (
                                                    <img src={game.featured_image} alt={game.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={`w-full h-full ${isLight ? 'bg-slate-200' : 'bg-[#111]'}`} />
                                                )}
                                                <div className={`absolute inset-0 ${isLight
                                                    ? 'bg-gradient-to-t from-white via-white/80 to-white/30'
                                                    : 'bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/85 to-[#0e0e0e]/30'
                                                }`} />
                                            </div>

                                            <div className="relative z-10 pt-40 sm:pt-52 p-5 sm:p-6">
                                                <div className="absolute top-4 left-4">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-md ${isLight ? 'bg-white/90 text-slate-600 shadow-sm' : 'bg-black/50 text-gray-200'}`}>
                                                        {game.category}
                                                    </span>
                                                </div>
                                                {userId && (
                                                    <button onClick={handleToggleFavorite}
                                                        className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-solid backdrop-blur-md ${isFavorited
                                                            ? 'bg-red-500/90 text-white border-red-500/50 hover:bg-red-600/90'
                                                            : (isLight ? 'bg-white/80 text-slate-500 border-white/50 hover:text-red-500 hover:bg-white' : 'bg-black/50 text-gray-300 border-white/10 hover:text-red-400 hover:bg-black/70')
                                                        }`}>
                                                        <FontAwesomeIcon icon={faHeart} className="text-[10px]" />
                                                        {isFavorited ? 'Favorited' : 'Favorite'}
                                                    </button>
                                                )}

                                                <h1 className={`text-2xl sm:text-3xl font-bold leading-tight mb-1.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>{game.title}</h1>
                                                <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                                    by{' '}
                                                    <Link to={`/games/developer/${game.details?.developer || 'Anonymous'}`}
                                                        className={`font-semibold transition-colors ${isLight ? 'text-blue-500 hover:text-blue-600' : 'text-blue-400 hover:text-blue-300'}`}>
                                                        {game.details?.developer || 'Anonymous'}
                                                    </Link>
                                                </p>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <StarRating
                                                            rating={rating} fixedRating={fixedRating} hoverRating={hoverRating} isLight={isLight}
                                                            interactive={true}
                                                            onHover={(val) => setHoverRating(val)} onLeave={() => setHoverRating(0)} onClick={submitRating}
                                                        />
                                                        <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                                                            {!isNaN(ratingNumber) ? ratingNumber : 0}
                                                        </span>
                                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-opacity ${hoverRating > 0 ? 'opacity-100' : 'opacity-0'} ${isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-900/20 text-amber-400'}`}>
                                                            {hoverRating > 0 ? hoverRating : fixedRating}/5
                                                        </span>
                                                    </div>

                                                    <div className={`h-4 w-px ${isLight ? 'bg-slate-200' : 'bg-gray-700'}`} />

                                                    {[
                                                        { icon: faGlobe, label: game.details?.language || '—' },
                                                        { icon: faDesktop, label: game.details?.platform || '—' },
                                                        { icon: faStar, label: game.details?.latest_version ? `v${game.details.latest_version}` : '—' },
                                                        { icon: faEye, label: game.details?.censorship || '—' },
                                                        { icon: faDownload, label: `${game.download_count?.length || 0}` },
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex items-center gap-1.5">
                                                            <FontAwesomeIcon icon={item.icon} className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-500'}`} />
                                                            <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{item.label}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {game.tags?.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {game.tags.map((tag, i) => (
                                                            <Link key={i} to={`/games?tags=${tag}`}
                                                                className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors backdrop-blur-sm ${isLight
                                                                    ? 'bg-slate-100/80 text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                                                                    : 'bg-white/10 text-gray-300 hover:bg-blue-900/30 hover:text-blue-400'
                                                                }`}>
                                                                #{tag}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No tags</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`${card} overflow-hidden relative`}>
                                            {/* Blurred backdrop */}
                                            {game.featured_image && (
                                                <div className="absolute inset-0 z-0">
                                                    <img src={game.featured_image} alt="" className="w-full h-full object-cover scale-110 blur-2xl opacity-20" />
                                                    <div className={`absolute inset-0 ${isLight ? 'bg-white/70' : 'bg-[#0e0e0e]/80'}`} />
                                                </div>
                                            )}
                                            {userId && (
                                                <button onClick={handleToggleFavorite}
                                                    className={`absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-solid ${isFavorited
                                                        ? (isLight ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100' : 'bg-red-950/30 text-red-400 border-red-800/40 hover:bg-red-950/50')
                                                        : (isLight ? 'bg-white/80 text-slate-400 border-slate-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50' : 'bg-[#0e0e0e]/80 text-gray-400 border-[#333] hover:text-red-400 hover:border-red-800/40 hover:bg-red-950/20')
                                                    }`}>
                                                    <FontAwesomeIcon icon={faHeart} className="text-[10px]" />
                                                    {isFavorited ? 'Favorited' : 'Favorite'}
                                                </button>
                                            )}

                                            <div className="relative z-10 p-5 sm:p-6">
                                                <div className="flex flex-col sm:flex-row gap-5">
                                                    {/* Portrait Image */}
                                                    <div className="flex-shrink-0 sm:w-48 w-full">
                                                        <div className="relative overflow-hidden rounded-xl aspect-[3/4]">
                                                            {game.featured_image ? (
                                                                <img src={game.featured_image} alt={game.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#111]'}`}>
                                                                    <FontAwesomeIcon icon={faGamepad} className={`text-4xl ${isLight ? 'text-slate-200' : 'text-gray-700'}`} />
                                                                </div>
                                                            )}
                                                            <div className="absolute top-2.5 left-2.5">
                                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md ${isLight ? 'bg-white/90 text-slate-600' : 'bg-black/60 text-gray-200'}`}>
                                                                    {game.category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0 flex flex-col">
                                                        <h1 className={`text-xl sm:text-2xl font-bold leading-tight mb-1.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>{game.title}</h1>
                                                        <p className={`text-xs mb-3 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                            by{' '}
                                                            <Link to={`/games/developer/${game.details?.developer || 'Anonymous'}`}
                                                                className={`font-semibold transition-colors ${isLight ? 'text-blue-500 hover:text-blue-600' : 'text-blue-400 hover:text-blue-300'}`}>
                                                                {game.details?.developer || 'Anonymous'}
                                                            </Link>
                                                        </p>

                                                        {/* Rating */}
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <StarRating
                                                                rating={rating} fixedRating={fixedRating} hoverRating={hoverRating} isLight={isLight}
                                                                interactive={true}
                                                                onHover={(val) => setHoverRating(val)} onLeave={() => setHoverRating(0)} onClick={submitRating}
                                                            />
                                                            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                                                                {!isNaN(ratingNumber) ? ratingNumber : 0}
                                                            </span>
                                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-opacity ${hoverRating > 0 ? 'opacity-100' : 'opacity-0'} ${isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-900/20 text-amber-400'}`}>
                                                                {hoverRating > 0 ? hoverRating : fixedRating}/5
                                                            </span>
                                                        </div>

                                                        {/* Details */}
                                                        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
                                                            {[
                                                                { icon: faGlobe, label: game.details?.language || '—' },
                                                                { icon: faDesktop, label: game.details?.platform || '—' },
                                                                { icon: faStar, label: game.details?.latest_version ? `v${game.details.latest_version}` : '—' },
                                                                { icon: faEye, label: game.details?.censorship || '—' },
                                                                { icon: faDownload, label: `${game.download_count?.length || 0}` },
                                                            ].map((item, i) => (
                                                                <div key={i} className="flex items-center gap-1.5">
                                                                    <FontAwesomeIcon icon={item.icon} className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                                    <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{item.label}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Tags */}
                                                        <div className="mt-auto">
                                                            {game.tags?.length > 0 ? (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {game.tags.map((tag, i) => (
                                                                        <Link key={i} to={`/games?tags=${tag}`}
                                                                            className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors ${isLight
                                                                                ? 'bg-slate-100/80 text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                                                                                : 'bg-white/5 text-gray-400 hover:bg-blue-900/20 hover:text-blue-400'
                                                                            }`}>
                                                                            #{tag}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No tags</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {game.description && (
                                        <div className={`${card} p-5 sm:p-6`}>
                                            <h2 className={sectionTitle}><FontAwesomeIcon icon={faInfoCircle} className="text-xs" /> Description</h2>
                                            <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{game.description}</p>
                                        </div>
                                    )}

                                    {/* Gallery */}
                                    {game.gallery?.length > 0 && (
                                        <div className={`${card} p-5 sm:p-6`}>
                                            <h2 className={sectionTitle}>
                                                <FontAwesomeIcon icon={faImage} className="text-xs" /> Gallery
                                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>{game.gallery.length}</span>
                                            </h2>

                                            {game.carousel ? (
                                                <div className="relative">
                                                    <div className="relative aspect-video rounded-lg overflow-hidden cursor-pointer"
                                                        onClick={() => setLightbox({ open: true, src: game.gallery[carouselIndex] })}>
                                                        <img
                                                            src={game.gallery[carouselIndex]}
                                                            alt={`gallery #${carouselIndex + 1}`}
                                                            className="w-full h-full object-cover transition-all duration-500"
                                                        />
                                                        <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center ${isLight ? 'bg-black/20' : 'bg-black/40'}`}>
                                                            <FontAwesomeIcon icon={faEye} className="text-white text-lg" />
                                                        </div>
                                                    </div>

                                                    {game.gallery.length > 1 && (
                                                        <>
                                                            <button
                                                                onClick={() => setCarouselIndex((prev) => prev <= 0 ? game.gallery.length - 1 : prev - 1)}
                                                                className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ${isLight
                                                                    ? 'bg-white/80 hover:bg-white text-slate-600 shadow-md'
                                                                    : 'bg-black/50 hover:bg-black/70 text-white'
                                                                }`}>
                                                                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                                                            </button>
                                                            <button
                                                                onClick={() => setCarouselIndex((prev) => prev >= game.gallery.length - 1 ? 0 : prev + 1)}
                                                                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ${isLight
                                                                    ? 'bg-white/80 hover:bg-white text-slate-600 shadow-md'
                                                                    : 'bg-black/50 hover:bg-black/70 text-white'
                                                                }`}>
                                                                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                                            </button>

                                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-sm bg-black/40">
                                                                {game.gallery.map((_, i) => (
                                                                    <button key={i} onClick={(e) => { e.stopPropagation(); setCarouselIndex(i) }}
                                                                        className={`rounded-full transition-all ${carouselIndex === i
                                                                            ? 'w-5 h-1.5 bg-white'
                                                                            : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 custom-scroll">
                                                        {game.gallery.map((img, i) => (
                                                            <div key={i} onClick={() => setCarouselIndex(i)}
                                                                className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden cursor-pointer transition-all border-2 border-solid ${carouselIndex === i
                                                                    ? (isLight ? 'border-blue-500 opacity-100' : 'border-blue-400 opacity-100')
                                                                    : (isLight ? 'border-transparent opacity-60 hover:opacity-100' : 'border-transparent opacity-50 hover:opacity-100')
                                                                }`}>
                                                                <img src={img} alt={`thumb #${i + 1}`} className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {game.gallery.map((img, i) => (
                                                        <div key={i} onClick={() => setLightbox({ open: true, src: img })}
                                                            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group">
                                                            <img src={img} alt={`gallery #${i + 1}`}
                                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${isLight ? 'bg-black/20' : 'bg-black/40'}`}>
                                                                <FontAwesomeIcon icon={faEye} className="text-white text-sm" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Downloads */}
                                    <div className={`${card} p-5 sm:p-6`}>
                                        <h2 className={sectionTitle}><FontAwesomeIcon icon={faDownload} className="text-xs" /> Downloads</h2>
                                        {(game.download_link || []).filter(b => b.links?.length > 0).length > 0 ? (
                                            <div className="space-y-3">
                                                {(game.download_link || []).map((bucket, bi) => (
                                                    bucket.links?.length > 0 && (
                                                        <div key={bi}>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <FontAwesomeIcon icon={faGoogleDrive} className={`text-xs ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                                                                <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{bucket.storage_name}</span>
                                                                {game.password && (
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded ${isLight ? 'bg-amber-50 text-amber-600 border border-solid border-amber-200' : 'bg-amber-900/20 text-amber-400 border border-solid border-amber-800/40'}`}>
                                                                        <FontAwesomeIcon icon={faKey} className="mr-1 text-[8px]" /> {game.password}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                {bucket.links.map((link, li) => (
                                                                    <a key={li} href={link} target="_blank" rel="noopener noreferrer" onClick={addDownloadCount}
                                                                        className={`flex items-center justify-between p-2.5 rounded-lg transition-all group ${isLight
                                                                            ? 'bg-slate-50 hover:bg-blue-50 border border-solid border-slate-100 hover:border-blue-200'
                                                                            : 'bg-[#111] hover:bg-[#1a1a1a] border border-solid border-[#1f1f1f] hover:border-[#333]'
                                                                        }`}>
                                                                        <div className="flex items-center gap-2">
                                                                            <FontAwesomeIcon icon={faLink} className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                                            <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>Link #{li + 1}</span>
                                                                        </div>
                                                                        <FontAwesomeIcon icon={faExternalLink}
                                                                            className={`text-[10px] transition-colors ${isLight ? 'text-slate-300 group-hover:text-blue-500' : 'text-gray-600 group-hover:text-blue-400'}`} />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        ) : (
                                            <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No download links available</p>
                                        )}
                                    </div>

                                    {/* Uploader Info + Guide */}
                                    <div className={`${card} p-5 sm:p-6`}>
                                        <div className="flex items-start gap-4">
                                            <img className={`w-12 h-12 rounded-xl object-cover border border-solid ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`}
                                                src={convertDriveImageLink(gameData.avatar || avatar)} alt="uploader" />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{gameData.username}</p>
                                                {game.leave_uploader_message && (
                                                    <p className={`text-xs mt-1 whitespace-pre-wrap ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{game.leave_uploader_message}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`flex items-center justify-between mt-4 pt-3 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                            <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                {convertTimezone(game.createdAt)} ({moment(game.createdAt).fromNow()})
                                            </p>
                                            {game.guide_link && (
                                                <a href={game.guide_link} target="_blank" rel="noopener noreferrer"
                                                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isLight
                                                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-solid border-blue-200'
                                                        : 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30 border border-solid border-blue-800/40'
                                                    }`}>
                                                    <FontAwesomeIcon icon={faBook} className="mr-1.5 text-[10px]" /> View Guides
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Related Games */}
                                    {relatedGames?.length > 0 && (
                                        <div>
                                            <h2 className={`text-lg font-bold mb-4 ${isLight ? 'text-slate-800' : 'text-white'}`}>Related Games</h2>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {relatedGames.map((item, i) => (
                                                    <Link key={i} to={`/games/${item._id}`} className="block group">
                                                        <div className={`rounded-xl overflow-hidden transition-all duration-300 ${isLight
                                                            ? 'bg-white/90 border border-solid border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300'
                                                            : 'bg-[#0e0e0e] border border-solid border-[#2B2B2B] hover:border-[#3a3a3a]'
                                                        }`}>
                                                            <div className="relative aspect-[16/10] overflow-hidden">
                                                                <img src={item.featured_image} alt={item.title}
                                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                            </div>
                                                            <div className="p-3">
                                                                <h3 className={`text-xs font-semibold truncate ${isLight ? 'text-slate-700' : 'text-gray-100'}`}>{item.title}</h3>
                                                                <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                                    by {item.user?.username || 'Unknown'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Comments */}
                                    <div className={`${card} p-5 sm:p-6`}>
                                        <h2 className={sectionTitle}>
                                            <FontAwesomeIcon icon={faComment} className="text-xs" /> Comments
                                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>
                                                {data?.length || 0}
                                            </span>
                                        </h2>

                                        <div className="flex flex-col gap-5">
                                            <CommentField
                                                comment={comment}
                                                setComment={setComment}
                                                theme={theme}
                                            />

                                            <h3 className='text-sm font-semibold'>{data?.length ?? 0} Comment{data?.length > 1 && 's'}</h3>

                                            {data?.length > 0 &&
                                                data.map((item, i) => (
                                                    <Comments
                                                        key={i}
                                                        theme={theme}
                                                        data={item}
                                                        handleSubmit={handleComment}
                                                        deleteComment={handleDeleteComment}
                                                        onReport={handleReport}
                                                    />
                                                ))
                                            }

                                            {data?.length === 0 && (
                                                <p className={`text-xs text-center py-4 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No comments yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-4">
                                    {/* Categories */}
                                    {categoriesList?.length > 0 && (
                                        <div className={`${card} overflow-hidden`}>
                                            <div className={`flex items-center gap-2 px-4 py-3 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                                <h3 className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Categories</h3>
                                            </div>
                                            <div className="p-2">
                                                {categoriesList.map((cat, i) => (
                                                    <Link key={i} to={`/games?category=${cat.category}`}
                                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isLight
                                                            ? 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                                                            : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-blue-400'
                                                        }`}>
                                                        <span>{cat.category}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>{cat.count}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {tagsList?.length > 0 && (
                                        <div className={`${card} overflow-hidden`}>
                                            <div className={`flex items-center gap-2 px-4 py-3 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                                <h3 className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Tags</h3>
                                            </div>
                                            <div className="p-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {tagsList.map((t, i) => (
                                                        <Link key={i} to={`/games?tags=${t.tag}`}
                                                            className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors capitalize ${isLight
                                                                ? 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                                                                : 'bg-white/5 text-gray-400 hover:bg-blue-900/20 hover:text-blue-400'
                                                            }`}>
                                                            #{t.tag} <span className="opacity-50">({t.count})</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Recent Games */}
                                    {recentBlogs?.filter(g => g._id !== id && !g.strict).length > 0 && (
                                        <div className={`${card} overflow-hidden`}>
                                            <div className={`flex items-center gap-2 px-4 py-3 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                                <h3 className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Latest Games</h3>
                                            </div>
                                            <div className="p-3 space-y-2">
                                                {recentBlogs.filter(g => g._id !== id && !g.strict).map((item, i) => {
                                                    const liked = checkedForLikedBLogs(item.likes)
                                                    return (
                                                        <div key={i} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]'}`}>
                                                            <img src={convertDriveImageLink(item.featured_image)} alt={item.title}
                                                                className={`w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-solid ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`} />
                                                            <div className="flex-1 min-w-0">
                                                                <Link to={`/games/${item._id}`}>
                                                                    <p className={`text-xs font-semibold truncate transition-colors ${isLight ? 'text-slate-700 hover:text-blue-600' : 'text-gray-200 hover:text-blue-400'}`}>{item.title || item.post_title}</p>
                                                                </Link>
                                                                <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                                    {convertTimezone(item.createdAt)}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <button onClick={() => addLikes(i)} className="flex items-center gap-1">
                                                                        <FontAwesomeIcon icon={faHeart} className={`text-[10px] ${liked ? 'text-red-500' : (isLight ? 'text-slate-300' : 'text-gray-600')}`} />
                                                                        <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{item.likes?.length || 0}</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Notification
                theme={theme}
                data={notification}
                show={show}
                setShow={setShow}
            />

            {/* Report Modal */}
            <ReportModal
                theme={theme}
                openModal={reportModal}
                setOpenModal={setReportModal}
                videoId={reportId}
                reportType={reportType}
                setReportId={setReportId}
                setNotification={setNotification}
            />

            {/* Lightbox */}
            {lightbox.open && (
                <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox({ open: false, src: '' })}>
                    <button onClick={() => setLightbox({ open: false, src: '' })}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10 transition-colors">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <img src={lightbox.src} alt="Gallery" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    )
}

export default GamesSingle
