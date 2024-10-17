import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getGameByTag, getGameByDeveloper, getGameBySearchKey, countTags } from "../../actions/game";
import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import { MotionAnimate } from 'react-motion-animate'
import { clearAlert } from "../../actions/game";
import GamesCards from './GamesCards';
import loading from '../../assets/loading.gif'
import styles from "../../style";
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

const GameTag = ({ user }) => {
    const navigate  = useNavigate()

    const [searchParams, setSearchParams] = useSearchParams();
    const [active, setActive] = useState(0)
    const [tags, setTags] = useState([])
    const [games, setGames] = useState([])
    const dispatch = useDispatch()

    const { tag, developer, key } = useParams();

    const game = useSelector((state) => state.game.games)
    const message = useSelector((state) => state.game.message)
    const tagsList = useSelector((state) => state.game.tagsCount)
    const sideAlert = useSelector((state) => state.game.sideAlert)

    const pageIndex = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1
    const paramIndex = searchParams.get('type') === null || searchParams.get('type') === ''
    const checkParams = (val) => {return searchParams.get('type') === val}
    const [toggle, setToggle] = useState({
        tags: false
    })

    const [displayedPages, setDisplayedPages] = useState([]);
    const [alertActive, setAlertActive] = useState(false)
    const [alertSubActive, setAlertSubActive] = useState('')
    const [alertInfo, setAlertInfo] = useState({
        variant: '',
        heading: '',
        paragraph: ''
    })

    useEffect(() => {
      
    }, [message])

    useEffect(() => {
      if(game.length > 0)
        setGames(game)
    }, [game])

    useEffect(() => {
        setGames([])
        dispatch(countTags({
            id: user ? user.result?._id : ''
        }))
        if(tag) {
          dispatch(getGameByTag({
              id: user ? user.result?._id : '',
              tag: tag.length > 0 ? tag.split("+") : []
          }))
          setTags(tag.split("+"))
        }
        else if(developer){
          dispatch(getGameByDeveloper({
            id: user ? user.result?._id : '',
            developer: developer
          }))
        }
        else if(key){
          dispatch(getGameBySearchKey({
            id: user ? user.result?._id : '',
            searchKey: key
          }))
        }
    }, [tag, developer, key])

    useEffect(() => {
      setCurrentPage(pageIndex)
    }, [pageIndex])

    const itemsPerPage = 20; // Number of items per page
    const totalPages = Math.ceil(games?.length / itemsPerPage); // Total number of pages
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

        if(tag)
          navigate(`/games/tags/${tag}?page=${pageNumber}`)
        else if(developer)
          navigate(`/games/developer/${developer}?page=${pageNumber}`)
    };

    return (
      <div
            className="relative bg-cover bg-center"
            style={{ backgroundColor: "#111827" }}
        >   
          <div className={`${styles.flexCenter}`}> 

          </div>
          <div className={`${styles.marginX} ${styles.flexCenter}`}>
              <div className={`${styles.boxWidthEx}`}>
                  <div className="container mx-auto file:lg:px-8 relative px-0 my-10">
                      {
                          message.length > 0 ?
                              <div className='h-96 flex flex-col items-center justify-center'> 
                                  <h3 className='text-white xs:text-3xl text-2xl font-semibold text-center capitalize'>{message}</h3>
                                  <a href="/games">
                                      <button className="mt-6 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 xs:px-4 px-2 border border-gray-100 transition-colors duration-300 ease-in-out">
                                          Reload Page
                                      </button>
                                  </a>
                              </div>
                          :
                          games && games.length > 0 ?
                          <>
                          <div className="flex justify-between items-center">
                              <div className='flex flex-row flex-wrap items-start xs:justify-start justify-center'>
                                  <Link to={`/games?page=${1}`}><p style={{backgroundColor: paramIndex && 'rgb(243, 244, 246)', color: paramIndex && 'rgb(31, 41, 55)'}} className='mb-2 font-semibold text-sm bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-4 border border-gray-100  transition-colors duration-300 ease-in-out xs:mr-2 mr-2'>All</p></Link>
                                  <Link to={`/games?type=latest&page=${1}`}><p style={{backgroundColor: checkParams('latest') && 'rgb(243, 244, 246)', color: checkParams('latest') && 'rgb(31, 41, 55)'}} className='mb-2 font-semibold text-sm bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-4 border border-gray-100transition-colors duration-300 ease-in-out xs:mr-2 mr-2'>Latest</p></Link>
                                  <div className='relative'>
                                      <button onClick={() => setToggle({...toggle, tags: !toggle.tags})} style={{backgroundColor: checkParams('most_viewed') && 'rgb(243, 244, 246)', color: checkParams('most_viewed') && 'rgb(31, 41, 55)'}} className='cursor-pointer mb-2 font-semibold text-sm bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-4 border border-gray-100 transition-colors duration-300 ease-in-out xs:mr-2 mr-2 flex items-center'>
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
                                                                  <Link onClick={() => setToggle({...toggle, tags: false})} key={index} to={`/games/tags/${item.tag}`}><li className='px-4 py-2 hover:bg-gray-900 hover:text-gray-100 cursor-pointer'>{item.tag}</li></Link>
                                                              )
                                                          })
                                                      }
                                                  </ul>
                                              </div>
                                      }
                                  </div>
                                  <Link to={`/games?type=popular&page=${1}`}><p style={{backgroundColor: checkParams('popular') && 'rgb(243, 244, 246)', color: checkParams('popular') && 'rgb(31, 41, 55)'}} className='mb-2 font-semibold text-sm bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-4 border border-gray-100 transition-colors duration-300 ease-in-out'>Popular</p></Link>
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
                            developer ?
                              <div className='flex flex-wrap items-center py-4'>
                                <h3 className='text-white xs:text-lg text-lg font-semibold mr-3'>Developer: <span className='font-normal'>"{developer}"</span></h3>
                              </div>
                            :
                              <div className='flex flex-wrap items-center py-4'>
                                <h3 className='text-white xs:text-lg text-lg font-semibold mr-3'>Searched: <span className='font-normal'>"{key}"</span></h3>
                              </div>
                          }
                          <div className="grid md:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-5 place-content-start mt-4">
                              {
                                  games.slice(startIndex, endIndex).map((item, index) => {
                                      return (
                                        <MotionAnimate key={index} animation='fadeInUp'>
                                          <GamesCards  
                                              id={item._id}
                                              heading={item.title} 
                                              image={item.featured_image} 
                                              downloads={1}
                                              category={item.tags.length > 0 ? item.tags[0] : 'No Tag Available'} 
                                              uploader={item.user.username} 
                                              ratings={item.ratings}
                                              download_links={item.download_link}
                                          />
                                        </MotionAnimate>
                                      )
                                  })
                              }
                          </div>
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
                          </>
                          :
                          <div className='h-96 flex items-center justify-center'>
                              <div className='flex flex-col items-center justify-center'>
                                  <img className="w-16" src={loading} />
                                  <p className='text-white font-semibold text-lg mt-2'>Loading Data</p>
                              </div>
                          </div>
                      }
                  </div>
              </div>
          </div>
      </div>
    )
}

export default GameTag