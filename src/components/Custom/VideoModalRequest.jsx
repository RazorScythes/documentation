import React, { useState } from 'react'
import { dark, light } from '../../style';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MotionAnimate } from 'react-motion-animate';
import { getLinkId } from '../Tools';
import axios from 'axios';

import CustomForm from './CustomForm';

const VideoModalRequest = ({ theme, openModal, setOpenModal, title, importedData }) => {
    const [error, setError] = useState(false)

    const closeModal = () => {
        setOpenModal(false)
    }

    const fields = [
        { label: "Source", name: "source", type: "select", options: [{ id: 'drive', name: 'Google Drive' }], required: true },
        { label: "Video Url", name: "link", type: "text", required: true },
    ];

    const driveRequest = async (link) => {
        try {
            const url = `https://www.googleapis.com/drive/v2/files/${getLinkId(link)}?key=${import.meta.env.VITE_DRIVE_API_KEY}`;
            const response = await axios.get(url);

            const data = response.data;
            
            return {
                title: data.title,
                link: data.downloadUrl,
                alternateLink: data.alternateLink,
                downloadUrl: data.downloadUrl,
                embedLink: data.embedLink,
                fileExtension: data.fileExtension,
                fileSize: data.fileSize,
                thumbnail: {
                    preview: data.thumbnailLink,
                    save: data.thumbnailLink
                },
                webContentLink: data.webContentLink,
                duration: data.videoMediaMetadata.durationMillis,
                ownerNames: data.ownerNames
            }
        } catch (err) {
            console.log(err)
            setError(true);
            return null
        }
    }

    const handleSubmit = async (formData) => {
        if(formData.source === 'drive') {
            setError(false);

            const result = await driveRequest(formData.link);

            if(result) {
                importedData(result);
                closeModal();
            }
            else {
                setError(true);
            }
        }
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
                            <div className={`sm:w-auto sm:min-w-[500px] w-full rounded-md shadow-lg relative flex flex-col ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}>
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
                                        { error && <div className='pb-2'><span className="text-red-600 font-medium">Error: Invalid URL</span></div> }

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

export default VideoModalRequest