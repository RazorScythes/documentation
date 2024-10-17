import React,{ useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Header } from './index'
import { uploadHero, getPortfolio, publishPortfolio, unpublishPortfolio } from "../../actions/portfolio";
import { portfolio_selector } from '../../constants';

import Hero from './sections/Hero';
import Skills from './sections/Skills';
import Services from './sections/Services';
import Experience from './sections/Experience';
import Projects from './sections/Projects';
import Contact from './sections/Contact';

import styles from '../../style'

const AccountPortfolio = ({ user }) => {

    const dispatch = useDispatch()
    const navigate  = useNavigate()

    const portfolio = useSelector((state) => state.portfolio.data)
    const hero = useSelector((state) => state.portfolio.data?.hero)
    const skills = useSelector((state) => state.portfolio.data?.skills)
    const services = useSelector((state) => state.portfolio.data?.services)
    const experience = useSelector((state) => state.portfolio.data?.experience)
    const projects = useSelector((state) => state.portfolio.data?.projects)
    const contact = useSelector((state) => state.portfolio.data?.contact)

    const [index, setIndex] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams();

    const portfolioPage = searchParams.get('navigation')

    const lowercaseArray = portfolio_selector.map(element => element.toLowerCase());
    const lowercaseSearchString = searchParams.get('navigation') !== null ? portfolioPage.toLowerCase() : '';

    const pageIndex = lowercaseArray.indexOf(lowercaseSearchString) > 0 ? lowercaseArray.indexOf(lowercaseSearchString) : 0

    useEffect(() => {
        if(!user) navigate(`/`)

        dispatch(getPortfolio({id: user.result?._id}))
    }, [])

    useEffect(() => {
        setSubmitted(false)
    }, [portfolio])

    return (
        <>
            <Header 
                heading='Portfolio'
                description="Select a website to manage, or create a new one from scratch."
                button_text={portfolio && portfolio.published ? "Unpublish" : "Publish Now"}
                button_secondary_text={portfolio && portfolio.published ? "Unpublishing" : "Publishing"}
                api_call={portfolio && portfolio.published ? unpublishPortfolio({id: user.result?._id}) : publishPortfolio({id: user.result?._id})}
                setSubmitted={setSubmitted}
                submitted={submitted}
                counter_text="User visited"
                counter={portfolio && portfolio.visited ? portfolio.visited.length : 0}
            />
            <div className="relative bg-[#F0F4F7]">   
                <div className={`${styles.marginX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        {
                            user &&
                            <>
                                {
                                    (portfolioPage === 'hero' || (portfolioPage === '' || portfolioPage === null)) &&
                                        <Hero 
                                            user={user}
                                            portfolio={hero}
                                            index={pageIndex ? pageIndex : 0}
                                            setIndex={setIndex}
                                        />
                                }
                                {
                                    (portfolioPage === 'skillset') &&
                                        <Skills 
                                            user={user}
                                            portfolio={skills}
                                            index={pageIndex}
                                            setIndex={setIndex}
                                        />
                                }
                                {
                                    (portfolioPage === 'services') &&
                                        <Services
                                            user={user}
                                            portfolio={services}
                                            index={pageIndex}
                                            setIndex={setIndex}
                                        />
                                }
                                {
                                    (portfolioPage === 'work experience') &&
                                        <Experience
                                            user={user}
                                            portfolio={experience}
                                            index={pageIndex}
                                            setIndex={setIndex}
                                        />
                                }
                                {
                                    (portfolioPage === 'projects') &&
                                        <Projects
                                            user={user}
                                            portfolio={projects}
                                            index={pageIndex}
                                            setIndex={setIndex}
                                        />
                                }
                                {
                                    (portfolioPage === 'contact') &&
                                        <Contact
                                            user={user}
                                            portfolio={contact}
                                            index={pageIndex}
                                            setIndex={setIndex}
                                        />
                                }
                            </>
                        } 
                    </div>
                </div>
            </div>
        </>
    )
}

export default AccountPortfolio