import React from 'react'
import { faClose, faTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MotionAnimate } from 'react-motion-animate';

const tagColors = [
    { light: 'bg-blue-50 text-blue-600 border-blue-200/60', dark: 'bg-blue-900/15 text-blue-400 border-blue-800/30' },
    { light: 'bg-indigo-50 text-indigo-600 border-indigo-200/60', dark: 'bg-indigo-900/15 text-indigo-400 border-indigo-800/30' },
    { light: 'bg-violet-50 text-violet-600 border-violet-200/60', dark: 'bg-violet-900/15 text-violet-400 border-violet-800/30' },
    { light: 'bg-emerald-50 text-emerald-600 border-emerald-200/60', dark: 'bg-emerald-900/15 text-emerald-400 border-emerald-800/30' },
    { light: 'bg-amber-50 text-amber-600 border-amber-200/60', dark: 'bg-amber-900/15 text-amber-400 border-amber-800/30' },
    { light: 'bg-rose-50 text-rose-600 border-rose-200/60', dark: 'bg-rose-900/15 text-rose-400 border-rose-800/30' },
    { light: 'bg-cyan-50 text-cyan-600 border-cyan-200/60', dark: 'bg-cyan-900/15 text-cyan-400 border-cyan-800/30' },
    { light: 'bg-pink-50 text-pink-600 border-pink-200/60', dark: 'bg-pink-900/15 text-pink-400 border-pink-800/30' },
]

const getTagColor = (index) => tagColors[index % tagColors.length]

const ListsModal = ({ theme, openModal, setOpenModal, title, description, lists = [] }) => {
    const isLight = theme === 'light'

    const closeModal = () => setOpenModal(false)

    return (
        <>
            {openModal && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" onClick={closeModal} />}
            {openModal && (
                <div className="flex items-center justify-center w-full fixed inset-0 z-[100]">
                    <MotionAnimate variant={{
                        hidden: { opacity: 0, transform: 'scale(0.95) translateY(10px)' },
                        show: { opacity: 1, transform: 'scale(1) translateY(0)', transition: { duration: 0.2 } }
                    }}>
                        <div className={`sm:w-auto sm:min-w-[440px] sm:max-w-[520px] w-full rounded-xl shadow-2xl relative flex flex-col overflow-hidden ${
                            isLight ? 'bg-white border border-slate-200' : 'bg-[#161616] border border-[#2B2B2B]'
                        }`}>
                            {/* Header */}
                            <div className={`flex items-center justify-between px-6 py-4 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-indigo-50' : 'bg-indigo-900/20'}`}>
                                        <FontAwesomeIcon icon={faTag} className={`text-xs ${isLight ? 'text-indigo-500' : 'text-indigo-400'}`} />
                                    </div>
                                    <div>
                                        <h3 className={`text-base font-semibold ${isLight ? 'text-slate-800' : 'text-gray-100'}`}>{title || 'Tags'}</h3>
                                        <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                            {lists.length} item{lists.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={closeModal}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#2B2B2B]'}`}>
                                    <FontAwesomeIcon icon={faClose} className="text-sm" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                {description && (
                                    <p className={`text-sm mb-4 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{description}</p>
                                )}

                                {lists.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FontAwesomeIcon icon={faTag} className={`text-2xl mb-3 ${isLight ? 'text-slate-200' : 'text-gray-700'}`} />
                                        <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No items available</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {lists.map((item, k) => {
                                            const color = getTagColor(k)
                                            return (
                                                <span key={k}
                                                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                                                        isLight ? color.light : color.dark
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'opacity-60' : 'opacity-40'}`}
                                                        style={{ backgroundColor: 'currentColor' }} />
                                                    {item.name}
                                                </span>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </MotionAnimate>
                </div>
            )}
        </>
    )
}

export default ListsModal
