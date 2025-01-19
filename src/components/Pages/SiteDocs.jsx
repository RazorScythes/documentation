import React, { useEffect, useState } from 'react'
import { main, dark, light } from '../../style';

import Avatar from '../Custom/Avatar';
import styles from "../../style";
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faCog, faDashboard, faGlobe, faHeart, faHome, faListSquares, faMessage, faPlayCircle, faUser, faUserCircle, faUserEdit, faVideo } from '@fortawesome/free-solid-svg-icons';

import Documentation from './Account/Documentation';

import Notification from '../Custom/Notification';

const SiteDocs = ({ user, theme }) => {
    const navigate  = useNavigate()
    const location = useLocation();
    const { page, subpage } = useParams();

    const [image, setImage] = useState('')
    const [profile, setProfile] = useState({})
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

    useEffect(() => {
        setImage(localStorage.getItem('avatar')?.replaceAll('"', ""))
        setProfile(JSON.parse(localStorage.getItem('profile')))
    }, [localStorage.getItem('avatar'), localStorage.getItem('profile')])

    const menuItems = [
        { name: 'API Documentation', icon: faHome, path: '', dropdown: [] },
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
        <div className={`relative overflow-hidden ${main.font} ${theme === 'light' ? light.body : dark.body} h-screen`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className={`file:lg:px-8 relative px-0 my-12`}>

                        <Notification
                            theme={theme}
                            data={notification}
                            show={show}
                            setShow={setShow}
                        />

                        <div className='w-full md:flex items-start transition-all'>
                            <div className="md:w-72 w-full flex-shrink-0 mr-4 transition-all">
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

                            <div className={`w-full mt-4 px-6 py-3 pb-5 rounded-sm ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                {   
                                    activePage('') &&
                                        <Documentation
                                            user={user}
                                            theme={theme}
                                            setNotification={setNotification}
                                        />
                                }
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SiteDocs