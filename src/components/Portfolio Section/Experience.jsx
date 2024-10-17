import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { convertDriveImageLink } from '../Tools'
import styles from "../../style";

const Experience = ({ experience }) => {

    const [experienceData, setExperienceData] = useState([])

    useEffect(() => {
        setExperienceData(experience ? experience : [])
    }, [experience])

    const getDomainName = (url) => {
        const pattern = /^(https?:\/\/)?(.+)/i;
        const domain = url.replace(pattern, '$2');
        return domain.replace(/\/.*$/, '');
    }
    
    return (
        <div
            className="relative bg-cover bg-center py-14 mt-20"
        //   style={{ backgroundImage: `url(${heroBackgroundImage})` }}
            style={{ backgroundColor: "#111827" }}
        >   
            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="absolute inset-0 "></div>
                    <div className="container mx-auto file:lg:px-8 relative px-0">
                        <div className="w-full md:flex flex-col items-center justify-center text-white">
                            <div className="md:w-1/2 w-full text-center md:m-8">
                                <h2 className='md:text-5xl text-4xl font-bold mb-8'>My Work Experience</h2>
                                <p className='text-lg text-[#E1DEF7] md:pb-4 pb-8'>My professional career has provided me with valuable knowledge and skills from working with various companies.  I am eager to continue building on these experiences as I pursue new opportunities.</p>
                            </div>
                            <div className="w-full flex flex-col justify-center mb-12">
                                {
                                    experienceData.length > 0 &&
                                        experienceData.map((item, i) => {
                                            return (
                                                <div className="relative my-2" key={i} >
                                                    {
                                                        item.image_overlay &&
                                                        <>
                                                            <div style={{ backgroundImage: `url(${item.image_overlay})` }} className="absolute inset-0 opacity-80 rounded-md bg-cover bg-center"></div>
                                                            <div className="absolute inset-0 bg-black opacity-75 rounded-md"></div>
                                                        </>
                                                    }
                                                    <div 
                                                        key={i}
                                                        className="w-full relative md:h-24 h-full bg-cover bg-center hover:border-gray-600 border border-solid rounded-md border-transparent transition-all ease-in-out delay-50 lg:p-16 md:p-16 sm:p-8 ss:p-8 p-4 flex sm:flex-row flex-col items-center sm:justify-evenly justify-center"
                                                    >   
                                                        <h2 className="sm:w-1/2 lg:text-3xl sm:text-xl text-2xl font-bold">{item.year_start.split('-')[0]}-{item.year_end.split('-')[0]}</h2>
                                                        <div className="sm:w-1/3 text-center">
                                                            <img
                                                                src={convertDriveImageLink(item.company_logo)}
                                                                className="lg:w-16 lg:h-16 sm:w-12 sm:h-12 w-16 h-16 sm:my-4 my-4 rounded-lg bg-cover bg-center border border-solid border-white object-cover"
                                                            />
                                                        </div>
                                                        <div className="sm:w-2/3 sm:text-left text-center sm:mb-0 mb-8">
                                                            <h2 className="lg:text-2xl sm:text-lg text-2xl font-bold">{item.position}</h2>
                                                            <p className="text-[#CD3242] font-semibold md:flex md:flex-row">{item.company_name} <span className="text-blue-300 font-normal md:ml-2 m-0"> ({item.remote_work ? "remote" : "onsite"})</span></p>
                                                            <p className="text-white font-semibold">{item.company_location}</p>
                                                        </div>
                                                        <a 
                                                            target="_blank"
                                                            href={`https://${getDomainName(item.link)}`} 
                                                            className="sm:w-1/2 sm:text-right md:text-base lg:text-xl sm:text-base text-base font-poppins font-semibold transition-all ease-in-out delay-50 hover:text-[#CD3242] self-center"
                                                        >
                                                                <FontAwesomeIcon icon={faArrowRight} className="mr-4"/>
                                                                Goto Website
                                                        </a>
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
    );
}

export default Experience