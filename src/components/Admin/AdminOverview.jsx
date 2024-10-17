import React, { useEffect, useState } from 'react'
import styles from '../../style'
import { Header } from './index'
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from 'react-redux'
import { getOverviewData } from '../../actions/admin';
import { convertDriveImageLink } from '../Tools'

import CountUp from 'react-countup';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

import moment from 'moment-timezone';
import Avatar from '../../assets/avatar.png'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
const AdminOverview = ({ user, path }) => {

    const dispatch = useDispatch()

    const overview = useSelector((state) => state.admin.data)
    const itemsPerPage = 10; // Number of items per page

    const [pageIndex, setPageIndex] = useState(1)
    const [currentPage, setCurrentPage] = useState(pageIndex);
    const [open, setOpen] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [data, setData] = useState({})
    const [displayedPages, setDisplayedPages] = useState([]);

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const totalPages = Math.ceil(data?.activity_logs?.length / itemsPerPage); // Total number of pages

    useEffect(() => {
        if(!user) navigate(`/`)
        dispatch(getOverviewData())
    }, [])

    useEffect(() => {
        if (Object.keys(overview).length > 0) {
            setData(overview)
        }
    }, [overview])

    useEffect(() => {
        window.scrollTo(0, 0)
        const calculateDisplayedPages = () => {
            const pagesToShow = [];
            const maxDisplayedPages = 5; // Maximum number of page buttons to display
        
            if (totalPages <= maxDisplayedPages) {
                // If total pages are less than or equal to the maximum, display all pages
                for (let i = 1; i <= totalPages; i++) {
                    pagesToShow.push(i);
                }
            } else {
                let startPage;
                let endPage;
        
                if (currentPage <= Math.floor(maxDisplayedPages / 2)) {
                // If current page is close to the beginning
                    startPage = 1;
                    endPage = maxDisplayedPages;
                } else if (currentPage >= totalPages - Math.floor(maxDisplayedPages / 2)) {
                    // If current page is close to the end
                    startPage = totalPages - maxDisplayedPages + 1;
                    endPage = totalPages;
                } else {
                    // If current page is in the middle
                    startPage = currentPage - Math.floor(maxDisplayedPages / 2);
                    endPage = currentPage + Math.floor(maxDisplayedPages / 2);
                }
        
                for (let i = startPage; i <= endPage; i++) {
                    pagesToShow.push(i);
                }
            }
        
            setDisplayedPages(pagesToShow);
        };
    
        calculateDisplayedPages();
    }, [currentPage, totalPages, pageIndex]);
    
    useEffect(() => {
        setCurrentPage(pageIndex)
    }, [pageIndex])

    const dateFormat = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
        return formattedDate
    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        setPageIndex(pageNumber)
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
            <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} open={open} setOpen={setOpen} path={path}/>
            <div class="flex flex-col flex-1">
                <AdminNavbar isOpen={isOpen} setIsOpen={setIsOpen} path={path}/>
                <main class="h-full pb-16 overflow-y-auto">
                    <div class="mx-auto grid">  
                        {/* <Header 
                            heading='Welcome'
                            description="Select a website to manage, or create a new one from scratch."
                            button_text="Explore Now!"
                            button_link={`#`}
                        /> */}
                        <div className="relative bg-[#F0F4F7] pt-8">   
                            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                                <div className={`${styles.boxWidthEx}`}>
                                    <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2  grid-cols-1 gap-4">
                                        <div style={{borderColor: "#CD3242"}} className='relative font-poppins grid grid-cols-3 rounded-sm w-full border-l-[6px] border-solid bg-gray-100 shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] px-6 py-4'>
                                            <div className='col-span-2'>
                                                <p className='text-gray-800 font-semibold text-lg'>Total Users</p>
                                                <Link to={`/archive/`}><p style={{color: "#CD3242"}} className='[text-shadow:_0_2px_0_rgb(0_0_0_/_30%)] text-2xl my-2 font-semibold'><CountUp end={data?.users_count ? data.users_count.users_count : 0} duration={2}/></p></Link>
                                                <p className='text-gray-800 text-sm'>{moment(data?.users_count?.latest_user.createdAt).fromNow()}</p>
                                            </div>
                                            <div className='flex items-center justify-end'>
                                                <FontAwesomeIcon icon={['fas', 'fa-user']} title={'test'} style={{color: "#FFF", background: "#CD3242", borderColor: "#CD3242"}}  className='text-xl transition-all p-4 border rounded-full'/>
                                            </div>
                                        </div>

                                        <div style={{borderColor: "#15CA20"}} className='relative font-poppins grid grid-cols-3 rounded-sm w-full border-l-[6px] border-solid bg-gray-100 shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] px-6 py-4'>
                                            <div className='col-span-2'>
                                                <p className='text-gray-800 font-semibold text-lg'>Total Videos</p>
                                                <Link to={`/archive/`}><p style={{color: "#15CA20"}} className='[text-shadow:_0_2px_0_rgb(0_0_0_/_50%)] text-2xl my-2 font-semibold'><CountUp end={data?.video_count ? data.video_count.video_count : 0} duration={2}/></p></Link>
                                                <p className='text-gray-800 text-sm'>{moment(data?.video_count?.latest_video.createdAt).fromNow()}</p>
                                            </div>
                                            <div className='flex items-center justify-end'>
                                                <FontAwesomeIcon icon={['fas', 'fa-video']} title={'test'} style={{color: "#FFF", background: "#15CA20", borderColor: "#15CA20"}}  className='text-xl transition-all p-4 border rounded-full'/>
                                            </div>
                                        </div>

                                        <div style={{borderColor: "#0DCAF0"}} className='relative font-poppins grid grid-cols-3 rounded-sm w-full border-l-[6px] border-solid bg-gray-100 shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] px-6 py-4'>
                                            <div className='col-span-2'>
                                                <p className='text-gray-800 font-semibold text-lg'>Total Games</p>
                                                <Link to={`/archive/`}><p style={{color: "#0DCAF0"}} className='[text-shadow:_0_2px_0_rgb(0_0_0_/_50%)] text-2xl my-2 font-semibold'><CountUp end={data?.games_count ? data.games_count.games_count : 0} duration={2}/></p></Link>
                                                <p className='text-gray-800 text-sm'>{moment(data?.games_count?.latest_game.createdAt).fromNow()}</p>
                                            </div>
                                            <div className='flex items-center justify-end'>
                                                <FontAwesomeIcon icon={['fas', 'fa-gamepad']} title={'test'} style={{color: "#FFF", background: "#0DCAF0", borderColor: "#0DCAF0"}}  className='text-xl transition-all p-4 border rounded-full'/>
                                            </div>
                                        </div>

                                        <div style={{borderColor: "#FFC20D"}} className='relative font-poppins grid grid-cols-3 rounded-sm w-full border-l-[6px] border-solid bg-gray-100 shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] px-6 py-4'>
                                            <div className='col-span-2'>
                                                <p className='text-gray-800 font-semibold text-lg'>Total Blogs</p>
                                                <Link to={`/archive/`}><p style={{color: "#FFC20D"}} className='[text-shadow:_0_2px_0_rgb(0_0_0_/_50%)] text-2xl my-2 font-semibold'><CountUp end={data?.blogs_count ? data.blogs_count.blogs_count : 0} duration={2}/></p></Link>
                                                <p className='text-gray-800 text-sm'>{moment(data?.blogs_count?.latest_blog.createdAt).fromNow()}</p>
                                            </div>
                                            <div className='flex items-center justify-end'>
                                                <FontAwesomeIcon icon={['fas', 'fa-note-sticky']} title={'test'} style={{color: "#FFF", background: "#FFC20D", borderColor: "#FFC20D"}}  className='text-xl transition-all p-4 border rounded-full'/>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-3 grid-cols-1 gap-4 mt-8 font-poppins">
                                        <div class="xs:w-full overflow-hidden rounded-sm shadow-xs sm:col-span-2">
                                            <p className='text-gray-800 font-semibold text-lg mb-2'>Recent Activity</p>
                                            <div class="xs:w-full overflow-hidden rounded-lg shadow-xs">
                                                <div class="w-full overflow-x-auto">
                                                    <table class="min-w-full overflow-x-auto whitespace-no-wrap">
                                                        <thead>
                                                            <tr
                                                                class="text-sm font-normal text-left text-gray-800 border border-solid dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800"
                                                            >
                                                                <th class="pl-4 py-3">User</th>
                                                                <th class="px-4 py-3">Type</th>
                                                                <th class="px-4 py-3">Message</th>
                                                                <th class="px-4 py-3">Method</th>
                                                                <th class="px-4 py-3">Timestamp</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                                                            {
                                                                data?.activity_logs?.length > 0 &&
                                                                data.activity_logs.slice(startIndex, endIndex).map((item, index) => {
                                                                    return (
                                                                        <tr>
                                                                            <td class="px-4 py-3 text-xs">
                                                                                <div class="flex items-center text-sm">
                                                                                    <div
                                                                                        className="relative w-8 h-8 mr-3 rounded-full"
                                                                                    >
                                                                                        <img
                                                                                            className="object-cover w-full h-full rounded-full"
                                                                                            src={item.user.avatar ? convertDriveImageLink(item.user.avatar) : Avatar}
                                                                                            alt=""
                                                                                            loading="lazy"
                                                                                        />
                                                                                        <div
                                                                                            className="absolute inset-0 rounded-full shadow-inner"
                                                                                            aria-hidden="true"
                                                                                        ></div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="font-semibold">{item.user.username}</p>
                                                                                        {
                                                                                            item.user.role === 'Admin' ? <p className="text-xs font-semibold text-[#DC2626]">Admin</p> :
                                                                                            item.user.role === 'Moderator' ? <p className="text-xs font-semibold text-[#FFAA33]">Moderator</p> 
                                                                                            : <p class="text-xs font-semibold text-[#2563EB]">User</p>
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td class="px-4 py-3 text-xs">
                                                                                {
                                                                                    item.type === 'video' ?
                                                                                    <div className='w-14 px-2 py-1 rounded-lg bg-[#15CA20] text-[#FFF] font-bold text-center [text-shadow:_0_2px_0_rgb(0_0_0_/_30%)]'>video</div>
                                                                                    : item.type === 'game' ?
                                                                                    <div className='w-14 px-2 py-1 rounded-lg bg-[#0DCAF0] text-[#FFF] font-bold text-center [text-shadow:_0_2px_0_rgb(0_0_0_/_30%)]'>game</div>
                                                                                    : item.type === 'blog' ?
                                                                                    <div className='w-14 px-2 py-1 rounded-lg bg-[#FFC20D] text-[#FFF] font-bold text-center [text-shadow:_0_2px_0_rgb(0_0_0_/_30%)]'>blog</div>
                                                                                    : item.type === 'user' &&
                                                                                    <div className='w-14 px-2 py-1 rounded-lg bg-[#CD3242] text-[#FFF] font-bold text-center [text-shadow:_0_2px_0_rgb(0_0_0_/_30%)]'>user</div>
                                                                                }
                                                                            </td>
                                                                            <td class="px-4 py-3 text-sm font-sans">
                                                                                {item.message}
                                                                            </td>
                                                                            <td class="px-4 py-3 text-xs">
                                                                                {
                                                                                    item.method === 'GET' ?
                                                                                    <div className='w-12 px-2 py-1 rounded-lg bg-[#15CA20] text-[#FFF] font-semibold text-center [text-shadow:_0_2px_0_rgb(0_0_0_/_50%)]'>GET</div>
                                                                                    : item.method === 'POST' ?
                                                                                    <div className='w-12 px-2 py-1 rounded-lg bg-[#0DCAF0] text-[#FFF] font-semibold text-center [text-shadow:_0_2px_0_rgb(0_0_0_/_50%)]'>POST</div>
                                                                                    : item.method === 'PATCH' ?
                                                                                    <div className='w-14 px-2 py-1 rounded-lg bg-[#FFC20D] text-[#FFF] font-semibold text-center [text-shadow:_0_2px_0_rgb(0_0_0_/_50%)]'>PATCH</div>
                                                                                    : item.method === 'DELETE' &&
                                                                                    <div className='w-14 px-2 py-1 rounded-lg bg-[#CD3242] text-[#FFF] font-semibold text-center [text-shadow:_0_2px_0_rgb(0_0_0_/_30%)]'>DELETE</div>
                                                                                }
                                                                            </td>
                                                                            <td class="px-4 py-3 text-sm font-sans">
                                                                                {dateFormat(item.createdAt)}
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div
                                                    class="md:block hidden px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800"
                                                    >
                                                    <div className='flex items-center justify-between'>
                                                        <span class="flex items-center col-span-3">
                                                            Showing {(endIndex >= data?.activity_logs?.length) ? data?.activity_logs.length : endIndex } of {data?.activity_logs?.length}
                                                        </span>

                                                        <div className='flex flex-wrap items-center justify-center'>
                                                            <button
                                                                disabled={currentPage === 1}
                                                                onClick={() => handlePageChange(currentPage - 1)}
                                                                className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                                            >
                                                                <FontAwesomeIcon icon={faArrowLeft}/>
                                                            </button>
                                                            {displayedPages.map((pageNumber) => (
                                                                <button 
                                                                    key={pageNumber}
                                                                    onClick={() => handlePageChange(pageNumber)}
                                                                    style={{backgroundColor: pageIndex === pageNumber && "#d1d5db"}} className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                                                >
                                                                {pageNumber}
                                                                </button>
                                                            ))}
                                                            <button
                                                                disabled={currentPage === totalPages}
                                                                onClick={() => handlePageChange(currentPage + 1)}
                                                                className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                                            >
                                                                <FontAwesomeIcon icon={faArrowRight}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                class="md:hidden block px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800"
                                                >
                                                <div className='flex items-center justify-between'>
                                                    <span class="flex items-center col-span-3">
                                                        Showing {(endIndex >= data?.activity_logs?.length) ? data?.activity_logs.length : endIndex } of {data?.activity_logs?.length}
                                                    </span>

                                                    <div className='flex flex-wrap items-center justify-center'>
                                                        <button
                                                            disabled={currentPage === 1}
                                                            onClick={() => handlePageChange(currentPage - 1)}
                                                            className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                                        >
                                                            <FontAwesomeIcon icon={faArrowLeft}/>
                                                        </button>
                                                        {displayedPages.map((pageNumber) => (
                                                            <button 
                                                                key={pageNumber}
                                                                onClick={() => handlePageChange(pageNumber)}
                                                                style={{backgroundColor: pageIndex === pageNumber && "#d1d5db"}} className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                                            >
                                                            {pageNumber}
                                                            </button>
                                                        ))}
                                                        <button
                                                            disabled={currentPage === totalPages}
                                                            onClick={() => handlePageChange(currentPage + 1)}
                                                            className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                                        >
                                                            <FontAwesomeIcon icon={faArrowRight}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="xs:w-full overflow-hidden rounded-sm shadow-xs">
                                            <p className='text-gray-800 font-semibold text-lg mb-2'>User Contribution</p>
                                            <div class="w-full overflow-x-auto">
                                                <table class="min-w-full overflow-x-auto whitespace-no-wrap">
                                                    <thead>
                                                        <tr
                                                            class="text-sm font-normal text-left text-gray-800 border border-solid dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800"
                                                        >
                                                            <th class="pl-4 py-3">User</th>
                                                            <th class="px-4 py-3">Points</th>
                                                        </tr>
                                                    </thead>
                                                        <tbody class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                                                            {   
                                                                data?.users?.length > 0 &&
                                                                data?.users.map((item, index) => {
                                                                    return (
                                                                        <tr key={index}>
                                                                            <td class="px-4 py-3 text-xs">
                                                                                <div class="flex items-center text-sm font-poppins">
                                                                                    <div
                                                                                        className="relative w-8 h-8 mr-3 rounded-full="
                                                                                    >
                                                                                        <img
                                                                                            className="object-cover w-full h-full rounded-full"
                                                                                            src={item.avatar ? convertDriveImageLink(item.avatar) : Avatar}
                                                                                            alt=""
                                                                                            loading="lazy"
                                                                                        />
                                                                                        <div
                                                                                            className="absolute inset-0 rounded-full shadow-inner"
                                                                                            aria-hidden="true"
                                                                                        ></div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="font-semibold">{item.username}</p>
                                                                                        {
                                                                                            item.role === 'Admin' ? <p className="text-xs font-semibold text-[#DC2626]">Admin</p> :
                                                                                            item.role === 'Moderator' ? <p className="text-xs font-semibold text-[#FFAA33]">Moderator</p> 
                                                                                            : <p class="text-xs font-semibold text-[#2563EB]">User</p>
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td class="px-4 py-3 text-sm">
                                                                                {item.points}
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })
                                                            }
                                                        </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminOverview