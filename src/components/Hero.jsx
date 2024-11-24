import React from "react";
import heroBackgroundImage from '../assets/hero-bg.jpg';
import heroImage from '../assets/hero-image.jpg';
import { MotionAnimate } from 'react-motion-animate'
import { main, light, dark } from "../style";
import styles from "../style";

const Hero = ({ }) => {
    return (
        <div
          className={`${main.font} relative bg-cover bg-center py-14`}
          style={{ backgroundImage: `url(${heroBackgroundImage})` }}
        >
            <div className="bubbles-wrapper">
                <div><span className="dot"></span></div>
                <div><span className="dot"></span></div>
                <div><span className="dot"></span></div>
                <div><span className="dot"></span></div>
            </div>

            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidth}`}>
                    <div className="absolute inset-0 bg-black opacity-75"></div>
                    <div className="container mx-auto file:lg:px-8 relative px-0 sm:my-32 my-24">
                        <div className="lg:flex md:flex items-center">
                            <div className="lg:w-1/2 md:w-1/2 w-full">
                                <MotionAnimate animation='fadeInUp' reset={false}>
                                    <h2 className="sm:text-4xl text-3xl font-semibold leading-9 text-white mb-6">
                                        Discover a World of Excitement and Entertainment.
                                    </h2>
                                    <p className="text-white text-base leading-7 mb-8">
                                        Explore the latest games, consoles, and technologies, along with personal stories, insights, and experiences on this website. From reviews and walkthroughs to blog posts and videos, I offer a diverse range of content that is sure to keep you entertained and engaged.
                                    </p>
                                    <button className={`${dark.button} rounded-sm`} onClick={() => loginWithRedirect()}>
                                        Explore Now
                                    </button>
                                </MotionAnimate>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
