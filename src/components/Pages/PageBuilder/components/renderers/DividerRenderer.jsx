import React from 'react'

const DividerRenderer = ({ props, styles }) => {
    return (
        <hr
            style={{
                border: 'none',
                borderTop: `${props?.thickness || '1'}px ${props?.style || 'solid'} ${props?.color || '#e2e8f0'}`,
                ...styles,
            }}
        />
    )
}

export default DividerRenderer
