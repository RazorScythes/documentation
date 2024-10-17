import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH, faMinus, faPencilAlt, faPencilSquare, faPlus, faTrash, faTrashAlt, faVideo } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom'
import { getArchiveNameById, getArchiveDataById, newArchiveList, removeArchiveList, clearAlert } from "../../actions/archive";
import SideAlert from '../SideAlert'
import styles from "../../style";
import { MotionAnimate } from 'react-motion-animate'
import moment from 'moment';

const Directory = ({ data, parentData }) => {

    const [open, setOpen] = useState(false)

    return (
        <div style={{borderColor: parentData.bg_color}} className='relative font-poppins grid grid-cols-3 rounded-md w-full border-l-[6px] border-solid bg-gray-100 shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] px-6 py-4'>
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
                        (data.name !== "Default Archive") &&
                        <>
                             <br/>
                            <button className='hover:font-semibold'><FontAwesomeIcon icon={faTrashAlt}/> Delete</button>
                        </>
                    }
                </div>
            }
            <div className='col-span-2'>
                <p className='text-gray-800 font-semibold text-lg relative'>{data.name}<span className='relative top-[-7px] text-xs ml-1 capitalize'> {data.privacy}</span></p>
                <Link to={`/archive/${parentData.archive_name}`}><p style={{color: parentData.bg_color}} className='[text-shadow:_0_2px_0_rgb(0_0_0_/_30%)] text-2xl my-2 font-semibold'>{data.items ? data.items : 0} {data.items > 1 ? "Items" : "Item"}</p></Link>
                <p className='text-gray-800 text-sm'>Updated {moment(data.updated).fromNow()}</p>
            </div>
            <div className='flex items-center justify-end'>
                <FontAwesomeIcon icon={['fas', parentData.icon]} title={data.archive_name} style={{color: parentData.icon_color, background: parentData.icon_bg_color, borderColor: parentData.icon_bg_color}}  className='text-xl transition-all p-4 border rounded-full'/>
            </div>
        </div>
    )
}

const ArchiveDirectory = ({ user }) => {
    const dispatch = useDispatch()
    const { archive } = useParams();

    const archiveNames = useSelector((state) => state.archive.archiveData)
    const sideAlert = useSelector((state) => state.archive.sideAlert)

    const [archiveNameData, setArchiveNameData] = useState({})
    const [alertActive, setAlertActive] = useState(false)
    const [alertInfo, setAlertInfo] = useState({
        variant: '',
        heading: '',
        paragraph: ''
    })

    useEffect(() => {
        dispatch(getArchiveDataById({
            id: user ? user.result?._id : '',
            archive: archive
        }))
    }, [getArchiveDataById])    

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

            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="container mx-auto file:lg:px-8 relative px-0">
                        <h2 className='text-3xl text-white font-semibold mb-4'>{archive} Archives</h2>
                        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-8">
                            {
                                Object.keys(archiveNames).length !== 0 &&
                                archiveNames?.archive_list &&
                                    archiveNames.archive_list.map((item, index) => {
                                        return (
                                            <MotionAnimate animation='fadeInUp' delay={0.2 + ((index + 1) * 0.1)}>
                                                <Directory
                                                    data={item}
                                                    parentData={archiveNames}
                                                />
                                            </MotionAnimate>
                                        )
                                    })
                                
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ArchiveDirectory