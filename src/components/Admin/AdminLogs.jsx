import React, { useState, useEffect } from 'react'
import { Header } from './index'
import { getLogs } from '../../actions/logs';
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import styles from '../../style'
import Avatar from '../../assets/avatar.png'

import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const AdminLogs = ({ path }) => {

    const dispatch = useDispatch()

    const logs = useSelector((state) => state.logs.data)
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')))

    const [open, setOpen] = useState({
        portfolio: false,
        pages: false,
        uploads: false,
    })
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if(user) dispatch(getLogs({id: user.result?._id}))
    }, [user])

    const dateFormat = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
        return formattedDate
    }
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
                                    heading='Logs'
                                    description="Select a website to manage, or create a new one from scratch."
                                    button_text="Explore Now!"
                                    button_link={`#`}
                                    show_button={false}
                                />
                                <div className="relative bg-[#F9FAFB]">   
                                    <div className={`${styles.marginX} ${styles.flexCenter}`}>
                                        <div className={`${styles.boxWidthEx}`}>
                                            <div className="container mx-auto relative px-0 sm:px-4 py-16">
                                                <div className="overflow-auto relative font-poppins text-sm bg-white">
                                                    <div className='border-b border-solid border-grey-200'>
                                                        <h1 className='text-xl p-4 font-semibold text-gray-600'>Activity Logs</h1>
                                                    </div>
                                                    <table className="sm:w-full w-[850px] text-left">
                                                        <thead className='text-gray-600'>
                                                            <tr>
                                                                <th className="px-4 py-3">User</th>
                                                                <th className="px-4 py-3">Date</th>
                                                                <th className="px-4 py-3 w-2/3">Message</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className='text-gray-600'>
                                                            {
                                                                logs && logs.length > 0 && (
                                                                    logs.map((item) => {
                                                                        return (
                                                                            <tr>
                                                                                <td className="border px-4 py-2">
                                                                                    <div className='flex flex-row items-center'>
                                                                                    <img className="h-6 w-6 rounded-full mr-2 cursor-pointer object-cover border border-solid border-gray-600" src={item.avatar ? item.avatar : Avatar} alt="Profile" />
                                                                                        <p className='capitalize'>{item.username ? item.username : 'Unknown'}</p>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="border px-4 py-2">{dateFormat(item.logs.createdAt)}<br/><span className='capitalize text-xs text-[#CD3242] font-semibold'>[{moment(item.logs.createdAt).fromNow()}]</span></td>
                                                                                <td className="border px-4 py-2 w-1/2">{item.logs.message}</td>
                                                                            </tr>
                                                                        )
                                                                    })
                                                                )
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

export default AdminLogs