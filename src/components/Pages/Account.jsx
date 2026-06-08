import React, { useEffect, useState, useMemo } from 'react'
import { main, dark, light } from '../../style';

import Avatar from '../Custom/Avatar';
import styles from "../../style";
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronDown, faChevronUp, faCog, faGlobe, faHeart, faHome, faListSquares,
    faMessage, faPlayCircle, faUserEdit, faUsers, faCircleCheck, faArrowRight,
    faDatabase, faShieldHalved, faChevronRight, faBars, faTimes, faWallet,
    faBell, faVideo, faLock, faDesktop, faClock, faGamepad, faDiagramProject
} from '@fortawesome/free-solid-svg-icons';
import * as api from '../../endpoint';

import Overview from './Account/Overview';
import Profile from './Account/Profile';
import Videos from './Account/Videos';
import Playlist from './Account/Playlist';
import Favorites from './Account/Favorites';
import Messages from './Account/Messages'; 
import Settings from './Account/Settings';
import Reports from './Account/Reports';
import Groups from './Account/Groups';
import Password from './Account/Password';
import Logs from './Account/Logs';
import Author from './Account/Author';
import Tags from './Account/Tags';
import Categories from './Account/Categories';
import ManageUsers from './Account/ManageUsers';
import BlobStorage from './Account/BlobStorage';
import MongoStorage from './Account/MongoStorage';

import Notification from '../Custom/Notification';

const RedirectOverview = () => {
    const navigate = useNavigate()
    useEffect(() => { navigate('/account', { replace: true }) }, [])
    return null
}

const Account = ({ user, theme }) => {
    const navigate  = useNavigate()
    const location = useLocation();
    const { page, subpage } = useParams();

    const [image, setImage] = useState('')
    const [profile, setProfile] = useState({})
    const [notification, setNotification] = useState({})
    const [show, setShow] = useState(false)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const [securityData, setSecurityData] = useState(null)
    const [lastSession, setLastSession] = useState(null)

    const isLight = theme === 'light'

    useEffect(() => {
        if (Object.keys(notification).length > 0) {
            setShow(true)
            const timer = setTimeout(() => setShow(false), 5000)
            return () => clearTimeout(timer)
        }
    }, [notification])

    const handleDismiss = (val) => {
        setShow(val)
        if (!val) setNotification({})
    }

    useEffect(() => {
        try {
            setImage(localStorage.getItem('avatar')?.replaceAll('"', ""))
            const stored = localStorage.getItem('profile')
            if (stored) setProfile(JSON.parse(stored))
        } catch (e) {
            console.warn('Failed to parse profile from localStorage', e)
        }

        const onStorage = (e) => {
            if (e.key === 'avatar') setImage(e.newValue?.replaceAll('"', '') || '')
            if (e.key === 'profile') {
                try { if (e.newValue) setProfile(JSON.parse(e.newValue)) }
                catch (_) {}
            }
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    useEffect(() => {
        const fetchSecurityInfo = async () => {
            try {
                const [completenessRes, twoFARes, sessionsRes] = await Promise.all([
                    api.getProfileCompleteness().catch(() => null),
                    api.get2FAStatus().catch(() => null),
                    api.getSessions().catch(() => null),
                ])
                const completeness = completenessRes?.data?.result
                const twoFA = twoFARes?.data?.result
                const sessions = sessionsRes?.data?.result

                let score = 0
                if (user?.verification?.verified) score += 25
                if (twoFA?.enabled) score += 25
                if (completeness?.percentage >= 80) score += 20
                else if (completeness?.percentage >= 50) score += 10
                const profileData = JSON.parse(localStorage.getItem('profile') || '{}')
                if (profileData?.social_links && Object.values(profileData.social_links || {}).some(v => !!v)) score += 15
                score += 15

                setSecurityData({ score, verified: !!user?.verification?.verified, twoFA: !!twoFA?.enabled, completeness: completeness?.percentage || 0 })

                if (sessions?.length > 0) {
                    const sorted = [...sessions].sort((a, b) => new Date(b.last_active) - new Date(a.last_active))
                    setLastSession(sorted[0])
                }
            } catch {}
        }
        if (user) fetchSecurityInfo()
    }, [user])

    useEffect(() => {
        setMobileSidebarOpen(false)
    }, [page, subpage])

    const menuItems = [
        { name: 'Overview', icon: faHome, path: '', dropdown: [] },
        { 
            name: 'Profile', 
            icon: faUserEdit, 
            path: 'profile', 
            dropdown: [
                { name: 'My Profile', path: 'profile' },
                { name: 'Change Password', path: 'profile/password' },
                { name: 'Activity Logs', path: 'profile/logs' },
            ] 
        },
        { 
            name: 'Videos', 
            icon: faPlayCircle, 
            path: 'videos', 
            dropdown: [
                { name: 'My Videos', path: 'videos' },
                { name: 'Groups', path: 'videos/groups' },
                { name: 'Reports', path: 'videos/reports' },
            ] 
        },
        { name: 'Playlists', icon: faListSquares, path: 'playlist', dropdown: [] },
        { 
            name: 'Global List', 
            icon: faGlobe, 
            path: 'globallist', 
            dropdown: [
                { name: 'Tags', path: 'globallist' },
                { name: 'Categories', path: 'globallist/categories' },
                { name: 'Author', path: 'globallist/author' },
            ] 
        },
        { name: 'Favorites', icon: faHeart, path: 'favorites', dropdown: [] },
        { name: 'Messages', icon: faMessage, path: 'messages', dropdown: [] },
        ...(['Admin', 'Moderator'].includes(user?.role) ? [{ name: 'Users', icon: faUsers, path: 'users', dropdown: [] }] : []),
        ...(['Admin'].includes(user?.role) ? [
            { name: 'Blob Storage', icon: faDatabase, path: 'storage', dropdown: [] },
            { name: 'MongoDB', icon: faDatabase, path: 'mongodb', dropdown: [] },
        ] : []),
        { name: 'Settings', icon: faCog, path: 'settings', dropdown: [] },
    ];
    
    const [openDropdown, setOpenDropdown] = useState(() => {
        const dropdownParents = ['profile', 'videos', 'globallist']
        return dropdownParents.find(p => p === page) || null
    }); 

    const toggleDropdown = (itemPath) => {
        setOpenDropdown(openDropdown === itemPath ? null : itemPath);
    };

    const activePage = (type) => {
        const relativePath = location.pathname;
        if(subpage) {
            return (relativePath.includes(type) && type !== '')
        }
        return (relativePath.includes(type)) && ((page === undefined && type === '') || page === type)
    }

    const activeSubPage = (main, type) => {
        const currentPath = `${main}${subpage ? `/${subpage}` : ''}`
        if (type === main && !subpage) return true
        if (type === currentPath) return true
        return false
    }

    const redirect = (path) => {
        navigate(`/account/${path}`)
    }

    const roleBadge = {
        Admin: isLight ? 'bg-red-100 text-red-600 border-red-200' : 'bg-red-900/30 text-red-400 border-red-800/50',
        Moderator: isLight ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-amber-900/30 text-amber-400 border-amber-800/50',
        User: isLight ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-blue-900/30 text-blue-400 border-blue-800/50',
    }

    const role = user?.role || 'User'
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

    const currentPageName = menuItems.find(item => {
        if (item.path === '' && !page) return true
        if (item.path === page) return true
        return false
    })?.name || 'Account'

    const breadcrumbs = useMemo(() => {
        const crumbs = [{ name: 'Account', path: '' }]
        if (page) {
            const parentItem = menuItems.find(m => m.path === page)
            if (parentItem) {
                crumbs.push({ name: parentItem.name, path: parentItem.path })
                if (subpage && parentItem.dropdown.length > 0) {
                    const subItem = parentItem.dropdown.find(d => d.path === `${page}/${subpage}`)
                    if (subItem) crumbs.push({ name: subItem.name, path: subItem.path })
                }
            }
        }
        return crumbs
    }, [page, subpage, menuItems])

    const quickActions = [
        { name: 'Edit Profile', icon: faUserEdit, path: 'profile' },
        { name: 'Password', icon: faLock, path: 'profile/password' },
        { name: 'Videos', icon: faVideo, path: 'videos' },
        { name: 'Games', icon: faGamepad, external: '/games/manage' },
        { name: 'Projects', icon: faDiagramProject, external: '/projects/manage' },
        { name: 'Budget', icon: faWallet, external: '/budget' },
        { name: 'Settings', icon: faCog, path: 'settings' },
    ]

    const securityScoreColor = (score) => {
        if (score >= 80) return { ring: 'text-emerald-500', bg: isLight ? 'bg-emerald-50' : 'bg-emerald-900/20', label: 'Strong' }
        if (score >= 50) return { ring: 'text-blue-500', bg: isLight ? 'bg-blue-50' : 'bg-blue-900/20', label: 'Good' }
        if (score >= 30) return { ring: 'text-amber-500', bg: isLight ? 'bg-amber-50' : 'bg-amber-900/20', label: 'Fair' }
        return { ring: 'text-red-500', bg: isLight ? 'bg-red-50' : 'bg-red-900/20', label: 'Weak' }
    }

    const timeAgo = (dateString) => {
        if (!dateString) return '—'
        const diffMs = Date.now() - new Date(dateString).getTime()
        const diffMin = Math.floor(diffMs / 60000)
        if (diffMin < 1) return 'Just now'
        if (diffMin < 60) return `${diffMin}m ago`
        const diffHr = Math.floor(diffMin / 60)
        if (diffHr < 24) return `${diffHr}h ago`
        const diffDay = Math.floor(diffHr / 24)
        if (diffDay < 30) return `${diffDay}d ago`
        return `${Math.floor(diffDay / 30)}mo ago`
    }

    return (
        <div className={`relative overflow-hidden ${main.font} ${isLight ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="relative px-0 my-12">

                        <Notification
                            theme={theme}
                            data={notification}
                            show={show}
                            setShow={handleDismiss}
                        />

                        {/* Profile Header */}
                        <div className={`rounded-2xl overflow-hidden border ${isLight ? 'border-slate-200/60 shadow-sm' : 'border-[#1C1C1C]'}`}>
                            <div className={`relative h-28 sm:h-32 ${isLight ? 'bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400' : 'bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700'}`}>
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                            </div>

                            <div className={`relative px-6 sm:px-8 pb-6 ${isLight ? 'bg-white/90 backdrop-blur-sm' : 'bg-[#0e0e0e]'}`}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 sm:-mt-12">
                                    <div className={`flex-shrink-0 rounded-full ring-[3px] ${isLight ? 'ring-white shadow-lg' : 'ring-[#0e0e0e]'}`}>
                                        <Avatar 
                                            theme={theme}
                                            image={image}
                                            size={28}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0 sm:pb-1 w-full">
                                        <div className="flex items-start sm:items-center justify-between flex-wrap gap-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h1 className={`text-lg font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                        {profile?.username || 'User'}
                                                    </h1>
                                                    {user?.verification?.verified && (
                                                        <FontAwesomeIcon icon={faCircleCheck} className="text-blue-500 text-sm" title="Verified" />
                                                    )}
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadge[role]}`}>
                                                        {role}
                                                    </span>
                                                </div>
                                                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                    {fullName || '—'} {profile?.email ? `· ${profile.email}` : ''}
                                                </p>
                                            </div>

                                            <div className={`flex items-center gap-4`}>
                                                {lastSession && (
                                                    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${isLight ? 'bg-slate-50 border border-slate-100' : 'bg-[#1a1a1a] border border-[#2B2B2B]'}`}>
                                                        <FontAwesomeIcon icon={faDesktop} className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                                                        <div>
                                                            <p className={`text-[10px] font-medium leading-tight ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{lastSession.device?.split(' ').slice(0, 2).join(' ') || 'Unknown'}</p>
                                                            <p className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{timeAgo(lastSession.last_active)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="text-center">
                                                    <p className={`text-lg font-bold leading-none ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                                        {user?.subscribers?.length || 0}
                                                    </p>
                                                    <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Subscribers</p>
                                                </div>
                                            </div>
                                        </div>

                                        {profile?.bio && (
                                            <pre className={`mt-2 text-sm whitespace-pre-wrap break-words font-[inherit] m-0 p-0 leading-relaxed line-clamp-2 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{profile.bio}</pre>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {quickActions.map(action => (
                                <button
                                    key={action.name}
                                    onClick={() => action.external ? navigate(action.external) : redirect(action.path)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                                        isLight
                                            ? 'bg-white border border-slate-200/60 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm'
                                            : 'bg-[#111] border border-[#1C1C1C] text-gray-400 hover:bg-blue-900/15 hover:text-blue-400 hover:border-blue-800/40'
                                    }`}
                                >
                                    <FontAwesomeIcon icon={action.icon} className="text-[10px]" />
                                    {action.name}
                                </button>
                            ))}
                        </div>


                        {/* Main Content */}
                        <div className="w-full md:flex items-start gap-5 mt-5">
                            {/* Mobile Sidebar Toggle */}
                            <button
                                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                                className={`md:hidden w-full flex items-center justify-between px-4 py-3 rounded-xl border mb-3 transition-all ${
                                    isLight
                                        ? 'bg-white/80 border-slate-200/60 text-slate-600 shadow-sm'
                                        : 'bg-[#111] border-[#1C1C1C] text-gray-400'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBars} className="text-xs" />
                                    <span className="text-sm font-medium">{currentPageName}</span>
                                </div>
                                <FontAwesomeIcon icon={mobileSidebarOpen ? faTimes : faChevronDown} className="text-[10px]" />
                            </button>

                            {/* Sidebar */}
                            <div className={`md:w-60 w-full flex-shrink-0 ${mobileSidebarOpen ? 'block' : 'hidden md:block'}`}>
                                <div className={`rounded-xl overflow-hidden border ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#111] border-[#1C1C1C]'}`}>
                                    <div className={`px-4 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#1C1C1C]'}`}>
                                        <p className={`text-[10px] font-semibold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Navigation</p>
                                    </div>
                                    <nav className="p-1.5">
                                        <ul className="space-y-0.5">
                                            {menuItems.map((item) => {
                                                const isActive = activePage(item.path)
                                                const hasDropdown = item.dropdown.length > 0
                                                const isOpen = openDropdown === item.path
                                                return (
                                                    <li key={item.path}>
                                                        <div
                                                            role="button"
                                                            tabIndex={0}
                                                            aria-expanded={hasDropdown ? isOpen : undefined}
                                                            className={`px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all duration-200 group ${
                                                                isActive
                                                                    ? (isLight
                                                                        ? 'bg-blue-50 text-blue-700'
                                                                        : 'bg-blue-600/15 text-blue-400')
                                                                    : (isLight
                                                                        ? 'text-slate-600 hover:bg-slate-50'
                                                                        : 'text-gray-400 hover:bg-[#1C1C1C]')
                                                            }`}
                                                            onClick={() => (hasDropdown ? toggleDropdown(item.path) : redirect(item.path))}
                                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hasDropdown ? toggleDropdown(item.path) : redirect(item.path) }}}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                                                                    isActive
                                                                        ? (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                                                                        : (isLight ? 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500' : 'bg-[#1C1C1C] text-gray-500 group-hover:bg-[#222] group-hover:text-gray-400')
                                                                }`}>
                                                                    <FontAwesomeIcon icon={item.icon} className="text-xs" />
                                                                </div>
                                                                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
                                                            </div>
                                                            {hasDropdown && (
                                                                <FontAwesomeIcon
                                                                    icon={isOpen ? faChevronUp : faChevronDown}
                                                                    className={`text-[10px] transition-transform duration-200 ${isActive ? '' : 'opacity-40'}`}
                                                                />
                                                            )}
                                                        </div>

                                                        <div
                                                            className="overflow-hidden transition-all duration-300 ease-in-out"
                                                            style={{ maxHeight: isOpen ? `${item.dropdown.length * 38}px` : '0px' }}
                                                        >
                                                            <ul className="ml-5 pl-3 py-1 space-y-0.5" style={{ borderLeft: `2px solid ${isLight ? '#e2e8f0' : '#1C1C1C'}` }}>
                                                                {item.dropdown.map((subItem) => {
                                                                    const isSubActive = activeSubPage(item.path, subItem.path)
                                                                    return (
                                                                        <li
                                                                            key={subItem.path}
                                                                            role="button"
                                                                            tabIndex={0}
                                                                            onClick={() => redirect(subItem.path)}
                                                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); redirect(subItem.path) }}}
                                                                            className={`px-3 py-2 rounded-md text-[13px] cursor-pointer transition-all duration-200 ${
                                                                                isSubActive
                                                                                    ? (isLight
                                                                                        ? 'text-blue-600 font-semibold bg-blue-50/60'
                                                                                        : 'text-blue-400 font-semibold bg-blue-600/10')
                                                                                    : (isLight
                                                                                        ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                                                                        : 'text-gray-500 hover:text-gray-300 hover:bg-[#1C1C1C]')
                                                                            }`}
                                                                        >
                                                                            {subItem.name}
                                                                        </li>
                                                                    )
                                                                })}
                                                            </ul>
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </nav>
                                </div>

                                {/* Security Score Widget */}
                                {securityData && (
                                    <div className={`mt-4 rounded-xl border overflow-hidden ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#111] border-[#1C1C1C]'}`}>
                                        <div className={`px-4 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#1C1C1C]'}`}>
                                            <p className={`text-[10px] font-semibold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Security</p>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="relative w-11 h-11">
                                                    <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                                                        <circle cx="18" cy="18" r="15" fill="none" className={isLight ? 'stroke-slate-100' : 'stroke-[#2B2B2B]'} strokeWidth="3" />
                                                        <circle cx="18" cy="18" r="15" fill="none" className={securityScoreColor(securityData.score).ring} strokeWidth="3" strokeDasharray={`${securityData.score * 0.942} 100`} strokeLinecap="round" style={{ stroke: 'currentColor' }} />
                                                    </svg>
                                                    <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{securityData.score}</span>
                                                </div>
                                                <div>
                                                    <p className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{securityScoreColor(securityData.score).label}</p>
                                                    <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Security Score</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${securityData.verified ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                    <span className={`text-[11px] ${securityData.verified ? (isLight ? 'text-slate-600' : 'text-gray-300') : (isLight ? 'text-slate-400' : 'text-gray-500')}`}>Email verified</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${securityData.twoFA ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                    <span className={`text-[11px] ${securityData.twoFA ? (isLight ? 'text-slate-600' : 'text-gray-300') : (isLight ? 'text-slate-400' : 'text-gray-500')}`}>2FA enabled</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${securityData.completeness >= 80 ? 'bg-emerald-500' : securityData.completeness >= 50 ? 'bg-amber-400' : 'bg-slate-300'}`} />
                                                    <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Profile {securityData.completeness}%</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => redirect('settings')}
                                                className={`mt-3 w-full text-center text-[11px] font-medium py-1.5 rounded-lg transition-all ${isLight ? 'bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600' : 'bg-[#1a1a1a] text-gray-500 hover:bg-blue-900/15 hover:text-blue-400'}`}
                                            >
                                                Improve Score
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className={`flex-1 min-w-0 mt-4 md:mt-0 rounded-xl border overflow-hidden ${
                                isLight
                                    ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm'
                                    : 'bg-[#111] border-[#1C1C1C]'
                            } ${isLight ? light.color : dark.color}`}>
                                {/* Breadcrumb */}
                                {breadcrumbs.length > 1 && (
                                    <div className={`px-4 sm:px-6 py-2.5 border-b ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#1C1C1C] bg-[#0e0e0e]'}`}>
                                        <nav className="flex items-center gap-1.5 text-[11px]" aria-label="Breadcrumb">
                                            {breadcrumbs.map((crumb, i) => (
                                                <React.Fragment key={crumb.path}>
                                                    {i > 0 && <FontAwesomeIcon icon={faChevronRight} className={`text-[8px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />}
                                                    {i === breadcrumbs.length - 1 ? (
                                                        <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{crumb.name}</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => redirect(crumb.path)}
                                                            className={`font-medium transition-colors ${isLight ? 'text-slate-400 hover:text-blue-600' : 'text-gray-500 hover:text-blue-400'}`}
                                                        >
                                                            {crumb.name}
                                                        </button>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </nav>
                                    </div>
                                )}
                                {   
                                    activePage('') ?
                                        <Overview user={user} theme={theme} />
                                    :
                                    activePage('profile') ? (
                                        activeSubPage('profile', 'profile') ?
                                            <Profile user={user} theme={theme} setNotification={setNotification} />
                                        : activeSubPage('profile', 'profile/password') ?
                                            <Password user={user} theme={theme} setNotification={setNotification} />
                                        : activeSubPage('profile', 'profile/logs') &&
                                            <Logs user={user} theme={theme} setNotification={setNotification} />
                                    )
                                    : activePage('videos') ? (
                                        activeSubPage('videos', 'videos') ?
                                            <Videos user={user} theme={theme} setNotification={setNotification} />
                                        : activeSubPage('videos', 'videos/groups') ?
                                            <Groups user={user} theme={theme} setNotification={setNotification} />
                                        : activeSubPage('videos', 'videos/reports') &&
                                            <Reports user={user} theme={theme} setNotification={setNotification} />
                                    )
                                    : activePage('globallist') ? (
                                        activeSubPage('globallist', 'globallist') ?
                                            <Tags user={user} theme={theme} setNotification={setNotification} />
                                        : activeSubPage('globallist', 'globallist/categories') ?
                                            <Categories user={user} theme={theme} setNotification={setNotification} />
                                        : activeSubPage('globallist', 'globallist/author') &&
                                            <Author user={user} theme={theme} setNotification={setNotification} />
                                    )
                                    : activePage('playlist') ?
                                        <Playlist user={user} theme={theme} setNotification={setNotification} />
                                    : activePage('favorites') ?
                                        <Favorites user={user} theme={theme} />
                                    : activePage('messages') ? 
                                        <Messages user={user} theme={theme} />
                                    : activePage('users') ?
                                        (['Admin', 'Moderator'].includes(user?.role) ?
                                            <ManageUsers user={user} theme={theme} setNotification={setNotification} />
                                        : <RedirectOverview />)
                                    : activePage('storage') ?
                                        (['Admin'].includes(user?.role) ?
                                            <BlobStorage user={user} theme={theme} setNotification={setNotification} />
                                        : <RedirectOverview />)
                                    : activePage('mongodb') ?
                                        (['Admin'].includes(user?.role) ?
                                            <MongoStorage user={user} theme={theme} />
                                        : <RedirectOverview />)
                                    : activePage('settings') ?
                                        <Settings user={user} theme={theme} setNotification={setNotification} />
                                    : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Account
