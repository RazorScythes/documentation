import React, { useEffect, useState } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { getCategory, newCategory, updateCategory, updateCategorySettings, deleteCategory, deleteMultipleCategory, clearAlert } from '../../../actions/category';
import { put, del } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

import Table from '../../Custom/Table'
import ConfirmModal from '../../Custom/ConfirmModal'
import CustomForm from '../../Custom/CustomForm';
import CheckBoxRequest from '../../Custom/CheckBoxRequest';

const Categories = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()

    const category = useSelector((state) => state.category.data)
    const loading = useSelector((state) => state.category.isLoading)
    const alert = useSelector((state) => state.category.alert) 

    const [tableData, setTableData] = useState([])
    const [initialValues, setInitialValues] = useState({})
    const [selectedData, setSelectedData] = useState(null)
    const [openModal, setOpenModal] = useState(false)
    const [deleteId, setDeleteId] = useState('')
    const [confirm, setConfirm] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [edit, setEdit] = useState(false)
    const [updateForm, setUpdateForm] = useState(false)

    const fields = [
        { label: "Image", name: "image", type: "image" },
        {
            label: "Category Name",
            name: "name",
            type: "text",
            required: true,
            validate: (value) =>
                value?.length < 3 ? "Title must be at least 3 characters" : null,
        },
        {
            label: "Description",
            name: "description",
            type: "textarea"
        },
        {
            label: "Settings",
            type: "labelOnly",
        },
        {
            label: "Strict Mode",
            name: "strict",
            type: "checkbox",
        },
    ];
    
    const editMode = (data) => {
        const obj = { ...data, id: data._id, name: data.name };

        if(data?.image) {
            obj.image = {
                preview: data.image,
                save: data.image
            };
        }


        setInitialValues(obj)
        setEdit(true)
        setUpdateForm(true)
        setFormOpen(true)
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
                data.type = 'video';
                
                dispatch(updateCategory({
                    data
                }))
            }
            else {
                data.user = user._id;
                data.type = 'video';

                dispatch(newCategory({
                    id: user._id,
                    data
                }))
            }
        }
    };

    useEffect(() => {
        if(selectedData?.length > 0) {
            dispatch(deleteMultipleCategory({
                ids: selectedData, 
                type: 'video'
            }))
            setSelectedData(null)
        }
    }, [selectedData])

    useEffect(() => {
        if(confirm) {
            deleteVercelImage(deleteId);
            dispatch(deleteCategory({
                id: deleteId, 
                type: 'video'
            }))
        }
    }, [confirm])

    useEffect(() => {
        setSubmitted(false)
        setFormOpen(false)
        setEdit(false)
        setInitialValues({})
        setTableData(category)
    }, [category])

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
        dispatch(getCategory({
            type: 'video'
        }))
    }, [])

    return (
        <div>
            <ConfirmModal 
                theme={theme}
                title="Confirm Category Deletion"
                description={`Are you sure you want to delete this category?`}
                openModal={openModal}
                setOpenModal={setOpenModal}
                setConfirm={setConfirm}
            />

            <div className='mb-8 mt-4 flex xs:flex-row flex-col justify-start items-start gap-2'>
                <h1 className="text-xl font-medium mb-1">Category Lists</h1>
                <button
                    onClick={() => {
                        setFormOpen(!formOpen)
                        setInitialValues({})
                        setUpdateForm(true)
                    }}
                    className={`py-1.5 px-4 ${
                        theme === "light"
                            ? light.button_secondary
                            : dark.button_secondary
                    } rounded-full`}
                >
                    { formOpen ? 'Cancel' : 'Add New' } 
                </button>
            </div>

            <div className={`${formOpen ? 'block' : 'hidden'}`}>
                <CustomForm
                    theme={theme}
                    fields={fields}
                    onSubmit={handleSubmit}
                    initialValues={initialValues}
                    update={updateForm}
                    setUpdate={setUpdateForm}
                    disabled={submitted}
                />
            </div>
            
            <div className={`${formOpen ? 'hidden' : 'block'}`}>
                <Table 
                    theme={theme}
                    title=""
                    header={[
                        { key: 'name', label: 'Category Name', type: 'image_name'},
                        { key: 'count', label: 'Total Used' },
                        { key: 'user', label: 'Created By', type: 'user' },
                        { key: 'strict', label: 'Strict', render: (item, index) => 
                            <CheckBoxRequest 
                                theme={theme}
                                options={['Yes', 'No']}
                                item={item}
                                endpoint={updateCategorySettings({
                                    id: tableData[index]?._id,
                                    type: 'strict',
                                    value: !item,
                                })}
                            />
                        },
                        { key: 'createdAt', label: 'Timestamp' },
                        { key: 'actions', label: 'Action' },
                    ]}
                    actions={[
                        { label: 'Edit', color: `${theme === 'light' ? light.edit_button : dark.edit_button}`, onClick: (item) => editMode(item) },
                        { label: 'Delete', color: `${theme === 'light' ? light.delete_button : dark.delete_button}`, onClick: (item) => { setDeleteId(item._id); setOpenModal(true)} },
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

export default Categories