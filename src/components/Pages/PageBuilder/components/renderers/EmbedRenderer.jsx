import React from 'react'

const EmbedRenderer = ({ props, styles, isBuilder }) => {
    const src = props?.src || ''
    const height = props?.height || '400px'

    if (!src && isBuilder) {
        return (
            <div
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minHeight: '200px', border: '2px dashed #ccc', borderRadius: '8px',
                    color: '#aaa', fontSize: '13px', ...styles,
                }}
            >
                Set embed URL in properties
            </div>
        )
    }

    if (!src) return null

    return (
        <div style={{ width: '100%', overflow: 'hidden', ...styles }}>
            <iframe
                src={src}
                style={{ width: '100%', height, border: 'none', display: 'block' }}
                loading="lazy"
                allowFullScreen
                title="Embed"
                sandbox="allow-scripts allow-same-origin allow-popups"
            />
        </div>
    )
}

export default EmbedRenderer
