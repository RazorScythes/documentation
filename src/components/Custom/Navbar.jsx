
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSearch, faMoon, faSun, faUser, faGear, faRightFromBracket, faCircleHalfStroke } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { video_links } from "../../constants";
import { logout } from "../../actions/auth";
import { convertDriveImageLink } from '../Tools'
import { useDispatch, useSelector } from 'react-redux'
import { Menu } from "lucide-react";
import { main, dark, light } from "../../style";
import NotificationDropdown from './NotificationDropdown';

import Logo from '../../assets/logo.png'
import Avatar from '../../assets/avatar.webp'

const capitalizeFirstLetter = (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

const Navbar = ({ theme, setTheme }) => {
    const dispatch = useDispatch()
    const navigate  = useNavigate()

    const tokenResult = useSelector((state) => state.settings.tokenResult)

    const [isActive, setIsActive] = useState(false);
    const [toggle, setToggle] = useState(false)
    const [open, setOpen] = useState({
        search: false,
        notification: false
    })

    const [user, setUser] = useState()
    const [avatar, setAvatar] = useState()
    const [firstPath, setFirstPath] = useState('')
    const [searchKey, setSearchKey] = useState('')
    const [notifications, setNotifications] = useState([])

    const sign_out = () => {
        dispatch(logout())
        navigate(`/login`)
        setUser(null)
    }

    useEffect(() => {
        setAvatar(localStorage.getItem('avatar')?.replaceAll('"', ""))
        setUser(JSON.parse(localStorage.getItem('profile')))
    }, [localStorage.getItem('avatar'), localStorage.getItem('profile')])

    useEffect(() => {
        const url = window.location.href;
        const pathSegments = url.split("/");
        
        setFirstPath(pathSegments[3])
    }, [window.location.href])

    const handleSearch = (e) => {
        e.preventDefault()

        if(firstPath.includes('videos')) {
            window.location.href = `/videos/search/${searchKey}`
        }
        else if(firstPath.includes('games')) {
            window.location.href = `/games/search/${searchKey}`
        }
        else if(firstPath.includes('blogs')) {
            window.location.href = `/blogs/search/${searchKey}`
        }
        else if(firstPath.includes('projects')) {
            window.location.href = `/projects/search/${searchKey}`
        }
    }

    const changeTheme = () => {
        if(!theme || theme === 'dark') {
            setTheme('light')
            localStorage.setItem('theme', 'light')
        }
        else {
            setTheme('dark')
            localStorage.setItem('theme', 'dark')
        }
    }

    return (
        <header className={`${main.font} w-full border-b border-solid ${theme === 'light' ? light.border : dark.border} shadow-lg transition-all relative z-50`}>
            {
                isActive ?
                <div className={`xs:px-6 absolute left-0 z-40 top-14 py-4 lg:flex-grow text-left lg:hidden block transition-all duration-300 ${theme === 'light' ? 'bg-white/98 backdrop-blur-md border-b-2 border-blue-200/80' : 'bg-[#1C1C1C]/98 backdrop-blur-md border-b-2 border-[#2B2B2B]'} w-full shadow-2xl`}>
                    <div className={`${main.container}`}>
                    {
                        video_links.map((link, i) => {
                            return (
                                <a 
                                    key={i} 
                                    href={`/${link.path}`} 
                                    className={`block px-4 py-3 rounded-xl mb-2 transition-all duration-200 border ${theme === 'light' ? 'text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-50 hover:text-blue-800 border-blue-100/50 hover:border-blue-200/80 hover:shadow-md' : 'text-gray-300 hover:bg-[#2B2B2B] hover:text-white border-[#2B2B2B]/50 hover:border-[#3B3B3B] hover:shadow-lg'} font-medium shadow-sm`} 
                                    onClick={() => setIsActive(!isActive)}
                                >
                                    { link.icon && <FontAwesomeIcon icon={link.icon} className="mr-3" /> }
                                    {link.name}
                                </a>
                            )
                        })
                    }
                    </div>
                </div> : null
            }

            <div className={`xs:px-6 ${!open.search ? "hidden" : "block"} absolute left-0 z-40 top-10 py-6  lg:flex-grow text-left lg:hidden block tranisition-all ${theme === 'light' ? light.background : dark.background} w-full`}>
                <div className={`${main.container}`}>
                    <form onSubmit={handleSearch}>
                        <div className="relative lg:mt-0 mt-4">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-6"> <FontAwesomeIcon icon={faSearch} className={`${theme === 'light' ? light.input_icon : dark.input_icon}`}/> </span>
                            <input value={searchKey} onChange={(e) => setSearchKey(e.target.value)} className={`block w-full rounded-full py-2 px-8 pr-10 ${theme === 'light' ? light.input : dark.input}`} type="text" placeholder={`Search`} />
                        </div>
                    </form>
                </div>
            </div>

            <nav className={`${main.container} lg:h-14 lg:py-0 sm:px-0 px-2 py-3 relative flex items-center justify-between flex-wrap z-50`}>
                <div className="flex items-center lg:gap-10 gap-3">
                    <button className={`lg:hidden flex items-center px-3 py-2 ${theme === 'light' ? light.icon : dark.icon}`} onClick={() => {
                        setOpen({...open, search: false, notification: false})
                        setIsActive(!isActive)
                        setToggle(false)
                    }}>
                        <Menu size={24}/>
                    </button>

                    <Link to={``}>
                        <div className="flex items-center flex-shrink-0  mr-6">
                            <img className="h-8 w-8 rounded-full mr-2" src={Logo} alt="Profile" />
                            <span className={`${main.font_secondary} font-semibold text-xl xs:block hidden`}>RazorScythe</span>
                        </div>
                    </Link>

                    <div className=" lg:flex-grow text-center lg:block hidden">
                        {
                            video_links.map((link, i) => {
                                return (
                                    <a key={i} href={`/${link.path}`} className={`block mt-4 lg:inline-block lg:mt-0 ${theme === 'light' ? light.link : dark.link} mr-4`} onClick={() => setIsActive(!isActive)}>
                                        { link.icon && <FontAwesomeIcon icon={link.icon} className="mr-2" /> }
                                        {link.name}
                                    </a>
                                )
                            })
                        }
                    </div>
                </div>

                <div className="flex lg:hidden items-center">
                    <div className="flex gap-2">
                        <button className={`p-[0.35rem] px-3 rounded-md ${theme === 'light' ? light.icon : dark.icon}`} onClick={() => {
                            setOpen({...open, search: !open.search, notification: false})
                            setIsActive(false)
                            setToggle(false)
                        }}><FontAwesomeIcon icon={faSearch} /></button>
                        { user && (
                            <div className="relative">
                                <button 
                                    className={`p-[0.35rem] px-3 rounded-md relative ${theme === 'light' ? light.icon : dark.icon}`}
                                    onClick={() => {
                                        setOpen({...open, search: false, notification: !open.notification})
                                        setIsActive(false)
                                        setToggle(false)
                                    }}
                                >
                                    <FontAwesomeIcon icon={faBell} />
                                    {notifications.filter(n => !n.read).length > 0 && (
                                        <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                    )}
                                </button>
                                {open.notification && (
                                    <div className="fixed inset-0 top-16 sm:top-0 z-40" onClick={() => setOpen({...open, notification: false})}></div>
                                )}
                                {open.notification && (
                                    <div className="fixed sm:absolute inset-x-0 top-16 sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 flex justify-center sm:block z-50 p-4 sm:p-0">
                                        <NotificationDropdown
                                            theme={theme}
                                            notifications={notifications}
                                            onClose={() => setOpen({...open, notification: false})}
                                            onNotificationClick={(notification) => {
                                                // Handle notification click
                                                console.log('Notification clicked:', notification)
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {
                        user ?
                            <div className="relative">
                                <img className="h-8 w-8 rounded-full ml-4 cursor-pointer object-cover border border-gray-500 bg-white shadow-md hover:shadow-lg transition-all" src={avatar ? convertDriveImageLink(avatar) : Avatar} alt="Profile" onClick={() => {
                                    setToggle(!toggle)
                                    setIsActive(false)
                                    setOpen({...open, search: false, notification: false})
                                }} />
                                {toggle && (
                                    <div className="fixed inset-0 z-40" onClick={() => setToggle(false)}></div>
                                )}
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className={`${
                                    !toggle ? "hidden" : "flex"
                                    } flex-col ${theme === 'light' ? 'bg-white/98 backdrop-blur-md border-2 border-blue-200/80' : 'bg-[#1C1C1C]/98 backdrop-blur-md border-2 border-[#2B2B2B]'} absolute z-50 top-16 right-0 mx-4 my-2 min-w-[240px] rounded-2xl shadow-2xl overflow-hidden`}
                                >
                                    <ul className="list-none flex flex-col py-2">
                                        <li>
                                            <a 
                                                href={`/account`} 
                                                className={`flex items-center px-4 py-2 cursor-pointer transition-all duration-200 border-l-4 border-transparent ${theme === 'light' ? 'text-blue-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-sky-50/50 hover:text-blue-800 hover:border-blue-400 hover:shadow-sm' : 'text-gray-300 hover:bg-[#2B2B2B] hover:text-white hover:border-blue-500'}`}
                                                onClick={() => setToggle(false)}
                                            >
                                                <FontAwesomeIcon icon={faUser} className="mr-3 w-4" />
                                                <span className="font-medium">My Account</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a 
                                                href={`/account/settings`} 
                                                className={`flex items-center px-4 py-2 cursor-pointer transition-all duration-200 border-l-4 border-transparent ${theme === 'light' ? 'text-blue-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-sky-50/50 hover:text-blue-800 hover:border-blue-400 hover:shadow-sm' : 'text-gray-300 hover:bg-[#2B2B2B] hover:text-white hover:border-blue-500'}`}
                                                onClick={() => setToggle(false)}
                                            >
                                                <FontAwesomeIcon icon={faGear} className="mr-3 w-4" />
                                                <span className="font-medium">Settings</span>
                                            </a>
                                        </li>
                                        <li className={`px-4 py-2.5 flex items-center justify-between border-t-2 ${theme === 'light' ? 'border-blue-200/80' : 'border-[#2B2B2B]'}`}>
                                            <span className={`flex items-center font-medium ${theme === 'light' ? 'text-blue-700' : 'text-gray-300'}`}>
                                                <FontAwesomeIcon icon={faCircleHalfStroke} className="mr-3 w-4" />
                                                Theme
                                            </span>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={theme === 'dark'}
                                                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                                                onClick={() => changeTheme()}
                                                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'light' ? 'border-blue-300 bg-blue-100 focus:ring-blue-400' : 'border-gray-600 bg-gray-700 focus:ring-gray-500'}`}
                                            >
                                                <span className="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-out" style={{ transform: theme === 'dark' ? 'translateX(1.25rem)' : 'translateX(0.125rem)', marginTop: '1px' }} />
                                            </button>
                                        </li>
                                        <li className={`border-t-2 ${theme === 'light' ? 'border-blue-200/80' : 'border-[#2B2B2B]'}`}>
                                            <button 
                                                onClick={() => {
                                                    sign_out()
                                                    setToggle(false)
                                                }}
                                                className={`w-full flex items-center px-4 py-2 cursor-pointer transition-all duration-200 border-l-4 border-transparent ${theme === 'light' ? 'text-rose-600 hover:bg-gradient-to-r hover:from-rose-50/50 hover:to-red-50/50 hover:text-rose-700 hover:border-rose-400 hover:shadow-sm' : 'text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-500'}`}
                                            >
                                                <FontAwesomeIcon icon={faRightFromBracket} className="mr-3 w-4" />
                                                <span className="font-medium">Logout</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            :
                            <a href={`/login`}>
                                <button className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>
                                    Login
                                </button>
                            </a>
                    }
                </div>

                <div className={`w-full block flex-grow lg:flex lg:items-center m-auto lg:w-auto ${isActive ? "block" : "hidden"} justify-end`}>
                    <form onSubmit={handleSearch} className="lg:block hidden">
                        <div className="relative lg:mt-0 mt-4 font-poppins">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-6"> <FontAwesomeIcon icon={faSearch} className={`${theme === 'light' ? light.input_icon : dark.input_icon}`} /> </span>
                            <input value={searchKey} onChange={(e) => setSearchKey(e.target.value)} className={`block w-full rounded-full py-2 px-8 pr-10 ${theme === 'light' ? light.input : dark.input}`} type="text" placeholder={`Search`} />
                        </div>
                    </form>

                    <div className="hidden lg:block ">
                    {
                        user ?
                            <div className="flex items-center gap-3">  
                                <div className="relative">
                                    <button 
                                        className={`p-[0.35rem] px-3 rounded-md relative ${theme === 'light' ? light.icon : dark.icon}`}
                                        onClick={() => {
                                            setOpen({...open, search: false, notification: !open.notification})
                                            setIsActive(false)
                                            setToggle(false)
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faBell} />
                                        {notifications.filter(n => !n.read).length > 0 && (
                                            <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                        )}
                                    </button>
                                    {open.notification && (
                                        <div className="fixed inset-0 z-40" onClick={() => setOpen({...open, notification: false})}></div>
                                    )}
                                    {open.notification && (
                                        <div className="absolute right-0 top-full mt-2 z-50">
                                            <NotificationDropdown
                                                theme={theme}
                                                notifications={notifications}
                                                onClose={() => setOpen({...open, notification: false})}
                                                onNotificationClick={(notification) => {
                                                    // Handle notification click
                                                    console.log('Notification clicked:', notification)
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <button className="flex items-center" onClick={() => {
                                            setToggle(!toggle)
                                            setIsActive(false)
                                            setOpen({...open, search: false, notification: false})
                                    }} >
                                        <img className="h-9 w-9 rounded-full mr-2 cursor-pointer object-cover border border-gray-500 bg-white shadow-md hover:shadow-lg transition-all" src={avatar ? convertDriveImageLink(avatar) : Avatar} alt="Profile"/>
                                    </button>

                                    {toggle && (
                                        <div className="fixed inset-0 z-40" onClick={() => setToggle(false)}></div>
                                    )}
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className={`${!toggle ? "hidden" : "flex"} flex-col ${theme === 'light' ? 'bg-white/98 backdrop-blur-md border-2 border-blue-200/80' : 'bg-[#1C1C1C]/98 backdrop-blur-md border-2 border-[#2B2B2B]'} absolute z-50 top-14 right-0 mx-4 my-2 min-w-[240px] rounded-2xl shadow-2xl overflow-hidden`}
                                    >
                                    <ul className="list-none flex flex-col py-2">
                                        <li>
                                            <a 
                                                href={`/account`} 
                                                className={`flex items-center px-4 py-2 cursor-pointer transition-all duration-200 border-l-4 border-transparent ${theme === 'light' ? 'text-blue-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-sky-50/50 hover:text-blue-800 hover:border-blue-400 hover:shadow-sm' : 'text-gray-300 hover:bg-[#2B2B2B] hover:text-white hover:border-blue-500'}`}
                                                onClick={() => setToggle(false)}
                                            >
                                                <FontAwesomeIcon icon={faUser} className="mr-3 w-4" />
                                                <span className="font-medium">My Account</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a 
                                                href={`/account/settings`} 
                                                className={`flex items-center px-4 py-2 cursor-pointer transition-all duration-200 border-l-4 border-transparent ${theme === 'light' ? 'text-blue-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-sky-50/50 hover:text-blue-800 hover:border-blue-400 hover:shadow-sm' : 'text-gray-300 hover:bg-[#2B2B2B] hover:text-white hover:border-blue-500'}`}
                                                onClick={() => setToggle(false)}
                                            >
                                                <FontAwesomeIcon icon={faGear} className="mr-3 w-4" />
                                                <span className="font-medium">Settings</span>
                                            </a>
                                        </li>
                                        <li className={`px-4 py-2.5 flex items-center justify-between border-t-2 ${theme === 'light' ? 'border-blue-200/80' : 'border-[#2B2B2B]'}`}>
                                            <span className={`flex items-center font-medium ${theme === 'light' ? 'text-blue-700' : 'text-gray-300'}`}>
                                                <FontAwesomeIcon icon={faCircleHalfStroke} className="mr-3 w-4" />
                                                Theme
                                            </span>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={theme === 'dark'}
                                                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                                                onClick={() => changeTheme()}
                                                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'light' ? 'border-blue-300 bg-blue-100 focus:ring-blue-400' : 'border-gray-600 bg-gray-700 focus:ring-gray-500'}`}
                                            >
                                                <span className="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-out" style={{ transform: theme === 'dark' ? 'translateX(1.25rem)' : 'translateX(0.125rem)', marginTop: '1px' }} />
                                            </button>
                                        </li>
                                        <li className={`border-t-2 ${theme === 'light' ? 'border-blue-200/80' : 'border-[#2B2B2B]'}`}>
                                            <button 
                                                onClick={() => {
                                                    sign_out()
                                                    setToggle(false)
                                                }}
                                                className={`w-full flex items-center px-4 py-2 cursor-pointer transition-all duration-200 border-l-4 border-transparent ${theme === 'light' ? 'text-rose-600 hover:bg-gradient-to-r hover:from-rose-50/50 hover:to-red-50/50 hover:text-rose-700 hover:border-rose-400 hover:shadow-sm' : 'text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-500'}`}
                                            >
                                                <FontAwesomeIcon icon={faRightFromBracket} className="mr-3 w-4" />
                                                <span className="font-medium">Logout</span>
                                            </button>
                                        </li>
                                    </ul>
                                    </div>
                                </div>
                            </div>
                            :
                            <div className="flex justify-end">  
                                <a href={`/login`}>
                                    <button className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>
                                        Login
                                    </button>
                                </a>
                            </div>
                    }
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Navbar;
