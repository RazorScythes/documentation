
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCog, faHamburger, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { nav_links, user_navLinks } from "../../constants";
import { faUser, faGear, faRightFromBracket, faFolder , faEnvelope} from "@fortawesome/free-solid-svg-icons";
import { logout } from "../../actions/auth";
import { convertDriveImageLink } from '../Tools'
import { useDispatch, useSelector } from 'react-redux'

import Logo from '../../assets/logo.png'
import Avatar from '../../assets/avatar.png'
import { Menu } from "lucide-react";

const capitalizeFirstLetter = (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

const Navbar = ({ path }) => {
    const dispatch = useDispatch()
    const navigate  = useNavigate()

    const tokenResult = useSelector((state) => state.settings.tokenResult)
    const settings = useSelector((state) => state.settings.data)

    const [isActive, setIsActive] = useState(false);
    const [toggle, setToggle] = useState(false)
    const [open, setOpen] = useState({
        search: false,
        notification: false
    })

    const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')))
    const [avatar, setAvatar] = useState(settings.avatar ? settings.avatar : localStorage.getItem('avatar') ? localStorage.getItem('avatar')?.replaceAll('"', "") : '') //localStorage.getItem('avatar')?.replaceAll('"', "")
    const [firstPath, setFirstPath] = useState('')
    const [searchKey, setSearchKey] = useState('')

    const sign_out = () => {
        dispatch(logout())
        navigate(`${path}/login`)
        setUser(null)
    }

    useEffect(() => {
        const url = window.location.href;
        const pathSegments = url.split("/");
        setFirstPath(pathSegments[3])
    }, [window.location.href])

    useEffect(() => {
        if(Object.keys(tokenResult).length !== 0) {
        setAvatar(localStorage.getItem('avatar')?.replaceAll('"', ""))
        setUser(JSON.parse(localStorage.getItem('profile')))
        }
    }, [tokenResult])

    useEffect(() => {
        setTimeout(() => {
        setAvatar(localStorage.getItem('avatar')?.replaceAll('"', ""))
        setUser(JSON.parse(localStorage.getItem('profile')))
        }, 5000);
    }, [])

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
    return (
        <header className='font-roboto font-semibold w-full border-gray-300 text-gray-800 border-b border-solid shadow-lg transition-all'>
            <nav className="container mx-auto lg:h-14 lg:py-0 sm:px-0 px-2 py-3 relative flex items-center justify-between flex-wrap z-50">
                <Link to={`${path}`}>
                    <div className="flex items-center flex-shrink-0  mr-6">
                        <img className="h-8 w-8 rounded-full mr-2" src={Logo} alt="Profile" />
                        <span className="font-semibold text-xl">RazorScythe</span>
                    </div>
                </Link>
                <div className="flex lg:hidden items-center">
                    {/* <div className="flex gap-2 mr-4">
                        <button className="p-[0.35rem] px-3 hover:bg-blue-700 hover:text-white rounded-md transition-all"><FontAwesomeIcon icon={faSearch} /></button>
                        { user?.result && <button className="p-[0.35rem] px-3 hover:bg-blue-700 hover:text-white rounded-md transition-all"><FontAwesomeIcon icon={faBell} /></button> }
                    </div> */}

                    <button className="flex items-center px-3 py-2 border rounded text-white border-blue-600 hover:bg-blue-700 bg-blue-600 transition-all" onClick={() => {
                        setIsActive(!isActive)
                        setToggle(false)
                    }}>
                        <Menu  size={20}/>
                    </button>
                    {
                        user?.result?
                        <div>
                            <img className="h-8 w-8 rounded-full ml-4 cursor-pointer object-cover border border-blue-700" src={avatar ? convertDriveImageLink(avatar) : Avatar} alt="Profile" onClick={() => {
                                setToggle(!toggle)
                                setIsActive(false)
                                setOpen({
                                    search: false,
                                    notification: false
                                })
                            }} />
                            <div
                                className={`${
                                !toggle ? "hidden" : "flex"
                                } p-6 bg-white absolute z-60 top-14 right-0 mx-4 my-2 min-w-[140px] rounded-md sidebar text-sm border border-solid border-gray-300 shadow-md`}
                            >
                                <ul className="list-none flex justify-end items-start flex-1 flex-col">
                                    <li className={`cursor-pointer hover:text-blue-700 mb-4`}>
                                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                                        <a href={`${path}/account`}>My Account</a>
                                    </li>
                                    <li className={`cursor-pointer hover:text-blue-700 mb-4`}>
                                        <FontAwesomeIcon icon={faFolder} className="mr-2" />
                                        <a href={`${path}/${user.result.username}/portfolio`}>Portfolio</a>
                                    </li>
                                    <li className={`cursor-pointer hover:text-blue-700 mb-4`}>
                                        <FontAwesomeIcon icon={faGear} className="mr-2" />
                                        <a href={`${path}/account/settings`}>Settings</a>
                                    </li>
                                    <li className={`cursor-pointer hover:text-blue-700 mb-0`}>
                                        <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                                        <button onClick={() => sign_out()}>Logout</button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        :
                        <a href={`${path}/login`}>
                            <button className="bg-gray-100 hover:bg-transparent hover:text-gray-100 text-gray-800 font-semibold ml-2 text-sm py-2 px-4 border border-gray-100 rounded transition-colors duration-300 ease-in-out">
                                Login
                            </button>
                        </a>
                    }
                </div>

            <div className={`w-full block flex-grow lg:flex lg:items-center m-auto lg:w-auto ${isActive ? "block" : "hidden"}`}>
                <div className="text-sm lg:flex-grow text-center">
                {
                    nav_links.map((link, i) => {
                        return (
                            <a href={`${path}/${link.path}`} className="block mt-4 lg:inline-block lg:mt-0 hover:text-blue-700 mr-4 transition-all" onClick={() => setIsActive(!isActive)}>
                                <FontAwesomeIcon icon={link.icon} className="mr-2" />
                                {link.name}
                            </a>
                        )
                    })
                }
                </div>
                {/* <form onSubmit={handleSearch}>
                    <div className="relative lg:mt-0 mt-4 font-poppins">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
                        </span>
                        <input value={searchKey} onChange={(e) => setSearchKey(e.target.value)} className="block w-full bg-gray-200 text-sm text-gray-700 rounded-full py-2 px-4 pl-10 leading-tight focus:outline-none focus:bg-white focus:text-gray-900" type="text" placeholder={`Search ${capitalizeFirstLetter(firstPath)}`} />
                    </div>
                </form> */}
                <div className="hidden lg:block text-sm">
                {
                    user?.result? 
                    <div className="flex">  
                        <div className="flex gap-2 mr-4">
                            <div>
                                <button onClick={() => {
                                    setOpen({...open, search: !open.search, notification: false})
                                    setIsActive(false)
                                    setToggle(false)
                                }} className="p-2 px-3 hover:bg-blue-700 hover:text-white rounded-md transition-all"><FontAwesomeIcon icon={faSearch} /></button>
                                <div
                                    className={`${
                                    !open.search ? "hidden" : "flex"
                                    } flex-col p-6 bg-white absolute z-60 top-14 right-0 mx-4 my-2 min-w-[140px] rounded-md sidebar text-sm border border-solid border-gray-300 shadow-md font-normal`}
                                >
                                    <form onSubmit={handleSearch}>
                                        <div className="relative lg:mt-0 mt-4">
                                            <input value={searchKey} onChange={(e) => setSearchKey(e.target.value)} className="block w-full px-4 py-2 outline-none border border-solid border-gray-300" type="text" placeholder="Search" />
                                            <button type="submit" className="mt-1 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white transition-all">Search</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            {/* { user?.result && <button onClick={() => {
                                    setOpen({...open, notification: !open.notification, search: false})
                                    setIsActive(false)
                                    setToggle(false)
                                }} className="p-[0.35rem] px-3 hover:bg-blue-700 hover:text-white rounded-md transition-all"><FontAwesomeIcon icon={faBell} /></button> }
                            <div
                                className={`${
                                !open.notification ? "hidden" : "flex"
                                } flex-col p-4 bg-white absolute z-60 top-14 right-0 mx-2 my-2 min-w-[140px] rounded-md sidebar text-sm border border-solid border-gray-300 shadow-md font-normal`}
                            >
                                <h2 className="text-blue-700 font-bold text-base tracking-wider">Notifications</h2>
                            </div> */}
                        </div>
                        <button className="flex items-center" onClick={() => {
                                setToggle(!toggle)
                                setIsActive(false)
                                setOpen({
                                    search: false,
                                    notification: false
                                })
                        }} >
                            <img className="h-9 w-9 rounded-full mr-2 cursor-pointer object-cover border border-blue-700" src={avatar ? convertDriveImageLink(avatar) : Avatar} alt="Profile"/>
                        </button>
                        <div
                            className={`${
                            !toggle ? "hidden" : "flex"
                            } flex-col p-6 bg-white absolute z-60 top-14 right-0 mx-4 my-2 min-w-[140px] rounded-md sidebar text-sm border border-solid border-gray-300 shadow-md`}
                        >
                            {/* <p>{user?.result.username}</p> */}
                            <ul className="list-none flex justify-end items-start flex-1 flex-col">
                                <li className={`cursor-pointer hover:text-blue-700 mb-4`}>
                                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                                    <a href={`${path}/account`}>My Account</a>
                                </li>
                                <li className={`cursor-pointer hover:text-blue-700 mb-4`}>
                                    <FontAwesomeIcon icon={faFolder} className="mr-2" />
                                    <a href={`${path}/${user.result.username}/portfolio`}>Portfolio</a>
                                </li>
                                <li className={`cursor-pointer hover:text-blue-700 mb-4`}>
                                    <FontAwesomeIcon icon={faGear} className="mr-2" />
                                    <a href={`${path}/account/settings`}>Settings</a>
                                </li>
                                <li className={`cursor-pointer hover:text-blue-700 mb-0`}>
                                    <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                                    <button onClick={() => sign_out()}>Logout</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    :
                    <div className="flex">  
                        <button className="p-2 px-3 hover:bg-blue-700 hover:text-white rounded-md transition-all"><FontAwesomeIcon icon={faSearch} /></button>
                        <a href={`${path}/login`}>
                            <button className="bg-gray-100 hover:bg-blue-700 hover:text-gray-100 text-gray-800 font-semibold ml-2 text-sm py-2 px-4 border border-gray-100 rounded transition-colors duration-300 ease-in-out">
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
