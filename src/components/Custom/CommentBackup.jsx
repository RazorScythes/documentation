import React, { useEffect, useState } from 'react'
import { main, dark, light } from '../../style';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faFlag, faPlus, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment'
import Avatar from './Avatar'

const Comments = ({ theme }) => {
    const [toggle, setToggle] = useState(false)
    return (
        <div className='w-full flex items-start transition-all'>
            <div className="w-12 flex-shrink-0 mr-4 xs:block hidden">
                <Avatar
                    theme={theme}
                    rounded={false}
                    image="https://drive.google.com/thumbnail?id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V&sz=w1000"
                    size={12}
                />
            </div>
            <div className={`flex-1 overflow-hidden`}>
                <div className='flex justify-between'>
                    <div className='w-full'>
                        <h1 className="font-medium truncate">RazorScythe</h1>
                        <p className={`text-xs ${!toggle && 'truncate'} w-full ${theme === 'light' ? light.text : dark.text}`}>{moment('2023-11-16T06:40:31.459Z').fromNow()}</p>
                    </div>

                    <div className="flex gap-5">
                        <FontAwesomeIcon title={toggle ? 'Expand' : 'Collapse'} onClick={() => setToggle(!toggle)} icon={toggle ? faPlus : faMinus} className={`${theme === 'light' ? light.link : dark.link}`}/>
                        <FontAwesomeIcon title="Flag as inappropriate" icon={faFlag} className={`${theme === 'light' ? light.link : dark.link}`}/>
                    </div>
                </div>

                {
                    !toggle ?
                        <div>
                            <p className={`w-full text-xs leading-5 mt-4 ${theme === 'light' ? light.text : dark.text}`}>
                                In this magical world, one is easily identified as having magical abilities by a distinctive mark on their face. Those unable to practice magic are swiftly exterminated to maintain the magical integrity of society.
                            </p>

                            <div className="flex gap-5 mt-4">
                                <button>
                                    <FontAwesomeIcon title="Like" icon={faThumbsUp} className={`mr-1 ${theme === 'light' ? light.link : dark.link}`}/> 
                                    <span className={`${theme === 'light' ? light.text : dark.text}`}> 0 </span>
                                </button>
                                <button>
                                    <FontAwesomeIcon title="Dislike" icon={faThumbsDown} className={`mr-1 ${theme === 'light' ? light.link : dark.link}`}/> 
                                    <span className={`${theme === 'light' ? light.text : dark.text}`}> 0 </span>
                                </button>

                                <button className={`${theme === 'light' ? light.text : dark.text} ${theme === 'light' ? light.link : dark.link}`}>Reply</button>
                            </div>

                            <div className='w-full flex items-start transition-all my-4'>
                                <div className="w-12 flex-shrink-0 mr-4 xs:block hidden">
                                    <Avatar
                                        theme={theme}
                                        rounded={false}
                                        image="https://drive.google.com/thumbnail?id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V&sz=w1000"
                                        size={12}
                                    />
                                </div>

                                <div className={`flex-1 overflow-hidden rounded-md`}>
                                    <textarea
                                        required
                                        name="message"
                                        id="message"
                                        cols="30"
                                        rows="4"
                                        placeholder="Message"
                                        className={`block w-full px-4 py-3 ${theme === 'light' ? light.input : dark.input}`}
                                        >
                                    </textarea>
                                    <button className={`mt-3 float-right ${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>
                                        Comment
                                    </button>
                                </div>
                            </div>
                            
                            <div className='w-full flex items-start transition-all'>
                                <div className="w-12 flex-shrink-0 mr-4 xs:block hidden">
                                    <Avatar
                                        theme={theme}
                                        rounded={false}
                                        image="https://drive.google.com/thumbnail?id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V&sz=w1000"
                                        size={12}
                                    />
                                </div>
                                <div className={`flex-1 overflow-hidden`}>
                                    <div className='flex justify-between'>
                                        <div className='w-full'>
                                            <h1 className="font-medium truncate">RazorScythe</h1>
                                            <p className={`text-xs ${!toggle && 'truncate'} w-full ${theme === 'light' ? light.text : dark.text}`}>{moment('2023-11-16T06:40:31.459Z').fromNow()}</p>
                                        </div>

                                        <div className="flex gap-5">
                                            <FontAwesomeIcon title={toggle ? 'Expand' : 'Collapse'} onClick={() => setToggle(!toggle)} icon={toggle ? faPlus : faMinus} className={`${theme === 'light' ? light.link : dark.link}`}/>
                                            <FontAwesomeIcon title="Flag as inappropriate" icon={faFlag} className={`${theme === 'light' ? light.link : dark.link}`}/>
                                        </div>
                                    </div>

                                    {
                                        !toggle ?
                                            <div>
                                                <p className={`w-full text-xs leading-5 mt-4 ${theme === 'light' ? light.text : dark.text}`}>
                                                    In this magical world, one is easily identified as having magical abilities by a distinctive mark on their face. Those unable to practice magic are swiftly exterminated to maintain the magical integrity of society.
                                                </p>

                                                <div className="flex gap-5 mt-4">
                                                    <button>
                                                        <FontAwesomeIcon title="Like" icon={faThumbsUp} className={`mr-1 ${theme === 'light' ? light.link : dark.link}`}/> 
                                                        <span className={`${theme === 'light' ? light.text : dark.text}`}> 0 </span>
                                                    </button>
                                                    <button>
                                                        <FontAwesomeIcon title="Dislike" icon={faThumbsDown} className={`mr-1 ${theme === 'light' ? light.link : dark.link}`}/> 
                                                        <span className={`${theme === 'light' ? light.text : dark.text}`}> 0 </span>
                                                    </button>

                                                    <button className={`${theme === 'light' ? light.text : dark.text} ${theme === 'light' ? light.link : dark.link}`}>Reply</button>
                                                </div>

                                                <div className='w-full flex items-start transition-all my-4'>
                                                    <div className="w-12 flex-shrink-0 mr-4 xs:block hidden">
                                                        <Avatar
                                                            theme={theme}
                                                            rounded={false}
                                                            image="https://drive.google.com/thumbnail?id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V&sz=w1000"
                                                            size={12}
                                                        />
                                                    </div>

                                                    <div className={`flex-1 overflow-hidden rounded-md`}>
                                                        <textarea
                                                            required
                                                            name="message"
                                                            id="message"
                                                            cols="30"
                                                            rows="4"
                                                            placeholder="Message"
                                                            className={`block w-full px-4 py-3 ${theme === 'light' ? light.input : dark.input}`}
                                                            >
                                                        </textarea>
                                                        <button className={`mt-3 float-right ${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>
                                                            Comment
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className='w-full flex items-start transition-all'>
                                                    <div className="w-12 flex-shrink-0 mr-4 xs:block hidden">
                                                        <Avatar
                                                            theme={theme}
                                                            rounded={false}
                                                            image="https://drive.google.com/thumbnail?id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V&sz=w1000"
                                                            size={12}
                                                        />
                                                    </div>
                                                    <div className={`flex-1 overflow-hidden`}>
                                                        <div className='flex justify-between'>
                                                            <div className='w-full'>
                                                                <h1 className="font-medium truncate">RazorScythe</h1>
                                                                <p className={`text-xs ${!toggle && 'truncate'} w-full ${theme === 'light' ? light.text : dark.text}`}>{moment('2023-11-16T06:40:31.459Z').fromNow()}</p>
                                                            </div>

                                                            <div className="flex gap-5">
                                                                <FontAwesomeIcon title={toggle ? 'Expand' : 'Collapse'} onClick={() => setToggle(!toggle)} icon={toggle ? faPlus : faMinus} className={`${theme === 'light' ? light.link : dark.link}`}/>
                                                                <FontAwesomeIcon title="Flag as inappropriate" icon={faFlag} className={`${theme === 'light' ? light.link : dark.link}`}/>
                                                            </div>
                                                        </div>

                                                        {
                                                            !toggle ?
                                                                <div>
                                                                    <p className={`w-full text-xs leading-5 mt-4 ${theme === 'light' ? light.text : dark.text}`}>
                                                                        In this magical world, one is easily identified as having magical abilities by a distinctive mark on their face. Those unable to practice magic are swiftly exterminated to maintain the magical integrity of society.
                                                                    </p>
                                                                </div>
                                                            : null 
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        : null 
                                    }
                                </div>
                            </div>
                        </div>
                    : null
                }
            </div>
        </div>
    )
}

export default Comments