import React,{ useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faChevronRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux'
import { sendTestEmail, uploadContacts } from "../../../actions/portfolio";
import { clearAlert } from '../../../actions/portfolio';
import { portfolio_selector } from '../../../constants';

import Alert from '../../Alert';
import { Link } from 'react-router-dom';
const Contact = ({ user, portfolio, index, setIndex }) => {

  const dispatch = useDispatch()

  const alert = useSelector((state) => state.portfolio.alert)
  const variant = useSelector((state) => state.portfolio.variant)

  const [disable, setDisable] = useState(false)
  const [toggle, setToggle] = useState(false)
  const [active, setActive] = useState(0)
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertInfo, setAlertInfo] = useState({
      alert: '',
      variant: ''
  })

  const [contact, setContact] = useState({
      id: user.result?._id,
      email: '',
      subject: []
  })
  const [input, setInput] = useState('')

  const addSubject = () => {
    let duplicate = false

    if(input.length === 0) return;

    contact.subject.forEach(item => { if(input === item) duplicate = true })

    if(duplicate) { duplicate = false; return;}

    setContact({ ...contact, subject: contact.subject.concat(input)})

    setInput('')
  }

  const deleteSubject = (e) => {
    let arr = [...contact.subject]
    arr.splice(e.currentTarget.id, 1)
    setContact({ ...contact, subject: [...arr] })
  
  }

  function isEmail(text) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  }

  useEffect(() => {
    if(alert && variant){
        setAlertInfo({ ...alertInfo, alert: alert, variant: variant })
        setShowAlert(true)
        window.scrollTo(0, 0)

        dispatch(clearAlert())
        setSending(false)
    }
  }, [alert, variant])

  useEffect(() => {
    setContact({
        ...contact,
        email: portfolio ? portfolio.email : '',
        subject: portfolio ? portfolio.subject : []
    })
    setSubmitted(false)
  }, [portfolio])

  const testEmail = () => {
    if(!sending) {
      setSending(true)
      dispatch(sendTestEmail({email: contact.email}))
    }
  }

  const handleSubmit = () => {
    if(!isEmail(contact.email)) return
    
    if(!submitted){
        dispatch(uploadContacts(contact))
        setSubmitted(true)
    }
  }

  return (
    <div className="container mx-auto relative px-0 sm:px-4 py-16">
        {
          alertInfo.alert && alertInfo.variant && showAlert &&
              <Alert variants={alertInfo.variant} text={alertInfo.alert} show={showAlert} setShow={setShowAlert} />
        }
        <div className='grid md:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-4'>
            <div className='relative'>
                <div className='flex flex-row items-center relative'>
                    <h2 className='text-3xl font-bold text-gray-800 mb-12'>{ portfolio_selector[index] }</h2>
                    <FontAwesomeIcon onClick={() => setToggle(!toggle)} icon={faChevronDown} className="absolute mt-1 right-0 top-0 bg-gray-800 text-white border border-solid border-gray-800 p-[7px] hover:bg-transparent hover:text-gray-800 transition-all cursor-pointer rounded-sm ml-4 w-4 h-4"/>
                </div>
                <div
                    className={`${
                    !toggle ? "hidden" : "flex"
                    } p-6 bg-gray-800 absolute top-8 right-0  mx-0 my-2 min-w-[140px] rounded-xl sidebar text-sm font-poppins`}
                >
                    <ul className="list-none flex justify-end items-start flex-1 flex-col">
                        {
                            portfolio_selector.map((selector, i) => {
                                return(
                                    <Link to={`/account/portfolio?navigation=${selector.toLowerCase()}`} key={i}>
                                        <li
                                            onClick={() => {
                                                setActive(i)
                                                setIndex(i)
                                            }}
                                            className={`cursor-pointer ${index === i ? 'text-[#FFFF00]' : 'text-white'} hover:text-blue-200 ${portfolio_selector.length - 1 === i ? 'mb-0' : 'mb-4'}`}
                                        >
                                            <FontAwesomeIcon icon={faChevronRight} className="mr-2" />
                                            <a href={`#`}>{selector}</a>
                                        </li>
                                    </Link>
                                )   
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>
        <div className='grid sm:grid-cols-2 grid-cols-1  gap-5 place-content-start mb-4'>
        <p className='text-gray-500 text-sm italic mb-2'>#Because of messages is currently unavailable, you must provide your email address to recieve email from your contact information</p>
        </div>
        <div className='grid sm:grid-cols-2 grid-cols-1  gap-5 place-content-start mb-4'>
            <div className='flex flex-col'>
                <label className='font-semibold'> Email Address: </label>
                <div className='flex flex-row'>
                  <input 
                      type="email" 
                      className='w-full p-2 border border-solid border-[#c0c0c0]'
                      onChange={(e) => {
                        setContact({...contact, email: e.target.value})
                      }}
                      value={contact.email}
                  />
                  {/* <div className='flex flex-row items-end'>
                      <button disabled={!isEmail(contact.email)} onClick={testEmail} className='disabled:bg-gray-600 disabled:border-gray-600 float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Test</button>
                  </div> */}
                  <div className='grid grid-cols-1 gap-5 place-content-start'>
                      <button disabled={!isEmail(contact.email)} onClick={testEmail} className='disabled:bg-gray-600 disabled:border-gray-600 float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2 px-4 pl-2'>
                          {
                              !sending ?
                              "Send"
                              :
                              <div className='flex flex-row justify-center items-center px-4'>
                                  Sending
                                  <div role="status">
                                      <svg aria-hidden="true" class="w-5 h-5 ml-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                      </svg>
                                      <span class="sr-only">Loading...</span>
                                  </div>
                              </div>
                          }
                      </button>
                  </div>
                </div>
            </div>
        </div>
        <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
            <div className='flex flex-col'>
                <label className='font-semibold'> Subject: </label>
                <div className='flex flex-row'>
                    <input 
                        type="text" 
                        className='w-full p-2 border border-solid border-[#c0c0c0]'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className='flex flex-row items-end'>
                        <button onClick={addSubject} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>Add</button>
                    </div>
                </div>
            </div>
        </div>
        <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 place-content-start text-white mb-2'>
            <div className='flex flex-row flex-wrap'>
                {
                    contact.subject.length > 0 &&
                        contact.subject.map((item, i) => {
                            return (
                                <div key={i} className='w-full flex flex-row p-2 py-3 bg-gray-800 mb-1'>
                                    <div className='w-1/2 flex flex-row items-center'>
                                        <FontAwesomeIcon icon={faChevronRight} className="mr-2 w-3 h-3"/> <p className='font-semibold'>{item}</p>
                                    </div>
                                    <div className='w-1/2 text-right'>
                                        <FontAwesomeIcon id={i} onClick={deleteSubject} icon={faTrash} className="mr-2 hover:cursor-pointer" />
                                    </div>
                                </div>
                            )
                        })
                    }
            </div>
        </div>
        <div className='grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-5 place-content-start mb-2'>
            <button onClick={handleSubmit} className='float-left font-semibold border border-solid border-gray-800 bg-gray-800 hover:bg-transparent hover:text-gray-800 rounded-sm transition-all text-white p-2'>
                {
                    !submitted ?
                    "Save"
                    :
                    <div className='flex flex-row justify-center items-center'>
                        Saving
                        <div role="status">
                            <svg aria-hidden="true" class="w-5 h-5 ml-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                }
            </button>
        </div>
    </div>
  )
}

export default Contact