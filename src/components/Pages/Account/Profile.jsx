import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getProfile, updateProfile, clearAlert } from '../../../actions/user';
import { dark, light } from '../../../style';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserEdit, faImage, faLock, faSpinner, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { put, del } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

const Profile = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()
    const profile = useSelector((state) => state.user.data)
    const alert = useSelector((state) => state.user.alert)
    const isLoading = useSelector((state) => state.user.isLoading)

    const [submitted, setSubmitted] = useState(false)
    const [errors, setErrors] = useState({})
    const [avatarLoading, setAvatarLoading] = useState(false)
    const [removedImages, setRemovedImages] = useState([])
    const avatarRef = useRef(null)

    const [form, setForm] = useState({
        avatar: null, avatarPreview: '',
        email: '', username: '',
        first_name: '', middle_name: '', last_name: '',
        bio: '', birthday: '', gender: '',
        contact_number: '', address: ''
    })

    const isLight = theme === 'light'

    useEffect(() => { dispatch(getProfile()) }, [])

    useEffect(() => {
        if (profile && Object.keys(profile).length > 0) {
            setSubmitted(false)
            const avatarUrl = typeof profile.avatar === 'object' && profile.avatar
                ? (profile.avatar.save || profile.avatar.preview || '')
                : (profile.avatar || '')
            setForm({
                avatar: avatarUrl || null,
                avatarPreview: avatarUrl,
                email: profile.email || '',
                username: profile.username || '',
                first_name: profile.first_name || '',
                middle_name: profile.middle_name || '',
                last_name: profile.last_name || '',
                bio: profile.bio || '',
                birthday: profile.birthday ? profile.birthday.substring(0, 10) : '',
                gender: profile.gender || '',
                contact_number: profile.contact_number || '',
                address: profile.address || ''
            })
        }
    }, [profile])

    useEffect(() => {
        if (Object.keys(alert).length > 0) {
            dispatch(clearAlert())
            setNotification(alert)
        }
    }, [alert])

    const fileNameGen = (name) => {
        const ext = name.substring(name.lastIndexOf('.'))
        return `${uuidv4()}${ext}`
    }

    const uploadToVercel = async (file) => {
        const blob = await put(fileNameGen(file.name), file, { access: 'public', token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN })
        return blob.url
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0]
        if (file && file.type.startsWith('image/')) {
            setAvatarLoading(true)
            if (form.avatar && typeof form.avatar === 'string' && form.avatar.includes('vercel-storage')) {
                setRemovedImages(prev => [...prev, form.avatar])
            }
            setTimeout(() => {
                setForm(p => ({ ...p, avatar: file, avatarPreview: URL.createObjectURL(file) }))
                setAvatarLoading(false)
            }, 600)
        }
    }

    const validateForm = () => {
        const errs = {}
        if (!form.first_name) errs.first_name = 'First name is required'
        if (!form.last_name) errs.last_name = 'Last name is required'
        if (form.contact_number && form.contact_number.length < 11) errs.contact_number = 'Must be at least 11 numbers'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm() || submitted) return
        setSubmitted(true)

        const data = { ...form }
        delete data.avatarPreview

        if (data.avatar instanceof File) {
            data.avatar = await uploadToVercel(data.avatar)
        }

        if (removedImages.length > 0) {
            removedImages.forEach(async (img) => {
                if (img.includes('vercel-storage')) await del(img, { token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN })
            })
        }

        dispatch(updateProfile(data))
    }

    const panelClass = `rounded-xl border ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#161616] border-[#2B2B2B]'}`
    const inputClass = `block w-full rounded-lg border transition-all duration-200 py-3 px-4 text-sm outline-none ${isLight ? 'bg-white border-slate-200 text-slate-700 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'bg-[#1A1A1A] border-[#333] text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/30'}`
    const readonlyClass = `block w-full rounded-lg border transition-all duration-200 py-3 px-4 pl-12 text-sm outline-none cursor-not-allowed ${isLight ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-[#111] border-[#2B2B2B] text-gray-500'}`
    const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-gray-500'}`
    const sectionLabel = `text-[10px] font-semibold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-gray-600'}`

    if (isLoading && Object.keys(profile).length === 0) {
        return (
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6">
                    <div className={`w-32 h-7 rounded-lg animate-pulse mb-2 ${isLight ? 'bg-slate-200' : 'bg-[#2B2B2B]'}`} />
                    <div className={`w-56 h-4 rounded animate-pulse ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`} />
                </div>
                <div className="max-w-2xl space-y-4">
                    <div className={`h-32 rounded-xl animate-pulse ${isLight ? 'bg-slate-100' : 'bg-[#1C1C1C]'}`} />
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-14 rounded-xl animate-pulse ${isLight ? 'bg-slate-100' : 'bg-[#1C1C1C]'}`} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-50' : 'bg-blue-900/20'}`}>
                        <FontAwesomeIcon icon={faUserEdit} className={`text-xs ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                    </div>
                    <h1 className={`text-2xl font-semibold ${isLight ? light.heading : dark.heading}`}>My Profile</h1>
                </div>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Update your personal information and profile details</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                {/* Avatar */}
                <div className={panelClass}>
                    <div className={`px-5 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                        <p className={sectionLabel}>Profile Photo</p>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center gap-5">
                            {avatarLoading ? (
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#2B2B2B]'}`}>
                                    <div className={`animate-spin rounded-full h-6 w-6 border-2 border-t-transparent ${isLight ? 'border-blue-500' : 'border-blue-400'}`} />
                                </div>
                            ) : form.avatarPreview ? (
                                <div onClick={() => avatarRef.current?.click()} className="relative cursor-pointer group">
                                    <img src={form.avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <FontAwesomeIcon icon={faImage} className="text-white text-sm" />
                                    </div>
                                </div>
                            ) : (
                                <div onClick={() => avatarRef.current?.click()}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all border-2 border-dashed ${isLight ? 'border-slate-200 hover:border-blue-300 bg-slate-50' : 'border-[#333] hover:border-[#444] bg-[#1A1A1A]'}`}>
                                    <FontAwesomeIcon icon={faImage} className={`text-lg ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                </div>
                            )}
                            <div>
                                <button type="button" onClick={() => avatarRef.current?.click()}
                                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isLight ? 'bg-blue-50 text-blue-500 hover:bg-blue-100' : 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30'}`}>
                                    Change Photo
                                </button>
                                <p className={`text-[11px] mt-1.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>JPG, PNG — Max 5MB</p>
                            </div>
                        </div>
                        <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </div>
                </div>

                {/* Account Info (readonly) */}
                <div className={panelClass}>
                    <div className={`px-5 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                        <p className={sectionLabel}>Account Information</p>
                    </div>
                    <div className="p-5 space-y-5">
                        <div>
                            <label className={labelClass}>Email</label>
                            <div className="relative">
                                <span className={`absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 rounded-l-lg ${isLight ? 'bg-slate-100' : 'bg-[#1A1A1A]'}`}>
                                    <FontAwesomeIcon icon={faLock} className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                                </span>
                                <input type="email" value={form.email} readOnly className={readonlyClass} title="Cannot be edited" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Username</label>
                            <div className="relative">
                                <span className={`absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 rounded-l-lg ${isLight ? 'bg-slate-100' : 'bg-[#1A1A1A]'}`}>
                                    <FontAwesomeIcon icon={faLock} className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                                </span>
                                <input type="text" value={form.username} readOnly className={readonlyClass} title="Cannot be edited" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Info */}
                <div className={panelClass}>
                    <div className={`px-5 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                        <p className={sectionLabel}>Personal Information</p>
                    </div>
                    <div className="p-5 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>First Name</label>
                                <input type="text" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} placeholder="First name" className={inputClass} />
                                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Middle Name</label>
                                <input type="text" value={form.middle_name} onChange={e => setForm(p => ({ ...p, middle_name: e.target.value }))} placeholder="Middle name" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Last Name</label>
                                <input type="text" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} placeholder="Last name" className={inputClass} />
                                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Bio</label>
                            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={3} className={`${inputClass} resize-none`} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Birthday</label>
                                <input type="date" value={form.birthday} onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Gender</label>
                                <div className="relative">
                                    <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className={`${inputClass} appearance-none pr-10`}>
                                        <option value="">Select gender</option>
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                    </select>
                                    <FontAwesomeIcon icon={faChevronDown} className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className={panelClass}>
                    <div className={`px-5 py-3 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                        <p className={sectionLabel}>Contact Information</p>
                    </div>
                    <div className="p-5 space-y-5">
                        <div>
                            <label className={labelClass}>Contact Number</label>
                            <input type="text" value={form.contact_number} onChange={e => setForm(p => ({ ...p, contact_number: e.target.value }))} placeholder="09xxxxxxxxx" className={inputClass} />
                            {errors.contact_number && <p className="text-xs text-red-500 mt-1">{errors.contact_number}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Address</label>
                            <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Your full address..." rows={3} className={`${inputClass} resize-none`} />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={submitted}
                    className={`w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                        submitted ? 'opacity-60 cursor-not-allowed' : ''
                    } ${isLight ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {submitted ? (
                        <><FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> Updating...</>
                    ) : 'Update Profile'}
                </button>
            </form>
        </div>
    )
}

export default Profile
