import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getVideoByTag, getVideoByArtist, getVideoBySearchKey, countVideoTags } from "../../actions/video";
import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import { clearAlert } from "../../actions/video";
import { MotionAnimate } from 'react-motion-animate'
import Loading from './Loading';
import loading from '../../assets/loading.gif'
import styles from "../../style";
import VideoThumbnail from '../VideoThumbnail';
import SideAlert from '../SideAlert'

const getVideoId = (url) => {
    let videoId;
    const youtubeMatch = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([\w-]{11})(?:\S+)?$/;
    const dropboxMatch = /^(?:https?:\/\/)?(?:www\.)?dropbox\.com\/(?:s|sh)\/([\w\d]+)(?:\/.*)?$/;
    const megaMatch = /^(?:https?:\/\/)?mega\.(?:co\.nz|nz|io)\/(?:#!\/)?(?:file|enc|f)!([a-zA-Z0-9!_-]{8,})(?:\S+)?$/;
    const googleDriveMatch = /^(?:https?:\/\/)?drive.google.com\/(?:file\/d\/|open\?id=)([^/&?#]+)/;
  
    if (youtubeMatch.test(url)) {
      videoId = url.match(youtubeMatch)[1];
    } else if (dropboxMatch.test(url)) {
      videoId = url.match(dropboxMatch)[1];
    } else if (megaMatch.test(url)) {
      videoId = url.match(megaMatch)[1];
    } else if (googleDriveMatch.test(url)) {
      videoId = url.match(googleDriveMatch)[1];
    } else {
      videoId = null;
    }
    return videoId;
};

const VideoTag = ({ user }) => {
    const navigate  = useNavigate()

    const [searchParams, setSearchParams] = useSearchParams();
    const [active, setActive] = useState(0)
    const [tags, setTags] = useState([])
    const [videos, setVideos] = useState([])
    const dispatch = useDispatch()

    const { tag, artist_name, key } = useParams();

    const video = useSelector((state) => state.video.videos)
    const message = useSelector((state) => state.video.message)
    const sideAlert = useSelector((state) => state.video.sideAlert)
    const tagsList = useSelector((state) => state.video.tagsCount)
    const isLoading = useSelector((state) => state.video.isLoading)
    const notFound = useSelector((state) => state.video.notFound)
    const archiveList = useSelector((state) => state.video.archiveList)

    const pageIndex = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1
    const navType = searchParams.get('type') ? searchParams.get('type') : ''
    const filteredType = searchParams.get('filtered') ? searchParams.get('filtered') : ''
    const paramIndex = searchParams.get('type') === null || searchParams.get('type') === ''
    const checkParams = (val) => {return searchParams.get('type') === val}

    const [displayedPages, setDisplayedPages] = useState([]);
    const [alertActive, setAlertActive] = useState(false)
    const [alertSubActive, setAlertSubActive] = useState('')
    const [toggle, setToggle] = useState({
      tags: false,
      filtered: false
    })
    const [alertInfo, setAlertInfo] = useState({
        variant: '',
        heading: '',
        paragraph: ''
    })

    useEffect(() => {
      
    }, [message])

    const checkVideoFileSize = (size = "") => {
      if(!size) return false
    
      var file_size = size.split(" ")
    
      if(Number(file_size[0]) <= 100) return true
      return false
    }

    useEffect(() => {
      dispatch(countVideoTags({
        id: user ? user.result?._id : ''
      }))
    }, [])

    useEffect(() => {
      if(video.length > 0)
        setVideos(video)
    }, [video])

    useEffect(() => {
        setVideos([])
        if(tag) {
          dispatch(getVideoByTag({
              id: user ? user.result?._id : '',
              tag: tag.length > 0 ? tag.split("+") : []
          }))
          setTags(tag.split("+"))
        }
        else if(artist_name){
          dispatch(getVideoByArtist({
            id: user ? user.result?._id : '',
            artist: artist_name
          }))
        }
        else if(key){
          dispatch(getVideoBySearchKey({
            id: user ? user.result?._id : '',
            searchKey: key
          }))
        }
    }, [tag, artist_name, key])

    useEffect(() => {
      setCurrentPage(pageIndex)
    }, [pageIndex])

    const itemsPerPage = 52; // Number of items per page
    const totalPages = Math.ceil(videos?.length / itemsPerPage); // Total number of pages
    const [currentPage, setCurrentPage] = useState(pageIndex);
    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
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
    
    useEffect(() => {
      window.scrollTo(0, 0)
      if(searchParams.get('type') === null || searchParams.get('type') === '') {
        var filteredData = []

        if(filteredType === "embed") 
          filteredData = video.filter(obj => !checkVideoFileSize(obj.file_size));
        else if(filteredType === "video")
          filteredData = video.filter(obj => checkVideoFileSize(obj.file_size));
        else 
          filteredData = [...video]

        setVideos(filteredData)
      }
      else if(searchParams.get('type') === 'latest') {
        // Filter and group the objects by date
        const groupedData = video.reduce((result, obj) => {
          const date = obj.createdAt.split('T')[0];
          if (result[date]) {
            result[date].push(obj);
          } else {
            result[date] = [obj];
          }
          return result;
        }, {});

        // Get the latest date from the groupedData object
        const latestDate = Object.keys(groupedData).sort().pop();

        // Get the objects related to the latest date
        const latestVideos = groupedData[latestDate];

        if(latestVideos !== undefined) {
          var filteredData = []

          if(filteredType === "embed") 
            filteredData = latestVideos.filter(obj => !checkVideoFileSize(obj.file_size));
          else if(filteredType === "video")
            filteredData = latestVideos.filter(obj => checkVideoFileSize(obj.file_size));
          else 
            filteredData = [...latestVideos]
          
          setVideos(filteredData)
        }
      }
      else if(searchParams.get('type') === 'most_viewed') {
        // Sort the data based on views in ascending order
        if(video.length > 0) {
          var arr = [...video]

          const sortedData = arr.sort((a, b) => b.views.length - a.views.length);

          // Filter out objects where views is 0
          const filteredData = sortedData.filter(obj => obj.views.length !== 0);

          if(filteredData.length > 0)
            var fd = []

            if(filteredType === "embed") 
              fd = filteredData.filter(obj => !checkVideoFileSize(obj.file_size));
            else if(filteredType === "video")
              fd = filteredData.filter(obj => checkVideoFileSize(obj.file_size));
            else 
              fd = [...filteredData]
            setVideos(fd)
        }
      }
      else if(searchParams.get('type') === 'popular') {
        // Sort the data based on views in ascending order
        if(video.length > 0) {
          var arr = []

          video.forEach(item => {
            var popularity = ((item.views.length/2) + item.likes.length) - item.dislikes.length
            if(popularity > 0) { 
              arr.push({...item, popularity: popularity})
            }
          });

          const sortedData = arr.sort((a, b) => b.popularity - a.popularity);

          if(sortedData.length > 0)
            var filteredData = []

            if(filteredType === "embed") 
              filteredData = sortedData.filter(obj => !checkVideoFileSize(obj.file_size));
            else if(filteredType === "video")
              filteredData = sortedData.filter(obj => checkVideoFileSize(obj.file_size));
            else 
              filteredData = [...sortedData]
            
            setVideos(filteredData)
        }
      }
    },[video, searchParams.get('type'), filteredType])

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        if(filteredType) {
          if(tag)
            navigate(`/videos/tags/${tag}?type=${navType}&page=${pageNumber}&filtered=${filteredType}`)
          else if(artist_name)
            navigate(`/videos/artist/${artist_name}?type=${navType}&page=${pageNumber}&filtered=${filteredType}`)
          else if(key)
            navigate(`/videos/search/${key}?type=${navType}&page=${pageNumber}&filtered=${filteredType}`)
        }
        else {
          if(tag)
            navigate(`/videos/tags/${tag}?type=${navType}&page=${pageNumber}`)
          else if(artist_name)
            navigate(`/videos/artist/${artist_name}?type=${navType}&page=${pageNumber}`)
          else if(key)
            navigate(`/videos/search/${key}?type=${navType}&page=${pageNumber}`)
        }
        setToggle({tags: false, filtered: false})
    };

    const handleFilteredChange = (filtered) => {
      const urlString = window.location.href.split('?')[0];
      const baseUrl = window.location.origin;
      const path = urlString.substring(baseUrl.length);
      navigate(`${path}?type=${navType}&page=${1}&filtered=${filtered}`)
      setToggle({tags: false, filtered: false})
    };

    useEffect(() => {
      if(alertSubActive === 'no user') {
          setAlertInfo({
              variant: 'info',
              heading: 'Login Required',
              paragraph: 'Please login to add this video.'
          })
          setAlertActive(true)
          setAlertSubActive('')
      }
    }, [alertSubActive])

    useEffect(() => {
      if(Object.keys(sideAlert).length !== 0){
          setAlertInfo({
              variant: sideAlert.variant,
              heading: sideAlert.heading,
              paragraph: sideAlert.paragraph
          })
          setAlertActive(true)

          dispatch(clearAlert())
      }
    }, [sideAlert])

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

    return (
      <div
      className="relative bg-cover bg-center"
      style={{ backgroundColor: "#111827" }}
      >   
      <SideAlert
         variants={alertInfo.variant}
         heading={alertInfo.heading}
         paragraph={alertInfo.paragraph}
         active={alertActive}
         setActive={setAlertActive}
         />
      
      {/* <div className='lg:px-16 sm:px-4 mx-auto'>
         <hr/>
      </div> */}
      <div className={`${styles.marginX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidthEx}`}>
         <div className="container mx-auto file:lg:px-8 relative px-0 my-10">
            <div className="flex justify-between items-center">
              <div className='flex flex-row flex-wrap items-start xs:justify-start justify-center'>
                  <button onClick={() => handlePageType("")} style={{backgroundColor: paramIndex && 'rgb(243, 244, 246)', color: paramIndex && 'rgb(31, 41, 55)'}} className='mb-2 font-semibold text-sm bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-4 border border-gray-100  transition-colors duration-300 ease-in-out xs:mr-2 mr-2'>All</button>
                  <button onClick={() => handlePageType("latest")} style={{backgroundColor: checkParams('latest') && 'rgb(243, 244, 246)', color: checkParams('latest') && 'rgb(31, 41, 55)'}} className='mb-2 font-semibold text-sm bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-4 border border-gray-100transition-colors duration-300 ease-in-out xs:mr-2 mr-2'>Latest</button>
                  <button onClick={() => handlePageType("most_viewed")} style={{backgroundColor: checkParams('most_viewed') && 'rgb(243, 244, 246)', color: checkParams('most_viewed') && 'rgb(31, 41, 55)'}} className='mb-2 font-semibold text-sm bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-4 border border-gray-100 transition-colors duration-300 ease-in-out xs:mr-2 mr-2'>Most Viewed</button>
                  <button onClick={() => handlePageType("popular")} style={{backgroundColor: checkParams('popular') && 'rgb(243, 244, 246)', color: checkParams('popular') && 'rgb(31, 41, 55)'}} className='mb-2 font-semibold text-sm bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-4 border border-gray-100 transition-colors duration-300 ease-in-out'>Popular</button>
                  <div className='relative ml-2 z-40'>
                      <button onClick={() => setToggle({...toggle, tags: !toggle.tags, filtered: false})} className='cursor-pointer mb-2 font-semibold text-sm bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-4 border border-gray-100 transition-colors duration-300 ease-in-out xs:mr-2 mr-2 flex items-center'>
                          Tags 
                          {toggle.tags ? <FontAwesomeIcon icon={faChevronUp} className='ml-1 font-bold'/> : <FontAwesomeIcon icon={faChevronDown} className='ml-1 font-bold'/> }
                      </button>
                      {
                          tagsList && tagsList.length > 0 &&
                              <div className={`${toggle.tags ? `absolute` : `hidden`}`}>
                                  <ul className='no-scroll max-h-[183px] overflow-y-auto flex flex-col mb-2 font-semibold text-sm bg-gray-800 text-gray-100  border border-gray-100 transition-colors duration-300 ease-in-out xs:mr-2 mr-2'>
                                      {
                                          tagsList.map((item, index) => {
                                              return (
                                                  <Link key={index} to={`/videos/tags/${item.tag}`}><li className='px-4 py-2 hover:bg-gray-900 hover:text-gray-100 cursor-pointer'>{item.tag}</li></Link>
                                              )
                                          })
                                      }
                                  </ul>
                              </div>
                      }
                  </div>
                  <div className='relative z-40'>
                    <button onClick={() => {setToggle({filtered: !toggle.filtered, tags: false });} } className='cursor-pointer mb-2 font-semibold text-sm bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-4 border border-gray-100 transition-colors duration-300 ease-in-out xs:mr-2 mr-2 flex items-center'>
                        { filteredType ? <span className='capitalize'>{filteredType}</span> : 'Filtered By' } 
                        {toggle.filtered ? <FontAwesomeIcon icon={faChevronUp} className='ml-1 font-bold'/> : <FontAwesomeIcon icon={faChevronDown} className='ml-1 font-bold'/> }
                    </button>
                    <div className={`${toggle.filtered ? `absolute` : `hidden`}`}>
                        <ul className='no-scroll max-h-[183px] overflow-y-auto flex flex-col mb-2 font-semibold text-sm bg-gray-800 text-gray-100  border border-gray-100 transition-colors duration-300 ease-in-out xs:mr-2 mr-2'>
                          <button onClick={() => handleFilteredChange('all')}><li className='px-4 py-2 hover:bg-gray-900 hover:text-gray-100 cursor-pointer'>All</li></button>
                          <button onClick={() => handleFilteredChange('embed')}><li className='px-4 py-2 hover:bg-gray-900 hover:text-gray-100 cursor-pointer'>Embed</li></button>
                          <button onClick={() => handleFilteredChange('video')}><li className='px-4 py-2 hover:bg-gray-900 hover:text-gray-100 cursor-pointer'>Videos</li></button>
                        </ul>
                    </div>
                  </div>
              </div>
            </div>
            {
              tag ?
                <div className='flex flex-wrap items-center py-4'>
                    <h3 className='text-white xs:text-lg text-lg font-semibold mr-3'>Searched Tag{tags.length > 1 && 's'}:</h3>
                    {
                        tags && tags.length > 0 &&
                            tags.map((item, index) => {
                                return (
                                    <div key={index} className='flex flex-wrap'>
                                        {
                                            item !== '' &&
                                                <p className='font-semibold text-sm bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-4 border border-gray-100 transition-colors duration-300 ease-in-out mr-2'>{item}</p>
                                        }
                                    </div>
                                )
                            })
                    }
                </div>
              :
              artist_name ?
                <div className='flex flex-wrap items-center py-4'>
                  <h3 className='text-white xs:text-lg text-lg font-semibold mr-3'>Artist: <span className='font-normal'>"{artist_name}"</span></h3>
                </div>
              :
                <div className='flex flex-wrap items-center py-4'>
                  <h3 className='text-white xs:text-lg text-lg font-semibold mr-3'>Searched: <span className='font-normal'>"{key}"</span></h3>
                </div>
            }
            {
              isLoading ?
                <div className='h-96 flex items-center justify-center'>
                  <div className='flex flex-col items-center justify-center'>
                      <img className="w-16" src={loading} />
                      <p className='text-white font-semibold text-lg mt-2'>Loading Data</p>
                  </div>
                </div>
              :
              notFound ?
                <div className='h-96 flex flex-col items-center justify-center'>
                  <div className="md:col-span-2 bg-gray-800 shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] sm:p-16 p-8 text-white text-center">
                    <h3 className='text-white xs:text-3xl text-2xl font-semibold text-center capitalize'>{message}</h3>
                    <p className="text-white text-lg">Video not available, please come back later</p>
                    <a href="/videos">
                      <button className="mx-auto text-center mt-6 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 xs:px-4 px-2 border border-gray-100 transition-colors duration-300 ease-in-out">
                        Reload Page
                      </button>
                    </a>
                  </div>
                </div>
              :
              videos && videos.length > 0 ?
              <div> 
                {
                   videos && videos.length > 0 ?
                    <div className='grid lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-5 place-content-start mt-4'>
                      {
                          videos.slice(startIndex, endIndex).map((item, index) => {
                            return (
                              <>
                              <MotionAnimate key={index} animation='fadeInUp'>
                                <VideoThumbnail 
                                  key={index} 
                                  id={item._id} 
                                  index={index} 
                                  title={item.title} 
                                  views={item.views} 
                                  timestamp={item.createdAt} 
                                  setActive={setActive} 
                                  active={active} 
                                  embedLink={getVideoId(item.link)}
                                  user={user}
                                  setAlertSubActive={setAlertSubActive}
                                  file_size={item.file_size}
                                  archiveList={archiveList ? archiveList : {}}
                                />
                              </MotionAnimate>
                              </>
                            )
                          })
                      }
                    </div>
                    :
                    (message !== 'none' || (videos.length === 0)) ?
                    <div className='w-full h-40 flex flex-col items-center justify-center'>
                      <h3 className='text-white xs:text-3xl text-2xl font-semibold text-center capitalize'>No Result Found</h3>
                    </div>
                    :
                    <div className='w-full h-96 flex flex-col items-center justify-center'></div>
                }
                {
                  videos && videos.length > 0 &&
                    <div className='flex items-center justify-center mt-8'>
                      <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className='cursor-pointer mr-2 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 xs:px-4 px-2 border border-gray-100 rounded transition-colors duration-300 ease-in-out'
                      >
                      <span className='xs:block hidden'>Prev</span>
                      <FontAwesomeIcon icon={faChevronLeft} className='xs:hidden inline-block'/>
                      </button>
                      {displayedPages.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                      // className={currentPage === index + 1 ? "active" : ""}
                      style={{backgroundColor: pageIndex === pageNumber ? "rgb(243 244 246)" : "rgb(31 41 55)", color: pageIndex === pageNumber ? "rgb(31 41 55)" : "rgb(243 244 246)"}}
                      className="cursor-pointer mx-1 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 xs:px-4 px-2 border border-gray-100 rounded transition-colors duration-300 ease-in-out"
                      >
                      {pageNumber}
                      </button>
                      ))}
                      <button
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className='cursor-pointer ml-2 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 xs:px-4 px-2 border border-gray-100 rounded transition-colors duration-300 ease-in-out'
                      >
                      <span className='xs:block hidden'>Next</span>
                      <FontAwesomeIcon icon={faChevronRight} className='xs:hidden inline-block'/>
                      </button>
                    </div>
                }
              </div>
              :
              <div className='h-96 flex items-center justify-center'>
                <div className='flex md:flex-row flex-col items-center justify-center'></div>
              </div>
            }
         </div>
      </div>
      </div>
      </div>
        // <div
        //     className="relative bg-cover bg-center pb-8"
        //     style={{ backgroundColor: "#111827" }}
        // >   
        //     <SideAlert
        //         variants={alertInfo.variant}
        //         heading={alertInfo.heading}
        //         paragraph={alertInfo.paragraph}
        //         active={alertActive}
        //         setActive={setAlertActive}
        //     />
        //     {
        //       tag ?
        //         <div className='flex flex-wrap items-center sm:px-16 px-4 pt-8 pb-4'>
        //             <h3 className='text-white xs:text-3xl text-2xl font-semibold mr-3'>Tags:</h3>
        //             {
        //                 tags && tags.length > 0 &&
        //                     tags.map((item, index) => {
        //                         return (
        //                             <div key={index} className='flex flex-wrap'>
        //                                 {
        //                                     item !== '' &&
        //                                         <p className='font-semibold text-sm bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-4 border border-gray-100 transition-colors duration-300 ease-in-out mr-2'>{item}</p>
        //                                 }
        //                             </div>
        //                         )
        //                     })
        //             }
        //         </div>
        //       :
        //       artist_name ?
        //         <div className='flex flex-wrap items-center sm:px-16 px-4 pt-8 pb-4'>
        //           <h3 className='text-white xs:text-3xl text-2xl font-semibold mr-3'>Artist: <span className='font-normal'>"{artist_name}"</span></h3>
        //         </div>
        //       :
        //         <div className='flex flex-wrap items-center sm:px-16 px-4 pt-8 pb-4'>
        //           <h3 className='text-white xs:text-3xl text-2xl font-semibold mr-3'>Search: <span className='font-normal'>"{key}"</span></h3>
        //         </div>
        //     }
          
        //     <div className='sm:px-16 px-4'>
        //         <hr/>
        //     </div>
        //     <div className={`${styles.flexCenter}`}> 
        //         {
        //           message.length > 0 ?
        //             <div className='h-96 flex flex-col items-center justify-center'> 
        //               <h3 className='text-white xs:text-3xl text-2xl font-semibold text-center'>{message}</h3>
        //               <a href="/videos">
        //                 <button className="mt-6 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 xs:px-4 px-2 border border-gray-100 rounded transition-colors duration-300 ease-in-out">
        //                     Reload Page
        //                 </button>
        //               </a>
        //             </div>
        //           :
        //           videos && videos.length > 0 ?
        //             <div>
        //               <div className='grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-5 place-content-start sm:px-16 py-8'>
        //                 {
        //                     videos.slice(startIndex, endIndex).map((item, index) => {
        //                       return (
        //                         <VideoThumbnail 
        //                           key={index} 
        //                           id={item._id} 
        //                           index={index} 
        //                           title={item.title} 
        //                           views={item.views} 
        //                           timestamp={item.createdAt} 
        //                           setActive={setActive} 
        //                           active={active} 
        //                           embedLink={getVideoId(item.link)}
        //                           user={user}
        //                           setAlertSubActive={setAlertSubActive}
        //                         />
        //                       )
        //                     })
        //                 }
        //               </div>
        //               <div className='flex items-center justify-center mt-8'>
        //                   <button
        //                     disabled={currentPage === 1}
        //                     onClick={() => handlePageChange(currentPage - 1)}
        //                     className='cursor-pointer mr-2 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 xs:px-4 px-2 border border-gray-100 rounded transition-colors duration-300 ease-in-out'
        //                   >
        //                     <span className='xs:block hidden'>Prev</span>
        //                     <FontAwesomeIcon icon={faChevronLeft} className='xs:hidden inline-block'/>
        //                   </button>
        //                 {displayedPages.map((pageNumber) => (
        //                   <button
        //                     key={pageNumber}
        //                     onClick={() => handlePageChange(pageNumber)}
        //                     // className={currentPage === index + 1 ? "active" : ""}
        //                     style={{backgroundColor: pageIndex === pageNumber ? "rgb(243 244 246)" : "rgb(31 41 55)", color: pageIndex === pageNumber ? "rgb(31 41 55)" : "rgb(243 244 246)"}}
        //                     className="cursor-pointer mx-1 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 xs:px-4 px-2 border border-gray-100 rounded transition-colors duration-300 ease-in-out"
        //                   >
        //                     {pageNumber}
        //                   </button>
        //                 ))}

        //                 <button
        //                   disabled={currentPage === totalPages}
        //                   onClick={() => handlePageChange(currentPage + 1)}
        //                   className='cursor-pointer ml-2 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 xs:px-4 px-2 border border-gray-100 rounded transition-colors duration-300 ease-in-out'
        //                 >
        //                   <span className='xs:block hidden'>Next</span>
        //                   <FontAwesomeIcon icon={faChevronRight} className='xs:hidden inline-block'/>
        //                 </button>
        //               </div>
        //             </div>
        //           :
        //           <div className='h-96 flex items-center justify-center'>
        //               <div className='flex md:flex-row flex-col items-center justify-center'>
                        
        //               </div>
        //           </div>
        //         }
        //     </div>
        // </div>
    )
}

export default VideoTag