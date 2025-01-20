import React, { useEffect, useState } from 'react'
import { dark, light } from '../../../style';
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { deleteDocs, deleteMultipleDocs, getDocs, newDocs, updateDocs, updateDocsSettings, clearAlert } from '../../../actions/documentation';

import Table from '../../Custom/Table';
import ConfirmModal from '../../Custom/ConfirmModal';
import CustomForm from '../../Custom/CustomForm';
import CheckBoxRequest from '../../Custom/CheckBoxRequest';
import TokenModal from '../../Custom/TokenModal';
import LinkModal from '../../Custom/LinkModal';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Tags = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()
    const navigate  = useNavigate()

    const docs = useSelector((state) => state.docs.data)
    const loading = useSelector((state) => state.docs.isLoading)
    const alert = useSelector((state) => state.docs.alert) 

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
    const [linkOpenModal, setLinkOpenModal] = useState(false)
    const [openListModal, setOpenListModal] = useState({
        token: false
    })
    const [modalData, setModalData] = useState({
        token: {},
        base_url: {},
    })

    const fields = [
        {
            label: "Doc Name",
            name: "doc_name",
            type: "text",
            required: true,
            validate: (value) =>
                value?.length < 3 ? "Doc Name must be at least 3 characters" : null,
        },
        {
            label: "Description",
            name: "description",
            type: "textarea"
        },
        {
            label: "Base URL",
            name: "base_url",
            type: "text",
            required: true
        },
        {
            label: "Token URL",
            name: "token_url",
            type: "text",
            required: true
        },
        {
            label: "Token",
            name: "token",
            type: "text"
        },
        {
            label: "Settings",
            type: "labelOnly",
        },
        {
            label: "Private",
            name: "private",
            type: "checkbox",
        },
    ];
    
    const editMode = (data) => {
        setInitialValues({ 
            id: data._id,
            doc_name: data.doc_name,
            description: data.description,
            base_url: data.base_url,
            token_url: data.token_url,
            token: data.token,
            private: data.private
        })
        setEdit(true)
        setUpdateForm(true)
        setFormOpen(true)
    }

    const viewMode = (data) => {
        navigate(`/documentation/${data.doc_name}?edit=${import.meta.env.VITE_EDIT_KEY}`)
    }

    const handleSubmit = (formData) => {
        if(!submitted) {
            setSubmitted(true)

            if(edit) {
                const data = {...formData}
                dispatch(updateDocs({
                    data
                }))
            }
            else {
                const data = {...formData }
                dispatch(newDocs({
                    data
                }))
            }
        }
    };

    useEffect(() => {
        if(selectedData?.length > 0) {
            dispatch(deleteMultipleDocs({ ids: selectedData }))
            setSelectedData(null)
        }
    }, [selectedData])

    useEffect(() => {
        if(confirm) {
            dispatch(deleteDocs({ id: deleteId }))
        }
    }, [confirm])

    useEffect(() => {
        setSubmitted(false)
        setFormOpen(false)
        setEdit(false)
        setInitialValues({})
        setTableData(docs)
    }, [docs])

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
        dispatch(getDocs())
    }, [])

    return (
        <div>
            <ConfirmModal 
                theme={theme}
                title="Confirm Tag Deletion"
                description={`Are you sure you want to delete this doc?`}
                openModal={openModal}
                setOpenModal={setOpenModal}
                setConfirm={setConfirm}
            />

            <TokenModal
                theme={theme}
                openModal={openListModal}
                setOpenModal={setOpenListModal}
                data={modalData.token}
            />

            <LinkModal
                theme={theme}
                openModal={linkOpenModal}
                setOpenModal={setLinkOpenModal}
                data={modalData.base_url}
            />

            <div className='mb-8 mt-4 flex xs:flex-row flex-col justify-start items-start gap-2'>
                <h1 className="text-xl font-medium mb-1">Doc Lists</h1>
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
                        { key: 'doc_name', label: 'Doc Name', render: (item, index) => 
                            <Link to={`/documentation/${tableData[index].doc_name}`} className={`${theme === 'light' ? light.link : dark.link}`}>{tableData[index].doc_name}</Link>
                        },
                        { key: 'token_url', label: 'Token URL', render: (item, index) => 
                            <button
                                onClick={() => {
                                    setOpenListModal({
                                        ...openModal,
                                        token: true
                                    })
                                    setModalData({
                                        ...modalData,
                                        token: { ...tableData[index], label: 'Token URL' }
                                    })
                                }}
                                title="view"
                                className={`p-[0.35rem] text-base px-2 rounded-md ${theme === 'light' ? light.link : dark.link}`}
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </button>
                        },
                        { key: 'private', label: 'Private', render: (item, index) => 
                            <CheckBoxRequest 
                                theme={theme}
                                options={['Yes', 'No']}
                                item={item}
                                endpoint={updateDocsSettings({
                                    id: tableData[index]?._id,
                                    type: 'private',
                                    value: !item,
                                })}
                            />
                        },
                        { key: 'categoryCount', label: 'Categories' },
                        { key: 'base_url', label: 'Base URL', render: (item, index) => 
                            <button
                                onClick={() => {
                                    setLinkOpenModal(true)
                                    setModalData({
                                        ...modalData,
                                        base_url: { ...tableData[index], label: 'Base URL', link: `${tableData[index].base_url}` }
                                    })
                                }}
                                title="view"
                                className={`p-[0.35rem] text-base px-2 rounded-md ${theme === 'light' ? light.link : dark.link}`}
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </button> 
                        },
                        { key: 'actions', label: 'Action' },
                    ]}
                    actions={[
                        { label: 'View', color: `${theme === 'light' ? light.view_button : dark.view_button}`, onClick: (item) => viewMode(item) },
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

export default Tags