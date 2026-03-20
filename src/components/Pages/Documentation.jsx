import React, { useEffect, useState, useRef } from 'react'
import { main, dark, light } from '../../style';
import { useNavigate, useLocation } from 'react-router-dom'
import { useParams, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux'
import { faChevronDown, faChevronUp, faCode, faCodePullRequest, faCog, faDashboard, faGlobe, faHeart, faHome, faListSquares, faMessage, faPlayCircle, faPlus, faThumbsDown, faThumbsUp, faTriangleExclamation, faUser, faUserCircle, faUserEdit, faVideo, faBolt, faShieldAlt, faCopy, faCheck, faInfoCircle, faArrowRight, faSpinner, faTrashAlt, faExternalLinkAlt, faTimes, faTag, faPen, faBan, faFileCode, faStickyNote, faServer } from '@fortawesome/free-solid-svg-icons';
import { getDocsById, clearAlert, newDocCategory, deleteDocCategory, updateDocCategory, renameDocCategory, renameDocSubCategory, deleteEntireDocCategory, addDocSubCategory } from '../../actions/documentation';
import DocumentForm from '../Custom/DocumentForm';
import NewDocumentationModal from '../Custom/NewDocumentationModal';
import CodeEditor from '../Custom/CodeEditor';
import Notification from '../Custom/Notification';
import ConfirmModal from '../Custom/ConfirmModal';
import styles from "../../style";
import axios from 'axios';

const Documentation = ({ user, theme }) => {
    const dispatch = useDispatch()
    const navigate  = useNavigate()
    const location = useLocation();

    const docs = useSelector((state) => state.docs.docs)
    const loading = useSelector((state) => state.docs.isLoading)
    const alert = useSelector((state) => state.docs.alert) 

    const { category, page, subpage } = useParams();

    const [searchParams, setSearchParams] = useSearchParams();
    const [initialValues, setInitialValues] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [updateForm, setUpdateForm] = useState(false)
    const [form, setForm] = useState({})
    const [formFields, setFormFields] = useState([]);
    const [selected, setSelected] = useState({})
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [selectedMethod, setSelectedMethod] = useState('');
    const [editMode, setEditMode] = useState(false)
    const [show, setShow] = useState(true)
    const [notification, setNotification] = useState({})
    const [toggle, setToggle] = useState({
        response: false
    })
    
    const isLight = theme === 'light'
    const [menuItems, setMenuItems] = useState([])

    const key = searchParams.get('edit')
    
    useEffect(() => {
        dispatch(getDocsById({category}))
    }, [category])

    useEffect(() => {
        if(docs.length) {
            setMenuItems(docs)
        }
        else {
            setMenuItems([])
        }

        setDeleteConfirm(false)
        setSave(false)
    }, [docs])

    useEffect(() => {
        if(key === import.meta.env.VITE_EDIT_KEY) {
            setEditMode(true);
        }
        else {
            setEditMode(false);
        }
    }, [key])
    
    useEffect(() => {
        if(Object.keys(alert).length > 0) {
            if(alert.variant === 'success') {
                setOpenModal(false);
            }

            dispatch(clearAlert())
            setNotification(alert)
            setShow(true)
        }
    }, [alert])

    const [openDropdown, setOpenDropdown] = useState(null);
    const [renamingCategory, setRenamingCategory] = useState(null)
    const [renamingSubCategory, setRenamingSubCategory] = useState(null)
    const [renameValue, setRenameValue] = useState('')
    const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState(null)
    const [deleteSubConfirm, setDeleteSubConfirm] = useState(null)
    const [addingSubTo, setAddingSubTo] = useState(null)
    const [newSubName, setNewSubName] = useState('')

    const toggleDropdown = (itemPath) => {
        setOpenDropdown(openDropdown === itemPath ? null : itemPath);
    };

    const mainDropdown = (data) => {
        const result = data?.dropdown?.filter(sub => sub.type === 'sub')
        return result.length > 0;
    }

    useEffect(() => {
        const path = `${page}${subpage ? `/${subpage}` : ''}`

        const parentIndex = menuItems.findIndex(item => item.dropdown?.find(sub => sub.path === path));
        let parent, result;

        if(parentIndex === -1) {
            parent = menuItems[0];
            result = parent?.dropdown?.find(sub => sub.path === path);

            if(!result && parent) {
                result = parent.dropdown[0]
            }
        }
        else {
            parent = menuItems[parentIndex];
            result = parent?.dropdown?.find(sub => sub.path === path);
        }

        if(result) {
            setSelectedMethod(result?.method.toUpperCase() ?? 'get')
            setSelectedIndex(parentIndex !== -1 ? parentIndex : 0);
            setSelected(result);
        }
    }, [menuItems])

    const [responseData, setResponseData] = useState({})

    const makeApiCall = async (formData = {}) => {
        try {
            const baseUrl = menuItems[selectedIndex]?.base_url || '';
            let endpoint = selected?.endpoint || '';
            const method = selected?.method?.toLowerCase() || 'get';
            const token = menuItems[selectedIndex]?.token;
            const params = selected?.parameters || [];

            const paramKeys = new Set(params.filter(p => p.location === 'param').map(p => p.key?.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '')))
            const queryKeys = new Set(params.filter(p => p.location === 'query').map(p => p.key?.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '')))
            const bodyKeys = new Set(params.filter(p => (p.location || 'body') === 'body').map(p => p.key?.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '')))

            const paramValues = []
            const queryData = {}
            const bodyData = {}

            Object.entries(formData).forEach(([key, value]) => {
                if (value === '' || value === null || value === undefined) return
                if (paramKeys.has(key)) {
                    paramValues.push(encodeURIComponent(value))
                } else if (queryKeys.has(key)) {
                    queryData[key] = value
                } else if (bodyKeys.has(key)) {
                    bodyData[key] = value
                } else if (!paramKeys.has(key)) {
                    if (['get', 'delete'].includes(method)) {
                        queryData[key] = value
                    } else {
                        bodyData[key] = value
                    }
                }
            })

            const paramPath = paramValues.length > 0 ? `/${paramValues.join('/')}` : ''
            const queryString = new URLSearchParams(queryData).toString()
            const url = `${baseUrl}${endpoint}${paramPath}${queryString ? `?${queryString}` : ''}`

            let response;
            const config = {
                headers: {}
            };

            if (selected?.token_required && token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            switch(method) {
                case 'get':
                    response = await axios.get(url, config);
                    break;
                case 'post':
                    response = await axios.post(url, bodyData, config);
                    break;
                case 'patch':
                    response = await axios.patch(url, bodyData, config);
                    break;
                case 'delete':
                    response = await axios.delete(url, { ...config, data: bodyData });
                    break;
                default:
                    response = await axios.get(url, config);
            }

            // Set response data
            const responseData = {
                status: response.status,
                statusText: response.statusText,
                data: response.data,
                headers: response.headers
            };
            setResponseData(responseData);
            
            // Update selected response_result if in edit mode
            if (editMode) {
                setSelected({...selected, response_result: JSON.stringify(responseData.data, null, 2)});
            }
        } catch (err) {
            // Handle error response
            const errorData = {
                status: err.response?.status || 'Error',
                statusText: err.response?.statusText || err.message,
                data: err.response?.data || { error: err.message },
                headers: err.response?.headers || {}
            };
            setResponseData(errorData);
            
            // Update selected response_result if in edit mode
            if (editMode) {
                setSelected({...selected, response_result: JSON.stringify(errorData.data, null, 2)});
            }
        }
    }

    const getResponse = async () => {
        // Use form data if available, otherwise use empty object
        const formDataToSend = Object.keys(form).length > 0 ? form : {};
        await makeApiCall(formDataToSend);
    }

    useEffect(() => {
        setResponseData({});
        
        const paramTypeMap = { string: 'text', number: 'number', boolean: 'text', array: 'text', object: 'text' }

        if(selected?.payload?.length > 0) {
            const values = {};
            const fields = selected.payload.map((field) => {
                return {
                    label: field.label,
                    name: field.name,
                    type: field.type
                }
            })

            selected.payload.map((field) => {
                values[field.name] = field.value;
            })
            
            setFormFields(fields);
            setInitialValues(values);
            setForm(values)
            setUpdateForm(true);
        }
        else if (selected?.parameters?.length > 0) {
            const allParams = selected.parameters.filter(p => p.key)
            const fields = allParams.map((p) => ({
                label: `${p.key}${(p.location && p.location !== 'body') ? ` (${p.location})` : ''}`,
                name: p.key.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, ''),
                type: paramTypeMap[p.type] || 'text'
            }))
            const values = {}
            fields.forEach(f => { values[f.name] = '' })

            setFormFields(fields);
            setInitialValues(values);
            setForm(values)
            setUpdateForm(true);
        }
        else {
            setFormFields([]);
            setInitialValues({});
            setForm({})
            setUpdateForm(true);
        }
    }, [selected])

    // Auto trigger API call when auto_response is true and form data changes
    useEffect(() => {
        if (selected?.auto_response && !editMode && menuItems[selectedIndex]?.base_url && selected?.endpoint) {
            // Only trigger if we have form fields or if endpoint doesn't require payload
            const hasFormFields = formFields?.length > 0;
            const shouldTrigger = !hasFormFields || Object.keys(form).length > 0;
            
            if (shouldTrigger) {
                // Debounce the API call to avoid too many requests
                const timeoutId = setTimeout(() => {
                    getResponse();
                }, 500); // Wait 500ms after form changes

                return () => clearTimeout(timeoutId);
            }
        }
    }, [form, selected?.auto_response, selected?.endpoint, selected?.method, menuItems[selectedIndex]?.base_url, editMode, selectedIndex, formFields])

    useEffect(() => {
        if (editMode) {
            const paramTypeMap = { string: 'text', number: 'number', boolean: 'text', array: 'text', object: 'text' }
            const params = selected?.parameters && Array.isArray(selected.parameters) ? selected.parameters : []

            if (selected?.payload && Array.isArray(selected.payload) && selected.payload.length > 0) {
                setPayloadForm(selected.payload.map(field => ({
                    label: field.label || '',
                    value: field.value || '',
                    name: field.name || '',
                    type: field.type || 'text'
                })));
            } else if (params.length > 0) {
                setPayloadForm(params.filter(p => p.key).map(p => ({
                    label: p.key,
                    name: p.key.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, ''),
                    type: paramTypeMap[p.type] || 'text',
                    value: ''
                })))
            } else {
                setPayloadForm([]);
            }

            setHeadersForm(selected?.headers && Array.isArray(selected.headers) ? selected.headers : [])
            setParamsForm(params)
            setStatusCodesForm(selected?.status_codes && Array.isArray(selected.status_codes) ? selected.status_codes : [])
        }
    }, [editMode, selected])

    const activePage = (type) => {
        const relativePath = location.pathname;
        
        if(subpage) {
            return (relativePath.includes(type) && type !== '')
        }
        return (relativePath.includes(type)) && ((page === undefined && type === '') || page === type)
    }

    const activeSubPage = (main, type) => {
        const relativePath = location.pathname;
        return relativePath.includes(type) && (subpage === undefined && type === `${main}${subpage ? `/${subpage}` : ''}`) || (`${main}/${subpage}`) === type || type === ''
    }

    const redirect = (path, index) => {
        const queryParams = location.search;

        navigate(`/documentation/${category}/${path}${queryParams}`);

        const result = menuItems[index].dropdown.find(item => item.path && item.path === path);

        setToggle({ ...toggle, response: false })
        setSelectedMethod(result?.method.toUpperCase() ?? 'GET')
        setSelectedIndex(index);
        setSelected(result);
        // Clear response data when switching to another category/endpoint
        setResponseData({});
    }

    const highlightJson = (data, level = 0) => {
        const indent = "    ".repeat(level); // Indentation based on the nesting level
      
        const syntaxHighlight = (key, value, currentLevel) => {
            if (Array.isArray(value)) {
                return (
                    <>
                        <span className="text-white">[</span>
                        {value.map((item, index) => (
                        <React.Fragment key={index}>
                            <br />
                            <span>{indent + "    "}</span>
                            {typeof item === "string" ? (
                            <span className="text-blue-500">"{item}"</span>
                            ) : (
                            <span className="text-yellow-500">{item}</span>
                            )}
                            {index < value.length - 1 && <span className="text-white">,</span>}
                        </React.Fragment>
                        ))}
                        <br />
                        <span>{indent}</span>
                        <span className="text-white">]</span>
                    </>
                );
            } else if (typeof value === "object" && value !== null) {
                return (
                <>
                    <span className="text-white">{"{"}</span>
                    {highlightJson(value, currentLevel + 1)}
                    <br />
                    <span>{indent}</span>
                    <span className="text-white">{"}"}</span>
                </>
                );
            } else if (typeof value === "number") {
                return <span className="text-yellow-500">{value}</span>;
            } else if (typeof value === "string") {
                return <span className="text-blue-500">"{value}"</span>;
            } else if (value === null) {
                return <span className="italic text-gray-500">null</span>;
            }
            return value;
        };
      
        return Object.entries(data).map(([key, value], index) => (
            <React.Fragment key={index}>
                <br />
                <span>{indent}</span>
                <span className="text-violet-500">"{key}"</span>
                <span className="text-white">: </span>
                {syntaxHighlight(key, value, level)}
                {index < Object.entries(data).length - 1 && <span className="text-white">,</span>}
            </React.Fragment>
        ));
    };

    const getBodyOnlyForm = () => {
        const params = selected?.parameters || []
        const nonBodyKeys = new Set(
            params.filter(p => p.location === 'query' || p.location === 'param')
                .map(p => p.key?.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, ''))
        )
        return Object.fromEntries(Object.entries(form).filter(([key]) => !nonBodyKeys.has(key)))
    }

    const handleCopy = () => {
        const jsonAsString = JSON.stringify(getBodyOnlyForm(), null, 2);
        navigator.clipboard.writeText(jsonAsString);
    };

    const handleSubmit = async (formData) => {
        if(!submitted && !isSubmitting) {
            setIsSubmitting(true);
            setSubmitted(true);
            await makeApiCall(formData);
            setIsSubmitting(false);
            // Reset submitted after a delay to allow user to resubmit
            setTimeout(() => {
                setSubmitted(false);
            }, 2000);
        }
    };

    const handleFormChange = async (formData) => {
        setForm(formData)
    }

    const handleMethodChange = (method) => {
        setSelectedMethod(method);
        setSelected({ ...selected, method });
    };

    const [openModal, setOpenModal]                 = useState(false)
    const [confirm, setConfirm]                     = useState(false)
    const [openDeleteModal, setDeleteOpenModal]     = useState(false)
    const [deleteConfirm, setDeleteConfirm]         = useState(false)

    const httpMethods = ['GET', 'POST', 'PATCH', 'DELETE'];

    const [payloadForm, setPayloadForm] = useState([
        {
          label: "Label 1",
          value: "",
          name: "label_1",
          type: "text"
        },
    ]);

    const toSnakeCase = (str) =>
        str
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^\w_]/g, ""); 

    const handleLabelChange = (index, newLabel) => {
        const updatedForms = payloadForm.map((form, i) =>
            i === index
            ? {
                ...form,
                    label: newLabel,
                    name: toSnakeCase(newLabel),
                }
            : form
        );
        setPayloadForm(updatedForms);
        syncParamsFromPayload(updatedForms);
    };

    const handleTypeChange = (index, type) => {
        const updatedForms = payloadForm.map((form, i) =>
            i === index
            ? {
                ...form,
                type: type,
                value: ''
            }
            : form
        );
        setPayloadForm(updatedForms);
        syncParamsFromPayload(updatedForms);
    };

    const handleAddForm = () => {
        const nextIndex = payloadForm.length + 1;
        const updated = [
            ...payloadForm,
            { label: `Label ${nextIndex}`, value: "", name: `label_${nextIndex}`, type: 'text' },
        ];
        setPayloadForm(updated);
        syncParamsFromPayload(updated);
    };

    const handleInputChange = (index, value) => {
        const updatedForms = payloadForm.map((form, i) =>
            i === index ? { ...form, value: value } : form
        );
        setPayloadForm(updatedForms);
    };

    const handleDeleteForm = (index) => {
        const updatedForms = payloadForm.filter((_, i) => i !== index);
        setPayloadForm(updatedForms);
        syncParamsFromPayload(updatedForms);
    };

    const [headersForm, setHeadersForm] = useState([])
    const [paramsForm, setParamsForm] = useState([])
    const [statusCodesForm, setStatusCodesForm] = useState([])

    const handleAddHeader = () => {
        setHeadersForm([...headersForm, { key: '', value: '', required: false }])
    }
    const handleHeaderChange = (index, field, value) => {
        setHeadersForm(headersForm.map((h, i) => i === index ? { ...h, [field]: value } : h))
    }
    const handleDeleteHeader = (index) => {
        setHeadersForm(headersForm.filter((_, i) => i !== index))
    }

    const paramTypeToInputType = (type) => {
        const map = { string: 'text', number: 'number', boolean: 'text', array: 'text', object: 'text' }
        return map[type] || 'text'
    }

    const inputTypeToParamType = (type) => {
        const map = { text: 'string', number: 'number', email: 'string', date: 'string' }
        return map[type] || 'string'
    }

    const syncPayloadFromParams = (params) => {
        setPayloadForm(params.map(p => ({
            label: p.key || '',
            name: toSnakeCase(p.key || ''),
            type: paramTypeToInputType(p.type),
            value: payloadForm.find(pf => pf.name === toSnakeCase(p.key || ''))?.value || ''
        })))
    }

    const syncParamsFromPayload = (payload) => {
        setParamsForm(payload.map(f => {
            const existing = paramsForm.find(p => toSnakeCase(p.key || '') === f.name)
            return {
                key: f.label || '',
                type: inputTypeToParamType(f.type),
                location: existing?.location || 'body',
                required: existing?.required || false
            }
        }))
    }

    const handleAddParam = () => {
        const defaultLoc = ['get', 'delete'].includes(selected?.method?.toLowerCase()) ? 'query' : 'body'
        const updated = [...paramsForm, { key: '', type: 'string', location: defaultLoc, required: false }]
        setParamsForm(updated)
        syncPayloadFromParams(updated)
    }
    const handleParamChange = (index, field, value) => {
        const updated = paramsForm.map((p, i) => i === index ? { ...p, [field]: value } : p)
        setParamsForm(updated)
        syncPayloadFromParams(updated)
    }
    const handleDeleteParam = (index) => {
        const updated = paramsForm.filter((_, i) => i !== index)
        setParamsForm(updated)
        syncPayloadFromParams(updated)
    }

    const handleAddStatusCode = () => {
        setStatusCodesForm([...statusCodesForm, { code: '200', description: '' }])
    }
    const handleStatusCodeChange = (index, field, value) => {
        setStatusCodesForm(statusCodesForm.map((s, i) => i === index ? { ...s, [field]: value } : s))
    }
    const handleDeleteStatusCode = (index) => {
        setStatusCodesForm(statusCodesForm.filter((_, i) => i !== index))
    }

    const [save, setSave] = useState(false)
    const handleResponse = () => {
        if(!save) {
            const formData = {...selected};
            formData.payload = payloadForm;
            formData.headers = headersForm;
            formData.parameters = paramsForm;
            formData.status_codes = statusCodesForm;

            setSelected({...selected, payload: payloadForm, headers: headersForm, parameters: paramsForm, status_codes: statusCodesForm})

            dispatch(updateDocCategory({
                category,
                data: formData
            }))

            setSave(true);
        }
    }

    const handleResponseCode = (data) => {
        setSelected({...selected, response_result: data})
    }

    const handleNewCategory = (formData) => {
        dispatch(newDocCategory({
            category,
            formData
        }))
    }

    const handleRenameCategory = (categoryId) => {
        if (!renameValue.trim()) return
        dispatch(renameDocCategory({ category, categoryId, name: renameValue.trim() }))
        setRenamingCategory(null)
        setRenameValue('')
    }

    const handleRenameSubCategory = (subCategoryId) => {
        if (!renameValue.trim()) return
        dispatch(renameDocSubCategory({ category, subCategoryId, name: renameValue.trim() }))
        setRenamingSubCategory(null)
        setRenameValue('')
    }

    const handleDeleteEntireCategory = (categoryId) => {
        dispatch(deleteEntireDocCategory({ categoryId, category }))
        setDeleteCategoryConfirm(null)
    }

    const handleDeleteSubCategory = (subId) => {
        dispatch(deleteDocCategory({ category, id: subId }))
    }

    const handleAddSubCategory = (categoryId) => {
        if (!newSubName.trim()) return
        dispatch(addDocSubCategory({ category, categoryId, name: newSubName.trim() }))
        setAddingSubTo(null)
        setNewSubName('')
    }

    useEffect(() => {
        if(deleteConfirm && selected?._id) {
            dispatch(deleteDocCategory({
                category,
                id: selected._id
            }))
        }
    }, [deleteConfirm])

    return (
        <div className={`${(menuItems.length === 0 || loading) && 'h-screen'} relative overflow-hidden ${main.font} ${theme === 'light' ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className={`file:lg:px-8 relative px-0 my-12`}>

                        <NewDocumentationModal 
                            theme={theme}
                            title="New Category"
                            description={`Are you sure you want to delete your comment?`}
                            openModal={openModal}
                            setOpenModal={setOpenModal}
                            setConfirm={setConfirm}
                            category={category}
                            handleNewCategory={handleNewCategory}
                        />

                        <Notification
                            theme={theme}
                            data={notification}
                            show={show}
                            setShow={setShow}
                        />

                        <ConfirmModal 
                            theme={theme}
                            title="Confirm Tag Deletion"
                            description={`Are you sure you want to delete this documentation?`}
                            openModal={openDeleteModal}
                            setOpenModal={setDeleteOpenModal}
                            setConfirm={setDeleteConfirm}
                        />

                        {/* Header Section */}
                        <div className={`mb-6 rounded-xl overflow-hidden border border-solid ${isLight ? 'border-blue-200/60' : 'border-[#2B2B2B]'}`}>
                            <div className={`px-6 py-4 ${isLight ? 'bg-white/90 backdrop-blur-sm' : 'bg-[#0e0e0e]'}`}>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <button
                                                onClick={() => navigate('/site')}
                                                className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded transition-all ${isLight ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-500 hover:text-blue-400 hover:bg-blue-900/20'}`}
                                            >
                                                <FontAwesomeIcon icon={faArrowRight} className="text-[9px] rotate-180" />
                                                Sites
                                            </button>
                                            <span className={`w-1 h-1 rounded-full ${isLight ? 'bg-slate-300' : 'bg-gray-600'}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400'}`}>
                                                Docs
                                            </span>
                                            <span className={`w-1 h-1 rounded-full ${isLight ? 'bg-slate-300' : 'bg-gray-600'}`} />
                                            <span className={`text-[10px] font-medium ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                                {menuItems.length} {menuItems.length === 1 ? 'category' : 'categories'}
                                            </span>
                                        </div>
                                        <h1 className={`text-2xl font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                            {category}
                                        </h1>
                                        <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                            API Documentation & Endpoints
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {editMode && (
                                            <button
                                                onClick={() => setOpenModal(true)}
                                                className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                                    isLight
                                                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                                <span>New Category</span>
                                            </button>
                                        )}
                                        {['Admin', 'Moderator'].includes(user?.role) && (
                                            <button
                                                onClick={() => setEditMode(!editMode)}
                                                className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                                    editMode
                                                        ? (isLight ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm' : 'bg-emerald-600 text-white hover:bg-emerald-700')
                                                        : (isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200' : 'bg-[#1C1C1C] text-gray-300 hover:bg-[#2B2B2B] border border-[#2B2B2B]')
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={editMode ? faCheck : faPen} className="text-xs" />
                                                <span>{editMode ? 'Done' : 'Edit'}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className='w-full md:flex items-start gap-5 transition-all'>
                            {/* Sidebar Navigation */}
                            <div className="md:w-72 w-full flex-shrink-0 transition-all">
                                {
                                    loading ?
                                        <div className={`rounded-xl overflow-hidden border border-solid p-6 ${isLight ? 'bg-white/90 backdrop-blur-sm border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <FontAwesomeIcon icon={faSpinner} className={`text-2xl mb-3 animate-spin ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                                                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Loading Categories...</p>
                                            </div>
                                        </div>
                                    :
                                    (menuItems.length === 0 && !loading) ?
                                        <div className={`rounded-xl overflow-hidden border-2 border-dashed p-8 ${isLight ? 'bg-white/90 border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                                            <div className="text-center">
                                                <FontAwesomeIcon icon={faListSquares} className={`text-2xl mb-2 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                                <p className={`text-xs font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No Categories Available</p>
                                            </div>
                                        </div>
                                    :
                                        <div className={`rounded-xl overflow-hidden border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                                            <div className={`px-4 py-2.5 border-b ${isLight ? 'border-blue-100/60 bg-blue-50/40' : 'border-[#2B2B2B] bg-[#1C1C1C]/50'}`}>
                                                <p className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Categories</p>
                                            </div>
                                            <nav>
                                                <ul className="py-1.5">
                                                    {menuItems.map((item, i) => {
                                                        const hasDropdown = item.dropdown && Array.isArray(item.dropdown) && item.dropdown.length > 0;
                                                        const hasSubDropdown = hasDropdown && mainDropdown(item);
                                                        const isActive = activePage(item.path);
                                                        const isRenamingThis = renamingCategory === item._id;

                                                        return (
                                                            <li key={item.path || i}>
                                                                {isRenamingThis ? (
                                                                    <div className={`mx-1.5 my-0.5 px-2 py-1.5 rounded-lg flex items-center gap-1.5 ${isLight ? 'bg-blue-50/80' : 'bg-[#1C1C1C]'}`}>
                                                                        <input
                                                                            type="text"
                                                                            value={renameValue}
                                                                            onChange={(e) => setRenameValue(e.target.value)}
                                                                            onKeyDown={(e) => { if (e.key === 'Enter') handleRenameCategory(item._id); if (e.key === 'Escape') { setRenamingCategory(null); setRenameValue('') } }}
                                                                            autoFocus
                                                                            className={`flex-1 min-w-0 text-xs px-2 py-1 rounded border outline-none ${isLight ? 'bg-white border-blue-200 text-slate-800' : 'bg-[#0e0e0e] border-[#2B2B2B] text-gray-200'}`}
                                                                        />
                                                                        <button onClick={() => handleRenameCategory(item._id)} className={`p-1 rounded ${isLight ? 'text-emerald-600 hover:bg-emerald-50' : 'text-emerald-400 hover:bg-emerald-900/20'}`}>
                                                                            <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                                                        </button>
                                                                        <button onClick={() => { setRenamingCategory(null); setRenameValue('') }} className={`p-1 rounded ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#1C1C1C]'}`}>
                                                                            <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                <div className="group relative">
                                                                    <div
                                                                        className={`mx-1.5 my-0.5 px-3 py-2 rounded-lg flex justify-between items-center cursor-pointer transition-all duration-200 ${
                                                                            isActive
                                                                                ? (isLight
                                                                                    ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-sm'
                                                                                    : 'bg-blue-600 text-white')
                                                                                : (isLight
                                                                                    ? 'text-slate-700 hover:bg-blue-50/80'
                                                                                    : 'text-gray-300 hover:bg-[#1C1C1C]')
                                                                        }`}
                                                                        onClick={() => (hasSubDropdown ? toggleDropdown(item.path) : redirect(item.path, i))}
                                                                    >
                                                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                                            <FontAwesomeIcon icon={faListSquares} className={`text-xs w-3.5 ${isActive ? 'text-white' : (isLight ? 'text-blue-500' : 'text-gray-500')}`} />
                                                                            <span className="font-medium text-sm truncate">{item.name}</span>
                                                                            {hasDropdown && (
                                                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                                                                    isActive
                                                                                        ? 'bg-white/20 text-white'
                                                                                        : (isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400')
                                                                                }`}>
                                                                                    {item.dropdown.length}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            {editMode && (
                                                                                <>
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); setAddingSubTo(addingSubTo === item._id ? null : item._id); setNewSubName(''); if (!hasSubDropdown) setOpenDropdown(item.path) }}
                                                                                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white/70 hover:text-white hover:bg-white/10' : (isLight ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-gray-600 hover:text-emerald-400 hover:bg-emerald-900/20')}`}
                                                                                        title="Add subcategory"
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faPlus} className="text-[9px]" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); setRenamingCategory(item._id); setRenameValue(item.name) }}
                                                                                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white/70 hover:text-white hover:bg-white/10' : (isLight ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-600 hover:text-blue-400 hover:bg-blue-900/20')}`}
                                                                                        title="Rename category"
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faPen} className="text-[9px]" />
                                                                                    </button>
                                                                                    {deleteCategoryConfirm === item._id ? (
                                                                                        <button
                                                                                            onClick={(e) => { e.stopPropagation(); handleDeleteEntireCategory(item._id) }}
                                                                                            className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                                            title="Click again to confirm"
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faCheck} className="text-[9px]" />
                                                                                        </button>
                                                                                    ) : (
                                                                                        <button
                                                                                            onClick={(e) => { e.stopPropagation(); setDeleteCategoryConfirm(item._id); setTimeout(() => setDeleteCategoryConfirm(null), 3000) }}
                                                                                            className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white/70 hover:text-red-200 hover:bg-white/10' : (isLight ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-600 hover:text-red-400 hover:bg-red-900/20')}`}
                                                                                            title="Delete category"
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faTrashAlt} className="text-[9px]" />
                                                                                        </button>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                            {hasSubDropdown && (
                                                                                <FontAwesomeIcon icon={openDropdown === item.path ? faChevronUp : faChevronDown} className="text-[10px] ml-1 flex-shrink-0 opacity-60" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                )}

                                                                {hasSubDropdown && (
                                                                    <div
                                                                        className="overflow-hidden transition-all duration-300"
                                                                        style={{
                                                                            maxHeight: openDropdown === item.path
                                                                                ? `${((item.dropdown?.length || 0) * (editMode ? 52 : 42)) + (addingSubTo === item._id ? 44 : 0)}px`
                                                                                : '0px',
                                                                        }}
                                                                    >
                                                                        <ul className="pl-5 pr-1.5 py-0.5">
                                                                            {(item.dropdown || []).map((subItem, si) => {
                                                                                const isSubActive = activeSubPage(item.path, subItem.path);
                                                                                const methodColors = {
                                                                                    get: 'bg-emerald-500',
                                                                                    post: 'bg-purple-500',
                                                                                    patch: 'bg-amber-500',
                                                                                    delete: 'bg-red-500',
                                                                                };
                                                                                const method = subItem.method?.toLowerCase();
                                                                                const isRenamingSub = renamingSubCategory === subItem._id;

                                                                                if (isRenamingSub) {
                                                                                    return (
                                                                                        <li key={si} className={`px-2 py-1 my-0.5 rounded-lg flex items-center gap-1.5 ${isLight ? 'bg-blue-50/60' : 'bg-[#1C1C1C]'}`}>
                                                                                            <input
                                                                                                type="text"
                                                                                                value={renameValue}
                                                                                                onChange={(e) => setRenameValue(e.target.value)}
                                                                                                onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubCategory(subItem._id); if (e.key === 'Escape') { setRenamingSubCategory(null); setRenameValue('') } }}
                                                                                                autoFocus
                                                                                                className={`flex-1 min-w-0 text-xs px-2 py-1 rounded border outline-none ${isLight ? 'bg-white border-blue-200 text-slate-800' : 'bg-[#0e0e0e] border-[#2B2B2B] text-gray-200'}`}
                                                                                            />
                                                                                            <button onClick={() => handleRenameSubCategory(subItem._id)} className={`p-1 rounded ${isLight ? 'text-emerald-600 hover:bg-emerald-50' : 'text-emerald-400 hover:bg-emerald-900/20'}`}>
                                                                                                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                                                                            </button>
                                                                                            <button onClick={() => { setRenamingSubCategory(null); setRenameValue('') }} className={`p-1 rounded ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#1C1C1C]'}`}>
                                                                                                <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                                                                            </button>
                                                                                        </li>
                                                                                    );
                                                                                }

                                                                                return (
                                                                                    <li
                                                                                        key={si}
                                                                                        className={`group/sub px-3 py-1.5 my-0.5 rounded-lg cursor-pointer transition-all duration-200 ${
                                                                                            isSubActive
                                                                                                ? (isLight
                                                                                                    ? 'bg-blue-100/80 text-blue-700 font-medium'
                                                                                                    : 'bg-blue-600/20 text-blue-400 font-medium')
                                                                                                : (isLight
                                                                                                    ? 'text-slate-600 hover:bg-blue-50/60'
                                                                                                    : 'text-gray-400 hover:bg-[#1C1C1C]')
                                                                                        }`}
                                                                                    >
                                                                                        <div className="flex items-center justify-between" onClick={() => redirect(subItem.path, i)}>
                                                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold text-white leading-none flex-shrink-0 ${methodColors[method] || 'bg-gray-500'}`}>
                                                                                                    {subItem.method?.toUpperCase()}
                                                                                                </span>
                                                                                                <span className="truncate text-xs">{subItem.name}</span>
                                                                                            </div>
                                                                                            {editMode && (
                                                                                                <div className="flex items-center gap-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity flex-shrink-0 ml-1">
                                                                                                    <button
                                                                                                        onClick={(e) => { e.stopPropagation(); setRenamingSubCategory(subItem._id); setRenameValue(subItem.name) }}
                                                                                                        className={`p-1 rounded ${isLight ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-600 hover:text-blue-400 hover:bg-blue-900/20'}`}
                                                                                                        title="Rename"
                                                                                                    >
                                                                                                        <FontAwesomeIcon icon={faPen} className="text-[8px]" />
                                                                                                    </button>
                                                                                                    {deleteSubConfirm === subItem._id ? (
                                                                                                        <button
                                                                                                            onClick={(e) => { e.stopPropagation(); handleDeleteSubCategory(subItem._id); setDeleteSubConfirm(null) }}
                                                                                                            className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                                                            title="Click again to confirm"
                                                                                                        >
                                                                                                            <FontAwesomeIcon icon={faCheck} className="text-[8px]" />
                                                                                                        </button>
                                                                                                    ) : (
                                                                                                        <button
                                                                                                            onClick={(e) => { e.stopPropagation(); setDeleteSubConfirm(subItem._id); setTimeout(() => setDeleteSubConfirm(null), 3000) }}
                                                                                                            className={`p-1 rounded ${isLight ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-600 hover:text-red-400 hover:bg-red-900/20'}`}
                                                                                                            title="Delete"
                                                                                                        >
                                                                                                            <FontAwesomeIcon icon={faTrashAlt} className="text-[8px]" />
                                                                                                        </button>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </li>
                                                                                );
                                                                            })}
                                                                            {addingSubTo === item._id && (
                                                                                <li className={`px-2 py-1 my-0.5 rounded-lg flex items-center gap-1.5 ${isLight ? 'bg-emerald-50/60' : 'bg-[#1C1C1C]'}`}>
                                                                                    <input
                                                                                        type="text"
                                                                                        value={newSubName}
                                                                                        onChange={(e) => setNewSubName(e.target.value)}
                                                                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubCategory(item._id); if (e.key === 'Escape') { setAddingSubTo(null); setNewSubName('') } }}
                                                                                        autoFocus
                                                                                        placeholder="Subcategory name..."
                                                                                        className={`flex-1 min-w-0 text-xs px-2 py-1 rounded border outline-none ${isLight ? 'bg-white border-emerald-200 text-slate-800 placeholder:text-slate-400' : 'bg-[#0e0e0e] border-[#2B2B2B] text-gray-200 placeholder:text-gray-600'}`}
                                                                                    />
                                                                                    <button onClick={() => handleAddSubCategory(item._id)} className={`p-1 rounded ${isLight ? 'text-emerald-600 hover:bg-emerald-50' : 'text-emerald-400 hover:bg-emerald-900/20'}`}>
                                                                                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                                                                    </button>
                                                                                    <button onClick={() => { setAddingSubTo(null); setNewSubName('') }} className={`p-1 rounded ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#1C1C1C]'}`}>
                                                                                        <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                                                                    </button>
                                                                                </li>
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {!hasSubDropdown && addingSubTo === item._id && (
                                                                    <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: '44px' }}>
                                                                        <div className="pl-5 pr-1.5 py-0.5">
                                                                            <div className={`px-2 py-1 my-0.5 rounded-lg flex items-center gap-1.5 ${isLight ? 'bg-emerald-50/60' : 'bg-[#1C1C1C]'}`}>
                                                                                <input
                                                                                    type="text"
                                                                                    value={newSubName}
                                                                                    onChange={(e) => setNewSubName(e.target.value)}
                                                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubCategory(item._id); if (e.key === 'Escape') { setAddingSubTo(null); setNewSubName('') } }}
                                                                                    autoFocus
                                                                                    placeholder="Subcategory name..."
                                                                                    className={`flex-1 min-w-0 text-xs px-2 py-1 rounded border outline-none ${isLight ? 'bg-white border-emerald-200 text-slate-800 placeholder:text-slate-400' : 'bg-[#0e0e0e] border-[#2B2B2B] text-gray-200 placeholder:text-gray-600'}`}
                                                                                />
                                                                                <button onClick={() => handleAddSubCategory(item._id)} className={`p-1 rounded ${isLight ? 'text-emerald-600 hover:bg-emerald-50' : 'text-emerald-400 hover:bg-emerald-900/20'}`}>
                                                                                    <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                                                                </button>
                                                                                <button onClick={() => { setAddingSubTo(null); setNewSubName('') }} className={`p-1 rounded ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#1C1C1C]'}`}>
                                                                                    <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </nav>
                                        </div>
                                }          
                            </div>
                            
                            {/* Main Content */}
                            {
                                loading ?
                                <div className={`flex-1 rounded-xl border border-solid p-12 ${isLight ? 'bg-white/90 backdrop-blur-sm border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <FontAwesomeIcon icon={faSpinner} className={`text-3xl animate-spin mb-4 ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                                        <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Loading endpoint data...</p>
                                    </div>
                                </div>
                                :
                                (menuItems.length === 0 && !loading) ?
                                <div className={`flex-1 rounded-xl border-2 border-dashed p-12 ${isLight ? 'bg-white/90 border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                                    <div className="text-center py-12">
                                        <FontAwesomeIcon icon={faCode} className={`text-3xl mb-3 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                        <h3 className={`text-lg font-bold mb-1.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>No Endpoints Available</h3>
                                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Select a category from the sidebar to view endpoints</p>
                                    </div>
                                </div>
                                :
                                <div className={`flex-1 rounded-xl border border-solid p-6 md:p-7 ${isLight ? 'bg-white/90 backdrop-blur-sm border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'} ${isLight ? light.color : dark.color}`}>
                                    {/* <p className={`truncate w-full mt-2 mb-8 ${theme === 'light' ? light.text : dark.text}`}>
                                        <span className={`${theme === 'light' ? light.link : dark.link}`}>Personal Website</span> / 
                                        <span className={`${theme === 'light' ? light.link : dark.link}`}> Overview</span> / 
                                        <span className={`${theme === 'light' ? light.link : dark.link}`}> My Profile</span>
                                    </p> */}

                                    {/* Title Section */}
                                    <div className={`mb-6 pb-5 border-b ${isLight ? 'border-blue-100/60' : 'border-[#2B2B2B]'}`}>
                                    {
                                        editMode ?
                                            <input
                                                type="text" 
                                                    className={`w-full text-xl font-bold bg-transparent outline-none ${isLight ? 'text-slate-900' : 'text-white'} mb-2`}
                                                    value={ selected?.name || '' }
                                                    onChange={(e) => setSelected({ ...(selected || {}), name: e.target.value })}
                                                    placeholder='Endpoint Title'
                                                />
                                            : 
                                            <div className="flex items-center gap-2 mb-1">
                                                <h1 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                    { selected?.name || 'Select an Endpoint' }
                                                </h1>
                                                {selected?.deprecated && (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isLight ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-orange-900/30 text-orange-400 border border-orange-800/50'}`}>
                                                        Deprecated
                                                    </span>
                                                )}
                                            </div>
                                    }
                                    
                                    {
                                        editMode ?
                                            <textarea 
                                                    className={`w-full bg-transparent outline-none mt-2 custom-scroll rounded-lg p-3 text-sm border border-solid ${isLight ? 'border-blue-200/60 bg-blue-50/30' : 'border-[#2B2B2B] bg-[#1C1C1C]'} ${isLight ? 'text-slate-700' : 'text-gray-300'}`}
                                                rows={3}
                                                value={selected?.description ?? 'Description Here'}
                                                    onChange={(e) => setSelected({ ...(selected || {}), description: e.target.value })}
                                                    placeholder='Add a description for this endpoint...'
                                            ></textarea>
                                        :   
                                            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                { selected?.description ?? 'No description available for this endpoint.' }
                                            </p>
                                    }

                                    {/* Metadata row (view mode) */}
                                    {!editMode && (selected?.content_type || selected?.notes) && (
                                        <div className="flex flex-wrap items-center gap-2 mt-3">
                                            {selected?.content_type && (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-gray-800 text-gray-400'}`}>
                                                    <FontAwesomeIcon icon={faFileCode} className="text-[10px]" />
                                                    {selected.content_type}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Edit mode: Deprecated + Content Type */}
                                    {editMode && (
                                        <div className={`flex flex-wrap items-center gap-4 mt-3 p-3 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-gray-900/30'} border border-solid ${isLight ? 'border-slate-200' : 'border-gray-700'}`}>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    id="deprecated"
                                                    type="checkbox"
                                                    checked={selected?.deprecated || false}
                                                    onChange={() => setSelected({...(selected || {}), deprecated: !selected?.deprecated })}
                                                    className="w-4 h-4 outline-none"
                                                />
                                                <label htmlFor="deprecated" className={`font-medium text-sm ${isLight ? 'text-orange-600' : 'text-orange-400'}`}>
                                                    <FontAwesomeIcon icon={faBan} className="mr-1.5" />
                                                    Deprecated
                                                </label>
                                            </div>
                                            <div className={`h-5 w-px ${isLight ? 'bg-slate-200' : 'bg-gray-700'}`} />
                                            <div className="flex items-center gap-2">
                                                <label className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Content Type:</label>
                                                <select
                                                    value={selected?.content_type || 'application/json'}
                                                    onChange={(e) => setSelected({...(selected || {}), content_type: e.target.value })}
                                                    className={`text-xs py-1.5 px-3 rounded-lg border border-solid outline-none ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#0e0e0e] border-[#2B2B2B] text-gray-300'}`}
                                                >
                                                    <option value="application/json">application/json</option>
                                                    <option value="multipart/form-data">multipart/form-data</option>
                                                    <option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</option>
                                                    <option value="text/plain">text/plain</option>
                                                    <option value="text/html">text/html</option>
                                                    <option value="application/xml">application/xml</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    </div>

                                    {/* Request Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FontAwesomeIcon icon={faCode} className={`text-sm ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                                            <h2 className={`text-sm font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                Request
                                            </h2>
                                        </div>
                                    
                                    {
                                        editMode ?
                                        <>
                                                <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-slate-50' : 'bg-gray-900/30'} border border-solid ${theme === 'light' ? 'border-slate-200' : 'border-gray-700'} mb-4`}>
                                                    <div className="flex items-center gap-2 mb-4">
                                                <input
                                                    id='token'
                                                    type={"checkbox"}
                                                            checked={selected?.token_required || false}
                                                            onChange={() => setSelected({...(selected || {}), token_required: !selected?.token_required })}
                                                            className={`w-4 h-4 outline-none`}
                                                        />
                                                        <label htmlFor={'token'} className={`font-medium ${theme === 'light' ? light.text : dark.text}`}>
                                                            <FontAwesomeIcon icon={faShieldAlt} className="mr-1.5" />
                                                            Token Required
                                                        </label>
                                            </div>

                                                    <div className="flex flex-row flex-wrap gap-3">
                                                {httpMethods.map((method) => (
                                                            <div key={method} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        id={method}
                                                        value={method}
                                                        checked={selectedMethod === method}
                                                        onChange={() => handleMethodChange(method)}
                                                        className="outline-none"
                                                    />
                                                    <label
                                                        htmlFor={method}
                                                                    className={`font-semibold cursor-pointer ${theme === 'light' ? light.text : dark.text}`}
                                                    >
                                                        {method}
                                                    </label>
                                                    </div>
                                                ))}
                                                    </div>
                                            </div>

                                                <div className={`flex w-full items-center gap-2 px-4 py-3 rounded-lg border border-solid ${isLight ? 'bg-blue-50/30 border-blue-200/60' : 'bg-[#1C1C1C] border-[#2B2B2B]'} ${isLight ? light.color : dark.color}`}>
                                                {
                                                    selected?.method?.toLowerCase() === 'get' ?
                                                            <span className='px-3 py-1 rounded-lg text-sm font-bold text-white bg-green-500 shadow-sm'>GET</span> 
                                                    : selected?.method?.toLowerCase() === 'post' ?
                                                            <span className='px-3 py-1 rounded-lg text-sm font-bold text-white bg-purple-500 shadow-sm'>POST</span> 
                                                    : selected?.method?.toLowerCase() === 'patch' ?
                                                            <span className='px-3 py-1 rounded-lg text-sm font-bold text-white bg-yellow-500 shadow-sm'>PATCH</span> 
                                                    : selected?.method?.toLowerCase() === 'delete' &&
                                                            <span className='px-3 py-1 rounded-lg text-sm font-bold text-white bg-red-500 shadow-sm'>DELETE</span> 
                                                    }
                                                    <div className='flex items-center gap-2 flex-1 min-w-0'>
                                                        <span className={`text-sm ${theme === 'light' ? light.text : dark.text} opacity-70`}>
                                                            {menuItems[selectedIndex]?.base_url}
                                                        </span>
                                                    <input
                                                        type="text" 
                                                            className={`flex-1 bg-transparent outline-none ${theme === 'light' ? light.color : dark.color} font-mono text-sm`}
                                                            value={ selected?.endpoint || '' }
                                                            onChange={(e) => setSelected({ ...(selected || {}), endpoint: e.target.value })}
                                                            placeholder="/endpoint"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                        :
                                            <div className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg border border-solid ${isLight ? 'bg-blue-50/30 border-blue-200/60' : 'bg-[#1C1C1C] border-[#2B2B2B]'} ${isLight ? light.color : dark.color}`}>
                                            {
                                                selected?.method?.toLowerCase() === 'get' ?
                                                        <span className='px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-green-500 shadow-sm'>GET</span> 
                                                : selected?.method?.toLowerCase() === 'post' ?
                                                        <span className='px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-purple-500 shadow-sm'>POST</span> 
                                                : selected?.method?.toLowerCase() === 'patch' ?
                                                        <span className='px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-yellow-500 shadow-sm'>PATCH</span> 
                                                : selected?.method?.toLowerCase() === 'delete' &&
                                                        <span className='px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-red-500 shadow-sm'>DELETE</span> 
                                                }
                                                <a 
                                                    href={`${menuItems[selectedIndex]?.base_url}${selected?.endpoint ?? ''}`} 
                                                    target='_blank' 
                                                    rel="noopener noreferrer"
                                                    className={`flex-1 font-mono text-sm truncate ${theme === 'light' ? light.link : dark.link} hover:underline`}
                                                >
                                                {`${menuItems[selectedIndex]?.base_url}${selected?.endpoint ?? ''}`}
                                            </a>
                                                <FontAwesomeIcon icon={faExternalLinkAlt} className={`text-xs ${theme === 'light' ? light.text : dark.text} opacity-50`} />
                                        </div>
                                    }
                                    </div>
                                    
                                    {
                                        !editMode && selected?.token_required && (
                                            menuItems[selectedIndex]?.token ? (
                                                <div className={`flex items-center gap-2 w-full my-4 px-4 py-3 rounded-lg ${isLight ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-900/20 border border-emerald-800/50'}`}>
                                                    <FontAwesomeIcon icon={faShieldAlt} className={`${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                                                    <span className={`text-sm font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                                                        Bearer token is configured
                                                    </span>
                                                    <span className={`ml-auto text-xs font-mono px-2 py-0.5 rounded ${isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-900/30 text-emerald-400'}`}>
                                                        Bearer ••••••••
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className={`flex items-center gap-2 w-full my-4 px-4 py-3 rounded-lg ${isLight ? 'bg-red-50 border border-red-200' : 'bg-red-900/20 border border-red-800/50'}`}>
                                                    <FontAwesomeIcon icon={faTriangleExclamation} className={`${isLight ? 'text-red-600' : 'text-red-400'}`} />
                                                    <span className={`text-sm font-medium ${isLight ? 'text-red-700' : 'text-red-400'}`}>
                                                        Token is required but no bearer token is set up
                                                    </span>
                                                </div>
                                            )
                                        )
                                    }

                                    {/* Headers Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faServer} className={`text-sm ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
                                                <h2 className={`text-sm font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                    Headers
                                                </h2>
                                                {!editMode && selected?.headers?.length > 0 && (
                                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-400'}`}>
                                                        {selected.headers.length}
                                                    </span>
                                                )}
                                            </div>
                                            {editMode && (
                                                <button onClick={handleAddHeader} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isLight ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200' : 'bg-amber-900/20 text-amber-400 hover:bg-amber-900/30 border border-amber-800/50'}`}>
                                                    <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                                                    Add Header
                                                </button>
                                            )}
                                        </div>
                                        {editMode ? (
                                            headersForm.length > 0 ? (
                                                <div className="space-y-2">
                                                    {headersForm.map((header, index) => (
                                                        <div key={index} className={`group relative flex items-center gap-2 p-3 rounded-lg border border-solid ${isLight ? 'bg-white border-slate-200' : 'bg-gray-800/90 border-gray-700'}`}>
                                                            <input
                                                                type="text"
                                                                value={header.key}
                                                                onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                                                                placeholder="Header key"
                                                                className={`flex-1 text-xs px-3 py-2 rounded-lg border border-solid outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400' : 'bg-[#0e0e0e] border-[#2B2B2B] text-gray-200 placeholder:text-gray-600'}`}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={header.value}
                                                                onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                                                                placeholder="Header value"
                                                                className={`flex-1 text-xs px-3 py-2 rounded-lg border border-solid outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400' : 'bg-[#0e0e0e] border-[#2B2B2B] text-gray-200 placeholder:text-gray-600'}`}
                                                            />
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={header.required || false}
                                                                    onChange={(e) => handleHeaderChange(index, 'required', e.target.checked)}
                                                                    className="w-3.5 h-3.5 outline-none"
                                                                />
                                                                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Required</span>
                                                            </div>
                                                            <button onClick={() => handleDeleteHeader(index)} className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/20'}`}>
                                                                <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className={`text-xs italic ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>No headers configured. Click "Add Header" to add one.</p>
                                            )
                                        ) : (
                                            selected?.headers?.length > 0 ? (
                                                <div className={`rounded-lg border border-solid overflow-hidden ${isLight ? 'border-slate-200' : 'border-gray-700'}`}>
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className={`${isLight ? 'bg-slate-50' : 'bg-gray-800/50'}`}>
                                                                <th className={`text-left px-4 py-2 font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Key</th>
                                                                <th className={`text-left px-4 py-2 font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Value</th>
                                                                <th className={`text-center px-4 py-2 font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Required</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {selected.headers.map((header, i) => (
                                                                <tr key={i} className={`border-t ${isLight ? 'border-slate-100' : 'border-gray-700/50'}`}>
                                                                    <td className={`px-4 py-2.5 font-mono font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{header.key}</td>
                                                                    <td className={`px-4 py-2.5 font-mono ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{header.value}</td>
                                                                    <td className="px-4 py-2.5 text-center">
                                                                        {header.required
                                                                            ? <span className="text-emerald-500"><FontAwesomeIcon icon={faCheck} /></span>
                                                                            : <span className={`${isLight ? 'text-slate-300' : 'text-gray-600'}`}>—</span>
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className={`text-xs italic ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>No headers required for this endpoint.</p>
                                            )
                                        )}
                                    </div>

                                    {/* Parameters Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faTag} className={`text-sm ${isLight ? 'text-cyan-500' : 'text-cyan-400'}`} />
                                                <h2 className={`text-sm font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                    Parameters
                                                </h2>
                                                {!editMode && selected?.parameters?.length > 0 && (
                                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isLight ? 'bg-cyan-100 text-cyan-600' : 'bg-cyan-900/30 text-cyan-400'}`}>
                                                        {selected.parameters.length}
                                                    </span>
                                                )}
                                            </div>
                                            {editMode && (
                                                <button onClick={handleAddParam} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isLight ? 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border border-cyan-200' : 'bg-cyan-900/20 text-cyan-400 hover:bg-cyan-900/30 border border-cyan-800/50'}`}>
                                                    <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                                                    Add Parameter
                                                </button>
                                            )}
                                        </div>
                                        {editMode ? (
                                            paramsForm.length > 0 ? (
                                                <div className="space-y-2">
                                                    {paramsForm.map((param, index) => (
                                                        <div key={index} className={`group relative flex items-center gap-2 p-3 rounded-lg border border-solid ${isLight ? 'bg-white border-slate-200' : 'bg-gray-800/90 border-gray-700'}`}>
                                                            <input
                                                                type="text"
                                                                value={param.key}
                                                                onChange={(e) => handleParamChange(index, 'key', e.target.value)}
                                                                placeholder="Parameter name"
                                                                className={`flex-[2] text-xs px-3 py-2 rounded-lg border border-solid outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400' : 'bg-[#0e0e0e] border-[#2B2B2B] text-gray-200 placeholder:text-gray-600'}`}
                                                            />
                                                            <select
                                                                value={param.type || 'string'}
                                                                onChange={(e) => handleParamChange(index, 'type', e.target.value)}
                                                                className={`w-24 text-xs px-3 py-2 rounded-lg border border-solid outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0e0e0e] border-[#2B2B2B] text-gray-200'}`}
                                                            >
                                                                <option value="string">String</option>
                                                                <option value="number">Number</option>
                                                                <option value="boolean">Boolean</option>
                                                                <option value="array">Array</option>
                                                                <option value="object">Object</option>
                                                            </select>
                                                            <select
                                                                value={param.location || (['get', 'delete'].includes(selected?.method?.toLowerCase()) ? 'query' : 'body')}
                                                                onChange={(e) => handleParamChange(index, 'location', e.target.value)}
                                                                className={`w-24 text-xs px-3 py-2 rounded-lg border border-solid outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0e0e0e] border-[#2B2B2B] text-gray-200'}`}
                                                            >
                                                                {!['get', 'delete'].includes(selected?.method?.toLowerCase()) && <option value="body">Body</option>}
                                                                <option value="query">Query</option>
                                                                <option value="param">Param</option>
                                                            </select>
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={param.required || false}
                                                                    onChange={(e) => handleParamChange(index, 'required', e.target.checked)}
                                                                    className="w-3.5 h-3.5 outline-none"
                                                                />
                                                                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Req</span>
                                                            </div>
                                                            <button onClick={() => handleDeleteParam(index)} className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/20'}`}>
                                                                <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className={`text-xs italic ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>No parameters configured. Click "Add Parameter" to add one.</p>
                                            )
                                        ) : (
                                            selected?.parameters?.length > 0 ? (
                                                <div className={`rounded-lg border border-solid overflow-hidden ${isLight ? 'border-slate-200' : 'border-gray-700'}`}>
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className={`${isLight ? 'bg-slate-50' : 'bg-gray-800/50'}`}>
                                                                <th className={`text-left px-4 py-2 font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Name</th>
                                                                <th className={`text-left px-4 py-2 font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Type</th>
                                                                <th className={`text-left px-4 py-2 font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Location</th>
                                                                <th className={`text-center px-4 py-2 font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Required</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {selected.parameters.map((param, i) => {
                                                                const locColors = {
                                                                    body: isLight ? 'bg-purple-50 text-purple-600' : 'bg-purple-900/30 text-purple-400',
                                                                    query: isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-900/30 text-amber-400',
                                                                    param: isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/30 text-emerald-400',
                                                                }
                                                                return (
                                                                <tr key={i} className={`border-t ${isLight ? 'border-slate-100' : 'border-gray-700/50'}`}>
                                                                    <td className={`px-4 py-2.5 font-mono font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{param.key}</td>
                                                                    <td className="px-4 py-2.5">
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${isLight ? 'bg-cyan-50 text-cyan-600' : 'bg-cyan-900/30 text-cyan-400'}`}>
                                                                            {param.type}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2.5">
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${locColors[param.location] || locColors.body}`}>
                                                                            {param.location || 'body'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2.5 text-center">
                                                                        {param.required
                                                                            ? <span className="text-emerald-500"><FontAwesomeIcon icon={faCheck} /></span>
                                                                            : <span className={`${isLight ? 'text-slate-300' : 'text-gray-600'}`}>—</span>
                                                                        }
                                                                    </td>
                                                                </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className={`text-xs italic ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>No parameters for this endpoint.</p>
                                            )
                                        )}
                                    </div>

                                    {/* Request Payload Section */}
                                    <div className="mb-6">
                                        <div className='flex justify-between items-center mb-3'>
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faCodePullRequest} className={`text-sm ${isLight ? 'text-purple-500' : 'text-purple-400'}`} />
                                                <h2 className={`text-sm font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                    Request Payload
                                                </h2>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                            {
                                                (!editMode && formFields?.length > 0) &&
                                                <>
                                                        <button 
                                                            onClick={() => setToggle({ ...toggle, response: false })} 
                                                            className={`px-4 py-2 text-sm font-semibold transition-all rounded-lg border border-solid ${
                                                                !toggle.response 
                                                                    ? (theme === 'light' ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-blue-600 text-white border-blue-600 shadow-lg')
                                                                    : (theme === 'light' ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300' : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600')
                                                            }`}
                                                        >
                                                        Form
                                                    </button>
                                                        <button 
                                                            onClick={() => setToggle({ ...toggle, response: true })} 
                                                            className={`px-4 py-2 text-sm font-semibold transition-all rounded-lg border border-solid ${
                                                                toggle.response 
                                                                    ? (theme === 'light' ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-blue-600 text-white border-blue-600 shadow-lg')
                                                                    : (theme === 'light' ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300' : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600')
                                                            }`}
                                                        >
                                                        Raw
                                                    </button>
                                                </>
                                            }
                                        </div>
                                    </div>
                                    
                                    {
                                        editMode ?
                                                <div className={`rounded-xl ${theme === 'light' ? 'bg-gradient-to-br from-slate-50 to-blue-50/30' : 'bg-gradient-to-br from-gray-900/40 to-gray-800/30'} border border-solid ${theme === 'light' ? 'border-slate-200' : 'border-gray-700'} p-6 shadow-lg`}>
                                                    {payloadForm.length > 0 ? (
                                                        <div className="space-y-3 mb-4">
                                                    {payloadForm.map((form, index) => (
                                                                <div key={index} className={`group relative rounded-xl ${theme === 'light' ? 'bg-white shadow-sm' : 'bg-gray-800/90 shadow-lg border-gray-700'} border border-solid ${theme === 'light' ? 'border-slate-200' : 'border-gray-700'} p-4 transition-all hover:shadow-md ${theme === 'light' ? 'hover:border-blue-300' : 'hover:border-gray-600 hover:bg-gray-800'}`}>
                                                                    {/* Delete Button */}
                                                                    <button
                                                                        onClick={() => handleDeleteForm(index)}
                                                                        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${theme === 'light' ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/20'}`}
                                                                        title="Remove field"
                                                                    >
                                                                        <FontAwesomeIcon icon={faTimes} className="text-sm" />
                                                                    </button>
                                                                    
                                                                    {/* Field Label */}
                                                                    <div className="mb-3">
                                                                        <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 ${theme === 'light' ? 'text-slate-600' : 'text-gray-300'}`}>
                                                                            Field Label
                                                                        </label>
                                                                        <div className="relative">
                                                                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-slate-400' : 'text-blue-400'}`}>
                                                                                <FontAwesomeIcon icon={faTag} className="text-sm" />
                                                                            </div>
                                                                <input
                                                                                type="text"
                                                                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-solid ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-400 focus:bg-white placeholder:text-slate-400' : 'bg-gray-800/80 border-gray-600 focus:border-blue-400 focus:bg-gray-800 placeholder:text-gray-500'} ${theme === 'light' ? light.text : 'text-gray-100'} outline-none transition-all focus:ring-2 ${theme === 'light' ? 'focus:ring-blue-100' : 'focus:ring-blue-500/20'} font-medium`}
                                                                    value={form.label}
                                                                    onChange={(e) => handleLabelChange(index, e.target.value)}
                                                                                placeholder="e.g., User Name, Email Address"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Field Type and Value */}
                                                                    <div className="grid grid-cols-12 gap-3">
                                                                        {/* Type Selector */}
                                                                        <div className="col-span-12 sm:col-span-4">
                                                                            <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 ${theme === 'light' ? 'text-slate-600' : 'text-gray-300'}`}>
                                                                                Type
                                                                            </label>
                                                                            <div className="relative">
                                                                <select
                                                                                    className={`w-full py-2.5 px-4 pr-8 rounded-lg border border-solid appearance-none cursor-pointer transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-400 focus:bg-white' : 'bg-gray-800/80 border-gray-600 focus:border-blue-400 focus:bg-gray-800'} ${theme === 'light' ? light.text : 'text-gray-100'} outline-none focus:ring-2 ${theme === 'light' ? 'focus:ring-blue-100' : 'focus:ring-blue-500/20'}`}
                                                                    onChange={(e) => handleTypeChange(index, e.target.value)}
                                                                                    value={form.type || "text"}
                                                                                >
                                                                                    <option value="text" className={`${theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-100'}`}>Text</option>
                                                                                    <option value="number" className={`${theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-100'}`}>Number</option>
                                                                                    <option value="date" className={`${theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-100'}`}>Date</option>
                                                                                    <option value="email" className={`${theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-100'}`}>Email</option>
                                                                </select>
                                                                                <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${theme === 'light' ? 'text-slate-400' : 'text-blue-400'}`}>
                                                                                    <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Value Input */}
                                                                        <div className="col-span-12 sm:col-span-8">
                                                                            <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 ${theme === 'light' ? 'text-slate-600' : 'text-gray-300'}`}>
                                                                                Default Value
                                                                            </label>
                                                                <input
                                                                    type={form.type || "text"}
                                                                                placeholder={`Enter ${form.label || 'value'}...`}
                                                                    value={form.value}
                                                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                                                                className={`w-full py-2.5 px-4 rounded-lg border border-solid transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-400 focus:bg-white placeholder:text-slate-400' : 'bg-gray-800/80 border-gray-600 focus:border-blue-400 focus:bg-gray-800 placeholder:text-gray-500'} ${theme === 'light' ? light.text : 'text-gray-100'} outline-none focus:ring-2 ${theme === 'light' ? 'focus:ring-blue-100' : 'focus:ring-blue-500/20'}`}
                                                                />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                        </div>
                                                    ) : (
                                                        <div className={`py-12 text-center rounded-lg border-2 border-dashed ${theme === 'light' ? 'border-slate-200 bg-slate-50/50' : 'border-gray-700 bg-gray-800/30'} mb-4`}>
                                                            <FontAwesomeIcon icon={faCodePullRequest} className={`text-4xl mb-3 ${theme === 'light' ? 'text-slate-300' : 'text-gray-600'}`} />
                                                            <p className={`text-sm font-medium ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                                                                No payload fields. This endpoint doesn't require any form data.
                                                            </p>
                                                            <p className={`text-xs mt-2 ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`}>
                                                                Click "Add New Field" below if you want to add payload fields.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Add Field Button */}
                                                    <button
                                                        onClick={handleAddForm}
                                                        className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-lg font-semibold text-sm transition-all ${theme === 'light' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'} transform hover:scale-[1.02] active:scale-[0.98]`}
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} className="text-sm" />
                                                        <span>{payloadForm.length === 0 ? 'Add First Field' : 'Add New Field'}</span>
                                                    </button>
                                            </div>
                                        :
                                        <div className={`mt-4 ${!toggle.response ? 'block' : 'hidden'}`}>
                                            {
                                                formFields?.length > 0 ?
                                                    <div className={`rounded-xl ${theme === 'light' ? 'bg-gradient-to-br from-white to-blue-50/30' : 'bg-gradient-to-br from-gray-900/40 to-gray-800/30'} border border-solid ${theme === 'light' ? 'border-slate-200' : 'border-gray-700'} p-6 shadow-lg`}>
                                                        <div className="mb-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h3 className={`text-sm font-semibold uppercase tracking-wide ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                                                                    Request Form
                                                                </h3>
                                                                {isSubmitting && (
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500" />
                                                                        <span className={`${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>Sending request...</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>
                                                                Fill out the form below and click Submit to make an API request
                                                            </p>
                                                        </div>
                                                        <div className={`rounded-lg ${theme === 'light' ? 'bg-white' : 'bg-gray-800/50'} border border-solid ${theme === 'light' ? 'border-slate-200' : 'border-gray-700'} p-5 shadow-sm`}>
                                                    <DocumentForm
                                                        theme={theme}
                                                        fields={formFields}
                                                        onSubmit={handleSubmit}
                                                        initialValues={initialValues}
                                                        update={updateForm}
                                                        setUpdate={setUpdateForm}
                                                                disabled={submitted || isSubmitting}
                                                        handleFormChange={handleFormChange}
                                                    /> 
                                                        </div>
                                                    </div>
                                                : 
                                                <div className={`rounded-xl ${theme === 'light' ? 'bg-gradient-to-br from-slate-50 to-blue-50/30' : 'bg-gradient-to-br from-gray-900/40 to-gray-800/30'} border-2 border-dashed ${theme === 'light' ? 'border-slate-200' : 'border-gray-700'} p-12 text-center shadow-sm`}>
                                                    <div className={`inline-flex p-4 rounded-full ${theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20'} mb-4`}>
                                                        <FontAwesomeIcon icon={faInfoCircle} className={`text-3xl ${theme === 'light' ? 'text-blue-400' : 'text-blue-500'}`} />
                                                    </div>
                                                    <h3 className={`text-lg font-semibold mb-2 ${theme === 'light' ? light.heading : dark.heading}`}>
                                                        No Payload Required
                                                    </h3>
                                                    <p className={`text-sm ${theme === 'light' ? light.text : dark.text} opacity-70 mb-4`}>
                                                        This endpoint doesn't require any form data. You can make a direct request.
                                                    </p>
                                                    {!submitted && !isSubmitting && (
                                                        <button
                                                            onClick={() => handleSubmit({})}
                                                            disabled={isSubmitting}
                                                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${theme === 'light' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'} transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        >
                                                            {isSubmitting ? (
                                                                <>
                                                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                                                    <span>Sending...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FontAwesomeIcon icon={faPlayCircle} />
                                                                    <span>Send Request</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            }
                                        </div>
                                    }

                                    {/* <div className={`${toggle.response ? 'block' : 'hidden'} overflow-x-auto custom-scroll relative mb-4 mt-2 px-6 py-3 rounded-sm ${theme === 'light' ? light.semibackground : dark.semibackground} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                        <button
                                            onClick={handleCopy}
                                            className="absolute top-4 right-4 bg-[#0e0e0e] text-white px-3 py-1 rounded-sm text-xs hover:bg-blue-600 focus:outline-none transition-all"
                                        >
                                            Copy
                                        </button>
                                        <pre
                                            className="text-sm font-mono leading-6 text-white overflow-x-auto whitespace-pre-wrap max-w-full"
                                        >
                                            {"{"}
                                            <div className="pl-8">{highlightJson(form)}</div>
                                            <br />
                                            {"}"}
                                        </pre>
                                    </div>      */}
                                    
                                    <div className={`${toggle.response ? 'block' : 'hidden'} mb-4 mt-2 relative`}>
                                        <div className={`rounded-lg ${theme === 'light' ? 'bg-slate-50' : 'bg-gray-900/30'} border border-solid ${theme === 'light' ? 'border-slate-200' : 'border-gray-700'} p-1`}>
                                            <div className={`flex items-center justify-between px-3 py-2 border-b border-solid ${theme === 'light' ? 'border-slate-200' : 'border-gray-700'}`}>
                                                <span className={`text-xs font-semibold uppercase tracking-wide ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                                                    JSON Payload
                                                </span>
                                        <button
                                            onClick={handleCopy}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-700 hover:bg-blue-600'} text-white rounded-md text-xs font-medium transition-all shadow-sm`}
                                        >
                                                    <FontAwesomeIcon icon={faCopy} />
                                            Copy
                                        </button>
                                            </div>
                                        <CodeEditor
                                            theme={theme}
                                            inputValue={JSON.stringify(getBodyOnlyForm(), null, 2)}
                                            readOnly={true}
                                        />    
                                        </div>
                                    </div>
                                    </div>  

                                    {/* Response Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FontAwesomeIcon icon={faCodePullRequest} className={`text-sm ${isLight ? 'text-emerald-500' : 'text-emerald-400'}`} />
                                            <h2 className={`text-sm font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                Response
                                            </h2>
                                        </div>
                                    
                                    {
                                        editMode && 
                                            <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${theme === 'light' ? 'bg-slate-50' : 'bg-gray-900/30'} border border-solid ${theme === 'light' ? 'border-slate-200' : 'border-gray-700'}`}>
                                            <input
                                                id='auto_response'
                                                type={"checkbox"}
                                                    checked={selected?.auto_response || false}
                                                    onChange={() => setSelected({...(selected || {}), auto_response: !selected?.auto_response })}
                                                    className={`w-4 h-4 outline-none`}
                                                />
                                                <label htmlFor={'auto_response'} className={`font-medium ${theme === 'light' ? light.text : dark.text}`}>
                                                    Auto Response
                                                </label>
                                        </div>
                                    }
                                    
                                    {
                                            (!selected?.auto_response || !editMode) &&
                                                <div className={`rounded-xl ${theme === 'light' ? 'bg-gradient-to-br from-white to-emerald-50/30' : 'bg-gradient-to-br from-gray-900/40 to-gray-800/30'} border border-solid ${theme === 'light' ? 'border-slate-200' : 'border-gray-700'} shadow-lg overflow-hidden`}>
                                                    {/* Response Header */}
                                                    <div className={`flex items-center justify-between px-4 py-3 border-b border-solid ${theme === 'light' ? 'border-slate-200 bg-slate-50/50' : 'border-gray-700 bg-gray-800/30'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-xs font-semibold uppercase tracking-wide ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                                                                Response
                                                            </span>
                                                            {responseData?.status && (
                                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                                                    responseData.status >= 200 && responseData.status < 300
                                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                        : responseData.status >= 400
                                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                }`}>
                                                                    {responseData.status} {responseData.statusText || ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {!editMode && (
                                                            <button
                                                                onClick={() => {
                                                                    const responseText = Object.keys(responseData || {}).length > 0 
                                                                        ? JSON.stringify(responseData.data || responseData, null, 2)
                                                                        : selected?.response_result || '{}';
                                                                    navigator.clipboard.writeText(responseText);
                                                                }}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 ${theme === 'light' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-700 hover:bg-emerald-600'} text-white rounded-md text-xs font-medium transition-all shadow-sm hover:shadow-md`}
                                                            >
                                                                <FontAwesomeIcon icon={faCopy} />
                                                                Copy
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Response Body */}
                                                    <div className="p-1">
                                                        {Object.keys(responseData || {}).length > 0 ? (
                                                <CodeEditor
                                                    theme={theme}
                                                    onChange={handleResponseCode}
                                                                inputValue={JSON.stringify(responseData.data || responseData, null, 2)}
                                                    readOnly={!editMode}
                                                />
                                                        ) : (
                                                            <div className={`p-12 text-center ${theme === 'light' ? 'bg-slate-50/50' : 'bg-gray-800/20'}`}>
                                                                <div className={`inline-flex p-3 rounded-full ${theme === 'light' ? 'bg-slate-100' : 'bg-gray-800/50'} mb-3`}>
                                                                    <FontAwesomeIcon icon={faCodePullRequest} className={`text-2xl ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`} />
                                                                </div>
                                                                <p className={`text-sm font-medium ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                                                                    {editMode ? 'No response data yet' : 'Submit the form above to see the API response'}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                            </div>
                                    }                     
                                    </div>

                                    {/* Status Codes Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faInfoCircle} className={`text-sm ${isLight ? 'text-indigo-500' : 'text-indigo-400'}`} />
                                                <h2 className={`text-sm font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                    Status Codes
                                                </h2>
                                            </div>
                                            {editMode && (
                                                <button onClick={handleAddStatusCode} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isLight ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200' : 'bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30 border border-indigo-800/50'}`}>
                                                    <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                                                    Add Status Code
                                                </button>
                                            )}
                                        </div>
                                        {editMode ? (
                                            statusCodesForm.length > 0 ? (
                                                <div className="space-y-2">
                                                    {statusCodesForm.map((sc, index) => (
                                                        <div key={index} className={`group relative flex items-center gap-2 p-3 rounded-lg border border-solid ${isLight ? 'bg-white border-slate-200' : 'bg-gray-800/90 border-gray-700'}`}>
                                                            <input
                                                                type="text"
                                                                value={sc.code}
                                                                onChange={(e) => handleStatusCodeChange(index, 'code', e.target.value)}
                                                                placeholder="200"
                                                                className={`w-20 text-xs px-3 py-2 rounded-lg border border-solid outline-none font-mono font-bold text-center ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0e0e0e] border-[#2B2B2B] text-gray-200'}`}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={sc.description}
                                                                onChange={(e) => handleStatusCodeChange(index, 'description', e.target.value)}
                                                                placeholder="Description (e.g., Success, Not Found...)"
                                                                className={`flex-1 text-xs px-3 py-2 rounded-lg border border-solid outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400' : 'bg-[#0e0e0e] border-[#2B2B2B] text-gray-200 placeholder:text-gray-600'}`}
                                                            />
                                                            <button onClick={() => handleDeleteStatusCode(index)} className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/20'}`}>
                                                                <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className={`text-xs italic ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>No status codes defined. Click "Add Status Code" to add one.</p>
                                            )
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {responseData?.status ? (() => {
                                                    const code = parseInt(responseData.status)
                                                    const colorClass = code >= 200 && code < 300
                                                        ? (isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-300/50' : 'bg-emerald-900/40 text-emerald-300 border-emerald-700 ring-2 ring-emerald-500/30')
                                                        : code >= 400 && code < 500
                                                        ? (isLight ? 'bg-orange-100 text-orange-800 border-orange-300 ring-2 ring-orange-300/50' : 'bg-orange-900/40 text-orange-300 border-orange-700 ring-2 ring-orange-500/30')
                                                        : code >= 500
                                                        ? (isLight ? 'bg-red-100 text-red-800 border-red-300 ring-2 ring-red-300/50' : 'bg-red-900/40 text-red-300 border-red-700 ring-2 ring-red-500/30')
                                                        : (isLight ? 'bg-slate-100 text-slate-800 border-slate-300 ring-2 ring-slate-300/50' : 'bg-gray-700 text-gray-300 border-gray-600 ring-2 ring-gray-500/30')
                                                    return (
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${colorClass}`}>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                            <span className="font-mono font-bold">{responseData.status}</span>
                                                            {responseData.statusText && <span className="opacity-80">— {responseData.statusText}</span>}
                                                        </div>
                                                    )
                                                })() : (
                                                    selected?.status_codes?.length > 0 ? (
                                                        selected.status_codes.map((sc, i) => {
                                                            const code = parseInt(sc.code)
                                                            const colorClass = code >= 200 && code < 300
                                                                ? (isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50')
                                                                : code >= 400 && code < 500
                                                                ? (isLight ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-orange-900/20 text-orange-400 border-orange-800/50')
                                                                : code >= 500
                                                                ? (isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-900/20 text-red-400 border-red-800/50')
                                                                : (isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-gray-800 text-gray-400 border-gray-700')
                                                            return (
                                                                <div key={i} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${colorClass}`}>
                                                                    <span className="font-mono font-bold">{sc.code}</span>
                                                                    {sc.description && <span className="opacity-80">— {sc.description}</span>}
                                                                </div>
                                                            )
                                                        })
                                                    ) : (
                                                        <p className={`text-xs italic ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>No status codes documented.</p>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FontAwesomeIcon icon={faStickyNote} className={`text-sm ${isLight ? 'text-yellow-500' : 'text-yellow-400'}`} />
                                            <h2 className={`text-sm font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                                Notes
                                            </h2>
                                        </div>
                                        {editMode ? (
                                            <textarea
                                                value={selected?.notes || ''}
                                                onChange={(e) => setSelected({...(selected || {}), notes: e.target.value })}
                                                placeholder="Add any additional notes, warnings, or usage tips for this endpoint..."
                                                rows={3}
                                                className={`w-full text-sm rounded-lg p-3 border border-solid outline-none custom-scroll ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-yellow-300 focus:bg-white' : 'bg-[#1C1C1C] border-[#2B2B2B] text-gray-300 placeholder:text-gray-600 focus:border-yellow-700'}`}
                                            />
                                        ) : (
                                            selected?.notes ? (
                                                <div className={`p-4 rounded-lg border border-solid ${isLight ? 'bg-yellow-50/50 border-yellow-200/60' : 'bg-yellow-900/10 border-yellow-800/30'}`}>
                                                    <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                                        {selected.notes}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className={`text-xs italic ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>No additional notes for this endpoint.</p>
                                            )
                                        )}
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    {
                                        editMode && 
                                            <div className={`flex justify-end gap-2.5 pt-5 border-t ${isLight ? 'border-blue-100/60' : 'border-[#2B2B2B]'}`}>
                                                <button
                                                    type="submit"
                                                    className="flex items-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all"
                                                    onClick={() => setDeleteOpenModal(true)}
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                                                    <span>Delete</span>
                                                </button> 
                                                <button
                                                    type="submit"
                                                    className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                                        isLight
                                                            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                                    onClick={handleResponse}
                                                >
                                                    {save ? (
                                                        <>
                                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                                                            <span>Saving...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                                            <span>Save Changes</span>
                                                        </>
                                                    )}
                                                </button> 
                                            </div>
                                    }
                                </div>
                            }

                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Documentation