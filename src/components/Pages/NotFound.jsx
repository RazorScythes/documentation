import React from 'react'
import styles from "../../style";
import { Page_not_found } from '../../assets';
const NotFound = () => {
  return (
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
                    <h1 className="text-white text-4xl font-bold mb-4 text-center">Page not Found</h1>
                    <p className="text-white text-lg mb-8 text-center">The page you are looking for does not exist, or you may have mistyped the url you are looking for.</p>
                    <a href="/" className="text-white underline hover:text-gray-200">Go back to home page</a>
                </div>
            </div>
        </div>
    </div>
  )
}

export default NotFound