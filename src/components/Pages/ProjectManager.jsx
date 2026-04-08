import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faProjectDiagram, faPlus, faTimes, faCheck, faTrash, faPen, faEye, faSearch,
    faChevronLeft, faChevronRight, faImage, faTag, faList, faLayerGroup,
    faSortUp, faSortDown, faSort, faFilter, faAngleDoubleLeft, faAngleDoubleRight,
    faArrowUp, faArrowDown, faCode, faCloudUploadAlt, faCalendar, faFile,
    faQuoteRight, faListOl, faListUl, faColumns, faDownload, faImages, faLink,
    faExternalLinkAlt, faHeading, faParagraph, faPhotoVideo,
    faLock, faCopy, faKey, faBook
} from '@fortawesome/free-solid-svg-icons'
import { library, findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { put, del } from '@vercel/blob'
import { getUserProject, uploadProject, editUserProject, removeUserProject, getAdminCategory, addProjectCategory, editProjectCategory, removeProjectCategory, clearAlert } from '../../actions/project'
import { getDocs } from '../../actions/documentation'
import { main, dark, light } from '../../style'
import styles from '../../style'
import Notification from '../Custom/Notification'
import SyntaxHighlighter from 'react-syntax-highlighter'
import * as hljsStyles from 'react-syntax-highlighter/dist/esm/styles/hljs'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'

library.add(fas, far, fab)

const PURPOSES = ['Personal', 'School', 'Client', 'Others']

const INITIAL_FORM = {
    featured_image: '', post_title: '', date_start: '', date_end: '',
    created_for: 'Personal',
    privacy: false, access_key: [], documentation_link: '',
    content: [{ header: 'Container Box', container: [{ header: 'Heading', element: 'heading', heading: '' }] }],
    tags: [], categories: ''
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const CAROUSEL_RESPONSIVE = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 1 },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 1 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 }
}

const ELEMENT_TYPES = [
    { group: 'Text', items: [
        { value: 'heading', label: 'Heading' },
        { value: 'sub_heading', label: 'Sub Heading' },
        { value: 'normal_naragraph', label: 'Normal Paragraph' },
        { value: 'quoted_paragraph', label: 'Quoted Paragraph' },
        { value: 'code_highlights', label: 'Code Highlights' },
    ]},
    { group: 'List', items: [
        { value: 'bullet_list', label: 'Bullet List' },
        { value: 'number_list', label: 'Number List' },
        { value: 'download_list', label: 'Download List' },
        { value: 'list_image', label: 'List Image' },
    ]},
    { group: 'Image', items: [
        { value: 'slider', label: 'Slider' },
        { value: 'grid_image', label: 'Grid Image' },
        { value: 'single_image', label: 'Single Image' },
    ]},
    { group: 'Section', items: [
        { value: 'grid_column', label: 'Grid Columns' },
    ]}
]

const GRID_ELEMENT_TYPES = ELEMENT_TYPES.filter(g => g.group !== 'Section').map(g => ({
    ...g, items: g.items.filter(i => i.value !== 'code_highlights')
}))

function createElement(type) {
    switch (type) {
        case 'heading':           return { header: 'Heading', element: type, heading: '' }
        case 'sub_heading':       return { header: 'Sub Heading', element: type, heading: '' }
        case 'normal_naragraph':  return { header: 'Normal Paragraph', element: type, paragraph: '' }
        case 'quoted_paragraph':  return { header: 'Quoted Paragraph', element: type, paragraph: '' }
        case 'grid_image':        return { header: 'Grid Image', type: 'boxed', element: type, input: '', grid_image: [] }
        case 'slider':            return { header: 'Slider', element: type, input: '', grid_image: [] }
        case 'single_image':      return { header: 'Single Image', type: 'rectangular', element: type, image: '' }
        case 'bullet_list':       return { header: 'Bullet List', element: type, input: '', list: [] }
        case 'number_list':       return { header: 'Number List', element: type, input: '', list: [] }
        case 'list_image':        return { header: 'List Image', element: type, image_input: '', heading_input: '', sub_input: '', link_input: '', list: [] }
        case 'code_highlights':   return { header: 'Code Highlights', element: type, input: '', language: 'javascript', theme: 'srcery', name: '', paragraph: '' }
        case 'download_list':     return { header: 'Download List', element: type, input: '', icon: 'fa-file-download', link: '', list: [] }
        case 'grid_column':       return { header: 'Grid Column', element: type, input: '', grid1: [], grid2: [] }
        default: return null
    }
}

const COMMON_ICONS = [
    'folder', 'code', 'laptop-code', 'paint-brush', 'palette', 'camera', 'film', 'music',
    'gamepad', 'puzzle-piece', 'cube', 'cubes', 'cogs', 'wrench', 'tools', 'database',
    'server', 'cloud', 'globe', 'sitemap', 'network-wired', 'mobile-alt', 'desktop',
    'tablet-alt', 'robot', 'microchip', 'brain', 'lightbulb', 'rocket', 'flask',
    'atom', 'dna', 'shield-alt', 'lock', 'key', 'user-shield', 'chart-bar', 'chart-line',
    'chart-pie', 'shopping-cart', 'store', 'credit-card', 'wallet', 'money-bill-wave',
    'file-alt', 'file-code', 'file-image', 'file-video', 'file-audio', 'file-pdf',
    'book', 'book-open', 'graduation-cap', 'university', 'chalkboard-teacher',
    'pen-fancy', 'pencil-alt', 'marker', 'highlighter', 'ruler-combined',
    'drafting-compass', 'bezier-curve', 'vector-square', 'layer-group', 'object-group',
    'th-large', 'th', 'border-all', 'draw-polygon', 'project-diagram',
    'tasks', 'clipboard-list', 'calendar-alt', 'clock', 'stopwatch', 'hourglass-half',
    'bullhorn', 'comments', 'envelope', 'paper-plane', 'share-alt', 'hashtag',
    'at', 'link', 'wifi', 'bluetooth', 'satellite-dish', 'broadcast-tower',
    'heart', 'star', 'trophy', 'medal', 'award', 'gem', 'crown', 'flag',
    'map-marker-alt', 'map', 'compass', 'route', 'car', 'plane', 'ship',
    'home', 'building', 'city', 'warehouse', 'hospital', 'church',
    'leaf', 'seedling', 'tree', 'sun', 'moon', 'wind', 'bolt', 'fire',
    'tint', 'snowflake', 'mountain', 'water',
]

const ProjectManager = ({ user, theme }) => {
    const dispatch = useDispatch()
    const project = useSelector((state) => state.project.project)
    const projAlert = useSelector((state) => state.project.alert)
    const projVariant = useSelector((state) => state.project.variant)
    const category = useSelector((state) => state.project.category)
    const isLoading = useSelector((state) => state.project.isLoading)
    const docsData = useSelector((state) => state.docs.docs)

    const isLight = theme === 'light'
    const userId = user?._id || user?.result?._id || ''

    const [searchParams, setSearchParams] = useSearchParams()
    const VALID_TABS = ['projects', 'categories']
    const tabParam = searchParams.get('tab')
    const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'projects'
    const setActiveTab = (tab) => setSearchParams(prev => { prev.set('tab', tab); return prev }, { replace: true })

    const [view, setView] = useState('list')
    const [form, setForm] = useState({ ...INITIAL_FORM, content: JSON.parse(JSON.stringify(INITIAL_FORM.content)) })
    const [editIndex, setEditIndex] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [projects, setProjects] = useState([])

    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [sortKey, setSortKey] = useState('date_start')
    const [sortDir, setSortDir] = useState('desc')
    const [filterCategory, setFilterCategory] = useState('')
    const [filterPurpose, setFilterPurpose] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    const [tagInput, setTagInput] = useState('')
    const [notification, setNotification] = useState({})
    const [showNotif, setShowNotif] = useState(false)
    const [viewProject, setViewProject] = useState(null)
    const [lightbox, setLightbox] = useState({ open: false, src: '' })
    const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', variant: 'danger', icon: faTrash, confirmText: '', onConfirm: null })
    const [codePreview, setCodePreview] = useState({})

    const [contentSelected, setContentSelected] = useState('')
    const [contentGrid1Selected, setContentGrid1Selected] = useState('')
    const [contentGrid2Selected, setContentGrid2Selected] = useState('')

    const [catForm, setCatForm] = useState({ name: '', image: '', description: '' })
    const [editCatId, setEditCatId] = useState(null)
    const [catSubmitting, setCatSubmitting] = useState(false)
    const [showCatForm, setShowCatForm] = useState(false)
    const [iconSearch, setIconSearch] = useState('')
    const [showIconPicker, setShowIconPicker] = useState(false)

    const filteredIcons = useMemo(() => {
        if (!iconSearch) return COMMON_ICONS
        const s = iconSearch.toLowerCase()
        return COMMON_ICONS.filter(ic => ic.includes(s))
    }, [iconSearch])

    const activeFilterCount = [filterCategory, filterPurpose].filter(Boolean).length

    useEffect(() => {
        if (user) {
            dispatch(getUserProject({ id: userId }))
            dispatch(getAdminCategory())
            dispatch(getDocs())
        }
    }, [dispatch, user])

    useEffect(() => {
        if (project && Array.isArray(project) && project.length > 0) {
            setProjects(project)
        } else if (project && Array.isArray(project) && project.length === 0) {
            setProjects([])
        }
    }, [project])

    useEffect(() => {
        if (projAlert && projVariant) {
            setNotification({ message: projAlert, variant: projVariant })
            setShowNotif(true)
            dispatch(clearAlert())
            setSubmitting(false)
            setCatSubmitting(false)
            if (projVariant === 'success' && view === 'form') {
                resetForm()
                setView('list')
            }
            if (projVariant === 'success' && activeTab === 'categories') {
                setCatForm({ name: '', image: '', description: '' })
                setEditCatId(null)
                setShowCatForm(false)
                setIconSearch('')
                setShowIconPicker(false)
            }
        }
    }, [projAlert, projVariant])

    useEffect(() => { if (!showNotif) setNotification({}) }, [showNotif])

    /* ─── Sort / Filter / Search ─── */

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        else { setSortKey(key); setSortDir('asc') }
        setPage(0)
    }

    const clearFilters = () => { setFilterCategory(''); setFilterPurpose(''); setPage(0) }

    const processed = useMemo(() => {
        let result = [...(projects || [])]
        if (search) {
            const s = search.toLowerCase()
            result = result.filter(p =>
                p.post_title?.toLowerCase().includes(s) || p.created_for?.toLowerCase().includes(s)
            )
        }
        if (filterCategory) result = result.filter(p => p.categories === filterCategory)
        if (filterPurpose) result = result.filter(p => p.created_for === filterPurpose)

        result.sort((a, b) => {
            let va, vb
            switch (sortKey) {
                case 'post_title':    va = a.post_title?.toLowerCase() || ''; vb = b.post_title?.toLowerCase() || ''; break
                case 'categories':    va = a.categories?.toLowerCase?.() || ''; vb = b.categories?.toLowerCase?.() || ''; break
                case 'created_for':   va = a.created_for?.toLowerCase() || ''; vb = b.created_for?.toLowerCase() || ''; break
                case 'views':         va = a.views?.length || 0; vb = b.views?.length || 0; break
                case 'likes':         va = a.likes?.length || 0; vb = b.likes?.length || 0; break
                case 'comments':      va = a.comment?.length || 0; vb = b.comment?.length || 0; break
                case 'date_start':
                default:              va = a.date_start || ''; vb = b.date_start || ''; break
            }
            if (va < vb) return sortDir === 'asc' ? -1 : 1
            if (va > vb) return sortDir === 'asc' ? 1 : -1
            return 0
        })
        return result
    }, [projects, search, filterCategory, filterPurpose, sortKey, sortDir])

    const totalPages = Math.ceil(processed.length / pageSize)
    const pageData = processed.slice(page * pageSize, (page + 1) * pageSize)

    /* ─── Form ─── */

    const resetForm = () => {
        setForm({ ...INITIAL_FORM, content: JSON.parse(JSON.stringify(INITIAL_FORM.content)), tags: [], access_key: [], privacy: false, documentation_link: '' })
        setEditIndex(null)
        setTagInput('')
        setContentSelected('')
        setContentGrid1Selected('')
        setContentGrid2Selected('')
        setCodePreview({})
    }

    const openCreate = () => {
        resetForm()
        if (category?.length > 0 && !form.categories) {
            setForm(prev => ({ ...prev, categories: category[0]._id }))
        }
        setView('form')
    }

    const openEdit = (p, idx) => {
        const copiedContent = JSON.parse(JSON.stringify(p.content || []))
        setForm({
            featured_image: p.featured_image || '',
            post_title: p.post_title || '',
            date_start: p.date_start || '',
            date_end: p.date_end || '',
            created_for: p.created_for || 'Personal',
            privacy: p.privacy || false,
            access_key: JSON.parse(JSON.stringify(p.access_key || [])),
            documentation_link: p.documentation_link || '',
            content: copiedContent,
            tags: [...(p.tags || [])],
            categories: p.categories || ''
        })
        setEditIndex(idx)
        setTagInput('')
        setView('form')
    }

    const handleSubmit = () => {
        if (!form.post_title || submitting) return
        setSubmitting(true)
        const data = { ...form }
        if (editIndex !== null) {
            const updatedRecord = { ...projects[editIndex], ...data }
            dispatch(editUserProject({ id: userId, data: updatedRecord }))
        } else {
            dispatch(uploadProject({ id: userId, data }))
        }
    }

    const handleDelete = (idx) => {
        setConfirmModal({
            open: true, title: 'Delete Project', variant: 'danger', icon: faTrash,
            message: 'Are you sure you want to delete this project? This action cannot be undone.',
            onConfirm: () => {
                dispatch(removeUserProject({ id: userId, project_id: projects[idx]._id }))
                setConfirmModal(prev => ({ ...prev, open: false }))
            }
        })
    }

    /* ─── Category CRUD ─── */

    const handleCatSubmit = () => {
        if (!catForm.name || catSubmitting) return
        setCatSubmitting(true)
        if (editCatId) {
            dispatch(editProjectCategory({ category_id: editCatId, name: catForm.name, image: catForm.image, description: catForm.description }))
        } else {
            dispatch(addProjectCategory({ id: userId, name: catForm.name, image: catForm.image, description: catForm.description }))
        }
    }

    const handleCatEdit = (cat) => {
        setCatForm({ name: cat.name || '', image: cat.image || '', description: cat.description || '' })
        setEditCatId(cat._id)
        setShowCatForm(true)
        setShowIconPicker(false)
        setIconSearch('')
    }

    const handleCatDelete = (cat) => {
        setConfirmModal({
            open: true, title: 'Delete Category', variant: 'danger', icon: faTrash,
            message: `Are you sure you want to delete "${cat.name}"? This will not remove projects using this category.`,
            onConfirm: () => {
                dispatch(removeProjectCategory({ category_id: cat._id }))
                setConfirmModal(prev => ({ ...prev, open: false }))
            }
        })
    }

    const cancelCatEdit = () => {
        setCatForm({ name: '', image: '', description: '' })
        setEditCatId(null)
        setShowCatForm(false)
        setShowIconPicker(false)
        setIconSearch('')
    }

    const selectIcon = (iconName) => {
        setCatForm(prev => ({ ...prev, image: iconName }))
        setShowIconPicker(false)
        setIconSearch('')
    }

    /* ─── Tags ─── */

    const addTag = () => {
        if (tagInput && !form.tags.includes(tagInput)) {
            setForm({ ...form, tags: [...form.tags, tagInput] })
            setTagInput('')
        }
    }
    const removeTag = (i) => { const t = [...form.tags]; t.splice(i, 1); setForm({ ...form, tags: t }) }

    const generateKey = () => {
        const key = Math.random().toString(36).substring(2, 10).toUpperCase()
        setForm({ ...form, access_key: [...form.access_key, { key, download_limit: 0, user_downloaded: [] }] })
    }
    const removeKey = (i) => { const k = [...form.access_key]; k.splice(i, 1); setForm({ ...form, access_key: k }) }
    const updateKeyLimit = (i, val) => {
        const k = [...form.access_key]
        k[i] = { ...k[i], download_limit: parseInt(val) || 0 }
        setForm({ ...form, access_key: k })
    }

    /* ─── Image Upload ─── */

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file || !file.type.startsWith('image/')) return
        setUploadingImage(true)
        try {
            if (form.featured_image?.includes('vercel-storage')) {
                await del(form.featured_image, { token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN }).catch(() => {})
            }
            const blob = await put(`projects/${Date.now()}_${file.name}`, file, {
                access: 'public', token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
            })
            setForm(prev => ({ ...prev, featured_image: blob.url }))
        } catch (err) { console.error('Image upload failed:', err) }
        finally { setUploadingImage(false); e.target.value = '' }
    }

    const removeImage = async () => {
        if (form.featured_image?.includes('vercel-storage')) {
            await del(form.featured_image, { token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN }).catch(() => {})
        }
        setForm(prev => ({ ...prev, featured_image: '' }))
    }

    const [contentUploading, setContentUploading] = useState({})

    const handleContentImageUpload = async (e, index, box_index, field, isGrid = false, gridType = '', gridParent = -1, gridSub = -1) => {
        const file = e.target.files?.[0]
        if (!file || !file.type.startsWith('image/')) return
        const uploadKey = `${box_index}-${index}-${field}`
        setContentUploading(prev => ({ ...prev, [uploadKey]: true }))
        try {
            const blob = await put(`projects/content/${Date.now()}_${file.name}`, file, {
                access: 'public', token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
            })
            updateContent(arr => {
                const el = isGrid ? arr[box_index].container[gridParent][gridType][gridSub] : arr[box_index].container[index]
                if (field === 'image') {
                    el.image = blob.url
                } else if (field === 'input') {
                    el.input = blob.url
                }
            })
        } catch (err) { console.error('Content image upload failed:', err) }
        finally { setContentUploading(prev => ({ ...prev, [uploadKey]: false })); e.target.value = '' }
    }

    /* ─── Content Builder Helpers ─── */

    const updateContent = (fn) => {
        const arr = JSON.parse(JSON.stringify(form.content))
        fn(arr)
        setForm(prev => ({ ...prev, content: arr }))
    }

    const addContentContainer = () => updateContent(arr => {
        arr.push({ header: 'Container Box', container: [{ header: 'Heading', element: 'heading', heading: '' }] })
    })

    const addContentElements = (parent) => {
        if (!contentSelected) return
        const el = createElement(contentSelected)
        if (!el) return
        updateContent(arr => { arr[parent].container.push(el) })
    }

    const addContentElementsGrid = (index, parent, gridType) => {
        const sel = gridType === 'grid1' ? contentGrid1Selected : contentGrid2Selected
        if (!sel) return
        const el = createElement(sel)
        if (!el) return
        updateContent(arr => { arr[parent].container[index][gridType].push(el) })
    }

    const moveContainerUpwards = (i) => updateContent(arr => { [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]] })
    const moveContainerDownwards = (i) => updateContent(arr => { [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]] })
    const removeContainer = (i) => updateContent(arr => { arr.splice(i, 1) })
    const headerContainerValue = (e, i) => updateContent(arr => { arr[i].header = e.target.value })

    const moveElementUpwards = (i, p) => updateContent(arr => { const c = arr[p].container; [c[i], c[i - 1]] = [c[i - 1], c[i]] })
    const moveElementsDownwards = (i, p) => updateContent(arr => { const c = arr[p].container; [c[i], c[i + 1]] = [c[i + 1], c[i]] })
    const removeElementsContent = (i, p) => updateContent(arr => { arr[p].container.splice(i, 1) })

    const headerValue = (e, i, p) => updateContent(arr => { arr[p].container[i].header = e.target.value })
    const headingValue = (e, i, p) => updateContent(arr => { arr[p].container[i].heading = e.target.value })
    const paragraphValue = (e, i, p) => updateContent(arr => { arr[p].container[i].paragraph = e.target.value })
    const singleInputValue = (e, i, p) => updateContent(arr => { arr[p].container[i].image = e.target.value })
    const gridInputValue = (e, i, p) => updateContent(arr => { arr[p].container[i].input = e.target.value })
    const listInputValue = (e, i, p) => updateContent(arr => { arr[p].container[i].input = e.target.value })
    const typeValue = (e, i, p) => updateContent(arr => { arr[p].container[i].type = e.target.value })
    const nameValue = (e, i, p) => updateContent(arr => { arr[p].container[i].name = e.target.value })
    const linkValue = (e, i, p) => updateContent(arr => { arr[p].container[i].link = e.target.value })
    const selectValue = (e, i, p, type) => updateContent(arr => { arr[p].container[i][type] = e.target.value })

    const listInputValueMulti = (e, i, p, type) => updateContent(arr => {
        const mapping = { image: 'image_input', link: 'link_input', heading: 'heading_input', sub_heading: 'sub_input' }
        arr[p].container[i][mapping[type]] = e.target.value
    })

    const addGridContentImage = (i, p) => updateContent(arr => {
        const el = arr[p].container[i]
        if (!el.input) return
        el.grid_image.push(el.input)
        el.input = ''
    })

    const addLists = (i, p) => updateContent(arr => {
        const el = arr[p].container[i]
        if (!el.input) return
        el.list.push(el.input)
        el.input = ''
    })

    const addListsMulti = (i, p) => updateContent(arr => {
        const el = arr[p].container[i]
        if (!el.heading_input) return
        el.list.push({ image: el.image_input, link: el.link_input, heading: el.heading_input, sub_heading: el.sub_input })
        el.image_input = ''; el.link_input = ''; el.heading_input = ''; el.sub_input = ''
    })

    const addListsDownloads = (i, p) => updateContent(arr => {
        const el = arr[p].container[i]
        if (!el.input || !el.link) return
        el.list.push({ name: el.input, link: el.link, icon: el.icon })
        el.icon = 'fa-file-download'; el.input = ''; el.link = ''
    })

    const removeLists = (pi, ci, p) => updateContent(arr => { arr[p].container[pi].list.splice(ci, 1) })
    const removeGridContentImage = (pi, ci, p) => updateContent(arr => { arr[p].container[pi].grid_image.splice(ci, 1) })

    /* ─── Grid Column Sub-Element Helpers ─── */

    const moveElementUpwardsGrid = (i, p, sub, gridType) => updateContent(arr => {
        const g = arr[p].container[i][gridType]; [g[sub], g[sub - 1]] = [g[sub - 1], g[sub]]
    })
    const moveElementsDownwardsGrid = (i, p, sub, gridType) => updateContent(arr => {
        const g = arr[p].container[i][gridType]; [g[sub], g[sub + 1]] = [g[sub + 1], g[sub]]
    })
    const removeElementsContentGrid = (i, p, sub, gridType) => updateContent(arr => {
        arr[p].container[i][gridType].splice(sub, 1)
    })
    const headerValueGrid = (e, i, p, sub, gridType) => updateContent(arr => {
        arr[p].container[i][gridType][sub].header = e.target.value
    })
    const headingValueGrid = (e, i, p, sub, gridType) => updateContent(arr => {
        arr[p].container[i][gridType][sub].heading = e.target.value
    })
    const paragraphValueGrid = (e, i, p, sub, gridType) => updateContent(arr => {
        arr[p].container[i][gridType][sub].paragraph = e.target.value
    })
    const singleInputValueGrid = (e, i, p, sub, gridType) => updateContent(arr => {
        arr[p].container[i][gridType][sub].image = e.target.value
    })
    const gridInputValueGrid = (e, i, p, sub, gridType) => updateContent(arr => {
        arr[p].container[i][gridType][sub].input = e.target.value
    })
    const typeValueGrid = (e, i, p, sub, gridType) => updateContent(arr => {
        arr[p].container[i][gridType][sub].type = e.target.value
    })
    const listInputValueGrid = (e, i, p, sub, gridType) => updateContent(arr => {
        arr[p].container[i][gridType][sub].input = e.target.value
    })
    const listInputValueMultiGrid = (e, i, p, type, sub, gridType) => updateContent(arr => {
        const mapping = { image: 'image_input', link: 'link_input', heading: 'heading_input', sub_heading: 'sub_input' }
        arr[p].container[i][gridType][sub][mapping[type]] = e.target.value
    })
    const selectValueGrid = (e, i, p, type, sub, gridType) => updateContent(arr => {
        arr[p].container[i][gridType][sub][type] = e.target.value
    })
    const nameValueGrid = (e, i, p, sub, gridType) => updateContent(arr => {
        arr[p].container[i][gridType][sub].name = e.target.value
    })
    const linkValueGrid = (e, i, p, sub, gridType) => updateContent(arr => {
        arr[p].container[i][gridType][sub].link = e.target.value
    })

    const addGridContentImageGrid = (i, p, sub, gridType) => updateContent(arr => {
        const el = arr[p].container[i][gridType][sub]
        if (!el.input) return
        el.grid_image.push(el.input); el.input = ''
    })
    const addListsGrid = (i, p, sub, gridType) => updateContent(arr => {
        const el = arr[p].container[i][gridType][sub]
        if (!el.input) return
        el.list.push(el.input); el.input = ''
    })
    const addListsMultiGrid = (i, p, sub, gridType) => updateContent(arr => {
        const el = arr[p].container[i][gridType][sub]
        if (!el.heading_input) return
        el.list.push({ image: el.image_input, link: el.link_input, heading: el.heading_input, sub_heading: el.sub_input })
        el.image_input = ''; el.link_input = ''; el.heading_input = ''; el.sub_input = ''
    })
    const addListsDownloadsGrid = (i, p, sub, gridType) => updateContent(arr => {
        const el = arr[p].container[i][gridType][sub]
        if (!el.input || !el.link) return
        el.list.push({ name: el.input, link: el.link, icon: el.icon })
        el.icon = 'fa-file-download'; el.input = ''; el.link = ''
    })
    const removeListsGrid = (pi, ci, p, sub, gridType) => updateContent(arr => {
        arr[p].container[pi][gridType][sub].list.splice(ci, 1)
    })
    const removeGridContentImageGrid = (pi, ci, p, sub, gridType) => updateContent(arr => {
        arr[p].container[pi][gridType][sub].grid_image.splice(ci, 1)
    })

    /* ─── Helpers ─── */

    const getCategoryName = (id) => {
        if (!id) return 'N/A'
        const cat = category?.find(c => c._id === id)
        return cat?.name || cat?.category || id
    }

    const resolveIcon = (iconStr) => {
        if (!iconStr) return faFile
        const name = iconStr.startsWith('fa-') ? iconStr.substring(3) : iconStr
        const def = findIconDefinition({ prefix: 'fas', iconName: name })
        return def || faFile
    }

    /* ─── Styles ─── */

    const card = `rounded-xl border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-slate-200/80' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`
    const inputCls = `w-full px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`
    const selectCls = `px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all cursor-pointer ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`
    const btnPrimary = `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLight ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`
    const btnSecondary = `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300'}`
    const labelCls = `block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`
    const sectionBorder = isLight ? 'border-slate-100' : 'border-[#1f1f1f]'
    const mutedText = isLight ? 'text-slate-400' : 'text-gray-600'
    const subText = isLight ? 'text-slate-500' : 'text-gray-400'

    /* ─── Reusable: Element Action Buttons ─── */

    const ElementActions = ({ index, total, onUp, onDown, onRemove }) => (
        <div className="flex items-center gap-1">
            {index > 0 && <button onClick={onUp} title="Move up" className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-500'}`}><FontAwesomeIcon icon={faArrowUp} className="text-[10px]" /></button>}
            {index < total - 1 && <button onClick={onDown} title="Move down" className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-500'}`}><FontAwesomeIcon icon={faArrowDown} className="text-[10px]" /></button>}
            <button onClick={onRemove} title="Remove" className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isLight ? 'hover:bg-red-50 text-red-400' : 'hover:bg-red-900/20 text-red-500'}`}><FontAwesomeIcon icon={faTimes} className="text-[10px]" /></button>
        </div>
    )

    /* ─── Reusable: Element Picker ─── */

    const ElementPicker = ({ value, onChange, onAdd, types = ELEMENT_TYPES, sticky = false }) => (
        <div className={`flex items-center gap-2 ${sticky ? `sticky top-0 z-10 py-2 -mx-1 px-1 ${isLight ? 'bg-white/95 backdrop-blur-sm' : 'bg-[#0a0a0a]/95 backdrop-blur-sm'}` : ''}`}>
            <select className={`${selectCls} flex-1 text-xs py-1.5`} value={value} onChange={e => onChange(e.target.value)}>
                <option value="" disabled>Select Element</option>
                {types.map(g => (
                    <React.Fragment key={g.group}>
                        <option disabled className="text-[10px]">── {g.group}</option>
                        {g.items.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                    </React.Fragment>
                ))}
            </select>
            <button onClick={onAdd} className={`${btnPrimary} py-1.5 px-3 text-xs`}>Add</button>
        </div>
    )

    /* ─── Auth Guard ─── */

    if (!user) {
        return (
            <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className="flex items-center justify-center py-32">
                            <div className={`text-center ${card} p-8`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${isLight ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                                    <FontAwesomeIcon icon={faProjectDiagram} className={`text-xl ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                                </div>
                                <h2 className={`text-lg font-semibold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>Login Required</h2>
                                <p className={`text-sm mb-5 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Please log in to manage your projects.</p>
                                <a href="/login" className={btnPrimary}>Login</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    /* ─── Render Element (View Modal) ─── */

    const renderViewElement = (item, idx) => {
        if (!item) return null
        switch (item.element) {
            case 'heading':
                return <h3 key={idx} className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{item.heading}</h3>
            case 'sub_heading':
                return <h4 key={idx} className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{item.heading}</h4>
            case 'normal_naragraph':
                return <p key={idx} className={`text-xs leading-relaxed whitespace-pre-wrap ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{item.paragraph}</p>
            case 'quoted_paragraph':
                return <blockquote key={idx} className={`text-xs italic pl-3 border-l-2 ${isLight ? 'border-blue-300 text-slate-600' : 'border-blue-600 text-gray-400'}`}>{item.paragraph}</blockquote>
            case 'code_highlights':
                return (
                    <div key={idx} className="rounded-lg overflow-hidden">
                        {item.name && <div className={`text-[10px] font-medium px-3 py-1 ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#1a1a1a] text-gray-500'}`}>{item.name}</div>}
                        <SyntaxHighlighter language={item.language || 'javascript'} style={hljsStyles[item.theme] || hljsStyles.srcery} customStyle={{ fontSize: '11px', margin: 0, borderRadius: item.name ? '0 0 8px 8px' : '8px' }}>
                            {item.paragraph || ''}
                        </SyntaxHighlighter>
                    </div>
                )
            case 'single_image':
                return item.image ? <img key={idx} src={item.image} alt="" className="w-full rounded-lg object-cover cursor-pointer" onClick={() => setLightbox({ open: true, src: item.image })} /> : null
            case 'grid_image':
                return (
                    <div key={idx} className={`grid ${item.type === 'boxed' ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                        {item.grid_image?.map((img, i) => <img key={i} src={img} alt="" className="w-full rounded-lg object-cover cursor-pointer h-32" onClick={() => setLightbox({ open: true, src: img })} />)}
                    </div>
                )
            case 'slider':
                return item.grid_image?.length > 0 ? (
                    <Carousel key={idx} responsive={CAROUSEL_RESPONSIVE} showDots infinite autoPlay swipeable slidesToSlide={1} className="rounded-lg overflow-hidden">
                        {item.grid_image.map((img, i) => <img key={i} src={img} alt="" className="w-full h-48 object-cover" />)}
                    </Carousel>
                ) : null
            case 'bullet_list':
                return <ul key={idx} className={`list-disc pl-5 space-y-0.5 text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{item.list?.map((li, i) => <li key={i}>{li}</li>)}</ul>
            case 'number_list':
                return <ol key={idx} className={`list-decimal pl-5 space-y-0.5 text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{item.list?.map((li, i) => <li key={i}>{li}</li>)}</ol>
            case 'list_image':
                return (
                    <div key={idx} className="space-y-2">
                        {item.list?.map((li, i) => (
                            <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-[#111]'}`}>
                                {li.image && <img src={li.image} alt="" className="w-10 h-10 rounded object-cover" />}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{li.heading}</p>
                                    {li.sub_heading && <p className={`text-[10px] truncate ${subText}`}>{li.sub_heading}</p>}
                                </div>
                                {li.link && <a href={li.link} target="_blank" rel="noreferrer" className="text-blue-500 text-xs"><FontAwesomeIcon icon={faExternalLinkAlt} /></a>}
                            </div>
                        ))}
                    </div>
                )
            case 'download_list':
                return (
                    <div key={idx} className="space-y-1">
                        {item.list?.map((dl, i) => (
                            <a key={i} href={dl.link} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700' : 'bg-[#111] hover:bg-[#1a1a1a] text-gray-300'}`}>
                                <FontAwesomeIcon icon={resolveIcon(dl.icon)} className="text-blue-500" />
                                <span>{dl.name}</span>
                            </a>
                        ))}
                    </div>
                )
            case 'grid_column':
                return (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">{item.grid1?.map((el, i) => renderViewElement(el, `g1-${i}`))}</div>
                        <div className="space-y-2">{item.grid2?.map((el, i) => renderViewElement(el, `g2-${i}`))}</div>
                    </div>
                )
            default: return null
        }
    }

    /* ─── Render Element Editor ─── */

    const renderElementEditor = (item, index, box_index, isGrid = false, gridType = '', gridParent = -1, gridSub = -1) => {
        const el = isGrid
            ? form.content[box_index]?.container[gridParent]?.[gridType]?.[gridSub]
            : form.content[box_index]?.container[index]
        if (!el) return null

        const total = isGrid
            ? form.content[box_index]?.container[gridParent]?.[gridType]?.length || 0
            : form.content[box_index]?.container?.length || 0
        const currentIndex = isGrid ? gridSub : index

        const actions = <ElementActions index={currentIndex} total={total}
            onUp={() => isGrid ? moveElementUpwardsGrid(gridParent, box_index, gridSub, gridType) : moveElementUpwards(index, box_index)}
            onDown={() => isGrid ? moveElementsDownwardsGrid(gridParent, box_index, gridSub, gridType) : moveElementsDownwards(index, box_index)}
            onRemove={() => isGrid ? removeElementsContentGrid(gridParent, box_index, gridSub, gridType) : removeElementsContent(index, box_index)}
        />

        const elHeader = (
            <div className="flex items-center justify-between py-1.5">
                <input type="text" className={`${inputCls} w-auto flex-1 mr-2 py-1 text-xs font-semibold border-none bg-transparent px-0 focus:border-none`}
                    onChange={e => isGrid ? headerValueGrid(e, gridParent, box_index, gridSub, gridType) : headerValue(e, index, box_index)}
                    value={el.header || ''} />
                {actions}
            </div>
        )

        const elCls = `rounded-lg p-3 mb-2 ${isLight ? 'bg-slate-50/70 border border-solid border-slate-100' : 'bg-[#111]/50 border border-solid border-[#1f1f1f]'}`

        switch (item.element) {
            case 'heading':
            case 'sub_heading':
                return <div key={`${box_index}-${currentIndex}`} className={elCls}>{elHeader}
                    <input type="text" className={inputCls} placeholder={item.element === 'heading' ? 'Heading' : 'Sub Heading'}
                        onChange={e => isGrid ? headingValueGrid(e, gridParent, box_index, gridSub, gridType) : headingValue(e, index, box_index)}
                        value={el.heading || ''} />
                </div>

            case 'normal_naragraph':
            case 'quoted_paragraph':
                return <div key={`${box_index}-${currentIndex}`} className={elCls}>{elHeader}
                    <textarea className={`${inputCls} min-h-[80px]`} rows={item.element === 'quoted_paragraph' ? 3 : 6}
                        placeholder={item.element === 'quoted_paragraph' ? 'Quoted Paragraph' : 'Paragraph'}
                        onChange={e => isGrid ? paragraphValueGrid(e, gridParent, box_index, gridSub, gridType) : paragraphValue(e, index, box_index)}
                        value={el.paragraph || ''} />
                </div>

            case 'code_highlights':
                return <div key={`${box_index}-${currentIndex}`} className={elCls}>{elHeader}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                        <div><label className={labelCls}>Language</label>
                            <select className={`${selectCls} w-full text-xs`} value={el.language || 'javascript'}
                                onChange={e => isGrid ? selectValueGrid(e, gridParent, box_index, 'language', gridSub, gridType) : selectValue(e, index, box_index, 'language')}>
                                {['javascript', 'python', 'java', 'c', 'cpp', 'csharp', 'php', 'ruby', 'go', 'rust', 'typescript', 'html', 'css', 'json', 'bash', 'sql'].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div><label className={labelCls}>Theme</label>
                            <select className={`${selectCls} w-full text-xs`} value={el.theme || 'srcery'}
                                onChange={e => isGrid ? selectValueGrid(e, gridParent, box_index, 'theme', gridSub, gridType) : selectValue(e, index, box_index, 'theme')}>
                                {Object.keys(hljsStyles).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div><label className={labelCls}>Filename</label>
                            <input type="text" className={`${inputCls} text-xs`} value={el.name || ''} placeholder="optional"
                                onChange={e => isGrid ? nameValueGrid(e, gridParent, box_index, gridSub, gridType) : nameValue(e, index, box_index)} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-medium ${subText}`}>Code</span>
                        <button className={`text-[10px] ${isLight ? 'text-blue-500' : 'text-blue-400'}`}
                            onClick={() => setCodePreview(prev => ({ ...prev, [`${box_index}-${index}`]: !prev[`${box_index}-${index}`] }))}>
                            {codePreview[`${box_index}-${index}`] ? 'Edit' : 'Preview'}
                        </button>
                    </div>
                    {codePreview[`${box_index}-${index}`]
                        ? <SyntaxHighlighter language={el.language || 'javascript'} style={hljsStyles[el.theme] || hljsStyles.srcery} customStyle={{ fontSize: '11px', borderRadius: '8px' }}>{el.paragraph || ''}</SyntaxHighlighter>
                        : <textarea className={`${inputCls} min-h-[120px] font-mono text-xs`} rows={8} placeholder="Code..."
                            onChange={e => isGrid ? paragraphValueGrid(e, gridParent, box_index, gridSub, gridType) : paragraphValue(e, index, box_index)}
                            value={el.paragraph || ''} />
                    }
                </div>

            case 'single_image': {
                const singleImgH = el.type === 'boxed-full' ? 'h-64' : el.type === 'rectangular' ? 'h-40' : 'h-auto max-h-60'
                const singleUploadKey = `${box_index}-${currentIndex}-image`
                return <div key={`${box_index}-${currentIndex}`} className={elCls}>{elHeader}
                    <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-2">
                        <label className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-all text-xs flex-shrink-0 ${contentUploading[singleUploadKey] ? 'opacity-50 pointer-events-none' : ''} ${isLight ? 'border-slate-200 hover:border-blue-400 text-slate-400' : 'border-[#333] hover:border-blue-500 text-gray-500'}`}>
                            {contentUploading[singleUploadKey]
                                ? <><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Uploading</>
                                : <><FontAwesomeIcon icon={faCloudUploadAlt} />Upload</>
                            }
                            <input type="file" accept="image/*" className="hidden"
                                onChange={e => handleContentImageUpload(e, index, box_index, 'image', isGrid, gridType, gridParent, gridSub)} />
                        </label>
                        <input type="text" className={`${inputCls} flex-1`} placeholder="or paste image URL"
                            onChange={e => isGrid ? singleInputValueGrid(e, gridParent, box_index, gridSub, gridType) : singleInputValue(e, index, box_index)}
                            value={el.image || ''} />
                    </div>
                    <div className="mb-2">
                        <label className={labelCls}>Dimension</label>
                        <select className={`${selectCls} w-full text-xs`} value={el.type || 'rectangular'}
                            onChange={e => isGrid ? typeValueGrid(e, gridParent, box_index, gridSub, gridType) : typeValue(e, index, box_index)}>
                            <option value="rectangular">Rectangular (240px)</option>
                            <option value="boxed-full">Boxed Full (500px)</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>
                    {el.image && <img src={el.image} alt="" className={`w-full ${singleImgH} object-cover rounded-lg`} />}
                </div>
            }

            case 'grid_image': {
                const gridImgH = el.type === 'boxed-full' ? 'h-52' : el.type === 'boxed' ? 'h-28' : 'h-28'
                const gridUploadKey = `${box_index}-${currentIndex}-input`
                return <div key={`${box_index}-${currentIndex}`} className={elCls}>{elHeader}
                    <div className="flex items-center gap-2 mb-2">
                        <label className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-all text-xs flex-shrink-0 ${contentUploading[gridUploadKey] ? 'opacity-50 pointer-events-none' : ''} ${isLight ? 'border-slate-200 hover:border-blue-400 text-slate-400' : 'border-[#333] hover:border-blue-500 text-gray-500'}`}>
                            {contentUploading[gridUploadKey]
                                ? <><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Uploading</>
                                : <><FontAwesomeIcon icon={faCloudUploadAlt} />Upload</>
                            }
                            <input type="file" accept="image/*" className="hidden"
                                onChange={e => handleContentImageUpload(e, index, box_index, 'input', isGrid, gridType, gridParent, gridSub)} />
                        </label>
                        <input type="text" className={`${inputCls} flex-1`} placeholder="or paste image URL"
                            onChange={e => isGrid ? gridInputValueGrid(e, gridParent, box_index, gridSub, gridType) : gridInputValue(e, index, box_index)}
                            value={el.input || ''} />
                        <button onClick={() => isGrid ? addGridContentImageGrid(gridParent, box_index, gridSub, gridType) : addGridContentImage(index, box_index)}
                            className={`${btnPrimary} py-2 px-3 text-xs`}>Add</button>
                    </div>
                    <div className="mb-2"><label className={labelCls}>Dimension</label>
                        <select className={`${selectCls} w-full text-xs`} value={el.type || 'boxed'}
                            onChange={e => isGrid ? typeValueGrid(e, gridParent, box_index, gridSub, gridType) : typeValue(e, index, box_index)}>
                            <option value="boxed">Boxed (2 columns)</option>
                            <option value="boxed-full">Boxed Full (1 column, 500px)</option>
                        </select>
                    </div>
                    {el.grid_image?.length > 0 && <div className={`grid ${el.type === 'boxed' ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mt-2`}>
                        {el.grid_image.map((img, gi) => (
                            <div key={gi} className="relative group">
                                <img src={img} alt="" className={`w-full ${gridImgH} object-cover rounded-lg`} />
                                <button onClick={() => isGrid ? removeGridContentImageGrid(gridParent, gi, box_index, gridSub, gridType) : removeGridContentImage(index, gi, box_index)}
                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px]">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        ))}
                    </div>}
                </div>
            }

            case 'slider': {
                const sliderUploadKey = `${box_index}-${currentIndex}-input`
                return <div key={`${box_index}-${currentIndex}`} className={elCls}>{elHeader}
                    <div className="flex items-center gap-2 mb-2">
                        <label className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-all text-xs flex-shrink-0 ${contentUploading[sliderUploadKey] ? 'opacity-50 pointer-events-none' : ''} ${isLight ? 'border-slate-200 hover:border-blue-400 text-slate-400' : 'border-[#333] hover:border-blue-500 text-gray-500'}`}>
                            {contentUploading[sliderUploadKey]
                                ? <><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Uploading</>
                                : <><FontAwesomeIcon icon={faCloudUploadAlt} />Upload</>
                            }
                            <input type="file" accept="image/*" className="hidden"
                                onChange={e => handleContentImageUpload(e, index, box_index, 'input', isGrid, gridType, gridParent, gridSub)} />
                        </label>
                        <input type="text" className={`${inputCls} flex-1`} placeholder="or paste image URL"
                            onChange={e => isGrid ? gridInputValueGrid(e, gridParent, box_index, gridSub, gridType) : gridInputValue(e, index, box_index)}
                            value={el.input || ''} />
                        <button onClick={() => isGrid ? addGridContentImageGrid(gridParent, box_index, gridSub, gridType) : addGridContentImage(index, box_index)}
                            className={`${btnPrimary} py-2 px-3 text-xs`}>Add</button>
                    </div>
                    {el.grid_image?.length > 0 && <Carousel responsive={CAROUSEL_RESPONSIVE} showDots infinite autoPlay swipeable slidesToSlide={1} className="rounded-lg overflow-hidden">
                        {el.grid_image.map((img, si) => (
                            <div key={si} className="relative">
                                <img src={img} alt="" className="w-full h-48 object-cover" />
                                <button onClick={() => isGrid ? removeGridContentImageGrid(gridParent, si, box_index, gridSub, gridType) : removeGridContentImage(index, si, box_index)}
                                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center text-[8px]">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        ))}
                    </Carousel>}
                </div>
            }

            case 'bullet_list':
            case 'number_list': {
                const ListTag = item.element === 'number_list' ? 'ol' : 'ul'
                const listStyle = item.element === 'number_list' ? 'list-decimal' : 'list-disc'
                return <div key={`${box_index}-${currentIndex}`} className={elCls}>{elHeader}
                    <div className="flex items-center gap-2 mb-2">
                        <input type="text" className={`${inputCls} flex-1`} placeholder="List item"
                            onChange={e => isGrid ? listInputValueGrid(e, gridParent, box_index, gridSub, gridType) : listInputValue(e, index, box_index)}
                            value={el.input || ''}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); isGrid ? addListsGrid(gridParent, box_index, gridSub, gridType) : addLists(index, box_index) } }} />
                        <button onClick={() => isGrid ? addListsGrid(gridParent, box_index, gridSub, gridType) : addLists(index, box_index)}
                            className={`${btnPrimary} py-2 px-3 text-xs`}>Add</button>
                    </div>
                    {el.list?.length > 0 && <ListTag className={`${listStyle} pl-5 space-y-1`}>
                        {el.list.map((li, li_i) => (
                            <li key={li_i} className={`text-xs group/li ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="flex-1">{li}</span>
                                    <button onClick={() => isGrid ? removeListsGrid(gridParent, li_i, box_index, gridSub, gridType) : removeLists(index, li_i, box_index)}
                                        className="opacity-0 group-hover/li:opacity-100 text-red-400 hover:text-red-500 transition-opacity flex-shrink-0">
                                        <FontAwesomeIcon icon={faTimes} className="text-[8px]" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ListTag>}
                </div>
            }

            case 'list_image':
                return <div key={`${box_index}-${currentIndex}`} className={elCls}>{elHeader}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        <div><label className={labelCls}>Image URL</label>
                            <input type="text" className={`${inputCls} text-xs`} placeholder="Image URL"
                                onChange={e => isGrid ? listInputValueMultiGrid(e, gridParent, box_index, 'image', gridSub, gridType) : listInputValueMulti(e, index, box_index, 'image')}
                                value={el.image_input || ''} />
                        </div>
                        <div><label className={labelCls}>Link URL</label>
                            <input type="text" className={`${inputCls} text-xs`} placeholder="Link URL"
                                onChange={e => isGrid ? listInputValueMultiGrid(e, gridParent, box_index, 'link', gridSub, gridType) : listInputValueMulti(e, index, box_index, 'link')}
                                value={el.link_input || ''} />
                        </div>
                        <div><label className={labelCls}>Heading</label>
                            <input type="text" className={`${inputCls} text-xs`} placeholder="Heading"
                                onChange={e => isGrid ? listInputValueMultiGrid(e, gridParent, box_index, 'heading', gridSub, gridType) : listInputValueMulti(e, index, box_index, 'heading')}
                                value={el.heading_input || ''} />
                        </div>
                        <div><label className={labelCls}>Sub Heading</label>
                            <input type="text" className={`${inputCls} text-xs`} placeholder="Sub heading"
                                onChange={e => isGrid ? listInputValueMultiGrid(e, gridParent, box_index, 'sub_heading', gridSub, gridType) : listInputValueMulti(e, index, box_index, 'sub_heading')}
                                value={el.sub_input || ''} />
                        </div>
                    </div>
                    <button onClick={() => isGrid ? addListsMultiGrid(gridParent, box_index, gridSub, gridType) : addListsMulti(index, box_index)}
                        className={`${btnPrimary} py-1.5 px-3 text-xs mb-2`}>Add Item</button>
                    {el.list?.length > 0 && <div className="space-y-1">
                        {el.list.map((li, li_i) => (
                            <div key={li_i} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${isLight ? 'bg-white border border-solid border-slate-100' : 'bg-[#0e0e0e] border border-solid border-[#222]'}`}>
                                {li.image && <img src={li.image} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{li.heading}</p>
                                    {li.sub_heading && <p className={`text-[10px] truncate ${subText}`}>{li.sub_heading}</p>}
                                </div>
                                <button onClick={() => isGrid ? removeListsGrid(gridParent, li_i, box_index, gridSub, gridType) : removeLists(index, li_i, box_index)}
                                    className="text-red-400 hover:text-red-500"><FontAwesomeIcon icon={faTimes} className="text-[10px]" /></button>
                            </div>
                        ))}
                    </div>}
                </div>

            case 'download_list':
                return <div key={`${box_index}-${currentIndex}`} className={elCls}>{elHeader}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                        <div><label className={labelCls}>Name</label>
                            <input type="text" className={`${inputCls} text-xs`} placeholder="File name"
                                onChange={e => isGrid ? gridInputValueGrid(e, gridParent, box_index, gridSub, gridType) : gridInputValue(e, index, box_index)}
                                value={el.input || ''} />
                        </div>
                        <div><label className={labelCls}>Link</label>
                            <input type="text" className={`${inputCls} text-xs`} placeholder="Download link"
                                onChange={e => isGrid ? linkValueGrid(e, gridParent, box_index, gridSub, gridType) : linkValue(e, index, box_index)}
                                value={el.link || ''} />
                        </div>
                        <div><label className={labelCls}>Icon</label>
                            <input type="text" className={`${inputCls} text-xs`} placeholder="fa-file-download"
                                onChange={e => {
                                    if (isGrid) { updateContent(arr => { arr[box_index].container[gridParent][gridType][gridSub].icon = e.target.value }) }
                                    else selectValue(e, index, box_index, 'icon')
                                }}
                                value={el.icon || ''} />
                        </div>
                    </div>
                    <button onClick={() => isGrid ? addListsDownloadsGrid(gridParent, box_index, gridSub, gridType) : addListsDownloads(index, box_index)}
                        className={`${btnPrimary} py-1.5 px-3 text-xs mb-2`}>Add Download</button>
                    {el.list?.length > 0 && <div className="space-y-1">
                        {el.list.map((dl, di) => (
                            <div key={di} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${isLight ? 'bg-white border border-solid border-slate-100' : 'bg-[#0e0e0e] border border-solid border-[#222]'}`}>
                                <FontAwesomeIcon icon={resolveIcon(dl.icon)} className="text-blue-500 flex-shrink-0" />
                                <span className={`flex-1 truncate ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{dl.name}</span>
                                <a href={dl.link} target="_blank" rel="noreferrer" className="text-blue-500"><FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" /></a>
                                <button onClick={() => isGrid ? removeListsGrid(gridParent, di, box_index, gridSub, gridType) : removeLists(index, di, box_index)}
                                    className="text-red-400 hover:text-red-500"><FontAwesomeIcon icon={faTimes} className="text-[10px]" /></button>
                            </div>
                        ))}
                    </div>}
                </div>

            case 'grid_column':
                if (isGrid) return null
                return <div key={`${box_index}-${currentIndex}`} className={elCls}>{elHeader}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['grid1', 'grid2'].map(gType => (
                            <div key={gType} className={`rounded-lg p-3 ${isLight ? 'bg-white border border-solid border-slate-200' : 'bg-[#0e0e0e] border border-solid border-[#2B2B2B]'}`}>
                                <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${subText}`}>Column {gType === 'grid1' ? '1' : '2'}</div>
                                <ElementPicker
                                    value={gType === 'grid1' ? contentGrid1Selected : contentGrid2Selected}
                                    onChange={v => gType === 'grid1' ? setContentGrid1Selected(v) : setContentGrid2Selected(v)}
                                    onAdd={() => addContentElementsGrid(index, box_index, gType)}
                                    types={GRID_ELEMENT_TYPES}
                                />
                                <div className="mt-2 space-y-1">
                                    {el[gType]?.map((subEl, si) => renderElementEditor(subEl, index, box_index, true, gType, index, si))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            default: return null
        }
    }

    /* ─── Table Columns ─── */

    const columns = [
        { key: 'post_title', label: 'Title', align: 'left' },
        { key: 'categories', label: 'Category', align: 'left', hide: 'sm' },
        { key: 'created_for', label: 'Purpose', align: 'left', hide: 'md' },
        { key: 'date_start', label: 'Date', align: 'left', hide: 'lg' },
        { key: 'views', label: 'Views', align: 'center', hide: 'lg' },
        { key: 'likes', label: 'Likes', align: 'center', hide: 'lg' },
        { key: 'comments', label: 'Comments', align: 'center', hide: 'lg' },
    ]

    const SortIcon = ({ col }) => {
        if (sortKey !== col) return <FontAwesomeIcon icon={faSort} className="ml-1 opacity-0 group-hover/th:opacity-50" />
        return <FontAwesomeIcon icon={sortDir === 'asc' ? faSortUp : faSortDown} className={`ml-1 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
    }

    /* ─── RENDER ─── */

    return (
        <div className={`relative overflow-hidden min-h-screen ${main.font} ${isLight ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="relative px-0 my-6 sm:my-12">

                        <Notification theme={theme} data={notification} show={showNotif} setShow={setShowNotif} />

                        {/* ── Confirm Modal ── */}
                        {confirmModal.open && (
                            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}>
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                                <div className={`relative ${card} p-6 max-w-sm w-full rounded-2xl shadow-2xl`} onClick={e => e.stopPropagation()}>
                                    <div className="flex flex-col items-center text-center">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${confirmModal.variant === 'danger' ? (isLight ? 'bg-red-100' : 'bg-red-900/30') : (isLight ? 'bg-amber-100' : 'bg-amber-900/30')}`}>
                                            <FontAwesomeIcon icon={confirmModal.icon || faTrash} className={`text-lg ${confirmModal.variant === 'danger' ? 'text-red-500' : 'text-amber-500'}`} />
                                        </div>
                                        <h3 className={`text-base font-semibold mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>{confirmModal.title}</h3>
                                        <p className={`text-xs mb-5 ${subText}`}>{confirmModal.message}</p>
                                        <div className="flex items-center gap-3 w-full">
                                            <button onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-solid transition-all ${isLight ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-[#333] text-gray-400 hover:bg-[#1a1a1a]'}`}>Cancel</button>
                                            <button onClick={confirmModal.onConfirm}
                                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${confirmModal.variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}>
                                                {confirmModal.confirmText || (confirmModal.variant === 'danger' ? 'Delete' : 'Confirm')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── View Modal ── */}
                        {viewProject && (
                            <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto py-6 sm:py-10" onClick={() => setViewProject(null)}>
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                                <div className={`relative ${card} max-w-[750px] w-full mx-4 rounded-2xl shadow-2xl`} onClick={e => e.stopPropagation()}>
                                    <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-solid ${sectionBorder}`}>
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                                                <FontAwesomeIcon icon={faEye} className={`text-sm ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                                            </div>
                                            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>View Project</h3>
                                        </div>
                                        <button onClick={() => setViewProject(null)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-500'}`}>
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                    <div className="px-4 sm:px-5 py-4 sm:py-5 space-y-5">
                                        {/* Hero */}
                                        <div className="grid sm:grid-cols-5 gap-4">
                                            <div className="sm:col-span-2">
                                                {viewProject.featured_image
                                                    ? <img src={viewProject.featured_image} alt="" className="w-full h-40 object-cover rounded-xl" onClick={() => setLightbox({ open: true, src: viewProject.featured_image })} style={{ cursor: 'pointer' }} />
                                                    : <div className={`w-full h-40 rounded-xl flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}><FontAwesomeIcon icon={faImage} className={`text-2xl ${mutedText}`} /></div>
                                                }
                                            </div>
                                            <div className="sm:col-span-3 space-y-2">
                                                <h2 className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{viewProject.post_title}</h2>
                                                <div className="flex flex-wrap gap-3 text-xs">
                                                    <span className={subText}><FontAwesomeIcon icon={faLayerGroup} className="mr-1" />{getCategoryName(viewProject.categories)}</span>
                                                    <span className={subText}><FontAwesomeIcon icon={faFile} className="mr-1" />{viewProject.created_for}</span>
                                                    {viewProject.date_start && <span className={subText}><FontAwesomeIcon icon={faCalendar} className="mr-1" />{viewProject.date_start}{viewProject.date_end ? ` — ${viewProject.date_end}` : ''}</span>}
                                                </div>
                                                <div className="flex flex-wrap gap-3 text-xs">
                                                    <span className={subText}>{viewProject.views?.length || 0} views</span>
                                                    <span className={subText}>{viewProject.likes?.length || 0} likes</span>
                                                    <span className={subText}>{viewProject.comment?.length || 0} comments</span>
                                                </div>
                                                {viewProject.tags?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 pt-1">
                                                        {viewProject.tags.map((t, i) => (
                                                            <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-medium ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/30 text-blue-400'}`}>{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Content */}
                                        {viewProject.content?.map((box, bi) => (
                                            <div key={bi}>
                                                {box.header && <h3 className={`text-sm font-bold mb-2 pb-1 border-b border-solid ${sectionBorder} ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{box.header}</h3>}
                                                <div className="space-y-3">
                                                    {box.container?.map((item, ci) => renderViewElement(item, `${bi}-${ci}`))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Lightbox ── */}
                        {lightbox.open && (
                            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox({ open: false, src: '' })}>
                                <img src={lightbox.src} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
                                <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" onClick={() => setLightbox({ open: false, src: '' })}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        )}

                        {/* ── Header Card ── */}
                        <div className={`${card} p-4 sm:p-5 mb-4`}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                                        <FontAwesomeIcon icon={faProjectDiagram} className={`text-lg ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                                    </div>
                                    <div>
                                        <h1 className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Project Manager</h1>
                                        <p className={`text-xs ${subText}`}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                {activeTab === 'projects' && (view === 'form' ? (
                                    <button onClick={() => { resetForm(); setView('list') }} className={`${btnSecondary} flex items-center gap-2`}>
                                        <FontAwesomeIcon icon={faList} className="text-xs" /><span>Back to List</span>
                                    </button>
                                ) : (
                                    <button onClick={openCreate} className={`${btnPrimary} flex items-center gap-2`}>
                                        <FontAwesomeIcon icon={faPlus} className="text-xs" /><span>Add Project</span>
                                    </button>
                                ))}
                            </div>
                            {view !== 'form' && (
                                <div className={`flex items-center gap-1 mt-3 pt-3 border-t border-solid overflow-x-auto scrollbar-hide ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                    <button onClick={() => setActiveTab('projects')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'projects'
                                            ? (isLight ? 'bg-purple-50 text-purple-600' : 'bg-purple-900/20 text-purple-400')
                                            : (isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]')
                                        }`}>
                                        <FontAwesomeIcon icon={faProjectDiagram} className="text-[10px]" /> My Projects
                                    </button>
                                    <button onClick={() => setActiveTab('categories')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'categories'
                                            ? (isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-900/20 text-amber-400')
                                            : (isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]')
                                        }`}>
                                        <FontAwesomeIcon icon={faLayerGroup} className="text-[10px]" /> Categories
                                        {category?.length > 0 && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'categories'
                                                ? (isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-400')
                                                : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500')
                                            }`}>{category.length}</span>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ========== CATEGORIES TAB ========== */}
                        {activeTab === 'categories' && (
                            <div className={`${card}`}>
                                <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-solid ${sectionBorder}`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-amber-100' : 'bg-amber-900/30'}`}>
                                            <FontAwesomeIcon icon={faLayerGroup} className={`text-sm ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                                        </div>
                                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Manage Categories</h3>
                                    </div>
                                    <button onClick={() => { if (showCatForm && !editCatId) { setShowCatForm(false) } else { cancelCatEdit(); setShowCatForm(true) } }}
                                        className={`flex items-center gap-1.5 ${showCatForm ? btnSecondary : btnPrimary} text-xs`}>
                                        <FontAwesomeIcon icon={showCatForm ? faTimes : faPlus} className="text-[10px]" />
                                        <span>{showCatForm ? 'Close' : 'Add Category'}</span>
                                    </button>
                                </div>
                                <div className="px-4 sm:px-5 py-4 space-y-4">
                                    {/* Add / Edit Form */}
                                    {showCatForm && (
                                        <div className={`rounded-xl border border-solid p-4 ${editCatId
                                            ? (isLight ? 'border-blue-200 bg-blue-50/30' : 'border-blue-800/50 bg-blue-900/10')
                                            : (isLight ? 'border-slate-200 bg-slate-50/50' : 'border-[#2B2B2B] bg-[#0a0a0a]')
                                        }`}>
                                            <p className={`text-xs font-semibold mb-3 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{editCatId ? 'Edit Category' : 'New Category'}</p>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <div className="flex-1">
                                                    <label className={labelCls}>Name *</label>
                                                    <input type="text" className={inputCls} value={catForm.name}
                                                        onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="Category name"
                                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCatSubmit() } }} />
                                                </div>
                                                <div className="flex-1">
                                                    <label className={labelCls}>Short Name</label>
                                                    <input type="text" className={inputCls} value={catForm.description}
                                                        onChange={e => setCatForm({ ...catForm, description: e.target.value })} placeholder="e.g. web, mobile, api"
                                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCatSubmit() } }} />
                                                </div>
                                                <div className="flex-1 relative">
                                                    <label className={labelCls}>Icon</label>
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={() => setShowIconPicker(!showIconPicker)}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-solid transition-all w-full ${isLight ? 'bg-white border-slate-200 hover:border-blue-400 text-slate-600' : 'bg-[#1a1a1a] border-[#333] hover:border-blue-500 text-gray-300'}`}>
                                                            {catForm.image ? (
                                                                <><FontAwesomeIcon icon={resolveIcon(catForm.image)} className="text-blue-500" /><span className="text-xs truncate">{catForm.image}</span></>
                                                            ) : (
                                                                <><FontAwesomeIcon icon={faImage} className={mutedText} /><span className={`text-xs ${mutedText}`}>Select icon</span></>
                                                            )}
                                                        </button>
                                                        {catForm.image && (
                                                            <button onClick={() => setCatForm({ ...catForm, image: '' })}
                                                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isLight ? 'text-red-400 hover:bg-red-50' : 'text-red-500 hover:bg-red-900/20'}`}>
                                                                <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {showIconPicker && (
                                                        <div className={`absolute z-50 mt-1 left-0 w-full sm:w-80 rounded-xl border border-solid shadow-2xl ${isLight ? 'bg-white border-slate-200' : 'bg-[#141414] border-[#2B2B2B]'}`}>
                                                            <div className={`p-3 border-b border-solid ${sectionBorder}`}>
                                                                <div className="relative">
                                                                    <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${mutedText}`} />
                                                                    <input type="text" className={`${inputCls} pl-8`} placeholder="Search icons..."
                                                                        value={iconSearch} onChange={e => setIconSearch(e.target.value)} autoFocus />
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-8 gap-1 p-3 max-h-52 overflow-y-auto">
                                                                {filteredIcons.length > 0 ? filteredIcons.map(ic => {
                                                                    const def = findIconDefinition({ prefix: 'fas', iconName: ic })
                                                                    if (!def) return null
                                                                    return (
                                                                        <button key={ic} type="button" onClick={() => selectIcon(ic)} title={ic}
                                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${catForm.image === ic
                                                                                ? (isLight ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-400' : 'bg-blue-900/30 text-blue-400 ring-2 ring-blue-500')
                                                                                : (isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1a1a1a] text-gray-400')
                                                                            }`}>
                                                                            <FontAwesomeIcon icon={def} className="text-sm" />
                                                                        </button>
                                                                    )
                                                                }) : (
                                                                    <div className={`col-span-8 py-4 text-center text-xs ${mutedText}`}>No icons found</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-3">
                                                <button onClick={handleCatSubmit} disabled={catSubmitting || !catForm.name}
                                                    className={`${btnPrimary} flex items-center gap-2 text-xs disabled:opacity-50`}>
                                                    {catSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                                    <FontAwesomeIcon icon={editCatId ? faCheck : faPlus} className="text-[10px]" />
                                                    <span>{editCatId ? 'Update' : 'Add'}</span>
                                                </button>
                                                {editCatId && (
                                                    <button onClick={cancelCatEdit} className={`${btnSecondary} text-xs`}>Cancel</button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/* Category List */}
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-10">
                                            <span className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isLight ? 'border-amber-400' : 'border-amber-600'}`} />
                                        </div>
                                    ) : category?.length > 0 ? (
                                        <div className="space-y-2">
                                            {category.map(cat => (
                                                <div key={cat._id}
                                                    className={`flex items-center justify-between px-4 py-3 rounded-xl border border-solid transition-all ${editCatId === cat._id
                                                        ? (isLight ? 'border-blue-200 bg-blue-50/50' : 'border-blue-800 bg-blue-900/10')
                                                        : (isLight ? 'border-slate-100 hover:border-slate-200 bg-white' : 'border-[#1f1f1f] hover:border-[#2B2B2B] bg-[#0e0e0e]')
                                                    }`}>
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-amber-50' : 'bg-amber-900/20'}`}>
                                                            <FontAwesomeIcon icon={resolveIcon(cat.image)} className={`text-sm ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{cat.name}</p>
                                                                {cat.description && (
                                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#1a1a1a] text-gray-400'}`}>{cat.description}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                                                        <button onClick={() => handleCatEdit(cat)} title="Edit"
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isLight ? 'text-amber-500 hover:bg-amber-50' : 'text-amber-400 hover:bg-amber-900/20'}`}>
                                                            <FontAwesomeIcon icon={faPen} className="text-xs" />
                                                        </button>
                                                        <button onClick={() => handleCatDelete(cat)} title="Delete"
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isLight ? 'text-red-400 hover:bg-red-50' : 'text-red-500 hover:bg-red-900/20'}`}>
                                                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 py-10">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                                <FontAwesomeIcon icon={faLayerGroup} className={`text-xl ${mutedText}`} />
                                            </div>
                                            <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>No categories yet</p>
                                            <p className={`text-xs ${mutedText}`}>Click "Add Category" to get started</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── List View ── */}
                        {activeTab === 'projects' && view === 'list' && (
                            <div className={`${card} overflow-hidden`}>
                                {/* Toolbar */}
                                <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-solid ${sectionBorder}`}>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setShowFilters(!showFilters)}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-solid transition-all ${showFilters
                                                ? (isLight ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-blue-900/20 border-blue-800 text-blue-400')
                                                : (isLight ? 'border-slate-200 text-slate-500 hover:bg-slate-50' : 'border-[#333] text-gray-400 hover:bg-[#1a1a1a]')}`}>
                                            <FontAwesomeIcon icon={faFilter} />
                                            <span>Filters</span>
                                            {activeFilterCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${mutedText}`} />
                                        <input type="text" className={`${inputCls} pl-8 w-full sm:w-64`} placeholder="Search projects..."
                                            value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
                                    </div>
                                </div>
                                {/* Filters Row */}
                                {showFilters && (
                                    <div className={`flex flex-wrap items-center gap-2 px-4 sm:px-5 py-2.5 border-b border-solid ${sectionBorder}`}>
                                        <select className={`${selectCls} text-xs py-1.5`} value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(0) }}>
                                            <option value="">All Categories</option>
                                            {category?.map((c, i) => <option key={i} value={c._id}>{c.name || c.category}</option>)}
                                        </select>
                                        <select className={`${selectCls} text-xs py-1.5`} value={filterPurpose} onChange={e => { setFilterPurpose(e.target.value); setPage(0) }}>
                                            <option value="">All Purposes</option>
                                            {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        {activeFilterCount > 0 && <button onClick={clearFilters} className={`text-xs font-medium ${isLight ? 'text-blue-500' : 'text-blue-400'}`}>Clear</button>}
                                    </div>
                                )}
                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className={isLight ? 'bg-slate-50/80' : 'bg-[#0a0a0a]'}>
                                                <th className={`px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider ${subText}`} style={{ width: 50 }}>#</th>
                                                {columns.map(col => (
                                                    <th key={col.key}
                                                        className={`px-3 py-2.5 text-${col.align} text-[11px] font-semibold uppercase tracking-wider cursor-pointer group/th ${subText} ${col.hide ? `hidden ${col.hide}:table-cell` : ''}`}
                                                        onClick={() => handleSort(col.key)}>
                                                        {col.label}<SortIcon col={col.key} />
                                                    </th>
                                                ))}
                                                <th className={`px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider ${subText}`}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-[#1a1a1a]'}`}>
                                            {isLoading ? (
                                                <tr><td colSpan={columns.length + 2} className="py-16 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <span className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isLight ? 'border-blue-400' : 'border-blue-600'}`} />
                                                        <span className={`text-xs ${subText}`}>Loading projects...</span>
                                                    </div>
                                                </td></tr>
                                            ) : pageData.length === 0 ? (
                                                <tr><td colSpan={columns.length + 2} className="py-16 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                                            <FontAwesomeIcon icon={faProjectDiagram} className={`text-xl ${mutedText}`} />
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>No projects found</p>
                                                            <p className={`text-xs mt-0.5 ${subText}`}>{activeFilterCount > 0 || search ? 'Try adjusting your filters' : 'Create your first project'}</p>
                                                        </div>
                                                        {(activeFilterCount > 0 || search) && <button onClick={() => { clearFilters(); setSearch('') }} className={`text-xs font-medium ${isLight ? 'text-blue-500' : 'text-blue-400'}`}>Clear all filters</button>}
                                                    </div>
                                                </td></tr>
                                            ) : pageData.map((p, i) => (
                                                <tr key={p._id || i} className={`transition-colors ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-[#111]'}`}>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                                                {p.featured_image
                                                                    ? <img src={p.featured_image} alt="" className="w-full h-full object-cover" />
                                                                    : <div className="w-full h-full flex items-center justify-center"><FontAwesomeIcon icon={faImage} className={`text-[10px] ${mutedText}`} /></div>
                                                                }
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <p className={`text-xs font-medium truncate max-w-[200px] ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{p.post_title}</p>
                                                    </td>
                                                    <td className={`px-3 py-2.5 hidden sm:table-cell`}>
                                                        <span className={`text-xs ${subText}`}>{getCategoryName(p.categories)}</span>
                                                    </td>
                                                    <td className={`px-3 py-2.5 hidden md:table-cell`}>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#1a1a1a] text-gray-400'}`}>{p.created_for}</span>
                                                    </td>
                                                    <td className={`px-3 py-2.5 hidden lg:table-cell`}>
                                                        <span className={`text-xs ${subText}`}>{p.date_start || '—'}</span>
                                                    </td>
                                                    <td className={`px-3 py-2.5 text-center hidden lg:table-cell`}>
                                                        <span className={`text-xs ${subText}`}>{p.views?.length || 0}</span>
                                                    </td>
                                                    <td className={`px-3 py-2.5 text-center hidden lg:table-cell`}>
                                                        <span className={`text-xs ${subText}`}>{p.likes?.length || 0}</span>
                                                    </td>
                                                    <td className={`px-3 py-2.5 text-center hidden lg:table-cell`}>
                                                        <span className={`text-xs ${subText}`}>{p.comment?.length || 0}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button title="View" onClick={() => setViewProject(p)}
                                                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-blue-500 ${isLight ? 'hover:bg-blue-50' : 'hover:bg-blue-900/20'}`}>
                                                                <FontAwesomeIcon icon={faEye} className="text-xs" />
                                                            </button>
                                                            <button title="Edit" onClick={() => openEdit(p, projects.indexOf(p))}
                                                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-amber-500 ${isLight ? 'hover:bg-amber-50' : 'hover:bg-amber-900/20'}`}>
                                                                <FontAwesomeIcon icon={faPen} className="text-xs" />
                                                            </button>
                                                            <button title="Delete" onClick={() => handleDelete(projects.indexOf(p))}
                                                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-red-500 ${isLight ? 'hover:bg-red-50' : 'hover:bg-red-900/20'}`}>
                                                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination Footer */}
                                {processed.length > 0 && (
                                    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-solid ${sectionBorder}`}>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs ${subText}`}>{page * pageSize + 1}–{Math.min((page + 1) * pageSize, processed.length)} of {processed.length}</span>
                                            <span className={`text-xs ${mutedText}`}>|</span>
                                            <span className={`text-xs ${subText}`}>Show</span>
                                            <select className={`${selectCls} text-xs py-1`} value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0) }}>
                                                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button disabled={page === 0} onClick={() => setPage(0)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1a1a1a] text-gray-400'}`}><FontAwesomeIcon icon={faAngleDoubleLeft} /></button>
                                            <button disabled={page === 0} onClick={() => setPage(page - 1)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1a1a1a] text-gray-400'}`}><FontAwesomeIcon icon={faChevronLeft} /></button>
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                                                let p0 = Math.max(0, Math.min(page - 2, totalPages - 5))
                                                const pNum = p0 + idx
                                                if (pNum >= totalPages) return null
                                                return (
                                                    <button key={pNum} onClick={() => setPage(pNum)}
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${pNum === page
                                                            ? (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                                                            : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#1a1a1a]')}`}>
                                                        {pNum + 1}
                                                    </button>
                                                )
                                            })}
                                            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1a1a1a] text-gray-400'}`}><FontAwesomeIcon icon={faChevronRight} /></button>
                                            <button disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors disabled:opacity-30 ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1a1a1a] text-gray-400'}`}><FontAwesomeIcon icon={faAngleDoubleRight} /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Form View ── */}
                        {activeTab === 'projects' && view === 'form' && (
                            <div className="space-y-4">
                                {/* Basic Info Section */}
                                <div className={`${card} overflow-hidden`}>
                                    <div className={`flex items-center gap-2.5 px-4 sm:px-5 py-3.5 border-b border-solid ${sectionBorder}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                                            <FontAwesomeIcon icon={faProjectDiagram} className={`text-sm ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                                        </div>
                                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{editIndex !== null ? 'Edit Project' : 'New Project'}</h3>
                                    </div>
                                    <div className="px-4 sm:px-5 py-4 space-y-3">
                                        {/* Featured Image */}
                                        <div>
                                            <label className={labelCls}>Featured Image</label>
                                            {form.featured_image ? (
                                                <div className="relative group w-fit">
                                                    <img src={form.featured_image} alt="" className={`h-36 sm:h-40 object-cover rounded-xl border border-solid ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`} />
                                                    <button onClick={removeImage} type="button"
                                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                        <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                                                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${uploadingImage ? 'opacity-50 pointer-events-none' : ''} ${isLight
                                                        ? 'border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 text-slate-400 hover:text-purple-500'
                                                        : 'border-[#333] hover:border-purple-500 hover:bg-purple-900/10 text-gray-500 hover:text-purple-400'}`}>
                                                        {uploadingImage
                                                            ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /><span className="text-xs font-medium">Uploading...</span></>
                                                            : <><FontAwesomeIcon icon={faCloudUploadAlt} className="text-lg" /><span className="text-xs font-medium">Upload Image</span></>
                                                        }
                                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                                                    </label>
                                                    <div className={`flex items-center gap-2 text-[10px] font-medium ${mutedText}`}>
                                                        <div className={`h-px flex-1 sm:w-px sm:h-6 sm:flex-none ${isLight ? 'bg-slate-200' : 'bg-[#2B2B2B]'}`} />OR
                                                        <div className={`h-px flex-1 sm:w-px sm:h-6 sm:flex-none ${isLight ? 'bg-slate-200' : 'bg-[#2B2B2B]'}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <input type="text" className={`${inputCls} h-full`} value={form.featured_image}
                                                            onChange={e => setForm({ ...form, featured_image: e.target.value })} placeholder="Paste image URL..." />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Title */}
                                        <div><label className={labelCls}>Project Title *</label>
                                            <input type="text" className={inputCls} value={form.post_title}
                                                onChange={e => setForm({ ...form, post_title: e.target.value })} placeholder="Project title" />
                                        </div>
                                        {/* Dates */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div><label className={labelCls}>Date Started</label>
                                                <input type="date" className={inputCls} value={form.date_start}
                                                    onChange={e => setForm({ ...form, date_start: e.target.value })} />
                                            </div>
                                            <div><label className={labelCls}>Date Ended</label>
                                                <input type="date" className={inputCls} value={form.date_end}
                                                    onChange={e => setForm({ ...form, date_end: e.target.value })} />
                                            </div>
                                        </div>
                                        {/* Purpose + Category */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div><label className={labelCls}>Purpose</label>
                                                <select className={`${selectCls} w-full`} value={form.created_for}
                                                    onChange={e => setForm({ ...form, created_for: e.target.value })}>
                                                    {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                            <div><label className={labelCls}>Category</label>
                                                <select className={`${selectCls} w-full`} value={form.categories}
                                                    onChange={e => setForm({ ...form, categories: e.target.value })}>
                                                    <option value="">Select category</option>
                                                {category?.length > 0 && category.map((c, i) => <option key={i} value={c._id}>{c.name || c.category}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        {/* Tags */}
                                        <div>
                                            <label className={labelCls}>Tags</label>
                                            <div className="flex items-center gap-2">
                                                <input type="text" className={`${inputCls} flex-1`} value={tagInput}
                                                    onChange={e => setTagInput(e.target.value)} placeholder="Add tag..."
                                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
                                                <button onClick={addTag} className={`${btnPrimary} py-2 px-3`}>
                                                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                                </button>
                                            </div>
                                            {form.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {form.tags.map((t, i) => (
                                                        <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${isLight ? 'bg-purple-50 text-purple-700' : 'bg-purple-900/30 text-purple-400'}`}>
                                                            {t}
                                                            <button onClick={() => removeTag(i)} className="hover:text-red-500"><FontAwesomeIcon icon={faTimes} className="text-[9px]" /></button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {/* Documentation Link */}
                                        <div>
                                            <label className={labelCls}><FontAwesomeIcon icon={faBook} className="mr-1" />Documentation Link</label>
                                            {Array.isArray(docsData) && docsData.length > 0 ? (
                                                <select className={`${selectCls} w-full`} value={form.documentation_link}
                                                    onChange={e => setForm({ ...form, documentation_link: e.target.value })}>
                                                    <option value="">No documentation linked</option>
                                                    {docsData.map((doc, i) => (
                                                        <option key={doc._id || i} value={`/documentation/${doc.doc_name || doc._id}`}>{doc.doc_name}{doc.description ? ` — ${doc.description}` : ''}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input type="text" className={inputCls} value={form.documentation_link}
                                                    onChange={e => setForm({ ...form, documentation_link: e.target.value })} placeholder="Paste documentation URL or path" />
                                            )}
                                        </div>
                                        {/* Privacy */}
                                        <div className={`rounded-lg p-3 ${isLight ? 'bg-slate-50 border border-solid border-slate-100' : 'bg-[#111] border border-solid border-[#1f1f1f]'}`}>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={form.privacy} onChange={() => setForm({ ...form, privacy: !form.privacy })}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                <span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                                    <FontAwesomeIcon icon={faLock} className="mr-1.5" />Private Project
                                                </span>
                                            </label>
                                            <p className={`text-[10px] mt-1 ml-6 ${mutedText}`}>Only accessible via access key when enabled</p>
                                        </div>
                                        {/* Access Keys */}
                                        {form.privacy && (
                                            <div className={`rounded-lg p-3 space-y-3 ${isLight ? 'bg-amber-50/50 border border-solid border-amber-200/50' : 'bg-amber-900/5 border border-solid border-amber-800/20'}`}>
                                                <div className="flex items-center justify-between">
                                                    <label className={`text-xs font-semibold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                                                        <FontAwesomeIcon icon={faKey} className="mr-1.5" />Access Keys
                                                    </label>
                                                    <button onClick={generateKey} className={`${btnPrimary} py-1 px-2.5 text-[10px] flex items-center gap-1`}>
                                                        <FontAwesomeIcon icon={faPlus} className="text-[8px]" /> Generate Key
                                                    </button>
                                                </div>
                                                {form.access_key.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {form.access_key.map((k, ki) => (
                                                            <div key={ki} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${isLight ? 'bg-white border border-solid border-amber-200/60' : 'bg-[#0e0e0e] border border-solid border-[#2B2B2B]'}`}>
                                                                <code className={`font-mono font-bold flex-1 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>{k.key}</code>
                                                                <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/projects/${editIndex !== null ? projects[editIndex]?._id : 'ID'}?access_key=${k.key}`)}
                                                                    title="Copy link" className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-500'}`}>
                                                                    <FontAwesomeIcon icon={faCopy} className="text-[10px]" />
                                                                </button>
                                                                <button onClick={() => removeKey(ki)} title="Remove"
                                                                    className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isLight ? 'hover:bg-red-50 text-red-400' : 'hover:bg-red-900/20 text-red-500'}`}>
                                                                    <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className={`text-[10px] ${mutedText}`}>No keys generated yet. Generate a key to share private access.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content Builder Section */}
                                <div className={`${card} overflow-hidden`}>
                                    <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-solid ${sectionBorder}`}>
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-cyan-100' : 'bg-cyan-900/30'}`}>
                                                <FontAwesomeIcon icon={faLayerGroup} className={`text-sm ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
                                            </div>
                                            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Content Builder</h3>
                                        </div>
                                        <button onClick={addContentContainer} className={`${btnSecondary} py-1.5 px-3 text-xs flex items-center gap-1.5`}>
                                            <FontAwesomeIcon icon={faPlus} className="text-[10px]" /><span>Container</span>
                                        </button>
                                    </div>
                                    <div className="px-4 sm:px-5 py-4 space-y-4">
                                        {form.content?.map((box, box_index) => (
                                            <div key={box_index} className={`rounded-xl border border-solid ${isLight ? 'border-slate-200 bg-white' : 'border-[#2B2B2B] bg-[#0a0a0a]'}`}>
                                                {/* Container Header */}
                                                <div className={`flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-solid ${sectionBorder}`}>
                                                    <input type="text" className={`font-semibold text-sm bg-transparent border-none outline-none flex-1 mr-2 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}
                                                        onChange={e => headerContainerValue(e, box_index)} value={form.content[box_index].header} />
                                                    <ElementActions index={box_index} total={form.content.length}
                                                        onUp={() => moveContainerUpwards(box_index)}
                                                        onDown={() => moveContainerDownwards(box_index)}
                                                        onRemove={() => removeContainer(box_index)} />
                                                </div>
                                                {/* Container Body */}
                                                <div className="px-3 sm:px-4 py-3 space-y-2 relative">
                                                    <ElementPicker value={contentSelected} onChange={setContentSelected}
                                                        onAdd={() => addContentElements(box_index)} sticky />
                                                    {form.content[box_index]?.container?.map((item, index) =>
                                                        renderElementEditor(item, index, box_index)
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Footer */}
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => { resetForm(); setView('list') }} className={btnSecondary}>Cancel</button>
                                    <button onClick={handleSubmit} disabled={submitting} className={`${btnPrimary} flex items-center gap-2 disabled:opacity-50`}>
                                        {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                        <span>{editIndex !== null ? 'Update Project' : 'Upload Project'}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectManager
