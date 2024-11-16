import React, { useState, useEffect } from 'react'
import { dark, light } from '../../style';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ReportModal = ({ theme, openModal, setOpenModal, title, description, setConfirm }) => {

    const closeModal = () => {
        setOpenModal(false)
    }

    const confirm = () => {
        setConfirm(true)
        setOpenModal(false)
    }

    return (
        <>
            {/* Backdrop */}
            {openModal && (
                <div className="fixed inset-0 bg-black opacity-90 z-[100]"></div>
            )}
            {
                openModal && (
                    <div
                        className="flex items-center justify-center scrollbar-hide w-full fixed inset-0 z-[100]"
                    >
                        <div className={`sm:w-auto sm:min-w-[550px] w-full rounded-md shadow-lg relative flex flex-col ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                            {/*content*/}
                            <div className="border-0 rounded-sm shadow-lg relative flex flex-col w-full bg-transparent outline-none focus:outline-none">
                                {/*header*/}
                                <div className="flex items-center justify-between p-5 py-3 border-b border-solid border-gray-700 rounded-t">
                                    <h3 className="text-xl font-medium">
                                        { title }
                                    </h3>
                                    <button
                                        className={`text-base p-[0.35rem] px-3 rounded-md ${theme === 'light' ? light.icon : dark.icon}`}
                                        onClick={() => closeModal()}
                                    >
                                        <FontAwesomeIcon icon={faClose} />
                                    </button>
                                </div>
                                {/*body*/}
                                <div className="p-5 pb-8 font-normal">
                                    <p className='mb-6'>{ description }</p>

                                    <div className='flex justify-end'>
                                        <button onClick={() => closeModal()} type="submit" className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>
                                            Cancel
                                        </button>
                                        <button onClick={() => confirm()} type="submit" className={`py-1.5 px-4 ${theme === 'light' ? light.button_secondary : dark.button_secondary} rounded-full ml-2`}>
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default ReportModal