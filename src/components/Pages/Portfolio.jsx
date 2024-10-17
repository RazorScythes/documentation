import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Hero, Skills, Services, Experience, Projects, Contact } from '../Portfolio Section/index'
import { useDispatch, useSelector } from 'react-redux'
import { getPortfolioByUsername } from "../../actions/portfolio";
import { Page_not_found, Error_forbiden } from '../../assets';
import { useRef } from "react";
import Loading from './Loading'
import styles from "../../style";

const Portfolio = () => {
    const resultRef = useRef(null);

    const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')))

    let { username } = useParams();

    const dispatch = useDispatch()

    const portfolio = useSelector((state) => state.portfolio.data)
    const hero = useSelector((state) => state.portfolio.data?.hero)
    const skills = useSelector((state) => state.portfolio.data?.skills)
    const services = useSelector((state) => state.portfolio.data?.services)
    const experience = useSelector((state) => state.portfolio.data?.experience)
    const projects = useSelector((state) => state.portfolio.data?.projects)
    const contact = useSelector((state) => state.portfolio.data?.contact)
    const notFound = useSelector((state) => state.portfolio.notFound)
    const published = useSelector((state) => state.portfolio.published)

    useEffect(() => {
        dispatch(getPortfolioByUsername({
            user_visit: user ? user.result?.username : '',
            username: username
        }))
    }, [])

    return (
        <div className='relative'>
            {
                notFound ?
                <div
                    className="relative bg-cover bg-center py-20"
                    style={{ backgroundColor: "#111827" }}
                >   
                    <div className={`${styles.marginX} ${styles.flexCenter}`}>
                        <div className={`${styles.boxWidthEx}`}>
                            <div className="flex flex-col justify-center items-center">
                                <img
                                    src={Page_not_found}
                                    alt="404 Error - Page Not Found"
                                    className="md:w-[550px] w-96 h-auto mb-8"
                                />
                                <h1 className="text-white text-4xl font-bold mb-4">Portfolio not Found</h1>
                                <p className="text-white text-lg mb-8">The portfolio you're looking for doesn't exist.</p>
                                <a href="/" className="text-white underline hover:text-gray-200">Go back to home page</a>
                            </div>
                        </div>
                    </div>
                </div>
                :
                published ?
                <div
                    className="relative bg-cover bg-center py-20"
                    style={{ backgroundColor: "#111827" }}
                >   
                    <div className={`${styles.marginX} ${styles.flexCenter}`}>
                        <div className={`${styles.boxWidthEx}`}>
                            <div className="flex flex-col justify-center items-center text-center">
                                <img
                                    src={Error_forbiden}
                                    alt="404 Error - Page Not Found"
                                    className="md:w-[550px] w-96 h-auto mb-8"
                                />
                                <h1 className="text-white sm:text-4xl text-2xl font-bold mb-4">Portfolio is not Accessible</h1>
                                <p className="text-white text-lg mb-8">Looks like the owner has not been published his/her portfolio or haven't updated it for a while now.</p>
                                <a href="/" className="text-white underline hover:text-gray-200">Go back to home page</a>
                            </div>
                        </div>
                    </div>
                </div>
                :
                Object.keys(portfolio).length !== 0 ? 
                    <>
                        <Hero hero={hero} resultRef={resultRef}/>
                        <Skills skills={skills}/>
                        {services.length > 0 && <Services services={services}/>}
                        {experience.length > 0 && <Experience experience={experience}/>}
                        {projects.length > 0 && <Projects projects={projects}/>}
                        <Contact contact={contact} ref={resultRef}/>
                    </>
                :
                    <Loading text="Loading portfolio" />

            }
        </div>
    )
}

export default Portfolio