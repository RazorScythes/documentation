import React, { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideo, faGamepad, faProjectDiagram, faWallet, faBriefcase, faGlobe, faShieldAlt, faBolt, faPalette, faUsers, faCode, faCheckCircle, faCogs, faLaptopCode, faRocket, faStar } from '@fortawesome/free-solid-svg-icons'
import { Hero } from '../index'
import { main, dark, light } from '../../style'
import styles from '../../style'

const features = [
    { icon: faVideo, title: 'Videos', desc: 'Watch, upload, and share video content with the community.', accent: 'from-blue-600 to-blue-400' },
    { icon: faGamepad, title: 'Games', desc: 'Discover indie games, leave reviews, and rate your favorites.', accent: 'from-violet-600 to-violet-400' },
    { icon: faProjectDiagram, title: 'Projects', desc: 'Showcase development projects with changelogs and galleries.', accent: 'from-emerald-600 to-emerald-400' },
    { icon: faWallet, title: 'Budget', desc: 'Track expenses, manage savings, and monitor debts in one place.', accent: 'from-amber-600 to-amber-400' },
    { icon: faBriefcase, title: 'Portfolio', desc: 'Build a professional portfolio with customizable sections.', accent: 'from-rose-600 to-rose-400' },
    { icon: faGlobe, title: 'Pages', desc: 'Create and publish custom web pages with a drag-and-drop builder.', accent: 'from-cyan-600 to-cyan-400' },
]

const highlights = [
    { icon: faBolt, title: 'Performance First', desc: 'Optimized for speed with lazy loading and efficient rendering.' },
    { icon: faShieldAlt, title: 'Secure by Default', desc: 'JWT authentication, encrypted passwords, and session management.' },
    { icon: faPalette, title: 'Dark & Light Themes', desc: 'Switch between themes instantly across every page.' },
    { icon: faCogs, title: 'Real-time Updates', desc: 'Live notifications, comments, and likes via WebSockets.' },
    { icon: faUsers, title: 'Community Features', desc: 'Comments, ratings, subscriptions, and messaging built-in.' },
    { icon: faLaptopCode, title: 'Developer Friendly', desc: 'Clean API design with modular, well-organized code.' },
]

const steps = [
    { number: '01', title: 'Sign Up', desc: 'Create your account in seconds.' },
    { number: '02', title: 'Explore', desc: 'Browse content and discover tools.' },
    { number: '03', title: 'Create', desc: 'Upload and build your presence.' },
    { number: '04', title: 'Connect', desc: 'Engage with the community.' },
]

const testimonials = [
    { name: 'Alex M.', role: 'Game Developer', quote: 'This platform made it so easy to showcase my indie games and get feedback from the community.', color: 'bg-blue-600' },
    { name: 'Sarah K.', role: 'Content Creator', quote: 'I love how everything is in one place. Videos, portfolio, budget tracking — it just works.', color: 'bg-violet-600' },
    { name: 'James L.', role: 'Web Designer', quote: 'The page builder is intuitive and powerful. I built my portfolio site in under an hour.', color: 'bg-emerald-600' },
]

const techStack = [
    { name: 'React', desc: 'Component-based UI' },
    { name: 'Vite', desc: 'Lightning-fast builds' },
    { name: 'Node.js', desc: 'Server-side runtime' },
    { name: 'Express', desc: 'REST API framework' },
    { name: 'MongoDB', desc: 'NoSQL database' },
    { name: 'Tailwind', desc: 'Utility-first CSS' },
    { name: 'Socket.IO', desc: 'Real-time events' },
    { name: 'Redux', desc: 'State management' },
]

const Home = ({ user, theme }) => {
    const isLight = theme === 'light'

    const sectionBg = isLight ? 'bg-white' : 'bg-[#0A0A0A]'
    const altBg = isLight ? 'bg-slate-50' : 'bg-[#111111]'
    const cardClass = `rounded-xl border border-solid ${
        isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-[#141414] border-[#222]'
    }`
    const heading = `text-2xl sm:text-3xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`
    const subtext = `text-sm ${isLight ? 'text-slate-500' : 'text-gray-400'}`
    const label = `text-xs font-semibold tracking-widest uppercase mb-3 ${isLight ? 'text-blue-600' : 'text-blue-400'}`

    useEffect(() => {
        document.title = 'Home'
    }, [])

    return (
        <div className={`relative ${main.font}`}>
            <Hero theme={theme} user={user} />

            {/* Everything below scrolls over the fixed hero */}
            <div className="relative" style={{ zIndex: 2 }}>

                {/* Features */}
                <section className={`${sectionBg}`}>
                    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                        <div className={`${styles.boxWidth}`}>
                            <div className={`${main.container} px-4 py-20 sm:py-24`}>
                                <p className={`${label} text-center`}>Features</p>
                                <h2 className={`${heading} text-center mb-4`}>Everything You Need</h2>
                                <p className={`${subtext} text-center max-w-lg mx-auto mb-14`}>
                                    Six integrated tools designed to help you create, manage, and share your work from a single platform.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {features.map((feat, i) => (
                                        <div key={i} className={`${cardClass} p-6`}>
                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feat.accent} flex items-center justify-center mb-4`}>
                                                <FontAwesomeIcon icon={feat.icon} className="text-white text-sm" />
                                            </div>
                                            <h3 className={`text-base font-semibold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>{feat.title}</h3>
                                            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{feat.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className={`${altBg}`}>
                    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                        <div className={`${styles.boxWidth}`}>
                            <div className={`${main.container} px-4 py-20 sm:py-24`}>
                                <p className={`${label} text-center`}>Why Us</p>
                                <h2 className={`${heading} text-center mb-4`}>Built Different</h2>
                                <p className={`${subtext} text-center max-w-lg mx-auto mb-14`}>
                                    A carefully crafted platform with attention to detail in every corner.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {highlights.map((item, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/20 text-blue-400'}`}>
                                                <FontAwesomeIcon icon={item.icon} className="text-sm" />
                                            </div>
                                            <div>
                                                <h3 className={`text-sm font-semibold mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>{item.title}</h3>
                                                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className={`${sectionBg}`}>
                    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                        <div className={`${styles.boxWidth}`}>
                            <div className={`${main.container} px-4 py-20 sm:py-24`}>
                                <p className={`${label} text-center`}>Getting Started</p>
                                <h2 className={`${heading} text-center mb-4`}>How It Works</h2>
                                <p className={`${subtext} text-center max-w-lg mx-auto mb-14`}>
                                    Four simple steps to go from new user to active creator.
                                </p>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                    {steps.map((step, i) => (
                                        <div key={i} className={`${cardClass} p-6 text-center relative overflow-hidden`}>
                                            <span className={`absolute -top-3 -right-1 text-6xl font-black select-none pointer-events-none ${isLight ? 'text-slate-100' : 'text-[#1a1a1a]'}`}>{step.number}</span>
                                            <div className="relative">
                                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center mx-auto mb-4 text-white font-bold text-sm">
                                                    {step.number}
                                                </div>
                                                <h3 className={`text-sm font-semibold mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>{step.title}</h3>
                                                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className={`${altBg}`}>
                    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                        <div className={`${styles.boxWidth}`}>
                            <div className={`${main.container} px-4 py-20 sm:py-24`}>
                                <p className={`${label} text-center`}>Testimonials</p>
                                <h2 className={`${heading} text-center mb-4`}>What People Say</h2>
                                <p className={`${subtext} text-center max-w-lg mx-auto mb-14`}>
                                    Real feedback from real users.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {testimonials.map((t, i) => (
                                        <div key={i} className={`${cardClass} p-6 flex flex-col`}>
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                                                    {t.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{t.name}</p>
                                                    <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{t.role}</p>
                                                </div>
                                            </div>
                                            <p className={`text-sm leading-relaxed flex-1 italic ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                                                "{t.quote}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tech Stack */}
                <section className={`${sectionBg}`}>
                    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                        <div className={`${styles.boxWidth}`}>
                            <div className={`${main.container} px-4 py-20 sm:py-24`}>
                                <p className={`${label} text-center`}>Technology</p>
                                <h2 className={`${heading} text-center mb-4`}>Built with Modern Tech</h2>
                                <p className={`${subtext} text-center max-w-lg mx-auto mb-14`}>
                                    Powered by a modern stack chosen for performance, scalability, and developer experience.
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {techStack.map((tech, i) => (
                                        <div key={i} className={`${cardClass} p-5 text-center`}>
                                            <p className={`text-sm font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>{tech.name}</p>
                                            <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{tech.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className={`${altBg}`}>
                    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                        <div className={`${styles.boxWidth}`}>
                            <div className={`${main.container} px-4 py-20 sm:py-24 text-center`}>
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center mx-auto mb-6`}>
                                    <FontAwesomeIcon icon={faRocket} className="text-white text-lg" />
                                </div>
                                <h2 className={`${heading} mb-4`}>Ready to Explore?</h2>
                                <p className={`${subtext} max-w-md mx-auto mb-8`}>
                                    Join the community and start sharing your videos, games, and projects with the world.
                                </p>
                                <button className={`${isLight ? light.button : dark.button} rounded-md px-8 py-2.5`}>
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}

export default Home
