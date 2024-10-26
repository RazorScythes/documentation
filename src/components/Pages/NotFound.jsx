import React from 'react'
import styles from "../../style";
import { Page_not_found } from '../../assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBatteryEmpty, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FaSearch } from 'react-icons/fa';
const NotFound = () => {
  return (
    <div
        className="font-poppins relative bg-cover bg-center py-20 bg-[#1C1C1C]"
    >   
        <div className={`${styles.marginX} ${styles.flexCenter}`}>
            <div className={`${styles.boxWidthEx}`}>
                <div className="flex flex-col justify-center items-center my-24 md:w-1/2 w-full mx-auto">
                    <h1 className="text-white sm:text-9xl text-6xl font-semibold mb-4 text-center relative">
                        <FontAwesomeIcon icon={faSearch} className='absolute top-[-2rem] sm:right-[-3rem] right-[-2rem] sm:w-12 sm:h-12 w-8 h-8'/>
                        404
                    </h1>
                    <h2 className="text-white sm:text-3xl text-xl font-medium mb-4 text-center relative">Oops, sorry we can't find that page!</h2>
                    <p className="text-white mb-8 text-center text-sm leading-6">Either something went wrong or the page doesn't exist anymore.</p>
                    <a href="/" className="bg-white hover:bg-blue-600 hover:border-blue-600 hover:text-white text-[#0e0e0e] font-medium ml-2 text-sm py-1.5 px-4 border border-white rounded-full transition-colors duration-300 ease-in-out">Go back to home page</a>
                </div>
            </div>
        </div>
    </div>
  )
}

export default NotFound