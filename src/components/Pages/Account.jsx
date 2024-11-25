import React, { useEffect, useState } from 'react'
import { main, dark, light } from '../../style';

import Avatar from '../Custom/Avatar';
import styles from "../../style";
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faCog, faHeart, faListSquares, faMessage, faPlayCircle, faUser, faUserCircle, faUserEdit, faVideo } from '@fortawesome/free-solid-svg-icons';

import Profile from './Account/Profile';
import Videos from './Account/Videos';
import Playlist from './Account/Playlist';
import Favorites from './Account/Favorites';
import Messages from './Account/Messages'; 
import Settings from './Account/Settings';
import NotFound from './NotFound';
import Reports from './Account/Reports';
import Groups from './Account/Groups';

import Notification from '../Custom/Notification';

const Account = ({ user, theme }) => {
    const navigate  = useNavigate()
    const location = useLocation();
    const { page, subpage } = useParams();

    const [image, setImage] = useState(localStorage.getItem('avatar') ? localStorage.getItem('avatar')?.replaceAll('"', "") : '')
    const [notification, setNotification] = useState({})
    const [show, setShow] = useState(true)

    useEffect(() => {
        if(Object.keys(notification).length > 0) { 
            setShow(true) 
        }
    }, [notification])

    useEffect(() => {
        if(!show) { setNotification({}) }
    }, [show])

    const menuItems = [
        { name: 'Profile', icon: faUserEdit, path: '', dropdown: [] },
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
        { name: 'Favorites', icon: faHeart, path: 'favorites', dropdown: [] },
        { name: 'Messages', icon: faMessage, path: 'messages', dropdown: [] },
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

    return (
        <div className={`relative overflow-hidden ${main.font} ${theme === 'light' ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidth}`}>
                    <div className={`${main.container} file:lg:px-8 relative px-0 my-12`}>

                        <Notification
                            theme={theme}
                            data={notification}
                            show={show}
                            setShow={setShow}
                        />

                        <div className={`mt-4 rounded-md p-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                            <div className='flex justify-between'>
                                <div className='w-full flex items-start transition-all'>
                                    <div className="w-32 flex-shrink-0 mr-4 xs:block hidden">
                                        <Avatar 
                                            theme={theme}
                                            image={image}
                                            borderWidth={8}
                                            outerBorder={true}
                                            size={32}
                                        />
                                    </div>
                                    <div className={`flex-1 overflow-hidden xs:mt-4`}>
                                        <h1 className="text-2xl font-medium mb-1">RazorScythe</h1>
                                        <p className={`truncate w-full mb-4 ${theme === 'light' ? light.text : dark.text}`}>0 Subscriber</p>
                                        <p className={`truncate w-full ${theme === 'light' ? light.text : dark.text}`}>Mashle: Magic and Muscles, Mashle, マッシュル-MASHLE-</p>
                                    </div>
                                    
                                </div> 
                                <div></div>
                            </div>
                        </div>

                        <div className='w-full sm:flex items-start transition-all'>
                            <div className="sm:w-72 w-full flex-shrink-0 mr-4 transition-all">
                                <div className={`mt-4 rounded-sm overflow-hidden ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                    <ul>
                                        {menuItems.map((item, i) => (
                                            <li key={item.path} className="">
                                                <div
                                                    className={`px-6 py-3 ${
                                                        activePage(item.path) && (theme === 'light' ? light.active_list_button : dark.active_list_button)
                                                    } transition-all cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button} ${item.dropdown.length > 0 && 'flex justify-between items-center'}
                                                    ${ (i+1) !== menuItems.length && 'border-b' } border-solid ${theme === 'light' ? light.border : dark.semiborder}`}
                                                    onClick={() => (item.dropdown.length > 0 ? toggleDropdown(item.path) : redirect(item.path))}
                                                >
                                                    <div className="flex items-center">
                                                        <FontAwesomeIcon icon={item.icon} className="mr-2" />
                                                        {item.name}
                                                    </div>
                                                    {item.dropdown.length > 0 && (
                                                        <FontAwesomeIcon icon={openDropdown === item.path ? faChevronUp : faChevronDown} />
                                                    )}
                                                </div>

                                                <div
                                                    className={`overflow-hidden transition-all duration-300`}
                                                    style={{
                                                        maxHeight: openDropdown === item.path ? `${item.dropdown.length * 40}px` : '0px',
                                                    }}
                                                >
                                                    <ul className="">
                                                        {item.dropdown.map((subItem, si) => (
                                                            <li
                                                                key={subItem.path}
                                                                onClick={() => redirect(subItem.path)}
                                                                className={`px-6 py-2 ${
                                                                    activeSubPage(item.path, subItem.path) && (theme === 'light' ? light.active_list_button : dark.active_list_button)
                                                                } cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button}
                                                                ${ (si+1) !== subItem.length && 'border-b' } border-solid ${theme === 'light' ? light.border : dark.semiborder}`}
                                                            >
                                                                {subItem.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className={`w-full mt-4 px-6 py-3 pb-5 rounded-sm overflow-hidden ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                {
                                    activePage('') ?
                                        <Profile
                                            user={user}
                                            theme={theme}
                                        />
                                    : activePage('videos') ?
                                        activeSubPage('videos', 'videos') ?
                                            <Videos
                                                user={user}
                                                theme={theme}
                                            />
                                        : activeSubPage('videos', 'videos/groups') ?
                                            <Groups
                                                user={user}
                                                theme={theme}
                                                setNotification={setNotification}
                                            />
                                        : activeSubPage('videos', 'videos/reports') &&
                                            <Reports
                                                user={user}
                                                theme={theme}
                                            />
                                    : activePage('playlist') ?
                                        <Playlist
                                            user={user}
                                            theme={theme}
                                        />
                                    : activePage('favorites') ?
                                        <Favorites
                                            user={user}
                                            theme={theme}
                                        />
                                    : activePage('messages') ? 
                                        <Messages
                                            user={user}
                                            theme={theme}
                                        />
                                    : activePage('settings') ?
                                        <Settings
                                            user={user}
                                            theme={ theme}
                                        />
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