import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import CountUp from 'react-countup';
import styles from '../../style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons/faPen';
import { faCogs, faLock } from '@fortawesome/free-solid-svg-icons';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';
const Header = ({ heading, description, button_text, show_button = true, button_secondary_text, button_link, api_call, setSubmitted, submitted, data = [], grid_type = 'half' }) => {


    const dispatch = useDispatch()

    const handleClick = () => {
        if(!api_call) return

        if(!submitted){
            dispatch(api_call)
            setSubmitted(true)
        }
    }

    const GridCards = () => {
        return (
            <div class={grid_type === 'half' ? `grid gap-6 mb-4 sm:grid-cols-2 grid-cols-1 mt-4` : `grid gap-6 mb-4 md:grid-cols-4 sm:grid-cols-2 grid-cols-1 mt-4`}>
                {
                    data.length > 0 &&
                    data.map((item, index) => {
                        return (
                            <div key={index}>
                                {
                                    item.label === 'user_visit' ?
                                    <div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                        <div class="p-3 mr-4 text-teal-500 bg-teal-100 rounded-full dark:text-teal-100 dark:bg-teal-500">
                                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">User Visits</p>
                                            <p class="text-lg font-semibold text-gray-700 dark:text-gray-200"><CountUp end={item.value} duation={5}/></p>
                                        </div>
                                    </div>
                                    :
                                    item.label === 'form_submit' ?
                                    <div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                        <div class="p-3 mr-4 text-blue-600 bg-blue-100 rounded-full dark:text-blue-100 dark:bg-blue-500">
                                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Form Submitted</p>
                                            <p class="text-lg font-semibold text-gray-700 dark:text-gray-200"><CountUp end={item.value} duation={5}/></p>
                                        </div>
                                    </div>
                                    :
                                    item.label === 'videos' ?
                                    <div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                        <div class="p-3 mr-4 text-red-600 bg-red-100 rounded-full dark:text-red-100 dark:bg-red-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-btn-fill" viewBox="0 0 16 16">
                                                <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm6.79-6.907A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Uploaded Videos</p>
                                            <p class="text-lg font-semibold text-gray-700 dark:text-gray-200"><CountUp end={item.value} duation={5}/></p>
                                        </div>
                                    </div>
                                    :
                                    item.label === 'games' ?
                                    <div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                        <div class="p-3 mr-4 text-blue-600 bg-blue-100 rounded-full dark:text-blue-100 dark:bg-blue-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-controller" viewBox="0 0 16 16">
                                                <path d="M11.5 6.027a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm2.5-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm-6.5-3h1v1h1v1h-1v1h-1v-1h-1v-1h1v-1z"/>
                                                <path d="M3.051 3.26a.5.5 0 0 1 .354-.613l1.932-.518a.5.5 0 0 1 .62.39c.655-.079 1.35-.117 2.043-.117.72 0 1.443.041 2.12.126a.5.5 0 0 1 .622-.399l1.932.518a.5.5 0 0 1 .306.729c.14.09.266.19.373.297.408.408.78 1.05 1.095 1.772.32.733.599 1.591.805 2.466.206.875.34 1.78.364 2.606.024.816-.059 1.602-.328 2.21a1.42 1.42 0 0 1-1.445.83c-.636-.067-1.115-.394-1.513-.773-.245-.232-.496-.526-.739-.808-.126-.148-.25-.292-.368-.423-.728-.804-1.597-1.527-3.224-1.527-1.627 0-2.496.723-3.224 1.527-.119.131-.242.275-.368.423-.243.282-.494.575-.739.808-.398.38-.877.706-1.513.773a1.42 1.42 0 0 1-1.445-.83c-.27-.608-.352-1.395-.329-2.21.024-.826.16-1.73.365-2.606.206-.875.486-1.733.805-2.466.315-.722.687-1.364 1.094-1.772a2.34 2.34 0 0 1 .433-.335.504.504 0 0 1-.028-.079zm2.036.412c-.877.185-1.469.443-1.733.708-.276.276-.587.783-.885 1.465a13.748 13.748 0 0 0-.748 2.295 12.351 12.351 0 0 0-.339 2.406c-.022.755.062 1.368.243 1.776a.42.42 0 0 0 .426.24c.327-.034.61-.199.929-.502.212-.202.4-.423.615-.674.133-.156.276-.323.44-.504C4.861 9.969 5.978 9.027 8 9.027s3.139.942 3.965 1.855c.164.181.307.348.44.504.214.251.403.472.615.674.318.303.601.468.929.503a.42.42 0 0 0 .426-.241c.18-.408.265-1.02.243-1.776a12.354 12.354 0 0 0-.339-2.406 13.753 13.753 0 0 0-.748-2.295c-.298-.682-.61-1.19-.885-1.465-.264-.265-.856-.523-1.733-.708-.85-.179-1.877-.27-2.913-.27-1.036 0-2.063.091-2.913.27z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Uploaded Games</p>
                                            <p class="text-lg font-semibold text-gray-700 dark:text-gray-200"><CountUp end={item.value} duation={5}/></p>
                                        </div>
                                    </div>
                                    :
                                    item.label === 'blogs' &&
                                    <div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                        <div class="p-3 mr-4 text-yellow-600 bg-yellow-100 rounded-full dark:text-yellow-100 dark:bg-yellow-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Uploaded Blogs</p>
                                            <p class="text-lg font-semibold text-gray-700 dark:text-gray-200"><CountUp end={item.value} duation={5}/></p>
                                        </div>
                                    </div>
                                }
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    return (
        <div className="relative bg-[#F9FAFB] border-b border-solid border-[#CAD5DF]">   
            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="container mx-auto relative px-0 pt-12 pb-8 ">
                        <div className="lg:flex md:flex">
                            <div className="lg:w-1/2 md:w-1/2 w-full">
                                <h2 className='text-4xl font-semibold text-gray-800 mb-1 capitalize font-poppins leading-none tracking-wide'>{ heading || 'Welcome' }</h2>
                                <p className='text-base text-gray-600 font-semibold'>{ description || 'Select a website to manage, or create a new one from scratch.' }</p>
                            </div>
                            <div className="lg:w-1/2 md:w-1/2 w-full flex items-center md:justify-end justify-start mt-4">
                                {
                                    heading === 'Portfolio' &&
                                        <button className="flex items-center justify-between px-8 py-2 mr-2 text-sm font-medium leading-5 hover:text-white text-blue-600 transition-colors duration-150 bg-transparent  border border-blue-600 rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline-purple">
                                            Layout
                                            <FontAwesomeIcon icon={faCogs} className='w-4 h-4 ml-3'/>
                                        </button>
                                }
                                
                                {
                                    show_button && (
                                        button_link ? 
                                        <Link onClick={handleClick} to={button_link || "#"}>
                                            <button className="my-8 w-full bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-8 border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out">
                                                { button_text || 'Explore Now!' }
                                            </button>
                                        </Link>
                                        :
                                        <button onClick={handleClick} className="flex items-center justify-between px-8 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-md active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-purple">
                                            {
                                                !submitted ?
                                                    <>
                                                    {
                                                        button_text || 'Explore Now!' 
                                                    }
                                                    {
                                                        heading === 'Portfolio' && (
                                                            button_text === 'Published' ?
                                                            <FontAwesomeIcon icon={faPen} className='w-3 h-3 ml-3'/>
                                                            :
                                                            <FontAwesomeIcon icon={faLock} className='w-3 h-3 ml-3'/>
                                                        )
                                                    }
                                                    </>
                                                    :
                                                    <div className='flex flex-row justify-center items-center'>
                                                        { button_secondary_text || 'Explore Now!' }
                                                        <div role="status">
                                                            <svg aria-hidden="true" class="w-5 h-5 ml-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                                            </svg>
                                                            <span class="sr-only">Loading...</span>
                                                        </div>
                                                    </div>
                                            }
                                            
                                        </button>
                                    )
                                }
                            </div>
                        </div>
                        <div className="lg:w-1/2 md:w-1/2 w-full">
                            {
                                grid_type === 'half' &&
                                    <GridCards type={grid_type} />
                            }
                        </div>
                        {
                            grid_type === 'full' &&
                                <GridCards type={grid_type} />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header