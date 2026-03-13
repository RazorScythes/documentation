import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom';

import { faCode, faDownload, faEllipsisVertical, faEye, faFilm, faListSquares, faSearch, faThumbsDown, faThumbsUp, faTriangleExclamation, faShare, faFlag, faCopy, faLink, faBookmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useScreenSize } from '../Tools';
import { Comments, CommentField } from '../Custom/Comments'
import { main, dark, light } from '../../style';
import { getVideoById, getVideoList, getVideoComment, addVideoComment, updateVideoComment, deleteVideoComment, clearAlert, likeVideo, dislikeVideo, updateLikes, updateComments, toggleSubscribe, viewVideo } from '../../actions/watch';
import { createPlaylist, toggleVideoInPlaylist, getPlaylists, clearAlert as clearPlaylistAlert } from '../../actions/playlist';
import { io as socketIO } from 'socket.io-client';
import Cookies from 'universal-cookie';

import Poster from '../Custom/Poster';
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

const Watch = ({ user, theme }) => {
    const dispatch = useDispatch()
    const { id } = useParams();
    
    const video = useSelector((state) => state.watch.data)
    const videoList = useSelector((state) => state.watch.videoList)
    const alert = useSelector((state) => state.watch.alert)
    const comments = useSelector((state) => state.watch.comments)
    const notFound = useSelector((state) => state.watch.notFound)
    const forbiden = useSelector((state) => state.watch.forbiden)
    const loading = useSelector((state) => state.watch.isLoading)

    const [searchParams, setSearchParams] = useSearchParams();
    const access_key = searchParams.get('access_key')

    const [videoData, setVideoData] = useState(null)
    const [notification, setNotification] = useState({})
    const [show, setShow] = useState(true)

    const socketUrl = import.meta.env.VITE_DEVELOPMENT == "true"
        ? `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`
        : import.meta.env.VITE_APP_BASE_URL

    useEffect(() => {
        dispatch(getVideoById({ id, access_key }))
        dispatch(getPlaylists())

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

        return () => {
            socket.emit('leave_video', id)
            socket.disconnect()
        }
    }, [id, access_key])

    useEffect(() => {
        setVideoData(video);
        dispatch(getVideoComment({id}));
        dispatch(getVideoList({id}));
    }, [video])

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
    const [toggle, setToggle] = useState({
        description: false
    })
    const [imageErrors, setImageErrors] = useState({})
    const [playlistModal, setPlaylistModal] = useState(false)
    const [reportModal, setReportModal] = useState(false)
    const [reportId, setReportId] = useState('')
    const [reportType, setReportType] = useState('video') // 'video' or 'comment'
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
    const dropdownRef = useRef(null)
    const videoRef = useRef(null)

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

    // Load saved volume/muted and persist when user changes volume or clicks mute
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

        const onVolumeChange = () => saveVideoVolume(videoEl)

        const onVideoClick = () => {
            requestAnimationFrame(() => saveVideoVolume(videoEl))
        }

        videoEl.addEventListener('volumechange', onVolumeChange)
        videoEl.addEventListener('click', onVideoClick)
        return () => {
            videoEl.removeEventListener('volumechange', onVolumeChange)
            videoEl.removeEventListener('click', onVideoClick)
        }
    }, [loading, videoData?.video?.downloadUrl])

    const playlists = useSelector((state) => state.playlist.data)
    const playlistAlert = useSelector((state) => state.playlist.alert)

    useEffect(() => {
        if(Object.keys(playlistAlert).length > 0) {
            dispatch(clearPlaylistAlert())
            setNotification(playlistAlert)
            setShow(true)
        }
    }, [playlistAlert])

    // Update dropdown position on scroll/resize
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
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                updatePosition();
            });
            
            // Also update immediately
            updatePosition();
            
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            
            // Update on any scroll within the page
            const scrollContainers = document.querySelectorAll('[data-scroll-container]');
            scrollContainers.forEach(container => {
                container.addEventListener('scroll', updatePosition, true);
            });
        }

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [dropdownOpen])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // Check if click is on the dropdown itself
                const dropdown = document.querySelector('[data-dropdown-menu]');
                if (dropdown && dropdown.contains(event.target)) {
                    return;
                }
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen])

    // Dropdown menu actions
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: videoData?.video?.title,
                text: `Check out this video: ${videoData?.video?.title}`,
                url: window.location.href,
            }).catch((error) => console.log('Error sharing', error));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            // You could show a notification here
        }
        setDropdownOpen(false);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setDropdownOpen(false);
        // You could show a notification here
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
            }
        } else {
            dispatch(createPlaylist({ name: 'Watch Later', videoId: id }))
        }
        
        setDropdownOpen(false);
    };

    const handleDownload = () => {
        if (videoData?.video?.downloadUrl) {
            // Create a temporary anchor element to trigger download
            const link = document.createElement('a');
            link.href = videoData.video.downloadUrl;
            link.download = videoData.video.title || 'video';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Show notification or alert if download is not available
            console.log('Download not available for this video');
        }
    };
    const expandDescription = () => {
        const screensize = useScreenSize()
        if(screensize === 'sm' || screensize === 'xs') {
            setToggle({...toggle, description: true})
        }
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
        dispatch(updateVideoComment({
            id,
            data: formData
        }))
    }

    const deleteComment = (cid) => {
        dispatch(deleteVideoComment({
            id: cid,
            video_id: id
        }))
    }

    return (
        <div className={`relative overflow-hidden ${main.font} ${theme === 'light' ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidth}`}>
                    <Notification
                        theme={theme}
                        data={notification}
                        show={show}
                        setShow={setShow}
                    />

                    {
                        forbiden === 'strict' ?
                            <div className="flex flex-col justify-center items-center my-24 md:w-1/2 w-full mx-auto py-20">
                                <h1 className="sm:text-9xl text-6xl font-semibold mb-4 text-center relative">
                                    <FontAwesomeIcon icon={faTriangleExclamation} className='absolute top-[-2rem] sm:right-[-3rem] right-[-2rem] sm:w-12 sm:h-12 w-8 h-8'/>
                                    <span className={`${theme === 'light' ? light.heading : dark.heading}`}>409</span>
                                </h1>
                                <h2 className="sm:text-3xl text-xl font-medium mb-4 text-center relative">Oops, sorry this video is restricted!</h2>
                                <p className="mb-8 text-center text-sm leading-6">You don't have previledge to access this video.</p>
                                <a href="/" className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>Back to home page</a>
                            </div>
                        :
                        forbiden === 'private' ?
                            <div className="flex flex-col justify-center items-center my-24 md:w-1/2 w-full mx-auto py-20">
                                <h1 className="sm:text-9xl text-6xl font-semibold mb-4 text-center relative">
                                    <FontAwesomeIcon icon={faTriangleExclamation} className='absolute top-[-2rem] sm:right-[-3rem] right-[-2rem] sm:w-12 sm:h-12 w-8 h-8'/>
                                    <span className={`${theme === 'light' ? light.heading : dark.heading}`}>409</span>
                                </h1>
                                <h2 className="sm:text-3xl text-xl font-medium mb-4 text-center relative">Oops, sorry this video is private!</h2>
                                <p className="mb-8 text-center text-sm leading-6">You don't have previledge to access this video.</p>
                                <a href="/" className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>Back to home page</a>
                            </div>
                        :
                        forbiden === 'access_invalid' ?
                            <div className="flex flex-col justify-center items-center my-24 md:w-1/2 w-full mx-auto py-20">
                                <h1 className="sm:text-9xl text-6xl font-semibold mb-4 text-center relative">
                                    <FontAwesomeIcon icon={faSearch} className='absolute top-[-2rem] sm:right-[-3rem] right-[-2rem] sm:w-12 sm:h-12 w-8 h-8'/>
                                    <span className={`${theme === 'light' ? light.heading : dark.heading}`}>409</span>
                                </h1>
                                <h2 className="sm:text-3xl text-xl font-medium mb-4 text-center relative">Oops, sorry access key is invalid!</h2>
                                <p className="mb-8 text-center text-sm leading-6">You don't have previledge to access this video.</p>
                                <a href="/" className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>Back to home page</a>
                            </div>
                        :
                        notFound ?
                            <div className="flex flex-col justify-center items-center my-24 md:w-1/2 w-full mx-auto py-20">
                                <h1 className="sm:text-9xl text-6xl font-semibold mb-4 text-center relative">
                                    <FontAwesomeIcon icon={faSearch} className='absolute top-[-2rem] sm:right-[-3rem] right-[-2rem] sm:w-12 sm:h-12 w-8 h-8'/>
                                    <span className={`${theme === 'light' ? light.heading : dark.heading}`}>404</span>
                                </h1>
                                <h2 className="sm:text-3xl text-xl font-medium mb-4 text-center relative">Oops, sorry we can't find that video!</h2>
                                <p className="mb-8 text-center text-sm leading-6">Either something went wrong or the video doesn't exist anymore.</p>
                                <a href="/" className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>Back to home page</a>
                            </div>
                        :
                        <div className={`${main.container} file:lg:px-8 relative px-0 my-12`}>
                            <div className='grid lg:grid-cols-3 grid-cols-1 gap-6 place-content-start mt-8'>
                                <div className="lg:col-span-2 flex flex-col gap-4">
                                    <div className={`relative w-full overflow-hidden pb-[56.25%] rounded-xl border ${theme === 'light' ? 'border-gray-200' : 'border-[#2B2B2B]'}`}>
                                        {
                                            loading ?
                                                <div className={`absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden ${theme === 'light' ? light.background : dark.background} border-2 ${theme === 'light' ? light.border : dark.border}`}>
                                                    <div className={`absolute inset-0 animate-pulse ${theme === 'light' ? 'bg-slate-200/50' : 'bg-slate-700/50'}`} />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center animate-pulse ${theme === 'light' ? 'bg-slate-300/80' : 'bg-slate-600/80'}`}>
                                                            <svg className={`w-8 h-8 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            :
                                            <div className="watch-content-loaded absolute inset-0">
                                                {
                                                    videoData?.video?.downloadUrl ?
                                                        <video 
                                                            ref={videoRef}
                                                            src={videoData.video?.downloadUrl}
                                                            poster={videoData.video?.thumbnail}
                                                            className={`absolute top-0 left-0 w-full h-full ${theme === 'light' ? light.background : dark.background} border-2 ${theme === 'light' ? light.border : dark.border} rounded-xl`}
                                                            controls 
                                                            controlsList="nodownload" 
                                                        >
                                                        </video>
                                                    :
                                                        <iframe 
                                                            src={videoData?.video?.link}
                                                            className={`absolute top-0 left-0 w-full h-full ${theme === 'light' ? light.background : dark.background} border-2 ${theme === 'light' ? light.border : dark.border} rounded-xl`}
                                                            allow="autoplay"
                                                            sandbox="allow-scripts allow-same-origin"
                                                            allowFullScreen
                                                        >
                                                        </iframe>
                                                }
                                            </div>
                                        }                       
                                    </div>
                                    
                                    <div className={`rounded-xl p-4 px-5 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                                            {loading ? (
                                                <>
                                                    <div className='flex items-center gap-3 flex-wrap'>
                                                        <div className={`rounded-full w-10 h-10 flex-shrink-0 animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className='flex flex-col gap-1.5'>
                                                            <div className={`w-24 h-3.5 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                            <div className={`w-16 h-3 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        </div>
                                                        <div className={`w-20 h-8 rounded-full animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    </div>
                                                    <div className='flex flex-wrap items-center gap-2'>
                                                        <div className={`w-20 h-8 rounded-full animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-20 h-8 rounded-full animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-20 h-8 rounded-full animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-8 h-8 rounded-full animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    </div>
                                                </>
                                            ) : (
                                            <>
                                            <div className='flex items-center gap-3 flex-wrap'>
                                                <div className='flex-shrink-0'>
                                                    {imageErrors[`avatar-${videoData?.avatar}`] || !videoData?.avatar ? (
                                                        <div className={`rounded-full w-10 h-10 border border-solid flex items-center justify-center ${
                                                            theme === 'light' 
                                                                ? 'bg-blue-50 border-blue-200' 
                                                                : 'bg-[#2B2B2B] border-[#3B3B3B]'
                                                        }`}>
                                                            <span className={`text-sm font-semibold ${
                                                                theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                                                            }`}>
                                                                {videoData?.username ? videoData.username.charAt(0).toUpperCase() : 'U'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <img
                                                            className={`rounded-full w-10 h-10 border border-solid object-cover ${
                                                                theme === 'light' ? 'border-blue-200' : 'border-[#3B3B3B]'
                                                            }`}
                                                            src={ videoData?.avatar }
                                                            alt="user profile"
                                                            onError={() => setImageErrors(prev => ({ ...prev, [`avatar-${videoData?.avatar}`]: true }))}
                                                        />
                                                    )}
                                                </div>
                                                <div className='flex flex-col min-w-0 flex-1'>
                                                    <p className='break-words font-semibold text-sm'>{ videoData?.username }</p>
                                                    <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {videoData?.subscribers?.length || 0} Subscriber{(videoData?.subscribers?.length || 0) !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                                {videoData?.id && user?._id && videoData.id !== user._id && (
                                                    <button 
                                                        onClick={() => dispatch(toggleSubscribe({ targetUserId: videoData.id }))}
                                                        className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                                                            videoData?.subscribers?.includes(user?._id)
                                                                ? theme === 'light'
                                                                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                                    : 'bg-[#333] hover:bg-[#444] text-white'
                                                                : theme === 'light' 
                                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                                                    : 'bg-white hover:bg-gray-200 text-[#0e0e0e]'
                                                        }`}
                                                    >
                                                        {videoData?.subscribers?.includes(user?._id) ? 'Subscribed' : 'Subscribe'}
                                                    </button>
                                                )}
                                            </div>

                                            <div className='flex flex-wrap items-center justify-end gap-2'>
                                                <div className='flex items-center gap-2'>
                                                    <div className={`flex items-center rounded-full overflow-hidden flex-shrink-0 border ${
                                                        theme === 'light' ? 'border-gray-200' : 'border-[#3B3B3B]'
                                                    }`}>
                                                        <button 
                                                            onClick={() => dispatch(likeVideo({ videoId: id }))}
                                                            className={`px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                                            videoData?.video?.likes?.includes(user?._id)
                                                                ? 'bg-blue-600 text-white'
                                                                : theme === 'light'
                                                                    ? 'bg-white hover:bg-gray-50 text-gray-700'
                                                                    : 'bg-[#272727] hover:bg-[#333] text-white'
                                                        }`}>
                                                            <FontAwesomeIcon icon={faThumbsUp} className='text-sm'/>
                                                            <span>{videoData?.video?.likes?.length || 0}</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => dispatch(dislikeVideo({ videoId: id }))}
                                                            className={`px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 border-l ${
                                                            videoData?.video?.dislikes?.includes(user?._id)
                                                                ? theme === 'light'
                                                                    ? 'bg-gray-700 text-white border-gray-600'
                                                                    : 'bg-gray-600 text-white border-gray-500'
                                                                : theme === 'light'
                                                                    ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                                                                    : 'bg-[#272727] hover:bg-[#333] text-white border-[#3B3B3B]'
                                                        }`}>
                                                            <FontAwesomeIcon icon={faThumbsDown} className='text-sm'/>
                                                            <span>{videoData?.video?.dislikes?.length || 0}</span>
                                                        </button>
                                                    </div>
                                                    <button onClick={() => setPlaylistModal(true)} className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors flex-shrink-0 ${
                                                        theme === 'light'
                                                            ? 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                                                            : 'bg-[#272727] hover:bg-[#333] text-white border border-[#3B3B3B]'
                                                    }`}>
                                                        <FontAwesomeIcon icon={faListSquares} className='mr-1.5 text-sm'/><span className='hidden sm:inline'>Playlists</span>
                                                    </button>
                                                </div>
                                                
                                                <div className='flex items-center gap-2'>
                                                    <button 
                                                        onClick={handleDownload}
                                                        disabled={!videoData?.video?.downloadUrl}
                                                        className={`${!videoData?.video?.downloadUrl ? 'disabled:cursor-not-allowed opacity-50' : ''} rounded-full px-3 py-1.5 text-sm font-medium transition-colors flex-shrink-0 ${
                                                            theme === 'light'
                                                                ? 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                                                                : 'bg-[#272727] hover:bg-[#333] text-white border border-[#3B3B3B]'
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
                                                                            setDropdownPosition({
                                                                                top: rect.bottom + 8,
                                                                                right: window.innerWidth - rect.right
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            }}
                                                            className={`rounded-full px-2.5 py-1.5 text-sm transition-colors flex-shrink-0 ${
                                                                theme === 'light'
                                                                    ? 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                                                                    : 'bg-[#272727] hover:bg-[#333] text-white border border-[#3B3B3B]'
                                                            } ${dropdownOpen ? (theme === 'light' ? 'bg-gray-100' : 'bg-[#333]') : ''}`}
                                                        >
                                                            <FontAwesomeIcon icon={faEllipsisVertical} />
                                                        </button>
                                                    
                                                        {dropdownOpen && createPortal(
                                                            <div 
                                                                data-dropdown-menu
                                                                className={`fixed w-48 rounded-lg shadow-lg border z-[9999] max-h-[80vh] overflow-y-auto ${
                                                                    theme === 'light' 
                                                                        ? 'bg-white border-gray-200' 
                                                                        : 'bg-[#1C1C1C] border-[#3B3B3B]'
                                                                }`}
                                                                style={{
                                                                    top: `${dropdownPosition.top}px`,
                                                                    right: `${dropdownPosition.right}px`
                                                                }}
                                                            >
                                                                <div className="py-1">
                                                                    <button
                                                                        onClick={handleShare}
                                                                        className={`w-full text-left px-4 py-2 text-sm font-normal flex items-center gap-3 transition-colors ${
                                                                            theme === 'light'
                                                                                ? 'hover:bg-gray-50 text-gray-700'
                                                                                : 'hover:bg-[#272727] text-gray-300'
                                                                        }`}
                                                                    >
                                                                        <FontAwesomeIcon icon={faShare} className="text-sm w-4" />
                                                                        <span>Share</span>
                                                                    </button>
                                                                    
                                                                    <button
                                                                        onClick={handleCopyLink}
                                                                        className={`w-full text-left px-4 py-2 text-sm font-normal flex items-center gap-3 transition-colors ${
                                                                            theme === 'light'
                                                                                ? 'hover:bg-gray-50 text-gray-700'
                                                                                : 'hover:bg-[#272727] text-gray-300'
                                                                        }`}
                                                                    >
                                                                        <FontAwesomeIcon icon={faLink} className="text-sm w-4" />
                                                                        <span>Copy Link</span>
                                                                    </button>
                                                                    
                                                                    <button
                                                                        onClick={handleSaveToWatchLater}
                                                                        className={`w-full text-left px-4 py-2 text-sm font-normal flex items-center gap-3 transition-colors ${
                                                                            theme === 'light'
                                                                                ? 'hover:bg-gray-50 text-gray-700'
                                                                                : 'hover:bg-[#272727] text-gray-300'
                                                                        }`}
                                                                    >
                                                                        <FontAwesomeIcon icon={faBookmark} className="text-sm w-4" />
                                                                        <span>Save to Watch Later</span>
                                                                    </button>
                                                                    
                                                                    <div className={`border-t my-1 ${
                                                                        theme === 'light' ? 'border-gray-200' : 'border-[#3B3B3B]'
                                                                    }`}></div>
                                                                    
                                                                    <button
                                                                        onClick={() => handleReport()}
                                                                        className={`w-full text-left px-4 py-2 text-sm font-normal flex items-center gap-3 transition-colors ${
                                                                            theme === 'light'
                                                                                ? 'hover:bg-red-50 text-red-600'
                                                                                : 'hover:bg-red-900/20 text-red-400'
                                                                        }`}
                                                                    >
                                                                        <FontAwesomeIcon icon={faFlag} className="text-sm w-4" />
                                                                        <span>Report</span>
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

                                    <div className={`rounded-xl p-5 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                        {
                                            loading ?
                                                <div className='w-full flex flex-col items-start gap-3 overflow-x-hidden'>
                                                    <div className={`w-3/4 max-w-md h-5 animate-pulse rounded ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    <div className={`w-full max-w-sm h-3.5 animate-pulse rounded ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    <div className='mt-3 flex flex-col gap-2 w-full'>
                                                        <div className={`w-full h-3.5 animate-pulse rounded ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-full h-3.5 animate-pulse rounded ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-4/5 h-3.5 animate-pulse rounded ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    </div>
                                                </div> 
                                            :   
                                            <div className="watch-content-loaded w-full flex flex-col">
                                                <div onClick={() => expandDescription()} className={`flex-1 overflow-hidden ${toggle.description ? 'h-auto' : 'h-14 md:h-auto md:cursor-auto cursor-pointer'}`}>
                                                    <h1 className="text-base sm:text-lg font-semibold mb-1.5 leading-snug">{ videoData?.video?.title }</h1>
                                                    <p className={`${!toggle.description && 'truncate'} text-xs mb-3 flex items-center gap-3 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}> 
                                                        <span className='inline-flex items-center gap-1.5'>
                                                            <FontAwesomeIcon icon={faEye} className='text-xs'/>
                                                            {videoData?.video?.views?.length || 0} view{(videoData?.video?.views?.length || 0) !== 1 ? 's' : ''}
                                                        </span>
                                                        <span>&bull;</span>
                                                        <span>{ formatToPhilippineTime(videoData?.video?.createdAt) }</span>
                                                    </p>
                                                    <div className={`w-full leading-relaxed mt-2 mb-2 whitespace-pre-wrap text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                                                        { videoData?.video?.description ?? 'No Description' }
                                                    </div>

                                                    <div className={`flex flex-col gap-3 mt-4 pt-4 border-t md:block ${toggle.description ? 'block' : 'hidden'}`} style={{ borderColor: theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}>
                                                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 py-1'>
                                                            <span className={`font-medium text-xs whitespace-nowrap uppercase tracking-wide ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Author/Artist:</span> 
                                                            <div className='flex flex-wrap gap-1.5'>
                                                                {
                                                                    videoData?.video?.owner?.map((item, i) => {
                                                                        return (
                                                                            <span
                                                                                key={i}
                                                                                className={`cursor-pointer px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                                                    theme === "light"
                                                                                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                                                        : "bg-blue-900/40 text-blue-300 hover:bg-blue-900/60"
                                                                                }`}
                                                                            >
                                                                                @{item.name}
                                                                            </span>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </div>

                                                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 py-1'>
                                                            <span className={`font-medium text-xs whitespace-nowrap uppercase tracking-wide ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Category:</span> 
                                                            <div className='flex flex-wrap gap-1.5'>
                                                                {
                                                                    videoData?.video?.category?.map((item, i) => {
                                                                        return (
                                                                            <span
                                                                                key={i}
                                                                                className={`cursor-pointer px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                                                    theme === "light"
                                                                                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                                                        : "bg-blue-900/40 text-blue-300 hover:bg-blue-900/60"
                                                                                }`}
                                                                            >
                                                                                {item.name}
                                                                            </span>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </div>

                                                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 py-1'>
                                                            <span className={`font-medium text-xs whitespace-nowrap uppercase tracking-wide ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Tags:</span> 
                                                            <div className='flex flex-wrap gap-1.5'>
                                                                {
                                                                    videoData?.video?.tags?.map((item, i) => {
                                                                        return (
                                                                            <span
                                                                                key={i}
                                                                                className={`cursor-pointer px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                                                    theme === "light"
                                                                                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                                                        : "bg-blue-900/40 text-blue-300 hover:bg-blue-900/60"
                                                                                }`}
                                                                            >
                                                                                #{item.name}
                                                                            </span>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {toggle.description ? (
                                                    <p onClick={(e) => {
                                                        e.stopPropagation();
                                                        setToggle({...toggle, description: false})
                                                        }} className={`sm:hidden block text-xs mt-3 text-center font-medium ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'} cursor-pointer`}>Show Less</p>
                                                    ) : (
                                                        <p onClick={(e) => {
                                                            e.stopPropagation();
                                                            expandDescription();
                                                        }} className={`sm:hidden block text-xs mt-3 text-center font-medium ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'} cursor-pointer`}>Show More</p>
                                                    )}
                                                </div>
                                            </div>
                                        }
                                    </div>

                                    <div className={`rounded-xl p-5 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                        <h2 className="text-base font-semibold mb-4">Recommendations</h2>

                                        <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-4'>
                                            {loading ? (
                                                [...Array(8)].map((_, i) => (
                                                    <div key={i} className='flex flex-col gap-2'>
                                                        <div className={`w-full aspect-[3/4] rounded-lg animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-full h-4 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-2/3 h-3 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    </div>
                                                ))
                                            ) : (
                                            <>
                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Movie'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Anime'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Anime'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Movie'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Movie'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Anime'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Anime'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Movie'
                                                }}
                                                theme={theme}
                                            />
                                            </>
                                            )}
                                        </div>
                                    </div>

                                </div>
                                <div className='lg:col-span-1 flex flex-col gap-4'>
                                    {
                                        loading ? (
                                            <div className={`rounded-xl p-4 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                                <div className='mb-3 pb-3 border-b' style={{ borderColor: theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
                                                    <div className={`w-32 h-4 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    <div className={`w-full mt-2 h-3 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                </div>
                                                <div className='flex flex-col gap-2'>
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <div key={i} className='flex items-start gap-2.5 p-2'>
                                                            <div className={`w-32 h-20 flex-shrink-0 rounded-lg animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                            <div className='flex flex-col gap-1.5 flex-1 min-w-0'>
                                                                <div className={`w-full h-3.5 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                                <div className={`w-16 h-3 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : ((Object.keys(videoList).length > 0 || true) ? (
                                            <div className={`watch-content-loaded rounded-xl p-4 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                                <div className='mb-3 pb-3 border-b' style={{ borderColor: theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
                                                    <h3 className="text-sm font-semibold mb-1">{ videoList?.group_name || 'Playlist' }</h3>
                                                    {(videoList?.description || 'Sample playlist description for demonstration purposes') && (
                                                        <p className={`text-xs line-clamp-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                            { videoList?.description || 'Sample playlist description for demonstration purposes' }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className='flex flex-col gap-1.5 max-h-[500px] overflow-y-auto custom-scroll'>
                                                    {
                                                        (videoList.videos && videoList.videos.length > 0 ? videoList.videos : [
                                                            { _id: 'placeholder-1', title: 'Sample Video Title 1', thumbnail: null, duration: 3600000, views: [], downloadUrl: true },
                                                            { _id: 'placeholder-2', title: 'Sample Video Title 2', thumbnail: null, duration: 2400000, views: [], downloadUrl: true },
                                                            { _id: 'placeholder-3', title: 'Sample Video Title 3', thumbnail: null, duration: 1800000, views: [], downloadUrl: true }
                                                        ]).map((item, i) => {
                                                            const isPlaceholder = item._id?.startsWith('placeholder-');
                                                            const Component = isPlaceholder ? 'div' : Link;
                                                            const linkProps = isPlaceholder ? {} : { to: `/watch/${item._id}` };
                                                            
                                                            return (
                                                                <Component key={i} {...linkProps} className={`w-full flex items-start gap-2.5 ${isPlaceholder ? 'cursor-default opacity-60' : 'cursor-pointer'} transition-colors rounded-lg p-2 ${
                                                                    id === item._id 
                                                                        ? (theme === 'light' ? 'bg-blue-50 border border-blue-200' : 'bg-[#2B2B2B] border border-[#3B3B3B]')
                                                                        : (theme === 'light' ? 'hover:bg-gray-50 border border-transparent' : 'hover:bg-[#272727] border border-transparent')
                                                                }`}>
                                                                    <div className={`bg-black rounded-lg overflow-hidden w-32 h-20 flex-shrink-0 relative border ${
                                                                        id === item._id 
                                                                            ? (theme === 'light' ? 'border-blue-300' : 'border-blue-600')
                                                                            : (theme === 'light' ? 'border-gray-200' : 'border-[#3B3B3B]')
                                                                    }`}>
                                                                        {
                                                                            id === item._id &&
                                                                                <div className='absolute inset-0 flex items-center justify-center bg-black/70 z-10'>
                                                                                    <span className='text-white text-xs font-medium'>Watching</span>
                                                                                </div>
                                                                        }

                                                                        {imageErrors[`thumbnail-${item?._id}`] || !item?.thumbnail ? (
                                                                            <div className={`w-full h-full flex items-center justify-center ${
                                                                                theme === 'light' 
                                                                                    ? 'bg-gray-100' 
                                                                                    : 'bg-[#2B2B2B]'
                                                                            }`}>
                                                                                <FontAwesomeIcon icon={faFilm} className={`text-lg ${
                                                                                    theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                                                                                }`} />
                                                                            </div>
                                                                        ) : (
                                                                            <img 
                                                                                src={item?.thumbnail} 
                                                                                alt="Video Thumbnail" 
                                                                                className='w-full h-full object-cover'
                                                                                onError={() => setImageErrors(prev => ({ ...prev, [`thumbnail-${item?._id}`]: true }))}
                                                                            />
                                                                        )}
                                                                        <div className='absolute top-1 right-1 rounded text-white bg-black/70 px-1 py-0.5' title={item.downloadUrl ? 'Video' : 'Embed'}>
                                                                            <FontAwesomeIcon icon={item.downloadUrl ? faFilm : faCode} className='text-xs' />
                                                                        </div>
                                                                        <div className='absolute bottom-1 right-1 rounded text-white bg-black/70 px-1 py-0.5'>
                                                                            <span className='text-xs'>{item.duration ? millisToTimeString(item.duration) : '00:00'}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className='flex flex-col min-w-0 flex-1 justify-center'>
                                                                        <p className='line-clamp-2 text-sm font-medium mb-1 leading-snug'>
                                                                            {item.title}
                                                                        </p>
                                                                        <p className={`text-xs flex items-center gap-1.5 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                            <FontAwesomeIcon icon={faEye} className='text-xs'/>
                                                                            {item.views?.length || 0} views
                                                                        </p>
                                                                    </div>
                                                                </Component>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </div> 
                                            ) : (
                                            <div className={`watch-content-loaded overflow-x-hidden rounded-md p-4 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                                <div className={`w-full h-5 animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`}></div>
                                                <div className={`w-48 mt-2 mb-8 h-5 animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`}></div>

                                                <div className='flex flex-col gap-3 max-h-[500px] overflow-y-auto'>
                                                    <div className='w-full flex items-start gap-3'>
                                                        <div className={`rounded-md overflow-hidden w-40 h-24 flex-shrink-0 relative border ${theme === 'light' ? light.border : dark.border}`}>
                                                            <div className={`w-full h-full animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`}></div>
                                                        </div>

                                                        <div className='flex flex-col min-w-0 flex-1'>
                                                            <div className={`w-32 mb-2 h-4 animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`}></div>
                                                            <div className={`w-16 h-3 animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div> 
                                            ))
                                    }

                                    <div className={`rounded-xl p-4 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                        <div className='flex justify-between items-center mb-3 pb-3 border-b' style={{ borderColor: theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
                                            <h3 className="text-sm font-semibold">Recent Anime</h3>
                                            <button className={`text-xs font-medium transition-colors ${
                                                theme === 'light'
                                                    ? 'text-blue-600 hover:text-blue-700'
                                                    : 'text-blue-400 hover:text-blue-300'
                                            }`}>
                                                View All
                                            </button>
                                        </div>
                                        
                                        <div className='flex flex-col gap-1.5'>
                                            <div className={`w-full flex items-start gap-2.5 cursor-pointer transition-colors rounded-lg p-2 ${
                                                theme === 'light' 
                                                    ? 'hover:bg-gray-50' 
                                                    : 'hover:bg-[#272727]'
                                            }`}>
                                                <div className={`w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden border ${theme === 'light' ? 'border-gray-200' : 'border-[#3B3B3B]'}`}>
                                                    {imageErrors['anime-1'] ? (
                                                        <div className={`w-full h-full flex items-center justify-center ${
                                                            theme === 'light' ? 'bg-gray-100' : 'bg-[#2B2B2B]'
                                                        }`}>
                                                            <FontAwesomeIcon icon={faFilm} className={`text-lg ${
                                                                theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                                                            }`} />
                                                        </div>
                                                    ) : (
                                                        <img 
                                                            className='w-full h-full object-cover'
                                                            src='https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg'
                                                            alt='Shangri-La Frontier'
                                                            onError={() => setImageErrors(prev => ({ ...prev, 'anime-1': true }))}
                                                        />
                                                    )}
                                                </div>
                                                <div className='flex-1 min-w-0 flex flex-col justify-center'>
                                                    <p className='line-clamp-2 text-sm font-medium mb-1 leading-snug'>
                                                        Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season
                                                    </p>
                                                    <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>2024 • 12 Episodes</p>
                                                </div>
                                            </div>

                                            <div className={`w-full flex items-start gap-2.5 cursor-pointer transition-colors rounded-lg p-2 ${
                                                theme === 'light' 
                                                    ? 'hover:bg-gray-50' 
                                                    : 'hover:bg-[#272727]'
                                            }`}>
                                                <div className={`w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden border ${theme === 'light' ? 'border-gray-200' : 'border-[#3B3B3B]'}`}>
                                                    {imageErrors['anime-2'] ? (
                                                        <div className={`w-full h-full flex items-center justify-center ${
                                                            theme === 'light' ? 'bg-gray-100' : 'bg-[#2B2B2B]'
                                                        }`}>
                                                            <FontAwesomeIcon icon={faFilm} className={`text-lg ${
                                                                theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                                                            }`} />
                                                        </div>
                                                    ) : (
                                                        <img 
                                                            className='w-full h-full object-cover'
                                                            src='https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg'
                                                            alt='Shangri-La Frontier'
                                                            onError={() => setImageErrors(prev => ({ ...prev, 'anime-2': true }))}
                                                        />
                                                    )}
                                                </div>
                                                <div className='flex-1 min-w-0 flex flex-col justify-center'>
                                                    <p className='line-clamp-2 text-sm font-medium mb-1 leading-snug'>
                                                        Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season
                                                    </p>
                                                    <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>2024 • 12 Episodes</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments Section - Moved to bottom on small devices */}
                                <div className='lg:col-span-2 order-last lg:order-none'>
                                    <div className={`rounded-xl p-5 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                        <h2 className="text-base font-semibold mb-4">Comments</h2>
                                        
                                        <div className={`flex flex-col gap-5`}>
                                            {loading ? (
                                                <>
                                                    <div className='flex gap-3'>
                                                        <div className={`w-10 h-10 rounded-full flex-shrink-0 animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className='flex-1 flex flex-col gap-2'>
                                                            <div className={`w-full h-10 rounded-lg animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                            <div className={`w-24 h-8 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        </div>
                                                    </div>
                                                    <div className={`w-24 h-5 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    <div className='flex flex-col gap-4'>
                                                        {[1, 2, 3].map((i) => (
                                                            <div key={i} className='flex gap-3'>
                                                                <div className={`w-10 h-10 rounded-full flex-shrink-0 animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                                <div className='flex-1 flex flex-col gap-2'>
                                                                    <div className={`w-32 h-4 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                                    <div className={`w-full h-3 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                                    <div className={`w-2/3 h-3 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="watch-content-loaded flex flex-col gap-5">
                                            <CommentField
                                                comment={comment}
                                                setComment={setComment}
                                                theme={theme}
                                            />
                                            
                                            <h2 className='text-sm font-semibold'>{data?.length ?? 0} Comment{data?.length > 1 && 's'}</h2>

                                            {
                                                data?.length > 0 &&
                                                    data.map((item, i) => {
                                                        return (
                                                        <Comments 
                                                            key={i}
                                                            theme={theme}
                                                            data={item}
                                                            handleSubmit={handleComment}
                                                            deleteComment={deleteComment}
                                                            onReport={handleReport}
                                                        />
                                                        )
                                                    })
                                            }
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
        </div>
    )
}

export default Watch