import React from 'react'

const VideoModal = ({ openModal, setOpenModal, link }) => {

    const closeModal = () => {
        setOpenModal(false)
    }

    return (
        <>
            {/* Backdrop */}
            {openModal && (
                <div className="fixed inset-0 bg-black opacity-90 z-40"></div>
            )}
            {
                openModal && (
                    <div
                        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                    >
                        <div className="relative p-6 mx-auto w-auto">
                            <button
                                    className="absolute top-0 xs:right-0 right-1 bg-transparent border-0 text-gray-400 text-4xl leading-none font-semibold outline-none focus:outline-none"
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
                                    <iframe 
                                        src={link}
                                        className='w-full lg:h-[450px] md:h-[450px] sm:h-[450px] xs:h-[300px] h-[200px]'
                                        allow="autoplay"
                                        sandbox="allow-scripts allow-same-origin"
                                    >
                                    </iframe>
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