import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getVideos, countVideoTags, getVideoBySearchKey } from "../../actions/video";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faChevronUp, faChevronDown, faCheckSquare, faSquare, faSearch, faClose, faArrowLeft, faArrowRight, faHomeLg } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from 'react-router-dom';
import { useSearchParams, useParams } from "react-router-dom";
import { clearAlert } from "../../actions/video";
import { MotionAnimate } from 'react-motion-animate'
import loading from '../../assets/loading.gif'
import Loading from './Loading';
import styles from "../../style";
import VideoThumbnail from '../VideoThumbnail';
import SideAlert from '../SideAlert'
import Cookies from 'universal-cookie';
import { useQuery } from 'react-query';
import ReportModal from './../ReportModal'

const cookies = new Cookies();

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

const Videos = ({ user }) => {
    const { key, developer } = useParams();

    const navigate  = useNavigate()

    const [searchParams, setSearchParams] = useSearchParams();
    const [active, setActive] = useState(0)
    
    const dispatch = useDispatch()

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
    const [videos, setVideos] = useState([])
    const [toggle, setToggle] = useState({
      tags: false,
      filtered: false
    })

    const [tags, setTags] = useState([])
    const [searchKey, setSearchKey] = useState('')

    const [alertActive, setAlertActive] = useState(false)
    const [alertSubActive, setAlertSubActive] = useState('')
    const [alertInfo, setAlertInfo] = useState({
        variant: '',
        heading: '',
        paragraph: ''
    })

    const [reportModal, setReportModal] = useState(false)
    const [reportId, setReportId] = useState('')

    useEffect(() => {
      
    }, [message])

    useEffect(() => {
      if(searchParams.get('tags'))
          setTags(searchParams.get('tags').split("`"))
    }, [searchParams.get('tags')])

    useEffect(() => {
      if(video.length > 0 && reportId) {
          setReportModal(true)
      }
    }, [reportId])

    useEffect(() => {
      if(Object.keys(sideAlert).length !== 0){
          setAlertInfo({
              variant: sideAlert.variant,
              heading: sideAlert.heading,
              paragraph: sideAlert.paragraph
          })
          setAlertActive(true)

          dispatch(clearAlert())

          if(reportModal) {
              setReportId('')
              setReportModal(false)
          }
      }
    }, [sideAlert])

    const checkVideoFileSize = (size = "") => {
      if(!size) return false
    
      var file_size = size.split(" ")
    
      if(Number(file_size[0]) <= 100) return true
      return false
    }

    const filterDataByTags = () => {
      let filter_videos = []
      video.forEach((vid) => {
        tags.forEach((tag__) => {
          vid.tags.forEach((tag_) => {
                if(tag__.toLowerCase() === tag_.toLowerCase())
                filter_videos.push(vid)
            })
        })
      })
      
      let deleteDuplicate = filter_videos.filter((obj, index, self) =>
        index === self.findIndex((o) => o._id.toString() === obj._id.toString())
      );
  
      return deleteDuplicate;
    }

    const initData = () => {
      window.scrollTo(0, 0)
      if(searchParams.get('type') === null || searchParams.get('type') === '') {
        var dataTags = filterDataByTags()
        var filteredData
        if(filteredType !== null) {
          if(tags.length > 0) {
              filteredData = video.filter(obj => filteredType === obj.category || filteredType === '');
          }
          else {
              filteredData = video.filter(obj => filteredType === obj.category || filteredType === '');
          }
        }
        else {
          if(tags.length > 0) {
              filteredData = dataTags
          }
          else {
              filteredData = video
          }
        }

        setVideos(filteredData)
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
          groupedData = video.reduce((result, obj) => {
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
        const latestVideos = groupedData[latestDate];

        if(latestVideos !== undefined) { 
          var filteredData
          if(filteredType !== null)
              filteredData = latestVideos.filter(obj => filteredType === obj.category || filteredType === '');
          else 
              filteredData = latestVideos

          setVideos(filteredData)
        }
      }
      else if(searchParams.get('type') === 'most_viewed') {
        // Sort the data based on views in ascending order
        if(video.length > 0) {
          var arr = []

          if(tags.length > 0) {
              var dataTags = filterDataByTags()
              arr = [...dataTags]
          }
          else {
              arr = [...video]
          }
  
          const sortedData = arr.sort((a, b) => b.views.length - a.views.length);
  
          if(sortedData.length > 0)
            var filteredData
            if(filteredType !== null)
                filteredData = sortedData.filter(obj => filteredType === obj.category || filteredType === '');
            else 
                filteredData = sortedData

            setVideos(filteredData)
        }
      }
      else if(searchParams.get('type') === 'popular') {
        // Sort the data based on views in ascending order
        if(video.length > 0) {
          var arr = []
          
          if(tags.length > 0) {
              var dataTags = filterDataByTags()
              dataTags.forEach(item => {
              var popularity = ((item.views.length/2) + item.likes?.length) - item.dislikes?.length
                  if(popularity > 0) { 
                      arr.push({...item, popularity: popularity})
                  }
              });
          }
          else {
              video.forEach(item => {
              var popularity = ((item.views.length/2) + item.likes?.length) - item.dislikes?.length
                  if(popularity > 0) { 
                      arr.push({...item, popularity: popularity})
                  }
              });
          }

          const sortedData = arr.sort((a, b) => b.popularity - a.popularity);

          if(sortedData.length > 0)
              var filteredData 
              if(filteredType !== null)
                  filteredData = sortedData.filter(obj => filteredType === obj.category || filteredType === '');
              else 
                  filteredData = sortedData
  
          setVideos(filteredData)
        }
      }
    }

    useEffect(() => {
      if(tags.length > 0) {
        var dataTags = filterDataByTags()
        setVideos(dataTags)
      }
      else {
        initData()
      }
    }, [tags])

    useEffect(() => {
      initData()
      if(tags.length > 0) {
        var dataTags = filterDataByTags()
        setVideos(dataTags)
      }
    },[video, searchParams.get('type'), filteredType])

    useEffect(() => {
      if(key){
        dispatch(getVideoBySearchKey({
          id: user ? user.result?._id : '',
          searchKey: key
        }))
      }
      else {
        dispatch(getVideos({
          id: user ? user.result?._id : ''
        }))
        dispatch(countVideoTags({
          id: user ? user.result?._id : ''
        }))
      }
    }, [])

    useEffect(() => {
      setCurrentPage(pageIndex)
    }, [pageIndex])

    const itemsPerPage = 55; // Number of items per page
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
    
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);

        if(filteredType)
          navigate(`/videos?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${pageNumber}&filtered=${filteredType}`)
        else
          navigate(`/videos?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${pageNumber}`)
        
        setToggle({tags: false, filtered: false})
    };

    const handlePageType = (type) => {
      const urlString = window.location.href.split('?')[0];
      const baseUrl = window.location.origin;
      const path = urlString.substring(baseUrl.length);
      if(filteredType)
        navigate(`${path}?type=${type}&page=${1}&filtered=${filteredType}`)
      else
        navigate(`${path}?type=${type}&page=${1}`)
      
      setTags([])
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

    const changeQueryTagsParams = (arr) => {
        const urlString = window.location.href.split('?')[0];
        const baseUrl = window.location.origin;
        const path = urlString.substring(baseUrl.length);
        if(filteredType) {
            if(arr.length > 0) {
                navigate(`${path}?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${currentPage}&tags=${arr.join('`')}&category=${filteredType}`)
            }
            else {
                navigate(`${path}?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${currentPage}&category=${filteredType}`)
            }
        }
        else {
            if(arr.length > 0) {
                navigate(`${path}?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${currentPage}&tags=${arr.join('`')}`)
            }
            else {
                navigate(`${path}?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${currentPage}`)
            }
        }
    }

    const addTags = (e) => {
        let duplicate = false
        if(e.target.value == 'All') {
          setTags([])
          changeQueryTagsParams([])
          return
        }
        tags.forEach(item => { if(e.target.value === item) duplicate = true })
        if(duplicate) { duplicate = false; return;}

        setTags(tags.concat(e.target.value))

        let arr = [...tags]
        arr.push(e.target.value)

        changeQueryTagsParams(arr)
    }

    const deleteTags = (e) => {
        let arr = [...tags]
        arr.splice(e.currentTarget.id, 1)
        setTags([...arr])
        changeQueryTagsParams(arr)
    } 

    const handleSearch = (e) => {
        const keyword = e.target.value.toLowerCase();
        setSearchKey(e.target.value);
    
        const filteredData = video.filter((item) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(keyword)
          )
        );
        setCurrentPage(1)
        setVideos(filteredData);
    }

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
      <ReportModal
          openModal={reportModal}
          setOpenModal={setReportModal}
          data={reportId}
          sideAlert={sideAlert}
          setReportId={setReportId}
      />
      {/* <div className='lg:px-16 sm:px-4 mx-auto'>
         <hr/>
      </div> */}
      <div className={`${styles.marginX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidthEx}`}>
         <div className="container mx-auto file:lg:px-8 relative px-0 my-10 font-poppins text-[#94a9c9]">
            {
              key &&
              <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-8'>
                <div>
                    <div className='flex sm:flex-row flex-col items-start text-sm pb-2'>
                        <h1 className='sm:text-5xl text-4xl font-bold text-[#0DBFDC] drop-shadow-md'> Videos Search </h1>
                    </div>
                    <div className='flex flex-row flex-wrap items-center text-sm'>
                        <div className='mr-2'><FontAwesomeIcon icon={faHomeLg} className='mr-1'/> <a href='/' className='hover:underline transition-all hover:text-[#0CBCDC]'> Home </a></div>
                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <a href='/videos' className='hover:underline transition-all hover:text-[#0CBCDC]'> Videos </a></div>
                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <span className='hover:underline transition-all hover:text-[#0CBCDC]'> Search </span></div>
                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <span className='hover:underline transition-all hover:text-[#0CBCDC]'> {key} </span></div>
                    </div>
                </div>
            </div>
            }
            <div className='flex sm:flex-row flex-col-reverse sm:justify-between mb-4 font-poppins'>
              <div className='flex justify-between gap-2 items-center'>
                  <div className="relative lg:mt-0 sm:w-80 w-1/2 ">
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
                      </span>
                      <input value={searchKey} onChange={handleSearch} className="h-11 rounded-lg block w-full bg-[#131C31] border border-solid border-[#222F43] text-gray-100 text-sm font-normal py-2 px-4 pr-10 leading-tight focus:outline-none " type="text" placeholder='Search Videos'/>
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
                          : checkParams('popular') ? <span className="px-2 py-1 rounded-lg bg-[#131C31] border border-[#222F43] text-gray-100">Popular</span>
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
                        <div className='grid md:grid-cols-5 sm:grid-cols-4 xs:grid-cols-3 grid-cols-2 gap-5 place-content-start mt-4'>
                            {
                              videos.slice(startIndex, endIndex).map((item, index) => {
                                return (
                                  <MotionAnimate key={index} animation='fadeInUp'>
                                    <VideoThumbnail 
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
                                      likes={item.likes}
                                      related={true}
                                      duration={item.duration}
                                      downloadUrl={item.downloadUrl}
                                      username={item.user ? item.user.username : "Anonymous" }
                                      setReportId={setReportId}
                                    />
                                  </MotionAnimate>
                                )
                              })
                            }
                        </div>
                        :
                        message !== 'none' ?
                          <div className='w-full h-40 flex flex-col items-center justify-center'>
                            <h3 className='text-white xs:text-3xl text-2xl font-semibold text-center capitalize'>No Result Found</h3>
                          </div>
                        :
                        <div className='w-full h-96 flex flex-col items-center justify-center'></div>
                  }
                  {
                    videos && videos.length > 0 &&
                      <div className='flex flex-wrap items-center justify-center mt-6'>
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
                      // <div className='flex items-center justify-center mt-8'>
                      //   <button
                      //   disabled={currentPage === 1}
                      //   onClick={() => handlePageChange(currentPage - 1)}
                      //   className='cursor-pointer mr-2 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 xs:px-4 px-2 border border-gray-100 rounded transition-colors duration-300 ease-in-out'
                      //   >
                      //   <span className='xs:block hidden'>Prev</span>
                      //   <FontAwesomeIcon icon={faChevronLeft} className='xs:hidden inline-block'/>
                      //   </button>
                      //   {displayedPages.map((pageNumber) => (
                      //   <button
                      //     key={pageNumber}
                      //     onClick={() => handlePageChange(pageNumber)}
                      //   // className={currentPage === index + 1 ? "active" : ""}
                      //   style={{backgroundColor: pageIndex === pageNumber ? "rgb(243 244 246)" : "rgb(31 41 55)", color: pageIndex === pageNumber ? "rgb(31 41 55)" : "rgb(243 244 246)"}}
                      //   className="cursor-pointer mx-1 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 xs:px-4 px-2 border border-gray-100 rounded transition-colors duration-300 ease-in-out"
                      //   >
                      //   {pageNumber}
                      //   </button>
                      //   ))}
                      //   <button
                      //   disabled={currentPage === totalPages}
                      //   onClick={() => handlePageChange(currentPage + 1)}
                      //   className='cursor-pointer ml-2 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 xs:px-4 px-2 border border-gray-100 rounded transition-colors duration-300 ease-in-out'
                      //   >
                      //   <span className='xs:block hidden'>Next</span>
                      //   <FontAwesomeIcon icon={faChevronRight} className='xs:hidden inline-block'/>
                      //   </button>
                      // </div>
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
    )
}

export default Videos