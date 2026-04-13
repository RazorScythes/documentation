import React from 'react'

const GridRenderer = ({ props, styles, children, isBuilder }) => {
    const minColumnWidth = props?.minColumnWidth || '250px'
    const gap = props?.gap || '20px'

    const { display, gridTemplateColumns, ...restStyles } = styles || {}

    const gridStyle = {
        ...restStyles,
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}, 1fr))`,
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

export default GridRenderer
