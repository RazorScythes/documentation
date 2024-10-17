import React, { useEffect, useState } from 'react'
import styles from "../../style";
import SideAlert from '../SideAlert'
import heroBackgroundImage from '../../assets/1696333975880.jpg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faChevronUp, faChevronDown, faChevronLeft, faChevronRight, faLightbulb, faArrowAltCircleLeft, faArrowAltCircleRight, faArrowLeft, faArrowRight, faThLarge, faTable, faWindowMaximize, faGamepad, faMicrochip, faWrench, faCogs, faObjectGroup, faCode, faBars, faHandPeace, faArchive, faBoltLightning, faSearch, faExchange, faCheck, faClose, faCalendarCheck, faCalendarAlt, faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import { useSearchParams, useParams } from "react-router-dom";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { getProjects, getCategory, projectCountTags, getProjectsByCategories, getProjectsBySearchKey } from '../../actions/project';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import loading from '../../assets/loading.gif'
import { convertDriveImageLink } from '../Tools'

import { MotionAnimate } from 'react-motion-animate';

library.add(fas, far, fab);

const CustomRight = ({ onClick }) => {
  return (
    <div onClick={onClick} className='bg-[#0F172A] text-white hover:text-[#0DBFDC] transition-all h-full w-16 absolute right-0 flex items-center justify-end cursor-pointer'>
      <FontAwesomeIcon
        icon={faArrowRight}
        className="max-w-4 cursor-pointer text-primary-400 text-2xl font-bold"
      />
    </div>
  )
};

const CustomLeft = ({ onClick }) => {
  return (
    <div onClick={onClick} className='bg-[#0F172A] text-white hover:text-[#0DBFDC] transition-all h-full w-16 absolute left-0 flex items-center cursor-pointer'>
      <FontAwesomeIcon
        icon={faArrowLeft}
        className="max-w-4 text-primary-400 text-2xl font-bold"
      />
    </div>
  )
};

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1224 },
    items: 10
  },
  laptop: {
    breakpoint: { max: 1224, min: 890 },
    items: 6
  },
  tablet: {
    breakpoint: { max: 890, min: 464 },
    items: 4
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 2
  }
};

const Projects = ({ user }) => {

  const { key, cat } = useParams();

  const navigate  = useNavigate()
  const dispatch = useDispatch()

  const project = useSelector((state) => state.project.user_project)
  const tagsList = useSelector((state) => state.project.tagsCount)
  const isLoading = useSelector((state) => state.project.isLoading)
  const category = useSelector((state) => state.project.user_category)
  const category_loading = useSelector((state) => state.project.category_loading)

  const [tags, setTags] = useState([])
  const [projects, setProjects] = useState([])
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchKey, setSearchKey] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [alertActive, setAlertActive] = useState(false)
  const [alertInfo, setAlertInfo] = useState({
    variant: '',
    heading: '',
    paragraph: ''
  })

  const pageIndex = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1
  const navType = searchParams.get('type') ? searchParams.get('type') : ''
  const filteredType = searchParams.get('category') ? searchParams.get('category') : ''
  const paramIndex = searchParams.get('type') === null || searchParams.get('type') === ''
  const checkParams = (val) => {return searchParams.get('type') === val}

  const [toggle, setToggle] = useState({
    categories: false,
    filtered: false,
  })
  const [displayedPages, setDisplayedPages] = useState([]);
  const itemsPerPage = 18; // Number of items per page
  const totalPages = Math.ceil(projects?.length / itemsPerPage); // Total number of pages
  const [currentPage, setCurrentPage] = useState(pageIndex);
  // Calculate the start and end indices for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    if(key) {
      dispatch(getProjectsBySearchKey({
        id: user ? user.result?._id : '',
        searchKey: key
      }))
    }
    else {
      if(cat){
        dispatch(getProjectsByCategories({
          id: user ? user.result?._id : '',
          category: cat
        }))
      }
      else {
        dispatch(getProjects({
          id: user ? user.result?._id : ''
        }))
        dispatch(projectCountTags({
          id: user ? user.result?._id : ''
        }))
      }
    }
    dispatch(getCategory())
  }, [])

  const filterDataByTags = () => {
    let filter_projects = []
    project.forEach((proj) => {
      tags.forEach((tag__) => {
        proj.tags.forEach((tag_) => {
              if(tag__.toLowerCase() === tag_.toLowerCase())
                filter_projects.push(proj)
          })
      })
    })
    
    let deleteDuplicate = filter_projects.filter((obj, index, self) =>
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
          filteredData = dataTags.filter(obj => filteredType === obj.categories || filteredType === '');
        }
        else {
          filteredData = project.filter(obj => filteredType === obj.categories || filteredType === '');
        }
      }
      else {
        if(tags.length > 0) {
          filteredData = dataTags
        }
        else {
          filteredData = project
        }
      }

      setProjects(filteredData)
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
        groupedData = project.reduce((result, obj) => {
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
      const latestProjects = groupedData[latestDate];

      if(latestProjects !== undefined) { 
          var filteredData
          if(filteredType !== null)
              filteredData = latestProjects.filter(obj => filteredType === obj.categories || filteredType === '');
          else 
              filteredData = latestProjects

          setProjects(filteredData)
      }
    }
    else if(searchParams.get('type') === 'most_viewed') {
      // Sort the data based on views in ascending order
      if(project.length > 0) {
        var arr = []
        
        if(tags.length > 0) {
          var dataTags = filterDataByTags()
          arr = [...dataTags]
        }
        else {
          arr = [...project]
        }
        const sortedData = arr.sort((a, b) => b.views.length - a.views.length);

        if(sortedData.length > 0)
          var filteredData
          if(filteredType !== null)
              filteredData = sortedData.filter(obj => filteredType === obj.categories || filteredType === '');
          else 
              filteredData = sortedData

          setProjects(filteredData)
      }
    }
    else if(searchParams.get('type') === 'popular') {
        // Sort the data based on views in ascending order
        if(project.length > 0) {
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
            project.forEach(item => {
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

              setProjects(filteredData)
        }
    }
  }

  useEffect(() => {
    if(tags.length > 0) {
      var dataTags = filterDataByTags()
      setProjects(dataTags)
    }
    else {
      initData()
    }
  }, [tags])

  useEffect(() => {
    initData()
  }, [project, searchParams.get('type'), filteredType])

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

  const handleFilteredChange = (filtered) => {
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
        navigate(`/projects?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${pageNumber}&filtered=${filteredType}`)
      else
        navigate(`/projects?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${pageNumber}`)
      
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

    const filteredData = project.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(keyword)
      )
    );
    setCurrentPage(1)
    setProjects(filteredData);
  }

  return (
    <div
      className="relative bg-cover bg-center pb-20 pt-4"
      style={{ backgroundColor: "#0F172A" }}
    >   
      <SideAlert
          variants={alertInfo.variant}
          heading={alertInfo.heading}
          paragraph={alertInfo.paragraph}
          active={alertActive}
          setActive={setAlertActive}
      />
      
      <div className={`${styles.marginX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidthEx}`}>
          <div className="container mx-auto file:lg:px-8 relative px-0">
            {
              category_loading ? 
                <div className='flex items-center justify-center py-8'>
                    <div className='flex items-center justify-center'>
                        <img className="w-8" src={loading} />
                        <p className='text-white font-semibold text-base ml-2'>Loading Categories</p>
                    </div>
                </div>
                :
                <Carousel 
                    responsive={responsive} className="relative "
                    customLeftArrow={<CustomLeft />}
                    customRightArrow={<CustomRight />}
                    slidesToSlide={1}
                    swipeable
                    infinite={true}
                    centerMode={true}
                > 
                  <a href={`/projects/`}>
                  <button style={{color: (!cat) && '#0DBFDC'}} className='text-white hover:text-[#0DBFDC] transition-all flex flex-col items-center py-8 w-32 relative'>
                    <div className='relative'> 
                      <FontAwesomeIcon icon={faThLarge} className='text-3xl mb-2'/> 
                      {/* <p className='absolute top-[-20px] right-[-10px]'>0</p> */}
                    </div>
                    <p className='text-xs'>All Categories</p>
                  </button>
                  </a>
                  {
                    category?.length > 0 &&
                      category.map((item, index) => {
                        return (
                          <a href={`/projects/category/${item.shortcut}`}>
                          <button style={{color: (item.shortcut === cat) && '#0DBFDC'}} key={index} className='text-white hover:text-[#0DBFDC] transition-all flex flex-col items-center py-8 w-32 relative'>
                            <div className='relative'> 
                              <FontAwesomeIcon icon={['fas', item.icon]} className='text-3xl mb-2'/> 
                              <p className='absolute top-[-20px] right-[-10px]'>{item.count}</p>
                            </div>
                            <p className='text-xs'>{item.shortcut}</p>
                          </button>
                          </a>
                        )
                      })
                    } 
                </Carousel>
            }

            <div className='flex sm:flex-row flex-col-reverse sm:justify-between mb-4 font-poppins'>
              <div className='flex justify-between gap-2 items-center'>
                <div className="relative lg:mt-0 sm:w-80 w-1/2 ">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
                  </span>
                  <input value={searchKey} onChange={handleSearch} className="h-11 rounded-lg block w-full bg-[#131C31] border border-solid border-[#222F43] text-gray-100 text-sm font-normal py-2 px-4 pr-10 leading-tight focus:outline-none " type="text" placeholder='Search Project'/>
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
                <p className='text-sm'>{projects?.length} project{projects?.length > 1 && 's'} <span className='mx-2 text-base'>•</span> </p>
                <div onClick={() => setToggle({...toggle, categories: !toggle.categories, filtered: false})} className='flex cursor-pointer'>
                  <button>
                    {/* <FontAwesomeIcon icon={faExchange} className='ml-3 text-xl rotate-90 cursor-pointer hover:text-cyan-300 '/> */}
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

            {
              isLoading ?
              <div className='h-96 flex items-center justify-center'>
                  <div className='flex flex-col items-center justify-center'>
                      <img className="w-16" src={loading} />
                      <p className='text-white font-semibold text-lg mt-2'>Loading Projects</p>
                  </div>
              </div>
              :
              <>
                <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-8 font-poppins">
                    {
                      projects?.length > 0 &&
                        projects.slice(startIndex, endIndex).map((item, index) => {
                          return (
                            <MotionAnimate key={index} animation='fadeInUp'>
                              <Link to={`/projects/${item._id}`}>
                              <div className='relative bg-[#131C31] hover:bg-[#17213a] transition-all border border-solid border-[#222F43] text-gray-100 transision-all hover:cursor-pointer w-full p-2 rounded-md'>
                                <img
                                  className='object-cover w-full h-52 border border-solid border-[#222F43]'
                                  src={convertDriveImageLink(item.featured_image)}
                                />
                                <div className='px-2 pb-2 font-poppins'>
                                  <div className="flex justify-between items-center">
                                  <p className='pt-2 mr-2 text-sm mt-1 text-[#B9E0F2]'><span> #{item.categories.category} </span></p>
                                    {/* <div className='col-span-2 flex flex-wrap items-center pt-2'>
                                      <img 
                                          src={convertDriveImageLink(item.user.avatar)}
                                          className='w-6 h-6 object-cover rounded-full border border-gray-700'
                                          alt="avatar"
                                      />
                                      <p className='ml-2 break-all text-xs text-[#B9E0F2] drop-shadow-sm'>{item.user.username}</p>
                                    </div> */}
                                    <p className='pt-2 mr-2 text-sm mt-1 text-[#B9E0F2]'><FontAwesomeIcon icon={faCalendarAlt} className='mr-1'/> <span> {convertTimezone(item.createdAt)} </span></p>
                                  </div>
                                  <h2 className='text-lg font-semibold my-2 mr-2 leading-7 pb-4 text-[#0DBFDC]'>{item.post_title}</h2>
                                  <div className='flex flex-wrap absolute bottom-3 text-[#94a9c9]'>
                                    <p className='text-sm'>{item.views.length} view{item.views.length > 1 && 's'} • </p>
                                    <p className='text-sm ml-1'> {item.likes.length} like{item.likes.length > 1 && 's'} •</p>
                                    <p className='text-sm ml-1'> {item.comment.length} comment{item.comment.length > 1 && 's'}</p>
                                  </div>
                                </div>
                              </div>
                              </Link>
                            </MotionAnimate>
                            // <MotionAnimate key={index} animation='fadeInUp'>
                            //   <Link to={`/projects/${item._id}`}>
                            //   <div className='relative bg-white hover:bg-blue-100 transision-all hover:cursor-pointer w-full p-2 border border-solid border-gray-600 rounded-md'>
                            //     <img
                            //       className='object-cover w-full h-52 border border-solid border-gray-300'
                            //       src={convertDriveImageLink(item.featured_image)}
                            //     />
                            //     <div className='px-2 pb-2 font-poppins'>
                            //       <div className="flex justify-between items-center">
                            //         <div className='col-span-2 flex flex-wrap items-center pt-2'>
                            //           <img 
                            //               src={item.user.avatar}
                            //               className='w-6 h-6 object-cover rounded-full border border-gray-700'
                            //               alt="avatar"
                            //           />
                            //           <p className='ml-2 break-all text-xs font-semibold text-[#FB2736] drop-shadow-sm'>{item.user.username}</p>
                            //         </div>
                            //         <p className='mr-2 break-all text-xs font-semibold drop-shadow-sm mt-1 text-[#FB2736]'><FontAwesomeIcon icon={faCalendar} className='mr-1 pt-1 font-bold'/> <span> {convertTimezone(item.createdAt)} </span></p>
                            //       </div>
                            //       <h2 className='text-lg font-semibold my-2 mr-2 leading-7 pb-4'>{item.post_title}</h2>
                            //       <div className='flex flex-wrap absolute bottom-3'>
                            //         <p className='text-sm text-gray-600'>{item.views.length} view{item.views.length > 1 && 's'} • </p>
                            //         <p className='text-sm text-gray-600 ml-1'> {item.likes.length} like{item.likes.length > 1 && 's'} •</p>
                            //         <p className='text-sm text-gray-600 ml-1'> {item.comment.length} comment{item.comment.length > 1 && 's'}</p>
                            //       </div>
                            //     </div>
                            //   </div>
                            //   </Link>
                            // </MotionAnimate>
                          )
                        })
                    }
                </div>
                {
                    projects?.length > 0 &&
                    <div className='flex flex-wrap items-center justify-center mt-12'>
                        <button
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="font-bold text-sm mb-2 cursor-pointer mx-1 bg-[#222F43] hover:bg-[#0EA6EA] hover:text-gray-100 text-gray-100 py-2 xs:px-3 px-3 border border-[#222F43] hover:border-[#0EA6EA] rounded-full transition-colors duration-300 ease-in-out"
                          >
                          {/* <span className='xs:block hidden'>Prev</span> */}
                          <FontAwesomeIcon icon={faArrowLeft}/>
                        </button>
                        {displayedPages.map((pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          // className={currentPage === index + 1 ? "active" : ""}
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
                {
                  (project?.length === 0 && !isLoading) ?
                    <div
                        className="relative bg-cover bg-center py-12 bg-[#131C31] border border-solid border-[#222F43] text-gray-100 font-poppins"
                    >   
                        <div className={`${styles.marginX} ${styles.flexCenter}`}>
                            <div className={`${styles.boxWidthEx}`}>
                                <div className="flex flex-col justify-center items-center ">
                                    <h1 className="text-3xl font-semibold mb-4 text-center">No Project Found</h1>
                                    <p className="text-base text-center">Looks like there is no uploads at the moment.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                  :
                  (searchKey.length > 0 && projects?.length === 0) &&
                    <div
                        className="relative bg-cover bg-center py-12 bg-[#131C31] border border-solid border-[#222F43] text-gray-100 font-poppins"
                    >   
                        <div className={`${styles.marginX} ${styles.flexCenter}`}>
                            <div className={`${styles.boxWidthEx}`}>
                                <div className="flex flex-col justify-center items-center ">
                                    <h1 className="text-3xl font-semibold mb-4 text-center">No Result Found</h1>
                                    <p className="text-base text-center">Please check your search keyword.</p>
                                </div>
                            </div>
                        </div>
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

export default Projects