import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { useParams } from 'react-router-dom'
import { Header } from './index'
import { Link } from 'react-router-dom'
import { updateProfile, clearAlert, updatePassword, sendVerificationEmail, updateOptions } from '../../actions/settings';
import ImageModal from '../ImageModal';
import Alert from '../Alert';
import SideAlert from '../SideAlert';
import styles from '../../style'

const Index = ({ user, settings, submitted, setSubmitted }) => {
    const dispatch = useDispatch()

    const sendEmail = () => {
        if(!submitted) {
            dispatch(sendVerificationEmail({id: user.result?._id, email: settings.email}))
            setSubmitted(true)
        }
    }

    return (
        <div>
            <div className='mb-6 grid xs:grid-cols-2 grid-cols-1 px-8 py-4 border border-solid border-[#CAD5DF]'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-800 mb-4'>Update Profile</h2>
                    <p className='text-gray-700 text-base mb-2 font-semibold'>Manage your avatar, name and email</p>
                </div>
                <div className='xs:flex xs:items-center xs:justify-end'>
                    <Link to="/account/settings/update_profile">
                        <button className="w-full bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-8 border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out">
                            Manage
                        </button>
                    </Link>
                </div>
            </div>
            <div className='mb-6 grid xs:grid-cols-2 grid-cols-1 px-8 py-4 border border-solid border-[#CAD5DF]'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-800 mb-4'>Change Password</h2>
                    <p className='text-gray-700 text-base mb-2 font-semibold'>Manage your password.</p>
                </div>
                <div className='xs:flex xs:items-center xs:justify-end'>
                    <Link to="/account/settings/change_password">
                        <button className="w-full bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-8 border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out">
                            Manage
                        </button>
                    </Link>
                </div>
            </div>
            <div className='mb-6 grid xs:grid-cols-2 grid-cols-1 px-8 py-4 border border-solid border-[#CAD5DF]'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-800 mb-4'>Options</h2>
                    <p className='text-gray-700 text-base mb-2 font-semibold'>Manage your safe content etc.</p>
                </div>
                <div className='xs:flex xs:items-center xs:justify-end'>
                    <Link to="/account/settings/options">
                        <button className="w-full bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-8 border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out">
                            Manage
                        </button>
                    </Link>
                </div>
            </div>
            <div className='mb-6 grid xs:grid-cols-2 grid-cols-1 px-8 py-4 border border-solid border-[#CAD5DF]'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-800 mb-4'>Activity Logs</h2>
                    <p className='text-gray-700 text-base mb-2 font-semibold'>View your activity logs.</p>
                </div>
                <div className='xs:flex xs:items-center xs:justify-end'>
                    <Link to="/account/logs">
                        <button className="w-full bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-8 border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out">
                            View
                        </button>
                    </Link>
                </div>
            </div>
            {
                (settings?.verified) ?
                    <div className='mb-6 grid xs:grid-cols-2 grid-cols-1 px-8 py-4 border border-solid border-[#CAD5DF]'>
                        <div>
                            <h2 className='text-2xl font-bold text-gray-800 mb-4'>Verification:</h2>
                            <p className='text-gray-700 text-base mb-2 font-semibold'>Your account is now verified!</p>
                        </div>
                        <div className='xs:flex xs:items-center xs:justify-end'>
                            
                        </div>
                    </div>
                    :
                    <div className='mb-6 grid xs:grid-cols-2 grid-cols-1 px-8 py-4 border border-solid border-[#CAD5DF]'>
                        <div>
                            <h2 className='text-2xl font-bold text-gray-800 mb-4'>Verification:</h2>
                            <p className='text-gray-700 text-base mb-2 font-semibold'>Account not verified.</p>
                        </div>
                        <div className='xs:flex xs:items-center xs:justify-end'>
                            <button onClick={() => sendEmail()}  className="xs:w-auto w-full bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-8 border border-[#CAD5DF] rounded transition-colors duration-300 ease-in-out">
                                Verify
                            </button>
                        </div>
                    </div>
            }
        </div>
    )
}

const Update_Profile = ({ user, profile }) => {
    const dispatch = useDispatch()

    const [submitted, setSubmitted] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [preview, setPreview] = useState(false)
    const [removeImage, setRemoveImage] = useState([])
    const [image, setImage] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [file, setFile] = useState('')

    useEffect(() => {
        setImage(profile ? profile.avatar : '')
        setEmail(profile ? profile.email : '')
        setName(profile ? profile.full_name : '')
        setSubmitted(false)
    }, [profile])

    const fileToDataUri = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target.result)
        };
        reader.readAsDataURL(file);
    })

    const cropImage = (file) => {
        if(!file) {
            return;
        }

        if(image && image.includes('https://drive.google.com')) setRemoveImage(removeImage.concat(image))

        fileToDataUri(file)
            .then(dataUri => {
              setImage(dataUri)
              setOpenModal(true)
            })
    }

    function isEmail(text) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(text);
    }

    const handleSubmit = () => {
        if(!isEmail(email)) return

        if(!submitted) {
            dispatch(updateProfile({
                id: user.result?._id,
                image: image,
                full_name: name,
                email: email,
                removeImage: removeImage
            }))
            setSubmitted(true)
        }
    }

    return (
        <div>
            <ImageModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                image={image}
                setImage={setImage}
                preview={preview}
                setPreview={setPreview}
            />
            <div className='grid md:grid-cols-2 grid-cols-1 mb-12'>
                <div className='flex flex-row items-center justify-between'>
                    <h2 className='text-3xl font-bold text-gray-800'>Update Profile</h2>
                    <Link to="/account/settings">
                        <button className=" bg-gray-800 hover:bg-gray-100  hover:text-gray-800 text-gray-100 font-semibold my-8 py-2 px-8 border border-gray-800 rounded transition-colors duration-300 ease-in-out">
                            Back
                        </button>
                    </Link>
                </div>
            </div>
            <div className='mb-6'>
                <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
                    <div className='flex flex-col'>
                            <label className="block mb-2 font-medium" htmlFor="file_input">Avatar</label>
                            <div className='flex flex-row'>
                                <input 
                                    className="block w-full text-gray-800 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                                    id="file_input" 
                                    type="file"
                                    accept="image/*" 
                                    value={file}
                                    onChange={(e) => {
                                        setFile(e.target.value)
                                        cropImage(e.target.files[0] || null)
                                    }}
                                />
                                {
                                    image && (
                                        <div className='flex flex-row items-end'>
                                            <button 
                                                onClick={() => {
                                                    setPreview(true)
                                                    setOpenModal(true)
                                                }} 
                                                className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-1'><FontAwesomeIcon icon={faEye} className="mx-4"/>
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                    </div>
                </div>
                <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
                    <div className='flex flex-col'>
                        <label className='font-semibold'> Full Name: </label>
                        <input 
                            type="text" 
                            className='p-2 border border-solid border-[#c0c0c0]'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                    </div>
                </div>
                <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-8'>
                    <div className='flex flex-col'>
                        <label className='font-semibold'> Email: </label>
                        <input 
                            type="email" 
                            className='p-2 border border-solid border-[#c0c0c0]'
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                    </div>
                </div>
                <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
                    <button onClick={handleSubmit} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
                        {
                            !submitted ?
                            "Update"
                            :
                            <div className='flex flex-row justify-center items-center'>
                                Updating
                                <div role="status">
                                    <svg aria-hidden="true" class="w-5 h-5 ml-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                    </svg>
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

const Change_Password = ({ user, alert }) => {

    const dispatch = useDispatch()

    const [submitted, setSubmitted] = useState(false)
    const [password, setPassword] = useState({
        old: '',
        new:'',
        confirm: ''
    })

    useEffect(() => {
        if(alert) {
            setPassword({
                old: '',
                new:'',
                confirm: ''
            })
            setSubmitted(false)
        }
    }, [alert])

    const handleSubmit = () => {
        if(password.new !== password.confirm || (!password.old || !password.new || !password.confirm)) return
        
        if(!submitted) {
            dispatch(updatePassword({
                id: user.result?._id,
                password: password
            }))
            setSubmitted(true)
        }
    }

    return (
        <div>
            <div className='grid md:grid-cols-2 grid-cols-1 mb-12'>
                <div className='flex flex-row items-center justify-between'>
                    <h2 className='text-3xl font-bold text-gray-800'>Change Password</h2>
                    <Link to="/account/settings">
                        <button className=" bg-gray-800 hover:bg-gray-100  hover:text-gray-800 text-gray-100 font-semibold my-8 py-2 px-8 border border-gray-800 rounded transition-colors duration-300 ease-in-out">
                            Back
                        </button>
                    </Link>
                </div>
            </div>
            <div className='grid md:grid-cols-2 grid-cols-1 mb-6'>
            <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                    <div className='flex flex-col'>
                        <label className='font-semibold'> Current Password: </label>
                        <input 
                            type="password" 
                            className='p-2 border border-solid border-[#c0c0c0]'
                            onChange={(e) => setPassword({...password, old: e.target.value})}
                            value={password.old}
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='font-semibold'> New Password: </label>
                        <input 
                            type="password" 
                            className='p-2 border border-solid border-[#c0c0c0]'
                            onChange={(e) => setPassword({...password, new: e.target.value})}
                            value={password.new}
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='font-semibold'> Confirm Password: </label>
                        <input 
                            type="password" 
                            className='p-2 border border-solid border-[#c0c0c0]'
                            onChange={(e) => setPassword({...password, confirm: e.target.value})}
                            value={password.confirm}
                        />
                    </div>
                    <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                        <button onClick={handleSubmit} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
                            {
                                !submitted ?
                                "Update"
                                :
                                <div className='flex flex-row justify-center items-center'>
                                    Updating
                                    <div role="status">
                                        <svg aria-hidden="true" class="w-5 h-5 ml-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Options = ({ user, settings, alert }) => {
    
    const dispatch = useDispatch()
    
    const [strict, setStrict] = useState(settings?.safe_content)

    const changeStrict = () => {
        if(settings?.verified) {
            setStrict(!strict)
        }
    }

    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        if(alert) {
            setSubmitted(false)
        }
    }, [alert])

    useEffect(() => {
        if(settings) setStrict(settings?.safe_content)
    }, [settings])

    const handleSubmit = () => {
        
        if(!submitted) {
            dispatch(updateOptions({
                id: user.result?._id,
                strict: strict
            }))
            setSubmitted(true)
        }
    }

    return (
        <div>
            <div className='grid md:grid-cols-2 grid-cols-1 mb-12'>
                <div className='flex flex-row items-center justify-between'>
                    <h2 className='text-3xl font-bold text-gray-800'>Options</h2>
                    <Link to="/account/settings">
                        <button className=" bg-gray-800 hover:bg-gray-100  hover:text-gray-800 text-gray-100 font-semibold my-8 py-2 px-8 border border-gray-800 rounded transition-colors duration-300 ease-in-out">
                            Back
                        </button>
                    </Link>
                </div>
            </div>
            <div className='mb-6'>
                <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
                    <div className="flex items-center mb-1">
                        <input 
                            id="default-checkbox" 
                            type="checkbox" 
                            checked={strict}
                            onChange={() => changeStrict()}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="default-checkbox" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Safe Content</label>
                    </div>
                </div>
                <p className='text-gray-500 text-sm italic mb-12'>You may be access to more fringe results content if not checked. (Need account verify to disable)</p>
                <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
                    <button onClick={handleSubmit} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
                        {
                            !submitted ?
                            "Update"
                            :
                            <div className='flex flex-row justify-center items-center'>
                                Updating
                                <div role="status">
                                    <svg aria-hidden="true" class="w-5 h-5 ml-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                    </svg>
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

const Settings = ({ user, settings }) => {
    const dispatch = useDispatch()

    const alert = useSelector((state) => state.settings.alert)
    const variant = useSelector((state) => state.settings.variant)
    const heading = useSelector((state) => state.settings.heading)
    const paragraph = useSelector((state) => state.settings.paragraph)

    const [submitted, setSubmitted] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [alertInfo, setAlertInfo] = useState({
        alert: '',
        variant: ''
    })
    const [message, setMessage] = useState({
        heading: '',
        paragraph: ''
    })
    const [active, setActive] = useState(false)

    const { options } = useParams();

    useEffect(() => {
        if(alert || variant){
            setAlertInfo({ ...alertInfo, alert: alert, variant: variant })
            setShowAlert(true)
            if(heading) {
                setMessage({...message, heading: heading, paragraph: paragraph})
                setActive(true)
            }
            setSubmitted(false)
            window.scrollTo(0, 0)
            dispatch(clearAlert())
        }
    }, [alert, variant, heading, paragraph])

    return (
        <div className="relative bg-white">   
            <SideAlert
                variants={alertInfo.variant}
                heading={message.heading}
                paragraph={message.paragraph}
                active={active}
                setActive={setActive}
            />
            <Header 
                heading='Settings'
                description="Select a website to manage, or create a new one from scratch."
                button_text="Explore Now!"
                button_link={`#`}
            />
            <div className="relative ">   
                <div className={`${styles.marginX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className="container mx-auto relative px-0 sm:px-4 py-16">
                            {
                                alertInfo.alert && alertInfo.variant && showAlert &&
                                    <Alert variants={alertInfo.variant} text={alertInfo.alert} show={showAlert} setShow={setShowAlert} />
                            }
                            <div className='grid md:grid-cols-1 grid-cols-1 gap-5 place-content-start mb-4'>
                                {
                                    options === 'update_profile' ?
                                        <Update_Profile user={user} profile={settings} />
                                    :
                                    options === 'change_password' ?
                                        <Change_Password user={user} alert={alert}/>
                                    :
                                    options === 'options' ?
                                        <Options user={user} settings={settings} alert={alert}/>
                                    :
                                    options === 'logs' ?
                                        <Options user={user} settings={settings} alert={alert}/>
                                    :
                                    options === '' ?
                                        <Index user={user} settings={settings} submitted={submitted} setSubmitted={setSubmitted} />
                                    :
                                        <Index user={user} settings={settings} submitted={submitted} setSubmitted={setSubmitted} />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>  
        </div>
    )
}

export default Settings