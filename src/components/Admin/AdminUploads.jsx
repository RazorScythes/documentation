import React, { useEffect, useState } from 'react'
import { Header } from './index'
import { Link, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faEdit, faTrash, faVideoCamera, faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight, faEye, faArrowUp, faArrowDown, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux'
import { changeGamePrivacyById, changeGameStrictById, bulkRemoveBlog, removeBlog, getUserVideo, getUserGame, getUserBlog, uploadVideo, clearAlert, bulkRemoveGame, removeGame, editVideo, editGame, editBlog, removeVideo, changePrivacyById, changeStrictById, changeBlogPrivacyById, changeBlogStrictById, changeDownloadById, bulkRemoveVideo, uploadGame, uploadBlog } from "../../actions/uploads";
import axios from 'axios';
import EmbedFull from '../EmbedFull'
import VideoModal from '../VideoModal';
import Alert from '../Alert';
import VideoTableData from './sections/VideoTableData';
import GameViewModal from './sections/GameViewModal';
import ImageModal from '../ImageModal';
import BlogsForm from './BlogsForm';
import styles from '../../style'

import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import { faCopy } from '@fortawesome/free-regular-svg-icons';

function generateRandomID(length = 20) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
}

const AdminUploads = ({ user, path }) => {
    const dispatch = useDispatch()

    const alert = useSelector((state) => state.uploads.alert)
    const variant = useSelector((state) => state.uploads.variant)
    const video = useSelector((state) => state.uploads.video)
    const game = useSelector((state) => state.uploads.game)
    const blog = useSelector((state) => state.uploads.blog)

    const itemsPerPage = 10; // Number of items per page

    const [currentPage, setCurrentPage] = useState(1);

    const [open, setOpen] = useState({
        portfolio: false,
        pages: false,
        uploads: false,
        manage: false,
    })
    const [isOpen, setIsOpen] = useState(false)

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const [gameCurrentPage, setGameCurrentPage] = useState(1);

    // Calculate the start and end indices for the current page
    const gameStartIndex = (gameCurrentPage - 1) * itemsPerPage;
    const gameEndIndex = gameStartIndex + itemsPerPage;
    
    const [blogCurrentPage, setBlogCurrentPage] = useState(1);

    // Calculate the start and end indices for the current page
    const blogStartIndex = (blogCurrentPage - 1) * itemsPerPage;
    const blogEndIndex = blogStartIndex + itemsPerPage;

    const [searchVideo, setSearchVideo] = useState('')
    const [searchGame, setSearchGame] = useState('')
    const [searchBlog, setSearchBlog] = useState('')

    const [searchParams, setSearchParams] = useSearchParams();
    const [openModal, setOpenModal] = useState(false)
    const [recordOpenModal, setRecordOpenModal] = useState(false)
    const [videoRecord, setVideoRecord] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [tags, setTags] = useState([])
    const [error, setError] = useState(false)
    const [edit, setEdit] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [data, setData] = useState(null)
    const [form, setForm] = useState({
        title: '',
        link: '',
        owner: '',
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

    const paramIndex = searchParams.get('type') === null || searchParams.get('type') === ''
    const checkParams = (val) => {return searchParams.get('type') === val}

    useEffect(() => {
        dispatch(getUserVideo({ id: user.result?._id }))
        dispatch(getUserGame({ id: user.result?._id }))
        dispatch(getUserBlog({ id: user.result?._id }))
        setOpen({...open, uploads: true})
    }, [])

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
            tags: [],
            strict: true,
            privacy: false,
            downloadable: false
        })
        setInput({tags: '', gameTags: '', gallery: '', blogTags: '', storage_name: 'Google Drive', link_list: []})
        setSubmitted(false)
        setEdit(false)
        setCurrentIndex(0)
        //setCurrentPage(1)
    }, [video])

    useEffect(() => {
        if(alert && variant){
            setAlertInfo({ ...alertInfo, alert: alert, variant: variant })
            setShowAlert(true)
            window.scrollTo(0, 0)

            dispatch(clearAlert())
        }
    }, [alert, variant])

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToGamePage = (page) => {
        setGameCurrentPage(page);
    };

    const goToBlogPage = (page) => {
        setBlogCurrentPage(page);
    };

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
            tags: [],
            strict: true,
            privacy: false,
            downloadable: false
        })
        setInput({ ...input, tags: '', gameTags: '', gallery: ''})
        setEdit(false)
        setCurrentIndex(0)
    }

    const deleteVideo = (index) => {
        if(confirm(`Are you sure you want to delete video ${video[index].title}?`)) {
            dispatch(removeVideo({ 
                id: user.result?._id,
                video_id: video[index]._id 
            }))
        }
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
                downloadable: form.downloadable
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

    const [bulkStatus, setBulkStatus] = useState(false)
    const [bulkForm, setBulkForm] = useState({
        api_key: '',
        drive_id: '',
        title: '',
        link: '',
        owner: '',
        privacy: false,
        strict: true,
        downloadable: false,
        tags: []
    })

    const [bulkTags, setBulkTags] = useState('')
    const [showBulkAlert, setShowBulkAlert] = useState(false)
    const [bulkSubmitted, setBulkSubmitted] = useState(false)
    const [APIProperties, setAPIProperties] = useState(false)
    const [bulkAlert, setBulkAlert] = useState({
        variant: '',
        message: ''
    })
    const [bulkUpload, setBulkUpload] = useState(false)
    
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
  
          // Request URL with API key
          // const url = `https://www.googleapis.com/drive/v3/files?q='${parentFolderId}' in parents and trashed=false&fields=files(id,name,size)&key=${apiKey}`;
            const url = `https://www.googleapis.com/drive/v2/files?q='${parentFolderId}' in parents and trashed=false&key=${apiKey}`;
          // Make the GET request to the Google Drive API
          const response = await axios.get(url);
 
          // Extract the file names and IDs from the response
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

    const [bulkError, setBulkError] = useState([])
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

    const [deleteId, setDeleteId] = useState([])
    
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

    const [currentGameIndex, setCurrentGameIndex] = useState(0)
    const [gameEdit, setGameEdit] = useState(false)
    const [gameModal, setGameModal] = useState(false)
    const [gameDataModal, setGameDataModal] = useState(null)
    const [gameDeleteId, setGameDeleteId] = useState([])
    const [openImageModal, setOpenImageModal] = useState(false)
    const [displayImage, setDisplayImage] = useState('')
    const [preview, setPreview] = useState(false)
    const [gameTags, setGameTags] = useState([])
    const [gameSubmitted, setGameSubmitted] = useState(false)
    const [gameData, setGameData] = useState([])
    const [gameForm, setGameForm] = useState({
        _id: '',
        featured_image: '',
        title: '',
        category: 'Simulation',
        description: '',
        strict: false,
        privacy: false,
        landscape: false,
        carousel: false,
        details: {
            latest_version: '',
            censorship: 'Uncensored',
            language: 'English',
            developer: '',
            upload_date: Date.now(),
            platform: 'Desktop'
        },
        leave_uploader_message: '',
        gallery: [],
        access_key: [],
        download_link: [],
        guide_link: '',
        password: ''
    })

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Manila' });

    useEffect(() => {
        if(game && game.length > 0){
            if(searchGame.length > 0) {
                const keyword = searchGame.toLowerCase();
                const filteredData = game.filter((item) =>
                    Object.values(item).some((value) =>
                        String(value).toLowerCase().includes(keyword)
                    )
                );
                setGameData(filteredData);
            }
            else {
                setGameData(game)
            }
        }
        setGameTags([])
        setGameForm({
            _id: '',
            featured_image: '',
            title: '',
            category: 'Simulation',
            description: '',
            strict: false,
            privacy: false,
            landscape: false,
            carousel: false,
            details: {
                latest_version: '',
                censorship: 'Uncensored',
                language: 'English',
                developer: '',
                upload_date: formattedDate,
                platform: 'Desktop'
            },
            leave_uploader_message: '',
            gallery: [],
            access_key: [],
            download_link: [],
            guide_link: '',
            password: ''
        })
        setInput({tags: '', gameTags: '', gallery: '', storage_name: 'Google Drive', link_list: []})
        setGameSubmitted(false)
        setDisplayImage('')
        setPreview(false)
        setOpenImageModal(false)
        setCurrentGameIndex(0)
        setGameEdit(false)
    }, [game])

    const deleteGameTags = (e) => {
        let arr = [...gameTags]
        arr.splice(e.currentTarget.id, 1)
        setGameTags([...arr])
    }

    const addGameTags = () => {
        let duplicate = false
        if(input.gameTags.length === 0) return;
        gameTags.forEach(item => { if(input.gameTags === item) duplicate = true })
        if(duplicate) { duplicate = false; return;}
        setGameTags(gameTags.concat(input.gameTags))
        setInput({...input, gameTags: ''})
    }

    function checkWebsiteUrl(url) {
        return (url.startsWith("https://") || url.startsWith("[img]")) && url.includes(".") ? true : false
    }

    const addImageURL = () => {
        let duplicate = false
        if(input.gallery.length === 0 || !checkWebsiteUrl(input.gallery)) return;
        gameForm.gallery.forEach(item => { if(input.gallery === item) duplicate = true })
        if(duplicate) { duplicate = false; return;}
        let trimString = input.gallery.replace("[img]", "");
        trimString = trimString.replace("[/img]", "");
        setGameForm({ ...gameForm, gallery: gameForm.gallery.concat(trimString)})
        setInput({ ...input, gallery: ''})
    }

    const deleteImageURL = (e) => {
        let arr = [...gameForm.gallery]
        arr.splice(e.currentTarget.id, 1)
        setGameForm({...gameForm, gallery: [...arr]})
    }

    const addDownloadLink = () => {
        let duplicate = false
        if(input.storage_name.length === 0) return;
        gameForm.download_link.forEach(item => { if(input.storage_name === item.storage_name) duplicate = true })
        if(duplicate) { duplicate = false; return;}
        setGameForm({ ...gameForm, download_link: gameForm.download_link.concat({storage_name: input.storage_name, links: []})})
        setInput({ ...input, storage_name: 'Google Drive'})
    }
    
    const addPrivateKey = () => {
        setGameForm({ ...gameForm, access_key: gameForm.access_key.concat({key: generateRandomID(), download_limit: 1, user_downloaded: []})})
    }

    const handlePrivateKeyValueChange = (e, index) => {
        let arr = [...gameForm.access_key];
        arr[index] = { ...arr[index], download_limit: e.target.value };
        setGameForm({ ...gameForm, access_key: arr });
    }

    const deletePrivateKey = (e) => {
        if(confirm("Do you want to remove this access key?")) {
            let arr = [...gameForm.access_key]
            arr.splice(e.currentTarget.id, 1)
            setGameForm({...gameForm, access_key: [...arr]})
        }
    }

    const deleteDownloadLink = (e) => {
        let arr = [...gameForm.download_link]
        arr.splice(e.currentTarget.id, 1)
        setGameForm({...gameForm, download_link: [...arr]})
    }

    const addDownloadLinkItem = (e) => {
        if(input.link_list[e.currentTarget.id].length === 0) return;

        const newList = [...gameForm.download_link];
        newList[e.currentTarget.id] = {
        ...newList[e.currentTarget.id],
        links: [...newList[e.currentTarget.id].links, input.link_list[e.currentTarget.id]]
        };

        setGameForm({...gameForm, download_link: newList});

        const newInputList = [...input.link_list];
        newInputList[e.currentTarget.id] = '';

        setInput({...input, link_list: newInputList});
    }

    const deleteDownloadLinkItem = (e, id, parent_id) => {
        const updatedDownloadLinks = gameForm.download_link.map((item, index) => {
            if (index === parent_id) {
                return {
                    ...item,
                    links: item.links.filter((link, linkIndex) => linkIndex !== id)
                };
            }
            return item;
        });
    
        setGameForm({ ...gameForm, download_link: updatedDownloadLinks });
    }

    const handleDownloadLinkItemChange = (e) => {
        let arr = [...input.link_list]
        arr[e.currentTarget.id] = e.target.value
        setInput({...input, link_list: [...arr]})
    }   

    const handleGameSubmit = () => {
        if(!gameForm.featured_image || !gameForm.title || !gameForm.description || !gameForm.download_link) return

        const obj = {...gameForm}
        obj['tags'] = gameTags

        if(!gameSubmitted) {
            dispatch(uploadGame({
                id: user.result?._id,
                data: obj
            }))
            setGameSubmitted(true)
        }
    }

    const handleGameEdit = () =>{
        if(!gameForm.featured_image || !gameForm.title || !gameForm.description || !gameForm.download_link) return

        if(!gameSubmitted) {
            let updatedRecord = {
                ...gameData[currentGameIndex],
                featured_image: gameForm.featured_image,
                title: gameForm.title,
                category: gameForm.category,
                description: gameForm.description,
                strict: gameForm.strict,
                privacy: gameForm.privacy,
                landscape: gameForm.landscape,
                carousel: gameForm.carousel,
                tags: gameTags,
                details: {
                    latest_version: gameForm.details.latest_version,
                    censorship: gameForm.details.censorship,
                    language: gameForm.details.language,
                    developer: gameForm.details.developer,
                    upload_date: gameForm.details.upload_date,
                    platform: gameForm.details.platform
                },
                access_key: gameForm.access_key,
                leave_uploader_message: gameForm.leave_uploader_message,
                gallery: gameForm.gallery,
                download_link: gameForm.download_link,
                guide_link: gameForm.guide_link,
                password: gameForm.password
            }
            dispatch(editGame({
                id: user.result?._id,
                data: updatedRecord
            }))

            setGameSubmitted(true)
        }
    }

    const [showGameRecord, setShowGameRecord] = useState(false)
    const [showBlogRecord, setShowBlogRecord] = useState(false)
    const [showVideoRecord, setShowVideoRecord] = useState(false)

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

    const handleGameSearch = (event) => {
        const keyword = event.target.value.toLowerCase();
        setSearchGame(event.target.value);
    
        const filteredData = game.filter((item) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(keyword)
          )
        );
        setGameCurrentPage(1)
        setGameData(filteredData);
    };

    const handleBlogSearch = (event) => {
        const keyword = event.target.value.toLowerCase();
        setSearchBlog(event.target.value);
    
        const filteredData = blog.filter((item) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(keyword)
          )
        );
        setBlogCurrentPage(1)
        setBlogData(filteredData);
    };

    const addGameDeleteId = (index, id) => {
        const checkId = gameDeleteId.includes(id)

        if(checkId) {
            var arr = gameDeleteId.filter(item => item !== id);
            setGameDeleteId([...arr])
        }
        else {
            setGameDeleteId(gameDeleteId.concat(id))
        }
    }

    const openGameDataModal = (index, id) => {
        const gameById = gameData[index]
        setGameDataModal(gameById)
        setGameModal(true)
    }

    const deleteMultipleGames = () => {
        if(confirm(`Are you sure you want to delete ${gameDeleteId.length} games${gameDeleteId.length > 1 ? 's' : ''}?`)){
            dispatch(bulkRemoveGame({ 
                id: user.result?._id,
                game_id: gameDeleteId
            }))
            setGameDeleteId([])
        }
    }

    const deleteGame = (index) => {
        if(confirm(`Are you sure you want to delete game ${gameData[index].title}?`)) {
            dispatch(removeGame({ 
                id: user.result?._id,
                game_id: gameData[index]._id 
            }))
        }
    }

    const editGameMode = (index) =>{
        window.scrollTo(0, 150)
        setCurrentGameIndex(index)
        setGameForm({
            _id: gameData[index]._id,
            featured_image: gameData[index].featured_image,
            title: gameData[index].title,
            category: gameData[index].category,
            description: gameData[index].description,
            strict: gameData[index].strict,
            privacy: gameData[index].privacy,
            landscape: gameData[index].landscape,
            carousel: gameData[index].carousel,
            details: {
                latest_version: gameData[index].details.latest_version,
                censorship: gameData[index].details.censorship,
                language: gameData[index].details.language,
                developer: gameData[index].details.developer,
                upload_date: gameData[index].details.upload_date,
                platform: gameData[index].details.platform
            },
            access_key: gameData[index].access_key,
            leave_uploader_message: gameData[index].leave_uploader_message,
            gallery: gameData[index].gallery,
            download_link: gameData[index].download_link,
            guide_link: gameData[index].guide_link,
            password: gameData[index].password
        })
        setGameTags(gameData[index].tags)
        setGameEdit(true)
    }

    const cancelGameEdit = () => {
        setGameTags([])
        setGameForm({
            featured_image: '',
            title: '',
            category: 'Simulation',
            description: '',
            strict: false,
            privacy: false,
            landscape: false,
            carousel: false,
            details: {
                latest_version: '',
                censorship: 'Uncensored',
                language: 'English',
                developer: '',
                upload_date: formattedDate,
                platform: 'Desktop'
            },
            access_key: [],
            leave_uploader_message: '',
            gallery: [],
            download_link: [],
            guide_link: '',
            password: ''
        })
        setInput({ ...input, gameTags: '', gallery: '', storage_name: 'Google Drive', link_list: []})
        setGameEdit(false)
        setBlogsImage('')
        setBlogsImageFile('')
        setCurrentGameIndex(0)
    }

    /*
        Blogs Form
    */
    const [blogsForm, setBlogsForm] = useState({
        featured_image: '',
        post_title: '',
        content: [],
        tags: [],
        categories: 'Gaming'
    })

    const [blogModal, setBlogModal] = useState(false)
    const [blogDataModal, setBlogDataModal] = useState(null)
    const [blogDeleteId, setBlogDeleteId] = useState([])
    const [blogsImage, setBlogsImage] = useState('')
    const [blogsImageFile, setBlogsImageFile] = useState('')
    const [blogsImageModal, setBlogsImageModal] = useState(false)
    const [removeBlogsImage, setRemoveBlogsImage] = useState([])
    const [blogsPreview, setBlogsPreview] = useState(false)
    const [blogsTags, setBlogsTags] = useState([])
    const [blogEdit, setBlogEdit] = useState(false)
    const [contentSelected, setContentSelected] = useState('')
    const [blogsSubmitted, setBlogsSubmitted] = useState(false)
    const [blogData, setBlogData] = useState([])
    const [currentBlogIndex, setCurrentBlogIndex] = useState(0)

    useEffect(() => {
        if(blog && blog.length > 0){
            if(searchBlog.length > 0) {
                const keyword = searchBlog.toLowerCase();
                const filteredData = blog.filter((item) =>
                    Object.values(item).some((value) =>
                        String(value).toLowerCase().includes(keyword)
                    )
                );
                setBlogData(filteredData);
            }
            else {
                setBlogData(blog)
            }
        }
        setBlogsTags([])
        setBlogsForm({
            featured_image: '',
            post_title: '',
            content: [],
            tags: [],
            categories: 'Gaming'
        })
        setInput({...input, blogTags: ''})
        setBlogEdit(false)
        setBlogsImage('')
        setBlogsImageFile('')
        setCurrentBlogIndex(0)
        setBlogsSubmitted(false)
    }, [blog])

    const cancelBlogEdit = () => {
        setBlogsTags([])
        setBlogsForm({
            featured_image: '',
            post_title: '',
            content: [],
            tags: [],
            categories: 'Gaming'
        })
        setBlogsImage('')
        setBlogsImageFile('')
        setInput({...input, blogTags: ''})
        setBlogEdit(false)
        setCurrentBlogIndex(0)
    }

    const editBlogMode = (index) =>{
        window.scrollTo(0, 150)
        setCurrentBlogIndex(index)
        setBlogsTags(blogData[index].tags)
        setBlogsForm({
            featured_image: blogData[index].featured_image,
            post_title: blogData[index].post_title,
            content: blogData[index].content,
            tags: blogData[index].tags,
            categories: blogData[index].categories,
        })
        setBlogsImage(blogData[index].featured_image)
        setBlogEdit(true)
    }

    const addBlogDeleteId = (index, id) => {
        const checkId = blogDeleteId.includes(id)

        if(checkId) {
            var arr = blogDeleteId.filter(item => item !== id);
            setBlogDeleteId([...arr])
        }
        else {
            setBlogDeleteId(blogDeleteId.concat(id))
        }
    }   
    const openBlogDataModal = (index, id) => {
        const blogById = blogData[index]
        var link = `${window.location.origin}/blogs/${blogById._id}?embed_user_id=${blogById.user}`
        setBlogDataModal(link)
        setBlogModal(true)
    }

    const deleteMultipleBlog = () => {
        if(confirm(`Are you sure you want to delete ${blogDeleteId.length} blog${blogDeleteId.length > 1 ? 's' : ''}?`)){
            dispatch(bulkRemoveBlog({ 
                id: user.result?._id,
                blog_id: blogDeleteId
            }))
            setBlogDeleteId([])
        }
    }

    const deleteBlog = (index) => {
        if(confirm(`Are you sure you want to delete blog ${blogData[index].post_title}?`)) {
            dispatch(removeBlog({ 
                id: user.result?._id,
                blog_id: blogData[index]._id 
            }))
        }
    }

    const fileToDataUri = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target.result)
        };
        reader.readAsDataURL(file);
    })

    const cropImage = (file) => {
        if(!file) {
            return;
        }

        if(blogsImage && blogsImage.includes('https://drive.google.com')) setRemoveBlogsImage(removeBlogsImage.concat(blogsImage))

        fileToDataUri(file)
            .then(dataUri => {
                setBlogsImage(dataUri)
                setBlogsImageModal(true)
            })
    }

    const deleteBlogsTags = (e) => {
        let arr = [...blogsTags]
        arr.splice(e.currentTarget.id, 1)
        setBlogsTags([...arr])
    }

    const addBlogsTags = () => {
        let duplicate = false
        if(input.blogTags.length === 0) return;
        blogsTags.forEach(item => { if(input.blogTags === item) duplicate = true })
        if(duplicate) { duplicate = false; return;}
        setBlogsTags(blogsTags.concat(input.blogTags))
        setInput({...input, blogTags: ''})
    }

    const addContentElements = () => {
        if(contentSelected === 'normal_naragraph') {
            setBlogsForm({...blogsForm, content: blogsForm.content.concat({ header: 'Normal Paragraph',  element: contentSelected, paragraph: ''})})
        }
        else if(contentSelected === 'quoted_paragraph') {
            setBlogsForm({...blogsForm, content: blogsForm.content.concat({ header: 'Quoted Paragraph',  element: contentSelected, paragraph: ''})})
        }
        else if(contentSelected === 'grid_image') {
            setBlogsForm({...blogsForm, content: blogsForm.content.concat({ header: 'Grid Image', type: 'boxed', element: contentSelected, input: '', grid_image: []})})
        }
        else if(contentSelected === 'sub_heading') {
            setBlogsForm({...blogsForm, content: blogsForm.content.concat({ header: 'Sub Heading',  element: contentSelected, heading: ''})})
        }
        else if(contentSelected === 'bullet_list') {
            setBlogsForm({...blogsForm, content: blogsForm.content.concat({ header: 'Bullet List',  element: contentSelected, input: '', list: []})})
        }
        else if(contentSelected === 'number_list') {
            setBlogsForm({...blogsForm, content: blogsForm.content.concat({ header: 'Number List',  element: contentSelected, input: '', list: []})})
        }
        else if(contentSelected === 'single_image') {
            setBlogsForm({...blogsForm, content: blogsForm.content.concat({ header: 'Single Image',  type: 'rectangular', element: contentSelected, image: ''})})
        }
    }

    const moveElementUpwards = (index) => {
        var array = [...blogsForm.content]

        // Swapping the positions of the first and second elements
        const temp = array[index];
        array[index] = array[index-1];
        array[index-1] = temp;

        setBlogsForm({...blogsForm, content: array})
    }

    const moveElementsDownwards = (index) => {
        var array = [...blogsForm.content]

        // Swapping the positions of the second and first elements
        const temp = array[index];
        array[index] = array[index+1];
        array[index+1] = temp;

        setBlogsForm({...blogsForm, content: array})
    }

    const removeElementsContent = (index) => {
        var array = [...blogsForm.content]

        array.splice(index, 1)

        setBlogsForm({...blogsForm, content: array})
    }

    const headerValue = (e, index) => {
        var array = [...blogsForm.content]
        array[index] = {...array[index], header: e.target.value};
        setBlogsForm({...blogsForm, content: array})
    }

    const paragraphValue = (e, index) => {
        var array = [...blogsForm.content];
        array[index] = {...array[index], paragraph: e.target.value};
        setBlogsForm({...blogsForm, content: array});
    }

    const headingValue = (e, index) => {
        var array = [...blogsForm.content]
        array[index] = {...array[index], heading: e.target.value};
        setBlogsForm({...blogsForm, content: array})
    }

    const singleInputValue = (e, index) => {
        var array = [...blogsForm.content]
        array[index] = {...array[index], image: e.target.value};
        setBlogsForm({...blogsForm, content: array})
    }

    const gridInputValue = (e, index) => {
        var array = [...blogsForm.content]
        array[index] = {...array[index], input: e.target.value};
        setBlogsForm({...blogsForm, content: array})
    }

    const listInputValue = (e, index) => {
        var array = [...blogsForm.content]
        array[index] = {...array[index], input: e.target.value};
        setBlogsForm({...blogsForm, content: array})
    }
    
    const typeValue = (e, index) => {
        var array = [...blogsForm.content]
        array[index] = {...array[index], type: e.target.value};
        setBlogsForm({...blogsForm, content: array})
    }

    const addGridContentImage = (index) => {       
        var array = [...blogsForm.content]

        if(!array[index].input) return
        array[index] = {
            ...array[index],
            grid_image: [...array[index].grid_image, array[index].input],
            input: ''
        };

        setBlogsForm({...blogsForm, content: array})
    }

    const addLists = (index) => {       
        var array = [...blogsForm.content]

        if(!array[index].input) return

        array[index] = {
            ...array[index],
            list: [...array[index].list, array[index].input],
            input: ''
        };

        setBlogsForm({...blogsForm, content: array})
    }

    const removeLists = (parent_index, child_index) => {
        var array = [...blogsForm.content]

        array[parent_index].list.splice(child_index, 1)

        setBlogsForm({...blogsForm, content: array})
    }

    const removeGridContentImage = (parent_index, child_index) => {
        var array = [...blogsForm.content]

        array[parent_index].grid_image.splice(child_index, 1)

        setBlogsForm({...blogsForm, content: array})
    }

    const handleBlogsSubmitted = () => {
        if(!blogsImage || !blogsForm.post_title || !blogsForm.categories) return

        const obj = {...blogsForm}
        obj['tags'] = blogsTags
        obj['featured_image'] = blogsImage

        if(!blogsSubmitted) {
            dispatch(uploadBlog({
                id: user.result?._id,
                data: obj
            }))
            setBlogsSubmitted(true)
        }
    }
    
    const handleBlogsEdit = () =>{
        if(!blogsForm.post_title || !blogsForm.categories) return

        if(!blogsSubmitted) {
            let updatedRecord = {
                ...blogData[currentBlogIndex],
                featured_image: blogsImage ? blogsImage : blogsForm.featured_image,
                post_title: blogsForm.post_title,
                content: blogsForm.content,
                tags: blogsTags,
                categories: blogsForm.categories,
            }
            dispatch(editBlog({
                id: user.result?._id,
                data: updatedRecord
            }))

            setBlogsSubmitted(true)
        }
    }
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
            <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} open={open} setOpen={setOpen} path={path}/>
            <div class="flex flex-col flex-1">
                <AdminNavbar isOpen={isOpen} setIsOpen={setIsOpen} path={path}/>
                <main class="h-full pb-16 overflow-y-auto">
                    <div class="mx-auto grid">
                        <div className="relative bg-[#F9FAFB]">   
                            <ImageModal
                                openModal={blogsImageModal}
                                setOpenModal={setBlogsImageModal}
                                image={blogsImage}
                                setImage={setBlogsImage}
                                preview={blogsPreview}
                                setPreview={setBlogsPreview}
                                aspects='portrait'
                            />

                            <VideoModal
                                openModal={openModal}
                                setOpenModal={setOpenModal}
                                link={form.link}
                            />
                            <VideoModal
                                openModal={recordOpenModal}
                                setOpenModal={setRecordOpenModal}
                                link={videoRecord}
                            />

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
                                        value: video && video.length > 0 ? video.length : 0
                                    },
                                    {
                                        label: 'games',
                                        value: gameData && gameData.length > 0 ? gameData.length : 0
                                    },
                                    {
                                        label: 'blogs',
                                        value: blogData && blogData.length > 0 ? blogData.length : 0
                                    },
                                ]}
                            />

                            <ImageModal
                                openModal={openImageModal}
                                setOpenModal={setOpenImageModal}
                                image={displayImage}
                                preview={preview}
                                setPreview={setPreview}
                            />

                            <GameViewModal
                                gameModal={gameModal}
                                setGameModal={setGameModal}
                                data={gameDataModal}
                            />

                            <EmbedFull
                                openModal={blogModal}
                                setOpenModal={setBlogModal}
                                link={blogDataModal}
                            />

                            <div className="relative">   
                                <div className={`${styles.marginX} ${styles.flexCenter}`}>
                                    <div className={`${styles.boxWidthEx}`}>
                                        <div className="container mx-auto relative px-0 sm:px-4 pb-16 pt-8">
                                            {/* <div className='flex flex-row flex-wrap items-start justify-start mb-4'>
                                                <Link to={`/account/uploads`}><p style={{backgroundColor: (paramIndex || checkParams('video')) && 'rgb(31, 41, 55)', color: (paramIndex || checkParams('video')) && 'rgb(243, 244, 246)'}} className='mb-2 font-semibold text-sm bg-gray-100 hover:bg-gray-800 hover:text-gray-100 text-gray-800 py-1 px-4 border-2 border-gray-800 hover:border-gray-800 rounded-full transition-colors duration-300 ease-in-out xs:mr-4 mr-2'>Video ({video && video.length > 0 ? video.length : 0})</p></Link>
                                                <Link to={`/account/uploads?type=games`}><p style={{backgroundColor: checkParams('games') && 'rgb(31, 41, 55)', color: checkParams('games') && 'rgb(243, 244, 246)'}} className='mb-2 font-semibold text-sm bg-gray-100 hover:bg-gray-800 hover:text-gray-100 text-gray-800 py-1 px-4 border-2 border-gray-800 hover:border-gray-800 rounded-full transition-colors duration-300 ease-in-out xs:mr-4 mr-2'>Games ({gameData && gameData.length > 0 ? gameData.length : 0})</p></Link>
                                                <Link to={`/account/uploads?type=blogs`}><p style={{backgroundColor: checkParams('blogs') && 'rgb(31, 41, 55)', color: checkParams('blogs') && 'rgb(243, 244, 246)'}} className='mb-2 font-semibold text-sm bg-gray-100 hover:bg-gray-800 hover:text-gray-100 text-gray-800 py-1 px-4 border-2 border-gray-800 hover:border-gray-800 rounded-full transition-colors duration-300 ease-in-out xs:mr-4 mr-2'>Blogs ({blogData && blogData.length > 0 ? blogData.length : 0})</p></Link>
                                                <Link to={`/account/uploads?type=popular`}><p style={{backgroundColor: checkParams('popular') && 'rgb(31, 41, 55)', color: checkParams('popular') && 'rgb(243, 244, 246)'}} className='mb-2 font-semibold text-sm bg-gray-100 hover:bg-gray-800 hover:text-gray-100 text-gray-800 py-1 px-4 border-2 border-gray-800 hover:border-gray-800 rounded-full transition-colors duration-300 ease-in-out xs:mr-4 mr-2'>Popular</p></Link>
                                            </div> */}

                                            {
                                                ((paramIndex || checkParams('video')) && !showVideoRecord) ? (
                                                    <div>
                                                        <div className="md:flex items-start justify-center mt-8">
                                                            <div className="lg:w-1/2 md:w-1/2 w-full">
                                                                {
                                                                    edit &&
                                                                    <div className='grid grid-cols-2  gap-5 place-content-start mb-4 md:mt-0 mt-8'>
                                                                        <h2 className='text-3xl font-bold text-gray-800'>Edit</h2>
                                                                        <div className='flex justify-end'>
                                                                            <button onClick={() => cancelEdit()} className='bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-4 border border-[#CAD5DF] transition-colors duration-300 ease-in-out'>
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                }        
                                                                {
                                                                    !edit &&
                                                                        <div className='flex justify-between mb-4 md:mt-0 mt-8'>
                                                                            <h2 className='text-2xl font-bold text-gray-800 my-4'>Upload Video</h2>
                                                                            <div className='flex justify-end items-center'>
                                                                                <button onClick={() => setBulkStatus(!bulkStatus)} className='h-12 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-4 border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'>
                                                                                    { bulkStatus ? 'Single Insert' : 'Bulk Insert' }
                                                                                </button>
                                                                                <div className='flex justify-end ml-2 h-12'>
                                                                                    <button title="view record" onClick={() => setShowVideoRecord(!showVideoRecord)} className='w-full bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-4 border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'>
                                                                                        <FontAwesomeIcon icon={faEye}/>
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
                                                                                <label className='font-semibold'> Video Title: </label>
                                                                                <input 
                                                                                    type="text" 
                                                                                    className='p-2 border border-solid border-[#c0c0c0]'
                                                                                    value={form.title}
                                                                                    onChange={(e) => setForm({...form, title: e.target.value})}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                            <div className='flex flex-col'>
                                                                                <label className='font-semibold'> Google Drive Embed Link: </label>
                                                                                <div className='flex'>
                                                                                    <input 
                                                                                        style={{borderColor: error && "red"}}
                                                                                        type="text" 
                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                        value={form.link}
                                                                                        onChange={(e) => {
                                                                                            setForm({...form, link: e.target.value})
                                                                                            checkDriveValidity(e.target.value)
                                                                                        }}
                                                                                    />
                                                                                    <div className='flex flex-row items-end'>
                                                                                        <button onClick={() => setOpenModal(true)} className='float-left w-full bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-4 border border-[#CAD5DF] transition-colors duration-300 ease-in-out'>Preview</button>
                                                                                    </div>
                                                                                </div>
                                                                                { error && <span className='leading-tight text-sm mb-2 mt-1 text-[#FF0000]'>Invalid Google Drive Link</span> }
                                                                                <p className='text-gray-500 text-sm italic'>ex: https://drive.google.com/file/d/[file_id]/preview (change the file_id)</p>
                                                                            </div>
                                                                        </div>    

                                                                        <div className="flex items-center mb-2 pt-2">
                                                                            <input 
                                                                                id="default-checkbox" 
                                                                                type="checkbox" 
                                                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                                checked={form.privacy}
                                                                                onChange={(e) => setForm({...form, privacy: !form.privacy})}
                                                                            />
                                                                            <label htmlFor="default-checkbox" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Private</label>
                                                                        </div>

                                                                        <div className="flex items-center mb-2 pt-2">
                                                                            <input 
                                                                                id="default-checkbox2" 
                                                                                type="checkbox" 
                                                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                                checked={form.strict}
                                                                                onChange={(e) => setForm({...form, strict: !form.strict})}
                                                                            />
                                                                            <label htmlFor="default-checkbox2" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Safe Content Restriction</label>
                                                                        </div>     
                                                                        
                                                                        <div className="flex items-center mb-4 pt-2">
                                                                            <input 
                                                                                id="default-checkbox8" 
                                                                                type="checkbox" 
                                                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                                checked={form.downloadable}
                                                                                onChange={(e) => setForm({...form, downloadable: !form.downloadable})}
                                                                            />
                                                                            <label htmlFor="default-checkbox8" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Downloadable</label>
                                                                        </div>

                                                                        <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                            <div className='flex flex-col'>
                                                                                <label className='font-semibold'> Artist Name: </label>
                                                                                <input 
                                                                                    type="text" 
                                                                                    className='p-2 border border-solid border-[#c0c0c0]'
                                                                                    value={form.owner}
                                                                                    onChange={(e) => setForm({...form, owner: e.target.value})}
                                                                                />
                                                                            </div>
                                                                        </div>             

                                                                        <div className='grid grid-cols-1  gap-5 place-content-start'>
                                                                            <div className='flex flex-col'>
                                                                                <label className='font-semibold'> Add Tags: </label>
                                                                                <div className='flex flex-row'>
                                                                                    <input 
                                                                                        type="text" 
                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                        value={input.tags}
                                                                                        onChange={(e) => setInput({...input, tags: e.target.value})}
                                                                                    />
                                                                                    <div className='flex flex-row items-end'>
                                                                                        <button onClick={addTags} className='float-left w-full bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-4 border border-[#CAD5DF] transition-colors duration-300 ease-in-out'>Add</button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>        

                                                                        <div className='flex flex-wrap items-center mt-2 mb-4 relative'>
                                                                            {
                                                                                tags && tags.length > 0 &&
                                                                                    tags.map((item, index) => {
                                                                                        return (
                                                                                            <div key={index} className='flex items-center relative mt-2 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] border border-[#CAD5DF] px-4 py-1 mr-2 xs:text-sm text-sm font-semibold transition-all capitalize'>
                                                                                                <p>{item}</p>
                                                                                                <FontAwesomeIcon onClick={deleteTags} id={index} icon={faClose} className="ml-2 cursor-pointer" />
                                                                                            </div>
                                                                                        )
                                                                                    })
                                                                            }
                                                                        </div>
                                                                        
                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                            {
                                                                                edit ?
                                                                                <button onClick={handleEdit} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
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
                                                                                <button onClick={handleSubmit} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
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
                                                                        <div className="flex items-center mb-4 pt-2">
                                                                            <input 
                                                                                id="api-checkbox" 
                                                                                type="checkbox" 
                                                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                                checked={APIProperties}
                                                                                onChange={(e) => setAPIProperties(!APIProperties)}
                                                                            />
                                                                            <label htmlFor="api-checkbox" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Update Only API Properties</label>
                                                                        </div>
                                                                        <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
                                                                            <div className='flex flex-col'>
                                                                                <label className='font-semibold'> API Key: </label>
                                                                                <input 
                                                                                    type="text" 
                                                                                    className='p-2 border border-solid border-[#c0c0c0]'
                                                                                    value={bulkForm.api_key}
                                                                                    onChange={(e) => setBulkForm({...bulkForm, api_key: e.target.value})}
                                                                                />
                                                                            </div>
                                                                            <div className='flex flex-col'>
                                                                                <label className='font-semibold'> Drive Parent ID: </label>
                                                                                <input 
                                                                                    type="text" 
                                                                                    className='p-2 border border-solid border-[#c0c0c0]'
                                                                                    value={bulkForm.drive_id}
                                                                                    onChange={(e) => setBulkForm({...bulkForm, drive_id: e.target.value})}
                                                                                />
                                                                            </div>
                                                                        </div>   

                                                                        <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                            <div className='flex flex-col'>
                                                                                <label className='font-semibold'> Artist Name: </label>
                                                                                <input 
                                                                                    type="text" 
                                                                                    className='p-2 border border-solid border-[#c0c0c0]'
                                                                                    value={bulkForm.owner}
                                                                                    onChange={(e) => setBulkForm({...bulkForm, owner: e.target.value})}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center mb-2 pt-2">
                                                                            <input 
                                                                                id="default-checkbox3" 
                                                                                type="checkbox" 
                                                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                                checked={bulkForm.privacy}
                                                                                onChange={(e) => setBulkForm({...bulkForm, privacy: !bulkForm.privacy})}
                                                                            />
                                                                            <label htmlFor="default-checkbox3" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Private</label>
                                                                        </div>

                                                                        <div className="flex items-center mb-2 pt-2">
                                                                            <input 
                                                                                id="default-checkbox4" 
                                                                                type="checkbox" 
                                                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                                checked={bulkForm.strict}
                                                                                onChange={(e) => setBulkForm({...bulkForm, strict: !bulkForm.strict})}
                                                                            />
                                                                            <label htmlFor="default-checkbox4" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Safe Content Restriction</label>
                                                                        </div>     
                                                                        
                                                                        <div className="flex items-center mb-4 pt-2">
                                                                            <input 
                                                                                id="default-checkbox10" 
                                                                                type="checkbox" 
                                                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                                checked={bulkForm.downloadable}
                                                                                onChange={(e) => setBulkForm({...bulkForm, downloadable: !bulkForm.downloadable})}
                                                                            />
                                                                            <label htmlFor="default-checkbox10" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Downloadable</label>
                                                                        </div>

                                                                        <div className='grid grid-cols-1  gap-5 place-content-start'>
                                                                            <div className='flex flex-col'>
                                                                                <label className='font-semibold'> Add Default Tags: </label>
                                                                                <div className='flex flex-row'>
                                                                                    <input 
                                                                                        type="text" 
                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                        value={bulkTags}
                                                                                        onChange={(e) => setBulkTags(e.target.value)}
                                                                                    />
                                                                                    <div className='flex flex-row items-end'>
                                                                                        <button onClick={addBulkTags} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>        

                                                                        <div className='flex flex-wrap items-center mt-2 mb-4 relative'>
                                                                            {
                                                                                bulkForm.tags && bulkForm.tags.length > 0 &&
                                                                                    bulkForm.tags.map((item, index) => {
                                                                                        return (
                                                                                            <div key={index} className='flex items-center relative mt-2 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] border border-[#CAD5DF] px-4 py-1 mr-2 xs:text-sm text-sm font-semibold transition-all capitalize'>
                                                                                                <p>{item}</p>
                                                                                                <FontAwesomeIcon onClick={deleteBulkTags} id={index} icon={faClose} className="ml-2 cursor-pointer" />
                                                                                            </div>
                                                                                        )
                                                                                    })
                                                                            }
                                                                        </div>

                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                            <button onClick={handleBulkInsert} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
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
                                                )
                                                :
                                                ((paramIndex || checkParams('video')) && showVideoRecord) ? (
                                                    <div className='min-w-full xs:w-auto w-72'>
                                                        <div className='flex justify-end'>
                                                            <button title="return" onClick={() => setShowVideoRecord(!showVideoRecord)} className='bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-4 border border-[#CAD5DF] transition-colors duration-300 ease-in-out'>
                                                                Go back
                                                            </button>
                                                        </div>
                                                        <div className='justify-between mb-2 sm:hidden flex mt-4'>
                                                            <div className=''>
                                                                {
                                                                    deleteId.length > 0 &&
                                                                        <FontAwesomeIcon title="delete" onClick={() => deleteMultipleVideos()} icon={faTrash} className="px-[12px] py-[10px] bg-red-600 hover:bg-red-700 text-gray-100 rounded-md cursor-pointer transition-all mr-2" />
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
                                                                    value={searchVideo}
                                                                    onChange={handleVideoSearch}
                                                                />
                                                            </div>
                                                        </div>
                                                        
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
                                                                        value={searchVideo}
                                                                        onChange={handleVideoSearch}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div class="xs:w-full overflow-hidden rounded-lg shadow-xs">
                                                                <div class="w-full overflow-x-auto">
                                                                    <table class="min-w-full overflow-x-auto whitespace-no-wrap">
                                                                        <thead>
                                                                            <tr
                                                                                class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border border-solid dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800"
                                                                            >
                                                                                <th class="pl-4 py-3"></th>
                                                                                <th class="px-4 py-3">Title</th>
                                                                                <th class="px-4 py-3">Preview</th>
                                                                                <th class="px-4 py-3">Private 
                                                                                    {/* <FontAwesomeIcon onClick={() => { setVideoRecord(item.link); setRecordOpenModal(true) }} icon={faChevronDown} className="mr-2" /> */}
                                                                                </th>
                                                                                <th class="px-4 py-3">Strict</th>
                                                                                <th class="px-4 py-3">Download</th>
                                                                                <th class="px-4 py-3">Tags</th>
                                                                                <th class="px-4 py-3">Action</th>
                                                                            </tr>
                                                                        </thead>
                                                                        {
                                                                            (data && data.length > 0) &&
                                                                                <tbody class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                                                                                    {
                                                                                        data.slice(startIndex, endIndex).map((item, index) => {
                                                                                            return (
                                                                                                    <tr key={index} class="text-gray-700 dark:text-gray-400">
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
                                                                                                            <div>
                                                                                                                <p class="font-semibold">{item.title}</p>
                                                                                                                <p class="text-xs text-gray-600 dark:text-gray-400">
                                                                                                                {item.owner}
                                                                                                                </p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td class="px-4 py-3 text-sm">
                                                                                                        <div className="text-sm leading-5 text-gray-900">
                                                                                                            <FontAwesomeIcon onClick={() => { setVideoRecord(item.link); setRecordOpenModal(true) }} icon={faVideoCamera} className="px-[10px] py-[7px] bg-blue-500 hover:bg-gray-800 text-gray-100 rounded-md cursor-pointer transition-all mr-2" />
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <VideoTableData 
                                                                                                        cond={item.privacy}
                                                                                                        api_call={changePrivacyById({
                                                                                                            id: item._id,
                                                                                                            privacy: !item.privacy
                                                                                                        })}
                                                                                                        type="videos"
                                                                                                        id={item._id}
                                                                                                        access_key={item.access_key}
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
                                                                                                    <td class="px-4 py-3 text-xs flex flex-wrap">
                                                                                                        <div className="flex sm:flex-wrap items-center">
                                                                                                            {
                                                                                                                item.tags?.length > 0 &&
                                                                                                                item.tags.map((tag, i) => {
                                                                                                                    return (
                                                                                                                        <span key={i} class="px-2 ml-1 py-1 font-semibold text-blue-700 bg-blue-100 rounded-full dark:bg-blue-700 dark:text-blue-100">
                                                                                                                            {tag}
                                                                                                                        </span>
                                                                                                                    )
                                                                                                                })
                                                                                                            }
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td class="px-4 py-3">
                                                                                                        <div class="flex items-center space-x-4 text-sm">
                                                                                                            <button
                                                                                                                onClick={() => { editMode(index); setShowVideoRecord(false) }}
                                                                                                                class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-blue-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                                                                                                                aria-label="Edit"
                                                                                                                >
                                                                                                                <svg
                                                                                                                class="w-5 h-5"
                                                                                                                aria-hidden="true"
                                                                                                                fill="currentColor"
                                                                                                                viewBox="0 0 20 20"
                                                                                                                >
                                                                                                                <path
                                                                                                                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                                                                                                                    ></path>
                                                                                                                </svg>
                                                                                                            </button>
                                                                                                            <button
                                                                                                                onClick={() => deleteVideo(index)} 
                                                                                                                class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-blue-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                                                                                                                aria-label="Delete"
                                                                                                                >
                                                                                                                <svg
                                                                                                                class="w-5 h-5"
                                                                                                                aria-hidden="true"
                                                                                                                fill="currentColor"
                                                                                                                viewBox="0 0 20 20"
                                                                                                                >
                                                                                                                <path
                                                                                                                    fill-rule="evenodd"
                                                                                                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                                                                                    clip-rule="evenodd"
                                                                                                                    ></path>
                                                                                                                </svg>
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
                                                                    <span class="flex items-center col-span-3">
                                                                        Showing {(endIndex >= data?.length) ? data?.length : endIndex } of {data?.length}
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
                                                                                        disabled={endIndex >= data?.length} onClick={() => goToPage(currentPage + 1)}
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
                                                                                        disabled={endIndex >= data?.length} onClick={() => goToPage(data?.length / itemsPerPage)} 
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
                                                                Showing {(endIndex >= data?.length) ? data?.length : endIndex } of {data?.length}
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
                                                                                disabled={endIndex >= data?.length} onClick={() => goToPage(currentPage + 1)}
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
                                                                                disabled={endIndex >= data?.length} onClick={() => goToPage(data?.length / itemsPerPage)} 
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
                                                )
                                                :
                                                ((paramIndex || checkParams('games')) && !showGameRecord) ? (
                                                    <div>
                                                        {
                                                            gameEdit &&
                                                            <div className='grid grid-cols-1 gap-5 place-content-start mb-4 md:mt-0 mt-8'>
                                                                {/* <h2 className='text-3xl font-bold text-gray-800'>Edit</h2> */}
                                                                <div className='flex justify-end'>
                                                                    <button onClick={() => cancelGameEdit()} className='bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-4 border border-[#CAD5DF] transition-colors duration-300 ease-in-out'>
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        }  
                                                        {
                                                            !gameEdit &&
                                                            <div className='flex justify-end'>
                                                                <button title="view record" onClick={() => setShowGameRecord(!showGameRecord)} className='bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-4 border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'>
                                                                    <FontAwesomeIcon icon={faEye}/>
                                                                </button>
                                                            </div>
                                                        }
                                                        {
                                                            alertInfo.alert && alertInfo.variant && showAlert &&
                                                                <Alert variants={alertInfo.variant} text={alertInfo.alert} show={showAlert} setShow={setShowAlert} />
                                                        }
                                                        <div className="md:flex items-start justify-center mt-4">
                                                            <div className="lg:w-1/2 md:w-1/2 w-full">
                                                                <div className='grid sm:grid-cols-2 grid-cols-1  gap-5 place-content-start '>
                                                                    <h2 className='text-2xl font-bold text-gray-800 my-4'>{gameEdit ? 'Edit Game' : 'Upload Game'}</h2>        
                                                                </div>
                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Featured Image Url: </label>
                                                                        <div className='flex flex-row'>
                                                                            <input 
                                                                                type="text" 
                                                                                className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                value={gameForm.featured_image}
                                                                                onChange={(e) => setGameForm({...gameForm, featured_image: e.target.value})}
                                                                            />
                                                                            <div className='flex flex-row items-end'>
                                                                                <button 
                                                                                    onClick={() => {
                                                                                        setPreview(true)
                                                                                        setOpenImageModal(true)
                                                                                        setDisplayImage(gameForm.featured_image)
                                                                                    }} 
                                                                                    className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'><FontAwesomeIcon icon={faEye} className="mx-4"/>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center mb-4">
                                                                    <input 
                                                                        id="default-checkbox2f" 
                                                                        type="checkbox" 
                                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                        checked={gameForm.landscape}
                                                                        onChange={(e) => setGameForm({...gameForm, landscape: !gameForm.landscape})}
                                                                    />
                                                                    <label htmlFor="default-checkbox2f" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Featured Image is Landscape?</label>
                                                                </div>

                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Game Title: </label>
                                                                        <input 
                                                                            type="text" 
                                                                            className='p-2 border border-solid border-[#c0c0c0]'
                                                                            value={gameForm.title}
                                                                            onChange={(e) => setGameForm({...gameForm, title: e.target.value})}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Category: </label>
                                                                        <select
                                                                            className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                            value={gameForm.category}
                                                                            onChange={(e) => setGameForm({...gameForm, category: e.target.value})}
                                                                        >
                                                                        <option value="Simulation" className="capitalize">Simulation</option>
                                                                        <option value="Games 3D" className="capitalize">Games 3D</option>
                                                                        <option value="Animated" className="capitalize">Animated</option>
                                                                        <option value="Extreme" className="capitalize">Extreme</option>
                                                                        <option value="Puzzle" className="capitalize">Puzzle</option>
                                                                        <option value="Virtual Reality" className="capitalize">Virtual Reality</option>
                                                                        <option value="Visual Novel" className="capitalize">Visual Novel</option>
                                                                        <option value="RPG" className="capitalize">RPG</option>
                                                                        <option value="Horror" className="capitalize">Horror</option>
                                                                        <option value="Fighting" className="capitalize">Fighting</option>
                                                                        <option value="Racing" className="capitalize">Racing</option>
                                                                        <option value="Shooting" className="capitalize">Shooting</option>
                                                                        <option value="Flash" className="capitalize">Flash</option>
                                                                        <option value="Non - Hen" className="capitalize">Non - Hen</option>
                                                                        <option value="Others" className="capitalize">Others</option>
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Game description: </label>
                                                                        <div className='flex flex-row'>
                                                                            <textarea
                                                                                name="message"
                                                                                id="message"
                                                                                cols="30"
                                                                                rows="8"
                                                                                placeholder="Message"
                                                                                className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                onChange={(e) => setGameForm({...gameForm, description: e.target.value})}
                                                                                value={ gameForm.description }
                                                                            >
                                                                            </textarea>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Leave a Message: </label>
                                                                        <div className='flex flex-row'>
                                                                            <textarea
                                                                                name="message"
                                                                                id="message"
                                                                                cols="30"
                                                                                rows="4"
                                                                                placeholder="Message"
                                                                                className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                onChange={(e) => setGameForm({...gameForm, leave_uploader_message: e.target.value})}
                                                                                value={ gameForm.leave_uploader_message }
                                                                            >
                                                                            </textarea>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center mb-2 pt-2">
                                                                    <input 
                                                                        id="default-checkbox" 
                                                                        type="checkbox" 
                                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                        checked={gameForm.privacy}
                                                                        onChange={(e) => setGameForm({...gameForm, privacy: !gameForm.privacy})}
                                                                    />
                                                                    <label htmlFor="default-checkbox" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Private</label>
                                                                </div>
                                                                
                                                                <div className="flex items-center mb-4 pt-2">
                                                                    <input 
                                                                        id="default-checkbox2" 
                                                                        type="checkbox" 
                                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                        checked={gameForm.strict}
                                                                        onChange={(e) => setGameForm({...gameForm, strict: !gameForm.strict})}
                                                                    />
                                                                    <label htmlFor="default-checkbox2" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Safe Content Restriction</label>
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Guide Game Link: </label>
                                                                        <input 
                                                                            type="text" 
                                                                            className='p-2 border border-solid border-[#c0c0c0]'
                                                                            value={gameForm.guide_link}
                                                                            onChange={(e) => setGameForm({...gameForm, guide_link: e.target.value})}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Password <span className='text-gray-500 font-normal italic text-sm'>(if game has password)</span>: </label>
                                                                        <input 
                                                                            type="text" 
                                                                            className='p-2 border border-solid border-[#c0c0c0]'
                                                                            value={gameForm.password}
                                                                            onChange={(e) => setGameForm({...gameForm, password: e.target.value})}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className='grid grid-cols-1  gap-5 place-content-start'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Add Tags: </label>
                                                                        <div className='flex flex-row'>
                                                                            <input 
                                                                                type="text" 
                                                                                className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                value={input.gameTags}
                                                                                onChange={(e) => setInput({...input, gameTags: e.target.value})}
                                                                            />
                                                                            <div className='flex flex-row items-end'>
                                                                                <button onClick={addGameTags} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>          

                                                                <div className='flex flex-wrap items-center mt-2 mb-4 relative'>
                                                                    {
                                                                        gameTags && gameTags.length > 0 &&
                                                                            gameTags.map((item, index) => {
                                                                                return (
                                                                                    <div key={index} className='flex items-center relative mt-2 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] border border-[#CAD5DF] px-4 py-1 mr-2 xs:text-sm text-sm font-semibold transition-all capitalize'>
                                                                                        <p>{item}</p>
                                                                                        <FontAwesomeIcon onClick={deleteGameTags} id={index} icon={faClose} className="ml-2 cursor-pointer" />
                                                                                    </div>
                                                                                )
                                                                            })
                                                                    }
                                                                </div>
                                                            </div>

                                                            <div className="lg:w-1/2 md:w-1/2 w-full md:pl-8">
                                                                <div className='grid sm:grid-cols-2 grid-cols-1  gap-5 place-content-start '>
                                                                    <h2 className='text-2xl font-bold text-gray-800 my-4'>Download Links</h2>        
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Storage Name: </label>
                                                                        <div className='flex flex-row'>
                                                                            <select
                                                                                className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                value={input.storage_name}
                                                                                onChange={(e) => setInput({...input, storage_name: e.target.value})}
                                                                            >
                                                                                <option value="Google Drive" className="capitalize">Google Drive</option>
                                                                                <option value="Dropbox" className="capitalize">Dropbox</option>
                                                                                <option value="Mediafire" className="capitalize">Mediafire</option>
                                                                            </select>
                                                                            <div className='flex flex-row items-end'>
                                                                                <button onClick={addDownloadLink} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1 gap-5 place-content-start text-white mb-2'>
                                                                    <div className='flex flex-row flex-wrap'>
                                                                        {
                                                                            gameForm.download_link.length > 0 &&
                                                                                gameForm.download_link.map((item, i) => {
                                                                                    return (
                                                                                        <div key={i} className='w-full border-2 border-dashed border-gray-700 p-2 mb-2'>
                                                                                            <div className='w-full flex flex-row p-2 py-3 bg-gray-800 mb-1'>
                                                                                                <div className='w-1/2 flex flex-col'>
                                                                                                    <div className='w-full flex flex-row items-center'>
                                                                                                        <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3"/> <p className='font-semibold'>{item.storage_name}</p>
                                                                                                    </div>
                                                                                                </div> 
                                                                                                <div className='w-1/2 text-right'>
                                                                                                    <FontAwesomeIcon id={i} onClick={deleteDownloadLink} icon={faTrash} className="mr-2 hover:cursor-pointer" />
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className='grid grid-cols-1 gap-5 place-content-start mb-2 text-[#000]'>
                                                                                                <div className='flex flex-col'>
                                                                                                    <label className='font-semibold'> Download Links: </label>
                                                                                                    <div className='flex flex-row'>
                                                                                                        <input 
                                                                                                            id={i}
                                                                                                            type="text" 
                                                                                                            className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                            value={input.link_list[i] ? input.link_list[i] : ''}
                                                                                                            onChange={handleDownloadLinkItemChange}
                                                                                                        />
                                                                                                        <div className='flex flex-row items-end'>
                                                                                                            <button id={i} onClick={addDownloadLinkItem} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>

                                                                                            {
                                                                                                gameForm.download_link[i].links.length > 0 &&
                                                                                                    gameForm.download_link[i].links.map((data, id) => {
                                                                                                        return(
                                                                                                            <div key={id} className='w-full flex flex-row p-2 py-3 mb-1 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] border border-[#CAD5DF]'>
                                                                                                                <div className='w-1/2 flex flex-col'>
                                                                                                                    <div className='w-full flex flex-row items-center'>
                                                                                                                        <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3"/> <p className='text-sm font-semibold break-all'>{data}</p>
                                                                                                                    </div>
                                                                                                                </div> 
                                                                                                                <div className='w-1/2 text-right'>
                                                                                                                    <FontAwesomeIcon onClick={(e) => deleteDownloadLinkItem(e, id, i)} id={id} parent_id={i} icon={faTrash} className="mr-2 hover:cursor-pointer" />
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        )
                                                                                                    })
                                                                                            }
                                                                                        </div>
                                                                                    )
                                                                                })
                                                                            }
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Private Access Key: </label>
                                                                        <div className='flex flex-row mt-2'>
                                                                            <div className='flex flex-row items-end'>
                                                                                <button onClick={addPrivateKey} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Generate Key</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {
                                                                    gameForm.access_key?.length > 0 &&
                                                                        gameForm.access_key.map((item, i) => {
                                                                            return(
                                                                                <div key={i} className='grid grid-cols-1 items-center gap-4 place-content-start mb-1'>
                                                                                    <div class="flex justify-between relative mt-2 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] border border-[#CAD5DF] px-4 py-2 mr-2 xs:text-sm text-sm font-semibold transition-all">
                                                                                        <div>
                                                                                            <FontAwesomeIcon onClick={() => {navigator.clipboard.writeText(`${window.location.origin}/games/${gameForm._id}?access_key=${item.key}`)}} icon={faCopy} className="mr-2 w-4 h-4 cursor-pointer"/>
                                                                                            Access Key #{i+1}: {item.key}
                                                                                        </div>
                                                                                        <div className="">
                                                                                            Limit: <input className="w-12" type="number" value={item.download_limit} onChange={(e) => handlePrivateKeyValueChange(e, i)}/>
                                                                                            <FontAwesomeIcon id={i} onClick={deletePrivateKey} icon={faTrash} className="ml-2 w-4 h-4 cursor-pointer"/>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })
                                                                }

                                                                <div className='grid sm:grid-cols-2 grid-cols-1  gap-5 place-content-start '>
                                                                    <h2 className='text-2xl font-bold text-gray-800 my-4'>Game Details</h2>        
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Version Number: </label>
                                                                        <input 
                                                                            type="text" 
                                                                            className='p-2 border border-solid border-[#c0c0c0]'
                                                                            value={gameForm.details.latest_version}
                                                                            onChange={(e) => setGameForm({...gameForm, details: {...gameForm.details, latest_version: e.target.value}})}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Censorship: </label>
                                                                        <select
                                                                            className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                            value={gameForm.details.censorship}
                                                                            onChange={(e) => setGameForm({...gameForm, details: {...gameForm.details, censorship: e.target.value}})}
                                                                        >
                                                                            <option value="Uncensored" className="capitalize">Uncensored</option>
                                                                            <option value="Censored" className="capitalize">Censored</option>
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Language: </label>
                                                                        <select
                                                                            className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                            value={gameForm.details.language}
                                                                            onChange={(e) => setGameForm({...gameForm, details: {...gameForm.details, language: e.target.value}})}
                                                                        >
                                                                            <option value="English" className="capitalize">English</option>
                                                                            <option value="Japanese" className="capitalize">Japanese</option>
                                                                            <option value="Chinese" className="capitalize">Chinese</option>
                                                                            <option value="Spanish" className="capitalize">Spanish</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Developer: </label>
                                                                        <input 
                                                                            type="text" 
                                                                            className='p-2 border border-solid border-[#c0c0c0]'
                                                                            value={gameForm.details.developer}
                                                                            onChange={(e) => setGameForm({...gameForm, details: {...gameForm.details, developer: e.target.value}})}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Platform: </label>
                                                                        <select
                                                                            className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                            value={gameForm.details.platform}
                                                                            onChange={(e) => setGameForm({...gameForm, details: {...gameForm.details, platform: e.target.value}})}
                                                                        >
                                                                            <option value="Desktop" className="capitalize">Desktop</option>
                                                                            <option value="Android" className="capitalize">Android</option>
                                                                            <option value="iOS" className="capitalize">iOS</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1  gap-5 place-content-start '>
                                                                    <h2 className='text-2xl font-bold text-gray-800 my-4'>Gallery Showcase</h2>        
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Image URL: </label>
                                                                        <div className='flex flex-row'>
                                                                            <input 
                                                                                type="text" 
                                                                                className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                value={input.gallery}
                                                                                onChange={(e) => setInput({...input, gallery: e.target.value })}
                                                                            />
                                                                            <div className='flex flex-row items-end'>
                                                                                <button onClick={addImageURL} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center mb-4">
                                                                    <input 
                                                                        id="default-checkbox2ff" 
                                                                        type="checkbox" 
                                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                        checked={gameForm.carousel}
                                                                        onChange={(e) => setGameForm({...gameForm, carousel: !gameForm.carousel})}
                                                                    />
                                                                    <label htmlFor="default-checkbox2ff" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Image Carousel</label>
                                                                </div>

                                                                <div className='grid grid-cols-1 gap-5 place-content-start text-white mb-2'>
                                                                    <div className='flex flex-row flex-wrap'>
                                                                        {
                                                                            gameForm.gallery.length > 0 &&
                                                                                gameForm.gallery.map((item, i) => {
                                                                                    return (
                                                                                        <div key={i} className='w-full flex flex-row p-2 py-3 mb-1 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] border border-[#CAD5DF]'>
                                                                                            <div className='w-1/2 flex flex-row items-center'>
                                                                                                <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3"/> <p className='font-semibold'>{item}</p>
                                                                                            </div>
                                                                                            <div className='w-1/2 text-right'>
                                                                                                <FontAwesomeIcon id={i} onClick={deleteImageURL} icon={faTrash} className="mr-2 hover:cursor-pointer" />
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                })
                                                                            }
                                                                    </div>
                                                                </div>       
                                                            </div>
                                                        </div>
                                                        {
                                                            gameEdit ?
                                                            <button onClick={handleGameEdit} className='float-right font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2 px-6'>
                                                                {
                                                                    !gameSubmitted ?
                                                                    "Update Changes"
                                                                    :
                                                                    <div className='flex flex-row justify-center items-center'>
                                                                        Updating
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
                                                            <button onClick={handleGameSubmit} className='float-right font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2 px-6'>
                                                                {
                                                                    !gameSubmitted ?
                                                                    "Upload Game"
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
                                                )
                                                :
                                                ((paramIndex || checkParams('games')) && showGameRecord) ? (
                                                    <div className='min-w-full xs:w-auto w-72'>
                                                        <div className='flex justify-end'>
                                                            <button title="return" onClick={() => setShowGameRecord(!showGameRecord)} className='bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-4 border border-[#CAD5DF] transition-colors duration-300 ease-in-out'>
                                                                Go back
                                                            </button>
                                                        </div>
                                                        <div className='justify-between mb-2 sm:hidden flex mt-4'>
                                                            <div className=''>
                                                                {
                                                                    gameDeleteId.length > 0 &&
                                                                        <FontAwesomeIcon title="delete" onClick={() => deleteMultipleGames()} icon={faTrash} className="px-[12px] py-[10px] bg-red-600 hover:bg-red-700 text-gray-100 rounded-md cursor-pointer transition-all mr-2" />
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
                                                                    value={searchGame}
                                                                    onChange={handleGameSearch}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="overflow-x-auto sm:mt-4">
                                                            <div className='mb-2 sm:flex hidden justify-between'>
                                                                <div className=''>
                                                                    {
                                                                        gameDeleteId.length > 0 &&
                                                                            <div className='flex'>
                                                                                <button onClick={() => deleteMultipleGames()} className='w-28 disabled:bg-gray-600 disabled:border-red-700 font-semibold border border-solid border-red-600 bg-red-600 hover:bg-red-700 hover:text-100-800 rounded-sm transition-all text-white p-2'>
                                                                                    Delete ({gameDeleteId.length})
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
                                                                        value={searchGame}
                                                                        onChange={handleGameSearch}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div class="xs:w-full overflow-hidden rounded-lg shadow-xs">
                                                                <div class="w-full overflow-x-auto">
                                                                    <table class="min-w-full overflow-x-auto whitespace-no-wrap">
                                                                        <thead>
                                                                            <tr
                                                                                class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border border-solid dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800"
                                                                            >
                                                                                <th class="pl-4 py-3"></th>
                                                                                <th class="px-4 py-3">Game Title</th>
                                                                                <th class="px-4 py-3">Private</th>
                                                                                <th class="px-4 py-3">Strict</th>
                                                                                <th class="px-4 py-3">Key Generated</th>
                                                                                <th class="px-4 py-3">Version</th>
                                                                                <th class="px-4 py-3">Platform</th>
                                                                                <th class="px-4 py-3">Action</th>
                                                                            </tr>
                                                                        </thead>
                                                                        {
                                                                            (gameData && gameData.length > 0) &&
                                                                                <tbody class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                                                                                    {
                                                                                        gameData.slice(gameStartIndex, gameEndIndex).map((item, index) => {
                                                                                            return (
                                                                                                    <tr key={index} class="text-gray-700 dark:text-gray-400">
                                                                                                    <td className='pl-4 py-3'>
                                                                                                        <div className="text-sm leading-5 text-gray-900">
                                                                                                            <input 
                                                                                                                id={`game-default-checkbox${10+index}`}
                                                                                                                type="checkbox" 
                                                                                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                                                                checked={gameDeleteId.includes(item._id)}
                                                                                                                onChange={() => addGameDeleteId(index, item._id)}
                                                                                                            />
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td class="px-4 py-3">
                                                                                                        <div class="flex items-center text-sm">
                                                                                                            <div>
                                                                                                                <p class="font-semibold">{item.title}</p>
                                                                                                                <p class="text-xs text-gray-600 dark:text-gray-400">
                                                                                                                {item.details.developer}
                                                                                                                </p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <VideoTableData 
                                                                                                        cond={item.privacy}
                                                                                                        api_call={changeGamePrivacyById({
                                                                                                            id: item._id,
                                                                                                            privacy: !item.privacy
                                                                                                        })}
                                                                                                    />
                                                                                                    <VideoTableData 
                                                                                                        cond={item.strict}
                                                                                                        api_call={changeGameStrictById({
                                                                                                            id: item._id,
                                                                                                            strict: !item.strict
                                                                                                        })}
                                                                                                    />
                                                                                                    <td class="px-4 py-3 text-xs">
                                                                                                        {item.access_key?.length ? item.access_key.length : 0}
                                                                                                    </td>
                                                                                                    <td class="px-4 py-3 text-xs">
                                                                                                        {item.details.latest_version}
                                                                                                    </td>
                                                                                                    <td class="px-4 py-3 text-xs">
                                                                                                        {item.details.platform}
                                                                                                    </td>
                                                                                                    <td class="px-4 py-3">
                                                                                                        <div class="flex items-center space-x-4 text-sm">
                                                                                                            <button
                                                                                                                onClick={() => { openGameDataModal(index, item._id) }} 
                                                                                                                class="flex items-center justify-between px-0 py-2 text-sm font-medium leading-5 text-blue-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                                                                                                                aria-label="Edit"
                                                                                                                >
                                                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                                                                                                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                                                                                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                                                                                                </svg>
                                                                                                            </button>
                                                                                                            <button
                                                                                                                onClick={() => { editGameMode(index); setShowGameRecord(false) }}
                                                                                                                class="flex items-center justify-between px-0 py-2 text-sm font-medium leading-5 text-blue-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                                                                                                                aria-label="Edit"
                                                                                                                >
                                                                                                                <svg
                                                                                                                class="w-5 h-5"
                                                                                                                aria-hidden="true"
                                                                                                                fill="currentColor"
                                                                                                                viewBox="0 0 20 20"
                                                                                                                >
                                                                                                                <path
                                                                                                                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                                                                                                                    ></path>
                                                                                                                </svg>
                                                                                                            </button>
                                                                                                            <button
                                                                                                                onClick={() => deleteGame(index)} 
                                                                                                                class="flex items-center justify-between px-0 py-2 text-sm font-medium leading-5 text-blue-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                                                                                                                aria-label="Delete"
                                                                                                                >
                                                                                                                <svg
                                                                                                                class="w-5 h-5"
                                                                                                                aria-hidden="true"
                                                                                                                fill="currentColor"
                                                                                                                viewBox="0 0 20 20"
                                                                                                                >
                                                                                                                <path
                                                                                                                    fill-rule="evenodd"
                                                                                                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                                                                                    clip-rule="evenodd"
                                                                                                                    ></path>
                                                                                                                </svg>
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
                                                                    <span class="flex items-center col-span-3">
                                                                        Showing {(gameEndIndex >= gameData?.length) ? gameData?.length : gameEndIndex } of {gameData?.length}
                                                                    </span>
                                                                    <span class="col-span-2"></span>
                                                                    <span class="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
                                                                        <nav aria-label="Table navigation">
                                                                            <ul class="inline-flex items-center">
                                                                                <li>
                                                                                    <button
                                                                                        disabled={gameCurrentPage === 1} onClick={() => goToGamePage(1)}
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
                                                                                        disabled={gameCurrentPage === 1} onClick={() => goToGamePage(gameCurrentPage - 1)}
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
                                                                                        disabled={gameEndIndex >= gameData?.length} onClick={() => goToGamePage(gameCurrentPage + 1)}
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
                                                                                        disabled={gameEndIndex >= gameData?.length} onClick={() => goToGamePage(gameData?.length / itemsPerPage)} 
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
                                                            class="md:hidden flex justify-between items-center px-2 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800"
                                                            >
                                                            <span class="flex items-center col-span-3">
                                                                Showing {(gameEndIndex >= gameData?.length) ? gameData?.length : gameEndIndex } of {gameData?.length}
                                                            </span>
                                                            <span class="col-span-2"></span>
                                                            <span class="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
                                                                <nav aria-label="Table navigation">
                                                                    <ul class="inline-flex items-center">
                                                                        <li>
                                                                            <button
                                                                                disabled={gameCurrentPage === 1} onClick={() => goToGamePage(1)}
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
                                                                                disabled={gameCurrentPage === 1} onClick={() => goToGamePage(gameCurrentPage - 1)}
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
                                                                                disabled={gameEndIndex >= gameData?.length} onClick={() => goToGamePage(gameCurrentPage + 1)}
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
                                                                                disabled={gameEndIndex >= gameData?.length} onClick={() => goToGamePage(gameData?.length / itemsPerPage)} 
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
                                                )
                                                :
                                                ((paramIndex || checkParams('blogs')) && !showBlogRecord) ? (
                                                    <div>
                                                        {
                                                            blogEdit &&
                                                            <div className='grid grid-cols-1 gap-5 place-content-start mb-4 md:mt-0 mt-8'>
                                                                {/* <h2 className='text-3xl font-bold text-gray-800'>Edit</h2> */}
                                                                <div className='flex justify-end'>
                                                                    <button onClick={() => cancelBlogEdit()} className='bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-4 border border-[#CAD5DF] transition-colors duration-300 ease-in-out'>
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        }  
                                                        {
                                                            !blogEdit &&
                                                            <div className='flex justify-end'>
                                                                <button title="view record" onClick={() => setShowBlogRecord(!showBlogRecord)} className='bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-4 border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out'>
                                                                    <FontAwesomeIcon icon={faEye}/>
                                                                </button>
                                                            </div>
                                                        }
                                                        {
                                                            alertInfo.alert && alertInfo.variant && showAlert &&
                                                                <Alert variants={alertInfo.variant} text={alertInfo.alert} show={showAlert} setShow={setShowAlert} />
                                                        }
                                                        <div className="md:flex items-start justify-center mt-4">
                                                            <div className="lg:w-1/2 md:w-1/2 w-full">
                                                                <div className='grid sm:grid-cols-2 grid-cols-1  gap-5 place-content-start '>
                                                                    <h2 className='text-2xl font-bold text-gray-800 my-4'>{blogEdit ? 'Edit Post' : 'Upload Post'}</h2>        
                                                                </div>
                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Featured Image Url: </label>
                                                                        <div className='flex flex-row'>
                                                                            <input 
                                                                                className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                id="file_input" 
                                                                                type="file"
                                                                                accept="image/*" 
                                                                                value={blogsImageFile}
                                                                                onChange={(e) => {
                                                                                    setBlogsImageFile(e.target.value)
                                                                                    cropImage(e.target.files[0] || null)
                                                                                }}
                                                                            />
                                                                            {
                                                                                blogsImage && (
                                                                                    <div className='flex flex-row items-end'>
                                                                                        <button 
                                                                                            onClick={() => {
                                                                                                setBlogsPreview(true)
                                                                                                setBlogsImageModal(true)
                                                                                            }} 
                                                                                            className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2 py-3'><FontAwesomeIcon icon={faEye} className="mx-4"/>
                                                                                        </button>
                                                                                    </div>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Post Title: </label>
                                                                        <input 
                                                                            type="text" 
                                                                            className='p-2 border border-solid border-[#c0c0c0]'
                                                                            value={blogsForm.post_title}
                                                                            onChange={(e) => setBlogsForm({...blogsForm, post_title: e.target.value})}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Category: </label>
                                                                        <select
                                                                            className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                            value={blogsForm.categories}
                                                                            onChange={(e) => setBlogsForm({...blogsForm, categories: e.target.value})}
                                                                        >
                                                                            <option value="Gaming" className="capitalize">Gaming</option>
                                                                            <option value="Fashion" className="capitalize">Fashion</option>
                                                                            <option value="Beauty" className="capitalize">Beauty</option>
                                                                            <option value="Lifestyle" className="capitalize">Lifestyle</option>
                                                                            <option value="Personal" className="capitalize">Personal</option>
                                                                            <option value="Technology" className="capitalize">Technology</option>
                                                                            <option value="Health" className="capitalize">Health</option>
                                                                            <option value="Fitness" className="capitalize">Fitness</option>
                                                                            <option value="Wellness" className="capitalize">Wellness</option>
                                                                            <option value="Business" className="capitalize">Business</option>
                                                                            <option value="Education" className="capitalize">Education</option>
                                                                            <option value="Food and Recipe" className="capitalize">Food and Recipe</option>
                                                                            <option value="Love and Relationships" className="capitalize">Love and Relationships</option>
                                                                            <option value="Alternative topics" className="capitalize">Alternative topics</option>
                                                                            <option value="Green living" className="capitalize">Green living</option>
                                                                            <option value="Music" className="capitalize">Music</option>
                                                                            <option value="Automotive" className="capitalize">Automotive</option>
                                                                            <option value="Marketing" className="capitalize">Marketing</option>
                                                                            <option value="Internet services" className="capitalize">Internet services</option>
                                                                            <option value="Finance" className="capitalize">Finance</option>
                                                                            <option value="Sports" className="capitalize">Sports</option>
                                                                            <option value="Entertainment" className="capitalize">Entertainment</option>
                                                                            <option value="Productivity" className="capitalize">Productivity</option>
                                                                            <option value="Hobbies" className="capitalize">Hobbies</option>
                                                                            <option value="Parenting" className="capitalize">Parenting</option>
                                                                            <option value="Pets" className="capitalize">Pets</option>
                                                                            <option value="Photography" className="capitalize">Photography</option>
                                                                            <option value="Agriculture" className="capitalize">Agriculture</option>
                                                                            <option value="Art" className="capitalize">Art</option>
                                                                            <option value="DIY" className="capitalize">DIY</option>
                                                                            <option value="Science" className="capitalize">Science</option>
                                                                            <option value="History" className="capitalize">History</option>
                                                                            <option value="Self-improvement" className="capitalize">Self-improvement</option>
                                                                            <option value="News and current affairs" className="News and current affairs">Japanese</option>
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <div className='grid grid-cols-1  gap-5 place-content-start'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Add Tags: </label>
                                                                        <div className='flex flex-row'>
                                                                            <input 
                                                                                type="text" 
                                                                                className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                value={input.blogTags}
                                                                                onChange={(e) => setInput({...input, blogTags: e.target.value})}
                                                                            />
                                                                            <div className='flex flex-row items-end'>
                                                                                <button onClick={addBlogsTags} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>          

                                                                <div className='flex flex-wrap items-center mt-2 mb-4 relative'>
                                                                    {
                                                                        blogsTags && blogsTags.length > 0 &&
                                                                            blogsTags.map((item, index) => {
                                                                                return (
                                                                                    <div key={index} className='flex items-center relative mt-2 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] border border-[#CAD5DF] px-4 py-1 mr-2 xs:text-sm text-sm font-semibold transition-all capitalize'>
                                                                                        <p>{item}</p>
                                                                                        <FontAwesomeIcon onClick={deleteBlogsTags} id={index} icon={faClose} className="ml-2 cursor-pointer" />
                                                                                    </div>
                                                                                )
                                                                            })
                                                                    }
                                                                </div>
                                                            </div>

                                                            <div className="lg:w-1/2 md:w-1/2 w-full md:pl-8">
                                                                <div className='grid sm:grid-cols-2 grid-cols-1  gap-5 place-content-start '>
                                                                    <h2 className='text-2xl font-bold text-gray-800 my-4'>Content</h2>        
                                                                </div>
                                                                
                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    <div className='flex flex-col'>
                                                                        <label className='font-semibold'> Element Content: </label>
                                                                        <div className='flex flex-row'>
                                                                            <select
                                                                                className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                default="normal_naragraph"
                                                                                value={contentSelected}
                                                                                onChange={(e) => setContentSelected(e.target.value)}
                                                                            >
                                                                                <option value="" className="capitalize" disabled={true}>Select Element</option>
                                                                                <option value="normal_naragraph" className="capitalize">Normal Paragraph</option>
                                                                                <option value="quoted_paragraph" className="capitalize">Quoted Paragraph</option>
                                                                                <option value="grid_image" className="capitalize">Grid Image</option>
                                                                                <option value="sub_heading" className="capitalize">Sub Heading</option>
                                                                                <option value="bullet_list" className="capitalize">Bullet List</option>
                                                                                <option value="number_list" className="capitalize">Number List</option>
                                                                                <option value="single_image" className="capitalize">Single Image</option>
                                                                            </select>
                                                                            <div className='flex flex-row items-end'>
                                                                                <button onClick={addContentElements} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>     

                                                                <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                    {
                                                                        blogsForm.content?.length > 0 &&
                                                                            blogsForm.content.map((item, index) => {
                                                                                return (
                                                                                    <>
                                                                                    {
                                                                                        item.element === 'normal_naragraph' ?
                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                            <div className='flex flex-col'>
                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        className='border-none font-semibold outline-none'
                                                                                                        onChange={(e) => headerValue(e, index)}
                                                                                                        value={ blogsForm.content[index].header }
                                                                                                    />
                                                                                                    {/* <label className='font-semibold'> Normal Paragraph: </label> */}
                                                                                                    <div>
                                                                                                        {
                                                                                                            blogsForm.content.length === 1 ?
                                                                                                                <button onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            :
                                                                                                            index === 0 && blogsForm.content.length !== 1 ?
                                                                                                            <>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            : index === (blogsForm.content.length - 1) ?
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            :
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className='flex flex-row'>
                                                                                                    <textarea
                                                                                                        name="paragraph"
                                                                                                        id="message"
                                                                                                        cols="30"
                                                                                                        rows="8"
                                                                                                        placeholder="Paragraph"
                                                                                                        className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                                        onChange={(e) => paragraphValue(e, index)}
                                                                                                        value={ blogsForm.content[index].paragraph }
                                                                                                    >
                                                                                                    </textarea>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        :
                                                                                        item.element === 'quoted_paragraph' ?
                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                            <div className='flex flex-col'>
                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        className='border-none font-semibold outline-none'
                                                                                                        onChange={(e) => headerValue(e, index)}
                                                                                                        value={ blogsForm.content[index].header }
                                                                                                    />
                                                                                                    <div>
                                                                                                        {
                                                                                                            blogsForm.content.length === 1 ?
                                                                                                                <button onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            :
                                                                                                            index === 0 && blogsForm.content.length !== 1 ?
                                                                                                            <>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            : index === (blogsForm.content.length - 1) ?
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            :
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className='flex flex-row'>
                                                                                                    <textarea
                                                                                                        name="quoted"
                                                                                                        id="message"
                                                                                                        cols="30"
                                                                                                        rows="4"
                                                                                                        placeholder="Quoted Paragraph"
                                                                                                        className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                                        onChange={(e) => paragraphValue(e, index)}
                                                                                                        value={ blogsForm.content[index].paragraph }
                                                                                                    >
                                                                                                    </textarea>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        :
                                                                                        item.element === 'sub_heading' ?
                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                            <div className='flex flex-col'>
                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        className='border-none font-semibold outline-none'
                                                                                                        onChange={(e) => headerValue(e, index)}
                                                                                                        value={ blogsForm.content[index].header }
                                                                                                    />
                                                                                                    <div>
                                                                                                        {
                                                                                                            blogsForm.content.length === 1 ?
                                                                                                                <button onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            :
                                                                                                            index === 0 && blogsForm.content.length !== 1 ?
                                                                                                            <>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            : index === (blogsForm.content.length - 1) ?
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            :
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className='flex flex-row'>
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                        onChange={(e) => headingValue(e, index)}
                                                                                                        value={ blogsForm.content[index].heading }
                                                                                                        placeholder='Sub Heading'
                                                                                                    />
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        :
                                                                                        item.element === 'grid_image' ?
                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                            <div className='flex flex-col'>
                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        className='border-none font-semibold outline-none'
                                                                                                        onChange={(e) => headerValue(e, index)}
                                                                                                        value={ blogsForm.content[index].header }
                                                                                                    />
                                                                                                    <div>
                                                                                                        {
                                                                                                            blogsForm.content.length === 1 ?
                                                                                                                <button onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            :
                                                                                                            index === 0 && blogsForm.content.length !== 1 ?
                                                                                                            <>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            : index === (blogsForm.content.length - 1) ?
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            :
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className='flex flex-row'>
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                        onChange={(e) => gridInputValue(e, index)}
                                                                                                        value={ blogsForm.content[index].input }
                                                                                                        placeholder='Image URL'
                                                                                                    />
                                                                                                    <div className='flex flex-row items-end'>
                                                                                                        <button onClick={() => addGridContentImage(index)} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className='flex flex-col'>
                                                                                                    <label className='font-semibold'> Image/s dimension: </label>
                                                                                                    <select
                                                                                                        className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                        default="normal_naragraph"
                                                                                                        value={blogsForm.content[index].type}
                                                                                                        onChange={(e) => typeValue(e, index)}
                                                                                                    >
                                                                                                        <option value="boxed" className="capitalize">Boxed</option>
                                                                                                        <option value="boxed_full" className="capitalize">Boxed Full</option>
                                                                                                        <option value="rectangular" className="capitalize">Rectangular</option>
                                                                                                        <option value="auto" className="capitalize">Auto</option>
                                                                                                    </select>
                                                                                                </div>
                                                                                                {
                                                                                                    blogsForm.content[index].grid_image.length > 0 &&
                                                                                                    <>
                                                                                                    <div className={`grid ${(blogsForm.content[index].type === 'boxed') && 'sm:grid-cols-2'} grid-cols-1 gap-5 place-content-start my-4`}>
                                                                                                        {
                                                                                                            blogsForm.content[index].grid_image.map((image, i) => {
                                                                                                                return (
                                                                                                                    <div key={i} className='relative'>
                                                                                                                        <img 
                                                                                                                            src={image}
                                                                                                                            className={`w-full ${blogsForm.content[index].type === 'boxed-full' && 'md:h-[500px] sm:h-[400px] h-[300px]'} ${(blogsForm.content[index].type === 'boxed' || blogsForm.content[index].type === 'rectangular') && 'md:h-60 h-48'} object-cover bg-top rounded-lg border border-[#cococo]`}
                                                                                                                            alt={`Grid Image #${i+1}`}
                                                                                                                        />
                                                                                                                        <button title="remove image" onClick={() => removeGridContentImage(index, i)} className='absolute top-2 right-4'><FontAwesomeIcon icon={faClose} className='cursor-pointer'/></button>
                                                                                                                    </div>
                                                                                                                )
                                                                                                            })
                                                                                                        }
                                                                                                    </div>
                                                                                                    </>
                                                                                                }
                                                                                            </div>
                                                                                        </div>
                                                                                        :
                                                                                        item.element === 'single_image' ?
                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                            <div className='flex flex-col'>
                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        className='border-none font-semibold outline-none'
                                                                                                        onChange={(e) => headerValue(e, index)}
                                                                                                        value={ blogsForm.content[index].header }
                                                                                                    />
                                                                                                    <div>
                                                                                                        {
                                                                                                            blogsForm.content.length === 1 ?
                                                                                                                <button onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            :
                                                                                                            index === 0 && blogsForm.content.length !== 1 ?
                                                                                                            <>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            : index === (blogsForm.content.length - 1) ?
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            :
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className='flex flex-row'>
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                        onChange={(e) => singleInputValue(e, index)}
                                                                                                        value={ blogsForm.content[index].image }
                                                                                                        placeholder='Image URL'
                                                                                                    />
                                                                                                </div>
                                                                                                <div className='flex flex-col'>
                                                                                                    <label className='font-semibold'> Image/s dimension: </label>
                                                                                                    <select
                                                                                                        className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                        default="normal_naragraph"
                                                                                                        value={blogsForm.content[index].type}
                                                                                                        onChange={(e) => typeValue(e, index)}
                                                                                                    >
                                                                                                        <option value="rectangular" className="capitalize">Rectangular</option>
                                                                                                        <option value="boxed_full" className="capitalize">Boxed Full</option>
                                                                                                        <option value="auto" className="capitalize">Auto</option>
                                                                                                    </select>
                                                                                                </div>
                                                                                                {
                                                                                                    blogsForm.content[index].image &&
                                                                                                        <div className='relative mt-2'>
                                                                                                            <img 
                                                                                                                src={blogsForm.content[index].image}
                                                                                                                className={`w-full ${blogsForm.content[index].type === 'boxed-full' && 'md:h-[500px] sm:h-[400px] h-[300px]'} ${(blogsForm.content[index].type === 'rectangular') && 'md:h-60 h-48'} object-cover bg-top rounded-lg border border-[#cococo]`}
                                                                                                                alt={`Grid Image`}
                                                                                                            />
                                                                                                        </div>
                                                                                                }
                                                                                            </div>
                                                                                        </div>
                                                                                        :
                                                                                        item.element === 'bullet_list' ?
                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                            <div className='flex flex-col'>
                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        className='border-none font-semibold outline-none'
                                                                                                        onChange={(e) => headerValue(e, index)}
                                                                                                        value={ blogsForm.content[index].header }
                                                                                                    />
                                                                                                    <div>
                                                                                                        {
                                                                                                            blogsForm.content.length === 1 ?
                                                                                                                <button onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            :
                                                                                                            index === 0 && blogsForm.content.length !== 1 ?
                                                                                                            <>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            : index === (blogsForm.content.length - 1) ?
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            :
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className='flex flex-row'>
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                        onChange={(e) => listInputValue(e, index)}
                                                                                                        value={ blogsForm.content[index].input }
                                                                                                        placeholder='Lists Items'
                                                                                                    />
                                                                                                    <div className='flex flex-row items-end'>
                                                                                                        <button onClick={() => addLists(index)} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                    </div>
                                                                                                </div>
                                                                                                {
                                                                                                    blogsForm.content[index].list.length > 0 &&
                                                                                                        blogsForm.content[index].list.map((list_item, i) => {
                                                                                                            return (
                                                                                                                <div key={i} className='flex items-center relative mt-2 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] border border-[#CAD5DF] px-4 py-1 mr-2 xs:text-sm text-sm font-semibold transition-all capitalize'>
                                                                                                                    <p className='pr-2'>{list_item}</p>
                                                                                                                    <FontAwesomeIcon onClick={() => removeLists(index, i)} id={i} icon={faClose} className="ml-2 cursor-pointer absolute top-2 right-2" />
                                                                                                                </div>
                                                                                                            )
                                                                                                        })
                                                                                                }
                                                                                            </div>
                                                                                        </div>
                                                                                        :
                                                                                        item.element === 'number_list' &&
                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                            <div className='flex flex-col'>
                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        className='border-none font-semibold outline-none'
                                                                                                        onChange={(e) => headerValue(e, index)}
                                                                                                        value={ blogsForm.content[index].header }
                                                                                                    />
                                                                                                    <div>
                                                                                                        {
                                                                                                            blogsForm.content.length === 1 ?
                                                                                                                <button onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            :
                                                                                                            index === 0 && blogsForm.content.length !== 1 ?
                                                                                                            <>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            : index === (blogsForm.content.length - 1) ?
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            :
                                                                                                            <>
                                                                                                                <button title="move upwards" onClick={() => moveElementUpwards(index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwards(index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                <button title="remove elements" onClick={() => removeElementsContent(index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                            </>
                                                                                                            
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className='flex flex-row'>
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                        onChange={(e) => listInputValue(e, index)}
                                                                                                        value={ blogsForm.content[index].input }
                                                                                                        placeholder='Lists Items'
                                                                                                    />
                                                                                                    <div className='flex flex-row items-end'>
                                                                                                        <button onClick={() => addLists(index)} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                    </div>
                                                                                                </div>
                                                                                                {
                                                                                                    blogsForm.content[index].list.length > 0 &&
                                                                                                        blogsForm.content[index].list.map((list_item, i) => {
                                                                                                            return (
                                                                                                                <div key={i} className='flex items-center relative mt-2 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] border border-[#CAD5DF] px-4 py-1 mr-2 xs:text-sm text-sm font-semibold transition-all capitalize'>
                                                                                                                    <p className='pr-2'>{list_item}</p>
                                                                                                                    <FontAwesomeIcon onClick={() => removeLists(index, i)} id={i} icon={faClose} className="ml-2 cursor-pointer absolute top-2 right-2" />
                                                                                                                </div>
                                                                                                            )
                                                                                                        })
                                                                                                }
                                                                                            </div>
                                                                                        </div>
                                                                                    }
                                                                                    </>
                                                                                )
                                                                            })
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {
                                                            blogEdit ?
                                                            <button onClick={handleBlogsEdit} className='float-right font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2 px-6'>
                                                                {
                                                                    !blogsSubmitted ?
                                                                    "Update Changes"
                                                                    :
                                                                    <div className='flex flex-row justify-center items-center'>
                                                                        Updating
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
                                                            <button onClick={handleBlogsSubmitted} className='float-right font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2 px-6'>
                                                                {
                                                                    !blogsSubmitted ?
                                                                    "Upload Blog"
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
                                                )
                                                :
                                                ((paramIndex || checkParams('blogs')) && showBlogRecord) && (
                                                    <div className='min-w-full xs:w-auto w-72'>
                                                        <div className='flex justify-end'>
                                                            <button title="return" onClick={() => setShowBlogRecord(!showBlogRecord)} className='bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-4 border border-[#CAD5DF] transition-colors duration-300 ease-in-out'>
                                                                Go back
                                                            </button>
                                                        </div>
                                                        <div className='justify-between mb-2 sm:hidden flex mt-4'>
                                                            <div className=''>
                                                                {
                                                                    blogDeleteId.length > 0 &&
                                                                        <FontAwesomeIcon title="delete" onClick={() => deleteMultipleBlog()} icon={faTrash} className="px-[12px] py-[10px] bg-red-600 hover:bg-red-700 text-gray-100 rounded-md cursor-pointer transition-all mr-2" />
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
                                                                    value={searchBlog}
                                                                    onChange={handleBlogSearch}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="overflow-x-auto sm:mt-4">
                                                            <div className='mb-2 sm:flex hidden justify-between'>
                                                                <div className=''>
                                                                    {
                                                                        blogDeleteId.length > 0 &&
                                                                            <div className='flex'>
                                                                                <button onClick={() => deleteMultipleBlog()} className='w-28 disabled:bg-gray-600 disabled:border-red-700 font-semibold border border-solid border-red-600 bg-red-600 hover:bg-red-700 hover:text-100-800 rounded-sm transition-all text-white p-2'>
                                                                                    Delete ({blogDeleteId.length})
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
                                                                        value={searchBlog}
                                                                        onChange={handleBlogSearch}
                                                                    />
                                                                </div>
                                                            </div>
                                            
                                                            <div class="xs:w-full overflow-hidden rounded-lg shadow-xs">
                                                                <div class="w-full overflow-x-auto">
                                                                    <table class="min-w-full overflow-x-auto whitespace-no-wrap">
                                                                        <thead>
                                                                            <tr
                                                                                class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border border-solid dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800"
                                                                            >
                                                                                <th class="pl-4 py-3"></th>
                                                                                <th class="px-4 py-3">Blog Title</th>
                                                                                <th class="px-4 py-3">Categories</th>
                                                                                <th class="px-4 py-3">Private</th>
                                                                                <th class="px-4 py-3">Strict</th>
                                                                                <th class="px-4 py-3">Tags</th>
                                                                                <th class="px-4 py-3">Action</th>
                                                                            </tr>
                                                                        </thead>
                                                                        {
                                                                            (blogData && blogData.length > 0) &&
                                                                                <tbody class="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                                                                                    {
                                                                                        blogData.slice(blogStartIndex, blogEndIndex).map((item, index) => {
                                                                                            return (
                                                                                                    <tr key={index} class="text-gray-700 dark:text-gray-400">
                                                                                                    <td className='pl-4 py-3'>
                                                                                                        <div className="text-sm leading-5 text-gray-900">
                                                                                                            <input 
                                                                                                                id={`blog-default-checkbox${10+index}`}
                                                                                                                type="checkbox" 
                                                                                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                                                                checked={blogDeleteId.includes(item._id)}
                                                                                                                onChange={() => addBlogDeleteId(index, item._id)}
                                                                                                            />
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td class="px-4 py-3">
                                                                                                        <div class="flex items-center text-sm">
                                                                                                            <div>
                                                                                                                <p class="font-semibold">{item.post_title}</p>
                                                                                                                {/* <p class="text-xs text-gray-600 dark:text-gray-400">
                                                                                                                {item.details.developer}
                                                                                                                </p> */}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td class="px-4 py-3 text-xs">
                                                                                                        {item.categories}
                                                                                                    </td>
                                                                                                    <VideoTableData 
                                                                                                        cond={item.privacy}
                                                                                                        api_call={changeBlogPrivacyById({
                                                                                                            id: item._id,
                                                                                                            privacy: !item.privacy
                                                                                                        })}
                                                                                                    />
                                                                                                    <VideoTableData 
                                                                                                        cond={item.strict}
                                                                                                        api_call={changeBlogStrictById({
                                                                                                            id: item._id,
                                                                                                            strict: !item.strict
                                                                                                        })}
                                                                                                    />
                                                                                                    <td class="px-4 py-3 text-xs">
                                                                                                        <div className="flex sm:flex-wrap items-center">
                                                                                                        {
                                                                                                            item.tags?.length > 0 &&
                                                                                                            item.tags.map((tag, i) => {
                                                                                                                return (
                                                                                                                    <span key={i} class="px-2 ml-1 py-1 font-semibold text-blue-700 bg-blue-100 rounded-full dark:bg-blue-700 dark:text-blue-100">
                                                                                                                        {tag}
                                                                                                                    </span>
                                                                                                                )
                                                                                                            })
                                                                                                        }
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td class="px-4 py-3">
                                                                                                        <div class="flex items-center space-x-4 text-sm">
                                                                                                            <button
                                                                                                                onClick={() => { openBlogDataModal(index, item._id) }} 
                                                                                                                class="flex items-center justify-between px-0 py-2 text-sm font-medium leading-5 text-blue-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                                                                                                                aria-label="Edit"
                                                                                                                >
                                                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                                                                                                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                                                                                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                                                                                                </svg>
                                                                                                            </button>
                                                                                                            <button
                                                                                                                onClick={() => { editBlogMode(index); setShowBlogRecord(false) }}
                                                                                                                class="flex items-center justify-between px-0 py-2 text-sm font-medium leading-5 text-blue-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                                                                                                                aria-label="Edit"
                                                                                                                >
                                                                                                                <svg
                                                                                                                class="w-5 h-5"
                                                                                                                aria-hidden="true"
                                                                                                                fill="currentColor"
                                                                                                                viewBox="0 0 20 20"
                                                                                                                >
                                                                                                                <path
                                                                                                                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                                                                                                                    ></path>
                                                                                                                </svg>
                                                                                                            </button>
                                                                                                            <button
                                                                                                                onClick={() => deleteBlog(index)} 
                                                                                                                class="flex items-center justify-between px-0 py-2 text-sm font-medium leading-5 text-blue-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                                                                                                                aria-label="Delete"
                                                                                                                >
                                                                                                                <svg
                                                                                                                class="w-5 h-5"
                                                                                                                aria-hidden="true"
                                                                                                                fill="currentColor"
                                                                                                                viewBox="0 0 20 20"
                                                                                                                >
                                                                                                                <path
                                                                                                                    fill-rule="evenodd"
                                                                                                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                                                                                    clip-rule="evenodd"
                                                                                                                    ></path>
                                                                                                                </svg>
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
                                                                    <span class="flex items-center col-span-3">
                                                                        Showing {(blogEndIndex >= blogData?.length) ? blogData?.length : blogEndIndex } of {blogData?.length}
                                                                    </span>
                                                                    <span class="col-span-2"></span>
                                                                    <span class="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
                                                                        <nav aria-label="Table navigation">
                                                                            <ul class="inline-flex items-center">
                                                                                <li>
                                                                                    <button
                                                                                        disabled={blogCurrentPage === 1} onClick={() => goToBlogPage(1)}
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
                                                                                        disabled={blogCurrentPage === 1} onClick={() => goToBlogPage(blogCurrentPage - 1)}
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
                                                                                        disabled={blogEndIndex >= blogData?.length} onClick={() => goToBlogPage(blogCurrentPage + 1)}
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
                                                                                        disabled={blogEndIndex >= blogData?.length} onClick={() => goToBlogPage(blogData?.length / itemsPerPage)} 
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
                                                            class="md:hidden flex justify-between items-center px-2 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800"
                                                            >
                                                            <span class="flex items-center col-span-3">
                                                                Showing {(blogEndIndex >= blogData?.length) ? blogData?.length : blogEndIndex } of {blogData?.length}
                                                            </span>
                                                            <span class="col-span-2"></span>
                                                            <span class="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
                                                                <nav aria-label="Table navigation">
                                                                    <ul class="inline-flex items-center">
                                                                        <li>
                                                                            <button
                                                                                disabled={blogCurrentPage === 1} onClick={() => goToBlogPage(1)}
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
                                                                                disabled={blogCurrentPage === 1} onClick={() => goToBlogPage(blogCurrentPage - 1)}
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
                                                                                disabled={blogEndIndex >= blogData?.length} onClick={() => goToBlogPage(blogCurrentPage + 1)}
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
                                                                                disabled={blogEndIndex >= blogData?.length} onClick={() => goToBlogPage(blogData?.length / itemsPerPage)} 
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
                                                )
                                            }
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

export default AdminUploads