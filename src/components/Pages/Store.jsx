import React from 'react'
import styles from "../../style";
import { Error_forbiden } from '../../assets';

const Store = () => {
    return (
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
                        <h1 className="text-white sm:text-4xl text-2xl font-bold mb-4">This page is not ready</h1>
                        <p className="text-white text-lg mb-8">Looks like the page hasn't started yet.</p>
                        <a href="/" className="text-white underline hover:text-gray-200">Go back to home page</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Store