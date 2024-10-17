import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Error_forbiden } from '../../assets';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCalendar, faCheck, faCheckSquare, faChevronDown, faChevronLeft, faChevronRight, faChevronUp, faClose, faDownload, faHomeLg, faSearch, faSquare } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams, useParams } from "react-router-dom";
import { getGameBySearchKey, getGameByDeveloper, categoriesCount, getGames, countTags, clearAlert } from "../../actions/game";
import { MotionAnimate } from 'react-motion-animate'
import GamesCards from './GamesCards';
import loading from '../../assets/loading.gif'
import image from '../../assets/hero-bg.jpg'
import avatar from '../../assets/avatar.png'
import styles from "../../style";

const divideAndScale = (ratings) => {
    const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / ratings.length;

    return averageRating.toFixed(1);
}

const Games = ({ user }) => {
    const { key, developer } = useParams();

    const navigate  = useNavigate()
    const dispatch = useDispatch()

    const game = useSelector((state) => state.game.games)
    const tagsList = useSelector((state) => state.game.tagsCount)
    const message = useSelector((state) => state.game.message)
    const categoriesList = useSelector((state) => state.game.categoriesCount)

    const [tags, setTags] = useState([])
    const [rating, setRating] = useState(0);
    const [fixedRating, setFixedRating] = useState(3.5)
    const [games, setGames] = useState([])
    const [searchParams, setSearchParams] = useSearchParams();
    const [displayedPages, setDisplayedPages] = useState([]);
    const [searchKey, setSearchKey] = useState('')

    const pageIndex = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1
    const navType = searchParams.get('type') ? searchParams.get('type') : ''
    const filteredType = searchParams.get('category') ? searchParams.get('category') : ''
    const paramIndex = searchParams.get('type') === null || searchParams.get('type') === ''
    const checkParams = (val) => {return searchParams.get('type') === val}

    const [toggle, setToggle] = useState({
        categories: false,
        filtered: false,
        tags: false
    })

    useEffect(() => {
        if(searchParams.get('tags'))
            setTags(searchParams.get('tags').split("`"))
    }, [searchParams.get('tags')])

    useEffect(() => {
        if(key){
            dispatch(getGameBySearchKey({
              id: user ? user.result?._id : '',
              searchKey: key
            }))
        }
        else if(developer){
            dispatch(getGameByDeveloper({
              id: user ? user.result?._id : '',
              developer: developer
            }))
          }
        else {
            dispatch(getGames({
                id: user ? user.result?._id : ''
            }))
            dispatch(countTags({
                id: user ? user.result?._id : ''
            }))
        }

        dispatch(categoriesCount({
            id: user ? user.result?._id : ''
        }))
    }, [])

    useEffect(() => {
        setCurrentPage(pageIndex)
      }, [pageIndex])
  
    const itemsPerPage = 20; // Number of items per page
    const totalPages = Math.ceil(games?.length / itemsPerPage); // Total number of pages
    const [currentPage, setCurrentPage] = useState(pageIndex);
    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const filterDataByTags = () => {
        let filter_games = []
        game.forEach((gam) => {
          tags.forEach((tag__) => {
            gam.tags.forEach((tag_) => {
                  if(tag__.toLowerCase() === tag_.toLowerCase())
                  filter_games.push(gam)
              })
          })
        })
        
        let deleteDuplicate = filter_games.filter((obj, index, self) =>
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
                    filteredData = game.filter(obj => filteredType === obj.category || filteredType === '');
                }
                else {
                    filteredData = game.filter(obj => filteredType === obj.category || filteredType === '');
                }
            }
            else {
                if(tags.length > 0) {
                    filteredData = dataTags
                }
                else {
                    filteredData = game
                }
            }

            setGames(filteredData)
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
                groupedData = game.reduce((result, obj) => {
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
            const latestGames = groupedData[latestDate];
    
            if(latestGames !== undefined) { 
                var filteredData
                if(filteredType !== null)
                    filteredData = latestGames.filter(obj => filteredType === obj.category || filteredType === '');
                else 
                    filteredData = latestGames
    
                setGames(filteredData)
            }
        }
        else if(searchParams.get('type') === 'most_viewed') {
            // Sort the data based on views in ascending order
            if(game.length > 0) {
                var arr = []

                if(tags.length > 0) {
                    var dataTags = filterDataByTags()
                    arr = [...dataTags]
                }
                else {
                    arr = [...game]
                }
        
                const sortedData = arr.sort((a, b) => b.views.length - a.views.length);
        
                if(sortedData.length > 0)
                    var filteredData
                    if(filteredType !== null)
                        filteredData = sortedData.filter(obj => filteredType === obj.category || filteredType === '');
                    else 
                        filteredData = sortedData
        
                    setGames(filteredData)
            }
        }
        else if(searchParams.get('type') === 'popular') {
            // Sort the data based on views in ascending order
            if(game.length > 0) {
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
                    game.forEach(item => {
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
        
                    setGames(filteredData)
                }
        }
    }

    useEffect(() => {
        if(tags.length > 0) {
            var dataTags = filterDataByTags()
            setGames(dataTags)
        }
        else {
            initData()
        }
    }, [tags])

    useEffect(() => {
        initData()
        if(tags.length > 0) {
            var dataTags = filterDataByTags()
            setGames(dataTags)
        }
    },[game, searchParams.get('type'), filteredType])

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
    
    const handleFilteredChange = (filtered) => {
        if(filtered === filteredType) filtered = ''
        
        if(key || developer) {
            if(tags.length > 0) {
                window.location.href = `/games?type=${navType}&page=${1}&tags=${tags.join('`')}&category=${filtered}`
            }
            else {
                window.location.href = `/games?type=${navType}&page=${1}&category=${filtered}`
            }
        }
        else {
            if(tags.length > 0) {
                navigate(`/games?type=${navType}&page=${1}&tags=${tags.join('`')}&category=${filtered}`)
            }
            else {
                navigate(`/games?type=${navType}&page=${1}&category=${filtered}`)
            }
        }
        setToggle({tags: false, filtered: false})
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        const urlString = window.location.href.split('?')[0];
        const baseUrl = window.location.origin;
        const path = urlString.substring(baseUrl.length);
        if(filteredType) {
            if(tags.length > 0) {
                navigate(`${path}?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${pageNumber}&tags=${tags.join('`')}`)
            }
            else {
                navigate(`${path}?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${pageNumber}&category=${filteredType}`)
            }
        }
        else {
            if(tags.length > 0) {
                navigate(`${path}?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${pageNumber}&tags=${tags.join('`')}`)
            }
            else {
                navigate(`${path}?type=${(searchParams.get('type') !== null) ? searchParams.get('type') : ''}&page=${pageNumber}`)
            }
        }
        
        setToggle({tags: false, filtered: false})
    };

    const handlePageType = (type) => {
        const urlString = window.location.href.split('?')[0];
        const baseUrl = window.location.origin;
        const path = urlString.substring(baseUrl.length);

        if(filteredType) {
            if(tags.length > 0) {
                navigate(`${path}?type=${type}&page=${1}&tags=${tags.join('`')}&category=${filteredType}`)
            }
            else {
                navigate(`${path}?type=${type}&page=${1}&category=${filteredType}`)
            }
        }
        else {
            if(tags.length > 0) {
                navigate(`${path}?type=${type}&page=${1}&tags=${tags.join('`')}`)
            }
            else {
                navigate(`${path}?type=${type}&page=${1}`)
            }
        }
          
        setToggle({tags: false, filtered: false})
    };

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
    
        const filteredData = game.filter((item) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(keyword)
          )
        );
        setCurrentPage(1)
        setGames(filteredData);
    }

    return (
        <div
            className="relative bg-cover bg-center"
            style={{ backgroundColor: "#111827" }}
        >   
            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="container mx-auto py-12 pt-6 xs:px-0 text-[#94a9c9] font-poppins">
                        <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start'>
                            <div>
                                <div className='flex sm:flex-row flex-col items-start text-sm mt-6 pb-2'>
                                    <h1 className='sm:text-5xl text-4xl font-bold text-[#0DBFDC] drop-shadow-md'> {key ? 'Games Search' : developer ? 'Developer Search' : 'Latest Games'} </h1>
                                    <button className='top-0 sm:ml-2 ml-0 mb-2 sm:mt-0 mt-2 font-semibold bg-[#131C31] border border-solid border-[#222F43] text-gray-100  transition-colors duration-300 ease-in-out px-8 py-1 rounded-full'>
                                        {games?.length > 0 ? games.length : "0" } Games
                                    </button>
                                </div>
                                {
                                    key ?
                                    <div className='flex flex-row flex-wrap items-center text-sm'>
                                        <div className='mr-2'><FontAwesomeIcon icon={faHomeLg} className='mr-1'/> <a href='/' className='hover:underline transition-all hover:text-[#0CBCDC]'> Home </a></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <a href='/games' className='hover:underline transition-all hover:text-[#0CBCDC]'> Games </a></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <span className='hover:underline transition-all hover:text-[#0CBCDC]'> Search </span></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <span className='hover:underline transition-all hover:text-[#0CBCDC]'> {key} </span></div>
                                    </div> :
                                    developer ?
                                    <div className='flex flex-row flex-wrap items-center text-sm'>
                                        <div className='mr-2'><FontAwesomeIcon icon={faHomeLg} className='mr-1'/> <a href='/' className='hover:underline transition-all hover:text-[#0CBCDC]'> Home </a></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <a href='/games' className='hover:underline transition-all hover:text-[#0CBCDC]'> Games </a></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <span className='hover:underline transition-all hover:text-[#0CBCDC]'> Developer </span></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <span className='hover:underline transition-all hover:text-[#0CBCDC]'> {developer} </span></div>
                                    </div> :
                                    filteredType ?
                                    <div className='flex flex-row flex-wrap items-center text-sm'>
                                        <div className='mr-2'><FontAwesomeIcon icon={faHomeLg} className='mr-1'/> <a href='/' className='hover:underline transition-all hover:text-[#0CBCDC]'> Home </a></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <a href='/games' className='hover:underline transition-all hover:text-[#0CBCDC]'> Games </a></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <span className='hover:underline transition-all hover:text-[#0CBCDC]'> Category </span></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <span className='hover:underline transition-all hover:text-[#0CBCDC]'> {filteredType} </span></div>
                                    </div>
                                    :
                                    <div className='flex flex-row flex-wrap items-center text-sm'>
                                        <div className='mr-2'><FontAwesomeIcon icon={faHomeLg} className='mr-1'/> <a href='/' className='hover:underline transition-all hover:text-[#0CBCDC]'> Home </a></div>
                                        <div className='mr-2'><FontAwesomeIcon icon={faChevronRight} className='mr-1'/> <a href='/games' className='hover:underline transition-all hover:text-[#0CBCDC]'> Games </a></div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto file:lg:px-8 relative px-0 my-10 mt-4">
                        <div className='flex sm:flex-row flex-col-reverse sm:justify-between mb-4 font-poppins'>
                            <div className='flex justify-between gap-2 items-center'>
                                <div className="relative lg:mt-0 sm:w-80 w-1/2 ">
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
                                    </span>
                                    <input value={searchKey} onChange={handleSearch} className="h-11 rounded-lg block w-full bg-[#131C31] border border-solid border-[#222F43] text-gray-100 text-sm font-normal py-2 px-4 pr-10 leading-tight focus:outline-none " type="text" placeholder='Search Games'/>
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

                        <div className='grid sm:grid-cols-3 grid-cols-1 gap-5 place-content-start mt-8 font-poppins'>
                            <div className='col-span-2'>
                            {
                                message.length > 0 ?
                                    <div
                                        className="relative bg-cover bg-center py-12 bg-[#131C31] border border-solid border-[#222F43] text-gray-100 font-poppins"
                                    >   
                                        <div className={`${styles.marginX} ${styles.flexCenter}`}>
                                            <div className={`${styles.boxWidthEx}`}>
                                                <div className="flex flex-col justify-center items-center ">
                                                    <h1 className="text-3xl font-semibold mb-4 text-center">{message}</h1>
                                                    <p className="text-base text-center">Looks like there is no uploads at the moment.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                :
                                games && games.length > 0 ?
                                <>
                                <div className="grid md:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-3 place-content-start mt-4">
                                    {
                                        games.slice(startIndex, endIndex).map((item, index) => {
                                            return (
                                                <GamesCards  
                                                    key={index}
                                                    id={item._id}
                                                    heading={item.title} 
                                                    image={item.featured_image} 
                                                    downloads={item.download_count}
                                                    category={item.category ? item.category : 'No Category'} 
                                                    uploader={item.user.username} 
                                                    ratings={item.ratings}
                                                    download_links={item.download_link}
                                                />
                                            )
                                        })
                                    }
                                </div>

                                {
                                    games && games.length > 0 &&
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
                                {/* <div className='flex items-center justify-center mt-8'>
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
                                </div> */}
                                </>
                                :
                                ((searchKey && games.length === 0 && game?.length > 0) || (filteredType && games.length === 0 && game?.length > 0)) ?
                                <div
                                    className="relative bg-cover bg-center py-12 bg-[#131C31] border border-solid border-[#222F43] text-gray-100 font-poppins"
                                >   
                                    <div className={`${styles.marginX} ${styles.flexCenter}`}>
                                        <div className={`${styles.boxWidthEx}`}>
                                            <div className="flex flex-col justify-center items-center ">
                                                <h1 className="text-3xl font-semibold mb-4 text-center">No Games Found</h1>
                                                <p className="text-base text-center">Looks like there is no uploads at the moment.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                :
                                !searchKey && (
                                    <div className='h-96 flex items-center justify-center'>
                                        <div className='flex flex-col items-center justify-center'>
                                            <img className="w-16" src={loading} />
                                            <p className='text-white font-semibold text-lg mt-2'>Loading Data</p>
                                        </div>
                                    </div>
                                )
                            }
                            </div>
                            <div className='sm:px-2 flex flex-col gap-8'>
                                <div className='transition-all p-4 py-5 text-sm rounded-lg bg-[#131C31] border border-solid border-[#222F43] text-gray-100 font-poppins'>
                                    <h2 className='text-xl font-semibold mb-2 text-[#0DBFDC]'>Categories</h2>
                                    <hr className='border-[1.8px] border-[#0DBFDC] mb-6 w-1/3'/>

                                    <div className='flex flex-col gap-2 mb-4'>
                                        {
                                            categoriesList?.length > 0 &&
                                            categoriesList.map((item, index) => {
                                                return (
                                                    <button onClick={() => handleFilteredChange(item.category)} key={index} className='flex justify-between items-center cursor-pointer transition-all p-4 py-3 text-sm rounded-lg border border-solid border-[#222F43] text-gray-100 hover:text-[#0DBFDC]'>
                                                        <span style={{color: filteredType === item.category && '#FFD700'}}>
                                                            {/* <FontAwesomeIcon icon={['fas', item.icon]} className='mr-2'/> */}
                                                            {item.category}
                                                        </span>

                                                        <p className='bg-[#222F43] px-3 py-1 rounded-full text-xs'>{item.count}</p>
                                                    </button>
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
        </div>
    )
}

export default Games