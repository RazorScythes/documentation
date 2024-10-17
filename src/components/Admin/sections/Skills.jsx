import React,{ useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faChevronRight, faChevronDown, faClose, faEye, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux'
import { uploadSkills, getPortfolio } from "../../../actions/portfolio";
import { convertDriveImageLink } from '../../Tools'
import { clearAlert } from '../../../actions/portfolio';
import { useDropzone } from 'react-dropzone'
import { portfolio_selector } from '../../../constants';
import ImageModal from '../../ImageModal';
import Alert from '../../Alert';
import { Link } from 'react-router-dom';

const getRandomColor = (hue) => {
    let h, s, l;
    switch (hue) {
      case 1:
        h = 0;
        s = Math.floor(Math.random() * 50) + 50;
        l = Math.floor(Math.random() * 40) + 60;
        break;
      case 2:
        h = 240;
        s = Math.floor(Math.random() * 50) + 50;
        l = Math.floor(Math.random() * 40) + 60;
        break;
      case 3:
        h = 300;
        s = Math.floor(Math.random() * 50) + 50;
        l = Math.floor(Math.random() * 40) + 60;
        break;
      case 4:
        h = 60;
        s = Math.floor(Math.random() * 50) + 50;
        l = Math.floor(Math.random() * 40) + 60;
        break;
    }
  
    const color = `hsl(${h}, ${s}%, ${l}%)`;
    const hexColor = convertHSLToHex(color);
    return hexColor;
}
  
const convertHSLToHex = (color) => {
    const [h, s, l] = color
      .replace(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g, '$1 $2 $3')
      .split(' ');
  
    const hue = Number(h);
    const saturation = Number(s) / 100;
    const lightness = Number(l) / 100;
  
    const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = lightness - c / 2;
  
    let r, g, b;
    if (hue >= 0 && hue < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (hue >= 60 && hue < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (hue >= 120 && hue < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (hue >= 180 && hue < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (hue >= 240 && hue < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }
  
    r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    b = Math.round((b + m) * 255).toString(16).padStart(2, '0');
  
    return `#${r}${g}${b}`;
}

const getRandomNumber = (min = 1, max = 4) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const Skills = ({ user, portfolio, index, setIndex }) => {

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

    const [skills, setSkills] = useState({
        id: user.result?._id,
        image: '',
        icons: [],
        project_completed: 0,
        heading: '',
        description: '',
        skill: [],
        removed_icons: []
    })

    const [input, setInput] = useState({
        display_image: '',
        skill: {
            image: '',
            skill_name: '',
            percentage: 0,
            hex: ''
        }
    })

    // useEffect(() => {
    //     dispatch(getPortfolio({id: user.result?._id}))
    // }, [])

    useEffect(() => {
        setSubmitted(false)
        setSkills({
            ...skills,
            full_name: portfolio ? portfolio.full_name : '',
            description: portfolio ? portfolio.description : '',
            profession: portfolio ? portfolio.profession : [],
            animation: portfolio ? portfolio.animation : '',
            icons: portfolio ? portfolio.icons : [],
            project_completed: portfolio ? portfolio.project_completed : 0,
            heading: portfolio ? portfolio.heading : '',
            skill: portfolio ? portfolio.skill : []
        })
        setInput({
            ...input,
            display_image: portfolio ? portfolio.image : '',
        })
    }, [portfolio])

    useEffect(() => {
        if(alert && variant){
            setAlertInfo({ ...alertInfo, alert: alert, variant: variant })
            setShowAlert(true)
            window.scrollTo(0, 0)

            dispatch(clearAlert())
        }
    }, [alert, variant])


    const convertImage = async (e) => {
        setInput({...input, skill: { ...input.skill, image: e.target.value }})
        
        if(e.target.files[0] && e.target.files[0]['type'].split('/')[0] === 'image'){
            let convert = await toBase64(e.target.files[0])
            setSkills({ ...skills, image: convert })
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
                    setSkills({...skills, icons: skills.icons.concat(images)})
                }, error => {        
                    console.error(error);
                });
            }
            setImage(   
                acceptedFiles.map((upFile) => Object.assign(upFile, {
                    preview: URL.createObjectURL(upFile),
                    filename: upFile.name,
                    filesize: upFile.size
                }))
            )
        }
    })

    const deleteIcon = (e, item) => {
        let arr = [...skills.icons]
        arr.splice(e.currentTarget.id, 1)
        if(item.includes('https://drive.google.com')) {
            setSkills({...skills, icons: [...arr], removed_icons: skills.removed_icons.concat(item)})
        }
        else {
            setSkills({...skills, icons: [...arr]})
        }
    }

    const addSkillSet = () => {
        let duplicate = false

        if(input.skill.skill_name.length === 0 || input.skill.percentage.length === 0) return;

        skills.skill.forEach(item => { if(input.skill.skill_name === item.skill_name) duplicate = true })

        if(duplicate) { duplicate = false; return;}

        let data = {skill_name: input.skill.skill_name, percentage: input.skill.percentage, hex: `${getRandomColor(getRandomNumber())}`}

        setSkills({ ...skills, skill: skills.skill.concat(data)})

        setInput({ ...input, skill: { ...input.skill, skill_name: '', percentage: 0, hex: '' }})
    }

    const deleteSkillSet = (e) => {
        let arr = [...skills.skill]
        arr.splice(e.currentTarget.id, 1)
        setSkills({ ...skills, skill: [...arr] })
    }

    useEffect(() => {
        if(skills.icons.length > 3){
            setSkills({...skills, icons: skills.icons.slice(0,3)})
        }
    }, [skills.icons])

    const handleSubmit = () => {
        if(!submitted){
            dispatch(uploadSkills(skills))
            setSubmitted(true)
        }

        setSkills({...skills, image: '', removed_icons: []})
        setInput({...input, skill: {...input.skill, image: ''}})
    }

    return (
        <div className="container mx-auto relative px-0 sm:px-4 py-16 font-poppins text-sm">
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
                        <h2 className='text-3xl font-semibold text-gray-800 mb-12'>{ portfolio_selector[index] }</h2>
                        <button><FontAwesomeIcon onClick={() => setToggle(!toggle)} icon={faChevronDown} className="absolute mt-1 right-0 top-0 bg-blue-600 text-white border border-solid border-blue-600 p-[7px] hover:bg-blue-700  transition-all cursor-pointer rounded-sm ml-4 w-4 h-4"/></button>
                    </div>
                    <div
                        className={`${
                        !toggle ? "hidden" : "flex"
                        } p-6 pl-3 bg-white shadow-lg absolute top-8 right-0  mx-0 my-2 min-w-[140px] rounded-md border border-solid border-gray-300 sidebar text-sm font-poppins`}
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
                                                className={`flex items-center font-semibold cursor-pointer ${index === i ? 'text-blue-700' : 'text-gray-800'} hover:text-blue-700 ${portfolio_selector.length - 1 === i ? 'mb-0' : 'mb-2'}`}
                                            >   
                                                {
                                                    index === i ?
                                                        <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2" />
                                                    : <div className='mr-5'></div>
                                                }
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
            <div className='grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
                <div className='flex flex-col'>
                    <label className="block mb-2 font-semibold" htmlFor="file_input">Upload Photo</label>
                    <div className='flex flex-row'>
                        <input 
                            className="block w-full text-gray-800 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                            id="file_input" 
                            type="file"
                            accept="image/*" 
                            onChange={convertImage}
                            value={input.skill.image}
                        />
                        {
                            input.display_image && (
                                <div className='flex flex-row items-end'>
                                    <button 
                                        onClick={() => {
                                            setPreview(true)
                                            setOpenModal(true)
                                        }} 
                                        className='float-left font-semibold border border-solid border-blue-600 bg-blue-600 hover:bg-transparent hover:text-blue-600 rounded-sm transition-all text-white p-1'><FontAwesomeIcon icon={faEye} className="mx-4"/>
                                    </button>
                                </div>
                            )
                        }
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-300" id="file_input_help">Valid: PNG, JPG</p>
                </div>
            </div>
            <div className='grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1  gap-5 place-content-start mb-4'>
                <div className='flex flex-col'>
                    <label className='font-semibold mb-2'> Heading  </label>
                    <input 
                        type="text" 
                        className='p-2 px-4 border border-solid border-[#c0c0c0] outline-none'
                        onChange={(e) => setSkills({...skills, heading: e.target.value})}
                        value={skills.heading}
                    />
                </div>
            </div>
            <div className='grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1  gap-5 place-content-start mb-4'>
                <div className='flex flex-col'>
                    <label className='font-semibold mb-2'> Project Completed  </label>
                    <input 
                        type="number" 
                        className='p-2 px-4 border border-solid border-[#c0c0c0] outline-none'
                        onChange={(e) => setSkills({...skills, project_completed: e.target.value})}
                        value={skills.project_completed}
                    />
                </div>
            </div>
            <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
                <div className='flex flex-col'>
                    <label className='font-semibold mb-2'> Description </label>
                    <div className='flex flex-row'>
                        <textarea
                            name="message"
                            id="message"
                            cols="30"
                            rows="6"
                            placeholder="Message"
                            className="w-full p-2 px-4 leading-6 border border-solid border-[#c0c0c0] outline-none"
                            onChange={(e) => setSkills({...skills, description: e.target.value})}
                            value={ skills.description }
                        >
                        </textarea>
                    </div>
                </div>
            </div>
            <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
                <div className='flex flex-col'>
                    <div className='grid grid-cols-2 gap-5 place-content-start mb-2'>
                        <div className='flex flex-col w-full '>
                            <label className='font-semibold mb-2'> App/Skills </label>
                            <input 
                                type="text" 
                                className='w-full p-2 px-4 border border-solid border-[#c0c0c0] outline-none'
                                value={input.skill.skill_name}
                                onChange={(e) => setInput({...input, skill:{ ...input.skill, skill_name: e.target.value }})}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addSkillSet();
                                    }
                                }}
                            />
                        </div>
                        <div className='flex flex-col w-full'>
                            <label className='font-semibold mb-2'> Percentage </label>
                            <div className='flex flex-row'>
                                <input 
                                    type="number" 
                                    className='w-full p-2 px-4 border border-solid border-[#c0c0c0] outline-none'
                                    value={input.skill.percentage}
                                    onChange={(e) => setInput({...input, skill:{ ...input.skill, percentage: e.target.value }})}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            addSkillSet();
                                        }
                                    }}
                                />
                                <div className='flex flex-row items-end'>
                                    <button onClick={addSkillSet} className='float-left font-semibold border border-solid border-blue-600 bg-blue-600 hover:bg-transparent hover:text-blue-600 rounded-sm transition-all text-white p-2'>
                                        <FontAwesomeIcon icon={faPlus} className='mx-2'/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='grid  md:grid-cols-2 grid-cols-1 gap-5 place-content-start text-white mb-2'>
                <div className='flex flex-row flex-wrap'>
                    {
                        skills.skill.length > 0 &&
                            skills.skill.map((item, i) => {
                                return (
                                    <div key={i} className='w-full flex flex-row p-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 mb-1 rounded-sm transition-all'>
                                        <div className='w-1/2 flex flex-row items-center'>
                                            <p className='text-white text-sm tracking-wide'>{item.skill_name} ({item.percentage}%)</p>
                                        </div>
                                        <div className='w-1/2 text-right'>
                                            <FontAwesomeIcon id={i} onClick={deleteSkillSet} icon={faClose} className="mr-2 hover:cursor-pointer" />
                                        </div>
                                    </div>
                                )
                            })
                    }
                </div>
            </div>
            <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
                <div className="flex flex-row items-center justify-center w-full">
                    <label {...getRootProps()} for="dropzone-file" className="flex flex-row items-center justify-center w-full h-64 border-2 border-gray-400 border-dashed rounded-lg cursor-pointer bg-gray-50 ">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            {
                                isDragActive ? 
                                    <p className="mb-2 text-sm text-gray-800 dark:text-gray-800 text-center"><span className="font-semibold">Drop icons here</span></p>
                                :
                                    <p className="mb-2 text-sm text-gray-800 dark:text-gray-800 text-center"><span className="font-semibold">Click to upload app icon</span> or drag and drop</p>
                            }
                            <p className="text-xs text-gray-800 dark:text-gray-400 text-center">SVG, PNG, JPG or GIF (MAX. 3 icons 200x200px)</p>
                        </div>
                        <input accept="image/*" {...getInputProps()}/>
                    </label>
                </div> 
            </div>
            <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
                <div className='grid xs:grid-cols-3 grid-cols-2 gap-5 place-content-start mb-4'>
                    {
                        skills.icons.length > 0 ?
                            skills.icons.slice(0,3).map((item, i) => {
                                return (
                                    <div key={i}>
                                        { 
                                            item ?
                                                <div className='flex items-center justify-center p-6 xs:w-32 w-full xs:h-32 h-full border-2 border-dashed border-gray-400 mx-auto relative'>
                                                    <img className="w-full h-full object-cover" src={convertDriveImageLink(item)} alt="app icons"/>
                                                    <button><FontAwesomeIcon id={i} icon={faClose} onClick={(e) => deleteIcon(e, item)} className="absolute p-1 text-gray-500 hover:text-blue-600 cursor-pointer top-0 right-0 w-5 h-5"/></button>
                                                </div>
                                            :
                                                <div className='flex items-center justify-center p-6 xs:w-32 w-full h-32 border-2 border-dashed border-gray-500 mx-auto'>
                                                    <button className='text-center font-poppins text-sm uppercase font-semibold text-gray-500'>App Icon #{i+1}</button>
                                                </div>
                                        }
                                    </div>
                                )
                            })
                        :
                        <>
                            <div className='flex items-center justify-center p-6 xs:w-32 w-full h-32 border-2 border-dashed border-gray-500 mx-auto'>
                                <button className='text-center font-poppins text-sm font-semibold text-gray-500'>App Icon #1</button>
                            </div>
                            <div className='flex items-center justify-center p-6 xs:w-32 w-full h-32 border-2 border-dashed border-gray-500 mx-auto'>
                                <button className='text-center font-poppins text-sm font-semibold text-gray-500'>App Icon #2</button>
                            </div>
                            <div className='flex items-center justify-center p-6 xs:w-32 w-full h-32 border-2 border-dashed border-gray-500 mx-auto'>
                                <button className='text-center font-poppins text-sm font-semibold text-gray-500'>App Icon #3</button>
                            </div>
                        </>
                    }
                </div>
            </div>
            <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
                <button onClick={handleSubmit} className='tracking-wider float-left font-semibold border border-solid border-blue-600 bg-blue-600 hover:bg-blue-700 rounded-sm transition-all text-white p-2'>
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

export default Skills