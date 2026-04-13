import React from 'react'

const ListRenderer = ({ props, styles, isBuilder }) => {
    const items = props?.items || 'Item 1\nItem 2\nItem 3'
    const listType = props?.listType || 'ul'
    const lines = items.split('\n').filter(l => l.trim())

    const Tag = listType === 'ol' ? 'ol' : 'ul'

    return (
        <Tag style={{
            paddingLeft: '1.5em',
            listStyleType: listType === 'ol' ? 'decimal' : (props?.bulletStyle || 'disc'),
            ...styles,
        }}>
            {lines.map((line, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{line}</li>
            ))}
        </Tag>
    )
}

export default ListRenderer
