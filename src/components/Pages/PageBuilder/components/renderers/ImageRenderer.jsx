import React from 'react'

const ImageRenderer = ({ props, styles, isBuilder }) => {
    const src = props?.src || ''
    const alt = props?.alt || ''

    const { textAlign, ...imgStyles } = styles || {}

    if (!src && isBuilder) {
        return (
            <div
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minHeight: '120px', border: '2px dashed #ccc', borderRadius: '8px',
                    color: '#aaa', fontSize: '13px',
                    textAlign,
                    ...imgStyles,
                }}
            >
                Set image URL in properties
            </div>
        )
    }

    if (!src) return null

    return (
        <div style={{ textAlign: textAlign || 'left' }}>
            <img
                src={src}
                alt={alt}
                style={{ display: 'inline-block', maxWidth: '100%', ...imgStyles }}
            />
        </div>
    )
}

export default ImageRenderer
