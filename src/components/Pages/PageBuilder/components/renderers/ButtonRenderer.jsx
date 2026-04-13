import React from 'react'

const ButtonRenderer = ({ props, styles, isBuilder }) => {
    const { textAlign, ...btnStyles } = styles || {}

    const handleClick = (e) => {
        if (isBuilder) {
            e.preventDefault()
            e.stopPropagation()
            return
        }
        if (props?.url) {
            if (props?.openInNewTab) {
                window.open(props.url, '_blank', 'noopener,noreferrer')
            } else {
                window.location.href = props.url
            }
        }
    }

    return (
        <div style={{ textAlign: textAlign || 'left' }}>
            <button
                onClick={handleClick}
                style={{
                    cursor: isBuilder ? 'default' : 'pointer',
                    border: 'none',
                    display: 'inline-block',
                    ...btnStyles,
                }}
            >
                {props?.text || 'Button'}
            </button>
        </div>
    )
}

export default ButtonRenderer
