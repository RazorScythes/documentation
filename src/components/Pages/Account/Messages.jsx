import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    getConversations, getOrCreateConversation, getMessages, sendMessage,
    searchUsers, getUnreadCount, setActiveConversation, clearSearchResults,
    deleteConversationForMe, deleteMessageForMe, deleteMessageForAll,
    blockUser, unblockUser, getBlockedUsers, checkBlocked, clearBlockStatus
} from '../../../actions/chat'
import useChat from '../../../hooks/useChat'
import { dark, light } from '../../../style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faPaperPlane, faSearch, faComments, faArrowLeft, faSpinner,
    faSmile, faPaperclip, faTimes, faFile, faDownload, faImage,
    faTrash, faEllipsisV, faBan, faUnlock, faEnvelope, faXmark,
    faCircleCheck, faUserSlash, faChevronRight
} from '@fortawesome/free-solid-svg-icons'
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'

const formatTime = (dateString) => {
    if (!dateString) return ''
    const diff = Date.now() - new Date(dateString).getTime()
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24)
    if (m < 1) return 'Now'
    if (m < 60) return `${m}m`
    if (h < 24) return `${h}h`
    if (d < 7) return `${d}d`
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const formatMessageTime = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

const formatDateSeparator = (dateString) => {
    const date = new Date(dateString)
    const today = new Date(), todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffDays = Math.floor((todayStart - msgDate) / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

const isImageType = (type) => type?.startsWith('image/')

const EMOJI_RE = /(\p{Extended_Pictographic}(?:\uFE0F?\u200D\p{Extended_Pictographic})*\uFE0F?)/gu
const EMOJI_ONLY_RE = /^\p{Extended_Pictographic}/u
const toTwemojiUrl = (char) => {
    const cp = [...char].map(c => c.codePointAt(0).toString(16)).filter(h => h !== 'fe0f').join('-')
    return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${cp}.svg`
}

const EmojiText = ({ text, className }) => {
    if (!text) return null
    const parts = text.split(EMOJI_RE)
    return (
        <p className={className}>
            {parts.map((part, i) =>
                EMOJI_ONLY_RE.test(part)
                    ? <img key={i} src={toTwemojiUrl(part)} alt={part} className="inline-block w-[1.2em] h-[1.2em] align-[-0.15em] mx-[0.5px]" draggable={false} />
                    : part
            )}
        </p>
    )
}

const triggerDownload = (dataUrl, fileName) => {
    const a = document.createElement('a')
    a.href = dataUrl; a.download = fileName || 'download'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
}

const getInitialColor = (name) => {
    const c = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500']
    return c[(name || '').charCodeAt(0) % c.length]
}

const getInitialGradient = (name) => {
    const g = [
        'from-blue-500 to-blue-600', 'from-emerald-500 to-emerald-600', 'from-violet-500 to-violet-600',
        'from-rose-500 to-rose-600', 'from-amber-500 to-amber-600', 'from-cyan-500 to-cyan-600',
        'from-pink-500 to-pink-600', 'from-indigo-500 to-indigo-600'
    ]
    return g[(name || '').charCodeAt(0) % g.length]
}

const UserAvatar = ({ user, size = 'md', showOnline }) => {
    const s = { sm: 'w-8 h-8 text-[10px]', md: 'w-10 h-10 text-xs', lg: 'w-12 h-12 text-sm', xl: 'w-16 h-16 text-xl' }
    return (
        <div className="relative flex-shrink-0">
            <div className={`${s[size]} rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br ${getInitialGradient(user?.username)} shadow-sm`}>
                {user?.avatar
                    ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    : <span className="text-white font-bold">{user?.username?.[0]?.toUpperCase()}</span>}
            </div>
            {showOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#161616]" />}
        </div>
    )
}

const FileAttachment = ({ msg, isMine, isLight, onImageClick }) => {
    if (!msg.fileUrl) return null
    if (isImageType(msg.fileType)) {
        return (
            <div className="rounded-lg overflow-hidden cursor-pointer" onClick={() => onImageClick?.(msg.fileUrl, msg.fileName)}>
                <img src={msg.fileUrl} alt={msg.fileName || 'Image'} className="max-w-[260px] w-full h-auto max-h-[280px] object-contain block" />
            </div>
        )
    }
    return (
        <div className={`flex items-center gap-2.5 mb-1 p-2.5 rounded-lg cursor-pointer transition-all ${isMine ? 'bg-white/10 hover:bg-white/15' : (isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-[#222] hover:bg-[#2B2B2B]')}`} onClick={() => triggerDownload(msg.fileUrl, msg.fileName)}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isMine ? 'bg-white/10' : (isLight ? 'bg-indigo-100' : 'bg-indigo-500/20')}`}>
                <FontAwesomeIcon icon={faFile} className={`text-xs ${isMine ? 'text-white/70' : 'text-indigo-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-medium truncate ${isMine ? 'text-white/90' : ''}`}>{msg.fileName}</p>
                <p className={`text-[9px] ${isMine ? 'text-white/50' : (isLight ? 'text-slate-400' : 'text-gray-500')}`}>Tap to download</p>
            </div>
            <FontAwesomeIcon icon={faDownload} className={`text-[10px] flex-shrink-0 ${isMine ? 'text-white/40' : (isLight ? 'text-slate-300' : 'text-gray-600')}`} />
        </div>
    )
}

const ImageLightbox = ({ imageUrl, fileName, onClose }) => {
    if (!imageUrl) return null
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md" onClick={onClose}>
            <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="absolute -top-12 right-0 flex items-center gap-2">
                    <button onClick={() => triggerDownload(imageUrl, fileName)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"><FontAwesomeIcon icon={faDownload} className="text-sm" /></button>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"><FontAwesomeIcon icon={faTimes} className="text-sm" /></button>
                </div>
                <img src={imageUrl} alt={fileName || 'Image'} className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl" />
            </div>
        </div>
    )
}

const ConfirmDialog = ({ open, icon, title, description, confirmText, onCancel, onConfirm, isLight }) => {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
            <div className={`w-full max-w-sm mx-4 rounded-xl overflow-hidden border ${!isLight ? 'bg-[#161616] border-[#2B2B2B]' : 'bg-white border-slate-200/60'} shadow-2xl`} onClick={e => e.stopPropagation()}>
                <div className={`px-5 pt-5 pb-4 border-b ${!isLight ? 'border-[#222]' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!isLight ? 'bg-red-900/20' : 'bg-red-50'}`}>
                            <FontAwesomeIcon icon={icon} className="text-red-500" />
                        </div>
                        <div><h3 className={`text-sm font-semibold ${!isLight ? 'text-white' : 'text-slate-800'}`}>{title}</h3><p className={`text-[11px] mt-0.5 ${!isLight ? 'text-gray-500' : 'text-slate-400'}`}>{description}</p></div>
                    </div>
                </div>
                <div className="flex gap-3 px-5 py-4">
                    <button onClick={onCancel} className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${!isLight ? 'bg-[#1C1C1C] hover:bg-[#222] text-gray-400 border border-[#333]' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white">{confirmText}</button>
                </div>
            </div>
        </div>
    )
}

const Messages = ({ user, theme }) => {
    const dispatch = useDispatch()
    const { conversations, activeConversation, messages, searchResults, typing, messagesLoading, isLoading, blockedUsers, blockStatus, sending } = useSelector((state) => state.chat)

    const userData = JSON.parse(localStorage.getItem('profile'))
    const userId = userData?._id
    const { emitTyping, emitStopTyping } = useChat(userId)

    const isLight = theme === 'light'

    const [messageInput, setMessageInput] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [showMobileChat, setShowMobileChat] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [filePreview, setFilePreview] = useState(null)
    const [lightboxImage, setLightboxImage] = useState(null)
    const [msgMenuId, setMsgMenuId] = useState(null)
    const [showHeaderMenu, setShowHeaderMenu] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState(null)
    const [confirmBlockUser, setConfirmBlockUser] = useState(null)
    const [sidebarTab, setSidebarTab] = useState('chats')
    const messagesEndRef = useRef(null)
    const typingTimeoutRef = useRef(null)
    const fileInputRef = useRef(null)
    const emojiRef = useRef(null)
    const msgMenuRef = useRef(null)
    const headerMenuRef = useRef(null)

    useEffect(() => { dispatch(getConversations()); dispatch(getUnreadCount()) }, [dispatch])
    useEffect(() => {
        if (activeConversation?._id) {
            dispatch(getMessages({ conversationId: activeConversation._id }))
            const other = activeConversation?.participants?.find(p => p._id?.toString() !== userId)
            if (other?._id) dispatch(checkBlocked(other._id))
        } else dispatch(clearBlockStatus())
    }, [activeConversation?._id, dispatch])
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
    useEffect(() => {
        const h = (e) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmojiPicker(false)
            if (msgMenuRef.current && !msgMenuRef.current.contains(e.target)) setMsgMenuId(null)
            if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) setShowHeaderMenu(false)
        }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    const handleSearch = useCallback((v) => { setSearchQuery(v); if (v.trim().length >= 2) dispatch(searchUsers(v)); else dispatch(clearSearchResults()) }, [dispatch])
    const handleSelectConversation = (conv) => { dispatch(setActiveConversation(conv)); setShowMobileChat(true) }
    const handleStartConversation = (u) => { dispatch(getOrCreateConversation({ targetUserId: u._id })); setSearchQuery(''); dispatch(clearSearchResults()); setShowMobileChat(true) }
    const getOther = (conv) => conv?.participants?.find(p => p._id?.toString() !== userId) || {}

    const handleSend = (e) => {
        e.preventDefault()
        if ((!messageInput.trim() && !filePreview) || !activeConversation?._id) return
        const payload = { conversationId: activeConversation._id, content: messageInput.trim() }
        if (filePreview) { payload.fileUrl = filePreview.dataUrl; payload.fileName = filePreview.name; payload.fileType = filePreview.type }
        dispatch(sendMessage(payload)); setMessageInput(''); setFilePreview(null); setShowEmojiPicker(false)
        emitStopTyping(activeConversation._id, getOther(activeConversation)._id)
    }

    const handleTyping = (e) => {
        setMessageInput(e.target.value)
        if (!activeConversation) return
        const other = getOther(activeConversation)
        emitTyping(activeConversation._id, other._id, userData?.username)
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => emitStopTyping(activeConversation._id, other._id), 2000)
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) { alert('File size must be under 5MB'); return }
        const reader = new FileReader()
        reader.onload = () => setFilePreview({ dataUrl: reader.result, name: file.name, type: file.type, size: file.size })
        reader.readAsDataURL(file); e.target.value = ''
    }

    const handleDeleteMessage = (id) => { dispatch(deleteMessageForMe(id)); setMsgMenuId(null) }
    const handleDeleteMessageEveryone = (id) => { dispatch(deleteMessageForAll(id)); setMsgMenuId(null) }
    const confirmDelete = () => { if (confirmDeleteId) dispatch(deleteConversationForMe(confirmDeleteId)); setConfirmDeleteId(null) }
    const confirmBlock = () => { if (confirmBlockUser) dispatch(blockUser({ targetUserId: confirmBlockUser._id })).then(() => dispatch(getBlockedUsers())); setConfirmBlockUser(null) }
    const handleSidebarTab = (tab) => { setSidebarTab(tab); if (tab === 'blocked') dispatch(getBlockedUsers()) }

    const shouldShowDate = (msg, idx) => idx === 0 || new Date(messages[idx - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString()

    const border = isLight ? 'border-slate-200/70' : 'border-[#232323]'

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <ImageLightbox imageUrl={lightboxImage?.url} fileName={lightboxImage?.name} onClose={() => setLightboxImage(null)} />
            <ConfirmDialog open={!!confirmDeleteId} icon={faTrash} title="Delete chat?" description="All messages will be removed from your view." confirmText="Delete" onCancel={() => setConfirmDeleteId(null)} onConfirm={confirmDelete} isLight={isLight} />
            <ConfirmDialog open={!!confirmBlockUser} icon={faBan} title={`Block ${confirmBlockUser?.username}?`} description="They won't be able to send you messages." confirmText="Block" onCancel={() => setConfirmBlockUser(null)} onConfirm={confirmBlock} isLight={isLight} />

            {/* Header */}
            <div className="mb-5">
                <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-violet-50' : 'bg-violet-900/20'}`}>
                        <FontAwesomeIcon icon={faEnvelope} className={`text-xs ${isLight ? 'text-violet-500' : 'text-violet-400'}`} />
                    </div>
                    <h1 className={`text-2xl font-semibold ${isLight ? light.heading : dark.heading}`}>Messages</h1>
                </div>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Send and receive messages with other users</p>
            </div>

            {/* Chat Container */}
            <div className={`flex rounded-xl overflow-hidden border ${border} ${isLight ? 'bg-white shadow-sm' : 'bg-[#141414]'}`}
                style={{ height: 'calc(100vh - 260px)', minHeight: '420px' }}>

                {/* ─── Sidebar ─── */}
                <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-[340px] flex-shrink-0 border-r ${border} ${isLight ? 'bg-white' : 'bg-[#161616]'}`}>
                    {/* Sidebar Tabs & Search */}
                    <div className={`p-3 space-y-2.5 border-b ${border}`}>
                        <div className={`flex gap-0.5 p-0.5 rounded-lg ${isLight ? 'bg-slate-100' : 'bg-[#1A1A1A]'}`}>
                            {['chats', 'blocked'].map(tab => (
                                <button key={tab} onClick={() => handleSidebarTab(tab)}
                                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all ${sidebarTab === tab
                                        ? (isLight ? 'bg-white text-slate-800 shadow-sm' : 'bg-[#2B2B2B] text-white')
                                        : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-gray-500 hover:text-gray-300')}`}>
                                    {tab === 'chats' ? 'Chats' : 'Blocked'}
                                </button>
                            ))}
                        </div>
                        {sidebarTab === 'chats' && (
                            <div className="relative">
                                <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                <input type="text" placeholder="Search users..." value={searchQuery} onChange={e => handleSearch(e.target.value)}
                                    className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg outline-none transition-all ${isLight ? 'bg-slate-50 text-slate-700 placeholder:text-slate-300 focus:bg-white focus:ring-1 focus:ring-violet-200' : 'bg-[#1A1A1A] text-gray-300 placeholder:text-gray-600 focus:bg-[#1E1E1E] focus:ring-1 focus:ring-violet-900/40'}`} />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(''); dispatch(clearSearchResults()) }} className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-300 hover:text-slate-500' : 'text-gray-600 hover:text-gray-400'}`}>
                                        <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className={`border-b ${border}`}>
                            <p className={`px-3 pt-2 pb-1 text-[9px] font-semibold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Results</p>
                            {searchResults.map(u => (
                                <div key={u._id} onClick={() => handleStartConversation(u)} className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all ${isLight ? 'hover:bg-violet-50/40' : 'hover:bg-[#1C1C1C]'}`}>
                                    <UserAvatar user={u} size="sm" />
                                    <span className={`text-xs font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{u.username}</span>
                                    <FontAwesomeIcon icon={faChevronRight} className={`text-[8px] ml-auto ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Conversation / Blocked List */}
                    <div className="flex-1 overflow-y-auto">
                        {sidebarTab === 'chats' ? (
                            isLoading ? (
                                <div className="flex items-center justify-center h-full"><div className={`animate-spin rounded-full h-6 w-6 border-2 border-t-transparent ${isLight ? 'border-violet-400' : 'border-violet-500'}`} /></div>
                            ) : conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full px-8">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isLight ? 'bg-violet-50' : 'bg-violet-900/15'}`}>
                                        <FontAwesomeIcon icon={faComments} className={`text-2xl ${isLight ? 'text-violet-200' : 'text-violet-800'}`} />
                                    </div>
                                    <p className={`text-sm font-semibold mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>No conversations</p>
                                    <p className={`text-[11px] text-center leading-relaxed ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Search for a user above to start a new chat</p>
                                </div>
                            ) : conversations.map(conv => {
                                const other = getOther(conv)
                                const isActive = activeConversation?._id === conv._id
                                const isTypingHere = typing[conv._id]
                                const lastMsg = conv.lastMessage
                                const preview = lastMsg?.fileUrl && !lastMsg?.content ? (isImageType(lastMsg.fileType) ? '📷 Photo' : '📎 File') : lastMsg?.content

                                return (
                                    <div key={conv._id} onClick={() => handleSelectConversation(conv)}
                                        className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-all relative ${isActive ? (isLight ? 'bg-violet-50/60' : 'bg-violet-900/10') : (isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.02]')}`}>
                                        {isActive && <div className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${isLight ? 'bg-violet-500' : 'bg-violet-400'}`} />}
                                        <UserAvatar user={other} size="md" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <span className={`font-semibold text-[13px] truncate ${isActive ? (isLight ? 'text-violet-700' : 'text-violet-300') : (isLight ? 'text-slate-800' : 'text-gray-100')}`}>{other.username}</span>
                                                <span className={`text-[10px] flex-shrink-0 ml-2 tabular-nums ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{formatTime(lastMsg?.createdAt || conv.updatedAt)}</span>
                                            </div>
                                            <p className={`text-[11px] truncate ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                {isTypingHere ? <span className="text-violet-400 font-medium">typing...</span> : (preview || 'Start a conversation')}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            blockedUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full px-8">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#1C1C1C]'}`}>
                                        <FontAwesomeIcon icon={faUserSlash} className={`text-2xl ${isLight ? 'text-slate-200' : 'text-gray-700'}`} />
                                    </div>
                                    <p className={`text-sm font-semibold mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>No blocked users</p>
                                    <p className={`text-[11px] text-center ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Users you block will appear here</p>
                                </div>
                            ) : blockedUsers.map(u => (
                                <div key={u._id} className={`flex items-center gap-3 px-3 py-3 border-b ${border}`}>
                                    <UserAvatar user={u} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-xs truncate ${isLight ? 'text-slate-700' : 'text-gray-100'}`}>{u.username}</p>
                                        <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Blocked {formatTime(u.blockedAt)}</p>
                                    </div>
                                    <button onClick={() => dispatch(unblockUser(u._id))} className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#222] text-gray-400 hover:bg-[#2B2B2B]'}`}>Unblock</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ─── Chat Area ─── */}
                <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-col flex-1 ${isLight ? 'bg-slate-50/40' : 'bg-[#111]'}`}>
                    {activeConversation ? (() => {
                        const otherUser = getOther(activeConversation)
                        return (
                            <>
                                {/* Chat Header */}
                                <div className={`flex items-center gap-3 px-4 sm:px-5 py-3 border-b ${border} ${isLight ? 'bg-white' : 'bg-[#161616]'}`}>
                                    <button onClick={() => { setShowMobileChat(false); dispatch(setActiveConversation(null)) }}
                                        className={`md:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#222] text-gray-400'}`}>
                                        <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                                    </button>
                                    <UserAvatar user={otherUser} size="md" showOnline />
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>{otherUser.username}</p>
                                        {typing[activeConversation._id]
                                            ? <p className="text-[10px] text-violet-400 font-medium animate-pulse">typing...</p>
                                            : <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Online</p>}
                                    </div>
                                    <div className="relative" ref={headerMenuRef}>
                                        <button onClick={() => setShowHeaderMenu(!showHeaderMenu)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-gray-500 hover:bg-[#222]'}`}>
                                            <FontAwesomeIcon icon={faEllipsisV} className="text-sm" />
                                        </button>
                                        {showHeaderMenu && (
                                            <div className={`absolute right-0 top-full mt-1.5 w-40 rounded-lg overflow-hidden z-50 border shadow-xl ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1C1C] border-[#333]'}`}>
                                                {blockStatus?.iBlocked ? (
                                                    <button onClick={() => { dispatch(unblockUser(otherUser._id)); setShowHeaderMenu(false) }} className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 font-medium transition-all ${isLight ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-[#222] text-gray-300'}`}>
                                                        <FontAwesomeIcon icon={faUnlock} className="text-[10px] text-emerald-500" /> Unblock
                                                    </button>
                                                ) : (
                                                    <button onClick={() => { setShowHeaderMenu(false); setConfirmBlockUser(otherUser) }} className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 font-medium transition-all ${isLight ? 'hover:bg-red-50 text-red-500' : 'hover:bg-red-900/10 text-red-400'}`}>
                                                        <FontAwesomeIcon icon={faBan} className="text-[10px]" /> Block user
                                                    </button>
                                                )}
                                                <button onClick={() => { setShowHeaderMenu(false); setConfirmDeleteId(activeConversation._id) }} className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 font-medium transition-all ${isLight ? 'hover:bg-red-50 text-red-500' : 'hover:bg-red-900/10 text-red-400'}`}>
                                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Delete chat
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col">
                                    {messagesLoading ? (
                                        <div className="flex items-center justify-center h-full"><div className={`animate-spin rounded-full h-6 w-6 border-2 border-t-transparent ${isLight ? 'border-violet-400' : 'border-violet-500'}`} /></div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <UserAvatar user={otherUser} size="xl" />
                                            <p className={`text-base font-semibold mt-4 mb-1 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{otherUser.username}</p>
                                            <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Send a message to start the conversation</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-0.5 mt-auto">
                                            {messages.map((msg, idx) => {
                                                const isMine = msg.sender?._id?.toString() === userId
                                                const showAvatar = !isMine && (idx === messages.length - 1 || messages[idx + 1]?.sender?._id?.toString() === userId)
                                                return (
                                                    <React.Fragment key={msg._id}>
                                                        {shouldShowDate(msg, idx) && (
                                                            <div className="flex items-center gap-4 my-5">
                                                                <div className={`flex-1 h-px ${isLight ? 'bg-slate-200/60' : 'bg-[#1E1E1E]'}`} />
                                                                <span className={`text-[10px] font-semibold px-3 py-1 rounded-full ${isLight ? 'text-slate-400 bg-white shadow-sm border border-slate-100' : 'text-gray-500 bg-[#1A1A1A] border border-[#2B2B2B]'}`}>{formatDateSeparator(msg.createdAt)}</span>
                                                                <div className={`flex-1 h-px ${isLight ? 'bg-slate-200/60' : 'bg-[#1E1E1E]'}`} />
                                                            </div>
                                                        )}
                                                        <div className={`group/msg flex items-end gap-2 py-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                            {!isMine && (
                                                                <div className="w-7 flex-shrink-0">
                                                                    {showAvatar && <UserAvatar user={otherUser} size="sm" />}
                                                                </div>
                                                            )}
                                                            {isMine && (
                                                                <div className="relative flex-shrink-0 self-center" ref={msgMenuId === msg._id ? msgMenuRef : null}>
                                                                    <button onClick={() => setMsgMenuId(msgMenuId === msg._id ? null : msg._id)}
                                                                        className={`w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-all ${isLight ? 'hover:bg-slate-200 text-slate-400' : 'hover:bg-[#333] text-gray-600'} ${msgMenuId === msg._id ? '!opacity-100' : ''}`}>
                                                                        <FontAwesomeIcon icon={faEllipsisV} className="text-[9px]" />
                                                                    </button>
                                                                    {msgMenuId === msg._id && (
                                                                        <div className={`absolute right-0 top-full mt-1 w-44 rounded-lg overflow-hidden shadow-xl z-50 border ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1C1C] border-[#333]'}`}>
                                                                            <button onClick={() => handleDeleteMessage(msg._id)} className={`w-full text-left px-3.5 py-2.5 text-[11px] flex items-center gap-2 font-medium transition-all ${isLight ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-[#222] text-gray-300'}`}><FontAwesomeIcon icon={faTrash} className="text-[9px] text-gray-400" /> Delete for me</button>
                                                                            <button onClick={() => handleDeleteMessageEveryone(msg._id)} className={`w-full text-left px-3.5 py-2.5 text-[11px] flex items-center gap-2 font-medium transition-all ${isLight ? 'hover:bg-red-50 text-red-500' : 'hover:bg-red-900/10 text-red-400'}`}><FontAwesomeIcon icon={faTrash} className="text-[9px]" /> Delete for everyone</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className={`max-w-[65%] sm:max-w-[55%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                                                {msg.fileUrl && isImageType(msg.fileType) ? (
                                                                    <div className={`rounded-2xl overflow-hidden shadow-sm ${isMine ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                                                                        <FileAttachment msg={msg} isMine={isMine} isLight={isLight} onImageClick={(url, name) => setLightboxImage({ url, name })} />
                                                                        {msg.content && (
                                                                            <div className={`px-3.5 py-2 ${isMine ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white' : isLight ? 'bg-white text-slate-800 border-x border-b border-slate-100' : 'bg-[#1E1E1E] text-gray-100'}`}>
                                                                                <EmojiText text={msg.content} className="text-[13px] leading-relaxed whitespace-pre-wrap break-words" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className={`px-3.5 py-2 rounded-2xl shadow-sm ${isMine ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-br-md' : isLight ? 'bg-white text-slate-800 rounded-bl-md border border-slate-100' : 'bg-[#1E1E1E] text-gray-100 rounded-bl-md'}`}>
                                                                        <FileAttachment msg={msg} isMine={isMine} isLight={isLight} onImageClick={(url, name) => setLightboxImage({ url, name })} />
                                                                        {msg.content && <EmojiText text={msg.content} className="text-[13px] leading-relaxed whitespace-pre-wrap break-words" />}
                                                                    </div>
                                                                )}
                                                                <span className={`text-[9px] mt-0.5 px-1 flex items-center gap-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>
                                                                    {formatMessageTime(msg.createdAt)}
                                                                    {isMine && <FontAwesomeIcon icon={faCircleCheck} className="text-[8px] text-violet-400" />}
                                                                </span>
                                                            </div>
                                                            {!isMine && (
                                                                <div className="relative flex-shrink-0 self-center" ref={msgMenuId === msg._id ? msgMenuRef : null}>
                                                                    <button onClick={() => setMsgMenuId(msgMenuId === msg._id ? null : msg._id)}
                                                                        className={`w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-all ${isLight ? 'hover:bg-slate-200 text-slate-400' : 'hover:bg-[#333] text-gray-600'} ${msgMenuId === msg._id ? '!opacity-100' : ''}`}>
                                                                        <FontAwesomeIcon icon={faEllipsisV} className="text-[9px]" />
                                                                    </button>
                                                                    {msgMenuId === msg._id && (
                                                                        <div className={`absolute left-0 top-full mt-1 w-36 rounded-lg overflow-hidden shadow-xl z-50 border ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1C1C] border-[#333]'}`}>
                                                                            <button onClick={() => handleDeleteMessage(msg._id)} className={`w-full text-left px-3.5 py-2.5 text-[11px] flex items-center gap-2 font-medium transition-all ${isLight ? 'hover:bg-red-50 text-red-500' : 'hover:bg-red-900/10 text-red-400'}`}><FontAwesomeIcon icon={faTrash} className="text-[9px]" /> Delete for me</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </React.Fragment>
                                                )
                                            })}
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Blocked Banner */}
                                {blockStatus?.anyBlocked && (
                                    <div className={`mx-4 sm:mx-5 mb-2 px-4 py-2.5 rounded-lg flex items-center gap-3 ${isLight ? 'bg-red-50 border border-red-200/60' : 'bg-red-900/10 border border-red-500/15'}`}>
                                        <FontAwesomeIcon icon={faBan} className="text-red-400 text-xs" />
                                        <p className={`text-xs flex-1 ${isLight ? 'text-red-600' : 'text-red-300'}`}>{blockStatus.iBlocked ? 'You have blocked this user.' : 'This user has blocked you.'}</p>
                                        {blockStatus.iBlocked && <button onClick={() => dispatch(unblockUser(getOther(activeConversation)._id))} className="px-2.5 py-1 text-[10px] font-medium rounded-md bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all">Unblock</button>}
                                    </div>
                                )}

                                {/* File Preview */}
                                {filePreview && !blockStatus?.anyBlocked && (
                                    <div className={`mx-4 sm:mx-5 mb-2 p-2.5 rounded-lg flex items-center gap-3 ${isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-[#1C1C1C] border border-[#2B2B2B]'}`}>
                                        {isImageType(filePreview.type) ? <img src={filePreview.dataUrl} alt="" className="w-11 h-11 rounded-lg object-cover" />
                                            : <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${isLight ? 'bg-violet-50' : 'bg-violet-900/20'}`}><FontAwesomeIcon icon={faFile} className="text-violet-500" /></div>}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{filePreview.name}</p>
                                            <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{(filePreview.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button onClick={() => setFilePreview(null)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isLight ? 'text-slate-300 hover:bg-slate-100 hover:text-slate-500' : 'text-gray-600 hover:bg-[#222] hover:text-gray-400'}`}><FontAwesomeIcon icon={faTimes} className="text-xs" /></button>
                                    </div>
                                )}

                                {/* Input Bar */}
                                <div className={`px-3 sm:px-4 py-3 border-t ${border} ${isLight ? 'bg-white' : 'bg-[#161616]'}`}>
                                    {blockStatus?.anyBlocked ? (
                                        <div className={`text-center py-1.5 text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>You can't send messages in this conversation</div>
                                    ) : (
                                        <form onSubmit={handleSend} className="flex items-end gap-1.5 sm:gap-2">
                                            <div className="flex items-center gap-0.5">
                                                <div className="relative" ref={emojiRef}>
                                                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${showEmojiPicker ? 'bg-violet-500 text-white' : (isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-500')}`}>
                                                        <FontAwesomeIcon icon={faSmile} className="text-sm" />
                                                    </button>
                                                    {showEmojiPicker && (
                                                        <div className="absolute bottom-12 left-0 z-50">
                                                            <EmojiPicker onEmojiClick={d => setMessageInput(p => p + d.emoji)} theme={!isLight ? 'dark' : 'light'} emojiStyle={EmojiStyle.APPLE} width={320} height={380} searchPlaceHolder="Search emoji..." previewConfig={{ showPreview: false }} />
                                                        </div>
                                                    )}
                                                </div>
                                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-500'}`}>
                                                    <FontAwesomeIcon icon={faPaperclip} className="text-sm" />
                                                </button>
                                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar" onChange={handleFileSelect} />
                                            </div>
                                            <div className="flex-1">
                                                <input type="text" placeholder="Type a message..." value={messageInput} onChange={handleTyping}
                                                    className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all ${isLight ? 'bg-slate-50 text-slate-700 placeholder:text-slate-300 focus:bg-white focus:ring-1 focus:ring-violet-200 focus:shadow-sm' : 'bg-[#1A1A1A] text-gray-200 placeholder:text-gray-600 focus:bg-[#1E1E1E] focus:ring-1 focus:ring-violet-900/40'}`} />
                                            </div>
                                            <button type="submit" disabled={sending || (!messageInput.trim() && !filePreview)}
                                                className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm shadow-violet-500/20">
                                                {sending ? <FontAwesomeIcon icon={faSpinner} className="text-sm animate-spin" /> : <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </>
                        )
                    })() : (
                        <div className="flex flex-col items-center justify-center h-full px-8">
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 ${isLight ? 'bg-violet-50' : 'bg-violet-900/15'}`}>
                                <FontAwesomeIcon icon={faComments} className={`text-3xl ${isLight ? 'text-violet-200' : 'text-violet-800'}`} />
                            </div>
                            <p className={`text-lg font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Your Messages</p>
                            <p className={`text-xs text-center max-w-[280px] leading-relaxed ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Select a conversation or search for a user to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Messages
