import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { componentRegistry, COMPONENT_CATEGORIES } from '../componentRegistry'

const DraggableTile = ({ type, config, isLight }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `library-${type}`,
        data: { type, fromLibrary: true },
    })

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all select-none ${
                isDragging ? 'opacity-40 scale-95' : ''
            } ${isLight
                ? 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm text-slate-600 hover:text-blue-600'
                : 'bg-[#1a1a1a] border border-[#2B2B2B] hover:border-blue-500/50 text-gray-400 hover:text-blue-400'
            }`}
        >
            <FontAwesomeIcon icon={config.icon} className="text-base" />
            <span className="text-[10px] font-medium">{config.label}</span>
        </div>
    )
}

const ComponentLibrary = ({ isLight }) => {
    return (
        <div className="space-y-4">
            {COMPONENT_CATEGORIES.map(cat => {
                const items = Object.entries(componentRegistry).filter(([, c]) => c.category === cat.key)
                if (items.length === 0) return null
                return (
                    <div key={cat.key}>
                        <h4 className={`text-[10px] font-semibold uppercase tracking-wider mb-2 px-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                            {cat.label}
                        </h4>
                        <div className="grid grid-cols-2 gap-1.5">
                            {items.map(([type, config]) => (
                                <DraggableTile key={type} type={type} config={config} isLight={isLight} />
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ComponentLibrary
