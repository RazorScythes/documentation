import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateElement, pushHistory, setViewport, fetchImages } from '../../../../actions/pageBuilder'
import { componentRegistry } from '../componentRegistry'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop, faTabletAlt, faMobileAlt, faCheck, faAlignLeft, faAlignCenter, faAlignRight } from '@fortawesome/free-solid-svg-icons'
import StyleEditor from './StyleEditor'

const findNode = (nodes, id) => {
    for (const node of nodes) {
        if (node.id === id) return node
        if (node.children?.length) {
            const found = findNode(node.children, id)
            if (found) return found
        }
    }
    return null
}

const ImagePicker = ({ currentSrc, onSelect, isLight }) => {
    const dispatch = useDispatch()
    const userImages = useSelector(s => s.pageBuilder.userImages)

    useEffect(() => {
        if (!userImages.length) dispatch(fetchImages())
    }, [])

    if (!userImages.length) {
        return (
            <div className={`text-center py-4 text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                No images uploaded yet. Go to Images tab to upload.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-3 gap-1">
            {userImages.map(img => (
                <button
                    key={img._id}
                    onClick={() => onSelect(img.url)}
                    className={`relative aspect-square rounded overflow-hidden border border-solid transition-all ${
                        currentSrc === img.url
                            ? 'border-blue-500 ring-1 ring-blue-500'
                            : (isLight ? 'border-slate-200 hover:border-blue-300' : 'border-[#333] hover:border-blue-500/50')
                    }`}
                >
                    <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    {currentSrc === img.url && (
                        <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                            <FontAwesomeIcon icon={faCheck} className="text-white text-xs drop-shadow" />
                        </div>
                    )}
                </button>
            ))}
        </div>
    )
}

const DebouncedInput = ({ value, onChange, className, style, type = 'text', rows, placeholder }) => {
    const [local, setLocal] = useState(value || '')
    const committedRef = useRef(value || '')

    useEffect(() => {
        setLocal(value || '')
        committedRef.current = value || ''
    }, [value])

    const commit = () => {
        if (local !== committedRef.current) {
            committedRef.current = local
            onChange(local)
        }
    }

    if (type === 'textarea') {
        return (
            <textarea
                value={local}
                onChange={e => setLocal(e.target.value)}
                onBlur={commit}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit() } }}
                rows={rows || 4}
                className={className}
                style={style}
            />
        )
    }

    return (
        <input
            type="text"
            value={local}
            onChange={e => setLocal(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit() }}
            placeholder={placeholder}
            className={className}
        />
    )
}

const PropsPanel = ({ isLight }) => {
    const dispatch = useDispatch()
    const selectedElement = useSelector(s => s.pageBuilder.selectedElement)
    const layout = useSelector(s => s.pageBuilder.currentPage?.layout || [])
    const viewport = useSelector(s => s.pageBuilder.viewport)

    const node = selectedElement ? findNode(layout, selectedElement) : null
    const reg = node ? componentRegistry[node.type] : null

    if (!node || !reg) {
        return (
            <div className={`flex items-center justify-center h-full text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                Select an element to edit
            </div>
        )
    }

    const handlePropChange = (key, value) => {
        dispatch(pushHistory())
        dispatch(updateElement({ id: node.id, props: { [key]: value } }))
    }

    const handleStyleChange = (newStyles) => {
        dispatch(pushHistory())
        dispatch(updateElement({ id: node.id, styles: newStyles }))
    }

    const isImageType = node.type === 'image'

    const currentAlign = node.styles?.[viewport]?.textAlign || node.styles?.desktop?.textAlign || 'left'

    const handleAlign = (align) => {
        dispatch(pushHistory())
        dispatch(updateElement({
            id: node.id,
            styles: { [viewport]: { ...node.styles?.[viewport], textAlign: align } },
        }))
    }

    const ALIGNS = [
        { key: 'left', icon: faAlignLeft },
        { key: 'center', icon: faAlignCenter },
        { key: 'right', icon: faAlignRight },
    ]

    const inputCls = `w-full px-2 py-1.5 rounded text-xs border border-solid outline-none transition-all ${
        isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-700' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-300'
    }`

    return (
        <div className="flex flex-col h-full">
            <div className={`px-3 py-2 border-b border-solid flex-shrink-0 ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#1f1f1f] bg-[#111]'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={reg.icon} className={`text-[10px] ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                        <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{reg.label}</span>
                    </div>
                    <div className={`flex rounded-md overflow-hidden border border-solid ${isLight ? 'border-slate-200' : 'border-[#333]'}`}>
                        {ALIGNS.map(a => (
                            <button
                                key={a.key}
                                onClick={() => handleAlign(a.key)}
                                className={`px-2 py-1 text-[10px] transition-all ${
                                    currentAlign === a.key
                                        ? (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                                        : (isLight ? 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'bg-[#1a1a1a] text-gray-500 hover:text-gray-300 hover:bg-[#222]')
                                }`}
                                title={`Align ${a.key}`}
                            >
                                <FontAwesomeIcon icon={a.icon} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isImageType && (
                    <div className={`border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                        <div className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                            Choose Image
                        </div>
                        <div className="px-3 pb-3">
                            <ImagePicker
                                currentSrc={node.props?.src || ''}
                                onSelect={url => handlePropChange('src', url)}
                                isLight={isLight}
                            />
                        </div>
                    </div>
                )}

                {reg.propsSchema.length > 0 && (
                    <div className={`border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                        <div className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                            Properties
                        </div>
                        <div className="px-3 pb-3 space-y-2">
                            {reg.propsSchema.map(field => (
                                <div key={field.key}>
                                    <label className={`text-[10px] block mb-1 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{field.label}</label>
                                    {field.type === 'textarea' ? (
                                        <DebouncedInput
                                            type="textarea"
                                            value={node.props?.[field.key] || ''}
                                            onChange={v => handlePropChange(field.key, v)}
                                            rows={4}
                                            className={inputCls}
                                            style={{ resize: 'vertical' }}
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            value={node.props?.[field.key] || ''}
                                            onChange={e => handlePropChange(field.key, e.target.value)}
                                            className={`${inputCls} cursor-pointer`}
                                        >
                                            {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    ) : field.type === 'checkbox' ? (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!node.props?.[field.key]}
                                                onChange={e => handlePropChange(field.key, e.target.checked)}
                                                className="rounded"
                                            />
                                            <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{field.label}</span>
                                        </label>
                                    ) : field.type === 'color' ? (
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="color"
                                                value={node.props?.[field.key] || '#000000'}
                                                onChange={e => handlePropChange(field.key, e.target.value)}
                                                className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                                            />
                                            <DebouncedInput
                                                value={node.props?.[field.key] || ''}
                                                onChange={v => handlePropChange(field.key, v)}
                                                className={inputCls}
                                            />
                                        </div>
                                    ) : (
                                        <DebouncedInput
                                            value={node.props?.[field.key] || ''}
                                            onChange={v => handlePropChange(field.key, v)}
                                            className={inputCls}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`flex border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    {[
                        { key: 'desktop', icon: faDesktop, label: 'Desktop' },
                        { key: 'tablet', icon: faTabletAlt, label: 'Tablet' },
                        { key: 'mobile', icon: faMobileAlt, label: 'Mobile' },
                    ].map(v => (
                        <button
                            key={v.key}
                            onClick={() => dispatch(setViewport(v.key))}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] transition-all ${
                                viewport === v.key
                                    ? (isLight ? 'text-blue-600 bg-blue-50 font-medium' : 'text-blue-400 bg-blue-900/20 font-medium')
                                    : (isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-gray-500 hover:text-gray-300 hover:bg-[#151515]')
                            }`}
                            title={v.label}
                        >
                            <FontAwesomeIcon icon={v.icon} className="text-[10px]" />
                            {v.label}
                        </button>
                    ))}
                </div>

                <StyleEditor
                    styles={node.styles || {}}
                    viewport={viewport}
                    onChange={handleStyleChange}
                    isLight={isLight}
                />
            </div>
        </div>
    )
}

export default PropsPanel
