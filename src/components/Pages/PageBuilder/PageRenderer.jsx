import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPageBySlug, clearCurrentPage } from '../../../actions/pageBuilder'
import { componentRegistry } from './componentRegistry'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import styles from '../../../style'
import { main, dark, light } from '../../../style'

const getViewportKey = (width) => {
    if (width <= 480) return 'mobile'
    if (width <= 768) return 'tablet'
    return 'desktop'
}

const RenderNode = ({ node, viewportKey }) => {
    const reg = componentRegistry[node.type]
    if (!reg) return null

    const Renderer = reg.render
    const mergedStyles = {
        ...node.styles?.desktop,
        ...(viewportKey === 'tablet' ? node.styles?.tablet : {}),
        ...(viewportKey === 'mobile' ? node.styles?.mobile : {}),
    }

    return (
        <Renderer props={node.props || {}} styles={mergedStyles} isBuilder={false}>
            {node.children?.map(child => (
                <RenderNode key={child.id} node={child} viewportKey={viewportKey} />
            ))}
        </Renderer>
    )
}

const PageRenderer = ({ theme }) => {
    const { slug } = useParams()
    const dispatch = useDispatch()
    const currentPage = useSelector(s => s.pageBuilder.currentPage)
    const isLoading = useSelector(s => s.pageBuilder.isLoading)
    const alert = useSelector(s => s.pageBuilder.alert)
    const isLight = theme === 'light'

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

    useEffect(() => {
        const handler = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [])

    const viewportKey = useMemo(() => getViewportKey(windowWidth), [windowWidth])

    useEffect(() => {
        if (slug) dispatch(fetchPageBySlug(slug))
        return () => { dispatch(clearCurrentPage()) }
    }, [slug])

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isLight ? 'bg-white' : 'bg-[#0a0a0a]'}`}>
                <FontAwesomeIcon icon={faSpinner} className={`text-3xl animate-spin ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
            </div>
        )
    }

    if (!currentPage || alert?.variant === 'danger') {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center gap-3 ${isLight ? 'bg-white text-slate-400' : 'bg-[#0a0a0a] text-gray-500'}`}>
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl" />
                <p className="text-sm font-medium">Page not found</p>
                <p className="text-xs">The page you're looking for doesn't exist or hasn't been published yet.</p>
            </div>
        )
    }

    return (
        <div
            className={`min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}
            style={{ color: isLight ? '#1a1a1a' : '#e5e7eb' }}
        >
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="relative my-6 sm:my-10" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {currentPage.layout?.map(node => (
                            <RenderNode key={node.id} node={node} viewportKey={viewportKey} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PageRenderer
