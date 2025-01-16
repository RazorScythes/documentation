import React, { useEffect, useState } from 'react'
import { main, dark, light } from '../../style';
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faCode, faCodePullRequest, faCog, faDashboard, faGlobe, faHeart, faHome, faListSquares, faMessage, faPlayCircle, faThumbsDown, faThumbsUp, faTriangleExclamation, faUser, faUserCircle, faUserEdit, faVideo } from '@fortawesome/free-solid-svg-icons';
import DocumentForm from '../Custom/DocumentForm';
import styles from "../../style";

const Documentation = ({ user, theme }) => {
    const navigate  = useNavigate()
    const location = useLocation();
    const { page, subpage } = useParams();
    const text = `Please refer to the API documentation for more information about available endpoints, request formats, and response formats.

Happy API integration!`;

    const [initialValues, setInitialValues] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [updateForm, setUpdateForm] = useState(false)
    const [form, setForm] = useState({})

    const [toggle, setToggle] = useState({
        response: false
    })

    const fields = [
        {
            label: "Name",
            name: "name",
            type: "text"
        },
        {
            label: "Email",
            name: "email",
            type: "email"
        }
    ];

    const menuItems = [
        { name: 'Overview', icon: faHome, path: '', dropdown: [] },
        { 
            name: 'Profile', 
            icon: faUserEdit, 
            path: 'profile', 
            dropdown: [
                { name: 'My Profile', path: 'profile', method: 'post' },
                { name: 'Change Password', path: 'profile/password', method: 'get' },
                { name: 'Activity Logs', path: 'profile/logs', method: 'patch' },
                { name: 'Activity Logs', path: 'profile/logs', method: 'delete' },
            ] 
        },
        { 
            name: 'Videos', 
            icon: faPlayCircle, 
            path: 'videos', 
            dropdown: [
                { name: 'My Videos', path: 'videos' },
                { name: 'Groups', path: 'videos/groups' },
                { name: 'Reports', path: 'videos/reports' },
            ] 
        },
        { name: 'Playlists', icon: faListSquares, path: 'playlist', dropdown: [] },
        { 
            name: 'Global List', 
            icon: faGlobe, 
            path: 'globallist', 
            dropdown: [
                { name: 'Tags', path: 'globallist' },
                { name: 'Categories', path: 'globallist/categories' },
                { name: 'Author', path: 'globallist/author' },
            ] 
        },
        { name: 'Favorites', icon: faHeart, path: 'favorites', dropdown: [] },
        { name: 'Messages', icon: faMessage, path: 'messages', dropdown: [] },
        { name: 'Settings', icon: faCog, path: 'settings', dropdown: [] },
    ];
    
    const [openDropdown, setOpenDropdown] = useState(null); 

    const toggleDropdown = (itemPath) => {
        setOpenDropdown(openDropdown === itemPath ? null : itemPath);
    };

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

    const redirect = (path) => {
        navigate(`/account/${path}`)
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

    return (
        <div className={`relative overflow-hidden ${main.font} ${theme === 'light' ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className={`file:lg:px-8 relative px-0 my-12`}>

                        <div className='w-full md:flex items-start transition-all'>
                            <div className="md:w-72 w-full flex-shrink-0 mr-4 transition-all">
                                <div className={`mt-4 rounded-sm overflow-hidden ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                    <ul>
                                        {menuItems.map((item, i) => (
                                            <li key={item.path} className="">
                                                <div
                                                    className={`px-6 py-3 ${
                                                        activePage(item.path) && (theme === 'light' ? light.active_list_button : dark.active_list_button)
                                                    } transition-all cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button} ${item.dropdown.length > 0 && 'flex justify-between items-center'}
                                                    ${ (i+1) !== menuItems.length && 'border-b' } border-solid ${theme === 'light' ? light.border : dark.semiborder}`}
                                                    onClick={() => (item.dropdown.length > 0 ? toggleDropdown(item.path) : redirect(item.path))}
                                                >
                                                    <div className="flex items-center">
                                                        {/* <FontAwesomeIcon icon={item.icon} className="mr-2" /> */}
                                                        {item.name}
                                                    </div>
                                                    {item.dropdown.length > 0 && (
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
                                                                key={subItem.path}
                                                                onClick={() => redirect(subItem.path)}
                                                                className={`px-6 py-2 ${
                                                                    activeSubPage(item.path, subItem.path) && (theme === 'light' ? light.active_list_button : dark.active_list_button)
                                                                } cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button}
                                                                ${ (si+1) !== subItem.length && 'border-b' } border-solid ${theme === 'light' ? light.border : dark.semiborder} truncate`}
                                                            >
                                                                {
                                                                    subItem.method?.toLowerCase() === 'get' ?
                                                                        <span className='mr-2 text-green-600 font-semibold'>GET</span> 
                                                                    : subItem.method?.toLowerCase() === 'post' ?
                                                                        <span className='mr-2 text-purple-600 font-semibold'>POST</span> 
                                                                    : subItem.method?.toLowerCase() === 'patch' ?
                                                                        <span className='mr-2 text-yellow-500 font-semibold'>PATCH</span> 
                                                                    : subItem.method?.toLowerCase() === 'delete' &&
                                                                        <span className='mr-2 text-red-600 font-semibold'>DELETE</span> 
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
                            </div>

                            <div className={`w-full mt-4 px-6 py-3 pb-5 rounded-sm ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                <p className={`truncate w-full mt-2 mb-8 ${theme === 'light' ? light.text : dark.text}`}>
                                    <span className={`${theme === 'light' ? light.link : dark.link}`}>Personal Website</span> / 
                                    <span className={`${theme === 'light' ? light.link : dark.link}`}> Overview</span> / 
                                    <span className={`${theme === 'light' ? light.link : dark.link}`}> My Profile</span>
                                </p>

                                <h1 className="text-2xl font-medium">My Profile</h1>
                                
                                <div className={`w-full truncate my-4 px-6 py-3 rounded-full ${theme === 'light' ? light.semibackground : dark.semibackground} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                    <span className='mr-2 text-purple-600 font-semibold'>POST</span> 
                                    <span className={`${theme === 'light' ? light.link : dark.link}`}>http://localhost:5011/total_complexibility</span>
                                </div>
                                
                                <p className={`whitespace-pre-wrap mt-4 mb-4 ${theme === 'light' ? light.text : dark.text}`}>
                                    {text}
                                </p>

                                <h1 className="text-lg font-medium mt-8"><FontAwesomeIcon icon={faCode} className='mr-1'/> Requests</h1>

                                <div className={`sm:w-52 w-full my-4 px-6 py-3 rounded-full bg-red-600`}>
                                    <FontAwesomeIcon icon={faTriangleExclamation} className='mr-2'/>
                                    <span>Token is required!</span>
                                </div>

                                <div className='flex justify-between items-center'>
                                    <h1 className="text-base font-medium">Example</h1>
                                    <div className='flex items-center'>
                                        <button onClick={() => setToggle({ ...toggle, response: false })} className={`pr-2 disabled:cursor-not-allowed ${!toggle.response && (theme === 'light' ? light.active_list_button : dark.active_list_button)} ${theme === 'light' ? light.button : dark.button_third} rounded-l-full mr-[0.5px]`}>
                                            Form
                                        </button>
                                        <button onClick={() => setToggle({ ...toggle, response: true })} className={`pl-2 disabled:cursor-not-allowed ${toggle.response && (theme === 'light' ? light.active_list_button : dark.active_list_button)} ${theme === 'light' ? light.button : dark.button_third} rounded-r-full`}>
                                            Raw
                                        </button>
                                    </div>
                                </div>

                                <div className={`mt-4 ${!toggle.response ? 'block' : 'hidden'}`}>
                                    <DocumentForm
                                        theme={theme}
                                        fields={fields}
                                        onSubmit={handleSubmit}
                                        initialValues={initialValues}
                                        update={updateForm}
                                        setUpdate={setUpdateForm}
                                        disabled={submitted}
                                        handleFormChange={handleFormChange}
                                    /> 
                                </div>
                                <div className={`${toggle.response ? 'block' : 'hidden'} relative w-full mb-4 mt-2 px-6 py-3 rounded-sm ${theme === 'light' ? light.semibackground : dark.semibackground} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                    <button
                                        onClick={handleCopy}
                                        className="absolute top-4 right-4 bg-[#0e0e0e] text-white px-3 py-1 rounded-sm text-xs hover:bg-blue-600 focus:outline-none transition-all"
                                    >
                                        Copy
                                    </button>
                                    <pre className="text-sm font-mono leading-6 text-white">
                                        {"{"}
                                        <div className="pl-8">{highlightJson(form)}</div>
                                        <br/>
                                        {"}"}
                                    </pre>
                                </div>           

                                <h1 className="text-lg font-medium mt-8"><FontAwesomeIcon icon={faCodePullRequest} className='mr-1'/> Response</h1>
                                
                                <div className={`relative w-full mb-4 mt-2 px-6 py-3 rounded-sm ${theme === 'light' ? light.semibackground : dark.semibackground} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                    {/* <button
                                        onClick={handleCopy}
                                        className="absolute top-4 right-4 bg-[#0e0e0e] text-white px-3 py-1 rounded-sm text-xs hover:bg-blue-600 focus:outline-none transition-all"
                                    >
                                        Copy
                                    </button>
                                    <pre className="text-sm font-mono leading-6 text-white">
                                        {"{"}
                                        <div className="pl-8">{highlightJson(form)}</div>
                                        <br/>
                                        {"}"}
                                    </pre> */}
                                    No output available.
                                </div>  
                            </div>

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