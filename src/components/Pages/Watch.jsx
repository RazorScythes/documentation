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
import { getVideoById, getVideoList, getVideoComment, addVideoComment, updateVideoComment, deleteVideoComment, clearAlert } from '../../actions/watch';
import { uploadReport } from '../../actions/video';

import Poster from '../Custom/Poster';
import Notification from '../Custom/Notification';
import PlaylistModal from '../Custom/PlaylistModal';
import ReportModal from '../Custom/ReportModal';
import SideAlert from '../SideAlert';
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

    useEffect(() => {
        dispatch(getVideoById({ id, access_key }))
    }, [id, access_key])

    useEffect(() => {
        setVideoData(video);
        dispatch(getVideoComment({id}));
        dispatch(getVideoList({id}));
    }, [video])
    
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

    // Get sideAlert from video reducer for report modal
    const sideAlert = useSelector((state) => state.video?.sideAlert)
    
    // Load playlists from localStorage
    useEffect(() => {
        const savedPlaylists = localStorage.getItem('userPlaylists');
        if (savedPlaylists) {
            try {
                const playlists = JSON.parse(savedPlaylists);
                // Playlists are now available for use if needed
            } catch (e) {
                console.error('Error loading playlists:', e);
            }
        }
    }, [playlistModal]) // Reload when modal closes

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
        // Get or create "Watch Later" playlist
        const savedPlaylists = localStorage.getItem('userPlaylists');
        let playlists = savedPlaylists ? JSON.parse(savedPlaylists) : [];
        
        let watchLater = playlists.find(p => p.name.toLowerCase() === 'watch later');
        if (!watchLater) {
            watchLater = {
                id: Date.now().toString(),
                name: 'Watch Later',
                videos: [],
                createdAt: new Date().toISOString()
            };
            playlists.push(watchLater);
        }
        
        if (!watchLater.videos.includes(id)) {
            watchLater.videos.push(id);
            localStorage.setItem('userPlaylists', JSON.stringify(playlists));
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
    const [userPlaylists, setUserPlaylists] = useState([])

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
                                    <div className="relative w-full overflow-hidden pb-[56.25%] rounded-xl shadow-2xl border-2" style={{ borderColor: theme === 'light' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(30, 64, 175, 0.5)' }}>
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
                                    
                                    <div className={`rounded-xl p-4 sm:p-5 px-5 sm:px-7 shadow-lg ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border} backdrop-blur-sm relative`}>
                                        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                                            {loading ? (
                                                <>
                                                    <div className='flex items-center gap-3 sm:gap-4 flex-wrap'>
                                                        <div className={`rounded-full w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className='flex flex-col gap-2'>
                                                            <div className={`w-24 h-4 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                            <div className={`w-20 h-3 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        </div>
                                                        <div className={`w-20 h-9 rounded-full animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    </div>
                                                    <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
                                                        <div className={`w-24 h-9 rounded-full animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-20 h-9 rounded-full animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-20 h-9 rounded-full animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-8 h-9 rounded-full animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    </div>
                                                </>
                                            ) : (
                                            <>
                                            <div className='flex items-center gap-3 sm:gap-4 flex-wrap'>
                                                <div className='relative group flex-shrink-0'>
                                                    {imageErrors[`avatar-${videoData?.avatar}`] || !videoData?.avatar ? (
                                                        <div className={`rounded-full w-12 h-12 sm:w-14 sm:h-14 border-2 border-solid flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-md ${
                                                            theme === 'light' 
                                                                ? 'bg-gradient-to-br from-blue-100 to-sky-100 border-blue-400' 
                                                                : 'bg-gradient-to-br from-blue-900 to-blue-800 border-blue-500'
                                                        }`}>
                                                            <span className={`text-lg sm:text-xl font-bold ${
                                                                theme === 'light' ? 'text-blue-600' : 'text-blue-300'
                                                            }`}>
                                                                {videoData?.username ? videoData.username.charAt(0).toUpperCase() : 'U'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <img
                                                            className='rounded-full w-12 h-12 sm:w-14 sm:h-14 border-2 border-solid object-cover transition-transform duration-300 group-hover:scale-110 shadow-md'
                                                            style={{ borderColor: theme === 'light' ? '#3b82f6' : '#1e40af' }}
                                                        src={ videoData?.avatar }
                                                        alt="user profile"
                                                            onError={() => setImageErrors(prev => ({ ...prev, [`avatar-${videoData?.avatar}`]: true }))}
                                                    />
                                                    )}
                                                    <div className={`absolute inset-0 rounded-full ${theme === 'light' ? 'bg-blue-400/20' : 'bg-blue-600/20'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                                    </div>
                                                <div className='flex flex-col min-w-0 flex-1'>
                                                    <p className='break-words font-bold text-sm sm:text-base tracking-tight'>{ videoData?.username }</p>
                                                    <p className={`text-xs mt-0.5 font-medium ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>0 Subscriber</p>
                                                </div>
                                                <button className={`disabled:cursor-not-allowed rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0 ${
                                                    theme === 'light' 
                                                        ? 'bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white border border-blue-400/30' 
                                                        : 'bg-white hover:bg-blue-600 border border-white hover:border-blue-600 text-[#0e0e0e] hover:text-white'
                                                }`}>
                                                    Subscribe
                                                </button>
                                            </div>

                                            <div className='flex flex-wrap items-center justify-end gap-3 sm:gap-4'>
                                                {/* Group 1: Like/Dislike and Playlists */}
                                                <div className='flex items-center gap-2 sm:gap-2.5'>
                                                    <div className={`flex items-center rounded-full overflow-hidden shadow-md flex-shrink-0`}>
                                                        <button className={`disabled:cursor-not-allowed rounded-l-full px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-300 hover:scale-105 ${
                                                            theme === 'light'
                                                                ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white'
                                                                : 'bg-blue-600 text-white'
                                                        }`}>
                                                            <FontAwesomeIcon icon={faThumbsUp} className='mr-1 sm:mr-1.5 text-xs sm:text-sm'/>
                                                            <span className='text-xs font-medium hidden xs:inline'>Like</span>
                                                        </button>
                                                        <button className={`disabled:cursor-not-allowed rounded-r-full px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-300 hover:scale-105 ${
                                                            theme === 'light'
                                                                ? 'bg-white/80 hover:bg-blue-50 text-blue-700 border-l border-blue-200/60'
                                                                : 'bg-[#1C1C1C] hover:bg-blue-600 border-l border-[#2B2B2B] text-white hover:text-white'
                                                        }`}>
                                                            <FontAwesomeIcon icon={faThumbsDown} className='mr-0 sm:mr-1.5 text-xs sm:text-sm'/>
                                                    </button>
                                                    </div>
                                                    <button onClick={() => setPlaylistModal(true)} className={`rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex-shrink-0 ${
                                                        theme === 'light'
                                                            ? 'bg-white/80 hover:bg-gradient-to-r hover:from-blue-500 hover:to-sky-500 hover:text-white text-blue-700 border border-blue-200/60'
                                                            : 'bg-[#1C1C1C] hover:bg-blue-600 border border-[#1C1C1C] hover:border-blue-600 text-white hover:text-white'
                                                    }`}>
                                                        <FontAwesomeIcon icon={faListSquares} className='mr-1 sm:mr-1.5'/> <span className='hidden sm:inline'>Playlists</span>
                                                    </button>
                                                </div>
                                                
                                                {/* Group 2: Download and Ellipsis */}
                                                <div className='flex items-center gap-2 sm:gap-2.5'>
                                                    <button 
                                                        onClick={handleDownload}
                                                        disabled={!videoData?.video?.downloadUrl}
                                                        className={`${!videoData?.video?.downloadUrl ? 'disabled:cursor-not-allowed opacity-50' : ''} rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex-shrink-0 ${
                                                            theme === 'light'
                                                                ? 'bg-white/80 hover:bg-gradient-to-r hover:from-blue-500 hover:to-sky-500 hover:text-white text-blue-700 border border-blue-200/60'
                                                                : 'bg-[#1C1C1C] hover:bg-blue-600 border border-[#1C1C1C] hover:border-blue-600 text-white hover:text-white'
                                                        }`}
                                                    >
                                                        <FontAwesomeIcon icon={faDownload} className='mr-1 sm:mr-1.5'/> <span className='hidden sm:inline'>Download</span>
                                                </button>
                                                    <div className="relative flex-shrink-0" ref={dropdownRef}>
                                                    <button 
                                                        onClick={() => {
                                                            const newState = !dropdownOpen;
                                                            setDropdownOpen(newState);
                                                            
                                                            if (newState && dropdownRef.current) {
                                                                // Calculate position after state update
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
                                                        className={`rounded-full px-2.5 sm:px-3 py-2 sm:py-2.5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex-shrink-0 ${
                                                            theme === 'light'
                                                                ? 'bg-white/80 hover:bg-gradient-to-r hover:from-blue-500 hover:to-sky-500 hover:text-white text-blue-700 border border-blue-200/60'
                                                                : 'bg-[#1C1C1C] hover:bg-blue-600 border border-[#1C1C1C] hover:border-blue-600 text-white hover:text-white'
                                                        } ${dropdownOpen ? (theme === 'light' ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white' : 'bg-blue-600') : ''}`}
                                                    >
                                                    <FontAwesomeIcon icon={faEllipsisVertical} />
                                                </button>
                                                    
                                                    {/* Dropdown Menu - Using Portal to escape stacking context */}
                                                    {dropdownOpen && createPortal(
                                                        <div 
                                                            data-dropdown-menu
                                                            className={`fixed w-48 sm:w-56 rounded-lg shadow-xl border z-[9999] max-h-[80vh] overflow-y-auto ${
                                                                theme === 'light' 
                                                                    ? 'bg-white border-blue-200/60' 
                                                                    : 'bg-[#1C1C1C] border-gray-700'
                                                            }`}
                                                            style={{
                                                                top: `${dropdownPosition.top}px`,
                                                                right: `${dropdownPosition.right}px`
                                                            }}
                                                            >
                                                            <div className="py-1">
                                                                <button
                                                                    onClick={handleShare}
                                                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                                                                        theme === 'light'
                                                                            ? 'hover:bg-blue-50 text-gray-700'
                                                                            : 'hover:bg-gray-800 text-gray-200'
                                                                    }`}
                                                                >
                                                                    <FontAwesomeIcon icon={faShare} className="text-xs w-4" />
                                                                    <span>Share</span>
                                                                </button>
                                                                
                                                                <button
                                                                    onClick={handleCopyLink}
                                                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                                                                        theme === 'light'
                                                                            ? 'hover:bg-blue-50 text-gray-700'
                                                                            : 'hover:bg-gray-800 text-gray-200'
                                                                    }`}
                                                                >
                                                                    <FontAwesomeIcon icon={faLink} className="text-xs w-4" />
                                                                    <span>Copy Link</span>
                                                                </button>
                                                                
                                                                <button
                                                                    onClick={handleSaveToWatchLater}
                                                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                                                                        theme === 'light'
                                                                            ? 'hover:bg-blue-50 text-gray-700'
                                                                            : 'hover:bg-gray-800 text-gray-200'
                                                                    }`}
                                                                >
                                                                    <FontAwesomeIcon icon={faBookmark} className="text-xs w-4" />
                                                                    <span>Save to Watch Later</span>
                                                                </button>
                                                                
                                                                <div className={`border-t my-1 ${
                                                                    theme === 'light' ? 'border-blue-200/60' : 'border-gray-700'
                                                                }`}></div>
                                                                
                                                                <button
                                                                    onClick={handleReport}
                                                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                                                                        theme === 'light'
                                                                            ? 'hover:bg-red-50 text-red-600'
                                                                            : 'hover:bg-red-900/20 text-red-400'
                                                                    }`}
                                                                >
                                                                    <FontAwesomeIcon icon={faFlag} className="text-xs w-4" />
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

                                    <div className={`relative z-10 rounded-xl p-6 px-8 shadow-lg ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border} backdrop-blur-sm`}>
                                        {
                                            loading ?
                                                <div className='w-full flex flex-col items-start transition-all gap-3 relative overflow-x-hidden'>
                                                    <div className={`w-3/4 max-w-md h-6 animate-pulse rounded ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    <div className={`w-full max-w-sm h-4 animate-pulse rounded ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    <div className='mt-4 flex flex-col gap-2 w-full'>
                                                        <div className={`w-full h-4 animate-pulse rounded ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-full h-4 animate-pulse rounded ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-4/5 h-4 animate-pulse rounded ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    </div>
                                                </div> 
                                            :   
                                            <div className="watch-content-loaded w-full flex flex-col transition-all">
                                                <div onClick={() => expandDescription()} className={`flex-1 overflow-hidden ${toggle.description ? 'h-auto' : 'h-14 md:h-auto md:cursor-auto cursor-pointer'}`}>
                                                    <h1 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-3 tracking-tight leading-tight"> { videoData?.video?.title } </h1>
                                                    <p className={`${!toggle.description && 'truncate'} text-xs lg:text-sm mb-3 lg:mb-4 font-medium ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}> 
                                                        <span className='inline-flex items-center gap-1.5'>
                                                            <FontAwesomeIcon icon={faEye} className='text-xs'/>
                                                            { formatToPhilippineTime(videoData?.video?.createdAt) }
                                                        </span>
                                                    </p>
                                                    <div className={`w-full leading-6 lg:leading-7 mt-3 mb-3 lg:mt-4 lg:mb-4 whitespace-pre-wrap ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'} text-sm`}>
                                                        { videoData?.video?.description ?? 'No Description' }
                                                    </div>

                                                    <div className={`flex flex-col gap-2.5 lg:gap-4 mt-4 pt-4 lg:mt-6 lg:pt-6 border-t md:block ${toggle.description ? 'block' : 'hidden'}`} style={{ borderColor: theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)' }}>
                                                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3 lg:py-2'>
                                                            <span className='font-semibold text-xs whitespace-nowrap uppercase tracking-wide' style={{ color: theme === 'light' ? '#3b82f6' : '#60a5fa' }}>Author/Artist:</span> 
                                                            <div className='flex flex-wrap gap-1.5 lg:gap-2.5'>
                                                                {
                                                                    videoData?.video?.owner?.map((item, i) => {
                                                                        return (
                                                                            <span
                                                                                key={i}
                                                                                className={`cursor-pointer px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 ${
                                                                                    theme === "light"
                                                                                        ? "bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white"
                                                                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                                                                }`}
                                                                            >
                                                                                @{item.name}
                                                                            </span>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </div>

                                                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3 lg:py-2'>
                                                            <span className='font-semibold text-xs whitespace-nowrap uppercase tracking-wide' style={{ color: theme === 'light' ? '#3b82f6' : '#60a5fa' }}>Category:</span> 
                                                            <div className='flex flex-wrap gap-1.5 lg:gap-2.5'>
                                                                {
                                                                    videoData?.video?.category?.map((item, i) => {
                                                                        return (
                                                                            <span
                                                                                key={i}
                                                                                className={`cursor-pointer px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 ${
                                                                                    theme === "light"
                                                                                        ? "bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white"
                                                                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                                                                }`}
                                                                            >
                                                                                {item.name}
                                                                            </span>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </div>

                                                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3 lg:py-2'>
                                                            <span className='font-semibold text-xs whitespace-nowrap uppercase tracking-wide' style={{ color: theme === 'light' ? '#3b82f6' : '#60a5fa' }}>Tags:</span> 
                                                            <div className='flex flex-wrap gap-1.5 lg:gap-2.5'>
                                                                {
                                                                    videoData?.video?.tags?.map((item, i) => {
                                                                        return (
                                                                            <span
                                                                                key={i}
                                                                                className={`cursor-pointer px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 ${
                                                                                    theme === "light"
                                                                                        ? "bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white"
                                                                                        : "bg-blue-600 hover:bg-blue-700 text-white"
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
                                                        }} className={`sm:hidden block text-xs mt-4 text-center font-semibold ${theme === 'light' ? light.link : dark.link} cursor-pointer`}>Show Less</p>
                                                    ) : (
                                                        <p onClick={(e) => {
                                                            e.stopPropagation();
                                                            expandDescription();
                                                        }} className={`sm:hidden block text-xs mt-4 text-center font-semibold ${theme === 'light' ? light.link : dark.link} cursor-pointer`}>Show More</p>
                                                    )}
                                                </div>
                                            </div>
                                        }
                                    </div>

                                    <div className={`rounded-xl p-6 px-8 shadow-lg ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border} backdrop-blur-sm`}>
                                        <div className='flex items-center gap-3 mb-6'>
                                            <div className={`w-1 h-8 rounded-full ${theme === 'light' ? 'bg-gradient-to-b from-blue-500 to-sky-500' : 'bg-gradient-to-b from-blue-600 to-blue-400'}`}></div>
                                            <h1 className="text-2xl font-bold tracking-tight">Recommendations</h1>
                                        </div>

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
                                            <div className={`rounded-xl p-5 sm:p-6 shadow-lg ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border} backdrop-blur-sm`}>
                                                <div className='mb-4 pb-4 border-b' style={{ borderColor: theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)' }}>
                                                    <div className='flex items-center gap-3 mb-2'>
                                                        <div className={`w-10 h-10 rounded-lg animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                        <div className={`w-32 h-5 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                    </div>
                                                    <div className={`w-full ml-0 mt-2 h-4 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                </div>
                                                <div className='flex flex-col gap-2.5'>
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <div key={i} className='flex items-start gap-3 p-2.5'>
                                                            <div className={`w-36 sm:w-40 h-20 sm:h-24 flex-shrink-0 rounded-lg animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                            <div className='flex flex-col gap-2 flex-1 min-w-0'>
                                                                <div className={`w-full h-4 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                                <div className={`w-16 h-3 rounded animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : ((Object.keys(videoList).length > 0 || true) ? (
                                            <div className={`watch-content-loaded rounded-xl p-5 sm:p-6 shadow-lg ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border} backdrop-blur-sm`}>
                                                {/* Header Section */}
                                                <div className='mb-4 pb-4 border-b' style={{ borderColor: theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)' }}>
                                                    <div className='flex items-center gap-3 mb-2'>
                                                        <div className={`p-2 rounded-lg ${
                                                            theme === 'light' 
                                                                ? 'bg-blue-100/50' 
                                                                : 'bg-blue-900/30'
                                                        }`}>
                                                            <FontAwesomeIcon icon={faListSquares} className={`text-lg ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                                                        </div>
                                                        <h1 className="text-lg sm:text-xl font-bold tracking-tight">{ videoList?.group_name || 'Playlist' }</h1>
                                                    </div>
                                                    {(videoList?.description || 'Sample playlist description for demonstration purposes') && (
                                                        <p className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ml-11 ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                                                            { videoList?.description || 'Sample playlist description for demonstration purposes' }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Video List */}
                                                <div className='flex flex-col gap-2.5 max-h-[500px] overflow-y-auto custom-scroll'>
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
                                                                <Component key={i} {...linkProps} className={`w-full flex items-start gap-3 ${isPlaceholder ? 'cursor-default opacity-60' : 'cursor-pointer'} transition-all duration-300 rounded-lg p-2.5 ${
                                                                    id === item._id 
                                                                        ? (theme === 'light' ? 'bg-blue-100/70 border border-blue-300' : 'bg-gray-800/70 border border-blue-500/50')
                                                                        : (theme === 'light' ? 'hover:bg-blue-50/50 border border-transparent' : 'hover:bg-gray-800/50 border border-transparent')
                                                                }`}>
                                                                    <div className={`bg-black rounded-lg overflow-hidden w-36 sm:w-40 h-20 sm:h-24 flex-shrink-0 relative border-2 shadow-md transition-transform duration-300 hover:scale-105 ${
                                                                        id === item._id 
                                                                            ? (theme === 'light' ? 'border-blue-500 shadow-blue-200' : 'border-blue-400 shadow-blue-900/50')
                                                                            : (theme === 'light' ? light.border : dark.border)
                                                                    }`}>
                                                                        {
                                                                            id === item._id &&
                                                                                <div style={{backgroundColor: 'rgba(0, 0, 0, 0.85)'}} className='w-full text-white text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-xs py-1.5 font-bold rounded'>
                                                                                    Watching
                                                                                </div>
                                                                        }

                                                                        {imageErrors[`thumbnail-${item?._id}`] || !item?.thumbnail ? (
                                                                            <div className={`w-full h-full flex items-center justify-center ${
                                                                                theme === 'light' 
                                                                                    ? 'bg-gradient-to-br from-blue-100 to-sky-100' 
                                                                                    : 'bg-gradient-to-br from-gray-800 to-gray-900'
                                                                            }`}>
                                                                                <FontAwesomeIcon icon={faFilm} className={`text-xl sm:text-2xl ${
                                                                                    theme === 'light' ? 'text-blue-400' : 'text-gray-500'
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
                                                                        <div className='absolute top-1 right-1 rounded text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-solid border-blue-500 shadow-md' title={item.downloadUrl ? 'Video' : 'Embed'}>
                                                                            <p className='font-semibold p-0.5 px-1.5 text-xs'><FontAwesomeIcon icon={item.downloadUrl ? faFilm : faCode} /></p>
                                                                        </div>
                                                                        <div className='absolute bottom-1 right-1 rounded text-white bg-gradient-to-r from-gray-900/90 to-black/90 border border-solid border-gray-700 shadow-md'>
                                                                            <p className='p-0.5 px-1.5 text-xs font-medium'>{item.duration ? millisToTimeString(item.duration) : '00:00'}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className='flex flex-col min-w-0 flex-1 justify-center'>
                                                                        <p className='line-clamp-2 text-sm font-semibold mb-1 leading-snug'>
                                                                            {item.title}
                                                                        </p>
                                                                        <p className={`text-xs font-medium flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
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

                                    <div className={`rounded-xl p-5 sm:p-6 shadow-lg ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border} backdrop-blur-sm`}>
                                        {/* Header Section */}
                                        <div className='mb-4 pb-4 border-b' style={{ borderColor: theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)' }}>
                                            <div className='flex justify-between items-center'>
                                                <div className='flex items-center gap-3'>
                                                    <div className={`p-2 rounded-lg ${
                                                        theme === 'light' 
                                                            ? 'bg-blue-100/50' 
                                                            : 'bg-blue-900/30'
                                                    }`}>
                                                        <FontAwesomeIcon icon={faFilm} className={`text-lg ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                                                    </div>
                                                    <h1 className="text-lg sm:text-xl font-bold tracking-tight">Recent Anime</h1>
                                                </div>
                                                <button className={`rounded-md px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                                                    theme === 'light'
                                                        ? 'text-blue-600 hover:text-blue-700 hover:underline bg-white/60 hover:bg-blue-50/80'
                                                        : 'text-white hover:text-blue-400 hover:underline bg-[#1C1C1C] hover:bg-[#2B2B2B]'
                                                }`}>
                                                View All
                                            </button>
                                            </div>
                                        </div>
                                        
                                        {/* Anime List */}
                                        <div className='flex flex-col gap-2.5'>
                                            <div className={`w-full flex items-start gap-3 cursor-pointer transition-all duration-300 rounded-lg p-2.5 ${
                                                theme === 'light' 
                                                    ? 'hover:bg-blue-50/50 border border-transparent hover:border-blue-200' 
                                                    : 'hover:bg-gray-800/50 border border-transparent hover:border-gray-700'
                                            }`}>
                                                <div className="w-16 sm:w-20 h-24 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                                                    {imageErrors['anime-1'] ? (
                                                        <div className={`w-full h-full flex items-center justify-center border-2 border-solid ${
                                                            theme === 'light' 
                                                                ? 'bg-gradient-to-br from-blue-100 to-sky-100 border-blue-200' 
                                                                : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                                                        }`}>
                                                            <FontAwesomeIcon icon={faFilm} className={`text-lg sm:text-xl ${
                                                                theme === 'light' ? 'text-blue-400' : 'text-gray-500'
                                                            }`} />
                                                        </div>
                                                    ) : (
                                                        <img 
                                                            className={`w-full h-full object-cover transition-transform duration-300 hover:scale-110 border-2 border-solid ${theme === 'light' ? light.border : dark.semiborder}`}
                                                        src='https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg'
                                                        alt='Shangri-La Frontier'
                                                            onError={() => setImageErrors(prev => ({ ...prev, 'anime-1': true }))}
                                                    />
                                                    )}
                                                </div>
                                                <div className='flex-1 min-w-0 flex flex-col justify-center'>
                                                    <p className='line-clamp-2 text-sm font-semibold mb-1.5 leading-snug'>
                                                        Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season
                                                    </p>
                                                    <p className={`text-xs font-medium ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>2024 • 12 Episodes</p>
                                                </div>
                                            </div>

                                            <div className={`w-full flex items-start gap-3 cursor-pointer transition-all duration-300 rounded-lg p-2.5 ${
                                                theme === 'light' 
                                                    ? 'hover:bg-blue-50/50 border border-transparent hover:border-blue-200' 
                                                    : 'hover:bg-gray-800/50 border border-transparent hover:border-gray-700'
                                            }`}>
                                                <div className="w-16 sm:w-20 h-24 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                                                    {imageErrors['anime-2'] ? (
                                                        <div className={`w-full h-full flex items-center justify-center border-2 border-solid ${
                                                            theme === 'light' 
                                                                ? 'bg-gradient-to-br from-blue-100 to-sky-100 border-blue-200' 
                                                                : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                                                        }`}>
                                                            <FontAwesomeIcon icon={faFilm} className={`text-lg sm:text-xl ${
                                                                theme === 'light' ? 'text-blue-400' : 'text-gray-500'
                                                            }`} />
                                                        </div>
                                                    ) : (
                                                        <img 
                                                            className={`w-full h-full object-cover transition-transform duration-300 hover:scale-110 border-2 border-solid ${theme === 'light' ? light.border : dark.semiborder}`}
                                                        src='https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg'
                                                        alt='Shangri-La Frontier'
                                                            onError={() => setImageErrors(prev => ({ ...prev, 'anime-2': true }))}
                                                    />
                                                    )}
                                                </div>
                                                <div className='flex-1 min-w-0 flex flex-col justify-center'>
                                                    <p className='line-clamp-2 text-sm font-semibold mb-1.5 leading-snug'>
                                                        Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season
                                                    </p>
                                                    <p className={`text-xs font-medium ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>2024 • 12 Episodes</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments Section - Moved to bottom on small devices */}
                                <div className='lg:col-span-2 order-last lg:order-none'>
                                    <div className={`rounded-xl p-6 px-8 shadow-lg ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border} backdrop-blur-sm`}>
                                        <div className='flex items-center gap-3 mb-6'>
                                            <div className={`w-1 h-8 rounded-full ${theme === 'light' ? 'bg-gradient-to-b from-blue-500 to-sky-500' : 'bg-gradient-to-b from-blue-600 to-blue-400'}`}></div>
                                            <h1 className="text-2xl font-bold tracking-tight">Comments</h1>
                                        </div>
                                        
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
                                            
                                            <h2 className='text-lg font-semibold'>{data?.length ?? 0} Comment{data?.length > 1 && 's'}</h2>

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
                sideAlert={sideAlert}
                setReportId={setReportId}
            />

            {/* Side Alert for Report */}
            {sideAlert && (
                <SideAlert
                    heading={sideAlert.heading}
                    paragraph={sideAlert.paragraph}
                    active={sideAlert.active}
                    setActive={(active) => {
                        if (!active) {
                            setReportModal(false);
                        }
                    }}
                />
            )}
        </div>
    )
}

export default Watch