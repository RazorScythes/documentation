import React, { useEffect, useState } from 'react'
import styles from "../../style";

import { Hero, Feature, GameList, News, Service, Socials, Users } from '../index'
import { toram_online, genshin_impact, minecraft, tower_of_fantasy, watching_video, seaplant } from '../../assets';
import Alert from '../Alert';
import Footer from '../Custom/Footer';
import Loading from './Loading';
import SideAlert from '../SideAlert';
import heroImage from '../../assets/hero-image.jpg';
import Poster from '../Custom/Poster';
import { main, dark, light } from '../../style';
import Cookies from 'universal-cookie';
// Static Services Component 
const service_multiple_image = [
    { src: toram_online, alt: 'Image 1' },
    { src: genshin_impact, alt: 'Image 2' },
    { src: minecraft, alt: 'Image 3' },
    { src: tower_of_fantasy, alt: 'Image 4' },
]

const service_single_image = [
  { src: watching_video, alt: 'Video' }
]

const Home = ({ user, theme }) => {
    const cookies = new Cookies();

    useEffect(() => {
        document.title = "Home"
    }, [])

    return (
        <div className={`relative overflow-hidden ${main.font}  ${theme === 'light' ? light.body : dark.body}`}>
            <Hero />

            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidth}`}>
                    <div className={`${main.container} file:lg:px-8 relative px-0 my-12`}>
                        <div className='grid md:grid-cols-3 grid-cols-1 gap-5 place-content-start mt-8'>
                            <div className='col-span-2'>
                                <h1 className="text-2xl font-medium mb-4">Recently Added</h1>

                                <div className='grid sm:grid-cols-4 xs:grid-cols-3 grid-cols-2 gap-4 place-content-start mt-8'>
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

                            <div className=''>
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

export default Home