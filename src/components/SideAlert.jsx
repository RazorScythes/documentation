import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faClose, faWarning, faInfoCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";


const Info = ({heading, paragraph, active, setActive}) => {
    const [close, setClose] = useState(false)
    return (
        <div style={{animation: active ? "slide-to-left 1s" : close && "slide-out 1s", right: active ? "-1px" : "-750px"}} className='xs:w-96 w-full py-5 px-4 fixed z-50 xs:top-24 top-0 flex items-center bg-blue-100 border border-blue-400 text-blue-700 transition-all'>
            <FontAwesomeIcon onClick={() => { setActive(false); setClose(true)}} icon={faClose} className="absolute top-1 right-1 w-5 h-5 cursor-pointer"/>
            <FontAwesomeIcon icon={faInfoCircle} className="mr-4 text-blue-700 w-8 h-8"/>
            <div className='flex flex-col'>
                <h3 className='font-semibold'>{heading}</h3>
                <p>{paragraph}</p>
            </div>
        </div>
    )
}

const Success = ({heading, paragraph, active, setActive}) => {
    const [close, setClose] = useState(false)
    return (
        <div style={{animation: active ? "slide-to-left 0.2s" : close && "slide-out 0.2s", right: active ? "-1px" : "-750px"}} className='xs:w-96 w-full py-5 px-4 fixed z-50 xs:top-24 top-0 flex items-center bg-green-100 border border-green-400 text-green-700 transition-all'>
            <FontAwesomeIcon onClick={() => { setActive(false); setClose(true)}} icon={faClose} className="absolute top-1 right-1 w-5 h-5 cursor-pointer"/>
            <FontAwesomeIcon icon={faCheckCircle} className="mr-4 text-green-700 w-8 h-8"/>
            <div className='flex flex-col'>
                <h3 className='font-semibold'>{heading}</h3>
                <p>{paragraph}</p>
            </div>
        </div>
    )
}

const Danger = ({heading, paragraph, active, setActive}) => {
    const [close, setClose] = useState(false)
    return (
        <div style={{animation: active ? "slide-to-left 1s" : close && "slide-out 1s", right: active ? "-1px" : "-750px"}} className='xs:w-96 w-full py-5 px-4 fixed z-50 xs:top-24 top-0 flex items-center bg-red-100 border border-red-400 text-red-700 transition-all'>
            <FontAwesomeIcon onClick={() => { setActive(false); setClose(true)}} icon={faClose} className="absolute top-1 right-1 w-5 h-5 cursor-pointer"/>
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-4 text-red-700 w-8 h-8"/>
            <div className='flex flex-col'>
                <h3 className='font-semibold'>{heading}</h3>
                <p>{paragraph}</p>
            </div>
        </div>
    )
}

const Warning = ({heading, paragraph, active, setActive}) => {
    const [close, setClose] = useState(false)
    return (
        <div style={{animation: active ? "slide-to-left 1s" : close && "slide-out 1s", right: active ? "-1px" : "-750px"}} className='xs:w-96 w-full py-5 px-4 fixed z-50 xs:top-24 top-0 flex items-center bg-yellow-100 border border-yellow-400 text-yellow-700 transition-all'>
            <FontAwesomeIcon onClick={() => { setActive(false); setClose(true)}} icon={faClose} className="absolute top-1 right-1 w-5 h-5 cursor-pointer"/>
            <FontAwesomeIcon icon={faWarning} className="mr-4 text-yellow-700 w-8 h-8"/>
            <div className='flex flex-col'>
                <h3 className='font-semibold'>{heading}</h3>
                <p>{paragraph}</p>
            </div>
        </div>
    )
}

const SideAlert = ({ variants, heading, paragraph, active, setActive }) => {

    useEffect(() => {
        const closeAlert = setTimeout(() => {
            setActive(false)
        }, 5000);
        return () => clearTimeout(closeAlert);
    },[active])

    return (
        <div className='relative z-50'>
            {
                variants === 'danger' ?
                    <Danger 
                        heading={heading}
                        paragraph={paragraph}
                        active={active}
                        setActive={setActive}
                    />
                :
                variants === 'warning' ?
                    <Warning 
                        heading={heading}
                        paragraph={paragraph}
                        active={active}
                        setActive={setActive}
                    />
                :
                variants === 'success' ?
                    <Success 
                        heading={heading}
                        paragraph={paragraph}
                        active={active}
                        setActive={setActive}
                    />
                :
                    <Info
                        heading={heading}
                        paragraph={paragraph}
                        active={active}
                        setActive={setActive}
                    />
            }
        </div>
    )
}

export default SideAlert