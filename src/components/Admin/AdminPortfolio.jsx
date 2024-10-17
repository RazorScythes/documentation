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

import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

import styles from '../../style'

const AdminPortfolio = ({ user, path }) => {

    const dispatch = useDispatch()
    const navigate  = useNavigate()

    const portfolio = useSelector((state) => state.portfolio.data)
    const hero = useSelector((state) => state.portfolio.data?.hero)
    const skills = useSelector((state) => state.portfolio.data?.skills)
    const services = useSelector((state) => state.portfolio.data?.services)
    const experience = useSelector((state) => state.portfolio.data?.experience)
    const projects = useSelector((state) => state.portfolio.data?.projects)
    const contact = useSelector((state) => state.portfolio.data?.contact)

    const [open, setOpen] = useState({
        portfolio: false,
        pages: false,
        uploads: false,
        manage: false,
    })
    const [isOpen, setIsOpen] = useState(false)

    const [index, setIndex] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams();

    const portfolioPage = searchParams.get('navigation')

    const lowercaseArray = portfolio_selector.map(element => element.toLowerCase());
    const lowercaseSearchString = searchParams.get('navigation') !== null ? portfolioPage.toLowerCase() : '';

    const pageIndex = lowercaseArray.indexOf(lowercaseSearchString) > 0 ? lowercaseArray.indexOf(lowercaseSearchString) : 0

    useEffect(() => {
        if(!user) navigate(`/`)
        setOpen({...open, portfolio: true})
        dispatch(getPortfolio({id: user.result?._id}))
    }, [])

    useEffect(() => {
        setSubmitted(false)
    }, [portfolio])

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
            <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} open={open} setOpen={setOpen} path={path}/>
            <div class="flex flex-col flex-1">
                <AdminNavbar isOpen={isOpen} setIsOpen={setIsOpen} path={path}/>
                <main class="h-full pb-16 overflow-y-auto">
                    <div class="mx-auto grid">
                        <Header 
                            heading='Portfolio'
                            description="Build your portfolio like a professional!"
                            button_text={portfolio && portfolio.published ? "Published" : "Private"}
                            button_secondary_text={portfolio && portfolio.published ? "Updating" : "Updating"}
                            api_call={portfolio && portfolio.published ? unpublishPortfolio({id: user.result?._id}) : publishPortfolio({id: user.result?._id})}
                            setSubmitted={setSubmitted}
                            submitted={submitted}
                            grid_type='half'
                            data={[
                                {
                                    label: 'user_visit',
                                    value: portfolio && portfolio.visited ? portfolio.visited.length : 0
                                },
                                {
                                    label: 'form_submit',
                                    value: portfolio && portfolio.form_submit ? portfolio.form_submit.length : 0
                                }
                            ]}
                        />
                        <div className="relative bg-[#F9FAFB]">   
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
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminPortfolio