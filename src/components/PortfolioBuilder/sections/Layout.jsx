import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faFileAlt, faAlignCenter, faGripHorizontal } from '@fortawesome/free-solid-svg-icons'
import { updateLayout } from '../../../actions/portfolio'

const LAYOUTS = [
    {
        id: 'default',
        name: 'Modern',
        description: 'Split hero layout with skill rings, editorial services, and a project carousel.',
        icon: faGripHorizontal,
    },
    {
        id: 'classic',
        name: 'Classic CV',
        description: 'Professional CV/resume document layout with a downloadable PDF option.',
        icon: faFileAlt,
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean single-column layout with generous whitespace and typography-focused design.',
        icon: faAlignCenter,
    },
]

const LayoutPreview = ({ layoutId, isLight }) => {
    const bar = isLight ? 'bg-slate-300' : 'bg-gray-600'
    const barLight = isLight ? 'bg-slate-200' : 'bg-gray-700'
    const accent = isLight ? 'bg-blue-400' : 'bg-blue-500'
    const block = isLight ? 'bg-slate-100' : 'bg-gray-800'

    if (layoutId === 'default') {
        return (
            <div className="flex flex-col gap-2 p-3">
                <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className={`h-2 w-3/4 rounded-full ${accent}`} />
                        <div className={`h-1.5 w-full rounded-full ${bar}`} />
                        <div className={`h-1.5 w-2/3 rounded-full ${barLight}`} />
                        <div className="flex gap-1 mt-1">
                            <div className={`h-4 w-12 rounded ${accent}`} />
                            <div className={`h-4 w-12 rounded ${barLight}`} />
                        </div>
                    </div>
                    <div className={`w-14 h-16 rounded-lg ${block}`} />
                </div>
                <div className="flex gap-1 mt-1">
                    {[1,2,3,4].map(i => <div key={i} className={`w-6 h-6 rounded-full ${barLight}`} />)}
                </div>
                <div className={`h-px w-full ${barLight}`} />
                <div className="flex gap-1.5">
                    {[1,2,3].map(i => <div key={i} className={`flex-1 h-10 rounded ${block}`} />)}
                </div>
            </div>
        )
    }

    if (layoutId === 'classic') {
        return (
            <div className="flex flex-col p-3">
                <div className={`rounded-t px-2 py-2 flex items-center gap-2 ${isLight ? 'bg-slate-700' : 'bg-slate-800'}`}>
                    <div className="w-5 h-5 rounded-full bg-slate-500" />
                    <div className="flex-1">
                        <div className="h-1.5 w-2/3 rounded-full bg-white/60" />
                        <div className="h-1 w-1/2 rounded-full bg-blue-300/50 mt-1" />
                    </div>
                </div>
                <div className="flex border-t-0">
                    <div className={`w-[35%] p-1.5 flex flex-col gap-1 ${isLight ? 'bg-slate-50' : 'bg-gray-800/50'} border-r ${isLight ? 'border-slate-200' : 'border-gray-700'}`}>
                        <div className={`h-1 w-2/3 rounded-full ${accent}`} />
                        {[1,2,3].map(i => (
                            <div key={i} className={`h-0.5 rounded-full ${barLight}`} style={{ width: `${50 + i * 15}%` }} />
                        ))}
                        <div className={`h-px w-full my-0.5 ${barLight}`} />
                        <div className={`h-1 w-1/2 rounded-full ${accent}`} />
                        <div className={`h-0.5 w-full rounded-full ${barLight}`} />
                    </div>
                    <div className="flex-1 p-1.5 flex flex-col gap-1">
                        <div className={`h-1 w-1/2 rounded-full ${accent}`} />
                        {[1,2].map(i => (
                            <div key={i} className="flex items-start gap-1">
                                <div className={`w-0.5 h-4 rounded-full ${accent} mt-0.5`} />
                                <div className="flex-1 flex flex-col gap-0.5">
                                    <div className={`h-0.5 w-3/4 rounded-full ${bar}`} />
                                    <div className={`h-0.5 w-1/2 rounded-full ${barLight}`} />
                                </div>
                            </div>
                        ))}
                        <div className={`h-px w-full my-0.5 ${barLight}`} />
                        <div className={`h-1 w-1/2 rounded-full ${accent}`} />
                        {[1,2].map(i => (
                            <div key={i} className="flex items-center gap-1">
                                <div className={`w-1 h-1 rounded-full ${accent}`} />
                                <div className={`h-0.5 flex-1 rounded-full ${barLight}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-2 p-3">
            <div className={`w-10 h-10 rounded-full ${block}`} />
            <div className={`h-2 w-1/2 rounded-full ${accent}`} />
            <div className={`h-1 w-2/3 rounded-full ${barLight}`} />
            <div className={`h-px w-3/4 my-0.5 ${barLight}`} />
            <div className={`h-1.5 w-1/3 rounded-full ${bar}`} />
            <div className={`h-1 w-3/4 rounded-full ${barLight}`} />
            <div className={`h-1 w-2/3 rounded-full ${barLight}`} />
            <div className={`h-px w-3/4 my-0.5 ${barLight}`} />
            <div className="flex gap-1 w-3/4">
                {[1,2,3].map(i => <div key={i} className={`flex-1 h-8 rounded ${block}`} />)}
            </div>
        </div>
    )
}

const LayoutSection = ({ portfolio, isLight, card }) => {
    const dispatch = useDispatch()
    const [saving, setSaving] = useState(false)
    const currentLayout = portfolio?.layout || 'default'

    const handleSelect = async (layoutId) => {
        if (layoutId === currentLayout || saving) return
        setSaving(true)
        try {
            await dispatch(updateLayout({ layout: layoutId })).unwrap()
        } catch {
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={`${card} p-4 sm:p-6 mt-4`}>
            <div className="mb-6">
                <h2 className={`text-base font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>Portfolio Layout</h2>
                <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Choose how your portfolio is displayed to visitors</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                {LAYOUTS.map((layout) => {
                    const isActive = currentLayout === layout.id
                    return (
                        <button key={layout.id} onClick={() => handleSelect(layout.id)} disabled={saving}
                            className={`relative text-left rounded-xl border-2 border-solid overflow-hidden transition-all ${isActive
                                ? (isLight ? 'border-blue-500 shadow-md shadow-blue-100' : 'border-blue-500 shadow-md shadow-blue-900/20')
                                : (isLight ? 'border-slate-200 hover:border-slate-300' : 'border-[#2B2B2B] hover:border-[#444]')
                            } ${saving ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                            {isActive && (
                                <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCheck} className="text-white text-[8px]" />
                                </div>
                            )}

                            <div className={`border-b border-solid ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#111] border-[#2B2B2B]'}`}>
                                <LayoutPreview layoutId={layout.id} isLight={isLight} />
                            </div>

                            <div className="p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <FontAwesomeIcon icon={layout.icon} className={`text-xs ${isActive ? 'text-blue-500' : (isLight ? 'text-slate-400' : 'text-gray-500')}`} />
                                    <h3 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{layout.name}</h3>
                                </div>
                                <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{layout.description}</p>
                            </div>
                        </button>
                    )
                })}
            </div>

            {saving && (
                <div className="flex items-center gap-2 mt-4">
                    <span className={`w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin ${isLight ? 'border-blue-500' : 'border-blue-400'}`} />
                    <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Saving layout...</span>
                </div>
            )}
        </div>
    )
}

export default LayoutSection
