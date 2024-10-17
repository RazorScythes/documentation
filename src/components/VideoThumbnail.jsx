import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEllipsisV, faCode, faVideo, faFileVideo, faPhotoVideo, faVideoSlash, faVideoCamera, faChevronRight, faMinus, faChevronDown, faChevronUp, faThumbsUp, faBars, faFlag, faFilm, faHdd } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from 'react-redux'
import { addToWatchLater } from "../actions/video";
import { Link } from 'react-router-dom';
import { MotionAnimate } from 'react-motion-animate'
import moment from 'moment'

const TextWithEllipsis = ({ text, limit = 70 }) => {
  if (text.length > limit) {
    return <span>{text.slice(0, limit)}...</span>;
  }
  return <span>{text}</span>;
}

const checkVideoFileSize = (size = "") => {
  if(!size) return false

  var file_size = size.split(" ")

  if(Number(file_size[0]) <= 100) return true
  return false
}

const VideoThumbnail = ({ 
  id, 
  embedLink, 
  index, 
  active, 
  title, 
  views, 
  timestamp, 
  setActive, 
  height, 
  user, 
  setAlertSubActive, 
  fixed = true, 
  file_size, 
  archiveList, 
  currentId = '', 
  uploader = false, 
  likes = [], 
  username = '', 
  downloadUrl = '',
  duration = '',
  related = false,
  setReportId
}) => {

  const dispatch = useDispatch()

  const [isOpen, setIsOpen] = useState(false)
  const [openDirectory, setOpenDirectory] = useState(false)
 
  useEffect(() => { 
    if(index !== active) setIsOpen(false)
  }, [active])

  const watchLater = (archiveId, directory = 'Default Archive') => {
    if(!user) {
        setAlertSubActive('no user')
    }
    else {
        dispatch(addToWatchLater({
            id: user?.result._id,
            videoId: id,
            archiveId: archiveId,
            directory: directory,
        }))
    }
  }

  const millisToTimeString = (millis) => {
    // Convert milliseconds to seconds
    var seconds = Math.floor(millis / 1000);
    // Calculate hours, minutes, and seconds
    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    var minutes = Math.floor(seconds / 60);
    seconds %= 60;

    // Format the time string
    var timeString = "";
    if (hours > 0) {
        timeString += hours.toString().padStart(2, '0') + ":";
    }
    timeString += minutes.toString().padStart(2, '0') + ":" +
                  seconds.toString().padStart(2, '0');
    
    return timeString;
  }

  return (
    <>
    {
      uploader ?
        <Link to={`/videos/${id}`} className='flex items-center text-gray-100 text-sm mb-2 px-4 hover:bg-[#111827] cursor-pointer transition-all relative'>
            <Link to={`/videos/${id}`} className='bg-black rounded-lg overflow-hidden md:w-48 md:max-w-48 xs:w-36 xs:max-w-36 w-32 max-w-32 h-20 mr-2 relative border border-gray-900'>
                {
                    embedLink === currentId &&
                        <p style={{backgroundColor: 'rgb(0, 0, 0, 0.8'}} className='w-full text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-xs py-1'>Watching</p>
                }
                <img 
                    src={`https://drive.google.com/thumbnail?id=${embedLink}`} alt="Video Thumbnail" 
                    className='mx-auto object-cover h-20'
                />
                <div className='absolute top-1 right-1 rounded-sm bg-[#131C31] border border-solid border-[#222F43] text-gray-100' title={checkVideoFileSize(file_size) ? 'Video' : 'Embed'}>
                  {/* <p className='font-semibold p-1 px-1 py-0 text-xs'><FontAwesomeIcon icon={checkVideoFileSize(file_size) ? faFilm : faCode} /></p> */}
                  <p className='font-semibold p-1 px-1 py-0 text-xs'><FontAwesomeIcon icon={downloadUrl ? faFilm : faCode} /></p>
                </div>
                <div className='absolute bottom-1 right-1 rounded-sm bg-[#131C31] border border-solid border-[#222F43] text-gray-100'>
                  <p className='p-1 px-1 py-0 text-xs'>{duration ? millisToTimeString(duration) : 'embed'}</p>
                </div>
            </Link>
            <div className='flex flex-col w-60 max-w-60 overflow-x-hidden'>
                <p className='truncate'><TextWithEllipsis text={title} limit={70} /></p>
                <p className='text-xs my-1 text-[#94a9c9]'>{username}</p>
                <div className='flex relative'>
                    <div className='text-xs h-6 px-2 rounded-sm flex items-center bg-[#131C31] text-center border border-solid border-[#222F43] text-gray-100' title="Views">
                        <FontAwesomeIcon icon={faEye} className="text-white mr-2"/>
                        <p>{ views ? views.length : 0 } <span className='xs:hidden inline-block'></span></p>
                    </div>
                    <div className='rounded-sm h-6 px-2 flex items-center ml-1 bg-[#131C31] text-center border border-solid border-[#222F43] text-gray-100 text-xs' title="Likes">
                        <FontAwesomeIcon icon={faThumbsUp} className="mr-2"/>
                        <p>{ likes && likes.length }</p>
                    </div>

                    {/* <button onClick={() => {
                        setActive(index)
                        setIsOpen(!isOpen)
                    }}>
                      <FontAwesomeIcon icon={faEllipsisV} className="text-sm px-2 absolute bottom-1 right-0 mr-1 cursor-pointer hover:text-gray-500"/>
                    </button> */}
                </div>
                {
                  isOpen && (index === active) &&
                  <MotionAnimate delay={0} speed={0.1}>
                    <div className='absolute top-[75px] z-10 right-6 flex flex-col bg-[#131C31] border border-solid border-[#222F43] font-poppins text-sm shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] w-40'>
                      {
                        Object.keys(archiveList).length !== 0 ? 
                        <>
                        <button onClick={() => setOpenDirectory(!openDirectory)} className='px-4 py-2 hover:bg-gray-900 text-left flex justify-between items-center'>
                          <div><FontAwesomeIcon icon={faBars} className="mr-1"/> Save</div>
                          <FontAwesomeIcon icon={openDirectory ? faChevronUp: faChevronDown} className="text-xs ml-2"/>
                        </button>
                        {
                          openDirectory && 
                          <>
                            {
                              archiveList.archive_list.map((item, index) => {
                                return (
                                  <Link onClick={() => watchLater(archiveList._id, item.name)} key={index} to="" className='text-xs px-4 py-1 hover:bg-gray-900 flex items-center'><FontAwesomeIcon icon={faMinus} className="mr-2"/> {item.name}</Link>
                                )
                              })
                            }
                          </>
                        }
                        </>
                        :
                        <button onClick={() => watchLater()} className='px-4 py-2 hover:bg-gray-900 text-left flex justify-between items-center'>
                          Watch Later
                        </button>
                      }
                      <button className='px-4 py-2 hover:bg-gray-900 text-left'><FontAwesomeIcon icon={faFlag} className="mr-1"/> Report</button>
                    </div>
                  </MotionAnimate>
                }
            </div>
        </Link>
      :
      related ? 
        <div className='flex flex-col items-center text-gray-100 text-sm mb-2 hover:bg-[#111827] cursor-pointer transition-all relative'>
            <Link to={`/videos/${id}`} className='bg-black rounded-lg overflow-hidden w-full md:h-32 xs:h-28 h-24 relative border border-gray-900'>
                {
                    embedLink === currentId &&
                        <p style={{backgroundColor: 'rgb(0, 0, 0, 0.8'}} className='w-full text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-xs py-1'>Watching</p>
                }
                <img 
                    src={`https://drive.google.com/thumbnail?id=${embedLink}`} alt="Video Thumbnail" 
                    className='mx-auto object-cover w-full md:h-32 xs:h-28 h-24'
                />
                <div className='absolute top-1 right-1 rounded-sm bg-[#131C31] border border-solid border-[#222F43] text-gray-100' title={checkVideoFileSize(file_size) ? 'Video' : 'Embed'}>
                  {/* <p className='font-semibold p-1 px-1 py-0 text-xs'><FontAwesomeIcon icon={checkVideoFileSize(file_size) ? faFilm : faCode} /></p> */}
                  <p className='font-semibold p-1 px-1 py-0 text-xs'><FontAwesomeIcon icon={downloadUrl ? faFilm : faCode} /></p>
                </div>
                <div className='absolute bottom-1 right-1 rounded-sm bg-[#131C31] border border-solid border-[#222F43] text-gray-100'>
                  <p className='p-1 px-1 py-0 text-xs'>{duration ? millisToTimeString(duration) : 'embed'}</p>
                </div>
            </Link>
            <div className='flex flex-col w-full overflow-x-hidden'>
                <p className='truncate'><TextWithEllipsis text={title} limit={70} /></p>
                <div className='flex relative mt-1'>
                    <p className='text-xs text-[#94a9c9] truncate'>{username}</p>
                    <button onClick={() => {
                        setActive(index)
                        setIsOpen(!isOpen)
                    }}>
                      <FontAwesomeIcon icon={faEllipsisV} className="text-sm px-2 absolute bottom-1 right-0 mr-1 cursor-pointer hover:text-gray-500"/>
                    </button>
                </div>
                {
                  isOpen && (index === active) &&
                  <MotionAnimate delay={0} speed={0}>
                    <div className='absolute bottom-[-45px] z-10 right-6 flex flex-col bg-[#131C31] border border-solid border-[#222F43] font-poppins text-sm shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] w-40'>
                      {
                        Object.keys(archiveList).length !== 0 ? 
                        <>
                        <button onClick={() => setOpenDirectory(!openDirectory)} className='px-4 py-2 hover:bg-gray-900 text-left flex justify-between items-center'>
                          <div><FontAwesomeIcon icon={faBars} className="mr-1"/> Save</div>
                          <FontAwesomeIcon icon={openDirectory ? faChevronUp: faChevronDown} className="text-xs ml-2"/>
                        </button>
                        {
                          openDirectory && 
                          <>
                            {
                              archiveList.archive_list.map((item, index) => {
                                return (
                                  <Link onClick={() => watchLater(archiveList._id, item.name)} key={index} to="" className='text-xs px-4 py-1 hover:bg-gray-900 flex items-center'><FontAwesomeIcon icon={faMinus} className="mr-2"/> {item.name}</Link>
                                )
                              })
                            }
                          </>
                        }
                        </>
                        :
                        <button onClick={() => watchLater()} className='px-4 py-2 hover:bg-gray-900 text-left flex justify-between items-center'>
                          Watch Later
                        </button>
                      }
                      <button onClick={() => setReportId(id)} className='px-4 py-2 hover:bg-gray-900 text-left'><FontAwesomeIcon icon={faFlag} className="mr-1"/> Report</button>
                    </div>
                  </MotionAnimate>
                }
                <hr className='border-gray-700 my-1 border-dashed'/>
                <div className='flex justify-between'>
                  <p className='text-gray-100 text-xs truncate'>{moment(timestamp).fromNow()}</p>
                  <p className='truncate text-xs'><FontAwesomeIcon icon={faEye} className="mr-1"/> { views ? views.length : 0 }</p>
                </div>
            </div>
        </div>
      :
      fixed ?
        <div className='mx-auto xs:w-full w-64 text-white transition-all sm:px-0 xs:px-4 px-2'>
            <Link to={`/videos/${id}`}>
              <div className='bg-black rounded-lg overflow-hidden relative'>
                <img 
                  src={`https://drive.google.com/thumbnail?id=${embedLink}`} alt="Video Thumbnail" 
                  className='h-[150px] mx-auto object-cover'
                  style={{height: height ? height+"px" : "161px"}}
                />
                <div className='absolute top-0 right-0 bg-gray-800' title={checkVideoFileSize(file_size) ? 'Video' : 'Embed'}>
                  <p className='font-semibold p-1 px-2'><FontAwesomeIcon icon={checkVideoFileSize(file_size) ? faVideoCamera : faCode} /></p>
                </div>
              </div>
            </Link>
            <div className='relative'>
            <Link to={`/videos/${id}`}><p className='break-words mt-1'><TextWithEllipsis text={title} /></p></Link>
              <div className='flex items-center mt-1 text-gray-400 text-sm'>
                <FontAwesomeIcon icon={faEye} className="mr-1"/>
                <p>{views.length} view{views.length > 1 && "s"} | </p> 
                <p className='text-gray-400 ml-2 break-all'>{moment(timestamp).fromNow()}</p>
                <button onClick={() => {
                    setActive(index)
                    setIsOpen(!isOpen)
                }}>
                  <FontAwesomeIcon icon={faEllipsisV} className="text-lg px-2 absolute bottom-0 right-0 mr-1 cursor-pointer hover:text-gray-500"/>
                </button>
              </div>
              
              {
                  isOpen && (index === active) &&
                  <MotionAnimate delay={0} speed={0.2}>
                    <div className='absolute top-[55px] z-10 right-0 flex flex-col bg-gray-800 shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] w-40'>
                      {
                        Object.keys(archiveList).length !== 0 ? 
                        <>
                        <button onClick={() => setOpenDirectory(!openDirectory)} className='px-4 py-2 hover:bg-gray-900 text-left flex justify-between items-center'>
                          Watch Later
                          <FontAwesomeIcon icon={openDirectory ? faChevronUp: faChevronDown} className="text-sm ml-2"/>
                        </button>
                        {
                          openDirectory && 
                          <>
                            {
                              archiveList.archive_list.map((item, index) => {
                                return (
                                  <Link onClick={() => watchLater(archiveList._id, item.name)} key={index} to="" className='text-sm px-4 py-1 hover:bg-gray-900 flex items-center'><FontAwesomeIcon icon={faMinus} className="mr-2"/> {item.name}</Link>
                                )
                              })
                            }
                          </>
                        }
                        </>
                        :
                        <button onClick={() => watchLater()} className='px-4 py-2 hover:bg-gray-900 text-left flex justify-between items-center'>
                          Watch Later
                        </button>
                      }
                      <button className='px-4 py-2 hover:bg-gray-900 text-left'>Report</button>
                    </div>
                  </MotionAnimate>
                }
            </div>
        </div>
      :
        <div className='mx-auto xs:w-full w-64 text-white transition-all sm:px-0'>
            <div className='md:block xs:flex block'>
              <Link to={`/videos/${id}`}>
                <div className='bg-black rounded-lg overflow-hidden md:w-full xs:w-44 w-64 mr-4 relative border border-gray-900'>
                  <img 
                    src={`https://drive.google.com/thumbnail?id=${embedLink}`} alt="Video Thumbnail" 
                    className='mx-auto object-cover md:h-[161px] xs:h-[100px] h-[161px]'
                    // style={{height: height ? height+"px" : "100px"}}
                  />
                  <div className='absolute top-0 right-0 bg-gray-800' title={checkVideoFileSize(file_size) ? 'Video' : 'Embed'}>
                    <p className='font-semibold p-1 px-2'><FontAwesomeIcon title={checkVideoFileSize(file_size) ? 'Video' : 'Embed'} icon={checkVideoFileSize(file_size) ? faVideoCamera : faCode} /></p>
                  </div>
                </div>
              </Link>
              <div className='relative w-full'>
              <Link to={`/videos/${id}`}><p className='break-words mt-1'><TextWithEllipsis text={title} /></p></Link>
                <div className='flex items-center mt-1 text-gray-400 text-sm'>
                  <FontAwesomeIcon icon={faEye} className="mr-1"/>
                  <p>{views.length} view{views.length > 1 && "s"} | </p> 
                  <p className='text-gray-400 ml-2 break-all'>{moment(timestamp).fromNow()}</p>
                  <button onClick={() => {
                      setActive(index)
                      setIsOpen(!isOpen)
                  }}>
                    <FontAwesomeIcon icon={faEllipsisV} className="text-lg px-2 absolute bottom-0 right-0 mr-1 cursor-pointer hover:text-gray-500"/>
                  </button>
                </div>
                {
                  isOpen && (index === active) &&
                    <div className='absolute top-[55px] z-10 right-0 flex flex-col bg-gray-800 shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] w-40'>
                      {
                        Object.keys(archiveList).length !== 0 ? 
                        <>
                        <button onClick={() => setOpenDirectory(!openDirectory)} className='px-4 py-2 hover:bg-gray-900 text-left flex justify-between items-center'>
                          Watch Later
                          <FontAwesomeIcon icon={openDirectory ? faChevronUp: faChevronDown} className="text-sm ml-2"/>
                        </button>
                        {
                          openDirectory && 
                          <>
                            {
                              archiveList.archive_list.map((item, index) => {
                                return (
                                  <Link onClick={() => watchLater(archiveList._id, item.name)} key={index} to="" className='text-sm px-4 py-1 hover:bg-gray-900 flex items-center'><FontAwesomeIcon icon={faMinus} className="mr-2"/> {item.name}</Link>
                                )
                              })
                            }
                          </>
                        }
                        </>
                        :
                        <button onClick={() => watchLater()} className='px-4 py-2 hover:bg-gray-900 text-left flex justify-between items-center'>
                          Watch Later
                        </button>
                      }
                      <button className='px-4 py-2 hover:bg-gray-900 text-left'>Report</button>
                    </div>
                }
              </div>
            </div>
        </div>
    }
    </>
  )
};

export default VideoThumbnail;
