import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addRatings, addRatingsRelated } from "../../actions/game";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faLinkSlash } from "@fortawesome/free-solid-svg-icons";
import { addOneDownload } from "../../actions/game";
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { MotionAnimate } from 'react-motion-animate'

const cookies = new Cookies();

const divideAndScale = (ratings) => {
    const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / ratings.length;

    return averageRating.toFixed(0) > 0 ? averageRating.toFixed(1) : 0;
    // var result = a / b;
    // var scaledResult = result % 5;
  
    // if (scaledResult <= 0) {
    //   scaledResult += 5;
    // }

    // console.log(scaledResult, Number(scaledResult.toFixed(1)))
    // return Number(scaledResult.toFixed(1));
}

const GamesCards = ({ id, heading, image, category, downloads, uploader, ratings, download_links = [], relatedGames = false }) => {

    const dispatch = useDispatch()

    const [rating, setRating] = useState(0);
    const [fixedRating, setFixedRating] = useState(0)
    const [ratingNumber, setRatingNumber] = useState(0)
    const [downloadable, setDownloadable] = useState(1)
    const [downloadLink, setDownloadLink] = useState('')

    useEffect(() => {
        setFixedRating(ratings ? divideAndScale(ratings) : 0)
        setRatingNumber(ratings ? divideAndScale(ratings) : 0)
    }, [ratings])

    useEffect(() => {
        if(download_links.length > 0) {
            var default_link = ''
            var find_link = download_links.some((link) => {
                if(link.links.length > 0) {
                    default_link = link.links[0]
                    return true
                }
            })

            if(find_link) {
                setDownloadable(false)
                setDownloadLink(default_link)
            }
        }
    }, [download_links])

    const handleMouseEnter = (index, isHalf) => {
        setRating(index + (isHalf ? 0.5 : 1));
    };

    const handleMouseLeave = () => {
        setRating(0);
    };

    const handleStarClick = (index, isHalf) => {
        const newRating = index + (isHalf ? 0.5 : 1);
        setFixedRating(newRating === fixedRating ? 0 : newRating);
        // You can add your logic here to handle the rating value
        if(relatedGames) {
            dispatch(addRatingsRelated({
                gameId: id,
                ratings: newRating === fixedRating ? 0 : newRating
            }))
        }
        else {
            dispatch(addRatings({
                gameId: id,
                ratings: newRating === fixedRating ? 0 : newRating
            }))
        }
    };

    const TextWithEllipsis = ({ text, limit = 25 }) => {
        if (text.length > limit) {
          return <span>{text.slice(0, limit)}...</span>;
        }
        return <span>{text}</span>;
    }

    const addDownloadCount = () => {
        var duplicate = false
        downloads.forEach(item => { if(cookies.get('uid') === item) duplicate = true })
        if(!duplicate) {
            dispatch(addOneDownload({
                id: cookies.get('uid'),
                gameId: id
            }))
        }
    }

    const getLastStarRating = (index) => {
        return fixedRating >= (index + 0.5) ? 'half-filled' : rating >= (index + 0.5) ? 'half-filled' : ''
    }

    return (
        <div className='xs:w-full w-full mx-auto bg-[#131C31] hover:bg-[#17213a] rounded-t-lg transition-all border border-solid border-[#222F43] text-gray-100 font-poppins relative pb-16'>
            <MotionAnimate animation='fadeInUp'>
            <img
                className='h-44 w-full object-cover rounded-t-sm'
                alt="game feature image"
                src={image}
            />
            <div className='py-2 px-4 text-gray-300'>
                <p className="text-center mb-2 text-sm w-full mr-2 bg-[#131C31] text-gray-100 py-1 px-2 border border-gray-100 rounded transition-colors duration-300 ease-in-out font-semibold">
                    {category}
                </p>
                <h2 className='text-lg font-semibold text-[#0DBFDC]'><TextWithEllipsis text={heading}/> </h2>
                <p className='text-xs text-[#94a9c9]'><span>By:</span> {uploader}</p>
                <div className="flex items-center star-rating">
                    {[...Array(5)].map((_, index) => ( 
                        <span
                            key={index}
                            className={`relative star  ${fixedRating >= index + 1 ? 'filled' : rating >= index + 1 ? 'filled' : ''} ${
                                getLastStarRating(index)
                            }`}
                            onMouseEnter={() => handleMouseEnter(index, false)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => handleStarClick(index, false)}
                        >
                            &#9733;
                        </span>
                    ))}
                    <span className='ml-1 text-sm'>({ratingNumber})</span>
                </div>
                <div className='absolute w-full px-4 bottom-2 left-0 text-sm'>
                    <div className='grid grid-cols-2 gap-2'>
                        <p className='flex items-center text-xs text-[#94a9c9]'>{downloads.length > 0 ? downloads.length : 0} Download{downloads.length > 1 && 's'}</p>
                    </div>
                    <div className='grid grid-cols-3 gap-2 mt-2'>
                        <Link to={`/games/${id}`} className='col-span-2 '>
                            <button className="text-sm w-full mr-2 bg-[#131C31] hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-2 border border-gray-100 transition-colors duration-300 ease-in-out">
                                Preview
                            </button>
                        </Link>
                        {
                            downloadable ?
                                <button title="No Download Link" disabled={true} className="disabled:bg-gray-500 disabled:cursor-no-drop text-sm w-full mr-2 bg-[#131C31] hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-2 border border-gray-100 transition-colors duration-300 ease-in-out">
                                    <FontAwesomeIcon icon={faLinkSlash} className="text-white"/>
                                </button>
                            :
                                <a href={downloadLink ? downloadLink : "#"} target='_blank'>
                                    <button onClick={() => addDownloadCount()} className="text-sm w-full mr-2 bg-[#131C31] hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-2 border border-gray-100 transition-colors duration-300 ease-in-out">
                                        <FontAwesomeIcon icon={faDownload} className="text-white"/>
                                    </button>
                                </a>
                        }
                        
                    </div>
                </div>
            </div>
            </MotionAnimate>
        </div>
        // <div className='xs:w-full w-64 mx-auto bg-gray-800 rounded-sm shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)]'>
        //     <img
        //         className='h-44 w-full object-cover rounded-t-sm'
        //         alt="game feature image"
        //         src={image}
        //     />
        //     <div className='py-2 px-4 text-gray-300'>
        //         <p className="text-center mb-2 text-sm w-full mr-2 bg-gray-700 text-gray-100 py-1 px-2 border border-gray-100 rounded transition-colors duration-300 ease-in-out">
        //             {category}
        //         </p>
        //         <h2 className='text-lg  font-semibold'><TextWithEllipsis text={heading}/> </h2>
        //         <p className='text-xs text-gray-400'><strong>By:</strong> {uploader}</p>
        //         <div className="flex items-center star-rating">
        //             {[...Array(5)].map((_, index) => ( 
        //                 <span
        //                     key={index}
        //                     className={`relative star ${fixedRating >= index + 1 ? 'filled' : rating >= index + 1 ? 'filled' : ''} ${
        //                         fixedRating === index + 0.5 ? 'half-filled' : rating === index + 0.5 ? 'half-filled' : ''
        //                     }`}
        //                     onMouseEnter={() => handleMouseEnter(index, false)}
        //                     onMouseLeave={handleMouseLeave}
        //                     onClick={() => handleStarClick(index, false)}
        //                 >
        //                     &#9733;
        //                 </span>
        //             ))}
        //             <span className='ml-1'>({ratingNumber})</span>
        //         </div>
        //         <div className='grid grid-cols-2 gap-2 mt-2'>
        //             <p className='flex items-center text-sm'>{downloads.length > 0 ? downloads.length : 0} Download{downloads.length > 1 && 's'}</p>
        //         </div>
        //         <div className='grid grid-cols-3 gap-2 mt-2'>
        //             <Link to={`/games/${id}`} className='col-span-2 '>
        //                 <button className="sm:text-base text-sm w-full mr-2 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-2 border border-gray-100 transition-colors duration-300 ease-in-out">
        //                     Preview
        //                 </button>
        //             </Link>
        //             {
        //                 downloadable ?
        //                     <button title="No Download Link" disabled={true} className="disabled:bg-gray-500 disabled:cursor-no-drop sm:text-base text-sm w-full mr-2 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-2 border border-gray-100 transition-colors duration-300 ease-in-out">
        //                         <FontAwesomeIcon icon={faLinkSlash} className="text-white"/>
        //                     </button>
        //                 :
        //                     <a href={downloadLink ? downloadLink : "#"} target='_blank'>
        //                         <button onClick={() => addDownloadCount()} className="sm:text-base text-sm w-full mr-2 bg-gray-800 hover:bg-transparent hover:text-gray-100 text-gray-100 py-1 px-2 border border-gray-100 transition-colors duration-300 ease-in-out">
        //                             <FontAwesomeIcon icon={faDownload} className="text-white"/>
        //                         </button>
        //                     </a>
        //             }
                    
        //         </div>
        //     </div>
        // </div>
    )
}

export default GamesCards