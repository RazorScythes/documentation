import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faPlus, faPaperPlane, faEnvelope, faTimes, faCheck, faTags, faCircleCheck, faCircleXmark, faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { useDispatch, useSelector } from 'react-redux'
import { sendTestEmail, uploadContacts, clearAlert } from "../../../actions/portfolio"

const Contact = ({ user, portfolio, isLight, card, inputCls, btnPrimary, btnSecondary, labelCls }) => {
    const dispatch = useDispatch()

    const [sending, setSending] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const [contact, setContact] = useState({ email: '', subject: [], phone: '', location: '' })
    const [input, setInput] = useState('')
    const [showSubjectForm, setShowSubjectForm] = useState(false)

    const addSubject = () => {
        if (!input || contact.subject.includes(input)) return
        setContact({ ...contact, subject: [...contact.subject, input] })
        setInput('')
    }

    const deleteSubject = (i) => { const arr = [...contact.subject]; arr.splice(i, 1); setContact({ ...contact, subject: arr }) }
    const isEmail = (t) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)

    useEffect(() => {
        setContact({ ...contact, email: portfolio?.email || '', subject: portfolio?.subject || [], phone: portfolio?.phone || '', location: portfolio?.location || '' })
        setSubmitted(false); setSending(false)
    }, [portfolio])

    const testEmail = () => { if (!sending) { setSending(true); dispatch(sendTestEmail({ email: contact.email })) } }
    const handleSubmit = () => { if (!isEmail(contact.email) || submitted) return; dispatch(uploadContacts(contact)); setSubmitted(true) }

    const contactComplete = [
        { label: 'Email', done: isEmail(contact.email) },
        { label: 'Phone', done: !!contact.phone },
        { label: 'Location', done: !!contact.location },
        { label: 'Subjects', done: contact.subject.length > 0 },
    ]

    return (
        <div className="space-y-4">
            {/* Contact Summary */}
            <div className={`${card} overflow-hidden`}>
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isEmail(contact.email)
                                ? (isLight ? 'bg-emerald-100' : 'bg-emerald-900/30')
                                : (isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]')
                        }`}>
                            <FontAwesomeIcon icon={faEnvelope} className={`text-lg ${
                                isEmail(contact.email) ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : (isLight ? 'text-slate-400' : 'text-gray-500')
                            }`} />
                        </div>
                        <div className="min-w-0">
                            <h3 className={`text-sm font-bold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                {isEmail(contact.email) ? contact.email : 'No email configured'}
                            </h3>
                            <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                {contact.subject.length} subject{contact.subject.length !== 1 ? 's' : ''} configured
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {contactComplete.map((c, i) => (
                            <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${c.done
                                ? (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400')
                                : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#1a1a1a] text-gray-600')
                            }`}>
                                <FontAwesomeIcon icon={c.done ? faCircleCheck : faCircleXmark} className="text-[9px]" />
                                {c.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Email Card */}
            <div className={`${card} overflow-hidden`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-rose-100' : 'bg-rose-900/30'}`}>
                            <FontAwesomeIcon icon={faEnvelope} className={`text-sm ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Contact Email</h3>
                    </div>
                    <button disabled={!isEmail(contact.email)} onClick={testEmail}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${isLight ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                        <FontAwesomeIcon icon={faPaperPlane} className="text-[10px]" />
                        {!sending ? "Test Email" : <span className="flex items-center gap-1">Sending<span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
                    </button>
                </div>

                <div className={`px-4 sm:px-5 py-4 ${isLight ? 'bg-slate-50/50' : 'bg-[#111]'}`}>
                    <div className={`flex items-start gap-2 p-3 rounded-lg mb-3 ${isLight ? 'bg-blue-50 border border-solid border-blue-100' : 'bg-blue-900/10 border border-solid border-blue-900/30'}`}>
                        <FontAwesomeIcon icon={faInfoCircle} className={`text-xs mt-0.5 flex-shrink-0 ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                        <p className={`text-[11px] leading-relaxed ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
                            Visitors will use this email to contact you through your portfolio. A test email will be sent to verify your inbox receives messages correctly.
                        </p>
                    </div>
                    <div>
                        <label className={labelCls}>Email Address</label>
                        <input type="email" className={inputCls} onChange={(e) => setContact({ ...contact, email: e.target.value })} value={contact.email} placeholder="your@email.com" />
                        {contact.email && !isEmail(contact.email) && (
                            <p className="text-[11px] mt-1 text-red-500">Please enter a valid email address</p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div>
                            <label className={labelCls}>Phone Number</label>
                            <input type="text" className={inputCls} onChange={(e) => setContact({ ...contact, phone: e.target.value })} value={contact.phone} placeholder="+1 (555) 123-4567" />
                        </div>
                        <div>
                            <label className={labelCls}>Location</label>
                            <input type="text" className={inputCls} onChange={(e) => setContact({ ...contact, location: e.target.value })} value={contact.location} placeholder="City, Country" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Subjects Card */}
            <div className={`${card} overflow-hidden`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-amber-100' : 'bg-amber-900/30'}`}>
                            <FontAwesomeIcon icon={faTags} className={`text-sm ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Subjects ({contact.subject.length})</h3>
                    </div>
                    <button onClick={() => setShowSubjectForm(!showSubjectForm)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${showSubjectForm
                            ? (isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#1f1f1f] text-gray-400')
                            : (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                        }`}>
                        <FontAwesomeIcon icon={showSubjectForm ? faTimes : faPlus} className="text-[10px]" />
                        {showSubjectForm ? 'Cancel' : 'Add Subject'}
                    </button>
                </div>

                {showSubjectForm && (
                    <div className={`px-4 sm:px-5 py-4 border-b border-solid ${isLight ? 'bg-slate-50/50 border-slate-100' : 'bg-[#111] border-[#1f1f1f]'}`}>
                        <div>
                            <label className={labelCls}>Subject Name</label>
                            <div className="flex gap-2">
                                <input type="text" className={inputCls} value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. Job Offer, Collaboration"
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject() } }} />
                                <button onClick={addSubject} className={btnPrimary} disabled={!input}>
                                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {contact.subject.length > 0 ? (
                    <div className="px-4 sm:px-5 py-4">
                        <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Available Subjects</p>
                        <div className="flex flex-wrap gap-2">
                            {contact.subject.map((s, i) => (
                                <span key={i} className={`inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg text-xs font-medium transition-all ${isLight ? 'bg-amber-50 text-amber-700 border border-solid border-amber-200 hover:border-amber-300' : 'bg-amber-900/20 text-amber-400 border border-solid border-amber-800/50 hover:border-amber-700/50'}`}>
                                    {s}
                                    <button onClick={() => deleteSubject(i)}
                                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isLight ? 'hover:bg-red-100 hover:text-red-500' : 'hover:bg-red-900/30 hover:text-red-400'}`}>
                                        <FontAwesomeIcon icon={faTimes} className="text-[9px]" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={`flex flex-col items-center justify-center py-10 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                            <FontAwesomeIcon icon={faTags} className="text-lg" />
                        </div>
                        <p className="text-xs font-medium">No subjects added yet</p>
                        <p className="text-[11px] mt-0.5">Subjects appear as dropdown options in the contact form</p>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button onClick={handleSubmit} disabled={submitted || !isEmail(contact.email)} className={`${btnPrimary} disabled:opacity-50 flex items-center gap-2`}>
                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                    {!submitted ? "Save Contact" : <span className="flex items-center gap-2">Saving<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
                </button>
            </div>
        </div>
    )
}

export default Contact
