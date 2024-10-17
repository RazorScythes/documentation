import React,{ useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faChevronRight, faChevronDown, faClose, faEye } from "@fortawesome/free-solid-svg-icons";
import { portfolio_selector } from '../../../constants';
import { uploadServices } from "../../../actions/portfolio";
import { clearAlert } from '../../../actions/portfolio';
import { useDispatch, useSelector } from 'react-redux'
import { useDropzone } from 'react-dropzone'
import IconPicker from '../../IconPicker';
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

    const [toggle, setToggle] = useState(false)
    const [active, setActive] = useState(0)
    const [subActive, setSubActive] = useState(0)
    const [disable, setDisable] = useState(false)

    const [submitted, setSubmitted] = useState(false)

    const [services, setServices] = useState([])
    const [input, setInput] = useState({
        service_name: '',
        featured_image: ''
    })

    const [addInput, setAddInput] = useState({
        featured_image: '',
        service_name: '',
        featured_icon: '',
        service_description: '',
        gallery: []
    })
    const [icon, setIcon] = useState('a')

    const [focus, setFocus] = useState(0)

    useEffect(() => {
        if(addInput.gallery.length > 6){
            setAddInput({...addInput, gallery: addInput.gallery.slice(0,6)})
        }
    }, [addInput.gallery])

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
        setSubmitted(false)
        setDisable(false)
        setServices(portfolio ? portfolio : [])
    }, [portfolio])

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
        },
        multiple: true,
        onDrop: (acceptedFiles) => {    
            if (acceptedFiles.length > 0) {             
                Promise.all(acceptedFiles.map(file => {
                    return (new Promise((resolve,reject) => {
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
                    }));
                }))
                .then(images => {
                    setAddInput({...addInput, gallery: addInput.gallery.concat(images)})
                }, error => {        
                    console.error(error);
                });
            }
        }
    })

    const TextWithEllipsis = ({ text, limit = 55 }) => {
        if(!text) return <span>...</span>
        if (text.length > limit) {
          return <span>{text.slice(0, limit)}...</span>;
        }
        return <span>{text}</span>;
    }

    const convertImage = async (e) => {
        setInput({...input, featured_image: e.target.value })
        
        if(e.target.files[0] && e.target.files[0]['type'].split('/')[0] === 'image'){
            let convert = await toBase64(e.target.files[0])
            setAddInput({ ...addInput, featured_image: convert })
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

    const addService = () => {
        let duplicate = false

        if(input.service_name.length === 0) return;

        services.forEach(item => { if(input.service_name === item.service_name) duplicate = true })

        if(duplicate) { return }

        let data = { service_name: input.service_name, type_of_service: [] }

        setServices(services.concat(data))

        setInput({ ...input, service_name: ''})
    }

    const [removeImage, setRemoveImage] = useState([])
    const deleteService = (e) => {
        let arr = [...services]
        let remove_arr = []

        if(arr[e.currentTarget.id].type_of_service.length > 0){

            arr[e.currentTarget.id].type_of_service.forEach((data) => {
                remove_arr.push(data.featured_image)

                if(data.gallery.length === 0) return

                data.gallery.map((image) => {
                    remove_arr.push(image)
                })
            })

            if(remove_arr.length > 0) setRemoveImage(removeImage.concat(remove_arr))
        }

        arr.splice(e.currentTarget.id, 1)
        setServices([...arr])
        setFocus(focus >= 0 ? focus - 1 : 0)
    }

    const deleteServiceBox = (e) => {
        const index = e.currentTarget.id;
        const arr = [...services]
        let remove_arr = []

        remove_arr.push(arr[focus].type_of_service[index].featured_image)

        arr[focus].type_of_service[index].gallery.map((image) => {
            remove_arr.push(image)
        })

        if(remove_arr.length > 0) setRemoveImage(removeImage.concat(remove_arr))
        
        setServices(prevServices => {
          const updatedTypeOfService = [...prevServices[focus].type_of_service];
          updatedTypeOfService.splice(index, 1);
          const updatedService = {...prevServices[focus], type_of_service: updatedTypeOfService};
          const updatedServices = [...prevServices];
          updatedServices[focus] = updatedService;
          return updatedServices;
        });
    }

    const deleteImageOnGallery = (e, item) => {
        let arr = [...addInput.gallery]
        arr.splice(e.currentTarget.id, 1)
        setAddInput({...addInput, gallery: [...arr]})
    }

    const createService = () => {
        if(!addInput.featured_image || !addInput.service_name || !addInput.featured_icon || !addInput.service_description || !addInput.gallery.length === 0)
            return

        let updatedServices = [...services];
        let updatedTypeOfService = [...updatedServices[focus].type_of_service, addInput];
        updatedServices[focus] = {...updatedServices[focus], type_of_service: updatedTypeOfService};
        setServices(updatedServices);

        setAlertInfo({alert: 'Services created! Make sure to save it first before adding another.', variant: 'success'})

        setAddInput({
            featured_image: '',
            service_name: '',
            featured_icon: icon,
            service_description: '',
            gallery: []
        })

        setInput({ ...input, featured_image: '' })
        setDisable(true)
    }

    const handleSubmit = () => {
        if(!submitted){
            dispatch(uploadServices({
                id: user.result?._id,
                data: services,
                removeImage: removeImage
            }))
            setSubmitted(true)
            setRemoveImage([])
        }
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

                    <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                        <div className='flex flex-col w-full'>
                            <label className='font-semibold'> Service Name Header: </label>
                            <div className='flex flex-row'>
                                <input 
                                    type="text" 
                                    className='w-full p-2 border border-solid border-[#c0c0c0]'
                                    value={input.service_name}
                                    onChange={(e) => setInput({...input, service_name: e.target.value})}
                                />
                                <div className='flex flex-row items-end'>
                                    <button onClick={addService} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                        
                    <div className='grid grid-cols-1 gap-5 place-content-start text-white mb-2'>
                        <div className='flex flex-row flex-wrap'>
                            {
                                services.length > 0 &&
                                    services.map((item, i) => {
                                        return (
                                            <div key={i} className='w-full flex flex-row p-2 py-3 bg-gray-800 mb-1'>
                                                <div className='w-1/2 flex flex-col'>
                                                    <div className='w-full flex flex-row items-center'>
                                                        <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3"/> <p className='font-semibold'>{item.service_name}</p>
                                                    </div>
                                                    <div className='w-full flex flex-row items-center'>
                                                        <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3 opacity-0"/> <p className=''>Services Available ({item.type_of_service ? item.type_of_service.length : 0})</p>
                                                    </div>
                                                </div> 
                                                <div className='w-1/2 flex flex-row items-center justify-end'>      
                                                        <div  id={i} onClick={() => setFocus(i)} className='mr-3 flex items-center justify-center w-10 h-10 text-center bg-green-700 hover:bg-green-800 transition-all rounded-md hover:cursor-pointer'><FontAwesomeIcon icon={faEye} /></div>
                                                        <div id={i} onClick={deleteService} className='flex items-center justify-center w-10 h-10 text-center bg-[#CD3242] hover:bg-red-600 transition-all rounded-md hover:cursor-pointer'><FontAwesomeIcon icon={faTrash} /></div>
                                                </div>
                                            </div>
                                        )
                                    })
                            }
                        </div>
                    </div>

                    {/* <IconPicker /> */}
                    <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
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
                <div className="lg:w-1/2 md:w-1/2 w-full">
                    <div className='md:pl-8 pl-0'>
                        {
                            services[focus] &&
                                 <>
                                    <h2 className='text-3xl font-bold text-gray-800'>{services[focus].service_name}</h2>
                                    <div className='flex flex-row mb-4 my-2'>
                                        <button onClick={() => setSubActive(0)} className={`mr-4 ${subActive === 0 && 'underline'}`}>new</button> {" | "}
                                        <button onClick={() => setSubActive(1)} className={`ml-4 ${subActive === 1 && 'underline'}`}>created ({services[focus].type_of_service.length})</button>
                                    </div>
                                
                                    {
                                        subActive === 0 ?
                                        <>
                                            <div className='grid grid-cols-1 gap-5 place-content-start mb-4 mt-8'>
                                                <div className='flex flex-col'>
                                                    <label className="block mb-2 font-medium" htmlFor="file_input">Featured Image</label>
                                                    <input 
                                                        className="block w-full text-gray-800 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                                                        id="file_input" 
                                                        type="file"
                                                        accept="image/*" 
                                                        value={input.featured_image}
                                                        onChange={convertImage}
                                                    />
                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">PNG, JPG</p>
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                <div className='flex flex-col'>
                                                    <label className='font-semibold'> Service Name: </label>
                                                    <input 
                                                        type="text" 
                                                        className='p-2 border border-solid border-[#c0c0c0]'
                                                        value={addInput.service_name}
                                                        onChange={(e) => setAddInput({...addInput, service_name: e.target.value})}
                                                    />
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                <div className='flex flex-col'>
                                                    <label className='font-semibold'> Featured Icon: </label>
                                                    <IconPicker setIcon={setIcon} />
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                <div className='flex flex-col'>
                                                    <label className='font-semibold'> Services description: </label>
                                                    <div className='flex flex-row'>
                                                        <textarea
                                                            name="message"
                                                            id="message"
                                                            cols="30"
                                                            rows="8"
                                                            placeholder="Message"
                                                            className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                            value={addInput.service_description}
                                                            onChange={(e) => setAddInput({...addInput, service_description: e.target.value})}
                                                        >
                                                        </textarea>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-1 gap-5 place-content-start mb-4'>
                                                <label className='font-semibold mt-2'> Gallery: </label>
                                                <div className="flex flex-row items-center justify-center w-full">
                                                    <label {...getRootProps()} htmlFor="dropzone-file" className="flex flex-row items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                                            {
                                                                isDragActive ? 
                                                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Drop icons here</span></p>
                                                                :
                                                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload app icon</span> or drag and drop</p>
                                                            }
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 6 images 400x600px)</p>
                                                        </div>
                                                        <input accept="image/*" {...getInputProps()}/>
                                                    </label>
                                                </div> 
                                            </div>
                                            
                                            <div className='grid sm:grid-cols-3 grid-cols-2 gap-4 place-content-start mb-4'>
                                                {
                                                    addInput.gallery.map((item, i) => {
                                                        return (
                                                            <div className='flex items-center justify-center p-6 w-32 h-32 border-2 border-dashed border-gray-400 mx-auto relative'>
                                                                <img className="w-full h-full object-cover" src={item} alt="app icons"/>
                                                                <FontAwesomeIcon id={i} icon={faClose} onClick={(e) => deleteImageOnGallery(e, item)} className="absolute p-1 text-gray-400 cursor-pointer top-0 right-0 w-5 h-5"/>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                            <p className='text-gray-500 text-sm italic'>#You cannot edit this once you submitted this form</p>
                                            <div className='grid grid-cols-1 gap-5 place-content-start my-2'>
                                                <button disabled={disable} onClick={createService} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent disabled:bg-gray-600 disabled:border-gray-600 hover:text-gray-800 rounded-sm transition-all text-white p-2'>
                                                    Add
                                                </button>
                                            </div>
                                        </>
                                        :
                                        subActive === 1 &&
                                            services[focus].type_of_service.length > 0 ?
                                            <>
                                            {
                                                services[focus].type_of_service.map((item, i) => {
                                                    return (
                                                        <div key={i} className='w-full bg-gray-800 text-white rounded-md p-4 relative mb-2'>
                                                            <div className='grid ss:grid-cols-2 grid-cols-1 gap-4 place-content-start'>
                                                                <img 
                                                                    className='w-full h-48 object-cover rounded-md ss:mt-0 mt-4'
                                                                    src={item.featured_image} 
                                                                />
                                                                <div>
                                                                    <h2 className='text-xl font-semibold mb-2'><TextWithEllipsis limit={50} text={item.service_name} /></h2>
                                                                    <p className='mb-2'><TextWithEllipsis limit={100} text={item.service_description} /></p>
                                                                    <p className='mb-1'><span className='font-semibold'>Icon:</span> {item.featured_icon} </p>
                                                                    <p><span className='font-semibold'>Gallery:</span> ({item.gallery.length}) image{item.gallery.length > 1 && "s"}</p>
                                                                </div>
                                                            </div>
                                                            <button id={i} onClick={deleteServiceBox} className="absolute p-1 text-gray-400 cursor-pointer top-0 right-0"><FontAwesomeIcon className='w-6 h-6' icon={faClose}/></button>
                                                        </div>
                                                    )
                                                })
                                            }
                                            </>
                                            :
                                            <div className='flex items-center justify-center p-6 w-full h-32 border-2 border-dashed border-gray-400 mx-auto'>
                                                <p className='text-center font-poppins text-sm uppercase font-semibold text-gray-400'>There is no services to show <br/> Click <span onClick={() => setSubActive(0)} className='text-[#CD3242] hover:underline cursor-pointer'>here</span> to add new</p>
                                            </div>
                                    }
                                </>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Services