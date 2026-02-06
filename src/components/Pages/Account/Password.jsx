import React, { useEffect, useState } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { updatePassword, clearAlert } from '../../../actions/settings'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

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

    useEffect(() => {
        if (Object.keys(alert).length > 0) {
            dispatch(clearAlert())
            if (setNotification) {
                setNotification({ variant, message: alert })
            }
            if (variant === 'success') {
                setFormData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                })
            }
            setSubmitted(false)
        }
    }, [alert, variant, dispatch, setNotification])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.current_password) {
            newErrors.current_password = 'Current password is required'
        }
        
        if (!formData.new_password) {
            newErrors.new_password = 'New password is required'
        } else if (formData.new_password.length < 6) {
            newErrors.new_password = 'Password must be at least 6 characters'
        } else if (formData.new_password === formData.current_password) {
            newErrors.new_password = 'New password must be different from current password'
        }
        
        if (!formData.confirm_password) {
            newErrors.confirm_password = 'Please confirm your password'
        } else if (formData.confirm_password !== formData.new_password) {
            newErrors.confirm_password = 'Passwords do not match'
        }
        
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
                password: {
                    old: formData.current_password,
                    new: formData.new_password,
                    confirm: formData.confirm_password
                }
            }))
        }
    }

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            {/* Header Section */}
            <div className='mb-8'>
                <h1 className={`text-3xl font-semibold mb-2 ${theme === 'light' ? light.heading : dark.heading}`}>
                    Change Password
                </h1>
                <p className={`text-sm ${theme === 'light' ? light.text : dark.text}`}>
                    Update your account password to keep it secure
                </p>
            </div>

            {/* Password Form Card */}
            <div className={`max-w-2xl rounded-xl p-6 md:p-8 border ${
                theme === 'light'
                    ? 'bg-white/80 backdrop-blur-sm border-blue-200/60 shadow-md'
                    : 'bg-[#1C1C1C] border-[#2B2B2B] shadow-lg'
            }`}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Current Password */}
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'light' ? 'text-blue-700' : 'text-blue-400'}`}>
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 ${
                                    theme === 'light'
                                        ? light.input
                                        : dark.input
                                } ${errors.current_password ? 'border-red-500' : ''}`}
                                placeholder="Enter your current password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-md transition-all ${
                                    theme === 'light'
                                        ? 'text-blue-600 hover:bg-blue-100/50'
                                        : 'text-blue-400 hover:bg-[#2B2B2B]'
                                }`}
                            >
                                <FontAwesomeIcon icon={showPasswords.current ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        {errors.current_password && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.current_password}
                            </p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'light' ? 'text-blue-700' : 'text-blue-400'}`}>
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 ${
                                    theme === 'light'
                                        ? light.input
                                        : dark.input
                                } ${errors.new_password ? 'border-red-500' : ''}`}
                                placeholder="Enter your new password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-md transition-all ${
                                    theme === 'light'
                                        ? 'text-blue-600 hover:bg-blue-100/50'
                                        : 'text-blue-400 hover:bg-[#2B2B2B]'
                                }`}
                            >
                                <FontAwesomeIcon icon={showPasswords.new ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        {errors.new_password && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.new_password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'light' ? 'text-blue-700' : 'text-blue-400'}`}>
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 ${
                                    theme === 'light'
                                        ? light.input
                                        : dark.input
                                } ${errors.confirm_password ? 'border-red-500' : ''}`}
                                placeholder="Confirm your new password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-md transition-all ${
                                    theme === 'light'
                                        ? 'text-blue-600 hover:bg-blue-100/50'
                                        : 'text-blue-400 hover:bg-[#2B2B2B]'
                                }`}
                            >
                                <FontAwesomeIcon icon={showPasswords.confirm ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        {errors.confirm_password && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.confirm_password}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={submitted || loading}
                            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                                theme === 'light'
                                    ? light.button_secondary
                                    : dark.button_secondary
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {submitted || loading ? 'Updating Password...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Password
