import React, { useEffect, useState, useRef } from 'react'
import { main, dark, light } from '../../style';
import { useNavigate, useLocation } from 'react-router-dom'
import { useParams, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux'
import { faChevronDown, faChevronUp, faCode, faCodePullRequest, faCog, faDashboard, faGlobe, faHeart, faHome, faListSquares, faMessage, faPlayCircle, faPlus, faThumbsDown, faThumbsUp, faTriangleExclamation, faUser, faUserCircle, faUserEdit, faVideo } from '@fortawesome/free-solid-svg-icons';
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

    const getResponse = async () => {
        try {
            const url = `${menuItems[selectedIndex]?.base_url}${selected?.endpoint ?? ''}`;
            const response = await axios.get(url);

            const data = response.data;

            if(data) {
                setResponseData(data)
            }
        } catch (err) {
            const data = {
                status: err.response.status,
                statusText: err.response.statusText,
                data: err.response.data
            }

            setResponseData(data)
        }
    }

    useEffect(() => {
        if(selected.payload?.length > 0) {
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

            if(selected.auto_response) {
                getResponse()
            }
            
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
        if(!submitted) {
            setSubmitted(true)

            console.log(formData)
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
        if(deleteConfirm) {
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

                        <div className='mb-4 flex items-center gap-2'>
                            <h1 className="text-xl font-medium">{category}</h1>
                            {
                                editMode &&
                                    <button
                                        onClick={() => setOpenModal(true)}
                                        className={`py-1.5 px-4 ${
                                            theme === "light"
                                                ? light.button_secondary
                                                : dark.button_secondary
                                        } rounded-full`}
                                    >
                                        New
                                    </button>
                            }
                            
                        </div>
                        
                        <div className='w-full md:flex items-start transition-all'>
                            <div className="md:w-72 w-full flex-shrink-0 mr-4 transition-all">
                                {
                                    loading ?
                                        <div className={`mt-4 px-6 py-3 rounded-sm overflow-hidden ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                            <p className='text-center'>Loading Categories</p>
                                        </div>
                                    :
                                    (menuItems.length === 0 && !loading) ?
                                        <div className={`mt-4 px-6 py-3 rounded-sm overflow-hidden ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                            <p className='text-center'>No Category Available</p>
                                        </div>
                                    :
                                        <div className={`mt-4 rounded-sm overflow-hidden ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                            <ul>
                                                {menuItems.map((item, i) => (
                                                    <li key={item.path} className="">
                                                        <div
                                                            className={`px-6 py-3 ${
                                                                activePage(item.path) && (theme === 'light' ? light.active_list_button : dark.active_list_button)
                                                            } transition-all cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button} ${item.dropdown.length > 0 && 'flex justify-between items-center'}
                                                            ${ (i+1) !== menuItems.length && 'border-b' } border-solid ${theme === 'light' ? light.border : dark.semiborder}`}
                                                            onClick={() => ((item.dropdown.length && mainDropdown(item)) > 0 ? toggleDropdown(item.path) : redirect(item.path, i))}
                                                        >
                                                            <div className="flex items-center">
                                                                {item.name}
                                                            </div>
                                                            {(item.dropdown.length > 0 && mainDropdown(item)) && (
                                                                <FontAwesomeIcon icon={openDropdown === item.path ? faChevronUp : faChevronDown} />
                                                            )}
                                                        </div>

                                                        <div
                                                            className={`overflow-hidden transition-all duration-300`}
                                                            style={{
                                                                maxHeight: openDropdown === item.path ? `${item.dropdown.length * 40}px` : '0px',
                                                            }}
                                                        >
                                                            <ul className="">
                                                                {item.dropdown.map((subItem, si) => (
                                                                    <li
                                                                        key={si}
                                                                        onClick={() => redirect(subItem.path, i)}
                                                                        className={`px-6 py-2 ${
                                                                            activeSubPage(item.path, subItem.path) && (theme === 'light' ? light.active_list_button : dark.active_list_button)
                                                                        } cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button}
                                                                        ${ (si+1) !== subItem.length && 'border-b' } ${ si === 0 && 'border-y' } border-solid ${theme === 'light' ? light.border : dark.semiborder} truncate`}
                                                                    >
                                                                        {
                                                                            subItem.method?.toLowerCase() === 'get' ?
                                                                                <span className='mr-2 text-green-600 font-semibold drop-shadow-[0_1.1px_0.1px_rgba(0,0,0,1)]'>GET</span> 
                                                                            : subItem.method?.toLowerCase() === 'post' ?
                                                                                <span className='mr-2 text-purple-600 font-semibold drop-shadow-[0_1.1px_0.1px_rgba(0,0,0,1)]'>POST</span> 
                                                                            : subItem.method?.toLowerCase() === 'patch' ?
                                                                                <span className='mr-2 text-yellow-500 font-semibold drop-shadow-[0_1.1px_0.1px_rgba(0,0,0,1)]'>PATCH</span> 
                                                                            : subItem.method?.toLowerCase() === 'delete' &&
                                                                                <span className='mr-2 text-red-600 font-semibold drop-shadow-[0_1.1px_0.1px_rgba(0,0,0,1)]'>DELETE</span> 
                                                                        }
                                                                        {subItem.name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                }          
                            </div>
                            
                            {
                                loading ?
                                <div className={`w-full mt-4 px-6 py-3 rounded-sm ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                        <p>Loading data...</p>
                                </div>
                                :
                                (menuItems.length === 0 && !loading) ?
                                <div className={`w-full mt-4 px-6 py-3 rounded-sm ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                        <p>No data...</p>
                                </div>
                                :
                                <div className={`w-full mt-4 px-6 py-3 rounded-sm ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                    {/* <p className={`truncate w-full mt-2 mb-8 ${theme === 'light' ? light.text : dark.text}`}>
                                        <span className={`${theme === 'light' ? light.link : dark.link}`}>Personal Website</span> / 
                                        <span className={`${theme === 'light' ? light.link : dark.link}`}> Overview</span> / 
                                        <span className={`${theme === 'light' ? light.link : dark.link}`}> My Profile</span>
                                    </p> */}

                                    {
                                        editMode ?
                                            <input
                                                type="text" 
                                                className="text-2xl mt-4 font-medium bg-transparent outline-none" 
                                                value={ selected?.name }
                                                onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                                                placeholder='Title'
                                            />
                                        : <h1 className="text-2xl mt-4 font-medium"> { selected?.name } </h1>
                                    }
                                    
                                    {
                                        editMode ?
                                            <textarea 
                                                className={`w-full bg-transparent outline-none mt-4 mb-4 custom-scroll ${theme === 'light' ? light.text : dark.text}`}
                                                rows={4}
                                                value={selected?.description ?? 'Description Here'}
                                                onChange={(e) => setSelected({ ...selected, description: e.target.value })}
                                                placeholder='Description'
                                            ></textarea>
                                        :   
                                        <p className={`whitespace-pre-wrap mt-4 mb-4 ${theme === 'light' ? light.text : dark.text}`}>
                                            { selected?.description ?? 'No Description.' }
                                        </p>
                                    }

                                    <h1 className="text-lg font-medium mt-8"><FontAwesomeIcon icon={faCode} className='mr-1'/> Request</h1>
                                    
                                    {
                                        editMode ?
                                        <>
                                            <div className="flex items-center mt-4">
                                                <input
                                                    id='token'
                                                    type={"checkbox"}
                                                    checked={selected?.token_required}
                                                    onChange={() => setSelected({...selected, token_required: !selected.token_required })}
                                                    className={`w-4 h-4 mr-2 outline-none`}
                                                />
                                                <label htmlFor={'token'} className="">Token Required</label>
                                            </div>

                                            <div className="flex flex-row flex-wrap gap-4 mt-4">
                                                {httpMethods.map((method) => (
                                                    <div key={method} className="flex items-center gap-1">
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
                                                        className="font-medium cursor-pointer"
                                                    >
                                                        {method}
                                                    </label>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className={`flex w-full truncate my-4 mt-2 px-6 py-3 rounded-full ${theme === 'light' ? light.semibackground : dark.semibackground} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                                {
                                                    selected?.method?.toLowerCase() === 'get' ?
                                                        <span className='mr-2 text-green-600 font-semibold'>GET</span> 
                                                    : selected?.method?.toLowerCase() === 'post' ?
                                                        <span className='mr-2 text-purple-600 font-semibold'>POST</span> 
                                                    : selected?.method?.toLowerCase() === 'patch' ?
                                                        <span className='mr-2 text-yellow-500 font-semibold'>PATCH</span> 
                                                    : selected?.method?.toLowerCase() === 'delete' &&
                                                        <span className='mr-2 text-red-600 font-semibold'>DELETE</span> 
                                                }
                                                <div className='flex'>
                                                    <a href={`${menuItems[selectedIndex]?.base_url}${selected?.endpoint ?? ''}`} target='_blank' className={``}>
                                                        {`${menuItems[selectedIndex]?.base_url}`}
                                                    </a>
                                                    <input
                                                        type="text" 
                                                        className="bg-transparent outline-none" 
                                                        value={ selected?.endpoint }
                                                        onChange={(e) => setSelected({ ...selected, endpoint: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                        :
                                        <div className={`w-full truncate my-4 mt-2 px-6 py-3 rounded-full ${theme === 'light' ? light.semibackground : dark.semibackground} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                            {
                                                selected?.method?.toLowerCase() === 'get' ?
                                                    <span className='mr-2 text-green-600 font-semibold'>GET</span> 
                                                : selected?.method?.toLowerCase() === 'post' ?
                                                    <span className='mr-2 text-purple-600 font-semibold'>POST</span> 
                                                : selected?.method?.toLowerCase() === 'patch' ?
                                                    <span className='mr-2 text-yellow-500 font-semibold'>PATCH</span> 
                                                : selected?.method?.toLowerCase() === 'delete' &&
                                                    <span className='mr-2 text-red-600 font-semibold'>DELETE</span> 
                                            }
                                            <a href={`${menuItems[selectedIndex]?.base_url}${selected?.endpoint ?? ''}`} target='_blank' className={`${theme === 'light' ? light.link : dark.link}`}>
                                                {`${menuItems[selectedIndex]?.base_url}${selected?.endpoint ?? ''}`}
                                            </a>
                                        </div>
                                    }
                                    
                                    {
                                        !editMode &&
                                            (selected?.token_required && !menuItems[selectedIndex]?.token) &&
                                                <div className={`sm:w-52 w-full my-4 px-6 py-3 rounded-full bg-red-600`}>
                                                    <FontAwesomeIcon icon={faTriangleExclamation} className='mr-2'/>
                                                    <span>Token is required!</span>
                                                </div>
                                    }

                                    <div className='flex justify-between items-center'>
                                        <h1 className="text-base font-medium">Request Payload</h1>
                                        <div className='flex items-center'>
                                            {
                                                (!editMode && formFields?.length > 0) &&
                                                <>
                                                    <button onClick={() => setToggle({ ...toggle, response: false })} className={`pr-2 disabled:cursor-not-allowed ${!toggle.response && (theme === 'light' ? light.active_list_button : dark.active_list_button)} ${theme === 'light' ? light.button : dark.button_third} rounded-l-full mr-[0.5px]`}>
                                                        Form
                                                    </button>
                                                    <button onClick={() => setToggle({ ...toggle, response: true })} className={`pl-2 disabled:cursor-not-allowed ${toggle.response && (theme === 'light' ? light.active_list_button : dark.active_list_button)} ${theme === 'light' ? light.button : dark.button_third} rounded-r-full`}>
                                                        Raw
                                                    </button>
                                                </>
                                            }
                                        </div>
                                    </div>
                                    
                                    {
                                        editMode ?
                                            <div className="grid md:grid-cols-2 gap-2 mt-4">
                                                <div>
                                                    {payloadForm.map((form, index) => (
                                                        <div key={index}>
                                                            <div className="pb-2.5">
                                                                <input
                                                                    type={"text"}
                                                                    className="bg-transparent outline-none"
                                                                    value={form.label}
                                                                    onChange={(e) => handleLabelChange(index, e.target.value)}
                                                                />

                                                                <div className="flex gap-[1px]">
                                                                <select
                                                                    className={`text-white text-center block rounded-tl-sm rounded-bl-sm mt-2 mb-1 py-2 px-4 ${
                                                                        theme === "light" ? light.input : dark.input
                                                                    }`} 
                                                                    onChange={(e) => handleTypeChange(index, e.target.value)}
                                                                >
                                                                    <option className="text-left" value="text">text</option>
                                                                    <option className="text-left" value="number">number</option>
                                                                    <option className="text-left" value="date">date</option>
                                                                    <option className="text-left" value="email">email</option>
                                                                </select>
                                                                <input
                                                                    type={form.type || "text"}
                                                                    placeholder={form.name}
                                                                    value={form.value}
                                                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                                                        className={`block w-full rounded-tr-sm rounded-br-sm mt-2 mb-1 py-2 px-4 ${
                                                                        theme === "light" ? light.input : dark.input
                                                                    }`}
                                                                />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <button
                                                        onClick={handleAddForm}
                                                        className={`w-full ${theme === "light" ? light.button : dark.button_third} rounded-full`}
                                                    >
                                                        New Field
                                                    </button>
                                                </div>
                                            </div>
                                        :
                                        <div className={`mt-4 ${!toggle.response ? 'block' : 'hidden'}`}>
                                            {
                                                formFields?.length > 0 ?
                                                    <DocumentForm
                                                        theme={theme}
                                                        fields={formFields}
                                                        onSubmit={handleSubmit}
                                                        initialValues={initialValues}
                                                        update={updateForm}
                                                        setUpdate={setUpdateForm}
                                                        disabled={submitted}
                                                        handleFormChange={handleFormChange}
                                                    /> 
                                                : 
                                                <p className={`whitespace-pre-wrap mt-4 mb-4 ${theme === 'light' ? light.text : dark.text}`}>
                                                    No payload available.
                                                </p>
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
                                        <button
                                            onClick={handleCopy}
                                            className="absolute top-4 right-4 z-40 bg-[#0e0e0e] text-white px-3 py-1 rounded-sm text-xs hover:bg-blue-600 focus:outline-none transition-all"
                                        >
                                            Copy
                                        </button>
                                        <CodeEditor
                                            theme={theme}
                                            inputValue={JSON.stringify(form, null, 2)}
                                            readOnly={true}
                                        />    
                                    </div>  

                                    <h1 className="text-lg font-medium mt-8"><FontAwesomeIcon icon={faCodePullRequest} className='mr-1'/> Response</h1>
                                    
                                    {
                                        editMode && 
                                        <div className="flex items-center mt-4">
                                            <input
                                                id='auto_response'
                                                type={"checkbox"}
                                                checked={selected?.auto_response}
                                                onChange={() => setSelected({...selected, auto_response: !selected.auto_response })}
                                                className={`w-4 h-4 mr-2 outline-none`}
                                            />
                                            <label htmlFor={'auto_response'} className="">Auto Response</label>
                                        </div>
                                    }
                                    
                                    {
                                        !selected?.auto_response || !editMode &&
                                            <div className='my-4'>
                                                <CodeEditor
                                                    theme={theme}
                                                    onChange={handleResponseCode}
                                                    inputValue={selected.response_result || JSON.stringify(responseData, null, 2)}
                                                    readOnly={!editMode}
                                                />
                                            </div>
                                    }                     
                                    
                                    {
                                        editMode && 
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    className={`disabled:cursor-not-allowed py-1.5 px-4 ${
                                                        theme === "light"
                                                            ? light.button_secondary
                                                            : dark.button_secondary
                                                    }
                                                    bg-red-600 hover:bg-red-700 rounded-full ml-2`}
                                                    onClick={() => setDeleteOpenModal(true)}
                                                >
                                                    Delete
                                                </button> 
                                                <button
                                                    type="submit"
                                                    className={`disabled:cursor-not-allowed py-1.5 px-4 ${
                                                        theme === "light"
                                                            ? light.button_secondary
                                                            : dark.button_secondary
                                                    } rounded-full ml-2`}
                                                    onClick={handleResponse}
                                                >
                                                    {save ? 'Saving' : 'Save'}
                                                </button> 
                                            </div>
                                    }
                                </div>
                            }

                            <div className="md:w-52 w-full flex-shrink-0 mr-4 transition-all">

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Documentation