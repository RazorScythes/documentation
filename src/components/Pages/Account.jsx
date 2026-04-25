import React, { useEffect, useState } from 'react'
import { main, dark, light } from '../../style';

import Avatar from '../Custom/Avatar';
import styles from "../../style";
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faCog, faGlobe, faHeart, faHome, faListSquares, faMessage, faPlayCircle, faUserEdit, faUsers, faCircleCheck, faArrowRight } from '@fortawesome/free-solid-svg-icons';

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
    const [show, setShow] = useState(true)

    const isLight = theme === 'light'

    useEffect(() => {
        if(Object.keys(notification).length > 0) { 
            setShow(true) 
        }
    }, [notification])

    useEffect(() => {
        if(!show) { setNotification({}) }
    }, [show])

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
        { name: 'Settings', icon: faCog, path: 'settings', dropdown: [] },
    ];
    
    const [openDropdown, setOpenDropdown] = useState(null); 

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
        const relativePath = location.pathname;
        return relativePath.includes(type) && (subpage === undefined && type === `${main}${subpage ? `/${subpage}` : ''}`) || (`${main}/${subpage}`) === type || type === ''
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

    return (
        <div className={`relative overflow-hidden ${main.font} ${isLight ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="relative px-0 my-12">

                        <Notification
                            theme={theme}
                            data={notification}
                            show={show}
                            setShow={setShow}
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

                        {/* Main Content */}
                        <div className="w-full md:flex items-start gap-5 mt-5">
                            {/* Sidebar */}
                            <div className="md:w-60 w-full flex-shrink-0">
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
                            </div>

                            {/* Content Area */}
                            <div className={`flex-1 min-w-0 mt-4 md:mt-0 rounded-xl border overflow-hidden ${
                                isLight
                                    ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm'
                                    : 'bg-[#111] border-[#1C1C1C]'
                            } ${isLight ? light.color : dark.color}`}>
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
