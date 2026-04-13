import React from 'react'

const ColumnsRenderer = ({ props, styles, children, isBuilder }) => {
    const columns = parseInt(props?.columns) || 2
    const gap = props?.gap || '20px'

    const { display, gridTemplateColumns, ...restStyles } = styles || {}

    const gridStyle = {
        ...restStyles,
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        ...(isBuilder ? {
            border: '1.5px dashed rgba(100, 116, 139, 0.4)',
            minHeight: '50px',
        } : {}),
    }

    return (
        <div style={gridStyle}>
            {children}
        </div>
    )
}

export default ColumnsRenderer
