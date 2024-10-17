import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { sendContactUs, clearMailStatus } from "../../actions/portfolio";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux'
import { AiOutlineArrowUp } from "react-icons/ai";
import { TextWithLines } from '../../components/index'
import { Link } from "react-router-dom";
import { nav_links } from "../../constants";
import SideAlert from "../SideAlert";

const Footer = ({ path }) => {

    const dispatch = useDispatch()

    const mailStatus = useSelector((state) => state.portfolio.mailStatus)

    const [form, setForm] = useState({
        name: '',
        email: '',
        message: ''
    })

    const [submitted, setSubmitted] = useState(false)
    const [active, setActive] = useState(false)

    useEffect(() => {
        if(mailStatus) {
            setActive(true)
            dispatch(clearMailStatus())
            setForm({
                ...form,
                name: '',
                email: '',
                message: ''
            })
            setSubmitted(false)
        }
    }, [mailStatus])

    const handleSubmit = (e) => {
        e.preventDefault()
        if(!submitted) {
            dispatch(sendContactUs(form))
            setSubmitted(true)
        }
    }

    return (
            <footer className="px-8 relative z-50 font-roboto font-semibold border-gray-300 text-gray-800 border-t border-solid shadow-inner text-sm transition-all">
                <SideAlert
                    variants='success'
                    heading='Success'
                    paragraph='Your email sent succesfully'
                    active={active}
                    setActive={setActive}
                />
                <div className="container mx-auto py-12 pb-2 flex flex-wrap justify-between">
                    <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mb-8">
                        <h3 className="text-base font-bold mb-8"><TextWithLines text="About me"/></h3>
                        <p className="mb-8 tracking-wide leading-6 font-normal drop-shadow-md">
                            Explore the latest games, consoles, and technologies, along with personal stories, insights, and experiences on this website. From reviews and walkthroughs to blog posts and videos, I offer a diverse range of content that is sure to keep you entertained and engaged.
                        </p>
                        <div className="flex">
                            <a
                                href="#"
                                className="mr-6 hover:text-blue-700 transition duration-300"
                                >
                                <FaFacebook size={24} />
                            </a>
                            <a
                                href="#"
                                className="mr-6 hover:text-blue-700 transition duration-300"
                                >
                                <FaTwitter size={24} />
                            </a>
                            <a
                                href="#"
                                className=" hover:text-blue-700 transition duration-300"
                                >
                                <FaInstagram size={24} />
                            </a>
                        </div>
                    </div>
                    <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/3 mb-8 sm:pl-40 pl-0">
                        <h3 className="text-2xl md:text-2xl font-bold leading-relaxed uppercase mb-8">Navigation</h3>
                        <ul className="list-none">
                            {
                                nav_links.map((link, i) => {
                                    return (
                                    <Link key={i} to={`${path}/${link.path}`} className="block mb-4 lg:mt-0  hover:text-blue-700 mr-4" onClick={() => setIsActive(!isActive)}>
                                        <FontAwesomeIcon icon={link.icon} className="mr-2" />
                                        {link.name}
                                    </Link>
                                    )
                                })
                            }
                        </ul>
                    </div>
                    <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/3 mb-8">
                        <h3 className="text-2xl md:text-2xl font-bold leading-relaxed uppercase mb-8">Contact Me</h3>
                        <form className="text-sm font-normal" onSubmit={handleSubmit}>
                            <div className="flex mb-4">
                            <label htmlFor="name" className="sr-only">
                                Name
                            </label>
                            <input
                                required
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Name"
                                value={form.name}
                                onChange={(e) => setForm({...form, name: e.target.value})}
                                className="block w-full px-4 py-2 outline-none border border-solid border-gray-300"
                                />
                            </div>
                            <div className="flex mb-4">
                            <label htmlFor="email" className="sr-only">
                                Email
                            </label>
                            <input
                                required
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => setForm({...form, email: e.target.value})}
                                className="block w-full px-4 py-2 outline-none border border-solid border-gray-300"
                                />
                            </div>
                            <div className="flex mb-4">
                            <label htmlFor="message" className="sr-only">
                                Message
                            </label>
                            <textarea
                                required
                                name="message"
                                id="message"
                                cols="30"
                                rows="4"
                                placeholder="Message"
                                value={form.message}
                                onChange={(e) => setForm({...form, message: e.target.value})}
                                className="block w-full px-4 py-2 outline-none border border-solid border-gray-300"
                                >
                            </textarea>
                            </div>
                            <button 
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-normal text-sm py-2 px-4 border hover:border-white rounded-sm transition-colors duration-300 ease-in-out">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
                <div className="py-4 border-t border-solid border-gray-300">
                    <div className="container mx-auto flex justify-between items-center">
                        <p className="text-sm">
                            © 2023 RazorScythe Website. All rights reserved.
                        </p>
                        <a href="#" className="p-2 px-2 hover:bg-blue-700 hover:text-white rounded-md transition-all">
                            <AiOutlineArrowUp size={16} />
                        </a>
                    </div>
                </div>
            </footer>
        );
};
                
export default Footer;
