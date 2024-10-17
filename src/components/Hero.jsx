import React from "react";
import heroBackgroundImage from '../assets/hero-bg.jpg';
import heroImage from '../assets/hero-image.jpg';
import { MotionAnimate } from 'react-motion-animate'
import styles from "../style";
const Hero = () => {
    return (
        <div
          className="relative bg-cover bg-center py-14"
          style={{ backgroundImage: `url(${heroBackgroundImage})` }}
        >
            <div class="bubbles-wrapper">
                <div><span class="dot"></span></div>
                <div><span class="dot"></span></div>
                <div><span class="dot"></span></div>
                <div><span class="dot"></span></div>
            </div>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidth}`}>
                    <div className="absolute inset-0 bg-black opacity-75"></div>
                    <div className="container mx-auto file:lg:px-8 relative px-0">
                        <div className="lg:flex md:flex items-center">
                        <div className="lg:w-1/2 md:w-1/2 w-full sm:px-4">
                            <MotionAnimate animation='fadeInUp' reset={false}>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold leading-tight text-white mb-4">
                                    Welcome to my Personal Website!
                                </h1>

                                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-semibold leading-tight text-white mb-4">
                                    Discover a World of Excitement and Entertainment.
                                </h2>
                                <p className="text-white text-base sm:text-xl md:text-lg leading-relaxed mb-4">
                                    Explore the latest games, consoles, and technologies, along with personal stories, insights, and experiences on this website. From reviews and walkthroughs to blog posts and videos, I offer a diverse range of content that is sure to keep you entertained and engaged.
                                </p>
                                <button className="bg-gray-100 hover:bg-transparent hover:text-gray-100 text-gray-800 font-semibold my-8 py-2 px-8 border border-gray-100 rounded transition-colors duration-300 ease-in-out" onClick={() => loginWithRedirect()}>
                                    Explore Now!
                                </button>
                            </MotionAnimate>
                        </div>
                        <div className="lg:w-1/3 md:w-1/3 md:block hidden ml-32">
                            {/* <MotionAnimate >
                                <img src={heroImage} alt="Hero Image" className="rounded-lg shadow-lg lg:w-[400px]"/>
                            </MotionAnimate> */}
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
