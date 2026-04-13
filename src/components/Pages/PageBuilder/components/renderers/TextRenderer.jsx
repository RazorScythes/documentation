import React from 'react'

const TextRenderer = ({ props, styles }) => {
    return (
        <div
            style={{ whiteSpace: 'pre-wrap', ...styles }}
            dangerouslySetInnerHTML={{ __html: props?.text || 'Text block. Click to edit.' }}
        />
    )
}

export default TextRenderer
