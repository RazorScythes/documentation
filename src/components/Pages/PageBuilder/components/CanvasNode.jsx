import React from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedElement, removeElement, duplicateElement } from '../../../../actions/pageBuilder'
import { componentRegistry } from '../componentRegistry'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faCopy, faGripVertical } from '@fortawesome/free-solid-svg-icons'
import DropIndicator from './DropIndicator'
import AddElementBar from './AddElementBar'

const GRID_TYPES = new Set(['columns', 'grid', 'section'])

const CanvasNode = ({ node, depth = 0, isLight, activeDropTarget, viewport, rowIndex }) => {
    const dispatch = useDispatch()
    const selectedElement = useSelector(s => s.pageBuilder.selectedElement)
    const isSelected = selectedElement === node.id
    const reg = componentRegistry[node.type]
    if (!reg) return null

    const Renderer = reg.render
    const canHaveChildren = reg.canHaveChildren
    const isGridParent = GRID_TYPES.has(node.type)
    const isCell = node.type === 'container'

    const mergedStyles = {
        ...node.styles?.desktop,
        ...(viewport === 'tablet' ? node.styles?.tablet : {}),
        ...(viewport === 'mobile' ? node.styles?.mobile : {}),
    }

    const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
        id: `canvas-${node.id}`,
        data: { type: node.type, nodeId: node.id, fromCanvas: true },
    })

    const { setNodeRef: setDropBeforeRef, isOver: isOverBefore } = useDroppable({
        id: `drop-before-${node.id}`,
        data: { targetId: node.id, position: 'before' },
    })

    const { setNodeRef: setDropAfterRef, isOver: isOverAfter } = useDroppable({
        id: `drop-after-${node.id}`,
        data: { targetId: node.id, position: 'after' },
    })

    const insideDrop = useDroppable({
        id: `drop-inside-${node.id}`,
        data: { targetId: node.id, position: 'inside' },
        disabled: !canHaveChildren,
    })

    const handleSelect = (e) => {
        e.stopPropagation()
        dispatch(setSelectedElement(node.id))
    }

    const handleDelete = (e) => {
        e.stopPropagation()
        dispatch(removeElement(node.id))
    }

    const handleDuplicate = (e) => {
        e.stopPropagation()
        dispatch(duplicateElement(node.id))
    }

    const isActiveDropInside = activeDropTarget?.targetId === node.id && activeDropTarget?.position === 'inside'
    const hasChildren = canHaveChildren && node.children?.length > 0

    const renderChildren = () => {
        if (!canHaveChildren) return null

        if (hasChildren) {
            const lastChild = node.children[node.children.length - 1]
            return (
                <>
                    {node.children.map(child => (
                        <CanvasNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            isLight={isLight}
                            activeDropTarget={activeDropTarget}
                            viewport={viewport}
                        />
                    ))}
                    {!isGridParent && (
                        <AddElementBar
                            parentId={node.id}
                            afterId={lastChild.id}
                            isLight={isLight}
                        />
                    )}
                </>
            )
        }

        return (
            <AddElementBar
                parentId={node.id}
                position="inside"
                isLight={isLight}
                spanAllColumns={isGridParent}
                cellMode={isCell}
            />
        )
    }

    return (
        <div className="relative group/node" style={{ opacity: isDragging ? 0.4 : 1 }}>
            <div ref={setDropBeforeRef} className="absolute -top-[4px] left-0 right-0 h-[8px] z-10" />

            <DropIndicator position="before" isActive={isOverBefore} />

            <div
                ref={(el) => {
                    setDragRef(el)
                    if (canHaveChildren) insideDrop.setNodeRef(el)
                }}
                {...attributes}
                {...(isCell ? {} : listeners)}
                onClick={handleSelect}
                className={`relative transition-all ${isCell ? '' : 'cursor-grab active:cursor-grabbing'}`}
                style={{
                    outline: isSelected ? '2px solid #3b82f6' : 'none',
                    outlineOffset: '2px',
                    minHeight: canHaveChildren ? '40px' : undefined,
                }}
            >
                {isSelected && (
                    <div
                        className="absolute -top-7 left-0 flex items-center gap-0.5 z-30 rounded-t-md px-1"
                        style={{ backgroundColor: '#3b82f6' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <span className="text-[10px] text-white font-medium px-1.5 py-0.5 select-none">{reg.label}</span>
                        <button
                            {...listeners}
                            className="text-white/70 hover:text-white p-0.5 cursor-grab active:cursor-grabbing"
                            title="Drag"
                        >
                            <FontAwesomeIcon icon={faGripVertical} className="text-[9px]" />
                        </button>
                        <button onClick={handleDuplicate} className="text-white/70 hover:text-white p-0.5" title="Duplicate">
                            <FontAwesomeIcon icon={faCopy} className="text-[9px]" />
                        </button>
                        <button onClick={handleDelete} className="text-white/70 hover:text-red-200 p-0.5" title="Delete">
                            <FontAwesomeIcon icon={faTrash} className="text-[9px]" />
                        </button>
                    </div>
                )}

                {isActiveDropInside && <DropIndicator position="inside" isActive />}

                <Renderer
                    props={node.props || {}}
                    styles={mergedStyles}
                    isBuilder={true}
                    rowIndex={rowIndex}
                >
                    {renderChildren()}
                </Renderer>
            </div>

            <DropIndicator position="after" isActive={isOverAfter} />

            <div ref={setDropAfterRef} className="absolute -bottom-[4px] left-0 right-0 h-[8px] z-10" />
        </div>
    )
}

export default CanvasNode
