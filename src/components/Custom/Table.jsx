import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { main, dark, light } from '../../style';

const Table = ({ theme }) => {
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
    const totalPages = Math.ceil(data?.activity_logs?.length / itemsPerPage);

    return (
        <div class={`xs:w-full overflow-hidden rounded-sm`}>
            <h2 className="text-xl font-medium mb-1">Recent Activity</h2>
            <div class="xs:w-full overflow-hidden rounded-sm">
                <div class="w-full overflow-x-auto">
                    <table class="min-w-full overflow-x-auto whitespace-no-wrap">
                        <thead>
                            <tr
                                class=""
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
    )
}

export default Table