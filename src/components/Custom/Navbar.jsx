
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCog, faHamburger, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { video_links, user_navLinks } from "../../constants";
import { faUser, faGear, faRightFromBracket, faFolder , faEnvelope} from "@fortawesome/free-solid-svg-icons";
import { logout } from "../../actions/auth";
import { convertDriveImageLink } from '../Tools'
import { useDispatch, useSelector } from 'react-redux'

import Logo from '../../assets/logo.png'
import Avatar from '../../assets/avatar.png'
import { Menu } from "lucide-react";

const capitalizeFirstLetter = (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

const Navbar = ({  }) => {
    const dispatch = useDispatch()
    const navigate  = useNavigate()

    const tokenResult = useSelector((state) => state.settings.tokenResult)

    const [isActive, setIsActive] = useState(false);
    const [toggle, setToggle] = useState(false)
    const [open, setOpen] = useState({
        search: false,
        notification: false
    })

    const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')))
    const [avatar, setAvatar] = useState(localStorage.getItem('avatar') ? localStorage.getItem('avatar')?.replaceAll('"', "") : Avatar)
    const [firstPath, setFirstPath] = useState('')
    const [searchKey, setSearchKey] = useState('')

    const sign_out = () => {
        dispatch(logout())
        navigate(`/login`)
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
        <header className='font-poppins w-full border-[#0e0e0e] border-b border-solid shadow-lg transition-all relative'>
            {
                isActive ?
                <div className={`xs:px-6 absolute left-0 z-40 top-10 py-6 text-sm lg:flex-grow text-left lg:hidden block tranisition-all bg-[#0e0e0e] w-full`}>
                    <div className="container mx-auto">
                    {
                        video_links.map((link, i) => {
                            return (
                                <a href={`/${link.path}`} className="block mt-4 lg:inline-block lg:mt-0 hover:text-blue-400 mr-4 transition-all" onClick={() => setIsActive(!isActive)}>
                                    <FontAwesomeIcon icon={link.icon} className="mr-2" />
                                    {link.name}
                                </a>
                            )
                        })
                    }
                    </div>
                </div> : null
            }

            <div className={`xs:px-6 ${!open.search ? "hidden" : "block"} absolute left-0 z-40 top-10 py-6 text-sm lg:flex-grow text-left lg:hidden block tranisition-all bg-[#0e0e0e] w-full`}>
                <div className="container mx-auto">
                    <form onSubmit={handleSearch}>
                        <div className="relative lg:mt-0 mt-4 font-poppins">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-6"> <FontAwesomeIcon icon={faSearch} className="text-gray-300"/> </span>
                            <input value={searchKey} onChange={(e) => setSearchKey(e.target.value)} className="block w-full bg-[#1C1C1C] text-sm text-gray-300 rounded-full py-2 px-8 pr-10 leading-tight focus:outline-none focus:bg-[#2B2B2B] transition-all outline-none" type="text" placeholder={`Search ${capitalizeFirstLetter(firstPath)}`} />
                        </div>
                    </form>
                </div>
            </div>

            <nav className="container mx-auto lg:h-14 lg:py-0 sm:px-0 px-2 py-3 relative flex items-center justify-between flex-wrap z-50">
                <div className="flex items-center lg:gap-10 gap-3">
                    <button className="lg:hidden flex items-center px-3 py-2 text-white transition-all hover:text-blue-600" onClick={() => {
                        setOpen({...open, search: false, notification: false})
                        setIsActive(!isActive)
                        setToggle(false)
                    }}>
                        <Menu size={24}/>
                    </button>

                    <Link to={``}>
                        <div className="flex items-center flex-shrink-0  mr-6">
                            <img className="h-8 w-8 rounded-full mr-2" src={Logo} alt="Profile" />
                            <span className="font-roboto font-semibold text-xl">RazorScythe</span>
                        </div>
                    </Link>

                    <div className="text-sm lg:flex-grow text-center lg:block hidden">
                        {
                            video_links.map((link, i) => {
                                return (
                                    <a id={i} href={`/${link.path}`} className="block mt-4 lg:inline-block lg:mt-0 hover:text-blue-400 mr-4 transition-all" onClick={() => setIsActive(!isActive)}>
                                        <FontAwesomeIcon icon={link.icon} className="mr-2" />
                                        {link.name}
                                    </a>
                                )
                            })
                        }
                    </div>
                </div>

                <div className="flex lg:hidden items-center">
                    <div className="flex gap-2">
                        <button className="p-[0.35rem] px-3 hover:text-blue-600 rounded-md transition-all" onClick={() => {
                            setOpen({...open, search: !open.search, notification: false})
                            setIsActive(false)
                            setToggle(false)
                        }}><FontAwesomeIcon icon={faSearch} /></button>
                        { user && <button className="p-[0.35rem] px-3 hover:text-blue-600 rounded-md transition-all"><FontAwesomeIcon icon={faBell} /></button> }
                    </div>

                    {
                        user ?
                            <div>
                                <img className="h-8 w-8 rounded-full ml-4 cursor-pointer object-cover border border-gray-500 bg-white" src={avatar ? convertDriveImageLink(avatar) : Avatar} alt="Profile" onClick={() => {
                                    setToggle(!toggle)
                                    setIsActive(false)
                                    setOpen({...open, search: false, notification: false})
                                }} />
                                <div
                                    className={`${
                                    !toggle ? "hidden" : "flex"
                                    } p-6 bg-[#0e0e0e] absolute z-60 top-16 right-0 mx-4 my-2 min-w-[140px] rounded-md sidebar text-sm border border-solid border-[#1C1C1C] shadow-md`}
                                >
                                    <ul className="list-none flex justify-end items-start flex-1 flex-col">
                                        <li className={`cursor-pointer hover:text-blue-400 mb-4 transition-all`}>
                                            <FontAwesomeIcon icon={faUser} className="mr-2" />
                                            <a href={`/account`}>My Account</a>
                                        </li>
                                        <li className={`cursor-pointer hover:text-blue-400 mb-4 transition-all`}>
                                            <FontAwesomeIcon icon={faGear} className="mr-2" />
                                            <a href={`/account/settings`}>Settings</a>
                                        </li>
                                        <li className={`cursor-pointer hover:text-blue-400 mb-0 transition-all`}>
                                            <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                                            <button onClick={() => sign_out()}>Logout</button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            :
                            <a href={`/login`}>
                                <button className="bg-white hover:bg-blue-600 hover:border-blue-600 hover:text-white text-[#0e0e0e] font-medium ml-2 text-sm py-1.5 px-4 border border-white rounded-full transition-colors duration-300 ease-in-out">
                                    Login
                                </button>
                            </a>
                    }
                </div>

                <div className={`w-full block flex-grow lg:flex lg:items-center m-auto lg:w-auto ${isActive ? "block" : "hidden"} justify-end`}>
                    <form onSubmit={handleSearch} className="lg:block hidden">
                        <div className="relative lg:mt-0 mt-4 font-poppins">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-6"> <FontAwesomeIcon icon={faSearch} className="text-gray-300" /> </span>
                            <input value={searchKey} onChange={(e) => setSearchKey(e.target.value)} className="block w-full bg-[#1C1C1C] text-sm text-gray-300 rounded-full py-2 px-8 pr-10 leading-tight focus:outline-none focus:bg-[#2B2B2B] transition-all outline-none" type="text" placeholder={`Search ${capitalizeFirstLetter(firstPath)}`} />
                        </div>
                    </form>

                    <div className="hidden lg:block text-sm">
                    {
                        user ?
                            <div className="flex">  
                                <div className="flex gap-2 mr-4"></div>

                                <button className="flex items-center" onClick={() => {
                                        setToggle(!toggle)
                                        setIsActive(false)
                                        setOpen({...open, search: false, notification: false})
                                }} >
                                    <img className="h-9 w-9 rounded-full mr-2 cursor-pointer object-cover border border-gray-500 bg-white" src={avatar ? convertDriveImageLink(avatar) : Avatar} alt="Profile"/>
                                </button>

                                <div
                                    className={`${!toggle ? "hidden" : "flex"} flex-col p-6 bg-white absolute z-60 top-14 right-0 mx-4 my-2 min-w-[140px] rounded-md sidebar text-sm border border-solid border-gray-300 shadow-md`}
                                >
                                    <ul className="list-none flex justify-end items-start flex-1 flex-col">
                                        <li className={`cursor-pointer hover:text-blue-700 mb-4`}>
                                            <FontAwesomeIcon icon={faUser} className="mr-2" />
                                            <a href={`/account`}>My Account</a>
                                        </li>
                                        <li className={`cursor-pointer hover:text-blue-700 mb-4`}>
                                            <FontAwesomeIcon icon={faFolder} className="mr-2" />
                                            <a href={`/${user.username}/portfolio`}>Portfolio</a>
                                        </li>
                                        <li className={`cursor-pointer hover:text-blue-700 mb-4`}>
                                            <FontAwesomeIcon icon={faGear} className="mr-2" />
                                            <a href={`/account/settings`}>Settings</a>
                                        </li>
                                        <li className={`cursor-pointer hover:text-blue-700 mb-0`}>
                                            <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                                            <button onClick={() => sign_out()}>Logout</button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            :
                            <div className="flex justify-end">  
                                <a href={`/login`}>
                                    <button className="bg-white hover:bg-blue-600 hover:border-blue-600 hover:text-white text-[#0e0e0e] font-medium ml-2 text-sm py-1.5 px-4 border border-white rounded-full transition-colors duration-300 ease-in-out">
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
