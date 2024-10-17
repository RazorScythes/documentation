import React,{ useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faChevronDown, faClose, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { portfolio_selector } from '../../../constants';
import { addExperience, updateExperience } from "../../../actions/portfolio";
import { convertDriveImageLink } from '../../Tools'
import { clearAlert } from '../../../actions/portfolio';
import { useDispatch, useSelector } from 'react-redux'
import Alert from '../../Alert';
import { Link } from 'react-router-dom';
const Services = ({ user, portfolio, index, setIndex }) => {

    const dispatch = useDispatch()

    const alert = useSelector((state) => state.portfolio.alert)
    const variant = useSelector((state) => state.portfolio.variant)
    
    const [showAlert, setShowAlert] = useState(false)
    const [alertInfo, setAlertInfo] = useState({
        alert: '',
        variant: ''
    })

    const [removeImage, setRemoveImage] = useState([])
    const [toggle, setToggle] = useState(false)
    const [active, setActive] = useState(0)
    const [subActive, setSubActive] = useState(0)
    const [disable, setDisable] = useState({
        add: false,
        update: false
    })

    const [submitted, setSubmitted] = useState({
        add: false,
        update: false
    })

    const [update, setUpdate] = useState({
        show: false,
        updating: false
    })

    const [services, setServices] = useState([])
    const [experience, setExperience] = useState([])

    const [input, setInput] = useState({
        id: user.result?._id,
        image_overlay: '',
        company_logo: '',
        company_name: '',
        year_start: '',
        year_end: '',
        position: '',
        company_location: '',
        remote_work: false,
        duties: '',
        link: ''
    })

    const [addInput, setAddInput] = useState({
        image_overlay: '',
        company_logo: ''
    })
    const [icon, setIcon] = useState('a')

    const [focus, setFocus] = useState(0)

    useEffect(() => {
        setAddInput({...addInput, featured_icon: icon})
    }, [icon])

    useEffect(() => {
        if(alertInfo.alert && alertInfo.variant){
            setShowAlert(true)
            window.scrollTo(0, 0)
        }
    }, [alertInfo.alert, alertInfo.variant])

    useEffect(() => {
        if(alert && variant){
            setAlertInfo({ ...alertInfo, alert: alert, variant: variant })
            setShowAlert(true)
            window.scrollTo(0, 0)

            dispatch(clearAlert())
        }
    }, [alert, variant])

    useEffect(() => {
        setSubmitted({...submitted, add: false})
        setDisable({...disable, add: false, update: false})
        setExperience(portfolio ? portfolio : [])
        setUpdate({...update, show: false, updating: false})
        setRemoveImage([])
        setInput({
            ...input,
            image_overlay: '',
            company_logo: '',
            company_name: '',
            year_start: '',
            year_end: '',
            position: '',
            company_location: '',
            remote_work: false,
            duties: '',
            link: ''
        })
        setAddInput({
            ...addInput,
            image_overlay: '',
            company_logo: ''
        })
    }, [portfolio])

    const convertImage = async (e) => {
        setAddInput({...addInput, image_overlay: e.target.value })
        
        if(e.target.files[0] && e.target.files[0]['type'].split('/')[0] === 'image'){
            let convert = await toBase64(e.target.files[0])
            setInput({...input, image_overlay: convert})
        }
    }

    const convertImageLogo = async (e) => {
        setAddInput({...addInput, company_logo: e.target.value })
        
        if(e.target.files[0] && e.target.files[0]['type'].split('/')[0] === 'image'){
            let convert = await toBase64(e.target.files[0])
            setInput({...input, company_logo: convert})
        }
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const image = new Image();
            image.src = event.target.result;
            image.onload = () => {
                const canvas = document.createElement("canvas");
                let width = image.width;
                let height = image.height;

                const MAX_SIZE = 400;
                const MAX_HEIGHT = 600;
                const MAX_WIDTH = 400;

                if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
                } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
                }

                if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0, width, height);

                const base64String = canvas.toDataURL(file.type, 0.7);
                resolve(base64String);
            };
        };
    });
   
    const deleteExperienceBox = (e) => {
        const arr = [...experience]
        let remove_arr = []

        if(arr[e.currentTarget.id].image_overlay && arr[e.currentTarget.id].image_overlay.includes('https://drive.google.com'))
            remove_arr.push(arr[e.currentTarget.id].image_overlay)

        if(arr[e.currentTarget.id].company_logo && arr[e.currentTarget.id].image_overlay.includes('https://drive.google.com'))
            remove_arr.push(arr[e.currentTarget.id].company_logo)

        if(remove_arr.length > 0) setRemoveImage(removeImage.concat(remove_arr))
        
        arr.splice(e.currentTarget.id, 1)
        setExperience([...arr])
        setUpdate({...update, show: true})
    }

    const handleSubmit = () => {
        if(!input.image_overlay || !input.company_logo || !input.company_name || !input.year_start || !input.year_end || !input.position || !input.company_location  || !input.duties || !input.link) return

        if(!submitted.add){
            dispatch(addExperience(input))
            setDisable({...disable, update: true})
            setSubmitted({...submitted, add: true})
        }
    }

    const getDomainName = (url) => {
        const pattern = /^(https?:\/\/)?(.+)/i;
        const domain = url.replace(pattern, '$2');
        return domain.replace(/\/.*$/, '');
    }

    const handleUpdate = () => {
        dispatch(updateExperience({
            id: user.result?._id,
            data: experience,
            removeImage: removeImage
        }))
        setUpdate({...update, updating: true})
        setDisable({...disable, add: true})
        setRemoveImage([])
    }

    return (
        <div className="container mx-auto relative px-0 sm:px-4 py-16">
            
            {
                alertInfo.alert && alertInfo.variant && showAlert &&
                    <Alert variants={alertInfo.variant} text={alertInfo.alert} show={showAlert} setShow={setShowAlert} />
            }

            <div className="md:flex items-start justify-center">
                <div className="lg:w-1/2 md:w-1/2 w-full">
                    <div className='grid grid-cols-1 gap-5 place-content-start mb-4'>
                        <div className='relative'>
                            <div className='flex flex-row items-center relative'>
                                <h2 className='text-3xl font-bold text-gray-800 mb-12'>{ portfolio_selector[index] }</h2>
                                <FontAwesomeIcon onClick={() => setToggle(!toggle)} icon={faChevronDown} className="absolute mt-1 right-0 top-0 bg-gray-800 text-white border border-solid border-gray-800 p-[7px] hover:bg-transparent hover:text-gray-800 transition-all cursor-pointer rounded-sm ml-4 w-4 h-4"/>
                            </div>
                            <div
                                className={`${
                                !toggle ? "hidden" : "flex"
                                } p-6 bg-gray-800 absolute top-8 right-0  mx-0 my-2 min-w-[140px] rounded-xl sidebar text-sm font-poppins`}
                            >
                                <ul className="list-none flex justify-end items-start flex-1 flex-col">
                                    {
                                        portfolio_selector.map((selector, i) => {
                                            return(
                                                <Link to={`/account/portfolio?navigation=${selector.toLowerCase()}`} key={i}>
                                                    <li
                                                        onClick={() => {
                                                            setActive(i)
                                                            setIndex(i)
                                                        }}
                                                        className={`cursor-pointer ${index === i ? 'text-[#FFFF00]' : 'text-white'} hover:text-blue-200 ${portfolio_selector.length - 1 === i ? 'mb-0' : 'mb-4'}`}
                                                    >
                                                        <FontAwesomeIcon icon={faChevronRight} className="mr-2" />
                                                        <a href={`#`}>{selector}</a>
                                                    </li>
                                                </Link>
                                            )   
                                        })
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
                        <div className='flex flex-col'>
                            <label className="block mb-2 font-medium" htmlFor="file_input">Image Overlay</label>
                            <input 
                                className="block w-full text-gray-800 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                                id="file_input" 
                                type="file"
                                accept="image/*" 
                                value={addInput.image_overlay}
                                onChange={convertImage}
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className="block mb-2 font-medium" htmlFor="file_input">Company Logo</label>
                            <input 
                                className="block w-full text-gray-800 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                                id="file_input" 
                                type="file"
                                accept="image/*" 
                                value={addInput.company_logo}
                                onChange={convertImageLogo}
                            />
                        </div>
                    </div>
                    <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
                        <div className='flex flex-col'>
                            <label className='font-semibold'> Start Date </label>
                            <input 
                                type="date" 
                                className='p-2 border border-solid border-[#c0c0c0]'
                                value={input.year_start}
                                onChange={(e) => setInput({...input, year_start: e.target.value})}
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='font-semibold'> End Date </label>
                            <input 
                                type="date" 
                                className='p-2 border border-solid border-[#c0c0c0]'
                                value={input.year_end}
                                onChange={(e) => setInput({...input, year_end: e.target.value})}
                            />
                        </div>
                    </div>   
                    <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
                        <div className='flex flex-col'>
                            <label className='font-semibold'> Company Name: </label>
                            <input 
                                type="text" 
                                className='p-2 border border-solid border-[#c0c0c0]'
                                value={input.company_name}
                                onChange={(e) => setInput({...input, company_name: e.target.value})}
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='font-semibold'> Position: </label>
                            <input 
                                type="text" 
                                className='p-2 border border-solid border-[#c0c0c0]'
                                value={input.position}
                                onChange={(e) => setInput({...input, position: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-2  gap-5 place-content-start mb-4'>
                        <div className='flex flex-col'>
                            <label className='font-semibold'> Company Location: </label>
                            <input 
                                type="text" 
                                className='p-2 border border-solid border-[#c0c0c0]'
                                value={input.company_location}
                                onChange={(e) => setInput({...input, company_location: e.target.value})}
                            />
                        </div>
                        <div className="flex items-center mb-4 pt-8">
                            <input 
                                id="default-checkbox" 
                                type="checkbox" 
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                checked={input.remote_work}
                                onChange={(e) => setInput({...input, remote_work: !input.remote_work})}
                            />
                            <label htmlFor="default-checkbox" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Remote Work</label>
                        </div>
                    </div>
                    <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                        <div className='flex flex-col'>
                            <label className='font-semibold'> Duty / Responsibilities: </label>
                            <div className='flex flex-row'>
                                <textarea
                                    name="message"
                                    id="message"
                                    cols="30"
                                    rows="8"
                                    placeholder="Message"
                                    className="w-full p-2 border border-solid border-[#c0c0c0]"
                                    value={input.duties}
                                    onChange={(e) => setInput({...input, duties: e.target.value})}
                                >
                                </textarea>
                            </div>
                        </div>
                    </div>
                    <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                        <div className='flex flex-col'>
                            <label className='font-semibold'> Company Website Link: </label>
                            <input 
                                type="text" 
                                className='p-2 border border-solid border-[#c0c0c0]'
                                value={input.link}
                                onChange={(e) => setInput({...input, link: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                        <button disabled={disable.add} onClick={handleSubmit} className='disabled:bg-gray-600 disabled:border-gray-600 float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
                            {
                                !submitted.add ?
                                "Add"
                                :
                                <div className='flex flex-row justify-center items-center'>
                                    Adding
                                    <div role="status">
                                        <svg aria-hidden="true" class="w-5 h-5 ml-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                        </svg>
                                        <span class="sr-only">Loading...</span>
                                    </div>
                                </div>
                            }
                        </button>
                    </div>
                </div>

                <div className="lg:w-1/2 md:w-1/2 w-full">
                    <div className='md:pl-8 pl-0'>
                            <div className='grid grid-cols-2  gap-5 place-content-start md:mb-16 mb-4 md:mt-0 mt-8'>
                                <h2 className='text-3xl font-bold text-gray-800'>Created ({experience.length})</h2>
                                {
                                    update.show &&
                                        <button disabled={disable.update} onClick={handleUpdate} className='disabled:bg-gray-600 disabled:border-gray-600 font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
                                            {
                                                !update.updating ?
                                                    "Update Changes"
                                                    :
                                                    <div className='flex flex-row justify-center items-center'>
                                                        Updating
                                                        <div role="status">
                                                            <svg aria-hidden="true" class="w-5 h-5 ml-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                                            </svg>
                                                            <span class="sr-only">Loading...</span>
                                                        </div>
                                                    </div>
                                            }
                                        </button>
                                }
                            </div>
                            
                            {
                                experience.length > 0 ?
                                <>
                                    {
                                        experience.map((item, i) => {
                                            return (
                                                <div key={i} className='w-full bg-gray-800 text-white rounded-md p-4 py-8 relative mb-2'>
                                                    {
                                                        item.image_overlay &&
                                                        <>
                                                            <div style={{ backgroundImage: `url(${item.image_overlay})` }} className="absolute inset-0 opacity-80 rounded-md bg-cover bg-center"></div>
                                                            <div className="absolute inset-0 bg-black opacity-80 rounded-md"></div>
                                                        </>
                                                    }
                                                    
                                                    <div className='flex flex-col text-center relative'>
                                                        <h2 className='text-2xl font-bold mb-2'>{item.year_start.split('-')[0]} - {item.year_end.split('-')[0]}</h2>
                                                        <img
                                                            src={convertDriveImageLink(item.company_logo)}
                                                            className="w-16 h-16 mx-auto object-cover"
                                                        />
                                                        <h2 className='text-2xl font-bold capitalize'>{item.position}</h2>
                                                        <p className="text-[#CD3242] font-semibold capitalize mb-8">{item.company_location} <span className='font-normal text-gray-600'>{item.remote_work ? '(remote)' : '(onsite)'}</span></p>
                                                        <a 
                                                            target="_blank"
                                                            href={`https://${getDomainName(item.link)}`} 
                                                            className="sm:w-1/2 md:text-lg text-base font-poppins font-semibold transition-all ease-in-out delay-50 hover:text-[#CD3242] self-center"
                                                        >
                                                                <FontAwesomeIcon icon={faArrowRight} className="mr-4"/>
                                                                Goto Website
                                                        </a>
                                                    </div>
                                                    <button id={i} onClick={deleteExperienceBox} className="absolute p-1 text-gray-400 cursor-pointer top-0 right-0"><FontAwesomeIcon className='w-6 h-6' icon={faClose}/></button>
                                                </div>
                                            )
                                        })
                                    }
                                </>
                                :
                                <div className='flex items-center justify-center p-6 w-full h-32 border-2 border-dashed border-gray-400 mx-auto'>
                                    <p className='text-center font-poppins text-sm uppercase font-semibold text-gray-400'>There is no experience to show <br/> add new to show here</p>
                                </div>
                            }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Services