import React from 'react'
import styles from "../style";
import Carousel from "react-multi-carousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "react-multi-carousel/lib/styles.css";
import { Banner } from '../components/index'
import { banner_bg } from '../assets';
import Avatar from '../assets/avatar.webp'


const CustomRight = ({ onClick }) => {

  return (
    <FontAwesomeIcon
      icon={faChevronRight}
      onClick={onClick}
      className="absolute md:right-0 right-8 max-w-4 cursor-pointer text-primary-400 text-lg"
    />
  )
};

const CustomLeft = ({ onClick }) => {
  return (
    <FontAwesomeIcon
      icon={faChevronLeft}
      onClick={onClick}
      className="absolute md:left-0 left-8 max-w-4 cursor-pointer text-primary-400 text-lg"
    />
  )
};

const items = [
    {
      title: 'Item 1',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      imageUrl: 'https://picsum.photos/id/1018/400/300',
    },
    {
        title: 'Item 1',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        imageUrl: 'https://picsum.photos/id/1018/400/300',
      },
      {
        title: 'Item 1',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        imageUrl: 'https://picsum.photos/id/1018/400/300',
      },
      {
        title: 'Item 1',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        imageUrl: 'https://picsum.photos/id/1018/400/300',
      },
      {
        title: 'Item 1',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        imageUrl: 'https://picsum.photos/id/1018/400/300',
      },
      {
        title: 'Item 1',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        imageUrl: 'https://picsum.photos/id/1018/400/300',
      },
      {
        title: 'Item 1',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        imageUrl: 'https://picsum.photos/id/1018/400/300',
      },
]

const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1224 },
      items: 5
    },
    laptop: {
      breakpoint: { max: 1224, min: 890 },
      items: 4
    },
    tablet: {
      breakpoint: { max: 890, min: 464 },
      items: 3
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
};

const Users = () => {
  return (
    <div className='md:my-8 my-0 relative pt-[50px] pb-0'>
        <div className={`md:mx-12 ${styles.flexStart} relative z-10`}>
            <div className={`${styles.boxWidth}`}>
                <section className={`mx-auto py-8 md:px-4 h-full font-poppins`}>
                        <div className='text-white text-center pt-24'>
                            <p className='uppercase text-center font-semibold md:text-lg text-base text-[#E1DEF7] pb-4'>DON'T miss out on upcoming events</p>
                            <h2 className='md:text-6xl text-5xl font-bold'><span className='text-[#CD3242]'>ACTIVE</span> USERS</h2>
                            <Carousel 
                                showDots={true}
                                responsive={responsive} className="mt-24 relative"
                                customLeftArrow={<CustomLeft />}
                                customRightArrow={<CustomRight />}
                                slidesToSlide={1}
                                swipeable
                                autoPlay={true}
                                infinite={true}
                            >
                                <div className='w-56 mx-auto border-2 border-solid border-gray-700 flex flex-col justify-center p-8 mb-12 bg-[#1F2937] rounded-md'>
                                  <img
                                      src={Avatar}
                                      alt="User"
                                      className='rounded-full border-2 border-solid border-white p-1 w-24 mx-auto mb-8 transition duration-500 ease-in-out transform hover:scale-105'
                                  />
                                  <p className='pb-1'>RazorScythe</p>
                                  <p className='font-semibold text-[#CD3242] pb-6'>Gamer</p>
                                  <button className="bg-[#0275d8] hover:bg-transparent hover:text-white text-white font-normal ml-2 text-sm py-2 px-4 border hover:border-white border-[#0275d8] rounded transition-colors duration-300 ease-in-out">
                                      View Profile
                                  </button>
                                </div>
                                <div className='w-56 mx-auto border-2 border-solid border-gray-700 flex flex-col justify-center p-8 bg-[#1F2937] rounded-md'>
                                  <img
                                      src={Avatar}
                                      alt="User"
                                      className='rounded-full border-2 border-solid border-white p-1 w-24 mx-auto mb-8 transition duration-500 ease-in-out transform hover:scale-105'
                                  />
                                  <p className='pb-1'>RazorScythe</p>
                                  <p className='font-semibold text-[#CD3242] pb-6'>Gamer</p>
                                  <button className="bg-[#0275d8] hover:bg-transparent hover:text-white text-white font-normal ml-2 text-sm py-2 px-4 border hover:border-white border-[#0275d8] rounded transition-colors duration-300 ease-in-out">
                                      View Profile
                                  </button>
                                </div>
                                <div className='w-56 mx-auto border-2 border-solid border-gray-700 flex flex-col justify-center p-8 bg-[#1F2937] rounded-md'>
                                  <img
                                      src={Avatar}
                                      alt="User"
                                      className='rounded-full border-2 border-solid border-white p-1 w-24 mx-auto mb-8 transition duration-500 ease-in-out transform hover:scale-105'
                                  />
                                  <p className='pb-1'>RazorScythe</p>
                                  <p className='font-semibold text-[#CD3242] pb-6'>Gamer</p>
                                  <button className="bg-[#0275d8] hover:bg-transparent hover:text-white text-white font-normal ml-2 text-sm py-2 px-4 border hover:border-white border-[#0275d8] rounded transition-colors duration-300 ease-in-out">
                                      View Profile
                                  </button>
                                </div>
                                <div className='w-56 mx-auto border-2 border-solid border-gray-700 flex flex-col justify-center p-8 bg-[#1F2937] rounded-md'>
                                  <img
                                      src={Avatar}
                                      alt="User"
                                      className='rounded-full border-2 border-solid border-white p-1 w-24 mx-auto mb-8 transition duration-500 ease-in-out transform hover:scale-105'
                                  />
                                  <p className='pb-1'>RazorScythe</p>
                                  <p className='font-semibold text-[#CD3242] pb-6'>Gamer</p>
                                  <button className="bg-[#0275d8] hover:bg-transparent hover:text-white text-white font-normal ml-2 text-sm py-2 px-4 border hover:border-white border-[#0275d8] rounded transition-colors duration-300 ease-in-out">
                                      View Profile
                                  </button>
                                </div>
                                <div className='w-56 mx-auto border-2 border-solid border-gray-700 flex flex-col justify-center p-8 bg-[#1F2937] rounded-md'>
                                  <img
                                      src={Avatar}
                                      alt="User"
                                      className='rounded-full border-2 border-solid border-white p-1 w-24 mx-auto mb-8 transition duration-500 ease-in-out transform hover:scale-105'
                                  />
                                  <p className='pb-1'>RazorScythe</p>
                                  <p className='font-semibold text-[#CD3242] pb-6'>Gamer</p>
                                  <button className="bg-[#0275d8] hover:bg-transparent hover:text-white text-white font-normal ml-2 text-sm py-2 px-4 border hover:border-white border-[#0275d8] rounded transition-colors duration-300 ease-in-out">
                                      View Profile
                                  </button>
                                </div>
                                <div className='w-56 mx-auto border-2 border-solid border-gray-700 flex flex-col justify-center p-8 bg-[#1F2937] rounded-md'>
                                  <img
                                      src={Avatar}
                                      alt="User"
                                      className='rounded-full border-2 border-solid border-white p-1 w-24 mx-auto mb-8 transition duration-500 ease-in-out transform hover:scale-105'
                                  />
                                  <p className='pb-1'>RazorScythe</p>
                                  <p className='font-semibold text-[#CD3242] pb-6'>Gamer</p>
                                  <button className="bg-[#0275d8] hover:bg-transparent hover:text-white text-white font-normal ml-2 text-sm py-2 px-4 border hover:border-white border-[#0275d8] rounded transition-colors duration-300 ease-in-out">
                                      View Profile
                                  </button>
                                </div>
                                <div className='w-56 mx-auto border-2 border-solid border-gray-700 flex flex-col justify-center p-8 bg-[#1F2937] rounded-md'>
                                  <img
                                      src={Avatar}
                                      alt="User"
                                      className='rounded-full border-2 border-solid border-white p-1 w-24 mx-auto mb-8 transition duration-500 ease-in-out transform hover:scale-105'
                                  />
                                  <p className='pb-1'>RazorScythe</p>
                                  <p className='font-semibold text-[#CD3242] pb-6'>Gamer</p>
                                  <button className="bg-[#0275d8] hover:bg-transparent hover:text-white text-white font-normal ml-2 text-sm py-2 px-4 border hover:border-white border-[#0275d8] rounded transition-colors duration-300 ease-in-out">
                                      View Profile
                                  </button>
                                </div>
                            </Carousel>
                        </div>
                </section>
            </div>
        </div>
        <div className={`${styles.marginX} ${styles.flexStart} relative z-10`}>
          <div className={`${styles.boxWidth}`}>
            <section className={`container mx-auto py-8 md:px-4 h-full font-poppins`}>
              <Banner
                  heading = "keep training" 
                  description = "take part in exciting events" 
                  background_image = {banner_bg}
                  overlay_rgb_color = "103,87,214" 
                  button_text = "View Events"
                  button_link = "#"
                  reverse = {true}
              />
            </section>
          </div>
        </div>
    </div>
  )
}

export default Users