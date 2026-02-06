import React, { useEffect, useState } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { getAuthor, newAuthor, updateAuthor, deleteAuthor, deleteMultipleAuthor, clearAlert } from '../../../actions/author';

import Table from '../../Custom/Table';
import ConfirmModal from '../../Custom/ConfirmModal';
import CustomForm from '../../Custom/CustomForm';

const Author = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()

    const author = useSelector((state) => state.author.data)
    const loading = useSelector((state) => state.author.isLoading)
    const alert = useSelector((state) => state.author.alert) 

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
        {
            label: "Author Name",
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
        }
    ];
    
    const editMode = (data) => {
        setInitialValues({ 
            id: data._id,
            name: data.name,
            description: data.description
        })
        setEdit(true)
        setUpdateForm(true)
        setFormOpen(true)
    }

    const handleSubmit = (formData) => {
        if(!submitted) {
            setSubmitted(true)

            if(edit) {
                const data = {
                    ...formData, 
                    type: 'video'
                }
                
                dispatch(updateAuthor({
                    data
                }))
            }
            else {
                formData.user = user._id;
                const data = {
                    ...formData, 
                    user: user._id,
                    type: 'video'
                }

                dispatch(newAuthor({
                    id: user._id,
                    data
                }))
            }
        }
    };

    useEffect(() => {
        if(selectedData?.length > 0) {
            dispatch(deleteMultipleAuthor({
                ids: selectedData, 
                type: 'video'
            }))
            setSelectedData(null)
        }
    }, [selectedData])

    useEffect(() => {
        if(confirm) {
            dispatch(deleteAuthor({
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
        setTableData(author)
    }, [author])

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
        dispatch(getAuthor({
            type: 'video'
        }))
    }, [])

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <ConfirmModal 
                theme={theme}
                title="Confirm Author Deletion"
                description={`Are you sure you want to delete this author?`}
                openModal={openModal}
                setOpenModal={setOpenModal}
                setConfirm={setConfirm}
            />

            {/* Header Section */}
            <div className='mb-8 flex xs:flex-row flex-col justify-between items-start gap-4'>
                <div>
                    <h1 className={`text-3xl font-semibold mb-2 ${theme === 'light' ? light.heading : dark.heading}`}>
                        Author Lists
                    </h1>
                    <p className={`text-sm ${theme === 'light' ? light.text : dark.text}`}>
                        Manage authors and content creators
                    </p>
                </div>
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
                <div className={`max-w-2xl rounded-xl p-6 md:p-8 border ${
                    theme === 'light'
                        ? 'bg-white/80 backdrop-blur-sm border-blue-200/60 shadow-md'
                        : 'bg-[#1C1C1C] border-[#2B2B2B] shadow-lg'
                }`}>
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
            </div>
            
            <div className={`${formOpen ? 'hidden' : 'block'}`}>
                <Table 
                    theme={theme}
                    title=""
                    header={[
                        { key: 'name', label: 'Author Name' },
                        { key: 'count', label: 'Total Used' },
                        { key: 'user', label: 'Created By', type: 'user' },
                        { 
                            key: 'createdAt', 
                            label: 'Date Created', 
                            render: (item) => {
                                if (!item) return 'N/A'
                                const date = new Date(item)
                                return (
                                    <div>
                                        <p>
                                            {date.toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric', 
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p>
                                            {date.toLocaleTimeString('en-US', { 
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                )
                            }
                        },
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

export default Author