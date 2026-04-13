import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { addElement, pushHistory } from '../../../../actions/pageBuilder'
import { componentRegistry } from '../componentRegistry'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const COLUMN_PRESETS = [
    { label: '1 Column', cols: ['1fr'], icon: [1] },
    { label: '2 Equal', cols: ['1fr', '1fr'], icon: [1, 1] },
    { label: '3 Equal', cols: ['1fr', '1fr', '1fr'], icon: [1, 1, 1] },
    { label: '4 Equal', cols: ['1fr', '1fr', '1fr', '1fr'], icon: [1, 1, 1, 1] },
    { label: '5 Equal', cols: ['1fr', '1fr', '1fr', '1fr', '1fr'], icon: [1, 1, 1, 1, 1] },
    { label: '6 Equal', cols: ['1fr', '1fr', '1fr', '1fr', '1fr', '1fr'], icon: [1, 1, 1, 1, 1, 1] },
    { label: '2/3 + 1/3', cols: ['2fr', '1fr'], icon: [2, 1] },
    { label: '1/3 + 2/3', cols: ['1fr', '2fr'], icon: [1, 2] },
    { label: '1/4 + 3/4', cols: ['1fr', '3fr'], icon: [1, 3] },
    { label: '3/4 + 1/4', cols: ['3fr', '1fr'], icon: [3, 1] },
    { label: '1/4+1/2+1/4', cols: ['1fr', '2fr', '1fr'], icon: [1, 2, 1] },
]

const PresetIcon = ({ widths, isLight }) => {
    const total = widths.reduce((a, b) => a + b, 0)
    return (
        <div className="flex gap-[2px] w-full">
            {widths.map((w, i) => (
                <div
                    key={i}
                    className={`h-[10px] rounded-[2px] ${isLight ? 'bg-slate-200' : 'bg-gray-600'}`}
                    style={{ flex: w / total }}
                />
            ))}
        </div>
    )
}

const makeSection = (colTemplate) => {
    const sectionReg = componentRegistry.section
    const sectionId = uuidv4()

    const children = colTemplate.map(() => {
        const cellReg = componentRegistry.container
        return {
            id: uuidv4(),
            type: 'container',
            props: { ...cellReg.defaultProps, maxWidth: '100%' },
            styles: JSON.parse(JSON.stringify(cellReg.defaultStyles)),
            children: [],
        }
    })

    return {
        id: sectionId,
        type: 'section',
        props: { ...sectionReg.defaultProps, _colTemplate: colTemplate.join(' ') },
        styles: {
            desktop: {
                display: 'grid',
                gridTemplateColumns: colTemplate.join(' '),
                gap: '16px',
                padding: '24px',
                width: '100%',
            },
        },
        children,
    }
}

const AddRowBar = ({ isLight, afterId }) => {
    const dispatch = useDispatch()
    const [expanded, setExpanded] = useState(false)

    const handlePresetClick = (preset) => {
        dispatch(pushHistory())
        const newRow = makeSection(preset.cols)
        if (afterId) {
            dispatch(addElement({ element: newRow, targetId: afterId, position: 'after' }))
        } else {
            dispatch(addElement({ element: newRow }))
        }
        setExpanded(false)
    }

    return (
        <div
            className={`rounded-xl border-2 border-dashed transition-all mx-2 my-3 ${isLight
                ? 'border-slate-200 hover:border-slate-300'
                : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
            }`}
            onClick={e => e.stopPropagation()}
        >
            <button
                onClick={() => setExpanded(!expanded)}
                className={`w-full flex items-center justify-center gap-1.5 py-3 transition-colors rounded-xl ${isLight
                    ? 'text-slate-400 hover:text-blue-500 hover:bg-blue-50/30'
                    : 'text-gray-500 hover:text-blue-400 hover:bg-blue-900/10'
                }`}
            >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span className="text-xs font-medium">Add a new row</span>
            </button>

            {expanded && (
                <div className={`px-4 pb-4 pt-1 border-t border-dashed ${isLight ? 'border-slate-200' : 'border-[#2a2a2a]'}`}>
                    <div className="grid grid-cols-6 gap-2 mt-2">
                        {COLUMN_PRESETS.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => handlePresetClick(preset)}
                                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-all border border-solid ${isLight
                                    ? 'border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 bg-white'
                                    : 'border-[#252525] hover:border-blue-500/50 hover:bg-blue-900/10 bg-[#1a1a1a]'
                                }`}
                            >
                                <PresetIcon widths={preset.icon} isLight={isLight} />
                                <span className={`text-[9px] font-medium whitespace-nowrap ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                    {preset.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export { makeSection, COLUMN_PRESETS }
export default AddRowBar
