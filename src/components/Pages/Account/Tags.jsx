import React, { useEffect, useState } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { getTags, newTags, updateTags, deleteTags, deleteMultipleTags, clearAlert } from '../../../actions/tags';

import Table from '../../Custom/Table'
import ConfirmModal from '../../Custom/ConfirmModal'
import CustomForm from '../../Custom/CustomForm';

const Tags = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()

    const tags = useSelector((state) => state.tags.data)
    const loading = useSelector((state) => state.tags.isLoading)
    const alert = useSelector((state) => state.tags.alert) 

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
            label: "Tag Name",
            name: "name",
            type: "text",
            required: true,
            validate: (value) =>
                value?.length < 3 ? "Title must be at least 3 characters" : null,
        }
    ];
    
    const editMode = (data) => {
        setInitialValues({ 
            id: data._id,
            name: data.name,
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
                
                dispatch(updateTags({
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

                dispatch(newTags({
                    id: user._id,
                    data
                }))
            }
        }
    };

    useEffect(() => {
        if(selectedData?.length > 0) {
            dispatch(deleteMultipleTags({
                ids: selectedData, 
                type: 'video'
            }))
            setSelectedData(null)
        }
    }, [selectedData])

    useEffect(() => {
        if(confirm) {
            dispatch(deleteTags({
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
        setTableData(tags)
    }, [tags])

    useEffect(() => {
        if(Object.keys(alert).length > 0) {
            dispatch(clearAlert())
            setNotification(alert)
            setSubmitted(false)
        }
    }, [alert])

    useEffect(() => {
        dispatch(getTags({
            type: 'video'
        }))
    }, [])

    return (
        <div>
            <ConfirmModal 
                theme={theme}
                title="Confirm Tag Deletion"
                description={`Are you sure you want to delete this tag?`}
                openModal={openModal}
                setOpenModal={setOpenModal}
                setConfirm={setConfirm}
            />

            <div className='mb-8 mt-4 flex xs:flex-row flex-col justify-start items-start gap-2'>
                <h1 className="text-xl font-medium mb-1">Your Group Lists</h1>
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
                        { key: 'name', label: 'Tag Name' },
                        { key: 'count', label: 'Total Used' },
                        { key: 'user', label: 'Created By', type: 'user' },
                        { key: 'createdAt', label: 'Timestamp' },
                        { key: 'actions', label: 'Action' },
                    ]}
                    actions={[
                        // { label: 'Edit', color: `${theme === 'light' ? light.edit_button : dark.edit_button}`, onClick: (item) => editMode(item) },
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

export default Tags