import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedElement } from '../../../../actions/pageBuilder'
import { componentRegistry } from '../componentRegistry'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons'

const LayerItem = ({ node, depth, isLight }) => {
    const dispatch = useDispatch()
    const selectedElement = useSelector(s => s.pageBuilder.selectedElement)
    const isSelected = selectedElement === node.id
    const reg = componentRegistry[node.type]
    const hasChildren = node.children?.length > 0
    const [expanded, setExpanded] = useState(true)

    const handleSelect = (e) => {
        e.stopPropagation()
        dispatch(setSelectedElement(node.id))
    }

    const toggleExpand = (e) => {
        e.stopPropagation()
        setExpanded(!expanded)
    }

    return (
        <div>
            <div
                onClick={handleSelect}
                className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-all text-[11px] ${
                    isSelected
                        ? (isLight ? 'bg-blue-50 text-blue-700 font-medium' : 'bg-blue-900/30 text-blue-400 font-medium')
                        : (isLight ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-[#1a1a1a] text-gray-400')
                }`}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
                {hasChildren ? (
                    <button onClick={toggleExpand} className="w-3 flex-shrink-0">
                        <FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} className="text-[8px]" />
                    </button>
                ) : (
                    <span className="w-3 flex-shrink-0" />
                )}
                {reg && <FontAwesomeIcon icon={reg.icon} className="text-[10px] flex-shrink-0 opacity-60" />}
                <span className="truncate">
                    {node.props?.text
                        ? `${reg?.label || node.type}: ${String(node.props.text).substring(0, 20)}`
                        : (reg?.label || node.type)
                    }
                </span>
            </div>
            {hasChildren && expanded && (
                <div>
                    {node.children.map(child => (
                        <LayerItem key={child.id} node={child} depth={depth + 1} isLight={isLight} />
                    ))}
                </div>
            )}
        </div>
    )
}

const LayersPanel = ({ isLight }) => {
    const layout = useSelector(s => s.pageBuilder.currentPage?.layout || [])

    if (layout.length === 0) {
        return (
            <div className={`text-center py-6 text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                No elements yet
            </div>
        )
    }

    return (
        <div className="space-y-0.5">
            {layout.map(node => (
                <LayerItem key={node.id} node={node} depth={0} isLight={isLight} />
            ))}
        </div>
    )
}

export default LayersPanel
