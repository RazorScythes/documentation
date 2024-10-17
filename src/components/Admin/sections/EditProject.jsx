import React,{ useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import IconPicker from '../../IconPicker';

library.add(fas, far, fab);

const EditProject = ({ data, setEditData, setEditRemoveImage, setEditCancel }) => {

    const [project, setProject] = useState({
        id: '',
        image: '',
        show_image: true,
        project_name: '',
        project_description: '',
        date_started: '',
        date_accomplished: '',
        created_for: '',
        category: '',
        text: [],
        list: [],
        gallery: []
    })

    const [input, setInput] = useState({
        list_name: '',
        list_icon: '',
        list_description: '',
        list_item: [],
        gallery: '',
        text_heading: '',
        text_imageURL: '',
        text_description: '',
        featured_image: '',
    })

    const [imageName, setImageName] = useState('')
    const [icon, setIcon] = useState('a')
    const [submitted, setSubmitted] = useState(false)

    useState(() => {
        setProject(data)
    }, [data])

    const convertImage = async (e) => {
        setImageName(e.target.value)
        setEditRemoveImage([project.image])
        if(e.target.files[0] && e.target.files[0]['type'].split('/')[0] === 'image'){
            let convert = await toBase64(e.target.files[0])
            setProject({...project, image: convert})
        }
    }

    function checkWebsiteUrl(url) {
        return url.startsWith("https://") && url.includes(".") ? true : false
    }
    
    const TextWithEllipsis = ({ text, limit = 55 }) => {
        if(!text) return <span>...</span>
        if (text.length > limit) {
          return <span>{text.slice(0, limit)}...</span>;
        }
        return <span>{text}</span>;
    }

    const addAditionalText = () => {
        let duplicate = false

        if(input.text_description.length === 0) return;

        if(input.text_heading.length > 0) project.text.forEach(item => { if(input.text_heading === item.text_heading) duplicate = true })

        if(duplicate) { duplicate = false; return;}

        setProject({ ...project, text: project.text.concat({text_heading: input.text_heading, text_imageURL: input.text_imageURL, text_description: input.text_description})})

        setInput({ ...input, text_heading: '', text_imageURL: '', text_description: ''})
    }

    const deleteAdditionalText = (e) => {
        let arr = [...project.text]
        arr.splice(e.currentTarget.id, 1)
        setProject({...project, text: [...arr]})
    }

    const addLists = () => {
        let duplicate = false

        if(input.list_name.length === 0) return;

        project.list.forEach(item => { if(input.list_name === item.list_name) duplicate = true })

        if(duplicate) { duplicate = false; return;}

        setProject({ ...project, list: project.list.concat({list_name: input.list_name, list_icon: icon, list_description: input.list_description, list_item: []})})

        setInput({ ...input, list_name: '', list_description: ''})
    }
    
    const deleteLists = (e) => {
        let arr = [...project.list]
        arr.splice(e.currentTarget.id, 1)
        setProject({...project, list: [...arr]})
    }

    const addListItem = (e) => {
        // if(input.list_item[e.currentTarget.id].length === 0) return

        // let arr = [...project.list]
        // arr[e.currentTarget.id].list_item.push(input.list_item[e.currentTarget.id])
        // setProject({...project, list: [...arr]})
        // arr = [...input.list_item]
        // arr[e.currentTarget.id] = ''
        // setInput({...input, list_item: arr})
        if(input.list_item[e.currentTarget.id].length === 0) return;

        const newList = [...project.list];
        newList[e.currentTarget.id] = {
        ...newList[e.currentTarget.id],
        list_item: [...newList[e.currentTarget.id].list_item, input.list_item[e.currentTarget.id]]
        };

        setProject({...project, list: newList});

        const newInputList = [...input.list_item];
        newInputList[e.currentTarget.id] = '';

        setInput({...input, list_item: newInputList});

    }

    const deleteListItem = (e, id, parent_id) => {
        let arr = [...project.list];
        arr[parent_id] = {
            ...arr[parent_id],
            list_item: arr[parent_id].list_item.filter((_, index) => index !== id)
        };
        setProject({...project, list: [...arr]});
    }

    const handleItemChange = (e) => {
        let arr = [...input.list_item]
        arr[e.currentTarget.id] = e.target.value
        setInput({...input, list_item: [...arr]})
    }   
    
    const addImageURL = () => {
        let duplicate = false

        if(input.gallery.length === 0 || !checkWebsiteUrl(input.gallery)) return;

        project.gallery.forEach(item => { if(input.gallery === item) duplicate = true })

        if(duplicate) { duplicate = false; return;}

        setProject({ ...project, gallery: project.gallery.concat(input.gallery)})

        setInput({ ...input, gallery: ''})
    }

    const deleteImageURL = (e) => {
        let arr = [...project.gallery]
        arr.splice(e.currentTarget.id, 1)
        setProject({...project, gallery: [...arr]})
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
    
    // const toBase64 = file => new Promise((resolve, reject) => {
    //     const reader = new FileReader();
    //     reader.readAsDataURL(file);
    //     reader.onload = (event) => {
    //         const image = new Image();
    //         image.src = event.target.result;
    //         image.onload = () => {
    //             const canvas = document.createElement("canvas");
    //             let width = image.width;
    //             let height = image.height;

    //             const MAX_SIZE = 1000;
    //             const MAX_HEIGHT = 1350;
    //             const MAX_WIDTH = 1000;

    //             if (width > height) {
    //             if (width > MAX_SIZE) {
    //                 height *= MAX_SIZE / width;
    //                 width = MAX_SIZE;
    //             }
    //             } else {
    //             if (height > MAX_HEIGHT) {
    //                 width *= MAX_HEIGHT / height;
    //                 height = MAX_HEIGHT;
    //             }
    //             }

    //             if (width > MAX_WIDTH) {
    //             height *= MAX_WIDTH / width;
    //             width = MAX_WIDTH;
    //             }

    //             canvas.width = width;
    //             canvas.height = height;

    //             const ctx = canvas.getContext("2d");
    //             ctx.drawImage(image, 0, 0, width, height);

    //             const base64String = canvas.toDataURL(file.type, 0.7);
    //             resolve(base64String);
    //         };
    //     };
    // });

    const handleSubmit = () => {
        if(!submitted) {
            setEditData(project)
            setSubmitted(true)
        }
    }
    return (
        <div>
            <div className='grid grid-cols-2  gap-5 place-content-start md:mb-16 mb-4 md:mt-0 mt-8'>
                <h2 className='text-3xl font-bold text-gray-800'>Edit Project</h2>
                <button onClick={() => setEditCancel(true)} className='place-self-end text-center w-32 disabled:bg-gray-600 disabled:border-gray-600 font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
                    Cancel
                </button>
            </div>
            <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
                <div className='flex flex-col'>
                    <label className="block mb-2 font-medium" htmlFor="file_input">Featured Image</label>
                    <input 
                        className="block w-full text-gray-800 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                        id="file_input" 
                        type="file"
                        accept="image/*" 
                        value={imageName}
                        onChange={convertImage}
                    />
                </div>
                <div className="flex flex-row items-center mt-8">
                    <input 
                        id="default-checkbox" 
                        type="checkbox" 
                        checked={project.show_image}
                        onChange={() => setProject({...project, show_image: !project.show_image})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="default-checkbox" className="ml-2 font-medium text-gray-900 dark:text-gray-300">Show Image</label>
                </div>
            </div>
            <div className='grid grid-cols-1 gap-5 place-content-start mb-4'>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Project Name </label>
                    <input 
                        type="text" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        value={project.project_name}
                        onChange={(e) => setProject({...project, project_name: e.target.value})}
                    />
                </div>
            </div>   
            <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Project Description </label>
                    <div className='flex flex-row'>
                        <textarea
                            name="message"
                            id="message"
                            cols="30"
                            rows="8"
                            placeholder="Message"
                            className="w-full p-2 border border-solid border-[#c0c0c0]"
                            value={project.project_description}
                            onChange={(e) => setProject({...project, project_description: e.target.value})}
                        >
                        </textarea>
                    </div>
                </div>
            </div>
            <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Date Started </label>
                    <input 
                        type="date" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        value={project.date_started}
                        onChange={(e) => setProject({...project, date_started: e.target.value})}
                    />
                </div>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Date Accomplished </label>
                    <input 
                        type="date" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        value={project.date_accomplished}
                        onChange={(e) => setProject({...project, date_accomplished: e.target.value})}
                    />
                </div>
            </div>   
            <div className='grid grid-cols-2 gap-5 place-content-start mb-4'>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Created for </label>
                    <input 
                        type="text" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        value={project.created_for}
                        onChange={(e) => setProject({...project, created_for: e.target.value})}
                    />
                </div>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Category </label>
                    <input 
                        type="text" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        value={project.category}
                        onChange={(e) => setProject({...project, category: e.target.value})}
                    />
                </div>
            </div>
            
            <hr className='h-1 bg-gray-700'/>

            <div className='grid grid-cols-2  gap-5 place-content-start md:mt-0 mt-8'>
                <h2 className='text-2xl font-bold text-gray-800 my-4'>Additional Text</h2>   
                <div className='flex flex-row items-center justify-end'>
                    <button onClick={addAditionalText} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add Text</button>
                </div>        
            </div>
            <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start'>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Heading </label>
                    <input 
                        type="text" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        value={input.text_heading}
                            onChange={(e) => setInput({...input, text_heading: e.target.value})}
                    />
                </div>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Image URL (optional) </label>
                    <input 
                        type="text" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        value={input.text_imageURL}
                            onChange={(e) => setInput({...input, text_imageURL: e.target.value})}
                    />
                </div>
            </div>
            <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Description </label>
                    <div className='flex flex-row'>
                        <textarea
                            name="message"
                            id="message"
                            cols="30"
                            rows="8"
                            placeholder="Message"
                            className="w-full p-2 border border-solid border-[#c0c0c0]"
                            value={input.text_description}
                            onChange={(e) => setInput({...input, text_description: e.target.value})}
                        >
                        </textarea>
                    </div>
                </div>
            </div>
            
            <div className='grid grid-cols-1 gap-5 place-content-start text-white mb-2'>
                <div className='flex flex-row flex-wrap'>
                    {
                        project.text.length > 0 &&
                            project.text.map((item, i) => {
                                return (
                                    <div key={i} className='w-full flex flex-row p-2 py-3 bg-gray-800 mb-1 relative'>
                                        <div className='w-full flex flex-col'>
                                            <div className='w-full flex flex-row items-center capitalize'>
                                                <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3"/> <p className='font-semibold'>{item.text_heading ? item.text_heading : 'No Heading'}</p>
                                            </div>
                                            <div className='w-full flex flex-row items-center mb-2'>
                                                <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3 opacity-0"/> <p className='break-all'>Image URL: {item.text_imageURL ? item.text_imageURL : "n/a" }</p>
                                            </div>
                                            
                                            <div className='w-full flex flex-row items-center'>
                                                <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3 opacity-0"/> <p><TextWithEllipsis text={item.text_description} limit={150}/></p>
                                            </div>
                                        </div> 
                                        <div className='w-1/2 text-right absolute top-2 right-2'>
                                            <FontAwesomeIcon id={i} onClick={deleteAdditionalText} icon={faTrash} className="mr-2 hover:cursor-pointer" />
                                        </div>
                                    </div>
                                )
                            })
                        }
                </div>
            </div>

            <hr className='h-1 bg-gray-700'/>

            <div className='grid grid-cols-2  gap-5 place-content-start md:mt-0 mt-8'>
                <h2 className='text-2xl font-bold text-gray-800 my-4'>List (optional)</h2>   
                <div className='flex flex-row items-center justify-end'>
                    <button onClick={addLists} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add List</button>
                </div>        
            </div>
            <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start'>
                <div className='flex flex-col'>
                    <label className='font-semibold'> List Name </label>
                    <input 
                        type="text" 
                        className='p-2 border border-solid border-[#c0c0c0]'
                        value={input.list_name}
                        onChange={(e) => setInput({...input, list_name: e.target.value})}
                    />
                </div>
                <div className='flex flex-col'>
                    <label className='font-semibold'> List Icon: </label>
                    <div className='flex flex-row'>
                        <IconPicker setIcon={setIcon}/>    
                    </div>
                </div>
            </div>
            <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                <div className='flex flex-col'>
                    <label className='font-semibold'> List Description </label>
                    <div className='flex flex-row'>
                        <textarea
                            name="message"
                            id="message"
                            cols="30"
                            rows="8"
                            placeholder="Message"
                            className="w-full p-2 border border-solid border-[#c0c0c0]"
                            value={input.list_description}
                            onChange={(e) => setInput({...input, list_description: e.target.value})}
                        >
                        </textarea>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-5 place-content-start text-white mb-2'>
                <div className='flex flex-row flex-wrap'>
                    {
                        project.list.length > 0 &&
                            project.list.map((item, i) => {
                                return (
                                    <div key={i} className='w-full border-2 border-dashed border-gray-700 p-2 mb-2'>
                                        <div key={i} className='w-full flex flex-row p-2 py-3 bg-gray-800 mb-1'>
                                            <div className='w-1/2 flex flex-col'>
                                                <div className='w-full flex flex-row items-center'>
                                                    <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3"/> <p className='font-semibold'>{item.list_name}</p>
                                                </div>
                                                <div className='w-full flex flex-row items-center'>
                                                    <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3 opacity-0"/> <p className=''>Icon: <FontAwesomeIcon icon={['fas', item.list_icon]} className="ml-2 text-white" /></p>
                                                </div>
                                            </div> 
                                            <div className='w-1/2 text-right'>
                                                <FontAwesomeIcon id={i} onClick={deleteLists} icon={faTrash} className="mr-2 hover:cursor-pointer" />
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2 text-[#000]'>
                                            <div className='flex flex-col'>
                                                <label className='font-semibold'> Item: </label>
                                                <div className='flex flex-row'>
                                                    <input 
                                                        id={i}
                                                        type="text" 
                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                        value={input.list_item[i] ? input.list_item[i] : ''}
                                                        onChange={handleItemChange}
                                                    />
                                                    <div className='flex flex-row items-end'>
                                                        <button id={i} onClick={addListItem} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {
                                            project.list[i].list_item.length > 0 &&
                                                project.list[i].list_item.map((data, id) => {
                                                    return(
                                                        <div key={id} className='w-full flex flex-row p-2 py-3 bg-gray-800 mb-1'>
                                                            <div className='w-1/2 flex flex-col'>
                                                                <div className='w-full flex flex-row items-center'>
                                                                    <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3"/> <p className='font-semibold'>{data}</p>
                                                                </div>
                                                            </div> 
                                                            <div className='w-1/2 text-right'>
                                                                <FontAwesomeIcon onClick={(e) => deleteListItem(e, id, i)} id={id} parent_id={i} icon={faTrash} className="mr-2 hover:cursor-pointer" />
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                        }
                                    </div>
                                )
                            })
                        }
                </div>
            </div>

            <hr className='h-1 bg-gray-700'/>

            <div className='grid grid-cols-1  gap-5 place-content-start md:mt-0 mt-8'>
                <h2 className='text-2xl font-bold text-gray-800 my-4'>Gallery Showcase (optional)</h2>   
            </div>
            <p className='text-gray-500 text-sm italic mb-2'>#Since there is a 4.5mb limit for uploading files in the serverless function, I am required to restrict image uploads to just one. You can include the image URL in the input field to attach it.</p>
            
            <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                <div className='flex flex-col'>
                    <label className='font-semibold'> Image URL: </label>
                    <div className='flex flex-row'>
                        <input 
                            type="text" 
                            className='w-full p-2 border border-solid border-[#c0c0c0]'
                            value={input.gallery}
                            onChange={(e) => setInput({...input, gallery: e.target.value })}
                        />
                        <div className='flex flex-row items-end'>
                            <button onClick={addImageURL} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className='grid grid-cols-1 gap-5 place-content-start text-white mb-2'>
                <div className='flex flex-row flex-wrap'>
                    {
                        project.gallery.length > 0 &&
                            project.gallery.map((item, i) => {
                                return (
                                    <div key={i} className='w-full flex flex-row p-2 py-3 bg-gray-800 mb-1'>
                                        <div className='w-1/2 flex flex-row items-center'>
                                            <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3"/> <p className='font-semibold break-all'>{item}</p>
                                        </div>
                                        <div className='w-1/2 text-right'>
                                            <FontAwesomeIcon id={i} onClick={deleteImageURL} icon={faTrash} className="mr-2 hover:cursor-pointer" />
                                        </div>
                                    </div>
                                )
                            })
                        }
                </div>
            </div>

            <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                <button onClick={handleSubmit} className='disabled:bg-gray-600 disabled:border-gray-600 float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
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
                                <span class="sr-only">Loading...</span>
                            </div>
                        </div>
                    }
                </button>
            </div>
        </div>
    )
}

export default EditProject