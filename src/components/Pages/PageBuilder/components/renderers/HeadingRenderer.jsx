import React from 'react'

const HeadingRenderer = ({ props, styles }) => {
    const Tag = props?.tag || 'h2'
    return <Tag style={{ margin: 0, ...styles }}>{props?.text || 'Heading'}</Tag>
}

export default HeadingRenderer
