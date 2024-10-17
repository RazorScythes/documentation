import React,{ useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faChevronRight, faChevronDown, faEye, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux'
import { uploadHero, getPortfolio } from "../../../actions/portfolio";
import { clearAlert } from '../../../actions/portfolio';
import { portfolio_selector } from '../../../constants';
import ImageModal from '../../ImageModal';
import Alert from '../../Alert';
import { Link } from 'react-router-dom';
const Hero = ({ user, portfolio, index, setIndex }) => {

    const dispatch = useDispatch()

    const alert = useSelector((state) => state.portfolio.alert)
    const variant = useSelector((state) => state.portfolio.variant)

    const [toggle, setToggle] = useState(false)
    const [active, setActive] = useState(0)
    
    const [submitted, setSubmitted] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [preview, setPreview] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [alertInfo, setAlertInfo] = useState({
        alert: '',
        variant: ''
    })

    const [image, setImage] = useState('')
    const [hero, setHero] = useState({
        id: user.result?._id,
        image: '',
        full_name: '',
        description: '',
        profession: [],
        animation: false,
        social_links: {},
        resume_link: ''
    })

    const [input, setInput] = useState({
        display_image: '',
        hero: {
            image: '',
            full_name: '',
            description: '',
            profession: '',
            animation: false
        },
        facebook: {
            link: '',
            show: false
        },
        twitter: {
            link: '',
            show: false
        },
        instagram: {
            link: '',
            show: false
        },
        github: {
            link: '',
            show: false
        },
        linkedin: {
            link: '',
            show: false
        },
    })

    // useEffect(() => {
    //     dispatch(getPortfolio({id: user.result?._id}))
    // }, [])

    useEffect(() => {
        setHero({
            ...hero,
            full_name: portfolio ? portfolio.full_name : '',
            description: portfolio ? portfolio.description : '',
            profession: portfolio ? portfolio.profession : [],
            animation: portfolio ? portfolio.animation : false,
            resume_link: portfolio ? portfolio.resume_link : 'false',
        })
        setInput({
            ...input,
            display_image: portfolio ? portfolio.image : '',
            facebook: {
                link: portfolio && portfolio.social_links?.facebook ? portfolio.social_links.facebook.link : '',
                show: portfolio && portfolio.social_links?.facebook ? portfolio.social_links.facebook.show : false
            },
            twitter: {
                link: portfolio && portfolio.social_links?.twitter ? portfolio.social_links.twitter.link : '',
                show: portfolio && portfolio.social_links?.twitter ? portfolio.social_links.twitter.show : false
            },
            instagram: {
                link: portfolio && portfolio.social_links?.instagram ? portfolio.social_links.instagram.link : '',
                show: portfolio && portfolio.social_links?.instagram ? portfolio.social_links.instagram.show : false
            },
            github: {
                link: portfolio && portfolio.social_links?.github ? portfolio.social_links.github.link : '',
                show: portfolio && portfolio.social_links?.github ? portfolio.social_links.github.show : false
            },
            linkedin: {
                link: portfolio && portfolio.social_links?.linkedin ? portfolio.social_links.linkedin.link : '',
                show: portfolio && portfolio.social_links?.linkedin ? portfolio.social_links.linkedin.show : false
            },
        })
        setSubmitted(false)
    }, [portfolio])

    useEffect(() => {
        if(alert && variant){
            setAlertInfo({ ...alertInfo, alert: alert, variant: variant })
            setShowAlert(true)
            window.scrollTo(0, 0)

            dispatch(clearAlert())
        }
    }, [alert, variant])

    const addProfession = () => {
        let duplicate = false

        if(input.hero.profession.length === 0) return;

        hero.profession.forEach(item => { if(input.hero.profession === item) duplicate = true })

        if(duplicate) { duplicate = false; return;}

        setHero({ ...hero, profession: hero.profession.concat(input.hero.profession )})

        setInput({ ...input, hero: { ...input.hero, profession: '' }})
    }

    const deleteProfession = (e) => {
        let arr = [...hero.profession]
        arr.splice(e.currentTarget.id, 1)
        setHero({ ...hero, profession: [...arr] })
    }

    const convertImage = async (e) => {
        setInput({...input, hero: { ...hero, image: e.target.value }})
        
        if(e.target.files[0] && e.target.files[0]['type'].split('/')[0] === 'image'){
            let convert = await toBase64(e.target.files[0])
            setHero({ ...hero, image:convert })
        }
        return
        setImage(e.target.files[0])
        setInput({...input, hero: { ...hero, image: e.target.value }})
        return
        
        if(e.target.files[0] && e.target.files[0]['type'].split('/')[0] === 'image'){
            let convert = await toBase64(e.target.files[0])
            setHero({ ...hero, image:convert })
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

                const MAX_SIZE = 700;
                const MAX_HEIGHT = 1050;
                const MAX_WIDTH = 700;

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

    const handleSubmit = () => {
        const social_media = {
            facebook: input.facebook,
            twitter: input.twitter,
            instagram: input.instagram,
            github: input.github,
            linkedin: input.linkedin
        }

        const form_list = hero
        form_list.social_links = social_media

        if(!submitted){
            dispatch(uploadHero(form_list))
            setSubmitted(true)
        }
        setHero({...hero, image: ''})
        setInput({...input, hero: {...input.hero, image: ''}})
    }

    return (
        <div className="container mx-auto relative px-0 sm:px-4 py-16">
            {
                alertInfo.alert && alertInfo.variant && showAlert &&
                    <Alert variants={alertInfo.variant} text={alertInfo.alert} show={showAlert} setShow={setShowAlert} />
            }
            <ImageModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                image={input.display_image}
                preview={preview}
                setPreview={setPreview}
            />
            <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
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
            <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
                <div className='flex flex-col'>
                    <label className="block mb-2 font-medium" htmlFor="file_input">Upload file</label>
                    <div className='flex flex-row'>
                        <input 
                            className="block w-full text-gray-800 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                            id="file_input" 
                            type="file"
                            accept="image/*" 
                            onChange={convertImage}
                            value={input.hero.image}
                        />
                        {
                            input.display_image && (
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
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">PNG, JPG</p>
                </div>
            </div>
            <div className='grid sm:grid-cols-2 grid-cols-1  gap-5 place-content-start mb-4'>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Full Name: </label>
                    <input 
                        type="text" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        onChange={(e) => setHero({...hero, full_name: e.target.value})}
                        value={hero.full_name}
                    />
                </div>
            </div>
            <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Professions: </label>
                    <div className='flex flex-row'>
                        <input 
                            type="text" 
                            className='w-full p-2 border border-solid border-[#c0c0c0]'
                            value={input.hero.profession}
                            onChange={(e) => setInput({...input, hero:{ ...input.hero, profession: e.target.value }})}
                        />
                        <div className='flex flex-row items-end'>
                            <button onClick={addProfession} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start text-white mb-2'>
                <div className='flex flex-row flex-wrap'>
                    {
                        hero.profession.length > 0 &&
                            hero.profession.map((item, i) => {
                                return (
                                    <div key={i} className='w-full flex flex-row p-2 py-3 bg-gray-800 mb-1'>
                                        <div className='w-1/2 flex flex-row items-center'>
                                            <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3"/> <p className='font-semibold'>{item}</p>
                                        </div>
                                        <div className='w-1/2 text-right'>
                                            <FontAwesomeIcon id={i} onClick={deleteProfession} icon={faTrash} className="mr-2 hover:cursor-pointer" />
                                        </div>
                                    </div>
                                )
                            })
                        }
                </div>
            </div>
            <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Portfolio description: </label>
                    <div className='flex flex-row'>
                        <textarea
                            name="message"
                            id="message"
                            cols="30"
                            rows="8"
                            placeholder="Message"
                            className="w-full p-2 border border-solid border-[#c0c0c0]"
                            onChange={(e) => setHero({...hero, description: e.target.value})}
                            value={ hero.description }
                        >
                        </textarea>
                    </div>
                </div>
            </div>
            <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
                <div className="flex items-center mb-4">
                    <input 
                        id="default-checkbox" 
                        type="checkbox" 
                        checked={hero.animation}
                        onChange={() => setHero({...hero, animation: !hero.animation})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="default-checkbox" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Typing Animation</label>
                </div>
            </div>
            <div className='grid md:grid-cols-2 grid-cols-1  gap-5 place-content-start'>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Resume Link: </label>
                    <input 
                        type="text" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        onChange={(e) => setHero({...hero, resume_link: e.target.value})}
                        value={hero.resume_link}
                    />
                </div>
            </div>

            <div className='grid sm:grid-cols-2 grid-cols-1  gap-5 place-content-start '>
                <h2 className='text-2xl font-bold text-gray-800 my-4'>Social Links</h2>        
            </div>

            <div className='grid md:grid-cols-3 grid-cols-3  gap-5 place-content-start mb-3'>
                <div className='flex flex-col justify-center md:col-span-1 col-span-2'>
                    <label className='font-semibold'> Facebook: </label>
                    <input 
                        type="text" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        onChange={(e) => setInput({...input, facebook: { ...input.facebook, link: e.target.value }})}
                        value={input.facebook.link}
                    />
                </div>
                <div className="flex items-center mt-5">
                    <input 
                        id="default-checkbox1" 
                        type="checkbox" 
                        checked={input.facebook.show}
                        onChange={(e) => setInput({...input, facebook: { ...input.facebook, show: !input.facebook.show }})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="default-checkbox1" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Show</label>
                </div>
            </div>
            <div className='grid md:grid-cols-3 grid-cols-3  gap-5 place-content-start mb-3'>
                <div className='flex flex-col justify-center md:col-span-1 col-span-2'>
                    <label className='font-semibold'> Twitter: </label>
                    <input 
                        type="text" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        onChange={(e) => setInput({...input, twitter: { ...input.twitter, link: e.target.value }})}
                        value={input.twitter.link}
                    />
                </div>
                <div className="flex items-center mt-5">
                    <input 
                        id="default-checkbox2" 
                        type="checkbox" 
                        checked={input.twitter.show}
                        onChange={(e) => setInput({...input, twitter: { ...input.twitter, show: !input.twitter.show }})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="default-checkbox2" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Show</label>
                </div>
            </div>
            <div className='grid md:grid-cols-3 grid-cols-3  gap-5 place-content-start mb-3'>
                <div className='flex flex-col justify-center md:col-span-1 col-span-2'>
                    <label className='font-semibold'> Instagram: </label>
                    <input 
                        type="text" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        onChange={(e) => setInput({...input, instagram: { ...input.instagram, link: e.target.value }})}
                        value={input.instagram.link}
                    />
                </div>
                <div className="flex items-center mt-5">
                    <input 
                        id="default-checkbox3" 
                        type="checkbox" 
                        checked={input.instagram.show}
                        onChange={(e) => setInput({...input, instagram: { ...input.instagram, show: !input.instagram.show }})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="default-checkbox3" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Show</label>
                </div>
            </div>
            <div className='grid md:grid-cols-3 grid-cols-3  gap-5 place-content-start mb-3'>
                <div className='flex flex-col justify-center md:col-span-1 col-span-2'>
                    <label className='font-semibold'> Github: </label>
                    <input 
                        type="text" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        onChange={(e) => setInput({...input, github: { ...input.github, link: e.target.value }})}
                        value={input.github.link}
                    />
                </div>
                <div className="flex items-center mt-5">
                    <input 
                        id="default-checkbox4" 
                        type="checkbox" 
                        checked={input.github.show}
                        onChange={(e) => setInput({...input, github: { ...input.github, show: !input.github.show }})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="default-checkbox4" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Show</label>
                </div>
            </div>
            <div className='grid md:grid-cols-3 grid-cols-3  gap-5 place-content-start mb-10'>
                <div className='flex flex-col justify-center md:col-span-1 col-span-2'>
                    <label className='font-semibold'> LinkedIn: </label>
                    <input 
                        type="text" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        onChange={(e) => setInput({...input, linkedin: { ...input.linkedin, link: e.target.value }})}
                        value={input.linkedin.link}
                    />
                </div>
                <div className="flex items-center mt-5">
                    <input 
                        id="default-checkbox5" 
                        type="checkbox" 
                        checked={input.linkedin.show}
                        onChange={(e) => setInput({...input, linkedin: { ...input.linkedin, show: !input.linkedin.show }})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="default-checkbox5" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Show</label>
                </div>
            </div>
            <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
                <button onClick={handleSubmit} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
                    {
                        !submitted ?
                        "Save"
                        :
                        <div className='flex flex-row justify-center items-center'>
                            Saving
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
    )
}

export default Hero