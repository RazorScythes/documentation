import React, { useEffect, useState, useMemo } from 'react'
import { main, dark, light } from '../../style';
import styles from "../../style";
import { useNavigate, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCode, faExternalLinkAlt, faSearch, faSpinner, faFileAlt, faGlobe, faLock, faLockOpen, faPlus, faTable, faTh, faEye, faTimes, faChartLine, faServer, faShieldAlt, faClock, faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux'
import { getDocs, clearAlert, deleteDocs, deleteMultipleDocs, newDocs, updateDocs, updateDocsSettings } from '../../actions/documentation';
import Notification from '../Custom/Notification';
import Table from '../Custom/Table';
import ConfirmModal from '../Custom/ConfirmModal';
import CustomForm from '../Custom/CustomForm';
import CheckBoxRequest from '../Custom/CheckBoxRequest';
import TokenModal from '../Custom/TokenModal';
import LinkModal from '../Custom/LinkModal';

const SiteDocs = ({ user, theme }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const docs = useSelector((state) => state.docs.data)
    const loading = useSelector((state) => state.docs.isLoading)
    const alert = useSelector((state) => state.docs.alert)

    const [notification, setNotification] = useState({})
    const [show, setShow] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
    const [formOpen, setFormOpen] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [edit, setEdit] = useState(false)
    const [updateForm, setUpdateForm] = useState(false)
    const [initialValues, setInitialValues] = useState({})
    const [selectedData, setSelectedData] = useState(null)
    const [openModal, setOpenModal] = useState(false)
    const [deleteId, setDeleteId] = useState('')
    const [confirm, setConfirm] = useState(false)
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

    useEffect(() => {
        dispatch(getDocs())
    }, [dispatch])

    useEffect(() => {
        if(Object.keys(alert).length > 0) { 
            dispatch(clearAlert())
            setNotification(alert)
            setShow(true) 
        }
    }, [alert, dispatch])

    useEffect(() => {
        if(!show) { setNotification({}) }
    }, [show])


    useEffect(() => {
        if(selectedData?.length > 0) {
            dispatch(deleteMultipleDocs({ ids: selectedData }))
            setSelectedData(null)
        }
    }, [selectedData, dispatch])

    useEffect(() => {
        if(confirm) {
            dispatch(deleteDocs({ id: deleteId }))
            setConfirm(false)
        }
    }, [confirm, deleteId, dispatch])

    useEffect(() => {
        setSubmitted(false)
        setFormOpen(false)
        setEdit(false)
        setInitialValues({})
    }, [docs])

    const filteredDocs = useMemo(() => {
        if (!Array.isArray(docs)) return []
        if (!searchQuery.trim()) return docs
        return docs.filter(doc => 
            doc.doc_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [docs, searchQuery])

    const handleDocClick = (docName) => {
        navigate(`/documentation/${docName}`)
    }


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

    const handleViewDoc = (data) => {
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

    return (
        <div className={`relative min-h-screen ${main.font} ${theme === 'light' ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx} w-full`}>
                    <div className="relative py-8 md:py-12 px-4 md:px-0">
                        <Notification
                            theme={theme}
                            data={notification}
                            show={show}
                            setShow={setShow}
                        />

                        <ConfirmModal 
                            theme={theme}
                            title="Confirm Documentation Deletion"
                            description={`Are you sure you want to delete this documentation?`}
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

                        {/* Header Section */}
                        <div className="mb-8 md:mb-12">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-gradient-to-br from-blue-500 to-sky-500' : 'bg-gradient-to-br from-blue-600 to-sky-600'} shadow-lg`}>
                                            <FontAwesomeIcon icon={faCode} className="text-white text-2xl" />
                                        </div>
                                        <div>
                                            <h1 className={`text-3xl md:text-4xl font-bold mb-1 ${theme === 'light' ? light.heading : dark.heading}`}>
                                                API Documentation
                                            </h1>
                                            <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                                                Manage and explore your API endpoints
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`text-base md:text-lg ${theme === 'light' ? light.text : dark.text} ml-14`}>
                                        Explore and interact with our comprehensive API documentation
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setFormOpen(!formOpen)
                                            setInitialValues({})
                                            setUpdateForm(true)
                                            setEdit(false)
                                        }}
                                        className={`flex items-center gap-2 py-3 px-6 ${theme === "light" ? light.button_secondary : dark.button_secondary} rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105`}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        <span>{formOpen ? 'Cancel' : 'New Documentation'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Statistics Cards */}
                            {!loading && !formOpen && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <div className={`flex flex-col h-full ${theme === 'light' ? light.background : dark.background} rounded-xl border border-solid ${theme === 'light' ? light.border : dark.border} p-5 shadow-sm hover:shadow-md transition-all`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`p-2.5 rounded-lg ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                                                <FontAwesomeIcon icon={faFileAlt} className={`text-lg ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                                            </div>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${theme === 'light' ? 'bg-blue-50 text-blue-700' : 'bg-blue-900/20 text-blue-400'}`}>
                                                Total
                                            </span>
                                        </div>
                                        <p className={`text-2xl font-bold ${theme === 'light' ? light.heading : dark.heading} mb-1`}>
                                            {Array.isArray(docs) ? docs.length : 0}
                                        </p>
                                        <p className={`text-xs ${theme === 'light' ? light.text : dark.text} opacity-70 mt-auto`}>
                                            Documentation Sets
                                        </p>
                                    </div>

                                    <div className={`flex flex-col h-full ${theme === 'light' ? light.background : dark.background} rounded-xl border border-solid ${theme === 'light' ? light.border : dark.border} p-5 shadow-sm hover:shadow-md transition-all`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`p-2.5 rounded-lg ${theme === 'light' ? 'bg-emerald-100' : 'bg-emerald-900/30'}`}>
                                                <FontAwesomeIcon icon={faLockOpen} className={`text-lg ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
                                            </div>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${theme === 'light' ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-900/20 text-emerald-400'}`}>
                                                Public
                                            </span>
                                        </div>
                                        <p className={`text-2xl font-bold ${theme === 'light' ? light.heading : dark.heading} mb-1`}>
                                            {Array.isArray(docs) ? docs.filter(d => !d.private).length : 0}
                                        </p>
                                        <p className={`text-xs ${theme === 'light' ? light.text : dark.text} opacity-70 mt-auto`}>
                                            Public APIs
                                        </p>
                                    </div>

                                    <div className={`flex flex-col h-full ${theme === 'light' ? light.background : dark.background} rounded-xl border border-solid ${theme === 'light' ? light.border : dark.border} p-5 shadow-sm hover:shadow-md transition-all`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`p-2.5 rounded-lg ${theme === 'light' ? 'bg-amber-100' : 'bg-amber-900/30'}`}>
                                                <FontAwesomeIcon icon={faLock} className={`text-lg ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                                            </div>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${theme === 'light' ? 'bg-amber-50 text-amber-700' : 'bg-amber-900/20 text-amber-400'}`}>
                                                Private
                                            </span>
                                        </div>
                                        <p className={`text-2xl font-bold ${theme === 'light' ? light.heading : dark.heading} mb-1`}>
                                            {Array.isArray(docs) ? docs.filter(d => d.private).length : 0}
                                        </p>
                                        <p className={`text-xs ${theme === 'light' ? light.text : dark.text} opacity-70 mt-auto`}>
                                            Private APIs
                                        </p>
                                    </div>

                                    <div className={`flex flex-col h-full ${theme === 'light' ? light.background : dark.background} rounded-xl border border-solid ${theme === 'light' ? light.border : dark.border} p-5 shadow-sm hover:shadow-md transition-all`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`p-2.5 rounded-lg ${theme === 'light' ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                                                <FontAwesomeIcon icon={faBook} className={`text-lg ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />
                                            </div>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${theme === 'light' ? 'bg-purple-50 text-purple-700' : 'bg-purple-900/20 text-purple-400'}`}>
                                                Categories
                                            </span>
                                        </div>
                                        <p className={`text-2xl font-bold ${theme === 'light' ? light.heading : dark.heading} mb-1`}>
                                            {Array.isArray(docs) ? docs.reduce((sum, doc) => sum + (doc.categoryCount || 0), 0) : 0}
                                        </p>
                                        <p className={`text-xs ${theme === 'light' ? light.text : dark.text} opacity-70 mt-auto`}>
                                            Total Categories
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Search and View Toggle */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="relative max-w-2xl w-full sm:flex-1">
                                    <div className={`relative flex items-center ${theme === 'light' ? light.input : dark.input} rounded-xl px-5 py-3.5 shadow-md hover:shadow-lg transition-all ${searchQuery ? 'ring-2 ring-blue-400/50' : ''}`}>
                                        <FontAwesomeIcon 
                                            icon={faSearch} 
                                            className={`mr-3 ${theme === 'light' ? light.input_icon : dark.input_icon} ${searchQuery ? 'text-blue-600' : ''}`}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search by name or description..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={`flex-1 bg-transparent outline-none ${theme === 'light' ? light.color : dark.color} placeholder:${theme === 'light' ? 'text-slate-400' : 'text-gray-500'} font-medium`}
                                        />
                                        {searchQuery && (
                                            <div className="flex items-center gap-2 ml-2">
                                                <span className={`text-xs px-2 py-1 rounded-md ${theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/30 text-blue-400'} font-medium`}>
                                                    {filteredDocs.length} {filteredDocs.length === 1 ? 'result' : 'results'}
                                                </span>
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className={`p-1.5 rounded-lg ${theme === 'light' ? 'hover:bg-blue-100' : 'hover:bg-gray-700'} transition-colors`}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} className={`text-sm ${theme === 'light' ? light.text : dark.text}`} />
                                                </button>
                                                    </div>
                                        )}
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 ${theme === 'light' ? light.semibackground : dark.semibackground} rounded-lg p-1 border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                    <button
                                        onClick={() => setViewMode('cards')}
                                        className={`p-2 rounded-md transition-all ${viewMode === 'cards' ? (theme === 'light' ? light.active_list_button : dark.active_list_button) : ''}`}
                                    >
                                        <FontAwesomeIcon icon={faTh} className={viewMode === 'cards' ? 'text-white' : (theme === 'light' ? light.text : dark.text)} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`p-2 rounded-md transition-all ${viewMode === 'table' ? (theme === 'light' ? light.active_list_button : dark.active_list_button) : ''}`}
                                    >
                                        <FontAwesomeIcon icon={faTable} className={viewMode === 'table' ? 'text-white' : (theme === 'light' ? light.text : dark.text)} />
                                    </button>
                                </div>
                            </div>
                                                </div>

                        {/* Form Section */}
                        {formOpen && (
                            <div className={`mb-6 ${theme === 'light' ? light.background : dark.background} rounded-2xl border border-solid ${theme === 'light' ? light.border : dark.border} p-6 max-w-3xl shadow-xl`}>
                                <div className={`flex items-center justify-between mb-6 pb-4 border-b border-solid ${theme === 'light' ? light.semiborder : dark.semiborder}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${theme === 'light' ? 'bg-gradient-to-br from-blue-100 to-sky-100' : 'bg-gradient-to-br from-blue-900/30 to-sky-900/30'}`}>
                                            <FontAwesomeIcon icon={edit ? faCode : faPlus} className={`text-lg ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                                        </div>
                                        <div>
                                            <h2 className={`text-xl font-bold ${theme === 'light' ? light.heading : dark.heading}`}>
                                                {edit ? 'Edit Documentation' : 'Create New Documentation'}
                                            </h2>
                                            <p className={`text-xs ${theme === 'light' ? light.text : dark.text} opacity-70 mt-0.5`}>
                                                {edit ? 'Update your documentation details' : 'Add a new API documentation set'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setFormOpen(false)
                                            setInitialValues({})
                                            setEdit(false)
                                        }}
                                        className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-blue-100' : 'hover:bg-gray-700'} transition-all`}
                                    >
                                        <FontAwesomeIcon icon={faTimes} className={theme === 'light' ? light.text : dark.text} />
                                    </button>
                                </div>
                                <CustomForm
                                    theme={theme}
                                    fields={fields}
                                    onSubmit={handleSubmit}
                                    initialValues={initialValues}
                                    update={updateForm}
                                    setUpdate={setUpdateForm}
                                    disabled={submitted}
                                    submitText={edit ? 'Update Documentation' : 'Create Documentation'}
                                />
                            </div>
                        )}

                        {/* Main Content Area */}
                        {!formOpen && (
                            <div className="w-full">
                                {/* Main Content */}
                                <div className="w-full">
                                    {/* Loading State */}
                                    {loading && (
                                        <div className={`flex flex-col items-center justify-center py-20 ${theme === 'light' ? light.background : dark.background} rounded-2xl border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                            <div className={`relative p-6 rounded-full ${theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20'} mb-6`}>
                                                <FontAwesomeIcon 
                                                    icon={faSpinner} 
                                                    className={`text-5xl animate-spin ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}
                                                />
                                            </div>
                                            <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? light.heading : dark.heading}`}>
                                                Loading Documentation
                                            </h3>
                                            <p className={`text-sm ${theme === 'light' ? light.text : dark.text} opacity-70`}>
                                                Please wait while we fetch your API documentation...
                                            </p>
                                        </div>
                                    )}

                                    {/* Content Based on View Mode */}
                                    {!loading && (
                                    <>
                                        {viewMode === 'cards' ? (
                                            <>
                                                {filteredDocs.length === 0 ? (
                                                    <div className={`py-20 text-center ${theme === 'light' ? light.background : dark.background} rounded-2xl border-2 border-dashed ${theme === 'light' ? light.border : dark.border}`}>
                                                        <div className={`inline-flex p-6 rounded-full ${theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20'} mb-6`}>
                                                            <FontAwesomeIcon 
                                                                icon={searchQuery ? faSearch : faFileAlt} 
                                                                className={`text-6xl ${theme === 'light' ? 'text-blue-400' : 'text-blue-500'} opacity-70`}
                                                            />
                                                        </div>
                                                        <h3 className={`text-2xl font-bold mb-2 ${theme === 'light' ? light.heading : dark.heading}`}>
                                                            {searchQuery ? 'No Results Found' : 'No Documentation Yet'}
                                                        </h3>
                                                        <p className={`text-base mb-6 ${theme === 'light' ? light.text : dark.text} max-w-md mx-auto`}>
                                                            {searchQuery 
                                                                ? `We couldn't find any documentation matching "${searchQuery}". Try adjusting your search terms.`
                                                                : 'Get started by creating your first API documentation set. Click the "New Documentation" button above to begin.'}
                                                        </p>
                                                        {!searchQuery && (
                                                            <button
                                                                onClick={() => {
                                                                    setFormOpen(true)
                                                                    setInitialValues({})
                                                                    setUpdateForm(true)
                                                                    setEdit(false)
                                                                }}
                                                                className={`inline-flex items-center gap-2 py-3 px-6 ${theme === "light" ? light.button_secondary : dark.button_secondary} rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105`}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                                <span>Create Your First Documentation</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                                                        {filteredDocs.map((doc, index) => (
                                                            <div
                                                                key={doc._id || index}
                                                                className={`group cursor-pointer ${theme === 'light' ? light.background : dark.background} rounded-2xl border border-solid ${theme === 'light' ? light.border : dark.border} p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${theme === 'light' ? 'hover:border-blue-400 hover:shadow-blue-100/50' : 'hover:border-blue-600 hover:shadow-blue-900/20'} relative overflow-hidden`}
                                                                onClick={() => handleDocClick(doc.doc_name)}
                                                            >
                                                                {/* Decorative gradient overlay */}
                                                                <div className={`absolute top-0 right-0 w-32 h-32 ${theme === 'light' ? 'bg-gradient-to-br from-blue-50/50 to-transparent' : 'bg-gradient-to-br from-blue-900/10 to-transparent'} rounded-full blur-2xl -mr-16 -mt-16`}></div>
                                                                
                                                                <div className="relative z-10">
                                                                    <div className="flex items-start justify-between mb-5">
                                                                        <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-gradient-to-br from-blue-100 to-sky-100 shadow-md' : 'bg-gradient-to-br from-blue-900/30 to-sky-900/30 shadow-lg'}`}>
                                                                            <FontAwesomeIcon 
                                                                                icon={faCode} 
                                                                                className={`text-2xl ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {doc.private ? (
                                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${theme === 'light' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'bg-amber-900/30 text-amber-400'}`}>
                                                                                    <FontAwesomeIcon icon={faLock} className="text-xs" />
                                                                                    Private
                                                                                </span>
                                                                            ) : (
                                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${theme === 'light' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'bg-emerald-900/30 text-emerald-400'}`}>
                                                                                    <FontAwesomeIcon icon={faLockOpen} className="text-xs" />
                                                                                    Public
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <h3 className={`text-xl font-bold mb-3 transition-colors ${theme === 'light' ? light.heading : dark.heading} ${theme === 'light' ? 'group-hover:text-blue-600' : 'group-hover:text-blue-400'}`}>
                                                                        {doc.doc_name}
                                                                    </h3>

                                                                    <p className={`text-sm mb-5 leading-relaxed ${theme === 'light' ? light.text : dark.text} min-h-[2.5rem]`} style={{
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis'
                                                                    }}>
                                                                        {doc.description || 'No description available.'}
                                                                    </p>

                                                                    {doc.base_url && (
                                                                        <div className={`mb-4 p-3 rounded-lg ${theme === 'light' ? 'bg-blue-50/50' : 'bg-blue-900/10'} border border-solid ${theme === 'light' ? 'border-blue-100' : 'border-blue-800/30'}`}>
                                                                            <div className="flex items-center gap-2">
                                                                                <FontAwesomeIcon 
                                                                                    icon={faServer} 
                                                                                    className={`text-xs ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}
                                                                                />
                                                                                <span className={`text-xs font-medium truncate ${theme === 'light' ? 'text-blue-700' : 'text-blue-400'}`}>
                                                                                    {doc.base_url}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className={`flex items-center justify-between pt-4 border-t border-solid ${theme === 'light' ? light.semiborder : dark.semiborder}`}>
                                                                        <div className="flex items-center gap-4">
                                                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${theme === 'light' ? 'bg-slate-50' : 'bg-gray-800/50'}`}>
                                                                                <FontAwesomeIcon 
                                                                                    icon={faBook} 
                                                                                    className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}
                                                                                />
                                                                                <span className={`text-xs font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>
                                                                                    {doc.categoryCount || 0} {doc.categoryCount === 1 ? 'Category' : 'Categories'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`flex items-center gap-2 ${theme === 'light' ? light.link : dark.link} text-sm font-semibold group-hover:gap-3 transition-all`}>
                                                                            <span>View Docs</span>
                                                                            <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className={`${theme === 'light' ? light.background : dark.background} p-5 pb-0 rounded-xl border border-solid ${theme === 'light' ? light.border : dark.border} overflow-hidden`}>
                                                <Table 
                                                    theme={theme}
                                                    title=""
                                                    header={[
                                                        { key: 'doc_name', label: 'Doc Name', render: (item, index) => {
                                                            const doc = filteredDocs[index] || filteredDocs.find(d => d.doc_name === item) || {};
                                                            return (
                                                                <Link to={`/documentation/${doc?.doc_name || item}`} className={`${theme === 'light' ? light.link : dark.link}`}>
                                                                    {doc?.doc_name || item}
                                                                </Link>
                                                            );
                                                        }},
                                                        { key: 'token_url', label: 'Token URL', render: (item, index) => {
                                                            const doc = filteredDocs[index] || filteredDocs.find(d => d.token_url === item) || {};
                                                            return (
                                                                <button
                                                                    onClick={() => {
                                                                        setModalData({
                                                                            ...modalData,
                                                                            token: { ...doc, label: 'Token URL' }
                                                                        })
                                                                        setOpenListModal({
                                                                            ...openListModal,
                                                                            token: true
                                                                        })
                                                                    }}
                                                                    title="view"
                                                                    className={`p-[0.35rem] text-base px-2 rounded-md ${theme === 'light' ? light.link : dark.link}`}
                                                                >
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                </button>
                                                            );
                                                        }},
                                                        { key: 'private', label: 'Private', render: (item, index) => {
                                                            const doc = filteredDocs[index] || filteredDocs.find(d => d.private === item) || {};
                                                            return (
                                                                <CheckBoxRequest 
                                            theme={theme}
                                                                    options={['Yes', 'No']}
                                                                    item={item}
                                                                    endpoint={updateDocsSettings({
                                                                        id: doc?._id,
                                                                        type: 'private',
                                                                        value: !item,
                                                                    })}
                                                                />
                                                            );
                                                        }},
                                                        { key: 'categoryCount', label: 'Categories' },
                                                        { key: 'base_url', label: 'Base URL', render: (item, index) => {
                                                            const doc = filteredDocs[index] || filteredDocs.find(d => d.base_url === item) || {};
                                                            return (
                                                                <button
                                                                    onClick={() => {
                                                                        setModalData({
                                                                            ...modalData,
                                                                            base_url: { ...doc, label: 'Base URL', link: `${doc?.base_url || item}` }
                                                                        })
                                                                        setLinkOpenModal(true)
                                                                    }}
                                                                    title="view"
                                                                    className={`p-[0.35rem] text-base px-2 rounded-md ${theme === 'light' ? light.link : dark.link}`}
                                                                >
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                </button>
                                                            );
                                                        }},
                                                        { key: 'actions', label: 'Action' },
                                                    ]}
                                                    actions={[
                                                        { label: 'View', color: `${theme === 'light' ? light.view_button : dark.view_button}`, onClick: (item) => handleViewDoc(item) },
                                                        { label: 'Edit', color: `${theme === 'light' ? light.edit_button : dark.edit_button}`, onClick: (item) => editMode(item) },
                                                        { label: 'Delete', color: `${theme === 'light' ? light.delete_button : dark.delete_button}`, onClick: (item) => { setDeleteId(item._id); setOpenModal(true)} },
                                                    ]}
                                                    limit={10}
                                                    multipleSelect={true}
                                                    data={filteredDocs}
                                                    setSelectedData={setSelectedData}
                                                    loading={loading}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                    {/* Footer Info - Only show in card view */}
                                    {!loading && filteredDocs.length > 0 && viewMode === 'cards' && (
                                        <div className={`mt-8 p-4 rounded-lg ${theme === 'light' ? light.semibackground : dark.semibackground} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                            <p className={`text-sm text-center ${theme === 'light' ? light.text : dark.text}`}>
                                                Showing {filteredDocs.length} {filteredDocs.length === 1 ? 'documentation' : 'documentations'}
                                                {searchQuery && ` matching "${searchQuery}"`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SiteDocs
