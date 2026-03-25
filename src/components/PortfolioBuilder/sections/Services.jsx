import React, { useState, useEffect, useRef, useMemo } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faPlus, faCogs, faTimes, faCheck, faChevronRight, faPen, faCircleCheck, faCircleXmark, faInfoCircle, faLayerGroup, faSearch, faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { uploadServices, clearAlert } from "../../../actions/portfolio"
import { useDispatch, useSelector } from 'react-redux'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

library.add(fas, far, fab)

const ICON_LIST = [
    'code','laptop-code','terminal','database','server','cloud','cog','cogs','sitemap','project-diagram',
    'network-wired','microchip','robot','memory','hdd','wifi','signal','satellite-dish','ethernet','plug',
    'paint-brush','palette','pen','pen-nib','pencil-alt','vector-square','drafting-compass','bezier-curve','crop','eye-dropper',
    'swatchbook','fill-drip','object-group','object-ungroup','layer-group','ruler-combined','shapes','draw-polygon','highlighter','marker',
    'briefcase','chart-bar','chart-line','chart-pie','chart-area','handshake','users','user-tie','building','landmark',
    'coins','dollar-sign','money-bill-wave','credit-card','receipt','file-invoice-dollar','piggy-bank','wallet','calculator','cash-register',
    'envelope','phone','phone-alt','comments','comment-dots','paper-plane','inbox','mail-bulk','satellite','broadcast-tower',
    'share-alt','hashtag','at','rss','podcast','bullhorn','megaphone','bell','comment-alt','sms',
    'camera','video','music','microphone','headphones','play-circle','film','photo-video','image','images',
    'volume-up','compact-disc','record-vinyl','guitar','drum','sliders-h','stream','tv','desktop','tablet-alt',
    'star','heart','bolt','rocket','globe','shield-alt','lock','unlock','key','fingerprint',
    'fire','gem','crown','trophy','medal','award','certificate','ribbon','flag','bookmark',
    'home','store','warehouse','industry','city','hospital','hotel','school','university','church',
    'shopping-cart','shopping-bag','store-alt','box','boxes','truck','shipping-fast','dolly','pallet','barcode',
    'search','search-plus','filter','sort','list','th','th-large','table','columns','tasks',
    'check','check-circle','check-double','clipboard-check','spell-check','user-check','calendar-check','toggle-on','power-off','sync',
    'tools','wrench','hammer','screwdriver','toolbox','tape','paint-roller','hard-hat','trowel','compass',
    'lightbulb','magic','wand-magic-sparkles','hat-wizard','brain','puzzle-piece','atom','dna','microscope','flask',
    'book','book-open','graduation-cap','chalkboard-teacher','apple-alt','pen-fancy','quill','feather','newspaper','blog',
    'map','map-marker-alt','location-arrow','compass','route','road','directions','plane','car','bus',
    'mobile-alt','laptop','keyboard','mouse','print','fax','scanner','usb','sd-card','sim-card',
    'shield-virus','hand-holding-heart','hands-helping','people-carry','life-ring','first-aid','medkit','stethoscope','heartbeat','procedures',
    'chart-network','diagram-project','arrow-right','arrow-left','arrows-alt','expand','compress','exchange-alt','random','redo',
    'clock','hourglass','stopwatch','calendar','calendar-alt','calendar-day','calendar-week','history','tachometer-alt','gauge',
    'link','unlink','external-link-alt','paperclip','thumbtack','map-pin','crosshairs','bullseye','target','adjust'
]

const IconPicker = ({ value, onChange, isLight, inputCls }) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const filtered = useMemo(() => {
        if (!search) return ICON_LIST
        const q = search.toLowerCase()
        return ICON_LIST.filter(n => n.includes(q))
    }, [search])

    const SafeIcon = ({ name, cls }) => {
        try { return <FontAwesomeIcon icon={['fas', name]} className={cls} /> }
        catch { return <FontAwesomeIcon icon={faCogs} className={`${cls} opacity-20`} /> }
    }

    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => { setOpen(!open); setSearch('') }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all cursor-pointer ${isLight
                    ? `bg-white border-slate-200 text-slate-800 ${open ? 'border-blue-400 ring-1 ring-blue-100' : 'hover:border-slate-300'}`
                    : `bg-[#1a1a1a] border-[#333] text-gray-200 ${open ? 'border-blue-500 ring-1 ring-blue-900/30' : 'hover:border-[#444]'}`
                }`}>
                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-blue-50' : 'bg-blue-900/20'}`}>
                    <SafeIcon name={value} cls={`text-sm ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                </div>
                <span className="flex-1 text-left text-xs font-medium truncate">{value || 'Select icon...'}</span>
                <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''} ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
            </button>

            {open && (
                <div className={`absolute z-50 mt-1.5 left-0 right-0 rounded-xl border border-solid shadow-xl overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}
                    style={{ width: 'min(360px, calc(100vw - 2rem))' }}>
                    <div className={`px-3 py-2.5 border-b border-solid ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#1f1f1f] bg-[#111]'}`}>
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus
                                placeholder="Search icons..." className={`w-full pl-7 pr-3 py-1.5 rounded-lg text-xs border border-solid outline-none ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-700' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`} />
                        </div>
                        <p className={`text-[10px] mt-1.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{filtered.length} icon{filtered.length !== 1 ? 's' : ''} found</p>
                    </div>
                    <div className="overflow-y-auto max-h-52 p-2">
                        {filtered.length > 0 ? (
                            <div className="grid grid-cols-8 gap-1">
                                {filtered.map(name => (
                                    <button key={name} type="button" title={name}
                                        onClick={() => { onChange(name); setOpen(false) }}
                                        className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                                            value === name
                                                ? (isLight ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-600 text-white')
                                                : (isLight ? 'text-slate-500 hover:bg-blue-50 hover:text-blue-600' : 'text-gray-400 hover:bg-blue-900/20 hover:text-blue-400')
                                        }`}>
                                        <SafeIcon name={name} cls="text-sm" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className={`text-center py-6 text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No icons match "{search}"</p>
                        )}
                    </div>
                    {value && (
                        <div className={`px-3 py-2 border-t border-solid flex items-center justify-between ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#1f1f1f] bg-[#111]'}`}>
                            <div className="flex items-center gap-2">
                                <SafeIcon name={value} cls={`text-xs ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                                <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{value}</span>
                            </div>
                            <span className={`text-[10px] ${isLight ? 'text-emerald-500' : 'text-emerald-400'}`}>Selected</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const Services = ({ user, portfolio, isLight, card, inputCls, btnPrimary, btnSecondary, labelCls }) => {
    const dispatch = useDispatch()

    const [submitted, setSubmitted] = useState(false)
    const [services, setServices] = useState([])
    const [input, setInput] = useState({ service_name: '', featured_icon: 'star', service_name_type: '', service_description: '' })
    const [activeService, setActiveService] = useState(0)
    const [showCategoryForm, setShowCategoryForm] = useState(false)
    const [showTypeForm, setShowTypeForm] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [editCategoryName, setEditCategoryName] = useState('')
    const [editingType, setEditingType] = useState(null)
    const [editType, setEditType] = useState({ service_name: '', featured_icon: '', service_description: '' })

    useEffect(() => {
        setSubmitted(false); setServices(portfolio ? portfolio : [])
        setEditingCategory(null); setEditingType(null)
    }, [portfolio])

    const addService = () => {
        if (!input.service_name || services.some(s => s.service_name === input.service_name)) return
        setServices([...services, { service_name: input.service_name, type_of_service: [] }])
        setInput({ ...input, service_name: '' })
        setShowCategoryForm(false)
    }

    const deleteService = (i) => {
        const arr = services.filter((_, idx) => idx !== i)
        setServices(arr)
        if (activeService >= arr.length) setActiveService(Math.max(0, arr.length - 1))
        if (editingCategory === i) setEditingCategory(null)
    }

    const startEditCategory = (i, e) => {
        e.stopPropagation()
        setEditingCategory(i)
        setEditCategoryName(services[i].service_name)
    }

    const saveEditCategory = () => {
        if (!editCategoryName) return
        const arr = [...services]
        arr[editingCategory] = { ...arr[editingCategory], service_name: editCategoryName }
        setServices(arr)
        setEditingCategory(null)
    }

    const addTypeOfService = () => {
        if (!input.service_name_type || services.length === 0) return
        const arr = [...services]
        arr[activeService] = { ...arr[activeService], type_of_service: [...arr[activeService].type_of_service, { featured_icon: input.featured_icon, service_name: input.service_name_type, service_description: input.service_description }] }
        setServices(arr)
        setInput({ ...input, service_name_type: '', service_description: '' })
        setShowTypeForm(false)
    }

    const deleteTypeOfService = (sIdx, tIdx) => {
        const arr = services.map((s, i) => i === sIdx
            ? { ...s, type_of_service: s.type_of_service.filter((_, j) => j !== tIdx) }
            : s
        )
        setServices(arr)
        if (editingType?.sIdx === sIdx && editingType?.tIdx === tIdx) setEditingType(null)
    }

    const startEditType = (sIdx, tIdx) => {
        const t = services[sIdx].type_of_service[tIdx]
        setEditingType({ sIdx, tIdx })
        setEditType({ service_name: t.service_name, featured_icon: t.featured_icon, service_description: t.service_description })
        setShowTypeForm(false)
    }

    const saveEditType = () => {
        if (!editType.service_name) return
        const arr = services.map((s, i) => i === editingType.sIdx
            ? { ...s, type_of_service: s.type_of_service.map((t, j) => j === editingType.tIdx ? { ...editType } : t) }
            : s
        )
        setServices(arr)
        setEditingType(null)
    }

    const cancelEditType = () => { setEditingType(null) }

    const handleSubmit = async () => {
        if (submitted) return
        setSubmitted(true)
        try {
            await dispatch(uploadServices({ services })).unwrap()
        } catch {
            setSubmitted(false)
        }
    }

    const totalTypes = services.reduce((sum, s) => sum + s.type_of_service.length, 0)
    const emptyCats = services.filter(s => s.type_of_service.length === 0)

    const SafeIcon = ({ name, cls }) => {
        try { return <FontAwesomeIcon icon={['fas', name]} className={cls} /> }
        catch { return <FontAwesomeIcon icon={faCogs} className={`${cls} opacity-20`} /> }
    }

    return (
        <div className="space-y-4">
            {/* Services Summary Card */}
            <div className={`${card} overflow-hidden`}>
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            services.length > 0 ? (isLight ? 'bg-violet-100' : 'bg-violet-900/30') : (isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]')
                        }`}>
                            <FontAwesomeIcon icon={faCogs} className={`text-2xl ${
                                services.length > 0 ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-slate-300' : 'text-gray-600')
                            }`} />
                        </div>
                        <div className="min-w-0">
                            <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                {services.length > 0 ? `${services.length} Categor${services.length === 1 ? 'y' : 'ies'}` : 'No Services Yet'}
                            </h3>
                            <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                {totalTypes} service type{totalTypes !== 1 ? 's' : ''} total
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:flex-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${
                            services.length > 0 ? (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400') : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#1a1a1a] text-gray-600')
                        }`}>
                            <FontAwesomeIcon icon={services.length > 0 ? faCircleCheck : faCircleXmark} className="text-[9px]" /> Categories
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${
                            totalTypes > 0 ? (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400') : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#1a1a1a] text-gray-600')
                        }`}>
                            <FontAwesomeIcon icon={totalTypes > 0 ? faCircleCheck : faCircleXmark} className="text-[9px]" /> Services
                        </span>
                        {emptyCats.length > 0 && services.length > 0 && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-900/20 text-amber-400'}`}>
                                <FontAwesomeIcon icon={faInfoCircle} className="text-[9px]" /> {emptyCats.length} empty
                            </span>
                        )}
                    </div>
                </div>
                {services.length > 1 && (
                    <div className={`px-5 py-3 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                        <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Breakdown</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {services.map((s, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${activeService === i ? 'bg-blue-500' : (isLight ? 'bg-slate-300' : 'bg-gray-600')}`} />
                                    <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{s.service_name}</span>
                                    <span className={`text-[10px] font-bold ${s.type_of_service.length > 0 ? (isLight ? 'text-blue-600' : 'text-blue-400') : (isLight ? 'text-slate-400' : 'text-gray-600')}`}>{s.type_of_service.length}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Service Categories Card */}
            <div className={`${card} overflow-hidden`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-violet-100' : 'bg-violet-900/30'}`}>
                            <FontAwesomeIcon icon={faLayerGroup} className={`text-sm ${isLight ? 'text-violet-600' : 'text-violet-400'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Service Categories</h3>
                    </div>
                    <button onClick={() => setShowCategoryForm(!showCategoryForm)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${showCategoryForm
                            ? (isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#1f1f1f] text-gray-400')
                            : (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                        }`}>
                        <FontAwesomeIcon icon={showCategoryForm ? faTimes : faPlus} className="text-[10px]" />
                        {showCategoryForm ? 'Cancel' : 'Add Category'}
                    </button>
                </div>

                {showCategoryForm && (
                    <div className={`px-4 sm:px-5 py-4 border-b border-solid ${isLight ? 'bg-slate-50/50 border-slate-100' : 'bg-[#111] border-[#1f1f1f]'}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Category Name <span className="text-red-400">*</span></label>
                                <input type="text" className={inputCls} value={input.service_name} onChange={(e) => setInput({ ...input, service_name: e.target.value })} placeholder="e.g. Web Development"
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addService() } }} />
                                {input.service_name && services.some(s => s.service_name === input.service_name) && (
                                    <p className="text-[11px] mt-1 text-red-500">This category already exists</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end mt-3">
                            <button onClick={addService} className={btnPrimary} disabled={!input.service_name || services.some(s => s.service_name === input.service_name)}>
                                <FontAwesomeIcon icon={faPlus} className="mr-1.5 text-xs" /> Add Category
                            </button>
                        </div>
                    </div>
                )}

                {services.length > 0 ? (
                    <div className="px-4 sm:px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                            {services.map((s, i) => (
                                <div key={i} className="group relative">
                                    {editingCategory === i ? (
                                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                            <input type="text" className={`px-3 py-1.5 rounded-lg text-xs font-medium border border-solid outline-none w-36 ${isLight ? 'bg-white border-blue-400 text-slate-700' : 'bg-[#1a1a1a] border-blue-500 text-gray-200'}`}
                                                value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') saveEditCategory(); if (e.key === 'Escape') setEditingCategory(null) }} autoFocus />
                                            <button onClick={saveEditCategory} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLight ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50'}`}>
                                                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                            </button>
                                            <button onClick={() => setEditingCategory(null)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLight ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-[#1f1f1f] text-gray-400 hover:bg-[#2a2a2a]'}`}>
                                                <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setActiveService(i)}
                                            className={`flex items-center gap-2 pl-4 pr-2 py-2 rounded-xl text-xs font-medium transition-all border border-solid ${activeService === i
                                                ? (isLight ? 'bg-blue-500 text-white border-blue-500 shadow-sm' : 'bg-blue-600 text-white border-blue-600')
                                                : (isLight ? 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50' : 'bg-[#1a1a1a] text-gray-400 border-[#2B2B2B] hover:border-blue-500/50 hover:bg-[#1f1f1f]')
                                            }`}>
                                            <span>{s.service_name}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeService === i ? 'bg-white/20 text-white' : (isLight ? 'bg-slate-200/80 text-slate-500' : 'bg-[#2B2B2B] text-gray-500')}`}>{s.type_of_service.length}</span>
                                            <div className={`flex items-center gap-0.5 ml-1 pl-1.5 border-l border-solid ${activeService === i ? 'border-white/20' : (isLight ? 'border-slate-200' : 'border-[#333]')}`}>
                                                <button onClick={(e) => startEditCategory(i, e)} className={`w-5 h-5 rounded flex items-center justify-center transition-all ${activeService === i ? 'hover:bg-white/20 text-white/70 hover:text-white' : (isLight ? 'hover:bg-blue-100 text-slate-400 hover:text-blue-500' : 'hover:bg-blue-900/30 text-gray-500 hover:text-blue-400')}`}>
                                                    <FontAwesomeIcon icon={faPen} className="text-[8px]" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); deleteService(i) }} className={`w-5 h-5 rounded flex items-center justify-center transition-all ${activeService === i ? 'hover:bg-white/20 text-white/70 hover:text-white' : (isLight ? 'hover:bg-red-100 text-slate-400 hover:text-red-500' : 'hover:bg-red-900/30 text-gray-500 hover:text-red-400')}`}>
                                                    <FontAwesomeIcon icon={faTrash} className="text-[8px]" />
                                                </button>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={`flex flex-col items-center justify-center py-10 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                            <FontAwesomeIcon icon={faCogs} className="text-lg" />
                        </div>
                        <p className="text-xs font-medium">No service categories added yet</p>
                        <p className="text-[11px] mt-0.5">Click "Add Category" to get started</p>
                    </div>
                )}
            </div>

            {/* Service Types Card */}
            {services.length > 0 && (
                <div className={`${card} overflow-hidden`}>
                    <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                        <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                                <FontAwesomeIcon icon={faChevronRight} className={`text-xs ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                            </div>
                            <div>
                                <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                                    <span className={isLight ? 'text-blue-600' : 'text-blue-400'}>{services[activeService]?.service_name}</span>
                                </h3>
                                <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {services[activeService]?.type_of_service?.length || 0} service type{services[activeService]?.type_of_service?.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => { setShowTypeForm(!showTypeForm); setEditingType(null) }}
                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${showTypeForm
                                ? (isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#1f1f1f] text-gray-400')
                                : (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                            }`}>
                            <FontAwesomeIcon icon={showTypeForm ? faTimes : faPlus} className="text-[10px]" />
                            {showTypeForm ? 'Cancel' : 'Add Type'}
                        </button>
                    </div>

                    {/* Add Type Form */}
                    {showTypeForm && (
                        <div className={`px-4 sm:px-5 py-4 border-b border-solid ${isLight ? 'bg-slate-50/50 border-slate-100' : 'bg-[#111] border-[#1f1f1f]'}`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className={labelCls}>Service Name <span className="text-red-400">*</span></label>
                                    <input type="text" className={inputCls} value={input.service_name_type} onChange={(e) => setInput({ ...input, service_name_type: e.target.value })} placeholder="e.g. Frontend Development" />
                                </div>
                                <div>
                                    <label className={labelCls}>Icon <span className="text-red-400">*</span></label>
                                    <IconPicker value={input.featured_icon} onChange={(v) => setInput({ ...input, featured_icon: v })} isLight={isLight} inputCls={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Description</label>
                                <textarea rows="3" className={inputCls} value={input.service_description} onChange={(e) => setInput({ ...input, service_description: e.target.value })} placeholder="Describe what this service includes..." />
                            </div>
                            <div className="flex justify-end mt-3">
                                <button onClick={addTypeOfService} className={btnPrimary} disabled={!input.service_name_type}>
                                    <FontAwesomeIcon icon={faPlus} className="mr-1.5 text-xs" /> Add Type
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Edit Type Form */}
                    {editingType && editingType.sIdx === activeService && (
                        <div className={`px-4 sm:px-5 py-4 border-b border-solid ${isLight ? 'bg-amber-50/50 border-amber-200/50' : 'bg-amber-900/10 border-amber-800/30'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>Editing Service Type</p>
                                <button onClick={cancelEditType} className={`text-xs font-medium ${isLight ? 'text-slate-500 hover:text-slate-700' : 'text-gray-400 hover:text-gray-200'}`}>Cancel</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className={labelCls}>Service Name <span className="text-red-400">*</span></label>
                                    <input type="text" className={inputCls} value={editType.service_name} onChange={(e) => setEditType({ ...editType, service_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>Icon <span className="text-red-400">*</span></label>
                                    <IconPicker value={editType.featured_icon} onChange={(v) => setEditType({ ...editType, featured_icon: v })} isLight={isLight} inputCls={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Description</label>
                                <textarea rows="3" className={inputCls} value={editType.service_description} onChange={(e) => setEditType({ ...editType, service_description: e.target.value })} />
                            </div>
                            <div className="flex justify-end mt-3">
                                <button onClick={saveEditType} className={btnPrimary}>
                                    <FontAwesomeIcon icon={faCheck} className="mr-1.5 text-xs" /> Update
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Service Types Display */}
                    {services[activeService]?.type_of_service?.length > 0 ? (
                        <div className="px-4 sm:px-5 py-3">
                            {services[activeService].type_of_service.map((t, i) => (
                                <div key={i} className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                                    editingType?.sIdx === activeService && editingType?.tIdx === i
                                        ? (isLight ? 'bg-amber-50' : 'bg-amber-900/10')
                                        : (isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]')
                                } ${i > 0 ? `border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}` : ''}`}>
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/20 text-blue-400'}`}>
                                        <SafeIcon name={t.featured_icon} cls="text-base" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>{t.service_name}</p>
                                        {t.service_description && (
                                            <p className={`text-xs mt-0.5 truncate ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{t.service_description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEditType(activeService, i)}
                                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-slate-400 hover:text-blue-500 hover:bg-blue-50' : 'text-gray-500 hover:text-blue-400 hover:bg-blue-900/20'}`}>
                                            <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                        </button>
                                        <button onClick={() => deleteTypeOfService(activeService, i)}
                                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-900/20'}`}>
                                            <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`flex flex-col items-center justify-center py-10 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                <FontAwesomeIcon icon={faPlus} className="text-lg" />
                            </div>
                            <p className="text-xs font-medium">No service types for this category</p>
                            <p className="text-[11px] mt-0.5">Click "Add Type" to add services</p>
                        </div>
                    )}
                </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
                <button onClick={handleSubmit} disabled={submitted} className={`${btnPrimary} disabled:opacity-50 flex items-center gap-2`}>
                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                    {!submitted ? "Save Services" : <span className="flex items-center gap-2">Saving<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
                </button>
            </div>
        </div>
    )
}

export default Services
