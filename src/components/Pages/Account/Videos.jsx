import React, { useEffect, useState } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { getGroups } from '../../../actions/groups';
import { getUserVideos, newVideo, updateVideo, deleteVideo, deleteMultipleVideos, updateVideoSettings, clearAlert } from '../../../actions/videos';
import { getTags } from '../../../actions/tags';
import { getCategory } from '../../../actions/category';
import { getAuthor } from '../../../actions/author';
import { convertDriveImageLink, millisToTimeString } from '../../Tools'

import Table from '../../Custom/Table'
import ConfirmModal from '../../Custom/ConfirmModal'
import CustomForm from '../../Custom/CustomForm';
import VideoModalRequest from '../../Custom/VideoModalRequest';
import VideoModal from '../../VideoModal';
import CheckBoxRequest from '../../Custom/CheckBoxRequest';
import ListsModal from '../../Custom/ListsModal';

import { put, del } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faDownload, faFileImport, faHamburger, faUpload } from '@fortawesome/free-solid-svg-icons';

const generateRandomID = (length = 20) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
}

const Videos = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()

    const groups = useSelector((state) => state.groups.data)
    const videos = useSelector((state) => state.videos.data)
    const loading = useSelector((state) => state.videos.isLoading)
    const alert = useSelector((state) => state.videos.alert) 
    const tags = useSelector((state) => state.tags.data)
    const category = useSelector((state) => state.category.data)
    const author = useSelector((state) => state.author.data)

    const [tableData, setTableData] = useState([])
    const [selectedData, setSelectedData] = useState(null)
    const [openModal, setOpenModal] = useState(false)
    const [openListModal, setOpenListModal] = useState(false)
    const [listPreview, setListPreview] = useState({
        label: '',
        lists: []
    })
    const [deleteId, setDeleteId] = useState('')
    const [confirm, setConfirm] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [openVideoModal, setOpenVideoModal] = useState(false)
    const [updateFormValue, setUpdateFormValue] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [videoRecord, setVideoRecord] = useState(false)
    const [recordOpenModal, setRecordOpenModal] = useState(false)
    const [updateForm, setUpdateForm] = useState(false)
    const [initialValues, setInitialValues] = useState({})
    const [edit, setEdit] = useState(false)
    const [list, setList] = useState({
        groups: [],
        owner: [],
        category: [],
        tags: []
    })

    useEffect(() => {
        setSubmitted(false)
        setFormOpen(false)
        setEdit(false)
        setInitialValues({})
        setTableData(videos)
    }, [videos])

    useEffect(() => {
        setList(prevList => ({
            ...prevList,
            ...(tags.length > 0 && { tags }),
            ...(category.length > 0 && { category }),
            ...(author.length > 0 && { owner: author }),
        }));
    }, [tags, category, author]);

    useEffect(() => {
        if(Object.keys(alert).length > 0) {
            dispatch(clearAlert())
            setNotification(alert)
            setSubmitted(false)
            setEdit(false)
			setConfirm(false)
        }
    }, [alert])

    useEffect(() => {
        dispatch(getGroups({ type: 'video' }))
        dispatch(getUserVideos())
        dispatch(getTags({ type: 'video', options: true }))
        dispatch(getCategory({ type: 'video', options: true }))
        dispatch(getAuthor({ type: 'video', options: true }))
    }, [])

    useEffect(() => {
        if(groups.length > 0) {
            const arr = groups.map((group) => {
                return {
                    id: group._id,
                    name: group.group_name
                }
            })
            setList({...list, groups: arr})
        }
    }, [groups])

    const fields = [
        { label: "Thumbnail", name: "thumbnail", type: "image" },
        { label: "Video Title", name: "title", type: "text", required: true,
            validate: (value) =>
                value?.length < 6 ? "Title must be at least 6 characters" : null,
        },
        { label: "Video Url", name: "link", type: "text", required: true },
        { label: "Description", name: "description", type: "textarea" },
        { label: "Video Settings", type: "labelOnly" },
        { label: "Strict Mode", name: "strict", type: "checkbox" },
        { label: "Private", name: "privacy", type: "checkbox" },
        { label: "Downloadable", name: "downloadable", type: "checkbox" },
        { label: "Groups", name: "groups", type: "select", options: list.groups,required: true },
        { label: "Artist/Owner", name: "owner", type: "multi_select", options: list.owner },
        { label: "Category", name: "category", type: "multi_select", options: list.category },
        { label: "Tags", name: "tags", type: "multi_select", options: list.tags }
    ];
    
    const importedData = (formData) => {
        if(formData) {
            setInitialValues({...initialValues, ...formData})
            setUpdateFormValue(true)
        }
    }   

    const fileName = (originalFileName) => {
        const uuid = uuidv4();
        const dotIndex = originalFileName.lastIndexOf('.');
        const extension = originalFileName.substring(dotIndex);
        return `${uuid}${extension}`;
    };

    const uploadVercelImage = async (obj) => {
        const newObj = { ...obj };
    
        for (const key in newObj) {
            const value = newObj[key];

            if(value instanceof File) {
                if (value.type.startsWith("image/")) {
                    const blob = await put(fileName(value.name), value, {
                        access: 'public',
                        token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
                    });

                    newObj[key] = blob.url;
                }
            }
        }

        return newObj;
    };

    const deleteVercelImage = async (obj) => {
        const newObj = { ...obj };
    
        for (const key in newObj) {
            const value = newObj[key];

            if (typeof value === 'string' && !Array.isArray(value)) {
                if(value.includes('vercel-storage')) {
                    await del(value, { token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN });
                }
            }
        }

        return newObj;
    }

    const editMode = (data) => {
        const obj = { ...data };

        if(data?.thumbnail) {
            obj.thumbnail = {
                preview: data.thumbnail,
                save: data.thumbnail
            };
        }

        obj.groups = obj.groups?._id;
        obj.owner = { tags: obj.owner };
        obj.category = { tags: obj.category };
        obj.tags = { tags: obj.tags }; 

        setInitialValues(obj);
        setEdit(true)
        setUpdateFormValue(true)
        setFormOpen(true)
    }

    const handleSubmit = async (formData) => {
        if(!submitted) {
            setSubmitted(true)

            const data = await uploadVercelImage(formData);

            if(data?.removed?.length) {
                data.removed.map(async (image) => {
                    if(image.includes('vercel-storage')) {
                        await del(image, { token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN });
                    }
                })

                delete data.removed;
            }

            if(edit) {
                if(!data.access_key) {
                    data.access_key = generateRandomID();
                }

                dispatch(updateVideo({
                    data
                }))
            }
            else {
                data.access_key = generateRandomID();

                dispatch(newVideo({
                    id: user._id,
                    data
                }))
            }
        }
    };

    useEffect(() => {
        if(selectedData?.length > 0) {
            const data = selectedData.map((id) => {
                return tableData.find(item => item._id === id)
            })

            data.forEach((item) => {
                deleteVercelImage(item);
            })

            dispatch(deleteMultipleVideos({
                ids: selectedData, 
            }))
            setSelectedData(null)
        }
    }, [selectedData])

    useEffect(() => {
        if(confirm) {
            deleteVercelImage(deleteId);
            dispatch(deleteVideo({
                id: deleteId._id, 
            }))
        }
    }, [confirm])

    return (
        <div>   
            <ConfirmModal 
                theme={theme}
                title="Confirm Video Deletion"
                description={`Are you sure you want to delete this video?`}
                openModal={openModal}
                setOpenModal={setOpenModal}
                setConfirm={setConfirm}
            />

            <ListsModal
                theme={theme}
                title={listPreview.label ?? 'List Items'}
                openModal={openListModal}
                setOpenModal={setOpenListModal}
                lists={listPreview.lists}
            />

            <VideoModalRequest
                theme={theme}
                title="Import Data"
                description={`Are you sure you want to delete this video?`}
                openModal={openVideoModal}
                setOpenModal={setOpenVideoModal}
                importedData={importedData}
            />  

            <VideoModal
                openModal={recordOpenModal}
                setOpenModal={setRecordOpenModal}
                link={videoRecord}
            />

            <div className='mb-8 mt-4 flex items-center gap-2'>
                <h1 className="text-xl font-medium mb-1">Your Videos</h1>
                <button
                    onClick={() => {
                        setFormOpen(!formOpen)
                        setInitialValues({})
                        setUpdateFormValue(true)
                        setEdit(false)
                    }}
                    className={`py-1.5 px-4 ${
                        theme === "light"
                            ? light.button_secondary
                            : dark.button_secondary
                    } rounded-full`}
                >
                    { formOpen ? 'Cancel' : 'Upload' } 
                </button>
                { (formOpen && !edit) && <button onClick={() => setOpenVideoModal(!openVideoModal)} className={`py-1.5 px-4 rounded-full ${theme === 'light' ? light.button_secondary : dark.button_secondary}`}>Import</button> }
            </div>

            <div className={`${formOpen ? 'block' : 'hidden'}`}>
                <CustomForm
                    theme={theme}
                    fields={fields}
                    onSubmit={handleSubmit}
                    setUpdate={setUpdateFormValue}
                    update={updateFormValue}
                    initialValues={initialValues}
                    disabled={submitted}
                />
            </div>
            
            <div className={`${formOpen ? 'hidden' : 'block'}`}>
                <Table 
                    theme={theme}
                    title=""
                    header={[
                        { key: 'title', label: 'Video', render: (item, index) => 
                            <div class="flex items-center text-sm">
                                <div 
                                    onClick={() => { setVideoRecord(tableData[index]?.link); setRecordOpenModal(true) }} 
                                    className='cursor-pointer bg-black rounded-lg overflow-hidden md:w-32 md:min-w-32 xs:w-32 xs:min-w-32 w-32 min-w-32 h-20 mr-2 relative border border-gray-900'>
                                    <img 
                                        src={tableData[index]?.thumbnail} alt="Video Thumbnail" 
                                        className='mx-auto object-cover h-20 text-xs'
                                    />
                                    <div className='absolute bottom-1 right-1 rounded-sm bg-blue-600 border border-solid border-blue-600 text-white'>
                                        <p className='p-1 px-1 py-0 text-xs'>{tableData[index]?.duration ? millisToTimeString(tableData[index]?.duration) : 'embed'}</p>
                                    </div>
                                </div>
                                <div className='md:max-w-[150px] max-w-[125px]'>
                                    <p class="font-medium truncate">{item}</p>
                                    <p class={`text-xs ${theme === 'light' ? light.text : dark.text} truncate`}>
                                        {tableData[index]?.owner?.map((item, i) => {
                                            return (
                                                <span key={i}>{item.name}{(i + 1) !== tableData[index]?.owner.length &&  ','} </span>
                                            )
                                        })}
                                    </p>
                                </div>
                            </div>
                        },
                        { key: 'category', label: 'Category', render: (item) => <>{item.length > 0 ? item[0].name : 'N/A'}</>},
                        { key: 'privacy', label: 'Visibility', render: (item, index) => 
                            <CheckBoxRequest 
                                theme={theme}
                                options={['Private', 'Public']}
                                item={item}
                                endpoint={updateVideoSettings({
                                    id: tableData[index]?._id,
                                    type: 'privacy',
                                    value: !item,
                                })}
                            />
                        },
                        { key: 'strict', label: 'Strict', render: (item, index) => 
                            <CheckBoxRequest 
                                theme={theme}
                                options={['Yes', 'No']}
                                item={item}
                                endpoint={updateVideoSettings({
                                    id: tableData[index]?._id,
                                    type: 'strict',
                                    value: !item,
                                })}
                            />
                        },
                        { key: 'downloadable', label: 'Downloadable', render: (item, index) => 
                            <CheckBoxRequest 
                                theme={theme}
                                options={['Yes', 'No']}
                                item={item}
                                endpoint={updateVideoSettings({
                                    id: tableData[index]?._id,
                                    type: 'downloadable',
                                    value: !item,
                                })}
                            />
                        },
                        { key: 'tags', label: 'Tags', render: (item) => <div onClick={() => { setOpenListModal(true); setListPreview({ label: 'Tags', lists: item })} } className={`${theme === 'light' ? light.link : dark.link}`}>{item.length}</div>},
                        { key: 'groups', label: 'Groups', render: (item) => <>{item?.group_name}</>},
                        { key: 'actions', label: 'Action' },
                    ]}
                    actions={[
                        { label: 'Edit', color: `${theme === 'light' ? light.edit_button : dark.edit_button}`, onClick: (item) => editMode(item) },
                        { label: 'Delete', color: `${theme === 'light' ? light.delete_button : dark.delete_button}`, onClick: (item) => { setDeleteId(item); setOpenModal(true); setConfirm(false); } },
                    ]}
                    limit={10}
                    multipleSelect={true}
                    data={tableData}
                    setSelectedData={setSelectedData}
                    loading={loading}
                />
            </div>
        </div>
    )
}

export default Videos