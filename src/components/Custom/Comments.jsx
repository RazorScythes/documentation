import React, { useEffect, useState } from 'react'
import { main, dark, light } from '../../style';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faFlag, faPlus, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment'
import Avatar from './Avatar'

const Template = ({ theme, data }) => {
    const [toggle, setToggle] = useState({
        comment: false,
        reply: false
    })

    return (
        <div className='w-full flex items-start transition-all'>
            <div className="w-12 flex-shrink-0 mr-4 xs:block hidden">
                <Avatar
                    theme={theme}
                    rounded={false}
                    image={data.avatar}
                    size={12}
                />
            </div>
            <div className={`flex-1 overflow-hidden`}>
                <div className='flex justify-between'>
                    <div className='w-full'>
                        <h1 className="font-medium truncate">{data.user}</h1>
                        <p className={`text-xs ${!toggle.comment && 'truncate'} w-full ${theme === 'light' ? light.text : dark.text}`}>{moment(data.date).fromNow()}</p>
                    </div>

                    <div className="flex gap-5">
                        <FontAwesomeIcon title={toggle.comment ? 'Expand' : 'Collapse'} onClick={() => setToggle({...toggle, comment: !toggle.comment})} icon={toggle.comment ? faPlus : faMinus} className={`${theme === 'light' ? light.link : dark.link}`}/>
                        <FontAwesomeIcon title="Flag as inappropriate" icon={faFlag} className={`${theme === 'light' ? light.link : dark.link}`}/>
                    </div>
                </div>

                {
                    !toggle.comment ?
                        <div>
                            <p className={`w-full text-xs leading-5 mt-4 ${theme === 'light' ? light.text : dark.text}`}>
                                { data.text }
                            </p>

                            <div className="flex gap-5 mt-4">
                                <button className={`${theme === 'light' ? light.link : dark.link}`}>
                                    <FontAwesomeIcon title="Like" icon={faThumbsUp} className={`mr-1`}/> 
                                    <span className={`${theme === 'light' ? light.text : dark.text}`}> { data.likes.length } </span>
                                </button>
                                <button className={`${theme === 'light' ? light.link : dark.link}`}>
                                    <FontAwesomeIcon title="Dislike" icon={faThumbsDown} className={`mr-1`}/> 
                                    <span className={`${theme === 'light' ? light.text : dark.text}`}> { data.dislikes.length } </span>
                                </button>

                                <button onClick={() => setToggle({...toggle, reply: !toggle.reply})} className={`${theme === 'light' ? light.text : dark.text} ${theme === 'light' ? light.link : dark.link}`}>Reply</button>
                            </div>

                            {
                                toggle.reply ?
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
                                </div> : null
                            }

                            <div className={`flex flex-col gap-4 ${!toggle.reply && 'mt-4'}`}>
                                {
                                    data.replies.map((item, index) => {
                                        return (
                                            <Template
                                                theme={theme}
                                                data={item}
                                            />
                                        )
                                    })
                                }
                            </div>
                        </div>
                    : null
                }
            </div>
        </div>
    )
}

const Comments = ({ theme }) => {
    const data = {
        id: 1,
        avatar: "https://drive.google.com/thumbnail?id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V&sz=w1000",
        user: 'RazorScythe',
        text: "In this magical world, one is easily identified as having magical abilities by a distinctive mark on their face...",
        date: '2023-11-16T06:40:31.459Z',
        likes: ['asd'],
        dislikes: [],
        replies: [{
            id: 1,
            avatar: "https://drive.google.com/thumbnail?id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V&sz=w1000",
            user: 'RazorScythe',
            text: "In this magical world, one is easily identified as having magical abilities by a distinctive mark on their face...",
            date: '2023-11-16T06:40:31.459Z',
            likes: [],
            dislikes: [],
            replies: [{
                id: 1,
                avatar: "https://drive.google.com/thumbnail?id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V&sz=w1000",
                user: 'RazorScythe',
                text: "In this magical world, one is easily identified as having magical abilities by a distinctive mark on their face...",
                date: '2023-11-16T06:40:31.459Z',
                likes: [],
                dislikes: [],
                replies: [],
            }],
        },
        {
            id: 1,
            avatar: "https://drive.google.com/thumbnail?id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V&sz=w1000",
            user: 'RazorScythe',
            text: "In this magical world, one is easily identified as having magical abilities by a distinctive mark on their face...",
            date: '2023-11-16T06:40:31.459Z',
            likes: [],
            dislikes: [],
            replies: [{
                id: 1,
                avatar: "https://drive.google.com/thumbnail?id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V&sz=w1000",
                user: 'RazorScythe',
                text: "In this magical world, one is easily identified as having magical abilities by a distinctive mark on their face...",
                date: '2023-11-16T06:40:31.459Z',
                likes: [],
                dislikes: [],
                replies: [],
            }],
        }],
    }

    return (
        <Template
            theme={theme}
            data={data}
        />
    )
}

export default Comments