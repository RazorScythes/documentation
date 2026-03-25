import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faEye, faPlus, faUser, faTimes, faCheck, faLink, faShareNodes, faCircleCheck, faCircleXmark, faImage } from "@fortawesome/free-solid-svg-icons"
import { faFacebookF, faTwitter, faInstagram, faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import { uploadHero, clearAlert } from "../../../actions/portfolio"

const Hero = ({ user, portfolio, isLight, card, inputCls, btnPrimary, btnSecondary, labelCls }) => {
    const dispatch = useDispatch()

    const [submitted, setSubmitted] = useState(false)

    const [hero, setHero] = useState({
        image: '', full_name: '', description: '',
        profession: [], animation: false, social_links: {}, resume_link: ''
    })

    const [input, setInput] = useState({
        display_image: '', hero: { image: '', full_name: '', description: '', profession: '', animation: false },
        facebook: { link: '', show: false }, twitter: { link: '', show: false }, instagram: { link: '', show: false },
        github: { link: '', show: false }, linkedin: { link: '', show: false },
    })

    useEffect(() => {
        setHero({ ...hero, full_name: portfolio?.full_name || '', description: portfolio?.description || '', profession: portfolio?.profession || [], animation: portfolio?.animation || false, resume_link: portfolio?.resume_link || '' })
        setInput({
            ...input, display_image: portfolio?.image || '',
            facebook: { link: portfolio?.social_links?.facebook?.link || '', show: portfolio?.social_links?.facebook?.show || false },
            twitter: { link: portfolio?.social_links?.twitter?.link || '', show: portfolio?.social_links?.twitter?.show || false },
            instagram: { link: portfolio?.social_links?.instagram?.link || '', show: portfolio?.social_links?.instagram?.show || false },
            github: { link: portfolio?.social_links?.github?.link || '', show: portfolio?.social_links?.github?.show || false },
            linkedin: { link: portfolio?.social_links?.linkedin?.link || '', show: portfolio?.social_links?.linkedin?.show || false },
        })
        setSubmitted(false)
    }, [portfolio])

    const addProfession = () => {
        if (!input.hero.profession || hero.profession.includes(input.hero.profession)) return
        setHero({ ...hero, profession: [...hero.profession, input.hero.profession] })
        setInput({ ...input, hero: { ...input.hero, profession: '' } })
    }

    const deleteProfession = (i) => { const arr = [...hero.profession]; arr.splice(i, 1); setHero({ ...hero, profession: arr }) }

    const convertImage = async (e) => {
        setInput({ ...input, hero: { ...input.hero, image: e.target.value } })
        if (e.target.files[0] && e.target.files[0]['type'].split('/')[0] === 'image') {
            let convert = await toBase64(e.target.files[0])
            setHero({ ...hero, image: convert })
        }
    }

    const toBase64 = file => new Promise((resolve) => {
        const reader = new FileReader(); reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image(); img.src = event.target.result
            img.onload = () => {
                const canvas = document.createElement("canvas"); let w = img.width, h = img.height
                if (w > h) { if (w > 700) { h *= 700 / w; w = 700 } } else { if (h > 1050) { w *= 1050 / h; h = 1050 } }
                if (w > 700) { h *= 700 / w; w = 700 }
                canvas.width = w; canvas.height = h; canvas.getContext("2d").drawImage(img, 0, 0, w, h)
                resolve(canvas.toDataURL(file.type, 0.7))
            }
        }
    })

    const handleSubmit = () => {
        const form = { ...hero, social_links: { facebook: input.facebook, twitter: input.twitter, instagram: input.instagram, github: input.github, linkedin: input.linkedin } }
        if (!submitted) { dispatch(uploadHero(form)); setSubmitted(true) }
        setHero({ ...hero, image: '' })
        setInput({ ...input, hero: { ...input.hero, image: '' } })
    }

    const fileInputCls = `block w-full text-sm border border-solid rounded-lg cursor-pointer ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#1a1a1a] border-[#333] text-gray-300'}`

    const socialIcons = { facebook: faFacebookF, twitter: faTwitter, instagram: faInstagram, github: faGithub, linkedin: faLinkedinIn }
    const socialColors = { facebook: 'text-[#1877F2]', twitter: 'text-[#1DA1F2]', instagram: 'text-[#E4405F]', github: isLight ? 'text-[#333]' : 'text-white', linkedin: 'text-[#0A66C2]' }

    const completionItems = [
        { label: 'Avatar', done: !!input.display_image },
        { label: 'Full Name', done: !!hero.full_name },
        { label: 'Description', done: !!hero.description },
        { label: 'Professions', done: hero.profession.length > 0 },
        { label: 'Resume', done: !!hero.resume_link },
    ]
    const filled = completionItems.filter(c => c.done).length
    const activeSocials = ['facebook', 'twitter', 'instagram', 'github', 'linkedin'].filter(s => input[s]?.link && input[s]?.show).length

    return (
        <div className="space-y-4">
            {/* Completion Summary */}
            <div className={`${card} overflow-hidden`}>
                <div className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4`}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {input.display_image ? (
                            <div className="relative flex-shrink-0 cursor-pointer" onClick={() => window.open(input.display_image, '_blank')}>
                                <img src={input.display_image} alt="Avatar" className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 ${isLight ? 'border-slate-200' : 'border-[#333]'}`} />
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${isLight ? 'bg-emerald-500 border-white' : 'bg-emerald-500 border-[#0e0e0e]'}`}>
                                    <FontAwesomeIcon icon={faCheck} className="text-[8px] text-white" />
                                </div>
                            </div>
                        ) : (
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-dashed ${isLight ? 'border-slate-300 bg-slate-50' : 'border-[#333] bg-[#1a1a1a]'}`}>
                                <FontAwesomeIcon icon={faImage} className={`text-xl ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h3 className={`text-base font-bold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>{hero.full_name || 'Your Name'}</h3>
                            {hero.profession.length > 0 && (
                                <p className={`text-xs font-medium truncate mt-0.5 ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>{hero.profession.join(' / ')}</p>
                            )}
                            <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                {filled}/{completionItems.length} fields · {activeSocials} social link{activeSocials !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:flex-nowrap">
                        {completionItems.map((c, i) => (
                            <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${c.done
                                ? (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400')
                                : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#1a1a1a] text-gray-600')
                            }`}>
                                <FontAwesomeIcon icon={c.done ? faCircleCheck : faCircleXmark} className="text-[9px]" />
                                {c.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Profile Info Card */}
            <div className={`${card} overflow-hidden`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                            <FontAwesomeIcon icon={faUser} className={`text-sm ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Profile Information</h3>
                    </div>
                </div>

                <div className={`px-4 sm:px-5 py-4 ${isLight ? 'bg-slate-50/50' : 'bg-[#111]'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className={labelCls}>Upload Avatar</label>
                            <input className={fileInputCls} type="file" accept="image/*" onChange={convertImage} value={input.hero.image} />
                        </div>
                        <div>
                            <label className={labelCls}>Full Name</label>
                            <input type="text" className={inputCls} onChange={(e) => setHero({ ...hero, full_name: e.target.value })} value={hero.full_name} placeholder="John Doe" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className={labelCls}>Resume Link</label>
                            <input type="text" className={inputCls} onChange={(e) => setHero({ ...hero, resume_link: e.target.value })} value={hero.resume_link} placeholder="https://..." />
                        </div>
                        <div>
                            <label className={labelCls}>Professions</label>
                            <div className="flex gap-2">
                                <input type="text" className={inputCls} value={input.hero.profession} onChange={(e) => setInput({ ...input, hero: { ...input.hero, profession: e.target.value } })} placeholder="e.g. Web Developer"
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProfession() } }} />
                                <button onClick={addProfession} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}`}>
                                    <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Description</label>
                            <span className={`text-[10px] font-medium ${hero.description.length > 300 ? (isLight ? 'text-amber-500' : 'text-amber-400') : (isLight ? 'text-slate-400' : 'text-gray-500')}`}>{hero.description.length} chars</span>
                        </div>
                        <textarea rows="4" className={inputCls} onChange={(e) => setHero({ ...hero, description: e.target.value })} value={hero.description} placeholder="A brief bio about yourself..." />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={hero.animation} onChange={() => setHero({ ...hero, animation: !hero.animation })} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Typing Animation</span>
                    </label>
                </div>

                {hero.profession.length > 0 && (
                    <div className={`px-4 sm:px-5 py-3 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                        <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Professions ({hero.profession.length})</p>
                        <div className="flex flex-wrap gap-2">
                            {hero.profession.map((item, i) => (
                                <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${isLight ? 'bg-blue-50 text-blue-700 border border-solid border-blue-200' : 'bg-blue-900/20 text-blue-400 border border-solid border-blue-800/50'}`}>
                                    {item}
                                    <button onClick={() => deleteProfession(i)} className="hover:text-red-500 transition-colors"><FontAwesomeIcon icon={faTimes} className="text-[9px]" /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Social Links Card */}
            <div className={`${card} overflow-hidden`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-violet-100' : 'bg-violet-900/30'}`}>
                            <FontAwesomeIcon icon={faShareNodes} className={`text-sm ${isLight ? 'text-violet-600' : 'text-violet-400'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Social Links</h3>
                    </div>
                    {activeSocials > 0 && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400'}`}>
                            {activeSocials} active
                        </span>
                    )}
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                    {['facebook', 'twitter', 'instagram', 'github', 'linkedin'].map(social => (
                        <div key={social} className={`rounded-xl p-3 sm:p-4 border border-solid transition-all ${
                            input[social].link && input[social].show
                                ? (isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-[#1a1a1a] border-[#2B2B2B]')
                                : (isLight ? 'bg-white border-slate-100' : 'bg-[#111] border-[#1a1a1a]')
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-white shadow-sm border border-slate-100' : 'bg-[#0e0e0e] border border-[#2B2B2B]'}`}>
                                    <FontAwesomeIcon icon={socialIcons[social]} className={`text-sm ${socialColors[social]}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <input type="text" className={`${inputCls} !py-1.5`} placeholder={`${social.charAt(0).toUpperCase() + social.slice(1)} profile URL`}
                                        onChange={(e) => setInput({ ...input, [social]: { ...input[social], link: e.target.value } })} value={input[social].link} />
                                </div>
                                <label className={`flex items-center gap-1.5 cursor-pointer flex-shrink-0 px-2 py-1 rounded-lg transition-all ${
                                    input[social].show
                                        ? (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400')
                                        : (isLight ? 'text-slate-400 hover:bg-slate-50' : 'text-gray-500 hover:bg-[#1f1f1f]')
                                }`}>
                                    <input type="checkbox" checked={input[social].show} onChange={() => setInput({ ...input, [social]: { ...input[social], show: !input[social].show } })}
                                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                    <span className="text-[10px] font-medium">{input[social].show ? 'Visible' : 'Hidden'}</span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button onClick={handleSubmit} disabled={submitted} className={`${btnPrimary} disabled:opacity-50 flex items-center gap-2`}>
                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                    {!submitted ? "Save Hero" : <span className="flex items-center gap-2">Saving<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
                </button>
            </div>
        </div>
    )
}

export default Hero
