import React, { useEffect, useState } from 'react'
import { main, dark, light } from '../../style';

import Avatar from '../Custom/Avatar';
import styles from "../../style";
import { useParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faHeart, faListSquares, faMessage, faPlayCircle, faUser, faUserCircle, faUserEdit, faVideo } from '@fortawesome/free-solid-svg-icons';

import Profile from './Account/Profile';
import Videos from './Account/Videos';
import Playlist from './Account/Playlist';
import Favorites from './Account/Favorites';
import Messages from './Account/Messages'; 
import Settings from './Account/Settings';
import NotFound from './NotFound';

const Account = ({ user, theme }) => {
    const navigate  = useNavigate()
    const { page } = useParams();

    const [image, setImage]         = useState(localStorage.getItem('avatar') ? localStorage.getItem('avatar')?.replaceAll('"', "") : '')

    const activePage = (type) => {
        return (page === undefined && type === '') || page === type
    }

    const redirect = (path) => {
        navigate(`/account/${path}`)
    }

    return (
        <div className={`relative overflow-hidden ${main.font} ${theme === 'light' ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidth}`}>
                    <div className={`${main.container} file:lg:px-8 relative px-0 my-12`}>
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
                                        <li onClick={() => redirect('')} className={`px-6 py-3 ${activePage('') && (theme === 'light' ? light.active_list_button : dark.active_list_button)} transition-all cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button} border-b border-solid ${theme === 'light' ? light.border : dark.semiborder}`}>
                                            <FontAwesomeIcon icon={faUserEdit} className='mr-1'/> Profile
                                        </li>
                                        <li onClick={() => redirect('videos')} className={`px-6 py-3 ${activePage('videos') && (theme === 'light' ? light.active_list_button : dark.active_list_button)} transition-all cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button} border-b border-solid ${theme === 'light' ? light.border : dark.semiborder}`}>
                                            <FontAwesomeIcon icon={faPlayCircle} className='mr-1'/> Videos
                                        </li>
                                        <li onClick={() => redirect('playlist')} className={`px-6 py-3 ${activePage('playlist') && (theme === 'light' ? light.active_list_button : dark.active_list_button)} transition-all cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button} border-b border-solid ${theme === 'light' ? light.border : dark.semiborder}`}>
                                            <FontAwesomeIcon icon={faListSquares} className='mr-1'/> Playlists
                                        </li>
                                        <li onClick={() => redirect('favorites')} className={`px-6 py-3 ${activePage('favorites') && (theme === 'light' ? light.active_list_button : dark.active_list_button)} transition-all cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button} border-b border-solid ${theme === 'light' ? light.border : dark.semiborder}`}>
                                            <FontAwesomeIcon icon={faHeart} className='mr-1'/> Favorites
                                        </li>
                                        <li onClick={() => redirect('messages')} className={`px-6 py-3 ${activePage('messages') && (theme === 'light' ? light.active_list_button : dark.active_list_button)} transition-all cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button} border-b border-solid ${theme === 'light' ? light.border : dark.semiborder}`}>
                                            <FontAwesomeIcon icon={faMessage} className='mr-1'/> Messages
                                        </li>
                                        <li onClick={() => redirect('settings')} className={`px-6 py-3 ${activePage('settings') && (theme === 'light' ? light.active_list_button : dark.active_list_button)} transition-all cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button} `}>
                                            <FontAwesomeIcon icon={faCog} className='mr-1'/> Settings
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className={`w-full mt-4 px-6 py-3 rounded-sm overflow-hidden ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                {
                                    activePage('') ?
                                        <Profile
                                            user={user}
                                            theme={theme}
                                        />
                                    : activePage('videos') ?
                                        <Videos
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
                                            theme={theme}
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