import React, { useState } from 'react'

const Banner = ({ heading = "Heading", description = "Description Here", background_image, overlay_rgb_color = "223,32,76", button_text = "View More", button_link = "#", round_corner = true, reverse = false }) => {

    const [hover, setHover] = useState({
        color: false,
        background: false
    });

    return (
            <div 
                style={{ backgroundImage: `url(${background_image})`, borderRadius: round_corner ? "0.375rem" : "0" }}
                className="relative bg-cover bg-center md:mt-24 mt-12 w-full md:p-16 p-8 border-1 border-solid border-gray-400"
            >
                <div style={{background: `linear-gradient(to right, rgb(${overlay_rgb_color}, 1), rgb(${overlay_rgb_color}, 0.5))`, borderRadius: round_corner ? "0.375rem" : "0" }} className="absolute inset-0 bg-black opacity-100"></div>
                <div className="relative flex flex-col md:flex-row">
                    <div className=" w-full md:w-1/2 text-white uppercase md:text-left text-center">
                        {
                            reverse ? 
                            <>
                                <p className='font-semibold md:text-lg text-base text-[#E1DEF7] pb-4'>{ heading }</p>
                                <h2 className='md:text-5xl text-4xl font-bold '>{ description }</h2>
                            </>
                            :
                            <>
                                <h2 className='md:text-4xl text-3xl font-bold pb-3'>{ heading }</h2>
                                <p className='font-semibold md:text-lg text-base text-[#E1DEF7]'>{ description }</p>
                            </>
                        }
                    </div>
                    <div className="w-full flex md:justify-end justify-center md:w-1/2 my-auto">
                        <div className='md:float-right inline-block md:mt-0 mt-4 border-2 border-solid border-gray-400 p-1'>
                            <a href={ button_link } >
                                <button 
                                    onMouseEnter={()=>{
                                        setHover({...hover, 
                                            color: true,
                                            background: true
                                        });
                                    }}
                                    onMouseLeave={()=>{
                                        setHover({...hover, 
                                            color: false,
                                            background: false
                                        });
                                    }}
                                    style={{
                                        color: hover.color ? "#FFF" : `rgb(${overlay_rgb_color}, 1)`,
                                        background: hover.background ? `rgb(${overlay_rgb_color}, 1)` : "#FFF"
                                    }} 
                                    className="uppercase tracking-tighter hover:text-gray-100 font-semibold py-3 px-12 border border-gray-100 transition-colors duration-300 ease-in-out" 
                                >
                                    { button_text }
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default Banner