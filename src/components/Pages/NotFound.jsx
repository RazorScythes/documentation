import React from 'react'
import styles from "../../style";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { main, dark, light } from '../../style';

const NotFound = ({ theme }) => {
    return (
        <div className={`${main.font} relative bg-cover bg-center py-20 ${theme === 'light' ? light.body : dark.body}`}>   
            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="flex flex-col justify-center items-center my-24 md:w-1/2 w-full mx-auto">
                        <h1 className="sm:text-9xl text-6xl font-semibold mb-4 text-center relative">
                            <FontAwesomeIcon icon={faSearch} className='absolute top-[-2rem] sm:right-[-3rem] right-[-2rem] sm:w-12 sm:h-12 w-8 h-8'/>
                            <span className={`${theme === 'light' ? light.heading : dark.heading}`}>404</span>
                        </h1>
                        <h2 className="sm:text-3xl text-xl font-medium mb-4 text-center relative">Oops, sorry we can't find that page!</h2>
                        <p className="mb-8 text-center text-sm leading-6">Either something went wrong or the page doesn't exist anymore.</p>
                        <a href="/" className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>Back to home page</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotFound