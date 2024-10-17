import React, { useEffect, useState, useRef  } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faTrash, faAngleDoubleLeft, faAngleDoubleRight, faEye, faPencil, faArrowUpRightFromSquare, faArrowRight, faArrowLeft, faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux'
import { getUserVideo,  editVideo, removeVideo, changePrivacyById, changeStrictById, changeDownloadById, bulkRemoveVideo } from "../../../actions/uploads";
import { convertDriveImageLink, millisToTimeString } from '../../Tools'
import { getGroupList, clearAlert } from "../../../actions/video";
import VideoModal from '../../VideoModal';
import Alert from '../../Alert';
import VideoTableData from '../sections/VideoTableData';

import styles from '../../../style'
import axios from 'axios';

const Videos = ({ user, path }) => {

    const dispatch = useDispatch()
    const navigate  = useNavigate()

    const alert = useSelector((state) => state.uploads.alert)
    const variant = useSelector((state) => state.uploads.variant)
    const video = useSelector((state) => state.uploads.video)
    const groups = useSelector((state) => state.video.groups)

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const [searchParams, setSearchParams] = useSearchParams();
    const [pageIndex, setPageIndex] = useState(1)
    const [displayedPages, setDisplayedPages] = useState([]);
    const [deleteId, setDeleteId] = useState([])
    const [searchVideo, setSearchVideo] = useState('')
    const [data, setData] = useState(null)
    const [videoRecord, setVideoRecord] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState(false)
    const [edit, setEdit] = useState(false)
    const [recordOpenModal, setRecordOpenModal] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [openModal, setOpenModal] = useState(false)
    const [tags, setTags] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [groupList, setGroupList] = useState([])
    const [form, setForm] = useState({
        title: '',
        link: '',
        owner: '',
        groups: '',
        tags: [],
        strict: true,
        privacy: false,
        downloadable: false
    })
    const [input, setInput] = useState({
        tags: '',
        gameTags: '',
        blogTags: '',
        gallery: '',
        storage_name: 'Google Drive',
        link_list: []
    })

    const [showAlert, setShowAlert] = useState(false)
    const [alertInfo, setAlertInfo] = useState({
        alert: '',
        variant: ''
    })

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const totalPages = Math.ceil(data?.length / itemsPerPage);

    useEffect(() => {
        dispatch(getUserVideo({ id: user.result?._id }))
        dispatch(getGroupList({ 
            id: user.result?._id,
            type: 'video'
        }))
    }, [])

    useEffect(() => {
        if(groups && groups.length > 0){
            const arr = groups.map((item) => {
                return {
                    id: item._id,
                    group_name: item.group_name
                }
            })
            setGroupList(arr)
        }
    }, [groups])

    useEffect(() => {
        if(alert && variant){
            setAlertInfo({ ...alertInfo, alert: alert, variant: variant })
            setShowAlert(true)
            window.scrollTo(0, 0)

            dispatch(clearAlert())
        }
    }, [alert, variant])

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

    const deleteVideo = (index) => {
        if(confirm(`Are you sure you want to delete video ${video[index].title}?`)) {
            dispatch(removeVideo({ 
                id: user.result?._id,
                video_id: video[index]._id 
            }))
        }
    }

    useEffect(() => {
        if(video && video.length > 0){
            if(searchVideo.length > 0) {
                const keyword = searchVideo.toLowerCase();
                const filteredData = video.filter((item) =>
                    Object.values(item).some((value) =>
                        String(value).toLowerCase().includes(keyword)
                    )
                );
                setData(filteredData);
            }
            else {
                setData(video)
            }
        }
        setTags([])
        setForm({
            title: '',
            link: '',
            owner: '',
            groups: '',
            tags: [],
            strict: true,
            privacy: false,
            downloadable: false
        })
        setInput({tags: '', gameTags: '', gallery: '', blogTags: '', storage_name: 'Google Drive', link_list: []})
        setSubmitted(false)
        setEdit(false)
        setCurrentIndex(0)
    }, [video])

    const handleVideoSearch = (event) => {
        const keyword = event.target.value.toLowerCase();
        setSearchVideo(event.target.value);
    
        const filteredData = video.filter((item) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(keyword)
          )
        );

        setCurrentPage(1)
        setData(filteredData);
    };
    

    /* =================================================== */
    /*                      FORM SECTION                   */
    /* =================================================== */

    const [bulkStatus, setBulkStatus]       = useState(false)
    const [bulkForm, setBulkForm]           = useState({
        api_key: '',
        drive_id: '',
        title: '',
        link: '',
        owner: '',
        groups: '',
        privacy: false,
        strict: true,
        downloadable: false,
        tags: []
    })

    const [bulkTags, setBulkTags]           = useState('')
    const [showBulkAlert, setShowBulkAlert] = useState(false)
    const [bulkSubmitted, setBulkSubmitted] = useState(false)
    const [APIProperties, setAPIProperties] = useState(false)
    const [bulkError, setBulkError]         = useState([])
    const [bulkAlert, setBulkAlert]         = useState({
        variant: '',
        message: ''
    })
    const [bulkUpload, setBulkUpload]       = useState(false)

    const addTags = () => {
        let duplicate = false
        if(input.tags.length === 0) return;
        tags.forEach(item => { if(input.tags === item) duplicate = true })
        if(duplicate) { duplicate = false; return;}
        setTags(tags.concat(input.tags))
        setInput({...input, tags: ''})
    }

    const deleteTags = (e) => {
        let arr = [...tags]
        arr.splice(e.currentTarget.id, 1)
        setTags([...arr])
    }

    const checkDriveValidity = (url) => {
        const urlPattern = /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/preview$/;
        const urlString = url;

        if(urlPattern.test(urlString)) setError(false)
        else setError(true)
    }

    const editMode = (index) =>{
        window.scrollTo(0, 150)
        setCurrentIndex(index)
        setForm({
            title: video[index].title,
            link: video[index].link,
            owner: video[index].owner,
            groups: video[index].groups?._id,
            tags: video[index].tags,
            strict: video[index].strict,
            privacy: video[index].privacy,
            downloadable: video[index].downloadable
        })

        setTags(video[index].tags)
        setEdit(true)
    }

    const cancelEdit = () => {
        setTags([])
        setForm({
            title: '',
            link: '',
            owner: '',
            groups: '',
            tags: [],
            strict: true,
            privacy: false,
            downloadable: false
        })
        setInput({ ...input, tags: '', gameTags: '', gallery: ''})
        setEdit(false)
        setCurrentIndex(0)
    }

    const handleEdit = () =>{
        if(error || !form.title || !form.link) return

        if(!submitted) {
            let updatedRecord = {
                ...data[currentIndex],
                title: form.title,
                link: form.link,
                owner: form.owner,
                tags: tags,
                strict: form.strict,
                privacy: form.privacy,
                downloadable: form.downloadable,
                groups: form.groups
            }

            dispatch(editVideo({
                id: user.result?._id,
                data: updatedRecord
            }))

            setSubmitted(true)
        }
    }

    const handleSubmit = () => {
        if(error || !form.title || !form.link) return

        if(!submitted) {
            const obj = {...form}
            obj['tags'] = tags

            dispatch(uploadVideo({
                id: user.result?._id,
                data: obj
            }))

            setSubmitted(true)
        }
    }

    useEffect(() => {
        if(bulkUpload) {
            setBulkUpload(false)
            setBulkSubmitted(false)
            setBulkForm({
                ...bulkForm,
                drive_id: '',
                title: '',
                link: '',
                owner: '',
                groups: '',
                privacy: false,
                strict: true,
                downloadable: false,
                tags: []
            })
            setBulkTags('')
        }
    }, [bulkUpload])

    const addBulkTags = () => {
        let duplicate = false

        if(bulkTags.length === 0) return;

        bulkForm.tags.forEach(item => { if(bulkTags === item) duplicate = true })

        if(duplicate) { duplicate = false; return;}

        setBulkForm({...bulkForm, tags: bulkForm.tags.concat(bulkTags)})

        setBulkTags('')
    }

    const deleteBulkTags = (e) => {
        let arr = [...bulkForm.tags]
        arr.splice(e.currentTarget.id, 1)
        setBulkForm({...bulkForm, tags: [...arr]})
    }

    const is64CharactersNoSpaces = (str) => {
        return str.length > 60 && !str.includes(" ");
    }

    const fetchDriveFiles = async (api_key, drive_id) => {
        try {
          // Parent folder ID
          const parentFolderId = drive_id;
  
          // API key
          const apiKey = api_key;
  
          // const url = `https://www.googleapis.com/drive/v3/files?q='${parentFolderId}' in parents and trashed=false&fields=files(id,name,size)&key=${apiKey}`;
            const url = `https://www.googleapis.com/drive/v2/files?q='${parentFolderId}' in parents and trashed=false&key=${apiKey}`;
          // Make the GET request to the Google Drive API
          const response = await axios.get(url);

          const filesData = response.data.items;
   
          const fileDetails = filesData.map(file => ({
            id: file.id,
            name: file.title,
            alternateLink: file.alternateLink,
            downloadUrl: file.downloadUrl,
            embedLink: file.embedLink,
            fileExtension: file.fileExtension,
            webContentLink: file.webContentLink,
            thumbnailLink: file.thumbnailLink,
            duration: file.videoMediaMetadata ? file.videoMediaMetadata.durationMillis : '0',
            size: file.fileSize
          }));
  
          // Set the file details in the state
          return fileDetails;
        } catch (err) {
            console.log(err)
            return err.response.data.error
        }
    };

    const handleBulkInsert = async () => {
        if(!bulkForm.api_key || !bulkForm.drive_id || !bulkForm.owner) return 

        const files = await fetchDriveFiles(bulkForm.api_key, bulkForm.drive_id)
        if(files.code && files.message) {
            setBulkAlert({
                variant: 'danger',
                message: `${files.code}: ${files.message}`
            })
            setShowBulkAlert(true)
        }
        else if(files.length === 0) {
            setBulkAlert({
                variant: 'danger',
                message: `No data to be insert. Please check if the folder is private or has files.`
            })
            setShowBulkAlert(true)
        }
        else { 
            if(!setBulkSubmitted) return

            setBulkSubmitted(true)

            var num_video_count = 1;
            var file_count = 1
            var count = 0
            var User_API
            
            if(import.meta.env.VITE_DEVELOPMENT == "true"){
                User_API = axios.create({ baseURL: `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`})
            }
            else {
                User_API = axios.create({ baseURL: `https://main-api-eight.vercel.app/`})
            }

            files.forEach(async (file) => {
                if(file.name.toLowerCase().includes(".gif") || file.name.toLowerCase().includes(".png") || file.name.toLowerCase().includes(".jpg")) {
                    file_count = file_count + 1
                    return
                }

                var longTitle = false
                if(is64CharactersNoSpaces(file.name.replace(/\.mp4$/, ""))) longTitle = true
                const video_obj = {
                    id: user.result?._id,
                    data: {
                        title: longTitle ? `${bulkForm.owner} #${num_video_count}` : file.name.replace(/\.mp4$/, ""),
                        link: `https://drive.google.com/file/d/${file.id}/preview`,
                        owner: bulkForm.owner,
                        privacy: bulkForm.privacy,
                        strict: bulkForm.strict,
                        downloadable: bulkForm.downloadable,
                        tags: bulkForm.tags,
                    },
                    size: file.size,
                    alternateLink: file.alternateLink,
                    downloadUrl: file.downloadUrl,
                    embedLink: file.embedLink,
                    fileExtension: file.fileExtension,
                    webContentLink: file.webContentLink,
                    thumbnailLink: file.thumbnailLink,
                    duration: file.duration,
                    isbulk: true
                }

                if(longTitle) num_video_count = num_video_count + 1
                count ++;
                try {
                    if(APIProperties) {
                        await User_API.post('/uploads/updateVideoProperties', { 
                            file_id: file.id, 
                            size: file.size,
                            alternateLink: file.alternateLink,
                            downloadUrl: file.downloadUrl,
                            embedLink: file.embedLink,
                            fileExtension: file.fileExtension,
                            webContentLink: file.webContentLink,
                            thumbnailLink: file.thumbnailLink,
                            duration: file.duration
                        })

                        setBulkAlert({
                            variant: 'success',
                            message: `Video "${video_obj.data.title}" properties updated (files #${file_count})`
                        })
                    }
                    else {
                        await User_API.post('/uploads/uploadVideo', video_obj)

                        setBulkAlert({
                            variant: 'success',
                            message: `Video "${video_obj.data.title}" uploaded successfully (files #${file_count})`
                        })
                    }
                    setShowBulkAlert(true)
                }
                catch(err) {
                    console.log(err)
                    if(APIProperties) {
                        setBulkAlert({
                            variant: 'danger',
                            message: `Failed to update video properties "${video_obj.data.title}"`
                        })
                    }
                    else {
                        setBulkAlert({
                            variant: 'danger',
                            message: `Failed to upload video "${video_obj.data.title}"`
                        })
                        setBulkError(bulkError.concat(`Failed to upload video "${video_obj.data.title}"`))
                    }
                    setShowBulkAlert(true)
                }
                if(files.length === file_count) setBulkUpload(true)
                file_count = file_count + 1
            })

            //Logs
            if(APIProperties) {
                await User_API.post('/uploads/logsActivity', { 
                    data: {
                        user: user.result?._id, 
                        id: 'bulk', 
                        type: 'video',
                        method: 'PATCH', 
                        message: `Updated ${count} videos`
                    }
                })
            }
            else {
                await User_API.post('/uploads/logsActivity', { 
                    data: {
                        user: user.result?._id, 
                        id: 'bulk', 
                        type: 'video',
                        method: 'POST', 
                        message: `Uploaded ${count} videos`
                    }
                })
            }

            if(bulkError.length > 0) {
                console.log(bulkError)
                setBulkError([])
            }
        }
    }

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

    const goToPage = (page) => {
        setCurrentPage(page);
        setPageIndex(page)
    };

    return (
        <div>
            <VideoModal
                openModal={recordOpenModal}
                setOpenModal={setRecordOpenModal}
                link={videoRecord}
            />

            <VideoModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                link={form.link}
            /> 
            {
                showForm ? 
                <div className="relative font-poppins">   
                    <div className={`${styles.marginX} ${styles.flexCenter}`}>
                        <div className={`${styles.boxWidthEx}`}>
                            <div>
                                <div className="md:flex items-start justify-center mt-8 text-sm">
                                    <div className="lg:w-1/2 md:w-1/2 w-full">
                                        {
                                            edit &&
                                            <div className='grid grid-cols-2  gap-5 place-content-start mb-4 md:mt-0 mt-8'>
                                                <h2 className='text-2xl font-semibold text-gray-800 my-4'>Edit Video</h2>
                                                <div className='flex justify-end'>
                                                    <button onClick={() => {cancelEdit(); setShowForm(false)}} className='h-10 bg-blue-600 text-white border border-solid border-blue-600 p-[7px] hover:bg-blue-700  cursor-pointer font-semibold py-2 px-4 rounded-sm transition-all duration-300 ease-in-out'>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        }        
                                        {
                                            !edit &&
                                                <div className='flex justify-between mb-4 md:mt-0 mt-8'>
                                                    <h2 className='text-2xl font-semibold text-gray-800 my-4'>New Video</h2>
                                                    <div className='flex justify-end items-center'>
                                                        <button onClick={() => setBulkStatus(!bulkStatus)} className='h-10 bg-blue-600 text-white border border-solid border-blue-600 p-[7px] hover:bg-blue-700  cursor-pointer font-semibold py-2 px-4 rounded-sm transition-all duration-300 ease-in-out'>
                                                            { bulkStatus ? 'Single Insert' : 'Bulk Insert' }
                                                        </button>
                                                        <div className='flex justify-end ml-2 h-10'>
                                                            <button title="view record" onClick={() => setShowForm(false)} className='w-full bg-blue-600 text-white border border-solid border-blue-600 p-[7px] hover:bg-blue-700  transition-all cursor-pointer rounded-sm py-2 px-4 duration-300 ease-in-out'>
                                                                <FontAwesomeIcon icon={faArrowRight}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>  
                                        }   
                                        {
                                            alertInfo.alert && alertInfo.variant && showAlert &&
                                                <Alert variants={alertInfo.variant} text={alertInfo.alert} show={showAlert} setShow={setShowAlert} />
                                        }
                                        {  
                                            (edit || !bulkStatus) ?   
                                                <>              
                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                    <div className='flex flex-col'>
                                                        <label className='font-semibold mb-2'> Video Title </label>
                                                        <input 
                                                            type="text" 
                                                            className='p-2 px-4 border border-solid border-[#c0c0c0] outline-none'
                                                            value={form.title}
                                                            onChange={(e) => setForm({...form, title: e.target.value})}
                                                            placeholder='Video Title'
                                                        />
                                                    </div>
                                                </div>

                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                    <div className='flex flex-col'>
                                                        <label className='font-semibold mb-2'> Drive Video Id: </label>
                                                        <div className='flex'>
                                                            <input 
                                                                style={{borderColor: error && "red"}}
                                                                type="text" 
                                                                className='w-full p-2 px-4 border border-solid border-[#c0c0c0] outline-none'
                                                                value={form.link}
                                                                onChange={(e) => {
                                                                    setForm({...form, link: e.target.value})
                                                                    checkDriveValidity(e.target.value)
                                                                }}
                                                                placeholder='Video Id'
                                                            />
                                                            <div className='flex flex-row items-end'>
                                                                <button onClick={() => setOpenModal(true)} className='float-left w-full bg-blue-600 text-white border border-solid border-blue-600 p-[7px] hover:bg-blue-700  cursor-pointer py-2 px-4  transition-all duration-300 ease-in-out'><FontAwesomeIcon icon={faEye}/></button>
                                                            </div>
                                                        </div>
                                                        { error && <span className='leading-tight text-sm mb-2 mt-1 text-[#FF0000]'>Invalid Google Drive Link</span> }
                                                        <p className='text-gray-500 text-xs italic mt-1'>ie: https://drive.google.com/file/d/[file_id]/preview (change the file_id)</p>
                                                    </div>
                                                </div>    
                                                
                                                <label className='font-semibold mb-4'> Video Restrictions </label>

                                                <div className="flex items-center mb-2 pt-4">
                                                    <input 
                                                        id="default-checkbox" 
                                                        type="checkbox" 
                                                        className="w-4 h-4 outline-none text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        checked={form.privacy}
                                                        onChange={(e) => setForm({...form, privacy: !form.privacy})}
                                                    />
                                                    <label htmlFor="default-checkbox" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Private</label>
                                                </div>

                                                <div className="flex items-center mb-2 pt-2">
                                                    <input 
                                                        id="default-checkbox2" 
                                                        type="checkbox" 
                                                        className="w-4 h-4 outline-none text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        checked={form.strict}
                                                        onChange={(e) => setForm({...form, strict: !form.strict})}
                                                    />
                                                    <label htmlFor="default-checkbox2" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Safe Content Restriction</label>
                                                </div>     
                                                
                                                <div className="flex items-center mb-4 pt-2">
                                                    <input 
                                                        id="default-checkbox8" 
                                                        type="checkbox" 
                                                        className="w-4 h-4 outline-none text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        checked={form.downloadable}
                                                        onChange={(e) => setForm({...form, downloadable: !form.downloadable})}
                                                    />
                                                    <label htmlFor="default-checkbox8" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Downloadable</label>
                                                </div>
                                                
                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                    <div className='flex flex-col'>
                                                        <label className='font-semibold mb-2'> Groups </label>
                                                        <select
                                                            className="p-2 px-4 border border-solid border-[#c0c0c0] outline-none appearance-none"
                                                            value={form.groups}
                                                            onChange={(e) => setForm({...form, groups: e.target.value})}
                                                        >
                                                            <option value="" selected> Select Group </option>
                                                            {
                                                                groupList.map((group, index) => {
                                                                    return (
                                                                        <option key={index} value={group.id}> {group.group_name} </option>
                                                                    )
                                                                })
                                                            }
                                                        </select>
                                                    </div>
                                                </div> 

                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                    <div className='flex flex-col'>
                                                        <label className='font-semibold mb-2'> Artist Name </label>
                                                        <input 
                                                            type="text" 
                                                            className='p-2 px-4 border border-solid border-[#c0c0c0] outline-none'
                                                            value={form.owner}
                                                            onChange={(e) => setForm({...form, owner: e.target.value})}
                                                            placeholder='Artist Name'
                                                        />
                                                    </div>
                                                </div>             

                                                <div className='grid grid-cols-1  gap-5 place-content-start'>
                                                    <div className='flex flex-col'>
                                                        <label className='font-semibold mb-2'> Add Tags </label>
                                                        <div className='flex flex-row'>
                                                            <input 
                                                                type="text" 
                                                                className='w-full p-2 px-4 border border-solid border-[#c0c0c0] outline-none'
                                                                value={input.tags}
                                                                onChange={(e) => setInput({...input, tags: e.target.value})}
                                                                placeholder='Tags'
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        addTags();
                                                                    }
                                                                }}
                                                            />
                                                            <div className='flex flex-row items-end'>
                                                                <button onClick={addTags} className='float-left w-full bg-blue-600 text-white border border-solid border-blue-600 p-[7px] hover:bg-blue-700  cursor-pointer font-semibold py-2 px-4 transition-all duration-300 ease-in-out'><FontAwesomeIcon icon={faPlus}/></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>        

                                                <div className='flex flex-wrap items-center mt-2 mb-4 relative'>
                                                    {
                                                        tags && tags.length > 0 &&
                                                            tags.map((item, index) => {
                                                                return (
                                                                    <button key={index} className='text-xs flex items-center relative mt-2 px-3 ml-1 py-1 text-white bg-blue-600 rounded-full dark:bg-blue-700 hover:bg-blue-700 transition-all dark:text-white'>
                                                                        <p>{item}</p>
                                                                        <FontAwesomeIcon onClick={deleteTags} id={index} icon={faClose} className="ml-2 cursor-pointer" />
                                                                    </button>
                                                                )
                                                            })
                                                    }
                                                </div>
                                                
                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                    {
                                                        edit ?
                                                        <button onClick={handleEdit} className='float-left font-semibold text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 transition-all rounded-sm p-2'>
                                                            {
                                                                !submitted ?
                                                                "Update Changes"
                                                                :
                                                                <div className='flex flex-row justify-center items-center'>
                                                                    Update
                                                                    <div role="status">
                                                                        <svg aria-hidden="true" class="w-5 h-5 ml-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                                                        </svg>
                                                                        <span class="sr-only">Loading...</span>
                                                                    </div>
                                                                </div>
                                                            }
                                                        </button>
                                                        :
                                                        <button onClick={handleSubmit} className='float-left font-semibold text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 transition-all rounded-sm p-2'>
                                                            {
                                                                !submitted ?
                                                                "Upload Video"
                                                                :
                                                                <div className='flex flex-row justify-center items-center'>
                                                                    Uploading
                                                                    <div role="status">
                                                                        <svg aria-hidden="true" class="w-5 h-5 ml-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                                                        </svg>
                                                                        <span class="sr-only">Loading...</span>
                                                                    </div>
                                                                </div>
                                                            }
                                                        </button>
                                                    }
                                                </div> 
                                                </>
                                            :
                                            <>
                                                {
                                                    bulkAlert.variant && bulkAlert.message && showBulkAlert && 
                                                        <Alert variants={bulkAlert.variant} text={bulkAlert.message} show={showBulkAlert} setShow={setShowBulkAlert} />
                                                }
                                                <div className="flex items-center mb-6 pt-2">
                                                    <input 
                                                        id="api-checkbox" 
                                                        type="checkbox" 
                                                        className="w-4 h-4 outline-none text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        checked={APIProperties}
                                                        onChange={(e) => setAPIProperties(!APIProperties)}
                                                    />
                                                    <label htmlFor="api-checkbox" className="ml-2 font-semibold text-gray-900 dark:text-gray-300">Update Only API Properties</label>
                                                </div>
                                                <div className='grid sm:grid-cols-1 grid-cols-1 gap-5 place-content-start mb-4'>
                                                    {/* <div className='flex flex-col'>
                                                        <label className='font-semibold'> API Key: </label>
                                                        <input 
                                                            type="text" 
                                                            className='p-2 border border-solid border-[#c0c0c0]'
                                                            value={bulkForm.api_key}
                                                            onChange={(e) => setBulkForm({...bulkForm, api_key: e.target.value})}
                                                        />
                                                    </div> */}
                                                    <div className='flex flex-col'>
                                                        <label className='font-semibold mb-2'> Drive Folder ID </label>
                                                        <input 
                                                            type="text" 
                                                            className='p-2 px-4 border border-solid border-[#c0c0c0] outline-none'
                                                            value={bulkForm.drive_id}
                                                            onChange={(e) => setBulkForm({...bulkForm, drive_id: e.target.value})}
                                                            placeholder='Folder ID'
                                                        />
                                                    </div>
                                                </div>   
                                                
                                                <label className='font-semibold mb-4'> Video Restrictions </label>
                                                
                                                <div className="flex items-center mb-2 pt-4">
                                                    <input 
                                                        id="default-checkbox3" 
                                                        type="checkbox" 
                                                        className="w-4 h-4 outline-none text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        checked={bulkForm.privacy}
                                                        onChange={(e) => setBulkForm({...bulkForm, privacy: !bulkForm.privacy})}
                                                    />
                                                    <label htmlFor="default-checkbox3" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Private</label>
                                                </div>

                                                <div className="flex items-center mb-2 pt-2">
                                                    <input 
                                                        id="default-checkbox4" 
                                                        type="checkbox" 
                                                        className="w-4 h-4 outline-none text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        checked={bulkForm.strict}
                                                        onChange={(e) => setBulkForm({...bulkForm, strict: !bulkForm.strict})}
                                                    />
                                                    <label htmlFor="default-checkbox4" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Safe Content Restriction</label>
                                                </div>     
                                                
                                                <div className="flex items-center mb-4 pt-2">
                                                    <input 
                                                        id="default-checkbox10" 
                                                        type="checkbox" 
                                                        className="w-4 h-4 outline-none text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        checked={bulkForm.downloadable}
                                                        onChange={(e) => setBulkForm({...bulkForm, downloadable: !bulkForm.downloadable})}
                                                    />
                                                    <label htmlFor="default-checkbox10" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Downloadable</label>
                                                </div>
                                                
                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                    <div className='flex flex-col'>
                                                        <label className='font-semibold mb-2'> Groups </label>
                                                        <select
                                                            className="p-2 px-4 border border-solid border-[#c0c0c0] outline-none appearance-none"
                                                            value={form.groups}
                                                            onChange={(e) => setBulkForm({...form, groups: e.target.value})}
                                                        >
                                                            <option value="" selected> Select Group </option>
                                                            {
                                                                groupList.map((group, index) => {
                                                                    return (
                                                                        <option key={index} value={group.id}> {group.group_name} </option>
                                                                    )
                                                                })
                                                            }
                                                        </select>
                                                    </div>
                                                </div> 
                                                
                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                    <div className='flex flex-col'>
                                                        <label className='font-semibold mb-2'> Artist Name </label>
                                                        <input 
                                                            type="text" 
                                                            className='p-2 px-4 border border-solid border-[#c0c0c0] outline-none'
                                                            value={bulkForm.owner}
                                                            onChange={(e) => setBulkForm({...bulkForm, owner: e.target.value})}
                                                            placeholder='Artist Name'
                                                        />
                                                    </div>
                                                </div>

                                                <div className='grid grid-cols-1  gap-5 place-content-start'>
                                                    <div className='flex flex-col'>
                                                        <label className='font-semibold'> Group Tags: </label>
                                                        <div className='flex flex-row'>
                                                            <input 
                                                                type="text" 
                                                                className='w-full p-2 border border-solid border-[#c0c0c0] outline-none'
                                                                value={bulkTags}
                                                                onChange={(e) => setBulkTags(e.target.value)}
                                                                placeholder='Tags'
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        addBulkTags();
                                                                    }
                                                                }}
                                                            />
                                                            <div className='flex flex-row items-end'>
                                                                <button onClick={addBulkTags} className='float-left w-full bg-blue-600 text-white border border-solid border-blue-600 p-[7px] hover:bg-blue-700  cursor-pointer font-semibold py-2 px-4 transition-all duration-300 ease-in-out'><FontAwesomeIcon icon={faPlus}/></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>        

                                                <div className='flex flex-wrap items-center mt-2 mb-4 relative'>
                                                    {
                                                        bulkForm.tags && bulkForm.tags.length > 0 &&
                                                            bulkForm.tags.map((item, index) => {
                                                                return (
                                                                    <button key={index} className='text-xs flex items-center relative mt-2 px-3 ml-1 py-1 text-white bg-blue-600 rounded-full dark:bg-blue-700 hover:bg-blue-700 transition-all dark:text-white'>
                                                                        <p>{item}</p>
                                                                        <FontAwesomeIcon onClick={deleteBulkTags} id={index} icon={faClose} className="ml-2 cursor-pointer" />
                                                                    </button>
                                                                )
                                                            })
                                                    }
                                                </div>

                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                    <button onClick={handleBulkInsert} className='float-left font-semibold text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 transition-all rounded-sm p-2'>
                                                        {
                                                            !bulkSubmitted ?
                                                            "Upload"
                                                            :
                                                            <div className='flex flex-row justify-center items-center'>
                                                                Uploading
                                                                <div role="status">
                                                                    <svg aria-hidden="true" class="w-5 h-5 ml-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                                                    </svg>
                                                                    <span class="sr-only">Loading...</span>
                                                                </div>
                                                            </div>
                                                        }
                                                    </button>
                                                </div>
                                            </>
                                        }
                                    </div>

                                    <div className="lg:w-1/2 md:w-1/2 w-full">
                                        
                                    </div>
                                </div>     
                            </div>
                        </div>
                    </div>  
                </div>
                : null
            }                       

            {
                !showForm ?
                <div className="relative font-poppins">   
                    <div className={`${styles.marginX} ${styles.flexCenter}`}>
                        <div className={`${styles.boxWidthEx}`}>
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
                                                    value={searchVideo}
                                                    onChange={handleVideoSearch}
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
                                                        value={searchVideo}
                                                        onChange={handleVideoSearch}
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
                                                            <th class="px-4 py-3">Video</th>
                                                            <th class="px-4 py-3">Visible</th>
                                                            <th class="px-4 py-3">Restricted</th>
                                                            <th class="px-4 py-3">Downloadable</th>
                                                            <th class="px-4 py-3">Views</th>
                                                            <th class="px-4 py-3">Tags</th>
                                                            <th class="px-4 py-3">Group</th>
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
                                                                                        <div onClick={() => { setVideoRecord(item.link); setRecordOpenModal(true) }} className='cursor-pointer bg-black rounded-lg overflow-hidden md:w-32 md:min-w-32 xs:w-32 xs:min-w-32 w-32 min-w-32 h-20 mr-2 relative border border-gray-900'>
                                                                                            <img 
                                                                                                src={convertDriveImageLink(item.link)} alt="Video Thumbnail" 
                                                                                                // src={''} alt="Video Thumbnail" 
                                                                                                className='mx-auto object-cover h-20 text-xs'
                                                                                            />
                                                                                            <div className='absolute bottom-1 right-1 rounded-sm bg-blue-600 border border-solid border-blue-600 text-white'>
                                                                                                <p className='p-1 px-1 py-0 text-xs'>{item.duration ? millisToTimeString(item.duration) : 'embed'}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className='md:max-w-[150px] max-w-[125px] text-xs'>
                                                                                            <p class="font-semibold truncate">{item.title}</p>
                                                                                            <p class="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                                                            {item.owner}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <VideoTableData 
                                                                                    cond={item.privacy}
                                                                                    api_call={changePrivacyById({
                                                                                        id: item._id,
                                                                                        privacy: !item.privacy
                                                                                    })}
                                                                                    // type="videos"
                                                                                    // id={item._id}
                                                                                    // access_key={item.access_key}
                                                                                />
                                                                                <VideoTableData 
                                                                                    cond={item.strict}
                                                                                    api_call={changeStrictById({
                                                                                        id: item._id,
                                                                                        strict: !item.strict
                                                                                    })}
                                                                                />
                                                                                <VideoTableData 
                                                                                    cond={item.downloadable}
                                                                                    api_call={changeDownloadById({
                                                                                        id: item._id,
                                                                                        downloadable: !item.downloadable
                                                                                    })}
                                                                                />
                                                                                <td class="px-4 py-3 text-xs font-semibold">
                                                                                    {item.views.length}
                                                                                </td>
                                                                                <td class="px-4 py-3 text-xs truncate">
                                                                                    <div className="flex sm:flex-wrap items-center gap-1">
                                                                                        {
                                                                                            item.tags?.length > 0 &&
                                                                                            item.tags.map((tag, i) => {
                                                                                                return (
                                                                                                    <span key={i} class="px-2 ml-1 py-1 text-white bg-blue-600 rounded-full dark:bg-blue-700 dark:text-white">
                                                                                                        {tag.toLowerCase()}
                                                                                                        {/* milktea */}
                                                                                                    </span>
                                                                                                )
                                                                                            })
                                                                                        }
                                                                                    </div>
                                                                                </td>
                                                                                <td class="px-4 py-3 text-xs font-semibold truncate max-w-[100px]">
                                                                                    {item.groups?.group_name}
                                                                                </td>
                                                                                <td class="px-4 py-3">
                                                                                    <div class="flex items-center space-x-2 text-sm">
                                                                                        <button onClick={() => { editMode(index); setShowForm(true) }} className='border border-solid border-green-600 bg-green-600 hover:bg-green-700 rounded-sm transition-all text-white p-2 py-1'>
                                                                                            <FontAwesomeIcon icon={faPencil} className=''/>
                                                                                        </button>
                                                                                        <button onClick={() => deleteVideo(index)}  className='mr-2 border border-solid border-red-600 bg-red-600 hover:bg-red-700 rounded-sm transition-all text-white p-2 py-1'>
                                                                                            <FontAwesomeIcon icon={faTrash} className=''/>
                                                                                        </button>
                                                                                        <button onClick={() => { window.open(`${window.location.origin}/videos/${item._id}?access_key=${item.access_key}`) }} className='mr-2 border border-solid border-blue-600 bg-blue-600 hover:bg-blue-700 rounded-sm transition-all text-white p-2 py-1'>
                                                                                            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className=''/>
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
                                                        Showing {(endIndex >= video.length) ? video.length : endIndex } of {video?.length}
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
                                                Showing {(endIndex >= video.length) ? video.length : endIndex } of {video?.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>  
                : null
            }
        </div>
    )
}

export default Videos