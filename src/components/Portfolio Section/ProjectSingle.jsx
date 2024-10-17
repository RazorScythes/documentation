import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from 'react-redux'
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useParams } from 'react-router-dom'
import { Page_not_found, Error_forbiden } from '../../assets';
import { getProject, clearProjectSingle } from "../../actions/portfolio";
import { convertDriveImageLink } from '../Tools'
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import Carousel from "react-multi-carousel";
import Loading from '../Pages/Loading'
import styles from "../../style";
import "react-multi-carousel/lib/styles.css";

library.add(fas, far, fab);

const CustomRight = ({ onClick }) => {

  return (
    <FontAwesomeIcon
      icon={faChevronRight}
      onClick={onClick}
      className="absolute sm:right-0 right-4 max-w-4 cursor-pointer text-primary-400 text-lg text-white"
    />
  )
};

const CustomLeft = ({ onClick }) => {
  return (
    <FontAwesomeIcon
      icon={faChevronLeft}
      onClick={onClick}
      className="absolute sm:left-0 left-4 max-w-4 cursor-pointer text-primary-400 text-lg text-white"
    />
  )
};

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1224 },
    items: 1
  },
  laptop: {
    breakpoint: { max: 1224, min: 890 },
    items: 1
  },
  tablet: {
    breakpoint: { max: 890, min: 464 },
    items: 1
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
};

const ProjectSingle = () => {

  const dispatch = useDispatch()

  let { username, project_name } = useParams()

  const portfolio = useSelector((state) => state.portfolio.project)
  const notFound = useSelector((state) => state.portfolio.notFound)
  const published = useSelector((state) => state.portfolio.published)
  console.log(portfolio)
  useEffect(() => {
    window.scrollTo(0, 0)
    dispatch(clearProjectSingle())

    dispatch(getProject({
      username: username,
      project_name: project_name
    }))
  }, [])


  const diffInMonths = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);

    const result = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth())

    return result + ' months'
  }

  return (
    <div>
        {
          notFound ?
          <div
              className="relative bg-cover bg-center py-20"
              style={{ backgroundColor: "#111827" }}
          >   
              <div className={`${styles.marginX} ${styles.flexCenter}`}>
                  <div className={`${styles.boxWidthEx}`}>
                      <div className="flex flex-col justify-center items-center">
                          <img
                              src={Page_not_found}
                              alt="404 Error - Project Not Found"
                              className="md:w-[550px] w-96 h-auto mb-8"
                          />
                          <h1 className="text-white text-4xl font-bold mb-4">Project not Found</h1>
                          <p className="text-white text-lg mb-8">The project you are looking for does not exist, or you may have mistyped the data you are looking for.</p>
                          <a href="/" className="text-white underline hover:text-gray-200">Go back to home page</a>
                      </div>
                  </div>
              </div>
          </div>
          :
          published ?
          <div
              className="relative bg-cover bg-center py-20"
              style={{ backgroundColor: "#111827" }}
          >   
              <div className={`${styles.marginX} ${styles.flexCenter}`}>
                  <div className={`${styles.boxWidthEx}`}>
                      <div className="flex flex-col justify-center items-center text-center">
                          <img
                              src={Error_forbiden}
                              alt="404 Error - Page Not Found"
                              className="md:w-[550px] w-96 h-auto mb-8"
                          />
                          <h1 className="text-white sm:text-4xl text-2xl font-bold mb-4">Project is not Accessible</h1>
                          <p className="text-white text-lg mb-8">Looks like the owner has not been published his/her portfolio or haven't updated it for a while now.</p>
                          <a href="/" className="text-white underline hover:text-gray-200">Go back to home page</a>
                      </div>
                  </div>
              </div>
          </div>
          :
          Object.keys(portfolio).length !== 0 ?
          <div
              className="relative bg-cover bg-center py-14"
              style={{ backgroundColor: "#111221" }}
          >   
            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                  <div className="container mx-auto file:lg:px-8 relative px-0">
                      <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start text-white md:px-8 px-2 mb-8'>
                          <div className='w-full flex flex-col'>
                            <h1 className='font-semibold md:text-5xl sm:text-4xl text-3xl mb-8 break-keep'>{portfolio.project_name}</h1>
                            <p className='sm:text-lg text-base whitespace-pre-wrap'>{portfolio.project_description}</p>
                          </div>
                          <div className='md:w-96 w-full flex flex-col mx-auto justify-center'>
                            <div className='bg-gray-800 rounded-md border-2 border-solid border-[#1F2937] shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] p-8'>
                              <p className='font-semibold sm:text-3xl text-2xl mb-8'>Project Information:</p>
                              <div className='grid grid-cols-2 gap-5 place-content-start text-white mb-2'>
                                <p className='font-semibold mb-4'>Created By:</p><span className='font-normal'> {portfolio.full_name ? portfolio.full_name : username}</span>
                              </div>
                              <div className='grid grid-cols-2 gap-5 place-content-start text-white'>
                                <p className='font-semibold mb-4'>Started:</p><span className='font-normal'> {portfolio.date_started}</span>
                              </div>
                              <div className='grid grid-cols-2 gap-5 place-content-start text-white'>
                                <p className='font-semibold mb-4'>Accomplished:</p><span className='font-normal'> {portfolio.date_accomplished}</span>
                              </div>
                              <div className='grid grid-cols-2 gap-5 place-content-start text-white'>
                                <p className='font-semibold mb-4'>Duration:</p><span className='font-normal'> {diffInMonths(portfolio.date_started, portfolio.date_accomplished)}</span>
                              </div>
                              <div className='grid grid-cols-2 gap-5 place-content-start text-white'>
                                <p className='font-semibold mb-4'>Created For:</p><span className='font-normal'> {portfolio.created_for}</span>
                              </div>
                              <div className='grid grid-cols-2 gap-5 place-content-start text-white'>
                                <p className='font-semibold mb-4'>Category:</p><span className='font-normal'> {portfolio.category}</span>
                              </div>
                            </div>
                          </div>
                      </div>
                      {
                        portfolio.show_image &&
                          <div className='grid grid-cols-1 gap-5 place-content-start text-white md:px-8 px-2 mb-16'>
                              <div className='w-full sm:h-[600px] h-auto flex items-center justify-center overflow-y-scroll no-scroll relative'>
                                <img 
                                  src={convertDriveImageLink(portfolio.image)}
                                  className="w-full object-cover sm:absolute sm:top-0 sm:left-0"
                                />
                              </div>
                          </div>
                      }
                      
                      {
                        portfolio.text.length > 0 &&
                        portfolio.text.map((item, i) => {
                            return (
                              <div key={i}>
                                  {
                                    item.text_imageURL ?
                                    <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start text-white md:px-8 px-2 mb-8'>
                                      <div className='w-full flex flex-col justify-center md:mb-0 mb-4'>
                                        <h1 className='font-semibold md:text-5xl sm:text-4xl text-3xl mb-8 break-keep'>{item.text_heading}</h1>
                                        <p className='sm:text-lg text-base whitespace-pre-wrap'>{item.text_description}</p>
                                      </div>
                                      <div className='flex items-center justify-center'>
                                        <img
                                          src={item.text_imageURL}
                                          className="rounded-md md:w-auto w-full h-auto object-cover"
                                        />
                                      </div>
                                    </div>
                                    :
                                    <div className='grid grid-cols-1 gap-5 place-content-start text-white md:px-8 px-2 mb-8'>
                                        <div className='w-full flex flex-col'>
                                          <h1 className='font-semibold text-5xl mb-8'>{item.text_heading}</h1>
                                          <p className='sm:text-lg text-base whitespace-pre-wrap'>{item.text_description}</p>
                                        </div>
                                    </div>
                                  }
                                  <div>

                                  </div>
                              </div>
                            )
                        })
                      }
                      <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start text-white md:px-8 px-2 mb-16 mt-16'>
                        {
                          portfolio.list.length > 0 &&
                            portfolio.list.map((item, i) => {
                              return (
                                <div key={i} className='md:w-96 w-full flex flex-col mx-auto justify-center bg-gray-800 rounded-md border-2 border-solid border-[#1F2937] shadow-[0px_2px_10px_2px_rgba(0,0,0,0.56)] p-8'>
                                    <p className='font-semibold sm:text-3xl text-2xl mb-4 text-center'>{item.list_name}</p>
                                    <p className='mb-8 text-center'>{item.list_description}</p>
                                    {
                                      item.list_item.length > 0 &&
                                        item.list_item.map((data, id) => {
                                          return (
                                            <div key={id} className='flex flex-row relative mb-2'>
                                              <FontAwesomeIcon icon={['fas', item.list_icon]} className="mr-4 mt-1 text-[#0FF]" /> <p className='text-left break-keep'>{data}</p>
                                            </div>
                                          )
                                        })
                                    }
                                </div>
                              )
                            })
                        }
                      </div>
                      {
                        portfolio.gallery.length > 0 &&
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
                            {
                              portfolio.gallery.map((item, i) => {
                                return (
                                  <div className='grid grid-cols-1 gap-5 place-content-start text-white md:px-8 px-2 mb-16'>
                                      <div className='w-full sm:h-[700px] h-[350px] flex items-center justify-center overflow-y-scroll no-scroll relative'>
                                        <img 
                                          src={item}
                                          alt="gallery image"
                                          className="w-full object-cover sm:absolute sm:top-0 sm:left-0 mx-auto"
                                        />
                                      </div>
                                  </div>
                                )
                              })
                            }
                          </Carousel>
                      }
                  </div>
                </div>
            </div>
          </div>
          :
              <Loading text="Loading project" />

      }
    </div>
  )
}

export default ProjectSingle