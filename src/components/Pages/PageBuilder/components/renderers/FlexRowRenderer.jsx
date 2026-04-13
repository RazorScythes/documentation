import React from 'react'

const FlexRowRenderer = ({ props, styles, children, isBuilder }) => {
    const direction = props?.direction || 'row'
    const justify = props?.justify || 'flex-start'
    const align = props?.align || 'stretch'
    const wrap = props?.wrap || 'wrap'
    const gap = props?.gap || '16px'

    const { display, flexDirection, justifyContent, alignItems, flexWrap, ...restStyles } = styles || {}

    const flexStyle = {
        ...restStyles,
        display: 'flex',
        flexDirection: direction,
        justifyContent: justify,
        alignItems: align,
        flexWrap: wrap,
        gap,
        ...(isBuilder ? {
            border: '1.5px dashed rgba(100, 116, 139, 0.4)',
            minHeight: '50px',
        } : {}),
    }

    return (
        <div style={flexStyle}>
            {children}
        </div>
    )
}

export default FlexRowRenderer
