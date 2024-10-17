import React from 'react'
import styles from "../style";
import { Banner } from "./index"

import { banner_bg } from '../assets';

const Socials = () => {
  return (
    <div className='md:my-8 my-0 relative pt-[200px]'>
        <div className="bg-transparent absolute w-full">
            <div className="h-96 relative">
            <div className="absolute top-0 bg-[#6757D6] transform skew-y-3 w-full h-full shadow-[21px_-21px_1px_1px_#5045A0,-21px_21px_1px_1px_#5045A0]"></div>
            </div>
        </div>
        <div className={`${styles.paddingX} ${styles.flexStart} relative z-10`}>
            <div className={`${styles.boxWidth}`}>
                <section className={`container mx-auto py-8 md:px-9 h-full font-poppins`}>
                        <div className='text-white text-center pt-24'>
                            <p className='uppercase text-center font-semibold md:text-lg text-base text-[#E1DEF7] pb-4'>DON'T miss out on upcoming events</p>
                            <h2 className='md:text-6xl text-5xl font-bold'>UPCOMING EVENTS</h2>
                        </div>
                        <Banner
                            heading = "keep training" 
                            description = "take part in exciting events" 
                            background_image = {banner_bg}
                            overlay_rgb_color = "223,32,76" 
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

export default Socials