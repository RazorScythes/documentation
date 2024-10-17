import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react'

const Alert = ({ onClick, text, type, outline, bgColor = 'bg-blue-600', textColor = 'text-white', lists, icon, hide, duration = 3000, show, setShow }) => {

    useEffect(() => {
        if(hide) {
            const timer = setTimeout(() => {
                setShow(false);
            }, duration);

            return () => clearTimeout(timer); 
        }
    }, [hide, show]);

    if (!show) return null;

    const ListItem = () => {
        return (
            <>
            {
                lists?.length > 0 &&
                <ul className='list-disc ml-8 mt-1'>
                    {
                        lists.map((list, index) => {
                            return (
                                <li key={index}>{list}</li>
                            )
                        })
                    }
                </ul>
            }
            </>
        )
    }

    return (
        <div onClick={onClick}>
            {
                !outline ? 
                <>
                {
                    type === 'info' ?
                    <div className='px-4 py-3 bg-blue-600 text-white rounded-md text-sm relative'>
                        {icon} {text}
                        <ListItem/>
                        <button onClick={() => setShow(false)} className='absolute top-0 translate-y-1/5 bottom-0 right-0 px-4 cursor-pointer my-auto font-semibold'><FontAwesomeIcon icon={faClose} /></button>
                    </div>
                    : type === 'success' ?
                    <div className='px-4 py-3 bg-green-600 text-white rounded-md text-sm relative'>
                        {icon} {text}
                        <ListItem/>
                        <button onClick={() => setShow(false)} className='absolute top-0 translate-y-1/5 bottom-0 right-0 px-4 cursor-pointer my-auto font-semibold'><FontAwesomeIcon icon={faClose} /></button>
                    </div>
                    : type === 'warning' ?
                    <div className='px-4 py-3 bg-orange-600 text-white rounded-md text-sm relative'>
                        {icon} {text}
                        <ListItem/>
                        <button onClick={() => setShow(false)} className='absolute top-0 translate-y-1/5 bottom-0 right-0 px-4 cursor-pointer my-auto font-semibold'><FontAwesomeIcon icon={faClose} /></button>
                    </div>
                    : type === 'danger' ?
                    <div className='px-4 py-3 bg-red-600 text-white rounded-md text-sm relative'>
                        {icon} {text}
                        <ListItem/>
                        <button onClick={() => setShow(false)} className='absolute top-0 translate-y-1/5 bottom-0 right-0 px-4 cursor-pointer my-auto font-semibold'><FontAwesomeIcon icon={faClose} /></button>
                    </div>
                    : 
                    <div className={`px-4 py-3 ${bgColor} ${textColor} rounded-md text-sm relative`}>
                        {icon} {text}
                        <ListItem/>
                        <button onClick={() => setShow(false)} className='absolute top-0 translate-y-1/5 bottom-0 right-0 px-4 cursor-pointer my-auto font-semibold'><FontAwesomeIcon icon={faClose} /></button>
                    </div>
                }               
                </> :
                <>
                {
                    type === 'info' ?
                    <div className='px-4 py-3 bg-transparent border border-blue-600 border-solid text-blue-600 rounded-md text-sm relative'>
                        {icon} {text}
                        <ListItem/>
                        <button onClick={() => setShow(false)} className='absolute top-0 translate-y-1/5 bottom-0 right-0 px-4 cursor-pointer my-auto font-semibold'><FontAwesomeIcon icon={faClose} /></button>
                    </div>
                    : type === 'success' ?
                    <div className='px-4 py-3 bg-transparent border border-green-600 border-solid text-green-600 rounded-md text-sm relative'>
                        {icon} {text}
                        <ListItem/>
                        <button onClick={() => setShow(false)} className='absolute top-0 translate-y-1/5 bottom-0 right-0 px-4 cursor-pointer my-auto font-semibold'><FontAwesomeIcon icon={faClose} /></button>
                    </div>
                    : type === 'warning' ?
                    <div className='px-4 py-3 bg-transparent border border-orange-600 border-solid text-orange-600 rounded-md text-sm relative'>
                        {icon} {text}
                        <ListItem/>
                        <button onClick={() => setShow(false)} className='absolute top-0 translate-y-1/5 bottom-0 right-0 px-4 cursor-pointer my-auto font-semibold'><FontAwesomeIcon icon={faClose} /></button>
                    </div>
                    : type === 'danger' ?
                    <div className='px-4 py-3 bg-transparent border border-red-600 border-solid text-red-600 rounded-md text-sm relative'>
                        {icon} {text}
                        <ListItem/>
                        <button onClick={() => setShow(false)} className='absolute top-0 translate-y-1/5 bottom-0 right-0 px-4 cursor-pointer my-auto font-semibold'><FontAwesomeIcon icon={faClose} /></button>
                    </div>
                    : 
                    <div className={`px-4 py-3 bg-transparent border ${bgColor.replace('bg', 'border')} border-solid ${bgColor.replace('bg', 'text')} rounded-md text-sm relative`}>
                        {icon} {text}
                        <ListItem/>
                        <button onClick={() => setShow(false)} className='absolute top-0 translate-y-1/5 bottom-0 right-0 px-4 cursor-pointer my-auto font-semibold'><FontAwesomeIcon icon={faClose} /></button>
                    </div>
                }     
                </>
            }
        </div>
    )
}

export default Alert