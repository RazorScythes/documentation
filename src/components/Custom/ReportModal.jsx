import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createReport, clearAlert } from '../../actions/report'
import { dark, light } from '../../style';
import { faClose, faFlag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MotionAnimate } from 'react-motion-animate';

const ReportModal = ({ theme, openModal, setOpenModal, videoId, reportType = 'video', setReportId, setNotification }) => {
    const dispatch = useDispatch()
    const reportAlert = useSelector((state) => state.report.alert)
    const reportLoading = useSelector((state) => state.report.isLoading)

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
            setForm(prev => ({...prev, content_id: videoId, type: reportType || 'video'}))
        }
    }, [videoId, reportType])

    useEffect(() => {
        if (Object.keys(reportAlert).length > 0) {
            dispatch(clearAlert())
            if (setNotification) setNotification(reportAlert)
            if (reportAlert.variant === 'success') {
                closeModal()
            }
        }
    }, [reportAlert])

    const closeModal = () => {
        if (setReportId) setReportId('')
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
        if (!form.content_id || !form.name || !form.email || !form.details) {
            return
        }
        if (!submitted) {
            dispatch(createReport(form))
            setSubmitted(true)
        }
    }

    return (
        <>
            {openModal && (
                <div className="fixed inset-0 bg-black/80 z-[100]" onClick={closeModal}></div>
            )}
            {
                openModal && (
                    <div
                        className="flex items-center justify-center scrollbar-hide w-full fixed inset-0 z-[100] p-5"
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
                                className={`sm:w-auto sm:min-w-[460px] w-full mx-4 rounded-xl relative flex flex-col ${theme === 'light' ? 'bg-white' : 'bg-[#1C1C1C]'} ${theme === 'light' ? light.color : dark.color} border ${theme === 'light' ? 'border-gray-200' : 'border-[#2B2B2B]'}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={`flex items-center justify-between p-4 py-3 border-b ${theme === 'light' ? 'border-gray-200' : 'border-[#2B2B2B]'}`}>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faFlag} className={`text-sm ${theme === 'light' ? 'text-red-500' : 'text-red-400'}`} />
                                        <h3 className="text-base font-semibold">
                                            Report {reportType === 'comment' ? 'Comment' : 'Video'}
                                        </h3>
                                    </div>
                                    <button
                                        className={`p-1.5 rounded-lg transition-colors ${theme === 'light' ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-400 hover:bg-[#2B2B2B]'}`}
                                        onClick={closeModal}
                                    >
                                        <FontAwesomeIcon icon={faClose} className="text-sm" />
                                    </button>
                                </div>

                                <div className="p-4 max-h-[70vh] overflow-y-auto">
                                    <p className={`mb-4 text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Please provide some details why this {reportType === 'comment' ? 'comment' : 'video'} is being reported
                                    </p>

                                    <div className="mb-3">
                                        <label className={`block text-sm font-medium mb-1.5 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({...form, name: e.target.value})}
                                            placeholder="Your name"
                                            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${
                                                theme === 'light' 
                                                    ? 'bg-white border-gray-200 text-gray-800' 
                                                    : 'bg-[#272727] border-[#3B3B3B] text-gray-200'
                                            }`}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className={`block text-sm font-medium mb-1.5 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({...form, email: e.target.value})}
                                            placeholder="your.email@example.com"
                                            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${
                                                theme === 'light' 
                                                    ? 'bg-white border-gray-200 text-gray-800' 
                                                    : 'bg-[#272727] border-[#3B3B3B] text-gray-200'
                                            }`}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className={`block text-sm font-medium mb-1.5 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                            Reason
                                        </label>
                                        <select 
                                            value={form.reason}
                                            onChange={(e) => setForm({...form, reason: e.target.value})}
                                            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${
                                                theme === 'light' 
                                                    ? 'bg-white border-gray-200 text-gray-800' 
                                                    : 'bg-[#272727] border-[#3B3B3B] text-gray-200'
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

                                    <div className="mb-4">
                                        <label className={`block text-sm font-medium mb-1.5 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                            Provide Details
                                        </label>
                                        <textarea
                                            value={form.details}
                                            onChange={(e) => setForm({...form, details: e.target.value})}
                                            placeholder="Please provide additional details..."
                                            rows="4"
                                            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors resize-none ${
                                                theme === 'light' 
                                                    ? 'bg-white border-gray-200 text-gray-800' 
                                                    : 'bg-[#272727] border-[#3B3B3B] text-gray-200'
                                            }`}
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={closeModal}
                                            className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                                                theme === 'light'
                                                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                    : 'bg-[#2B2B2B] hover:bg-[#333] text-white'
                                            }`}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={submit}
                                            disabled={submitted || reportLoading}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white ${(submitted || reportLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {(submitted || reportLoading) ? (
                                                <>
                                                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
