import React from 'react'
import { createPortal } from 'react-dom'
import { dark, light } from '../../style';
import { faClose, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MotionAnimate } from 'react-motion-animate';

const ConfirmModal = ({ theme, openModal, setOpenModal, title, description, setConfirm }) => {

    const closeModal = () => {
        setOpenModal(false)
    }

    const confirm = () => {
        setConfirm(true)
        setOpenModal(false)
    }

    if (!openModal) return null

    const isLight = theme === 'light'

    const modalContent = (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={closeModal} aria-hidden="true" />
            <div
                className="flex items-center justify-center w-full min-h-full fixed inset-0 z-[101] p-4 py-8"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
            >
                <MotionAnimate variant={{
                    hidden: { opacity: 0, transform: 'scale(0.96)' },
                    show: { opacity: 1, transform: 'scale(1)', transition: { duration: 0.2 } }
                }}>
                    <div
                        className={`relative max-w-sm w-full rounded-2xl shadow-2xl overflow-hidden ${isLight ? light.background : dark.background} ${isLight ? light.color : dark.color} border ${isLight ? 'border-gray-200' : 'border-gray-700'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={closeModal}
                            aria-label="Close"
                            className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors z-10 ${isLight ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-gray-800 text-gray-400'}`}
                        >
                            <FontAwesomeIcon icon={faClose} className="text-sm" />
                        </button>

                        {/* Icon + title + description */}
                        <div className="flex items-start gap-4 px-6 pt-5 pb-2">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 ${isLight ? 'bg-red-100' : 'bg-red-900/30'}`}>
                                <FontAwesomeIcon icon={faTriangleExclamation} className={`text-lg ${isLight ? 'text-red-600' : 'text-red-400'}`} />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <h3 id="confirm-modal-title" className="text-lg font-semibold mb-1.5">
                                    { title }
                                </h3>
                                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'} leading-relaxed`}>
                                    { description }
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 p-6 pt-5">
                            <button
                                type="button"
                                onClick={closeModal}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-slate-700' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'}`}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirm}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${isLight ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </MotionAnimate>
            </div>
        </>
    )

    return createPortal(modalContent, document.body)
}


export default ConfirmModal