import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { sendEmail, clearMailStatus } from '../../actions/portfolio'
import SideAlert from '../SideAlert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faArrowRight, faArrowDown, faCircleCheck, faCode, faBriefcase, faLock, faGlobe, faMapMarkerAlt, faCalendarAlt, faExternalLinkAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import { faFacebookF, faTwitter, faInstagram, faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { getPortfolioByUsername } from '../../actions/portfolio'
import { convertDriveImageLink } from '../Tools'
import { main, dark, light } from '../../style'
import styles from '../../style'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { MotionAnimate } from 'react-motion-animate'

library.add(fas, far, fab)

const SafeIcon = ({ name, cls }) => {
    try { return <FontAwesomeIcon icon={['fas', name]} className={cls} /> }
    catch { return <FontAwesomeIcon icon={faCode} className={`${cls} opacity-30`} /> }
}

const Badge = ({ children, isLight }) => (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'}`}>{children}</span>
)

/* ═══════════════════════ HERO ═══════════════════════ */

const ViewHero = ({ hero, isLight, onContact }) => {
    if (!hero) return null
    const socials = [
        { key: 'facebook', icon: faFacebookF, data: hero.social_links?.facebook, color: '#1877F2' },
        { key: 'twitter', icon: faTwitter, data: hero.social_links?.twitter, color: '#1DA1F2' },
        { key: 'instagram', icon: faInstagram, data: hero.social_links?.instagram, color: '#E4405F' },
        { key: 'github', icon: faGithub, data: hero.social_links?.github, color: '#333' },
        { key: 'linkedin', icon: faLinkedinIn, data: hero.social_links?.linkedin, color: '#0A66C2' },
    ].filter(s => s.data?.link && s.data?.show)

    return (
        <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
            <div className={`absolute top-20 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none ${isLight ? 'bg-blue-400' : 'bg-blue-600'}`} />
            <div className={`absolute -bottom-20 -left-32 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none ${isLight ? 'bg-violet-400' : 'bg-violet-600'}`} />

            <div className="relative md:flex items-center gap-12 lg:gap-20">
                <div className="md:w-1/2">
                    <MotionAnimate animation='fadeInUp' reset={false} distance={40} speed={0.8}>
                    <Badge isLight={isLight}>Portfolio</Badge>
                    <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {hero.full_name || 'Your Name'}
                    </h1>
                    {hero.profession?.length > 0 && (
                        <p className={`text-lg sm:text-xl font-semibold mb-6 ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                            {hero.profession.join('  ·  ')}
                        </p>
                    )}
                    {hero.description && (
                        <p className={`text-base leading-relaxed mb-8 max-w-lg ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{hero.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                        {hero.resume_link && (
                            <a href={hero.resume_link} target="_blank" rel="noreferrer"
                                className={`group px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 ${isLight ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/15'}`}>
                                Download CV <FontAwesomeIcon icon={faArrowDown} className="ml-2 text-xs group-hover:translate-y-0.5 transition-transform" />
                            </a>
                        )}
                        <button onClick={onContact}
                            className={`px-6 py-3 rounded-xl text-sm font-semibold border-2 border-solid transition-all hover:-translate-y-0.5 ${isLight ? 'border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600' : 'border-white/15 text-gray-300 hover:border-blue-500 hover:text-blue-400'}`}>
                            Get In Touch
                        </button>
                    </div>
                    {socials.length > 0 && (
                        <div className="flex items-center gap-2.5">
                            {socials.map(s => (
                                <a key={s.key} href={s.data.link} target="_blank" rel="noreferrer"
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:-translate-y-1 hover:shadow-lg ${isLight ? 'bg-white shadow-sm ring-1 ring-slate-100 text-slate-500 hover:text-blue-600 hover:shadow-blue-100' : 'bg-white/5 ring-1 ring-white/10 text-gray-400 hover:text-blue-400 hover:ring-blue-500/30'}`}>
                                    <FontAwesomeIcon icon={s.icon} className="text-sm" />
                                </a>
                            ))}
                        </div>
                    )}
                    </MotionAnimate>
                </div>
                {hero.image && (
                    <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
                        <MotionAnimate animation='fadeInUp' reset={false} distance={40} speed={1} delay={0.2}>
                        <div className="relative">
                            <div className={`absolute inset-0 rounded-3xl rotate-6 scale-105 opacity-20 blur-sm ${isLight ? 'bg-blue-500' : 'bg-blue-600'}`} />
                            <div className={`relative rounded-3xl overflow-hidden max-w-md w-full ${isLight ? 'shadow-2xl shadow-slate-300/50 ring-1 ring-white' : 'ring-1 ring-white/10'}`}>
                                <img src={convertDriveImageLink(hero.image)} alt={hero.full_name} className="w-full h-auto object-contain" />
                            </div>
                            {socials.length > 0 && (
                                <div className={`absolute -bottom-4 -left-4 px-4 py-2.5 rounded-xl flex items-center gap-2 ${isLight ? 'bg-white shadow-xl ring-1 ring-slate-100' : 'bg-[#1a1a1a] ring-1 ring-white/10'}`}>
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Available for work</span>
                                </div>
                            )}
                        </div>
                        </MotionAnimate>
                    </div>
                )}
            </div>
        </section>
    )
}

/* ═══════════════════════ SKILLS ═══════════════════════ */

const SkillRing = ({ name, percentage, hex, isLight }) => {
    const color = hex || '#3b82f6'
    const r = 42
    const circ = 2 * Math.PI * r
    const offset = circ - (percentage / 100) * circ

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={r} fill="none" strokeWidth="5"
                        stroke={isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)'} />
                    <circle cx="50" cy="50" r={r} fill="none" strokeWidth="5"
                        stroke={color} strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg sm:text-xl font-extrabold tabular-nums ${isLight ? 'text-slate-800' : 'text-white'}`}>{percentage}<span className={`text-[10px] font-bold ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>%</span></span>
                </div>
            </div>
            <p className={`text-xs sm:text-sm font-semibold mt-3 text-center ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{name}</p>
        </div>
    )
}

const ViewSkills = ({ skills, isLight }) => {
    if (!skills?.skill?.length) return null

    return (
        <section className="py-16 sm:py-24">
            <div className={`md:flex gap-12 lg:gap-16 ${skills.image ? 'items-start' : ''}`}>
                {skills.image && (
                    <div className="md:w-2/5 lg:w-1/3 mb-10 md:mb-0 flex-shrink-0">
                    <MotionAnimate animation='fadeInUp' reset={false} distance={30} speed={0.8}>
                        <div className={`rounded-2xl overflow-hidden ${isLight ? 'ring-1 ring-slate-100 shadow-lg' : 'ring-1 ring-white/10'}`}>
                            <img src={convertDriveImageLink(skills.image)} alt="Skills" className="w-full h-auto object-contain" />
                        </div>
                        {skills.icons?.filter(Boolean).length > 0 && (
                            <div className="flex items-center gap-2 mt-4">
                                {skills.icons.filter(Boolean).slice(0, 3).map((icon, i) => (
                                    <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-white shadow-sm ring-1 ring-slate-100' : 'bg-white/5 ring-1 ring-white/10'}`}>
                                        <img className="w-6 h-6 object-contain" src={convertDriveImageLink(icon)} alt="" />
                                    </div>
                                ))}
                                {skills.project_completed > 0 && (
                                    <>
                                        <div className={`w-px h-8 mx-1 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                                        <div className="flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faCircleCheck} className={`text-xs ${isLight ? 'text-emerald-500' : 'text-emerald-400'}`} />
                                            <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{skills.project_completed}+ projects</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </MotionAnimate>
                    </div>
                )}

                <MotionAnimate animation='fadeInUp' reset={false} distance={30} speed={0.8} delay={0.15}>
                <div className="flex-1 min-w-0">
                    <div className="mb-10">
                        <Badge isLight={isLight}>Skills</Badge>
                        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{skills.heading || 'My Expertise'}</h2>
                        {skills.description && (
                            <p className={`text-base leading-relaxed mt-3 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{skills.description}</p>
                        )}
                        {!skills.image && skills.project_completed > 0 && (
                            <div className="flex items-center gap-4 mt-5">
                                {skills.icons?.filter(Boolean).slice(0, 3).map((icon, i) => (
                                    <div key={i} className={`w-9 h-9 rounded-lg flex items-center justify-center ${isLight ? 'bg-white shadow-sm ring-1 ring-slate-100' : 'bg-white/5 ring-1 ring-white/10'}`}>
                                        <img className="w-5 h-5 object-contain" src={convertDriveImageLink(icon)} alt="" />
                                    </div>
                                ))}
                                <div className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faCircleCheck} className={`text-xs ${isLight ? 'text-emerald-500' : 'text-emerald-400'}`} />
                                    <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{skills.project_completed}+ projects</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-6 sm:gap-8">
                        {skills.skill.map((s, i) => (
                            <MotionAnimate key={i} animation='fadeInUp' reset={false} distance={20} speed={0.6} delay={0.1 * i}>
                                <SkillRing name={s.skill_name} percentage={s.percentage} hex={s.hex} isLight={isLight} />
                            </MotionAnimate>
                        ))}
                    </div>
                </div>
                </MotionAnimate>
            </div>
        </section>
    )
}

/* ═══════════════════════ SERVICES ═══════════════════════ */

const ViewServices = ({ services, isLight }) => {
    if (!services?.length) return null

    let counter = 0

    return (
        <section className="py-16 sm:py-24">
            <MotionAnimate animation='fadeInUp' reset={false} distance={30} speed={0.8}>
            <div className="mb-14">
                <Badge isLight={isLight}>What I Do</Badge>
                <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Services</h2>
                <p className={`text-base mt-3 max-w-lg ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Solutions I offer to bring your ideas to life</p>
            </div>
            </MotionAnimate>

            <div className="space-y-12">
                {services.map((cat, catIdx) => {
                    if (!cat.type_of_service?.length) return null
                    return (
                        <MotionAnimate key={catIdx} animation='fadeInUp' reset={false} distance={25} speed={0.7} delay={0.1 * catIdx}>
                        <div>
                            <div className={`flex items-center gap-4 mb-6 ${catIdx > 0 ? `pt-8 border-t border-solid ${isLight ? 'border-slate-100' : 'border-white/5'}` : ''}`}>
                                <h3 className={`text-xs font-bold uppercase tracking-[0.15em] ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>{cat.service_name}</h3>
                                <div className={`flex-1 h-px ${isLight ? 'bg-slate-100' : 'bg-white/5'}`} />
                                <span className={`text-[11px] font-semibold tabular-nums ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>{cat.type_of_service.length}</span>
                            </div>

                            <div className="space-y-0">
                                {cat.type_of_service.map((t, tIdx) => {
                                    counter++
                                    return (
                                        <div key={tIdx} className={`group flex items-start gap-4 sm:gap-6 py-5 transition-colors ${tIdx > 0 ? `border-t border-solid ${isLight ? 'border-slate-100/80' : 'border-white/[.04]'}` : ''}`}>
                                            <span className={`text-2xl sm:text-3xl font-extrabold tabular-nums leading-none pt-0.5 w-10 sm:w-12 text-right flex-shrink-0 ${isLight ? 'text-slate-200 group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-500'} transition-colors`}>
                                                {String(counter).padStart(2, '0')}
                                            </span>
                                            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 ${isLight ? 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600' : 'bg-white/[.03] text-gray-500 group-hover:bg-blue-600/10 group-hover:text-blue-400'}`}>
                                                <SafeIcon name={t.featured_icon} cls="text-lg" />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <h4 className={`text-base font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>{t.service_name}</h4>
                                                {t.service_description && (
                                                    <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{t.service_description}</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        </MotionAnimate>
                    )
                })}
            </div>
        </section>
    )
}

/* ═══════════════════════ EXPERIENCE ═══════════════════════ */

const ViewExperience = ({ experience, isLight }) => {
    if (!experience?.length) return null
    return (
        <section className="py-16 sm:py-24">
            <MotionAnimate animation='fadeInUp' reset={false} distance={30} speed={0.8}>
            <div className="text-center mb-12">
                <Badge isLight={isLight}>Career</Badge>
                <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Experience</h2>
                <p className={`text-base mt-3 max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Professional experiences that shaped my career</p>
            </div>
            </MotionAnimate>
            <MotionAnimate animation='fadeInUp' reset={false} distance={30} speed={0.8} delay={0.15}>
            <div className="max-w-3xl mx-auto relative">
                <div className={`absolute left-5 sm:left-1/2 top-0 bottom-0 w-px sm:-translate-x-px ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                {experience.map((e, i) => {
                    const isEven = i % 2 === 0
                    return (
                        <div key={i} className={`relative flex items-start gap-6 mb-10 sm:mb-0 ${i < experience.length - 1 ? 'sm:pb-12' : ''}`}>
                            <div className={`hidden sm:flex w-1/2 ${isEven ? 'justify-end pr-10' : 'order-2 pl-10'}`}>
                                <div className={`rounded-2xl p-5 w-full transition-all hover:-translate-y-1 ${isLight ? 'bg-white shadow-md ring-1 ring-slate-100 hover:shadow-xl' : 'bg-white/[.03] ring-1 ring-white/10 hover:ring-blue-500/30'}`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        {e.company_logo ? (
                                            <img src={convertDriveImageLink(e.company_logo)} className={`w-10 h-10 rounded-xl object-cover flex-shrink-0 ${isLight ? 'ring-1 ring-slate-200' : 'ring-1 ring-white/10'}`} alt="" />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-500/10 text-amber-400'}`}>
                                                <FontAwesomeIcon icon={faBriefcase} className="text-sm" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{e.position}</h3>
                                            <p className={`text-xs font-medium ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>{e.company_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span className={`text-[11px] flex items-center gap-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                            <FontAwesomeIcon icon={faCalendarAlt} className="text-[9px]" /> {e.year_start?.split('-')[0]} – {e.year_end?.split('-')[0] || 'Present'}
                                        </span>
                                        {e.company_location && (
                                            <span className={`text-[11px] flex items-center gap-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[9px]" /> {e.company_location}
                                            </span>
                                        )}
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${e.remote_work
                                            ? (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400')
                                            : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-gray-400')
                                        }`}>{e.remote_work ? 'Remote' : 'Onsite'}</span>
                                    </div>
                                    {e.link && (
                                        <a href={e.link} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1 text-xs font-semibold mt-3 ${isLight ? 'text-blue-500 hover:text-blue-600' : 'text-blue-400 hover:text-blue-300'}`}>
                                            Visit <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[9px]" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className={`absolute left-5 sm:left-1/2 w-3 h-3 rounded-full -translate-x-1/2 mt-6 z-10 ring-4 ${isLight ? 'bg-blue-500 ring-blue-50' : 'bg-blue-500 ring-[#1C1C1C]'}`} />

                            <div className={`hidden sm:flex w-1/2 ${isEven ? 'order-2 pl-10 items-center' : 'justify-end pr-10 items-center'}`}>
                                <p className={`text-xs font-bold ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {e.year_start?.split('-')[0]} – {e.year_end?.split('-')[0] || 'Present'}
                                </p>
                            </div>

                            {/* Mobile card */}
                            <div className={`sm:hidden ml-10 flex-1 rounded-2xl p-4 ${isLight ? 'bg-white shadow-md ring-1 ring-slate-100' : 'bg-white/[.03] ring-1 ring-white/10'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    {e.company_logo ? (
                                        <img src={convertDriveImageLink(e.company_logo)} className="w-9 h-9 rounded-lg object-cover" alt="" />
                                    ) : (
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-500/10 text-amber-400'}`}>
                                            <FontAwesomeIcon icon={faBriefcase} className="text-sm" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{e.position}</h3>
                                        <p className={`text-xs ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>{e.company_name}</p>
                                    </div>
                                </div>
                                <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{e.year_start?.split('-')[0]} – {e.year_end?.split('-')[0] || 'Present'}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
            </MotionAnimate>
        </section>
    )
}

/* ═══════════════════════ PROJECTS ═══════════════════════ */

const carouselResponsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 4, partialVisibilityGutter: 20 },
    tablet: { breakpoint: { max: 1024, min: 640 }, items: 2, partialVisibilityGutter: 20 },
    mobile: { breakpoint: { max: 640, min: 0 }, items: 1, partialVisibilityGutter: 0 },
}

const CarouselArrow = ({ onClick, direction, isLight }) => (
    <button onClick={onClick}
        className={`absolute ${direction === 'left' ? 'left-0 right-16' : 'left-16 right-0'} bottom-0 mx-auto w-11 h-11 rounded-full flex items-center justify-center border border-solid transition-all z-10 ${isLight
            ? 'border-slate-300 text-slate-400 hover:bg-blue-600 hover:border-blue-600 hover:text-white'
            : 'border-gray-600 text-gray-400 hover:bg-blue-600 hover:border-blue-600 hover:text-white'
        }`}>
        <FontAwesomeIcon icon={direction === 'left' ? faChevronLeft : faChevronRight} className="text-sm" />
    </button>
)

const ViewProjects = ({ projects, isLight, username }) => {
    if (!projects?.length) return null

    return (
        <section className="py-16 sm:py-24">
            <div>
                <MotionAnimate animation='fadeInUp' reset={false} distance={30} speed={0.8}>
                <div className="mb-14">
                    <Badge isLight={isLight}>Portfolio</Badge>
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Recent Projects</h2>
                    <p className={`text-base mt-3 max-w-lg ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>A selection of my latest work</p>
                </div>
                </MotionAnimate>

                <MotionAnimate animation='fadeInUp' reset={false} distance={30} speed={0.8} delay={0.15}>
                <div className="relative">
                    <Carousel
                        responsive={carouselResponsive}
                        customLeftArrow={<CarouselArrow direction="left" isLight={isLight} />}
                        customRightArrow={<CarouselArrow direction="right" isLight={isLight} />}
                        slidesToSlide={1}
                        swipeable
                        draggable
                        autoPlay
                        infinite
                        autoPlaySpeed={4000}
                        transitionDuration={500}
                        containerClass="pb-24"
                        itemClass="px-3"
                    >
                        {projects.map((p, i) => {
                            const slug = p.project_name?.split(/[\/\s]+/).join("_")
                            return (
                                <div key={i} className="group">
                                    <div className={`overflow-hidden rounded-sm border ${isLight ? 'border-slate-200' : 'border-gray-700'}`}>
                                        {p.image ? (
                                            <img src={convertDriveImageLink(p.image)} alt={p.project_name}
                                                className="w-full h-[350px] sm:h-[400px] object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className={`flex items-center justify-center h-[350px] sm:h-[400px] ${isLight ? 'bg-slate-100' : 'bg-gray-800'}`}>
                                                <FontAwesomeIcon icon={faCode} className={`text-4xl ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                            </div>
                                        )}
                                    </div>
                                    <Link to={`/${username}/project/${slug}`}>
                                        <h3 className={`mt-5 text-xl sm:text-2xl font-semibold line-clamp-2 transition-all cursor-pointer ${isLight ? 'text-slate-800 hover:text-blue-600' : 'text-white hover:text-blue-400'}`}>{p.project_name}</h3>
                                    </Link>
                                    <p className={`mt-1 text-sm ${isLight ? 'text-slate-400' : 'text-gray-400'}`}>{p.category || 'Project'}</p>
                                </div>
                            )
                        })}
                    </Carousel>
                </div>
                </MotionAnimate>
            </div>
        </section>
    )
}

/* ═══════════════════════ CONTACT ═══════════════════════ */

const ViewContact = ({ contact, isLight, contactRef }) => {
    if (!contact?.email) return null

    const dispatch = useDispatch()
    const mailStatus = useSelector((state) => state.portfolio.mailStatus)

    const [submitted, setSubmitted] = useState(false)
    const [alertActive, setAlertActive] = useState(false)
    const [form, setForm] = useState({
        name: '',
        email: contact.email || '',
        sender_email: '',
        phone: '',
        subject: contact.subject || [],
        selectedSubject: '',
        message: ''
    })

    useEffect(() => {
        setForm(prev => ({ ...prev, email: contact.email || '', subject: contact.subject || [] }))
    }, [contact])

    useEffect(() => {
        if (mailStatus) {
            setAlertActive(true)
            dispatch(clearMailStatus())
            setForm(prev => ({ ...prev, name: '', sender_email: '', phone: '', selectedSubject: '', message: '' }))
            setSubmitted(false)
        }
    }, [mailStatus, dispatch])

    const isEmail = (text) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)

    const handleSubmit = () => {
        if (!form.name || !isEmail(form.sender_email) || !form.message || submitted) return
        setSubmitted(true)
        dispatch(sendEmail({ ...form, subject: form.selectedSubject || 'No Subject' }))
    }

    const inputCls = `w-full py-2.5 px-3 mt-1.5 outline-0 transition-all rounded-lg text-sm ${isLight
        ? 'bg-white border border-slate-200 text-slate-800 placeholder-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
        : 'bg-white/5 border border-white/10 text-gray-100 placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
    }`

    const labelCls = `block text-xs font-semibold uppercase tracking-wider mb-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`

    return (
        <section className="py-16 sm:py-24" ref={contactRef}>
            <SideAlert
                variants='success'
                heading='Success'
                paragraph='Your email was sent successfully'
                active={alertActive}
                setActive={setAlertActive}
            />

            <div className="md:flex gap-12 items-start">
                <div className="md:w-5/12 mb-10 md:mb-0">
                    <MotionAnimate animation='fadeInUp' reset={false} distance={30} speed={0.8}>
                    <Badge isLight={isLight}>Contact</Badge>
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Get In Touch
                    </h2>
                    <p className={`text-base leading-relaxed mb-8 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        Have a project in mind? Fill out the form and I'll get back to you as soon as possible.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
                                <FontAwesomeIcon icon={faEnvelope} className={`text-sm ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                            </div>
                            <a href={`mailto:${contact.email}`} className={`text-sm font-medium transition-colors ${isLight ? 'text-slate-600 hover:text-blue-600' : 'text-gray-300 hover:text-blue-400'}`}>
                                {contact.email}
                            </a>
                        </div>
                    </div>

                    {contact.subject?.length > 0 && (
                        <div className="mt-8">
                            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Services</p>
                            <div className="flex flex-wrap gap-2">
                                {contact.subject.map((s, i) => (
                                    <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-gray-400 ring-1 ring-white/10'}`}>{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    </MotionAnimate>
                </div>

                <div className={`md:w-7/12 rounded-2xl p-6 sm:p-8 ${isLight ? 'bg-white ring-1 ring-slate-100 shadow-sm' : 'bg-white/[.03] ring-1 ring-white/[.06]'}`}>
                    <MotionAnimate animation='fadeInUp' reset={false} distance={30} speed={0.8} delay={0.2}>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Full Name</label>
                            <input type="text" placeholder="Your name" value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Email Address</label>
                            <input type="email" placeholder="your@email.com" value={form.sender_email}
                                onChange={(e) => setForm({ ...form, sender_email: e.target.value })}
                                className={inputCls} />
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className={labelCls}>Phone</label>
                            <input type="tel" placeholder="Phone number" value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className={inputCls} />
                        </div>
                        {form.subject.length > 0 && (
                            <div>
                                <label className={labelCls}>Subject</label>
                                <select value={form.selectedSubject}
                                    onChange={(e) => setForm({ ...form, selectedSubject: e.target.value })}
                                    className={inputCls}>
                                    <option value="" disabled hidden>Select a subject</option>
                                    {form.subject.map((item, i) => (
                                        <option key={i} value={item} className={isLight ? 'text-slate-800' : 'text-gray-900'}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className={labelCls}>Message</label>
                        <textarea placeholder="Tell me about your project..." rows="4" value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            className={`${inputCls} resize-none`} />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSubmit} disabled={submitted}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${submitted
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg'
                            }`}>
                            {submitted ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                    </MotionAnimate>
                </div>
            </div>
        </section>
    )
}

/* ═══════════════════════ MAIN ═══════════════════════ */

const PortfolioView = ({ theme }) => {
    const { username } = useParams()
    const dispatch = useDispatch()

    const portfolio = useSelector((state) => state.portfolio.data)
    const notFound = useSelector((state) => state.portfolio.notFound)
    const published = useSelector((state) => state.portfolio.published)
    const isLight = theme === 'light'

    const contactRef = useRef(null)

    useEffect(() => {
        if (username) dispatch(getPortfolioByUsername({ username }))
    }, [dispatch, username])

    if (notFound) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className="text-center px-6 max-w-md">
                    <div className="relative mx-auto mb-8 w-28 h-28">
                        <div className={`absolute inset-0 rounded-full ${isLight ? 'bg-slate-100' : 'bg-white/[.03]'}`} />
                        <div className={`absolute inset-3 rounded-full flex items-center justify-center ${isLight ? 'bg-white shadow-sm' : 'bg-white/[.05]'}`}>
                            <FontAwesomeIcon icon={faGlobe} className={`text-3xl ${isLight ? 'text-slate-200' : 'text-gray-700'}`} />
                        </div>
                    </div>
                    <h1 className={`text-7xl font-black tracking-tighter mb-2 ${isLight ? 'text-slate-200' : 'text-white/10'}`}>404</h1>
                    <h2 className={`text-xl font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-white'}`}>Portfolio Not Found</h2>
                    <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>The portfolio you're looking for doesn't exist or may have been removed.</p>
                    <Link to="/" className={`inline-flex items-center gap-2 mt-6 text-sm font-semibold transition-colors ${isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'}`}>
                        <FontAwesomeIcon icon={faArrowDown} className="text-xs -rotate-90" /> Go back home
                    </Link>
                </div>
            </div>
        )
    }

    if (published) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className="text-center px-6 max-w-md">
                    <div className="relative mx-auto mb-8 w-28 h-28">
                        <div className={`absolute inset-0 rounded-full ${isLight ? 'bg-amber-50' : 'bg-amber-500/[.05]'}`} />
                        <div className={`absolute inset-3 rounded-full flex items-center justify-center ${isLight ? 'bg-white shadow-sm' : 'bg-white/[.05]'}`}>
                            <FontAwesomeIcon icon={faLock} className={`text-2xl ${isLight ? 'text-amber-300' : 'text-amber-500/40'}`} />
                        </div>
                    </div>
                    <h2 className={`text-xl font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-white'}`}>Portfolio Unavailable</h2>
                    <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>This portfolio is currently set to private by the owner. Check back later — it might be published soon.</p>
                    <Link to="/" className={`inline-flex items-center gap-2 mt-6 text-sm font-semibold transition-colors ${isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'}`}>
                        <FontAwesomeIcon icon={faArrowDown} className="text-xs -rotate-90" /> Go back home
                    </Link>
                </div>
            </div>
        )
    }

    if (!portfolio || !portfolio.hero) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-14 h-14">
                        <div className={`absolute inset-0 rounded-full border-2 border-dashed animate-spin ${isLight ? 'border-slate-200' : 'border-white/10'}`} style={{ animationDuration: '3s' }} />
                        <div className={`absolute inset-2 rounded-full border-2 border-t-transparent animate-spin ${isLight ? 'border-blue-500' : 'border-blue-400'}`} />
                    </div>
                    <div className="text-center">
                        <p className={`text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>Loading Portfolio</p>
                        <p className={`text-xs ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>Please wait a moment...</p>
                    </div>
                </div>
            </div>
        )
    }

    const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: 'smooth' })

    return (
        <div className={`min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <ViewHero hero={portfolio.hero} isLight={isLight} onContact={scrollToContact} />
                    {portfolio.skills?.skill?.length > 0 && <ViewSkills skills={portfolio.skills} isLight={isLight} />}
                    {portfolio.services?.length > 0 && <ViewServices services={portfolio.services} isLight={isLight} />}
                    {portfolio.experience?.length > 0 && <ViewExperience experience={portfolio.experience} isLight={isLight} />}
                    {portfolio.projects?.length > 0 && <ViewProjects projects={portfolio.projects} isLight={isLight} username={username} />}
                    {portfolio.contact?.email && <ViewContact contact={portfolio.contact} isLight={isLight} contactRef={contactRef} />}
                    <div className="h-10" />
                </div>
            </div>
        </div>
    )
}

export default PortfolioView
