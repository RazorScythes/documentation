import React, { useEffect, useId, useMemo, useState } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faPlus, faTrash, faLock, faSpinner, faImage, faTags, faXmark, faCircleExclamation, faLink, faUpload, faCopy, faRotate, faCheck } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from 'uuid'
import { put, del } from '@vercel/blob'
import { createCommunity, updateCommunity, getCommunity, clearActive, regenerateInviteCode } from '../../../actions/community'

const fileNameGen = (name) => {
    const ext = name.substring(name.lastIndexOf('.'))
    return `${uuidv4()}${ext}`
}

const uploadToVercel = async (file) => {
    const blob = await put(fileNameGen(file.name), file, {
        access: 'public',
        token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
    })
    return blob.url
}

const emptyRule = () => ({ localId: uuidv4(), title: '', description: '' })

const CommunityCreate = ({ user, theme }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { slug: slugParam } = useParams()
    const isEdit = Boolean(slugParam) && /\/c\/[^/]+\/edit\/?$/.test(location.pathname)
    const isLight = theme === 'light'
    const privateFieldId = useId()

    const { active: community, isLoading } = useSelector(s => s.community)
    const userId = user?.result?._id || user?._id

    const [form, setForm] = useState({
        name: '',
        description: '',
        icon: '',
        banner: '',
        isPrivate: false,
        rules: [],
        tags: '',
    })
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [loadReady, setLoadReady] = useState(!isEdit)

    const [iconLoadErr, setIconLoadErr] = useState(false)
    const [bannerLoadErr, setBannerLoadErr] = useState(false)
    const [iconUploading, setIconUploading] = useState(false)
    const [bannerUploading, setBannerUploading] = useState(false)
    const [codeCopied, setCodeCopied] = useState(false)
    const [codeRegenerating, setCodeRegenerating] = useState(false)

    const handleIconUpload = async (file) => {
        if (!file || !file.type.startsWith('image/')) return
        setIconUploading(true)
        try {
            const url = await uploadToVercel(file)
            setForm(p => ({ ...p, icon: url }))
        } catch { /* handled silently */ }
        finally { setIconUploading(false) }
    }

    const handleBannerUpload = async (file) => {
        if (!file || !file.type.startsWith('image/')) return
        setBannerUploading(true)
        try {
            const url = await uploadToVercel(file)
            setForm(p => ({ ...p, banner: url }))
        } catch { /* handled silently */ }
        finally { setBannerUploading(false) }
    }

    const triggerUpload = (accept, handler) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = accept
        input.onchange = (e) => {
            const file = e.target?.files?.[0]
            if (file) handler(file)
        }
        input.click()
    }

    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`
    const inputClass = `block w-full rounded-lg border py-2.5 px-3.5 text-sm outline-none transition-colors ${isLight ? 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50' : 'bg-[#111] border-[#333] text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900/30'}`
    const dividerClass = isLight ? 'border-slate-200' : 'border-[#2a2a2a]'

    const inputErrorRing = (field) => (errors[field] ? (isLight ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-red-500/60 focus:border-red-400 focus:ring-red-900/20') : '')

    const labelClass = `block text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'} mb-1.5`

    const tagChips = useMemo(() => form.tags.split(',').map(t => t.trim()).filter(Boolean), [form.tags])

    useEffect(() => {
        if (!isEdit || !slugParam) {
            setLoadReady(true)
            return
        }
        setLoadReady(false)
        dispatch(clearActive())
        dispatch(getCommunity(slugParam))
    }, [isEdit, slugParam, dispatch])

    useEffect(() => {
        if (!isEdit || !community?._id || community.slug !== slugParam) return
        setForm({
            name: community.name || '',
            description: community.description || '',
            icon: community.icon || '',
            banner: community.banner || '',
            isPrivate: Boolean(community.isPrivate),
            rules: (community.rules?.length ? community.rules : []).map(r => ({
                localId: uuidv4(),
                title: r?.title || '',
                description: r?.description || '',
            })),
            tags: (community.tags || []).join(', '),
        })
        setLoadReady(true)
    }, [isEdit, community, slugParam])

    useEffect(() => () => { dispatch(clearActive()) }, [dispatch])

    useEffect(() => {
        setIconLoadErr(false)
    }, [form.icon])
    useEffect(() => {
        setBannerLoadErr(false)
    }, [form.banner])

    const addRule = () => setForm(p => ({ ...p, rules: [...p.rules, emptyRule()] }))

    const removeRule = (index) => {
        setForm(p => ({ ...p, rules: p.rules.filter((_, i) => i !== index) }))
    }

    const updateRule = (index, field, value) => setForm(p => ({
        ...p,
        rules: p.rules.map((r, i) => i === index ? { ...r, [field]: value } : r),
    }))

    const removeTagAtIndex = (chipIndex) => {
        const parts = form.tags.split(',')
        let n = 0
        for (let i = 0; i < parts.length; i += 1) {
            if (parts[i].trim()) {
                if (n === chipIndex) {
                    const rest = parts.filter((_, j) => j !== i)
                    const normalized = rest.map(s => s.trim()).filter(Boolean).join(', ')
                    setForm(p => ({ ...p, tags: normalized }))
                    return
                }
                n += 1
            }
        }
    }

    const validate = () => {
        const e = {}
        if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const buildPayload = () => {
        const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
        const rules = form.rules
            .filter(r => (r.title || '').trim().length > 0)
            .map(r => ({ title: r.title.trim(), description: (r.description || '').trim() }))
        return {
            name: form.name.trim(),
            description: (form.description || '').trim(),
            icon: (form.icon || '').trim() || undefined,
            banner: (form.banner || '').trim() || undefined,
            isPrivate: form.isPrivate,
            rules,
            tags,
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!userId || !validate() || saving) return
        setSaving(true)
        const payload = buildPayload()
        try {
            if (isEdit) {
                const res = await dispatch(updateCommunity({ id: community._id, ...payload })).unwrap()
                const next = res.data?.result
                if (next?.slug) navigate(`/forum/c/${next.slug}`)
            } else {
                const res = await dispatch(createCommunity(payload)).unwrap()
                const next = res.data?.result
                if (next?.slug) navigate(`/forum/c/${next.slug}`)
            }
        } catch {
            // alert handled in Redux + optional toast elsewhere
        } finally {
            setSaving(false)
        }
    }

    if (isEdit && community?._id && community.slug && community.slug !== slugParam) {
        return (
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
                <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${isLight ? 'border-indigo-500' : 'border-indigo-400'}`} />
            </div>
        )
    }

    if (isEdit && !isLoading && !community?._id) {
        return (
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10">
                <Link to="/forum/communities" className={`text-sm font-medium ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>← Back to communities</Link>
                <div className={`${panelClass} text-center py-10 mt-4 px-4`}>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Community not found or you do not have access.</p>
                </div>
            </div>
        )
    }

    if (isEdit && (isLoading || !loadReady)) {
        return (
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
                <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${isLight ? 'border-indigo-500' : 'border-indigo-400'}`} />
            </div>
        )
    }

    if (!userId) {
        return (
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10">
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Sign in to {isEdit ? 'edit' : 'create'} a community.</p>
            </div>
        )
    }

    const hasFormErrors = Object.keys(errors).length > 0
    const errorEntries = Object.entries(errors)

    return (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-12">
            <div className="mb-6">
                <Link
                    to={isEdit ? `/forum/c/${community?.slug || slugParam}` : '/forum/communities'}
                    className={`inline-flex items-center gap-1.5 text-sm font-medium ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}`}
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                    {isEdit ? 'Back to community' : 'All communities'}
                </Link>
                <h1 className={`mt-3 text-2xl font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {isEdit ? 'Edit community' : 'Create community'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {hasFormErrors && (
                    <div
                        className={`${panelClass} px-4 py-3.5 border-l-4 border-l-red-500`}
                        role="alert"
                    >
                        <div className="flex gap-3">
                            <div className={`mt-0.5 shrink-0 ${isLight ? 'text-red-600' : 'text-red-300'}`}>
                                <FontAwesomeIcon icon={faCircleExclamation} className="h-4 w-4" />
                            </div>
                            <ul className="min-w-0 space-y-1 text-sm list-none p-0 m-0">
                                {errorEntries.map(([k, msg]) => (
                                    <li key={k} className={isLight ? 'text-red-800' : 'text-red-200'}>
                                        {msg}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <section className={`${panelClass} p-5 sm:p-6`}>
                    <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-gray-100'} mb-4`}>Name and description</h2>
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass} htmlFor="comm-name">Name</label>
                            <input
                                id="comm-name"
                                type="text"
                                value={form.name}
                                onChange={e => { setForm(p => ({ ...p, name: e.target.value })); if (errors.name) setErrors(e2 => { const c = { ...e2 }; delete c.name; return c }) }}
                                placeholder="e.g. Digital painters, Local runners club"
                                className={`${inputClass} ${inputErrorRing('name')}`}
                                maxLength={80}
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <label className={labelClass} htmlFor="comm-desc">Description</label>
                            <textarea
                                id="comm-desc"
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="What is this community about?"
                                rows={4}
                                className={`${inputClass} resize-y min-h-[6rem]`}
                            />
                        </div>
                    </div>
                </section>

                <section className={`${panelClass} p-5 sm:p-6`}>
                    <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-gray-100'} mb-1`}>Icon</h2>
                    <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                        Square image. Upload a file or paste a URL.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="relative">
                                <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                    <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
                                </span>
                                <input
                                    id="comm-icon"
                                    type="url"
                                    value={form.icon}
                                    onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                                    placeholder="https://…"
                                    className={`${inputClass} pl-9`}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => triggerUpload('image/*', handleIconUpload)}
                                disabled={iconUploading}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${
                                    iconUploading
                                        ? (isLight ? 'border-slate-200 text-slate-400 cursor-wait' : 'border-[#333] text-gray-500 cursor-wait')
                                        : (isLight ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50' : 'border-[#333] text-gray-200 bg-[#111] hover:bg-[#1a1a1a]')
                                }`}
                            >
                                <FontAwesomeIcon icon={iconUploading ? faSpinner : faUpload} className={`text-xs ${iconUploading ? 'animate-spin' : ''}`} />
                                {iconUploading ? 'Uploading…' : 'Upload'}
                            </button>
                        </div>
                        <div
                            className={`w-full sm:w-28 shrink-0 aspect-square overflow-hidden rounded-lg border ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2a2a2a] bg-[#111]'}`}
                        >
                            {form.icon && !iconLoadErr ? (
                                <img
                                    src={form.icon}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    onError={() => setIconLoadErr(true)}
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center">
                                    <FontAwesomeIcon icon={faImage} className={`h-5 w-5 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                        {form.icon && iconLoadErr ? 'Preview failed' : 'Preview'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className={`${panelClass} p-5 sm:p-6`}>
                    <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-gray-100'} mb-1`}>Banner</h2>
                    <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                        Wide image. Upload a file or paste a URL.
                    </p>
                    <div className="space-y-2">
                        <div className="relative">
                            <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
                            </span>
                            <input
                                id="comm-banner"
                                type="url"
                                value={form.banner}
                                onChange={e => setForm(p => ({ ...p, banner: e.target.value }))}
                                placeholder="https://…"
                                className={`${inputClass} pl-9`}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => triggerUpload('image/*', handleBannerUpload)}
                            disabled={bannerUploading}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${
                                bannerUploading
                                    ? (isLight ? 'border-slate-200 text-slate-400 cursor-wait' : 'border-[#333] text-gray-500 cursor-wait')
                                    : (isLight ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50' : 'border-[#333] text-gray-200 bg-[#111] hover:bg-[#1a1a1a]')
                            }`}
                        >
                            <FontAwesomeIcon icon={bannerUploading ? faSpinner : faUpload} className={`text-xs ${bannerUploading ? 'animate-spin' : ''}`} />
                            {bannerUploading ? 'Uploading…' : 'Upload'}
                        </button>
                        <div
                            className={`mt-2 overflow-hidden rounded-lg border ${isLight ? 'border-slate-200' : 'border-[#2a2a2a]'} ${
                                form.banner && !bannerLoadErr ? 'aspect-[2.4/1] sm:aspect-[2.8/1]' : 'h-28 sm:h-32'
                            }`}
                        >
                            {form.banner && !bannerLoadErr ? (
                                <img
                                    src={form.banner}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    onError={() => setBannerLoadErr(true)}
                                />
                            ) : (
                                <div className={`flex h-full w-full items-center justify-center gap-2 ${isLight ? 'bg-slate-50' : 'bg-[#111]'}`}>
                                    <FontAwesomeIcon icon={faImage} className={`h-5 w-5 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                    <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                        {form.banner && bannerLoadErr ? 'Image failed to load' : 'Banner preview'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className={`${panelClass} p-5 sm:p-6`}>
                    <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-gray-100'} mb-4`}>Privacy</h2>
                    <div
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2a2a2a] bg-[#111]'}`}
                    >
                        <div className="flex items-start gap-3 min-w-0">
                            <div className={`mt-0.5 shrink-0 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                                <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
                            </div>
                            <div>
                                <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-100'}`} id={`${privateFieldId}-label`}>
                                    Private community
                                </p>
                                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-500'}`} id={`${privateFieldId}-desc`}>
                                    When enabled, your forum&apos;s private-community policy applies.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:pl-2 shrink-0">
                            <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                {form.isPrivate ? 'Private' : 'Public'}
                            </span>
                            <label className="relative inline-flex h-8 w-14 cursor-pointer items-center" htmlFor={privateFieldId}>
                                <input
                                    id={privateFieldId}
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={form.isPrivate}
                                    onChange={() => setForm(p => ({ ...p, isPrivate: !p.isPrivate }))}
                                    aria-describedby={`${privateFieldId}-desc`}
                                    aria-labelledby={`${privateFieldId}-label`}
                                />
                                <span
                                    className={`absolute inset-0 rounded-full transition-colors after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-200 after:content-[''] ${
                                        isLight
                                            ? 'bg-slate-300 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white peer-checked:bg-indigo-600 peer-checked:after:translate-x-6'
                                            : 'bg-[#3a3a3a] peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#1a1a1a] peer-checked:bg-indigo-600 peer-checked:after:translate-x-6'
                                    }`}
                                />
                            </label>
                        </div>
                    </div>
                </section>

                {form.isPrivate && community?._inviteCode && (
                    <section className={`${panelClass} p-5 sm:p-6`}>
                        <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-gray-100'} mb-1`}>Invitation Code</h2>
                        <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                            Share this code with people you want to invite. Regenerating will invalidate the old code.
                        </p>
                        <div className={`flex items-center gap-2 rounded-lg border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2a2a2a] bg-[#111]'}`}>
                            <code className={`flex-1 text-sm font-mono font-semibold tracking-widest select-all ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                                {community._inviteCode}
                            </code>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(community._inviteCode)
                                    setCodeCopied(true)
                                    setTimeout(() => setCodeCopied(false), 2000)
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border ${isLight ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100' : 'border-[#333] text-gray-200 bg-[#1a1a1a] hover:bg-[#222]'}`}
                            >
                                <FontAwesomeIcon icon={codeCopied ? faCheck : faCopy} className="h-3 w-3" />
                                {codeCopied ? 'Copied' : 'Copy'}
                            </button>
                            <button
                                type="button"
                                disabled={codeRegenerating}
                                onClick={async () => {
                                    setCodeRegenerating(true)
                                    await dispatch(regenerateInviteCode(community._id))
                                    await dispatch(getCommunity(slugParam))
                                    setCodeRegenerating(false)
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border ${codeRegenerating ? 'opacity-50 cursor-not-allowed' : ''} ${isLight ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' : 'border-amber-900/50 text-amber-300 bg-amber-950/20 hover:bg-amber-950/40'}`}
                            >
                                <FontAwesomeIcon icon={codeRegenerating ? faSpinner : faRotate} className={`h-3 w-3 ${codeRegenerating ? 'animate-spin' : ''}`} />
                                {codeRegenerating ? 'Generating...' : 'Regenerate'}
                            </button>
                        </div>
                        <div className={`mt-3 flex flex-col sm:flex-row sm:items-center gap-2 text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                            <span className="shrink-0">Invite link:</span>
                            <div className="flex items-center gap-2 min-w-0">
                                <code className={`px-2 py-0.5 rounded border text-xs select-all truncate ${isLight ? 'border-slate-200 bg-white text-slate-700' : 'border-[#333] bg-[#1a1a1a] text-zinc-300'}`}>
                                    {window.location.origin}/forum/invite/{community._inviteCode}
                                </code>
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/forum/invite/${community._inviteCode}`)
                                        setCodeCopied(true)
                                        setTimeout(() => setCodeCopied(false), 2000)
                                    }}
                                    className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${isLight ? 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50' : 'border-[#333] text-gray-400 bg-[#1a1a1a] hover:bg-[#222]'}`}
                                >
                                    <FontAwesomeIcon icon={codeCopied ? faCheck : faCopy} className="h-2.5 w-2.5" />
                                    {codeCopied ? 'Copied' : 'Copy link'}
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {form.isPrivate && !community?._inviteCode && (
                    <section className={`${panelClass} p-5 sm:p-6`}>
                        <div className={`flex items-start gap-3 rounded-lg border p-3 ${isLight ? 'border-indigo-200 bg-indigo-50' : 'border-indigo-500/30 bg-indigo-950/20'}`}>
                            <FontAwesomeIcon icon={faLock} className={`h-4 w-4 mt-0.5 shrink-0 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                            <div>
                                <p className={`text-sm font-medium ${isLight ? 'text-indigo-800' : 'text-indigo-200'}`}>
                                    An invitation code will be generated automatically
                                </p>
                                <p className={`text-xs mt-0.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                                    {isEdit
                                        ? 'Save changes to generate the invite code, then you can copy and share it.'
                                        : 'You can share the code or a direct invite link after creating the community.'
                                    }
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                <section className={`${panelClass} p-5 sm:p-6`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-gray-100'}`}>Rules</h2>
                        <button
                            type="button"
                            onClick={addRule}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border ${
                                isLight ? 'border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100' : 'border-indigo-500/40 text-indigo-200 bg-indigo-950/40 hover:bg-indigo-900/40'
                            }`}
                        >
                            <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                            Add rule
                        </button>
                    </div>
                    <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                        Rules with an empty title are not saved.
                    </p>
                    {form.rules.length === 0 && (
                        <p className={`text-sm py-4 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                            No rules yet. Add one if you like.
                        </p>
                    )}
                    <ul className="list-none space-y-3 p-0 m-0">
                        {form.rules.map((rule, i) => (
                            <li key={rule.localId} className={`rounded-lg border p-3 ${isLight ? 'border-slate-200 bg-white' : 'border-[#2a2a2a] bg-[#111]'}`}>
                                <div className={`flex items-center justify-between gap-2 mb-2 pb-2 border-b ${dividerClass}`}>
                                    <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                                        Rule {i + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeRule(i)}
                                        className={`p-1.5 rounded ${isLight ? 'text-slate-400 hover:bg-red-50 hover:text-red-600' : 'text-gray-500 hover:bg-red-950/40 hover:text-red-400'}`}
                                        aria-label="Remove rule"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={rule.title}
                                        onChange={e => updateRule(i, 'title', e.target.value)}
                                        placeholder="Rule title (required to keep)"
                                        className={inputClass}
                                    />
                                    <textarea
                                        value={rule.description}
                                        onChange={e => updateRule(i, 'description', e.target.value)}
                                        placeholder="Details (optional)"
                                        rows={2}
                                        className={`${inputClass} resize-y min-h-[3.5rem]`}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className={`${panelClass} p-5 sm:p-6`}>
                    <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-gray-100'} mb-1`}>Tags</h2>
                    <p className={`text-xs mb-3 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                        Comma-separated. Remove a tag with the × on the chip.
                    </p>
                    <label className={labelClass} htmlFor="comm-tags">Search tags</label>
                    <div
                        className={`rounded-lg border p-1.5 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2a2a2a] bg-[#111]'}`}
                    >
                        {tagChips.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-1.5 pb-0">
                                {tagChips.map((tag, i) => (
                                    <span
                                        key={`${i}-${tag}`}
                                        className={`inline-flex max-w-full items-center gap-1 rounded-full border py-0.5 pl-2.5 pr-0.5 text-sm ${
                                            isLight ? 'border-slate-200 bg-white text-slate-800' : 'border-[#333] bg-[#1a1a1a] text-gray-200'
                                        }`}
                                    >
                                        <span className="truncate">{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeTagAtIndex(i)}
                                            className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#2a2a2a]'}`}
                                            aria-label={`Remove tag ${tag}`}
                                        >
                                            <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-2 p-1.5 pt-1">
                            <span className={`shrink-0 pl-0.5 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                <FontAwesomeIcon icon={faTags} className="h-3.5 w-3.5" />
                            </span>
                            <input
                                id="comm-tags"
                                type="text"
                                value={form.tags}
                                onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                                placeholder="e.g. design, feedback, resources"
                                className={`min-w-0 flex-1 border-0 bg-transparent py-1.5 pr-1 text-sm outline-none ${isLight ? 'text-slate-800 placeholder-slate-400' : 'text-gray-200 placeholder-gray-600'}`}
                            />
                        </div>
                    </div>
                </section>

                <div>
                    <button
                        type="submit"
                        disabled={saving}
                        className={`w-full sm:w-auto sm:min-w-[12rem] px-5 py-2.5 text-sm font-semibold rounded-lg ${
                            saving
                                ? (isLight ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-[#333] text-gray-600 cursor-not-allowed')
                                : (isLight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500')
                        }`}
                    >
                        {saving ? (
                            <span className="inline-flex items-center justify-center gap-2">
                                <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                                Saving…
                            </span>
                        ) : (
                            (isEdit ? 'Save changes' : 'Create community')
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CommunityCreate
