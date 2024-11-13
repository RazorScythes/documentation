import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { main, dark, light } from '../../style';
import Avatar from './Avatar';
import Pagination from './Pagination';

const Table = ({ theme }) => {
    const [pagination, setPagination] = useState(null)

    const itemsPerPage = 2;

    const [pageIndex, setPageIndex] = useState(1)
    const [currentPage, setCurrentPage] = useState(pageIndex);
    const [data, setData] = useState({activity_logs: [{
        "_id": "671f4afa4f08c1947ed4e077",
        "user": {
            "_id": "641730c1637f7ac77c72fb91",
            "username": "Zantei25",
            "role": "Admin",
            "avatar": "https://drive.google.com/uc?export=view&id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V"
        },
        "type": "blog",
        "method": "PATCH",
        "message": "Updated blog",
        "id": "649860071075e8ba6fadc7ef",
        "createdAt": "2024-10-28T08:27:38.965Z",
        "updatedAt": "2024-10-28T08:27:38.965Z",
        "__v": 0
    },{
        "_id": "671f4afa4f08c1947ed4e077",
        "user": {
            "_id": "641730c1637f7ac77c72fb91",
            "username": "Zantei25",
            "role": "Admin",
            "avatar": "https://drive.google.com/uc?export=view&id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V"
        },
        "type": "blog",
        "method": "PATCH",
        "message": "Updated blog",
        "id": "649860071075e8ba6fadc7ef",
        "createdAt": "2024-10-28T08:27:38.965Z",
        "updatedAt": "2024-10-28T08:27:38.965Z",
        "__v": 0
    }]})

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const totalPages = Math.ceil(data?.activity_logs?.length / itemsPerPage);

    return (
        <div class={`xs:w-full overflow-hidden rounded-sm`}>
            <h2 className="text-lg font-medium mb-3">Table Title</h2>
            <div class="xs:w-full overflow-hidden rounded-sm">
                <div class="w-full overflow-x-auto">
                    <table class="min-w-full overflow-x-auto whitespace-no-wrap">
                        <thead className={`${theme === 'light' ? light.thirdbackground : dark.thirdbackground}`}>
                            <tr class="font-medium">
                                <td class="px-4 py-3">User</td>
                                <td class="px-4 py-3">Type</td>
                                <td class="px-4 py-3">Message</td>
                                <td class="px-4 py-3">Method</td>
                                <td class="px-4 py-3">Timestamp</td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data?.activity_logs?.length > 0 &&
                                data.activity_logs.slice(startIndex, endIndex).map((item, index) => {
                                    return (
                                        <tr class={`border-b border-solid ${theme === 'light' ? light.border : dark.semiborder} ${theme === 'light' ? light.row : dark.row}`}>
                                            <td class="px-4 py-3">
                                                <div class="flex items-center">
                                                    <div
                                                        className="relative w-8 h-8 mr-3 rounded-full"
                                                    >
                                                        <Avatar 
                                                            theme={theme}
                                                            image={''}
                                                            size={8}
                                                        />
                                                        <div
                                                            className="absolute inset-0 rounded-full shadow-inner"
                                                            aria-hidden="true"
                                                        ></div>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.user.username}</p>
                                                        {
                                                            item.user.role === 'Admin' ? <p className="text-xs font-medium text-[#DC2626]">Admin</p> :
                                                            item.user.role === 'Moderator' ? <p className="text-xs font-medium text-[#FFAA33]">Moderator</p> 
                                                            : <p class="text-xs font-medium text-[#2563EB]">User</p>
                                                        }
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-4 py-3">
                                                Type
                                            </td>
                                            <td class="px-4 py-3">
                                                {item.message}
                                            </td>
                                            <td class="px-4 py-3">
                                                Method
                                            </td>
                                            <td class="px-4 py-3">
                                                {item.createdAt}
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
                <div class="md:block hidden px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    <div className='flex items-center justify-between'>
                        <span class="flex items-center col-span-3">
                            Showing { (endIndex >= data?.activity_logs?.length) ? data?.activity_logs.length : endIndex } of {data?.activity_logs?.length }
                        </span>

                        <Pagination 
                            data={data.activity_logs}
                            theme={theme}
                            limit={1}
                            setPagination={setPagination}
                            numberOnly={true}
                            table={true}
                        />
                    </div>
                </div>
            </div>

            <div class="md:hidden block px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                <div className='flex items-center justify-between'>
                    <span class="flex items-center col-span-3">
                        Showing { (endIndex >= data?.activity_logs?.length) ? data?.activity_logs.length : endIndex } of {data?.activity_logs?.length }
                    </span> 

                    <Pagination 
                        data={data.activity_logs}
                        theme={theme}
                        limit={1}
                        setPagination={setPagination}
                        numberOnly={true}
                        table={true}
                    />
                </div>
            </div>
        </div>
    )
}

export default Table