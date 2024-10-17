import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faEdit, faTrash, faVideoCamera, faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight, faEye, faArrowUp, faArrowDown, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Header } from './index'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from "react-router-dom";
import { getAllUsers } from '../../actions/settings';
import { convertDriveImageLink } from '../Tools'
import TableMenu from './TableMenu';
import styles from '../../style'
import Avatar from '../../assets/avatar.png'
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const AdminManage = ({ path, user }) => {

    const dispatch = useDispatch()
    const navigate  = useNavigate()

    const profiles = useSelector((state) => state.settings.users)
    const [deleteId, setDeleteId] = useState([])
    const [searchUser, setSearchUser] = useState('')
    const [users, setUsers] = useState([])
    const [menu, setMenu] = useState(0)

    const [open, setOpen] = useState({
        portfolio: false,
        pages: false,
        uploads: false,
        manage: false,
    })
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if(profiles && profiles.length > 0){
            if(searchUser.length > 0) {
                const keyword = searchUser.toLowerCase();
                const filteredData = profiles.filter((item) =>
                    Object.values(item).some((value) =>
                        String(value).toLowerCase().includes(keyword)
                    )
                );
                setUsers(filteredData);
            }
            else {
                setUsers(profiles)
            }
        }
    }, [profiles])

    useEffect(() => {
        if(!user) navigate(`/`)
        // setOpen({...open, manage: true})
        dispatch(getAllUsers( {
            id: user ? user.result?._id : '',
            role: user ? user.result?.role : '',
        }))
    }, [])

    const itemsPerPage = 10; // Number of items per page

    const [currentPage, setCurrentPage] = useState(1);

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const addDeleteId = (index, id) => {
        const checkId = deleteId.includes(id)

        if(checkId) {
            var arr = deleteId.filter(item => item !== id);
            setDeleteId([...arr])
        }
        else {
            setDeleteId(deleteId.concat(id))
        }
    }

    const deleteMultipleUsers = () => {
        if(confirm(`Are you sure you want to delete ${deleteId.length} video${deleteId.length > 1 ? 's' : ''}?`)){
            // dispatch(bulkRemoveVideo({ 
            //     id: user.result?._id,
            //     videos_id: deleteId
            // }))
            setDeleteId([])
        }
    }

    const handleUserSearch = (event) => {
        const keyword = event.target.value.toLowerCase();
        setSearchUser(event.target.value);

        const filteredData = profiles.filter((item) =>
            Object.values(item).some((value) =>
                String(value).toLowerCase().includes(keyword)
            )
        );
   
        setCurrentPage(1)
        setUsers(filteredData);
    };

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
            <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} open={open} setOpen={setOpen} path={path}/>
            <div class="flex flex-col flex-1">
                <AdminNavbar isOpen={isOpen} setIsOpen={setIsOpen} path={path}/>
                <main class="h-full pb-16 overflow-y-auto">
                    <div class="mx-auto grid"></div>
                        <div className="relative bg-[#F9FAFB]"> 
                            <div className="relative bg-white">   
                                <Header 
                                    heading='Manage Users'
                                    description="Control users permissions and content access."
                                    button_text="Explore Now!"
                                    button_link={`#`}
                                    show_button={false}
                                />
                                <div className="relative bg-[#F9FAFB]">   
                                    <div className={`${styles.marginX} ${styles.flexCenter}`}>
                                        <div className={`${styles.boxWidthEx}`}>
                                            <div className="container mx-auto relative px-0 sm:px-4 py-16">
                                                <div className='min-w-full xs:w-auto w-72'>
                                                   
                                                    <div className='justify-between mb-2 sm:hidden flex mt-4'>
                                                        <div className=''>
                                                            {
                                                                deleteId.length > 0 &&
                                                                    <FontAwesomeIcon title="delete" onClick={() => deleteMultipleUsers()} icon={faTrash} className="px-[12px] py-[10px] bg-red-600 hover:bg-red-700 text-gray-100 rounded-md cursor-pointer transition-all mr-2" />
                                                            }
                                                        </div>  
                                                        <div className="relative w-full max-w-md">
                                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M8.5 1C4.35786 1 1 4.35786 1 8.5C1 12.6421 4.35786 16 8.5 16C10.0983 16 11.5667 15.4201 12.7103 14.4796L16.2929 18.0622C16.6834 18.4527 17.3166 18.4527 17.7071 18.0622C18.0976 17.6717 18.0976 17.0385 17.7071 16.648L14.1245 13.0654C15.04 11.9883 15.5 10.6837 15.5 9.25C15.5 5.41015 12.5899 2.5 8.75 2.5C4.91015 2.5 2 5.41015 2 9.25C2 13.0899 4.91015 16 8.75 16C12.5899 16 15.5 13.0899 15.5 9.25C15.5 7.8163 15.04 6.51169 14.1245 5.4346L10.5419 1.85202C9.60138 1.22149 8.43661 1 7.25 1H8.5ZM8.5 3C11.5376 3 14 5.46243 14 8.5C14 11.5376 11.5376 14 8.5 14C5.46243 14 3 11.5376 3 8.5C3 5.46243 5.46243 3 8.5 3Z"></path>
                                                                </svg>
                                                            </div>
                                                            <input 
                                                                className="block w-full py-2 pl-10 pr-3 leading-5 text-[#5A6C7F] placeholder-gray-500 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                                                                type="text" 
                                                                placeholder="Search" 
                                                                value={searchUser}
                                                                onChange={handleUserSearch}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="relative text-sm">
                                                        <div className="overflow-x-auto sm:mt-4 relative">
                                                            <div className='mb-2 sm:flex hidden justify-between'>
                                                                <div className=''>
                                                                    {
                                                                        deleteId.length > 0 &&
                                                                            <div className='flex'>
                                                                                <button onClick={() => deleteMultipleVideos()} className='w-28 disabled:bg-gray-600 disabled:border-red-700 font-semibold border border-solid border-red-600 bg-red-600 hover:bg-red-700 hover:text-100-800 rounded-sm transition-all text-white p-2'>
                                                                                    Delete ({deleteId.length})
                                                                                </button>
                                                                            </div>
                                                                        }
                                                                </div>  
                                                                <div className="relative w-full max-w-md flex justify-end">
                                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" clipRule="evenodd" d="M8.5 1C4.35786 1 1 4.35786 1 8.5C1 12.6421 4.35786 16 8.5 16C10.0983 16 11.5667 15.4201 12.7103 14.4796L16.2929 18.0622C16.6834 18.4527 17.3166 18.4527 17.7071 18.0622C18.0976 17.6717 18.0976 17.0385 17.7071 16.648L14.1245 13.0654C15.04 11.9883 15.5 10.6837 15.5 9.25C15.5 5.41015 12.5899 2.5 8.75 2.5C4.91015 2.5 2 5.41015 2 9.25C2 13.0899 4.91015 16 8.75 16C12.5899 16 15.5 13.0899 15.5 9.25C15.5 7.8163 15.04 6.51169 14.1245 5.4346L10.5419 1.85202C9.60138 1.22149 8.43661 1 7.25 1H8.5ZM8.5 3C11.5376 3 14 5.46243 14 8.5C14 11.5376 11.5376 14 8.5 14C5.46243 14 3 11.5376 3 8.5C3 5.46243 5.46243 3 8.5 3Z"></path>
                                                                        </svg>
                                                                    </div>
                                                                    <input 
                                                                        className="block w-full py-2 pl-10 pr-3 leading-5 text-[#5A6C7F] placeholder-gray-500 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                                                                        type="text" 
                                                                        placeholder="Search" 
                                                                        value={searchUser}
                                                                        onChange={handleUserSearch}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div class="xs:w-full rounded-lg shadow-xs">
                                                                <div class="w-full">
                                                                    <table class="min-w-full overflow-x-auto whitespace-no-wrap">
                                                                        <thead>
                                                                            <tr
                                                                                class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border border-solid dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800"
                                                                            >
                                                                                <th class="px-4 py-3">Name</th>
                                                                                <th class="px-4 py-3">Username</th>
                                                                                <th class="px-4 py-3">Verified</th>
                                                                                <th class="px-4 py-3">Contribution</th>
                                                                                <th class="px-4 py-3">Action</th>
                                                                            </tr>
                                                                        </thead>
                                                                        {
                                                                            (users && users.length > 0) &&
                                                                                <tbody class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                                                                                    {
                                                                                        users.slice(startIndex, endIndex).map((item, index) => {
                                                                                            return (
                                                                                                    <tr key={index} class="text-gray-700 dark:text-gray-400">
                                                                                                    <td class="px-4 py-3">
                                                                                                        <div class="flex items-center text-sm">
                                                                                                            <div
                                                                                                                className="relative hidden w-8 h-8 mr-3 rounded-full md:block"
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
                                                                                                                <p className="font-semibold">{item.full_name ? item.full_name : 'n/a'}</p>
                                                                                                                {
                                                                                                                    item.role === 'Admin' ? <p className="text-xs font-semibold text-[#DC2626]">Admin</p> :
                                                                                                                    item.role === 'Moderator' ? <p className="text-xs font-semibold text-[#FFAA33]">Moderator</p> 
                                                                                                                    : <p class="text-xs font-semibold text-[#2563EB]">User</p>
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td class="px-4 py-3 text-sm">
                                                                                                        <p class="font-semibold">{item.username}</p>
                                                                                                    </td>
                                                                                                    <td class="px-4 py-3 text-sm">
                                                                                                        {
                                                                                                            item.verification?.verified ?
                                                                                                                <FontAwesomeIcon icon={faCheck} className="cursor-pointer px-[10px] py-[7px] text-base text-green-700 rounded-md transition-all" />
                                                                                                            :
                                                                                                                <FontAwesomeIcon icon={faClose} className="cursor-pointer px-[10px] py-[7px] text-base text-red-700 rounded-md transition-all" />
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td class="px-4 py-3 text-sm">
                                                                                                        <p class="font-semibold">{item.contribution ? item.contribution : 0}</p>
                                                                                                    </td>
                                                                                                    <td class="px-4 py-3">
                                                                                                        <TableMenu 
                                                                                                            index={index}
                                                                                                            menu={menu}
                                                                                                            setMenu={setMenu}
                                                                                                        />
                                                                                                    </td>
                                                                                                </tr>
                                                                                            )
                                                                                        })
                                                                                    }
                                                                                </tbody>
                                                                        }
                                                                    </table>
                                                                </div>
                                                                <div
                                                                    class="md:block hidden px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800"
                                                                    >
                                                                    <span class="flex items-center col-span-3">
                                                                        Showing {(endIndex >= users?.length) ? users?.length : endIndex } of {users?.length}
                                                                    </span>
                                                                    <span class="col-span-2"></span>
                                                                    <span class="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
                                                                        <nav aria-label="Table navigation">
                                                                            <ul class="inline-flex items-center">
                                                                                <li>
                                                                                    <button
                                                                                        disabled={currentPage === 1} onClick={() => goToPage(1)}
                                                                                        class="px-3 py-1 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-purple"
                                                                                        aria-label="Previous"
                                                                                        >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-left" viewBox="0 0 16 16">
                                                                                            <path fill-rule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                                                                                            <path fill-rule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                                                                                        </svg>
                                                                                    </button>
                                                                                </li>
                                                                                <li>
                                                                                    <button
                                                                                        disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}
                                                                                        class="px-3 py-1 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-purple"
                                                                                        aria-label="Previous"
                                                                                        >
                                                                                        <svg
                                                                                            class="w-4 h-4 fill-current"
                                                                                            aria-hidden="true"
                                                                                            viewBox="0 0 20 20"
                                                                                            >
                                                                                            <path
                                                                                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                                                                            clip-rule="evenodd"
                                                                                            fill-rule="evenodd"
                                                                                            ></path>
                                                                                        </svg>
                                                                                    </button>
                                                                                </li>
                                                                                <li>
                                                                                    <button
                                                                                        disabled={endIndex >= users?.length} onClick={() => goToPage(currentPage + 1)}
                                                                                        class="px-3 py-1 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-purple"
                                                                                        aria-label="Next"
                                                                                        >
                                                                                        <svg
                                                                                            class="w-4 h-4 fill-current"
                                                                                            aria-hidden="true"
                                                                                            viewBox="0 0 20 20"
                                                                                            >
                                                                                            <path
                                                                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                                                            clip-rule="evenodd"
                                                                                            fill-rule="evenodd"
                                                                                            ></path>
                                                                                        </svg>
                                                                                    </button>
                                                                                </li>
                                                                                <li>
                                                                                    <button
                                                                                        disabled={endIndex >= users?.length} onClick={() => goToPage(users?.length / itemsPerPage)} 
                                                                                        class="px-3 py-1 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-purple"
                                                                                        aria-label="Next"
                                                                                        >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
                                                                                            <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"/>
                                                                                            <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"/>
                                                                                        </svg>
                                                                                    </button>
                                                                                </li>
                                                                            </ul>
                                                                        </nav>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            class="md:hidden flex justify-between items-center px-2 mt-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800"
                                                            >
                                                            <span class="flex items-center col-span-3">
                                                                Showing {(endIndex >= users?.length) ? users?.length : endIndex } of {users?.length}
                                                            </span>
                                                            <span class="col-span-2"></span>
                                                            <span class="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
                                                                <nav aria-label="Table navigation">
                                                                    <ul class="inline-flex items-center">
                                                                        <li>
                                                                            <button
                                                                                disabled={currentPage === 1} onClick={() => goToPage(1)}
                                                                                class="px-3 py-1 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-purple"
                                                                                aria-label="Previous"
                                                                                >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-left" viewBox="0 0 16 16">
                                                                                    <path fill-rule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                                                                                    <path fill-rule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                                                                                </svg>
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button
                                                                                disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}
                                                                                class="px-3 py-1 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-purple"
                                                                                aria-label="Previous"
                                                                                >
                                                                                <svg
                                                                                    class="w-4 h-4 fill-current"
                                                                                    aria-hidden="true"
                                                                                    viewBox="0 0 20 20"
                                                                                    >
                                                                                    <path
                                                                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                                                                    clip-rule="evenodd"
                                                                                    fill-rule="evenodd"
                                                                                    ></path>
                                                                                </svg>
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button
                                                                                disabled={endIndex >= users?.length} onClick={() => goToPage(currentPage + 1)}
                                                                                class="px-3 py-1 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-purple"
                                                                                aria-label="Next"
                                                                                >
                                                                                <svg
                                                                                    class="w-4 h-4 fill-current"
                                                                                    aria-hidden="true"
                                                                                    viewBox="0 0 20 20"
                                                                                    >
                                                                                    <path
                                                                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                                                    clip-rule="evenodd"
                                                                                    fill-rule="evenodd"
                                                                                    ></path>
                                                                                </svg>
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button
                                                                                disabled={endIndex >= users?.length} onClick={() => goToPage(users?.length / itemsPerPage)} 
                                                                                class="px-3 py-1 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-purple"
                                                                                aria-label="Next"
                                                                                >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
                                                                                    <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"/>
                                                                                    <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"/>
                                                                                </svg>
                                                                            </button>
                                                                        </li>
                                                                    </ul>
                                                                </nav>
                                                            </span>
                                                        </div>
                                                    </div>
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

export default AdminManage