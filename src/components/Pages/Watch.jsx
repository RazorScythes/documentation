import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom';

import { faEye, faFilm, faSearch, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useScreenSize } from '../Tools';
import { Comments, CommentField } from '../Custom/Comments'
import { main, dark, light } from '../../style';
import { getVideoById, getVideoComment, addVideoComment, updateVideoComment } from '../../actions/watch';

import Poster from '../Custom/Poster';
import styles from "../../style";

const Watch = ({ user, theme }) => {
    const dispatch = useDispatch()
    const { id } = useParams();
    
    const video = useSelector((state) => state.watch.data)
    const comments = useSelector((state) => state.watch.comments)
    const notFound = useSelector((state) => state.watch.notFound)
    const forbiden = useSelector((state) => state.watch.forbiden)
    const loading = useSelector((state) => state.watch.isLoading)

    const [searchParams, setSearchParams] = useSearchParams();
    const access_key = searchParams.get('access_key')

    const [videoData, setVideoData] = useState(null)

    useEffect(() => {
        dispatch(getVideoById({ id, access_key }))
    }, [id])

    useEffect(() => {
        setVideoData(video);
        dispatch(getVideoComment({id}));
    }, [video])
    
    useEffect(() => {
        if(comments.length) {
            const deepClonedComments = JSON.parse(JSON.stringify(comments));

            setData(deepClonedComments);
            setComment(null);
        }
        else setData([]);
    }, [comments])

    useEffect(() => {
        console.log(videoData)
    }, [videoData])
    
    const [data, setData] = useState([])
    const [comment, setComment] = useState(null)
    const [toggle, setToggle] = useState({
        description: false
    })

    const expandDescription = () => {
        const screensize = useScreenSize()
        if((screensize === 'sm' || screensize === 'xs') && !toggle.description) {
            setToggle({...toggle, description: true})
        }
    }

    useEffect(() => {
        if(comment) {
            let newData = [comment, ...data]
            
            comment.parent_id = id;
            comment.user_id = user._id;
            comment.type = 'video';

            dispatch(addVideoComment(comment))
        }
    }, [comment])

    const handleComment = (formData) => {
        dispatch(updateVideoComment({
            id,
            data: formData
        }))
    }

    return (
        <div className={`relative overflow-hidden ${main.font} ${theme === 'light' ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidth}`}>

                    {
                        forbiden === 'strict' ?
                            <div className="flex flex-col justify-center items-center my-24 md:w-1/2 w-full mx-auto py-20">
                                <h1 className="sm:text-9xl text-6xl font-semibold mb-4 text-center relative">
                                    <FontAwesomeIcon icon={faTriangleExclamation} className='absolute top-[-2rem] sm:right-[-3rem] right-[-2rem] sm:w-12 sm:h-12 w-8 h-8'/>
                                    <span className={`${theme === 'light' ? light.heading : dark.heading}`}>409</span>
                                </h1>
                                <h2 className="sm:text-3xl text-xl font-medium mb-4 text-center relative">Oops, sorry this video is restricted!</h2>
                                <p className="mb-8 text-center text-sm leading-6">You don't have previledge to access this video.</p>
                                <a href="/" className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>Back to home page</a>
                            </div>
                        :
                        forbiden === 'private' ?
                            <div className="flex flex-col justify-center items-center my-24 md:w-1/2 w-full mx-auto py-20">
                                <h1 className="sm:text-9xl text-6xl font-semibold mb-4 text-center relative">
                                    <FontAwesomeIcon icon={faTriangleExclamation} className='absolute top-[-2rem] sm:right-[-3rem] right-[-2rem] sm:w-12 sm:h-12 w-8 h-8'/>
                                    <span className={`${theme === 'light' ? light.heading : dark.heading}`}>409</span>
                                </h1>
                                <h2 className="sm:text-3xl text-xl font-medium mb-4 text-center relative">Oops, sorry this video is private!</h2>
                                <p className="mb-8 text-center text-sm leading-6">You don't have previledge to access this video.</p>
                                <a href="/" className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>Back to home page</a>
                            </div>
                        :
                        forbiden === 'access_invalid' ?
                            <div className="flex flex-col justify-center items-center my-24 md:w-1/2 w-full mx-auto py-20">
                                <h1 className="sm:text-9xl text-6xl font-semibold mb-4 text-center relative">
                                    <FontAwesomeIcon icon={faSearch} className='absolute top-[-2rem] sm:right-[-3rem] right-[-2rem] sm:w-12 sm:h-12 w-8 h-8'/>
                                    <span className={`${theme === 'light' ? light.heading : dark.heading}`}>409</span>
                                </h1>
                                <h2 className="sm:text-3xl text-xl font-medium mb-4 text-center relative">Oops, sorry access key is invalid!</h2>
                                <p className="mb-8 text-center text-sm leading-6">You don't have previledge to access this video.</p>
                                <a href="/" className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>Back to home page</a>
                            </div>
                        :
                        notFound ?
                            <div className="flex flex-col justify-center items-center my-24 md:w-1/2 w-full mx-auto py-20">
                                <h1 className="sm:text-9xl text-6xl font-semibold mb-4 text-center relative">
                                    <FontAwesomeIcon icon={faSearch} className='absolute top-[-2rem] sm:right-[-3rem] right-[-2rem] sm:w-12 sm:h-12 w-8 h-8'/>
                                    <span className={`${theme === 'light' ? light.heading : dark.heading}`}>404</span>
                                </h1>
                                <h2 className="sm:text-3xl text-xl font-medium mb-4 text-center relative">Oops, sorry we can't find that video!</h2>
                                <p className="mb-8 text-center text-sm leading-6">Either something went wrong or the video doesn't exist anymore.</p>
                                <a href="/" className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>Back to home page</a>
                            </div>
                        :
                        <div className={`${main.container} file:lg:px-8 relative px-0 my-12`}>
                            <div className='grid md:grid-cols-3 grid-cols-1 gap-5 place-content-start mt-8'>
                                <div className="md:col-span-2">
                                    <div className="relative w-full overflow-hidden pb-[56.25%] rounded-md">
                                        <div className={`animate-pulse absolute top-0 left-0 w-full h-full ${theme === 'light' ? light.background : dark.background} border ${theme === 'light' ? light.border : dark.border}`}>

                                        </div>
                                        {/* <iframe 
                                            src="https://drive.google.com/file/d/1TWGGc50TAU8nNGnFmmZUTi2zkHtcpM7Y/preview"
                                            className={`absolute top-0 left-0 w-full h-full ${theme === 'light' ? light.background : dark.background} border ${theme === 'light' ? light.border : dark.border}`}
                                            allow="autoplay"
                                            sandbox="allow-scripts allow-same-origin"
                                            allowFullScreen
                                        >
                                        </iframe> */}
                                    </div>

                                    <div className={`mt-4 rounded-md p-4 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                        {
                                            loading ?
                                                <div className='w-full flex flex-col items-start transition-all gap-2 relative overflow-x-hidden'>
                                                    <div className={`w-72 h-5 animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`}></div>
                                                    <div className={`w-96 h-5 animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`}></div>

                                                    <div className='mt-6 flex flex-col gap-2'>
                                                        <div className={`w-screen h-24 animate-pulse ${theme === 'light' ? light.focusbackground : dark.focusbackground}`}></div>
                                                    </div>
                                                </div> 
                                            :   
                                            <div className='w-full flex items-start transition-all'>
                                                <div onClick={() => expandDescription()} className={`flex-1 overflow-hidden sm:h-auto ${toggle.description ? 'h-auto' : 'h-14 md:cursor-auto cursor-pointer'}`}>
                                                    <h1 className="text-lg font-medium"> { videoData?.video?.title } </h1>
                                                    <p className={`${!toggle.description && 'truncate'} w-full ${theme === 'light' ? light.text : dark.text}`}> { videoData?.video?.createdAt } </p>
                                                    <p className={`w-full leading-5 my-2 ${theme === 'light' ? light.text : dark.text}`}>
                                                        { videoData?.video?.description ?? 'No Description' }
                                                    </p>

                                                    <div className='flex flex-col gap-3'>
                                                        <p className='flex items-center'>
                                                            <span className='font-medium mr-2'>Author/Artist:</span> 
                                                            <div className='flex flex-wrap gap-2'>
                                                                {
                                                                    videoData?.video?.owner.map((item, i) => {
                                                                        return (
                                                                            <p
                                                                                key={i}
                                                                                className={`cursor-pointer px-3 py-1 rounded-full text-white ${
                                                                                    theme === "light"
                                                                                        ? light.button_secondary
                                                                                        : dark.button_secondary
                                                                                }`}
                                                                            >
                                                                                @{item.name}
                                                                            </p>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </p>

                                                        <p className='flex items-center'>
                                                            <span className='font-medium mr-2'>Category:</span> 
                                                            <div className='flex flex-wrap gap-2'>
                                                                {
                                                                    videoData?.video?.category.map((item, i) => {
                                                                        return (
                                                                            <p
                                                                                key={i}
                                                                                className={`cursor-pointer px-3 py-1 rounded-full text-white ${
                                                                                    theme === "light"
                                                                                        ? light.button_secondary
                                                                                        : dark.button_secondary
                                                                                }`}
                                                                            >
                                                                                {item.name}
                                                                            </p>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </p>

                                                        <p className='flex items-center'>
                                                            <span className='font-medium mr-2'>Tags:</span> 
                                                            <div className='flex flex-wrap gap-2'>
                                                                {
                                                                    videoData?.video?.tags.map((item, i) => {
                                                                        return (
                                                                            <p
                                                                                key={i}
                                                                                className={`cursor-pointer px-3 py-1 rounded-full text-white ${
                                                                                    theme === "light"
                                                                                        ? light.button_secondary
                                                                                        : dark.button_secondary
                                                                                }`}
                                                                            >
                                                                                #{item.name}
                                                                            </p>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </p>
                                                    </div>
                                                    <p onClick={(e) => {
                                                        e.stopPropagation();
                                                        setToggle({...toggle, description: false})
                                                    }} className={`sm:hidden block text-xs mt-4 text-center ${theme === 'light' ? light.link : dark.link}`}>Show Less</p>
                                                </div>
                                            </div>
                                        }
                                    </div>

                                    <div className={`mt-4 rounded-md p-4 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                        <h1 className="text-xl font-medium">Recommendation</h1>

                                        <div className='grid sm:grid-cols-4 xs:grid-cols-3 grid-cols-2 gap-4 place-content-start mt-4'>
                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Movie'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Anime'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Anime'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Movie'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Movie'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Anime'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Anime'
                                                }}
                                                theme={theme}
                                            />

                                            <Poster 
                                                data={{
                                                    thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg',
                                                    title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                    type: 'Movie'
                                                }}
                                                theme={theme}
                                            />
                                        </div>
                                    </div>

                                    <div className={`mt-4 rounded-md p-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                        <h1 className="text-xl font-medium">Comments</h1>
                                        
                                        <div className={`flex flex-col gap-4 mt-4`}>
                                            
                                            <CommentField
                                                comment={comment}
                                                setComment={setComment}
                                                theme={theme}
                                            />
                                            
                                            <h2 className='text-base'>{data?.length ?? 0} Comment{data?.length > 1 && 's'}</h2>

                                            {
                                                data?.length > 0 &&
                                                    data.map((item, i) => {
                                                        return (
                                                            <Comments 
                                                                key={i}
                                                                theme={theme}
                                                                data={item}
                                                                handleSubmit={handleComment}
                                                            />
                                                        )
                                                    })
                                            }

                                        </div>
                                    </div>

                                </div>
                                <div className='flex flex-col gap-4'>
                                    <div className={`rounded-md p-4 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                        <h1 className="text-lg font-medium">Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season</h1>
                                        <p className={`truncate w-full mt-2 mb-8 ${theme === 'light' ? light.text : dark.text}`}>2024 • 12 Episodes</p>
                                    
                                        <div className='md:flex md:flex-col sm:grid sm:grid-cols-2 flex flex-col gap-4 max-h-[500px] overflow-y-auto'>
                                            <Link to={`/`} className='w-full flex items-start cursor-pointer transition-all'>
                                                <div className={`rounded-md overflow-hidden md:w-48 md:max-w-48 xs:w-36 xs:max-w-36 w-56 max-w-32 h-20 mr-2 relative border ${theme === 'light' ? light.border : dark.border}`}>

                                                    <p style={{backgroundColor: 'rgb(0, 0, 0, 0.8'}} className='w-full text-white text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-xs py-1'>Watching</p>

                                                    <img 
                                                        src={`https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg`} alt="Video Thumbnail" 
                                                        className='w-full mx-auto object-cover h-20'
                                                    />
                                                    <div className='absolute top-1 right-1 rounded-sm text-white bg-blue-700 border border-solid border-blue-600' title={'Video'}>
                                                        <p className='font-semibold p-1 px-1 py-0 text-xs'><FontAwesomeIcon icon={faFilm} /></p>
                                                    </div>
                                                    <div className='absolute bottom-1 right-1 rounded-sm text-white bg-blue-700 border border-solid border-blue-600'>
                                                        <p className='p-1 px-1 py-0 text-xs'>{'00:00'}</p>
                                                    </div>
                                                </div>

                                                <div className='flex flex-col w-60 max-w-60 overflow-x-hidden'>
                                                    <p className='truncate w-full mt-2'>
                                                        Episode 1
                                                    </p>
                                                    <p className={`text-xs truncate w-full mt-2 ${theme === 'light' ? light.text : dark.text}`}><FontAwesomeIcon icon={faEye} /> 80</p>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className={`rounded-md p-4 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                        <div className='flex justify-between items-center mb-6'>
                                            <h1 className="text-2xl font-medium">Recent Anime</h1>
                                            <button className={`${theme === 'light' ? light.button_transparent : dark.button_transparent} rounded-md px-2`}>
                                                View All
                                            </button>
                                        </div>
                                        
                                        <div className='md:flex md:flex-col sm:grid sm:grid-cols-2 flex flex-col gap-4'>
                                            <div className='w-full flex items-start cursor-pointer transition-all'>
                                                <div className="w-16 flex-shrink-0 mr-4">
                                                    <img 
                                                        className={`max-h-64 w-full object-cover rounded-md border border-solid ${theme === 'light' ? light.border : dark.semiborder}`}
                                                        src='https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg'
                                                        alt='Shangri-La Frontier'
                                                    />
                                                </div>
                                                <div className='flex-1 overflow-hidden'>
                                                    <p className='truncate w-full mt-2'>
                                                        Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season
                                                    </p>
                                                    <p className={`truncate w-full mt-2 ${theme === 'light' ? light.text : dark.text}`}>2024 • 12 Episodes</p>
                                                </div>
                                            </div>

                                            <div className='w-full flex items-start cursor-pointer transition-all'>
                                                <div className="w-16 flex-shrink-0 mr-4">
                                                    <img 
                                                        className={`max-h-64 w-full object-cover rounded-md border border-solid ${theme === 'light' ? light.border : dark.semiborder}`}
                                                        src='https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg'
                                                        alt='Shangri-La Frontier'
                                                    />
                                                </div>
                                                <div className='flex-1 overflow-hidden'>
                                                    <p className='truncate w-full mt-2'>
                                                        Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season
                                                    </p>
                                                    <p className={`truncate w-full mt-2 ${theme === 'light' ? light.text : dark.text}`}>2024 • 12 Episodes</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Watch