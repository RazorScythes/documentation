import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { uploadReport } from "../../actions/video";
import { dark, light } from '../../style';
import { faClose, faFlag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MotionAnimate } from 'react-motion-animate';

const ReportModal = ({ theme, openModal, setOpenModal, videoId, reportType = 'video', sideAlert, setReportId }) => {
    const dispatch = useDispatch()

    const [submitted, setSubmitted] = useState(false)
    const [form, setForm] = useState({
        content_id: '',
        name: '',
        email: '',
        reason: 'Non consensual',
        details: '',
        type: reportType || 'video'
    })

    useEffect(() => {
        if (videoId) {
            setForm({...form, content_id: videoId, type: reportType || 'video'})
        }
    }, [videoId, reportType])

    useEffect(() => {
        if (sideAlert) {
            setForm({
                content_id: videoId || '',
                name: '',
                email: '',
                reason: 'Non consensual',
                details: '',
                type: reportType || 'video'
            })
            setSubmitted(false)
        }
    }, [sideAlert, reportType])

    const closeModal = () => {
        setReportId('')
        setOpenModal(false)
        setSubmitted(false)
        setForm({
            content_id: videoId || '',
            name: '',
            email: '',
            reason: 'Non consensual',
            details: '',
            type: reportType || 'video'
        })
    }

    const submit = () => {
        if (!form.reason) {
            setForm({...form, reason: 'Non consensual' })
        }
        if (!form.content_id || !form.name || !form.email || !form.details) {
            return
        }
        if (!submitted) {
            dispatch(
                uploadReport({
                    data: form
                })
            )
            setSubmitted(true)
        }
    }

    return (
        <>
            {/* Backdrop */}
            {openModal && (
                <div className="fixed inset-0 bg-black opacity-90 z-[100]" onClick={closeModal}></div>
            )}
            {
                openModal && (
                    <div
                        className="flex items-center justify-center scrollbar-hide w-full fixed inset-0 z-[100]"
                        onClick={closeModal}
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
                            <div 
                                className={`sm:w-auto sm:min-w-[500px] w-full mx-4 rounded-xl shadow-lg relative flex flex-col ${theme === 'light' ? light.background : dark.background} ${theme === 'light' ? light.color : dark.color} border border-solid ${theme === 'light' ? light.border : dark.border}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className={`flex items-center justify-between p-5 py-4 border-b ${theme === 'light' ? 'border-blue-200/60' : 'border-gray-700/60'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            theme === 'light' 
                                                ? 'bg-red-100/50' 
                                                : 'bg-red-900/30'
                                        }`}>
                                            <FontAwesomeIcon icon={faFlag} className={`text-lg ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`} />
                                        </div>
                                        <h3 className="text-xl font-bold">
                                            Report {reportType === 'comment' ? 'Comment' : 'Video'}
                                        </h3>
                                    </div>
                                    <button
                                        className={`text-base p-2 rounded-lg hover:bg-opacity-50 transition-colors ${theme === 'light' ? light.icon + ' hover:bg-gray-100' : dark.icon + ' hover:bg-gray-800'}`}
                                        onClick={closeModal}
                                    >
                                        <FontAwesomeIcon icon={faClose} />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-5 pb-6 max-h-[70vh] overflow-y-auto">
                                    <p className={`mb-6 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                        Please provide some details why this {reportType === 'comment' ? 'comment' : 'video'} is being reported
                                    </p>

                                    {/* Name Field */}
                                    <div className="mb-4">
                                        <label className={`block text-sm font-semibold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({...form, name: e.target.value})}
                                            placeholder="Your name"
                                            className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                                                theme === 'light' 
                                                    ? 'bg-white border-blue-200 focus:ring-blue-500 focus:border-blue-500 text-gray-800' 
                                                    : 'bg-gray-800 border-gray-700 focus:ring-blue-400 focus:border-blue-400 text-gray-200'
                                            }`}
                                        />
                                    </div>

                                    {/* Email Field */}
                                    <div className="mb-4">
                                        <label className={`block text-sm font-semibold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({...form, email: e.target.value})}
                                            placeholder="your.email@example.com"
                                            className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                                                theme === 'light' 
                                                    ? 'bg-white border-blue-200 focus:ring-blue-500 focus:border-blue-500 text-gray-800' 
                                                    : 'bg-gray-800 border-gray-700 focus:ring-blue-400 focus:border-blue-400 text-gray-200'
                                            }`}
                                        />
                                    </div>

                                    {/* Reason Field */}
                                    <div className="mb-4">
                                        <label className={`block text-sm font-semibold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                            Reason
                                        </label>
                                        <select 
                                            value={form.reason}
                                            onChange={(e) => setForm({...form, reason: e.target.value})}
                                            className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                                                theme === 'light' 
                                                    ? 'bg-white border-blue-200 focus:ring-blue-500 focus:border-blue-500 text-gray-800' 
                                                    : 'bg-gray-800 border-gray-700 focus:ring-blue-400 focus:border-blue-400 text-gray-200'
                                            }`}
                                        >
                                            <option value="Non consensual">Non consensual</option>
                                            <option value="Spammer">Spammer</option>
                                            <option value="Child Pornography">Child Pornography</option>
                                            <option value="Underage">Underage</option>
                                            <option value="Nevermind">Nevermind</option>
                                            <option value="Not Appropriate">Not Appropriate</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    {/* Details Field */}
                                    <div className="mb-6">
                                        <label className={`block text-sm font-semibold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                            Provide Details
                                        </label>
                                        <textarea
                                            value={form.details}
                                            onChange={(e) => setForm({...form, details: e.target.value})}
                                            placeholder="Please provide additional details about why you're reporting this video..."
                                            rows="4"
                                            className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                                                theme === 'light' 
                                                    ? 'bg-white border-blue-200 focus:ring-blue-500 focus:border-blue-500 text-gray-800' 
                                                    : 'bg-gray-800 border-gray-700 focus:ring-blue-400 focus:border-blue-400 text-gray-200'
                                            }`}
                                        ></textarea>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={closeModal}
                                            className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
                                                theme === 'light'
                                                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                            }`}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={submit}
                                            disabled={submitted}
                                            className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                                theme === 'light'
                                                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                            } ${submitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {submitted ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Sending...</span>
                                                </>
                                            ) : (
                                                <span>Submit Report</span>
                                            )}
                                        </button>
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

export default ReportModal
