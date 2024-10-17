import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faChevronUp, faChevronDown, faTrash, faArrowRight, faCalendar, faQuoteLeft, faQuoteRight, faArrowLeft, faClock, faArrowRightRotate, faHeart, faHomeLg, faComment } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams, useParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom';
import { getBlogByID, getBlogComments, uploadBlogComment, removeBlogComment, addOneBlogViews, getLatestBlogs,addLatestBlogLikes, countBlogCategories, clearAlert } from "../../actions/blogs";
import { MotionAnimate } from 'react-motion-animate'
import { convertDriveImageLink } from '../Tools'
import Cookies from 'universal-cookie';
import loading from '../../assets/loading.gif'
import heroImage from '../../assets/hero-image.jpg';
import moment from 'moment'
import styles from "../../style";

const cookies = new Cookies();

const BlogsSingle = ({ user }) => {
    const { id, embed_user_id } = useParams();

    const dispatch = useDispatch()
    const navigate  = useNavigate()

    const blog_data = useSelector((state) => state.blogs.data)
    const comments = useSelector((state) => state.blogs.comments)
    const categories = useSelector((state) => state.blogs.categories)
    const notFound = useSelector((state) => state.blogs.notFound)
    const forbiden = useSelector((state) => state.blogs.forbiden)
    const isLoading = useSelector((state) => state.blogs.isLoading)
    const latestBlogs = useSelector((state) => state.blogs.latestBlogs)

    const [avatar, setAvatar] = useState(localStorage.getItem('avatar')?.replaceAll('"', ""))
    const [searchParams, setSearchParams] = useSearchParams();
    const [blogData, setBlogData] = useState({})
    const [commentList, setCommentList] = useState([])
    const [comment, setComment] = useState('')
    const [deleted, setDeleted] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [latestList, setLatestList] = useState([])

    useEffect(() => {
        setBlogData({})
        dispatch(getLatestBlogs({
            id: user ? user.result?._id : '',
            blogId: id 
        }))
        dispatch(getBlogComments({ blogId: id }))
        dispatch(getBlogByID({ 
            id: user ? user.result?._id : '', 
            blogId: id 
        }))
        dispatch(countBlogCategories({
            id: user ? user.result?._id : ''
        }))
        window.scrollTo(0, 0)
    }, [id])

    useEffect(() => {
        setCommentList(comments)
        setSubmitted(false)
        setDeleted(false)
        setComment('')
    }, [comments])

    useEffect(() => {
        if(Object.keys(blog_data).length !== 0) {
            setBlogData(blog_data)
            dispatch(addOneBlogViews({
                id: cookies.get('uid'),
                blogId: blog_data.blog._id
            }))
        }
        if(latestBlogs.length > 0) {
            setLatestList(latestBlogs)
        }
    }, [blog_data, latestBlogs])

    const submitComment = () => {
        if(comment.length === 0) return

        if(!submitted) {
            dispatch(uploadBlogComment({
                id: blog_data.blog._id,
                user: user?.result._id,
                comment: comment
            }))
            setSubmitted(true)
        }
    }

    const deleteComment = (parent_id, comment_id) => {
        if(confirm("Are you sure you want to remove your comment? action cannot be undone."))
            if(!deleted) {
                dispatch(removeBlogComment({
                    parent_id: parent_id,
                    comment_id: comment_id
                }))
                setDeleted(true)
            }
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

    const checkedForLikedBLogs = (likes) => {
        if(!likes) return false
        var liked = likes.some((item) => { if(item === cookies.get('uid')) return true })
        return liked ? liked : false;
    }

    const addLikes = (index) => {
        var array = [...latestList]
        var duplicate = false
    
        array[index].likes.map((item) => { if(item === cookies.get('uid')) duplicate = true })
        if(!duplicate) {
            var updatedBlog = { ...array[index] }; 

            updatedBlog.likes = Array.isArray(updatedBlog.likes)
            ? [...updatedBlog.likes]
            : [];

            updatedBlog.likes.push(cookies.get('uid'));

            array[index] = updatedBlog;

            setLatestList(array);
        }
        else {
            var updatedBlog = { ...array[index] };

            updatedBlog.likes = Array.isArray(updatedBlog.likes)
            ? [...updatedBlog.likes]
            : [];

            updatedBlog.likes = updatedBlog.likes.filter((item) => item !== cookies.get('uid'))

            array[index] = updatedBlog;

            setLatestList(array);
        }

        dispatch(addLatestBlogLikes({
            id: array[index]._id,
            likes: array[index].likes,
            userId: user ? user.result?._id : '',
            blogId: id 
        }))
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
                                                    <h1 className="text-white text-4xl font-bold mb-4 text-center">Restricted Blog</h1>
                                                    <p className="text-white text-lg mb-8 text-center">You don't have permission to view this blog.</p>
                                                    <a href="/blog" className="text-white underline hover:text-gray-200">Go back to blog page</a>
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
                                                    <h1 className="text-white text-4xl font-bold mb-4 text-center">Blog is Private</h1>
                                                    <p className="text-white text-lg mb-8 text-center">Contact the owner to provide information about this.</p>
                                                    <a href="/blog" className="text-white underline hover:text-gray-200">Go back to blog page</a>
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
                                                    <h1 className="text-white text-4xl font-bold mb-4 text-center">Blog not Found</h1>
                                                    <p className="text-white text-lg mb-8 text-center">The blog you're looking for doesn't exist.</p>
                                                    <a href="/blog" className="text-white underline hover:text-gray-200">Go back to blog page</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                :
                                Object.keys(blogData).length !== 0  &&
                                <>
                                    <div className='flex flex-row flex-wrap items-center text-sm'>
                                        <div className='mr-2'><FontAwesomeIcon icon={faHomeLg} className='mr-1'/> <a href='/' className='hover:underline transition-all hover:text-[#0CBCDC]'> Home </a></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <a href='/blogs' className='hover:underline transition-all hover:text-[#0CBCDC]'> Blogs </a></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> {blogData.blog.post_title} </div>
                                    </div>

                                    <hr className='border-[#94a9c9] my-4'/>

                                    <div className='w-full xs:h-80 h-auto flex items-center justify-center overflow-y-scroll no-scroll relative rounded-lg'>
                                        <div className='sm:absolute'>
                                            <div className="w-screen absolute inset-0 bg-black opacity-30 z-30 h-auto"></div>
                                            <img 
                                                src={blogData.blog.secondary_featured_image ? convertDriveImageLink(blogData.blog.secondary_featured_image) : convertDriveImageLink(blogData.blog.featured_image)}
                                                className='w-screen object-cover rounded-lg m-auto left-0 right-0'
                                                alt="Display Image"
                                            />
                                        </div>
                                    </div>

                                    <div className='flex flex-row items-center text-sm mt-12 pb-4'>
                                        <div className='sm:w-3/4 w-full'>
                                            <h1 className='sm:text-5xl text-4xl font-semibold text-[#0DBFDC] drop-shadow-md'> {blogData.blog.post_title} </h1>
                                        </div>
                                        <div className='sm:w-1/4 w-full sm:block hidden'>

                                        </div>
                                    </div>

                                    <div className='flex flex-row items-center text-sm mt-4'>
                                        <div className='sm:w-3/4 w-full'>
                                            <div className='flex mb-8'>
                                                <img
                                                    className='rounded-full xs:w-12 xs:h-12 w-10 h-10 border border-gray-400'
                                                    src={convertDriveImageLink(blogData.avatar)}
                                                    alt="user profile"
                                                />
                                                <div className='xs:ml-4 ml-2'>
                                                    <p className='text-white xs:text-sm text-lg break-all font-semibold'>{blogData.username}</p>
                                                    <p className='whitespace-pre-wrap xs:text-sm text-sm mt-1'>{convertTimezone(blogData.blog.createdAt)} ({moment(blogData.blog.createdAt).fromNow()})</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='sm:w-1/4 w-full sm:block hidden'>

                                        </div>
                                    </div>

                                    <div className='grid sm:grid-cols-3 grid-cols-1 gap-5 place-content-start mt-8'>
                                        <div className='col-span-2'>
                                            {
                                                blogData.blog.content?.map((data, index) => {
                                                    return (
                                                        <div key={index}>
                                                            {
                                                                data.element === 'normal_naragraph' ?
                                                                    <p className='leading-normal mt-2 whitespace-pre-wrap'>
                                                                        {data.paragraph}
                                                                    </p>
                                                                :
                                                                data.element === 'quoted_paragraph' ?
                                                                    <p className='my-8 whitespace-pre-wrap'>
                                                                        <FontAwesomeIcon icon={faQuoteLeft} className='mr-1 text-xs mb-1'/><span className='font-semibold'>{data.paragraph}</span><FontAwesomeIcon icon={faQuoteRight} className='ml-1 text-xs mb-1'/>
                                                                    </p>
                                                                :
                                                                data.element === 'grid_image' ?
                                                                    <div className={`grid ${(data.type === 'boxed') && 'sm:grid-cols-2'} grid-cols-1 gap-2 place-content-start my-4`}>
                                                                        {
                                                                            data.grid_image?.map((image, i) => {
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
                                                                                                className={`w-full ${data.type === 'boxed-full' && 'md:h-[500px] sm:h-[400px] h-[300px]'} ${(data.type === 'boxed' || data.type === 'rectangular') && 'md:h-60 h-48'} object-cover bg-top rounded-lg border border-[#1C1B19]`}
                                                                                                alt={`Grid Image #${i+1}`}
                                                                                            />
                                                                                        </div>
                                                                                    </MotionAnimate>
                                                                                )
                                                                            })
                                                                        }
                                                                    </div>
                                                                :
                                                                data.element === 'sub_heading' ?
                                                                    <h2 className='text-2xl font-semibold my-4 text-[#B9E0F2]'>{data.heading}</h2>
                                                                :
                                                                data.element === 'bullet_list' ?
                                                                    <ul className='list-disc pl-4 my-6'>
                                                                        {
                                                                            data.list?.map((l, i) => {
                                                                                return (
                                                                                    <li className='mb-1' key={i}>{l}</li>
                                                                                )
                                                                            })
                                                                        }
                                                                    </ul>
                                                                :
                                                                data.element === 'number_list' ?
                                                                    <ul className='list-decimal pl-4 my-6'>
                                                                        {
                                                                            data.list?.map((l, i) => {
                                                                                return (
                                                                                    <li className='mb-1' key={i}>{l}</li>
                                                                                )
                                                                            })
                                                                        }
                                                                    </ul>
                                                                :
                                                                data.element === 'single_image' &&
                                                                    <MotionAnimate key={index} animation='fadeInUp'>
                                                                        <img 
                                                                            src={data.image}
                                                                            className={`w-full ${data.type === 'boxed-full' && 'md:h-[500px] sm:h-[400px] h-[300px]'} ${(data.type === 'rectangular') && 'md:h-60 h-48'} object-cover bg-top rounded-lg border border-[#1C1B19] my-4`}
                                                                            alt={`Grid Image`}
                                                                        />
                                                                    </MotionAnimate>
                                                            }
                                                        </div>
                                                    )
                                                })
                                            }

                                            {
                                                blogData.prev ? 
                                                <div className='flex items-center justify-between my-8'>
                                                    <Link to={`/blogs/${blogData.prev}`} className="rounded-full text-base float-right bg-[#0DBFDC] hover:bg-transparent hover:bg-[#131C31] text-gray-100 py-2 px-4 border border-[#222F43] transition-colors duration-300 ease-in-out">
                                                        <FontAwesomeIcon icon={faArrowLeft} className='mr-2 text-xs'/> Previous Post
                                                    </Link>
                                                    {
                                                        blogData.next &&
                                                        <Link to={`/blogs/${blogData.next}`} className="rounded-full text-base float-right bg-[#0DBFDC] hover:bg-transparent hover:bg-[#131C31] text-gray-100 py-2 px-4 border border-[#222F43] transition-colors duration-300 ease-in-out">
                                                            Next Post <FontAwesomeIcon icon={faArrowRight} className='ml-2 text-xs'/>
                                                        </Link>
                                                    }
                                                </div>
                                                :
                                                <div className='flex items-center justify-end my-8'>
                                                    <Link to={`/blogs/${blogData.next}`} className="rounded-full text-base float-right bg-[#0DBFDC] hover:bg-transparent hover:bg-[#131C31] text-gray-100 py-2 px-4 border border-[#222F43] transition-colors duration-300 ease-in-out">
                                                        Next Post <FontAwesomeIcon icon={faArrowRight} className='ml-2 text-xs'/>
                                                    </Link>
                                                </div>
                                            }

                                            <hr className='border-gray-700 my-6'/>

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
                                                <h2 className='text-xl font-semibold mb-2 text-[#0DBFDC]'>Blog Categories</h2>
                                                <hr className='border-[1.8px] border-[#0DBFDC] mb-6 w-1/3'/>

                                                <div className='flex flex-col gap-2 mb-4'>
                                                    {
                                                        categories?.length > 0 &&
                                                        categories.map((item, index) => {
                                                            return (
                                                                <a href={`/blogs?type=&page=1&category=${item.category}`} key={index} className='flex justify-between items-center cursor-pointer transition-all p-4 py-3 text-sm rounded-lg border border-solid border-[#222F43] text-gray-100 hover:text-[#0DBFDC]'>
                                                                    <span>
                                                                        {/* <FontAwesomeIcon icon={['fas', item.icon]} className='mr-2'/> */}
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
                                                <h2 className='text-xl font-semibold mb-2 text-[#0DBFDC]'>Latest Blog{latestList?.length > 1 && 's'}</h2>
                                                <hr className='border-[1.8px] border-[#0DBFDC] mb-6 w-1/3'/>
                                                
                                                {
                                                    latestList?.length > 0 &&
                                                    latestList.map((item, index) => {
                                                        var liked_blogs = checkedForLikedBLogs(item.likes);
                                                        return (
                                                            <div key={index} className='flex flex-row items-center text-sm mt-4 hover:text-[#0DBFDC] text-[#B9E0F2] transition-all'>
                                                                <div className='w-full'>
                                                                    <div className='flex items-center mb-2'>
                                                                        <img
                                                                            className='rounded-full xs:w-16 xs:h-16 w-12 h-12 border border-gray-400 object-cover'
                                                                            src={convertDriveImageLink(item.featured_image)}
                                                                            alt="user profile"
                                                                        />
                                                                        <div className='xs:ml-4 ml-2'>
                                                                            <Link to={`/blogs/${item._id}`}><p className='text-base font-semibold cursor-pointer'>{item.post_title}</p></Link>
                                                                            <p className='whitespace-pre-wrap text-sm mt-1 text-[#94a9c9]'>#{item.categories} • {convertTimezone(item.createdAt)}</p>
                                                                            
                                                                            <div className='flex flex-wrap items-center text-gray-100 mt-1'>
                                                                                <button className='cursor-pointer' onClick={() => addLikes(index, item._id)}><FontAwesomeIcon icon={faHeart} style={{color: liked_blogs ? '#CD3242' : '#FFF'}} className='pt-[0.15rem] font-bold text-base'/> {item.likes?.length > 0 ? item.likes.length : 0} </button>
                                                                                <span className='mx-2 text-lg'>•</span>
                                                                                <p className='text-sm'><FontAwesomeIcon icon={faComment} className='mx-1'/> {item.comments > 0 ? item.comments : 0}</p>
                                                                            </div>
                                                                            
                                                                            <hr className='border-gray-700 mt-2'/>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                            {
                                                blogData.blog.tags?.length > 0 &&
                                                <div className='transition-all p-4 py-5 text-sm rounded-lg bg-[#131C31] border border-solid border-[#222F43] text-gray-100'>
                                                    <h2 className='text-xl font-semibold mb-2 text-[#0DBFDC]'>Tag{blogData.blog.tags?.length > 1 && 's'}</h2>
                                                    <hr className='border-[1.8px] border-[#0DBFDC] mb-6 w-1/3'/>

                                                    <div className='flex flex-wrap gap-2'>
                                                        {
                                                            blogData.blog.tags?.length > 0 &&
                                                            blogData.blog.tags.map((tag, index) => {
                                                                return (
                                                                    <span key={index} className='cursor-pointer transition-all p-4 py-3 text-sm rounded-lg bg-[#131C31] border border-solid border-[#222F43] text-gray-100 hover:text-[#0DBFDC]'>
                                                                        #{tag}
                                                                    </span>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                            }
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BlogsSingle