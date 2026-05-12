import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCogs } from '@fortawesome/free-solid-svg-icons'

export const ModalOverlay = ({ children, onClose, className = '' }) => {
    const overlayRef = useRef(null)
    const onCloseRef = useRef(onClose)
    onCloseRef.current = onClose

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        const handleKey = (e) => { if (e.key === 'Escape') onCloseRef.current() }
        window.addEventListener('keydown', handleKey)

        const focusable = overlayRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        if (focusable?.length) focusable[0].focus()

        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleKey)
        }
    }, [])

    return createPortal(
        <div ref={overlayRef} className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${className}`} onClick={onClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            {children}
        </div>,
        document.body
    )
}

export const AnimateIn = ({ children, delay = 0, className = '' }) => {
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay)
        return () => clearTimeout(t)
    }, [delay])
    return (
        <div className={`transition-all duration-500 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} ${className}`}>
            {children}
        </div>
    )
}

export const SafeIcon = ({ name, cls, style }) => {
    if (!name || name === 'peso-sign') return <span className={cls} style={style}>₱</span>
    try { return <FontAwesomeIcon icon={['fas', name]} className={cls} style={style} /> }
    catch { return <FontAwesomeIcon icon={faCogs} className={`${cls} opacity-20`} style={style} /> }
}
