import React, { useState } from "react";
import { main, dark, light } from "../../style";
import { MotionAnimate } from "react-motion-animate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faFilm, faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const millisToTimeString = (millis) => {
    var seconds = Math.floor(millis / 1000);
    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    var minutes = Math.floor(seconds / 60);
    seconds %= 60;

    var timeString = "";
    if (hours > 0) {
        timeString += hours.toString().padStart(2, '0') + ":";
    }
    timeString += minutes.toString().padStart(2, '0') + ":" +
                  seconds.toString().padStart(2, '0');
    
    return timeString;
}

const VideoPoster = ({ data, theme }) => {
    
    const [hover, setHover] = useState(false);

    return (
        <Link to={`/watch/${data._id}`} className='w-full relative cursor-pointer transition-all' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div className="relative">
                { 
                    data?.type && 
                        <div className='absolute top-1 right-1 rounded-sm text-white bg-blue-700 border border-solid border-blue-600' title={true ? 'Video' : 'Embed'}>
                            <p className='font-semibold p-1 px-1 py-0 text-xs'><FontAwesomeIcon icon={data.downloadUrl ? faFilm : faCode} /></p>
                        </div> 
                }
                <div className='absolute bottom-1 right-1 rounded-sm text-white bg-blue-700 border border-solid border-blue-600'>
                    <p className='p-1 px-1 py-0 text-xs'>{data.duration ? millisToTimeString(data.duration) : '00:00'}</p>
                </div>
                <img 
                    className={`max-h-32 sm:h-28 h-24 xs:w-52 w-full object-cover rounded-md border border-solid ${theme === 'light' ? light.border : dark.semiborder} mb-2`}
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
                                    <FontAwesomeIcon icon={faPlayCircle} className="opacity-100 sm:w-16 w-10 sm:h-16 h-10"/>
                                </MotionAnimate>
                            </div>
                        </div>
                    )
                }
            </div>
            <p className='truncate'>{data.title}</p>
            <p className={`truncate text-xs ${theme === 'light' ? light.text : dark.text}`}>{data.user}</p>

            <div className={`${theme === 'light' ? light.semibackground : dark.semibackground} h-[0.1px] my-1`}></div>
            
            <div className="flex justify-between">
                <p className={`truncate text-xs ${theme === 'light' ? light.text : dark.text}`}>{data.views?.length ?? 0} views</p>
                <p className={`truncate text-xs ${theme === 'light' ? light.text : dark.text}`}>{data.likes?.length ?? 0} likes</p>
            </div>
        </Link>
    );
}

export default VideoPoster