import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons'

const StyleGroup = ({ label, isLight, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className={`border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
            <button
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider ${
                    isLight ? 'text-slate-500 hover:bg-slate-50' : 'text-gray-400 hover:bg-[#151515]'
                }`}
            >
                {label}
                <FontAwesomeIcon icon={open ? faChevronDown : faChevronRight} className="text-[8px]" />
            </button>
            {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
        </div>
    )
}

const DebouncedTextInput = ({ value, onChange, className, placeholder }) => {
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

    return (
        <input
            type="text"
            value={local}
            onChange={e => setLocal(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit() }}
            placeholder={placeholder || ''}
            className={className}
        />
    )
}

const StyleInput = ({ label, value, onChange, isLight, type = 'text', placeholder }) => {
    const baseCls = `flex-1 px-2 py-1 rounded text-[11px] border border-solid outline-none ${
        isLight ? 'bg-white border-slate-200 text-slate-700 focus:border-blue-400' : 'bg-[#1a1a1a] border-[#333] text-gray-300 focus:border-blue-500'
    }`

    return (
        <div className="flex items-center gap-2">
            <label className={`text-[10px] w-16 flex-shrink-0 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{label}</label>
            {type === 'color' ? (
                <div className="flex items-center gap-1.5 flex-1">
                    <input
                        type="color"
                        value={value || '#000000'}
                        onChange={e => onChange(e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                    />
                    <DebouncedTextInput
                        value={value || ''}
                        onChange={onChange}
                        placeholder={placeholder || '#000000'}
                        className={baseCls}
                    />
                </div>
            ) : type === 'select' ? (
                <select
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    className={`${baseCls} cursor-pointer`}
                >
                    {placeholder?.split(',').map(o => <option key={o} value={o.trim()}>{o.trim()}</option>)}
                </select>
            ) : (
                <DebouncedTextInput
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder || ''}
                    className={baseCls}
                />
            )}
        </div>
    )
}

const SpacingInputs = ({ prefix, currentStyles, update, isLight }) => {
    const sides = [
        { key: `${prefix}Top`, label: 'Top' },
        { key: `${prefix}Right`, label: 'Right' },
        { key: `${prefix}Bottom`, label: 'Bottom' },
        { key: `${prefix}Left`, label: 'Left' },
    ]

    const inputCls = `w-full px-1.5 py-1 rounded text-[11px] text-center border border-solid outline-none ${
        isLight ? 'bg-white border-slate-200 text-slate-700 focus:border-blue-400' : 'bg-[#1a1a1a] border-[#333] text-gray-300 focus:border-blue-500'
    }`

    return (
        <div>
            <div className="grid grid-cols-4 gap-1">
                {sides.map(s => (
                    <SpacingField key={s.key} label={s.label} value={currentStyles[s.key]} onChange={v => update(s.key, v)} inputCls={inputCls} isLight={isLight} />
                ))}
            </div>
        </div>
    )
}

const SpacingField = ({ label, value, onChange, inputCls, isLight }) => {
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

    return (
        <div className="flex flex-col items-center gap-0.5">
            <span className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{label}</span>
            <input
                type="text"
                value={local}
                onChange={e => setLocal(e.target.value)}
                onBlur={commit}
                onKeyDown={e => { if (e.key === 'Enter') commit() }}
                placeholder="0"
                className={inputCls}
            />
        </div>
    )
}

const StyleEditor = ({ styles, viewport, onChange, isLight }) => {
    const currentStyles = styles?.[viewport] || {}

    const update = (key, value) => {
        const updated = {
            ...styles,
            [viewport]: { ...(styles?.[viewport] || {}), [key]: value || undefined }
        }
        if (!value) delete updated[viewport][key]
        onChange(updated)
    }

    return (
        <div>
            <StyleGroup label="Layout" isLight={isLight} defaultOpen>
                <StyleInput label="Width" value={currentStyles.width} onChange={v => update('width', v)} isLight={isLight} placeholder="auto" />
                <StyleInput label="Height" value={currentStyles.height} onChange={v => update('height', v)} isLight={isLight} placeholder="auto" />
                <StyleInput label="Max W" value={currentStyles.maxWidth} onChange={v => update('maxWidth', v)} isLight={isLight} placeholder="none" />
                <StyleInput label="Min H" value={currentStyles.minHeight} onChange={v => update('minHeight', v)} isLight={isLight} placeholder="none" />
                <StyleInput label="Display" value={currentStyles.display} onChange={v => update('display', v)} isLight={isLight} type="select" placeholder="block,flex,grid,inline,inline-block,none" />
                {(currentStyles.display === 'flex' || currentStyles.display === 'grid') && (
                    <>
                        <StyleInput label="Direction" value={currentStyles.flexDirection} onChange={v => update('flexDirection', v)} isLight={isLight} type="select" placeholder="row,column,row-reverse,column-reverse" />
                        <StyleInput label="Align" value={currentStyles.alignItems} onChange={v => update('alignItems', v)} isLight={isLight} type="select" placeholder="stretch,flex-start,center,flex-end,baseline" />
                        <StyleInput label="Justify" value={currentStyles.justifyContent} onChange={v => update('justifyContent', v)} isLight={isLight} type="select" placeholder="flex-start,center,flex-end,space-between,space-around,space-evenly" />
                        <StyleInput label="Gap" value={currentStyles.gap} onChange={v => update('gap', v)} isLight={isLight} placeholder="0" />
                        <StyleInput label="Wrap" value={currentStyles.flexWrap} onChange={v => update('flexWrap', v)} isLight={isLight} type="select" placeholder="nowrap,wrap,wrap-reverse" />
                    </>
                )}
                <StyleInput label="Overflow" value={currentStyles.overflow} onChange={v => update('overflow', v)} isLight={isLight} type="select" placeholder="visible,hidden,scroll,auto" />
                <StyleInput label="Position" value={currentStyles.position} onChange={v => update('position', v)} isLight={isLight} type="select" placeholder="static,relative,absolute,fixed,sticky" />
            </StyleGroup>

            <StyleGroup label="Padding" isLight={isLight}>
                <SpacingInputs prefix="padding" currentStyles={currentStyles} update={update} isLight={isLight} />
            </StyleGroup>

            <StyleGroup label="Margin" isLight={isLight}>
                <SpacingInputs prefix="margin" currentStyles={currentStyles} update={update} isLight={isLight} />
            </StyleGroup>

            <StyleGroup label="Typography" isLight={isLight}>
                <StyleInput label="Font Size" value={currentStyles.fontSize} onChange={v => update('fontSize', v)} isLight={isLight} placeholder="16px" />
                <StyleInput label="Weight" value={currentStyles.fontWeight} onChange={v => update('fontWeight', v)} isLight={isLight} type="select" placeholder="100,200,300,400,500,600,700,800,900" />
                <StyleInput label="Color" value={currentStyles.color} onChange={v => update('color', v)} isLight={isLight} type="color" />
                <StyleInput label="Line H" value={currentStyles.lineHeight} onChange={v => update('lineHeight', v)} isLight={isLight} placeholder="1.5" />
                <StyleInput label="Spacing" value={currentStyles.letterSpacing} onChange={v => update('letterSpacing', v)} isLight={isLight} placeholder="normal" />
                <StyleInput label="Align" value={currentStyles.textAlign} onChange={v => update('textAlign', v)} isLight={isLight} type="select" placeholder="left,center,right,justify" />
                <StyleInput label="Transform" value={currentStyles.textTransform} onChange={v => update('textTransform', v)} isLight={isLight} type="select" placeholder="none,uppercase,lowercase,capitalize" />
                <StyleInput label="Decor" value={currentStyles.textDecoration} onChange={v => update('textDecoration', v)} isLight={isLight} type="select" placeholder="none,underline,line-through,overline" />
                <StyleInput label="Family" value={currentStyles.fontFamily} onChange={v => update('fontFamily', v)} isLight={isLight} placeholder="inherit" />
            </StyleGroup>

            <StyleGroup label="Background" isLight={isLight}>
                <StyleInput label="Color" value={currentStyles.backgroundColor} onChange={v => update('backgroundColor', v)} isLight={isLight} type="color" />
                <StyleInput label="Image" value={currentStyles.backgroundImage} onChange={v => update('backgroundImage', v)} isLight={isLight} placeholder="url(...)" />
                <StyleInput label="Size" value={currentStyles.backgroundSize} onChange={v => update('backgroundSize', v)} isLight={isLight} type="select" placeholder="auto,cover,contain" />
                <StyleInput label="Position" value={currentStyles.backgroundPosition} onChange={v => update('backgroundPosition', v)} isLight={isLight} placeholder="center" />
                <StyleInput label="Repeat" value={currentStyles.backgroundRepeat} onChange={v => update('backgroundRepeat', v)} isLight={isLight} type="select" placeholder="repeat,no-repeat,repeat-x,repeat-y" />
            </StyleGroup>

            <StyleGroup label="Border" isLight={isLight}>
                <StyleInput label="Width" value={currentStyles.borderWidth} onChange={v => update('borderWidth', v)} isLight={isLight} placeholder="0" />
                <StyleInput label="Style" value={currentStyles.borderStyle} onChange={v => update('borderStyle', v)} isLight={isLight} type="select" placeholder="none,solid,dashed,dotted,double" />
                <StyleInput label="Color" value={currentStyles.borderColor} onChange={v => update('borderColor', v)} isLight={isLight} type="color" />
                <StyleInput label="Radius" value={currentStyles.borderRadius} onChange={v => update('borderRadius', v)} isLight={isLight} placeholder="0" />
            </StyleGroup>

            <StyleGroup label="Effects" isLight={isLight}>
                <StyleInput label="Shadow" value={currentStyles.boxShadow} onChange={v => update('boxShadow', v)} isLight={isLight} placeholder="none" />
                <StyleInput label="Opacity" value={currentStyles.opacity} onChange={v => update('opacity', v)} isLight={isLight} placeholder="1" />
                <StyleInput label="Transition" value={currentStyles.transition} onChange={v => update('transition', v)} isLight={isLight} placeholder="all 0.3s" />
                <StyleInput label="Z-Index" value={currentStyles.zIndex} onChange={v => update('zIndex', v)} isLight={isLight} placeholder="auto" />
            </StyleGroup>
        </div>
    )
}

export default StyleEditor
