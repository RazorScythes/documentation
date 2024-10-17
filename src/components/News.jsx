import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TextWithLines } from './index'
import { faCalendar, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux'
import { toram_online, genshin_impact, minecraft, tower_of_fantasy } from '../assets';
import { getBlogs } from "../actions/blogs";
import { convertDriveImageLink } from './Tools'
const news = [
    {
        category:"Test",
        image:toram_online,
        title:"Lorem ipsum dolor sit amet",
        description:"Toram Online Toram Online Toram Online Toram Online Toram Online  ",
        date:"03/13/2023",
        link:"#"
    },
    {
        category:"fashion",
        image:genshin_impact,
        title:"Lorem ipsum dolor sit amet",
        description:"Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum ",
        date:"03/13/2023",
        link:"#"
    },
    {
        category:"milktea",
        image:tower_of_fantasy,
        title:"Lorem ipsum dolor sit amet",
        description:"Lorem ipsum ",
        date:"03/13/2023",
        link:"#"
    },
    {
        category:"zentai",
        image:minecraft,
        title:"Lorem ipsum dolor sit amet",
        description:"Lorem ipsum ",
        date:"03/13/2023",
        link:"#"
    },
]

const TextWithEllipsis = ({ text, limit = 55 }) => {
    if (text.length > limit) {
      return <span>{text.slice(0, limit)}...</span>;
    }
    return <span>{text}</span>;
}

const convertTimezone = (date) => {
    const timeZone = 'America/New_York';

    const dateObj = new Date(date);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour12: false,
    }).format(dateObj);

    return formattedDate
}

const getFirstParagraph = (content) => {
    var text = ''
    content.some((c) => {
        if(c.element === 'normal_naragraph'){
            text = c.paragraph
            return true;
        }
    })
    return text
}

const Content = ({ active, image, title, description, date, setActive, setIsLoaded, id }) => {
    return (
        <div style={{backgroundColor:active ? '#CD3242': '#1F2937'}} className={`w-full md:h-24 h:auto px-4 py-4 relative font-poppins bg-gray-800 border-solid border-[#696969] border-b font-poppins cursor-pointer`} 
            onClick={() => {
                setActive(id)
                setIsLoaded(false)
            }}
        >
            <div className="flex flex-col items-start">
                <div className="mb-4 absolute top-1/2 -translate-y-1/2"><img src={image} alt="post image" className="w-[100px] h-[80px] rounded-md object-cover"/></div>
                <div className="ml-28">
                    <h3 className="text-base font-semibold text-white uppercase">{title}</h3>
                    <p style={{color:active ? '#FFFFFF' : '#A0A7AB'}} className="text-xs font-normal leading-relaxed mb-1">{<TextWithEllipsis text={description} />}</p>
                    <p style={{color:active ? '#FFFFFF' : '#A0A7AB'}} className="text-xs font-normal leading-relaxed text-[#A0A7AB]"><FontAwesomeIcon icon={faCalendar} className="mr-1" /> {date}</p>
                </div>
            </div>
        </div>
    );
}

const News = ({ user }) => {

    const dispatch = useDispatch()

    const blog = useSelector((state) => state.blogs.blogs)

    const [active, setActive] = useState(0)
    const [isLoaded, setIsLoaded] = useState(false);
    const [blogs, setBlogs] = useState([])

    useEffect(() => {
        dispatch(getBlogs({
            id: user ? user.result?._id : ''
        }))
    }, [])

    useEffect(() => {
        if(blog.length > 0) {
            setBlogs(blog.slice(0, 4))
        }    
    }, [blog])

    useEffect(() => {{
        const timeout = setTimeout(() => {
            setIsLoaded(true)
        }, 250)
      
        return () => clearTimeout(timeout)

    }}, [isLoaded])

    return (
        <div className='sm:mb-8 mb-32'>
            <div className='container mx-auto flex-wrap'>
                <TextWithLines text="Latest Blogs"/>
            </div>
            <section className={`container mx-auto py-8`}>
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2">
                        {
                            blogs.length > 0 &&
                                blogs.map((item, index) => {
                                    var first_paragraph = getFirstParagraph(item.content)
                                    return (
                                        <Content
                                            id={index}
                                            key={index}
                                            image={convertDriveImageLink(item.featured_image)}
                                            title={item.post_title}
                                            description={first_paragraph}
                                            date={convertTimezone(item.createdAt)}
                                            active={active === index}
                                            setActive={setActive}
                                            setIsLoaded={setIsLoaded}
                                        />
                                    )
                                })
                        }
                    </div>
                    <div className={`w-full md:h-96 h-96 md:w-1/2 border-solid border-1 border-[#696969] relative`}>
                        {
                            blogs.length > 0 &&
                                <>
                                    <img 
                                        src={convertDriveImageLink(blogs[active].featured_image)} 
                                        alt="featured image" 
                                        className={`object-cover w-full h-full border-solid border border-[#696969] transition-opacity duration-500 ease-in-out
                                        ${isLoaded ? 'visible opacity-100' : 'opacity-0 invisible'}`} 
                                    />
                                    <div className={`absolute w-auto h-auto bg-[#CD3242] top-8 right-0 font-poppins p-2 rounded-bl-md rounded-tl-md
                                        ${isLoaded ? 'visible opacity-100' : 'opacity-0 invisible'}
                                    `}>
                                        <p className={`text-white text-sm font-semibold capitalize`}>{blogs[active].categories}</p>
                                    </div>
                                    <div className='md:absolute sm:absolute relative w-full h-1/3 bottom-0 font-poppins p-4'>
                                        <div className='absolute w-full h-full bg-[#1F2937] opacity-80 bottom-0 left-0 font-poppins p-4'></div>
                                        <div className='relative z-10'>
                                            <h3 className="text-base font-semibold text-white uppercase mb-2">{blogs[active].post_title}</h3>
                                            <p className="text-sm font-normal text-white leading-relaxed md:mb-4 mb-2">{<TextWithEllipsis text={getFirstParagraph(blogs[active].content)} />}</p>
                                            
                                            <div className="flex flex-row">
                                                <div className="w-1/2">
                                                    <p className="text-xs font-normal leading-relaxed text-[#A0A7AB]"><FontAwesomeIcon icon={faCalendar} className="mr-1" />{convertTimezone(blogs[active].createdAt)}</p>
                                                </div>
                                                <div className="w-1/2 text-right mr-4">
                                                    <a href={`/blogs/${blogs[active]._id}`} className="text-sm font-semibold font-normal leading-relaxed text-white uppercase hover:text-[#FFFF00]"> Read More <FontAwesomeIcon icon={faArrowRight} className="ml-1" /> </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                        }
                    </div>
                </div>
            </section>
        </div>
    );
}

export default News