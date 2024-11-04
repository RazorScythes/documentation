import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faFlag, faPlus, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { dark, light } from '../../style';
import Cookies from 'universal-cookie';
import moment from 'moment'
import Avatar from './Avatar'

const cookies = new Cookies();

const Template = ({ theme, data, setTrigger }) => {
    const [token, setToken] = useState(cookies.get('token'))
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')))
    const [image, setImage] = useState(localStorage.getItem('avatar') ? localStorage.getItem('avatar')?.replaceAll('"', "") : '')

    const [childTrigger, setChildTrigger] = useState(false)
    const [comment, setComment] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [activeLike, setActiveLike] = useState(false)
    const [activeDislike, setActiveDislike] = useState(false)

    const [toggle, setToggle] = useState({
        comment: false,
        reply: false,
        expand_reply: false
    })

    useEffect(() => {
        if(childTrigger) {
            setTrigger(true)
            setChildTrigger(false)
        }
    }, [childTrigger])

    useEffect(() => {
        const userId = cookies.get('uid');

        if(data.likes.length > 0){
            if (data.likes.includes(userId)) {
                setActiveLike(true)
            }
        }
        if(data.dislikes.length > 0) {
            if (data.dislikes.includes(userId)) {
                setActiveDislike(true)
            }
        }
    }, [data])

    const addLikes = () => {
        const userId = cookies.get('uid');
        const likes = [...data.likes]
        const dislikes = [...data.dislikes]

        if (!likes.includes(userId)) {
            const updatedLikes = [...likes, userId];
            data.likes = updatedLikes;
            setActiveLike(true);

            const updatedDislikes = dislikes.filter(item => item !== userId);
            data.dislikes = updatedDislikes;
            setActiveDislike(false);

            setChildTrigger(true)
        }
    };

    const addDislikes = () => {
        const userId = cookies.get('uid');
        const likes = [...data.likes]
        const dislikes = [...data.dislikes]

        if (!dislikes.includes(userId)) {
            const updatedDislikes = [...dislikes, userId];
            data.dislikes = updatedDislikes;
            setActiveDislike(true);

            const updatedLikes = likes.filter(item => item !== userId);
            data.likes = updatedLikes;
            setActiveLike(false);

            setChildTrigger(true)
        }
    };
    
    const addComment = () => {
        if(!comment.length || !token) return 

        const replies = [...data.replies]

        const newReply = {
            id          : user._id,
            avatar      : image,
            user        : user.username,
            text        : comment,
            date        : moment().format("YYYY-MM-DDTHH:mm:ss"),
            likes       : [],
            dislikes    : [],
            replies     : [],
        }

        const updatedReplies = [...replies, newReply]
        data.replies = updatedReplies

        setComment('')
        setChildTrigger(true)
    }

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
                                <button onClick={ () => addLikes() } className={`${theme === 'light' ? light.link : dark.link}`}>
                                    <FontAwesomeIcon title="Like" icon={faThumbsUp} className={`mr-1 ${activeLike && (theme === 'light' ? light.active_link : dark.active_link)}`}/> 
                                    <span className={`${theme === 'light' ? light.text : dark.text}`}> { data.likes.length } </span>
                                </button>
                                <button onClick={ () => addDislikes() } className={`${theme === 'light' ? light.link : dark.link}`}>
                                    <FontAwesomeIcon title="Dislike" icon={faThumbsDown} className={`mr-1 ${activeDislike && (theme === 'light' ? light.active_link : dark.active_link)}`}/> 
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
                                            image={image}
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
                                            onChange={(e) => setComment(e.target.value)}
                                            value={comment}
                                            className={`block w-full px-4 py-3 ${theme === 'light' ? light.input : dark.input}`}
                                        >
                                        </textarea>
                                        <button disabled={!token} onClick={() => addComment()} className={`disabled:cursor-not-allowed mt-3 float-right ${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>
                                            Comment
                                        </button>
                                    </div>
                                </div> : null
                            }

                            <div className={`flex flex-col gap-4 ${!toggle.reply && 'mt-4'}`}>
                                {
                                    toggle.expand_reply &&
                                        data.replies.map((item, index) => {
                                            return (
                                                <Template
                                                    id={index}
                                                    theme={theme}
                                                    data={item}
                                                    setTrigger={setChildTrigger}
                                                />
                                            )
                                        })
                                }
                            </div>

                        </div>
                    : null
                }

                {
                    (!toggle.expand_reply && data?.replies.length > 0 && !toggle.comment) ?
                        <p onClick={() => setToggle({...toggle, expand_reply: true})} className={`${theme === 'light' ? light.link : dark.link}`}>{data.replies.length} Replies</p>
                    : null
                }
            </div>
        </div>
    )
}

const Comments = ({ theme }) => {
    const [trigger, setTrigger] = useState(false)
    const [data, setData] = useState({
        id: 1,
        avatar: "https://drive.google.com/thumbnail?id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V&sz=w1000",
        user: 'RazorScythe',
        text: "In this magical world, one is easily identified as having magical abilities by a distinctive mark on their face...",
        date: '2023-11-16T06:40:31.459Z',
        likes: ["fcd674b8-5178-42df-8257-2061df10f18c"],
        dislikes: [],
        replies: [{
            avatar: "https://drive.google.com/thumbnail?id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V&sz=w1000",
            user: 'RazorScythe',
            text: "Tangina mo jhepoy dizon",
            date: '2023-11-16T06:40:31.459Z',
            likes: [],
            dislikes: [],
            replies: [{
                id: 1,
                avatar: "https://drive.google.com/thumbnail?id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V&sz=w1000",
                user: 'RazorScythe',
                text: "In this magical world, one is easily identified as having magical abilities by a distinctive mark on their face...",
                date: '2023-11-16T06:40:31.459Z',
                likes: ["fcd674b8-5178-42df-8257-2061df10f18c"],
                dislikes: [],
                replies: [],
            }],
        },
        {
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
    })

    useEffect(() => {
        if(trigger) {
            //dispatch function
            console.log(data)
            setTrigger(false)
        }
    }, [trigger])

    return (
        <Template
            theme={theme}
            data={data}
            setTrigger={setTrigger}
        />
    )
}

export default Comments