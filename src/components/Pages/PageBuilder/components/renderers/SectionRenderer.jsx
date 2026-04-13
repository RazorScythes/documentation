import React from 'react'

const SectionRenderer = ({ props, styles, children, isBuilder, rowIndex }) => {
    const { display, gridTemplateColumns, gap, ...restStyles } = styles || {}

    const isGrid = display === 'grid' || props?._colTemplate
    const colTemplate = gridTemplateColumns || props?._colTemplate || undefined

    const sectionStyle = {
        ...restStyles,
        ...(isGrid ? {
            display: 'grid',
            gridTemplateColumns: colTemplate,
            gap: gap || '16px',
        } : {
            display: 'flex',
            flexDirection: 'column',
            gap: gap || '12px',
        }),
        ...(isBuilder ? {
            border: '2px dashed',
            borderColor: 'rgba(100, 116, 139, 0.35)',
            borderRadius: '10px',
            position: 'relative',
            minHeight: '80px',
        } : {}),
    }

    if (isBuilder) {
        return (
            <div style={{ position: 'relative', paddingTop: rowIndex !== undefined ? '18px' : undefined }}>
                {rowIndex !== undefined && (
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        left: '12px',
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        color: 'rgba(100, 116, 139, 0.6)',
                        textTransform: 'uppercase',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        padding: '0 4px',
                    }}>
                        ROW {rowIndex + 1}
                    </span>
                )}
                <section style={sectionStyle}>
                    {children}
                </section>
            </div>
        )
    }

    return (
        <section style={sectionStyle}>
            {children}
        </section>
    )
}

export default SectionRenderer
