import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faPlus, faXmark, faImage, faUpload, faSpinner, faLink } from '@fortawesome/free-solid-svg-icons'
import { put, del } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import { createPost, updatePost, getPost, clearActivePost } from '../../../actions/forum'
import { getCommunity, clearActive } from '../../../actions/community'
import RichTextEditor from '../../Forum/RichTextEditor'
import ForumTagPill from '../../Forum/ForumTagPill'

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

const ImageThumb = ({ url, isLight }) => {
    const t = (url || '').trim()
    const [failed, setFailed] = useState(false)
    useEffect(() => { setFailed(false) }, [t])
    if (!t) {
        return (
            <div className={`shrink-0 w-16 h-16 rounded-lg border flex items-center justify-center ${isLight ? 'bg-slate-50 border-slate-200 text-slate-300' : 'bg-[#111] border-[#2a2a2a] text-gray-600'}`}>
                <FontAwesomeIcon icon={faImage} className="text-sm opacity-70" />
            </div>
        )
    }
    if (failed) {
        return (
            <div className={`shrink-0 w-16 h-16 rounded-lg border flex items-center justify-center text-[10px] text-center leading-tight px-1.5 ${isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-900/20 border-amber-800/40 text-amber-300'}`}>
                No preview
            </div>
        )
    }
    return (
        <div className={`shrink-0 w-16 h-16 rounded-lg border overflow-hidden ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#111] border-[#2a2a2a]'}`}>
            <img src={t} alt="" className="w-full h-full object-cover" onError={() => setFailed(true)} />
        </div>
    )
}

const PostCreate = ({ user, theme }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { slug, id: editPostId } = useParams()
    const isEdit = Boolean(editPostId)
    const uid = user?.result?._id || user?._id

    const isLight = theme === 'light'
    const { activePost, isLoading: forumLoading } = useSelector(s => s.forum)
    const { active: community, isLoading: communityLoading } = useSelector(s => s.community)

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [tags, setTags] = useState([])
    const [tagDraft, setTagDraft] = useState('')
    const [images, setImages] = useState([''])
    const [uploading, setUploading] = useState({})
    const fileInputRefs = useRef({})
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState('')

    const isBusy = communityLoading || forumLoading
    const panelClass = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60 shadow-sm' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`
    const inputClass = `block w-full rounded-lg border py-2.5 px-3.5 text-sm outline-none transition-colors ${isLight ? 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50' : 'bg-[#111] border-[#333] text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900/30'}`
    const labelClass = `block text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'} mb-1.5`

    useEffect(() => {
        if (isEdit && editPostId) {
            dispatch(getPost(editPostId))
        } else if (slug) {
            dispatch(getCommunity(slug))
            dispatch(clearActivePost())
        }
        return () => {
            dispatch(clearActive())
            dispatch(clearActivePost())
        }
    }, [isEdit, editPostId, slug, dispatch])

    useEffect(() => {
        if (isEdit && activePost?._id === editPostId) {
            setTitle(activePost.title || '')
            setContent(activePost.content || '')
            setTags(Array.isArray(activePost.tags) ? [...activePost.tags] : [])
            setImages(activePost.images?.length ? [...activePost.images] : [''])
        }
    }, [isEdit, editPostId, activePost])

    const addTag = useCallback((raw) => {
        const t = (typeof raw === 'string' ? raw : tagDraft).split(',').map(s => s.trim()).filter(Boolean)
        if (t.length) {
            setTags(prev => {
                const next = [...prev]
                for (const x of t) {
                    if (x && !next.includes(x)) next.push(x)
                }
                return next
            })
        }
        setTagDraft('')
    }, [tagDraft])

    const onTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag()
        }
    }

    const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag))

    const setImageAt = (i, v) => setImages(prev => { const n = [...prev]; n[i] = v; return n })
    const addImageField = () => setImages(prev => [...prev, ''])
    const removeImageAt = (i) => setImages(prev => (prev.length > 1 ? prev.filter((_, j) => j !== i) : ['']))

    const handleFileUpload = async (i, file) => {
        if (!file || !file.type.startsWith('image/')) return
        setUploading(prev => ({ ...prev, [i]: true }))
        try {
            const url = await uploadToVercel(file)
            setImageAt(i, url)
        } catch {
            setFormError('Image upload failed. Try again or paste a URL instead.')
        } finally {
            setUploading(prev => ({ ...prev, [i]: false }))
        }
    }

    const handleFileDrop = (i, e) => {
        e.preventDefault()
        const file = e.dataTransfer?.files?.[0]
        if (file) handleFileUpload(i, file)
    }

    const triggerFileInput = (i) => {
        if (!fileInputRefs.current[i]) {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = (e) => {
                const file = e.target?.files?.[0]
                if (file) handleFileUpload(i, file)
            }
            fileInputRefs.current[i] = input
        }
        fileInputRefs.current[i].value = ''
        fileInputRefs.current[i].click()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')
        if (!title.trim()) { setFormError('Title is required.'); return }
        if (!content.trim()) { setFormError('Content is required.'); return }

        if (!isEdit) {
            if (!community?._id) { setFormError('Community not loaded.'); return }
        }

        setSubmitting(true)
        try {
            const imageList = images.map(s => s.trim()).filter(Boolean)
            if (isEdit) {
                const res = await dispatch(updatePost({
                    id: editPostId,
                    title: title.trim(),
                    content: content.trim(),
                    tags,
                    images: imageList
                })).unwrap()
                const r = res?.data?.result
                if (r?._id) navigate(`/forum/post/${r._id}`)
            } else {
                const res = await dispatch(createPost({
                    title: title.trim(),
                    content: content.trim(),
                    tags,
                    images: imageList,
                    communityId: community._id
                })).unwrap()
                const r = res?.data?.result
                if (r?._id) navigate(`/forum/post/${r._id}`)
                else if (slug) navigate(`/forum/c/${slug}`)
            }
        } catch (err) {
            const m = err?.alert?.message || err?.message || (typeof err === 'string' ? err : 'Something went wrong.')
            setFormError(String(m))
        } finally {
            setSubmitting(false)
        }
    }

    const backTarget = isEdit
        ? (activePost?._id ? `/forum/post/${activePost._id}` : '/forum')
        : (slug ? `/forum/c/${slug}` : '/forum')

    if (!uid) {
        return (
            <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Sign in to {isEdit ? 'edit' : 'create'} a post.</p>
                <Link to="/login" className={`mt-3 inline-block text-sm font-medium ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>Sign in</Link>
            </div>
        )
    }

    if (isEdit && isBusy && !activePost) {
        return (
            <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
                <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${isLight ? 'border-indigo-500' : 'border-indigo-400'}`} />
            </div>
        )
    }

    if (!isEdit && slug && !isBusy && !community) {
        return (
            <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Community not found.</p>
                <Link to="/forum" className={`mt-3 inline-block text-sm font-medium ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>Back to forum</Link>
            </div>
        )
    }

    return (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            <div className="mb-6">
                <Link
                    to={backTarget}
                    className={`inline-flex items-center gap-1.5 text-sm font-medium ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}`}
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                    Back
                </Link>
                <h1 className={`mt-3 text-2xl font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {isEdit ? 'Edit post' : 'Create a post'}
                </h1>
                {community && !isEdit && (
                    <p className={`mt-1 text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                        in {community.name}
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                    <div
                        role="alert"
                        className={`rounded-xl border px-4 py-3 text-sm ${isLight ? 'border-red-200 bg-red-50 text-red-800' : 'border-red-800/50 bg-red-950/30 text-red-200'}`}
                    >
                        {formError}
                    </div>
                )}

                <div className={`${panelClass} p-5 sm:p-6 space-y-6`}>
                    <div>
                        <label className={labelClass} htmlFor="post-title">Title</label>
                        <input
                            id="post-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="A clear, descriptive title"
                            className={inputClass}
                            maxLength={300}
                        />
                    </div>

                    <div>
                        <p className={labelClass}>Content</p>
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            theme={theme}
                            placeholder="Write your post (Markdown supported)"
                            minRows={10}
                        />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="post-tags">Tags</label>
                        <p className={`text-xs mb-2 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                            Press Enter or comma to add. Duplicates are skipped.
                        </p>
                        <div
                            className={`rounded-lg border p-2.5 min-h-[2.75rem] flex flex-wrap items-center gap-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111] border-[#2a2a2a]'}`}
                        >
                            {tags.map(t => (
                                <span
                                    key={t}
                                    className={`inline-flex items-center gap-0.5 pl-1.5 pr-0.5 py-0.5 rounded-full text-sm border ${
                                        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#141414] border-[#333] text-gray-200'
                                    }`}
                                >
                                    <ForumTagPill tag={t} theme={theme} onClick={() => {}} />
                                    <button
                                        type="button"
                                        onClick={() => removeTag(t)}
                                        className={`p-1 rounded-full ${isLight ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-700' : 'text-gray-500 hover:bg-[#2a2a2a] hover:text-gray-300'}`}
                                        aria-label={`Remove ${t}`}
                                    >
                                        <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                    </button>
                                </span>
                            ))}
                            <input
                                id="post-tags"
                                type="text"
                                value={tagDraft}
                                onChange={e => setTagDraft(e.target.value)}
                                onKeyDown={onTagKeyDown}
                                onBlur={() => {
                                    if (!tagDraft.trim()) return
                                    const parts = tagDraft.split(',').map(s => s.trim()).filter(Boolean)
                                    if (parts.length) {
                                        setTags(prev => {
                                            const next = [...prev]
                                            for (const x of parts) {
                                                if (x && !next.includes(x)) next.push(x)
                                            }
                                            return next
                                        })
                                    }
                                    setTagDraft('')
                                }}
                                placeholder={tags.length ? 'Add another…' : 'Type a tag, then Enter or comma…'}
                                className={`flex-1 min-w-[6rem] border-0 bg-transparent py-1.5 px-1 text-sm outline-none ${isLight ? 'text-slate-800 placeholder-slate-400' : 'text-gray-200 placeholder-gray-600'}`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Images</label>
                        <p className={`text-xs mb-3 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                            Upload a file or paste a direct image URL. The preview updates when the URL is valid.
                        </p>
                        <div className="space-y-3">
                            {images.map((u, i) => (
                                <div
                                    key={i}
                                    className={`flex flex-wrap sm:flex-nowrap items-start gap-3 p-3 rounded-lg border ${isLight ? 'border-slate-200 bg-slate-50/80' : 'border-[#2a2a2a] bg-[#141414]/50'}`}
                                >
                                    <ImageThumb url={u} isLight={isLight} />
                                    <div className="flex-1 min-w-0 space-y-2 w-full sm:w-auto">
                                        <div className="relative">
                                            <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                                <FontAwesomeIcon icon={faLink} className="text-[10px]" />
                                            </span>
                                            <input
                                                type="url"
                                                value={u}
                                                onChange={e => setImageAt(i, e.target.value)}
                                                placeholder="https://…"
                                                className={`${inputClass} pl-8`}
                                            />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => triggerFileInput(i)}
                                                disabled={uploading[i]}
                                                onDragOver={e => e.preventDefault()}
                                                onDrop={e => handleFileDrop(i, e)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${
                                                    uploading[i]
                                                        ? (isLight ? 'border-slate-200 text-slate-400 cursor-wait' : 'border-[#333] text-gray-500 cursor-wait')
                                                        : (isLight ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50' : 'border-[#333] text-gray-200 bg-[#111] hover:bg-[#1a1a1a]')
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={uploading[i] ? faSpinner : faUpload} className={`text-xs ${uploading[i] ? 'animate-spin' : ''}`} />
                                                {uploading[i] ? 'Uploading…' : 'Upload'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeImageAt(i)}
                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm border ${isLight ? 'border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600' : 'border-[#333] text-gray-500 hover:bg-red-950/30 hover:text-red-400'}`}
                                                aria-label="Remove image row"
                                            >
                                                <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addImageField}
                                className={`inline-flex items-center gap-1.5 text-sm font-medium ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}`}
                            >
                                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                Add image
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`${panelClass} p-4 sm:px-6 sm:py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3`}>
                    <Link
                        to={backTarget}
                        className={`text-center px-4 py-2.5 text-sm font-medium rounded-lg border ${
                            isLight ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50' : 'border-[#333] text-gray-300 hover:bg-[#222]'
                        }`}
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting || isBusy}
                        className={`px-5 py-2.5 text-sm font-semibold rounded-lg min-h-[2.5rem] ${
                            submitting || isBusy
                                ? (isLight ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-[#333] text-gray-600 cursor-not-allowed')
                                : (isLight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500')
                        }`}
                    >
                        {submitting ? 'Saving…' : (isEdit ? 'Save changes' : 'Create post')}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default PostCreate
