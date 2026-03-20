import React, { useEffect, useState, useMemo } from 'react'
import { main, dark, light } from '../../style';
import styles from "../../style";
import { useNavigate, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCode, faExternalLinkAlt, faSearch, faSpinner, faFileAlt, faGlobe, faLock, faLockOpen, faPlus, faTable, faTh, faEye, faTimes, faChartLine, faServer, faShieldAlt, faClock, faCheckCircle, faInfoCircle, faArrowRight, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
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

    const isLight = theme === 'light'

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
                        <div className={`mb-6 rounded-xl overflow-hidden border border-solid ${isLight ? 'border-blue-200/60' : 'border-[#2B2B2B]'}`}>
                            <div className={`px-6 py-5 ${isLight ? 'bg-white/90 backdrop-blur-sm' : 'bg-[#0e0e0e]'}`}>
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400'}`}>
                                                Dashboard
                                            </span>
                                            <span className={`w-1 h-1 rounded-full ${isLight ? 'bg-slate-300' : 'bg-gray-600'}`} />
                                            <span className={`text-[10px] font-medium ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                                {Array.isArray(docs) ? docs.length : 0} documentation{Array.isArray(docs) && docs.length !== 1 ? 's' : ''} registered
                                            </span>
                                        </div>
                                        <h1 className={`text-2xl font-bold leading-tight mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                            API Documentation
                                        </h1>
                                        <p className={`text-sm leading-relaxed max-w-lg ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                            Create, organize, and manage your API documentation sets. Configure endpoints, tokens, and access control.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setFormOpen(!formOpen)
                                            setInitialValues({})
                                            setUpdateForm(true)
                                            setEdit(false)
                                        }}
                                        className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                                            isLight
                                                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={formOpen ? faTimes : faPlus} className="text-xs" />
                                        <span>{formOpen ? 'Cancel' : 'New Documentation'}</span>
                                    </button>
                                </div>
                            </div>
                            {!loading && !formOpen && (
                                <div className={`grid grid-cols-2 sm:grid-cols-4 border-t ${isLight ? 'border-blue-200/60 divide-x divide-blue-200/60' : 'border-[#2B2B2B] divide-x divide-[#2B2B2B]'}`}>
                                    {[
                                        { label: 'Total', value: Array.isArray(docs) ? docs.length : 0, icon: faFileAlt, color: isLight ? 'text-blue-500' : 'text-blue-400' },
                                        { label: 'Public', value: Array.isArray(docs) ? docs.filter(d => !d.private).length : 0, icon: faLockOpen, color: isLight ? 'text-emerald-500' : 'text-emerald-400' },
                                        { label: 'Private', value: Array.isArray(docs) ? docs.filter(d => d.private).length : 0, icon: faLock, color: isLight ? 'text-amber-500' : 'text-amber-400' },
                                        { label: 'Categories', value: Array.isArray(docs) ? docs.reduce((sum, doc) => sum + (doc.categoryCount || 0), 0) : 0, icon: faLayerGroup, color: isLight ? 'text-purple-500' : 'text-purple-400' },
                                    ].map((stat, i) => (
                                        <div key={i} className={`flex items-center gap-2.5 px-4 py-3 ${isLight ? 'bg-blue-50/30' : 'bg-[#0a0a0a]'}`}>
                                            <FontAwesomeIcon icon={stat.icon} className={`text-sm ${stat.color}`} />
                                            <div>
                                                <p className={`text-base font-bold leading-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>{stat.value}</p>
                                                <p className={`text-[10px] font-medium ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{stat.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Search and View Toggle */}
                        {!formOpen && (
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-5">
                                <div className="relative w-full sm:flex-1 sm:max-w-md">
                                    <div className={`relative flex items-center rounded-lg px-3.5 py-2.5 border border-solid transition-all ${
                                        isLight
                                            ? `bg-white/90 border-blue-200/60 ${searchQuery ? 'ring-2 ring-blue-400/30' : ''}`
                                            : `bg-[#0e0e0e] border-[#2B2B2B] ${searchQuery ? 'ring-2 ring-blue-500/30' : ''}`
                                    }`}>
                                        <FontAwesomeIcon 
                                            icon={faSearch} 
                                            className={`mr-2.5 text-xs ${isLight ? 'text-slate-400' : 'text-gray-600'} ${searchQuery ? (isLight ? 'text-blue-500' : 'text-blue-400') : ''}`}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search documentation..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={`flex-1 bg-transparent outline-none text-sm ${isLight ? 'text-slate-800 placeholder:text-slate-400' : 'text-gray-200 placeholder:text-gray-600'}`}
                                        />
                                        {searchQuery && (
                                            <div className="flex items-center gap-1.5 ml-2">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/30 text-blue-400'} font-medium`}>
                                                    {filteredDocs.length}
                                                </span>
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className={`p-1 rounded ${isLight ? 'hover:bg-blue-50' : 'hover:bg-[#1C1C1C]'} transition-colors`}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1 rounded-lg p-0.5 border border-solid ${isLight ? 'bg-white/90 border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                                    <button
                                        onClick={() => setViewMode('cards')}
                                        className={`p-1.5 px-2.5 rounded-md text-xs transition-all ${viewMode === 'cards'
                                            ? (isLight ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-600 text-white')
                                            : (isLight ? 'text-slate-500 hover:bg-blue-50' : 'text-gray-500 hover:bg-[#1C1C1C]')
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={faTh} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`p-1.5 px-2.5 rounded-md text-xs transition-all ${viewMode === 'table'
                                            ? (isLight ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-600 text-white')
                                            : (isLight ? 'text-slate-500 hover:bg-blue-50' : 'text-gray-500 hover:bg-[#1C1C1C]')
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={faTable} />
                                    </button>
                                </div>
                            </div>
                        )}

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
                            <div className="w-full md:flex items-start gap-5">
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {/* Loading State */}
                                    {loading && (
                                        <div className={`flex flex-col items-center justify-center py-20 rounded-xl border border-solid ${isLight ? 'bg-white/90 border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                                            <div className={`relative p-5 rounded-full ${isLight ? 'bg-blue-50' : 'bg-blue-900/20'} mb-5`}>
                                                <FontAwesomeIcon 
                                                    icon={faSpinner} 
                                                    className={`text-4xl animate-spin ${isLight ? 'text-blue-600' : 'text-blue-400'}`}
                                                />
                                            </div>
                                            <h3 className={`text-lg font-bold mb-1.5 ${isLight ? light.heading : dark.heading}`}>
                                                Loading Documentation
                                            </h3>
                                            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                Fetching your API documentation...
                                            </p>
                                        </div>
                                    )}

                                    {/* Content Based on View Mode */}
                                    {!loading && (
                                    <>
                                        {viewMode === 'cards' ? (
                                            <>
                                                {filteredDocs.length === 0 ? (
                                                    <div className={`py-20 text-center rounded-xl border-2 border-dashed ${isLight ? 'bg-white/90 border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                                                        <div className={`inline-flex p-5 rounded-full ${isLight ? 'bg-blue-50' : 'bg-blue-900/20'} mb-5`}>
                                                            <FontAwesomeIcon 
                                                                icon={searchQuery ? faSearch : faFileAlt} 
                                                                className={`text-4xl ${isLight ? 'text-blue-400' : 'text-blue-500'} opacity-70`}
                                                            />
                                                        </div>
                                                        <h3 className={`text-xl font-bold mb-2 ${isLight ? light.heading : dark.heading}`}>
                                                            {searchQuery ? 'No Results Found' : 'No Documentation Yet'}
                                                        </h3>
                                                        <p className={`text-sm mb-5 ${isLight ? 'text-slate-500' : 'text-gray-500'} max-w-md mx-auto`}>
                                                            {searchQuery 
                                                                ? `No documentation matching "${searchQuery}".`
                                                                : 'Create your first API documentation set to get started.'}
                                                        </p>
                                                        {!searchQuery && (
                                                            <button
                                                                onClick={() => {
                                                                    setFormOpen(true)
                                                                    setInitialValues({})
                                                                    setUpdateForm(true)
                                                                    setEdit(false)
                                                                }}
                                                                className={`inline-flex items-center gap-2 py-2.5 px-5 rounded-lg text-sm font-medium transition-all ${
                                                                    isLight ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm' : 'bg-blue-600 text-white hover:bg-blue-700'
                                                                }`}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                                                <span>Create Documentation</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {filteredDocs.map((doc, index) => (
                                                            <div
                                                                key={doc._id || index}
                                                                className={`group cursor-pointer rounded-xl border border-solid p-5 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] relative overflow-hidden ${
                                                                    isLight
                                                                        ? 'bg-white/90 border-blue-200/60 hover:border-blue-300'
                                                                        : 'bg-[#0e0e0e] border-[#2B2B2B] hover:border-[#3B3B3B]'
                                                                }`}
                                                                onClick={() => handleDocClick(doc.doc_name)}
                                                            >
                                                                <div className="relative z-10">
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div className={`p-2.5 rounded-lg ${isLight ? 'bg-gradient-to-br from-blue-100 to-sky-100' : 'bg-gradient-to-br from-blue-900/30 to-sky-900/30'}`}>
                                                                            <FontAwesomeIcon 
                                                                                icon={faCode} 
                                                                                className={`text-lg ${isLight ? 'text-blue-600' : 'text-blue-400'}`}
                                                                            />
                                                                        </div>
                                                                        {doc.private ? (
                                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold ${isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/30 text-amber-400'}`}>
                                                                                <FontAwesomeIcon icon={faLock} className="text-[8px]" />
                                                                                Private
                                                                            </span>
                                                                        ) : (
                                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold ${isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-900/30 text-emerald-400'}`}>
                                                                                <FontAwesomeIcon icon={faLockOpen} className="text-[8px]" />
                                                                                Public
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <h3 className={`text-base font-bold mb-1.5 transition-colors ${isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-400'}`}>
                                                                        {doc.doc_name}
                                                                    </h3>

                                                                    <p className={`text-xs mb-3 leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-500'}`} style={{
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis'
                                                                    }}>
                                                                        {doc.description || 'No description available.'}
                                                                    </p>

                                                                    {doc.base_url && (
                                                                        <div className={`mb-3 px-2.5 py-1.5 rounded-md ${isLight ? 'bg-blue-50/60' : 'bg-blue-900/10'} border border-solid ${isLight ? 'border-blue-100/80' : 'border-blue-800/20'}`}>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <FontAwesomeIcon icon={faServer} className={`text-[10px] ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                                                                                <span className={`text-[10px] font-medium truncate ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                                                                                    {doc.base_url}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className={`flex items-center justify-between pt-3 border-t border-solid ${isLight ? 'border-blue-100/60' : 'border-[#2B2B2B]'}`}>
                                                                        <div className={`flex items-center gap-1.5 text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                                            <FontAwesomeIcon icon={faBook} className="text-[10px]" />
                                                                            <span className="font-medium">{doc.categoryCount || 0} {doc.categoryCount === 1 ? 'Category' : 'Categories'}</span>
                                                                        </div>
                                                                        <div className={`flex items-center gap-1.5 text-xs font-medium ${isLight ? 'text-blue-600' : 'text-blue-400'} group-hover:gap-2 transition-all`}>
                                                                            <span>View</span>
                                                                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className={`p-5 pb-0 rounded-xl border border-solid overflow-hidden ${isLight ? 'bg-white/90 border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
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
                                </div>

                                {/* Right Sidebar */}
                                <div className="w-full md:w-64 flex-shrink-0 mt-5 md:mt-0 space-y-3">
                                    {/* Recent Docs */}
                                    {!loading && Array.isArray(docs) && docs.length > 0 && (
                                        <div className={`rounded-xl overflow-hidden border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                                            <div className={`px-4 py-2.5 border-b ${isLight ? 'border-blue-100/60 bg-blue-50/40' : 'border-[#2B2B2B] bg-[#1C1C1C]/50'}`}>
                                                <p className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Recent Docs</p>
                                            </div>
                                            <div className="p-2">
                                                {docs.slice(0, 5).map((doc, i) => (
                                                    <button
                                                        key={doc._id || i}
                                                        onClick={() => handleDocClick(doc.doc_name)}
                                                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
                                                            isLight ? 'hover:bg-blue-50/60' : 'hover:bg-[#1C1C1C]'
                                                        }`}
                                                    >
                                                        <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                                                            isLight ? 'bg-blue-100/60 text-blue-500' : 'bg-blue-900/20 text-blue-400'
                                                        }`}>
                                                            <FontAwesomeIcon icon={faCode} className="text-[9px]" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{doc.doc_name}</p>
                                                            <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                                                {doc.categoryCount || 0} categories · {doc.private ? 'Private' : 'Public'}
                                                            </p>
                                                        </div>
                                                        <FontAwesomeIcon icon={faArrowRight} className={`text-[9px] ${isLight ? 'text-slate-300' : 'text-gray-700'}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Tips */}
                                    <div className={`rounded-xl overflow-hidden border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                                        <div className={`px-4 py-2.5 border-b ${isLight ? 'border-blue-100/60 bg-blue-50/40' : 'border-[#2B2B2B] bg-[#1C1C1C]/50'}`}>
                                            <p className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Quick Tips</p>
                                        </div>
                                        <div className={`p-3.5 space-y-2.5`}>
                                            {[
                                                { icon: faCheckCircle, text: 'Set docs to private to restrict access' },
                                                { icon: faServer, text: 'Base URL is used for API endpoint prefixes' },
                                                { icon: faShieldAlt, text: 'Tokens authenticate API requests' },
                                            ].map((tip, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <FontAwesomeIcon icon={tip.icon} className={`text-[10px] mt-0.5 ${isLight ? 'text-blue-400' : 'text-blue-500'}`} />
                                                    <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{tip.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
