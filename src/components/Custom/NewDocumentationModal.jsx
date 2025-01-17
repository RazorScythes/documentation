import React, { useState }  from 'react'
import { dark, light } from '../../style';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MotionAnimate } from 'react-motion-animate';

import CustomForm from './CustomForm';

const NewDocumentationModal = ({ theme, openModal, setOpenModal, title, description, setConfirm }) => {
    const [error, setError] = useState(false)

    const fields = [
        { label: "Category Name", name: "category", type: "text", required: true },
        { label: "Sub Category", name: "sub", type: "list" },
    ];

    const closeModal = () => {
        setOpenModal(false)
    }

    const confirm = () => {
        setConfirm(true)
        setOpenModal(false)
    }

    const handleSubmit = async (formData) => {
        console.log(formData)
    };

    return (
        <>
            {/* Backdrop */}
            {openModal && (
                <div className="fixed inset-0 bg-black opacity-90 z-[100]"></div>
            )}
            {
                openModal && (
                    <div
                        className="flex mt-16 justify-center scrollbar-hide w-full fixed inset-0 z-[100]"
                    >
                        <MotionAnimate variant={{
                            hidden: { 
                                opacity: 0,
                                transform: 'scale(0)'
                            },
                            show: {
                                opacity: 1,
                                transform: 'scale(1)',
                                transition: {
                                    duration: 0.15,
                                }
                            }
                        }}>
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
                                        { error && <div className='pb-2'><span className="text-red-600 font-medium">Something went wrong.</span></div> }

                                        <CustomForm
                                            theme={theme}
                                            fields={fields}
                                            onSubmit={handleSubmit}
                                            initialValues={{}}
                                            fullWidth={true}
                                        />
                                    </div>
                                    
                                </div>
                            </div>
                        </MotionAnimate>
                    </div>
                )
            }
        </>
    )
}

export default NewDocumentationModal