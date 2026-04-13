import React from 'react'

const DropIndicator = ({ position, isActive }) => {
    if (!isActive) return null

    if (position === 'inside') {
        return (
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    border: '2px dashed #3b82f6',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                }}
            />
        )
    }

    return (
        <div
            className="pointer-events-none z-20"
            style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: '#3b82f6',
                borderRadius: '2px',
                ...(position === 'before' ? { top: '-2px' } : { bottom: '-2px' }),
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: '-3px',
                    top: '-3px',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                }}
            />
        </div>
    )
}

export default DropIndicator
