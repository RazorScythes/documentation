import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { sendContactUs, clearMailStatus } from "../actions/portfolio";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux'
import { AiOutlineArrowUp } from "react-icons/ai";
import { TextWithLines } from '../components/index'
import { Link } from "react-router-dom";
import { nav_links } from "../constants";
import SideAlert from "./SideAlert";

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
            //window.alert(mailStatus)
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
            <footer className="bg-gray-800 text-white px-8 font-poppins relative z-50">
                <SideAlert
                    variants='success'
                    heading='Success'
                    paragraph='Your email sent succesfully'
                    active={active}
                    setActive={setActive}
                />
                <div className="container mx-auto py-12 flex flex-wrap justify-between">
                    <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/3 mb-8">
                        <h3 className="text-lg font-medium mb-8"><TextWithLines text="About us"/></h3>
                        <p className="mb-8">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
                            at tellus nulla. Pellentesque eget libero semper, commodo mauris
                            vel, vehicula est.
                        </p>
                        <div className="flex">
                            <a
                                href="#"
                                className="text-white mr-6 hover:text-gray-400 transition duration-300"
                                >
                                <FaFacebook size={24} />
                            </a>
                            <a
                                href="#"
                                className="text-white mr-6 hover:text-gray-400 transition duration-300"
                                >
                                <FaTwitter size={24} />
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-gray-400 transition duration-300"
                                >
                                <FaInstagram size={24} />
                            </a>
                        </div>
                    </div>
                    <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/3 mb-8 sm:pl-24 pl-0">
                        <h3 className="text-2xl md:text-2xl font-bold leading-relaxed uppercase mb-8">Navigation</h3>
                        <ul className="list-none">
                            {
                                nav_links.map((link, i) => {
                                    return (
                                    <Link key={i} to={`${path}/${link.path}`} className="block mb-4 lg:mt-0 text-white hover:text-blue-200 mr-4" onClick={() => setIsActive(!isActive)}>
                                        <FontAwesomeIcon icon={link.icon} className="mr-2" />
                                        {link.name}
                                    </Link>
                                    )
                                })
                            }
                        </ul>
                    </div>
                    <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/3 mb-8">
                        <h3 className="text-2xl md:text-2xl font-bold leading-relaxed uppercase mb-8">Contact Us</h3>
                        <form className="text-sm" onSubmit={handleSubmit}>
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
                                className="border border-gray-400 py-2 px-4 w-full text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700"
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
                                className="border border-gray-400 py-2 px-4 w-full text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700"
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
                                className="border border-gray-400 py-2 px-4 w-full text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700"
                                >
                            </textarea>
                            </div>
                            <button 
                                type="submit"
                                className="bg-[#C23242] hover:bg-transparent hover:text-gray-100 text-white font-normal text-sm py-2 px-4 border hover:border-white border-[#C23242] rounded transition-colors duration-300 ease-in-out">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
                <div className="bg-gray-800 py-4 border-t border-solid border-gray-600">
                    <div className="container mx-auto flex justify-between items-center">
                        <p className="text-sm text-gray-400">
                            © 2023 RazorScythe Website. All rights reserved.
                        </p>
                        <a href="#" className="text-yellow-500 hover:text-yellow-600 transition duration-300">
                            <AiOutlineArrowUp size={24} />
                        </a>
                    </div>
                </div>
            </footer>
        );
};
                
export default Footer;
