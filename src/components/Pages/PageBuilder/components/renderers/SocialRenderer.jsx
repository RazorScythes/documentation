import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'

library.add(fab)

const SOCIAL_ICONS = [
    { key: 'facebook', icon: 'facebook-f', color: '#1877F2' },
    { key: 'twitter', icon: 'twitter', color: '#1DA1F2' },
    { key: 'instagram', icon: 'instagram', color: '#E4405F' },
    { key: 'youtube', icon: 'youtube', color: '#FF0000' },
    { key: 'tiktok', icon: 'tiktok', color: '#000000' },
    { key: 'linkedin', icon: 'linkedin-in', color: '#0A66C2' },
    { key: 'github', icon: 'github', color: '#333' },
    { key: 'discord', icon: 'discord', color: '#5865F2' },
    { key: 'twitch', icon: 'twitch', color: '#9146FF' },
    { key: 'reddit', icon: 'reddit-alien', color: '#FF4500' },
]

const SocialRenderer = ({ props, styles, isBuilder }) => {
    const size = props?.size || '24px'
    const gap = props?.gap || '12px'
    const shape = props?.shape || 'circle'
    const style = props?.style || 'colored'
    const { textAlign, ...restStyles } = styles || {}

    const activeSocials = SOCIAL_ICONS.filter(s => props?.[s.key])

    if (!activeSocials.length && isBuilder) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px', border: '2px dashed #ccc', borderRadius: '8px',
                color: '#aaa', fontSize: '13px', ...restStyles,
            }}>
                Add social links in properties
            </div>
        )
    }

    const justify = textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap, flexWrap: 'wrap', justifyContent: justify, ...restStyles }}>
            {activeSocials.map(s => {
                const iconSize = parseInt(size)
                const padding = Math.round(iconSize * 0.35)
                const isColored = style === 'colored'
                const borderR = shape === 'circle' ? '50%' : shape === 'rounded' ? '6px' : '0'

                const el = (
                    <div
                        key={s.key}
                        style={{
                            width: `${iconSize + padding * 2}px`,
                            height: `${iconSize + padding * 2}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: borderR,
                            backgroundColor: isColored ? s.color : 'transparent',
                            color: isColored ? '#fff' : s.color,
                            transition: 'transform 0.15s, opacity 0.15s',
                            cursor: 'pointer',
                        }}
                    >
                        <FontAwesomeIcon icon={['fab', s.icon]} style={{ fontSize: size }} />
                    </div>
                )

                if (isBuilder) return el

                return (
                    <a key={s.key} href={props[s.key]} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        {el}
                    </a>
                )
            })}
        </div>
    )
}

export default SocialRenderer
