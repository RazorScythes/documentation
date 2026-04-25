
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSearch, faMoon, faSun, faUser, faGear, faRightFromBracket, faCircleHalfStroke, faGlobe, faWallet, faBriefcase, faGamepad, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { video_links } from "../../constants";
import { logout } from "../../actions/auth";
import { convertDriveImageLink } from '../Tools'
import { useDispatch, useSelector } from 'react-redux'
import { Menu, X } from "lucide-react";
import { main, dark, light } from "../../style";
import { io as socketIO } from 'socket.io-client';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, removeNotification, clearAll, addRealtimeNotification } from '../../actions/notification';
import NotificationDropdown from './NotificationDropdown';

import Logo from '../../assets/logo.png'
import Avatar from '../../assets/avatar.webp'

const socketUrl = import.meta.env.VITE_DEVELOPMENT == "true"
    ? `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`
    : import.meta.env.VITE_APP_BASE_URL

const profileMenuItems = [
    { href: '/account', icon: faUser, label: 'My Account' },
    { href: '/account/settings', icon: faGear, label: 'Settings' },
    { href: '/sites', icon: faGlobe, label: 'Sites' },
    { href: '/budget', icon: faWallet, label: 'Budget' },
    { href: '/portfolio', icon: faBriefcase, label: 'Portfolio' },
]

const searchableRoutes = {
    videos: 'Search Videos',
    movies: 'Search Movies',
    anime: 'Search Anime',
    games: 'Search Games',
    blogs: 'Search Blogs',
    projects: 'Search Projects',
}

const Navbar = ({ theme, setTheme }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    const tokenResult = useSelector((state) => state.settings.tokenResult)

    const [isActive, setIsActive] = useState(false)
    const [toggle, setToggle] = useState(false)
    const [open, setOpen] = useState({ search: false, notification: false })

    const [user, setUser] = useState()
    const [avatar, setAvatar] = useState()
    const [searchKey, setSearchKey] = useState('')

    const notificationState = useSelector((state) => state.notification)
    const { notifications, unreadCount, isLoading: notifLoading, page: notifPage, totalPages: notifTotalPages } = notificationState

    const socketRef = useRef(null)
    const mobileMenuRef = useRef(null)
    const profileRef = useRef(null)
    const notifRef = useRef(null)

    const isLight = theme === 'light'
    const firstPath = location.pathname.split('/')[1] || ''
    const searchPlaceholder = searchableRoutes[firstPath] || 'Search'

    const closeAll = () => {
        setIsActive(false)
        setToggle(false)
        setOpen({ search: false, notification: false })
    }

    const sign_out = () => {
        dispatch(logout())
        navigate('/login')
        setUser(null)
    }

    useEffect(() => {
        const handleStorage = () => {
            setAvatar(localStorage.getItem('avatar')?.replaceAll('"', ''))
            setUser(JSON.parse(localStorage.getItem('profile')))
        }
        handleStorage()
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    useEffect(() => {
        setAvatar(localStorage.getItem('avatar')?.replaceAll('"', ''))
        setUser(JSON.parse(localStorage.getItem('profile')))
    }, [tokenResult])

    useEffect(() => {
        if (!user) return

        dispatch(getNotifications({ page: 1, limit: 20 }))
        dispatch(getUnreadCount())

        const userId = user.result?._id || user._id
        if (!userId) return

        const socket = socketIO(socketUrl, { transports: ['websocket', 'polling'] })
        socketRef.current = socket

        socket.emit('join_chat', userId)

        socket.on('new_notification', (data) => {
            dispatch(addRealtimeNotification(data))
        })

        return () => {
            socket.off('new_notification')
            socket.disconnect()
            socketRef.current = null
        }
    }, [user?.result?._id || user?._id])

    useEffect(() => {
        closeAll()
    }, [location.pathname])

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') closeAll()
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    const handleMarkAsRead = useCallback((id) => {
        dispatch(markAsRead(id))
    }, [dispatch])

    const handleMarkAllAsRead = useCallback(() => {
        dispatch(markAllAsRead())
    }, [dispatch])

    const handleDeleteNotification = useCallback((id) => {
        dispatch(removeNotification(id))
    }, [dispatch])

    const handleClearAll = useCallback(() => {
        dispatch(clearAll())
    }, [dispatch])

    const handleLoadMore = useCallback(() => {
        if (notifPage < notifTotalPages && !notifLoading) {
            dispatch(getNotifications({ page: notifPage + 1, limit: 20 }))
        }
    }, [dispatch, notifPage, notifTotalPages, notifLoading])

    const handleSearch = (e) => {
        e.preventDefault()
        if (!searchKey.trim()) return

        const route = firstPath || 'videos'
        if (searchableRoutes[route]) {
            window.location.href = `/${route}/search/${searchKey}`
        } else {
            window.location.href = `/videos/search/${searchKey}`
        }
    }

    const changeTheme = () => {
        const next = (!theme || theme === 'dark') ? 'light' : 'dark'
        setTheme(next)
        localStorage.setItem('theme', next)
    }

    const isActiveLink = (path) => {
        if (path === '') return location.pathname === '/'
        return location.pathname.startsWith(`/${path}`)
    }

    const userName = user?.result?.username || user?.username || ''

    const linkClass = (path) => {
        const active = isActiveLink(path)
        if (isLight) {
            return active
                ? 'text-blue-600 font-semibold'
                : 'text-slate-600 hover:text-blue-600 font-medium'
        }
        return active
            ? 'text-blue-400 font-semibold'
            : 'text-gray-300 hover:text-blue-400 font-medium'
    }

    const mobileLinkClass = (path) => {
        const active = isActiveLink(path)
        if (isLight) {
            return active
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-blue-50/60 hover:text-blue-700'
        }
        return active
            ? 'bg-[#2B2B2B] text-blue-400 font-semibold'
            : 'text-gray-300 hover:bg-[#2B2B2B] hover:text-white'
    }

    const menuItemClass = isLight
        ? 'text-slate-700 hover:bg-blue-50/60 hover:text-blue-700'
        : 'text-gray-300 hover:bg-[#2B2B2B] hover:text-white'

    const notifBadge = (
        unreadCount > 0 && (
            <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5 border-2 ${isLight ? 'border-white' : 'border-[#0e0e0e]'}`}>
                {unreadCount > 99 ? '99+' : unreadCount}
            </span>
        )
    )

    const notifDropdownProps = {
        theme,
        notifications,
        unreadCount,
        isLoading: notifLoading,
        hasMore: notifPage < notifTotalPages,
        onClose: () => setOpen({ ...open, notification: false }),
        onMarkAsRead: handleMarkAsRead,
        onMarkAllAsRead: handleMarkAllAsRead,
        onDelete: handleDeleteNotification,
        onClearAll: handleClearAll,
        onLoadMore: handleLoadMore,
    }

    const ProfileMenu = ({ onItemClick }) => (
        <>
            {userName && (
                <div className={`px-4 py-3 border-b ${isLight ? 'border-blue-100' : 'border-[#2B2B2B]'}`}>
                    <div className="flex items-center gap-3">
                        <img
                            className="h-9 w-9 rounded-full object-cover bg-white"
                            src={avatar ? convertDriveImageLink(avatar) : Avatar}
                            alt=""
                        />
                        <div className="min-w-0">
                            <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>{userName}</p>
                            <p className={`text-xs truncate ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>View profile</p>
                        </div>
                    </div>
                </div>
            )}
            <ul className="list-none flex flex-col py-1">
                {profileMenuItems.map((item, i) => (
                    <li key={i}>
                        <a
                            href={item.href}
                            className={`flex items-center px-4 py-2.5 text-sm transition-all ${menuItemClass}`}
                            onClick={onItemClick}
                        >
                            <FontAwesomeIcon icon={item.icon} className="mr-3 w-4 text-xs opacity-70" />
                            {item.label}
                        </a>
                    </li>
                ))}
                <li className={`mx-3 my-1 border-t ${isLight ? 'border-blue-100' : 'border-[#2B2B2B]'}`} />
                <li className="px-4 py-2.5 flex items-center justify-between">
                    <span className={`flex items-center text-sm ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                        <FontAwesomeIcon icon={faCircleHalfStroke} className="mr-3 w-4 text-xs opacity-70" />
                        Theme
                    </span>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={theme === 'dark'}
                        aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
                        onClick={changeTheme}
                        className={`relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer rounded-full border transition-colors duration-200 focus:outline-none ${isLight ? 'border-blue-300 bg-blue-100' : 'border-gray-600 bg-gray-700'}`}
                    >
                        <span
                            className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-out"
                            style={{ transform: theme === 'dark' ? 'translateX(1rem)' : 'translateX(0.1rem)', marginTop: '1px' }}
                        />
                    </button>
                </li>
                <li className={`mx-3 my-1 border-t ${isLight ? 'border-blue-100' : 'border-[#2B2B2B]'}`} />
                <li>
                    <button
                        onClick={() => { sign_out(); onItemClick?.(); }}
                        className={`w-full flex items-center px-4 py-2.5 text-sm transition-all ${isLight ? 'text-rose-600 hover:bg-rose-50/60' : 'text-red-400 hover:bg-red-900/20 hover:text-red-300'}`}
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} className="mr-3 w-4 text-xs opacity-70" />
                        Logout
                    </button>
                </li>
            </ul>
        </>
    )

    return (
        <header className={`${main.font} w-full sticky top-0 z-50 border-b border-solid transition-all ${isLight ? 'bg-white/90 backdrop-blur-md border-blue-200/60 shadow-sm' : 'bg-[#0e0e0e]/90 backdrop-blur-md border-[#2B2B2B] shadow-lg'}`}>

            {/* Mobile menu backdrop */}
            {isActive && (
                <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setIsActive(false)} />
            )}

            {/* Mobile nav menu */}
            {isActive && (
                <div className={`absolute left-0 z-50 top-full w-full lg:hidden transition-all duration-200 ${isLight ? 'bg-white/95 backdrop-blur-md border-b border-blue-200/60 shadow-md' : 'bg-[#0e0e0e]/95 backdrop-blur-md border-b border-[#2B2B2B] shadow-lg'}`} ref={mobileMenuRef}>
                    <div className={`${main.container} py-2 px-4`}>
                        {video_links.map((link, i) => (
                            <a
                                key={i}
                                href={`/${link.path}`}
                                className={`block px-4 py-2.5 rounded-lg text-sm transition-all ${mobileLinkClass(link.path)}`}
                                onClick={() => setIsActive(false)}
                            >
                                {link.icon && <FontAwesomeIcon icon={link.icon} className="mr-3 w-4 text-xs opacity-60" />}
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Mobile search dropdown */}
            {open.search && (
                <div className={`absolute left-0 z-50 top-full w-full lg:hidden ${isLight ? 'bg-white/95 backdrop-blur-md border-b border-blue-200/60 shadow-md' : 'bg-[#0e0e0e]/95 backdrop-blur-md border-b border-[#2B2B2B] shadow-lg'}`}>
                    <div className={`${main.container} px-4 py-3`}>
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                    <FontAwesomeIcon icon={faSearch} className={`text-sm ${isLight ? 'text-blue-500' : 'text-gray-400'}`} />
                                </span>
                                <input
                                    value={searchKey}
                                    onChange={(e) => setSearchKey(e.target.value)}
                                    className={`block w-full rounded-lg py-2.5 px-4 pr-10 text-sm ${isLight ? light.input : dark.input}`}
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    autoFocus
                                />
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <nav className={`${main.container} h-14 sm:px-0 px-3 relative flex items-center justify-between z-50`}>
                {/* Left: Hamburger + Logo + Nav Links */}
                <div className="flex items-center gap-2 lg:gap-8">
                    <button
                        className={`lg:hidden flex items-center p-2 rounded-lg transition-all ${isLight ? 'text-slate-600 hover:bg-blue-50' : 'text-gray-300 hover:bg-[#2B2B2B]'}`}
                        onClick={() => {
                            setOpen({ search: false, notification: false })
                            setIsActive(!isActive)
                            setToggle(false)
                        }}
                        aria-label="Toggle menu"
                    >
                        {isActive ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <Link to="" className="flex items-center gap-2 flex-shrink-0">
                        <img className="h-8 w-8 rounded-full" src={Logo} alt="Logo" />
                        <span className={`${main.font_secondary} font-semibold text-lg hidden sm:block ${isLight ? 'text-slate-800' : 'text-white'}`}>
                            RazorScythe
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-1">
                        {video_links.map((link, i) => (
                            <a
                                key={i}
                                href={`/${link.path}`}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${linkClass(link.path)}`}
                            >
                                {link.icon && <FontAwesomeIcon icon={link.icon} className="mr-1.5 text-xs" />}
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Right: Search + Actions */}
                <div className="flex items-center gap-2">
                    {/* Desktop search */}
                    <form onSubmit={handleSearch} className="hidden lg:block">
                        <div className="relative">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <FontAwesomeIcon icon={faSearch} className={`text-xs ${isLight ? 'text-blue-500' : 'text-gray-400'}`} />
                            </span>
                            <input
                                value={searchKey}
                                onChange={(e) => setSearchKey(e.target.value)}
                                className={`block w-48 rounded-lg py-1.5 px-4 pr-9 text-sm ${isLight ? light.input : dark.input}`}
                                type="text"
                                placeholder={searchPlaceholder}
                            />
                        </div>
                    </form>

                    {/* Mobile search toggle */}
                    <button
                        className={`lg:hidden p-2 rounded-lg transition-all ${isLight ? 'text-slate-600 hover:bg-blue-50' : 'text-gray-300 hover:bg-[#2B2B2B]'}`}
                        onClick={() => {
                            setOpen({ search: !open.search, notification: false })
                            setIsActive(false)
                            setToggle(false)
                        }}
                        aria-label="Search"
                    >
                        <FontAwesomeIcon icon={faSearch} className="text-sm" />
                    </button>

                    {/* Desktop theme toggle */}
                    <button
                        className={`hidden lg:flex items-center p-2 rounded-lg transition-all ${isLight ? 'text-slate-500 hover:bg-blue-50 hover:text-blue-600' : 'text-gray-400 hover:bg-[#2B2B2B] hover:text-white'}`}
                        onClick={changeTheme}
                        aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
                    >
                        <FontAwesomeIcon icon={isLight ? faMoon : faSun} className="text-sm" />
                    </button>

                    {/* Notifications */}
                    {user && (
                        <div className="relative" ref={notifRef}>
                            <button
                                className={`p-2 rounded-lg relative transition-all ${isLight ? 'text-slate-600 hover:bg-blue-50 hover:text-blue-600' : 'text-gray-300 hover:bg-[#2B2B2B] hover:text-white'}`}
                                onClick={() => {
                                    setOpen({ search: false, notification: !open.notification })
                                    setIsActive(false)
                                    setToggle(false)
                                }}
                                aria-label="Notifications"
                            >
                                <FontAwesomeIcon icon={faBell} className="text-sm" />
                                {notifBadge}
                            </button>
                            {open.notification && (
                                <div className="fixed inset-0 z-40" onClick={() => setOpen({ ...open, notification: false })} />
                            )}
                            {open.notification && (
                                <div className="fixed sm:absolute inset-x-0 top-14 sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 flex justify-center sm:block z-50 p-3 sm:p-0">
                                    <NotificationDropdown {...notifDropdownProps} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile / Login */}
                    {user ? (
                        <div className="relative" ref={profileRef}>
                            <button
                                className="flex items-center"
                                onClick={() => {
                                    setToggle(!toggle)
                                    setIsActive(false)
                                    setOpen({ search: false, notification: false })
                                }}
                            >
                                <img
                                    className={`h-8 w-8 rounded-full cursor-pointer object-cover border bg-white transition-all ${isLight ? 'border-blue-200 hover:border-blue-400' : 'border-[#2B2B2B] hover:border-[#444]'}`}
                                    src={avatar ? convertDriveImageLink(avatar) : Avatar}
                                    alt="Profile"
                                />
                            </button>

                            {toggle && (
                                <div className="fixed inset-0 z-40" onClick={() => setToggle(false)} />
                            )}
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className={`${!toggle ? 'hidden' : 'flex'} flex-col absolute z-50 top-full mt-2 right-0 min-w-[220px] rounded-xl overflow-hidden shadow-xl border ${isLight ? 'bg-white border-blue-200/60' : 'bg-[#141414] border-[#2B2B2B]'}`}
                            >
                                <ProfileMenu onItemClick={() => setToggle(false)} />
                            </div>
                        </div>
                    ) : (
                        <a href="/login">
                            <button className={`${isLight ? light.button : dark.button} rounded-lg text-sm`}>
                                Login
                            </button>
                        </a>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default Navbar;
