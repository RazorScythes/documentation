import React, { useEffect, useState} from 'react'
import { Header } from './index'
import { useSearchParams, useNavigate } from 'react-router-dom'

import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

// import GroupList from './Pages/GroupList';
import GroupList from './Pages/GroupList';
import VideoReport from './Pages/VideoReport';
import Videos from './Pages/Videos';

import styles from '../../style'

const AdminVideos = ({ user, path }) => {
    const navigate  = useNavigate()

    const [searchParams, setSearchParams] = useSearchParams();
    const [pageType, setPageType] = useState(searchParams.get('type') ? searchParams.get('type') : '')
    const [isOpen, setIsOpen] = useState(false)
    const [open, setOpen] = useState({
        portfolio: false,
        pages: false,
        uploads: false,
        manage: false,
    })

    const handlePage = (page) => {
        navigate(`/account/videos?type=${page}`)

        setPageType(page)
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
            <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} open={open} setOpen={setOpen} path={path}/>
            <div class="flex flex-col flex-1">
                <AdminNavbar isOpen={isOpen} setIsOpen={setIsOpen} path={path}/>
                <main class="h-full pb-16 overflow-y-auto">
                    <div class="mx-auto grid">
                        <div className="relative bg-[#F9FAFB]">
                            <Header 
                                heading='Uploads'
                                description="Upload contents for others to view!"
                                button_text="Explore Now!"
                                button_link={`#`}
                                show_button={false}
                                grid_type='full'
                                data={[
                                    {
                                        label: 'videos',
                                        value: 0
                                    },
                                    {
                                        label: 'games',
                                        value: 0
                                    },
                                    {
                                        label: 'blogs',
                                        value: 0
                                    },
                                ]}
                            />

                            <div className="relative bg-[#F9FAFB] border-b border-solid border-[#CAD5DF] font-poppins text-sm text-gray-800">   
                                <div className={`${styles.marginX} ${styles.flexCenter}`}>
                                    <div className={`${styles.boxWidthEx}`}>
                                        <div className="container mx-auto relative">
                                            <div className='w-full whitespace-nowrap scrollbar-hide mobile_scroll flex flex-row font-semibold overflow-x-auto'>
                                                <button onClick={() => handlePage('videos')} className={`transition-all py-4 mr-8 border-b-2 ${pageType === '' || pageType === 'videos' || searchParams.get('type') === 'videos' ? 'border-blue-500' : 'border-transparent'}`}>Videos</button>
                                                <button onClick={() => handlePage('groups')} className={`transition-all py-4 mr-8 border-b-2 ${pageType === 'groups' || searchParams.get('type') === 'groups' ? 'border-blue-500' : 'border-transparent'}`}>Group Lists</button>
                                                <button onClick={() => handlePage('reports')} className={`transition-all py-4 mr-8 border-b-2 ${pageType === 'reports' || searchParams.get('type') === 'reports' ? 'border-blue-500' : 'border-transparent'}`}>Reports</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {
                                pageType === 'groups' ?
                                    <GroupList user={user} path={path} />
                                : pageType === 'reports' ?
                                    <VideoReport user={user} path={path} />
                                : (pageType === 'videos' || !pageType) &&
                                    <Videos user={user} path={path} />
                            }
                            
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminVideos