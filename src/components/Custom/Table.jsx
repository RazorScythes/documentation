import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faEdit, faList, faQuestion, faTrashAlt, faSortUp, faSortDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import { dark, light } from '../../style';

import Avatar from './Avatar';
import Pagination from './Pagination';
import ConfirmModal from './ConfirmModal'

const Table = ({ theme, title, header, data, limit, multipleSelect, actions, setSelectedData, category, loading, lookupKey = '_id' }) => {
    const [openModal, setOpenModal] = useState(false)
    const [confirm, setConfirm] = useState(false)
    const [toggle, setToggle] = useState(false)
    const [search, setSearch] = useState('')
    const [pagination, setPagination] = useState(null)
    const [itemsPerPage, setItemsPerPage] = useState(limit ?? 10)
    const [tableData, setTableData] = useState(data ?? [])
    const [startIndex, setStartIndex] = useState(0)
    const [endIndex, setEndIndex] = useState(startIndex + itemsPerPage)
    const [idList, setIdList] = useState([])
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const allVisibleIds = tableData.slice(startIndex, endIndex).map((item) => item._id);

    const getIndex = (key, value) => { return data.findIndex(obj => obj[key] === value); };

    const handleSelectAll = (checked) => {
        if (checked) {
            if(!data?.length) return 

            const newIds = [...new Set([...idList, ...allVisibleIds])];
            setIdList(newIds);
        } else {
            const newIds = idList.filter((id) => !allVisibleIds.includes(id));
            setIdList(newIds);
        }
    };

    const addDeleteId = (id) => {
        setIdList((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const isAllChecked = tableData?.length > 0 ? allVisibleIds.every((id) => idList.includes(id)) : false;

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedData = [...tableData].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setTableData(sortedData);
    };

    useEffect(() => {
        if(data?.length > 0) {
            setTableData(data)
        }
        else {
            setTableData([])
        }

        if(pagination) {  
            if(search) {
                handleSearch(null, search)
                setStartIndex(pagination.start)
                setEndIndex(pagination.end)
            }
            else {
                setStartIndex(pagination.start)
                setEndIndex(pagination.end)
                setPagination(null)
            }
        }

        setItemsPerPage(limit ?? 10)
    }, [pagination, data, limit])

    useEffect(() => {
        if(confirm) {
            setSelectedData(idList)
            setIdList([])
            setConfirm(false)
        }
    }, [confirm])

    const handleSearch = (e, key) => {
        const keyword = e?.target?.value?.toLowerCase() || key?.toLowerCase() || '';
        setSearch(e?.target?.value || key?.toLowerCase() || '');
    
        const filteredData = data.filter((item) =>
            Object.values(item).some((value) =>
                String(value).toLowerCase().includes(keyword)
            )
        );

        setTableData(filteredData);
    };

    return (
        <div className={`xs:w-full overflow-hidden rounded-sm`}>

            <ConfirmModal 
                theme={theme}
                title="Confirm Video Deletion"
                description={`Are you sure you want to delete these ${idList.length} ${category ? category : 'items'}?`}
                openModal={openModal}
                setOpenModal={setOpenModal}
                setConfirm={setConfirm}
            />

            <div className='flex justify-between items-center mb-3'>
                <div className='flex items-center w-full'>
                    {
                        idList?.length > 0 &&
                            <button onClick={() => setOpenModal(true)} className={`bg-red-600 hover:bg-red-700 text-white transition-all p-[0.35rem] px-2.5 rounded-md mr-2`}><FontAwesomeIcon icon={faTrashAlt} /></button>
                    }
                    <h2 className="text-lg font-medium truncate">
                        { title }
                    </h2>
                </div>
                <div className="md:block hidden">
                    <div className="relative">
                        <span className="absolute inset-y-0 right-0 flex items-center pr-6"> <FontAwesomeIcon icon={faSearch} className={`${theme === 'light' ? light.input_icon : dark.input_icon}`} /> </span>
                        <input onChange={handleSearch} value={search} className={`block w-full rounded-full py-2 px-7 pr-10 ${theme === 'light' ? light.input : dark.input}`} type="text" placeholder={`Search`} />
                    </div>
                </div>
                <button onClick={() => setToggle(!toggle)} className={`md:hidden p-[0.35rem] px-3 rounded-md ${theme === 'light' ? light.icon : dark.icon}`}><FontAwesomeIcon icon={faSearch} /></button>
            </div>

            {
                toggle ?
                    <div className="md:hidden mb-4">
                        <div className="relative">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-6"> <FontAwesomeIcon icon={faSearch} className={`${theme === 'light' ? light.input_icon : dark.input_icon}`} /> </span>
                            <input onChange={handleSearch} value={search} className={`block w-full rounded-full py-2 px-7 pr-10 ${theme === 'light' ? light.input : dark.input}`} type="text" placeholder={`Search`} />
                        </div>
                    </div>
                : null
            }

            <div className="xs:w-full overflow-hidden rounded-sm">
                <div className="w-full overflow-x-auto custom-scroll">
                    <table className="min-w-full overflow-x-auto whitespace-no-wrap">
                        <thead className={`${theme === 'light' ? light.thirdbackground : dark.thirdbackground}`}>
                            <tr className="font-medium cursor-pointer">
                                { 
                                    multipleSelect && 
                                        <td className="pl-6 pt-1.5">
                                            <input 
                                                id={`checkbox-main`}
                                                type="checkbox" 
                                                className="w-4 h-4 outline-none"
                                                checked={isAllChecked}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />
                                        </td> 
                                }
                                {
                                    header.map((col, index) => (
                                        <td key={index} onClick={() => col.key && handleSort(col.key)} className="px-4 py-3">
                                            <div className="flex items-center justify-between">
                                                {col.label}
                                                {col.key && (
                                                    <FontAwesomeIcon
                                                        icon={
                                                            sortConfig.key === col.key
                                                                ? sortConfig.direction === 'asc'
                                                                    ? faSortUp
                                                                    : faSortDown
                                                                : faSort
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {(tableData?.length > 0 && !loading) &&
                                tableData.slice(startIndex, endIndex).map((item, index) => (
                                    <tr
                                        key={item._id}
                                        className={`border-b border-solid ${theme === 'light' ? light.border : dark.semiborder} ${theme === 'light' ? light.row : dark.row}`}
                                    >   
                                        {
                                            multipleSelect &&
                                                <td className="pl-6 py-3">
                                                    <input 
                                                        id={`checkbox-${item._id}`}
                                                        type="checkbox" 
                                                        className="w-4 h-4 outline-none"
                                                        checked={idList.includes(item._id)}
                                                        onChange={() => addDeleteId(item._id)}
                                                    />
                                                </td>
                                        }
                                        {
                                            header.map((col, idx) => (
                                            <td key={idx} className="px-4 py-3">
                                                {
                                                    col.key === 'actions'
                                                    ? actions && actions.map((action, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => action.onClick(item)}
                                                            title={action.label}
                                                            className={`p-[0.35rem] text-base px-2 rounded-md ${action.color ? action.color : (theme === 'light' ? light.icon : dark.icon)}`}
                                                        >
                                                            {
                                                                action.label.toLowerCase() === 'edit' ?
                                                                    <FontAwesomeIcon icon={faEdit} />
                                                                : action.label.toLowerCase() === 'delete' ?
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                :
                                                                    <FontAwesomeIcon icon={faQuestion} />
                                                            }
                                                        </button>
                                                    ))
                                                    : col?.type === 'user' ?
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
                                                        : col.render ? (
                                                            // col.render(item[col.key], startIndex + index) 
                                                            col.render(item[col.key], getIndex(lookupKey, item[lookupKey]))
                                                        ) : (
                                                            item[col.key]
                                                        )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                    
                    {
                        loading ?
                            <p className={`text-center py-6 border-b border-solid ${theme === 'light' ? light.border : dark.semiborder}`}>
                                Loading data...
                            </p>
                        : null
                    }       
                 
                </div>
                
                {
                    (!loading && tableData?.length === 0) &&
                        <p className={`text-center py-6 border-b border-solid ${theme === 'light' ? light.border : dark.semiborder}`}><FontAwesomeIcon icon={faList} className='mr-1'/>  No data to show</p>
                }
                
                <div class="md:block hidden px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    <div className='flex items-center justify-between'>
                        <span class="flex items-center col-span-3">
                            Showing { (endIndex >= tableData?.length) ? tableData.length : endIndex } of {tableData?.length }
                        </span>

                        <Pagination 
                            data={tableData}
                            theme={theme}
                            limit={limit}
                            setPagination={setPagination}
                            numberOnly={true}
                            table={true}
                            triggerSearch={search}
                        />
                    </div>
                </div>
            </div>

            <div class="md:hidden block px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                <div className='flex items-center justify-between'>
                    <span class="flex items-center col-span-3">
                        Showing { (endIndex >= tableData?.length) ? tableData.length : endIndex } of {tableData?.length }
                    </span> 

                    <Pagination 
                        data={tableData}
                        theme={theme}
                        limit={limit ?? 10}
                        setPagination={setPagination}
                        numberOnly={true}
                        table={true}
                        triggerSearch={search}
                    />
                </div>
            </div>
        </div>
    );
}

export default Table