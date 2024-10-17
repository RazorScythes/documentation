import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";

const AdminSidebar = ({ isOpen, setIsOpen, open, setOpen, path }) => {

    const firstPath = location.pathname.split('/')[2]

    const [searchParams, setSearchParams] = useSearchParams();
    const [deviceType, setDeviceType] = useState('');
    const [prevDeviceType, setPrevDeviceType] = useState('');

    const portfolioPage = searchParams.get('navigation')

    const paramIndex = searchParams.get('type') === null || searchParams.get('type') === ''
    const checkParams = (val) => {return searchParams.get('type') === val}

    useEffect(() => {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 1060) {
            setIsOpen(true)
        }
    }, [])

    useEffect(() => {
        const checkDeviceType = () => {
            const screenWidth = window.innerWidth;
            if (screenWidth >= 1060) {
                setDeviceType('Desktop');
            } else if (screenWidth >= 768) {
                setDeviceType('Tablet');
            } else {
                setDeviceType('Mobile');
            }
        };

        // Initial check when the component mounts
        checkDeviceType();

        // Add a listener to update the device type when the window is resized
        window.addEventListener('resize', checkDeviceType);

        // Clean up the listener when the component unmounts
        return () => {
        window.removeEventListener('resize', checkDeviceType);
        };
    }, []);

    // Check for changes in device type
    useEffect(() => {
        if (deviceType !== prevDeviceType) {
            // Device type has changed
            // console.log(`Device type changed from ${prevDeviceType} to ${deviceType}`);
            if(prevDeviceType == 'Desktop') setIsOpen(true)
            if(deviceType == 'Desktop') setIsOpen(false)

            setPrevDeviceType(deviceType);
        }
    }, [deviceType, prevDeviceType]);

    const checkScreenToggle = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 1060) {
            setIsOpen(true)
        }
    }

    return (
        <aside style={{animation: !isOpen ? "slide-to-right 0.2s" : "slide-out-left 0.2s", left: !isOpen ? '0px' : '-400px'}} className={`absolute md:relative scrollbar-hide z-20 w-full xs:w-64 overflow-y-auto bg-white dark:bg-gray-800 md:block flex-shrink-0 transition-all h-screen`}>
            <div className="py-4 text-gray-500 dark:text-gray-400">
                <div className='flex justify-between items-start'>
                    <Link className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200" to="/">
                        RazorScythe
                    </Link>
                    <button
                        className={`p-1 -ml-1 mr-5 rounded-md ${isOpen && 'hidden'} md:hidden focus:outline-none focus:shadow-outline-purple`}
                        aria-label="Menu"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <svg
                            className="w-6 h-6"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                            fill-rule="evenodd"
                            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clip-rule="evenodd"
                            ></path>
                        </svg>
                    </button>
                </div>
                <ul className="mt-6">
                    <li className="relative px-6 py-3">

                        { (firstPath === '' || firstPath === undefined) && <span className="absolute inset-y-0 left-0 w-1 bg-blue-600 rounded-tr-lg rounded-br-lg" aria-hidden="true"></span> }

                        {/* text-gray-800 dark:text-gray-100 */}
                        <Link to="/account" style={{color: (firstPath === '' || firstPath === undefined) && 'rgb(31 41 55)'}} className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                        <svg
                            className="w-5 h-5"
                            aria-hidden="true"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            ></path>
                        </svg>
                        <span className="ml-4">Dashboard</span>
                        </Link>
                    </li>
                    </ul>
                    <ul>
                    <li className="relative px-6 py-3">
                        { firstPath === 'portfolio' && <span className="absolute inset-y-0 left-0 w-1 h-12 bg-blue-600 rounded-tr-lg rounded-br-lg" aria-hidden="true"></span> }

                        <Link to='/account/portfolio' style={{color: (firstPath === 'portfolio') && 'rgb(31 41 55)'}} className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200" href="/admin/portfolio">
                            <button
                                className="inline-flex items-center justify-between w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                                onClick={() => setOpen({...open, portfolio: !open.portfolio})}
                                aria-haspopup="true"
                            >
                                <span className="inline-flex items-center">
                                    <svg
                                        className="w-5 h-5 "
                                        aria-hidden="true"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                        ></path>
                                    </svg>
                                    <span className="ml-4">Portfolio</span>
                                </span>
                                <svg
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                    ></path>
                                </svg>
                            </button>
                        </Link>

                        {
                            open.portfolio &&
                            <ul
                                x-transition:enter="transition-all ease-in-out duration-300"
                                x-transition:enter-start="opacity-25 max-h-0"
                                x-transition:enter-end="opacity-100 max-h-xl"
                                x-transition:leave="transition-all ease-in-out duration-300"
                                x-transition:leave-start="opacity-100 max-h-xl"
                                x-transition:leave-end="opacity-0 max-h-0" 
                                className="p-2 mt-2 space-y-2 overflow-hidden text-sm font-medium text-gray-500 rounded-md shadow-inner bg-gray-50 dark:text-gray-400 dark:bg-gray-900"
                                aria-label="submenu"
                                >
                                <li style={{color: (portfolioPage === 'hero' || (portfolioPage === '' || portfolioPage === null)) && 'rgb(31 41 55)'}} className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link onClick={() => checkScreenToggle()} className="w-full" to="/account/portfolio?navigation=hero">Hero</Link>
                                </li>
                                <li style={{color: (portfolioPage === 'skillset') && 'rgb(31 41 55)'}} className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link onClick={() => checkScreenToggle()} className="w-full" to="/account/portfolio?navigation=skillset">Skillset</Link>
                                </li>
                                <li style={{color: (portfolioPage === 'services') && 'rgb(31 41 55)'}} className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link onClick={() => checkScreenToggle()} className="w-full" to="/account/portfolio?navigation=services">Services</Link>
                                </li>
                                <li style={{color: (portfolioPage === 'work experience') && 'rgb(31 41 55)'}} className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link onClick={() => checkScreenToggle()} className="w-full" to="/account/portfolio?navigation=work experience">Work Experience</Link>
                                </li>
                                <li style={{color: (portfolioPage === 'projects') && 'rgb(31 41 55)'}} className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link onClick={() => checkScreenToggle()} className="w-full" to="/account/portfolio?navigation=projects">Projects</Link>
                                </li>
                                <li style={{color: (portfolioPage === 'contact') && 'rgb(31 41 55)'}} className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link onClick={() => checkScreenToggle()} className="w-full" to="/account/portfolio?navigation=contact">Contacts</Link>
                                </li>
                            </ul>  
                        }
                    </li>
                    <li className="relative px-6 py-3">
                        <Link to='/account/uploads' style={{color: (firstPath === 'uploads') && 'rgb(31 41 55)'}} className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200" href="/admin/portfolio">
                            <button
                                className="inline-flex items-center justify-between w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                                onClick={() => setOpen({...open, uploads: !open.uploads})}
                                aria-haspopup="true"
                            >
                                <span className="inline-flex items-center">
                                    <svg
                                        className="w-5 h-5"
                                        aria-hidden="true"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                        ></path>
                                    </svg>
                                    <span className="ml-4">Uploads</span>
                                </span>
                                <svg
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                    ></path>
                                </svg>
                            </button>
                        </Link>

                        {
                            open.uploads &&
                            <ul
                                x-transition:enter="transition-all ease-in-out duration-300"
                                x-transition:enter-start="opacity-25 max-h-0"
                                x-transition:enter-end="opacity-100 max-h-xl"
                                x-transition:leave="transition-all ease-in-out duration-300"
                                x-transition:leave-start="opacity-100 max-h-xl"
                                x-transition:leave-end="opacity-0 max-h-0" 
                                className="p-2 mt-2 space-y-2 overflow-hidden text-sm font-medium text-gray-500 rounded-md shadow-inner bg-gray-50 dark:text-gray-400 dark:bg-gray-900"
                                aria-label="submenu"
                                >
                                <li style={{color: (paramIndex || checkParams('video')) && 'rgb(31 41 55)'}} className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link onClick={() => checkScreenToggle()} className="w-full" to="/account/uploads?type=video">Videos</Link>
                                </li>
                                <li style={{color: checkParams('games') && 'rgb(31 41 55)'}} className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link onClick={() => checkScreenToggle()} className="w-full" to="/account/uploads?type=games">Games</Link>
                                </li>
                                <li style={{color: checkParams('blogs') && 'rgb(31 41 55)'}} className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link onClick={() => checkScreenToggle()} className="w-full" to="/account/uploads?type=blogs">Blogs</Link>
                                </li>
                            </ul>  
                        }
                    </li>
                    <li className="relative px-6 py-3">
                        { firstPath === 'projects' && <span className="absolute inset-y-0 left-0 w-1 h-12 bg-blue-600 rounded-tr-lg rounded-br-lg" aria-hidden="true"></span> }
                        <Link
                        style={{color: (firstPath === 'projects') && 'rgb(31 41 55)'}}
                        className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                        to="/account/projects"
                        >
                        <FontAwesomeIcon icon={faProjectDiagram} className="" />
                        <span className="ml-4">Projects</span>
                        </Link>
                    </li>
                    <li className="relative px-6 py-3">
                        <Link
                        className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                        href="../charts.html"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bag" viewBox="0 0 16 16">
                            <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>
                        </svg>
                        <span className="ml-4">Store</span>
                        </Link>
                    </li>
                    <li className="relative px-6 py-3">
                        { firstPath === 'settings' && <span className="absolute inset-y-0 left-0 w-1 h-12 bg-blue-600 rounded-tr-lg rounded-br-lg" aria-hidden="true"></span> }
                        <Link
                        style={{color: (firstPath === 'settings') && 'rgb(31 41 55)'}}
                        className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                        to="/account/settings"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
                            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                        </svg>
                        <span className="ml-4">Settings</span>
                        </Link>
                    </li>
                    <li className="relative px-6 py-3">
                    { firstPath === 'manage' && <span className="absolute inset-y-0 left-0 w-1 h-12 bg-blue-600 rounded-tr-lg rounded-br-lg" aria-hidden="true"></span> }
                        <Link
                        className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                        to="/account/manage"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
                            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
                        </svg>
                        <span className="ml-4">Users</span>
                        </Link>
                    </li>
                    <li className="relative px-6 py-3">
                        <button
                            className="inline-flex items-center justify-between w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                            onClick={() => setOpen({...open, pages: !open.pages})}
                            aria-haspopup="true"
                        >
                        <span className="inline-flex items-center">
                            <svg
                            className="w-5 h-5"
                            aria-hidden="true"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            >
                            <path
                                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                            ></path>
                            </svg>
                            <span className="ml-4">Pages</span>
                        </span>
                        <svg
                            className="w-4 h-4"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                            ></path>
                        </svg>
                        </button>
                        {
                            open.pages &&
                            <ul
                                x-transition:enter="transition-all ease-in-out duration-300"
                                x-transition:enter-start="opacity-25 max-h-0"
                                x-transition:enter-end="opacity-100 max-h-xl"
                                x-transition:leave="transition-all ease-in-out duration-300"
                                x-transition:leave-start="opacity-100 max-h-xl"
                                x-transition:leave-end="opacity-0 max-h-0" 
                                className="p-2 mt-2 space-y-2 overflow-hidden text-sm font-medium text-gray-500 rounded-md shadow-inner bg-gray-50 dark:text-gray-400 dark:bg-gray-900"
                                aria-label="submenu"
                                >
                                <li className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link className="w-full" href="./login.html">Login</Link>
                                </li>
                                <li className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link className="w-full" href="./create-account.html">
                                    Create account
                                    </Link>
                                </li>
                                <li className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link className="w-full" href="./forgot-password.html">
                                    Forgot password
                                    </Link>
                                </li>
                                <li className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link className="w-full" href="./404.html">404</Link>
                                </li>
                                <li className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200">
                                    <Link className="w-full" href="./blank.html">Blank</Link>
                                </li>
                            </ul>  
                        }
                        </li>
                    </ul>
                <div className="px-6 my-6">
                <button
                    className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-lg active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-purple"
                >
                    Create account
                    <span className="ml-2" aria-hidden="true">+</span>
                </button>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
