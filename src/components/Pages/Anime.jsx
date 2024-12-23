import React, { useEffect, useState } from 'react'
import { main, dark, light } from '../../style';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faFilter } from '@fortawesome/free-solid-svg-icons';

import Poster from '../Custom/Poster';
import Pagination from '../Custom/Pagination';
import styles from "../../style";

const Anime = ({ user, theme }) => {
    const navigate          = useNavigate()

    const [toggle, setToggle] = useState(false)
    const [pagination, setPagination] = useState(null)
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [search, setSearch] = useState('')

    useEffect(() => {
        console.log(pagination)
    }, [pagination])

    const handleGenreChange = (event) => {
        const { id, checked } = event.target;
        setSelectedGenres(prevGenres => (
            checked 
                ? [...prevGenres, id]
                : prevGenres.filter(genre => genre !== id)
        ));
    };

    const filter = () => {
        const genreQuery = selectedGenres.join('|');
        const searchParams = new URLSearchParams(window.location.search);

        if (genreQuery) {
            searchParams.set('genre', genreQuery);
        } else {
            searchParams.delete('genre');
        }

        if (search) {
            searchParams.set('search', search);
        } else {
            searchParams.delete('search');
        }

        navigate(`${window.location.pathname}?${searchParams.toString()}`);
    };

    return (
        <div className={`relative overflow-hidden ${main.font} ${theme === 'light' ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidth}`}>
                    <div className={`${main.container} file:lg:px-8 relative px-0 my-12`}>
                        <div className='grid md:grid-cols-3 grid-cols-1 gap-5 place-content-start mt-8'>
                            <div className="col-span-2">
                                <div className={`rounded-md p-4 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                    <div className="grid sm:grid-cols-3 grid-cols-1 gap-4">
                                        <input 
                                            className={`block w-full rounded-sm py-2 px-8 pr-10 ${theme === 'light' ? light.input : dark.input}`} 
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            type="text" 
                                            placeholder='Search Anime' 
                                        />

                                        <div className='relative'>
                                            <button onClick={() => setToggle(!toggle)} className={`w-full flex justify-between items-center cursor-pointers rounded-sm py-2 px-8 ${theme === 'light' ? light.input : dark.input}`}>
                                                Genre
                                                <FontAwesomeIcon icon={toggle ? faChevronUp : faChevronDown} />
                                            </button>

                                            {
                                                toggle ?
                                                    <div className={`sm:w-72 w-full top-12 absolute z-40 rounded-md p-4 px-6 ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                                        <div className={`grid sm:grid-cols-2 grid-cols-1 ${theme === 'light' ? light.text : dark.text} gap-1`}>
                                                            {['Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons'].map((genre, index) => (
                                                                <div key={genre} className='flex gap-2'>
                                                                    <input
                                                                        type="checkbox"
                                                                        id={genre}
                                                                        checked={selectedGenres.includes(genre)}
                                                                        onChange={handleGenreChange}
                                                                    />
                                                                    <label htmlFor={genre}>{genre}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                : null
                                            }   
                                        </div>

                                        <button onClick={() => filter()} className={`text-center cursor-pointers rounded-sm py-2 px-8 ${theme === 'light' ? light.button_secondary : dark.button_secondary}`}>
                                            <FontAwesomeIcon icon={faFilter} className='mr-2'/>
                                            Filter
                                        </button>
                                    </div>
                                </div>

                                <div className='grid sm:grid-cols-4 xs:grid-cols-3 grid-cols-2 gap-4 place-content-start mt-8 mb-6'>
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

                                <Pagination 
                                    data={[1,2,3,4,5,5]}
                                    theme={theme}
                                    limit={2}
                                    setPagination={setPagination}
                                />
                            </div>
                            <div>
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

export default Anime