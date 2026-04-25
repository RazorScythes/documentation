import React, { useEffect, useState } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { updatePassword, clearAlert } from '../../../actions/settings'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faEye, faEyeSlash, faShieldHalved, faCheck } from '@fortawesome/free-solid-svg-icons'

const Password = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()

    const alert = useSelector((state) => state.settings.alert)
    const variant = useSelector((state) => state.settings.variant)
    const loading = useSelector((state) => state.settings.isLoading)

    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    })
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(false)

    const isLight = theme === 'light'

    useEffect(() => {
        const hasAlert = typeof alert === 'object' ? Object.keys(alert).length > 0 : !!alert
        if (hasAlert) {
            dispatch(clearAlert())
            const msg = typeof alert === 'string' ? alert : alert?.message || ''
            const v = variant || alert?.variant || ''
            if (setNotification) {
                setNotification({ variant: v, message: msg })
            }
            if (v === 'success') {
                setFormData({ current_password: '', new_password: '', confirm_password: '' })
            }
            setSubmitted(false)
        }
    }, [alert, variant, dispatch, setNotification])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.current_password) newErrors.current_password = 'Current password is required'
        if (!formData.new_password) newErrors.new_password = 'New password is required'
        else if (formData.new_password.length < 6) newErrors.new_password = 'Password must be at least 6 characters'
        else if (formData.new_password === formData.current_password) newErrors.new_password = 'New password must be different from current password'
        if (!formData.confirm_password) newErrors.confirm_password = 'Please confirm your password'
        else if (formData.confirm_password !== formData.new_password) newErrors.confirm_password = 'Passwords do not match'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validateForm()) return
        if (!submitted) {
            setSubmitted(true)
            dispatch(updatePassword({
                id: user._id,
                password: { old: formData.current_password, new: formData.new_password, confirm: formData.confirm_password }
            }))
        }
    }

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
    }

    const strength = formData.new_password.length
    const strengthLevel = strength === 0 ? 0 : strength < 6 ? 1 : strength < 10 ? 2 : strength < 14 ? 3 : 4
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500']
    const strengthTextColors = ['', 'text-red-500', 'text-amber-500', 'text-blue-500', 'text-emerald-500']

    const checks = [
        { label: 'At least 6 characters', met: formData.new_password.length >= 6 },
        { label: 'Different from current', met: formData.new_password.length > 0 && formData.new_password !== formData.current_password },
        { label: 'Passwords match', met: formData.confirm_password.length > 0 && formData.confirm_password === formData.new_password },
    ]

    const fieldConfig = [
        { key: 'current', name: 'current_password', label: 'Current Password', placeholder: 'Enter current password' },
        { key: 'new', name: 'new_password', label: 'New Password', placeholder: 'Enter new password' },
        { key: 'confirm', name: 'confirm_password', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
    ]

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-amber-50' : 'bg-amber-900/20'}`}>
                        <FontAwesomeIcon icon={faLock} className={`text-xs ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
                    </div>
                    <h1 className={`text-2xl font-semibold ${isLight ? light.heading : dark.heading}`}>Change Password</h1>
                </div>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                    Update your password to keep your account secure
                </p>
            </div>

            <div className="max-w-2xl grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Form */}
                <div className={`lg:col-span-3 rounded-xl p-6 border ${isLight ? 'bg-white/60 border-slate-200/60' : 'bg-[#161616] border-[#222]'}`}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {fieldConfig.map((field) => (
                            <div key={field.key}>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                    {field.label}
                                </label>
                                <div className="relative">
                                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>
                                        <FontAwesomeIcon icon={faLock} className="text-xs" />
                                    </div>
                                    <input
                                        type={showPasswords[field.key] ? 'text' : 'password'}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-12 py-3 rounded-lg border text-sm outline-none transition-all ${
                                            isLight
                                                ? `bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100`
                                                : `bg-[#1C1C1C] border-[#333] text-gray-200 placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/30`
                                        } ${errors[field.name] ? (isLight ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-red-800 focus:border-red-600 focus:ring-red-900/30') : ''}`}
                                        placeholder={field.placeholder}
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPasswords[field.key] ? `Hide ${field.label}` : `Show ${field.label}`}
                                        onClick={() => togglePasswordVisibility(field.key)}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all text-xs ${
                                            isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-gray-500 hover:text-gray-300 hover:bg-[#2B2B2B]'
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={showPasswords[field.key] ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                                {errors[field.name] && (
                                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                        {errors[field.name]}
                                    </p>
                                )}

                                {field.key === 'new' && formData.new_password.length > 0 && (
                                    <div className="mt-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`flex-1 h-1 rounded-full ${isLight ? 'bg-slate-100' : 'bg-[#2B2B2B]'}`}>
                                                <div className={`h-full rounded-full transition-all duration-300 ${strengthColors[strengthLevel]}`} style={{ width: `${strengthLevel * 25}%` }} />
                                            </div>
                                            <span className={`text-[10px] font-semibold ${strengthTextColors[strengthLevel]}`}>{strengthLabels[strengthLevel]}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={submitted || loading}
                                className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
                                    isLight
                                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {submitted || loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar: Requirements */}
                <div className={`lg:col-span-2 rounded-xl p-5 border h-fit ${isLight ? 'bg-white/60 border-slate-200/60' : 'bg-[#161616] border-[#222]'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <FontAwesomeIcon icon={faShieldHalved} className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Requirements</h3>
                    </div>
                    <div className="space-y-3">
                        {checks.map((check, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                    check.met
                                        ? (isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-900/30 text-emerald-400')
                                        : (isLight ? 'bg-slate-100 text-slate-300' : 'bg-[#2B2B2B] text-gray-600')
                                }`}>
                                    <FontAwesomeIcon icon={faCheck} className="text-[8px]" />
                                </div>
                                <span className={`text-xs transition-colors ${
                                    check.met
                                        ? (isLight ? 'text-emerald-600 font-medium' : 'text-emerald-400 font-medium')
                                        : (isLight ? 'text-slate-400' : 'text-gray-500')
                                }`}>{check.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Password
