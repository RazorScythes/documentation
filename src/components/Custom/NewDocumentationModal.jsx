import React from 'react'
import { faClose, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MotionAnimate } from 'react-motion-animate';
import CustomForm from './CustomForm';

const NewDocumentationModal = ({ theme, openModal, setOpenModal, title, handleNewCategory }) => {
    const isLight = theme === 'light'

    const fields = [
        { label: "Category Name", name: "category", type: "text", required: true },
        { label: "Sub Category", name: "sub", type: "list" },
    ];

    const closeModal = () => {
        setOpenModal(false)
    }
    
    const handleSubmit = async (formData) => {
        handleNewCategory(formData);
    };

    if (!openModal) return null

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]" onClick={closeModal} />

            <div className="flex items-start justify-center pt-[10vh] w-full fixed inset-0 z-[100] px-4">
                <MotionAnimate variant={{
                    hidden: { opacity: 0, transform: 'translateY(-12px) scale(0.98)' },
                    show: { opacity: 1, transform: 'translateY(0) scale(1)', transition: { duration: 0.2 } }
                }}>
                    <div className={`sm:min-w-[500px] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden ${
                        isLight ? 'bg-white border border-blue-200/60' : 'bg-[#0e0e0e] border border-[#2B2B2B]'
                    }`}>
                        <div className={`px-5 py-4 flex items-center justify-between border-b ${
                            isLight ? 'border-blue-100/60 bg-blue-50/30' : 'border-[#2B2B2B] bg-[#1C1C1C]/50'
                        }`}>
                            <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isLight ? 'bg-blue-100 text-blue-500' : 'bg-blue-900/30 text-blue-400'
                                }`}>
                                    <FontAwesomeIcon icon={faLayerGroup} className="text-sm" />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                        {title}
                                    </h3>
                                    <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                        Add a new category to this documentation
                                    </p>
                                </div>
                            </div>
                            <button
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                    isLight ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-600' : 'text-gray-500 hover:bg-[#1C1C1C] hover:text-gray-300'
                                }`}
                                onClick={closeModal}
                            >
                                <FontAwesomeIcon icon={faClose} className="text-xs" />
                            </button>
                        </div>

                        <div className="p-5">
                            <CustomForm
                                theme={theme}
                                fields={fields}
                                onSubmit={handleSubmit}
                                initialValues={{}}
                                fullWidth={true}
                                submitText="Create Category"
                            />
                        </div>
                    </div>
                </MotionAnimate>
            </div>
        </>
    )
}

export default NewDocumentationModal