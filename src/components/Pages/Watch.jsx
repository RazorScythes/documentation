import React, { useEffect, useState } from 'react'
import { main, dark, light } from '../../style';
import { Link } from 'react-router-dom';

import styles from "../../style";
import { faEye, faFilm } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useScreenSize } from '../Tools';
import Poster from '../Custom/Poster';
import Comments from '../Custom/Comments'

const Watch = ({ user, theme }) => {

    const [toggle, setToggle] = useState({
        description: false
    })

    const expandDescription = () => {
        const screensize = useScreenSize()
        if((screensize === 'sm' || screensize === 'xs') && !toggle.description) {
            setToggle({...toggle, description: true})
        }
    }

    return (
        <div className={`relative overflow-hidden ${main.font} ${theme === 'light' ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidth}`}>
                    <div className={`${main.container} file:lg:px-8 relative px-0 my-12`}>
                        <div className='grid md:grid-cols-3 grid-cols-1 gap-5 place-content-start mt-8'>
                            <div className="md:col-span-2">
                                <div className="relative w-full overflow-hidden pb-[56.25%] rounded-md">
                                    <iframe 
                                        src="https://drive.google.com/file/d/1TWGGc50TAU8nNGnFmmZUTi2zkHtcpM7Y/preview"
                                        className={`absolute top-0 left-0 w-full h-full ${theme === 'light' ? light.background : dark.background} border ${theme === 'light' ? light.border : dark.border}`}
                                        allow="autoplay"
                                        sandbox="allow-scripts allow-same-origin"
                                        allowFullScreen
                                    >
                                    </iframe>
                                </div>

                                <div className={`mt-4 rounded-md p-4 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                    <div className='w-full flex items-start transition-all'>
                                        <div className="w-32 flex-shrink-0 mr-4 sm:block hidden">
                                            <img 
                                                className={`max-h-64 w-full object-cover rounded-md border border-solid ${theme === 'light' ? light.border : dark.semiborder}`}
                                                src='https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg'
                                                alt='Shangri-La Frontier'
                                            />
                                        </div>
                                        <div onClick={() => expandDescription()} className={`flex-1 overflow-hidden sm:h-auto ${toggle.description ? 'h-auto' : 'h-14 md:cursor-auto cursor-pointer'}`}>
                                            <h1 className="text-lg font-medium">Mashle</h1>
                                            <p className={`${!toggle.description && 'truncate'} w-full ${theme === 'light' ? light.text : dark.text}`}>Mashle: Magic and Muscles, Mashle, マッシュル-MASHLE-</p>
                                            <p className={`w-full text-xs leading-5 mt-4 ${theme === 'light' ? light.text : dark.text}`}>
                                                In this magical world, one is easily identified as having magical abilities by a distinctive mark on their face. Those unable to practice magic are swiftly exterminated to maintain the magical integrity of society. However, deep within a forest lies an anomaly in Mash Burnedead, who can be found pumping iron with one arm and lifting a cream puff with the other. This aloof boy with superhuman strength—but no magical abilities—leads a quiet life with his father, far removed from society. Mash's peace is soon disturbed when the authorities discover his lack of magical powers. They issue him an ultimatum: compete to become a "Divine Visionary," which would force everyone to accept him, or be persecuted forever. To protect his family, he enrolls in the prestigious Easton Magic Academy, which only the most elite and gifted students are allowed to attend. Now, Mash must overcome his shortcomings as a magicless being and surpass the other students—relying solely on his muscles.
                                            </p>

                                            <div className='grid sm:grid-cols-2 grid-cols-1 gap-2 mt-4 text-xs'>
                                                <p><span className='font-medium'>Type:</span> <span className={`ml-1 ${theme === 'light' ? light.link : dark.link} ${theme === 'light' ? light.text : dark.text}`}>TV Series</span></p>
                                                <p><span className='font-medium'>Studios:</span> <span className={` ml-1 ${theme === 'light' ? light.link : dark.link} ${theme === 'light' ? light.text : dark.text}`}>A1 - Pictures</span></p>
                                                <p><span className='font-medium'>Date Aired:</span> <span className={` ml-1 ${theme === 'light' ? light.text : dark.text}`}>Apr 8, 2023 to Jul 1, 2023</span></p>
                                                <p><span className='font-medium'>Status:</span> <span className={` ml-1 ${theme === 'light' ? light.text : dark.text}`}>Finished Airing</span></p>
                                                <p><span className='font-medium'>Genre:</span> <span className={` ml-1 ${theme === 'light' ? light.link : dark.link} ${theme === 'light' ? light.text : dark.text}`}>Action, Comedy, Fantasy, Parody, School, Shounen</span></p>
                                                <p><span className='font-medium'>Scores:</span> <span className={` ml-1 ${theme === 'light' ? light.text : dark.text}`}>7.62</span></p>
                                                <p><span className='font-medium'>Duration:</span> <span className={` ml-1 ${theme === 'light' ? light.text : dark.text}`}>23 min/ep</span></p>
                                                <p><span className='font-medium'>Quality:</span> <span className={` ml-1 ${theme === 'light' ? light.text : dark.text}`}>HD</span></p>
                                                <p><span className='font-medium'>Views:</span> <span className={` ml-1 ${theme === 'light' ? light.text : dark.text}`}>18,536,585</span></p>
                                            </div>

                                            <p onClick={(e) => {
                                                e.stopPropagation();
                                                setToggle({...toggle, description: false})
                                            }} className={`sm:hidden block text-xs mt-2 text-center ${theme === 'light' ? light.link : dark.link}`}>Show Less</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`mt-4 rounded-md p-4 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                    <h1 className="text-xl font-medium">Recommendation</h1>

                                    <div className='grid sm:grid-cols-4 xs:grid-cols-3 grid-cols-2 gap-4 place-content-start mt-4'>
                                        <Poster 
                                            data={{
                                                thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg',
                                                title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                type: 'Movie'
                                            }}
                                            theme={theme}
                                        />

                                        <Poster 
                                            data={{
                                                thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg',
                                                title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                type: 'Anime'
                                            }}
                                            theme={theme}
                                        />

                                        <Poster 
                                            data={{
                                                thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg',
                                                title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                type: 'Anime'
                                            }}
                                            theme={theme}
                                        />

                                        <Poster 
                                            data={{
                                                thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg',
                                                title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                type: 'Movie'
                                            }}
                                            theme={theme}
                                        />

                                        <Poster 
                                            data={{
                                                thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg',
                                                title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                type: 'Movie'
                                            }}
                                            theme={theme}
                                        />

                                        <Poster 
                                            data={{
                                                thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg',
                                                title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                type: 'Anime'
                                            }}
                                            theme={theme}
                                        />

                                        <Poster 
                                            data={{
                                                thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg',
                                                title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                type: 'Anime'
                                            }}
                                            theme={theme}
                                        />

                                        <Poster 
                                            data={{
                                                thumbnail: 'https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg',
                                                title: 'Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season',
                                                type: 'Movie'
                                            }}
                                            theme={theme}
                                        />
                                    </div>
                                </div>

                                <div className={`mt-4 rounded-md p-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                    <h1 className="text-xl font-medium">Comments</h1>
                                    
                                    <div className={`flex flex-col gap-4 mt-4`}>
                                        <Comments 
                                            theme={theme}
                                        />
                                    </div>
                                </div>

                            </div>
                            <div className='flex flex-col gap-4'>
                                <div className={`rounded-md p-4 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                    <h1 className="text-lg font-medium">Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season</h1>
                                    <p className={`truncate w-full mt-2 mb-8 ${theme === 'light' ? light.text : dark.text}`}>2024 • 12 Episodes</p>
                                  
                                    <div className='md:flex md:flex-col sm:grid sm:grid-cols-2 flex flex-col gap-4 max-h-[500px] overflow-y-auto'>
                                        <Link to={`/`} className='w-full flex items-start cursor-pointer transition-all'>
                                            <div className={`rounded-md overflow-hidden md:w-48 md:max-w-48 xs:w-36 xs:max-w-36 w-56 max-w-32 h-20 mr-2 relative border ${theme === 'light' ? light.border : dark.border}`}>

                                                <p style={{backgroundColor: 'rgb(0, 0, 0, 0.8'}} className='w-full text-white text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-xs py-1'>Watching</p>

                                                <img 
                                                    src={`https://img.bunnyccdn.co/_r/300x400/100/28/a6/28a6148a40022320436d20ea91e2800d/28a6148a40022320436d20ea91e2800d.jpg`} alt="Video Thumbnail" 
                                                    className='w-full mx-auto object-cover h-20'
                                                />
                                                <div className='absolute top-1 right-1 rounded-sm text-white bg-blue-700 border border-solid border-blue-600' title={'Video'}>
                                                    <p className='font-semibold p-1 px-1 py-0 text-xs'><FontAwesomeIcon icon={faFilm} /></p>
                                                </div>
                                                <div className='absolute bottom-1 right-1 rounded-sm text-white bg-blue-700 border border-solid border-blue-600'>
                                                    <p className='p-1 px-1 py-0 text-xs'>{'00:00'}</p>
                                                </div>
                                            </div>

                                            <div className='flex flex-col w-60 max-w-60 overflow-x-hidden'>
                                                <p className='truncate w-full mt-2'>
                                                    Episode 1
                                                </p>
                                                <p className={`text-xs truncate w-full mt-2 ${theme === 'light' ? light.text : dark.text}`}><FontAwesomeIcon icon={faEye} /> 80</p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>

                                <div className={`rounded-md p-4 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                    <div className='flex justify-between items-center mb-6'>
                                        <h1 className="text-2xl font-medium">Recent Anime</h1>
                                        <button className={`${theme === 'light' ? light.button_transparent : dark.button_transparent} rounded-md px-2`}>
                                            View All
                                        </button>
                                    </div>
                                    
                                    <div className='md:flex md:flex-col sm:grid sm:grid-cols-2 flex flex-col gap-4'>
                                        <div className='w-full flex items-start cursor-pointer transition-all'>
                                            <div className="w-16 flex-shrink-0 mr-4">
                                                <img 
                                                    className={`max-h-64 w-full object-cover rounded-md border border-solid ${theme === 'light' ? light.border : dark.semiborder}`}
                                                    src='https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg'
                                                    alt='Shangri-La Frontier'
                                                />
                                            </div>
                                            <div className='flex-1 overflow-hidden'>
                                                <p className='truncate w-full mt-2'>
                                                    Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season
                                                </p>
                                                <p className={`truncate w-full mt-2 ${theme === 'light' ? light.text : dark.text}`}>2024 • 12 Episodes</p>
                                            </div>
                                        </div>

                                        <div className='w-full flex items-start cursor-pointer transition-all'>
                                            <div className="w-16 flex-shrink-0 mr-4">
                                                <img 
                                                    className={`max-h-64 w-full object-cover rounded-md border border-solid ${theme === 'light' ? light.border : dark.semiborder}`}
                                                    src='https://img.bunnyccdn.co/_r/300x400/100/0f/c6/0fc66f9879a3a4a15408c325e1677e17/0fc66f9879a3a4a15408c325e1677e17.jpg'
                                                    alt='Shangri-La Frontier'
                                                />
                                            </div>
                                            <div className='flex-1 overflow-hidden'>
                                                <p className='truncate w-full mt-2'>
                                                    Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season
                                                </p>
                                                <p className={`truncate w-full mt-2 ${theme === 'light' ? light.text : dark.text}`}>2024 • 12 Episodes</p>
                                            </div>
                                        </div>
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

export default Watch