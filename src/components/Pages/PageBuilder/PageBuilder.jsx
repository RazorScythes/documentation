import React, { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core'
import { v4 as uuidv4 } from 'uuid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCubes, faLayerGroup, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons'

import {
    fetchPageForEdit, createNewPage, clearCurrentPage,
    addElement, moveElement, pushHistory, undo, redo,
    setSelectedElement
} from '../../../actions/pageBuilder'
import { componentRegistry } from './componentRegistry'
import TopBar from './components/TopBar'
import ComponentLibrary from './components/ComponentLibrary'
import LayersPanel from './components/LayersPanel'
import PropsPanel from './components/PropsPanel'
import CanvasNode from './components/CanvasNode'
import AddRowBar from './components/AddRowBar'
import { useDroppable } from '@dnd-kit/core'

const CanvasDropArea = ({ children, isLight }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'canvas-root',
        data: { targetId: null, position: 'root' },
    })

    return (
        <div
            ref={setNodeRef}
            className="min-h-full"
            style={{
                backgroundColor: isOver ? (isLight ? '#f0f4ff' : '#111827') : undefined,
                transition: 'background-color 0.15s',
            }}
        >
            {children}
        </div>
    )
}

const PageBuilder = ({ theme }) => {
    const isLight = theme === 'light'
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const pageId = searchParams.get('id')

    const currentPage = useSelector(s => s.pageBuilder.currentPage)
    const viewport = useSelector(s => s.pageBuilder.viewport)
    const isLoading = useSelector(s => s.pageBuilder.isLoading)

    const [leftTab, setLeftTab] = useState('components')
    const [activeDropTarget, setActiveDropTarget] = useState(null)
    const [activeDragData, setActiveDragData] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    )

    useEffect(() => {
        if (pageId) {
            dispatch(fetchPageForEdit(pageId))
        } else {
            dispatch(createNewPage({ title: 'Untitled Page' }))
        }
        return () => { dispatch(clearCurrentPage()) }
    }, [pageId])

    const handleKeyDown = useCallback((e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault()
            dispatch(undo())
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
            e.preventDefault()
            dispatch(redo())
        }
        if (e.key === 'Escape') {
            dispatch(setSelectedElement(null))
        }
    }, [dispatch])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    const handleDragStart = (event) => {
        setActiveDragData(event.active.data.current)
    }

    const handleDragOver = (event) => {
        const { over } = event
        if (over?.data?.current) {
            setActiveDropTarget(over.data.current)
        } else {
            setActiveDropTarget(null)
        }
    }

    const handleDragEnd = (event) => {
        const { active, over } = event
        setActiveDropTarget(null)
        setActiveDragData(null)

        if (!over) return

        const activeData = active.data.current
        const overData = over.data.current

        if (activeData.fromLibrary) {
            const reg = componentRegistry[activeData.type]
            if (!reg) return

            dispatch(pushHistory())

            const newElement = {
                id: uuidv4(),
                type: activeData.type,
                props: { ...reg.defaultProps },
                styles: JSON.parse(JSON.stringify(reg.defaultStyles)),
                children: reg.canHaveChildren ? [] : undefined,
            }

            if (overData.position === 'root') {
                dispatch(addElement({ element: newElement }))
            } else {
                dispatch(addElement({
                    element: newElement,
                    targetId: overData.targetId,
                    position: overData.position,
                }))
            }
        } else if (activeData.fromCanvas) {
            if (activeData.nodeId === overData.targetId) return
            dispatch(pushHistory())

            if (overData.position === 'root') {
                dispatch(moveElement({ elementId: activeData.nodeId }))
            } else {
                dispatch(moveElement({
                    elementId: activeData.nodeId,
                    targetId: overData.targetId,
                    position: overData.position,
                }))
            }
        }
    }

    const canvasWidth = viewport === 'tablet' ? '768px' : viewport === 'mobile' ? '375px' : '100%'

    if (isLoading && !currentPage) {
        return (
            <div className={`h-screen flex items-center justify-center ${isLight ? 'bg-slate-50' : 'bg-[#0a0a0a]'}`}>
                <FontAwesomeIcon icon={faSpinner} className={`text-2xl animate-spin ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
            </div>
        )
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className={`h-screen flex flex-col overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#0a0a0a]'}`}>
                <TopBar isLight={isLight} />

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel */}
                    <div className={`w-60 flex-shrink-0 flex flex-col border-r border-solid overflow-hidden ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#2B2B2B]'
                    }`}>
                        <div className={`flex border-b border-solid flex-shrink-0 ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                            {[
                                { key: 'components', icon: faCubes, label: 'Add' },
                                { key: 'layers', icon: faLayerGroup, label: 'Layers' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setLeftTab(tab.key)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-all ${
                                        leftTab === tab.key
                                            ? (isLight ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-500' : 'text-blue-400 bg-blue-900/20 border-b-2 border-blue-500')
                                            : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-gray-500 hover:text-gray-300')
                                    }`}
                                >
                                    <FontAwesomeIcon icon={tab.icon} className="text-[10px]" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto p-3">
                            {leftTab === 'components' ? (
                                <ComponentLibrary isLight={isLight} />
                            ) : (
                                <LayersPanel isLight={isLight} />
                            )}
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 overflow-auto p-6" onClick={() => dispatch(setSelectedElement(null))}>
                        <div
                            className={`mx-auto transition-all duration-300 min-h-full rounded-lg shadow-sm ${
                                isLight ? 'bg-white' : 'bg-[#151515]'
                            }`}
                            style={{
                                width: canvasWidth,
                                maxWidth: '100%',
                                color: isLight ? '#1a1a1a' : '#e5e7eb',
                            }}
                        >
                            <CanvasDropArea isLight={isLight}>
                                {currentPage?.layout?.length > 0 ? (
                                    <div className="p-4 space-y-2">
                                        {currentPage.layout.map((node, i) => (
                                            <React.Fragment key={node.id}>
                                                <CanvasNode
                                                    node={node}
                                                    isLight={isLight}
                                                    activeDropTarget={activeDropTarget}
                                                    viewport={viewport}
                                                    rowIndex={node.type === 'section' ? i : undefined}
                                                />
                                            </React.Fragment>
                                        ))}
                                        <AddRowBar isLight={isLight} afterId={currentPage.layout[currentPage.layout.length - 1]?.id} />
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <AddRowBar isLight={isLight} />
                                    </div>
                                )}
                            </CanvasDropArea>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className={`w-72 flex-shrink-0 border-l border-solid overflow-hidden ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#2B2B2B]'
                    }`}>
                        <PropsPanel isLight={isLight} />
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeDragData && (
                    <div className={`px-4 py-2 rounded-lg shadow-lg text-xs font-medium pointer-events-none ${
                        isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'
                    }`}>
                        {activeDragData.fromLibrary
                            ? componentRegistry[activeDragData.type]?.label || activeDragData.type
                            : 'Moving element'
                        }
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}

export default PageBuilder
