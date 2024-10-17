import React, { useState, useEffect } from 'react'

const TableMenu = ({ index, menu, setMenu }) => {
    const [open, setOpen] = useState(false)

    useEffect(() => { 
        if(index !== menu) setOpen(false)
    }, [menu])
    
    return (
        <div className='relative '>
            <div class="flex items-center space-x-4 text-sm">
                <button
                    onClick={() => { 
                        setOpen(!open); 
                        setMenu(index) 
                    }}
                    class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-blue-600 rounded-md dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                    aria-label="Edit"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                    </svg>
                </button>
            </div>
            {
                open && (index === menu) &&
                <div className='absolute z-20 lg:right-24 right-10 bottom-[-105px] border border-solid border-gray-300 w-24 bg-[#F9FAFB]'>
                    <ul className='font-semibold'>
                        <li className='px-4 py-2 cursor-pointer'>Edit</li>
                        <li className='px-4 py-2 cursor-pointer'>Delete</li>
                        <li className='px-4 py-2 cursor-pointer'>Manage</li>
                    </ul>
                </div>
            }
        </div>
    )
}

export default TableMenu