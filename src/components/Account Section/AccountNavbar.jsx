import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { account_links } from "../../constants";
import { faUser, faGear, faRightFromBracket, faFolder , faEnvelope, faChevronDown, faChevronUp, faNoteSticky} from "@fortawesome/free-solid-svg-icons";
import { logout } from "../../actions/auth";
import { useDispatch, useSelector } from 'react-redux'

import Logo from '../../assets/logo.png'
import Avatar from '../../assets/avatar.webp'

const AccountNavbar = ({ path }) => {
  const dispatch = useDispatch()
  const navigate  = useNavigate()
  
  const tokenResult = useSelector((state) => state.settings.tokenResult)
  const settings = useSelector((state) => state.settings.data)

  const [isActive, setIsActive] = useState(false)
  const [active, setActive] = useState(null)
  const [toggle, setToggle] = useState(false)

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')))
  const [avatar, setAvatar] = useState(settings.avatar ? settings.avatar : localStorage.getItem('avatar') ? localStorage.getItem('avatar')?.replaceAll('"', "") : '') //localStorage.getItem('avatar')?.replaceAll('"', "")

  useEffect(() => {
    if(Object.keys(tokenResult).length !== 0) {
      setAvatar(localStorage.getItem('avatar')?.replaceAll('"', ""))
      setUser(JSON.parse(localStorage.getItem('profile')))
    }
  }, [tokenResult])

  useEffect(() => {
    if(!user) navigate(`/`)
  }, [])

  useEffect(() => {
    account_links.some(function(link, i) {
        if (link.path == location.pathname.split('/').at(-1)) {
            setActive(i)
            return true;
        }
    });
  }, [])

  const sign_out = () => {
    dispatch(logout())
    navigate(`${path}/login`)
    setUser(null)
  }

  return (
    <nav className="relative flex flex-row items-center justify-between flex-wrap bg-white lg:px-6 lg:p-0 p-6 lg:pt-2 z-50 shadow-lg">
      <div className="hidden lg:block text-sm text-gray-800 my-2">
          <div className="flex flex-row items-center justify-between flex-wrap">
            {
              account_links.map((link, i) => {
                  return (
                    <>
                      {
                        link.path !== 'logs' && (
                          <Link key={i} to={`/account/${link.path}`} style={{borderBottom: (i === active) || (link.path === location.pathname.split('/').at(-1)) ? "4px solid #1F2937" : "4px solid transparent", fontWeight: (i === active) || (link.path === location.pathname.split('/').at(-1)) ? 700 : 500}} className="block lg:inline-block lg:mt-0 border-b-4 border-solid hover:border-gray-800 border-transparent hover:text-gray-900 mx-4 pb-2" 
                            onClick={() => {
                              setIsActive(!isActive)
                              setActive(i)
                            }
                          }>
                              {link.name}
                          </Link>
                        )
                      }
                      
                      {
                        i !== account_links.length - 1 &&
                          <div className="border-l w-[1px] h-full border-solid border-gray-400"><p className="opacity-0">.</p></div>
                      }
                    </>
                  )
              })
            }
            {
              user?.result.role === 'Admin' &&
                <>
                  <div className="border-l w-[1px] h-full border-solid border-gray-400"><p className="opacity-0">.</p></div>
                  <Link to={`/account/manage`} style={{borderBottom: (account_links.length === active) || ('manage' === location.pathname.split('/').at(-1)) ? "4px solid #1F2937" : "4px solid transparent", fontWeight: (account_links.length === active) || ('manage' === location.pathname.split('/').at(-1)) ? 700 : 500}} className="block lg:inline-block lg:mt-0 border-b-4 border-solid hover:border-gray-800 border-transparent hover:text-gray-900 mx-4 pb-2" 
                    onClick={() => {
                      setIsActive(!isActive)
                      setActive(account_links.length)
                    }
                  }>
                      Manage
                  </Link>
                </>
            }
          </div>
      </div>
      <Link to={`/`} className="block lg:hidden">
        <div className="flex items-center flex-shrink-0 text-white mr-6">
            <img className="h-8 w-8 rounded-full mr-2" src={Logo} alt="Profile" />
            <span className="font-semibold text-xl tracking-tight text-gray-800">RazorScythe</span>
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
              <img className="h-8 w-8 rounded-full ml-4 cursor-pointer object-cover border border-gray-400" src={avatar ? avatar : Avatar} alt="Profile" onClick={() => {
                setToggle(!toggle)
                setIsActive(false)
              }} />
              <div
                className={`${
                  !toggle ? "hidden" : "flex"
                } p-6 bg-gray-800 absolute z-40 top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar text-sm font-poppins`}
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
      <Link to={`/`} className="hidden lg:block">
          <div className="w-40 absolute left-0 right-0 mx-auto top-0 bottom-0 flex items-center justify-center text-white">
                <img className="h-8 w-8 rounded-full mr-2" src={Logo} alt="Profile" />
                <span className="font-bold text-xl tracking-tight text-gray-800">RazorScythe</span>
          </div>
      </Link>
      <div className={`font-poppins w-full block lg:flex lg:items-center justify-end lg:w-auto ${isActive ? "block" : "hidden"} `}>
        <div className="text-sm lg:flex-grow block lg:hidden">
            {
              account_links.map((link, i) => {
                  return (
                    <Link key={i} to={`/account/${link.path}`} className="block mt-4 lg:inline-block lg:mt-0 text-gray-800 font-semibold hover:text-gray-500 mr-4" onClick={() => setIsActive(!isActive)}>
                      {link.name}
                    </Link>
                  )
              })
            }
            {
              user?.result.role === 'Admin' &&
              <Link to={`/account/manage`} className="block mt-4 lg:inline-block lg:mt-0 text-gray-800 font-semibold hover:text-gray-500 mr-4" onClick={() => setIsActive(!isActive)}>
                Manage
              </Link>
            }
        </div>
        <div className="hidden lg:block flex">
          {
            user?.result? 
            <>
                <div className="flex flex-row items-center cursor-pointer" 
                  onClick={() => {
                  setToggle(!toggle)
                  setIsActive(false)
                }}>
                  <h2 className="text-sm font-semibold capitalize pb-2">{user.result.username}</h2>
                  <FontAwesomeIcon icon={toggle ? faChevronUp : faChevronDown} className="ml-2 w-3 h-3 pb-2" />
                </div>
                <div
                  className={`${
                    !toggle ? "hidden" : "flex"
                  } p-6 bg-gray-800 absolute z-40 top-[50px] right-0 mx-2 my-2 min-w-[140px] rounded-xl sidebar text-sm font-poppins`}
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

export default AccountNavbar;
