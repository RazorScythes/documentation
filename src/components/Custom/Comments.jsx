import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faFlag, faPlus, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { dark, light } from '../../style';
import Cookies from 'universal-cookie';
import moment from 'moment'
import Avatar from './Avatar'
import ConfirmModal from './ConfirmModal';
import { MotionAnimate } from 'react-motion-animate';

const cookies = new Cookies();

const generateRandomKey = (length = 16) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
};

const removeReply = (replies, targetId) => {
    return replies
        .map(reply => ({
            ...reply,
            replies: removeReply(reply.replies, targetId) 
        }))
        .filter(reply => reply.comment_id !== targetId);
}

const Template = ({ theme, data, token, user, image, setTrigger, setRemove }) => {
    const [childTrigger, setChildTrigger]   = useState(false)
    const [comment, setComment]             = useState('')
    const [activeLike, setActiveLike]       = useState(false)
    const [activeDislike, setActiveDislike] = useState(false)
    const [openModal, setOpenModal]         = useState(false)
    const [confirm, setConfirm]             = useState(false)

    const [toggle, setToggle] = useState({
        comment         : false,
        reply           : false,
        expand_reply    : false
    })

    useEffect(() => {
        if(childTrigger) {
            setTrigger(true)
            setChildTrigger(false)
        }
    }, [childTrigger])

    useEffect(() => {
        if(confirm) {
            setRemove({
                type: data.comment_id ? 'child' : 'parent',
                id: data.comment_id ? data.comment_id : data._id
            })
            setConfirm(false);
        }
    }, [confirm])

    useEffect(() => {
        const userId = cookies.get('uid');

        setActiveLike(false);
        setActiveDislike(false);
        
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
            user_id     : user._id,
            comment_id  : generateRandomKey(),
            avatar      : image,
            user        : user.username,
            text        : comment,
            date        : moment().format("YYYY-MM-DDTHH:mm:ss"),
            likes       : [],
            dislikes    : [],
            replies     : [],
        }

        const updatedReplies = [newReply, ...replies]
        data.replies = updatedReplies

        setComment('')
        setToggle({...toggle, expand_reply: true})
        setChildTrigger(true)
    }
    
    return (
        <div className='w-full flex items-start transition-all'>
            <ConfirmModal 
                theme={theme}
                title="Delete Comment"
                description={`Are you sure you want to delete your comment?`}
                openModal={openModal}
                setOpenModal={setOpenModal}
                setConfirm={setConfirm}
            />

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
                        <p className={`text-xs ${!toggle.comment && 'truncate'} w-full ${theme === 'light' ? light.text : dark.text}`}>{moment(data.createdAt ?? data.date).fromNow()}</p>
                    </div>

                    <div className="flex gap-5">
                        <FontAwesomeIcon title={toggle.comment ? 'Expand' : 'Collapse'} onClick={() => setToggle({...toggle, comment: !toggle.comment})} icon={toggle.comment ? faPlus : faMinus} className={`${theme === 'light' ? light.link : dark.link}`}/>
                        <FontAwesomeIcon title="Flag as inappropriate" icon={faFlag} className={`${theme === 'light' ? light.link : dark.link}`}/>
                    </div>
                </div>

                {
                    !toggle.comment ?
                        <div>
                            
                            <p className={`whitespace-pre-wrap w-full text-xs leading-5 mt-4 ${theme === 'light' ? light.text : dark.text}`}>
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
                                {
                                    data.user_id === user._id &&
                                        <button onClick={() => setOpenModal(true)} className={`${theme === 'light' ? light.text : dark.text} ${theme === 'light' ? light.link : dark.link}`}>Delete</button>
                                }
                                
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
                                        <button disabled={!user} onClick={() => addComment()} className={`disabled:cursor-not-allowed mt-3 float-right ${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>
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
                                                <MotionAnimate animation='fadeInUp'>
                                                    <Template
                                                        key={index}
                                                        theme={theme}
                                                        data={item}
                                                        token={token}
                                                        user={user}
                                                        image={image}
                                                        setTrigger={setChildTrigger}
                                                        setRemove={setRemove}
                                                        index={index}
                                                    />
                                                </MotionAnimate>
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

export const Comments = ({ theme, data, handleSubmit, deleteComment }) => {
    const [trigger, setTrigger]     = useState(false);
    const [remove, setRemove]       = useState(null);
    const [token, setToken]         = useState(cookies.get('token'))
    const [user, setUser]           = useState(JSON.parse(localStorage.getItem('profile')))
    const [image, setImage]         = useState(localStorage.getItem('avatar') ? localStorage.getItem('avatar')?.replaceAll('"', "") : '')
    const [comment, setComment]     = useState(data)
    
    useEffect(() => {
        setComment(data)
    }, [data])

    useEffect(() => {
        if(trigger) {
            handleSubmit(comment)
            setTrigger(false)
        }
    }, [trigger])
 
    useEffect(() => {
        if(remove && typeof remove === 'object') {
            if (remove.type === 'parent') {
                deleteComment(remove.id)
            }
            else {
                const obj = removeReply([data], remove.id)
                setComment(...obj);
                setRemove(null);
                setTrigger(true);
            }
        }
    }, [remove])

    return (
        <MotionAnimate animation='fadeInUp'>
            <Template
                theme={theme}
                data={comment}
                token={token}
                user={user}
                image={image}
                setTrigger={setTrigger}
                setRemove={setRemove}
            />
        </MotionAnimate>
    )
}

export const CommentField = ({ theme, comment, setComment }) => {
    const [user, setUser]           = useState(JSON.parse(localStorage.getItem('profile')))
    const [image, setImage]         = useState(localStorage.getItem('avatar') ? localStorage.getItem('avatar')?.replaceAll('"', "") : '')
    const [text, setText]           = useState('')

    useEffect(() => {
        setText('')
    }, [comment])

    const addComment = () => {
        if(!text || comment) return

        setComment({
            user_id     : user._id,
            avatar      : image,
            user        : user.username,
            text        : text,
            date        : moment().format("YYYY-MM-DDTHH:mm:ss"),
            likes       : [],
            dislikes    : [],
            replies     : [],
        })
    }

    return (
        <>
            {
                user ?
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
                                onChange={(e) => setText(e.target.value)}
                                value={text}
                                className={`block w-full px-4 py-3 ${theme === 'light' ? light.input : dark.input}`}
                            >
                            </textarea>
                            <button disabled={!user} onClick={() => addComment()} className={`disabled:cursor-not-allowed mt-3 float-right ${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>
                                {
                                    !comment ? 'Comment'
                                        : <span>Commenting</span>
                                }
                            </button>
                        </div>
                    </div>
                :
                    <div className={`w-full py-8 border-2 border-dashed rounded-md mb-4 ${theme === 'light' ? light.border : dark.semiborder}`}>
                        <p className='text-center'>You need to <a href='/login' className={`${theme === 'light' ? light.link : dark.link}`}>login</a> to comment</p>
                    </div>
            }
        </>
    )
}