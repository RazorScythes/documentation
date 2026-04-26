import React, { useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faEye, faBold, faItalic, faCode, faLink, faList, faImage, faHeading, faQuoteLeft, faUpload, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

const RichTextEditor = ({ value, onChange, theme, placeholder = 'Write something...', minRows = 6 }) => {
    const isLight = theme === 'light'
    const [preview, setPreview] = useState(false)
    const [imageUploading, setImageUploading] = useState(false)
    const [showImageMenu, setShowImageMenu] = useState(false)
    const imageMenuRef = useRef(null)

    const insert = (prefix, suffix = '') => {
        const textarea = document.getElementById('rte-textarea')
        if (!textarea) return
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selected = value.substring(start, end) || 'text'
        const newVal = value.substring(0, start) + prefix + selected + suffix + value.substring(end)
        onChange(newVal)
    }

    const handleImageUpload = async (file) => {
        if (!file || !file.type.startsWith('image/')) return
        setImageUploading(true)
        try {
            const ext = file.name.substring(file.name.lastIndexOf('.'))
            const blob = await put(`${uuidv4()}${ext}`, file, {
                access: 'public',
                token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
            })
            const markdown = `\n![${file.name}](${blob.url})\n`
            const textarea = document.getElementById('rte-textarea')
            if (textarea) {
                const pos = textarea.selectionEnd || value.length
                onChange(value.substring(0, pos) + markdown + value.substring(pos))
            } else {
                onChange(value + markdown)
            }
        } catch { /* upload failed silently */ }
        finally {
            setImageUploading(false)
            setShowImageMenu(false)
        }
    }

    const triggerImageFileUpload = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
            const file = e.target?.files?.[0]
            if (file) handleImageUpload(file)
        }
        input.click()
    }

    const tools = [
        { icon: faHeading, action: () => insert('### '), title: 'Heading' },
        { icon: faBold, action: () => insert('**', '**'), title: 'Bold' },
        { icon: faItalic, action: () => insert('*', '*'), title: 'Italic' },
        { icon: faCode, action: () => insert('`', '`'), title: 'Code' },
        { icon: faQuoteLeft, action: () => insert('> '), title: 'Quote' },
        { icon: faList, action: () => insert('- '), title: 'List' },
        { icon: faLink, action: () => insert('[', '](url)'), title: 'Link' },
        { icon: faImage, action: () => setShowImageMenu(prev => !prev), title: 'Image', hasMenu: true },
    ]

    const toolSeparatorBefore = new Set([1, 4, 6])

    const previewMinHeight = `calc(${minRows} * 1.6rem + 2.5rem)`

    const rootBorder = isLight ? 'border-slate-200' : 'border-[#333]'

    return (
        <div className={`overflow-hidden rounded-xl border ${rootBorder} ${isLight ? 'bg-white' : 'bg-[#1a1a1a]'}`}>
            <div
                className={`flex flex-wrap items-center justify-between gap-2 border-b px-2 py-1.5 sm:px-3
                    ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#333] bg-[#222]'}`}
            >
                <div className="flex min-w-0 flex-wrap items-center gap-0.5">
                    {tools.map((t, i) => (
                        <div key={i} className="relative flex items-center">
                            {toolSeparatorBefore.has(i) && (
                                <span
                                    className={`mx-1 h-5 w-px shrink-0 ${isLight ? 'bg-slate-200' : 'bg-zinc-600'}`}
                                    aria-hidden
                                />
                            )}
                            <button
                                type="button"
                                onClick={t.action}
                                title={t.title}
                                className={
                                    t.hasMenu && showImageMenu
                                        ? (isLight ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-indigo-600 bg-indigo-50' : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-indigo-300 bg-[#2a2a2a]')
                                        : (isLight
                                            ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200/80 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50'
                                            : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-[#333] hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40')
                                }
                            >
                                <FontAwesomeIcon icon={imageUploading && t.hasMenu ? faSpinner : t.icon} className={`h-3.5 w-3.5 ${imageUploading && t.hasMenu ? 'animate-spin' : ''}`} />
                            </button>
                            {t.hasMenu && showImageMenu && (
                                <div
                                    ref={imageMenuRef}
                                    className={`absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border p-1
                                        ${isLight ? 'border-slate-200 bg-white' : 'border-[#333] bg-[#222]'}`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => { insert('![alt](', ')'); setShowImageMenu(false) }}
                                        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium
                                            ${isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-zinc-200 hover:bg-[#333]'}`}
                                    >
                                        <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
                                        Paste image URL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={triggerImageFileUpload}
                                        disabled={imageUploading}
                                        className={
                                            imageUploading
                                                ? (isLight ? 'flex w-full cursor-wait items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-slate-400' : 'flex w-full cursor-wait items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-zinc-500')
                                                : (isLight
                                                    ? 'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                                                    : 'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-zinc-200 hover:bg-indigo-500/10 hover:text-indigo-300')
                                        }
                                    >
                                        <FontAwesomeIcon icon={imageUploading ? faSpinner : faUpload} className={`h-3 w-3 ${imageUploading ? 'animate-spin' : ''}`} />
                                        {imageUploading ? 'Uploading...' : 'Upload image file'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div
                    className={`inline-flex shrink-0 rounded-md border p-0.5
                        ${isLight ? 'border-slate-200 bg-white' : 'border-[#333] bg-[#1a1a1a]'}`}
                    role="group"
                    aria-label="Editor mode"
                >
                    <button
                        type="button"
                        onClick={() => setPreview(false)}
                        aria-pressed={!preview}
                        className={
                            !preview
                                ? (isLight
                                    ? 'inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-slate-100'
                                    : 'inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-indigo-300 bg-[#2a2a2a]')
                                : (isLight
                                    ? 'inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800'
                                    : 'inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300')
                        }
                    >
                        <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setPreview(true)}
                        aria-pressed={preview}
                        className={
                            preview
                                ? (isLight
                                    ? 'inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-slate-100'
                                    : 'inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-indigo-300 bg-[#2a2a2a]')
                                : (isLight
                                    ? 'inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800'
                                    : 'inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300')
                        }
                    >
                        <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                        Preview
                    </button>
                </div>
            </div>

            {preview ? (
                <div
                    className={`px-4 py-4 sm:px-5 sm:py-5 ${isLight ? 'bg-white' : 'bg-[#1a1a1a]'}`}
                    style={{ minHeight: previewMinHeight }}
                >
                    <div
                        className={`prose prose-sm max-w-none
                            prose-p:leading-relaxed prose-p:mb-3 last:prose-p:mb-0
                            prose-headings:scroll-mt-4 prose-headings:font-semibold
                            prose-pre:rounded-lg prose-code:before:content-none prose-code:after:content-none
                            ${isLight
                                ? `prose-slate
                                    prose-headings:text-slate-800 prose-p:text-slate-700
                                    prose-a:text-indigo-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                                    prose-strong:text-slate-800 prose-blockquote:border-indigo-200 prose-blockquote:text-slate-600
                                    prose-code:rounded-md prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-indigo-900
                                    prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200
                                    prose-li:marker:text-indigo-500`
                                : `prose-invert
                                    prose-headings:text-zinc-100 prose-p:text-zinc-300
                                    prose-a:text-indigo-400 prose-a:font-medium
                                    prose-blockquote:border-indigo-500/40 prose-blockquote:text-zinc-400
                                    prose-code:rounded-md prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-indigo-200
                                    prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-700
                                    prose-li:marker:text-indigo-400`
                            }`}
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {value || '*Nothing to preview*'}
                        </ReactMarkdown>
                    </div>
                </div>
            ) : (
                <TextareaAutosize
                    id="rte-textarea"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    minRows={minRows}
                    placeholder={placeholder}
                    className={
                        `w-full resize-none border-0 px-4 py-3.5 text-sm leading-relaxed shadow-none ring-0 outline-none focus:ring-0 focus:outline-none sm:px-5 sm:py-4
                        ${isLight
                            ? 'bg-white text-slate-800 placeholder:text-slate-400'
                            : 'bg-[#1a1a1a] text-zinc-200 placeholder:text-zinc-500'
                        }`
                    }
                />
            )}
        </div>
    )
}

export default RichTextEditor
