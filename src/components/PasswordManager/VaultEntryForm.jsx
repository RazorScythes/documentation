import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faKey, faStickyNote, faCreditCard, faIdCard,
    faEye, faEyeSlash, faRandom, faTimes, faPlus, faStar, faFolder, faTags, faSave,
} from '@fortawesome/free-solid-svg-icons'
import { encrypt, generatePassword } from './CryptoService'
import { createEntry, updateEntry } from '../../actions/vault'

const ENTRY_TYPES = [
    { id: 'password', label: 'Password', icon: faKey },
    { id: 'note', label: 'Note', icon: faStickyNote },
    { id: 'card', label: 'Card', icon: faCreditCard },
    { id: 'identity', label: 'Identity', icon: faIdCard },
]

const EMPTY_PASSWORD = {
    name: '',
    username: '',
    email: '',
    password: '',
    url: '',
    notes: '',
    totp: '',
    customFields: [],
}

const EMPTY_NOTE = {
    name: '',
    content: '',
}

const EMPTY_CARD = {
    name: '',
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    pin: '',
    notes: '',
}

const EMPTY_IDENTITY = {
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    notes: '',
}

function extractDomain(url) {
    if (!url) return ''
    try {
        const normalized = url.includes('://') ? url : `https://${url}`
        return new URL(normalized).hostname.replace(/^www\./, '')
    } catch {
        return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    }
}

function getDefaultFormData(type) {
    switch (type) {
        case 'note': return { ...EMPTY_NOTE }
        case 'card': return { ...EMPTY_CARD }
        case 'identity': return { ...EMPTY_IDENTITY }
        default: return { ...EMPTY_PASSWORD }
    }
}

function populateFormData(type, decrypted, metadata) {
    const base = getDefaultFormData(type)
    const name = metadata?.name || ''
    if (!decrypted) return { ...base, name }

    switch (type) {
        case 'password':
            return {
                ...base,
                name,
                username: decrypted.username || '',
                email: decrypted.email || '',
                password: decrypted.password || '',
                url: decrypted.url || '',
                notes: decrypted.notes || '',
                totp: decrypted.totp || '',
                customFields: Array.isArray(decrypted.customFields) ? decrypted.customFields : [],
            }
        case 'note':
            return { ...base, name, content: decrypted.content || '' }
        case 'card':
            return {
                ...base,
                name,
                cardholderName: decrypted.cardholderName || '',
                cardNumber: decrypted.cardNumber || '',
                expiryMonth: decrypted.expiryMonth || '',
                expiryYear: decrypted.expiryYear || '',
                cvv: decrypted.cvv || '',
                pin: decrypted.pin || '',
                notes: decrypted.notes || '',
            }
        case 'identity':
            return {
                ...base,
                name,
                firstName: decrypted.firstName || '',
                lastName: decrypted.lastName || '',
                email: decrypted.email || '',
                phone: decrypted.phone || '',
                address1: decrypted.address1 || '',
                address2: decrypted.address2 || '',
                city: decrypted.city || '',
                state: decrypted.state || '',
                postalCode: decrypted.postalCode || '',
                country: decrypted.country || '',
                notes: decrypted.notes || '',
            }
        default:
            return { ...base, name }
    }
}

function buildEncryptedPayload(type, formData) {
    switch (type) {
        case 'password':
            return {
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password,
                url: formData.url.trim(),
                notes: formData.notes.trim(),
                totp: formData.totp.trim(),
                customFields: (formData.customFields || []).filter(f => f.label?.trim() || f.value?.trim()),
            }
        case 'note':
            return { content: formData.content }
        case 'card':
            return {
                cardholderName: formData.cardholderName.trim(),
                cardNumber: formData.cardNumber.replace(/\s/g, ''),
                expiryMonth: formData.expiryMonth.trim(),
                expiryYear: formData.expiryYear.trim(),
                cvv: formData.cvv.trim(),
                pin: formData.pin.trim(),
                notes: formData.notes.trim(),
            }
        case 'identity':
            return {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                address1: formData.address1.trim(),
                address2: formData.address2.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                postalCode: formData.postalCode.trim(),
                country: formData.country.trim(),
                notes: formData.notes.trim(),
            }
        default:
            return {}
    }
}

function validateForm(type, formData) {
    const errors = {}
    if (!formData.name?.trim()) {
        errors.name = 'Name is required'
    }
    if (type === 'note' && !formData.content?.trim()) {
        errors.content = 'Content is required'
    }
    if (type === 'password' && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Invalid email address'
    }
    if (type === 'card' && formData.cardNumber) {
        const digits = formData.cardNumber.replace(/\s/g, '')
        if (!/^\d{13,19}$/.test(digits)) {
            errors.cardNumber = 'Card number must be 13–19 digits'
        }
    }
    if (type === 'card' && formData.expiryMonth) {
        const month = parseInt(formData.expiryMonth, 10)
        if (month < 1 || month > 12) {
            errors.expiryMonth = 'Month must be 01–12'
        }
    }
    if (type === 'card' && formData.expiryYear) {
        const year = formData.expiryYear.length === 2
            ? 2000 + parseInt(formData.expiryYear, 10)
            : parseInt(formData.expiryYear, 10)
        if (year < new Date().getFullYear()) {
            errors.expiryYear = 'Card has expired'
        }
    }
    return errors
}

function maskValue(value, visibleChars = 4) {
    if (!value) return ''
    if (value.length <= visibleChars) return '•'.repeat(value.length)
    return '•'.repeat(value.length - visibleChars) + value.slice(-visibleChars)
}

function VaultEntryForm({
    theme,
    entry = null,
    decryptedData,
    encryptionKey,
    folders = [],
    onSave,
    onCancel,
    isOpen = true,
    onClose,
}) {
    const dispatch = useDispatch()
    const { isLoading } = useSelector((state) => state.vault)
    const isLight = theme === 'light'
    const isEditMode = Boolean(entry?._id)
    const resolvedDecrypted = decryptedData ?? entry?.decrypted ?? null
    const handleCancel = onCancel || onClose

    const [entryType, setEntryType] = useState(entry?.type || 'password')
    const [formData, setFormData] = useState(() => getDefaultFormData(entry?.type || 'password'))
    const [tags, setTags] = useState(entry?.tags || [])
    const [tagInput, setTagInput] = useState('')
    const [folder, setFolder] = useState(entry?.folder || '')
    const [favorite, setFavorite] = useState(entry?.favorite || false)
    const [errors, setErrors] = useState({})
    const [submitError, setSubmitError] = useState('')

    const [showPassword, setShowPassword] = useState(false)
    const [showCvv, setShowCvv] = useState(false)
    const [showPin, setShowPin] = useState(false)
    const [showCardNumber, setShowCardNumber] = useState(false)

    const inputClass = `${isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#111] border-[#2B2B2B] text-gray-200'} border border-solid rounded-lg px-3 py-2 text-sm outline-none w-full`
    const labelClass = `text-xs font-medium ${isLight ? 'text-slate-600' : 'text-gray-400'} mb-1 block`
    const cardClass = `${isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#1e1e1e]'} border border-solid rounded-xl p-5`
    const btnPrimary = 'px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50'
    const btnSecondary = `px-4 py-2 rounded-lg text-sm font-medium ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'} transition-colors`
    const errorClass = `text-xs mt-1 ${isLight ? 'text-red-600' : 'text-red-400'}`
    const headingText = isLight ? 'text-slate-800' : 'text-white'
    const mutedText = isLight ? 'text-slate-500' : 'text-gray-500'

    useEffect(() => {
        const type = entry?.type || 'password'
        setEntryType(type)
        setFormData(populateFormData(type, resolvedDecrypted, entry?.metadata))
        setTags(entry?.tags || [])
        setTagInput('')
        setFolder(entry?.folder || '')
        setFavorite(entry?.favorite || false)
        setErrors({})
        setSubmitError('')
        setShowPassword(false)
        setShowCvv(false)
        setShowPin(false)
        setShowCardNumber(false)
    }, [entry, resolvedDecrypted])

    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setErrors(prev => {
            if (!prev[field]) return prev
            const next = { ...prev }
            delete next[field]
            return next
        })
    }, [])

    const handleTypeChange = (type) => {
        if (isEditMode) return
        setEntryType(type)
        setFormData(prev => {
            const next = getDefaultFormData(type)
            next.name = prev.name || ''
            return next
        })
        setErrors({})
    }

    const handleGeneratePassword = () => {
        updateField('password', generatePassword({ length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true }))
    }

    const handleAddCustomField = () => {
        setFormData(prev => ({
            ...prev,
            customFields: [...(prev.customFields || []), { label: '', value: '' }],
        }))
    }

    const handleUpdateCustomField = (index, field, value) => {
        setFormData(prev => {
            const customFields = [...(prev.customFields || [])]
            customFields[index] = { ...customFields[index], [field]: value }
            return { ...prev, customFields }
        })
    }

    const handleRemoveCustomField = (index) => {
        setFormData(prev => ({
            ...prev,
            customFields: (prev.customFields || []).filter((_, i) => i !== index),
        }))
    }

    const commitTags = (raw) => {
        const newTags = raw
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
            .filter(t => !tags.includes(t))
        if (newTags.length > 0) {
            setTags(prev => [...prev, ...newTags])
        }
        setTagInput('')
    }

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            commitTags(tagInput)
        }
    }

    const removeTag = (tag) => {
        setTags(prev => prev.filter(t => t !== tag))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitError('')

        const validationErrors = validateForm(entryType, formData)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        if (!encryptionKey) {
            setSubmitError('Vault is locked. Please unlock before saving.')
            return
        }

        try {
            const metadata = {
                name: formData.name.trim(),
                ...(entryType === 'password' && formData.url
                    ? { domain: extractDomain(formData.url) }
                    : {}),
            }

            const payload = buildEncryptedPayload(entryType, formData)
            const plaintext = JSON.stringify(payload)
            const { encryptedData, iv } = await encrypt(plaintext, encryptionKey)

            const entryPayload = {
                type: entryType,
                encryptedData,
                iv,
                folder: folder || null,
                tags,
                favorite,
                metadata,
            }

            let result
            if (isEditMode) {
                result = await dispatch(updateEntry({ id: entry._id, ...entryPayload })).unwrap()
            } else {
                result = await dispatch(createEntry(entryPayload)).unwrap()
            }

            if (onSave) {
                onSave(result.result)
            }
        } catch (err) {
            setSubmitError(err?.message || 'Failed to save entry')
        }
    }

    if (!isOpen) return null

    const renderFieldError = (field) => errors[field] ? <p className={errorClass}>{errors[field]}</p> : null

    const renderPasswordFields = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Username</label>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => updateField('username', e.target.value)}
                        className={inputClass}
                        placeholder="Username"
                        autoComplete="off"
                    />
                </div>
                <div>
                    <label className={labelClass}>Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={inputClass}
                        placeholder="email@example.com"
                        autoComplete="off"
                    />
                    {renderFieldError('email')}
                </div>
            </div>

            <div>
                <label className={labelClass}>Password</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => updateField('password', e.target.value)}
                            className={`${inputClass} pr-10`}
                            placeholder="Password"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText}`}
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-xs" />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'} transition-colors`}
                    >
                        <FontAwesomeIcon icon={faRandom} className="text-xs" />
                        Generate
                    </button>
                </div>
            </div>

            <div>
                <label className={labelClass}>URL / Domain</label>
                <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => updateField('url', e.target.value)}
                    className={inputClass}
                    placeholder="https://example.com"
                />
            </div>

            <div>
                <label className={labelClass}>TOTP Secret (optional)</label>
                <input
                    type="text"
                    value={formData.totp}
                    onChange={(e) => updateField('totp', e.target.value)}
                    className={inputClass}
                    placeholder="Base32 secret for authenticator"
                    autoComplete="off"
                />
            </div>

            <div>
                <label className={labelClass}>Notes</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    className={`${inputClass} min-h-[80px] resize-y`}
                    placeholder="Additional notes..."
                    rows={3}
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className={`${labelClass} mb-0`}>Custom Fields</label>
                    <button
                        type="button"
                        onClick={handleAddCustomField}
                        className={`flex items-center gap-1 text-xs font-medium ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}`}
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                        Add Field
                    </button>
                </div>
                {(formData.customFields || []).length === 0 ? (
                    <p className={`text-xs ${mutedText}`}>No custom fields added</p>
                ) : (
                    <div className="space-y-2">
                        {(formData.customFields || []).map((field, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => handleUpdateCustomField(index, 'label', e.target.value)}
                                    className={inputClass}
                                    placeholder="Label"
                                />
                                <input
                                    type="text"
                                    value={field.value}
                                    onChange={(e) => handleUpdateCustomField(index, 'value', e.target.value)}
                                    className={inputClass}
                                    placeholder="Value"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCustomField(index)}
                                    className={`p-2 rounded-lg flex-shrink-0 ${isLight ? 'text-slate-400 hover:bg-slate-100 hover:text-red-500' : 'text-gray-500 hover:bg-[#222] hover:text-red-400'} transition-colors`}
                                >
                                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

    const renderNoteFields = () => (
        <div>
            <label className={labelClass}>Content</label>
            <textarea
                value={formData.content}
                onChange={(e) => updateField('content', e.target.value)}
                className={`${inputClass} min-h-[200px] resize-y font-mono`}
                placeholder="Write your secure note here..."
                rows={8}
            />
            {renderFieldError('content')}
        </div>
    )

    const renderCardFields = () => (
        <div className="space-y-4">
            <div>
                <label className={labelClass}>Cardholder Name</label>
                <input
                    type="text"
                    value={formData.cardholderName}
                    onChange={(e) => updateField('cardholderName', e.target.value)}
                    className={inputClass}
                    placeholder="Name on card"
                />
            </div>

            <div>
                <label className={labelClass}>Card Number</label>
                <div className="relative">
                    <input
                        type={showCardNumber ? 'text' : 'password'}
                        value={formData.cardNumber}
                        onChange={(e) => updateField('cardNumber', e.target.value.replace(/[^\d\s]/g, ''))}
                        className={`${inputClass} pr-10 font-mono`}
                        placeholder="1234 5678 9012 3456"
                        autoComplete="off"
                    />
                    <button
                        type="button"
                        onClick={() => setShowCardNumber(!showCardNumber)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText}`}
                    >
                        <FontAwesomeIcon icon={showCardNumber ? faEyeSlash : faEye} className="text-xs" />
                    </button>
                </div>
                {!showCardNumber && formData.cardNumber && (
                    <p className={`text-xs mt-1 font-mono ${mutedText}`}>{maskValue(formData.cardNumber.replace(/\s/g, ''))}</p>
                )}
                {renderFieldError('cardNumber')}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                    <label className={labelClass}>Expiry Month</label>
                    <input
                        type="text"
                        value={formData.expiryMonth}
                        onChange={(e) => updateField('expiryMonth', e.target.value.replace(/\D/g, '').slice(0, 2))}
                        className={inputClass}
                        placeholder="MM"
                        maxLength={2}
                    />
                    {renderFieldError('expiryMonth')}
                </div>
                <div>
                    <label className={labelClass}>Expiry Year</label>
                    <input
                        type="text"
                        value={formData.expiryYear}
                        onChange={(e) => updateField('expiryYear', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className={inputClass}
                        placeholder="YYYY"
                        maxLength={4}
                    />
                    {renderFieldError('expiryYear')}
                </div>
                <div>
                    <label className={labelClass}>CVV</label>
                    <div className="relative">
                        <input
                            type={showCvv ? 'text' : 'password'}
                            value={formData.cvv}
                            onChange={(e) => updateField('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className={`${inputClass} pr-10 font-mono`}
                            placeholder="•••"
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCvv(!showCvv)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText}`}
                        >
                            <FontAwesomeIcon icon={showCvv ? faEyeSlash : faEye} className="text-xs" />
                        </button>
                    </div>
                </div>
                <div>
                    <label className={labelClass}>PIN</label>
                    <div className="relative">
                        <input
                            type={showPin ? 'text' : 'password'}
                            value={formData.pin}
                            onChange={(e) => updateField('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className={`${inputClass} pr-10 font-mono`}
                            placeholder="••••"
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText}`}
                        >
                            <FontAwesomeIcon icon={showPin ? faEyeSlash : faEye} className="text-xs" />
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <label className={labelClass}>Notes</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    className={`${inputClass} min-h-[80px] resize-y`}
                    placeholder="Billing address, bank name, etc."
                    rows={3}
                />
            </div>
        </div>
    )

    const renderIdentityFields = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>First Name</label>
                    <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        className={inputClass}
                        placeholder="First name"
                    />
                </div>
                <div>
                    <label className={labelClass}>Last Name</label>
                    <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        className={inputClass}
                        placeholder="Last name"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={inputClass}
                        placeholder="email@example.com"
                    />
                </div>
                <div>
                    <label className={labelClass}>Phone</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className={inputClass}
                        placeholder="+1 (555) 000-0000"
                    />
                </div>
            </div>

            <div>
                <label className={labelClass}>Address Line 1</label>
                <input
                    type="text"
                    value={formData.address1}
                    onChange={(e) => updateField('address1', e.target.value)}
                    className={inputClass}
                    placeholder="Street address"
                />
            </div>

            <div>
                <label className={labelClass}>Address Line 2</label>
                <input
                    type="text"
                    value={formData.address2}
                    onChange={(e) => updateField('address2', e.target.value)}
                    className={inputClass}
                    placeholder="Apt, suite, unit, etc."
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2 sm:col-span-1">
                    <label className={labelClass}>City</label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className={inputClass}
                        placeholder="City"
                    />
                </div>
                <div>
                    <label className={labelClass}>State</label>
                    <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        className={inputClass}
                        placeholder="State"
                    />
                </div>
                <div>
                    <label className={labelClass}>Postal Code</label>
                    <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => updateField('postalCode', e.target.value)}
                        className={inputClass}
                        placeholder="ZIP"
                    />
                </div>
                <div>
                    <label className={labelClass}>Country</label>
                    <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => updateField('country', e.target.value)}
                        className={inputClass}
                        placeholder="Country"
                    />
                </div>
            </div>

            <div>
                <label className={labelClass}>Notes</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    className={`${inputClass} min-h-[80px] resize-y`}
                    placeholder="Additional identity notes..."
                    rows={3}
                />
            </div>
        </div>
    )

    const renderTypeFields = () => {
        switch (entryType) {
            case 'note': return renderNoteFields()
            case 'card': return renderCardFields()
            case 'identity': return renderIdentityFields()
            default: return renderPasswordFields()
        }
    }

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCancel} />
            <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl ${cardClass}`}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className={`text-lg font-semibold ${headingText}`}>
                        {isEditMode ? 'Edit Entry' : 'New Entry'}
                    </h2>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className={`p-2 rounded-lg transition-colors ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#222]'}`}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {!isEditMode && (
                    <div className={`flex flex-wrap gap-1 p-1 rounded-xl mb-5 ${isLight ? 'bg-slate-100' : 'bg-[#111]'}`}>
                        {ENTRY_TYPES.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => handleTypeChange(t.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                                    entryType === t.id
                                        ? isLight ? 'bg-white text-indigo-700 shadow-sm' : 'bg-[#1a1a1a] text-indigo-400 shadow-sm'
                                        : isLight ? 'text-slate-500 hover:text-slate-700' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <FontAwesomeIcon icon={t.icon} className="text-[10px]" />
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}

                {isEditMode && (
                    <div className={`flex items-center gap-2 mb-5 px-3 py-2 rounded-lg text-xs font-medium ${isLight ? 'bg-slate-50 text-slate-600' : 'bg-[#111] text-gray-400'}`}>
                        <FontAwesomeIcon icon={ENTRY_TYPES.find(t => t.id === entryType)?.icon || faKey} />
                        {ENTRY_TYPES.find(t => t.id === entryType)?.label || entryType}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelClass}>Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            className={inputClass}
                            placeholder="Entry name"
                            autoFocus
                        />
                        {renderFieldError('name')}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>
                                <FontAwesomeIcon icon={faFolder} className="mr-1.5 text-[10px]" />
                                Folder
                            </label>
                            <select
                                value={folder}
                                onChange={(e) => setFolder(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">No folder</option>
                                {folders.map((f) => (
                                    <option key={f._id} value={f._id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>
                                <FontAwesomeIcon icon={faStar} className="mr-1.5 text-[10px]" />
                                Favorite
                            </label>
                            <button
                                type="button"
                                onClick={() => setFavorite(!favorite)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                                    favorite
                                        ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500'
                                        : isLight
                                            ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                            : 'border-[#2B2B2B] text-gray-400 hover:bg-[#1a1a1a]'
                                }`}
                            >
                                <FontAwesomeIcon icon={faStar} className={favorite ? 'text-yellow-500' : mutedText} />
                                {favorite ? 'Favorited' : 'Mark as favorite'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>
                            <FontAwesomeIcon icon={faTags} className="mr-1.5 text-[10px]" />
                            Tags
                        </label>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                                            isLight ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-900/30 text-indigo-300'
                                        }`}
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="opacity-60 hover:opacity-100"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="text-[9px]" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            onBlur={() => tagInput.trim() && commitTags(tagInput)}
                            className={inputClass}
                            placeholder="Add tags (comma-separated, press Enter)"
                        />
                    </div>

                    <div className={`pt-4 border-t ${isLight ? 'border-slate-100' : 'border-[#1a1a1a]'}`}>
                        {renderTypeFields()}
                    </div>

                    {submitError && (
                        <div className={`text-xs px-3 py-2 rounded-lg ${isLight ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-400'}`}>
                            {submitError}
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={`flex-1 ${btnSecondary}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 flex items-center justify-center gap-2 ${btnPrimary}`}
                        >
                            <FontAwesomeIcon icon={faSave} className="text-xs" />
                            {isLoading ? 'Saving...' : isEditMode ? 'Update Entry' : 'Create Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default VaultEntryForm
