import React from 'react'

const EmbedFull = ({ openModal, setOpenModal, link }) => {

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
                        <div className="relative p-6 mx-auto w-auto z-50">
                            {/*content*/}
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-transparent outline-none focus:outline-none">
                                {/*header*/}
                                
                                {/*body*/}
                                <div className="relative xs:px-4 px-2 flex-auto w-screen h-screen">
                                    <iframe 
                                        src={link}
                                        className='w-full h-full'
                                    >
                                    </iframe>
                                    <button
                                        className="absolute top-0 right-4 text-center bg-transparent border-0 text-gray-100 text-4xl leading-none font-semibold outline-none focus:outline-none"
                                        onClick={() => closeModal()}
                                    >
                                        <span className="h-12 w-12 bg-gray-700 block outline-none focus:outline-none rounded-md">
                                            ×
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}

export default EmbedFull