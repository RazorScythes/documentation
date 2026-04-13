import React from 'react'

const SpacerRenderer = ({ props, styles }) => {
    return (
        <div
            style={{
                height: props?.height || '40px',
                ...styles,
            }}
        />
    )
}

export default SpacerRenderer
