import React, { useEffect, useState, useRef } from 'react'
import { main, dark, light } from '../../style';
import { useNavigate, useLocation } from 'react-router-dom'
import { useParams, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux'
import { faChevronDown, faChevronUp, faCode, faCodePullRequest, faCog, faDashboard, faGlobe, faHeart, faHome, faListSquares, faMessage, faPlayCircle, faPlus, faThumbsDown, faThumbsUp, faTriangleExclamation, faUser, faUserCircle, faUserEdit, faVideo, faBolt, faShieldAlt, faCopy, faCheck, faInfoCircle, faArrowRight, faSpinner, faTrashAlt, faExternalLinkAlt, faTimes, faTag } from '@fortawesome/free-solid-svg-icons';
import { getDocsById, clearAlert, newDocCategory, deleteDocCategory, updateDocCategory } from '../../actions/documentation';
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
            const endpoint = selected?.endpoint || '';
            const method = selected?.method?.toLowerCase() || 'get';
            const token = menuItems[selectedIndex]?.token;
            const url = `${baseUrl}${endpoint}`;

            let response;
            const config = {
                headers: {}
            };

            // Add token if required
            if (selected?.token_required && token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Make API call based on method
            switch(method) {
                case 'get':
                    // For GET, append params as query string (filter out empty values)
                    const filteredParams = Object.fromEntries(
                        Object.entries(formData).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
                    );
                    const queryParams = new URLSearchParams(filteredParams).toString();
                    response = await axios.get(`${url}${queryParams ? `?${queryParams}` : ''}`, config);
                    break;
                case 'post':
                    response = await axios.post(url, formData, config);
                    break;
                case 'patch':
                    response = await axios.patch(url, formData, config);
                    break;
                case 'delete':
                    response = await axios.delete(url, { ...config, data: formData });
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
        // Clear response data when selected endpoint changes
        setResponseData({});
        
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

    // Load payload data into payloadForm when in edit mode
    useEffect(() => {
        if (editMode) {
            if (selected?.payload && Array.isArray(selected.payload) && selected.payload.length > 0) {
                // Load the actual payload data into payloadForm
                setPayloadForm(selected.payload.map(field => ({
                    label: field.label || '',
                    value: field.value || '',
                    name: field.name || '',
                    type: field.type || 'text'
                })));
            } else {
                // Reset to default if no payload exists
                setPayloadForm([
                    {
                        label: "Label 1",
                        value: "",
                        name: "label_1",
                        type: "text"
                    }
                ]);
            }
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

    const handleCopy = () => {
        const jsonAsString = JSON.stringify(form, null, 2);
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
    };

    const handleAddForm = () => {
        const nextIndex = payloadForm.length + 1;
        setPayloadForm([
            ...payloadForm,
            { label: `Label ${nextIndex}`, value: "", name: `label_${nextIndex}` },
        ]);
    };

    const handleInputChange = (index, value) => {
        const updatedForms = payloadForm.map((form, i) =>
            i === index ? { ...form, value: value } : form
        );
        setPayloadForm(updatedForms);
    };

    const handleDeleteForm = (index) => {
        const updatedForms = payloadForm.filter((_, i) => i !== index);
        // Allow removing all fields - set to empty array if last field is removed
        setPayloadForm(updatedForms);
    };

    const [save, setSave] = useState(false)
    const handleResponse = () => {
        if(!save) {
            const formData = {...selected};
            formData.payload = payloadForm;

            setSelected({...selected, payload: payloadForm})

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
                        <div className='mb-8'>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-gradient-to-br from-blue-500 to-sky-500' : 'bg-gradient-to-br from-blue-600 to-sky-600'} shadow-lg`}>
                                        <FontAwesomeIcon icon={faCode} className="text-white text-xl" />
                                    </div>
                                    <div>
                                        <h1 className={`text-3xl md:text-4xl font-bold mb-1 ${theme === 'light' ? light.heading : dark.heading}`}>
                                            {category}
                                        </h1>
                                        <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                                            API Documentation & Endpoints
                                        </p>
                                    </div>
                                </div>
                            {
                                editMode &&
                                    <button
                                        onClick={() => setOpenModal(true)}
                                        className={`flex items-center gap-2 py-3 px-6 ${
                                            theme === "light"
                                                ? light.button_secondary
                                                : dark.button_secondary
                                        } rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105`}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        <span>New Category</span>
                                    </button>
                            }
                            </div>
                        </div>
                        
                        <div className='w-full md:flex items-start gap-6 transition-all'>
                            {/* Sidebar Navigation */}
                            <div className="md:w-80 w-full flex-shrink-0 transition-all">
                                {
                                    loading ?
                                        <div className={`rounded-xl overflow-hidden ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border} p-6 shadow-sm`}>
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <FontAwesomeIcon icon={faSpinner} className={`text-3xl mb-3 animate-spin ${theme === 'light' ? light.icon : dark.icon}`} />
                                                <p className={`text-sm ${theme === 'light' ? light.text : dark.text}`}>Loading Categories...</p>
                                            </div>
                                        </div>
                                    :
                                    (menuItems.length === 0 && !loading) ?
                                        <div className={`rounded-xl overflow-hidden ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border-2 border-dashed ${theme === 'light' ? light.border : dark.border} p-8 shadow-sm`}>
                                            <div className="text-center">
                                                <div className={`inline-flex p-4 rounded-full ${theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20'} mb-4`}>
                                                    <FontAwesomeIcon icon={faListSquares} className={`text-3xl ${theme === 'light' ? 'text-blue-400' : 'text-blue-500'} opacity-70`} />
                                                </div>
                                                <p className={`text-sm font-medium ${theme === 'light' ? light.text : dark.text}`}>No Categories Available</p>
                                            </div>
                                        </div>
                                    :
                                        <div className={`rounded-xl overflow-hidden ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border} shadow-lg`}>
                                            <div className={`px-4 py-3 border-b border-solid ${theme === 'light' ? light.semiborder : dark.semiborder} ${theme === 'light' ? 'bg-blue-50/50' : 'bg-blue-900/10'}`}>
                                                <h3 className={`text-sm font-semibold uppercase tracking-wide ${theme === 'light' ? light.heading : dark.heading}`}>
                                                    Categories
                                                </h3>
                                            </div>
                                            <ul className={`divide-y ${theme === 'light' ? 'divide-slate-200' : 'divide-gray-700'}`}>
                                                {menuItems.map((item, i) => {
                                                    const hasDropdown = item.dropdown && Array.isArray(item.dropdown) && item.dropdown.length > 0;
                                                    const hasSubDropdown = hasDropdown && mainDropdown(item);
                                                    
                                                    return (
                                                        <li key={item.path || i} className="">
                                                            <div
                                                                className={`px-4 py-2.5 ${
                                                                activePage(item.path) && (theme === 'light' ? light.active_list_button : dark.active_list_button)
                                                                } transition-all cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button} flex justify-between items-center ${theme === 'light' ? 'hover:bg-blue-50' : 'hover:bg-gray-800/50'}`}
                                                                onClick={() => (hasSubDropdown ? toggleDropdown(item.path) : redirect(item.path, i))}
                                                        >
                                                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                                    <div className={`p-1 rounded-md ${activePage(item.path) ? (theme === 'light' ? 'bg-white/50' : 'bg-white/10') : 'bg-transparent'}`}>
                                                                        <FontAwesomeIcon icon={faListSquares} className={`text-xs ${activePage(item.path) ? 'text-white' : (theme === 'light' ? light.text : dark.text)}`} />
                                                            </div>
                                                                    <span className="font-medium text-sm truncate">{item.name}</span>
                                                                    {hasDropdown && (
                                                                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${hasSubDropdown ? (theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/30 text-blue-400') : (theme === 'light' ? 'bg-slate-200 text-slate-600' : 'bg-gray-700 text-gray-400')}`}>
                                                                            {item.dropdown.length}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {hasSubDropdown && (
                                                                    <FontAwesomeIcon icon={openDropdown === item.path ? faChevronUp : faChevronDown} className={`text-xs ml-2 flex-shrink-0 ${theme === 'light' ? light.text : dark.text} opacity-60`} />
                                                            )}
                                                        </div>

                                                            {hasSubDropdown && (
                                                        <div
                                                                    className={`overflow-hidden transition-all duration-300 ${theme === 'light' ? 'bg-slate-50/50' : 'bg-gray-900/30'}`}
                                                            style={{
                                                                        maxHeight: openDropdown === item.path ? `${(item.dropdown?.length || 0) * 48}px` : '0px',
                                                            }}
                                                        >
                                                            <ul className="">
                                                                        {(item.dropdown || []).map((subItem, si) => (
                                                                    <li
                                                                        key={si}
                                                                        onClick={() => redirect(subItem.path, i)}
                                                                                className={`px-4 py-2 pl-10 ${
                                                                            activeSubPage(item.path, subItem.path) && (theme === 'light' ? light.active_list_button : dark.active_list_button)
                                                                                } cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button} transition-all ${theme === 'light' ? 'hover:bg-blue-50' : 'hover:bg-gray-800/50'}`}
                                                                    >
                                                                                <div className="flex items-center gap-2">
                                                                        {
                                                                            subItem.method?.toLowerCase() === 'get' ?
                                                                                            <span className='px-2 py-0.5 rounded text-xs font-bold text-white bg-green-500 shadow-sm'>GET</span> 
                                                                            : subItem.method?.toLowerCase() === 'post' ?
                                                                                            <span className='px-2 py-0.5 rounded text-xs font-bold text-white bg-purple-500 shadow-sm'>POST</span> 
                                                                            : subItem.method?.toLowerCase() === 'patch' ?
                                                                                            <span className='px-2 py-0.5 rounded text-xs font-bold text-white bg-yellow-500 shadow-sm'>PATCH</span> 
                                                                            : subItem.method?.toLowerCase() === 'delete' &&
                                                                                            <span className='px-2 py-0.5 rounded text-xs font-bold text-white bg-red-500 shadow-sm'>DELETE</span> 
                                                                        }
                                                                                    <span className="truncate text-sm">{subItem.name}</span>
                                                                                </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                            )}
                                                    </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                }          
                            </div>
                            
                            {/* Main Content */}
                            {
                                loading ?
                                <div className={`flex-1 rounded-xl ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border} p-12 shadow-sm`}>
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className={`p-4 rounded-full ${theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20'} mb-4`}>
                                            <FontAwesomeIcon icon={faSpinner} className={`text-4xl animate-spin ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                                        </div>
                                        <p className={`text-base font-medium ${theme === 'light' ? light.text : dark.text}`}>Loading endpoint data...</p>
                                    </div>
                                </div>
                                :
                                (menuItems.length === 0 && !loading) ?
                                <div className={`flex-1 rounded-xl ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border-2 border-dashed ${theme === 'light' ? light.border : dark.border} p-12 shadow-sm`}>
                                    <div className="text-center py-12">
                                        <div className={`inline-flex p-5 rounded-full ${theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20'} mb-4`}>
                                            <FontAwesomeIcon icon={faCode} className={`text-4xl ${theme === 'light' ? 'text-blue-400' : 'text-blue-500'} opacity-70`} />
                                        </div>
                                        <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? light.heading : dark.heading}`}>No Endpoints Available</h3>
                                        <p className={`text-sm ${theme === 'light' ? light.text : dark.text} opacity-70`}>Select a category from the sidebar to view endpoints</p>
                                    </div>
                                </div>
                                :
                                <div className={`flex-1 rounded-xl ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border} p-6 md:p-8 shadow-lg`}>
                                    {/* <p className={`truncate w-full mt-2 mb-8 ${theme === 'light' ? light.text : dark.text}`}>
                                        <span className={`${theme === 'light' ? light.link : dark.link}`}>Personal Website</span> / 
                                        <span className={`${theme === 'light' ? light.link : dark.link}`}> Overview</span> / 
                                        <span className={`${theme === 'light' ? light.link : dark.link}`}> My Profile</span>
                                    </p> */}

                                    {/* Title Section */}
                                    <div className={`mb-6 pb-6 border-b border-solid ${theme === 'light' ? light.semiborder : dark.semiborder}`}>
                                    {
                                        editMode ?
                                            <input
                                                type="text" 
                                                    className={`w-full text-3xl font-bold bg-transparent outline-none ${theme === 'light' ? light.heading : dark.heading} mb-2`}
                                                    value={ selected?.name || '' }
                                                    onChange={(e) => setSelected({ ...(selected || {}), name: e.target.value })}
                                                    placeholder='Endpoint Title'
                                                />
                                            : 
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                                                    <FontAwesomeIcon icon={faBolt} className={`text-lg ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                                                </div>
                                                <h1 className={`text-3xl font-bold ${theme === 'light' ? light.heading : dark.heading}`}>
                                                    { selected?.name || 'Select an Endpoint' }
                                                </h1>
                                            </div>
                                    }
                                    
                                    {
                                        editMode ?
                                            <textarea 
                                                    className={`w-full bg-transparent outline-none mt-3 custom-scroll ${theme === 'light' ? light.input : dark.input} rounded-lg p-4 ${theme === 'light' ? light.text : dark.text}`}
                                                rows={4}
                                                value={selected?.description ?? 'Description Here'}
                                                    onChange={(e) => setSelected({ ...(selected || {}), description: e.target.value })}
                                                    placeholder='Add a description for this endpoint...'
                                            ></textarea>
                                        :   
                                            <div className={`mt-4 p-4 rounded-lg ${theme === 'light' ? 'bg-slate-50' : 'bg-gray-900/30'} border border-solid ${theme === 'light' ? 'border-slate-200' : 'border-gray-700'}`}>
                                                <p className={`whitespace-pre-wrap text-base leading-relaxed ${theme === 'light' ? light.text : dark.text}`}>
                                                    { selected?.description ?? 'No description available for this endpoint.' }
                                                </p>
                                            </div>
                                        }
                                    </div>

                                    {/* Request Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-gradient-to-br from-blue-100 to-sky-100' : 'bg-gradient-to-br from-blue-900/30 to-sky-900/30'}`}>
                                                <FontAwesomeIcon icon={faCode} className={`text-lg ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                                            </div>
                                            <h2 className={`text-xl font-bold ${theme === 'light' ? light.heading : dark.heading}`}>
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

                                                <div className={`flex w-full items-center gap-2 px-5 py-3.5 rounded-xl ${theme === 'light' ? light.semibackground : dark.semibackground} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border} shadow-sm`}>
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
                                            <div className={`flex w-full items-center gap-3 px-5 py-4 rounded-xl ${theme === 'light' ? light.semibackground : dark.semibackground} ${theme === 'light' ? light.color : dark.color} border-2 border-solid ${theme === 'light' ? 'border-blue-200' : 'border-blue-800/50'} shadow-md`}>
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
                                        !editMode &&
                                            (selected?.token_required && !menuItems[selectedIndex]?.token) &&
                                                <div className={`flex items-center gap-2 w-full my-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 ${theme === 'light' ? '' : 'bg-red-900/20 border-red-800/50'}`}>
                                                    <FontAwesomeIcon icon={faTriangleExclamation} className='text-red-600'/>
                                                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-red-700' : 'text-red-400'}`}>Token is required for this endpoint!</span>
                                                </div>
                                    }

                                    {/* Request Payload Section */}
                                    <div className="mb-6">
                                        <div className='flex justify-between items-center mb-4'>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-gradient-to-br from-purple-900/30 to-pink-900/30'}`}>
                                                    <FontAwesomeIcon icon={faCodePullRequest} className={`text-lg ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />
                                                </div>
                                                <h2 className={`text-xl font-bold ${theme === 'light' ? light.heading : dark.heading}`}>
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
                                            inputValue={JSON.stringify(form, null, 2)}
                                            readOnly={true}
                                        />    
                                        </div>
                                    </div>
                                    </div>  

                                    {/* Response Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-gradient-to-br from-emerald-100 to-teal-100' : 'bg-gradient-to-br from-emerald-900/30 to-teal-900/30'}`}>
                                                <FontAwesomeIcon icon={faCodePullRequest} className={`text-lg ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
                                            </div>
                                            <h2 className={`text-xl font-bold ${theme === 'light' ? light.heading : dark.heading}`}>
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
                                    
                                    {/* Action Buttons */}
                                    {
                                        editMode && 
                                            <div className="flex justify-end gap-3 pt-6 border-t border-solid ${theme === 'light' ? light.semiborder : dark.semiborder}">
                                                <button
                                                    type="submit"
                                                    className={`flex items-center gap-2 disabled:cursor-not-allowed py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105`}
                                                    onClick={() => setDeleteOpenModal(true)}
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                    <span>Delete</span>
                                                </button> 
                                                <button
                                                    type="submit"
                                                    className={`flex items-center gap-2 disabled:cursor-not-allowed py-3 px-6 ${
                                                        theme === "light"
                                                            ? light.button_secondary
                                                            : dark.button_secondary
                                                    } rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105`}
                                                    onClick={handleResponse}
                                                >
                                                    {save ? (
                                                        <>
                                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                                            <span>Saving...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FontAwesomeIcon icon={faCheck} />
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