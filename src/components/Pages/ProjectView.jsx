import React, { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCalendarAlt, faTag, faUser, faCode, faImages, faLock, faGlobe, faChevronLeft, faChevronRight, faTimes, faSearchPlus } from '@fortawesome/free-solid-svg-icons'
import { getProject } from '../../actions/portfolio'
import { convertDriveImageLink } from '../Tools'
import { main, dark, light } from '../../style'
import styles from '../../style'

const ImageLightbox = ({ images, currentIndex, onClose, onPrev, onNext, isLight }) => {
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') onPrev()
            if (e.key === 'ArrowRight') onNext()
        }
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKey)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleKey)
        }
    }, [onClose, onPrev, onNext])

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

            <button onClick={onClose}
                className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
                <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 text-white/50 text-xs font-medium">
                {currentIndex + 1} / {images.length}
            </div>

            {images.length > 1 && (
                <>
                    <button onClick={(e) => { e.stopPropagation(); onPrev() }}
                        className="absolute left-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
                        <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onNext() }}
                        className="absolute right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
                        <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                    </button>
                </>
            )}

            <div className="relative z-10 max-w-5xl max-h-[85vh] px-4" onClick={(e) => e.stopPropagation()}>
                <img src={convertDriveImageLink(images[currentIndex])} alt={`Gallery ${currentIndex + 1}`}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl mx-auto" />
            </div>
        </div>
    )
}

const ProjectView = ({ theme }) => {
    const { username, project_name } = useParams()
    const dispatch = useDispatch()

    const project = useSelector((state) => state.portfolio.project)
    const notFound = useSelector((state) => state.portfolio.notFound)
    const published = useSelector((state) => state.portfolio.published)
    const isLight = theme === 'light'
    const [lightboxIndex, setLightboxIndex] = useState(-1)

    const galleryImages = project?.gallery?.filter(Boolean) || []
    const textImages = project?.text?.filter(t => t.text_imageURL).map(t => t.text_imageURL) || []
    const allViewableImages = [...textImages, ...galleryImages]

    const openLightbox = (i) => setLightboxIndex(i)
    const closeLightbox = () => setLightboxIndex(-1)
    const prevImage = useCallback(() => setLightboxIndex((prev) => (prev - 1 + allViewableImages.length) % allViewableImages.length), [allViewableImages.length])
    const nextImage = useCallback(() => setLightboxIndex((prev) => (prev + 1) % allViewableImages.length), [allViewableImages.length])

    useEffect(() => {
        if (username && project_name) {
            dispatch(getProject({ username, project_name }))
        }
    }, [dispatch, username, project_name])

    if (notFound) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className="text-center px-6">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
                        <FontAwesomeIcon icon={faCode} className={`text-3xl ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                    </div>
                    <h1 className={`text-5xl font-extrabold mb-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>404</h1>
                    <p className={`text-base mb-6 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>This project does not exist.</p>
                    <Link to={`/${username}/portfolio`} className={`inline-flex items-center gap-2 text-sm font-semibold ${isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'}`}>
                        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back to portfolio
                    </Link>
                </div>
            </div>
        )
    }

    if (published) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className="text-center px-6">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
                        <FontAwesomeIcon icon={faLock} className={`text-3xl ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                    </div>
                    <h1 className={`text-2xl font-extrabold mb-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>Portfolio Unavailable</h1>
                    <p className={`text-base ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>This portfolio is currently unpublished.</p>
                </div>
            </div>
        )
    }

    if (!project || !project.project_name) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className="flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin ${isLight ? 'border-blue-500' : 'border-white'}`} />
                    <p className={`text-xs font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Loading project...</p>
                </div>
            </div>
        )
    }

    const hasGallery = project.gallery?.filter(Boolean).length > 0
    const hasText = project.text?.length > 0

    const openInViewer = (imgUrl) => {
        const idx = allViewableImages.indexOf(imgUrl)
        if (idx >= 0) setLightboxIndex(idx)
    }

    return (
        <div className={`min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>

                    {/* Back link */}
                    <div className="pt-8 sm:pt-12">
                        <Link to={`/${username}/portfolio`}
                            className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${isLight ? 'text-slate-400 hover:text-blue-600' : 'text-gray-500 hover:text-blue-400'}`}>
                            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back to portfolio
                        </Link>
                    </div>

                    {/* Hero image */}
                    {project.image && project.show_image !== false && (
                        <div className={`mt-8 rounded-2xl overflow-hidden ${isLight ? 'ring-1 ring-slate-100' : 'ring-1 ring-white/[.06]'}`}>
                            <img src={convertDriveImageLink(project.image)} alt={project.project_name} className="w-full h-auto max-h-[500px] object-cover" />
                        </div>
                    )}

                    {/* Project header */}
                    <div className="py-10 sm:py-14">
                        <div className="flex flex-wrap items-center gap-2 mb-5">
                            {project.category && (
                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'}`}>
                                    <FontAwesomeIcon icon={faTag} className="text-[8px]" /> {project.category}
                                </span>
                            )}
                            {(project.date_started || project.date_accomplished) && (
                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-[9px]" />
                                    {project.date_started?.split('-')[0]}{project.date_accomplished ? ` – ${project.date_accomplished.split('-')[0]}` : ''}
                                </span>
                            )}
                            {project.created_for && (
                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                    <FontAwesomeIcon icon={faUser} className="text-[9px]" /> for {project.created_for}
                                </span>
                            )}
                        </div>

                        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {project.project_name}
                        </h1>

                        {project.project_description && (
                            <p className={`text-base sm:text-lg leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                {project.project_description}
                            </p>
                        )}
                    </div>

                    {/* Text sections */}
                    {hasText && (
                        <div className="space-y-12 pb-12">
                            {project.text.map((t, i) => (
                                <div key={i}>
                                    {t.text_heading && (
                                        <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight mb-4 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                            {t.text_heading}
                                        </h2>
                                    )}
                                    {t.text_imageURL && (
                                        <button onClick={() => openInViewer(t.text_imageURL)}
                                            className={`group relative inline-block rounded-xl overflow-hidden mb-5 text-left ${isLight ? 'ring-1 ring-slate-100 hover:shadow-lg' : 'ring-1 ring-white/[.06] hover:ring-white/15'} transition-all`}>
                                            <img src={convertDriveImageLink(t.text_imageURL)} alt={t.text_heading || ''} className="h-auto object-contain" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                                <FontAwesomeIcon icon={faSearchPlus} className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                        </button>
                                    )}
                                    {t.text_description && (
                                        <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                            {t.text_description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Gallery */}
                    {hasGallery && (
                        <div className="pb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <FontAwesomeIcon icon={faImages} className={`text-sm ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                                <h2 className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Gallery</h2>
                                <div className={`flex-1 h-px ${isLight ? 'bg-slate-100' : 'bg-white/5'}`} />
                                <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>{galleryImages.length}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {galleryImages.map((img, i) => (
                                    <button key={i} onClick={() => openLightbox(textImages.length + i)}
                                        className={`group relative rounded-xl overflow-hidden aspect-video transition-all hover:-translate-y-0.5 text-left ${isLight ? 'ring-1 ring-slate-100 hover:shadow-lg' : 'ring-1 ring-white/[.06] hover:ring-white/15'}`}>
                                        <img src={convertDriveImageLink(img)} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faSearchPlus} className="text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {lightboxIndex >= 0 && (
                        <ImageLightbox
                            images={allViewableImages}
                            currentIndex={lightboxIndex}
                            onClose={closeLightbox}
                            onPrev={prevImage}
                            onNext={nextImage}
                            isLight={isLight}
                        />
                    )}

                    {/* List data */}
                    {project.list?.length > 0 && (
                        <div className="pb-12">
                            <div className={`rounded-2xl overflow-hidden ${isLight ? 'bg-white ring-1 ring-slate-100' : 'bg-white/[.03] ring-1 ring-white/[.06]'}`}>
                                {project.list.map((item, i) => (
                                    <div key={i} className={`px-6 py-4 text-sm ${isLight ? 'text-slate-600' : 'text-gray-300'} ${i > 0 ? `border-t border-solid ${isLight ? 'border-slate-100' : 'border-white/[.04]'}` : ''}`}>
                                        {typeof item === 'string' ? item : JSON.stringify(item)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer nav */}
                    <div className={`py-10 border-t border-solid ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                        <Link to={`/${username}/portfolio`}
                            className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'}`}>
                            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> All Projects
                        </Link>
                    </div>

                    <div className="h-10" />
                </div>
            </div>
        </div>
    )
}

export default ProjectView
