import React, { useState } from 'react'

const VideoModal = ({ openModal, setOpenModal, link }) => {

    const [volume, setVolume] = useState(parseFloat(localStorage.getItem('volume')));

    const closeModal = () => {
        setOpenModal(false)
    }

    const handleVolumeChange = (event) => {
        const newVolume = parseFloat(event.target.volume);

        localStorage.setItem('volume', newVolume);
        setVolume(newVolume)
        const video = document.getElementById('videoPlayer');
        if (video) {
            video.volume = newVolume;
        }
    };

    const handleVolume = () => {
        const video = document.getElementById('videoPlayer');
        if (video) {
            video.volume = volume;
        }
    };

    return (
        <>
            {/* Backdrop */}
            {openModal && (
                <div className="fixed inset-0 bg-black opacity-90 z-50"></div>
            )}
            {
                openModal && (
                    <div
                        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                    >
                        <div className="relative p-6 mx-auto w-auto">
                            <button
                                    className="absolute top-0 xs:right-0 right-1 bg-transparent border-0 text-white hover:text-blue-600 text-4xl leading-none font-semibold outline-none focus:outline-none transition-all"
                                    onClick={() => closeModal()}
                                >
                                    <span className="bg-transparent h-6 w-6 block outline-none focus:outline-none">
                                        ×
                                    </span>
                                </button>
                            {/*content*/}
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-transparent outline-none focus:outline-none">
                                {/*header*/}
                                
                                {/*body*/}
                                <div className="relative xs:p-4 p-2 flex-auto sm:w-[750px] w-full">
                                    {
                                        link.includes('download') ?
                                            <video 
                                                id="videoPlayer"
                                                src={link}
                                                controls 
                                                controlsList="nodownload" 
                                                className='w-full lg:h-[450px] md:h-[450px] sm:h-[450px] xs:h-[300px] h-[200px] bg-black'
                                                onVolumeChange={handleVolumeChange}
                                                onLoadedData={handleVolume}
                                            />
                                        :
                                            <iframe 
                                                src={link}
                                                className='w-full lg:h-[450px] md:h-[450px] sm:h-[450px] xs:h-[300px] h-[200px]'
                                                allow="autoplay"
                                                sandbox="allow-scripts allow-same-origin"
                                            >
                                            </iframe>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}

export default VideoModal