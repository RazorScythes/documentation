import React, { useEffect, useState } from 'react'
import { main, dark, light } from '../../style';

import Avatar from '../Custom/Avatar';
import styles from "../../style";
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faCog, faGlobe, faHeart, faHome, faListSquares, faMessage, faPlayCircle, faUserEdit, faUsers, faCircleCheck, faShieldHalved } from '@fortawesome/free-solid-svg-icons';

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
        setImage(localStorage.getItem('avatar')?.replaceAll('"', ""))
        setProfile(JSON.parse(localStorage.getItem('profile')))
    }, [localStorage.getItem('avatar'), localStorage.getItem('profile')])

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
                        <div className={`mt-4 rounded-xl overflow-hidden border border-solid ${isLight ? 'border-blue-200/60' : 'border-[#2B2B2B]'} ${isLight ? 'bg-white/90 backdrop-blur-sm' : 'bg-[#0e0e0e]'}`}>
                            <div className={`h-20 ${isLight ? 'bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'}`} />

                            <div className="px-6 pb-5 -mt-8">
                                <div className="flex items-start gap-5">
                                    <div className={`flex-shrink-0 rounded-full ring-4 ${isLight ? 'ring-white' : 'ring-[#0e0e0e]'}`}>
                                        <Avatar 
                                            theme={theme}
                                            image={image}
                                            size={28}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0 pt-12">
                                        <div className="flex items-center justify-between flex-wrap gap-y-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h1 className={`text-sm font-semibold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
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
                                                    {fullName || '—'}
                                                </p>
                                            </div>

                                            <div className={`flex items-center gap-1.5 text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                                <span className={`font-bold text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                                    {user?.subscribers?.length || 0}
                                                </span>
                                                <span>Subscribers</span>
                                            </div>
                                        </div>

                                        {profile?.bio && (
                                            <pre className={`mt-2 text-sm whitespace-pre-wrap break-words font-[inherit] m-0 p-0 leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{profile.bio}</pre>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="w-full md:flex items-start gap-4 mt-4">
                            {/* Sidebar */}
                            <div className="md:w-64 w-full flex-shrink-0">
                                <div className={`rounded-xl overflow-hidden border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                                    <nav>
                                        <ul className="py-1.5">
                                            {menuItems.map((item, i) => {
                                                const isActive = activePage(item.path)
                                                return (
                                                    <li key={item.path}>
                                                        <div
                                                            className={`mx-1.5 my-0.5 px-4 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all duration-200 ${
                                                                isActive
                                                                    ? (isLight
                                                                        ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-sm'
                                                                        : 'bg-blue-600 text-white')
                                                                    : (isLight
                                                                        ? 'text-slate-700 hover:bg-blue-50/80'
                                                                        : 'text-gray-300 hover:bg-[#1C1C1C]')
                                                            }`}
                                                            onClick={() => (item.dropdown.length > 0 ? toggleDropdown(item.path) : redirect(item.path))}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <FontAwesomeIcon
                                                                    icon={item.icon}
                                                                    className={`text-sm w-4 ${isActive ? 'text-white' : (isLight ? 'text-blue-500' : 'text-gray-500')}`}
                                                                />
                                                                <span className="text-sm font-medium">{item.name}</span>
                                                            </div>
                                                            {item.dropdown.length > 0 && (
                                                                <FontAwesomeIcon
                                                                    icon={openDropdown === item.path ? faChevronUp : faChevronDown}
                                                                    className="text-xs opacity-60"
                                                                />
                                                            )}
                                                        </div>

                                                        <div
                                                            className="overflow-hidden transition-all duration-300"
                                                            style={{
                                                                maxHeight: openDropdown === item.path ? `${item.dropdown.length * 40}px` : '0px',
                                                            }}
                                                        >
                                                            <ul className="pl-6 pr-1.5 py-0.5">
                                                                {item.dropdown.map((subItem) => {
                                                                    const isSubActive = activeSubPage(item.path, subItem.path)
                                                                    return (
                                                                        <li
                                                                            key={subItem.path}
                                                                            onClick={() => redirect(subItem.path)}
                                                                            className={`px-4 py-2 my-0.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                                                                                isSubActive
                                                                                    ? (isLight
                                                                                        ? 'bg-blue-100/80 text-blue-700 font-medium'
                                                                                        : 'bg-blue-600/20 text-blue-400 font-medium')
                                                                                    : (isLight
                                                                                        ? 'text-slate-600 hover:bg-blue-50/60'
                                                                                        : 'text-gray-400 hover:bg-[#1C1C1C]')
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
                            <div className={`w-full mt-4 md:mt-0 px-6 py-4 pb-5 rounded-xl border border-solid ${
                                isLight
                                    ? 'bg-white/90 backdrop-blur-sm border-blue-200/60'
                                    : 'bg-[#0e0e0e] border-[#2B2B2B]'
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
