import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faEnvelope, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { sendContactUs, clearMailStatus } from "../../actions/portfolio";
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux'
import { AiOutlineArrowUp } from "react-icons/ai";
import { Link } from "react-router-dom";
import { video_links } from "../../constants";
import { main, dark, light } from "../../style";

import SideAlert from "../SideAlert";
import Logo from '../../assets/logo.png'

const footerLinks = [
    { path: '/account', label: 'Account' },
    { path: '/budget', label: 'Budget' },
    { path: '/portfolio', label: 'Portfolio' },
]

const Footer = ({ theme }) => {
    const dispatch = useDispatch()
    const isLight = theme === 'light'

    const user = JSON.parse(localStorage.getItem('profile'))
    const mailStatus = useSelector((state) => state.portfolio.mailStatus)

    const [form, setForm] = useState({ name: '', email: '', message: '' })
    const [submitted, setSubmitted] = useState(false)
    const [active, setActive] = useState(false)

    useEffect(() => {
        if (mailStatus) {
            setActive(true)
            dispatch(clearMailStatus())
            setForm({ name: '', email: '', message: '' })
            setSubmitted(false)
        }
    }, [mailStatus])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!submitted) {
            dispatch(sendContactUs(form))
            setSubmitted(true)
        }
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const sectionTitle = `text-xs font-semibold tracking-widest uppercase mb-5 ${isLight ? 'text-slate-800' : 'text-white'}`
    const textColor = isLight ? 'text-slate-500' : 'text-gray-400'
    const linkColor = isLight ? 'text-slate-500 hover:text-blue-600' : 'text-gray-400 hover:text-blue-400'

    return (
        <footer className={`${main.font} relative z-40 border-t border-solid transition-all ${isLight ? 'bg-white border-slate-200' : 'bg-[#0A0A0A] border-[#1C1C1C]'}`}>
            <SideAlert
                variants='success'
                heading='Success'
                paragraph='Your email was sent successfully'
                active={active}
                setActive={setActive}
            />

            <div className="container mx-auto px-8 py-12 pb-0">
                <div className={`grid ${user ? 'lg:grid-cols-12' : 'lg:grid-cols-10'} md:grid-cols-2 grid-cols-1 gap-8 lg:gap-12`}>

                    {/* Brand */}
                    <div className="lg:col-span-4">
                        <Link to="">
                            <div className="flex items-center gap-2.5 mb-4">
                                <img className="h-8 w-8 rounded-full" src={Logo} alt="Logo" />
                                <span className={`font-roboto font-semibold text-lg ${isLight ? 'text-slate-800' : 'text-white'}`}>RazorScythe</span>
                            </div>
                        </Link>
                        <p className={`text-sm leading-relaxed mb-5 ${textColor}`}>
                            Explore games, projects, and technologies, along with personal stories, insights, and experiences. A diverse range of content to keep you entertained.
                        </p>
                        <div className="flex items-center gap-3">
                            {[
                                { icon: <FaFacebook size={13} />, label: 'Facebook' },
                                { icon: <FaTwitter size={13} />, label: 'Twitter' },
                                { icon: <FaInstagram size={13} />, label: 'Instagram' },
                                { icon: <FaGithub size={13} />, label: 'GitHub' },
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isLight ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-500 hover:text-white hover:bg-[#1C1C1C]'}`}
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="lg:col-span-2">
                        <h3 className={sectionTitle}>Navigate</h3>
                        <ul className="list-none space-y-2.5">
                            {video_links.map((link, i) => (
                                <li key={i}>
                                    <Link to={`/${link.path}`} className={`text-sm transition-all ${linkColor}`}>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links - only shown when logged in */}
                    {user && (
                        <div className="lg:col-span-2">
                            <h3 className={sectionTitle}>Links</h3>
                            <ul className="list-none space-y-2.5">
                                {footerLinks.map((link, i) => (
                                    <li key={i}>
                                        <Link to={link.path} className={`text-sm transition-all ${linkColor}`}>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Contact */}
                    <div className="lg:col-span-4">
                        <h3 className={sectionTitle}>Contact</h3>
                        <form className="space-y-2.5" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label htmlFor="footer-name" className="sr-only">Name</label>
                                    <input
                                        required
                                        type="text"
                                        id="footer-name"
                                        placeholder="Name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className={`block w-full px-3 py-2 text-sm ${isLight ? light.input : dark.input}`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="footer-email" className="sr-only">Email</label>
                                    <input
                                        required
                                        type="email"
                                        id="footer-email"
                                        placeholder="Email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className={`block w-full px-3 py-2 text-sm ${isLight ? light.input : dark.input}`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="footer-message" className="sr-only">Message</label>
                                <textarea
                                    required
                                    id="footer-message"
                                    rows="3"
                                    placeholder="Message"
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className={`block w-full px-3 py-2 text-sm resize-none ${isLight ? light.input : dark.input}`}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitted}
                                className={`${isLight ? light.button : dark.button} rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {submitted ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
                                        Sending...
                                    </span>
                                ) : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className={`border-t border-solid mt-10 ${isLight ? 'border-slate-200' : 'border-[#1C1C1C]'}`}>
                <div className="container mx-auto px-8 py-5 flex justify-between items-center">
                    <p className={`text-xs ${textColor}`}>
                        &copy; {new Date().getFullYear()} RazorScythe. All rights reserved.
                    </p>
                    <button
                        onClick={scrollToTop}
                        className={`p-1.5 rounded-md transition-all ${isLight ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-500 hover:text-white hover:bg-[#1C1C1C]'}`}
                        aria-label="Back to top"
                    >
                        <AiOutlineArrowUp size={14} />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
