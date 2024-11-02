import React, { useState } from "react";
import { main, dark, light } from "../../style";
import { MotionAnimate } from "react-motion-animate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
const Poster = ({ data, theme }) => {
    const [hover, setHover] = useState(false);

    return (
        <div className='w-full relative cursor-pointer transition-all' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            { data?.type && <div className="absolute top-0 right-[1px] z-20 text-white bg-blue-700 px-2 rounded-tr-md">{ data.type }</div> }
            <div className="relative">
                <img 
                    className={`max-h-64 xs:w-52 w-full object-cover rounded-md border border-solid ${theme === 'light' ? light.border : dark.semiborder} mb-2`}
                    src={data?.thumbnail}
                />

                {
                    hover && (
                        <div className="absolute inset-0 bg-black opacity-60 rounded-md flex items-center justify-center">
                            <div className="text-white">
                                <MotionAnimate variant={{
                                    hidden: { 
                                        transform: 'scale(0)'
                                    },
                                    show: {
                                        opacity: 1,
                                        transform: 'scale(1)',
                                        transition: {
                                            duration: 0.1,
                                        }
                                    }
                                }}>
                                    <FontAwesomeIcon icon={faPlayCircle} className="opacity-100 w-16 h-16"/>
                                </MotionAnimate>
                            </div>
                        </div>
                    )
                }
            </div>
            <p className='truncate text-center'>Shangri-La Frontier: Kusoge Hunter, Kamige ni Idoman to su 2nd Season</p>
        </div>
    );
}

export default Poster