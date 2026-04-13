import React from 'react'

const ContainerRenderer = ({ props, styles, children, isBuilder }) => {
    const { display, flexDirection, maxWidth: styleMaxWidth, marginLeft, marginRight, ...restStyles } = styles || {}

    const containerStyle = {
        ...restStyles,
        display: 'flex',
        flexDirection: 'column',
        gap: restStyles.gap || '8px',
        maxWidth: isBuilder ? '100%' : (styleMaxWidth || props?.maxWidth || '1200px'),
        marginLeft: isBuilder ? undefined : 'auto',
        marginRight: isBuilder ? undefined : 'auto',
        ...(isBuilder ? {
            border: '1.5px dashed rgba(100, 116, 139, 0.3)',
            borderRadius: '8px',
            position: 'relative',
            minHeight: '100px',
        } : {}),
    }

    return (
        <div style={containerStyle}>
            {children}
        </div>
    )
}

export default ContainerRenderer
