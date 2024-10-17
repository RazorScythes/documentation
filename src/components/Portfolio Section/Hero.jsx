import React, { useEffect, useState } from "react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faTwitter, faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { TypeAnimation } from 'react-type-animation';
import { convertDriveImageLink } from '../Tools'
import 'react-lazy-load-image-component/src/effects/blur.css';
import styles from "../../style";

const Hero = ({ hero, resultRef }) => {
    
    const [heroData, setHeroData] = useState({
        image: '',
        full_name: '',
        description: '',
        profession: [],
        animation: false,
        resume_link: '',
        social_links: {}
    })

    const [professionTA, setProfessionTA] = useState([])

    useEffect(() => {
        if(hero){
            setHeroData({
                ...heroData,
                image: hero && hero.image && hero.image !== '' ? hero.image : 'https://img.freepik.com/free-vector/page-found-concept-illustration_114360-1869.jpg?w=2000',
                full_name: hero && hero.full_name && hero.full_name !== '' ? hero.full_name : 'Insert full name',
                description: hero && hero.description && hero.description !== '' ? hero.description : 'Insert description',
                profession: hero && hero.profession.length === 1 ? [...hero.profession, ...hero.profession] : hero.profession.length > 0 ? hero.profession : ['Insert profession', 'Insert profession'],
                animation: hero && hero.animation ? hero.animation : true,
                resume_link: hero && hero.resume_link ? hero.resume_link : '',
                social_links: hero && hero.social_links ? hero.social_links : {},
            })
        }
    }, [hero])

    useEffect(() => {
        if(heroData.profession.length > 0) {
            var arr = []
            heroData.profession.forEach((item) => {
                arr.push(item)
                arr.push(2000)
            })
            setProfessionTA(arr)
            console.log(arr)
        }
    }, [heroData.profession])

    const [index, setIndex] = useState(0)

    function TypingText({ texts, index, setIndex }) {
        const [currentText, setCurrentText] = useState("");
        const [isDeleting, setIsDeleting] = useState(false);
        const [typingSpeed, setTypingSpeed] = useState(200); // adjust typing speed here
        const [deletingSpeed, setDeletingSpeed] = useState(50); // adjust deleting speed here
        const [delay, setDelay] = useState(3000); // adjust delay between typing and deleting here
      
        useEffect(() => {
          let timer = null;
          let currentIndex = 0;
        function typeNextLetter() {
            //if(texts.length > 0)
                if (currentIndex >= texts[index].length) {
                // When the typing is done, start deleting
                setIsDeleting(true);
                setTimeout(() => {
                    setIsDeleting(false);
                }, delay);
                return;
                }

            if(currentIndex === 1)
                setCurrentText((prevText) => prevText + (texts[index].charAt(1)+texts[index].charAt(2)));
            else 
                setCurrentText((prevText) => prevText + texts[index].charAt(currentIndex));

            currentIndex++;
            timer = setTimeout(typeNextLetter, typingSpeed);
        }

          function deleteNextLetter() {
            setCurrentText((prevText) => prevText.slice(0, -1));
            timer = setTimeout(deleteNextLetter, deletingSpeed);    
          }
      
          if (isDeleting) {
            timer = setTimeout(deleteNextLetter, deletingSpeed);
          } else {
            timer = setTimeout(typeNextLetter, typingSpeed);
          }
      
          return () => {
            clearTimeout(timer);
          };
        }, [texts, index, isDeleting, typingSpeed, deletingSpeed, delay]);
        
        useEffect(() => {
            if (isDeleting && currentText === "") {
                // When the deleting is done, move on to the next text
                setIndex(index === texts.length - 1 ? 0 : index + 1);
                setIsDeleting(false)

                return
            }
        }, [currentText])

        return (
          <h2 className="flex text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-semibold text-white mb-8 tracking-tighter">
             {currentText} <p className="opacity-0">.</p>
          </h2>
        );
    }

    return (
        <div
            className="relative bg-cover bg-center py-14"
            style={{ backgroundColor: "#111221" }}
        >   
            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="absolute inset-0 "></div>
                    <div className="container mx-auto file:lg:px-8 relative px-0">
                        <div className="lg:flex md:flex items-center justify-evenly">
                            <div className="lg:w-3/5 md:w-3/5 w-full sm:px-4">
                                <h1 style={{lineHeight: "1.2em"}} className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-white mb-4 capitalize">
                                    <span style={{color: "#CD3242"}}>Hello I'm</span>, <br/><span className="text-5xl md:text-6xl">{ heroData.full_name }</span>
                                </h1>
                                {/* <TypingText texts={ heroData.profession } index={index} setIndex={setIndex} /> */}
                                <h2 className="flex text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-semibold text-white mb-8 tracking-tighter">
                                    {
                                        professionTA.length > 0 &&
                                        <TypeAnimation
                                            sequence={professionTA}
                                            wrapper="span"
                                            speed={50}
                                            repeat={Infinity}
                                        />
                                    }
                                </h2>
                                <p className="text-white text-lg sm:text-xl md:text-lg leading-relaxed mb-4">
                                    { heroData.description }
                                </p>

                                <div className="flex">
                                    {
                                        heroData.social_links?.facebook &&
                                            (heroData.social_links.facebook.link && heroData.social_links.facebook.show) &&
                                                <a href={heroData.social_links.facebook.link} target="_blank"><FontAwesomeIcon icon={faFacebookF} className='mr-4 w-4 h-4 text-gray-100 border border-solid border-bg-gray-100 rounded-full p-3 cursor-pointer hover:bg-gray-100 hover:text-gray-800 transition-all'/></a>
                                    }
                                    {
                                        heroData.social_links?.twitter &&
                                            (heroData.social_links.twitter.link && heroData.social_links.twitter.show) &&
                                                <a href={heroData.social_links.twitter.link} target="_blank"><FontAwesomeIcon icon={faTwitter} className='mr-4 w-4 h-4 text-gray-100 border border-solid border-bg-gray-100 rounded-full p-3 cursor-pointer hover:bg-gray-100 hover:text-gray-800 transition-all'/></a>
                                    }
                                    {
                                        heroData.social_links?.instagram &&
                                            (heroData.social_links.instagram.link && heroData.social_links.instagram.show) &&
                                                <a href={heroData.social_links.instagram.link} target="_blank"><FontAwesomeIcon icon={faInstagram} className='mr-4 w-4 h-4 text-gray-100 border border-solid border-bg-gray-100 rounded-full p-3 cursor-pointer hover:bg-gray-100 hover:text-gray-800 transition-all'/></a>
                                    }
                                    {
                                        heroData.social_links?.github &&
                                            (heroData.social_links.github.link && heroData.social_links.github.show) &&
                                                <a href={heroData.social_links.github.link} target="_blank"><FontAwesomeIcon icon={faGithub} className='mr-4 w-4 h-4 text-gray-100 border border-solid border-bg-gray-100 rounded-full p-3 cursor-pointer hover:bg-gray-100 hover:text-gray-800 transition-all'/></a>
                                    }
                                    {
                                        heroData.social_links?.linkedin &&
                                            (heroData.social_links.linkedin.link && heroData.social_links.linkedin.show) &&
                                                <a href={heroData.social_links.linkedin.link} target="_blank"><FontAwesomeIcon icon={faLinkedinIn} className='mr-4 w-4 h-4 text-gray-100 border border-solid border-bg-gray-100 rounded-full p-3 cursor-pointer hover:bg-gray-100 hover:text-gray-800 transition-all'/></a>
                                    }
                                </div>
                                <div className="flex xs:flex-row flex-col my-8 ">
                                    {
                                        heroData.resume_link && (
                                            <a href={heroData.resume_link} target="_blank" className="text-center mb-2 bg-transparent hover:bg-gray-100 hover:text-gray-800 text-gray-100 font-semibold py-2 px-8 border border-gray-100 rounded transition-colors duration-300 ease-in-out">
                                                Download CV
                                            </a>
                                        )
                                    }
                                    <button onClick={() => resultRef.current.scrollIntoView({ behavior: 'smooth' })} className="mb-2 bg-gray-100 hover:bg-transparent hover:text-gray-100 text-gray-800 font-semibold py-2 px-8 border border-gray-100 rounded transition-colors duration-300 ease-in-out xs:ml-2">
                                        Hire Me!
                                    </button>
                                </div>
                            </div>
                            <div className="lg:w-1/3 md:w-1/3 md:block hidden ml-0">
                                <div className="rounded-lg shadow-lg lg:w-[400px]">
                                    <LazyLoadImage
                                        className="rounded-md"
                                        effect="blur"
                                        alt="Hero Image"    
                                        placeholderSrc={convertDriveImageLink(heroData.image)}                  
                                        src={convertDriveImageLink(heroData.image)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-[-1.9em] h-24 w-full border-t-8 border-r-8 border-transparent bg-[#111827]" style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}></div>
        </div>
    );
};

export default Hero;
