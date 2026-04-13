import React from 'react'

const VideoRenderer = ({ props, styles, isBuilder }) => {
    const src = props?.src || ''
    const autoplay = props?.autoplay || false
    const controls = props?.controls !== false
    const loop = props?.loop || false
    const { textAlign, ...restStyles } = styles || {}

    const isYoutube = src.includes('youtube.com') || src.includes('youtu.be')
    const isVimeo = src.includes('vimeo.com')

    const getEmbedUrl = () => {
        if (isYoutube) {
            const id = src.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1]
            if (!id) return ''
            const params = new URLSearchParams()
            if (autoplay) params.set('autoplay', '1')
            if (loop) params.set('loop', '1')
            if (!controls) params.set('controls', '0')
            return `https://www.youtube.com/embed/${id}?${params.toString()}`
        }
        if (isVimeo) {
            const id = src.match(/vimeo\.com\/(\d+)/)?.[1]
            if (!id) return ''
            const params = new URLSearchParams()
            if (autoplay) params.set('autoplay', '1')
            if (loop) params.set('loop', '1')
            return `https://player.vimeo.com/video/${id}?${params.toString()}`
        }
        return src
    }

    if (!src && isBuilder) {
        return (
            <div
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minHeight: '180px', border: '2px dashed #ccc', borderRadius: '8px',
                    color: '#aaa', fontSize: '13px',
                    ...restStyles,
                }}
            >
                Set video URL in properties
            </div>
        )
    }

    if (!src) return null

    if (isYoutube || isVimeo) {
        return (
            <div style={{ textAlign: textAlign || 'left' }}>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', display: 'inline-block', width: restStyles.width || '100%', ...restStyles }}>
                    <iframe
                        src={getEmbedUrl()}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        title="Video"
                    />
                </div>
            </div>
        )
    }

    return (
        <div style={{ textAlign: textAlign || 'left' }}>
            <video
                src={src}
                controls={controls}
                autoPlay={autoplay}
                loop={loop}
                style={{ maxWidth: '100%', display: 'inline-block', ...restStyles }}
            />
        </div>
    )
}

export default VideoRenderer
