import React from 'react'
import styles from "../style";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { TextWithLines } from './index'
import { toram_online, genshin_impact, minecraft, tower_of_fantasy, watching_video, image_not_found } from '../assets';

const Service = ({ heading3 = "Heading 3", heading2 = "Heading 2", description = "description", button_text = "View More", button_link = "#", data = [], reverse = false, icon_reverse = false }) => {
  return (
    <div className='md:my-8 my-0 relative'>
        <div className="bg-transparent absolute w-full top-1/2 -translate-y-1/2">
            <div className="h-96 relative">
            <div className="absolute top-0 bg-[#111227] transform -skew-y-3 w-full h-full shadow-[21px_-21px_1px_1px_#111221,-21px_21px_1px_1px_#111221]"></div>
            </div>
        </div>
        <div className={`${styles.paddingX} ${styles.flexStart} relative z-10`}>
            <div className={`${styles.boxWidth}`}>
                <section className={`container mx-auto py-8 h-full`}>
                    <div className="flex flex-col md:flex-row">
                    {
                            reverse === true &&
                                <div className="w-full md:w-1/2 p-4 ">
                                    {
                                        data.length > 1 ?
                                            <>
                                                <div className="flex items-center flex-wrap justify-center">
                                                    {data.map((image, index) => (
                                                        <div className="relative md:w-3/6 md:h-52 sm:w-1/2 sm:h-[250px] xs:h-full w-full h-full transition duration-500 ease-in-out transform hover:scale-105">
                                                            <img
                                                                className="object-cover w-full h-full"
                                                                src={image.src}
                                                                alt={image.alt}
                                                            />
                                                            <div className="absolute inset-0 border-2 border-gray-900"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        : 
                                        data.length > 0 ?
                                            <>
                                                <div className='w-full'>
                                                    <img
                                                        className="object-cover mx-auto w-full h-full"
                                                        src={data[0].src}
                                                        alt={data[0].alt}
                                                    />
                                                </div>
                                            </> 
                                        :
                                            <>
                                                <div className='w-full'>
                                                    <img
                                                        className="object-cover mx-auto w-full h-full"
                                                        src={image_not_found}
                                                        alt={"Image not Found"}
                                                    />
                                                </div>
                                            </> 
                                    }
                                </div>
                        }

                        <div className="w-full md:w-1/2">
                            <div className={`w-full bg-[#1F2937] h:auto px-4 py-4 relative font-poppins bg-gray-800 rounded-md md:top-1/2 md:-translate-y-1/2`} >
                                <div className="flex flex-col items-start md:p-8 p-2 md:py-12 py-4">
                                    <div>
                                        <TextWithLines text={ heading3 } height={2} bold={false} />
                                        <h3 className="md:text-4xl text-3xl font-semibold text-white uppercase mt-4 leading-10">{ heading2 }</h3>
                                        <p className="text-md font-normal leading-relaxed text-[#A0A7AB] mt-4">{ description }</p>
                                        <button className="bg-gray-100 hover:bg-transparent hover:text-gray-100 text-gray-800 font-semibold mt-8 py-2 px-8 border border-gray-100 rounded transition-colors duration-300 ease-in-out" onClick={() => loginWithRedirect()}>
                                           <a href={ button_link }> 
                                                { icon_reverse == true && <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> }
                                                { button_text } 
                                                { icon_reverse == false && <FontAwesomeIcon icon={faArrowRight} className="ml-2" /> }
                                           </a>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {
                            reverse === false &&
                                <div className="w-full md:w-1/2 p-4 flex justify-center items-center">
                                    {
                                        data.length > 1 ?
                                            <>
                                                <div className="flex justify-center items-center flex-wrap">
                                                    {data.map((image, index) => (
                                                        <div key={index} className="relative md:w-3/6 md:h-52 sm:w-1/2 sm:h-[250px] xs:h-full w-full h-full transition duration-500 ease-in-out transform hover:scale-105">
                                                            <img
                                                                className="object-cover w-full h-full"
                                                                src={image.src}
                                                                alt={image.alt}
                                                            />
                                                            <div className="absolute inset-0 border-2 border-gray-900"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        :
                                        data.length > 0 ?
                                            <>
                                                <div className='w-full'>
                                                    <img
                                                        className="object-cover mx-auto w-full h-full"
                                                        src={data[0].src}
                                                        alt={data[0].alt}
                                                    />
                                                </div>
                                            </> 
                                        :
                                            <>
                                                <div className='w-full'>
                                                    <img
                                                        className="object-cover mx-auto w-full h-full"
                                                        src={image_not_found}
                                                        alt={"Image not Found"}
                                                    />
                                                </div>
                                            </> 
                                    }
                                </div>
                        }
                    </div>
                </section>
            </div>
        </div>
    </div>
  )
}

export default Service