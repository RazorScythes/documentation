import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAdminCategory, getUserProject, uploadProject, editUserProject, removeUserProject, clearAlert } from "../../actions/project";
import { faEye, faPencilAlt, faTrashAlt, faEllipsisH, faPlus, faCalendar, faClose, faTrash, faArrowDown, faArrowUp, faShare, faShareAltSquare, faExternalLink, faEyeSlash, faFile, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useParams } from 'react-router-dom'
import { convertDriveImageLink } from '../Tools'
import { Header } from './index'
import { Link } from 'react-router-dom'
import { library, findIconDefinition  } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

import Alert from '../Alert';
import SideAlert from '../SideAlert';
import styles from '../../style'

import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import ImageModal from '../ImageModal';
import heroBackgroundImage from '../../assets/1696333975880.jpg';

import SyntaxHighlighter from 'react-syntax-highlighter';
import * as hljsStyles from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

library.add(fas, far, fab);

const CustomRight = ({ onClick }) => {
    return (
      <FontAwesomeIcon
        icon={faChevronRight}
        onClick={onClick}
        className="absolute sm:right-0 right-4 max-w-4 cursor-pointer text-primary-400 text-2xl font-bold text-gray-800"
      />
    )
};
  
const CustomLeft = ({ onClick }) => {
    return (
      <FontAwesomeIcon
        icon={faChevronLeft}
        onClick={onClick}
        className="absolute sm:left-0 left-4 max-w-4 cursor-pointer text-primary-400 text-2xl font-bold text-gray-800"
      />
    )
};

const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1224 },
      items: 1
    },
    laptop: {
      breakpoint: { max: 1224, min: 890 },
      items: 1
    },
    tablet: {
      breakpoint: { max: 890, min: 464 },
      items: 1
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
};

const AdminProjects = ({ user, path }) => {
    const dispatch = useDispatch()

    const alert = useSelector((state) => state.project.alert)
    const variant = useSelector((state) => state.project.variant)
    const heading = useSelector((state) => state.project.heading)
    const paragraph = useSelector((state) => state.project.paragraph)
    const project = useSelector((state) => state.project.project)
    const category = useSelector((state) => state.project.category)

    const [open, setOpen] = useState({
        portfolio: false,
        pages: false,
        uploads: false,
        manage: false,
    })

    const [projects, setProjects] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [imageFile, setimageFile] = useState('')
    const [image, setImage] = useState('')
    const [imageModal, setImageModal] = useState(false)
    const [openImageModal, setOpenImageModal] = useState(false)
    const [displayImage, setDisplayImage] = useState('')
    const [removeImage, setRemoveImage] = useState([])
    const [preview, setPreview] = useState(false)
    const [codePreview, setCodePreview] = useState(false)
    const [edit, setEdit] = useState(false)
    const [editIndex, setEditIndex] = useState(0)
    const [deleteIndex, setDeleteIndex] = useState(null)
    const [showForm, setShowForm] = useState(false)

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
    
    const [contentSelected, setContentSelected] = useState('')
    const [contentGrid1Selected, setContentGrid1Selected] = useState('')
    const [contentGrid2Selected, setContentGrid2Selected] = useState('')
    const [form, setForm] = useState({
        featured_image: '',
        post_title: '',
        date_start: '',
        date_end: '',
        created_for: 'Personal',
        content: [
            { 
                header: '',
                container: [{ header: 'Heading',  element: 'heading', heading: ''}]
            }
        ],
        tags: [],
        categories: 'Gaming'
    })
    const [tags, setTags] = useState([])
    const [input, setInput] = useState({
        tags: '',
    })

    useEffect(() => {
        dispatch(getUserProject({ id: user.result?._id }))
        dispatch(getAdminCategory())
    }, [])

    useEffect(() => {
        if(project && project.length > 0){
            setProjects(project)
        }
        setTags([])
        setForm({
            featured_image: '',
            post_title: '',
            date_start: '',
            date_end: '',
            created_for: 'Personal',
            content: [
                { 
                    header: 'Container Box',
                    container: [{ header: 'Heading',  element: 'heading', heading: ''}]
                }
            ],
            tags: [],
            categories: 'Gaming'
        })
        setEdit(false)
        setImage('')
        setimageFile('')
        setSubmitted(false)
    }, [project])

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
                setImageModal(true)
            })
    }

    const addTags = () => {
        let duplicate = false
        if(input.tags.length === 0) return;
        tags.forEach(item => { if(input.tags === item) duplicate = true })
        if(duplicate) { duplicate = false; return;}
        setTags(tags.concat(input.tags))
        setInput({...input, tags: ''})
    }

    const deleteTags = (e) => {
        let arr = [...tags]
        arr.splice(e.currentTarget.id, 1)
        setTags([...arr])
    }   

    const addContentContainer = () => {
        setForm({...form, content: form.content.concat({header: 'Container Box', container: [{ header: 'Heading',  element: 'heading', heading: ''}]})})
    }

    const addContentElements = (parent) => {
        var array = [...form.content]
        var element;

        if(!contentSelected) return;

        if(contentSelected === 'heading') {
            element = { header: 'Heading',  element: contentSelected, heading: ''}
        }
        else if(contentSelected === 'normal_naragraph') {
            element = { header: 'Normal Paragraph',  element: contentSelected, paragraph: ''}
        }
        else if(contentSelected === 'quoted_paragraph') {
            element = { header: 'Quoted Paragraph',  element: contentSelected, paragraph: ''}
        }
        else if(contentSelected === 'grid_image') {
            element = { header: 'Grid Image', type: 'boxed', element: contentSelected, input: '', grid_image: []}
        }
        else if(contentSelected === 'slider') {
            element = { header: 'Slider', element: contentSelected, input: '', grid_image: []}
        }
        else if(contentSelected === 'sub_heading') {
            element = { header: 'Sub Heading',  element: contentSelected, heading: ''}
        }
        else if(contentSelected === 'bullet_list') {
            element = { header: 'Bullet List',  element: contentSelected, input: '', list: []}
        }
        else if(contentSelected === 'number_list') {
            element = { header: 'Number List',  element: contentSelected, input: '', list: []}
        }
        else if(contentSelected === 'single_image') {
            element = { header: 'Single Image',  type: 'rectangular', element: contentSelected, image: ''}
        }
        else if(contentSelected === 'list_image') {
            element = { header: 'List Image',  element: contentSelected, image_input: '', heading_input: '', sub_input: '', link_input: '', list: []}
        }
        else if(contentSelected === 'code_highlights') {
            element = { header: 'Code Highlights',  element: contentSelected, input: '', language: 'javascript', theme: 'srcery', name: '', paragraph: ''}
        }
        else if(contentSelected === 'download_list') {
            element = { header: 'Download List',  element: contentSelected, input: '', icon: 'fa-file-download', link: '', list: []}
        }
        else if(contentSelected === 'grid_column') {
            element = { header: 'Grid Column',  element: contentSelected, input: '', grid1: [], grid2: []}
        }
        
        const newArray = [...array];
        const parentContainer = { ...newArray[parent] };
        parentContainer.container = [...(parentContainer.container || []), element];
        newArray[parent] = parentContainer;

        setForm(prevForm => ({
            ...prevForm,
            content: newArray,
        }));
    }

    const addContentElementsGrid = (index, parent, type) => {
        var array = [...form.content]

        if(type === 'grid1') {
            if(contentGrid1Selected === 'heading') {
                array[parent].container[index].grid1.push({ header: 'Heading',  element: contentGrid1Selected, heading: ''})
            }
            else if(contentGrid1Selected === 'normal_naragraph') {
                array[parent].container[index].grid1.push({ header: 'Normal Paragraph',  element: contentGrid1Selected, paragraph: ''})
            }
            else if(contentGrid1Selected === 'quoted_paragraph') {
                array[parent].container[index].grid1.push({ header: 'Quoted Paragraph',  element: contentGrid1Selected, paragraph: ''})
            }
            else if(contentGrid1Selected === 'grid_image') {
                array[parent].container[index].grid1.push({ header: 'Grid Image', type: 'boxed', element: contentGrid1Selected, input: '', grid_image: []})
            }
            else if(contentGrid1Selected === 'sub_heading') {
                array[parent].container[index].grid1.push({ header: 'Sub Heading',  element: contentGrid1Selected, heading: ''})
            }
            else if(contentGrid1Selected === 'bullet_list') {
                array[parent].container[index].grid1.push({ header: 'Bullet List',  element: contentGrid1Selected, input: '', list: []})
            }
            else if(contentGrid1Selected === 'number_list') {
                array[parent].container[index].grid1.push({ header: 'Number List',  element: contentGrid1Selected, input: '', list: []})
            }
            else if(contentGrid1Selected === 'single_image') {
                array[parent].container[index].grid1.push({ header: 'Single Image',  type: 'rectangular', element: contentGrid1Selected, image: ''})
            }
            else if(contentGrid1Selected === 'list_image') {
                array[parent].container[index].grid1.push({ header: 'List Image',  element: contentGrid1Selected, image_input: '', heading_input: '', sub_input: '', link_input: '', list: []})
            }
            else if(contentGrid1Selected === 'download_list') {
                array[parent].container[index].grid1.push({ header: 'Download List',  element: contentGrid1Selected, input: '', icon: 'fa-file-download', link: '', list: []})
            }
        }
        else if(type === 'grid2') {
            if(contentGrid2Selected === 'heading') {
                array[parent].container[index].grid2.push({ header: 'Heading',  element: contentGrid2Selected, heading: ''})
            }
            else if(contentGrid2Selected === 'normal_naragraph') {
                array[parent].container[index].grid2.push({ header: 'Normal Paragraph',  element: contentGrid2Selected, paragraph: ''})
            }
            else if(contentGrid2Selected === 'quoted_paragraph') {
                array[parent].container[index].grid2.push({ header: 'Quoted Paragraph',  element: contentGrid2Selected, paragraph: ''})
            }
            else if(contentGrid2Selected === 'grid_image') {
                array[parent].container[index].grid2.push({ header: 'Grid Image', type: 'boxed', element: contentGrid2Selected, input: '', grid_image: []})
            }
            else if(contentGrid2Selected === 'sub_heading') {
                array[parent].container[index].grid2.push({ header: 'Sub Heading',  element: contentGrid2Selected, heading: ''})
            }
            else if(contentGrid2Selected === 'bullet_list') {
                array[parent].container[index].grid2.push({ header: 'Bullet List',  element: contentGrid2Selected, input: '', list: []})
            }
            else if(contentGrid2Selected === 'number_list') {
                array[parent].container[index].grid2.push({ header: 'Number List',  element: contentGrid2Selected, input: '', list: []})
            }
            else if(contentGrid2Selected === 'single_image') {
                array[parent].container[index].grid2.push({ header: 'Single Image',  type: 'rectangular', element: contentGrid2Selected, image: ''})
            }
            else if(contentGrid2Selected === 'list_image') {
                array[parent].container[index].grid2.push({ header: 'List Image',  element: contentGrid2Selected, image_input: '', heading_input: '', sub_input: '', link_input: '', list: []})
            }
            else if(contentGrid2Selected === 'download_list') {
                array[parent].container[index].grid2.push({ header: 'Download List',  element: contentGrid2Selected, input: '', icon: 'fa-file-download', link: '', list: []})
            }
        }
        setForm({...form, content: array})
    }

    const moveElementUpwardsGrid = (index, parent, sub, type) => {
        var array = [...form.content]

        if(type === 'grid1') {
            // Swapping the positions of the first and second elements
            const temp = array[parent].container[index].grid1[sub];
            array[parent].container[index].grid1[sub] = array[parent].container[index].grid1[sub-1];
            array[parent].container[index].grid1[sub-1] = temp;
        }
        else if(type === 'grid2') {
            // Swapping the positions of the first and second elements
            const temp = array[parent].container[index].grid2[sub];
            array[parent].container[index].grid2[sub] = array[parent].container[index].grid2[sub-1];
            array[parent].container[index].grid2[sub-1] = temp;
        }

        setForm({...form, content: array})
    }

    const moveElementsDownwardsGrid = (index, parent, sub, type) => {
        var array = [...form.content]

        if(type === 'grid1') {
            // Swapping the positions of the second and first elements
            const temp = array[parent].container[index].grid1[sub];
            array[parent].container[index].grid1[sub] = array[parent].container[index].grid1[sub+1];
            array[parent].container[index].grid1[sub+1] = temp;
        }
        else if(type === 'grid2') {
            // Swapping the positions of the second and first elements
            const temp = array[parent].container[index].grid2[sub];
            array[parent].container[index].grid2[sub] = array[parent].container[index].grid2[sub+1];
            array[parent].container[index].grid2[sub+1] = temp;
        }

        setForm({...form, content: array})
    }

    const removeElementsContentGrid = (index, parent, sub, type) => {
        var array = [...form.content]

        if(type === 'grid1') {
            array[parent].container[index].grid1.splice(sub, 1)
        }
        else if(type === 'grid2') {
            array[parent].container[index].grid2.splice(sub, 1)
        }

        setForm({...form, content: array})
    }

    const headerValueGrid = (e, index, parent, sub, type) => {
        var array = [...form.content]

        if(type === 'grid1') {
            array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], header: e.target.value};
        }
        else if(type === 'grid2') {
            array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], header: e.target.value};
        }

        setForm({...form, content: array})
    }

    const selectValueGrid = (e, index, parent, type, sub, typex) => {
        var array = [...form.content]

        if(typex === 'grid1') {
            if(type === 'language') array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], language: e.target.value};
            else if(type === 'theme') array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], theme: e.target.value};
            else if(type === 'icon') array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], icon: e.target.value};
        }
        else if(typex === 'grid2') {
            if(type === 'language') array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], language: e.target.value};
            else if(type === 'theme') array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], theme: e.target.value};
            else if(type === 'icon') array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], icon: e.target.value};
        }

        setForm({...form, content: array})
    }

    const nameValueGrid = (e, index, parent, sub, type) => {
        var array = [...form.content];

        if(type === 'grid1') {
            array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], name: e.target.value};
        }
        else if(type === 'grid2') {
            array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], name: e.target.value};
        }

        setForm({...form, content: array});
    }

    const linkValueGrid = (e, index, parent, sub, type) => {
        var array = [...form.content];

        if(type === 'grid1') {
            array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], link: e.target.value};
        }
        else if(type === 'grid2') {
            array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], link: e.target.value};
        }

        setForm({...form, content: array});
    }

    const paragraphValueGrid = (e, index, parent, sub, type) => {
        var array = [...form.content];

        if(type === 'grid1') {
            array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], paragraph: e.target.value};
        }
        else if(type === 'grid2') {
            array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], paragraph: e.target.value};
        }

        setForm({...form, content: array});
    }

    const headingValueGrid = (e, index, parent, sub, type) => {
        var array = [...form.content]

        if(type === 'grid1') {
            array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], heading: e.target.value};
        }
        else if(type === 'grid2') {
            array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], heading: e.target.value};
        }

        setForm({...form, content: array})
    }

    const singleInputValueGrid = (e, index, parent, sub, type) => {
        var array = [...form.content]

        if(type === 'grid1') {
            array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], image: e.target.value};
        }
        else if(type === 'grid2') {
            array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], image: e.target.value};
        }   

        setForm({...form, content: array})
    }

    const gridInputValueGrid = (e, index, parent, sub, type) => {
        var array = [...form.content]

        if(type === 'grid1') {
            array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], input: e.target.value};
        }
        else if(type === 'grid2') {
            array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], input: e.target.value};
        }

        setForm({...form, content: array})
    }

    const listInputValueGrid = (e, index, parent, sub, type) => {
        var array = [...form.content]

        if(type === 'grid1') {
            array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], input: e.target.value};
        }
        else if(type === 'grid2') {
            array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], input: e.target.value};
        }

        setForm({...form, content: array})
    }

    const listInputValueMultiGrid = (e, index, parent, type, sub, typex) => {
        var array = [...form.content]

        if(typex === 'grid1') {
            if(type === 'image') array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], image_input: e.target.value};
            else if(type === 'link') array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], link_input: e.target.value};
            else if(type === 'heading') array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], heading_input: e.target.value};
            else if(type == 'sub_heading') array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], sub_input: e.target.value};
        }
        else if(typex === 'grid2') {
            if(type === 'image') array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], image_input: e.target.value};
            else if(type === 'link') array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], link_input: e.target.value};
            else if(type === 'heading') array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], heading_input: e.target.value};
            else if(type == 'sub_heading') array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], sub_input: e.target.value};
        }
        
        setForm({...form, content: array})
    }
    
    const typeValueGrid = (e, index, parent, sub, type) => {
        var array = [...form.content]

        if(type === 'grid1') {
            array[parent].container[index].grid1[sub] = {...array[parent].container[index].grid1[sub], type: e.target.value};
        }
        else if(type === 'grid2') {
            array[parent].container[index].grid2[sub] = {...array[parent].container[index].grid2[sub], type: e.target.value};
        }

        setForm({...form, content: array})
    }

    const addGridContentImageGrid = (index, parent, sub, type) => {       
        var array = [...form.content]

        if(type === 'grid1') {
            if(!array[parent].container[index].grid1[sub].input) return
            array[parent].container[index].grid1[sub] = {
                ...array[parent].container[index].grid1[sub],
                grid_image: [...array[parent].container[index].grid1[sub].grid_image, array[parent].container[index].grid1[sub].input],
                input: ''
            };
        }
        else if(type === 'grid2') {
            if(!array[parent].container[index].grid2[sub].input) return
            array[parent].container[index].grid2[sub] = {
                ...array[parent].container[index].grid2[sub],
                grid_image: [...array[parent].container[index].grid2[sub].grid_image, array[parent].container[index].grid2[sub].input],
                input: ''
            };
        }

        setForm({...form, content: array})
    }

    const addListsGrid = (index, parent, sub, type) => {       
        var array = [...form.content]

        if(type === 'grid1') {
            if(!array[parent].container[index].grid1[sub].input) return

            array[parent].container[index].grid1[sub] = {
                ...array[parent].container[index].grid1[sub],
                list: [...array[parent].container[index].grid1[sub].list, array[parent].container[index].grid1[sub].input],
                input: ''
            };
        }
        else if(type === 'grid2') {
            if(!array[parent].container[index].grid2[sub].input) return

            array[parent].container[index].grid2[sub] = {
                ...array[parent].container[index].grid2[sub],
                list: [...array[parent].container[index].grid2[sub].list, array[parent].container[index].grid2[sub].input],
                input: ''
            };
        }

        setForm({...form, content: array})
    }

    const addListsMultiGrid = (index, parent, sub, type) => {       
        var array = [...form.content]

        if(type === 'grid1') {
            if(!array[parent].container[index].grid1[sub].heading_input) return

            array[parent].container[index].grid1[sub] = {
                ...array[parent].container[index].grid1[sub],
                list: [
                    ...array[parent].container[index].grid1[sub].list,
                    {
                        image: array[parent].container[index].grid1[sub].image_input,
                        link: array[parent].container[index].grid1[sub].link_input,
                        heading: array[parent].container[index].grid1[sub].heading_input,
                        sub_heading: array[parent].container[index].grid1[sub].sub_input,
                    }
                ],
                image_input: '',
                link_input: '',
                heading_input: '',
                sub_input: '',
            };
        }
        else if(type === 'grid2') {
            if(!array[parent].container[index].grid2[sub].heading_input) return

            array[parent].container[index].grid2[sub] = {
                ...array[parent].container[index].grid2[sub],
                list: [
                    ...array[parent].container[index].grid2[sub].list,
                    {
                        image: array[parent].container[index].grid2[sub].image_input,
                        link: array[parent].container[index].grid2[sub].link_input,
                        heading: array[parent].container[index].grid2[sub].heading_input,
                        sub_heading: array[parent].container[index].grid2[sub].sub_input,
                    }
                ],
                image_input: '',
                link_input: '',
                heading_input: '',
                sub_input: '',
            };
        }

        setForm({...form, content: array})
    }

    const addListsDownloadsGrid = (index, parent, sub, type) => {       
        var array = [...form.content]

        if(type === 'grid1') {
            if(!array[parent].container[index].grid1[sub].input || !array[parent].container[index].grid1[sub].link) return

            array[parent].container[index].grid1[sub] = {
                ...array[parent].container[index].grid1[sub],
                list: [
                    ...array[parent].container[index].grid1[sub].list,
                    {
                        name: array[parent].container[index].grid1[sub].input,
                        link: array[parent].container[index].grid1[sub].link,
                        icon: array[parent].container[index].grid1[sub].icon,
                    }
                ],
                icon: 'fa-file-download',
                input: '',
                link: '',
            };
        }
        else if(type === 'grid2') {
            if(!array[parent].container[index].grid2[sub].input || !array[parent].container[index].grid2[sub].link) return

            array[parent].container[index].grid2[sub] = {
                ...array[parent].container[index].grid2[sub],
                list: [
                    ...array[parent].container[index].grid2[sub].list,
                    {
                        name: array[parent].container[index].grid2[sub].input,
                        link: array[parent].container[index].grid2[sub].link,
                        icon: array[parent].container[index].grid2[sub].icon,
                    }
                ],
                icon: 'fa-file-download',
                input: '',
                link: '',
            };
        }

        setForm({...form, content: array})
    }

    const removeListsGrid = (parent_index, child_index, parent, sub, type) => {
        var array = [...form.content]

        if(type === 'grid1') {
            array[parent].container[parent_index].grid1[sub].list.splice(child_index, 1)
        }
        else if(type === 'grid2') {
            array[parent].container[parent_index].grid2[sub].list.splice(child_index, 1)
        }

        setForm({...form, content: array})
    }

    const removeGridContentImageGrid = (parent_index, child_index, parent, sub, type) => {
        var array = [...form.content]

        if(type === 'grid1') {
            array[parent].container[parent_index].grid1[sub].grid_image.splice(child_index, 1)
        }
        else if(type === 'grid2') {
            array[parent].container[parent_index].grid2[sub].grid_image.splice(child_index, 1)
        }

        setForm({...form, content: array})
    }

    /* ============================================================================================================ */

    const moveContainerUpwards = (index) => {
        var array = [...form.content]

        // Swapping the positions of the first and second elements
        const temp = array[index];
        array[index] = array[index-1];
        array[index-1] = temp;

        setForm({...form, content: array})
    }

    const moveContainerDownwards = (index) => {
        var array = [...form.content]

        // Swapping the positions of the second and first elements
        const temp = array[index];
        array[index] = array[index+1];
        array[index+1] = temp;

        setForm({...form, content: array})
    }

    const removeContainer = (index) => {
        var array = [...form.content]

        array.splice(index, 1)

        setForm({...form, content: array})
    }

    const headerContainerValue = (e, index) => {
        var array = [...form.content]
        array[index] = {...array[index], header: e.target.value};
        setForm({...form, content: array})
    }

    const moveElementUpwards = (index, parent) => {
        var array = [...form.content]

        // Swapping the positions of the first and second elements
        const temp = array[parent].container[index];
        array[parent].container[index] = array[parent].container[index-1];
        array[parent].container[index-1] = temp;

        setForm({...form, content: array})
    }

    const moveElementsDownwards = (index, parent) => {
        var array = [...form.content]

        // Swapping the positions of the second and first elements
        const temp = array[parent].container[index];
        array[parent].container[index] = array[parent].container[index+1];
        array[parent].container[index+1] = temp;

        setForm({...form, content: array})
    }

    const removeElementsContent = (index, parent) => {
        var array = [...form.content]

        array[parent].container.splice(index, 1)

        setForm({...form, content: array})
    }

    const headerValue = (e, index, parent) => {
        var array = [...form.content]
        array[parent].container[index] = {...array[parent].container[index], header: e.target.value};
        setForm({...form, content: array})
    }

    const selectValue = (e, index, parent, type) => {
        var array = [...form.content]
        if(type === 'language') array[parent].container[index] = {...array[parent].container[index], language: e.target.value};
        else if(type === 'theme') array[parent].container[index] = {...array[parent].container[index], theme: e.target.value};
        else if(type === 'icon') array[parent].container[index] = {...array[parent].container[index], icon: e.target.value};
        setForm({...form, content: array})
    }

    const nameValue = (e, index, parent) => {
        var array = [...form.content];
        array[parent].container[index] = {...array[parent].container[index], name: e.target.value};
        setForm({...form, content: array});
    }

    const linkValue = (e, index, parent) => {
        var array = [...form.content];
        array[parent].container[index] = {...array[parent].container[index], link: e.target.value};
        setForm({...form, content: array});
    }

    const paragraphValue = (e, index, parent) => {
        var array = [...form.content];
        array[parent].container[index] = {...array[parent].container[index], paragraph: e.target.value};
        setForm({...form, content: array});
    }

    const headingValue = (e, index, parent) => {
        var array = [...form.content]
        array[parent].container[index] = {...array[parent].container[index], heading: e.target.value};
        setForm({...form, content: array})
    }

    const singleInputValue = (e, index, parent) => {
        var array = [...form.content]
        array[parent].container[index] = {...array[parent].container[index], image: e.target.value};
        setForm({...form, content: array})
    }

    const gridInputValue = (e, index, parent) => {
        var array = [...form.content]
        array[parent].container[index] = {...array[parent].container[index], input: e.target.value};
        setForm({...form, content: array})
    }

    const listInputValue = (e, index, parent) => {
        var array = [...form.content]
        array[parent].container[index] = {...array[parent].container[index], input: e.target.value};
        setForm({...form, content: array})
    }

    const listInputValueMulti = (e, index, parent, type) => {
        var array = [...form.content]

        if(type === 'image') array[parent].container[index] = {...array[parent].container[index], image_input: e.target.value};
        else if(type === 'link') array[parent].container[index] = {...array[parent].container[index], link_input: e.target.value};
        else if(type === 'heading') array[parent].container[index] = {...array[parent].container[index], heading_input: e.target.value};
        else if(type == 'sub_heading') array[parent].container[index] = {...array[parent].container[index], sub_input: e.target.value};
        
        setForm({...form, content: array})
    }
    
    const typeValue = (e, index, parent) => {
        var array = [...form.content]
        array[parent].container[index] = {...array[parent].container[index], type: e.target.value};
        setForm({...form, content: array})
    }

    const addGridContentImage = (index, parent) => {       
        var array = [...form.content]

        if(!array[parent].container[index].input) return
        array[parent].container[index] = {
            ...array[parent].container[index],
            grid_image: [...array[parent].container[index].grid_image, array[parent].container[index].input],
            input: ''
        };

        setForm({...form, content: array})
    }

    const addLists = (index, parent) => {       
        var array = [...form.content]

        if(!array[parent].container[index].input) return

        array[parent].container[index] = {
            ...array[parent].container[index],
            list: [...array[parent].container[index].list, array[parent].container[index].input],
            input: ''
        };

        setForm({...form, content: array})
    }

    const addListsMulti = (index, parent) => {       
        var array = [...form.content]

        if(!array[parent].container[index].heading_input) return

        array[parent].container[index] = {
            ...array[parent].container[index],
            list: [
                ...array[parent].container[index].list,
                {
                    image: array[parent].container[index].image_input,
                    link: array[parent].container[index].link_input,
                    heading: array[parent].container[index].heading_input,
                    sub_heading: array[parent].container[index].sub_input,
                }
            ],
            image_input: '',
            link_input: '',
            heading_input: '',
            sub_input: '',
        };

        setForm({...form, content: array})
    }

    const addListsDownloads = (index, parent) => {       
        var array = [...form.content]

        if(!array[parent].container[index].input || !array[parent].container[index].link) return

        array[parent].container[index] = {
            ...array[parent].container[index],
            list: [
                ...array[parent].container[index].list,
                {
                    name: array[parent].container[index].input,
                    link: array[parent].container[index].link,
                    icon: array[parent].container[index].icon,
                }
            ],
            icon: 'fa-file-download',
            input: '',
            link: '',
        };

        setForm({...form, content: array})
    }

    const removeLists = (parent_index, child_index, parent) => {
        var array = [...form.content]

        array[parent].container[parent_index].list.splice(child_index, 1)

        setForm({...form, content: array})
    }

    const removeGridContentImage = (parent_index, child_index, parent) => {
        var array = [...form.content]

        array[parent].container[parent_index].grid_image.splice(child_index, 1)

        setForm({...form, content: array})
    }

    const cancelEdit = () => {
        setTags([])
        setForm({
            featured_image: '',
            post_title: '',
            date_start: '',
            date_end: '',
            created_for: 'Personal',
            content: [
                { 
                    header: 'Container Box',
                    container: [{ header: 'Heading',  element: 'heading', heading: ''}]
                }
            ],
            tags: [],
            categories: 'Gaming'
        })
        setImage('')
        setimageFile('')
        setEdit(false)
        setEditIndex(0)
    }

    useEffect(() => {
        if(edit) {
            window.scrollTo(0, 150)
            setTags(projects[editIndex].tags)

            const originalContent = projects[editIndex].content;
            const copiedContent = JSON.parse(JSON.stringify(originalContent));

            setForm({ 
                featured_image: projects[editIndex].featured_image,
                post_title: projects[editIndex].post_title,
                date_start: projects[editIndex].date_start,
                date_end: projects[editIndex].date_end,
                created_for: projects[editIndex].created_for,
                content: copiedContent,
                tags: projects[editIndex].tags,
                categories: projects[editIndex].categories
            })
 
            setImage(projects[editIndex].featured_image)
        }
    }, [edit])

    useEffect(() => {
        if(deleteIndex !== null) {
            if(confirm("do you want to delete this project?")) {
                dispatch(removeUserProject({ 
                    id: user.result?._id,
                    project_id: projects[deleteIndex]._id 
                }))
            }
            setDeleteIndex(null)
        }
    }, [deleteIndex])

    const handleSubmit = () => {
        if(!image || !form.post_title || !form.categories) return

        const obj = {...form}
        obj['tags'] = tags
        obj['featured_image'] = image

        if(!submitted) {
            dispatch(uploadProject({
                id: user.result?._id,
                data: obj
            }))
            setSubmitted(true)
        }
    }

    const handleEdit = () => {
        if(!form.post_title || !form.categories) return

        if(!submitted) {
            let updatedRecord = {
                ...project[editIndex],
                featured_image: image ? image : form.featured_image,
                post_title: form.post_title,
                date_start: form.date_start,
                date_end: form.date_end,
                created_for: form.created_for,
                content: form.content,
                tags: tags,
                categories: form.categories,
            }

            dispatch(editUserProject({
                id: user.result?._id,
                data: updatedRecord
            }))

            setSubmitted(true)
        }
    }
    
    const ProjectLists = ({data, index, setEdit, setEditIndex, setDeleteIndex}) => {

        const [open, setOpen] = useState(false)

        return (
            <div className='relative bg-white hover:bg-blue-100 transision-all hover:cursor-pointer w-full p-2 pb-6 border border-solid border-gray-300 rounded-md'>
                <button onClick={() => setOpen(!open)} className='absolute top-0 right-0 px-2 mx-2 my-2 text-2xl bg-white opacity-70'><FontAwesomeIcon icon={faEllipsisH} className=''/></button>
                {
                    open &&
                    <div className='absolute top-8 right-4 bg-gray-100 shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] p-2 px-4 text-sm rounded-md'>
                        <button 
                            onClick={() => {
                                setEditIndex(index)
                                setEdit(true)
                                setOpen(false)
                            }}
                            className='hover:text-[#FB2736] mb-1'><FontAwesomeIcon icon={faPencilAlt}/> Edit
                        </button>
                        <br/>
                        <button onClick={() => setDeleteIndex(index)} className='hover:text-[#FB2736]'><FontAwesomeIcon icon={faTrashAlt}/> Delete</button>
                    </div>
                }
                <img
                    className='object-cover w-full h-52'
                    src={convertDriveImageLink(data.featured_image)}
                />
                <div className='px-2 pb-2 font-poppins'>
                    <h2 className='text-lg font-semibold my-2 mr-2 leading-7'>{data.post_title}</h2>
                    <div className='flex flex-wrap absolute bottom-3'>
                        <p className='text-sm text-gray-600'>{data.views.length} view{data.views.length > 1 && 's'} • </p>
                        <p className='text-sm text-gray-600 ml-1'> {data.likes.length} like{data.likes.length > 1 && 's'} •</p>
                        <p className='text-sm text-gray-600 ml-1'> {data.comment.length} comment{data.comment.length > 1 && 's'}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
            <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} open={open} setOpen={setOpen} path={path}/>
            <div class="flex flex-col flex-1">
                <AdminNavbar isOpen={isOpen} setIsOpen={setIsOpen} path={path}/>
                <main class="h-full pb-16 overflow-y-auto">
                    <div class="mx-auto grid"></div>
                        <div className="relative bg-[#F9FAFB]">   
                            <SideAlert
                                variants={alertInfo.variant}
                                heading={message.heading}
                                paragraph={message.paragraph}
                                active={active}
                                setActive={setActive}
                            />

                            <ImageModal
                                openModal={imageModal}
                                setOpenModal={setImageModal}
                                image={image}
                                setImage={setImage}
                                preview={preview}
                                setPreview={setPreview}
                                aspects='landscape'
                            />

                            {
                                (!showForm && !edit) &&
                                <>
                                <div className="sm:mx-16 mx-6 pt-8 flex justify-between items-center text-sm">
                                    <h2 className='text-3xl font-bold my-4 text-gray-800'>Projects</h2>
                                    <div>
                                        <button onClick={() => {
                                            setShowForm(true)
                                            cancelEdit()
                                        }} className="sm:my-8 py-2 px-4 border-[#CAD5DF] leading-5 text-white font-semibold transition-colors duration-150 bg-blue-600 border border-transparent rounded-md active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-purple">
                                            <FontAwesomeIcon icon={faPlus}/>
                                        </button>   
                                    </div>
                                </div>
                                {
                                    alertInfo.alert && alertInfo.variant && showAlert &&
                                        <div className="sm:mx-16 mx-6"><Alert variants={alertInfo.variant} text={alertInfo.alert} show={showAlert} setShow={setShowAlert} /></div>
                                }
                                </>
                            }
                            
                            <div className="relative text-sm">   
                                <div className={`${styles.marginX} ${styles.flexCenter}`}>
                                    <div className={`${styles.boxWidthEx}`}>
                                        <div className="container mx-auto relative px-0 pb-16">
                                            
                                            <div className='grid md:grid-cols-1 grid-cols-1 gap-5 place-content-start mb-4 font-poppins'>
                                                <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-8">

                                                    {
                                                        (!showForm && !edit) &&
                                                            projects?.length > 0 &&
                                                                projects.map((item, index) => {
                                                                    return (
                                                                        <ProjectLists 
                                                                            data={item} 
                                                                            index={index}
                                                                            setEdit={setEdit}
                                                                            setEditIndex={setEditIndex}
                                                                            setDeleteIndex={setDeleteIndex}
                                                                            key={index}/>
                                                                    )
                                                                })
                                                    }
                                                    

                                                </div>
                                                
                                                { 
                                                    (showForm || edit) &&
                                                <>
                                                <div className="flex flex-row justify-between items-center mb-8">
                                                    <h2 className='text-3xl font-bold my-4 text-gray-800'>{ edit ? 'Edit Project' : 'New Project' }</h2>  
                                                    {
                                                        edit &&
                                                        <div className='flex justify-end'>
                                                            <button onClick={() => cancelEdit()} className='sm:my-8 py-2 px-4 border-[#CAD5DF] leading-5 text-white font-semibold transition-colors duration-150 bg-blue-600 border border-transparent rounded-md active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-purple'>
                                                                Cancel
                                                            </button>
                                                        </div>      
                                                    }
                                                    {
                                                        showForm &&
                                                        <div className='flex justify-end'>
                                                            <button onClick={() => setShowForm(false)} className='sm:my-8 py-2 px-4 border-[#CAD5DF] leading-5 text-white font-semibold transition-colors duration-150 bg-blue-600 border border-transparent rounded-md active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-purple'>
                                                                Cancel
                                                            </button>
                                                        </div>      
                                                    }
                                                </div>
                                                <div className="text-base">
                                                    {
                                                        alertInfo.alert && alertInfo.variant && showAlert &&
                                                            <Alert variants={alertInfo.variant} text={alertInfo.alert} show={showAlert} setShow={setShowAlert} />
                                                    }
                                                </div>
                                                <div className="md:flex items-start justify-center mt-4">
                                                    
                                                    <div className="lg:w-1/3 md:w-1/3 w-full">
                                                        <div className='grid sm:grid-cols-2 grid-cols-1  gap-5 place-content-start '>
                                                            <h2 className='text-2xl font-bold text-gray-800 my-4'>Details</h2>        
                                                        </div>

                                                        <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                            <div className='flex flex-col'>
                                                                <label className='font-semibold'> Featured Image Url: </label>
                                                                <div className='flex flex-row'>
                                                                    <input 
                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                        id="file_input" 
                                                                        type="file"
                                                                        accept="image/*" 
                                                                        value={imageFile}
                                                                        onChange={(e) => {
                                                                            setimageFile(e.target.value)
                                                                            cropImage(e.target.files[0] || null)
                                                                        }}
                                                                    />
                                                                    {
                                                                        image && (
                                                                            <div className='flex flex-row items-end'>
                                                                                <button 
                                                                                    onClick={() => {
                                                                                        setPreview(true)
                                                                                        setImageModal(true)
                                                                                    }} 
                                                                                    className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2 py-3'><FontAwesomeIcon icon={faEye} className="mx-4"/>
                                                                                </button>
                                                                            </div>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                            <div className='flex flex-col'>
                                                                <label className='font-semibold'> Post Title: </label>
                                                                <input 
                                                                    type="text" 
                                                                    className='p-2 border border-solid border-[#c0c0c0]'
                                                                    value={form.post_title}
                                                                    onChange={(e) => setForm({...form, post_title: e.target.value})}
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
                                                            <div className='flex flex-col'>
                                                                <label className='font-semibold'> Project Started </label>
                                                                <input 
                                                                    type="date" 
                                                                    className='p-2 border border-solid border-[#c0c0c0]'
                                                                    value={form.date_start}
                                                                    onChange={(e) => setForm({...form, date_start: e.target.value})}
                                                                />
                                                            </div>
                                                            <div className='flex flex-col'>
                                                                <label className='font-semibold'> Project Ended </label>
                                                                <input 
                                                                    type="date" 
                                                                    className='p-2 border border-solid border-[#c0c0c0]'
                                                                    value={form.date_end}
                                                                    onChange={(e) => setForm({...form, date_end: e.target.value})}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                            <div className='flex flex-col'>
                                                                <label className='font-semibold'> Project Purpose: </label>
                                                                <select
                                                                    className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                    value={form.created_for}
                                                                    onChange={(e) => setForm({...form, created_for: e.target.value})}
                                                                >
                                                                <option value="Personal" className="capitalize">Personal</option>
                                                                <option value="School" className="capitalize">School</option>
                                                                <option value="Client" className="capitalize">Client</option>
                                                                <option value="Others" className="capitalize">Others</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                            <div className='flex flex-col'>
                                                                <label className='font-semibold'> Category: </label>
                                                                <select
                                                                    className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                    value={form.categories}
                                                                    onChange={(e) => setForm({...form, categories: e.target.value})}
                                                                >   
                                                                    {
                                                                        category?.length > 0 &&
                                                                            category.map((item, index) => {
                                                                                return (
                                                                                    <option key={index} value={`${item._id}`} className="capitalize">{item.category}</option>
                                                                                )
                                                                            })
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className='grid grid-cols-1  gap-5 place-content-start'>
                                                            <div className='flex flex-col'>
                                                                <label className='font-semibold'> Add Tags: </label>
                                                                <div className='flex flex-row'>
                                                                    <input 
                                                                        type="text" 
                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                        value={input.tags}
                                                                        onChange={(e) => setInput({...input, tags: e.target.value})}
                                                                    />
                                                                    <div className='flex flex-row items-end'>
                                                                        <button onClick={addTags} className='float-left border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>          

                                                        {
                                                            tags && tags.length > 0 &&
                                                                <div className='flex flex-wrap items-center gap-2 mt-2 mb-4 relative border-[2px] border-dashed border-gray-400 p-2 rounded-md'>
                                                                {
                                                                    tags.map((item, index) => {
                                                                        return (
                                                                            <button
                                                                                key={index}
                                                                                className="flex items-center justify-between px-2 py-1 text-xs font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-lg active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-purple"
                                                                            >
                                                                                {item}
                                                                                <FontAwesomeIcon onClick={deleteTags} id={index} icon={faClose} className="ml-2 cursor-pointer" />
                                                                            </button>
                                                                        )
                                                                    })
                                                                }
                                                                </div>
                                                        }
                                                        {
                                                            edit ? 
                                                            <div className='grid grid-cols-1 gap-5 place-content-start mt-4 text-sm'>
                                                                <button onClick={handleEdit} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
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
                                                            :
                                                            <div className='grid grid-cols-1 gap-5 place-content-start mt-4 text-sm'>
                                                                <button onClick={handleSubmit} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
                                                                    {
                                                                        !submitted ?
                                                                        "Upload"
                                                                        :
                                                                        <div className='flex flex-row justify-center items-center'>
                                                                            Uploading
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
                                                        }
                                                    </div>
                                                    <div className="lg:w-3/4 md:w-3/4 w-full md:pl-8">
                                                        <div className='grid sm:grid-cols-2 grid-cols-1  gap-5 place-content-start '>
                                                            <h2 className='text-2xl font-bold text-gray-800 my-4 mb-2'>Content</h2>        
                                                        </div>
                                                        {
                                                            form.content?.length > 0 &&
                                                                form.content.map((box, box_index) => {
                                                                    return(
                                                                    <div key={box_index}>
                                                                        <div className='flex flex-row justify-between pt-2'>
                                                                            <input 
                                                                                type="text" 
                                                                                className='border-none font-semibold outline-none'
                                                                                onChange={(e) => headerContainerValue(e, box_index)}
                                                                                value={ form.content[box_index].header }
                                                                            />
                                                                            {/* <label className='font-semibold'> Normal Paragraph: </label> */}
                                                                            <div>
                                                                                {
                                                                                    form.content.length === 1 ?
                                                                                        <button onClick={() => removeContainer(box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                    :
                                                                                    box_index === 0 && form.content.length !== 1 ?
                                                                                    <>
                                                                                        <button title="move downwards" onClick={() => moveContainerDownwards(box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                        <button title="remove elements" onClick={() => removeContainer(box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                    </>
                                                                                    : box_index === (form.content.length - 1) ?
                                                                                    <>
                                                                                        <button title="move upwards" onClick={() => moveContainerUpwards(box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                        <button title="remove elements" onClick={() => removeContainer(box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                    </>
                                                                                    :
                                                                                    <>
                                                                                        <button title="move upwards" onClick={() => moveContainerUpwards(box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                        <button title="move downwards" onClick={() => moveContainerDownwards(box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                        <button title="remove elements" onClick={() => removeContainer(box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                    </>
                                                                                    
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    <div className='border border-solid border-gray-500 p-4 mt-4'>
                                                                        <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                            <div className='flex flex-col'>
                                                                                <label className='font-semibold'> Element Content: </label>
                                                                                <div className='flex flex-row'>
                                                                                    <select
                                                                                        className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                        default={`normal_naragraph-${box_index}`}
                                                                                        value={contentSelected}
                                                                                        onChange={(e) => setContentSelected(e.target.value)}
                                                                                    >
                                                                                        <option value="" className="capitalize" disabled={true}>Select Element</option>
                                                                                        <option disabled={true} className='text-sm'>-----Text</option>
                                                                                        <option value="heading" className="capitalize">Heading</option>
                                                                                        <option value="sub_heading" className="capitalize">Sub Heading</option>
                                                                                        <option value="normal_naragraph" className="capitalize">Normal Paragraph</option>
                                                                                        <option value="quoted_paragraph" className="capitalize">Quoted Paragraph</option>
                                                                                        <option value="code_highlights" className="capitalize">Code Highlights</option>
                                                                                        <option disabled={true} className='text-sm'>-----List</option>
                                                                                        <option value="bullet_list" className="capitalize">Bullet List</option>
                                                                                        <option value="number_list" className="capitalize">Number List</option>
                                                                                        <option value="download_list" className="capitalize">Download List</option>
                                                                                        <option value="list_image" className="capitalize">List Image</option>
                                                                                        <option disabled={true} className='text-sm'>-----Image</option>
                                                                                        <option value="slider" className="capitalize">Slider</option>
                                                                                        <option value="grid_image" className="capitalize">Grid Image</option>
                                                                                        <option value="single_image" className="capitalize">Single Image</option>
                                                                                        <option disabled={true} className='text-sm'>-----Section</option>
                                                                                        <option value="grid_column" className="capitalize">Grid Columns</option>
                                                                                    </select>
                                                                                    <div className='flex flex-row items-end'>
                                                                                        <button onClick={() => addContentElements(box_index)} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>     

                                                                        <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
                                                                            {
                                                                                form.content?.length > 0 &&
                                                                                    form.content[box_index].container.map((item, index) => {
                                                                                        return (
                                                                                            <>
                                                                                            {
                                                                                                item.element === 'normal_naragraph' ?
                                                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                    <div className='flex flex-col'>
                                                                                                        <div className='flex flex-row justify-between py-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='border-none font-semibold outline-none'
                                                                                                                onChange={(e) => headerValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].header }
                                                                                                            />
                                                                                                            {/* <label className='font-semibold'> Normal Paragraph: </label> */}
                                                                                                            <div>
                                                                                                                {
                                                                                                                    form.content[box_index].container.length === 1 ?
                                                                                                                        <button onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    :
                                                                                                                    index === 0 && form.content[box_index].container.length !== 1 ?
                                                                                                                    <>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    : index === (form.content[box_index].container.length - 1) ?
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='flex flex-row'>
                                                                                                            <textarea
                                                                                                                name="paragraph"
                                                                                                                id="message"
                                                                                                                cols="30"
                                                                                                                rows="8"
                                                                                                                placeholder="Paragraph"
                                                                                                                className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                                                onChange={(e) => paragraphValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].paragraph }
                                                                                                            >
                                                                                                            </textarea>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                :
                                                                                                item.element === 'quoted_paragraph' ?
                                                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                    <div className='flex flex-col'>
                                                                                                        <div className='flex flex-row justify-between py-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='border-none font-semibold outline-none'
                                                                                                                onChange={(e) => headerValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].header }
                                                                                                            />
                                                                                                            <div>
                                                                                                                {
                                                                                                                    form.content[box_index].container.length === 1 ?
                                                                                                                        <button onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    :
                                                                                                                    index === 0 && form.content[box_index].container.length !== 1 ?
                                                                                                                    <>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    : index === (form.content[box_index].container.length - 1) ?
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='flex flex-row'>
                                                                                                            <textarea
                                                                                                                name="quoted"
                                                                                                                id="message"
                                                                                                                cols="30"
                                                                                                                rows="4"
                                                                                                                placeholder="Quoted Paragraph"
                                                                                                                className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                                                onChange={(e) => paragraphValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].paragraph }
                                                                                                            >
                                                                                                            </textarea>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                :
                                                                                                item.element === 'heading' ?
                                                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                    <div className='flex flex-col'>
                                                                                                        <div className='flex flex-row justify-between py-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='border-none font-semibold outline-none'
                                                                                                                onChange={(e) => headerValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].header }
                                                                                                            />
                                                                                                            <div>
                                                                                                                {
                                                                                                                    form.content[box_index].container.length === 1 ?
                                                                                                                        <button onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    :
                                                                                                                    index === 0 && form.content[box_index].container.length !== 1 ?
                                                                                                                    <>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    : index === (form.content[box_index].container.length - 1) ?
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='flex flex-row'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                onChange={(e) => headingValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].heading }
                                                                                                                placeholder='Heading'
                                                                                                            />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                :
                                                                                                item.element === 'sub_heading' ?
                                                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                    <div className='flex flex-col'>
                                                                                                        <div className='flex flex-row justify-between py-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='border-none font-semibold outline-none'
                                                                                                                onChange={(e) => headerValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].header }
                                                                                                            />
                                                                                                            <div>
                                                                                                                {
                                                                                                                    form.content[box_index].container.length === 1 ?
                                                                                                                        <button onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    :
                                                                                                                    index === 0 && form.content[box_index].container.length !== 1 ?
                                                                                                                    <>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    : index === (form.content[box_index].container.length - 1) ?
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='flex flex-row'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                onChange={(e) => headingValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].heading }
                                                                                                                placeholder='Sub Heading'
                                                                                                            />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                :
                                                                                                item.element === 'grid_image' ?
                                                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                    <div className='flex flex-col'>
                                                                                                        <div className='flex flex-row justify-between py-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='border-none font-semibold outline-none'
                                                                                                                onChange={(e) => headerValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].header }
                                                                                                            />
                                                                                                            <div>
                                                                                                                {
                                                                                                                    form.content[box_index].container.length === 1 ?
                                                                                                                        <button onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    :
                                                                                                                    index === 0 && form.content[box_index].container.length !== 1 ?
                                                                                                                    <>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    : index === (form.content[box_index].container.length - 1) ?
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='flex flex-row'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                onChange={(e) => gridInputValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].input }
                                                                                                                placeholder='Image URL'
                                                                                                            />
                                                                                                            <div className='flex flex-row items-end'>
                                                                                                                <button onClick={() => addGridContentImage(index, box_index)} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='flex flex-col'>
                                                                                                            <label className='font-semibold'> Image/s dimension: </label>
                                                                                                            <select
                                                                                                                className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                                default="normal_naragraph"
                                                                                                                value={form.content[box_index].container[index].type}
                                                                                                                onChange={(e) => typeValue(e, index, box_index)}
                                                                                                            >
                                                                                                                <option value="boxed" className="capitalize">Boxed</option>
                                                                                                                <option value="boxed_full" className="capitalize">Boxed Full</option>
                                                                                                                <option value="rectangular" className="capitalize">Rectangular</option>
                                                                                                                <option value="auto" className="capitalize">Auto</option>
                                                                                                            </select>
                                                                                                        </div>
                                                                                                        {
                                                                                                            form.content[box_index].container[index].grid_image.length > 0 &&
                                                                                                            <>
                                                                                                            <div className={`grid ${(form.content[box_index].container[index].type === 'boxed') && 'sm:grid-cols-2'} grid-cols-1 gap-5 place-content-start my-4`}>
                                                                                                                {
                                                                                                                    form.content[box_index].container[index].grid_image.map((image, i) => {
                                                                                                                        return (
                                                                                                                            <div key={i} className='relative'>
                                                                                                                                <img 
                                                                                                                                    src={image}
                                                                                                                                    className={`w-full ${form.content[box_index].container[index].type === 'boxed-full' && 'md:h-[500px] sm:h-[400px] h-[300px]'} ${(form.content[box_index].container[index].type === 'boxed' || form.content[box_index].container[index].type === 'rectangular') && 'md:h-60 h-48'} object-cover bg-top rounded-lg border border-[#cococo]`}
                                                                                                                                    alt={`Grid Image #${i+1}`}
                                                                                                                                />
                                                                                                                                <button title="remove image" onClick={() => removeGridContentImage(index, i, box_index)} className='absolute top-2 right-4'><FontAwesomeIcon icon={faClose} className='cursor-pointer'/></button>
                                                                                                                            </div>
                                                                                                                        )
                                                                                                                    })
                                                                                                                }
                                                                                                            </div>
                                                                                                            </>
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                :
                                                                                                item.element === 'slider' ?
                                                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                    <div className='flex flex-col'>
                                                                                                        <div className='flex flex-row justify-between py-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='border-none font-semibold outline-none'
                                                                                                                onChange={(e) => headerValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].header }
                                                                                                            />
                                                                                                            <div>
                                                                                                                {
                                                                                                                    form.content[box_index].container.length === 1 ?
                                                                                                                        <button onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    :
                                                                                                                    index === 0 && form.content[box_index].container.length !== 1 ?
                                                                                                                    <>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    : index === (form.content[box_index].container.length - 1) ?
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='flex flex-row'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                onChange={(e) => gridInputValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].input }
                                                                                                                placeholder='Image URL'
                                                                                                            />
                                                                                                            <div className='flex flex-row items-end'>
                                                                                                                <button onClick={() => addGridContentImage(index, box_index)} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        {
                                                                                                            form.content[box_index].container[index].grid_image.length > 0 &&
                                                                                                            <>
                                                                                                            <Carousel 
                                                                                                                showDots={true}
                                                                                                                responsive={responsive} className="relative"
                                                                                                                customLeftArrow={<CustomLeft />}
                                                                                                                customRightArrow={<CustomRight />}
                                                                                                                slidesToSlide={1}
                                                                                                                swipeable
                                                                                                                autoPlay={true}
                                                                                                                infinite={true}
                                                                                                            >
                                                                                                        
                                                                                                                {
                                                                                                                    form.content[box_index].container[index].grid_image.length > 0 &&
                                                                                                                        form.content[box_index].container[index].grid_image.map((item, index) => {
                                                                                                                            return (
                                                                                                                                <div key={index} className='md:px-8 md:py-4 w-full md:h-[400px] h-[200px] overflow-hidden relative'>
                                                                                                                                    <img
                                                                                                                                        src={item}
                                                                                                                                        alt={`gallery #${index+1}`}
                                                                                                                                        className='w-full md:h-[400px] h-[200px] object-cover border border-gray-900 transition duration-500 ease-in-out transform hover:scale-105'
                                                                                                                                    />
                                                                                                                                    <button title="remove image" onClick={() => removeGridContentImage(index, i, box_index)} className='absolute top-2 right-4'><FontAwesomeIcon icon={faClose} className='cursor-pointer'/></button>
                                                                                                                                </div>  
                                                                                                                            )
                                                                                                                        })
                                                                                                                    }
                                                                                                        
                                                                                                            </Carousel>
                                                                                                            </>
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                :
                                                                                                item.element === 'single_image' ?
                                                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                    <div className='flex flex-col'>
                                                                                                        <div className='flex flex-row justify-between py-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='border-none font-semibold outline-none'
                                                                                                                onChange={(e) => headerValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].header }
                                                                                                            />
                                                                                                            <div>
                                                                                                                {
                                                                                                                    form.content[box_index].container.length === 1 ?
                                                                                                                        <button onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    :
                                                                                                                    index === 0 && form.content[box_index].container.length !== 1 ?
                                                                                                                    <>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    : index === (form.content[box_index].container.length - 1) ?
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='flex flex-row'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                onChange={(e) => singleInputValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].image }
                                                                                                                placeholder='Image URL'
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className='flex flex-col'>
                                                                                                            <label className='font-semibold'> Image/s dimension: </label>
                                                                                                            <select
                                                                                                                className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                                default="normal_naragraph"
                                                                                                                value={form.content[box_index].container[index].type}
                                                                                                                onChange={(e) => typeValue(e, index, box_index)}
                                                                                                            >
                                                                                                                <option value="rectangular" className="capitalize">Rectangular</option>
                                                                                                                <option value="boxed_full" className="capitalize">Boxed Full</option>
                                                                                                                <option value="auto" className="capitalize">Auto</option>
                                                                                                            </select>
                                                                                                        </div>
                                                                                                        {
                                                                                                            form.content[box_index].container[index].image &&
                                                                                                                <div className='relative mt-2'>
                                                                                                                    <img 
                                                                                                                        src={form.content[box_index].container[index].image}
                                                                                                                        className={`w-full ${form.content[box_index].container[index].type === 'boxed-full' && 'md:h-[500px] sm:h-[400px] h-[300px]'} ${(form.content[box_index].container[index].type === 'rectangular') && 'md:h-60 h-48'} object-cover bg-top rounded-lg border border-[#cococo]`}
                                                                                                                        alt={`Grid Image`}
                                                                                                                    />
                                                                                                                </div>
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                :
                                                                                                item.element === 'bullet_list' ?
                                                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                    <div className='flex flex-col'>
                                                                                                        <div className='flex flex-row justify-between py-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='border-none font-semibold outline-none'
                                                                                                                onChange={(e) => headerValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].header }
                                                                                                            />
                                                                                                            <div>
                                                                                                                {
                                                                                                                    form.content[box_index].container.length === 1 ?
                                                                                                                        <button onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    :
                                                                                                                    index === 0 && form.content[box_index].container.length !== 1 ?
                                                                                                                    <>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    : index === (form.content[box_index].container.length - 1) ?
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='flex flex-row mb-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                onChange={(e) => listInputValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].input }
                                                                                                                placeholder='Lists Items'
                                                                                                            />
                                                                                                            <div className='flex flex-row items-end'>
                                                                                                                <button onClick={() => addLists(index, box_index)} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        {
                                                                                                            form.content[box_index].container[index].list.length > 0 &&
                                                                                                                form.content[box_index].container[index].list.map((list_item, i) => {
                                                                                                                    return (
                                                                                                                        <button
                                                                                                                            key={i}
                                                                                                                            className="mb-1 flex items-center justify-between px-2 py-1 text-xs font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-md active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-purple"
                                                                                                                        >
                                                                                                                            {list_item}
                                                                                                                            <FontAwesomeIcon onClick={() => removeLists(index, i, box_index)} id={i} icon={faClose} className="ml-2 cursor-pointer" />
                                                                                                                        </button>
                                                                                                                    )
                                                                                                                })
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                :
                                                                                                item.element === 'list_image' ?
                                                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                    <div className='flex flex-col'>
                                                                                                        <div className='flex flex-row justify-between py-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='border-none font-semibold outline-none'
                                                                                                                onChange={(e) => headerValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].header }
                                                                                                            />
                                                                                                            <div className='flex'>
                                                                                                                {
                                                                                                                    form.content[box_index].container.length === 1 ?
                                                                                                                        <button onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    :
                                                                                                                    index === 0 && form.content[box_index].container.length !== 1 ?
                                                                                                                    <>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    : index === (form.content[box_index].container.length - 1) ?
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    
                                                                                                                }
                                                                                                                <div className='flex flex-row items-end ml-4'>
                                                                                                                    <button onClick={() => addListsMulti(index, box_index)} className='float-left text-sm font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add List</button>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start text-sm'>
                                                                                                            <div className='flex flex-col'>
                                                                                                                <label className='font-semibold text-sm'> Image URL </label>
                                                                                                                <input 
                                                                                                                    type="text" 
                                                                                                                    className='p-2 border border-solid border-[#c0c0c0]'
                                                                                                                    onChange={(e) => listInputValueMulti(e, index, box_index, 'image')}
                                                                                                                    value={ form.content[box_index].container[index].image_input }
                                                                                                                    placeholder="Image URL"
                                                                                                                />
                                                                                                            </div>
                                                                                                            <div className='flex flex-col text-sm'>
                                                                                                                <label className='font-semibold text-sm'> Link URL </label>
                                                                                                                <input 
                                                                                                                    type="text" 
                                                                                                                    className='p-2 border border-solid border-[#c0c0c0]'
                                                                                                                    onChange={(e) => listInputValueMulti(e, index, box_index, 'link')}
                                                                                                                    value={ form.content[box_index].container[index].link_input }
                                                                                                                    placeholder="Link URL"
                                                                                                                />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start text-sm'>
                                                                                                            <div className='flex flex-col'>
                                                                                                                <label className='font-semibold text-sm'> Heading </label>
                                                                                                                <textarea
                                                                                                                    name="message"
                                                                                                                    id="message"
                                                                                                                    cols="30"
                                                                                                                    rows="3"
                                                                                                                    placeholder="Heading"
                                                                                                                    className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                                                    onChange={(e) => listInputValueMulti(e, index, box_index, 'heading')}
                                                                                                                    value={ form.content[box_index].container[index].heading_input }
                                                                                                                >
                                                                                                                </textarea>
                                                                                                            </div>
                                                                                                            <div className='flex flex-col text-sm'>
                                                                                                                <label className='font-semibold text-sm'> Sub Heading </label>
                                                                                                                <textarea
                                                                                                                    name="message"
                                                                                                                    id="message"
                                                                                                                    cols="30"
                                                                                                                    rows="3"
                                                                                                                    placeholder="Sub heading"
                                                                                                                    className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                                                    onChange={(e) => listInputValueMulti(e, index, box_index, 'sub_heading')}
                                                                                                                    value={ form.content[box_index].container[index].sub_input }
                                                                                                                >
                                                                                                                </textarea>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        {
                                                                                                            form.content[box_index].container[index].list.length > 0 &&
                                                                                                                <div className='mt-4'>
                                                                                                                {
                                                                                                                    form.content[box_index].container[index].list.map((list_item, i) => {
                                                                                                                        return (
                                                                                                                            <div className='relative px-2 py-1 mb-1 flex font-poppins items-center text-white transition-colors duration-150 bg-blue-600 border border-transparent active:bg-blue-600 hover:bg-blue-700'>
                                                                                                                                <img 
                                                                                                                                    className='w-12 h-12 border border-solid border-white rounded-md'
                                                                                                                                    src={list_item.image}
                                                                                                                                />
                                                                                                                                <div className='flex flex-col ml-2'> {/*text-[#FB2736]*/}
                                                                                                                                    <h2 className='font-semibold text-base'>{list_item.heading}</h2>
                                                                                                                                    <p className='text-xs drop-shadow-sm'>{list_item.sub_heading}</p>
                                                                                                                                    <a href={list_item.link} target='_blank'><FontAwesomeIcon icon={faExternalLink} className='absolute right-10 top-1/2 transform -translate-y-1/2'/></a>
                                                                                                                                    <FontAwesomeIcon onClick={() => removeLists(index, i, box_index)} id={i} icon={faTrash} className='cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2'/>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        )
                                                                                                                    })
                                                                                                                }
                                                                                                                </div>
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                :
                                                                                                item.element === 'code_highlights' ?
                                                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                    <div className='flex flex-col'>
                                                                                                        <div className='flex flex-row justify-between py-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='border-none font-semibold outline-none'
                                                                                                                onChange={(e) => headerValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].header }
                                                                                                            />
                                                                                                            <div>
                                                                                                                {
                                                                                                                    form.content[box_index].container.length === 1 ?
                                                                                                                        <button onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    :
                                                                                                                    index === 0 && form.content[box_index].container.length !== 1 ?
                                                                                                                    <>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    : index === (form.content[box_index].container.length - 1) ?
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='flex flex-col'>
                                                                                                            <label className='font-semibold text-sm'> Name: </label>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='w-full p-2 border border-solid border-[#c0c0c0] text-sm'
                                                                                                                onChange={(e) => nameValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].name }
                                                                                                                placeholder='Code name'
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start text-sm'>
                                                                                                            <div className='flex flex-col'>
                                                                                                                <label className='font-semibold text-sm'> Language: </label>
                                                                                                                <select
                                                                                                                    className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                                    default="code_highlights"
                                                                                                                    onChange={(e) => selectValue(e, index, box_index, 'language')}
                                                                                                                    value={ form.content[box_index].container[index].language }
                                                                                                                >
                                                                                                                    <option value="1c">1c</option>
                                                                                                                    <option value="abnf">abnf</option>
                                                                                                                    <option value="accesslog">accesslog</option>
                                                                                                                    <option value="actionscript">actionscript</option>
                                                                                                                    <option value="ada">ada</option>
                                                                                                                    <option value="angelscript">angelscript</option>
                                                                                                                    <option value="apache">apache</option>
                                                                                                                    <option value="applescript">applescript</option>
                                                                                                                    <option value="arcade">arcade</option>
                                                                                                                    <option value="arduino">arduino</option>
                                                                                                                    <option value="armasm">armasm</option>
                                                                                                                    <option value="asciidoc">asciidoc</option>
                                                                                                                    <option value="aspectj">aspectj</option>
                                                                                                                    <option value="autohotkey">autohotkey</option>
                                                                                                                    <option value="autoit">autoit</option>
                                                                                                                    <option value="avrasm">avrasm</option>
                                                                                                                    <option value="awk">awk</option>
                                                                                                                    <option value="axapta">axapta</option>
                                                                                                                    <option value="bash">bash</option>
                                                                                                                    <option value="basic">basic</option>
                                                                                                                    <option value="bnf">bnf</option>
                                                                                                                    <option value="brainfuck">brainfuck</option>
                                                                                                                    <option value="c-like">c-like</option>
                                                                                                                    <option value="c">c</option>
                                                                                                                    <option value="cal">cal</option>
                                                                                                                    <option value="capnproto">capnproto</option>
                                                                                                                    <option value="ceylon">ceylon</option>
                                                                                                                    <option value="clean">clean</option>
                                                                                                                    <option value="clojure-repl">clojure-repl</option>
                                                                                                                    <option value="clojure">clojure</option>
                                                                                                                    <option value="cmake">cmake</option>
                                                                                                                    <option value="coffeescript">coffeescript</option>
                                                                                                                    <option value="coq">coq</option>
                                                                                                                    <option value="cos">cos</option>
                                                                                                                    <option value="cpp">cpp</option>
                                                                                                                    <option value="crmsh">crmsh</option>
                                                                                                                    <option value="crystal">crystal</option>
                                                                                                                    <option value="csharp">csharp</option>
                                                                                                                    <option value="csp">csp</option>
                                                                                                                    <option value="css">css</option>
                                                                                                                    <option value="d">d</option>
                                                                                                                    <option value="dart">dart</option>
                                                                                                                    <option value="delphi">delphi</option>
                                                                                                                    <option value="diff">diff</option>
                                                                                                                    <option value="django">django</option>
                                                                                                                    <option value="dns">dns</option>
                                                                                                                    <option value="dockerfile">dockerfile</option>
                                                                                                                    <option value="dos">dos</option>
                                                                                                                    <option value="dsconfig">dsconfig</option>
                                                                                                                    <option value="dts">dts</option>
                                                                                                                    <option value="dust">dust</option>
                                                                                                                    <option value="ebnf">ebnf</option>
                                                                                                                    <option value="elixir">elixir</option>
                                                                                                                    <option value="elm">elm</option>
                                                                                                                    <option value="erb">erb</option>
                                                                                                                    <option value="erlang-repl">erlang-repl</option>
                                                                                                                    <option value="erlang">erlang</option>
                                                                                                                    <option value="excel">excel</option>
                                                                                                                    <option value="fix">fix</option>
                                                                                                                    <option value="flix">flix</option>
                                                                                                                    <option value="fortran">fortran</option>
                                                                                                                    <option value="fsharp">fsharp</option>
                                                                                                                    <option value="gams">gams</option>
                                                                                                                    <option value="gauss">gauss</option>
                                                                                                                    <option value="gcode">gcode</option>
                                                                                                                    <option value="gherkin">gherkin</option>
                                                                                                                    <option value="glsl">glsl</option>
                                                                                                                    <option value="gml">gml</option>
                                                                                                                    <option value="go">go</option>
                                                                                                                    <option value="golo">golo</option>
                                                                                                                    <option value="gradle">gradle</option>
                                                                                                                    <option value="groovy">groovy</option>
                                                                                                                    <option value="haml">haml</option>
                                                                                                                    <option value="handlebars">handlebars</option>
                                                                                                                    <option value="haskell">haskell</option>
                                                                                                                    <option value="haxe">haxe</option>
                                                                                                                    <option value="hsp">hsp</option>
                                                                                                                    <option value="htmlbars">htmlbars</option>
                                                                                                                    <option value="http">http</option>
                                                                                                                    <option value="hy">hy</option>
                                                                                                                    <option value="inform7">inform7</option>
                                                                                                                    <option value="ini">ini</option>
                                                                                                                    <option value="irpf90">irpf90</option>
                                                                                                                    <option value="isbl">isbl</option>
                                                                                                                    <option value="java">java</option>
                                                                                                                    <option value="javascript">javascript</option>
                                                                                                                    <option value="jboss-cli">jboss-cli</option>
                                                                                                                    <option value="json">json</option>
                                                                                                                    <option value="julia-repl">julia-repl</option>
                                                                                                                    <option value="julia">julia</option>
                                                                                                                    <option value="kotlin">kotlin</option>
                                                                                                                    <option value="lasso">lasso</option>
                                                                                                                    <option value="latex">latex</option>
                                                                                                                    <option value="ldif">ldif</option>
                                                                                                                    <option value="leaf">leaf</option>
                                                                                                                    <option value="less">less</option>
                                                                                                                    <option value="lisp">lisp</option>
                                                                                                                    <option value="livecodeserver">livecodeserver</option>
                                                                                                                    <option value="livescript">livescript</option>
                                                                                                                    <option value="llvm">llvm</option>
                                                                                                                    <option value="lsl">lsl</option>
                                                                                                                    <option value="lua">lua</option>
                                                                                                                    <option value="makefile">makefile</option>
                                                                                                                    <option value="markdown">markdown</option>
                                                                                                                    <option value="mathematica">mathematica</option>
                                                                                                                    <option value="matlab">matlab</option>
                                                                                                                    <option value="maxima">maxima</option>
                                                                                                                    <option value="mel">mel</option>
                                                                                                                    <option value="mercury">mercury</option>
                                                                                                                    <option value="mipsasm">mipsasm</option>
                                                                                                                    <option value="mizar">mizar</option>
                                                                                                                    <option value="mojolicious">mojolicious</option>
                                                                                                                    <option value="monkey">monkey</option>
                                                                                                                    <option value="moonscript">moonscript</option>
                                                                                                                    <option value="n1ql">n1ql</option>
                                                                                                                    <option value="nginx">nginx</option>
                                                                                                                    <option value="nim">nim</option>
                                                                                                                    <option value="nix">nix</option>
                                                                                                                    <option value="node-repl">node-repl</option>
                                                                                                                    <option value="nsis">nsis</option>
                                                                                                                    <option value="objectivec">objectivec</option>
                                                                                                                    <option value="ocaml">ocaml</option>
                                                                                                                    <option value="openscad">openscad</option>
                                                                                                                    <option value="oxygene">oxygene</option>
                                                                                                                    <option value="parser3">parser3</option>
                                                                                                                    <option value="perl">perl</option>
                                                                                                                    <option value="pf">pf</option>
                                                                                                                    <option value="pgsql">pgsql</option>
                                                                                                                    <option value="php-template">php-template</option>
                                                                                                                    <option value="php">php</option>
                                                                                                                    <option value="plaintext">plaintext</option>
                                                                                                                    <option value="pony">pony</option>
                                                                                                                    <option value="powershell">powershell</option>
                                                                                                                    <option value="processing">processing</option>
                                                                                                                    <option value="profile">profile</option>
                                                                                                                    <option value="prolog">prolog</option>
                                                                                                                    <option value="properties">properties</option>
                                                                                                                    <option value="protobuf">protobuf</option>
                                                                                                                    <option value="puppet">puppet</option>
                                                                                                                    <option value="purebasic">purebasic</option>
                                                                                                                    <option value="python-repl">python-repl</option>
                                                                                                                    <option value="python">python</option>
                                                                                                                    <option value="q">q</option>
                                                                                                                    <option value="qml">qml</option>
                                                                                                                    <option value="r">r</option>
                                                                                                                    <option value="reasonml">reasonml</option>
                                                                                                                    <option value="rib">rib</option>
                                                                                                                    <option value="roboconf">roboconf</option>
                                                                                                                    <option value="routeros">routeros</option>
                                                                                                                    <option value="rsl">rsl</option>
                                                                                                                    <option value="ruby">ruby</option>
                                                                                                                    <option value="ruleslanguage">ruleslanguage</option>
                                                                                                                    <option value="rust">rust</option>
                                                                                                                    <option value="sas">sas</option>
                                                                                                                    <option value="scala">scala</option>
                                                                                                                    <option value="scheme">scheme</option>
                                                                                                                    <option value="scilab">scilab</option>
                                                                                                                    <option value="scss">scss</option>
                                                                                                                    <option value="shell">shell</option>
                                                                                                                    <option value="smali">smali</option>
                                                                                                                    <option value="smalltalk">smalltalk</option>
                                                                                                                    <option value="sml">sml</option>
                                                                                                                    <option value="sqf">sqf</option>
                                                                                                                    <option value="sql">sql</option>
                                                                                                                    <option value="sql_more">sql_more</option>
                                                                                                                    <option value="stan">stan</option>
                                                                                                                    <option value="stata">stata</option>
                                                                                                                    <option value="step21">step21</option>
                                                                                                                    <option value="stylus">stylus</option>
                                                                                                                    <option value="subunit">subunit</option>
                                                                                                                    <option value="swift">swift</option>
                                                                                                                    <option value="taggerscript">taggerscript</option>
                                                                                                                    <option value="tap">tap</option>
                                                                                                                    <option value="tcl">tcl</option>
                                                                                                                    <option value="thrift">thrift</option>
                                                                                                                    <option value="tp">tp</option>
                                                                                                                    <option value="twig">twig</option>
                                                                                                                    <option value="typescript">typescript</option>
                                                                                                                    <option value="vala">vala</option>
                                                                                                                    <option value="vbnet">vbnet</option>
                                                                                                                    <option value="vbscript-html">vbscript-html</option>
                                                                                                                    <option value="vbscript">vbscript</option>
                                                                                                                    <option value="verilog">verilog</option>
                                                                                                                    <option value="vhdl">vhdl</option>
                                                                                                                    <option value="vim">vim</option>
                                                                                                                    <option value="x86asm">x86asm</option>
                                                                                                                    <option value="xl">xl</option>
                                                                                                                    <option value="xml">xml</option>
                                                                                                                    <option value="xquery">xquery</option>
                                                                                                                    <option value="yaml">yaml</option>
                                                                                                                    <option value="zephir">zephir</option>
                                                                                                                </select>
                                                                                                            </div>
                                                                                                            <div className='flex flex-col'>
                                                                                                                <label className='font-semibold text-sm'> Theme: </label>
                                                                                                                <select
                                                                                                                    className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                                    default="normal_naragraph"
                                                                                                                    onChange={(e) => selectValue(e, index, box_index, 'theme')}
                                                                                                                    value={ form.content[box_index].container[index].theme }
                                                                                                                >
                                                                                                                    <option value="a11y-dark">a11y-dark</option>
                                                                                                                    <option value="a11y-light">a11y-light</option>
                                                                                                                    <option value="agate">agate</option>
                                                                                                                    <option value="an-old-hope">an-old-hope</option>
                                                                                                                    <option value="androidstudio">androidstudio</option>
                                                                                                                    <option value="arduino-light">arduino-light</option>
                                                                                                                    <option value="arta">arta</option>
                                                                                                                    <option value="ascetic">ascetic</option>
                                                                                                                    <option value="atelier-cave-dark">atelier-cave-dark</option>
                                                                                                                    <option value="atelier-cave-light">atelier-cave-light</option>
                                                                                                                    <option value="atelier-dune-dark">atelier-dune-dark</option>
                                                                                                                    <option value="atelier-dune-light">atelier-dune-light</option>
                                                                                                                    <option value="atelier-estuary-dark">atelier-estuary-dark</option>
                                                                                                                    <option value="atelier-estuary-light">atelier-estuary-light</option>
                                                                                                                    <option value="atelier-forest-dark">atelier-forest-dark</option>
                                                                                                                    <option value="atelier-forest-light">atelier-forest-light</option>
                                                                                                                    <option value="atelier-heath-dark">atelier-heath-dark</option>
                                                                                                                    <option value="atelier-heath-light">atelier-heath-light</option>
                                                                                                                    <option value="atelier-lakeside-dark">atelier-lakeside-dark</option>
                                                                                                                    <option value="atelier-lakeside-light">atelier-lakeside-light</option>
                                                                                                                    <option value="atelier-plateau-dark">atelier-plateau-dark</option>
                                                                                                                    <option value="atelier-plateau-light">atelier-plateau-light</option>
                                                                                                                    <option value="atelier-savanna-dark">atelier-savanna-dark</option>
                                                                                                                    <option value="atelier-savanna-light">atelier-savanna-light</option>
                                                                                                                    <option value="atelier-seaside-dark">atelier-seaside-dark</option>
                                                                                                                    <option value="atelier-seaside-light">atelier-seaside-light</option>
                                                                                                                    <option value="atelier-sulphurpool-dark">atelier-sulphurpool-dark</option>
                                                                                                                    <option value="atelier-sulphurpool-light">atelier-sulphurpool-light</option>
                                                                                                                    <option value="atom-one-dark">atom-one-dark</option>
                                                                                                                    <option value="atom-one-dark-reasonable">atom-one-dark-reasonable</option>
                                                                                                                    <option value="atom-one-light">atom-one-light</option>
                                                                                                                    <option value="brown-paper">brown-paper</option>
                                                                                                                    <option value="codepen-embed">codepen-embed</option>
                                                                                                                    <option value="color-brewer">color-brewer</option>
                                                                                                                    <option value="darcula">darcula</option>
                                                                                                                    <option value="dark">dark</option>
                                                                                                                    <option value="default-style">default-style</option>
                                                                                                                    <option value="docco">docco</option>
                                                                                                                    <option value="dracula">dracula</option>
                                                                                                                    <option value="far">far</option>
                                                                                                                    <option value="foundation">foundation</option>
                                                                                                                    <option value="github">github</option>
                                                                                                                    <option value="github-gist">github-gist</option>
                                                                                                                    <option value="gml">gml</option>
                                                                                                                    <option value="googlecode">googlecode</option>
                                                                                                                    <option value="gradient-dark">gradient-dark</option>
                                                                                                                    <option value="gradient-light">gradient-light</option>
                                                                                                                    <option value="grayscale">grayscale</option>
                                                                                                                    <option value="gruvbox-dark">gruvbox-dark</option>
                                                                                                                    <option value="gruvbox-light">gruvbox-light</option>
                                                                                                                    <option value="hopscotch">hopscotch</option>
                                                                                                                    <option value="hybrid">hybrid</option>
                                                                                                                    <option value="idea">idea</option>
                                                                                                                    <option value="ir-black">ir-black</option>
                                                                                                                    <option value="isbl-editor-dark">isbl-editor-dark</option>
                                                                                                                    <option value="isbl-editor-light">isbl-editor-light</option>
                                                                                                                    <option value="kimbie.dark">kimbie.dark</option>
                                                                                                                    <option value="kimbie.light">kimbie.light</option>
                                                                                                                    <option value="lightfair">lightfair</option>
                                                                                                                    <option value="lioshi">lioshi</option>
                                                                                                                    <option value="magula">magula</option>
                                                                                                                    <option value="mono-blue">mono-blue</option>
                                                                                                                    <option value="monokai">monokai</option>
                                                                                                                    <option value="monokai-sublime">monokai-sublime</option>
                                                                                                                    <option value="night-owl">night-owl</option>
                                                                                                                    <option value="nnfx">nnfx</option>
                                                                                                                    <option value="nnfx-dark">nnfx-dark</option>
                                                                                                                    <option value="nord">nord</option>
                                                                                                                    <option value="obsidian">obsidian</option>
                                                                                                                    <option value="ocean">ocean</option>
                                                                                                                    <option value="paraiso-dark">paraiso-dark</option>
                                                                                                                    <option value="paraiso-light">paraiso-light</option>
                                                                                                                    <option value="pojoaque">pojoaque</option>
                                                                                                                    <option value="purebasic">purebasic</option>
                                                                                                                    <option value="qtcreator_dark">qtcreator_dark</option>
                                                                                                                    <option value="qtcreator_light">qtcreator_light</option>
                                                                                                                    <option value="railscasts">railscasts</option>
                                                                                                                    <option value="rainbow">rainbow</option>
                                                                                                                    <option value="routeros">routeros</option>
                                                                                                                    <option value="school-book">school-book</option>
                                                                                                                    <option value="shades-of-purple">shades-of-purple</option>
                                                                                                                    <option value="solarized-dark">solarized-dark</option>
                                                                                                                    <option value="solarized-light">solarized-light</option>
                                                                                                                    <option value="srcery">srcery</option>
                                                                                                                    <option value="stackoverflow-dark">stackoverflow-dark</option>
                                                                                                                    <option value="stackoverflow-light">stackoverflow-light</option>
                                                                                                                    <option value="sunburst">sunburst</option>
                                                                                                                    <option value="tomorrow">tomorrow</option>
                                                                                                                    <option value="tomorrow-night">tomorrow-night</option>
                                                                                                                    <option value="tomorrow-night-blue">tomorrow-night-blue</option>
                                                                                                                    <option value="tomorrow-night-bright">tomorrow-night-bright</option>
                                                                                                                    <option value="tomorrow-night-eighties">tomorrow-night-eighties</option>
                                                                                                                    <option value="vs">vs</option>
                                                                                                                    <option value="vs2015">vs2015</option>
                                                                                                                    <option value="xcode">xcode</option>
                                                                                                                    <option value="xt256">xt256</option>
                                                                                                                    <option value="zenburn">zenburn</option>
                                                                                                                </select>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='grid sm:grid-cols-1 grid-cols-1 gap-5 place-content-start mt-2 text-sm'>
                                                                                                            <div className='flex flex-col'>
                                                                                                                <label className='font-semibold text-sm'> Code: <FontAwesomeIcon onClick={() => setCodePreview(!codePreview)} icon={codePreview ? faEyeSlash : faEye} className='cursor-pointer'/></label>
                                                                                                                {
                                                                                                                    !codePreview &&
                                                                                                                    <textarea
                                                                                                                        name="message"
                                                                                                                        id="message"
                                                                                                                        cols="30"
                                                                                                                        rows="8"
                                                                                                                        placeholder="code"
                                                                                                                        className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                                                        onChange={(e) => paragraphValue(e, index, box_index)}
                                                                                                                        value={ form.content[box_index].container[index].paragraph }
                                                                                                                    >
                                                                                                                    </textarea>
                                                                                                                }
                                                                                                            </div>
                                                                                                            {
                                                                                                                codePreview &&
                                                                                                                <SyntaxHighlighter language={form.content[box_index].container[index].language} style={hljsStyles[form.content[box_index].container[index].theme]} showLineNumbers={true}>
                                                                                                                    {`${form.content[box_index].container[index].paragraph}`}
                                                                                                                </SyntaxHighlighter>
                                                                                                            }
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                :
                                                                                                item.element === 'download_list' ?
                                                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                    <div className='flex flex-col'>
                                                                                                        <div className='flex flex-row justify-between py-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='border-none font-semibold outline-none'
                                                                                                                onChange={(e) => headerValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].header }
                                                                                                            />
                                                                                                            <div className='flex'>
                                                                                                                {
                                                                                                                    form.content[box_index].container.length === 1 ?
                                                                                                                        <button onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    :
                                                                                                                    index === 0 && form.content[box_index].container.length !== 1 ?
                                                                                                                    <>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    : index === (form.content[box_index].container.length - 1) ?
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    
                                                                                                                }
                                                                                                                <div className='flex flex-row items-end ml-4'>
                                                                                                                    <button onClick={() => addListsDownloads(index, box_index)} className='float-left font-semibold text-sm border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add List</button>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start text-sm'>
                                                                                                            <div className='flex flex-col text-sm'>
                                                                                                                <label className='font-semibold text-sm'>File Type: </label>
                                                                                                                <select
                                                                                                                    className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                                    default={`normal_naragraph-${box_index}`}
                                                                                                                    onChange={(e) => selectValue(e, index, box_index, 'icon')}
                                                                                                                    value={ form.content[box_index].container[index].icon }
                                                                                                                >
                                                                                                                    <option value="fa-file-download" className="capitalize">File</option>
                                                                                                                    <option value="fa-file-code" className="capitalize">Code</option>
                                                                                                                    <option value="fa-file-video" className="capitalize">Video</option>
                                                                                                                    <option value="fa-file-audio" className="capitalize">Audio</option>
                                                                                                                    <option value="fa-file-zipper" className="capitalize">Zip</option>
                                                                                                                </select>
                                                                                                                {/* <div className='flex flex-row items-end'>
                                                                                                                    <button onClick={() => addLists(index, box_index)} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                                </div> */}
                                                                                                            </div>
                                                                                                            <div className='flex flex-col text-sm'>
                                                                                                                <label className='font-semibold text-sm'>File Name: </label>
                                                                                                                <input 
                                                                                                                    type="text" 
                                                                                                                    className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                    onChange={(e) => listInputValue(e, index, box_index)}
                                                                                                                    value={ form.content[box_index].container[index].input }
                                                                                                                    placeholder='Name'
                                                                                                                />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='flex flex-col text-sm'>
                                                                                                            <label className='font-semibold text-sm'>File Link: </label>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                onChange={(e) => linkValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].link }
                                                                                                                placeholder='Link'
                                                                                                            />
                                                                                                        </div>
                                                                                                        {
                                                                                                            form.content[box_index].container[index].list.length > 0 &&
                                                                                                                <div className='mt-4'>
                                                                                                                {
                                                                                                                    form.content[box_index].container[index].list.map((list_item, i) => {
                                                                                                                        return (
                                                                                                                            <div className='px-2 py-1 relative mb-1 flex font-poppins items-center text-white transition-colors duration-150 bg-blue-600 border border-transparent active:bg-blue-600 hover:bg-blue-700'>
                                                                                                                                {/* <img 
                                                                                                                                    className='w-16 h-16 border border-solid border-gray-500 rounded-md'
                                                                                                                                    src={list_item.image}
                                                                                                                                /> */}
                                                                                                                                <FontAwesomeIcon icon={['fas', list_item.icon]} />
                                                                                                                                <div className='flex flex-col ml-2'>
                                                                                                                                    <h2 className='text-sm '>{list_item.name}</h2>
                                                                                                                                    <a href={list_item.link} target='_blank'><FontAwesomeIcon icon={faExternalLink} className='absolute right-10 top-1/2 transform -translate-y-1/2'/></a>
                                                                                                                                    <FontAwesomeIcon onClick={() => removeLists(index, i, box_index)} id={i} icon={faTrash} className='cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2'/>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        )
                                                                                                                    })
                                                                                                                }
                                                                                                                </div>
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                :
                                                                                                item.element === 'number_list' ?
                                                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                    <div className='flex flex-col'>
                                                                                                        <div className='flex flex-row justify-between py-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='border-none font-semibold outline-none'
                                                                                                                onChange={(e) => headerValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].header }
                                                                                                            />
                                                                                                            <div>
                                                                                                                {
                                                                                                                    form.content[box_index].container.length === 1 ?
                                                                                                                        <button onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    :
                                                                                                                    index === 0 && form.content[box_index].container.length !== 1 ?
                                                                                                                    <>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    : index === (form.content[box_index].container.length - 1) ?
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='flex flex-row'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                onChange={(e) => listInputValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].input }
                                                                                                                placeholder='Lists Items'
                                                                                                            />
                                                                                                            <div className='flex flex-row items-end'>
                                                                                                                <button onClick={() => addLists(index, box_index)} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        {
                                                                                                            form.content[box_index].container[index].list.length > 0 &&
                                                                                                                form.content[box_index].container[index].list.map((list_item, i) => {
                                                                                                                    return (
                                                                                                                        <div key={i} className='flex items-center relative mt-2 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] border border-[#CAD5DF] px-4 py-1 mr-2 xs:text-sm text-sm font-semibold transition-all capitalize'>
                                                                                                                            <p className='pr-2'>{list_item}</p>
                                                                                                                            <FontAwesomeIcon onClick={() => removeLists(index, i, box_index)} id={i} icon={faClose} className="ml-2 cursor-pointer absolute top-2 right-2" />
                                                                                                                        </div>
                                                                                                                    )
                                                                                                                })
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                :
                                                                                                item.element === 'grid_column' &&
                                                                                                <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                    <div className='flex flex-col'>
                                                                                                        <div className='flex flex-row justify-between py-2'>
                                                                                                            <input 
                                                                                                                type="text" 
                                                                                                                className='border-none font-semibold outline-none'
                                                                                                                onChange={(e) => headerValue(e, index, box_index)}
                                                                                                                value={ form.content[box_index].container[index].header }
                                                                                                            />
                                                                                                            <div>
                                                                                                                {
                                                                                                                    form.content[box_index].container.length === 1 ?
                                                                                                                        <button onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    :
                                                                                                                    index === 0 && form.content[box_index].container.length !== 1 ?
                                                                                                                    <>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    : index === (form.content[box_index].container.length - 1) ?
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        <button title="move upwards" onClick={() => moveElementUpwards(index, box_index)} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="move downwards" onClick={() => moveElementsDownwards(index, box_index)} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                        <button title="remove elements" onClick={() => removeElementsContent(index, box_index)} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                    </>
                                                                                                                    
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='grid md:grid-cols-2 grid-cols-1 gap-1 place-content-start mb-2'>
                                                                                                            <div className='border border-solid border-gray-500 p-2'>
                                                                                                                <div className='flex flex-col'>
                                                                                                                    <label className='font-semibold'> Element Content: </label>
                                                                                                                    <div className='flex flex-row'>
                                                                                                                        <select
                                                                                                                            className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                                            default={`normal_naragraph-x-${box_index}`}
                                                                                                                            value={contentGrid1Selected}
                                                                                                                            onChange={(e) => setContentGrid1Selected(e.target.value)}
                                                                                                                        >
                                                                                                                            <option value="" className="capitalize" disabled={true}>Select Element</option>
                                                                                                                            <option disabled={true} className='text-sm'>-----Text</option>
                                                                                                                            <option value="heading" className="capitalize">Heading</option>
                                                                                                                            <option value="sub_heading" className="capitalize">Sub Heading</option>
                                                                                                                            <option value="normal_naragraph" className="capitalize">Normal Paragraph</option>
                                                                                                                            <option disabled={true} className='text-sm'>-----List</option>
                                                                                                                            <option value="bullet_list" className="capitalize">Bullet List</option>
                                                                                                                            <option value="number_list" className="capitalize">Number List</option>
                                                                                                                            <option value="download_list" className="capitalize">Download List</option>
                                                                                                                            <option value="list_image" className="capitalize">List Image</option>
                                                                                                                            <option disabled={true} className='text-sm'>-----Image</option>
                                                                                                                            <option value="grid_image" className="capitalize">Grid Image</option>
                                                                                                                            <option value="single_image" className="capitalize">Single Image</option>
                                                                                                                        </select>
                                                                                                                        <div className='flex flex-row items-end'>
                                                                                                                            <button onClick={() => addContentElementsGrid(index, box_index, 'grid1')} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    {
                                                                                                                        form.content[box_index].container[index].grid1.length > 0 &&
                                                                                                                            form.content[box_index].container[index].grid1.map((item, sub_index) => {
                                                                                                                                return (
                                                                                                                                    <>
                                                                                                                                    {
                                                                                                                                        item.element === 'normal_naragraph' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    {/* <label className='font-semibold'> Normal Paragraph: </label> */}
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid1.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid1.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid1.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row'>
                                                                                                                                                    <textarea
                                                                                                                                                        name="paragraph"
                                                                                                                                                        id="message"
                                                                                                                                                        cols="30"
                                                                                                                                                        rows="8"
                                                                                                                                                        placeholder="Paragraph"
                                                                                                                                                        className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                                                                                        onChange={(e) => paragraphValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].paragraph }
                                                                                                                                                    >
                                                                                                                                                    </textarea>
                                                                                                                                                </div>
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'heading' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid1.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid1.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid1.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => headingValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].heading }
                                                                                                                                                        placeholder='Heading'
                                                                                                                                                    />
                                                                                                                                                </div>
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'sub_heading' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid1.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid1.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid1.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => headingValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].heading }
                                                                                                                                                        placeholder='Sub Heading'
                                                                                                                                                    />
                                                                                                                                                </div>
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'grid_image' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid1.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid1.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid1.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => gridInputValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].input }
                                                                                                                                                        placeholder='Image URL'
                                                                                                                                                    />
                                                                                                                                                    <div className='flex flex-row items-end'>
                                                                                                                                                        <button onClick={() => addGridContentImageGrid(index, box_index, sub_index, 'grid1')} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-col'>
                                                                                                                                                    <label className='font-semibold'> Image/s dimension: </label>
                                                                                                                                                    <select
                                                                                                                                                        className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                                                                        default="normal_naragraph"
                                                                                                                                                        value={form.content[box_index].container[index].grid1[sub_index].type}
                                                                                                                                                        onChange={(e) => typeValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                    >
                                                                                                                                                        <option value="boxed" className="capitalize">Boxed</option>
                                                                                                                                                        <option value="boxed_full" className="capitalize">Boxed Full</option>
                                                                                                                                                        <option value="rectangular" className="capitalize">Rectangular</option>
                                                                                                                                                        <option value="auto" className="capitalize">Auto</option>
                                                                                                                                                    </select>
                                                                                                                                                </div>
                                                                                                                                                {
                                                                                                                                                    form.content[box_index].container[index].grid1[sub_index].grid_image.length > 0 &&
                                                                                                                                                    <>
                                                                                                                                                    <div className={`grid ${(form.content[box_index].container[index].grid1[sub_index].type === 'boxed') && 'sm:grid-cols-2'} grid-cols-1 gap-5 place-content-start my-4`}>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid1[sub_index].grid_image.map((image, i) => {
                                                                                                                                                                return (
                                                                                                                                                                    <div key={i} className='relative'>
                                                                                                                                                                        <img 
                                                                                                                                                                            src={image}
                                                                                                                                                                            className={`w-full ${form.content[box_index].container[index].grid1[sub_index].type === 'boxed-full' && 'md:h-[500px] sm:h-[400px] h-[300px]'} ${(form.content[box_index].container[index].grid1[sub_index].type === 'boxed' || form.content[box_index].container[index].grid1[sub_index].type === 'rectangular') && 'md:h-60 h-48'} object-cover bg-top rounded-lg border border-[#cococo]`}
                                                                                                                                                                            alt={`Grid Image #${i+1}`}
                                                                                                                                                                        />
                                                                                                                                                                        <button title="remove image" onClick={() => removeGridContentImageGrid(index, i, box_index, sub_index, 'grid1')} className='absolute top-2 right-4'><FontAwesomeIcon icon={faClose} className='cursor-pointer'/></button>
                                                                                                                                                                    </div>
                                                                                                                                                                )
                                                                                                                                                            })
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                    </>
                                                                                                                                                }
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'single_image' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid1.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid1.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid1.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => singleInputValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].image }
                                                                                                                                                        placeholder='Image URL'
                                                                                                                                                    />
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-col'>
                                                                                                                                                    <label className='font-semibold'> Image/s dimension: </label>
                                                                                                                                                    <select
                                                                                                                                                        className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                                                                        default="normal_naragraph"
                                                                                                                                                        value={form.content[box_index].container[index].grid1[sub_index].type}
                                                                                                                                                        onChange={(e) => typeValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                    >
                                                                                                                                                        <option value="rectangular" className="capitalize">Rectangular</option>
                                                                                                                                                        <option value="boxed_full" className="capitalize">Boxed Full</option>
                                                                                                                                                        <option value="auto" className="capitalize">Auto</option>
                                                                                                                                                    </select>
                                                                                                                                                </div>
                                                                                                                                                {
                                                                                                                                                    form.content[box_index].container[index].grid1[sub_index].image &&
                                                                                                                                                        <div className='relative mt-2'>
                                                                                                                                                            <img 
                                                                                                                                                                src={form.content[box_index].container[index].grid1[sub_index].image}
                                                                                                                                                                className={`w-full ${form.content[box_index].container[index].grid1[sub_index].type === 'boxed-full' && 'md:h-[500px] sm:h-[400px] h-[300px]'} ${(form.content[box_index].container[index].grid1[sub_index].type === 'rectangular') && 'md:h-60 h-48'} object-cover bg-top rounded-lg border border-[#cococo]`}
                                                                                                                                                                alt={`Grid Image`}
                                                                                                                                                            />
                                                                                                                                                        </div>
                                                                                                                                                }
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'bullet_list' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid1.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid1.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid1.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row mb-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => listInputValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].input }
                                                                                                                                                        placeholder='Lists Items'
                                                                                                                                                    />
                                                                                                                                                    <div className='flex flex-row items-end'>
                                                                                                                                                        <button onClick={() => addListsGrid(index, box_index, sub_index, 'grid1')} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                {
                                                                                                                                                    form.content[box_index].container[index].grid1[sub_index].list.length > 0 &&
                                                                                                                                                        form.content[box_index].container[index].grid1[sub_index].list.map((list_item, i) => {
                                                                                                                                                            return (
                                                                                                                                                                <button
                                                                                                                                                                    key={i}
                                                                                                                                                                    className="mb-1 flex items-center justify-between px-2 py-1 text-xs font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-md active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-purple"
                                                                                                                                                                >
                                                                                                                                                                    {list_item}
                                                                                                                                                                    <FontAwesomeIcon onClick={() => removeListsGrid(index, i, box_index, sub_index, 'grid1')} id={i} icon={faClose} className="ml-2 cursor-pointer" />
                                                                                                                                                                </button>
                                                                                                                                                            )
                                                                                                                                                        })
                                                                                                                                                }
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'list_image' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div className='flex'>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid1.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid1.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid1.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                        <div className='flex flex-row items-end ml-4'>
                                                                                                                                                            <button onClick={() => addListsMultiGrid(index, box_index, sub_index, 'grid1')} className='float-left text-sm font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add List</button>
                                                                                                                                                        </div>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start text-sm'>
                                                                                                                                                    <div className='flex flex-col'>
                                                                                                                                                        <label className='font-semibold text-sm'> Image URL </label>
                                                                                                                                                        <input 
                                                                                                                                                            type="text" 
                                                                                                                                                            className='p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                            onChange={(e) => listInputValueMultiGrid(e, index, box_index, 'image', sub_index, 'grid1')}
                                                                                                                                                            value={ form.content[box_index].container[index].grid1[sub_index].image_input }
                                                                                                                                                            placeholder="Image URL"
                                                                                                                                                        />
                                                                                                                                                    </div>
                                                                                                                                                    <div className='flex flex-col text-sm'>
                                                                                                                                                        <label className='font-semibold text-sm'> Link URL </label>
                                                                                                                                                        <input 
                                                                                                                                                            type="text" 
                                                                                                                                                            className='p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                            onChange={(e) => listInputValueMultiGrid(e, index, box_index, 'link', sub_index, 'grid1')}
                                                                                                                                                            value={ form.content[box_index].container[index].grid1[sub_index].link_input }
                                                                                                                                                            placeholder="Link URL"
                                                                                                                                                        />
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start text-sm'>
                                                                                                                                                    <div className='flex flex-col'>
                                                                                                                                                        <label className='font-semibold text-sm'> Heading </label>
                                                                                                                                                        <textarea
                                                                                                                                                            name="message"
                                                                                                                                                            id="message"
                                                                                                                                                            cols="30"
                                                                                                                                                            rows="3"
                                                                                                                                                            placeholder="Heading"
                                                                                                                                                            className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                                                                                            onChange={(e) => listInputValueMultiGrid(e, index, box_index, 'heading', sub_index, 'grid1')}
                                                                                                                                                            value={ form.content[box_index].container[index].grid1[sub_index].heading_input }
                                                                                                                                                        >
                                                                                                                                                        </textarea>
                                                                                                                                                    </div>
                                                                                                                                                    <div className='flex flex-col text-sm'>
                                                                                                                                                        <label className='font-semibold text-sm'> Sub Heading </label>
                                                                                                                                                        <textarea
                                                                                                                                                            name="message"
                                                                                                                                                            id="message"
                                                                                                                                                            cols="30"
                                                                                                                                                            rows="3"
                                                                                                                                                            placeholder="Sub heading"
                                                                                                                                                            className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                                                                                            onChange={(e) => listInputValueMultiGrid(e, index, box_index, 'sub_heading', sub_index, 'grid1')}
                                                                                                                                                            value={ form.content[box_index].container[index].grid1[sub_index].sub_input }
                                                                                                                                                        >
                                                                                                                                                        </textarea>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                {
                                                                                                                                                    form.content[box_index].container[index].grid1[sub_index].list.length > 0 &&
                                                                                                                                                        <div className='mt-4'>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid1[sub_index].list.map((list_item, i) => {
                                                                                                                                                                return (
                                                                                                                                                                    <div className='relative px-2 py-1 mb-1 flex font-poppins items-center text-white transition-colors duration-150 bg-blue-600 border border-transparent active:bg-blue-600 hover:bg-blue-700'>
                                                                                                                                                                        <img 
                                                                                                                                                                            className='w-12 h-12 border border-solid border-white rounded-md'
                                                                                                                                                                            src={list_item.image}
                                                                                                                                                                        />
                                                                                                                                                                        <div className='flex flex-col ml-2'> {/*text-[#FB2736]*/}
                                                                                                                                                                            <h2 className='font-semibold text-base'>{list_item.heading}</h2>
                                                                                                                                                                            <p className='text-xs drop-shadow-sm'>{list_item.sub_heading}</p>
                                                                                                                                                                            <a href={list_item.link} target='_blank'><FontAwesomeIcon icon={faExternalLink} className='absolute right-10 top-1/2 transform -translate-y-1/2'/></a>
                                                                                                                                                                            <FontAwesomeIcon onClick={() => removeListsGrid(index, i, box_index, sub_index, 'grid1')} id={i} icon={faTrash} className='cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2'/>
                                                                                                                                                                        </div>
                                                                                                                                                                    </div>
                                                                                                                                                                )
                                                                                                                                                            })
                                                                                                                                                        }
                                                                                                                                                        </div>
                                                                                                                                                }
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'download_list' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div className='flex'>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid1.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid1.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid1.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                        <div className='flex flex-row items-end ml-4'>
                                                                                                                                                            <button onClick={() => addListsDownloadsGrid(index, box_index, sub_index, 'grid1')} className='float-left font-semibold text-sm border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add List</button>
                                                                                                                                                        </div>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start text-sm'>
                                                                                                                                                    <div className='flex flex-col text-sm'>
                                                                                                                                                        <label className='font-semibold text-sm'>File Type: </label>
                                                                                                                                                        <select
                                                                                                                                                            className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                                                                            default={`normal_naragraph-${box_index}`}
                                                                                                                                                            onChange={(e) => selectValueGrid(e, index, box_index, 'icon', sub_index, 'grid1')}
                                                                                                                                                            value={ form.content[box_index].container[index].grid1[sub_index].icon }
                                                                                                                                                        >
                                                                                                                                                            <option value="fa-file-download" className="capitalize">File</option>
                                                                                                                                                            <option value="fa-file-code" className="capitalize">Code</option>
                                                                                                                                                            <option value="fa-file-video" className="capitalize">Video</option>
                                                                                                                                                            <option value="fa-file-audio" className="capitalize">Audio</option>
                                                                                                                                                            <option value="fa-file-zipper" className="capitalize">Zip</option>
                                                                                                                                                        </select>
                                                                                                                                                    </div>
                                                                                                                                                    <div className='flex flex-col text-sm'>
                                                                                                                                                        <label className='font-semibold text-sm'>File Name: </label>
                                                                                                                                                        <input 
                                                                                                                                                            type="text" 
                                                                                                                                                            className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                            onChange={(e) => listInputValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                            value={ form.content[box_index].container[index].grid1[sub_index].input }
                                                                                                                                                            placeholder='Name'
                                                                                                                                                        />
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-col text-sm'>
                                                                                                                                                    <label className='font-semibold text-sm'>File Link: </label>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => linkValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].link }
                                                                                                                                                        placeholder='Link'
                                                                                                                                                    />
                                                                                                                                                </div>
                                                                                                                                                {
                                                                                                                                                    form.content[box_index].container[index].grid1[sub_index].list.length > 0 &&
                                                                                                                                                        <div className='mt-4'>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid1[sub_index].list.map((list_item, i) => {
                                                                                                                                                                return (
                                                                                                                                                                    <div className='px-2 py-1 relative mb-1 flex font-poppins items-center text-white transition-colors duration-150 bg-blue-600 border border-transparent active:bg-blue-600 hover:bg-blue-700'>
                                                                                                                                                                        <FontAwesomeIcon icon={['fas', list_item.icon]} />
                                                                                                                                                                        <div className='flex flex-col ml-2'>
                                                                                                                                                                            <h2 className='text-sm '>{list_item.name}</h2>
                                                                                                                                                                            <a href={list_item.link} target='_blank'><FontAwesomeIcon icon={faExternalLink} className='absolute right-10 top-1/2 transform -translate-y-1/2'/></a>
                                                                                                                                                                            <FontAwesomeIcon onClick={() => removeListsGrid(index, i, box_index, sub_index, 'grid1')} id={i} icon={faTrash} className='cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2'/>
                                                                                                                                                                        </div>
                                                                                                                                                                    </div>
                                                                                                                                                                )
                                                                                                                                                            })
                                                                                                                                                        }
                                                                                                                                                        </div>
                                                                                                                                                }
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'number_list' &&
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid1.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid1.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid1.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid1')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => listInputValueGrid(e, index, box_index, sub_index, 'grid1')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid1[sub_index].input }
                                                                                                                                                        placeholder='Lists Items'
                                                                                                                                                    />
                                                                                                                                                    <div className='flex flex-row items-end'>
                                                                                                                                                        <button onClick={() => addListsGrid(index, box_index, sub_index, 'grid1')} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                {
                                                                                                                                                    form.content[box_index].container[index].grid1[sub_index].list.length > 0 &&
                                                                                                                                                        form.content[box_index].container[index].grid1[sub_index].list.map((list_item, i) => {
                                                                                                                                                            return (
                                                                                                                                                                <div key={i} className='flex items-center relative mt-2 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] border border-[#CAD5DF] px-4 py-1 mr-2 xs:text-sm text-sm font-semibold transition-all capitalize'>
                                                                                                                                                                    <p className='pr-2'>{list_item}</p>
                                                                                                                                                                    <FontAwesomeIcon onClick={() => removeListsGrid(index, i, box_index, sub_index, 'grid1')} id={i} icon={faClose} className="ml-2 cursor-pointer absolute top-2 right-2" />
                                                                                                                                                                </div>
                                                                                                                                                            )
                                                                                                                                                        })
                                                                                                                                                }
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                    }
                                                                                                                                    </>
                                                                                                                                )
                                                                                                                            })
                                                                                                                    }
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div className='border border-solid border-gray-500 p-2'>
                                                                                                                <div className='flex flex-col'>
                                                                                                                    <label className='font-semibold'> Element Content: </label>
                                                                                                                    <div className='flex flex-row'>
                                                                                                                        <select
                                                                                                                            className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                                            default={`normal_naragraph-x--${box_index}`}
                                                                                                                            value={contentGrid2Selected}
                                                                                                                            onChange={(e) => setContentGrid2Selected(e.target.value)}
                                                                                                                        >
                                                                                                                            <option value="" className="capitalize" disabled={true}>Select Element</option>
                                                                                                                            <option disabled={true} className='text-sm'>-----Text</option>
                                                                                                                            <option value="heading" className="capitalize">Heading</option>
                                                                                                                            <option value="sub_heading" className="capitalize">Sub Heading</option>
                                                                                                                            <option value="normal_naragraph" className="capitalize">Normal Paragraph</option>
                                                                                                                            <option disabled={true} className='text-sm'>-----List</option>
                                                                                                                            <option value="bullet_list" className="capitalize">Bullet List</option>
                                                                                                                            <option value="number_list" className="capitalize">Number List</option>
                                                                                                                            <option value="download_list" className="capitalize">Download List</option>
                                                                                                                            <option value="list_image" className="capitalize">List Image</option>
                                                                                                                            <option disabled={true} className='text-sm'>-----Image</option>
                                                                                                                            <option value="grid_image" className="capitalize">Grid Image</option>
                                                                                                                            <option value="single_image" className="capitalize">Single Image</option>
                                                                                                                        </select>
                                                                                                                        <div className='flex flex-row items-end'>
                                                                                                                            <button onClick={() => addContentElementsGrid(index, box_index, 'grid2')} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    {
                                                                                                                        form.content[box_index].container[index].grid2.length > 0 &&
                                                                                                                            form.content[box_index].container[index].grid2.map((item, sub_index) => {
                                                                                                                                return (
                                                                                                                                    <>
                                                                                                                                    {
                                                                                                                                        item.element === 'normal_naragraph' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    {/* <label className='font-semibold'> Normal Paragraph: </label> */}
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid2.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid2.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid2.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row'>
                                                                                                                                                    <textarea
                                                                                                                                                        name="paragraph"
                                                                                                                                                        id="message"
                                                                                                                                                        cols="30"
                                                                                                                                                        rows="8"
                                                                                                                                                        placeholder="Paragraph"
                                                                                                                                                        className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                                                                                        onChange={(e) => paragraphValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].paragraph }
                                                                                                                                                    >
                                                                                                                                                    </textarea>
                                                                                                                                                </div>
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'heading' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid2.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid2.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid2.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => headingValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].heading }
                                                                                                                                                        placeholder='Heading'
                                                                                                                                                    />
                                                                                                                                                </div>
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'sub_heading' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid2.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid2.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid2.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => headingValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].heading }
                                                                                                                                                        placeholder='Sub Heading'
                                                                                                                                                    />
                                                                                                                                                </div>
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'grid_image' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid2.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid2.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid2.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => gridInputValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].input }
                                                                                                                                                        placeholder='Image URL'
                                                                                                                                                    />
                                                                                                                                                    <div className='flex flex-row items-end'>
                                                                                                                                                        <button onClick={() => addGridContentImageGrid(index, box_index, sub_index, 'grid2')} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-col'>
                                                                                                                                                    <label className='font-semibold'> Image/s dimension: </label>
                                                                                                                                                    <select
                                                                                                                                                        className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                                                                        default="normal_naragraph"
                                                                                                                                                        value={form.content[box_index].container[index].grid2[sub_index].type}
                                                                                                                                                        onChange={(e) => typeValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                    >
                                                                                                                                                        <option value="boxed" className="capitalize">Boxed</option>
                                                                                                                                                        <option value="boxed_full" className="capitalize">Boxed Full</option>
                                                                                                                                                        <option value="rectangular" className="capitalize">Rectangular</option>
                                                                                                                                                        <option value="auto" className="capitalize">Auto</option>
                                                                                                                                                    </select>
                                                                                                                                                </div>
                                                                                                                                                {
                                                                                                                                                    form.content[box_index].container[index].grid2[sub_index].grid_image.length > 0 &&
                                                                                                                                                    <>
                                                                                                                                                    <div className={`grid ${(form.content[box_index].container[index].grid2[sub_index].type === 'boxed') && 'sm:grid-cols-2'} grid-cols-1 gap-5 place-content-start my-4`}>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid2[sub_index].grid_image.map((image, i) => {
                                                                                                                                                                return (
                                                                                                                                                                    <div key={i} className='relative'>
                                                                                                                                                                        <img 
                                                                                                                                                                            src={image}
                                                                                                                                                                            className={`w-full ${form.content[box_index].container[index].grid2[sub_index].type === 'boxed-full' && 'md:h-[500px] sm:h-[400px] h-[300px]'} ${(form.content[box_index].container[index].grid2[sub_index].type === 'boxed' || form.content[box_index].container[index].grid2[sub_index].type === 'rectangular') && 'md:h-60 h-48'} object-cover bg-top rounded-lg border border-[#cococo]`}
                                                                                                                                                                            alt={`Grid Image #${i+1}`}
                                                                                                                                                                        />
                                                                                                                                                                        <button title="remove image" onClick={() => removeGridContentImageGrid(index, i, box_index, sub_index, 'grid2')} className='absolute top-2 right-4'><FontAwesomeIcon icon={faClose} className='cursor-pointer'/></button>
                                                                                                                                                                    </div>
                                                                                                                                                                )
                                                                                                                                                            })
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                    </>
                                                                                                                                                }
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'single_image' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid2.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid2.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid2.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => singleInputValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].image }
                                                                                                                                                        placeholder='Image URL'
                                                                                                                                                    />
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-col'>
                                                                                                                                                    <label className='font-semibold'> Image/s dimension: </label>
                                                                                                                                                    <select
                                                                                                                                                        className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                                                                        default="normal_naragraph"
                                                                                                                                                        value={form.content[box_index].container[index].grid2[sub_index].type}
                                                                                                                                                        onChange={(e) => typeValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                    >
                                                                                                                                                        <option value="rectangular" className="capitalize">Rectangular</option>
                                                                                                                                                        <option value="boxed_full" className="capitalize">Boxed Full</option>
                                                                                                                                                        <option value="auto" className="capitalize">Auto</option>
                                                                                                                                                    </select>
                                                                                                                                                </div>
                                                                                                                                                {
                                                                                                                                                    form.content[box_index].container[index].grid2[sub_index].image &&
                                                                                                                                                        <div className='relative mt-2'>
                                                                                                                                                            <img 
                                                                                                                                                                src={form.content[box_index].container[index].grid2[sub_index].image}
                                                                                                                                                                className={`w-full ${form.content[box_index].container[index].grid2[sub_index].type === 'boxed-full' && 'md:h-[500px] sm:h-[400px] h-[300px]'} ${(form.content[box_index].container[index].grid2[sub_index].type === 'rectangular') && 'md:h-60 h-48'} object-cover bg-top rounded-lg border border-[#cococo]`}
                                                                                                                                                                alt={`Grid Image`}
                                                                                                                                                            />
                                                                                                                                                        </div>
                                                                                                                                                }
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'bullet_list' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid2.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid2.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid2.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row mb-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => listInputValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].input }
                                                                                                                                                        placeholder='Lists Items'
                                                                                                                                                    />
                                                                                                                                                    <div className='flex flex-row items-end'>
                                                                                                                                                        <button onClick={() => addListsGrid(index, box_index, sub_index, 'grid2')} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                {
                                                                                                                                                    form.content[box_index].container[index].grid2[sub_index].list.length > 0 &&
                                                                                                                                                        form.content[box_index].container[index].grid2[sub_index].list.map((list_item, i) => {
                                                                                                                                                            return (
                                                                                                                                                                <button
                                                                                                                                                                    key={i}
                                                                                                                                                                    className="mb-1 flex items-center justify-between px-2 py-1 text-xs font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-md active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-purple"
                                                                                                                                                                >
                                                                                                                                                                    {list_item}
                                                                                                                                                                    <FontAwesomeIcon onClick={() => removeListsGrid(index, i, box_index, sub_index, 'grid2')} id={i} icon={faClose} className="ml-2 cursor-pointer" />
                                                                                                                                                                </button>
                                                                                                                                                            )
                                                                                                                                                        })
                                                                                                                                                }
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'list_image' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div className='flex'>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid2.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid2.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid2.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                        <div className='flex flex-row items-end ml-4'>
                                                                                                                                                            <button onClick={() => addListsMultiGrid(index, box_index, sub_index, 'grid2')} className='float-left text-sm font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add List</button>
                                                                                                                                                        </div>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start text-sm'>
                                                                                                                                                    <div className='flex flex-col'>
                                                                                                                                                        <label className='font-semibold text-sm'> Image URL </label>
                                                                                                                                                        <input 
                                                                                                                                                            type="text" 
                                                                                                                                                            className='p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                            onChange={(e) => listInputValueMultiGrid(e, index, box_index, 'image', sub_index, 'grid2')}
                                                                                                                                                            value={ form.content[box_index].container[index].grid2[sub_index].image_input }
                                                                                                                                                            placeholder="Image URL"
                                                                                                                                                        />
                                                                                                                                                    </div>
                                                                                                                                                    <div className='flex flex-col text-sm'>
                                                                                                                                                        <label className='font-semibold text-sm'> Link URL </label>
                                                                                                                                                        <input 
                                                                                                                                                            type="text" 
                                                                                                                                                            className='p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                            onChange={(e) => listInputValueMultiGrid(e, index, box_index, 'link', sub_index, 'grid2')}
                                                                                                                                                            value={ form.content[box_index].container[index].grid2[sub_index].link_input }
                                                                                                                                                            placeholder="Link URL"
                                                                                                                                                        />
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start text-sm'>
                                                                                                                                                    <div className='flex flex-col'>
                                                                                                                                                        <label className='font-semibold text-sm'> Heading </label>
                                                                                                                                                        <textarea
                                                                                                                                                            name="message"
                                                                                                                                                            id="message"
                                                                                                                                                            cols="30"
                                                                                                                                                            rows="3"
                                                                                                                                                            placeholder="Heading"
                                                                                                                                                            className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                                                                                            onChange={(e) => listInputValueMultiGrid(e, index, box_index, 'heading', sub_index, 'grid2')}
                                                                                                                                                            value={ form.content[box_index].container[index].grid2[sub_index].heading_input }
                                                                                                                                                        >
                                                                                                                                                        </textarea>
                                                                                                                                                    </div>
                                                                                                                                                    <div className='flex flex-col text-sm'>
                                                                                                                                                        <label className='font-semibold text-sm'> Sub Heading </label>
                                                                                                                                                        <textarea
                                                                                                                                                            name="message"
                                                                                                                                                            id="message"
                                                                                                                                                            cols="30"
                                                                                                                                                            rows="3"
                                                                                                                                                            placeholder="Sub heading"
                                                                                                                                                            className="w-full p-2 border border-solid border-[#c0c0c0]"
                                                                                                                                                            onChange={(e) => listInputValueMultiGrid(e, index, box_index, 'sub_heading', sub_index, 'grid2')}
                                                                                                                                                            value={ form.content[box_index].container[index].grid2[sub_index].sub_input }
                                                                                                                                                        >
                                                                                                                                                        </textarea>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                {
                                                                                                                                                    form.content[box_index].container[index].grid2[sub_index].list.length > 0 &&
                                                                                                                                                        <div className='mt-4'>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid2[sub_index].list.map((list_item, i) => {
                                                                                                                                                                return (
                                                                                                                                                                    <div className='relative px-2 py-1 mb-1 flex font-poppins items-center text-white transition-colors duration-150 bg-blue-600 border border-transparent active:bg-blue-600 hover:bg-blue-700'>
                                                                                                                                                                        <img 
                                                                                                                                                                            className='w-12 h-12 border border-solid border-white rounded-md'
                                                                                                                                                                            src={list_item.image}
                                                                                                                                                                        />
                                                                                                                                                                        <div className='flex flex-col ml-2'> {/*text-[#FB2736]*/}
                                                                                                                                                                            <h2 className='font-semibold text-base'>{list_item.heading}</h2>
                                                                                                                                                                            <p className='text-xs drop-shadow-sm'>{list_item.sub_heading}</p>
                                                                                                                                                                            <a href={list_item.link} target='_blank'><FontAwesomeIcon icon={faExternalLink} className='absolute right-10 top-1/2 transform -translate-y-1/2'/></a>
                                                                                                                                                                            <FontAwesomeIcon onClick={() => removeListsGrid(index, i, box_index, sub_index, 'grid2')} id={i} icon={faTrash} className='cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2'/>
                                                                                                                                                                        </div>
                                                                                                                                                                    </div>
                                                                                                                                                                )
                                                                                                                                                            })
                                                                                                                                                        }
                                                                                                                                                        </div>
                                                                                                                                                }
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'download_list' ?
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div className='flex'>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid2.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid2.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid2.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                        <div className='flex flex-row items-end ml-4'>
                                                                                                                                                            <button onClick={() => addListsDownloadsGrid(index, box_index, sub_index, 'grid2')} className='float-left font-semibold text-sm border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add List</button>
                                                                                                                                                        </div>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start text-sm'>
                                                                                                                                                    <div className='flex flex-col text-sm'>
                                                                                                                                                        <label className='font-semibold text-sm'>File Type: </label>
                                                                                                                                                        <select
                                                                                                                                                            className="w-full capitalize appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                                                                                            default={`normal_naragraph-${box_index}`}
                                                                                                                                                            onChange={(e) => selectValueGrid(e, index, box_index, 'icon', sub_index, 'grid2')}
                                                                                                                                                            value={ form.content[box_index].container[index].grid2[sub_index].icon }
                                                                                                                                                        >
                                                                                                                                                            <option value="fa-file-download" className="capitalize">File</option>
                                                                                                                                                            <option value="fa-file-code" className="capitalize">Code</option>
                                                                                                                                                            <option value="fa-file-video" className="capitalize">Video</option>
                                                                                                                                                            <option value="fa-file-audio" className="capitalize">Audio</option>
                                                                                                                                                            <option value="fa-file-zipper" className="capitalize">Zip</option>
                                                                                                                                                        </select>
                                                                                                                                                    </div>
                                                                                                                                                    <div className='flex flex-col text-sm'>
                                                                                                                                                        <label className='font-semibold text-sm'>File Name: </label>
                                                                                                                                                        <input 
                                                                                                                                                            type="text" 
                                                                                                                                                            className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                            onChange={(e) => listInputValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                            value={ form.content[box_index].container[index].grid2[sub_index].input }
                                                                                                                                                            placeholder='Name'
                                                                                                                                                        />
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-col text-sm'>
                                                                                                                                                    <label className='font-semibold text-sm'>File Link: </label>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => linkValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].link }
                                                                                                                                                        placeholder='Link'
                                                                                                                                                    />
                                                                                                                                                </div>
                                                                                                                                                {
                                                                                                                                                    form.content[box_index].container[index].grid2[sub_index].list.length > 0 &&
                                                                                                                                                        <div className='mt-4'>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid2[sub_index].list.map((list_item, i) => {
                                                                                                                                                                return (
                                                                                                                                                                    <div className='px-2 py-1 relative mb-1 flex font-poppins items-center text-white transition-colors duration-150 bg-blue-600 border border-transparent active:bg-blue-600 hover:bg-blue-700'>
                                                                                                                                                                        <FontAwesomeIcon icon={['fas', list_item.icon]} />
                                                                                                                                                                        <div className='flex flex-col ml-2'>
                                                                                                                                                                            <h2 className='text-sm '>{list_item.name}</h2>
                                                                                                                                                                            <a href={list_item.link} target='_blank'><FontAwesomeIcon icon={faExternalLink} className='absolute right-10 top-1/2 transform -translate-y-1/2'/></a>
                                                                                                                                                                            <FontAwesomeIcon onClick={() => removeListsGrid(index, i, box_index, sub_index, 'grid2')} id={i} icon={faTrash} className='cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2'/>
                                                                                                                                                                        </div>
                                                                                                                                                                    </div>
                                                                                                                                                                )
                                                                                                                                                            })
                                                                                                                                                        }
                                                                                                                                                        </div>
                                                                                                                                                }
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        :
                                                                                                                                        item.element === 'number_list' &&
                                                                                                                                        <div className='grid grid-cols-1 gap-5 place-content-start mb-2'>
                                                                                                                                            <div className='flex flex-col'>
                                                                                                                                                <div className='flex flex-row justify-between py-2'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='border-none font-semibold outline-none'
                                                                                                                                                        onChange={(e) => headerValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].header }
                                                                                                                                                    />
                                                                                                                                                    <div>
                                                                                                                                                        {
                                                                                                                                                            form.content[box_index].container[index].grid2.length === 1 ?
                                                                                                                                                                <button onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            :
                                                                                                                                                            sub_index === 0 && form.content[box_index].container[index].grid2.length !== 1 ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')}><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            : sub_index === (form.content[box_index].container[index].grid2.length - 1) ?
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            :
                                                                                                                                                            <>
                                                                                                                                                                <button title="move upwards" onClick={() => moveElementUpwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowUp} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="move downwards" onClick={() => moveElementsDownwardsGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faArrowDown} className='mr-4 cursor-pointer'/></button>
                                                                                                                                                                <button title="remove elements" onClick={() => removeElementsContentGrid(index, box_index, sub_index, 'grid2')} ><FontAwesomeIcon icon={faTrash} className='cursor-pointer'/></button>
                                                                                                                                                            </>
                                                                                                                                                            
                                                                                                                                                        }
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className='flex flex-row'>
                                                                                                                                                    <input 
                                                                                                                                                        type="text" 
                                                                                                                                                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                                                                                                                                                        onChange={(e) => listInputValueGrid(e, index, box_index, sub_index, 'grid2')}
                                                                                                                                                        value={ form.content[box_index].container[index].grid2[sub_index].input }
                                                                                                                                                        placeholder='Lists Items'
                                                                                                                                                    />
                                                                                                                                                    <div className='flex flex-row items-end'>
                                                                                                                                                        <button onClick={() => addListsGrid(index, box_index, sub_index, 'grid2')} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                {
                                                                                                                                                    form.content[box_index].container[index].grid2[sub_index].list.length > 0 &&
                                                                                                                                                        form.content[box_index].container[index].grid2[sub_index].list.map((list_item, i) => {
                                                                                                                                                            return (
                                                                                                                                                                <div key={i} className='flex items-center relative mt-2 bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] border border-[#CAD5DF] px-4 py-1 mr-2 xs:text-sm text-sm font-semibold transition-all capitalize'>
                                                                                                                                                                    <p className='pr-2'>{list_item}</p>
                                                                                                                                                                    <FontAwesomeIcon onClick={() => removeListsGrid(index, i, box_index, sub_index, 'grid2')} id={i} icon={faClose} className="ml-2 cursor-pointer absolute top-2 right-2" />
                                                                                                                                                                </div>
                                                                                                                                                            )
                                                                                                                                                        })
                                                                                                                                                }
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                    }
                                                                                                                                    </>
                                                                                                                                )
                                                                                                                            })
                                                                                                                        }
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            }
                                                                                            </>
                                                                                        )
                                                                                    })
                                                                            }
                                                                        </div>
                                                                        </div>
                                                                    </div>
                                                                    )
                                                                })
                                                        }
                                                        <button
                                                            onClick={addContentContainer}
                                                            className="border-[2px] mt-4 border-dashed border-gray-500 text-gray-800 text-center w-full px-4 py-2 text-sm font-medium leading-5 transition-colors duration-150 rounded-md focus:outline-none focus:shadow-outline-purple"
                                                        >
                                                            New Container
                                                        </button>
                                                        
                                                    </div>
                                                </div>
                                                </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>  
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminProjects