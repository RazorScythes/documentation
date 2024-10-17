import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH, faMinus, faPencilAlt, faPencilSquare, faPlus, faTrash, faTrashAlt, faVideo } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import { MotionAnimate } from 'react-motion-animate'
import { useDispatch, useSelector } from 'react-redux'
import { getArchiveNameById, newArchiveList, removeArchiveList, clearAlert } from "../../actions/archive";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import moment from 'moment-timezone';
import styles from "../../style";
import SideAlert from '../SideAlert'
import { Error_forbiden } from '../../assets';


const ListPicker = ({active, index, directory, type, parent_id, archive_sub, user_id}) => {
    const dispatch = useDispatch()
    const navigate  = useNavigate()

    const selector = () => { navigate(`/archive?type=${type}&directory=${directory}`)}
    const [submitted, setSubmitted] = useState(false)

    const removeDirectoryList = () => {
        if(!submitted) {
            if(confirm("Are you sure you want to remove this directory?")) {
                const newList = [...archive_sub]
                const filteredList = newList.filter(item => item.name !== directory)

                dispatch(removeArchiveList({
                    id: user_id,
                    archive_id: parent_id,
                    archive_list: filteredList,
                    archive_name: directory
                }))
                setSubmitted(true)
            }
        }
    }

    // return (
    //     <li onClick={() => selector(index)} key={index} style={{backgroundColor: active ? '#0D131F' : '#1F2937'}} className='p-1 transition-all cursor-pointer'>
    //         <div className='flex justify-between'>
    //             {directory}
    //             { index !== 0 && <button onClick={() => removeDirectoryList()}><FontAwesomeIcon title="Add directory" icon={faTrash} className='text-base cursor-pointer transition-all'/></button>  }
    //         </div>
    //     </li>
    // )
    return (
        <li key={index} className='p-1 transition-all cursor-pointer font-semibold border-b border-solid border-gray-200'>
            <div className='flex justify-between'>
                {directory}
                { index !== 0 && <button onClick={() => removeDirectoryList()}><FontAwesomeIcon title="Add directory" icon={faTrash} className='text-base cursor-pointer transition-all'/></button>  }
            </div>
        </li>
    )
}

const Directory2 = ({ archive_name, archive_sub, user_id, archive_id }) => {
    const dispatch = useDispatch()

    const [searchParams, setSearchParams] = useSearchParams();
    const [activeForm, setActiveForm] = useState(false)
    const [names, setNames] = useState([])
    const [submitted, setSubmitted] = useState(false)
    const [form, setForm] = useState('')

    const paramType = searchParams.get('type') ? searchParams.get('type') : '';
    const paramDirectory = searchParams.get('directory') ? searchParams.get('directory') : '';

    useEffect(() => {
        setSubmitted(false)
        setActiveForm(false)
        setForm('')
    }, [archive_sub])

    const addDirectoryList = () => {
        var duplicate = false
        archive_sub.forEach((item) => { if(item === form) duplicate = true })
        if(duplicate) return

        const newList = [...archive_sub]
        newList.push(form)

        if(!submitted) {
            dispatch(newArchiveList({
                id: user_id,
                archive_id: archive_id,
                archive_list: newList
            }))
            setSubmitted(true)
        }
    }

    return (
        <div className="bg-gray-800 shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] p-8 text-white">
            <div className='flex justify-between items-center mb-4'>
                <h1 className='text-2xl font-semibold text-gray-300'>{archive_name}</h1>
                {
                    activeForm ?
                    <button onClick={() => setActiveForm(false)}><FontAwesomeIcon title="Cancel" icon={faMinus} className='text-xl cursor-pointer transition-all'/></button>
                    :
                    <button onClick={() => setActiveForm(true)}><FontAwesomeIcon title="Add directory" icon={faPlus} className='text-xl cursor-pointer transition-all'/></button>  
                }
            </div>
            {
                activeForm &&
                <MotionAnimate delay={0}>
                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                    <div className='flex flex-col'>
                        <div className='flex'>
                            <input 
                                type="text" 
                                className='w-full p-1 border border-solid border-[#c0c0c0] text-gray-700'
                                onChange={(e) => setForm(e.target.value)}
                                value={form}
                            />
                            <div className='flex flex-row items-end'>
                                <button onClick={() => addDirectoryList()} className='float-left w-full bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-1 px-4 border border-[#CAD5DF] transition-colors duration-300 ease-in-out'>Add</button>
                            </div>
                        </div>
                    </div>
                </div>  
                </MotionAnimate>
            }
            <ul>
                {
                    archive_sub?.length > 0 &&
                        archive_sub.map((item, i) => {
                            return (
                                <ListPicker 
                                    key={i}
                                    active={(paramType === archive_name && paramDirectory === item)}
                                    index={i}
                                    directory={item.name}
                                    type={archive_name}
                                    parent_id={archive_id}
                                    archive_sub={archive_sub}
                                    user_id={user_id}
                                />
                            )
                        })
                }
            </ul>
        </div>
    )
}

const FormModal = ({ openModal, setOpenModal, data, user }) => {
    const dispatch = useDispatch()

    const closeModal = () => {
        setOpenModal(false)
    }

    const [activeForm, setActiveForm] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [form, setForm] = useState('')

    useEffect(() => {
        setSubmitted(false)
        setActiveForm(false)
        setForm('')
    }, [data])

    const addDirectoryList = () => {
        var duplicate = false
        data.archive_list.forEach((item) => { if(item.name === form) duplicate = true })
        if(duplicate) return

        const newList = [...data.archive_list]
        newList.push({
            name: form,
            privacy: 'public',
            updated: moment().tz('UTC').format('YYYY-MM-DDTHH:mm:ss.SSSZ')
        })
       
        if(!submitted) {
            dispatch(newArchiveList({
                id: user,
                archive_id: data._id,
                archive_list: newList
            }))
            setSubmitted(true)
        }
    }

    return (
        <>
            {/* Backdrop */}
            {openModal && (
                <div className="fixed inset-0 bg-black opacity-90 z-40"></div>
            )}
            {
                openModal && (
                    <div
                        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                    >
                        <div className="relative my-6 mx-auto w-[400px]">
                            {/*content*/}
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                {/*header*/}
                                        <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                                            <h3 className="text-2xl font-semibold">
                                                Edit Archive
                                            </h3>
                                            <button
                                                className="flex align-middle justify-center ml-auto bg-transparent border-0 text-black opacity-100 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                                onClick={() => closeModal()}
                                            >
                                                <span className="bg-transparent text-black h-6 w-6 block outline-none focus:outline-none">
                                                ×
                                                </span>
                                            </button>
                                        </div>
                                {/*body*/}
                                <div className="relative p-6 flex-auto h-auto">
                                    <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                        <div className='flex flex-col'>
                                            <div className='flex'>
                                                <input 
                                                    type="text" 
                                                    className='w-full p-1 border border-solid border-[#c0c0c0] text-gray-700'
                                                    onChange={(e) => setForm(e.target.value)}
                                                    value={form}
                                                />
                                                <div className='flex flex-row items-end'>
                                                    <button onClick={() => addDirectoryList()} className='float-left w-full bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-1 px-4 border border-[#CAD5DF] transition-colors duration-300 ease-in-out'>Add</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div> 
                                    <ul>
                                        {
                                            data.archive_list?.length > 0 &&
                                                data.archive_list.map((item, i) => {
                                                    return (
                                                        <ListPicker 
                                                            key={i}
                                                            active={false}
                                                            index={i}
                                                            directory={item.name}
                                                            type={item.archive_name}
                                                            parent_id={data._id}
                                                            archive_sub={data.archive_list}
                                                            user_id={user}
                                                        />
                                                    )
                                                })
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}

const Directory = ({ data, setOpenModal, setSelectedIndex, index }) => {

    const [open, setOpen] = useState(false)

    return (
        <div style={{borderColor: data.bg_color}} className='relative font-poppins grid grid-cols-3 rounded-md w-full border-l-[6px] border-solid bg-gray-100 shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] px-6 py-4'>
            <button onClick={() => setOpen(!open)} className='absolute top-0 right-0 px-4 py-2 '><FontAwesomeIcon icon={faEllipsisH} className=''/></button>
            {
                open &&
                <div className='absolute top-8 right-4 bg-gray-100 shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] p-2 px-4 text-sm rounded-md'>
                    <button 
                        onClick={() => {
                            setOpenModal(true)
                            setSelectedIndex(index)
                            setOpen(false)
                        }}
                        className='hover:font-semibold'><FontAwesomeIcon icon={faPencilAlt}/> Edit</button>
                    {
                        (data.archive_name !== "Videos" && data.archive_name !== 'Blogs' && data.archive_name !== 'Games' && data.archive_name !== 'Software') &&
                        <>
                             <br/>
                            <button className='hover:font-semibold'><FontAwesomeIcon icon={faTrashAlt}/> Delete</button>
                        </>
                    }
                </div>
            }
            <div className='col-span-2'>
                <p className='text-gray-800 font-semibold text-lg'>{data.archive_name}</p>
                <Link to={`/archive/${data.archive_name}`}><p style={{color: data.bg_color}} className='[text-shadow:_0_2px_0_rgb(0_0_0_/_30%)] text-2xl my-2 font-semibold'>{data.archive_list.length} {data.archive_list.length > 1 ? "Directories" : "Directory"}</p></Link>
                <p className='text-gray-800 text-sm'>Updated {moment(data.updatedAt).fromNow()}</p>
            </div>
            <div className='flex items-center justify-end'>
                <FontAwesomeIcon icon={['fas', data.icon]} title={data.archive_name} style={{color: data.icon_color, background: data.icon_bg_color, borderColor: data.icon_bg_color}}  className='text-xl transition-all p-4 border rounded-full'/>
            </div>
        </div>
    )
}
const Archive = ({ user }) => {
    const dispatch = useDispatch()
    const archiveNames = useSelector((state) => state.archive.archiveName)
    const sideAlert = useSelector((state) => state.archive.sideAlert)

    const [archiveNameData, setArchiveNameData] = useState([])
    const [alertActive, setAlertActive] = useState(false)
    const [alertSubActive, setAlertSubActive] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [openModal, setOpenModal] = useState(false)

    const [alertInfo, setAlertInfo] = useState({
        variant: '',
        heading: '',
        paragraph: ''
    })

    useEffect(() => {
        dispatch(getArchiveNameById({
            id: user ? user.result?._id : '',
        }))
    }, [getArchiveNameById])    

    useEffect(() => {
        setArchiveNameData(archiveNames)
    }, [archiveNames])

    useEffect(() => {
        if(Object.keys(sideAlert).length !== 0){
            setAlertInfo({
                variant: sideAlert.variant,
                heading: sideAlert.heading,
                paragraph: sideAlert.paragraph
            })
            setAlertActive(true)

            dispatch(clearAlert())
        }
    }, [sideAlert])

    return (
        <div
            className="relative bg-cover bg-center py-20"
            style={{ backgroundColor: "#111827" }}
        >   
            <SideAlert
                variants={alertInfo.variant}
                heading={alertInfo.heading}
                paragraph={alertInfo.paragraph}
                active={alertActive}
                setActive={setAlertActive}
            />

            <FormModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                data={archiveNameData[selectedIndex]}
                user={user?.result._id}
            />

            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="container mx-auto file:lg:px-8 relative px-0">
                        <h2 className='text-3xl text-white font-semibold mb-4'>Archives</h2>
                        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-8">
                            {
                                archiveNameData?.length > 0 &&
                                    archiveNameData.map((item, index) => {
                                        return (
                                            <MotionAnimate animation='fadeInUp' delay={0.2 + ((index + 1) * 0.1)}>
                                                <Directory
                                                    data={item}
                                                    key={index}
                                                    setOpenModal={setOpenModal}
                                                    setSelectedIndex={setSelectedIndex}
                                                    index={index}
                                                />
                                            </MotionAnimate>
                                        )
                                    })
                            }
                        </div>
 
                        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                            <div>
                                {
                                    archiveNameData?.length > 0 &&
                                        archiveNameData.map((item, index) => {
                                            return (
                                                <div key={index} className={`${index !== (archiveNameData.length - 1) ? 'mb-2' : 'mb-0' }`}>
                                                    <Directory2
                                                        archive_name={item.archive_name}
                                                        archive_sub={item.archive_list}
                                                        user_id={item.user}
                                                        archive_id={item._id}
                                                    />
                                                </div>
                                            )
                                        })
                                }
                            </div>
                            <div className="md:col-span-2 bg-gray-800 shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] sm:p-16 p-8 text-white">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Archive