import React, { useState, useEffect } from 'react'
import { sendEmail, clearMailStatus } from "../../actions/portfolio";
import { forwardRef } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import SideAlert from '../SideAlert';
import styles from "../../style";

const Contact = forwardRef(({ contact }, ref) => {

    let { username } = useParams();

    const dispatch = useDispatch()

    const mailStatus = useSelector((state) => state.portfolio.mailStatus)

    const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')))

    const [submitted, setSubmitted] = useState(false)

    const [active, setActive] = useState(false)

    const [form, setForm] = useState({
        name: '',
        email: '',
        sender_email: '',
        phone: '',
        subject: [],
        message: ''
    })

    useEffect(() => {
        setForm({...form, email: contact ? contact.email : '', subject: contact ? contact.subject : []})
    }, [contact])

    useEffect(() => {
        if(mailStatus) {
            //window.alert(mailStatus)
            setActive(true)
            dispatch(clearMailStatus())
            setForm({
                ...form,
                name: '',
                sender_email: '',
                phone: '',
                message: ''
            })
            setSubmitted(false)
        }
    }, [mailStatus])

    function isEmail(text) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(text);
      }

    const handleSubmit = () => {
        if(!form.name || !isEmail(form.email) || !form.message) return

        if(!submitted)
            dispatch(sendEmail(form))

    }

    return (
        <div
            className="relative bg-cover bg-center py-14 mt-8"
        //   style={{ backgroundImage: `url(${heroBackgroundImage})` }}
            style={{ backgroundColor: "#111827" }}
        >   
            <div className={`${styles.marginX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <SideAlert
                        variants='success'
                        heading='Success'
                        paragraph='Your email sent succesfully'
                        active={active}
                        setActive={setActive}
                    />
                    <div className="absolute inset-0 "></div>
                    <div className="container mx-auto file:lg:px-8 relative px-0">
                        <div className="w-full md:flex flex-col items-center justify-center text-white">
                            <div className="md:w-1/2 w-full mx-auto text-center md:m-8" ref={ref}>
                                <h2 className='md:text-5xl text-4xl font-bold mb-8'>Send Me A Message</h2>
                                <p className='text-lg text-[#E1DEF7] md:pb-4 pb-8'>You can contact me by filling up this form below.</p>
                            </div>
                            <div className='md:w-[800px] w-full rounded-sm p-8 py-16 border border-solid border-gray-700 bg-gray-800'>
                                <h2 className='text-3xl font-semibold text-center mb-12'>Get in Touch</h2>
                                <div className="w-full md:flex flex-row items-center justify-center text-white">
                                    <div className="lg:w-1/2 md:w-1/2 w-full sm:px-4 mt-4">
                                        <label >Full Name:</label>
                                        <input placeholder='name' onChange={(e) => setForm({...form, name: e.target.value})} value={form.name} type="text" className='w-full py-2 pl-2 mt-2 outline-0 transition-all focus:border-gray-600 bg-transparent border-2 border-solid border-gray-400 text-gray-100 rounded-sm focus:ring-gray-700'/>
                                    </div>
                                    <div className="lg:w-1/2 md:w-1/2 w-full sm:px-4 mt-4">
                                        <label >Email Address:</label>
                                        <input placeholder='email' onChange={(e) => setForm({...form, sender_email: e.target.value})} value={form.sender_email}  type="email" className='w-full py-2 pl-2 mt-2 outline-0 transition-all focus:border-gray-600 bg-transparent border-2 border-solid border-gray-400 text-gray-100 rounded-sm focus:ring-gray-700'/>
                                    </div>
                                </div>
                                <div className="w-full sm:px-4 mt-4">
                                    <label >Phone:</label>
                                    <input placeholder='phone' onChange={(e) => setForm({...form, phone: e.target.value})} value={form.phone}  type="phone" className='w-full py-2 pl-2 mt-2 outline-0 transition-all focus:border-gray-600 bg-transparent border-2 border-solid border-gray-400 text-gray-100 rounded-sm focus:ring-gray-700'/>
                                </div>
                                <div className="w-full sm:px-4 mt-4">
                                    <label >Subject:</label>
                                    <select onChange={(e) => setForm({ ...form, subject: e.target.value })} value={form.subject || "No Subject"} placeholder='email' type="email" className='w-full py-2 pl-2 mt-2 outline-0 transition-all focus:border-gray-600 bg-transparent border-2 border-solid border-gray-400 text-gray-400 rounded-sm focus:ring-gray-700'>
                                        <option value="No Subject" disabled hidden >Select a Subject</option>
                                        {
                                            form.subject.length > 0 &&
                                                form.subject.map((item, i) => {
                                                    return (
                                                        <option key={i} value={item}className='text-gray-900'>{item}</option>
                                                    )
                                                })
                                        }
                                    </select>
                                </div>
                                <div className="w-full sm:px-4 mt-4">
                                    <label >Message:</label>
                                    <textarea
                                        onChange={(e) => setForm({...form, message: e.target.value})} 
                                        value={form.message} 
                                        name="message"
                                        id="message"
                                        cols="30"
                                        rows="4"
                                        placeholder="Message"
                                        className="w-full py-2 pl-2 mt-2 outline-0 transition-all focus:border-gray-600 bg-transparent border-2 border-solid border-gray-400 text-gray-100 rounded-sm focus:ring-gray-700"
                                    >
                                    </textarea>
                                </div>
                                <button 
                                    onClick={handleSubmit}
                                    type="submit"
                                    className="sm:w-auto w-full sm:float-right sm:mr-4 mt-2 bg-[#C23242] hover:bg-transparent hover:text-gray-100 text-white font-normal py-3 px-8 border hover:border-white border-[#C23242] transition-colors duration-300 ease-in-out">
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
})

export default Contact