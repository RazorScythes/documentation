import React, { useEffect, useState } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { getGroups, newGroups, updateGroups, deleteGroups, deleteMultipleGroups, clearAlert } from '../../../actions/groups';

import Table from '../../Custom/Table'
import ConfirmModal from '../../Custom/ConfirmModal'
import CustomForm from '../../Custom/CustomForm';

const Groups = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()

    const groups = useSelector((state) => state.groups.data)
    const loading = useSelector((state) => state.groups.isLoading)
    const alert = useSelector((state) => state.groups.alert) 

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
            label: "Group Name",
            name: "group_name",
            type: "text",
            required: true,
            validate: (value) =>
                value?.length < 3 ? "Title must be at least 6 characters" : null,
        },
        {
            label: "Description",
            name: "description",
            type: "textarea",
            required: true,
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
        {
            label: "Private",
            name: "privacy",
            type: "checkbox",
        }
    ];
    
    const editMode = (data) => {
        setInitialValues({ 
            id: data._id,
            group_name: data.group_name,
            description: data.description,
            strict: data.strict,
            privacy: data.privacy
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
                
                dispatch(updateGroups({
                    data
                }))
            }
            else {
                const data = {
                    ...formData, 
                    user: user._id,
                    type: 'video'
                }

                dispatch(newGroups({
                    id: user._id,
                    data
                }))
            }
        }
    };

    useEffect(() => {
        if(selectedData?.length > 0) {
            dispatch(deleteMultipleGroups({
                ids: selectedData, 
                type: 'video'
            }))
            setSelectedData(null)
        }
    }, [selectedData])

    useEffect(() => {
        if(confirm) {
            dispatch(deleteGroups({
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
        setTableData(groups)
    }, [groups])

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
        dispatch(getGroups({
            type: 'video'
        }))
    }, [])

    return (
        <div>
            <ConfirmModal 
                theme={theme}
                title="Confirm Video Deletion"
                description={`Are you sure you want to delete this group?`}
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
                        { key: 'group_name', label: 'Group Name' },
                        { key: 'description', label: 'Description' },
                        { key: 'items', label: 'Items' },
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

export default Groups