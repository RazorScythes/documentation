import React, { useState, useEffect } from "react";
import herobg from '../../assets/hero-bg.jpg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { convertDriveImageLink } from '../Tools'
import { faCircleCheck, faCalendar, faSitemap, faArrowRight, faGamepad, faChevronLeft, faChevronRight, faBriefcase } from "@fortawesome/free-solid-svg-icons";
import styles from "../../style";
import Carousel from "react-multi-carousel";
import { Link, useParams } from 'react-router-dom'
import Avatar from '../../assets/avatar.webp'
import { portfolio1 } from "../../assets";

const CustomRight = ({ onClick }) => {
    return (
      <FontAwesomeIcon
        icon={faChevronRight}
        onClick={onClick}
        className="absolute bottom-0 left-24 right-0 mx-auto w-4 border border-solid border-white p-4 rounded-full hover:text-white hover:border-[#CD3242] hover:bg-[#CD3242] transition-all cursor-pointer text-primary-400 text-lg"
      />
    )
};
  
const CustomLeft = ({ onClick }) => {
    return (
      <FontAwesomeIcon
        icon={faChevronLeft}
        onClick={onClick}
        className="absolute bottom-0 left-0 right-24 mx-auto w-4 border border-solid border-white p-4 rounded-full hover:text-white hover:border-[#CD3242] hover:bg-[#CD3242] transition-all cursor-pointer text-primary-400 text-lg"
      />
    )
};

const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1224 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 1224, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
};

const Projects = ({ projects }) => {

    let { username } = useParams();

    const [projectsData, setProjectsData] = useState([])

    useEffect(() => {
        setProjectsData(projects ? projects : [])
    }, [projects])

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
                        <div className="w-full sm:flex flex-row justify-start sm:text-left text-center text-white">
                            <div className="sm:w-1/2 w-full">
                                <h2 className='md:text-5xl text-4xl font-bold mb-8'>Recent Work</h2>
                                <p className='text-lg text-[#E1DEF7] md:pb-4 pb-8'>My work has been improving over time, and I consider the ability to track and maintain progress as an essential addition to my skillset.</p>
                            </div>
                            <div className="sm:w-1/2 w-full flex items-center sm:justify-end justify-center">
                                <div className="p-2 border border-dashed border-gray-700 rounded-full">
                                    <div className="p-6 bg-gray-800 rounded-full">
                                        <FontAwesomeIcon icon={faBriefcase} className="w-16 h-16 text-[#00FFFF]"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-white font-poppins">
                        <Carousel 
                                responsive={responsive} className="mt-24 relative pb-16"
                                customLeftArrow={<CustomLeft />}
                                customRightArrow={<CustomRight />}
                                slidesToSlide={1}
                                swipeable
                                autoPlay={true}
                                infinite={true}
                            >   
                                {
                                    projectsData.length > 0 &&
                                        projectsData.map((item, i) => {
                                            return (
                                                <div key={i} className='w-11/12 mx-4 flex flex-col justify-center mb-12 rounded-md'>
                                                    <div className="overflow-hidden relative">
                                                        <div className="bg-black opacity-80 transition-all hover:opacity-100">
                                                            <img
                                                                src={convertDriveImageLink(item.image)}
                                                                alt="User"
                                                                className='relative w-full h-[400px] object-cover mb-8 transition duration-500 ease-in-out transform hover:scale-105 border border-1 border-gray-700 rounded-sm'
                                                            />
                                                        </div>
                                                    </div>
                                                    <Link to={`/${username}/project/${item.project_name.split(/[\/\s]+/).join("_")}`}><h2 className='pb-2 text-2xl font-semibold hover:text-[#CD3242] hover:cursor-pointer transition-all'>{item.project_name}</h2></Link>
                                                    <p className='pb-6 text-[#d8d8d8] text-sm'>{item.category}</p>
                                                </div>
                                            )
                                        })
                                }
                            </Carousel>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Projects