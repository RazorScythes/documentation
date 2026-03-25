import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faUser, faBriefcase, faLaptopCode, faCogs, faProjectDiagram,
    faAddressBook, faLayerGroup, faGlobe, faLock, faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons'
import { getPortfolio, publishPortfolio, unpublishPortfolio, clearAlert } from '../../actions/portfolio'
import { main, dark, light } from '../../style'
import styles from '../../style'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import Notification from '../Custom/Notification'

import HeroSection from '../PortfolioBuilder/sections/Hero'
import SkillsSection from '../PortfolioBuilder/sections/Skills'
import ServicesSection from '../PortfolioBuilder/sections/Services'
import ExperienceSection from '../PortfolioBuilder/sections/Experience'
import ProjectsSection from '../PortfolioBuilder/sections/Projects'
import ContactSection from '../PortfolioBuilder/sections/Contact'

library.add(fas, far, fab)

const SECTION_TABS = [
    { id: 0, label: 'Hero', icon: faUser },
    { id: 1, label: 'Skillset', icon: faLaptopCode },
    { id: 2, label: 'Services', icon: faCogs },
    { id: 3, label: 'Experience', icon: faBriefcase },
    { id: 4, label: 'Projects', icon: faProjectDiagram },
    { id: 5, label: 'Contact', icon: faAddressBook },
]

const PortfolioBuilder = ({ user, theme }) => {
    const dispatch = useDispatch()
    const portfolio = useSelector((state) => state.portfolio.data)
    const portfolioAlert = useSelector((state) => state.portfolio.alert)
    const portfolioVariant = useSelector((state) => state.portfolio.variant)

    const isLight = theme === 'light'
    const [sectionIndex, setSectionIndex] = useState(0)
    const [notification, setNotification] = useState({})
    const [showNotif, setShowNotif] = useState(false)
    const [publishing, setPublishing] = useState(false)

    const isPublished = portfolio?.published || false

    useEffect(() => {
        if (user) dispatch(getPortfolio({ id: user.result?._id }))
    }, [dispatch, user])

    useEffect(() => {
        if (portfolioAlert && portfolioVariant) {
            setNotification({ message: portfolioAlert, variant: portfolioVariant })
            setShowNotif(true)
            dispatch(clearAlert())
            setPublishing(false)
        }
    }, [portfolioAlert, portfolioVariant])

    useEffect(() => {
        if (!showNotif) setNotification({})
    }, [showNotif])

    const handleTogglePublish = async () => {
        if (publishing) return
        setPublishing(true)
        try {
            if (isPublished) {
                await dispatch(unpublishPortfolio()).unwrap()
            } else {
                await dispatch(publishPortfolio()).unwrap()
            }
        } catch {
            setPublishing(false)
        }
    }

    const card = `rounded-xl border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-slate-200/80' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`
    const inputCls = `w-full px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`
    const selectCls = `px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all cursor-pointer ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`
    const btnPrimary = `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLight ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`
    const btnSecondary = `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300'}`
    const labelCls = `block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`

    const sectionProps = { user, isLight, card, inputCls, selectCls, btnPrimary, btnSecondary, labelCls }

    if (!user) {
        return (
            <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className="flex items-center justify-center py-32">
                            <div className={`text-center ${card} p-8`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                                    <FontAwesomeIcon icon={faLayerGroup} className={`text-xl ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                                </div>
                                <h2 className={`text-lg font-semibold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>Login Required</h2>
                                <p className={`text-sm mb-5 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Please log in to access the Portfolio Builder.</p>
                                <a href="/login" className={btnPrimary}>Login</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const currentUser = JSON.parse(localStorage.getItem('profile'))
    const username = user.result?.username || currentUser?.username || currentUser?.result?.username

    return (
        <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="relative px-0 my-6 sm:my-12">

                        <Notification theme={theme} data={notification} show={showNotif} setShow={setShowNotif} />

                        {/* Header Card */}
                        <div className={`${card} p-4 sm:p-6 mb-4`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                                        <FontAwesomeIcon icon={faLayerGroup} className={`text-base sm:text-lg ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                                    </div>
                                    <div>
                                        <h1 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Portfolio Builder</h1>
                                        <p className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Manage your portfolio sections and content</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleTogglePublish} disabled={publishing}
                                        className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-50 ${
                                            isPublished
                                                ? (isLight ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-emerald-600 text-white hover:bg-emerald-700')
                                                : (isLight ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-[#1f1f1f] text-gray-400 hover:bg-[#2a2a2a]')
                                        }`}>
                                        {publishing ? (
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                {isPublished ? 'Unpublishing...' : 'Publishing...'}
                                            </span>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={isPublished ? faGlobe : faLock} className="text-xs" />
                                                {isPublished ? 'Published' : 'Unpublished'}
                                            </>
                                        )}
                                    </button>
                                    <a href={`/${username}/portfolio`} target="_blank" rel="noreferrer"
                                        className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${isLight ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30'}`}>
                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" /> Visit
                                    </a>
                                </div>
                            </div>

                            {/* Section Tabs */}
                            <div className="flex gap-1 mt-4 overflow-x-auto pb-1 -mx-1 px-1">
                                {SECTION_TABS.map(tab => (
                                    <button key={tab.id} onClick={() => setSectionIndex(tab.id)}
                                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${sectionIndex === tab.id
                                            ? (isLight ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-600 text-white')
                                            : (isLight ? 'text-slate-500 hover:bg-slate-50' : 'text-gray-400 hover:bg-[#1a1a1a]')
                                        }`}>
                                        <FontAwesomeIcon icon={tab.icon} className="text-xs" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Edit Sections */}
                        {sectionIndex === 0 && <HeroSection portfolio={portfolio?.hero} {...sectionProps} />}
                        {sectionIndex === 1 && <SkillsSection portfolio={portfolio?.skills} {...sectionProps} />}
                        {sectionIndex === 2 && <ServicesSection portfolio={portfolio?.services} {...sectionProps} />}
                        {sectionIndex === 3 && <ExperienceSection portfolio={portfolio?.experience} {...sectionProps} />}
                        {sectionIndex === 4 && <ProjectsSection portfolio={portfolio?.projects} {...sectionProps} />}
                        {sectionIndex === 5 && <ContactSection portfolio={portfolio?.contact} {...sectionProps} />}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default PortfolioBuilder
