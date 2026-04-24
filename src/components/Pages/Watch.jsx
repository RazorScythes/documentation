import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom';

import { faCode, faDownload, faEllipsisVertical, faEye, faFilm, faListSquares, faSearch, faThumbsDown, faThumbsUp, faTriangleExclamation, faShare, faFlag, faCopy, faLink, faBookmark, faExpand, faCompress, faChevronUp, faChevronDown, faForwardStep, faBackwardStep, faComment, faGaugeHigh, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faFacebook, faReddit } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useScreenSize } from '../Tools';
import { Comments, CommentField } from '../Custom/Comments'
import { main, dark, light } from '../../style';
import { getVideoById, getVideoList, getVideoComment, addVideoComment, updateVideoComment, deleteVideoComment, clearAlert, likeVideo, dislikeVideo, updateLikes, updateComments, toggleSubscribe, viewVideo, getRelatedVideos, getRecentSidebar } from '../../actions/watch';
import { createPlaylist, toggleVideoInPlaylist, getPlaylists, clearAlert as clearPlaylistAlert } from '../../actions/playlist';
import { io as socketIO } from 'socket.io-client';
import Cookies from 'universal-cookie';

import Notification from '../Custom/Notification';
import PlaylistModal from '../Custom/PlaylistModal';
import ReportModal from '../Custom/ReportModal';
import styles from "../../style";

const millisToTimeString = (millis) => {
    var seconds = Math.floor(millis / 1000);
    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    var minutes = Math.floor(seconds / 60);
    seconds %= 60;

    var timeString = "";
    if (hours > 0) {
        timeString += hours.toString().padStart(2, '0') + ":";
    }
    timeString += minutes.toString().padStart(2, '0') + ":" +
                  seconds.toString().padStart(2, '0');
    
    return timeString;
}

const formatToPhilippineTime = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Manila',
            hour12: true
        };
        
        return date.toLocaleString("en-US", options);
    } catch (error) {
        return dateString;
    }
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

const Watch = ({ user, theme }) => {
    const dispatch = useDispatch()
    const { id } = useParams();
    const screenSize = useScreenSize()
    
    const video = useSelector((state) => state.watch.data)
    const videoList = useSelector((state) => state.watch.videoList)
    const alert = useSelector((state) => state.watch.alert)
    const comments = useSelector((state) => state.watch.comments)
    const notFound = useSelector((state) => state.watch.notFound)
    const forbidden = useSelector((state) => state.watch.forbidden)
    const loading = useSelector((state) => state.watch.isLoading)
    const related = useSelector((state) => state.watch.related)
    const recentSidebar = useSelector((state) => state.watch.recentSidebar)

    const [searchParams, setSearchParams] = useSearchParams();
    const access_key = searchParams.get('access_key')

    const [videoData, setVideoData] = useState(null)
    const [notification, setNotification] = useState({})
    const [show, setShow] = useState(true)
    const [theaterMode, setTheaterMode] = useState(false)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)
    const [showSpeedMenu, setShowSpeedMenu] = useState(false)
    const [shareModalOpen, setShareModalOpen] = useState(false)
    const [commentSort, setCommentSort] = useState('newest')
    const [contentVisible, setContentVisible] = useState(false)
    const [likeAnimating, setLikeAnimating] = useState(false)
    const [dislikeAnimating, setDislikeAnimating] = useState(false)
    const [autoplayNext, setAutoplayNext] = useState(true)

    const isLight = theme === 'light'
    const cardClass = `rounded-xl border border-solid ${isLight ? 'bg-white/80 backdrop-blur-sm border-blue-200/60 shadow-sm' : 'bg-[#0e0e0e] border-[#2B2B2B]'} ${isLight ? light.color : dark.color}`

    const socketUrl = import.meta.env.VITE_DEVELOPMENT == "true"
        ? `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`
        : import.meta.env.VITE_APP_BASE_URL

    useEffect(() => {
        setContentVisible(false)
        dispatch(getVideoById({ id, access_key }))
        dispatch(getPlaylists())
        dispatch(getRelatedVideos({ id, limit: 8 }))
        dispatch(getRecentSidebar({ type: 'video', limit: 6 }))

        const socket = socketIO(socketUrl, { transports: ['websocket', 'polling'] })

        socket.emit('join_video', id)

        socket.on('likes_updated', (data) => {
            if (data.videoId === id) {
                dispatch(updateLikes({ likes: data.likes, dislikes: data.dislikes }))
            }
        })

        socket.on('comments_updated', (data) => {
            if (data.videoId === id) {
                dispatch(updateComments({ comments: data.comments }))
            }
        })

        const timer = setTimeout(() => setContentVisible(true), 100)

        return () => {
            socket.emit('leave_video', id)
            socket.disconnect()
            clearTimeout(timer)
        }
    }, [id, access_key])

    useEffect(() => {
        if (video && Object.keys(video).length > 0) {
            setVideoData(video);
            dispatch(getVideoComment({ id }));
            dispatch(getVideoList({ id }));
        }
    }, [video?._id || video?.video?._id, id])

    useEffect(() => {
        if (videoData?.video?._id) {
            const cookies = new Cookies();
            const uid = cookies.get('uid');
            if (uid) {
                dispatch(viewVideo({ videoId: videoData.video._id, uid }));
            }
        }
    }, [videoData?.video?._id])
    
    useEffect(() => {
        if(Object.keys(alert).length > 0) { 
            dispatch(clearAlert())
            setNotification(alert)
            setShow(true) 
        }
    }, [alert])

    useEffect(() => {
        if(!show) { setNotification({}) }
    }, [show])

    useEffect(() => {
        if(comments.length) {
            const deepClonedComments = JSON.parse(JSON.stringify(comments));

            setData(deepClonedComments);
            setComment(null);
        }
        else setData([]);
    }, [comments])
    
    const [data, setData] = useState([])
    const [comment, setComment] = useState(null)
    const [toggle, setToggle] = useState({ description: false })
    const [imageErrors, setImageErrors] = useState({})
    const [playlistModal, setPlaylistModal] = useState(false)
    const [reportModal, setReportModal] = useState(false)
    const [reportId, setReportId] = useState('')
    const [reportType, setReportType] = useState('video')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
    const dropdownRef = useRef(null)
    const videoRef = useRef(null)
    const playlistScrollRef = useRef(null)

    const VIDEO_VOLUME_KEY = 'watchVideoVolume'

    const saveVideoVolume = (el) => {
        if (!el) return
        try {
            localStorage.setItem(VIDEO_VOLUME_KEY, JSON.stringify({
                volume: el.volume,
                muted: el.muted
            }))
        } catch (e) {}
    }

    useEffect(() => {
        const videoEl = videoRef.current
        if (!videoEl || !videoData?.video?.downloadUrl) return

        try {
            const saved = localStorage.getItem(VIDEO_VOLUME_KEY)
            if (saved !== null) {
                const data = JSON.parse(saved)
                if (data && typeof data.volume === 'number' && data.volume >= 0 && data.volume <= 1) {
                    videoEl.volume = data.volume
                }
                if (data && typeof data.muted === 'boolean') {
                    videoEl.muted = data.muted
                }
            }
        } catch (e) {}

        videoEl.playbackRate = playbackSpeed

        const onVolumeChange = () => saveVideoVolume(videoEl)
        const onVideoClick = () => {
            requestAnimationFrame(() => saveVideoVolume(videoEl))
        }

        const onVideoEnded = () => {
            if (autoplayNext && videoList?.videos?.length > 0) {
                const currentIdx = videoList.videos.findIndex(v => v._id === id)
                const nextVideo = videoList.videos[currentIdx + 1]
                if (nextVideo) {
                    window.location.href = `/watch/${nextVideo._id}`
                }
            }
        }

        videoEl.addEventListener('volumechange', onVolumeChange)
        videoEl.addEventListener('click', onVideoClick)
        videoEl.addEventListener('ended', onVideoEnded)
        return () => {
            videoEl.removeEventListener('volumechange', onVolumeChange)
            videoEl.removeEventListener('click', onVideoClick)
            videoEl.removeEventListener('ended', onVideoEnded)
        }
    }, [loading, videoData?.video?.downloadUrl, playbackSpeed, autoplayNext, videoList, id])

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackSpeed
        }
    }, [playbackSpeed])

    useEffect(() => {
        const handleKeyDown = (e) => {
            const videoEl = videoRef.current
            if (!videoEl || !videoData?.video?.downloadUrl) return
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

            switch (e.key) {
                case ' ':
                    e.preventDefault()
                    videoEl.paused ? videoEl.play() : videoEl.pause()
                    break
                case 'ArrowRight':
                    e.preventDefault()
                    videoEl.currentTime = Math.min(videoEl.currentTime + 5, videoEl.duration)
                    break
                case 'ArrowLeft':
                    e.preventDefault()
                    videoEl.currentTime = Math.max(videoEl.currentTime - 5, 0)
                    break
                case 'm':
                case 'M':
                    videoEl.muted = !videoEl.muted
                    break
                case 'f':
                case 'F':
                    if (document.fullscreenElement) document.exitFullscreen()
                    else videoEl.requestFullscreen?.()
                    break
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [videoData?.video?.downloadUrl])

    const playlists = useSelector((state) => state.playlist.data)
    const playlistAlert = useSelector((state) => state.playlist.alert)

    useEffect(() => {
        if(Object.keys(playlistAlert).length > 0) {
            dispatch(clearPlaylistAlert())
            setNotification(playlistAlert)
            setShow(true)
        }
    }, [playlistAlert])

    useEffect(() => {
        const updatePosition = () => {
            if (dropdownRef.current) {
                const rect = dropdownRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + 8,
                    right: window.innerWidth - rect.right
                });
            }
        };

        if (dropdownOpen) {
            requestAnimationFrame(() => { updatePosition(); });
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [dropdownOpen])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                const dropdown = document.querySelector('[data-dropdown-menu]');
                if (dropdown && dropdown.contains(event.target)) return;
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen])

    const handleShare = () => {
        setShareModalOpen(true)
        setDropdownOpen(false)
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setNotification({ variant: 'success', message: 'Link copied to clipboard!' })
        setShow(true)
        setDropdownOpen(false);
    };

    const handleReport = (targetId = null, type = 'video') => {
        setReportId(targetId || id);
        setReportType(type);
        setReportModal(true);
        setDropdownOpen(false);
    };

    const handleSaveToWatchLater = () => {
        const watchLater = playlists.find(p => p.name.toLowerCase() === 'watch later')

        if (watchLater) {
            const alreadySaved = watchLater.videos?.some(v => (v._id || v) === id)
            if (!alreadySaved) {
                dispatch(toggleVideoInPlaylist({ playlistId: watchLater._id, videoId: id }))
            } else {
                setNotification({ variant: 'info', message: 'Already in Watch Later' })
                setShow(true)
            }
        } else {
            dispatch(createPlaylist({ name: 'Watch Later', videoId: id }))
        }
        
        setDropdownOpen(false);
    };

    const handleDownload = () => {
        if (videoData?.video?.downloadUrl) {
            const link = document.createElement('a');
            link.href = videoData.video.downloadUrl;
            link.download = videoData.video.title || 'video';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const expandDescription = () => {
        if(screenSize === 'sm' || screenSize === 'xs') {
            setToggle({...toggle, description: true})
        }
    }

    const handleLike = () => {
        setLikeAnimating(true)
        dispatch(likeVideo({ videoId: id }))
        setTimeout(() => setLikeAnimating(false), 400)
    }

    const handleDislike = () => {
        setDislikeAnimating(true)
        dispatch(dislikeVideo({ videoId: id }))
        setTimeout(() => setDislikeAnimating(false), 400)
    }

    useEffect(() => {
        if(comment) {      
            comment.parent_id = id;
            comment.user_id = user._id;
            comment.type = 'video';

            dispatch(addVideoComment(comment))
        }
    }, [comment])

    const handleComment = (formData) => {
        dispatch(updateVideoComment({ id, data: formData }))
    }

    const deleteComment = (cid) => {
        dispatch(deleteVideoComment({ id: cid, video_id: id }))
    }

    const sortedComments = useMemo(() => {
        if (!data?.length) return []
        const sorted = [...data]
        if (commentSort === 'oldest') sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        else sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        return sorted
    }, [data, commentSort])

    const currentPlaylistIndex = useMemo(() => {
        if (!videoList?.videos?.length) return -1
        return videoList.videos.findIndex(v => v._id === id)
    }, [videoList, id])

    const prevVideo = currentPlaylistIndex > 0 ? videoList.videos[currentPlaylistIndex - 1] : null
    const nextVideo = currentPlaylistIndex >= 0 && currentPlaylistIndex < (videoList?.videos?.length || 0) - 1 ? videoList.videos[currentPlaylistIndex + 1] : null

    const seekToTime = useCallback((seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime = seconds
            videoRef.current.play()
        }
    }, [])

    const renderTimestampLinks = (text) => {
        if (!text) return text
        return text.replace(/\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/g, (match, h, m, s) => {
            return match
        })
    }

    const embedCode = `<iframe src="${window.location.origin}/watch/${id}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`

    const ErrorPage = ({ code, icon, title, message }) => (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
            <div className={`${cardClass} p-8 sm:p-12 max-w-md w-full text-center`}>
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isLight ? 'bg-blue-50' : 'bg-blue-950/30'}`}>
                    <FontAwesomeIcon icon={icon} className={`text-3xl ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                </div>
                <h1 className={`text-6xl font-bold mb-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>{code}</h1>
                <h2 className={`text-lg font-semibold mb-2 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{title}</h2>
                <p className={`text-sm mb-8 leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{message}</p>
                <a href="/" className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                    Back to home
                </a>
            </div>
        </div>
    )

    return (
        <div className={`relative overflow-hidden ${main.font} ${isLight ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={theaterMode ? 'w-full max-w-[1600px]' : styles.boxWidthEx}>
                    <Notification
                        theme={theme}
                        data={notification}
                        show={show}
                        setShow={setShow}
                    />

                    {
                        forbidden === 'strict' ?
                            <ErrorPage code="409" icon={faTriangleExclamation} title="Content Restricted" message="This video contains restricted content. Adjust your safe content settings to view." />
                        :
                        forbidden === 'private' ?
                            <ErrorPage code="409" icon={faTriangleExclamation} title="Private Video" message="This video is private. You need an access key from the owner to watch it." />
                        :
                        forbidden === 'access_invalid' ?
                            <ErrorPage code="409" icon={faSearch} title="Invalid Access Key" message="The access key you provided is incorrect. Please check and try again." />
                        :
                        notFound ?
                            <ErrorPage code="404" icon={faSearch} title="Video Not Found" message="This video doesn't exist or may have been removed by the uploader." />
                        :
                        <div className={`${main.container} lg:px-12 px-4 relative my-16 transition-all duration-500 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <div className='grid lg:grid-cols-3 grid-cols-1 gap-8 place-content-start mt-8'>
                                <div className={`${theaterMode ? 'lg:col-span-3' : 'lg:col-span-2'} flex flex-col gap-4`}>
                                    {/* Video Player */}
                                    <div className={`group/player relative w-full overflow-hidden pb-[56.25%] rounded-xl ${cardClass}`}>
                                        {
                                            loading ?
                                                <div className={`absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#0e0e0e]'}`}>
                                                    <div className={`absolute inset-0 animate-pulse ${isLight ? 'bg-slate-200/50' : 'bg-slate-700/50'}`} />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center animate-pulse ${isLight ? 'bg-slate-300/80' : 'bg-slate-600/80'}`}>
                                                            <svg className={`w-8 h-8 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            :
                                            <>
                                                <div className="absolute inset-0">
                                                    {
                                                        videoData?.video?.downloadUrl ?
                                                            <video 
                                                                ref={videoRef}
                                                                src={videoData.video?.downloadUrl}
                                                                poster={videoData.video?.thumbnail}
                                                                className="absolute top-0 left-0 w-full h-full rounded-xl bg-black"
                                                                controls 
                                                                controlsList="nodownload" 
                                                            />
                                                        :
                                                            <iframe 
                                                                src={videoData?.video?.link}
                                                                className="absolute top-0 left-0 w-full h-full rounded-xl bg-black"
                                                                allow="autoplay"
                                                                sandbox="allow-scripts allow-same-origin"
                                                                allowFullScreen
                                                            />
                                                    }
                                                </div>

                                                {/* Player Overlay Controls */}
                                                <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                    <div className="flex items-center gap-1 pointer-events-auto">
                                                        {prevVideo && (
                                                            <Link to={`/watch/${prevVideo._id}`} aria-label="Previous video"
                                                                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-black/40 text-xs transition-all" title="Previous">
                                                                <FontAwesomeIcon icon={faBackwardStep} />
                                                            </Link>
                                                        )}
                                                        {nextVideo && (
                                                            <Link to={`/watch/${nextVideo._id}`} aria-label="Next video"
                                                                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-black/40 text-xs transition-all" title="Next">
                                                                <FontAwesomeIcon icon={faForwardStep} />
                                                            </Link>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 pointer-events-auto">
                                                        {videoData?.video?.downloadUrl && (
                                                            <div className="relative">
                                                                <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} aria-label="Playback speed"
                                                                    className="px-2 py-1 rounded-lg text-white/80 hover:text-white hover:bg-black/40 text-xs font-medium transition-all">
                                                                    <FontAwesomeIcon icon={faGaugeHigh} className="mr-1" />{playbackSpeed}x
                                                                </button>
                                                                {showSpeedMenu && (
                                                                    <>
                                                                        <div className="fixed inset-0 z-40" onClick={() => setShowSpeedMenu(false)} />
                                                                        <div className={`absolute top-full right-0 mt-1 rounded-lg shadow-lg border z-50 py-1 bg-black/90 backdrop-blur-sm border-white/10`}>
                                                                            {PLAYBACK_SPEEDS.map(speed => (
                                                                                <button key={speed} onClick={() => { setPlaybackSpeed(speed); setShowSpeedMenu(false) }}
                                                                                    className={`block w-full px-4 py-1.5 text-xs text-left transition-colors ${
                                                                                        playbackSpeed === speed
                                                                                            ? 'bg-blue-600/30 text-blue-300 font-semibold'
                                                                                            : 'text-white/80 hover:bg-white/10'
                                                                                    }`}>
                                                                                    {speed}x
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                        <label className="flex items-center gap-1.5 text-xs cursor-pointer text-white/80 hover:text-white transition-all px-1">
                                                            <input type="checkbox" checked={autoplayNext} onChange={(e) => setAutoplayNext(e.target.checked)} className="accent-blue-500 w-3 h-3" />
                                                            Auto
                                                        </label>
                                                        <button onClick={() => setTheaterMode(!theaterMode)} aria-label={theaterMode ? 'Exit theater mode' : 'Theater mode'}
                                                            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-black/40 text-xs transition-all" title={theaterMode ? 'Default view' : 'Theater mode'}>
                                                            <FontAwesomeIcon icon={theaterMode ? faCompress : faExpand} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        }                       
                                    </div>
                                    
                                    {/* Channel & Actions Bar */}
                                    <div className={`${cardClass} p-4 px-5`}>
                                        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                                            {loading ? (
                                                <>
                                                    <div className='flex items-center gap-3 flex-wrap'>
                                                        <div className={`rounded-full w-10 h-10 flex-shrink-0 animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className='flex flex-col gap-1.5'>
                                                            <div className={`w-24 h-3.5 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                            <div className={`w-16 h-3 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                        </div>
                                                        <div className={`w-20 h-8 rounded-full animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                    </div>
                                                    <div className='flex flex-wrap items-center gap-2'>
                                                        {[1,2,3,4].map(i => <div key={i} className={`w-20 h-8 rounded-full animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />)}
                                                    </div>
                                                </>
                                            ) : (
                                            <>
                                            <div className='flex items-center gap-3 flex-wrap'>
                                                <div className='flex-shrink-0'>
                                                    {imageErrors[`avatar-${videoData?.avatar}`] || !videoData?.avatar ? (
                                                        <div className={`rounded-full w-10 h-10 flex items-center justify-center ${
                                                            isLight ? 'bg-blue-50 border border-blue-200' : 'bg-[#2B2B2B] border border-[#3B3B3B]'
                                                        }`}>
                                                            <span className={`text-sm font-semibold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                                                                {videoData?.username ? videoData.username.charAt(0).toUpperCase() : 'U'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <img
                                                            className={`rounded-full w-10 h-10 object-cover ${isLight ? 'border border-blue-200' : 'border border-[#3B3B3B]'}`}
                                                            src={ videoData?.avatar }
                                                            alt={`${videoData?.username}'s avatar`}
                                                            onError={() => setImageErrors(prev => ({ ...prev, [`avatar-${videoData?.avatar}`]: true }))}
                                                        />
                                                    )}
                                                </div>
                                                <div className='flex flex-col min-w-0 flex-1'>
                                                    <p className='break-words font-semibold text-sm'>{ videoData?.username }</p>
                                                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                                        {videoData?.subscribers?.length || 0} Subscriber{(videoData?.subscribers?.length || 0) !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                                {videoData?.id && user?._id && videoData.id !== user._id && (
                                                    <button 
                                                        onClick={() => dispatch(toggleSubscribe({ targetUserId: videoData.id }))}
                                                        aria-label={videoData?.subscribers?.includes(user?._id) ? 'Unsubscribe' : 'Subscribe'}
                                                        className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                                                            videoData?.subscribers?.includes(user?._id)
                                                                ? isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-[#333] hover:bg-[#444] text-white'
                                                                : isLight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white hover:bg-gray-200 text-[#0e0e0e]'
                                                        }`}
                                                    >
                                                        {videoData?.subscribers?.includes(user?._id) ? 'Subscribed' : 'Subscribe'}
                                                    </button>
                                                )}
                                            </div>

                                            <div className='flex flex-wrap items-center justify-end gap-2'>
                                                <div className='flex items-center gap-2'>
                                                    <div className={`flex items-center rounded-full overflow-hidden flex-shrink-0 border ${isLight ? 'border-blue-200/60' : 'border-[#3B3B3B]'}`}>
                                                        <button 
                                                            onClick={handleLike}
                                                            aria-label={`Like (${videoData?.video?.likes?.length || 0})`}
                                                            className={`px-3 py-1.5 text-sm font-medium transition-all flex items-center gap-1.5 ${
                                                            videoData?.video?.likes?.includes(user?._id)
                                                                ? 'bg-blue-600 text-white'
                                                                : isLight ? 'bg-white hover:bg-gray-50 text-gray-700' : 'bg-[#272727] hover:bg-[#333] text-white'
                                                        }`}>
                                                            <FontAwesomeIcon icon={faThumbsUp} className={`text-sm transition-transform ${likeAnimating ? 'scale-125' : ''}`}/>
                                                            <span>{videoData?.video?.likes?.length || 0}</span>
                                                        </button>
                                                        <button 
                                                            onClick={handleDislike}
                                                            aria-label={`Dislike (${videoData?.video?.dislikes?.length || 0})`}
                                                            className={`px-3 py-1.5 text-sm font-medium transition-all flex items-center gap-1.5 border-l ${
                                                            videoData?.video?.dislikes?.includes(user?._id)
                                                                ? isLight ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-600 text-white border-gray-500'
                                                                : isLight ? 'bg-white hover:bg-gray-50 text-gray-700 border-blue-200/60' : 'bg-[#272727] hover:bg-[#333] text-white border-[#3B3B3B]'
                                                        }`}>
                                                            <FontAwesomeIcon icon={faThumbsDown} className={`text-sm transition-transform ${dislikeAnimating ? 'scale-125' : ''}`}/>
                                                            <span>{videoData?.video?.dislikes?.length || 0}</span>
                                                        </button>
                                                    </div>
                                                    <button onClick={() => setPlaylistModal(true)} aria-label="Save to playlist"
                                                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors flex-shrink-0 ${
                                                        isLight ? 'bg-white hover:bg-gray-50 text-gray-700 border border-blue-200/60' : 'bg-[#272727] hover:bg-[#333] text-white border border-[#3B3B3B]'
                                                    }`}>
                                                        <FontAwesomeIcon icon={faListSquares} className='mr-1.5 text-sm'/><span className='hidden sm:inline'>Playlists</span>
                                                    </button>
                                                </div>
                                                
                                                <div className='flex items-center gap-2'>
                                                    <button 
                                                        onClick={handleDownload}
                                                        disabled={!videoData?.video?.downloadUrl}
                                                        aria-label="Download video"
                                                        className={`${!videoData?.video?.downloadUrl ? 'disabled:cursor-not-allowed opacity-50' : ''} rounded-full px-3 py-1.5 text-sm font-medium transition-colors flex-shrink-0 ${
                                                            isLight ? 'bg-white hover:bg-gray-50 text-gray-700 border border-blue-200/60' : 'bg-[#272727] hover:bg-[#333] text-white border border-[#3B3B3B]'
                                                        }`}
                                                    >
                                                        <FontAwesomeIcon icon={faDownload} className='mr-1.5 text-sm'/><span className='hidden sm:inline'>Download</span>
                                                    </button>
                                                    <div className="relative flex-shrink-0" ref={dropdownRef}>
                                                        <button 
                                                            onClick={() => {
                                                                const newState = !dropdownOpen;
                                                                setDropdownOpen(newState);
                                                                if (newState && dropdownRef.current) {
                                                                    requestAnimationFrame(() => {
                                                                        if (dropdownRef.current) {
                                                                            const rect = dropdownRef.current.getBoundingClientRect();
                                                                            setDropdownPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
                                                                        }
                                                                    });
                                                                }
                                                            }}
                                                            aria-label="More options"
                                                            aria-expanded={dropdownOpen}
                                                            className={`rounded-full px-2.5 py-1.5 text-sm transition-colors flex-shrink-0 ${
                                                                isLight ? 'bg-white hover:bg-gray-50 text-gray-700 border border-blue-200/60' : 'bg-[#272727] hover:bg-[#333] text-white border border-[#3B3B3B]'
                                                            } ${dropdownOpen ? (isLight ? 'bg-gray-100' : 'bg-[#333]') : ''}`}
                                                        >
                                                            <FontAwesomeIcon icon={faEllipsisVertical} />
                                                        </button>
                                                    
                                                        {dropdownOpen && createPortal(
                                                            <div 
                                                                data-dropdown-menu
                                                                className={`fixed w-48 rounded-xl shadow-lg border z-[9999] overflow-hidden ${
                                                                    isLight ? 'bg-white border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'
                                                                }`}
                                                                style={{ top: `${dropdownPosition.top}px`, right: `${dropdownPosition.right}px` }}
                                                            >
                                                                <div className="py-1">
                                                                    <button onClick={handleShare} aria-label="Share"
                                                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                                                                            isLight ? 'hover:bg-blue-50 text-gray-700' : 'hover:bg-[#272727] text-gray-300'
                                                                        }`}>
                                                                        <FontAwesomeIcon icon={faShare} className="text-sm w-4" /> Share
                                                                    </button>
                                                                    <button onClick={handleCopyLink} aria-label="Copy link"
                                                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                                                                            isLight ? 'hover:bg-blue-50 text-gray-700' : 'hover:bg-[#272727] text-gray-300'
                                                                        }`}>
                                                                        <FontAwesomeIcon icon={faLink} className="text-sm w-4" /> Copy Link
                                                                    </button>
                                                                    <button onClick={handleSaveToWatchLater} aria-label="Save to Watch Later"
                                                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                                                                            isLight ? 'hover:bg-blue-50 text-gray-700' : 'hover:bg-[#272727] text-gray-300'
                                                                        }`}>
                                                                        <FontAwesomeIcon icon={faBookmark} className="text-sm w-4" /> Watch Later
                                                                    </button>
                                                                    <div className={`border-t my-1 ${isLight ? 'border-blue-200/60' : 'border-[#2B2B2B]'}`} />
                                                                    <button onClick={() => handleReport()} aria-label="Report video"
                                                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                                                                            isLight ? 'hover:bg-red-50 text-red-600' : 'hover:bg-red-900/20 text-red-400'
                                                                        }`}>
                                                                        <FontAwesomeIcon icon={faFlag} className="text-sm w-4" /> Report
                                                                    </button>
                                                                </div>
                                                            </div>,
                                                            document.body
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className={`${cardClass} p-5 px-6`}>
                                        {
                                            loading ?
                                                <div className='w-full flex flex-col items-start gap-3'>
                                                    <div className={`w-3/4 max-w-md h-5 animate-pulse rounded ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                    <div className={`w-full max-w-sm h-3.5 animate-pulse rounded ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                    <div className='mt-3 flex flex-col gap-2 w-full'>
                                                        {[1,2,3].map(i => <div key={i} className={`w-full h-3.5 animate-pulse rounded ${isLight ? light.focusbackground : dark.focusbackground}`} />)}
                                                    </div>
                                                </div> 
                                            :   
                                            <div className="w-full flex flex-col">
                                                <div onClick={() => expandDescription()}
                                                    className={`flex-1 overflow-hidden transition-all duration-300 ease-in-out ${toggle.description ? 'max-h-[2000px]' : 'max-h-14 md:max-h-[2000px] md:cursor-auto cursor-pointer'}`}>
                                                    <h1 className="text-base sm:text-lg font-semibold mb-1.5 leading-snug">{ videoData?.video?.title }</h1>
                                                    <p className={`${!toggle.description && 'truncate'} text-xs mb-3 flex items-center gap-3 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}> 
                                                        <span className='inline-flex items-center gap-1.5'>
                                                            <FontAwesomeIcon icon={faEye} className='text-xs'/>
                                                            {videoData?.video?.views?.length || 0} view{(videoData?.video?.views?.length || 0) !== 1 ? 's' : ''}
                                                        </span>
                                                        <span>&bull;</span>
                                                        <span>{ formatToPhilippineTime(videoData?.video?.createdAt) }</span>
                                                    </p>
                                                    <div className={`w-full leading-relaxed mt-2 mb-2 whitespace-pre-wrap text-sm ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                                                        { videoData?.video?.description ?? 'No Description' }
                                                    </div>

                                                    <div className={`flex flex-col gap-3 mt-4 pt-4 border-t md:block ${toggle.description ? 'block' : 'hidden'} ${isLight ? 'border-blue-200/40' : 'border-[#2B2B2B]'}`}>
                                                        {[
                                                            { label: 'Author/Artist', items: videoData?.video?.owner, prefix: '@' },
                                                            { label: 'Category', items: videoData?.video?.category, prefix: '' },
                                                            { label: 'Tags', items: videoData?.video?.tags, prefix: '#' },
                                                        ].map(section => section.items?.length > 0 && (
                                                            <div key={section.label} className='flex flex-col sm:flex-row sm:items-center gap-2 py-1'>
                                                                <span className={`font-medium text-xs whitespace-nowrap uppercase tracking-wide ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{section.label}:</span>
                                                                <div className='flex flex-wrap gap-1.5'>
                                                                    {section.items.map((item, i) => (
                                                                        <span key={i} className={`cursor-pointer px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                                            isLight ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-blue-900/40 text-blue-300 hover:bg-blue-900/60"
                                                                        }`}>{section.prefix}{item.name}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {toggle.description ? (
                                                        <p onClick={(e) => { e.stopPropagation(); setToggle({...toggle, description: false}) }}
                                                            className={`sm:hidden flex items-center justify-center gap-1 text-xs mt-3 font-medium ${isLight ? 'text-blue-600' : 'text-blue-400'} cursor-pointer`}>
                                                            <FontAwesomeIcon icon={faChevronUp} className="text-[10px]" /> Show Less
                                                        </p>
                                                    ) : (
                                                        <p onClick={(e) => { e.stopPropagation(); expandDescription(); }}
                                                            className={`sm:hidden flex items-center justify-center gap-1 text-xs mt-3 font-medium ${isLight ? 'text-blue-600' : 'text-blue-400'} cursor-pointer`}>
                                                            <FontAwesomeIcon icon={faChevronDown} className="text-[10px]" /> Show More
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        }
                                    </div>

                                    {/* Recommendations */}
                                    <div className={`${cardClass} p-5 px-6`}>
                                        <h2 className="text-base font-semibold mb-4">Recommendations</h2>
                                        <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-4'>
                                            {loading ? (
                                                [...Array(8)].map((_, i) => (
                                                    <div key={i} className='flex flex-col gap-2'>
                                                        <div className={`w-full aspect-video rounded-lg animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-full h-4 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-2/3 h-3 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                    </div>
                                                ))
                                            ) : related.length > 0 ? (
                                                related.map((item) => (
                                                    <Link key={item._id} to={`/watch/${item._id}`} className="group flex flex-col gap-2">
                                                        <div className={`relative w-full aspect-video rounded-lg overflow-hidden border ${isLight ? 'border-blue-200/60' : 'border-[#2B2B2B]'}`}>
                                                            {item.thumbnail ? (
                                                                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                            ) : (
                                                                <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#2B2B2B]'}`}>
                                                                    <FontAwesomeIcon icon={faFilm} className={`text-2xl ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                                </div>
                                                            )}
                                                            {item.duration && (
                                                                <span className="absolute bottom-1 right-1 text-[10px] bg-black/70 text-white px-1 py-0.5 rounded">{millisToTimeString(item.duration)}</span>
                                                            )}
                                                        </div>
                                                        <p className='line-clamp-2 text-sm font-medium leading-snug'>{item.title}</p>
                                                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                                            {item.user && `${item.user} • `}{item.views?.length || 0} views
                                                        </p>
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className={`col-span-full text-center py-8 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                    <FontAwesomeIcon icon={faFilm} className="text-2xl mb-2" />
                                                    <p className="text-sm">No recommendations yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>

                                {/* Sidebar */}
                                <div className={`${theaterMode ? 'lg:col-span-3 grid lg:grid-cols-2 gap-4' : 'lg:col-span-1 flex flex-col gap-4'}`}>
                                    {/* Playlist Panel */}
                                    {loading ? (
                                        <div className={`${cardClass} p-4`}>
                                            <div className='mb-3 pb-3 border-b' style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
                                                <div className={`w-32 h-4 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                <div className={`w-full mt-2 h-3 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                            </div>
                                            <div className='flex flex-col gap-2'>
                                                {[1,2,3,4,5].map(i => (
                                                    <div key={i} className='flex items-start gap-2.5 p-2'>
                                                        <div className={`w-32 h-20 flex-shrink-0 rounded-lg animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className='flex flex-col gap-1.5 flex-1 min-w-0'>
                                                            <div className={`w-full h-3.5 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                            <div className={`w-16 h-3 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : videoList?.videos?.length > 0 ? (
                                        <div className={`${cardClass} p-4`}>
                                            <div className={`mb-3 pb-3 border-b ${isLight ? 'border-blue-200/40' : 'border-[#2B2B2B]'}`}>
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-semibold mb-1">{ videoList?.group_name || 'Playlist' }</h3>
                                                    <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                        {currentPlaylistIndex >= 0 ? `${currentPlaylistIndex + 1} / ${videoList.videos.length}` : `${videoList.videos.length} videos`}
                                                    </span>
                                                </div>
                                                {videoList?.description && (
                                                    <p className={`text-xs line-clamp-2 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                                        { videoList.description }
                                                    </p>
                                                )}
                                            </div>

                                            <div ref={playlistScrollRef}
                                                className='relative flex flex-col gap-1.5 max-h-[500px] overflow-y-auto custom-scroll'
                                                style={{
                                                    maskImage: 'linear-gradient(to bottom, black calc(100% - 40px), transparent)',
                                                    WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 40px), transparent)'
                                                }}>
                                                {videoList.videos.map((item, i) => (
                                                    <Link key={item._id || i} to={`/watch/${item._id}`} className={`w-full flex items-start gap-2.5 transition-colors rounded-lg p-2 ${
                                                        id === item._id 
                                                            ? (isLight ? 'bg-blue-50 border border-blue-200' : 'bg-[#2B2B2B] border border-blue-600/40')
                                                            : (isLight ? 'hover:bg-blue-50/50 border border-transparent' : 'hover:bg-[#272727] border border-transparent')
                                                    }`}>
                                                        <div className={`bg-black rounded-lg overflow-hidden w-32 h-20 flex-shrink-0 relative border ${
                                                            id === item._id ? (isLight ? 'border-blue-300' : 'border-blue-600') : (isLight ? 'border-blue-200/60' : 'border-[#3B3B3B]')
                                                        }`}>
                                                            {id === item._id && (
                                                                <div className='absolute inset-0 flex items-center justify-center bg-black/70 z-10'>
                                                                    <span className='text-white text-xs font-medium'>Watching</span>
                                                                </div>
                                                            )}
                                                            {imageErrors[`thumbnail-${item?._id}`] || !item?.thumbnail ? (
                                                                <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#2B2B2B]'}`}>
                                                                    <FontAwesomeIcon icon={faFilm} className={`text-lg ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                                                                </div>
                                                            ) : (
                                                                <img src={item?.thumbnail} alt={item?.title} className='w-full h-full object-cover'
                                                                    onError={() => setImageErrors(prev => ({ ...prev, [`thumbnail-${item?._id}`]: true }))} />
                                                            )}
                                                            <div className='absolute top-1 right-1 rounded text-white bg-black/70 px-1 py-0.5' title={item.downloadUrl ? 'Video' : 'Embed'}>
                                                                <FontAwesomeIcon icon={item.downloadUrl ? faFilm : faCode} className='text-xs' />
                                                            </div>
                                                            <div className='absolute bottom-1 right-1 rounded text-white bg-black/70 px-1 py-0.5'>
                                                                <span className='text-xs'>{item.duration ? millisToTimeString(item.duration) : '00:00'}</span>
                                                            </div>
                                                        </div>
                                                        <div className='flex flex-col min-w-0 flex-1 justify-center'>
                                                            <p className='line-clamp-2 text-sm font-medium mb-1 leading-snug'>{item.title}</p>
                                                            <p className={`text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                                                <FontAwesomeIcon icon={faEye} className='text-xs'/> {item.views?.length || 0} views
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div> 
                                    ) : null}

                                    {/* Recent Videos Sidebar */}
                                    <div className={`${cardClass} p-4`}>
                                        <div className={`flex justify-between items-center mb-3 pb-3 border-b ${isLight ? 'border-blue-200/40' : 'border-[#2B2B2B]'}`}>
                                            <h3 className="text-sm font-semibold">Recent Videos</h3>
                                        </div>
                                        
                                        <div className='flex flex-col gap-1.5'>
                                            {recentSidebar.length > 0 ? recentSidebar.slice(0, 6).map((item) => (
                                                <Link key={item._id} to={`/watch/${item._id}`}
                                                    className={`w-full flex items-start gap-2.5 transition-colors rounded-lg p-2 ${
                                                    isLight ? 'hover:bg-blue-50/50' : 'hover:bg-[#272727]'
                                                }`}>
                                                    <div className={`w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border ${isLight ? 'border-blue-200/60' : 'border-[#3B3B3B]'}`}>
                                                        {item.thumbnail ? (
                                                            <img className='w-full h-full object-cover' src={item.thumbnail} alt={item.title} />
                                                        ) : (
                                                            <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#2B2B2B]'}`}>
                                                                <FontAwesomeIcon icon={faFilm} className={`text-lg ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className='flex-1 min-w-0 flex flex-col justify-center'>
                                                        <p className='line-clamp-2 text-sm font-medium mb-1 leading-snug'>{item.title}</p>
                                                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                                            {item.user && `${item.user} • `}{item.views?.length || 0} views
                                                        </p>
                                                    </div>
                                                </Link>
                                            )) : (
                                                <div className={`text-center py-6 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                    <FontAwesomeIcon icon={faFilm} className="text-xl mb-2" />
                                                    <p className="text-xs">No recent videos</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div className={`${theaterMode ? 'lg:col-span-3' : 'lg:col-span-2'} order-last lg:order-none`}>
                                    <div className={`${cardClass} p-5 px-6`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-base font-semibold">Comments</h2>
                                            {data?.length > 1 && (
                                                <select value={commentSort} onChange={(e) => setCommentSort(e.target.value)}
                                                    aria-label="Sort comments"
                                                    className={`text-xs py-1 px-2 rounded-lg cursor-pointer ${isLight ? 'bg-blue-50 text-slate-600 border border-blue-200/60' : 'bg-[#272727] text-gray-300 border border-[#3B3B3B]'}`}>
                                                    <option value="newest">Newest First</option>
                                                    <option value="oldest">Oldest First</option>
                                                </select>
                                            )}
                                        </div>
                                        
                                        <div className={`flex flex-col gap-5`}>
                                            {loading ? (
                                                <>
                                                    <div className='flex gap-3'>
                                                        <div className={`w-10 h-10 rounded-full flex-shrink-0 animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className='flex-1 flex flex-col gap-2'>
                                                            <div className={`w-full h-10 rounded-lg animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                            <div className={`w-24 h-8 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                        </div>
                                                    </div>
                                                    <div className={`w-24 h-5 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                    <div className='flex flex-col gap-4'>
                                                        {[1,2,3].map(i => (
                                                            <div key={i} className='flex gap-3'>
                                                                <div className={`w-10 h-10 rounded-full flex-shrink-0 animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                                <div className='flex-1 flex flex-col gap-2'>
                                                                    <div className={`w-32 h-4 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                                    <div className={`w-full h-3 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col gap-5">
                                                    <CommentField comment={comment} setComment={setComment} theme={theme} />
                                                    
                                                    <h2 className='text-sm font-semibold'>
                                                        {data?.length ?? 0} Comment{(data?.length ?? 0) !== 1 ? 's' : ''}
                                                    </h2>

                                                    {sortedComments.length > 0 ? (
                                                        sortedComments.map((item, i) => (
                                                            <Comments 
                                                                key={item._id || i}
                                                                theme={theme}
                                                                data={item}
                                                                handleSubmit={handleComment}
                                                                deleteComment={deleteComment}
                                                                onReport={handleReport}
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className={`text-center py-10 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 ${isLight ? 'bg-blue-50' : 'bg-blue-950/20'}`}>
                                                                <FontAwesomeIcon icon={faComment} className={`text-2xl ${isLight ? 'text-blue-300' : 'text-blue-800'}`} />
                                                            </div>
                                                            <p className="text-sm font-medium mb-1">No comments yet</p>
                                                            <p className="text-xs">Be the first to share your thoughts!</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>

            {/* Playlist Modal */}
            <PlaylistModal
                theme={theme}
                openModal={playlistModal}
                setOpenModal={setPlaylistModal}
                videoId={id}
                videoData={videoData?.video}
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

            {/* Share Modal */}
            {shareModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShareModalOpen(false)}>
                    <div className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl ${isLight ? 'bg-white' : 'bg-[#0e0e0e]'}`}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 pt-5 pb-3">
                            <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Share Video</h3>
                            <button onClick={() => setShareModalOpen(false)} aria-label="Close share modal"
                                className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-100 text-slate-400' : 'hover:bg-[#2B2B2B] text-gray-500'}`}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        <div className="px-6 pb-4 space-y-3">
                            {/* URL Copy */}
                            <div className={`flex items-center gap-2 p-2.5 rounded-xl ${isLight ? 'bg-slate-50' : 'bg-[#111]'}`}>
                                <input type="text" readOnly value={window.location.href}
                                    className={`flex-1 text-xs bg-transparent outline-none truncate ${isLight ? 'text-slate-600' : 'text-gray-300'}`} />
                                <button onClick={() => { navigator.clipboard.writeText(window.location.href); setNotification({ variant: 'success', message: 'Link copied!' }); setShow(true) }}
                                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0">
                                    <FontAwesomeIcon icon={faCopy} className="mr-1" /> Copy
                                </button>
                            </div>

                            {/* Social Links */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { name: 'Twitter', icon: faTwitter, color: 'bg-sky-500 hover:bg-sky-600', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(videoData?.video?.title || '')}` },
                                    { name: 'Facebook', icon: faFacebook, color: 'bg-blue-600 hover:bg-blue-700', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
                                    { name: 'Reddit', icon: faReddit, color: 'bg-orange-500 hover:bg-orange-600', url: `https://www.reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(videoData?.video?.title || '')}` },
                                ].map(social => (
                                    <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer"
                                        className={`${social.color} text-white rounded-xl py-2.5 text-center text-xs font-medium transition-colors flex items-center justify-center gap-1.5`}>
                                        <FontAwesomeIcon icon={social.icon} /> {social.name}
                                    </a>
                                ))}
                            </div>

                            {/* Embed Code */}
                            <div>
                                <p className={`text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Embed Code</p>
                                <div className={`flex items-center gap-2 p-2.5 rounded-xl ${isLight ? 'bg-slate-50' : 'bg-[#111]'}`}>
                                    <code className={`flex-1 text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{embedCode}</code>
                                    <button onClick={() => { navigator.clipboard.writeText(embedCode); setNotification({ variant: 'success', message: 'Embed code copied!' }); setShow(true) }}
                                        className={`text-xs px-2 py-1 rounded-lg transition-colors shrink-0 ${isLight ? 'text-blue-600 hover:bg-blue-50' : 'text-blue-400 hover:bg-blue-950/30'}`}>
                                        <FontAwesomeIcon icon={faCopy} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Watch
