import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

library.add(fas, fab)

const IconRenderer = ({ props, styles, isBuilder }) => {
    const iconName = props?.icon || 'star'
    const prefix = props?.prefix || 'fas'
    const size = props?.size || '32px'
    const color = props?.color || 'currentColor'
    const link = props?.link || ''
    const { textAlign, ...restStyles } = styles || {}

    const iconEl = (
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...restStyles }}>
            <FontAwesomeIcon
                icon={[prefix, iconName]}
                style={{ fontSize: size, color }}
            />
        </div>
    )

    const wrapped = (
        <div style={{ textAlign: textAlign || 'left' }}>
            {iconEl}
        </div>
    )

    if (link && !isBuilder) {
        return (
            <div style={{ textAlign: textAlign || 'left' }}>
                <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    {iconEl}
                </a>
            </div>
        )
    }

    return wrapped
}

export default IconRenderer
