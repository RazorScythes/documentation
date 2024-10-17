import React, { useState, useEffect } from 'react'
import styles from "../../style";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSearchParams, useParams, Link } from "react-router-dom";
import { faArrowLeft, faArrowRight, faArrowRightRotate, faChevronLeft, faChevronRight, faClock, faExternalLink, faFile, faHome, faHomeAlt, faHomeLg, faQuoteLeft, faQuoteRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { getLatestProjects, getCategory, getProjectByID, getProjectComments, uploadProjectComment, removeProjectComment, clearAlert } from "../../actions/project";
import { useDispatch, useSelector } from 'react-redux'
import * as hljsStyles from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Carousel from "react-multi-carousel";
import { convertDriveImageLink } from '../Tools'
import "react-multi-carousel/lib/styles.css";
import { MotionAnimate } from 'react-motion-animate';
import loading from '../../assets/loading.gif'
import moment from 'moment'

import { library, findIconDefinition  } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

library.add(fas, far, fab);

const CustomRight = ({ onClick }) => {
    return (
      <div onClick={onClick} className='bg-transparent text-transparent transition-all h-full w-16 absolute sm:right-4 right-0 flex items-center justify-end cursor-pointer'>
        <FontAwesomeIcon
          icon={faArrowRight}
          className="absolute sm:right-4 right-0 max-w-4 cursor-pointer text-primary-400 text-2xl font-bold"
        />
      </div>
    )
};
  
const CustomLeft = ({ onClick }) => {
    return (
      <div onClick={onClick} className='bg-transparent text-transparent transition-all h-full w-16 absolute sm:left-4 left-0 flex items-center cursor-pointer'>
        <FontAwesomeIcon
          icon={faArrowLeft}
          className="absolute sm:left-4 left-0 max-w-4 text-primary-400 text-2xl font-bold"
        />
      </div>
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

const ProjectsSingle = ({ user }) => {
    const { id } = useParams();

    const dispatch = useDispatch()
    const project_data = useSelector((state) => state.project.data)
    const comments = useSelector((state) => state.project.comments)
    const category = useSelector((state) => state.project.user_category)
    const latestProjects = useSelector((state) => state.project.latestProjects)
    const notFound = useSelector((state) => state.project.notFound)
    const forbiden = useSelector((state) => state.project.forbiden)
    const isLoading = useSelector((state) => state.project.isLoading)

    const [projectData, setProjectData] = useState({})
    const [commentList, setCommentList] = useState([])
    const [submitted, setSubmitted] = useState(false)
    const [comment, setComment] = useState('')
    const [deleted, setDeleted] = useState(false)


    useEffect(() => {
        setProjectData({})
        dispatch(getLatestProjects({
            id: user ? user.result?._id : '',
            projectId: id 
        }))
        dispatch(getProjectByID({ 
            id: user ? user.result?._id : '', 
            projectId: id 
        }))
        dispatch(getProjectComments({ projectId: id }))
        dispatch(getCategory())
        window.scrollTo(0, 0)
    }, [id])

    useEffect(() => {
        if(Object.keys(project_data).length !== 0) {
            setProjectData(project_data)
        }
    }, [project_data])

    useEffect(() => {
        setCommentList(comments)
        setSubmitted(false)
        setDeleted(false)
        setComment('')
    }, [comments])

    const diffInMonths = (d1, d2) => {
        if(!d1 || !d2) return 'N/A'
        const date1 = new Date(d1);
        const date2 = new Date(d2);
    
        const result = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth())
    
        return result + ' months'
      }

    const convertTimezone = (date) => {
        const timeZone = 'America/New_York';

        const dateObj = new Date(date);
        const formattedDate = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour12: false,
        }).format(dateObj);

        return formattedDate
    }

    const submitComment = () => {
        if(comment.length === 0) return

        if(!submitted) {
            dispatch(uploadProjectComment({
                id: project_data.project._id,
                user: user?.result._id,
                comment: comment
            }))
            setSubmitted(true)
        }
    }

    const deleteComment = (parent_id, comment_id) => {
        if(confirm("Are you sure you want to remove your comment? action cannot be undone."))
            if(!deleted) {
                dispatch(removeProjectComment({
                    parent_id: parent_id,
                    comment_id: comment_id
                }))
                setDeleted(true)
            }
    }

    return (
        <div
            className="relative bg-cover bg-center font-poppins"
            style={{ backgroundColor: "#0F172A" }}
        >   
            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className="container mx-auto py-12 xs:px-6 text-[#94a9c9]">
                            {
                                isLoading ?
                                    <div className='h-96 flex items-center justify-center'>
                                        <div className='flex flex-col items-center justify-center'>
                                            <img className="w-16" src={loading} />
                                            <p className='text-white font-semibold text-lg mt-2'>Loading Data</p>
                                        </div>
                                    </div>
                                :
                                forbiden === 'strict' ?
                                    <div
                                        className="relative bg-cover bg-center py-20"
                                        style={{ backgroundColor: "#111827" }}
                                    >   
                                        <div className={`${styles.marginX} ${styles.flexCenter}`}>
                                            <div className={`${styles.boxWidthEx}`}>
                                                <div className="flex flex-col justify-center items-center">
                                                    <h1 className="text-white text-4xl font-bold mb-4 text-center">Restricted Project</h1>
                                                    <p className="text-white text-lg mb-8 text-center">You don't have permission to view this project.</p>
                                                    <a href="/projects" className="text-white underline hover:text-gray-200">Go back to project page</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                :
                                forbiden === 'private' ?
                                    <div
                                        className="relative bg-cover bg-center py-20"
                                        style={{ backgroundColor: "#111827" }}
                                    >   
                                        <div className={`${styles.marginX} ${styles.flexCenter}`}>
                                            <div className={`${styles.boxWidthEx}`}>
                                                <div className="flex flex-col justify-center items-center">
                                                    <h1 className="text-white text-4xl font-bold mb-4 text-center">Projects is Private</h1>
                                                    <p className="text-white text-lg mb-8 text-center">Contact the owner to provide information about this.</p>
                                                    <a href="/projects" className="text-white underline hover:text-gray-200">Go back to projects page</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                :
                                notFound ?
                                    <div
                                        className="relative bg-cover bg-center py-20"
                                        style={{ backgroundColor: "#111827" }}
                                    >   
                                        <div className={`${styles.marginX} ${styles.flexCenter}`}>
                                            <div className={`${styles.boxWidthEx}`}>
                                                <div className="flex flex-col justify-center items-center">
                                                    <h1 className="text-white text-4xl font-bold mb-4 text-center">Project not Found</h1>
                                                    <p className="text-white text-lg mb-8 text-center">The project you're looking for doesn't exist.</p>
                                                    <a href="/projects" className="text-white underline hover:text-gray-200">Go back to projects page</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                :
                                Object.keys(projectData).length !== 0  &&
                                <>
                                    <div className='flex flex-row flex-wrap items-center text-sm'>
                                        <div className='mr-2'><FontAwesomeIcon icon={faHomeLg} className='mr-1'/> <a href='/' className='hover:underline transition-all hover:text-[#0CBCDC]'> Home </a></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <a href='/projects' className='hover:underline transition-all hover:text-[#0CBCDC]'> Projects </a></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> {projectData.project.post_title} </div>
                                    </div>

                                    <hr className='border-[#94a9c9] my-4'/>

                                    <div className='flex flex-row items-center text-sm mt-12 pb-4'>
                                        <div className='sm:w-3/4 w-full'>
                                            <h1 className='sm:text-5xl text-4xl font-semibold text-[#0DBFDC] drop-shadow-md'> {projectData.project.post_title} </h1>
                                        </div>
                                        <div className='sm:w-1/4 w-full sm:block hidden'>

                                        </div>
                                    </div>

                                    <div className='flex flex-row items-center text-sm mt-4'>
                                        <div className='sm:w-3/4 w-full'>
                                            <div className='flex mb-8'>
                                                <img
                                                    className='rounded-full xs:w-12 xs:h-12 w-10 h-10 border border-gray-400'
                                                    src={convertDriveImageLink(projectData.avatar)}
                                                    alt="user profile"
                                                />
                                                <div className='xs:ml-4 ml-2'>
                                                    <p className='text-white xs:text-sm text-lg break-all font-semibold'>{projectData.username}</p>
                                                    <p className='whitespace-pre-wrap xs:text-sm text-sm mt-1'>{convertTimezone(projectData.project.createdAt)} ({moment(projectData.project.createdAt).fromNow()})</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='sm:w-1/4 w-full sm:block hidden'>

                                        </div>
                                    </div>

                                    <div className='grid sm:grid-cols-3 grid-cols-1 gap-5 place-content-start mt-8'>
                                        <div className='col-span-2'>
                                            {
                                                projectData.project.content?.map((data, index) => {
                                                    return (
                                                        <div key={index}>
                                                            {
                                                                data.container?.map((item, i) => {
                                                                    return (
                                                                        <div key={i}>
                                                                            {
                                                                                item.element === 'normal_naragraph' ?
                                                                                    <p className='leading-normal mt-2 whitespace-pre-wrap'>
                                                                                        {item.paragraph}
                                                                                    </p>
                                                                                :
                                                                                item.element === 'quoted_naragraph' ?
                                                                                    <p className='my-8 whitespace-pre-wrap'>
                                                                                        <FontAwesomeIcon icon={faQuoteLeft} className='mr-1 text-xs mb-1'/><span className='font-semibold'>{item.paragraph}</span><FontAwesomeIcon icon={faQuoteRight} className='ml-1 text-xs mb-1'/>
                                                                                    </p>
                                                                                :
                                                                                item.element === 'heading' ?
                                                                                    <h2 className='text-3xl font-semibold my-4 text-[#B9E0F2]'>{item.heading}</h2>
                                                                                :
                                                                                item.element === 'sub_heading' ?
                                                                                    <h2 className='text-2xl font-semibold my-4 text-[#B9E0F2]'>{item.heading}</h2>
                                                                                :
                                                                                item.element === 'number_list' ?
                                                                                    <ul className='list-decimal pl-4 my-6'>
                                                                                        {
                                                                                            item.list?.map((l, ix) => {
                                                                                                return (
                                                                                                    <li className='mb-1' key={ix}><p>{l}</p></li>
                                                                                                )
                                                                                            })
                                                                                        }
                                                                                    </ul>
                                                                                :
                                                                                item.element === 'bullet_list' ?
                                                                                    <ul className='list-disc pl-4 my-6'>
                                                                                        {
                                                                                            item.list?.map((l, ix) => {
                                                                                                return (
                                                                                                    <li className='mb-1' key={ix}><p>{l}</p></li>
                                                                                                )
                                                                                            })
                                                                                        }
                                                                                    </ul>
                                                                                :
                                                                                item.element === 'download_list' ?
                                                                                    <div>
                                                                                        {
                                                                                            item.list?.map((l, ix) => {
                                                                                                return (
                                                                                                    <div className='grid sm:grid-cols-3 grid-cols-1 gap-1 place-content-start cursor-pointer'>
                                                                                                        <div className='col-span-2 flex items-center relative hover:bg-gray-700 transition-all p-2'>
                                                                                                            <FontAwesomeIcon icon={['fas', l.icon]} className='mr-2 text-[#0DBFDC]'/>
                                                                                                            <div>
                                                                                                                <p className='text-white xs:text-sm text-sm break-all'>{l.name}</p>
                                                                                                                <a><FontAwesomeIcon icon={faExternalLink} className='cursor-pointer text-[#0DBFDC] absolute right-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2'/></a>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div></div>
                                                                                                    </div>
                                                                                                )
                                                                                            })
                                                                                        }
                                                                                    </div>
                                                                                :
                                                                                item.element === 'list_image' ?
                                                                                    <div>
                                                                                        {
                                                                                            item.list?.map((l, ix) => {
                                                                                                return (
                                                                                                    <div className='flex items-center relative hover:bg-gray-700 transition-all p-2'>
                                                                                                        <img
                                                                                                            className='rounded-sm xs:w-12 xs:h-12 w-10 h-10 border border-gray-400 object-cover'
                                                                                                            src={l.image}
                                                                                                            alt="user profile"
                                                                                                        />
                                                                                                        <div className='xs:ml-4 ml-2' key={ix}>
                                                                                                            <p className='text-white xs:text-sm text-sm break-all'>{l.heading}</p>
                                                                                                            <p className='whitespace-pre-wrap xs:text-xs text-xs mt-1 text-[#B9E0F2]'>{l.sub_heading}</p>
                                                                                                            <a><FontAwesomeIcon icon={faExternalLink} className='cursor-pointer text-[#0DBFDC] absolute right-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2'/></a>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )
                                                                                            })
                                                                                        }
                                                                                    </div>
                                                                                :
                                                                                item.element === 'grid_image' ?
                                                                                    <div className={`grid ${(item.type === 'boxed') && 'sm:grid-cols-2'} grid-cols-1 gap-2 place-content-start my-4`}>
                                                                                        {
                                                                                            item.grid_image?.map((image, i) => {
                                                                                                return (
                                                                                                    <MotionAnimate key={i} variant={{
                                                                                                        hidden: { 
                                                                                                            opacity: 0,
                                                                                                            transform: 'scale(0)'
                                                                                                        },
                                                                                                        show: {
                                                                                                            opacity: 1,
                                                                                                            transform: 'scale(1)',
                                                                                                            transition: {
                                                                                                                duration: 0.4,
                                                                                                            }
                                                                                                        }
                                                                                                    }}>
                                                                                                        <div className='relative'>
                                                                                                            <img 
                                                                                                                src={image}
                                                                                                                className={`w-full ${item.type === 'boxed-full' && 'md:h-[500px] sm:h-[400px] h-[300px]'} ${(item.type === 'boxed' || item.type === 'rectangular') && 'md:h-60 h-48'} object-cover bg-top rounded-lg border border-[#1C1B19]`}
                                                                                                                alt={`Grid Image #${i+1}`}
                                                                                                            />
                                                                                                        </div>
                                                                                                    </MotionAnimate>
                                                                                                )
                                                                                            })
                                                                                        }
                                                                                    </div>
                                                                                :
                                                                                item.element === 'single_image' ?
                                                                                    <MotionAnimate key={index} animation='fadeInUp'>
                                                                                        <img 
                                                                                            src={item.image}
                                                                                            className={`w-full ${item.type === 'boxed-full' && 'md:h-[500px] sm:h-[400px] h-[300px]'} ${(item.type === 'rectangular') && 'md:h-60 h-48'} object-cover bg-top rounded-lg border border-[#1C1B19] my-4`}
                                                                                            alt={`Grid Image`}
                                                                                        />
                                                                                    </MotionAnimate>
                                                                                :
                                                                                item.element === 'slider' ?
                                                                                    <div>
                                                                                        {
                                                                                            item.grid_image?.length > 0 && 
                                                                                            <Carousel 
                                                                                                showDots={true}
                                                                                                responsive={responsive} className="relative rounded-md border border-solid border-[#10192c]"
                                                                                                customLeftArrow={<CustomLeft />}
                                                                                                customRightArrow={<CustomRight />}
                                                                                                slidesToSlide={1}
                                                                                                swipeable
                                                                                                autoPlay={true}
                                                                                                infinite={true}
                                                                                            >
                                                                                                {
                                                                                                    item.grid_image.map((grid, x) => {
                                                                                                        return (
                                                                                                            <div key={x} className='md:px-0 md:py-4 w-full md:h-[400px] h-[200px]  rounded-md overflow-y-scroll no-scroll relative'>
                                                                                                                <img
                                                                                                                    src={grid}
                                                                                                                    alt={`gallery #${x+1}`}
                                                                                                                    className='sm:absolute sm:top-0 sm:left-0 mx-auto w-full object-cover border border-gray-900 transition duration-500 ease-in-out transform rounded-md'
                                                                                                                />
                                                                                                            </div>  
                                                                                                        )
                                                                                                    })
                                                                                                }
                                                                                            </Carousel>
                                                                                        }
                                                                                    </div>
                                                                                :
                                                                                item.element === 'code_highlights' &&
                                                                                    <div>
                                                                                        <p className='text-[#B9E0F2]'>{item.name}</p>
                                                                                        <SyntaxHighlighter language={item.language} style={hljsStyles[item.theme]} showLineNumbers={true} wrapLongLines={true}>
                                                                                            {`${item.paragraph}`}
                                                                                        </SyntaxHighlighter>
                                                                                    </div>
                                                                            }
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                            <hr className='border-gray-700 my-6'/>
                                                        </div>
                                                    )
                                                })
                                            }
                                            <div className='flex flex-wrap gap-2'>
                                                {
                                                    projectData.project?.tags.length > 0 &&
                                                    projectData.project?.tags.map((item, index) => {
                                                        return (
                                                            <span key={index} className='cursor-pointer transition-all p-4 py-3 text-sm rounded-lg bg-[#131C31] border border-solid border-[#222F43] text-gray-100 hover:text-[#0DBFDC]'>
                                                                #{item}
                                                            </span>
                                                        )
                                                    })
                                                }
                                            </div>

                                            <div className='md:block hidden'>
                                                {
                                                    user ? (
                                                        <>
                                                            <h2 className='text-3xl font-semibold my-4 mt-8 text-[#B9E0F2]'>Leave a comment</h2>
                                                            <textarea
                                                                value={comment}
                                                                onChange={(e) => setComment(e.target.value)}
                                                                name="message"
                                                                id="message"
                                                                cols="30"
                                                                rows="8"
                                                                placeholder="Write a comment"
                                                                className="w-full p-4 text-sm rounded-lg mt-2 outline-0 transition-all focus:border-gray-600 bg-[#131C31] border border-solid border-[#222F43] text-gray-100 focus:ring-gray-700"
                                                            >
                                                            </textarea>
                                                            <button onClick={submitComment} className="text-sm float-right bg-[#0DBFDC] hover:bg-transparent hover:bg-[#131C31] text-gray-100 py-2 px-4 border border-[#222F43] rounded transition-colors duration-300 ease-in-out">
                                                                {
                                                                    !submitted ?
                                                                    (
                                                                        <>
                                                                            Post Comment
                                                                        </>
                                                                    )
                                                                    :
                                                                    (
                                                                        <div className='flex flex-row justify-center items-center px-4'>
                                                                            <div role="status">
                                                                                <svg aria-hidden="true" class="w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                                                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                                                                </svg>
                                                                                <span class="sr-only">Loading...</span>
                                                                            </div>
                                                                            Sending
                                                                        </div>
                                                                    )
                                                                }
                                                            </button>
                                                        </>
                                                    )
                                                    :
                                                    (
                                                        <div className='mt-8 w-full border border-solid border-[#222F43] bg-[#131C31] text-gray-100 text-sm p-8 text-center'>
                                                            <p>You need to <a href='/login' className='hover:text-[#0DBFDC] transition-all'>login</a> to comment.</p>
                                                        </div>
                                                    )
                                                }
                                            
                                                <div className='mt-12'>
                                                    <h2 className='text-2xl font-semibold my-4 mt-8 text-[#B9E0F2]'>Comments ({ commentList && commentList.length ? commentList.length : 0 })</h2>
                                                    {
                                                        commentList && commentList.length > 0 ?
                                                            commentList.map((item, i) => {
                                                                return (
                                                                    <MotionAnimate key={i} animation='fadeInUp'>
                                                                        <div className="w-full p-4 text-sm rounded-lg mt-8 outline-0 transition-all focus:border-gray-600 bg-[#131C31] border border-solid border-[#222F43] text-gray-100 focus:ring-gray-700">
                                                                            <div className='grid grid-cols-2'>
                                                                                <div className='flex items-center text-[#0DBFDC]'>
                                                                                    <img
                                                                                        className='rounded-full xs:w-6 xs:h-6 w-6 h-6 border border-solid border-[#222F43]'
                                                                                        src={item.avatar ? convertDriveImageLink(item.avatar) : convertDriveImageLink(avatar)}
                                                                                        alt="user profile"
                                                                                    />
                                                                                    <p className='ml-2 break-all'>
                                                                                        @{item.username}  
                                                                                        {
                                                                                            user?.result?.username === item.username && 
                                                                                                <span> (Me)</span>
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                                <div className='flex items-center justify-end text-gray-100'>
                                                                                    <FontAwesomeIcon icon={faClock} className="text-gray-100"/>
                                                                                    <p className='ml-2 break-all text-sm'>{moment(item.date).fromNow()}</p>
                                                                                </div>
                                                                            </div>
                                                                            <p className='mt-4 whitespace-pre-wrap'>{item.comments}</p>
                                                                            {
                                                                                user?.result?.username === item.username && 
                                                                                    <div className='flex justify-between items-center'>
                                                                                        <div></div>
                                                                                        <p onClick={() => deleteComment(project_data.project._id, item.id)} id={item.id} className='transition-all border border-solid border-[#222F43] text-gray-100 py-2 px-4 hover:text-[#0DBFDC] text-sm cursor-pointer'><FontAwesomeIcon icon={faTrash} className="mr-2"/> Delete</p>
                                                                                    </div>
                                                                            }
                                                                        </div>
                                                                    </MotionAnimate>
                                                                )
                                                            })
                                                            :
                                                            <p className='my-8 text-sm'> No comment to show</p>
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        <div className='sm:px-2 flex flex-col gap-8'>
                                            <div className='transition-all p-4 py-5 text-sm rounded-lg bg-[#131C31] border border-solid border-[#222F43] text-gray-100'>
                                                <h2 className='text-xl font-semibold mb-2 text-[#0DBFDC]'>Project Information</h2>
                                                <hr className='border-[1.8px] border-[#0DBFDC] mb-6 w-1/3'/>
                                                
                                                <div className='mb-4'>
                                                    <h2 className='text-[#B9E0F2] mr-2 uppercase mb-2'>Category </h2>
                                                    <div className='flex flex-wrap gap-2 mb-4'>
                                                        <span className='cursor-pointer transition-all p-4 py-2 text-sm rounded-lg border border-solid border-[#222F43] text-gray-100 hover:text-[#0DBFDC]'>
                                                            #School
                                                        </span>
                                                        <span className='cursor-pointer transition-all p-4 py-2 text-sm rounded-lg border border-solid border-[#222F43] text-gray-100 hover:text-[#0DBFDC]'>
                                                            #Web Development
                                                        </span>
                                                    </div>
                                                    <hr className='border-gray-700 my-4'/>
                                                </div>
                                                
                                                <div className='mb-4'>
                                                    <h2 className='text-[#B9E0F2] mr-2 uppercase mb-2'>Portfolio</h2>
                                                    <a href={`/${project_data.username}/portfolio`} className=' transition-all text-gray-100 hover:text-[#0DBFDC]'> Click Here </a>
                                                    <hr className='border-gray-700 my-4'/>
                                                </div>

                                                <div className='mb-4'>
                                                    <h2 className='text-[#B9E0F2] mr-2 uppercase mb-2'>Project Completion </h2>
                                                    <p> {diffInMonths(project_data.project.date_start, project_data.project.date_end)}</p>
                                                    <hr className='border-gray-700 my-4'/>
                                                </div>

                                                <div className='mb-4'>
                                                    <h2 className='text-[#B9E0F2] mr-2 uppercase mb-2'>Project URL </h2>
                                                    <p> {project_data.project.url ? project_data.project.url : "N/A"}</p>
                                                    <hr className='border-gray-700 my-4'/>
                                                </div>                                

                                                <div className='flex flex-wrap text-gray-100 cursor-pointer'>
                                                    <p className='text-sm '><span className='hover:text-[#0DBFDC]'> {project_data.project.views.length} view{project_data.project.views.length > 1 && 's'}</span> • </p>
                                                    <p className='text-sm ml-1'><span className='hover:text-[#0DBFDC]'> {project_data.project.likes.length} like{project_data.project.likes.length > 1 && 's'}</span> •</p>
                                                    <p className='text-sm ml-1'><span className='hover:text-[#0DBFDC]'> {project_data.project.comment.length} comment{project_data.project.comment.length > 1 && 's'}</span></p>
                                                </div>
                                            </div>

                                            <div className='transition-all p-4 py-5 text-sm rounded-lg bg-[#131C31] border border-solid border-[#222F43] text-gray-100'>
                                                <h2 className='text-xl font-semibold mb-2 text-[#0DBFDC]'>Categories</h2>
                                                <hr className='border-[1.8px] border-[#0DBFDC] mb-6 w-1/3'/>

                                                <div className='flex flex-col gap-2 mb-4'>
                                                    {
                                                        category?.length > 0 &&
                                                        category.map((item, index) => {
                                                            return (
                                                                <a href={`/projects/category/${item.shortcut}`} key={index} className='flex justify-between items-center cursor-pointer transition-all p-4 py-3 text-sm rounded-lg border border-solid border-[#222F43] text-gray-100 hover:text-[#0DBFDC]'>
                                                                    <span>
                                                                        <FontAwesomeIcon icon={['fas', item.icon]} className='mr-2'/>
                                                                        {item.category}
                                                                    </span>

                                                                    <p className='bg-[#222F43] px-3 py-1 rounded-full text-xs'>{item.count}</p>
                                                                </a>
                                                            )
                                                        })
                                                    } 
                                                </div>
                                            </div>

                                            <div className='transition-all p-4 py-5 text-sm rounded-lg bg-[#131C31] border border-solid border-[#222F43] text-gray-100'>
                                                <h2 className='text-xl font-semibold mb-2 text-[#0DBFDC]'>Latest Projects</h2>
                                                <hr className='border-[1.8px] border-[#0DBFDC] mb-6 w-1/3'/>
                                                
                                                {
                                                    latestProjects?.length > 0 &&
                                                    latestProjects.map((item, index) => {
                                                        return (
                                                            <Link to={`/projects/${item._id}`} key={index} className='flex flex-row items-center text-sm mt-4 cursor-pointer hover:text-[#0DBFDC] text-[#B9E0F2] transition-all'>
                                                                <div className='w-full'>
                                                                    <div className='flex items-center mb-2'>
                                                                        <img
                                                                            className='flex items-start rounded-full xs:w-16 xs:h-16 w-12 h-12 border border-gray-400 object-cover'
                                                                            src={convertDriveImageLink(item.featured_image)}
                                                                            alt="user profile"
                                                                        />
                                                                        <div className='xs:ml-4 ml-2'>
                                                                            <p className='text-base font-semibold'>{item.post_title}</p>
                                                                            <p className='whitespace-pre-wrap text-sm mt-1 text-[#94a9c9]'>#{item.category_shortcut} • {convertTimezone(item.createdAt)}</p>
                                                                            <hr className='border-gray-700 mt-4'/>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className='md:hidden block'>
                                        {
                                            user ? (
                                                <>
                                                    <h2 className='text-3xl font-semibold my-4 mt-8 text-[#B9E0F2]'>Leave a comment</h2>
                                                    <textarea
                                                        value={comment}
                                                        onChange={(e) => setComment(e.target.value)}
                                                        name="message"
                                                        id="message"
                                                        cols="30"
                                                        rows="8"
                                                        placeholder="Write a comment"
                                                        className="w-full p-4 text-sm rounded-lg mt-2 outline-0 transition-all focus:border-gray-600 bg-[#131C31] border border-solid border-[#222F43] text-gray-100 focus:ring-gray-700"
                                                    >
                                                    </textarea>
                                                    <button onClick={submitComment} className="text-sm float-right bg-[#0DBFDC] hover:bg-transparent hover:bg-[#131C31] text-gray-100 py-2 px-4 border border-[#222F43] rounded transition-colors duration-300 ease-in-out">
                                                        {
                                                            !submitted ?
                                                            (
                                                                <>
                                                                    Post Comment
                                                                </>
                                                            )
                                                            :
                                                            (
                                                                <div className='flex flex-row justify-center items-center px-4'>
                                                                    <div role="status">
                                                                        <svg aria-hidden="true" class="w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                                                        </svg>
                                                                        <span class="sr-only">Loading...</span>
                                                                    </div>
                                                                    Sending
                                                                </div>
                                                            )
                                                        }
                                                    </button>
                                                </>
                                            )
                                            :
                                            (
                                                <div className='mt-8 w-full border border-solid border-[#222F43] bg-[#131C31] text-gray-100 text-sm p-8 text-center'>
                                                    <p>You need to <a href='/login' className='hover:text-[#0DBFDC] transition-all'>login</a> to comment.</p>
                                                </div>
                                            )
                                        }
                                    
                                        <div className='mt-12'>
                                            <h2 className='text-2xl font-semibold my-4 mt-8 text-[#B9E0F2]'>Comments ({ commentList && commentList.length ? commentList.length : 0 })</h2>
                                            {
                                                commentList && commentList.length > 0 ?
                                                    commentList.map((item, i) => {
                                                        return (
                                                            <MotionAnimate key={i} animation='fadeInUp'>
                                                                <div className="w-full p-4 text-sm rounded-lg mt-8 outline-0 transition-all focus:border-gray-600 bg-[#131C31] border border-solid border-[#222F43] text-gray-100 focus:ring-gray-700">
                                                                    <div className='grid grid-cols-2'>
                                                                        <div className='flex items-center text-[#0DBFDC]'>
                                                                            <img
                                                                                className='rounded-full xs:w-6 xs:h-6 w-6 h-6 border border-solid border-[#222F43]'
                                                                                src={item.avatar ? convertDriveImageLink(item.avatar) : convertDriveImageLink(avatar)}
                                                                                alt="user profile"
                                                                            />
                                                                            <p className='ml-2 break-all'>
                                                                                @{item.username}  
                                                                                {
                                                                                    user?.result?.username === item.username && 
                                                                                        <span> (Me)</span>
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                        <div className='flex items-center justify-end text-gray-100'>
                                                                            <FontAwesomeIcon icon={faClock} className="text-gray-100"/>
                                                                            <p className='ml-2 break-all text-sm'>{moment(item.date).fromNow()}</p>
                                                                        </div>
                                                                    </div>
                                                                    <p className='mt-4 whitespace-pre-wrap'>{item.comments}</p>
                                                                    {
                                                                        user?.result?.username === item.username && 
                                                                            <div className='flex justify-between items-center'>
                                                                                <div></div>
                                                                                <p onClick={() => deleteComment(project_data.project._id, item.id)} id={item.id} className='transition-all border border-solid border-[#222F43] text-gray-100 py-2 px-4 hover:text-[#0DBFDC] text-sm cursor-pointer'><FontAwesomeIcon icon={faTrash} className="mr-2"/> Delete</p>
                                                                            </div>
                                                                    }
                                                                </div>
                                                            </MotionAnimate>
                                                        )
                                                    })
                                                    :
                                                    <p className='my-8'> No comments to show</p>
                                            }
                                        </div>
                                    </div>
                                </>
                            }

                            <div className='grid sm:grid-cols-3 grid-cols-1 gap-5 place-content-start mt-8'>
                                <div className='col-span-2'>
                                    {/* <h2 className='text-3xl font-semibold my-4 text-[#0DBFDC]'>Lists w/ Image and Link</h2>

                                    <div className='grid sm:grid-cols-2 grid-cols-1 gap-1 place-content-start mt-8'>
                                        <div className='flex items-center relative hover:bg-gray-700 transition-all p-2'>
                                            <img
                                                className='rounded-sm xs:w-12 xs:h-12 w-10 h-10 border border-gray-400 object-cover'
                                                src={'https://drive.google.com/thumbnail?id=1YYA-nZXtL9JO2DfCANY0U4aQnEBrXtB5&sz=w1000'}
                                                alt="user profile"
                                            />
                                            <div className='xs:ml-4 ml-2'>
                                                <p className='text-white xs:text-sm text-sm break-all'>{'RazorScythe'}</p>
                                                <p className='whitespace-pre-wrap xs:text-xs text-xs mt-1 text-[#B9E0F2]'>1 pcs</p>
                                                <a><FontAwesomeIcon icon={faExternalLink} className='cursor-pointer text-[#0DBFDC] absolute right-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2'/></a>
                                            </div>
                                        </div>
                                        <div className='flex items-center relative hover:bg-gray-700 transition-all p-2'>
                                            <img
                                                className='rounded-sm xs:w-12 xs:h-12 w-10 h-10 border border-gray-400 object-cover'
                                                src={'https://drive.google.com/thumbnail?id=1YYA-nZXtL9JO2DfCANY0U4aQnEBrXtB5&sz=w1000'}
                                                alt="user profile"
                                            />
                                            <div className='xs:ml-4 ml-2'>
                                                <p className='text-white xs:text-sm text-sm break-all'>{'RazorScythe'}</p>
                                                <p className='whitespace-pre-wrap xs:text-xs text-xs mt-1 text-[#B9E0F2]'>1 pcs</p>
                                                <a><FontAwesomeIcon icon={faExternalLink} className='cursor-pointer text-[#0DBFDC] absolute right-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2'/></a>
                                            </div>
                                        </div>
                                        <div className='flex items-center relative hover:bg-gray-700 transition-all p-2'>
                                            <img
                                                className='rounded-sm xs:w-12 xs:h-12 w-10 h-10 border border-gray-400 object-cover'
                                                src={'https://drive.google.com/thumbnail?id=1YYA-nZXtL9JO2DfCANY0U4aQnEBrXtB5&sz=w1000'}
                                                alt="user profile"
                                            />
                                            <div className='xs:ml-4 ml-2'>
                                                <p className='text-white xs:text-sm text-sm break-all'>{'RazorScythe'}</p>
                                                <p className='whitespace-pre-wrap xs:text-xs text-xs mt-1 text-[#B9E0F2]'>1 pcs</p>
                                                <a><FontAwesomeIcon icon={faExternalLink} className='cursor-pointer text-[#0DBFDC] absolute right-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2'/></a>
                                            </div>
                                        </div>
                                    </div> */}
                                </div>
                                <div>
                                    {/* <p>Hi</p> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectsSingle