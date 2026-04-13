import React from 'react'

const MapRenderer = ({ props, styles, isBuilder }) => {
    const address = props?.address || ''
    const zoom = props?.zoom || '15'
    const height = props?.height || '400px'

    if (!address && isBuilder) {
        return (
            <div
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minHeight: '200px', border: '2px dashed #ccc', borderRadius: '8px',
                    color: '#aaa', fontSize: '13px', ...styles,
                }}
            >
                Set address in properties
            </div>
        )
    }

    if (!address) return null

    const src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom}&output=embed`

    return (
        <div style={{ width: '100%', overflow: 'hidden', borderRadius: '8px', ...styles }}>
            <iframe
                src={src}
                style={{ width: '100%', height, border: 'none', display: 'block' }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="Map"
            />
        </div>
    )
}

export default MapRenderer
