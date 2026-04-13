import React, { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { addElement, pushHistory } from '../../../../actions/pageBuilder'
import { componentRegistry, COMPONENT_CATEGORIES } from '../componentRegistry'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const QUICK_TYPES = [
    { type: 'heading', label: 'Heading' },
    { type: 'text', label: 'Text' },
    { type: 'image', label: 'Image' },
    { type: 'button', label: 'Button' },
    { type: 'video', label: 'Video' },
    { type: 'list', label: 'List' },
]

const AddElementBar = ({ parentId, position = 'inside', afterId, isLight, spanAllColumns, cellMode }) => {
    const dispatch = useDispatch()
    const [showAll, setShowAll] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        if (!showAll) return
        const close = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setShowAll(false)
        }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [showAll])

    const handleAdd = (type) => {
        const reg = componentRegistry[type]
        if (!reg) return

        dispatch(pushHistory())

        const newElement = {
            id: uuidv4(),
            type,
            props: { ...reg.defaultProps },
            styles: JSON.parse(JSON.stringify(reg.defaultStyles)),
            children: reg.canHaveChildren ? [] : undefined,
        }

        if (afterId) {
            dispatch(addElement({ element: newElement, targetId: afterId, position: 'after' }))
        } else {
            dispatch(addElement({ element: newElement, targetId: parentId, position }))
        }

        setShowAll(false)
    }

    if (cellMode) {
        return (
            <div
                ref={ref}
                className="flex flex-col items-center justify-center py-4 gap-2.5 w-full"
                onClick={e => e.stopPropagation()}
                style={spanAllColumns ? { gridColumn: '1 / -1' } : undefined}
            >
                <span className={`text-[11px] font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                    Choose content type
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {QUICK_TYPES.map(qt => (
                        <button
                            key={qt.type}
                            onClick={() => handleAdd(qt.type)}
                            className={`px-3 py-1 rounded-md text-[10px] font-medium border border-solid transition-all ${isLight
                                ? 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 bg-white'
                                : 'border-[#333] text-gray-400 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-900/10 bg-[#1a1a1a]'
                            }`}
                        >
                            {qt.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${isLight
                            ? 'text-blue-500 hover:bg-blue-50'
                            : 'text-blue-400 hover:bg-blue-900/20'
                        }`}
                    >
                        More...
                    </button>
                </div>

                {showAll && (
                    <div
                        className={`w-60 rounded-lg shadow-xl border border-solid overflow-hidden z-50 ${
                            isLight ? 'bg-white border-slate-200' : 'bg-[#1a1a1a] border-[#333]'
                        }`}
                        style={{ maxHeight: '250px', overflowY: 'auto' }}
                    >
                        {COMPONENT_CATEGORIES.map(cat => {
                            const items = Object.entries(componentRegistry).filter(([, c]) => c.category === cat.key)
                            if (!items.length) return null
                            return (
                                <div key={cat.key}>
                                    <div className={`px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider ${
                                        isLight ? 'text-slate-400 bg-slate-50' : 'text-gray-500 bg-[#111]'
                                    }`}>{cat.label}</div>
                                    {items.map(([type, config]) => (
                                        <button
                                            key={type}
                                            onClick={() => handleAdd(type)}
                                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-colors ${
                                                isLight
                                                    ? 'hover:bg-blue-50 text-slate-600 hover:text-blue-600'
                                                    : 'hover:bg-blue-900/20 text-gray-400 hover:text-blue-400'
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={config.icon} className="text-[10px] w-3.5" />
                                            <span className="text-[11px] font-medium">{config.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div
            ref={ref}
            className="relative group/add w-full"
            onClick={e => e.stopPropagation()}
            style={spanAllColumns ? { gridColumn: '1 / -1' } : undefined}
        >
            <button
                onClick={() => setShowAll(!showAll)}
                className={`w-full flex items-center justify-center gap-1 py-1 transition-all opacity-0 group-hover/add:opacity-100 hover:!opacity-100 focus:!opacity-100 ${
                    showAll ? '!opacity-100' : ''
                } ${isLight
                    ? 'text-blue-400 hover:text-blue-600 hover:bg-blue-50/50'
                    : 'text-blue-500/50 hover:text-blue-400 hover:bg-blue-900/10'
                }`}
            >
                <FontAwesomeIcon icon={faPlus} className="text-[8px]" />
                <span className="text-[9px] font-medium">Add element</span>
            </button>

            {showAll && (
                <div
                    className={`absolute left-1/2 -translate-x-1/2 z-50 w-56 rounded-lg shadow-xl border border-solid overflow-hidden ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#1a1a1a] border-[#333]'
                    }`}
                    style={{ top: '100%', maxHeight: '280px', overflowY: 'auto' }}
                >
                    {COMPONENT_CATEGORIES.map(cat => {
                        const items = Object.entries(componentRegistry).filter(([, c]) => c.category === cat.key)
                        if (!items.length) return null
                        return (
                            <div key={cat.key}>
                                <div className={`px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider ${
                                    isLight ? 'text-slate-400 bg-slate-50' : 'text-gray-500 bg-[#111]'
                                }`}>{cat.label}</div>
                                {items.map(([type, config]) => (
                                    <button
                                        key={type}
                                        onClick={() => handleAdd(type)}
                                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-colors ${
                                            isLight
                                                ? 'hover:bg-blue-50 text-slate-600 hover:text-blue-600'
                                                : 'hover:bg-blue-900/20 text-gray-400 hover:text-blue-400'
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={config.icon} className="text-[10px] w-3.5" />
                                        <span className="text-[11px] font-medium">{config.label}</span>
                                    </button>
                                ))}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default AddElementBar
