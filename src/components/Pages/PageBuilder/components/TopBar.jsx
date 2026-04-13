import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { undo, redo, savePage, updatePageMeta, setViewport } from '../../../../actions/pageBuilder'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft, faUndo, faRedo, faSave, faExternalLinkAlt,
    faDesktop, faTabletAlt, faMobileAlt, faCheck, faSpinner, faCloud
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'

const TopBar = ({ isLight }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const currentPage = useSelector(s => s.pageBuilder.currentPage)
    const historyIndex = useSelector(s => s.pageBuilder.historyIndex)
    const historyLength = useSelector(s => s.pageBuilder.history.length)
    const viewport = useSelector(s => s.pageBuilder.viewport)
    const isDirty = useSelector(s => s.pageBuilder.isDirty)
    const [saving, setSaving] = useState(false)
    const [editingTitle, setEditingTitle] = useState(false)
    const [titleValue, setTitleValue] = useState('')

    const canUndo = historyIndex > 0
    const canRedo = historyIndex < historyLength - 1

    const handleSave = async () => {
        if (!currentPage || saving) return
        setSaving(true)
        await dispatch(savePage({
            id: currentPage._id,
            title: currentPage.title,
            slug: currentPage.slug,
            description: currentPage.description,
            status: currentPage.status,
            layout: currentPage.layout,
            globalStyles: currentPage.globalStyles,
        }))
        setSaving(false)
    }

    const handleTitleSubmit = () => {
        if (titleValue.trim() && titleValue !== currentPage?.title) {
            dispatch(updatePageMeta({ title: titleValue.trim() }))
        }
        setEditingTitle(false)
    }

    const handlePublishToggle = () => {
        const newStatus = currentPage?.status === 'published' ? 'draft' : 'published'
        dispatch(updatePageMeta({ status: newStatus }))
    }

    const btnCls = `flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
        isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#2a2a2a] text-gray-400'
    }`

    const viewportBtns = [
        { key: 'desktop', icon: faDesktop },
        { key: 'tablet', icon: faTabletAlt },
        { key: 'mobile', icon: faMobileAlt },
    ]

    return (
        <div className={`h-12 flex items-center justify-between px-3 border-b border-solid flex-shrink-0 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#2B2B2B]'
        }`}>
            {/* Left: back + title */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <button onClick={() => navigate('/pages')} className={btnCls} title="Back to pages">
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                </button>
                <div className={`h-5 w-px flex-shrink-0 ${isLight ? 'bg-slate-200' : 'bg-[#333]'}`} />
                {editingTitle ? (
                    <input
                        type="text"
                        value={titleValue}
                        onChange={e => setTitleValue(e.target.value)}
                        onBlur={handleTitleSubmit}
                        onKeyDown={e => e.key === 'Enter' && handleTitleSubmit()}
                        autoFocus
                        className={`text-sm font-semibold bg-transparent border-b-2 border-blue-500 outline-none px-1 min-w-0 ${
                            isLight ? 'text-slate-800' : 'text-white'
                        }`}
                    />
                ) : (
                    <button
                        onClick={() => { setTitleValue(currentPage?.title || ''); setEditingTitle(true) }}
                        className={`text-sm font-semibold truncate max-w-[200px] hover:opacity-70 transition-opacity ${
                            isLight ? 'text-slate-800' : 'text-white'
                        }`}
                        title="Click to rename"
                    >
                        {currentPage?.title || 'Untitled'}
                    </button>
                )}
                {isDirty && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/20 text-amber-400'
                    }`}>unsaved</span>
                )}
            </div>

            {/* Center: viewport */}
            <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded-lg ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                {viewportBtns.map(v => (
                    <button
                        key={v.key}
                        onClick={() => dispatch(setViewport(v.key))}
                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                            viewport === v.key
                                ? (isLight ? 'bg-white text-blue-600 shadow-sm' : 'bg-[#2a2a2a] text-blue-400')
                                : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-gray-500 hover:text-gray-300')
                        }`}
                        title={v.key}
                    >
                        <FontAwesomeIcon icon={v.icon} className="text-[11px]" />
                    </button>
                ))}
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => dispatch(undo())} disabled={!canUndo} className={`${btnCls} ${!canUndo ? 'opacity-30' : ''}`} title="Undo (Ctrl+Z)">
                    <FontAwesomeIcon icon={faUndo} className="text-[11px]" />
                </button>
                <button onClick={() => dispatch(redo())} disabled={!canRedo} className={`${btnCls} ${!canRedo ? 'opacity-30' : ''}`} title="Redo (Ctrl+Shift+Z)">
                    <FontAwesomeIcon icon={faRedo} className="text-[11px]" />
                </button>

                <div className={`h-5 w-px mx-1 ${isLight ? 'bg-slate-200' : 'bg-[#333]'}`} />

                <button
                    onClick={handlePublishToggle}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        currentPage?.status === 'published'
                            ? (isLight ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30')
                            : (isLight ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-[#1f1f1f] text-gray-400 hover:bg-[#2a2a2a]')
                    }`}
                >
                    <FontAwesomeIcon icon={currentPage?.status === 'published' ? faCheck : faCloud} className="text-[9px]" />
                    {currentPage?.status === 'published' ? 'Published' : 'Draft'}
                </button>

                {currentPage?.status === 'published' && currentPage?.slug && (
                    <a
                        href={`/page/${currentPage.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={btnCls}
                        title="View page"
                    >
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                    </a>
                )}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        isLight ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } ${saving ? 'opacity-70' : ''}`}
                >
                    <FontAwesomeIcon icon={saving ? faSpinner : faSave} className={`text-[10px] ${saving ? 'animate-spin' : ''}`} />
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    )
}

export default TopBar
