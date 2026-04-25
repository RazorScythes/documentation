import React, { useState } from 'react'
import { dark, light } from '../../style';
import { faClose, faSpinner, faGlobe, faPlay, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faGoogle as faGoogleBrand } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MotionAnimate } from 'react-motion-animate';
import { getLinkId } from '../Tools';
import axios from 'axios';

const VideoModalRequest = ({ theme, openModal, setOpenModal, title, importedData }) => {
    const [error, setError] = useState('')
    const [source, setSource] = useState('drive')
    const [link, setLink] = useState('')
    const [loading, setLoading] = useState(false)

    const isLight = theme === 'light'

    const closeModal = () => {
        setOpenModal(false)
        setError('')
        setLink('')
        setLoading(false)
    }

    const sources = [
        { id: 'drive', label: 'Google Drive', icon: faGoogleBrand, color: 'text-blue-500', placeholder: 'https://drive.google.com/file/d/...' },
        { id: 'direct', label: 'Direct URL', icon: faGlobe, color: 'text-emerald-500', placeholder: 'https://example.com/video.mp4' },
        { id: 'embed', label: 'Embed / Iframe', icon: faPlay, color: 'text-rose-500', placeholder: 'https://www.youtube.com/watch?v=... or embed URL' },
    ]

    const activeSource = sources.find(s => s.id === source)

    const getVideoDuration = (url) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.onloadedmetadata = () => resolve(video.duration);
            video.onerror = reject;
            video.src = url;
        });
    };

    const driveRequest = async (videoLink) => {
        try {
            const url = `https://www.googleapis.com/drive/v2/files/${getLinkId(videoLink)}?key=${import.meta.env.VITE_DRIVE_API_KEY}`;
            const response = await axios.get(url);
            const data = response.data;
            const duration = await getVideoDuration(data.downloadUrl);

            return {
                title: data.title,
                link: data.downloadUrl,
                alternateLink: data.alternateLink,
                downloadUrl: data.downloadUrl,
                embedLink: data.embedLink,
                fileExtension: data.fileExtension,
                fileSize: data.fileSize,
                thumbnail: {
                    preview: `https://drive.google.com/thumbnail?id=${getLinkId(videoLink)}&sz=w220`,
                    save: `https://drive.google.com/thumbnail?id=${getLinkId(videoLink)}&sz=w220`,
                },
                webContentLink: data.webContentLink,
                duration: duration * 1000,
                ownerNames: data.ownerNames
            }
        } catch (err) {
            console.log(err)
            return null
        }
    }

    const extractYouTubeId = (url) => {
        const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const match = url.match(regExp)
        return match ? match[1] : null
    }

    const handleDirectUrl = (videoLink) => {
        return { link: videoLink }
    }

    const handleEmbed = (videoLink) => {
        const ytId = extractYouTubeId(videoLink)
        if (ytId) {
            return {
                link: `https://www.youtube.com/embed/${ytId}`,
                thumbnail: {
                    preview: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
                    save: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
                },
            }
        }

        const vimeoMatch = videoLink.match(/vimeo\.com\/(?:video\/)?(\d+)/)
        if (vimeoMatch) {
            return { link: `https://player.vimeo.com/video/${vimeoMatch[1]}` }
        }

        return { link: videoLink }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!link.trim()) { setError('Please enter a URL'); return }

        setLoading(true)
        setError('')

        let result = null

        if (source === 'drive') {
            result = await driveRequest(link)
            if (!result) { setError('Failed to fetch from Google Drive. Check the URL and sharing settings.'); setLoading(false); return }
        } else if (source === 'direct') {
            result = handleDirectUrl(link)
        } else if (source === 'embed') {
            result = handleEmbed(link)
        }

        if (result) {
            importedData(result)
            closeModal()
        }

        setLoading(false)
    };

    return (
        <>
            {openModal && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" onClick={closeModal} />}
            {openModal && (
                <div className="flex items-center justify-center w-full fixed inset-0 z-[100]">
                    <MotionAnimate variant={{
                        hidden: { opacity: 0, transform: 'scale(0.95) translateY(10px)' },
                        show: { opacity: 1, transform: 'scale(1) translateY(0)', transition: { duration: 0.2 } }
                    }}>
                        <div className={`sm:w-auto sm:min-w-[520px] w-full rounded-xl shadow-2xl relative flex flex-col overflow-hidden ${
                            isLight ? 'bg-white border border-slate-200' : 'bg-[#161616] border border-[#2B2B2B]'
                        }`}>
                            {/* Header */}
                            <div className={`flex items-center justify-between px-6 py-4 border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                                <div>
                                    <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-gray-100'}`}>Import Video</h3>
                                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Choose a source and paste the video link</p>
                                </div>
                                <button
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#2B2B2B]'}`}
                                    onClick={closeModal}
                                >
                                    <FontAwesomeIcon icon={faClose} className="text-sm" />
                                </button>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Source Tabs */}
                                <div>
                                    <label className={`text-[10px] font-semibold uppercase tracking-widest mb-2.5 block ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Source</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {sources.map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => { setSource(s.id); setError('') }}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                                                    source === s.id
                                                        ? (isLight ? 'border-blue-500 bg-blue-50/50' : 'border-blue-500 bg-blue-900/10')
                                                        : (isLight ? 'border-slate-200 hover:border-slate-300' : 'border-[#333] hover:border-[#444]')
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={s.icon} className={`text-base ${source === s.id ? s.color : (isLight ? 'text-slate-400' : 'text-gray-500')}`} />
                                                <span className={`text-[11px] font-medium ${source === s.id ? (isLight ? 'text-slate-700' : 'text-gray-200') : (isLight ? 'text-slate-400' : 'text-gray-500')}`}>{s.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* URL Input */}
                                <div>
                                    <label className={`text-[10px] font-semibold uppercase tracking-widest mb-2 block ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Video URL</label>
                                    <input
                                        type="text"
                                        value={link}
                                        onChange={(e) => { setLink(e.target.value); setError('') }}
                                        placeholder={activeSource?.placeholder}
                                        className={`w-full px-4 py-3 text-sm rounded-lg border transition-all outline-none ${
                                            isLight
                                                ? 'bg-white border-slate-200 text-slate-700 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                                                : 'bg-[#1A1A1A] border-[#333] text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/30'
                                        }`}
                                    />
                                    {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
                                </div>

                                {/* Hints */}
                                {source === 'drive' && (
                                    <div className={`text-[11px] p-3 rounded-lg ${isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-900/10 text-amber-400'}`}>
                                        Make sure the file is shared as "Anyone with the link can view"
                                    </div>
                                )}
                                {source === 'embed' && (
                                    <div className={`text-[11px] p-3 rounded-lg ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/10 text-blue-400'}`}>
                                        Supports YouTube, Vimeo, and any embeddable video URL
                                    </div>
                                )}

                                {/* Submit */}
                                <div className="flex justify-end gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className={`px-4 py-2.5 text-xs font-medium rounded-lg transition-all ${
                                            isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#2B2B2B]'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !link.trim()}
                                        className={`px-5 py-2.5 text-xs font-medium rounded-lg flex items-center gap-2 transition-all ${
                                            loading || !link.trim()
                                                ? 'bg-blue-400/50 text-white/70 cursor-not-allowed'
                                                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                                        }`}
                                    >
                                        {loading ? (
                                            <><FontAwesomeIcon icon={faSpinner} className="animate-spin text-[10px]" /> Importing...</>
                                        ) : (
                                            <><span>Import</span> <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </MotionAnimate>
                </div>
            )}
        </>
    )
}

export default VideoModalRequest
