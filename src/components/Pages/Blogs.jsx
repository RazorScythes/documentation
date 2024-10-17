import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faComment, faChevronUp, faChevronDown, faArrowRight, faCalendar, faHeart, faHomeLg, faSearch, faClose, faCheck, faArrowLeft, faCheckSquare, faSquare } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, useParams } from "react-router-dom";
import { Link, useNavigate } from 'react-router-dom';
import { blogsCountTags, getLatestBlogs, addLatestBlogLikes, getBlogs, countBlogCategories, addOneBlogLikes, getBlogsBySearchKey, countBlogCategoriesBySearchKey, addOneBlogLikesBySearchKey } from "../../actions/blogs";
import { MotionAnimate } from 'react-motion-animate'
import { convertDriveImageLink } from '../Tools'
import Cookies from 'universal-cookie';
import loading from '../../assets/loading.gif'
import moment from 'moment';
import heroImage from '../../assets/hero-image.jpg';
import styles from "../../style";

const cookies = new Cookies();

const TextWithEllipsis = ({ text, limit = 55 }) => {
    if (text.length > limit) {
      return <span>{text.slice(0, limit)}...</span>;
    }
    return <span>{text}</span>;
}

const Blogs = ({ user }) => {
    const { key } = useParams();

    const navigate  = useNavigate()
    const dispatch = useDispatch()

    const blog = useSelector((state) => state.blogs.blogs)
    const tagsList = useSelector((state) => state.blogs.tagsCount)
    const categories = useSelector((state) => state.blogs.categories)
    const isLoading = useSelector((state) => state.blogs.isLoading)
    const latestBlogs = useSelector((state) => state.blogs.latestBlogs)

    const [tags, setTags] = useState([])
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState('')
    const [searchKey, setSearchKey] = useState('')
    const [latestList, setLatestList] = useState([])

    useEffect(() => {
        if(key) {
            dispatch(getBlogsBySearchKey({
                id: user ? user.result?._id : '',
                searchKey: key
            }))
            dispatch(countBlogCategoriesBySearchKey({
                id: user ? user.result?._id : '',
                searchKey: key
            }))
        }
        else {
            dispatch(getBlogs({
                id: user ? user.result?._id : ''
            }))
            dispatch(countBlogCategories({
                id: user ? user.result?._id : ''
            }))
            dispatch(blogsCountTags({
                id: user ? user.result?._id : ''
            }))
        }
        dispatch(getLatestBlogs({
            id: user ? user.result?._id : '',
        }))
    }, [])

    const pageIndex = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1
    const navType = searchParams.get('type') ? searchParams.get('type') : ''
    const filteredType = searchParams.get('category') ? searchParams.get('category') : ''
    const paramIndex = searchParams.get('type') === null || searchParams.get('type') === ''
    const checkParams = (val) => {return searchParams.get('type') === val}

    const [toggle, setToggle] = useState({
        categories: false,
        filtered: false
    })
    const [blogs, setBlogs] = useState([])
    const [displayedPages, setDisplayedPages] = useState([]);

    const itemsPerPage = 18; // Number of items per page
    const totalPages = Math.ceil(blogs?.length / itemsPerPage); // Total number of pages
    const [currentPage, setCurrentPage] = useState(pageIndex);
    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    useEffect(() => {
        if(latestBlogs.length > 0) {
            setLatestList(latestBlogs)
        }
    }, [latestBlogs])

    useEffect(() => {
        window.scrollTo(0, 0)
        const calculateDisplayedPages = () => {
          const pagesToShow = [];
          const maxDisplayedPages = 6; // Maximum number of page buttons to display
    
          if (totalPages <= maxDisplayedPages) {
            // If total pages are less than or equal to the maximum, display all pages
            for (let i = 1; i <= totalPages; i++) {
              pagesToShow.push(i);
            }
          } else {
            let startPage;
            let endPage;
    
            if (currentPage <= Math.floor(maxDisplayedPages / 2)) {
              // If current page is close to the beginning
              startPage = 1;
              endPage = maxDisplayedPages;
            } else if (currentPage >= totalPages - Math.floor(maxDisplayedPages / 2)) {
              // If current page is close to the end
              startPage = totalPages - maxDisplayedPages + 1;
              endPage = totalPages;
            } else {
              // If current page is in the middle
              startPage = currentPage - Math.floor(maxDisplayedPages / 2);
              endPage = currentPage + Math.floor(maxDisplayedPages / 2);
            }
    
            for (let i = startPage; i <= endPage; i++) {
              pagesToShow.push(i);
            }
          }
    
          setDisplayedPages(pagesToShow);
        };
    
        calculateDisplayedPages();
    }, [currentPage, totalPages, pageIndex]);

    const filterDataByTags = () => {
        let filter_blogs = []
        blog.forEach((blo) => {
          tags.forEach((tag__) => {
            blo.tags.forEach((tag_) => {
                  if(tag__.toLowerCase() === tag_.toLowerCase())
                  filter_blogs.push(blo)
              })
          })
        })
        
        let deleteDuplicate = filter_blogs.filter((obj, index, self) =>
          index === self.findIndex((o) => o._id.toString() === obj._id.toString())
        );
    
        return deleteDuplicate;
    }

    const initData = () => {
        if(searchParams.get('type') === null || searchParams.get('type') === '') {
            var dataTags = filterDataByTags()
            var filteredData
            if(filteredType !== null) {
                if(tags.length > 0) {
                    filteredData = blog.filter(obj => filteredType === obj.categories || filteredType === '');
                }
                else {
                    filteredData = blog.filter(obj => filteredType === obj.categories || filteredType === '');
                }
            }
            else {
                if(tags.length > 0) {
                    filteredData = dataTags
                }
                else {
                    filteredData = blog
                }
            }

            setBlogs(filteredData)
        }
        else if(searchParams.get('type') === 'latest') {
            // Filter and group the objects by date
            var groupedData = []

            if(tags.length > 0) {
                var dataTags = filterDataByTags()
                groupedData = dataTags.reduce((result, obj) => {
                const date = obj.createdAt.split('T')[0];
                if (result[date]) {
                    result[date].push(obj);
                } else {
                    result[date] = [obj];
                }
                return result;
                }, {});
            }
            else {
                groupedData = blog.reduce((result, obj) => {
                const date = obj.createdAt.split('T')[0];
                if (result[date]) {
                    result[date].push(obj);
                } else {
                    result[date] = [obj];
                }
                return result;
                }, {});
            }
    
            // Get the latest date from the groupedData object
            const latestDate = Object.keys(groupedData).sort().pop();
    
            // Get the objects related to the latest date
            const latestBlogs = groupedData[latestDate];
    
            if(latestBlogs !== undefined) { 
                var filteredData
                if(filteredType !== null)
                    filteredData = latestBlogs.filter(obj => filteredType === obj.categories || filteredType === '');
                else 
                    filteredData = latestBlogs
    
                setBlogs(filteredData)
            }
        }
        else if(searchParams.get('type') === 'most_viewed') {
            // Sort the data based on views in ascending order
            if(blog.length > 0) {
                var arr = []

                if(tags.length > 0) {
                    var dataTags = filterDataByTags()
                    arr = [...dataTags]
                }
                else {
                    arr = [...blog]
                }
        
                const sortedData = arr.sort((a, b) => b.views.length - a.views.length);
        
                if(sortedData.length > 0)
                    var filteredData
                    if(filteredType !== null)
                        filteredData = sortedData.filter(obj => filteredType === obj.categories || filteredType === '');
                    else 
                        filteredData = sortedData
        
                    setBlogs(filteredData)
            }
        }
        else if(searchParams.get('type') === 'popular') {
            // Sort the data based on views in ascending order
            if(blog.length > 0) {
                var arr = []
                
                if(tags.length > 0) {
                    var dataTags = filterDataByTags()
                    dataTags.forEach(item => {
                    var popularity = ((item.views.length/2) + item.likes.length) - item.dislikes.length
                        if(popularity > 0) { 
                            arr.push({...item, popularity: popularity})
                        }
                    });
                }
                else {
                    blog.forEach(item => {
                    var popularity = ((item.views.length/2) + item.likes.length) - item.dislikes.length
                        if(popularity > 0) { 
                            arr.push({...item, popularity: popularity})
                        }
                    });
                }
    
                const sortedData = arr.sort((a, b) => b.popularity - a.popularity);
    
                 if(sortedData.length > 0)
                    var filteredData 
                    if(filteredType !== null)
                        filteredData = sortedData.filter(obj => filteredType === obj.categories || filteredType === '');
                    else 
                        filteredData = sortedData
        
                    setBlogs(filteredData)
                }
        }
    }

    useEffect(() => {
        if(tags.length > 0) {
          var dataTags = filterDataByTags()
          setBlogs(dataTags)
        }
        else {
          initData()
        }
    }, [tags])

    useEffect(() => {
        initData()
    }, [blog, searchParams.get('type'), filteredType])

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

    const handleFilteredChange = (filtered) => {
        if(filtered === filteredType) filtered = ''
        const urlString = window.location.href.split('?')[0];
        const baseUrl = window.location.origin;
        const path = urlString.substring(baseUrl.length);
        navigate(`${path}?type=${navType}&page=${1}&category=${filtered}`)
        setToggle({tags: false, filtered: false})
        setSelectedCategory(filtered)
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);

        if(filteredType)
          navigate(`/blogs?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${pageNumber}&filtered=${filteredType}`)
        else
          navigate(`/blogs?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${pageNumber}`)
        
        setToggle({tags: false, filtered: false})
    };

    const addLikes = (index, blogId) => {
        var array = [...blogs]
        var duplicate = false

        array[index].likes.forEach((item) => { if(item === cookies.get('uid')) duplicate = true })
        if(!duplicate) {
            var updatedBlog = { ...array[index] }; 

            updatedBlog.likes = Array.isArray(updatedBlog.likes)
            ? [...updatedBlog.likes]
            : [];

            updatedBlog.likes.push(cookies.get('uid'));

            array[index] = updatedBlog;

            setBlogs(array);
        }
        else {
            var updatedBlog = { ...array[index] };

            updatedBlog.likes = Array.isArray(updatedBlog.likes)
            ? [...updatedBlog.likes]
            : [];

            updatedBlog.likes = updatedBlog.likes.filter((item) => item !== cookies.get('uid'))

            array[index] = updatedBlog;

            setBlogs(array);
        }

        if(key) {
            dispatch(addOneBlogLikesBySearchKey({
                id: array[index]._id,
                likes: array[index].likes,
                userId: user ? user.result?._id : '',
                searchKey: key
            }))
        }
        else {
            dispatch(addOneBlogLikes({
                id: array[index]._id,
                likes: array[index].likes,
                userId: user ? user.result?._id : ''
            }))
        }
    }

    const addLatestBlogsLikes = (index) => {
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
            blogId: "empty" 
        }))
    }

    const checkedForLikedBLogs = (likes) => {
        var liked = likes.some((item) => { if(item === cookies.get('uid')) return true })
        return liked ? liked : false;
    }

    const getFirstParagraph = (content) => {
        var text = ''
        content.some((c) => {
            if(c.element === 'normal_naragraph'){
                text = c.paragraph
                return true;
            }
        })
        return text
    }

    const handlePageType = (type) => {
        const urlString = window.location.href.split('?')[0];
        const baseUrl = window.location.origin;
        const path = urlString.substring(baseUrl.length);
        if(filteredType)
          navigate(`${path}?type=${type}&page=${1}&filtered=${filteredType}`)
        else
          navigate(`${path}?type=${type}&page=${1}`)
          
        setToggle({tags: false, filtered: false})
    };

    const addTags = (e) => {
        let duplicate = false
        if(e.target.value == 'All') {
          setTags([])
          return
        }
        tags.forEach(item => { if(e.target.value === item) duplicate = true })
        if(duplicate) { duplicate = false; return;}
        setTags(tags.concat(e.target.value))
    }

    const deleteTags = (e) => {
        let arr = [...tags]
        arr.splice(e.currentTarget.id, 1)
        setTags([...arr])
    } 

    const handleSearch = (e) => {
        const keyword = e.target.value.toLowerCase();
        setSearchKey(e.target.value);
    
        const filteredData = blog.filter((item) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(keyword)
          )
        );
        setCurrentPage(1)
        setBlogs(filteredData);
    }

    return (
        <div
            className="relative bg-cover bg-center"
            style={{ backgroundColor: "#111827" }}
        >   
            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className=''>
                            <div className="container mx-auto py-12 pt-6 xs:px-6 text-[#94a9c9] font-poppins">
                                <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start'>
                                    <div>
                                        <div className='flex sm:flex-row flex-col items-start text-sm mt-6 pb-2'>
                                            <h1 className='sm:text-5xl text-4xl font-bold text-[#0DBFDC] drop-shadow-md'> {key ? 'Blogs Search' : 'Latest Blogs'} </h1>
                                            <button className='top-0 sm:ml-2 ml-0 mb-2 sm:mt-0 mt-2 font-semibold bg-[#131C31] border border-solid border-[#222F43] text-gray-100  transition-colors duration-300 ease-in-out px-8 py-1 rounded-full'>
                                                {blogs?.length > 0 ? blogs.length : "0" } Blogs
                                            </button>
                                        </div>
                                        {
                                            key ?
                                            <div className='flex flex-row flex-wrap items-center text-sm'>
                                                <div className='mr-2'><FontAwesomeIcon icon={faHomeLg} className='mr-1'/> <a href='/' className='hover:underline transition-all hover:text-[#0CBCDC]'> Home </a></div>
                                                <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <a href='/blogs' className='hover:underline transition-all hover:text-[#0CBCDC]'> Blogs </a></div>
                                                <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <span className='hover:underline transition-all hover:text-[#0CBCDC]'> Search </span></div>
                                                <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <span className='hover:underline transition-all hover:text-[#0CBCDC]'> {key} </span></div>
                                            </div> :
                                            filteredType ?
                                            <div className='flex flex-row flex-wrap items-center text-sm'>
                                                <div className='mr-2'><FontAwesomeIcon icon={faHomeLg} className='mr-1'/> <a href='/' className='hover:underline transition-all hover:text-[#0CBCDC]'> Home </a></div>
                                                <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <a href='/blogs' className='hover:underline transition-all hover:text-[#0CBCDC]'> Blogs </a></div>
                                                <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <span className='hover:underline transition-all hover:text-[#0CBCDC]'> Category </span></div>
                                                <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <span className='hover:underline transition-all hover:text-[#0CBCDC]'> {filteredType} </span></div>
                                            </div>
                                            :
                                            <div className='flex flex-row flex-wrap items-center text-sm'>
                                                <div className='mr-2'><FontAwesomeIcon icon={faHomeLg} className='mr-1'/> <a href='/' className='hover:underline transition-all hover:text-[#0CBCDC]'> Home </a></div>
                                                <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <a href='/blogs' className='hover:underline transition-all hover:text-[#0CBCDC]'> Blogs </a></div>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="container mx-auto py-12 pt-4 xs:px-6 text-white">
                        <div className='flex sm:flex-row flex-col-reverse sm:justify-between mb-4 font-poppins'>
                            <div className='flex justify-between gap-2 items-center'>
                                <div className="relative lg:mt-0 sm:w-80 w-1/2 ">
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
                                    </span>
                                    <input value={searchKey} onChange={handleSearch} className="h-11 rounded-lg block w-full bg-[#131C31] border border-solid border-[#222F43] text-gray-100 text-sm font-normal py-2 px-4 pr-10 leading-tight focus:outline-none " type="text" placeholder='Search Blog'/>
                                </div>
                                <div className='grid grid-cols-3 sm:w-24 w-1/2 items-center'>
                                    <p className='h-[2.60rem] col-span-2 rounded-l-lg py-[0.65rem] font-semibold capitalize bg-[#131C31] text-center border border-solid border-[#222F43] text-gray-100 text-sm'>Tags:</p>
                                    <select
                                        className="h-[2.60rem] rounded-r-lg text-sm sm:w-52 w-full capitalize appearance-none bg-[#131C31] border border-[#222F43] text-gray-100 text px-4 py-1 pr-8 shadow leading-tight focus:outline-none"
                                        default={`tags`}
                                        onChange={addTags}
                                    >
                                        <option value="" className="capitalize" disabled={true}>Select Tags</option>
                                        <option value="All" className="capitalize">All</option>
                                        {
                                        tagsList?.length > 0 &&
                                            tagsList.map((item, index) => {
                                            return (
                                                <option key={index} value={item.tag} className="capitalize">{item.tag}</option>
                                            )
                                            })
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className='flex justify-end items-center text-white relative sm:mb-0 mb-4'>
                                <p className='text-sm'>Filter <span className='mx-2 text-base'>•</span></p>
                                <div onClick={() => setToggle({...toggle, categories: !toggle.categories, filtered: false})} className='flex cursor-pointer'>
                                <button>
                                    <svg 
                                    className='ml-2 text-sm cursor-pointer hover:text-[#0DBFDC] '
                                    xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-filter" viewBox="0 0 16 16">
                                    <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"/>
                                    </svg>
                                </button>
                                <div className={`${toggle.categories ? `absolute` : `hidden`} text-sm z-[100] top-10 right-[-8px] w-48 bg-[#131C31] border border-[#222F43] text-gray-100 p-3 py-2 rounded-sm shadow-2xl`}>
                                    <p className='text-sm font-semibold mb-1'>Filter by:</p>
                                    <button onClick={() => handlePageType("")} className='w-full text-left text-sm bg-transparent hover:text-[#0DBFDC] py-1 transition-colors duration-300 ease-in-out xs:mr-2 mr-2'><FontAwesomeIcon icon={paramIndex ? faCheckSquare : faSquare} className='mr-1'/> All</button>
                                    <button onClick={() => handlePageType("latest")} className='w-full text-left text-sm bg-transparent hover:text-[#0DBFDC] py-1 transition-colors duration-300 ease-in-out xs:mr-2 mr-2'><FontAwesomeIcon icon={checkParams('latest') ? faCheckSquare : faSquare} className='mr-1'/> Latest</button>
                                    <button onClick={() => handlePageType("popular")} className='w-full text-left text-sm bg-transparent hover:text-[#0DBFDC] py-1 transition-colors duration-300 ease-in-out xs:mr-2 mr-2'><FontAwesomeIcon icon={checkParams('popular') ? faCheckSquare : faSquare} className='mr-1'/> Popular</button>
                                    <button onClick={() => handlePageType("most_viewed")} className='w-full text-left text-sm bg-transparent hover:text-[#0DBFDC] py-1 transition-colors duration-300 ease-in-out xs:mr-2 mr-2'><FontAwesomeIcon icon={checkParams('most_viewed') ? faCheckSquare : faSquare} className='mr-1'/> Most Viewed</button>
                                    </div>
                                    <p className='ml-3 text-sm sm:block hidden'>
                                    {
                                        checkParams('latest') ? <span className="px-2 py-1 rounded-lg bg-[#131C31] border border-[#222F43] text-gray-100">Latest</span>
                                        : checkParams('popular') ? <span className="px-2 py-1 rounded-lg bg-[#131C31] border border-[#222F43] text-gray-100">Trending</span>
                                        : checkParams('most_viewed') && <span className="px-2 py-1 rounded-lg bg-[#131C31] border border-[#222F43] text-gray-100">Most Viewed</span>
                                    }
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {
                        tags?.length > 0 &&
                        <div className='flex flex-wrap items-start pb-4 font-poppins'>
                            <h3 className='text-[#0DBFDC] xs:text-lg text-lg font-semibold mr-3'>Tag{tags.length > 1 && 's'}:</h3>
                            {
                                tags.map((item, index) => {
                                    return (
                                        <div key={index} className='flex flex-wrap gap-2 mb-2'>
                                            {
                                                item !== '' &&
                                                    <p className='cursor-pointer transition-all ml-2 p-4 py-2 text-sm rounded-lg bg-[#131C31] border border-solid border-[#222F43] text-gray-100 '>#{item} <FontAwesomeIcon onClick={deleteTags} id={index} icon={faClose} className="ml-2 cursor-pointer hover:text-[#0DBFDC]" /></p>
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                        }

                        <div className='grid sm:grid-cols-3 grid-cols-1 gap-5 place-content-start mt-16 font-poppins'>
                            <div className='col-span-2'>
                                {
                                    isLoading ?
                                        <div className='h-96 flex items-center justify-center'>
                                            <div className='flex flex-col items-center justify-center'>
                                                <img className="w-16" src={loading} />
                                                <p className='text-white font-semibold text-lg mt-2'>Loading Data</p>
                                            </div>
                                        </div>
                                    :
                                    ((searchKey && blogs.length === 0 && blog?.length > 0) || (filteredType && blogs.length === 0 && blog?.length > 0)) ?
                                    <div
                                        className="relative bg-cover bg-center py-12 bg-[#131C31] border border-solid border-[#222F43] text-gray-100 font-poppins"
                                    >   
                                        <div className={`${styles.marginX} ${styles.flexCenter}`}>
                                            <div className={`${styles.boxWidthEx}`}>
                                                <div className="flex flex-col justify-center items-center ">
                                                    <h1 className="text-3xl font-semibold mb-4 text-center">No Blogs Found</h1>
                                                    <p className="text-base text-center">Looks like there is no uploads at the moment.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <>
                                        <div className='grid sm:grid-cols-2 grid-cols-1 gap-4 place-content-start'>
                                            {
                                                blogs && blogs.length > 0 &&
                                                    blogs.slice(startIndex, endIndex).map((item, index) => {
                                                        var liked_blogs = checkedForLikedBLogs(item.likes);
                                                        var first_paragraph = getFirstParagraph(item.content)
                                                        return (
                                                            <div className='bg-[#131C31] hover:bg-[#17213a] rounded-t-lg transition-all border border-solid border-[#222F43] text-gray-100 relative pb-12'>
                                                                <MotionAnimate key={index} animation='fadeInUp'>
                                                                <img
                                                                    src={convertDriveImageLink(item.featured_image)}
                                                                    className='h-[220px] object-cover w-full rounded-t-lg'
                                                                />
                                                                <div className='p-4'>
                                                                    <p className='text-sm text-[#B9E0F2] pb-2'>#{item.categories}</p>
                                                                    <Link to={`/blogs/${item._id}`} className='text-lg font-semibold my-2 mr-2 leading-7 mb-3 text-[#0DBFDC] cursor-pointer'><TextWithEllipsis text={item.post_title} limit={60}/></Link>
                                                                    <p className='text-sm pt-2'><TextWithEllipsis text={first_paragraph} limit={150}/></p>
                                                                    <div className='absolute w-full px-4 bottom-2 left-0 text-sm'>
                                                                        <hr className='border-[#222F43] my-2'/>
                                                                        <div className='flex justify-between'>
                                                                            <div className='flex flex-wrap items-center text-gray-100'>
                                                                                <button className='cursor-pointer' onClick={() => addLikes(index, item._id)}><FontAwesomeIcon icon={faHeart} style={{color: liked_blogs ? '#CD3242' : '#FFF'}} className='font-bold text-sm mr-1'/> {item.likes?.length > 0 ? item.likes.length : 0} </button>
                                                                                <span className='mx-2 text-lg'>•</span>
                                                                                <p className='text-sm'><FontAwesomeIcon icon={faComment} className='mx-1'/> {item.comment.length > 0 ? item.comment.length : 0}</p>
                                                                            </div>
                                                                            <Link to={`/blogs/${item._id}`} className='cursor-pointer text-sm flex items-center justify-end text-right hover:text-[#0DBFDC] transition-all'>Continue Reading <FontAwesomeIcon icon={faArrowRight} className='ml-2 pt-1 font-bold'/></Link>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                </MotionAnimate>
                                                            </div>
                                                        )
                                                    })
                                            }
                                        </div>

                                        {
                                            blogs && blogs.length > 0 &&
                                            <div className='flex flex-wrap items-start justify-start mt-6'>
                                                <button
                                                    disabled={currentPage === 1}
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    className="font-bold text-sm mb-2 cursor-pointer mx-1 bg-[#222F43] hover:bg-[#0EA6EA] hover:text-gray-100 text-gray-100 py-2 xs:px-3 px-3 border border-[#222F43] hover:border-[#0EA6EA] rounded-full transition-colors duration-300 ease-in-out"
                                                >
                                                    <FontAwesomeIcon icon={faArrowLeft}/>
                                                </button>
                                                {displayedPages.map((pageNumber) => (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() => handlePageChange(pageNumber)}
                                                        style={{backgroundColor: pageIndex === pageNumber && "#0EA6EA"}}
                                                        className="font-bold mb-2 text-sm cursor-pointer mx-1 bg-[#222F43] hover:bg-[#0EA6EA] hover:text-gray-100 text-gray-100 py-2 xs:px-[0.90rem] px-3 border border-[#222F43] hover:border-[#0EA6EA] rounded-full transition-colors duration-300 ease-in-out"
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                ))}
                                                <button
                                                    disabled={currentPage === totalPages}
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    className="font-bold text-sm mb-2 cursor-pointer mx-1 bg-[#222F43] hover:bg-[#0EA6EA] hover:text-gray-100 text-gray-100 py-2 xs:px-3 px-3 border border-[#222F43] hover:border-[#0EA6EA] rounded-full transition-colors duration-300 ease-in-out"
                                                >
                                                    <FontAwesomeIcon icon={faArrowRight}/>
                                                </button>
                                            </div>
                                        }
                                    </>
                                }
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
                                                    <button onClick={() => handleFilteredChange(item.category)} key={index} className='flex justify-between items-center cursor-pointer transition-all p-4 py-3 text-sm rounded-lg border border-solid border-[#222F43] text-gray-100 hover:text-[#0DBFDC]'>
                                                        <span style={{color: filteredType === item.category && '#FFD700'}}>
                                                            {item.category}
                                                        </span>

                                                        <p className='bg-[#222F43] px-3 py-1 rounded-full text-xs'>{item.count}</p>
                                                    </button>
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
                                                                    <button className='cursor-pointer' onClick={() => addLatestBlogsLikes(index, item._id)}><FontAwesomeIcon icon={faHeart} style={{color: liked_blogs ? '#CD3242' : '#FFF'}} className='pt-[0.15rem] font-bold text-base'/> {item.likes?.length > 0 ? item.likes.length : 0} </button>
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Blogs