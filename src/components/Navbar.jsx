import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { nav_links, user_navLinks } from "../constants";
import { faUser, faGear, faRightFromBracket, faFolder , faEnvelope} from "@fortawesome/free-solid-svg-icons";
import { logout } from "../actions/auth";
import { convertDriveImageLink } from './Tools'
import { useDispatch, useSelector } from 'react-redux'

import Logo from '../assets/logo.png'
import Avatar from '../assets/avatar.webp'

const capitalizeFirstLetter = (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

const Navbar = ({ path }) => {
  const dispatch = useDispatch()
  const navigate  = useNavigate()

  const tokenResult = useSelector((state) => state.settings.tokenResult)
  const settings = useSelector((state) => state.settings.data)

  const [isActive, setIsActive] = useState(false);
  const [toggle, setToggle] = useState(false)

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
    <nav className="relative flex items-center justify-between flex-wrap bg-gray-800 p-6 z-50">
      <Link to={`${path}`}>
        <div className="flex items-center flex-shrink-0 text-white mr-6">
            <img className="h-8 w-8 rounded-full mr-2" src={Logo} alt="Profile" />
            <span className="font-semibold text-xl tracking-tight">RazorScythe</span>
        </div>
      </Link>
      <div className="block lg:hidden flex">
        <button className="flex items-center px-3 py-2 border rounded text-blue-200 border-blue-400 hover:text-white hover:border-white" onClick={() => {
          setIsActive(!isActive)
          setToggle(false)
        }}>
          <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3a3 3 0 110-6h20a3 3 0 110 6H0zm0 7a3 3 0 110-6h20a3 3 0 110 6H0zm0 7a3 3 0 110-6h20a3 3 0 110 6H0z"/></svg>
        </button>
        {
          user?.result?
          <>
              <img className="h-8 w-8 rounded-full ml-4 cursor-pointer object-cover border border-gray-400" src={avatar ? convertDriveImageLink(avatar) : Avatar} alt="Profile" onClick={() => {
                setToggle(!toggle)
                setIsActive(false)
              }} />
              <div
                className={`${
                  !toggle ? "hidden" : "flex"
                } p-6 bg-gray-800 absolute z-60 top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar text-sm font-poppins`}
              >
                <ul className="list-none flex justify-end items-start flex-1 flex-col">
                      <li
                        className={`cursor-pointer text-white hover:text-blue-200 mb-4`}
                      >
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        <a href={`${path}/account`}>Account</a>
                      </li>
                      <li
                        className={`cursor-pointer text-white hover:text-blue-200 mb-4`}
                      >
                        <FontAwesomeIcon icon={faFolder} className="mr-2" />
                        <a href={`${path}/${user.result.username}/portfolio`}>My Portfolio</a>
                      </li>
                      <li
                        className={`cursor-pointer text-white hover:text-blue-200 mb-4`}
                      >
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                        <a href={`${path}/${user.result.username}`}>Inbox</a>
                      </li>
                    <li
                      className={`cursor-pointer text-white hover:text-blue-200 mb-4`}
                    >
                      <FontAwesomeIcon icon={faGear} className="mr-2" />
                      <a href={`${path}/account/settings`}>Settings</a>
                    </li>
                    <li
                      className={`cursor-pointer text-white hover:text-blue-200 mb-0`}
                    >
                      <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                      <button onClick={() => sign_out()}>Logout</button>
                    </li>
                </ul>
              </div>
          </>
          :
          <a href={`${path}/login`}>
            <button className="bg-gray-100 hover:bg-transparent hover:text-gray-100 text-gray-800 font-semibold ml-2 text-sm py-2 px-4 border border-gray-100 rounded transition-colors duration-300 ease-in-out">
                Login
            </button>
          </a>
        }
      </div>
      <div className={`font-poppins w-full block flex-grow lg:flex lg:items-center m-auto lg:w-auto ${isActive ? "block" : "hidden"}`}>
        <div className="text-sm lg:flex-grow text-center">
          {
            nav_links.map((link, i) => {
                return (
                  // <Link key={i} to={`${path}/${link.path}`} className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4" onClick={() => setIsActive(!isActive)}>
                  <a href={`${path}/${link.path}`} className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4" onClick={() => setIsActive(!isActive)}>
                    <FontAwesomeIcon icon={link.icon} className="mr-2" />
                    {link.name}
                  </a>
                  // </Link>
                )
            })
          }
        </div>
        <form onSubmit={handleSearch}>
          <div className="relative lg:mt-0 mt-4 font-poppins">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
            </span>
            <input value={searchKey} onChange={(e) => setSearchKey(e.target.value)} className="block w-full bg-gray-200 text-sm text-gray-700 rounded-full py-2 px-4 pl-10 leading-tight focus:outline-none focus:bg-white focus:text-gray-900" type="text" placeholder={`Search ${capitalizeFirstLetter(firstPath)}`} />
          </div>
        </form>
        <div className="hidden lg:block flex">
          {
            user?.result? 
            <>
                <img className="h-10 w-10 rounded-full ml-4 cursor-pointer object-cover border border-gray-400" src={avatar ? convertDriveImageLink(avatar) : Avatar} alt="Profile" onClick={() => {
                  setToggle(!toggle)
                  setIsActive(false)
                }} />
                <div
                  className={`${
                    !toggle ? "hidden" : "flex"
                  } p-6 bg-gray-800 absolute top-[90px] right-0 mx-2 my-2 min-w-[140px] rounded-xl sidebar text-sm font-poppins`}
                >
                  <ul className="list-none flex justify-end items-start flex-1 flex-col">
                      <li
                        className={`cursor-pointer text-white hover:text-blue-200 mb-4`}
                      >
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        <a href={`${path}/account`}>Account</a>
                      </li>
                      <li
                        className={`cursor-pointer text-white hover:text-blue-200 mb-4`}
                      >
                        <FontAwesomeIcon icon={faFolder} className="mr-2" />
                        <a href={`${path}/${user.result.username}/portfolio`}>My Portfolio</a>
                      </li>
                      <li
                        className={`cursor-pointer text-white hover:text-blue-200 mb-4`}
                      >
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                        <a href={`${path}/${user.result.username}`}>Inbox</a>
                      </li>
                      <li
                        className={`cursor-pointer text-white hover:text-blue-200 mb-4`}
                      >
                        <FontAwesomeIcon icon={faGear} className="mr-2" />
                        <a href={`${path}/account/settings`}>Settings</a>
                      </li>
                      <li
                        className={`cursor-pointer text-white hover:text-blue-200 mb-0`}
                      >
                        <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                        <button onClick={() => sign_out()}>Logout</button>
                      </li>
                  </ul>
                </div>
            </>
            :
            <a href={`${path}/login`}>
              <button className="bg-gray-100 hover:bg-transparent hover:text-gray-100 text-gray-800 font-semibold ml-2 text-sm py-2 px-4 border border-gray-100 rounded transition-colors duration-300 ease-in-out">
                  Login
              </button>
            </a>
          }
        </div>
      </div>
    </nav>
)}

export default Navbar;
