import React from 'react'
import styles from '../../style'
import { Header } from './index'
const Overview = () => {

    return (
        <div className="relative bg-white">   
            <Header 
                heading='Welcome'
                description="Select a website to manage, or create a new one from scratch."
                button_text="Explore Now!"
                button_link={`#`}
            />
            <div className="relative bg-[#F0F4F7]">   
                <div className={`${styles.marginX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Overview