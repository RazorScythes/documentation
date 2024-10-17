import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const divideAndScale = (ratings) => {
    const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / ratings.length;

    return averageRating.toFixed(1)
}

const GameViewModal = ({ gameModal, setGameModal, data }) => {

    const [rating, setRating] = useState(0);
    const [fixedRating, setFixedRating] = useState(0)
    const [ratingNumber, setRatingNumber] = useState(0)

    const closeModal = () => {
        setGameModal(false)
    }

    useEffect(() => {
        if(data?.ratings) {
            setFixedRating(data.ratings ? divideAndScale(data.ratings) : 0)
            setRatingNumber(data.ratings ? divideAndScale(data.ratings) : 0)
        }
    }, [data])

    return (
        <>
            {/* Backdrop */}
            {gameModal && (
                <div className="fixed inset-0 bg-black opacity-90 z-40"></div>
            )}
            {
                gameModal && (
                    <div
                        className="scrollbar-hide sm:w-[750px] w-full mx-auto overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                    >
                        <div className="sm:w-auto w-full border-0 rounded-lg shadow-lg relative flex flex-col bg-white outline-none focus:outline-none">
                            {/*content*/}
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-transparent outline-none focus:outline-none">
                                {/*header*/}
                                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                                    <h3 className="text-2xl font-semibold">
                                        Game Details
                                    </h3>
                                    <button
                                        className="bg-transparent border-0 text-black float-right text-2xl leading-none font-semibold outline-none focus:outline-none"
                                        onClick={() => closeModal()}
                                    >
                                        <span className="bg-transparent text-black h-6 w-6 text-2xl block outline-none focus:outline-none">
                                            ×
                                        </span>
                                    </button>
                                </div>
                                {/*body*/}
                                <div className="p-4 pb-8">
                                    <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
                                        <img
                                            src={data.featured_image}
                                            alt="Featured Image"
                                            className='object-cover w-full border-gray-600 border-2 rounded-md'
                                        />
                                        <div className='my-2'>
                                            <div className='flex mb-2'>
                                                { data.privacy && <p title="privacy" className='cursor-pointer bg-red-600 py-1 px-4 text-gray-100 font-semibold text-sm rounded-md mr-2'>Private</p> }
                                                { data.strict && <p title="safe content" className='cursor-pointer bg-red-600 py-1 px-4 text-gray-100 font-semibold text-sm rounded-md mr-2'>Strict</p> }
                                                { data.password && <p title="file password" className='cursor-pointer bg-blue-600 py-1 px-4 text-gray-100 font-semibold text-sm rounded-md'>{data.password}</p> }
                                            </div>

                                            <h2 className='text-3xl font-semibold'>{data.title}</h2>
                                            <p className='whitespace-pre-wrap'><span className='font-semibold'>Developer</span>: {data.details.developer}</p>
                                            <hr className='my-1 mb-2'/>                                   
                                            
                                            <div className='grid grid-cols-3 gap-5 place-content-start mt-4'>
                                                <p className='whitespace-pre-wrap font-bold'>Language</p><span className='col-span-2'>: {data.details.language}</span>
                                            </div>
                                            <div className='grid grid-cols-3 gap-5 place-content-start mt-1'>
                                                <p className='whitespace-pre-wrap font-bold'>Version</p><span className='col-span-2'>: {data.details.latest_version}</span>
                                            </div>
                                            <div className='grid grid-cols-3 gap-5 place-content-start mt-1'>
                                                <p className='whitespace-pre-wrap font-bold'>Uploaded</p><span className='col-span-2'>: {data.details.upload_date}</span>
                                            </div>
                                            <div className='grid grid-cols-3 gap-5 place-content-start mt-1'>
                                                <p className='whitespace-pre-wrap font-bold'>Platform</p><span className='col-span-2'>: {data.details.platform}</span>
                                            </div>
                                            <div className='grid grid-cols-3 gap-5 place-content-start mt-1'>
                                                <p className='whitespace-pre-wrap font-bold'>Censorhip</p><span className='col-span-2'>: {data.details.censorship}</span>
                                            </div>
                                            <div className='grid grid-cols-3 gap-5 place-content-start mt-1'>
                                                <p className='whitespace-pre-wrap font-bold'>Downloaded</p><span className='col-span-2'>: {data.download_count?.length > 0 ? data.download_count.length : 0}</span>
                                            </div>
                                            <div className='grid grid-cols-3 gap-5 place-content-start mt-1'>
                                                <p className='whitespace-pre-wrap font-bold'>Ratings:</p>
                                            </div>
                                            <div className="flex items-center star-rating">
                                                {[...Array(5)].map((_, index) => ( 
                                                    <span
                                                        key={index}
                                                        className={`relative star ${fixedRating >= index + 1 ? 'filled' : rating >= index + 1 ? 'filled' : ''} ${
                                                            fixedRating === index + 0.5 ? 'half-filled' : rating === index + 0.5 ? 'half-filled' : ''
                                                        }`}
                                                    >
                                                        &#9733;
                                                    </span>
                                                ))}
                                                <span className='ml-1'>({ratingNumber})</span>
                                            </div>
                                            <p className='mt-1 whitespace-pre-wrap'><span className='font-bold'>Tags</span>:</p>
                                            <div className='flex flex-wrap items-center mt-2 mb-4 relative'>
                                                {
                                                    data.tags && data.tags.length > 0 &&
                                                        data.tags.map((item, index) => {
                                                            return (
                                                                <div key={index} className='mt-1 flex items-center relative bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] border border-[#CAD5DF] px-4 py-1 mr-2 xs:text-sm text-sm font-semibold transition-all capitalize'>
                                                                    <p>{item}</p>  
                                                                </div>  
                                                            )
                                                    })
                                                }
                                                {
                                                    !(data.tags && data.tags.length > 0) &&
                                                    <p className='mt-1 whitespace-pre-wrap'>No tags to show</p>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <p className='whitespace-pre-wrap font-bold text-2xl mb-2'>Description</p>
                                    <p className='whitespace-pre-wrap'>{data.description}</p>
                                    
                                    <p className='whitespace-pre-wrap font-bold text-2xl mt-4 mb-2'>Gallery</p>
                                    <div className='flex flex-wrap'>
                                        {
                                            data.gallery && data.gallery.length > 0 &&
                                                data.gallery.map((item, index) => {
                                                    return (
                                                        <div key={index} className='sm:w-1/3 xs:w-1/2 w-full h-[200px] overflow-hidden'>
                                                            <img 
                                                                src={item}
                                                                alt={`gallery #${index+1}`}
                                                                className='w-full h-[200px] object-cover border border-[#CAD5DF] transition duration-500 ease-in-out transform hover:scale-105'
                                                            />
                                                        </div>  
                                                    )
                                            })
                                        }
                                    </div>
                                    {
                                        !(data.gallery && data.gallery.length > 0) &&
                                        <p className='mt-1 whitespace-pre-wrap'>No image to show</p>
                                    }
                                    <p className='whitespace-pre-wrap font-bold text-2xl mt-4 mb-2'>Download Links</p>

                                    {
                                        data.download_link && data.download_link.length > 0 &&
                                            data.download_link.map((item, index) => {
                                                return (
                                                    <div key={index}>
                                                        {
                                                            item.links.length > 0 &&
                                                            <>
                                                                <p className='whitespace-pre-wrap font-semibold text-xl mt-4 mb-2'>{item.storage_name} ({item.links.length > 0 ? item.links.length : 0})</p>
                                                                {
                                                                    item.links && item.links.length > 0 &&
                                                                        item.links.map((link, i) => {
                                                                            return (
                                                                                <div className='flex justify-between py-1'>
                                                                                    <p className='whitespace-pre-wrap font-semibold break-all w-4/5'> - {link}</p>
                                                                                    <a key={i} href={link} target="_blank" className='cursor-pointer sm:block hidden'><FontAwesomeIcon icon={faArrowRight}/></a>
                                                                                </div>
                                                                            )
                                                                        })
                                                                }
                                                            </>
                                                        }
                                                    </div>
                                                )
                                        })
                                    }
                                    {
                                        !(data.download_link && data.download_link.length > 0) &&
                                        <p className='mt-1 whitespace-pre-wrap'>No download link to show</p>
                                    }
                                    
                                    <p className='whitespace-pre-wrap font-bold text-2xl mt-4 mb-2'>Leave Message</p>
                                    <p className='whitespace-pre-wrap mb-2'>{data.leave_uploader_message}</p>
                                    
                                    {
                                        data.guide_link && 
                                            <button title="guide" className='float-right bg-[#EAF0F7] hover:bg-gray-100  hover:text-gray-700 text-[#5A6C7F] font-semibold py-2 px-4 border border-[#CAD5DF] transition-colors duration-300 ease-in-out'>
                                                Guide Link
                                            </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default GameViewModal