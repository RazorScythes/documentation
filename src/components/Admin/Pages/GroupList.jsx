import React, { useEffect, useState, useRef  } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faTrash, faAngleDoubleLeft, faAngleDoubleRight, faEye, faPencil, faArrowUpRightFromSquare, faArrowRight, faArrowLeft, faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux'
import { clearAlert, getGroupList, removeGroup } from "../../../actions/video";
import { getUserVideo, removeVideo, bulkRemoveVideo } from "../../../actions/uploads";
import { convertDriveImageLink, millisToTimeString } from '../../Tools'

import GroupModalForm from '../Modal/GroupModalForm'
import SideAlert from '../../SideAlert'

import styles from '../../../style'

const GroupList = ({ user, path }) => {
    const dispatch = useDispatch()
    const navigate  = useNavigate()

    const alert = useSelector((state) => state.uploads.alert)
    const variant = useSelector((state) => state.uploads.variant)
    const sideAlert = useSelector((state) => state.video.sideAlert)
    const groups = useSelector((state) => state.video.groups)

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const [searchParams, setSearchParams] = useSearchParams();
    const [alertActive, setAlertActive] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [displayedPages, setDisplayedPages] = useState([]);
    const [deleteId, setDeleteId] = useState([])
    const [searchGroup, setSearchGroup] = useState('')
    const [data, setData] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [edit, setEdit] = useState(false)
    const [modalForm, setModalForm] = useState(null)

    const [showAlert, setShowAlert] = useState(false)
    const [alertInfo, setAlertInfo] = useState({
        alert: '',
        variant: ''
    })

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const totalPages = Math.ceil(data?.length / itemsPerPage) > 0 ? Math.ceil(data?.length / itemsPerPage) : 1;

    useEffect(() => {
        dispatch(getGroupList({ 
            id: user.result?._id,
            type: 'video'
        }))
    }, [])

    useEffect(() => {
        if(Object.keys(sideAlert).length !== 0){
            setAlertInfo({
                variant: sideAlert.variant,
                heading: sideAlert.heading,
                paragraph: sideAlert.paragraph
            })
            setAlertActive(true)
  
            dispatch(clearAlert())
  
            if(showForm) {
                setShowForm(false)
            }
        }
    }, [sideAlert])

    useEffect(() => {
        window.scrollTo(0, 0)
        const calculateDisplayedPages = () => {
            const pagesToShow = [];
            const maxPages = 5;
            const maxDisplayedPages = (totalPages >= itemsPerPage) ? ((totalPages / itemsPerPage) > maxPages ? maxPages : totalPages / itemsPerPage) : 1 ; // Maximum number of page buttons to display
        
            if (totalPages <= maxDisplayedPages) {
                for (let i = 1; i <= totalPages; i++) {
                    pagesToShow.push(i);
                }
            } else {
                let startPage;
                let endPage;
        
                if (currentPage <= Math.floor(maxDisplayedPages / 2)) {
                    startPage = 1;
                    endPage = maxDisplayedPages;
                } else if (currentPage >= totalPages - Math.floor(maxDisplayedPages / 2)) {
                    startPage = totalPages - maxDisplayedPages + 1;
                    endPage = totalPages;
                } else {
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
        if(alert && variant){
            setAlertInfo({ ...alertInfo, alert: alert, variant: variant })
            setShowAlert(true)
            window.scrollTo(0, 0)

            dispatch(clearAlert())
        }
    }, [alert, variant])

    const editMode = (index) =>{
        setModalForm({
            id: groups[index]._id,
            group_name: groups[index].group_name,
            description: groups[index].description,
        })
        setEdit(true)
    }

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

    const deleteMultipleVideos = () => {
        if(confirm(`Are you sure you want to delete ${deleteId.length} video${deleteId.length > 1 ? 's' : ''}?`)){
            dispatch(bulkRemoveVideo({ 
                id: user.result?._id,
                videos_id: deleteId
            }))
            setDeleteId([])
        }
    }

    const deleteGroup = (index) => {
        if(confirm(`Are you sure you want to delete this group ${groups[index].group_name}?`)) {
            dispatch(removeGroup({ 
                id: user.result?._id,
                group_id: groups[index]._id,
                type: 'video'
            }))
        }
    }

    useEffect(() => {
        if(groups && groups.length > 0){
            if(searchGroup.length > 0) {
                const keyword = searchGroup.toLowerCase();
                const filteredData = groups.filter((item) =>
                    Object.values(item).some((value) =>
                        String(value).toLowerCase().includes(keyword)
                    )
                );
                setData(filteredData);
            }
            else {
                setData(groups)
            }
        }
        setEdit(false)
    }, [groups])

    const handleGroupSearch = (event) => {
        const keyword = event.target.value.toLowerCase();
        setSearchGroup(event.target.value);
    
        const filteredData = groups.filter((item) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(keyword)
          )
        );

        setCurrentPage(1)
        setData(filteredData);
    };

    const convertTimezone = (date) => {
        const timeZone = 'America/New_York';

        const dateObj = new Date(date);
        const formattedDate = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour12: false,
        }).format(dateObj);

        return formattedDate
    }

    return (
        <div className="relative font-poppins">   
            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <SideAlert
                        variants={alertInfo.variant}
                        heading={alertInfo.heading}
                        paragraph={alertInfo.paragraph}
                        active={alertActive}
                        setActive={setAlertActive}
                    />

                    <GroupModalForm
                        user={user.result?._id}
                        openModal={showForm}
                        setOpenModal={setShowForm}
                        edit={edit}
                        setEdit={setEdit}
                        type="video"
                        sideAlert={sideAlert}
                        data={modalForm}
                    />

                    <div className="container mx-auto relative px-0 pb-16 pt-8">
                        <div className='min-w-full xs:w-auto w-72'>
                            <div className='flex justify-end'>
                            
                            </div>
                            <div className='justify-between items-center mb-2 sm:hidden flex mt-4'>
                                <div className=''>
                                    {
                                        deleteId.length > 0 &&
                                            <FontAwesomeIcon title="delete" onClick={() => deleteMultipleVideos()} icon={faTrash} className="px-[12px] py-[10px] my-0 bg-red-600 hover:bg-red-700 text-gray-100 rounded-md cursor-pointer transition-all mr-2" />
                                    }
                                </div>  
                                <div className='flex'>
                                    <div className="relative w-full max-w-xs flex justify-end">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            <FontAwesomeIcon icon={faSearch} />
                                        </div>
                                        <input 
                                            className="block w-full py-1 pl-10 pr-3 leading-5 text-gray-800 placeholder-gray-700 bg-white border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" 
                                            type="text" 
                                            placeholder="Search" 
                                            value={searchGroup}
                                            onChange={handleGroupSearch}
                                        />
                                    </div>
                                    <button onClick={() => setShowForm(true)} className='ml-2 border border-solid border-blue-600 bg-blue-600 hover:bg-blue-700 rounded-sm transition-all text-white p-2 py-0 px-2'>
                                        <FontAwesomeIcon icon={faPlus} className=''/>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto sm:mt-4 relative">
                                <div className='mb-2 sm:flex hidden items-center justify-between'>
                                    <div className=''>
                                        {
                                            deleteId.length > 0 &&
                                                <div className='flex items-center'>
                                                    <button onClick={() => deleteMultipleVideos()}  className='font-semibold text-sm border border-solid border-red-600 bg-red-600 hover:bg-red-700 rounded-sm transition-all text-white p-2 py-1'>
                                                        Delete ({deleteId.length})
                                                    </button>
                                                </div>
                                            }
                                    </div>  
                                    <div className='flex'>
                                        <div className="relative w-full max-w-xs flex justify-end">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                <FontAwesomeIcon icon={faSearch} />
                                            </div>
                                            <input 
                                                className="block w-full py-[0.30rem] pl-10 pr-3 leading-5 text-gray-800 placeholder-gray-700 bg-white border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                                                type="text" 
                                                placeholder="Search" 
                                                value={searchGroup}
                                                onChange={handleGroupSearch}
                                            />
                                        </div>
                                        <button onClick={() => setShowForm(true)} className='ml-2 border border-solid border-blue-600 bg-blue-600 hover:bg-blue-700 rounded-sm transition-all text-white p-2 py-0'>
                                            <FontAwesomeIcon icon={faPlus} className=''/>
                                        </button>
                                    </div>
                                </div>

                                <div class="xs:w-full overflow-hidden rounded-lg shadow-xs">
                                    <div class="w-full overflow-x-auto">
                                        <table class="min-w-full overflow-x-auto whitespace-no-wrap border-collapse">
                                            <thead>
                                                <tr
                                                    class="font-mono text-sm font-light tracking-wide text-left text-gray-800 border border-solid dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800"
                                                >
                                                    <th class="pl-4 py-3"></th>
                                                    <th class="px-4 py-3">Group Name</th>
                                                    <th class="px-4 py-3">Description</th>
                                                    <th class="px-4 py-3">Videos</th>
                                                    <th class="px-4 py-3">Date Created</th>
                                                    <th class="px-4 py-3">Action</th>
                                                </tr>
                                            </thead>
                                            {
                                                (data && data.length > 0) &&
                                                    <tbody class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                                                        {
                                                            data.slice(startIndex, endIndex).map((item, index) => {
                                                                return (
                                                                        <tr key={index} class="text-gray-800 dark:text-gray-400">
                                                                        <td className='pl-4 py-3'>
                                                                            <div className="text-sm leading-5 text-gray-900">
                                                                                <input 
                                                                                    id={`default-checkbox${10+index}`}
                                                                                    type="checkbox" 
                                                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                                    checked={deleteId.includes(item._id)}
                                                                                    onChange={() => addDeleteId(index, item._id)}
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                        <td class="px-4 py-3">
                                                                            <div class="flex items-center text-sm">
                                                                                <div className='md:max-w-[150px] max-w-[125px] text-xs'>
                                                                                    <p class="font-semibold truncate">{item.group_name}</p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td class="px-4 py-3 text-xs font-semibold">
                                                                            <div className='md:max-w-[300px] max-w-[225px] truncate'>
                                                                                {item.description}
                                                                            </div>
                                                                        </td>
                                                                        <td class="px-4 py-3 text-xs truncate">
                                                                            {item.videoCount}
                                                                        </td>
                                                                        <td class="px-4 py-3 text-xs">
                                                                            <span class="px-2 ml-1 py-1 text-white bg-blue-600 rounded-full dark:bg-blue-700 dark:text-white">
                                                                               {convertTimezone(item.createdAt)}
                                                                            </span>
                                                                        </td>
                                                                        <td class="px-4 py-3">
                                                                            <div class="flex items-center space-x-2 text-sm">
                                                                                <button onClick={() => { editMode(index); setShowForm(true) }} className='border border-solid border-green-600 bg-green-600 hover:bg-green-700 rounded-sm transition-all text-white p-2 py-1'>
                                                                                    <FontAwesomeIcon icon={faPencil} className=''/>
                                                                                </button>
                                                                                <button onClick={() => deleteGroup(index)}  className='mr-2 border border-solid border-red-600 bg-red-600 hover:bg-red-700 rounded-sm transition-all text-white p-2 py-1'>
                                                                                    <FontAwesomeIcon icon={faTrash} className=''/>
                                                                                </button>
                                                                            </div>
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
                                        <div className='flex items-center justify-between'>
                                            <span class="flex items-center col-span-3">
                                                Showing {(endIndex >= groups?.length) ? groups.length : endIndex } of {groups?.length}
                                            </span>

                                            <div className='flex flex-wrap items-center justify-center'>
                                                <button
                                                    disabled={currentPage === 1}
                                                    onClick={() => goToPage(1)}
                                                    className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-800 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                                >
                                                    <FontAwesomeIcon icon={faAngleDoubleLeft}/>
                                                </button>
                                                <button
                                                    disabled={currentPage === 1}
                                                    onClick={() => goToPage(currentPage - 1)}
                                                    className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-800 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                                >
                                                    <FontAwesomeIcon icon={faArrowLeft}/>
                                                </button>
                                                {displayedPages.map((pageNumber) => (
                                                    <button 
                                                        key={pageNumber}
                                                        onClick={() => goToPage(pageNumber)}
                                                        style={{backgroundColor: pageIndex === pageNumber && "#d1d5db"}} className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-800 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                                    >
                                                    {pageNumber}
                                                    </button>
                                                ))}
                                                <button
                                                    disabled={currentPage === totalPages}
                                                    onClick={() => goToPage(currentPage + 1)}
                                                    className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-800 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                                >
                                                    <FontAwesomeIcon icon={faArrowRight}/>
                                                </button>
                                                <button
                                                    disabled={endIndex >= data?.length} 
                                                    onClick={() => goToPage(data?.length / itemsPerPage)} 
                                                    className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-800 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                                >
                                                    <FontAwesomeIcon icon={faAngleDoubleRight}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="md:hidden block px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800"
                                >
                                <div className='flex-col items-center justify-between'>
                                    <div className='flex flex-wrap items-center justify-center'>
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => goToPage(1)}
                                            className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-800 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                        >
                                            <FontAwesomeIcon icon={faAngleDoubleLeft}/>
                                        </button>
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => goToPage(currentPage - 1)}
                                            className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-800 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                        >
                                            <FontAwesomeIcon icon={faArrowLeft}/>
                                        </button>
                                        {displayedPages.map((pageNumber) => (
                                            <button 
                                                key={pageNumber}
                                                onClick={() => goToPage(pageNumber)}
                                                style={{backgroundColor: pageIndex === pageNumber && "#d1d5db"}} className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-800 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                            >
                                            {pageNumber}
                                            </button>
                                        ))}
                                        <button
                                            disabled={currentPage === totalPages}
                                            onClick={() => goToPage(currentPage + 1)}
                                            className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-800 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                        >
                                            <FontAwesomeIcon icon={faArrowRight}/>
                                        </button>
                                        <button
                                            disabled={endIndex >= data?.length} 
                                            onClick={() => goToPage(data?.length / itemsPerPage)} 
                                            className='h-8 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-800 text-[#5A6C7F] font-semibold py-1 px-3 mx-[2px] border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'
                                        >
                                            <FontAwesomeIcon icon={faAngleDoubleRight}/>
                                        </button>
                                    </div>

                                    <span class="flex items-center justify-center col-span-3 mt-4">
                                        Showing {(endIndex >= groups?.length) ? groups.length : endIndex } of {groups?.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GroupList