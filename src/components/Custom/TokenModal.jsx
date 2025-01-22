import React, { useEffect, useState } from 'react'
import { dark, light } from '../../style';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MotionAnimate } from 'react-motion-animate';
import axios from 'axios';

import CustomForm from './CustomForm';
import CodeEditor from './CodeEditor';

const TokenModal = ({ theme, openModal, setOpenModal, data }) => {
    const [error, setError] = useState(false)
    const [initialData, setInitalData] = useState({})
    const [response, setResponse] = useState({})
    const [showResponse, setShowResponse] = useState(false)
    const [update, setUpdate] = useState(false)

    useEffect(() => {
        setShowResponse(false)
        setResponse({})
        setError(false);
        if(data) {
            setInitalData({ token_url: data.token_url })
            setUpdate(true)
        }
    }, [data])

    const closeModal = () => {
        setOpenModal({ ...openModal, token: false})
    }

    const fields = [
        { label: "Token URL", name: "token_url", type: "text", required: true },
    ];

    const handleCopy = () => {
        const jsonAsString = JSON.stringify(response, null, 2);
        navigator.clipboard.writeText(jsonAsString);
    };

    const handleSubmit = async (formData) => {
        try {
            const url = formData.token_url;
            const response = await axios.get(url);

            const data = response.data;

            if(data) {
                setResponse(data)
                setShowResponse(true)
                setError(false);
            }
        } catch (err) {
            console.log(err)
            setError(true);
            setResponse({
                status: err.response.status,
                statusText: err.response.statusText,
                data: err.response.data
            });
            setShowResponse(true);
            return null
        }
    };

    return (
        <>
            {/* Backdrop */}
            {openModal.token && (
                <div className="fixed inset-0 bg-black opacity-90 z-[100]"></div>
            )}
            {
                openModal.token && (
                    <div
                        className="flex items-center justify-center scrollbar-hide w-full fixed inset-0 z-[100]"
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
                            <div className={`sm:w-auto sm:min-w-[650px] w-full rounded-md shadow-lg relative flex flex-col ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
                                {/*content*/}
                                <div className="border-0 rounded-sm shadow-lg relative flex flex-col w-full bg-transparent outline-none focus:outline-none">
                                    {/*header*/}
                                    <div className="flex items-center justify-between p-5 py-3 border-b border-solid border-gray-700 rounded-t">
                                        <h3 className="text-xl font-medium">
                                            { data?.label ?? '' }
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
                                        { error && <div className='pb-2'><span className="text-red-600 font-medium">Error fetching data.</span></div> }

                                        <CustomForm
                                            theme={theme}
                                            fields={fields}
                                            onSubmit={handleSubmit}
                                            initialValues={initialData}
                                            fullWidth={true}
                                            setUpdate={setUpdate}
                                            update={update}
                                        />

                                        {
                                            showResponse &&
                                            <div className='mt-4'>
                                                <h1 className="text-base mt-4 font-medium mb-2"> Response: </h1>
                                                <div className='relative'>
                                                    <button
                                                        onClick={handleCopy}
                                                        className="absolute top-4 right-4 z-40 bg-[#0e0e0e] text-white px-3 py-1 rounded-sm text-xs hover:bg-blue-600 focus:outline-none transition-all"
                                                    >
                                                        Copy
                                                    </button>

                                                    <CodeEditor
                                                        theme={theme}
                                                        inputValue={JSON.stringify(response, null, 2)}
                                                        readOnly={true}
                                                    /> 
                                                </div>
                                            </div>
                                        }
                                        
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

export default TokenModal